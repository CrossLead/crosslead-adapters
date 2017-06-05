import {
  Adapter,
  NetSuiteAdapter,
  CLMockAdapter,
  Office365MailAdapter,
  Office365CalendarAdapter,
  GoogleAdapter,
  GoogleCalendarAdapter,
  JiraAdapter,
  SlackAdapter,
  ActiveSyncCalendarAdapter,
  ExchangeServiceCalendarAdapter
} from './';

import Types from './adapterTypes';

/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
export default class AdapterFactory {

  /**
   * Static factory
   * @param  {AdapterType} type
   * @return {BaseAdapter} concrete adapter subclass
   */
  static createAdapter(type: Types.CUSTOM): never;
  static createAdapter(type: Types.NETSUITE): NetSuiteAdapter;
  static createAdapter(type: Types.CL_MOCK): CLMockAdapter;
  static createAdapter(type: Types.OFFICE365): Office365MailAdapter;
  static createAdapter(type: Types.OFFICE365_CALENDAR): Office365CalendarAdapter;
  static createAdapter(type: Types.GOOGLE): GoogleAdapter;
  static createAdapter(type: Types.GOOGLE_CALENDAR): GoogleCalendarAdapter;
  static createAdapter(type: Types.JIRA): JiraAdapter;
  static createAdapter(type: Types.SLACK): SlackAdapter;
  static createAdapter(type: Types.ACTIVE_SYNC_CALENDAR): ActiveSyncCalendarAdapter;
  static createAdapter(type: Types.EXCHANGE_SERVICE_CALENDAR): ExchangeServiceCalendarAdapter;
  static createAdapter(type: Types): Adapter;
  static createAdapter(type: Types): Adapter {
    switch (type) {
      case Types.CUSTOM:
        throw new Error('Custom adapters provide their own approach');
      case Types.NETSUITE:
        return new NetSuiteAdapter();
      case Types.CL_MOCK:
        return new CLMockAdapter();
      case Types.OFFICE365:
        return new Office365MailAdapter();
      case Types.OFFICE365_CALENDAR:
        return new Office365CalendarAdapter();
      case Types.GOOGLE:
        return new GoogleAdapter();
      case Types.GOOGLE_CALENDAR:
        return new GoogleCalendarAdapter();
      case Types.JIRA:
        return new JiraAdapter();
      case Types.SLACK:
        return new SlackAdapter();
      case Types.ACTIVE_SYNC_CALENDAR:
        return new ActiveSyncCalendarAdapter();
      case Types.EXCHANGE_SERVICE_CALENDAR:
        return new ExchangeServiceCalendarAdapter();
      default:
        throw new Error(`Unknown type ${type}`);
    }
  }
}
