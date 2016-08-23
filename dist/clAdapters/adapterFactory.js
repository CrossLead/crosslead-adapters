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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGFkYXB0ZXJGYWN0b3J5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztnQkFBcUIsSUFBSTs7Ozs0QkFDSixnQkFBZ0I7Ozs7Ozs7Ozs7O0lBUWhCLGNBQWM7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OztlQUFkLGNBQWM7Ozs7Ozs7O1dBT2IsdUJBQUMsSUFBSSxFQUFFO0FBQ3pCLGNBQVEsSUFBSTtBQUNWLGFBQUssMEJBQU0sTUFBTTtBQUNmLGdCQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7QUFBQSxBQUNoRSxhQUFLLDBCQUFNLFFBQVE7QUFDakIsaUJBQU8sSUFBSSxjQUFTLGVBQWUsRUFBRSxDQUFDO0FBQUEsQUFDeEMsYUFBSywwQkFBTSxPQUFPO0FBQ2hCLGlCQUFPLElBQUksY0FBUyxhQUFhLEVBQUUsQ0FBQztBQUFBLEFBQ3RDLGFBQUssMEJBQU0sU0FBUztBQUNsQixpQkFBTyxJQUFJLGNBQVMsb0JBQW9CLEVBQUUsQ0FBQztBQUFBLEFBQzdDLGFBQUssMEJBQU0sa0JBQWtCO0FBQzNCLGlCQUFPLElBQUksY0FBUyx3QkFBd0IsRUFBRSxDQUFDO0FBQUEsQUFDakQsYUFBSywwQkFBTSxNQUFNO0FBQ2YsaUJBQU8sSUFBSSxjQUFTLGFBQWEsRUFBRSxDQUFDO0FBQUEsQUFDdEMsYUFBSywwQkFBTSxlQUFlO0FBQ3hCLGlCQUFPLElBQUksY0FBUyxxQkFBcUIsRUFBRSxDQUFDO0FBQUEsQUFDOUM7QUFDRSxnQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUFBLE9BQ25DO0tBQ0Y7OztTQTFCa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiY2xBZGFwdGVyc1xcYWRhcHRlckZhY3RvcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYWRhcHRlcnMgZnJvbSAnLi8nO1xyXG5pbXBvcnQgdHlwZXMgICAgZnJvbSAnLi9hZGFwdGVyVHlwZXMnO1xyXG5cclxuLyoqXHJcbiAqIEFkYXB0ZXIgZmFjdG9yeVxyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQHJldHVybiB7QWRhcHRlckZhY3Rvcnl9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGFwdGVyRmFjdG9yeSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXRpYyBmYWN0b3J5XHJcbiAgICogQHBhcmFtICB7QWRhcHRlclR5cGV9IHR5cGVcclxuICAgKiBAcmV0dXJuIHtCYXNlQWRhcHRlcn0gY29uY3JldGUgYWRhcHRlciBzdWJjbGFzc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVBZGFwdGVyKHR5cGUpIHtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICBjYXNlIHR5cGVzLkNVU1RPTTpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSBhZGFwdGVycyBwcm92aWRlIHRoZWlyIG93biBhcHByb2FjaCcpO1xyXG4gICAgICBjYXNlIHR5cGVzLk5FVFNVSVRFOlxyXG4gICAgICAgIHJldHVybiBuZXcgYWRhcHRlcnMuTmV0U3VpdGVBZGFwdGVyKCk7XHJcbiAgICAgIGNhc2UgdHlwZXMuQ0xfTU9DSzpcclxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLkNMTW9ja0FkYXB0ZXIoKTtcclxuICAgICAgY2FzZSB0eXBlcy5PRkZJQ0UzNjU6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5PZmZpY2UzNjVNYWlsQWRhcHRlcigpO1xyXG4gICAgICBjYXNlIHR5cGVzLk9GRklDRTM2NV9DQUxFTkRBUjpcclxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLk9mZmljZTM2NUNhbGVuZGFyQWRhcHRlcigpO1xyXG4gICAgICBjYXNlIHR5cGVzLkdPT0dMRTpcclxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLkdvb2dsZUFkYXB0ZXIoKTtcclxuICAgICAgY2FzZSB0eXBlcy5HT09HTEVfQ0FMRU5EQVI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBhZGFwdGVycy5Hb29nbGVDYWxlbmRhckFkYXB0ZXIoKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdHlwZScpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=
//# sourceMappingURL=adapterFactory.js.map
