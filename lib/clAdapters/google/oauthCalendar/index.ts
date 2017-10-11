import * as googleapis from 'googleapis';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Configuration, Service, Adapter } from '../../base/index';
import { GoogleError, GoogleErrorType, createGoogleError, InvalidGrant } from '../errors';

const calendar = googleapis.calendar('v3');

function handleGoogleError(res: Function, rej: Function, returnVal?: any) {
  return (err: any, result: any) => {
    if (err) {
      let mapped = err;
      if (err instanceof Error) {
        // Map to custom errors
        if (/unauthorized_client/.test(err.message.toString())) {
          mapped = createGoogleError(
            'UnauthorizedClient',
            err
          );
        }
        // TODO: other types
      } else if (!err.kind) {
        // Not a GoogleError
        mapped = new Error(JSON.stringify(err));
      }
      // Leave GoogleErrors
      rej(mapped);
    } else {
      res(typeof returnVal !== 'undefined' ?  returnVal : result);
    }
  };
}



export const fieldNameMap = {
  // Desired...                          // Given...
  'eventId':                             'id',
  'attendees':                           'attendees',
  'createTime':                          'created',
  'dateTimeLastModified':                'updated',
  'attendeeAddress':                     'EmailAddress.Address',
  'attendeeName':                        'EmailAddress.Name',
  'iCalUId':                             'iCalUID',
  'location':                            'location',
  'status':                              'status',
  'isCreator':                           'creator.self',
  'isOrganizer':                         'organizer.self',
  'organizerEmail':                      'organizer.email',
  'recurrence':                          'recurrence',
  'response':                            'responseStatus',
  'seriesMasterId':                      'recurringEventId',
  'startTime':                           'start.dateTime',
  'endTime':                             'end.dateTime',
  'name':                                'summary',
  'url':                                 'htmlLink',
  'hangoutLink':                         'hangoutLink',
  'privacy':                             'visibility'
};



export interface UserProfile {
  email: string;
  emailAfterMapping: string;
}

export type GoogleOauthCredentials = {
  access_token: string;
  refresh_token: string;
  email: string;
};


export type GoogleCalendarApiEvent = {
  [K in keyof (typeof fieldNameMap)]?: (typeof fieldNameMap)[K];
};

export interface GoogleCalendarApiResult {
  items: GoogleCalendarApiEvent[];
  nextPageToken?: string;
}



export default class GoogleOauthCalendarAdapter extends Adapter {
  credentials: GoogleOauthCredentials = {
    access_token: '',
    refresh_token: '',
    email: ''
  };

  async getFieldData() {
    throw new Error('Google adapters currently do not support `getFieldData()`');
  }

  static Configuration = Configuration;
  static Service = Service;

  // convert the names of the api response data
  static fieldNameMap = fieldNameMap;

  sensitiveCredentialsFields: (keyof GoogleOauthCredentials)[] = ['refresh_token', 'access_token'];

  _config: Configuration;
  _service: Service;

  // constructor needs to call super
  constructor() {
    super();
  }


  reset() {
    delete this._config;
    delete this._service;
    return this;
  }


  async init() {
    const { credentials }: { credentials: {[k: string]: string} } = this;

    if (!credentials) {
      throw new Error('credentials required for adapter.');
    }


    // validate required credential properties
    ['access_token', 'refresh_token', 'email'].forEach(prop => {
      if (!credentials[prop]) {
        throw new Error(`Property ${prop} required in adapter credentials!`);
      }
    });

    this._config  = new GoogleOauthCalendarAdapter.Configuration(credentials);
    this._service = new GoogleOauthCalendarAdapter.Service(this._config);

    await this._service.init();

    const { email: email } = credentials;

    console.log(
      `Successfully initialized google oauth calendar adapter for email: ${email}`
    );
    return this;
  }


