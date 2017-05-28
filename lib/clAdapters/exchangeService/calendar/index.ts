import * as moment from 'moment';
import 'moment-recur';
import * as _ from 'lodash';
import { Configuration, Service } from '../../base/index';
import * as asclient from 'asclient';
import ExchangeServiceBaseAdapter from '../base/Adapter';
import * as EWS from 'node-ews';

const credentialMappings: { [key: string]: string } = {
  username : 'username',
  password : 'password',
  connectUrl : 'connectUrl'
};

const ORGANIZER_STATUS: string = '1';
const ACCEPTED_STATUS: string = '3';
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
  // 'iCalUId':                             'iCalUId',
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
  // 'url':                                 'WebLink',
  'privacy':                             'Sensitivity'
};

export interface UserProfile {
  email: string;
  emailAfterMapping: string;
}

function handleExchangeError(res: Function, rej: Function, returnVal?: any) {
  return (err: any, result: any) => {
    if (err) {
      let mapped = err;
      if (err instanceof Error) {
        // Map to custom errors
        if (/unauthorized_client/.test(err.message.toString())) {
          // mapped = createGoogleError(
          //   'UnauthorizedClient',
          //   err
          // );
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

export default class ExchangeServiceCalendarAdapter extends ExchangeServiceBaseAdapter {

  static Configuration = Configuration;
  static Service = Service;

  // convert the names of the api response data
  static fieldNameMap = fieldNameMap;



  _config: Configuration;
  _service: Service;
  ews: any;
  soapHeader: any;

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
    console.log('inited!');

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
    this._service = new ExchangeServiceCalendarAdapter.Service(this._config);

    await this._service.init();

    const { username: username } = credentials;

    console.log(
      `Successfully initialized active sync calendar adapter for username: ${username}`
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
      this.initEws();

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

        this.setImpersonationUser(userProfile.emailAfterMapping);

        try {
          const result = await this.findItem(filterStartDate.toISOString(), filterEndDate.toISOString());
          const items = _.get(result, 'ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem');

          const data = [];

          for (const item of items) {
            console.log('item', JSON.stringify(item, null, 2));
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

            await this.attachAttendees(out, item);

            out['attendees'] = _.map(out['attendees'], (attendee: any) => {
              const { Mailbox : email, ResponseType : responseStatus } = attendee;
              return { address: email.EmailAddress, response: responseStatus };
            });

            console.log('out', JSON.stringify(out, null, 2));
            data.push(out);
          }

          // console.log('data', JSON.stringify(data, null, 2));

          // request all events for this user in the given time frame
          return Object.assign(individualRunStats, { data });
        } catch (error) {
          let errorMessage: any = error instanceof Error ? error : new Error(JSON.stringify(error));

          if (/invalid_grant/.test(errorMessage.message.toString())) {
            errorMessage = {
              type : 'InvalidGrant',
              error : new Error(`Email address: ${userProfile.emailAfterMapping} not found in this Exchange Calendar account.`)
            };
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

  private setImpersonationUser(emailAddress: string) {
    this.soapHeader = {
      't:ExchangeImpersonation' : {
        't:ConnectingSID' : {
          't:PrimarySmtpAddress' : emailAddress
        }
      }
    };
  }

  private initEws() {
    const { credentials }: { credentials: {[k: string]: string} } = this;

    if (!credentials) {
      throw new Error('credentials required for adapter.');
    }

    // validate required credential properties
    Object.keys(credentialMappings)
      .forEach(prop => {
        if (!credentials[prop]) {
          throw new Error(`Property ${prop} required in adapter credentials!`);
        }
      });

    const ewsConfig = {
      username: this.credentials.username,
      password: this.credentials.password,
      host: this.credentials.connectUrl
    };

    this.ews = new EWS(ewsConfig);
  }

  private async attachAttendees(out: any, item: any) {
    const attributes = _.get(item, 'ItemId.attributes');
    const itemId = _.get(attributes, 'Id');
    const itemChangeKey = _.get(attributes, 'ChangeKey');
    let attendees = await this.getRequiredAttendees(itemId, itemChangeKey);

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

    attendees = await this.getOptionalAttendees(itemId, itemChangeKey);

    if (attendees) {
      if (attendees.length) {
        out.attendees.push(...attendees);
      } else if (attendees.Mailbox) {
        out.attendees.push(attendees);
      }
    }
  }

  private async getOptionalAttendees(itemId: string, itemChangeKey: string) {
    if (!this.ews) {
      throw new Error('EWS has not been inited!');
    }

    const ewsArgs = {
      ItemShape : {
        BaseShape : 'IdOnly',
        AdditionalProperties : [
          {
            FieldURI : {
              attributes : {
                FieldURI : 'calendar:OptionalAttendees'
              }
            }
          }
        ]
      },
      ItemIds : [
        {
          ItemId : {
            attributes : {
              Id : itemId,
              ChangeKey : itemChangeKey
            }
          }
        }
      ]
    };

    const result = await this.ews.run('GetItem', ewsArgs, this.soapHeader);
    const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.OptionalAttendees.Attendee');
    return attendees;
  }

  private async getRequiredAttendees(itemId: string, itemChangeKey: string) {
    if (!this.ews) {
      throw new Error('EWS has not been inited!');
    }

    const ewsArgs = {
      ItemShape : {
        BaseShape : 'IdOnly',
        AdditionalProperties : [
          {
            FieldURI : {
              attributes : {
                FieldURI : 'calendar:RequiredAttendees'
              }
            }
          }
        ]
      },
      ItemIds : [
        {
          ItemId : {
            attributes : {
              Id : itemId,
              ChangeKey : itemChangeKey
            }
          }
        }
      ]
    };

    const result = await this.ews.run('GetItem', ewsArgs, this.soapHeader);
    const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.RequiredAttendees.Attendee');
    return attendees;
  }

  private async findItem(startDate: string, endDate: string) {
    if (!this.ews) {
      throw new Error('EWS has not been inited!');
    }

    const ewsArgs = {
      attributes: {
        Traversal : 'Shallow'
      },
      ItemShape : {
        BaseShape : 'AllProperties'
      },
      CalendarView : {
        attributes : {
          StartDate : startDate,
          EndDate : endDate
        }
      },
      ParentFolderIds : {
        DistinguishedFolderId : {
          attributes : {
            Id : 'calendar'
          }
        }
      }
    };

    return this.ews.run('FindItem', ewsArgs, this.soapHeader);
  }

  async runConnectionTest() {
    this.initEws();

    try {
      // Just call a the method to expand a distribution list to get a response
      const result = await this.ews.run('ExpandDL', {
        'Mailbox': {
          EmailAddress: 'all@company.com'
        }
      });

      // console.log('result', JSON.stringify(result, null, 2));

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
