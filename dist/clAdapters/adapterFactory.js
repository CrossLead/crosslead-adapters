'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _adapterTypes = require('./adapterTypes');

var _adapterTypes2 = _interopRequireDefault(_adapterTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
var AdapterFactory = function () {
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
        case _adapterTypes2.default.CUSTOM:
          throw new Error('Custom adapters provide their own approach');
        case _adapterTypes2.default.NETSUITE:
          return new _2.default.NetSuiteAdapter();
        case _adapterTypes2.default.CL_MOCK:
          return new _2.default.CLMockAdapter();
        case _adapterTypes2.default.OFFICE365:
          return new _2.default.Office365MailAdapter();
        case _adapterTypes2.default.OFFICE365_CALENDAR:
          return new _2.default.Office365CalendarAdapter();
        case _adapterTypes2.default.GOOGLE:
          return new _2.default.GoogleAdapter();
        case _adapterTypes2.default.GOOGLE_CALENDAR:
          return new _2.default.GoogleCalendarAdapter();
        default:
          throw new Error('Unknown type');
      }
    }
  }]);

  return AdapterFactory;
}();

exports.default = AdapterFactory;
//# sourceMappingURL=../clAdapters/adapterFactory.js.map