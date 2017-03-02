import {
  NetSuiteAdapter,
  CLMockAdapter,
  Office365MailAdapter,
  Office365CalendarAdapter,
  GoogleAdapter,
  GoogleCalendarAdapter,
  JiraAdapter,
  SlackAdapter
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
  static createAdapter(type: Types) {
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
      default:
        throw new Error('Unknown type');
    }
  }
}