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

    const ewsConfig = {
      username: credentials.username,
      password: credentials.password,
      host: credentials.connectUrl
    };

    this.ews = new EWS(ewsConfig);

    console.log(
      `Successfully initialized active sync calendar adapter for username: ${credentials.username}`
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

        this.setImpersonationUser(userProfile.emailAfterMapping);

        try {
          const result = await this.findItem(filterStartDate.toISOString(), filterEndDate.toISOString());
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

              await this.attachAttendees(out, item);

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

          if (/primary SMTP address must be specified/.test(errorMessage.message.toString())) {
            errorMessage = {
              type : 'InvalidPrimaryAddress',
              error : new Error(`Email address: must use primary SMTP address for ${userProfile.emailAfterMapping}.`)
            };
          } else if (/SMTP address has no mailbox associated/.test(errorMessage.message.toString())) {
            errorMessage = {
              type : 'InvalidAddress',
              error : new Error(`Email address: ${userProfile.emailAfterMapping} has no mailbox.`)
            };
          } else if (/NTLM StatusCode 401/.test(errorMessage.message.toString())) {
            // Service account is unauthorized-- throw error to exit all
            throw error;
          } else {
            console.log('unknown error', error);
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
    try {
      // Just call a the method to expand a distribution list to get a response
      const result = await this.ews.run('ExpandDL', {
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
