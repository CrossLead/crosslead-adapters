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

import types    from './adapterTypes';

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
  static createAdapter(type) {
    switch (type) {
      case types.CUSTOM:
        throw new Error('Custom adapters provide their own approach');
      case types.NETSUITE:
        return new NetSuiteAdapter();
      case types.CL_MOCK:
        return new CLMockAdapter();
      case types.OFFICE365:
        return new Office365MailAdapter();
      case types.OFFICE365_CALENDAR:
        return new Office365CalendarAdapter();
      case types.GOOGLE:
        return new GoogleAdapter();
      case types.GOOGLE_CALENDAR:
        return new GoogleCalendarAdapter();
      case types.JIRA:
        return new JiraAdapter();
      case types.SLACK:
        return new SlackAdapter();
      default:
        throw new Error('Unknown type');
    }
  }
}
