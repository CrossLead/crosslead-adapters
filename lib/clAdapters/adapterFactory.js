import * as adapters from './';
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
        return new adapters.NetSuiteAdapter();
      case types.CL_MOCK:
        return new adapters.CLMockAdapter();
      case types.OFFICE365:
        return new adapters.Office365MailAdapter();
      case types.OFFICE365_CALENDAR:
        return new adapters.Office365CalendarAdapter();
      case types.GOOGLE:
        return new adapters.GoogleAdapter();
      case types.GOOGLE_CALENDAR:
        return new adapters.GoogleCalendarAdapter();
      case types.JIRA:
        return new adapters.JiraAdapter();
      case types.SLACK:
        return new adapters.SlackAdapter();
      default:
        throw new Error('Unknown type');
    }
  }
}
