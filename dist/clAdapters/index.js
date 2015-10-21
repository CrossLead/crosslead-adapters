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

var _office365Mail = require('./office365-mail/');

var _office365Mail2 = _interopRequireDefault(_office365Mail);

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
  Office365Adapter: _office365Mail2['default'],
  GoogleAdapter: _googleMail2['default'],
  GoogleCalendarAdapter: _googleCalendar2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7MkJBQW1DLGdCQUFnQjs7Ozs2QkFDaEIsaUJBQWlCOzs7O3dCQUNqQixhQUFhOzs7OzZCQUNiLG1CQUFtQjs7OzswQkFDbkIsZ0JBQWdCOzs7OzhCQUNoQixvQkFBb0I7Ozs7Ozs7cUJBS3hDO0FBQ2IsYUFBVywwQkFBQTtBQUNYLGVBQWEsNEJBQUE7QUFDYixpQkFBZSx1QkFBQTtBQUNmLGtCQUFnQiw0QkFBQTtBQUNoQixlQUFhLHlCQUFBO0FBQ2IsdUJBQXFCLDZCQUFBO0NBQ3RCIiwiZmlsZSI6ImNsQWRhcHRlcnMvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFkYXB0ZXIgICAgICAgICAgICBmcm9tICcuL2Jhc2UvQWRhcHRlcic7XG5pbXBvcnQgQ0xNb2NrQWRhcHRlciAgICAgICAgICBmcm9tICcuL2NsTW9ja0FkYXB0ZXInO1xuaW1wb3J0IE5ldFN1aXRlQWRhcHRlciAgICAgICAgZnJvbSAnLi9uZXRzdWl0ZS8nO1xuaW1wb3J0IE9mZmljZTM2NUFkYXB0ZXIgICAgICAgZnJvbSAnLi9vZmZpY2UzNjUtbWFpbC8nO1xuaW1wb3J0IEdvb2dsZUFkYXB0ZXIgICAgICAgICAgZnJvbSAnLi9nb29nbGUtbWFpbC8nO1xuaW1wb3J0IEdvb2dsZUNhbGVuZGFyQWRhcHRlciAgZnJvbSAnLi9nb29nbGUtY2FsZW5kYXIvJztcblxuLypcbiAqIEVudW1lcmF0aW9uIG9mIGF2YWlsYWJsZSBhZGFwdGVyc1xuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gIEJhc2VBZGFwdGVyLFxuICBDTE1vY2tBZGFwdGVyLFxuICBOZXRTdWl0ZUFkYXB0ZXIsXG4gIE9mZmljZTM2NUFkYXB0ZXIsXG4gIEdvb2dsZUFkYXB0ZXIsXG4gIEdvb2dsZUNhbGVuZGFyQWRhcHRlclxufVxuIl19
//# sourceMappingURL=../clAdapters/index.js.map