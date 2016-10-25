import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Promise from 'babel-runtime/core-js/promise';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import Adapter from '../base/Adapter';
import moment from 'moment';
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
    key: 'getAllIssues',
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(params) {
        var requestParams, resultCount, issues, result, data;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                requestParams = params || {};

                requestParams.startAt = 0;
                requestParams.maxResults = 50;

                resultCount = void 0, issues = [];

              case 4:
                _context.next = 6;
                return this.makeRequest('search', requestParams);

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

      function getAllIssues(_x) {
        return _ref.apply(this, arguments);
      }

      return getAllIssues;
    }()
  }, {
    key: 'runConnectionTest',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
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
      var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3() {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
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
      var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(projectId) {
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getAllIssues({
                  jql: 'project = ' + projectId + ' AND issuetype = Epic AND resolution = Unresolved'
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

      function getUnresolvedEpicsForProject(_x2) {
        return _ref4.apply(this, arguments);
      }

      return getUnresolvedEpicsForProject;
    }()
  }, {
    key: 'getEpicsForProject',
    value: function () {
      var _ref5 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(projectId, startDate, endDate) {
        var formattedStartDate, formattedEndDate;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                formattedStartDate = moment(startDate).format('YYYY/MM/DD HH:mm'), formattedEndDate = moment(endDate).format('YYYY/MM/DD HH:mm');
                _context5.next = 3;
                return this.getAllIssues({
                  jql: 'project = ' + projectId + ' AND issuetype = Epic AND\n      updatedDate >= "' + formattedStartDate + '" AND updatedDate <= "' + formattedEndDate + '"'
                });

              case 3:
                return _context5.abrupt('return', _context5.sent);

              case 4:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getEpicsForProject(_x3, _x4, _x5) {
        return _ref5.apply(this, arguments);
      }

      return getEpicsForProject;
    }()
  }, {
    key: 'getIssuesForEpic',
    value: function () {
      var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6(epicId, issueTypes, startDate, endDate) {
        var formattedStartDate, formattedEndDate;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                formattedStartDate = moment(startDate).format('YYYY/MM/DD HH:mm'), formattedEndDate = moment(endDate).format('YYYY/MM/DD HH:mm');
                _context6.next = 3;
                return this.getAllIssues({
                  jql: '("Epic Link" = ' + epicId + ' OR parent IN tempoEpicIssues(' + epicId + ')) AND\n        issuetype IN (' + issueTypes.join(',') + ') AND\n        updatedDate >= "' + formattedStartDate + '" AND updatedDate <= "' + formattedEndDate + '"'
                });

              case 3:
                return _context6.abrupt('return', _context6.sent);

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getIssuesForEpic(_x6, _x7, _x8, _x9) {
        return _ref6.apply(this, arguments);
      }

      return getIssuesForEpic;
    }()
  }]);

  return JiraAdapter;
}(Adapter);

export default JiraAdapter;
//# sourceMappingURL=../../clAdapters/jira/index.js.map