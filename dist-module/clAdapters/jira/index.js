import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Promise from 'babel-runtime/core-js/promise';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import Adapter from '../base/Adapter';
import url from 'url';
import request from 'request';

var JiraAdapter = function (_Adapter) {
  _inherits(JiraAdapter, _Adapter);

  function JiraAdapter() {
    _classCallCheck(this, JiraAdapter);

    var _this = _possibleConstructorReturn(this, (JiraAdapter.__proto__ || _Object$getPrototypeOf(JiraAdapter)).call(this));

    _this.protocol = 'https';
    _this.apiVersion = 2;
    _this.port = null;
    return _this;
  }

  return JiraAdapter;
}(Adapter);

export default JiraAdapter;


JiraAdapter.prototype.makeRequest = function (path) {
  var uri = url.format({
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

  return new _Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
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

JiraAdapter.prototype.getIssueHierarchy = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
  return _regeneratorRuntime.wrap(function _callee$(_context) {
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

JiraAdapter.prototype.runConnectionTest = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
  var testResult;
  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
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