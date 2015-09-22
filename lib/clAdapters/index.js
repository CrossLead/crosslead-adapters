import BaseAdapter            from './base/Adapter';
import CLMockAdapter          from './clMockAdapter';
import NetSuiteAdapter        from './netsuite/';
import Office365Adapter       from './office365/';
import GoogleAdapter          from './google-mail/';
import GoogleCalendarAdapter  from './google-calendar/';

/*
 * Enumeration of available adapters
 */
export default {
  BaseAdapter,
  CLMockAdapter,
  NetSuiteAdapter,
  Office365Adapter,
  GoogleAdapter,
  GoogleCalendarAdapter
}
