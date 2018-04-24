import * as googleapis from 'googleapis';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Configuration, Service, Adapter } from '../../base/index';
import { GoogleError, GoogleErrorType, createGoogleError, InvalidGrant } from '../errors';
import { DateRange, UserProfile } from '../../../common/types';
import { handleGoogleError, calendarIdsFor } from '../../util/google/util';

const calendar = googleapis.calendar('v3');

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
  'privacy':                             'visibility',
  'description':                         'description',
};

export type GoogleOauthCredentials = {
  access_token: string;
  refresh_token: string;
  email: string;
  clientId: string,
  clientSecret: string,
  redirectUrl: string
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
    email: '',
    clientId: '',
    clientSecret: '',
    redirectUrl: ''
  };

  private auth: any;

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
      throw new Error('Credentials required for adapter.');
    }

    if (!(credentials.clientId && credentials.clientSecret && credentials.redirectUrl)) {
      throw new Error('OAuth params needed by this adapter are missing');
    }

    this.auth = new googleapis.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUrl
    );

    this.auth.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token
    });

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

    console.log(`Successfully initialized google oauth calendar adapter for email: ${email}`
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
    return [];
  }

  async getData (
    filterStartDate: Date,
    filterEndDate: Date,
    properties: {
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
      const auth = this.auth;

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
          new Error(`Email address: ${properties.email} has not authorized crosslead to access their calendar.`)
        );
      }
      return Object.assign(individualRunStats, {
        errorMessage,
        success: false,
        data: []
      });
    }

  }

  async getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange|null> {
    const auth = this.auth;
    let ret = null;
    try {

      const calendarIds: string[] = await calendarIdsFor(userProfile, auth);
      const items = _.flatten(await Promise.all(
        _.map(<any> calendarIds, (calendarId: string) =>
              new Promise((res, rej) =>
                          calendar.events.get({calendarId, eventId, auth},
                                              handleGoogleError(res, rej))
                         )
             )
      ));
      if (items && items.length > 0) {
        ret = {start: new Date(items[0].start.dateTime), end: new Date(items[0].end.dateTime)};
      }
    } catch (err) {
      const subject = auth.subject;
      const context = `subject = ${subject}`;
      throw (/invalid_request/.test(err.message) ?
             new Error(`Caught invalid_request getting events: ${err.message}, ${context}`) :
             new Error(`Caught exception getting events: ${err.message}, ${context}`));
    }
    return ret;
  }

  async runConnectionTest() {
    console.warn('runConnectionTest is currently unimplemented in google oauth calendar adapter');
  }


  async runMessageTest() {
    console.warn('runMessageTest is currently unimplemented in google oauth calendar adapter');
  }

}
