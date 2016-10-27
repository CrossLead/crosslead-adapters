'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _ = require('./');

var adapters = _interopRequireWildcard(_);

var _adapterTypes = require('./adapterTypes');

var _adapterTypes2 = _interopRequireDefault(_adapterTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
          return new adapters.NetSuiteAdapter();
        case _adapterTypes2.default.CL_MOCK:
          return new adapters.CLMockAdapter();
        case _adapterTypes2.default.OFFICE365:
          return new adapters.Office365MailAdapter();
        case _adapterTypes2.default.OFFICE365_CALENDAR:
          return new adapters.Office365CalendarAdapter();
        case _adapterTypes2.default.GOOGLE:
          return new adapters.GoogleAdapter();
        case _adapterTypes2.default.GOOGLE_CALENDAR:
          return new adapters.GoogleCalendarAdapter();
        case _adapterTypes2.default.JIRA:
          return new adapters.JiraAdapter();
        case _adapterTypes2.default.SLACK:
          return new adapters.SlackAdapter();
        default:
          throw new Error('Unknown type');
      }
    }
  }]);
  return AdapterFactory;
}();

exports.default = AdapterFactory;
//# sourceMappingURL=../clAdapters/adapterFactory.js.map