'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _adapterTypes = require('./adapterTypes');

var _adapterTypes2 = _interopRequireDefault(_adapterTypes);

/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */

var AdapterFactory = (function () {
  function AdapterFactory() {
    _classCallCheck(this, AdapterFactory);
  }

  _createClass(AdapterFactory, null, [{
    key: 'createAdapter',

    /**
     * Static factory
     * @param  {AdapterType} type
     * @return {BaseAdapter} concrete adapter subclass
     */
    value: function createAdapter(type) {
      switch (type) {
        case _adapterTypes2['default'].CUSTOM:
          throw new Error('Custom adapters provide their own approach');
        case _adapterTypes2['default'].NETSUITE:
          return new _2['default'].NetSuiteAdapter();
        case _adapterTypes2['default'].CL_MOCK:
          return new _2['default'].CLMockAdapter();
        case _adapterTypes2['default'].OFFICE365:
          return new _2['default'].Office365Adapter();
        case _adapterTypes2['default'].GOOGLE:
          return new _2['default'].GoogleAdapter();
        case _adapterTypes2['default'].GOOGLE_CALENDAR:
          return new _2['default'].GoogleCalendarAdapter();
        default:
          throw new Error('Unknown type');
      }
    }
  }]);

  return AdapterFactory;
})();

exports['default'] = AdapterFactory;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvYWRhcHRlckZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dCQUFxQixJQUFJOzs7OzRCQUNKLGdCQUFnQjs7Ozs7Ozs7Ozs7SUFRaEIsY0FBYztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7O2VBQWQsY0FBYzs7Ozs7Ozs7V0FPYix1QkFBQyxJQUFJLEVBQUU7QUFDekIsY0FBUSxJQUFJO0FBQ1YsYUFBSywwQkFBTSxNQUFNO0FBQ2YsZ0JBQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUFBLEFBQ2hFLGFBQUssMEJBQU0sUUFBUTtBQUNqQixpQkFBTyxJQUFJLGNBQVMsZUFBZSxFQUFFLENBQUM7QUFBQSxBQUN4QyxhQUFLLDBCQUFNLE9BQU87QUFDaEIsaUJBQU8sSUFBSSxjQUFTLGFBQWEsRUFBRSxDQUFDO0FBQUEsQUFDdEMsYUFBSywwQkFBTSxTQUFTO0FBQ2xCLGlCQUFPLElBQUksY0FBUyxnQkFBZ0IsRUFBRSxDQUFDO0FBQUEsQUFDekMsYUFBSywwQkFBTSxNQUFNO0FBQ2YsaUJBQU8sSUFBSSxjQUFTLGFBQWEsRUFBRSxDQUFDO0FBQUEsQUFDdEMsYUFBSywwQkFBTSxlQUFlO0FBQ3hCLGlCQUFPLElBQUksY0FBUyxxQkFBcUIsRUFBRSxDQUFDO0FBQUEsQUFDOUM7QUFDRSxnQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUFBLE9BQ25DO0tBQ0Y7OztTQXhCa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiY2xBZGFwdGVycy9hZGFwdGVyRmFjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhZGFwdGVycyBmcm9tICcuLyc7XG5pbXBvcnQgdHlwZXMgICAgZnJvbSAnLi9hZGFwdGVyVHlwZXMnO1xuXG4vKipcbiAqIEFkYXB0ZXIgZmFjdG9yeVxuICpcbiAqIEBjbGFzc1xuICogQHJldHVybiB7QWRhcHRlckZhY3Rvcnl9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkYXB0ZXJGYWN0b3J5IHtcblxuICAvKipcbiAgICogU3RhdGljIGZhY3RvcnlcbiAgICogQHBhcmFtICB7QWRhcHRlclR5cGV9IHR5cGVcbiAgICogQHJldHVybiB7QmFzZUFkYXB0ZXJ9IGNvbmNyZXRlIGFkYXB0ZXIgc3ViY2xhc3NcbiAgICovXG4gIHN0YXRpYyBjcmVhdGVBZGFwdGVyKHR5cGUpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgdHlwZXMuQ1VTVE9NOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSBhZGFwdGVycyBwcm92aWRlIHRoZWlyIG93biBhcHByb2FjaCcpO1xuICAgICAgY2FzZSB0eXBlcy5ORVRTVUlURTpcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5OZXRTdWl0ZUFkYXB0ZXIoKTtcbiAgICAgIGNhc2UgdHlwZXMuQ0xfTU9DSzpcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5DTE1vY2tBZGFwdGVyKCk7XG4gICAgICBjYXNlIHR5cGVzLk9GRklDRTM2NTpcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5PZmZpY2UzNjVBZGFwdGVyKCk7XG4gICAgICBjYXNlIHR5cGVzLkdPT0dMRTpcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5Hb29nbGVBZGFwdGVyKCk7XG4gICAgICBjYXNlIHR5cGVzLkdPT0dMRV9DQUxFTkRBUjpcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5Hb29nbGVDYWxlbmRhckFkYXB0ZXIoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biB0eXBlJyk7XG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceMappingURL=../clAdapters/adapterFactory.js.map