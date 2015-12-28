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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGFkYXB0ZXJGYWN0b3J5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztnQkFBcUIsSUFBSTs7Ozs0QkFDSixnQkFBZ0I7Ozs7Ozs7Ozs7O0lBUWhCLGNBQWM7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OztlQUFkLGNBQWM7Ozs7Ozs7O1dBT2IsdUJBQUMsSUFBSSxFQUFFO0FBQ3pCLGNBQVEsSUFBSTtBQUNWLGFBQUssMEJBQU0sTUFBTTtBQUNmLGdCQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7QUFBQSxBQUNoRSxhQUFLLDBCQUFNLFFBQVE7QUFDakIsaUJBQU8sSUFBSSxjQUFTLGVBQWUsRUFBRSxDQUFDO0FBQUEsQUFDeEMsYUFBSywwQkFBTSxPQUFPO0FBQ2hCLGlCQUFPLElBQUksY0FBUyxhQUFhLEVBQUUsQ0FBQztBQUFBLEFBQ3RDLGFBQUssMEJBQU0sU0FBUztBQUNsQixpQkFBTyxJQUFJLGNBQVMsb0JBQW9CLEVBQUUsQ0FBQztBQUFBLEFBQzdDLGFBQUssMEJBQU0sa0JBQWtCO0FBQzNCLGlCQUFPLElBQUksY0FBUyx3QkFBd0IsRUFBRSxDQUFDO0FBQUEsQUFDakQsYUFBSywwQkFBTSxNQUFNO0FBQ2YsaUJBQU8sSUFBSSxjQUFTLGFBQWEsRUFBRSxDQUFDO0FBQUEsQUFDdEMsYUFBSywwQkFBTSxlQUFlO0FBQ3hCLGlCQUFPLElBQUksY0FBUyxxQkFBcUIsRUFBRSxDQUFDO0FBQUEsQUFDOUM7QUFDRSxnQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUFBLE9BQ25DO0tBQ0Y7OztTQTFCa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiY2xBZGFwdGVyc1xcYWRhcHRlckZhY3RvcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYWRhcHRlcnMgZnJvbSAnLi8nO1xuaW1wb3J0IHR5cGVzICAgIGZyb20gJy4vYWRhcHRlclR5cGVzJztcblxuLyoqXG4gKiBBZGFwdGVyIGZhY3RvcnlcbiAqXG4gKiBAY2xhc3NcbiAqIEByZXR1cm4ge0FkYXB0ZXJGYWN0b3J5fVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGFwdGVyRmFjdG9yeSB7XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBmYWN0b3J5XG4gICAqIEBwYXJhbSAge0FkYXB0ZXJUeXBlfSB0eXBlXG4gICAqIEByZXR1cm4ge0Jhc2VBZGFwdGVyfSBjb25jcmV0ZSBhZGFwdGVyIHN1YmNsYXNzXG4gICAqL1xuICBzdGF0aWMgY3JlYXRlQWRhcHRlcih0eXBlKSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIHR5cGVzLkNVU1RPTTpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXN0b20gYWRhcHRlcnMgcHJvdmlkZSB0aGVpciBvd24gYXBwcm9hY2gnKTtcbiAgICAgIGNhc2UgdHlwZXMuTkVUU1VJVEU6XG4gICAgICAgIHJldHVybiBuZXcgYWRhcHRlcnMuTmV0U3VpdGVBZGFwdGVyKCk7XG4gICAgICBjYXNlIHR5cGVzLkNMX01PQ0s6XG4gICAgICAgIHJldHVybiBuZXcgYWRhcHRlcnMuQ0xNb2NrQWRhcHRlcigpO1xuICAgICAgY2FzZSB0eXBlcy5PRkZJQ0UzNjU6XG4gICAgICAgIHJldHVybiBuZXcgYWRhcHRlcnMuT2ZmaWNlMzY1TWFpbEFkYXB0ZXIoKTtcbiAgICAgIGNhc2UgdHlwZXMuT0ZGSUNFMzY1X0NBTEVOREFSOlxuICAgICAgICByZXR1cm4gbmV3IGFkYXB0ZXJzLk9mZmljZTM2NUNhbGVuZGFyQWRhcHRlcigpO1xuICAgICAgY2FzZSB0eXBlcy5HT09HTEU6XG4gICAgICAgIHJldHVybiBuZXcgYWRhcHRlcnMuR29vZ2xlQWRhcHRlcigpO1xuICAgICAgY2FzZSB0eXBlcy5HT09HTEVfQ0FMRU5EQVI6XG4gICAgICAgIHJldHVybiBuZXcgYWRhcHRlcnMuR29vZ2xlQ2FsZW5kYXJBZGFwdGVyKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdHlwZScpO1xuICAgIH1cbiAgfVxufVxuIl19
//# sourceMappingURL=adapterFactory.js.map
