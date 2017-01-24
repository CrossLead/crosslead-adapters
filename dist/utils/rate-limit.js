'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

exports.default = rateLimit;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Limit calls of this function to at most 1/rate,
 * where rate is in milliseconds. Instead of grouping (like _.debounce)
 * calls are added to a queue and executed serially.
 *
 * @param fn ?: function to rate limit
 * @param rate : milliseconds to wait between invocations
 * @param count : maximum concurrent calls between wait periods
 */
function rateLimit(fn) {
  var _arguments = arguments;
  var rate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
  var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;


  // if first arg is not number,
  // assume decorator syntax, return curried decorator
  if (typeof fn !== 'function') {
    var _ret = function () {
      var args = (0, _from2.default)(_arguments);
      return {
        v: function v(proto, prop) {
          var baseFn = proto[prop];
          if (typeof baseFn !== 'function') {
            throw new TypeError('Cannot wrap property ' + prop + ', must be function');
          }
          proto[prop] = rateLimit.apply(undefined, [baseFn].concat((0, _toConsumableArray3.default)(args)));
        }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
  }

  var queue = [];
  var working = 0;

  /**
   * Continue dequeing jobs at rate limited pace
   */
  function recurse() {
    return new _promise2.default(function (res) {
      return setTimeout(res, rate);
    }).then(function () {
      working--;
      dequeue();
    });
  }

  /**
   * Run a job if it exists
   */
  function dequeue() {
    if (queue.length === 0 || working === count) return;
    working++;
    recurse();

    var _queue$shift = queue.shift(),
        _queue$shift2 = (0, _slicedToArray3.default)(_queue$shift, 4),
        context = _queue$shift2[0],
        args = _queue$shift2[1],
        resolve = _queue$shift2[2],
        reject = _queue$shift2[3];

    try {
      resolve(fn.apply(context, args));
    } catch (err) {
      reject(err);
    }
  }

  /**
   * Returned wrapped function, keeping correct context
   */
  return function () {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new _promise2.default(function (resolve, reject) {
      try {
        queue.push([_this, args, resolve, reject]);
        if (working < count) dequeue();
      } catch (err) {
        reject(err);
      }
    });
  };
}
//# sourceMappingURL=../utils/rate-limit.js.map