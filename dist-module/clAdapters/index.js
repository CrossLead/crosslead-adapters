import Adapter from './base/Adapter';
import CLMockAdapter from './clMockAdapter';
import NetSuiteAdapter from './netsuite/';

import Office365MailAdapter from './office365/mail/';
import Office365CalendarAdapter from './office365/calendar/';

import GoogleAdapter from './google-mail/';
import GoogleCalendarAdapter from './google-calendar/';

import JiraAdapter from './jira/';

/*
 * Enumeration of available adapters
 */
export default {
  Adapter: Adapter,
  CLMockAdapter: CLMockAdapter,
  NetSuiteAdapter: NetSuiteAdapter,
  Office365MailAdapter: Office365MailAdapter,
  Office365CalendarAdapter: Office365CalendarAdapter,
  GoogleAdapter: GoogleAdapter,
  GoogleCalendarAdapter: GoogleCalendarAdapter,
  JiraAdapter: JiraAdapter
};
//# sourceMappingURL=../clAdapters/index.js.map