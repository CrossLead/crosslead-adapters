'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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
    return (0, _possibleConstructorReturn3.default)(this, (JiraAdapter.__proto__ || (0, _getPrototypeOf2.default)(JiraAdapter)).apply(this, arguments));
  }

  return JiraAdapter;
}(_Adapter3.default);

exports.default = JiraAdapter;


JiraAdapter.prototype.makeRequest = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(path) {
    var uri, options;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            undefined.protocol = 'https';
            undefined.hostname = 'crosslead.atlassian.net';
            undefined.apiVersion = 2;
            undefined.port = null;
            undefined.username = 'michelle.shu@crosslead.com';
            undefined.password = 'gmaSAtN*CL13';

            uri = _url2.default.format({
              protocol: undefined.protocol,
              hostname: undefined.hostname,
              port: undefined.port,
              pathname: 'rest/api/' + undefined.apiVersion + path
            });
            options = {
              rejectUnauthorized: true,
              uri: uri,
              method: 'GET',
              auth: {
                user: undefined.username,
                pass: undefined.password
              }
            };
            return _context.abrupt('return', (0, _request2.default)(options));

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

JiraAdapter.prototype.getIssueHierarchy = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
  var result;
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return undefined.makeRequest('issue/createmeta');

        case 2:
          result = _context2.sent;

          console.log(result);
          return _context2.abrupt('return', result);

        case 5:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, undefined);
}));
//# sourceMappingURL=../../clAdapters/jira/index.js.map