import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _this2 = this;

import Adapter from '../base/Adapter';
import url from 'url';
import request from 'request';

var JiraAdapter = function (_Adapter) {
  _inherits(JiraAdapter, _Adapter);

  function JiraAdapter() {
    _classCallCheck(this, JiraAdapter);

    return _possibleConstructorReturn(this, (JiraAdapter.__proto__ || _Object$getPrototypeOf(JiraAdapter)).apply(this, arguments));
  }

  return JiraAdapter;
}(Adapter);

export default JiraAdapter;


JiraAdapter.prototype.makeRequest = function () {
  var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(path) {
    var uri, options;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _this2.protocol = 'https';
            _this2.hostname = 'crosslead.atlassian.net';
            _this2.apiVersion = 2;
            _this2.port = null;
            _this2.username = 'michelle.shu@crosslead.com';
            _this2.password = 'gmaSAtN*CL13';

            uri = url.format({
              protocol: _this2.protocol,
              hostname: _this2.hostname,
              port: _this2.port,
              pathname: 'rest/api/' + _this2.apiVersion + path
            });
            options = {
              rejectUnauthorized: true,
              uri: uri,
              method: 'GET',
              auth: {
                user: _this2.username,
                pass: _this2.password
              }
            };
            return _context.abrupt('return', request(options));

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this2);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

JiraAdapter.prototype.getIssueHierarchy = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
  var result;
  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return _this2.makeRequest('issue/createmeta');

        case 2:
          result = _context2.sent;

          console.log(result);
          return _context2.abrupt('return', result);

        case 5:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, _this2);
}));
//# sourceMappingURL=../../clAdapters/jira/index.js.map