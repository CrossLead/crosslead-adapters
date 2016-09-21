'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Configuration2 = require('../../base/Configuration');

var _Configuration3 = _interopRequireDefault(_Configuration2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Office365BaseConfiguration = function (_Configuration) {
  (0, _inherits3.default)(Office365BaseConfiguration, _Configuration);

  function Office365BaseConfiguration() {
    var _ref;

    (0, _classCallCheck3.default)(this, Office365BaseConfiguration);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = Office365BaseConfiguration.__proto__ || (0, _getPrototypeOf2.default)(Office365BaseConfiguration)).call.apply(_ref, [this].concat(args)));

    (0, _assign2.default)(_this.options, { apiVersion: '1.0' });
    return _this;
  }

  return Office365BaseConfiguration;
}(_Configuration3.default);

exports.default = Office365BaseConfiguration;
;
//# sourceMappingURL=../../../clAdapters/office365/base/Configuration.js.map