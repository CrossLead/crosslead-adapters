'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Adapter = require('./base/Adapter');

var _Adapter2 = _interopRequireDefault(_Adapter);

var _clMockAdapter = require('./clMockAdapter');

var _clMockAdapter2 = _interopRequireDefault(_clMockAdapter);

var _netsuite = require('./netsuite/');

var _netsuite2 = _interopRequireDefault(_netsuite);

var _mail = require('./office365/mail/');

var _mail2 = _interopRequireDefault(_mail);

var _calendar = require('./office365/calendar/');

var _calendar2 = _interopRequireDefault(_calendar);

var _googleMail = require('./google-mail/');

var _googleMail2 = _interopRequireDefault(_googleMail);

var _googleCalendar = require('./google-calendar/');

var _googleCalendar2 = _interopRequireDefault(_googleCalendar);

var _jira = require('./jira/');

var _jira2 = _interopRequireDefault(_jira);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Enumeration of available adapters
 */
exports.default = {
  Adapter: _Adapter2.default,
  CLMockAdapter: _clMockAdapter2.default,
  NetSuiteAdapter: _netsuite2.default,
  Office365MailAdapter: _mail2.default,
  Office365CalendarAdapter: _calendar2.default,
  GoogleAdapter: _googleMail2.default,
  GoogleCalendarAdapter: _googleCalendar2.default,
  JiraAdapter: _jira2.default
};
//# sourceMappingURL=../clAdapters/index.js.map