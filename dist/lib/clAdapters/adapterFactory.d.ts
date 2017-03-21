import { NetSuiteAdapter, CLMockAdapter, Office365MailAdapter, Office365CalendarAdapter, GoogleAdapter, GoogleCalendarAdapter, JiraAdapter, SlackAdapter } from './';
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
    static createAdapter(type: Types): CLMockAdapter | NetSuiteAdapter | Office365MailAdapter | Office365CalendarAdapter | GoogleAdapter | GoogleCalendarAdapter | JiraAdapter | SlackAdapter;
}
