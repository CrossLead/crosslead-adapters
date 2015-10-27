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
          return new _2['default'].Office365MailAdapter();
        case _adapterTypes2['default'].OFFICE365_CALENDAR:
          return new _2['default'].Office365CalendarAdapter();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvYWRhcHRlckZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dCQUFxQixJQUFJOzs7OzRCQUNKLGdCQUFnQjs7Ozs7Ozs7Ozs7SUFRaEIsY0FBYztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7O2VBQWQsY0FBYzs7Ozs7Ozs7V0FPYix1QkFBQyxJQUFJLEVBQUU7QUFDekIsY0FBUSxJQUFJO0FBQ1YsYUFBSywwQkFBTSxNQUFNO0FBQ2YsZ0JBQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUFBLEFBQ2hFLGFBQUssMEJBQU0sUUFBUTtBQUNqQixpQkFBTyxJQUFJLGNBQVMsZUFBZSxFQUFFLENBQUM7QUFBQSxBQUN4QyxhQUFLLDBCQUFNLE9BQU87QUFDaEIsaUJBQU8sSUFBSSxjQUFTLGFBQWEsRUFBRSxDQUFDO0FBQUEsQUFDdEMsYUFBSywwQkFBTSxTQUFTO0FBQ2xCLGlCQUFPLElBQUksY0FBUyxvQkFBb0IsRUFBRSxDQUFDO0FBQUEsQUFDN0MsYUFBSywwQkFBTSxrQkFBa0I7QUFDM0IsaUJBQU8sSUFBSSxjQUFTLHdCQUF3QixFQUFFLENBQUM7QUFBQSxBQUNqRCxhQUFLLDBCQUFNLE1BQU07QUFDZixpQkFBTyxJQUFJLGNBQVMsYUFBYSxFQUFFLENBQUM7QUFBQSxBQUN0QyxhQUFLLDBCQUFNLGVBQWU7QUFDeEIsaUJBQU8sSUFBSSxjQUFTLHFCQUFxQixFQUFFLENBQUM7QUFBQSxBQUM5QztBQUNFLGdCQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQUEsT0FDbkM7S0FDRjs7O1NBMUJrQixjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiJjbEFkYXB0ZXJzL2FkYXB0ZXJGYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFkYXB0ZXJzIGZyb20gJy4vJztcbmltcG9ydCB0eXBlcyAgICBmcm9tICcuL2FkYXB0ZXJUeXBlcyc7XG5cbi8qKlxuICogQWRhcHRlciBmYWN0b3J5XG4gKlxuICogQGNsYXNzXG4gKiBAcmV0dXJuIHtBZGFwdGVyRmFjdG9yeX1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWRhcHRlckZhY3Rvcnkge1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgZmFjdG9yeVxuICAgKiBAcGFyYW0gIHtBZGFwdGVyVHlwZX0gdHlwZVxuICAgKiBAcmV0dXJuIHtCYXNlQWRhcHRlcn0gY29uY3JldGUgYWRhcHRlciBzdWJjbGFzc1xuICAgKi9cbiAgc3RhdGljIGNyZWF0ZUFkYXB0ZXIodHlwZSkge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSB0eXBlcy5DVVNUT006XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIGFkYXB0ZXJzIHByb3ZpZGUgdGhlaXIgb3duIGFwcHJvYWNoJyk7XG4gICAgICBjYXNlIHR5cGVzLk5FVFNVSVRFOlxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLk5ldFN1aXRlQWRhcHRlcigpO1xuICAgICAgY2FzZSB0eXBlcy5DTF9NT0NLOlxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLkNMTW9ja0FkYXB0ZXIoKTtcbiAgICAgIGNhc2UgdHlwZXMuT0ZGSUNFMzY1OlxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLk9mZmljZTM2NU1haWxBZGFwdGVyKCk7XG4gICAgICBjYXNlIHR5cGVzLk9GRklDRTM2NV9DQUxFTkRBUjpcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5PZmZpY2UzNjVDYWxlbmRhckFkYXB0ZXIoKTtcbiAgICAgIGNhc2UgdHlwZXMuR09PR0xFOlxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLkdvb2dsZUFkYXB0ZXIoKTtcbiAgICAgIGNhc2UgdHlwZXMuR09PR0xFX0NBTEVOREFSOlxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLkdvb2dsZUNhbGVuZGFyQWRhcHRlcigpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHR5cGUnKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceMappingURL=adapterFactory.js.map
