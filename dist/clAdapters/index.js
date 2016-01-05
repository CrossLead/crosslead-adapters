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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzJCQUFtQyxnQkFBZ0I7Ozs7NkJBQ2hCLGlCQUFpQjs7Ozt3QkFDakIsYUFBYTs7Ozs2QkFFVCxtQkFBbUI7Ozs7aUNBQ25CLHVCQUF1Qjs7OzswQkFFM0IsZ0JBQWdCOzs7OzhCQUNoQixvQkFBb0I7Ozs7Ozs7cUJBS3hDO0FBQ2IsU0FBTywwQkFBQTtBQUNQLGVBQWEsNEJBQUE7QUFDYixpQkFBZSx1QkFBQTtBQUNmLHNCQUFvQiw0QkFBQTtBQUNwQiwwQkFBd0IsZ0NBQUE7QUFDeEIsZUFBYSx5QkFBQTtBQUNiLHVCQUFxQiw2QkFBQTtDQUN0QiIsImZpbGUiOiJjbEFkYXB0ZXJzXFxpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBZGFwdGVyICAgICAgICAgICAgICAgIGZyb20gJy4vYmFzZS9BZGFwdGVyJztcclxuaW1wb3J0IENMTW9ja0FkYXB0ZXIgICAgICAgICAgZnJvbSAnLi9jbE1vY2tBZGFwdGVyJztcclxuaW1wb3J0IE5ldFN1aXRlQWRhcHRlciAgICAgICAgZnJvbSAnLi9uZXRzdWl0ZS8nO1xyXG5cclxuaW1wb3J0IE9mZmljZTM2NU1haWxBZGFwdGVyICAgICAgIGZyb20gJy4vb2ZmaWNlMzY1L21haWwvJztcclxuaW1wb3J0IE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlciAgIGZyb20gJy4vb2ZmaWNlMzY1L2NhbGVuZGFyLyc7XHJcblxyXG5pbXBvcnQgR29vZ2xlQWRhcHRlciAgICAgICAgICBmcm9tICcuL2dvb2dsZS1tYWlsLyc7XHJcbmltcG9ydCBHb29nbGVDYWxlbmRhckFkYXB0ZXIgIGZyb20gJy4vZ29vZ2xlLWNhbGVuZGFyLyc7XHJcblxyXG4vKlxyXG4gKiBFbnVtZXJhdGlvbiBvZiBhdmFpbGFibGUgYWRhcHRlcnNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBBZGFwdGVyLFxyXG4gIENMTW9ja0FkYXB0ZXIsXHJcbiAgTmV0U3VpdGVBZGFwdGVyLFxyXG4gIE9mZmljZTM2NU1haWxBZGFwdGVyLFxyXG4gIE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlcixcclxuICBHb29nbGVBZGFwdGVyLFxyXG4gIEdvb2dsZUNhbGVuZGFyQWRhcHRlclxyXG59XHJcbiJdfQ==
//# sourceMappingURL=index.js.map
