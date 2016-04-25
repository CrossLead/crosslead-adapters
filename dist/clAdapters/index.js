'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _baseAdapter = require('./base/Adapter');

var _baseAdapter2 = _interopRequireDefault(_baseAdapter);

var _clMockAdapter = require('./clMockAdapter');

var _clMockAdapter2 = _interopRequireDefault(_clMockAdapter);

var _netsuite = require('./netsuite/');

var _netsuite2 = _interopRequireDefault(_netsuite);

var _office365Mail = require('./office365/mail/');

var _office365Mail2 = _interopRequireDefault(_office365Mail);

var _office365Calendar = require('./office365/calendar/');

var _office365Calendar2 = _interopRequireDefault(_office365Calendar);

var _googleMail = require('./google-mail/');

var _googleMail2 = _interopRequireDefault(_googleMail);

var _googleCalendar = require('./google-calendar/');

var _googleCalendar2 = _interopRequireDefault(_googleCalendar);

/*
 * Enumeration of available adapters
 */
exports['default'] = {
  Adapter: _baseAdapter2['default'],
  CLMockAdapter: _clMockAdapter2['default'],
  NetSuiteAdapter: _netsuite2['default'],
  Office365MailAdapter: _office365Mail2['default'],
  Office365CalendarAdapter: _office365Calendar2['default'],
  GoogleAdapter: _googleMail2['default'],
  GoogleCalendarAdapter: _googleCalendar2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7MkJBQW1DLGdCQUFnQjs7Ozs2QkFDaEIsaUJBQWlCOzs7O3dCQUNqQixhQUFhOzs7OzZCQUVULG1CQUFtQjs7OztpQ0FDbkIsdUJBQXVCOzs7OzBCQUUzQixnQkFBZ0I7Ozs7OEJBQ2hCLG9CQUFvQjs7Ozs7OztxQkFLeEM7QUFDYixTQUFPLDBCQUFBO0FBQ1AsZUFBYSw0QkFBQTtBQUNiLGlCQUFlLHVCQUFBO0FBQ2Ysc0JBQW9CLDRCQUFBO0FBQ3BCLDBCQUF3QixnQ0FBQTtBQUN4QixlQUFhLHlCQUFBO0FBQ2IsdUJBQXFCLDZCQUFBO0NBQ3RCIiwiZmlsZSI6ImNsQWRhcHRlcnMvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWRhcHRlciAgICAgICAgICAgICAgICBmcm9tICcuL2Jhc2UvQWRhcHRlcic7XG5pbXBvcnQgQ0xNb2NrQWRhcHRlciAgICAgICAgICBmcm9tICcuL2NsTW9ja0FkYXB0ZXInO1xuaW1wb3J0IE5ldFN1aXRlQWRhcHRlciAgICAgICAgZnJvbSAnLi9uZXRzdWl0ZS8nO1xuXG5pbXBvcnQgT2ZmaWNlMzY1TWFpbEFkYXB0ZXIgICAgICAgZnJvbSAnLi9vZmZpY2UzNjUvbWFpbC8nO1xuaW1wb3J0IE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlciAgIGZyb20gJy4vb2ZmaWNlMzY1L2NhbGVuZGFyLyc7XG5cbmltcG9ydCBHb29nbGVBZGFwdGVyICAgICAgICAgIGZyb20gJy4vZ29vZ2xlLW1haWwvJztcbmltcG9ydCBHb29nbGVDYWxlbmRhckFkYXB0ZXIgIGZyb20gJy4vZ29vZ2xlLWNhbGVuZGFyLyc7XG5cbi8qXG4gKiBFbnVtZXJhdGlvbiBvZiBhdmFpbGFibGUgYWRhcHRlcnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICBBZGFwdGVyLFxuICBDTE1vY2tBZGFwdGVyLFxuICBOZXRTdWl0ZUFkYXB0ZXIsXG4gIE9mZmljZTM2NU1haWxBZGFwdGVyLFxuICBPZmZpY2UzNjVDYWxlbmRhckFkYXB0ZXIsXG4gIEdvb2dsZUFkYXB0ZXIsXG4gIEdvb2dsZUNhbGVuZGFyQWRhcHRlclxufVxuIl19
//# sourceMappingURL=index.js.map
