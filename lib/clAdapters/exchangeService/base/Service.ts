import * as _ from 'lodash';
import { Service, Configuration } from '../../base/index';
import * as EWS from 'node-ews';

export default class ExchangeServiceService extends Service {
  ews: any;

  constructor(public config: Configuration)  {
    super(config);
  }

  async init() {
    const credentials = this.config.credentials;

    const config = {
      username: credentials.username,
      password: credentials.password,
      host: credentials.connectUrl,
    };

    const options = {valueKey: 'value', xmlKey: 'xml'};

    this.ews = new EWS(config, options);

    return true;
  }

  private buildSoapHeader(emailAddress: string) {
    return {
      't:ExchangeImpersonation' : {
        't:ConnectingSID' : {
          't:PrimarySmtpAddress' : emailAddress
        }
      }
    };
  }

  public async getOptionalAttendees(itemId: string, itemChangeKey: string, addr: string ) {
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
    const soapHeader = this.buildSoapHeader(addr);
    const result = await this.ews.run('GetItem', ewsArgs, soapHeader);
    const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.OptionalAttendees.Attendee');
    return attendees;
  }

  public async getRequiredAttendees(itemId: string, itemChangeKey: string, addr: string) {
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

    const soapHeader = this.buildSoapHeader(addr);
    const result = await this.ews.run('GetItem', ewsArgs, soapHeader);
    const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.RequiredAttendees.Attendee');
    return attendees;
  }

  public async findItem(startDate: string, endDate: string, addr: string) {
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

    const soapHeader = this.buildSoapHeader(addr);
    return this.ews.run('FindItem', ewsArgs, soapHeader);
  }
};
