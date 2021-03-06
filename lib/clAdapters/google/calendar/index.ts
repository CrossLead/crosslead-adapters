import * as googleapis from 'googleapis';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Configuration, Service } from '../../base/index';
import GoogleBaseAdapter from '../base/Adapter';
import { GoogleError, GoogleErrorType, createGoogleError } from '../errors';
import rateLimit from '../../../utils/rate-limit';
import sanitizeLocalPart from '../../../utils/utils';
import { DateRange, UserProfile } from '../../../common/types';
import { handleGoogleError, calendarIdsFor } from '../../util/google/util';

// google calendar api
const calendar = googleapis.calendar('v3');

const credentialMappings: { [key: string]: string } = {
  'certificate' : 'private_key',
  'serviceEmail': 'client_email',
  'email'       : 'adminEmail'
};


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
          const getEvents = async (requestOpts: any, data?: GoogleCalendarApiResult): Promise<GoogleCalendarApiResult | undefined> => {

            // add page token if given
            if (data && data.nextPageToken) {
              requestOpts.pageToken = data.nextPageToken;
            }

            // request first results...
            const events = await this.getEvents(requestOpts);

            // It turns out that once in while, null is returned
            // from calendar.events.list .
            if (!events) {
              return data;
            }

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

          const calendarIds = await calendarIdsFor(userProfile, auth);

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
              return { email, response: responseStatus };
            });

            return out;
          });

          // request all events for this user in the given time frame
          return Object.assign(individualRunStats, { data });

        } catch (error) {
          let errorMessage: GoogleError | Error = error instanceof Error ? error : new Error(JSON.stringify(error));
          if (/invalid_grant/.test(errorMessage.message.toString())) {
            errorMessage = createGoogleError(
              'InvalidGrant',
              new Error(`Email address: ${userProfile.emailAfterMapping} not found in this Google Calendar account.`)
            );
          } else if (errorMessage.message.toString() === 'The user must be signed up for Google Calendar.') {
            errorMessage = createGoogleError(
              'NotACalendarUser',
              new Error(`User ${userProfile.emailAfterMapping} must be signed up for Google Calendar (aka, the user account is probably suspended)`));
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
  async authorize(email: string): Promise<any> {
    email = sanitizeLocalPart(email);

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

    try {
      return await new Promise((res, rej) => auth.authorize(handleGoogleError(res, rej, auth)));
    } catch (err) {
      const context = JSON.stringify({serviceEmail, email});
      throw (/invalid_request/.test(err.message) ?
             new Error(`Caught invalid_request performing authorization: ${err.message}, ${context}`) :
             new Error(`Caught exception performing authorization: ${err.message ? err.message : err.toString()}: ${context}`));
    }
  }

  @rateLimit()
  async getEvents(requestOpts: any) {
    try {
      return await new Promise<GoogleCalendarApiResult>((res, rej) => {
        calendar.events.list(
          requestOpts, handleGoogleError(res, rej)
        );
      });
    } catch (err) {
      const subject = requestOpts && requestOpts.auth ? requestOpts.auth.subject : '';
      const context = `subject = ${subject}`;
      throw (/invalid_request/.test(err.message) ?
             new Error(`Caught invalid_request getting events: ${err.message}, ${context}`) :
             new Error(`Caught exception getting events: ${err.message}, ${context}`));
    }
  }

  async getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange|null> {
    const auth = await this.authorize(userProfile.emailAfterMapping);
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
      if (items && items.length) {
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

}
