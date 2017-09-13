import * as moment from 'moment';
import * as _ from 'lodash';
import * as crypto from 'crypto';
import { Configuration, Service } from '../../base/index';
import ExchangeServiceBaseAdapter from '../base/Adapter';
import ExchangeServiceService from '../base/Service';
import { createExchangeServiceError } from '../errors';

const credentialMappings: { [key: string]: string } = {
  username : 'username',
  password : 'password',
  connectUrl : 'connectUrl'
};

const TEST_EMAIL: string = 'mark.bradley@crosslead.com';

export const fieldNameMap = {
  // Desired...                          // Given...
  'eventId':                             'ItemId.attributes.Id',
  'attendees':                           'Attendees',
  'categories':                          'Categories.String',
  'dateTimeCreated':                     'DateTimeCreated',
  'attendeeAddress':                     'Mailbox.EmailAddress',
  'attendeeName':                        'Mailbox.EmailAddress.Name',
  'hasAttachments':                      'HasAttachments',
  'importance':                          'Importance',
  'iCalUId':                             'ItemId.attributes.Id', //   'iCalUId',
  'allDay':                              'IsAllDayEvent',
  'canceled':                            'IsCancelled',
  // 'isOrganizer':                         'IsOrganizer',
  'locationName':                        'Location',
  'organizerName':                       'Organizer.Mailbox.Name',
  'organizerEmail':                      'Organizer.Mailbox.EmailAddress.Address',
  'responseRequested':                   'ResponseRequested',
  'responseStatus':                      'MyResponseType',
  // 'seriesMasterId':                      'SeriesMasterId',
  'showAs':                              'ShowAs',
  'dateTimeStart':                       'Start',
  'dateTimeEnd':                         'End',
  'subject':                             'Subject',
  'type':                                'CalendarItemType',
  'url':                                 'NetShowUrl',
  'privacy':                             'Sensitivity'
};

export interface UserProfile {
  email: string;
  emailAfterMapping: string;
}

export default class ExchangeServiceCalendarAdapter extends ExchangeServiceBaseAdapter {
  static Configuration = Configuration;
  static Service = ExchangeServiceService;

  // convert the names of the api response data
  static fieldNameMap = fieldNameMap;

  _config: Configuration;
  _service: ExchangeServiceService;

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

    // map json keys to keys used in this library
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

    this._config  = new ExchangeServiceCalendarAdapter.Configuration(credentials);
    this._service = new ExchangeServiceService(this._config);

    await this._service.init();

    console.log(
      `Successfully initialized exchange service calendar adapter for username: ${credentials.username}`
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

    const { fieldNameMap } = ExchangeServiceCalendarAdapter;

    const groupRunStats = {
      success: true,
      runDate: moment().utc().toDate(),
      filterStartDate: filterStartDate,
      filterEndDate: filterEndDate,
      emails: userProfiles,
      results: []
    };

    try {
      const adapter = this;

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

        const addr = userProfile.emailAfterMapping;

        try {
          const result = await this._service.findItem(filterStartDate.toISOString(), filterEndDate.toISOString(), addr);
          const items = _.get(result, 'ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem');

          const data = [];

          if (items && items.length) {
            for (const item of items) {
              const out: { [key: string]: any } = {};

              _.each(fieldNameMap, (have: string, want: string) => {
                let modified = _.get(item, have);
                if (/^dateTime/.test(want)) {
                  modified = new Date(modified);
                }
                if (modified !== undefined) {
                  out[want] = modified;
                }
              });

              await this.attachAttendees(out, item, addr);

              out.attendees = _.map(out.attendees, (attendee: any) => {
                const { Mailbox : email, ResponseType : response } = attendee;
                return { address: email.EmailAddress, response };
              });

              _.remove(out.attendees, (attendee: any) => {
                return !attendee.address;
              });

              out.canceled = adapter.parseBoolean(out.canceled);
              out.allDay = adapter.parseBoolean(out.allDay);
              out.hasAttachments = adapter.parseBoolean(out.hasAttachments);
              data.push(out);
            }
          }

          return Object.assign(individualRunStats, { data });
        } catch (error) {
          let errorMessage: any = error instanceof Error ? error : new Error(JSON.stringify(error));

          const msg = errorMessage.message.toString();
          if (/primary SMTP address must be specified/.test(msg) ||
              /ErrorNonPrimarySmtpAddress/.test(msg)) {
            errorMessage = createExchangeServiceError(
              'NotPrimaryEmail',
              new Error(`Email address: must use primary SMTP address for ${userProfile.emailAfterMapping}.`)
            );
          } else if (/SMTP address has no mailbox associated/.test(msg) ||
                     /ErrorNonExistentMailbox/.test(msg)) {
            errorMessage = createExchangeServiceError(
              'NoMailbox',
              new Error(`Email address: ${userProfile.emailAfterMapping} has no mailbox.`)
            );
          } else if (/ErrorInternalServerError/.test(msg)) {
            errorMessage = createExchangeServiceError(
              'InternalServerError', new Error(msg)
            );
          } else if (/NTLM StatusCode 401/.test(msg)) {
            // Service account is unauthorized-- throw error to exit all
            throw error;
          } else {
            errorMessage = createExchangeServiceError(
              'UnclassifiedError',
              new Error(msg));
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
      let errorMessage: any = error instanceof Error ? error : new Error(JSON.stringify(error));

      if (/NTLM StatusCode 401/.test(errorMessage.message.toString())) {
        const credsHash = this.hashCreds();
        errorMessage = createExchangeServiceError(
          'UnauthorizedClient',
          new Error('Credentials are not valid for ExchangeService: ' + credsHash));
      }

      return Object.assign(groupRunStats, {
        errorMessage,
        success: false
      });
    }
  }

  private hashCreds() {
    const hash = crypto.createHash('sha256');
    const password = this.credentials.password;

    console.log( 'Hashing password ' + password );
    hash.write(password);
    return hash.digest('hex');
  }

  private async attachAttendees(out: any, item: any, addr: string) {
    const attributes = _.get(item, 'ItemId.attributes');
    const itemId = _.get(attributes, 'Id');
    const itemChangeKey = _.get(attributes, 'ChangeKey');
    let attendees = await this._service.getRequiredAttendees(itemId, itemChangeKey, addr);

    // If an object is returned
    if (attendees) {
      if (attendees.length) {
        out.attendees = attendees;
      } else if (attendees.Mailbox) {
        out.attendees = [attendees];
      }
    }

    if (!out.attendees) {
      out.attendees = [];
    }

    attendees = await this._service.getOptionalAttendees(itemId, itemChangeKey, addr);

    if (attendees) {
      if (attendees.length) {
        out.attendees.push(...attendees);
      } else if (attendees.Mailbox) {
        out.attendees.push(attendees);
      }
    }
  }

  async runConnectionTest() {
    try {
      await this.init();

      // Just call a the method to expand a distribution list to get a response
      const result = await this._service.ews.run('ExpandDL', {
        'Mailbox': {
          EmailAddress: 'all@company.com'
        }
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.log(error.stack || error);
      return {
        message: error.message,
        success: false
      };
    }
  }
}
