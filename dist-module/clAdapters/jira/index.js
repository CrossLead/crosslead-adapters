import _Object$getOwnPropertyDescriptor from 'babel-runtime/core-js/object/get-own-property-descriptor';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Promise from 'babel-runtime/core-js/promise';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _dec, _desc, _value, _class;

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
import moment from 'moment';
import url from 'url';
import request from 'request';
import rateLimit from '../../utils/rate-limit';

var JiraAdapter = (_dec = rateLimit(200), (_class = function (_Adapter) {
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

    /**
     * Rate limit api requests to once per second
     */

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
    value: function runConnectionTest() {
      return this.makeRequest('myself');
    }
  }, {
    key: 'getIssueHierarchy',
    value: function getIssueHierarchy() {
      return this.makeRequest('issue/createmeta');
    }
  }, {
    key: 'getUnresolvedEpicsForProject',
    value: function getUnresolvedEpicsForProject(projectId) {
      return this.getAllIssues({
        jql: 'project = ' + projectId + ' AND issuetype = Epic AND resolution = Unresolved'
      });
    }
  }, {
    key: 'getEpicsForProject',
    value: function getEpicsForProject(projectId, formattedStartDate, formattedEndDate) {
      return this.getAllIssues({
        jql: 'project = ' + projectId + ' AND issuetype = Epic AND\n      updatedDate >= "' + formattedStartDate + '" AND updatedDate <= "' + formattedEndDate + '"'
      });
    }
  }, {
    key: 'getIssuesForEpic',
    value: function getIssuesForEpic(epicId, issueTypes, formattedStartDate, formattedEndDate) {
      return this.getAllIssues({
        jql: '"Epic Link" = ' + epicId + ' AND\n        issuetype IN (' + issueTypes.join(',') + ') AND\n        updatedDate >= "' + formattedStartDate + '" AND updatedDate <= "' + formattedEndDate + '"'
      });
    }
  }, {
    key: 'getIssue',
    value: function getIssue(issueId) {
      return this.makeRequest('issue/' + issueId);
    }
  }, {
    key: 'getComments',
    value: function getComments(issueId) {
      return this.makeRequest('issue/' + issueId + '/comment');
    }
  }, {
    key: 'getUser',
    value: function getUser(username) {
      return this.makeRequest('user', { username: username });
    }
  }]);

  return JiraAdapter;
}(Adapter), (_applyDecoratedDescriptor(_class.prototype, 'makeRequest', [_dec], _Object$getOwnPropertyDescriptor(_class.prototype, 'makeRequest'), _class.prototype)), _class));
export { JiraAdapter as default };
//# sourceMappingURL=../../clAdapters/jira/index.js.map