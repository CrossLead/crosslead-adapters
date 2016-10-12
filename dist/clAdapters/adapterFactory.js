'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _adapterTypes = require('./adapterTypes');

var _adapterTypes2 = _interopRequireDefault(_adapterTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
var AdapterFactory = function () {
  function AdapterFactory() {
    (0, _classCallCheck3.default)(this, AdapterFactory);
  }

  (0, _createClass3.default)(AdapterFactory, null, [{
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
        case _adapterTypes2.default.JIRA_ADAPTER:
          return new _2.default.JiraAdapter();
        default:
          throw new Error('Unknown type');
      }
    }
  }]);
  return AdapterFactory;
}();

exports.default = AdapterFactory;
//# sourceMappingURL=../clAdapters/adapterFactory.js.map