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

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

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

    _this.apiVersion = 2;
    return _this;
  }

  (0, _createClass3.default)(JiraAdapter, [{
    key: 'init',
    value: function init() {}
  }, {
    key: 'makeRequest',
    value: function makeRequest(path, query) {
      var uri = _url2.default.format({
        protocol: this.credentials.protocol || 'https',
        hostname: this.credentials.host,
        port: this.credentials.port,
        pathname: 'rest/api/' + this.apiVersion + '/' + path
      });

      var authorizationString = new Buffer(this.credentials.username + ':' + this.credentials.password).toString('base64');

      var options = {
        uri: uri,
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + authorizationString
        }
      };

      if (query) {
        options.qs = query;
      }

      return new _promise2.default(function (resolve) {
        (0, _request2.default)(options, function (error, response, body) {
          var errorMessage = null;
          var success = response && response.statusCode < 400;

          if (error) {
            success = false;
            if (error.code === 'ECONNREFUSED') {
              errorMessage = 'Failed to connect to JIRA adapter.';
            }
          }

          if (response && response.statusCode === 401) {
            success = false;
            errorMessage = 'Failed to authorize JIRA adapter.';
          }

          resolve({
            code: success ? 200 : 500,
            message: errorMessage || error,
            data: body,
            success: success
          });
        });
      });
    }
  }, {
    key: 'getAllIssues',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(requestPath, params) {
        var requestParams, resultCount, issues, result, data;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                requestParams = params || {};

                requestParams.startAt = 0;
                requestParams.maxResults = 50;

                resultCount = void 0, issues = [];

              case 4:
                _context.next = 6;
                return this.makeRequest(requestPath, requestParams);

              case 6:
                result = _context.sent;
                data = JSON.parse(result.data);


                if (data.issues && data.issues.length) {
                  resultCount = data.issues.length;
                  issues = issues.concat(data.issues);
                  requestParams.startAt += resultCount;
                } else {
                  resultCount = 0;
                }

              case 9:
                if (resultCount && resultCount === requestParams.maxResults) {
                  _context.next = 4;
                  break;
                }

              case 10:
                return _context.abrupt('return', issues);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAllIssues(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return getAllIssues;
    }()
  }, {
    key: 'runConnectionTest',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.makeRequest('myself');

              case 2:
                return _context2.abrupt('return', _context2.sent);

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function runConnectionTest() {
        return _ref2.apply(this, arguments);
      }

      return runConnectionTest;
    }()
  }, {
    key: 'getIssueHierarchy',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.makeRequest('issue/createmeta');

              case 2:
                return _context3.abrupt('return', _context3.sent);

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getIssueHierarchy() {
        return _ref3.apply(this, arguments);
      }

      return getIssueHierarchy;
    }()
  }, {
    key: 'getUnresolvedEpicsForProject',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(projectId) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getAllIssues('search', {
                  jql: 'project=' + projectId + ' AND issuetype=Epic AND resolution=Unresolved'
                });

              case 2:
                return _context4.abrupt('return', _context4.sent);

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getUnresolvedEpicsForProject(_x3) {
        return _ref4.apply(this, arguments);
      }

      return getUnresolvedEpicsForProject;
    }()
  }]);
  return JiraAdapter;
}(_Adapter3.default);

exports.default = JiraAdapter;
//# sourceMappingURL=../../clAdapters/jira/index.js.map