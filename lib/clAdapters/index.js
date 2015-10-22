import Adapter                from './base/Adapter';
import CLMockAdapter          from './clMockAdapter';
import NetSuiteAdapter        from './netsuite/';

import Office365MailAdapter       from './office365/mail/';
import Office365CalendarAdapter   from './office365/calendar/';

import GoogleAdapter          from './google-mail/';
import GoogleCalendarAdapter  from './google-calendar/';

/*
 * Enumeration of available adapters
 */
export default {
  Adapter,
  CLMockAdapter,
  NetSuiteAdapter,
  Office365MailAdapter,
  Office365CalendarAdapter,
  GoogleAdapter,
  GoogleCalendarAdapter
}
