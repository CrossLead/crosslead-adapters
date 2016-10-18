import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Promise from 'babel-runtime/core-js/promise';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
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

    _this.apiVersion = 2;
    return _this;
  }

  _createClass(JiraAdapter, [{
    key: 'init',
    value: function init() {}
  }, {
    key: 'makeRequest',
    value: function makeRequest(path, query) {
      var uri = url.format({
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

      return new _Promise(function (resolve) {
        request(options, function (error, response, body) {
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
    key: 'runConnectionTest',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.makeRequest('myself');

              case 2:
                return _context.abrupt('return', _context.sent);

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function runConnectionTest() {
        return _ref.apply(this, arguments);
      }

      return runConnectionTest;
    }()
  }, {
    key: 'getIssueHierarchy',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.makeRequest('issue/createmeta');

              case 2:
                return _context2.abrupt('return', _context2.sent);

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getIssueHierarchy() {
        return _ref2.apply(this, arguments);
      }

      return getIssueHierarchy;
    }()
  }, {
    key: 'getUnresolvedEpicsForProject',
    value: function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(projectId, startAt, maxResults) {
        var jql;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                jql = 'project=' + projectId + ' AND issuetype=Epic AND resolution=Unresolved';
                _context3.next = 3;
                return this.makeRequest('search', {
                  jql: jql,
                  startAt: startAt || 0,
                  maxResults: maxResults || 50
                });

              case 3:
                return _context3.abrupt('return', _context3.sent);

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getUnresolvedEpicsForProject(_x, _x2, _x3) {
        return _ref3.apply(this, arguments);
      }

      return getUnresolvedEpicsForProject;
    }()
  }]);

  return JiraAdapter;
}(Adapter);

export default JiraAdapter;
//# sourceMappingURL=../../clAdapters/jira/index.js.map