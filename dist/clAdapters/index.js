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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzJCQUFtQyxnQkFBZ0I7Ozs7NkJBQ2hCLGlCQUFpQjs7Ozt3QkFDakIsYUFBYTs7Ozs2QkFFVCxtQkFBbUI7Ozs7aUNBQ25CLHVCQUF1Qjs7OzswQkFFM0IsZ0JBQWdCOzs7OzhCQUNoQixvQkFBb0I7Ozs7Ozs7cUJBS3hDO0FBQ2IsU0FBTywwQkFBQTtBQUNQLGVBQWEsNEJBQUE7QUFDYixpQkFBZSx1QkFBQTtBQUNmLHNCQUFvQiw0QkFBQTtBQUNwQiwwQkFBd0IsZ0NBQUE7QUFDeEIsZUFBYSx5QkFBQTtBQUNiLHVCQUFxQiw2QkFBQTtDQUN0QiIsImZpbGUiOiJjbEFkYXB0ZXJzXFxpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBZGFwdGVyICAgICAgICAgICAgICAgIGZyb20gJy4vYmFzZS9BZGFwdGVyJztcbmltcG9ydCBDTE1vY2tBZGFwdGVyICAgICAgICAgIGZyb20gJy4vY2xNb2NrQWRhcHRlcic7XG5pbXBvcnQgTmV0U3VpdGVBZGFwdGVyICAgICAgICBmcm9tICcuL25ldHN1aXRlLyc7XG5cbmltcG9ydCBPZmZpY2UzNjVNYWlsQWRhcHRlciAgICAgICBmcm9tICcuL29mZmljZTM2NS9tYWlsLyc7XG5pbXBvcnQgT2ZmaWNlMzY1Q2FsZW5kYXJBZGFwdGVyICAgZnJvbSAnLi9vZmZpY2UzNjUvY2FsZW5kYXIvJztcblxuaW1wb3J0IEdvb2dsZUFkYXB0ZXIgICAgICAgICAgZnJvbSAnLi9nb29nbGUtbWFpbC8nO1xuaW1wb3J0IEdvb2dsZUNhbGVuZGFyQWRhcHRlciAgZnJvbSAnLi9nb29nbGUtY2FsZW5kYXIvJztcblxuLypcbiAqIEVudW1lcmF0aW9uIG9mIGF2YWlsYWJsZSBhZGFwdGVyc1xuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gIEFkYXB0ZXIsXG4gIENMTW9ja0FkYXB0ZXIsXG4gIE5ldFN1aXRlQWRhcHRlcixcbiAgT2ZmaWNlMzY1TWFpbEFkYXB0ZXIsXG4gIE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlcixcbiAgR29vZ2xlQWRhcHRlcixcbiAgR29vZ2xlQ2FsZW5kYXJBZGFwdGVyXG59XG4iXX0=
//# sourceMappingURL=index.js.map
