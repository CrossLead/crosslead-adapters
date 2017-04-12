import * as googleapis from 'googleapis';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Configuration, Service } from '../../base/index';
import GoogleBaseAdapter from '../base/Adapter';

// google calendar api
const calendar = googleapis.calendar('v3');

const credentialMappings: { [key: string]: string } = {
  'certificate' : 'private_key',
  'serviceEmail': 'client_email',
  'email'       : 'adminEmail'
};



function handleGoogleError(res: Function, rej: Function, returnVal?: any) {
  return (err: any, result: any) => {
    if (err) {
      rej(
        err instanceof Error
          ? err
          : new Error(JSON.stringify(err))
      );
    } else {
      res(typeof returnVal !== 'undefined' ?  returnVal : result);
    }
  };
}



export const fieldNameMap = {
  // Desired...                          // Given...
  'eventId':                             'id',
  'attendees':                           'attendees',
  'dateTimeCreated':                     'created',
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
  'responseStatus':                      'responseStatus',
  'seriesMasterId':                      'recurringEventId',
  'dateTimeStart':                       'start.dateTime',
  'dateTimeEnd':                         'end.dateTime',
  'subject':                             'summary',
  'url':                                 'htmlLink',
  'hangoutLink':                         'hangoutLink',
  'privacy':                             'visibility'
};



export interface UserProfile {
  email: string;
  emailAfterMapping: string;
}


export type GoogleCalendarApiEvent = {
  [K in keyof (typeof fieldNameMap)]?: (typeof fieldNameMap)[K];
};

export interface GoogleCalendarApiResult {
  items: GoogleCalendarApiEvent[];
  nextPageToken?: string;
}



export default class GoogleCalendarAdapter extends GoogleBaseAdapter {

  static Configuration = Configuration;
  static Service = Service;

  // convert the names of the api response data
  static fieldNameMap = fieldNameMap;



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

    // map Google json keys to keys used in this library
    for (const want in credentialMappings) {
      const alternate = credentialMappings[want];
      if (!credentials[want]) {
        credentials[want] = credentials[alternate];
      }
    }

    // validate required credential properties
    Object.keys(credentialMappings)
      .forEach(prop => {
        if (!credentials[prop]) {
          throw new Error(`Property ${prop} required in adapter credentials!`);
        }
      });

    this._config  = new GoogleCalendarAdapter.Configuration(credentials);
    this._service = new GoogleCalendarAdapter.Service(this._config);

    await this._service.init();

    const { serviceEmail: email } = credentials;

    console.log(
      `Successfully initialized google calendar adapter for email: ${email}`
    );

