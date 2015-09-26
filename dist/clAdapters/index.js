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

var _office365 = require('./office365/');

var _office3652 = _interopRequireDefault(_office365);

var _googleMail = require('./google-mail/');

var _googleMail2 = _interopRequireDefault(_googleMail);

var _googleCalendar = require('./google-calendar/');

var _googleCalendar2 = _interopRequireDefault(_googleCalendar);

/*
 * Enumeration of available adapters
 */
exports['default'] = {
  BaseAdapter: _baseAdapter2['default'],
  CLMockAdapter: _clMockAdapter2['default'],
  NetSuiteAdapter: _netsuite2['default'],
  Office365Adapter: _office3652['default'],
  GoogleAdapter: _googleMail2['default'],
  GoogleCalendarAdapter: _googleCalendar2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7MkJBQW1DLGdCQUFnQjs7Ozs2QkFDaEIsaUJBQWlCOzs7O3dCQUNqQixhQUFhOzs7O3lCQUNiLGNBQWM7Ozs7MEJBQ2QsZ0JBQWdCOzs7OzhCQUNoQixvQkFBb0I7Ozs7Ozs7cUJBS3hDO0FBQ2IsYUFBVywwQkFBQTtBQUNYLGVBQWEsNEJBQUE7QUFDYixpQkFBZSx1QkFBQTtBQUNmLGtCQUFnQix3QkFBQTtBQUNoQixlQUFhLHlCQUFBO0FBQ2IsdUJBQXFCLDZCQUFBO0NBQ3RCIiwiZmlsZSI6ImNsQWRhcHRlcnMvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFkYXB0ZXIgICAgICAgICAgICBmcm9tICcuL2Jhc2UvQWRhcHRlcic7XG5pbXBvcnQgQ0xNb2NrQWRhcHRlciAgICAgICAgICBmcm9tICcuL2NsTW9ja0FkYXB0ZXInO1xuaW1wb3J0IE5ldFN1aXRlQWRhcHRlciAgICAgICAgZnJvbSAnLi9uZXRzdWl0ZS8nO1xuaW1wb3J0IE9mZmljZTM2NUFkYXB0ZXIgICAgICAgZnJvbSAnLi9vZmZpY2UzNjUvJztcbmltcG9ydCBHb29nbGVBZGFwdGVyICAgICAgICAgIGZyb20gJy4vZ29vZ2xlLW1haWwvJztcbmltcG9ydCBHb29nbGVDYWxlbmRhckFkYXB0ZXIgIGZyb20gJy4vZ29vZ2xlLWNhbGVuZGFyLyc7XG5cbi8qXG4gKiBFbnVtZXJhdGlvbiBvZiBhdmFpbGFibGUgYWRhcHRlcnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICBCYXNlQWRhcHRlcixcbiAgQ0xNb2NrQWRhcHRlcixcbiAgTmV0U3VpdGVBZGFwdGVyLFxuICBPZmZpY2UzNjVBZGFwdGVyLFxuICBHb29nbGVBZGFwdGVyLFxuICBHb29nbGVDYWxlbmRhckFkYXB0ZXJcbn1cbiJdfQ==
//# sourceMappingURL=../clAdapters/index.js.map