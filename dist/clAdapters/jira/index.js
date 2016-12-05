'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

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

var _dec, _desc, _value, _class;

var _Adapter2 = require('../base/Adapter');

var _Adapter3 = _interopRequireDefault(_Adapter2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _rateLimit = require('../../utils/rate-limit');

var _rateLimit2 = _interopRequireDefault(_rateLimit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var JiraAdapter = (_dec = (0, _rateLimit2.default)(200), (_class = function (_Adapter) {
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

    /**
     * Rate limit api requests to once per second
     */

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
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(params) {
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
    value: function getEpicsForProject(projectId, startDate, endDate) {
      var formattedStartDate = (0, _moment2.default)(startDate).format('YYYY/MM/DD HH:mm'),
          formattedEndDate = (0, _moment2.default)(endDate).format('YYYY/MM/DD HH:mm');

      return this.getAllIssues({
        jql: 'project = ' + projectId + ' AND issuetype = Epic AND\n      updatedDate >= "' + formattedStartDate + '" AND updatedDate <= "' + formattedEndDate + '"'
      });
    }
  }, {
    key: 'getIssuesForEpic',
    value: function getIssuesForEpic(epicId, issueTypes, startDate, endDate) {
      var formattedStartDate = (0, _moment2.default)(startDate).format('YYYY/MM/DD HH:mm'),
          formattedEndDate = (0, _moment2.default)(endDate).format('YYYY/MM/DD HH:mm');

      return this.getAllIssues({
        jql: '("Epic Link" = ' + epicId + ' OR parent IN tempoEpicIssues(' + epicId + ')) AND\n        issuetype IN (' + issueTypes.join(',') + ') AND\n        updatedDate >= "' + formattedStartDate + '" AND updatedDate <= "' + formattedEndDate + '"'
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
}(_Adapter3.default), (_applyDecoratedDescriptor(_class.prototype, 'makeRequest', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'makeRequest'), _class.prototype)), _class));
exports.default = JiraAdapter;
//# sourceMappingURL=../../clAdapters/jira/index.js.map