    return this;
  }


  // currently doing nothing with fields here, but keeping as placeholder
  async getBatchData(
    userProfiles: UserProfile[] = [],
    filterStartDate: Date,
    filterEndDate: Date,
    fields?: string
  ) {

    if (filterStartDate.getTime() > filterEndDate.getTime()) {
      throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
    }


    const { fieldNameMap } = GoogleCalendarAdapter;

    // api options...
    // https://developers.google.com/google-apps/calendar/v3/
    const opts: any = {
      alwaysIncludeEmail:   true,
      singleEvents:         true,
      timeMax:              filterEndDate.toISOString(),
      timeMin:              filterStartDate.toISOString(),
      orderBy:              'startTime'
    };


    const groupRunStats = {
      success: true,
      runDate: moment().utc().toDate(),
      filterStartDate: filterStartDate,
      filterEndDate: filterEndDate,
      emails: userProfiles,
      results: []
    };


    try {

      // collect events for this group of emails
      const results = await Promise.all(userProfiles.map(async(userProfile) => {

        const individualRunStats = {
          filterStartDate,
          filterEndDate,
          ...userProfile,
          success: true,
          runDate: moment().utc().toDate(),
          errorMessage: null
        };

        try {
          // add auth tokens to request
          const auth = await this.authorize(userProfile.emailAfterMapping);

          // function to recurse through pageTokens
          const getEvents = async (requestOpts: any, data?: GoogleCalendarApiResult): Promise<GoogleCalendarApiResult> => {

            // request first results...
            const events = await new Promise<GoogleCalendarApiResult>((res, rej) => {

              // add page token if given
              if (data && data.nextPageToken) {
                requestOpts.pageToken = data.nextPageToken;
              }

              calendar.events.list(
                requestOpts, handleGoogleError(res, rej)
              );
            });

            // if we already have data being accumulated, add to items
            if (data) {
              data.items.push(...events.items);
            } else {
              data = events;
            }

            // if there is a token for the next page, continue...
            if (events.nextPageToken) {
              data.nextPageToken = events.nextPageToken;
              return await getEvents(requestOpts, data);
            }

            return data;
          };

          /**
           * calendar ids we want to
           * retrieve events from
           */
          const includedCalendarIds = new Set([
            'primary',
            userProfile.email,
            userProfile.emailAfterMapping
          ]);

          /**
           * all calendar ids in the users calendar
           */
          const calendarIds = _.chain(await new Promise((res, rej) => {
            calendar.calendarList.list(
              { ...opts, auth },
              (err: any, d: any) => handleGoogleError(res, rej)(err, d && d.items)
            );
          }))
          .filter((item: any) => includedCalendarIds.has(item.id))
          .map('id')
          .value();

          /**
           * get all items from all calendars in the date
           * range, and flatten
           */
          const items = _.flatten(await Promise.all(
            _.map(<any> calendarIds, (calendarId: string) =>
              getEvents({ ...opts, auth, calendarId }).then(r => r && r.items)
            )
          ));


          const data = _.map(items, (item: GoogleCalendarApiEvent) => {

            const out: { [key: string]: string } = {};

            _.each(fieldNameMap, (have: string, want: string) => {
              let modified = _.get(item, have);
              if (/^dateTime/.test(want)) {
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
              out['responseStatus'] = attendeeSelf.responseStatus;
            }

            out['attendees'] = _.map(out['attendees'], (attendee: any) => {
              const { email, responseStatus } = attendee;
              return { address: email, response: responseStatus };
            });

            return out;
          });

          // request all events for this user in the given time frame
          return Object.assign(individualRunStats, { data });

        } catch (error) {
          let errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));

          if (/invalid_grant/.test(errorMessage.message.toString())) {
            errorMessage = new Error(`Email address: ${userProfile.emailAfterMapping} not found in this Google Calendar account.`);
          }

          return Object.assign(individualRunStats, {
            errorMessage,
            success: false,
            data: []
          });
        }

      }));

      return Object.assign(groupRunStats, { results });
    } catch (error) {
      return Object.assign(groupRunStats, {
        errorMessage: error,
        success: false
      });
    }

  }


  async runConnectionTest() {
    const { credentials: { email } } = this;

    try {
      const data = await this.getBatchData(
        [ { email, emailAfterMapping: email } ],
        moment().add(-1, 'day').toDate(),
        moment().toDate()
      );

      const firstResult = Array.isArray(data.results) && data.results[0];

      if (firstResult && firstResult.errorMessage) {
        return {
          success: false,
          message: firstResult.errorMessage
        };
      } else {
        return {
          success: true
        };
      }
    } catch (error) {
      console.log(error.stack || error);
      return {
        message: error.message,
        success: false
      };
    }
  }


  async runMessageTest() {
    // TODO: does this need to be different?
    console.warn('Note: runMessageTest() currently calls runConnectionTest()');
    return this.runConnectionTest();
  }


  // create authenticated token for api requests for given user
  async authorize(email: string) {

    const { credentials: { serviceEmail, certificate } } = this;

    const auth = new googleapis.auth.JWT(
      // email of google app admin...
      serviceEmail,
      // no need for keyFile...
      null,
      // the private key itself...
      certificate,
      // scopes...
      ['https://www.googleapis.com/auth/calendar.readonly'],
      // the email of the individual we want to authenticate
      // ('sub' property of the json web token)
      email
    );

    // await authorization
    return new Promise((res, rej) => auth.authorize(handleGoogleError(res, rej, auth)));
  }

}
