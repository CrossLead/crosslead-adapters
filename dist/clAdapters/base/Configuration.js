'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Configuration = function Configuration(credentials, options) {
  (0, _classCallCheck3.default)(this, Configuration);

  this.credentials = credentials || {};
  this.options = (0, _extends3.default)({
    apiVersion: '1'
  }, options);
};

exports.default = Configuration;
//# sourceMappingURL=../../clAdapters/base/Configuration.js.map