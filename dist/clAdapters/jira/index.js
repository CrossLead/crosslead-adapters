'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Adapter2 = require('../base/Adapter');

var _Adapter3 = _interopRequireDefault(_Adapter2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JiraAdapter = function (_Adapter) {
  (0, _inherits3.default)(JiraAdapter, _Adapter);

  function JiraAdapter() {
    (0, _classCallCheck3.default)(this, JiraAdapter);

    var _this = (0, _possibleConstructorReturn3.default)(this, (JiraAdapter.__proto__ || (0, _getPrototypeOf2.default)(JiraAdapter)).call(this));

    _this.protocol = 'https';
    _this.apiVersion = 2;
    _this.port = null;
    return _this;
  }

  return JiraAdapter;
}(_Adapter3.default);

exports.default = JiraAdapter;


JiraAdapter.prototype.makeRequest = function (path) {
  var uri = _url2.default.format({
    protocol: this.protocol,
    hostname: this.credentials.host,
    port: this.port,
    pathname: 'rest/api/' + this.apiVersion + '/' + path
  });

  var authorizationString = new Buffer(this.credentials.email + ':' + this.credentials.password).toString('base64');

  var options = {
    uri: uri,
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + authorizationString
    }
  };

  return new _promise2.default(function (resolve, reject) {
    (0, _request2.default)(options, function (error, response, body) {
      if (error) {
        reject({
          code: response.statusCode,
          message: error,
          data: body,
          success: false
        });
      } else {
        resolve({
          code: response.statusCode,
          data: body,
          success: true
        });
      }
    });
  });
};

JiraAdapter.prototype.getIssueHierarchy = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return this.makeRequest('issue/createmeta');

        case 2:
          return _context.abrupt('return', _context.sent);

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
}));

JiraAdapter.prototype.runConnectionTest = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
  var testResult;
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return this.makeRequest('myself');

        case 2:
          testResult = _context2.sent;

          if (testResult.code === 401) {
            testResult.errorMessage = 'Failed to authorize user.';
            testResult.success = false;
          }
          return _context2.abrupt('return', testResult);

        case 5:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, this);
}));
//# sourceMappingURL=../../clAdapters/jira/index.js.map