  async getBatchData(
    userProfiles: UserProfile[] = [],
    filterStartDate: Date,
    filterEndDate: Date,
    fields?: string
  ) {

    console.warn('getBatchData is currently unimplemented in google oauth calendar adapter');

  }

  async getData (
    filterStartDate: Date,
    filterEndDate: Date,
    properties: {
      GOOGLE_OAUTH_CLIENT_ID: string;
      GOOGLE_OAUTH_CLIENT_SECRET: string;
      GOOGLE_OAUTH_REDIRECT_URL: string;
      access_token: string;
      refresh_token: string;
      expiry_date: string;
      userId: string;
      email: string;
    }
  ) {

    if (filterStartDate.getTime() > filterEndDate.getTime()) {
      throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
    }


    const { fieldNameMap } = GoogleOauthCalendarAdapter;

    // api options...
    // https://developers.google.com/google-apps/calendar/v3/
    const opts: any = {
      alwaysIncludeEmail:   true,
      singleEvents:         true,
      timeMax:              filterEndDate.toISOString(),
      timeMin:              filterStartDate.toISOString(),
      orderBy:              'startTime'
    };

    const individualRunStats = {
      filterStartDate,
      filterEndDate,
      success: true,
      runDate: moment().utc().toDate(),
      errorMessage: null
    };

    try {
      const auth = new googleapis.auth.OAuth2(
        properties.GOOGLE_OAUTH_CLIENT_ID,
        properties.GOOGLE_OAUTH_CLIENT_SECRET,
        properties.GOOGLE_OAUTH_REDIRECT_URL
      );

      auth.setCredentials({
        access_token: properties.access_token,
        refresh_token: properties.refresh_token
      });

      const getEvents = async (requestOpts: any) => {
        try {
          return await new Promise<GoogleCalendarApiResult>((res, rej) => {
            calendar.events.list(
              requestOpts, handleGoogleError(res, rej)
            );
          });
        } catch (err) {
          const context = JSON.stringify({requestOpts});
          throw (/invalid_request/.test(err.message) ?
                 new Error(`Caught invalid_request getting events: ${err.message}, ${context}`) :
                 new Error(`Caught exception getting events: ${err.message}, ${context}`));
        }
      };

      const apiResult = await getEvents({ ...opts, auth, calendarId: 'primary' });

      const data = _.map(apiResult.items, (item: GoogleCalendarApiEvent) => {

        const out: { [key: string]: string } = {};

        _.each(fieldNameMap, (have: string, want: string) => {
          let modified = _.get(item, have);
          if (/^(start|end|create)Time/.test(want)) {
            modified = new Date(modified);
          }
          if (modified !== undefined) {
            out[want] = modified;
          }
        });


        const attendeeSelf = _.find(out['attendees'], (attendee: any) => {
          return attendee.self;
        });

        if (attendeeSelf) {
          out['response'] = attendeeSelf.responseStatus;
        }

        out['attendees'] = _.map(out['attendees'], (attendee: any) => {
          const { email, responseStatus } = attendee;
          return { email: email, response: responseStatus };
        });

        return out;
      });

      return Object.assign(individualRunStats, { results: [{
          filterStartDate,
          filterEndDate,
          success: true,
          userId: properties.userId,
          email: properties.email,
          data
        }]
      });

    } catch (error) {
      console.log(error);
      let errorMessage: GoogleError | Error = error instanceof Error ? error : new Error(JSON.stringify(error));

      if (/invalid_grant/.test(errorMessage.message.toString())) {
        errorMessage = createGoogleError(
          'InvalidGrant',
          new Error(`Email address: ${properties.email} hasn't authorized crosslead to access their calendar.`)
        );
      }
      return Object.assign(individualRunStats, {
        errorMessage,
        success: false,
        data: []
      });
    }

  }


  async runConnectionTest() {
    console.warn('runConnectionTest is currently unimplemented in google oauth calendar adapter');
  }


  async runMessageTest() {
    console.warn('runMessageTest is currently unimplemented in google oauth calendar adapter');
  }

}
