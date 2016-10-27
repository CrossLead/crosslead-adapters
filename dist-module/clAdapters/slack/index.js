import _Object$getOwnPropertyDescriptor from 'babel-runtime/core-js/object/get-own-property-descriptor';
import _Promise from 'babel-runtime/core-js/promise';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _dec, _desc, _value, _class, _class2, _temp;

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

import Adapter from '../base/Adapter';
import request from 'request';
import rateLimit from '../../utils/rate-limit';

var SlackAdapter = (_dec = rateLimit(1000), (_class = (_temp = _class2 = function (_Adapter) {
  _inherits(SlackAdapter, _Adapter);

  function SlackAdapter() {
    _classCallCheck(this, SlackAdapter);

    return _possibleConstructorReturn(this, (SlackAdapter.__proto__ || _Object$getPrototypeOf(SlackAdapter)).apply(this, arguments));
  }

  _createClass(SlackAdapter, [{
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

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var paramString = '';
      for (var p in params) {
        paramString += p + '=' + params[p] + '&';
      }

      return new _Promise(function (resolve, reject) {
        request.get(_this2.baseApiUrl + '/' + method + '?' + paramString, function (err, resp, body) {
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
}(Adapter), _class2.baseApiUrl = 'https://slack.com/api', _temp), (_applyDecoratedDescriptor(_class, 'callSlackApiMethod', [_dec], _Object$getOwnPropertyDescriptor(_class, 'callSlackApiMethod'), _class)), _class));
export { SlackAdapter as default };
//# sourceMappingURL=../../clAdapters/slack/index.js.map