'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _dec, _desc, _value, _class, _class2, _temp;

var _Adapter2 = require('../base/Adapter');

var _Adapter3 = _interopRequireDefault(_Adapter2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _rateLimit = require('../../utils/rate-limit');

var _rateLimit2 = _interopRequireDefault(_rateLimit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var SlackAdapter = (_dec = (0, _rateLimit2.default)(1000), (_class = (_temp = _class2 = function (_Adapter) {
  (0, _inherits3.default)(SlackAdapter, _Adapter);

  function SlackAdapter() {
    (0, _classCallCheck3.default)(this, SlackAdapter);
    return (0, _possibleConstructorReturn3.default)(this, (SlackAdapter.__proto__ || (0, _getPrototypeOf2.default)(SlackAdapter)).apply(this, arguments));
  }

  (0, _createClass3.default)(SlackAdapter, [{
    key: 'init',


    // null init function...
    value: function init() {}
  }], [{
    key: 'callSlackApiMethod',


    /**
     * Rate limit (at prototype level) slack api calls to once per second.
     */
    value: function callSlackApiMethod(method) {
      var _this2 = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var paramString = '';
      for (var p in params) {
        paramString += p + '=' + params[p] + '&';
      }

      return new _promise2.default(function (resolve, reject) {
        _request2.default.get(_this2.baseApiUrl + '/' + method + '?' + paramString, function (err, resp, body) {
          if (!err && resp.statusCode === 200) {
            resolve(JSON.parse(body));
          } else {
            reject(err);
          }
        });
      });
    }
  }]);
  return SlackAdapter;
}(_Adapter3.default), _class2.baseApiUrl = 'https://slack.com/api', _temp), (_applyDecoratedDescriptor(_class, 'callSlackApiMethod', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class, 'callSlackApiMethod'), _class)), _class));
exports.default = SlackAdapter;
//# sourceMappingURL=../../clAdapters/slack/index.js.map