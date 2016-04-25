'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _baseAdapter = require('../../base/Adapter');

var _baseAdapter2 = _interopRequireDefault(_baseAdapter);

var _Service = require('./Service');

var _Service2 = _interopRequireDefault(_Service);

var _Configuration = require('./Configuration');

var _Configuration2 = _interopRequireDefault(_Configuration);

/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */

var Office365BaseAdapter = (function (_Adapter) {
  _inherits(Office365BaseAdapter, _Adapter);

  function Office365BaseAdapter() {
    _classCallCheck(this, Office365BaseAdapter);

    _get(Object.getPrototypeOf(Office365BaseAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365BaseAdapter, [{
    key: 'reset',
    value: function reset() {
      delete this._config;
      delete this._service;
      return this;
    }
  }, {
    key: 'init',
    value: function init() {
      return _regeneratorRuntime.async(function init$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this._config = new _Configuration2['default'](this.credentials);
            this._service = new _Service2['default'](this._config);
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this._service.init());

          case 4:
            console.log('Successfully initialized ' + this.constructor.name + ' for email: ' + this.credentials.email);
            return context$2$0.abrupt('return', this);

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'runConnectionTest',
    value: function runConnectionTest(connectionData) {
      var today, filterStartDate, filterEndDate, data;
      return _regeneratorRuntime.async(function runConnectionTest$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this._config = new _Configuration2['default'](connectionData.credentials);

            today = function today() {
              return (0, _moment2['default'])().utc().startOf('day');
            };

            filterStartDate = today().add(-1, 'days').toDate();
            filterEndDate = today().toDate();
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.getBatchData([{
              email: this._config.credentials.email,
              emailAfterMapping: this._config.credentials.email
            }], filterStartDate, filterEndDate, ''));

          case 6:
            data = context$2$0.sent;
            return context$2$0.abrupt('return', data.success && data.results[0] ? data.results[0] : data);

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      var _config, _config$credentials, clientId, tenantId, certificate, certificateThumbprint, apiVersion, tokenRequestUrl, jwtHeader, accessTokenExpires, jwtPayload, encode, encodedJwtHeader, encodedJwtPayload, stringToSign, encodedSignedJwtInfo, tokenRequestFormData, tokenRequestOptions, tokenData, messageData;

      return _regeneratorRuntime.async(function getAccessToken$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(this.accessToken && this.accessTokenExpires > new Date())) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return', this.accessToken);

          case 2:
            _config = this._config;
            _config$credentials = _config.credentials;
            clientId = _config$credentials.clientId;
            tenantId = _config$credentials.tenantId;
            certificate = _config$credentials.certificate;
            certificateThumbprint = _config$credentials.certificateThumbprint;
            apiVersion = _config.options.apiVersion;
            tokenRequestUrl = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token?api-version=' + apiVersion;
            jwtHeader = {
              'alg': 'RS256',
              'x5t': certificateThumbprint
            };
            accessTokenExpires = (new Date().getTime() + 360000) / 1000;

            // grab new access token 10 seconds before expiration
            this.accessTokenExpires = new Date(accessTokenExpires * 1000 - 10000);

            jwtPayload = {
              'aud': tokenRequestUrl,
              'exp': accessTokenExpires,
              'iss': clientId,
              'jti': _nodeUuid2['default'].v4(),
              'nbf': accessTokenExpires - 2 * 3600, // one hour before now
              'sub': clientId
            };
            encode = function encode(header) {
              return new Buffer(JSON.stringify(header)).toString('base64');
            }, encodedJwtHeader = encode(jwtHeader), encodedJwtPayload = encode(jwtPayload), stringToSign = encodedJwtHeader + '.' + encodedJwtPayload, encodedSignedJwtInfo = _crypto2['default'].createSign('RSA-SHA256').update(stringToSign).sign(certificate, 'base64');
            tokenRequestFormData = {
              client_id: clientId,
              client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
              grant_type: 'client_credentials',
              resource: 'https://outlook.office365.com/',
              client_assertion: encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo
            };
            tokenRequestOptions = {
              method: 'POST',
              port: 443,
              uri: tokenRequestUrl,
              formData: tokenRequestFormData
            };
            context$2$0.prev = 17;
            context$2$0.t0 = JSON;
            context$2$0.next = 21;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(tokenRequestOptions));

          case 21:
            context$2$0.t1 = context$2$0.sent;
            tokenData = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (!(tokenData && tokenData.access_token)) {
              context$2$0.next = 27;
              break;
            }

            return context$2$0.abrupt('return', this.accessToken = tokenData.access_token);

          case 27:
            throw new Error('Could not get access token.');

          case 28:
            context$2$0.next = 38;
            break;

          case 30:
            context$2$0.prev = 30;
            context$2$0.t2 = context$2$0['catch'](17);

            if (!(context$2$0.t2.name === 'StatusCodeError')) {
              context$2$0.next = 37;
              break;
            }

            messageData = JSON.parse(context$2$0.t2.message.replace(context$2$0.t2.statusCode + ' - ', '').replace(/\"/g, '"'));
            throw new Error(messageData);

          case 37:
            throw new Error(context$2$0.t2);

          case 38:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[17, 30]]);
    }
  }, {
    key: 'getUserData',
    value: function getUserData(options, userData) {
      var pageToGet = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

      var userProfile, filterStartDate, filterEndDate, additionalFields, $filter, apiType, _options$maxPages, maxPages, _options$recordsPerPage, recordsPerPage, accessToken, apiVersion, skip,
      // extract static property...
      baseFields, params, urlParams, requestOptions, _ref, records, _userData$data;

      return _regeneratorRuntime.async(function getUserData$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            userProfile = options.userProfile;
            filterStartDate = options.filterStartDate;
            filterEndDate = options.filterEndDate;
            additionalFields = options.additionalFields;
            $filter = options.$filter;
            apiType = options.apiType;
            _options$maxPages = options.maxPages;
            maxPages = _options$maxPages === undefined ? 20 : _options$maxPages;
            _options$recordsPerPage = options.recordsPerPage;
            recordsPerPage = _options$recordsPerPage === undefined ? 25 : _options$recordsPerPage;

            // accumulation of data
            userData = userData || { userProfile: userProfile, filterStartDate: filterStartDate, filterEndDate: filterEndDate };

            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(this.getAccessToken());

          case 13:
            accessToken = context$2$0.sent;
            apiVersion = this._config.options.apiVersion;
            skip = (pageToGet - 1) * recordsPerPage + 1;
            baseFields = this.constructor.baseFields;
            params = {
              $filter: $filter,
              $top: recordsPerPage,
              $skip: skip,
              $select: baseFields.join(',') + (additionalFields ? ',' + additionalFields : '')
            };
            urlParams = (0, _lodash2['default'])(params).map(function (value, key) {
              return key + '=' + value;
            }).join('&');
            requestOptions = {
              method: 'GET',
              uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + userProfile.emailAfterMapping + '\')/' + apiType + '?' + urlParams,
              headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json;odata.metadata=none'
              }
            };
            context$2$0.prev = 20;

            userData.success = true;

            context$2$0.t1 = JSON;
            context$2$0.next = 25;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(requestOptions));

          case 25:
            context$2$0.t2 = context$2$0.sent;
            context$2$0.t0 = context$2$0.t1.parse.call(context$2$0.t1, context$2$0.t2);

            if (context$2$0.t0) {
              context$2$0.next = 29;
              break;
            }

            context$2$0.t0 = {};

          case 29:
            _ref = context$2$0.t0;
            records = _ref.value;

            if (records && pageToGet === 1) {
              userData.data = records;
            }

            if (records && pageToGet > 1) {
              (_userData$data = userData.data).push.apply(_userData$data, _toConsumableArray(records));
            }

            // if the returned results are the maximum number of records per page,
            // we are not done yet, so recurse...

            if (!(records.length === recordsPerPage && pageToGet <= maxPages)) {
              context$2$0.next = 37;
              break;
            }

            return context$2$0.abrupt('return', this.getUserData(options, userData, pageToGet + 1));

          case 37:
            return context$2$0.abrupt('return', userData);

          case 38:
            context$2$0.next = 44;
            break;

          case 40:
            context$2$0.prev = 40;
            context$2$0.t3 = context$2$0['catch'](20);

            _Object$assign(userData, {
              success: false,
              errorMessage: context$2$0.t3.name !== 'StatusCodeError' ? JSON.stringify(context$2$0.t3) : JSON.parse(context$2$0.t3.message.replace(context$2$0.t3.statusCode + ' - ', '').replace(/\"/g, '"')).message
            });
            return context$2$0.abrupt('return', true);

          case 44:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[20, 40]]);
    }
  }]);

  return Office365BaseAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365BaseAdapter;
module.exports = exports['default'];

//to see if it really worked, we need to pass in the first result

// expire token in one hour

// parameters to query email with...

// format parameters for url
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2Jhc2UvQWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUF1QyxXQUFXOzs7O3NCQUNYLFFBQVE7Ozs7OEJBQ1IsaUJBQWlCOzs7O3NCQUNqQixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7MkJBQ1Isb0JBQW9COzs7O3VCQUNwQixXQUFXOzs7OzZCQUNYLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBR2xDLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUzs7OztBQUNSLGdCQUFJLENBQUMsT0FBTyxHQUFJLCtCQUErQixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDaEUsZ0JBQUksQ0FBQyxRQUFRLEdBQUcseUJBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7NkNBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFOzs7QUFDMUIsbUJBQU8sQ0FBQyxHQUFHLCtCQUE2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksb0JBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUcsQ0FBQztnREFDL0YsSUFBSTs7Ozs7OztLQUNaOzs7V0FHc0IsMkJBQUMsY0FBYztVQUc5QixLQUFLLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixJQUFJOzs7O0FBTFYsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsK0JBQStCLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFcEUsaUJBQUssR0FBYSxTQUFsQixLQUFLO3FCQUFtQiwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFL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QUM7Z0RBQ0ksSUFBSTs7Ozs7OztLQUdkOzs7U0E5TWtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiY2xBZGFwdGVycy9vZmZpY2UzNjUvYmFzZS9BZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHV1aWQgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ25vZGUtdXVpZCc7XG5pbXBvcnQgY3J5cHRvICAgICAgICAgICAgICAgICAgICAgZnJvbSAnY3J5cHRvJztcbmltcG9ydCByZXF1ZXN0ICAgICAgICAgICAgICAgICAgICBmcm9tICdyZXF1ZXN0LXByb21pc2UnO1xuaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgXyAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbG9kYXNoJztcbmltcG9ydCBBZGFwdGVyICAgICAgICAgICAgICAgICAgICBmcm9tICcuLi8uLi9iYXNlL0FkYXB0ZXInO1xuaW1wb3J0IE9mZmljZTM2NUJhc2VTZXJ2aWNlICAgICAgIGZyb20gJy4vU2VydmljZSc7XG5pbXBvcnQgT2ZmaWNlMzY1QmFzZUNvbmZpZ3VyYXRpb24gZnJvbSAnLi9Db25maWd1cmF0aW9uJztcblxuXG4vKipcbiAqIENvbW1vbiByZXNldCwgcnVuQ29ubmVjdGlvblRlc3QsIGFuZCBnZXRBY2Nlc3NUb2tlbiBtZXRob2RzLi4uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NUJhc2VBZGFwdGVyIGV4dGVuZHMgQWRhcHRlciB7XG5cblxuICByZXNldCgpIHtcbiAgICBkZWxldGUgdGhpcy5fY29uZmlnO1xuICAgIGRlbGV0ZSB0aGlzLl9zZXJ2aWNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXN5bmMgaW5pdCgpIHtcbiAgICB0aGlzLl9jb25maWcgID0gbmV3IE9mZmljZTM2NUJhc2VDb25maWd1cmF0aW9uKHRoaXMuY3JlZGVudGlhbHMpXG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBPZmZpY2UzNjVCYXNlU2VydmljZSh0aGlzLl9jb25maWcpO1xuICAgIGF3YWl0IHRoaXMuX3NlcnZpY2UuaW5pdCgpO1xuICAgIGNvbnNvbGUubG9nKGBTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGZvciBlbWFpbDogJHt0aGlzLmNyZWRlbnRpYWxzLmVtYWlsfWApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICBhc3luYyBydW5Db25uZWN0aW9uVGVzdChjb25uZWN0aW9uRGF0YSkge1xuICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbihjb25uZWN0aW9uRGF0YS5jcmVkZW50aWFscyk7XG5cbiAgICBjb25zdCB0b2RheSAgICAgICAgICAgPSAoKSA9PiBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKSxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGUgPSB0b2RheSgpLmFkZCgtMSwgJ2RheXMnKS50b0RhdGUoKSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlICAgPSB0b2RheSgpLnRvRGF0ZSgpLFxuICAgICAgICAgIGRhdGEgICAgICAgICAgICA9IGF3YWl0IHRoaXMuZ2V0QmF0Y2hEYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWyB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxBZnRlck1hcHBpbmc6IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAvL3RvIHNlZSBpZiBpdCByZWFsbHkgd29ya2VkLCB3ZSBuZWVkIHRvIHBhc3MgaW4gdGhlIGZpcnN0IHJlc3VsdFxuICAgIHJldHVybiBkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5yZXN1bHRzWzBdID8gZGF0YS5yZXN1bHRzWzBdOiBkYXRhO1xuICB9XG5cblxuICBhc3luYyBnZXRBY2Nlc3NUb2tlbigpIHtcblxuICAgIGlmICh0aGlzLmFjY2Vzc1Rva2VuICYmIHRoaXMuYWNjZXNzVG9rZW5FeHBpcmVzID4gbmV3IERhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW47XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgY3JlZGVudGlhbHMgOiB7XG4gICAgICAgIGNsaWVudElkLFxuICAgICAgICB0ZW5hbnRJZCxcbiAgICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAgIGNlcnRpZmljYXRlVGh1bWJwcmludFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnMgOiB7XG4gICAgICAgIGFwaVZlcnNpb25cbiAgICAgIH1cbiAgICB9ID0gdGhpcy5fY29uZmlnO1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0VXJsID0gYGh0dHBzOi8vbG9naW4ubWljcm9zb2Z0b25saW5lLmNvbS8ke3RlbmFudElkfS9vYXV0aDIvdG9rZW4/YXBpLXZlcnNpb249JHthcGlWZXJzaW9ufWA7XG5cbiAgICBjb25zdCBqd3RIZWFkZXIgPSB7XG4gICAgICAnYWxnJzogJ1JTMjU2JyxcbiAgICAgICd4NXQnOiBjZXJ0aWZpY2F0ZVRodW1icHJpbnRcbiAgICB9O1xuXG4gICAgLy8gZXhwaXJlIHRva2VuIGluIG9uZSBob3VyXG4gICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcmVzID0gKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyAzNjAwMDApIC8gMTAwMDtcblxuICAgIC8vIGdyYWIgbmV3IGFjY2VzcyB0b2tlbiAxMCBzZWNvbmRzIGJlZm9yZSBleHBpcmF0aW9uXG4gICAgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPSBuZXcgRGF0ZShhY2Nlc3NUb2tlbkV4cGlyZXMqMTAwMCAtIDEwMDAwKTtcblxuICAgIGNvbnN0IGp3dFBheWxvYWQgPSB7XG4gICAgICAnYXVkJzogdG9rZW5SZXF1ZXN0VXJsLFxuICAgICAgJ2V4cCc6IGFjY2Vzc1Rva2VuRXhwaXJlcyxcbiAgICAgICdpc3MnOiBjbGllbnRJZCxcbiAgICAgICdqdGknOiB1dWlkLnY0KCksXG4gICAgICAnbmJmJzogYWNjZXNzVG9rZW5FeHBpcmVzIC0gMiozNjAwLCAvLyBvbmUgaG91ciBiZWZvcmUgbm93XG4gICAgICAnc3ViJzogY2xpZW50SWRcbiAgICB9O1xuXG4gICAgY29uc3QgZW5jb2RlICAgICAgICAgICAgICAgPSBoZWFkZXIgPT4gbmV3IEJ1ZmZlcihKU09OLnN0cmluZ2lmeShoZWFkZXIpKS50b1N0cmluZygnYmFzZTY0JyksXG4gICAgICAgICAgZW5jb2RlZEp3dEhlYWRlciAgICAgPSBlbmNvZGUoand0SGVhZGVyKSxcbiAgICAgICAgICBlbmNvZGVkSnd0UGF5bG9hZCAgICA9IGVuY29kZShqd3RQYXlsb2FkKSxcbiAgICAgICAgICBzdHJpbmdUb1NpZ24gICAgICAgICA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZCxcbiAgICAgICAgICBlbmNvZGVkU2lnbmVkSnd0SW5mbyA9IGNyeXB0b1xuICAgICAgICAgICAgLmNyZWF0ZVNpZ24oJ1JTQS1TSEEyNTYnKVxuICAgICAgICAgICAgLnVwZGF0ZShzdHJpbmdUb1NpZ24pXG4gICAgICAgICAgICAuc2lnbihjZXJ0aWZpY2F0ZSwgJ2Jhc2U2NCcpO1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0Rm9ybURhdGEgPSB7XG4gICAgICBjbGllbnRfaWQ6IGNsaWVudElkLFxuICAgICAgY2xpZW50X2Fzc2VydGlvbl90eXBlOiAndXJuOmlldGY6cGFyYW1zOm9hdXRoOmNsaWVudC1hc3NlcnRpb24tdHlwZTpqd3QtYmVhcmVyJyxcbiAgICAgIGdyYW50X3R5cGU6ICdjbGllbnRfY3JlZGVudGlhbHMnLFxuICAgICAgcmVzb3VyY2U6ICdodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS8nLFxuICAgICAgY2xpZW50X2Fzc2VydGlvbjogZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkICsgJy4nICsgZW5jb2RlZFNpZ25lZEp3dEluZm9cbiAgICB9O1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgcG9ydDogNDQzLFxuICAgICAgdXJpOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgICBmb3JtRGF0YTogdG9rZW5SZXF1ZXN0Rm9ybURhdGEsXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKGF3YWl0IHJlcXVlc3QodG9rZW5SZXF1ZXN0T3B0aW9ucykpO1xuICAgICAgaWYgKHRva2VuRGF0YSAmJiB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW5EYXRhLmFjY2Vzc190b2tlbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGdldCBhY2Nlc3MgdG9rZW4uJyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAodG9rZW5EYXRhKSB7XG4gICAgICBpZiAodG9rZW5EYXRhLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShcbiAgICAgICAgICB0b2tlbkRhdGFcbiAgICAgICAgICAgIC5tZXNzYWdlXG4gICAgICAgICAgICAucmVwbGFjZSh0b2tlbkRhdGEuc3RhdHVzQ29kZSArICcgLSAnLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFwiL2csICdcIicpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2VEYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0b2tlbkRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgYXN5bmMgZ2V0VXNlckRhdGEob3B0aW9ucywgdXNlckRhdGEsIHBhZ2VUb0dldD0xKSB7XG5cbiAgICBjb25zdCB7XG4gICAgICB1c2VyUHJvZmlsZSxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgJGZpbHRlcixcbiAgICAgIGFwaVR5cGUsXG4gICAgICBtYXhQYWdlcyA9IDIwLFxuICAgICAgcmVjb3Jkc1BlclBhZ2UgPSAyNVxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gYWNjdW11bGF0aW9uIG9mIGRhdGFcbiAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IHsgdXNlclByb2ZpbGUsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSB9O1xuXG4gICAgY29uc3QgYWNjZXNzVG9rZW4gICAgICAgICAgPSBhd2FpdCB0aGlzLmdldEFjY2Vzc1Rva2VuKCksXG4gICAgICAgICAgeyBhcGlWZXJzaW9uIH0gICAgICAgPSB0aGlzLl9jb25maWcub3B0aW9ucyxcbiAgICAgICAgICBza2lwICAgICAgICAgICAgICAgICA9ICgocGFnZVRvR2V0IC0xKSAqIHJlY29yZHNQZXJQYWdlKSArIDEsXG4gICAgICAgICAgLy8gZXh0cmFjdCBzdGF0aWMgcHJvcGVydHkuLi5cbiAgICAgICAgICB7IGJhc2VGaWVsZHMgfSAgICAgICA9IHRoaXMuY29uc3RydWN0b3IsXG4gICAgICAgICAgLy8gcGFyYW1ldGVycyB0byBxdWVyeSBlbWFpbCB3aXRoLi4uXG4gICAgICAgICAgcGFyYW1zICAgICAgICAgICAgICAgPSB7XG4gICAgICAgICAgICAkZmlsdGVyLFxuICAgICAgICAgICAgJHRvcDogICAgIHJlY29yZHNQZXJQYWdlLFxuICAgICAgICAgICAgJHNraXA6ICAgIHNraXAsXG4gICAgICAgICAgICAkc2VsZWN0OiAgYmFzZUZpZWxkcy5qb2luKCcsJykgKyAoYWRkaXRpb25hbEZpZWxkcyA/IGAsJHthZGRpdGlvbmFsRmllbGRzfWA6ICcnKSxcbiAgICAgICAgICB9O1xuXG4gICAgLy8gZm9ybWF0IHBhcmFtZXRlcnMgZm9yIHVybFxuICAgIGNvbnN0IHVybFBhcmFtcyA9IF8ocGFyYW1zKVxuICAgICAgLm1hcCgodmFsdWUsIGtleSkgPT4gYCR7a2V5fT0ke3ZhbHVlfWApXG4gICAgICAuam9pbignJicpO1xuXG4gICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJpOiBgaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vYXBpL3Yke2FwaVZlcnNpb259L3VzZXJzKCcke3VzZXJQcm9maWxlLmVtYWlsQWZ0ZXJNYXBwaW5nfScpLyR7YXBpVHlwZX0/JHt1cmxQYXJhbXN9YCxcbiAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthY2Nlc3NUb2tlbn1gLFxuICAgICAgICBBY2NlcHQ6ICAgICAgICAnYXBwbGljYXRpb24vanNvbjtvZGF0YS5tZXRhZGF0YT1ub25lJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgdXNlckRhdGEuc3VjY2VzcyA9IHRydWU7XG5cbiAgICAgIGNvbnN0IHsgdmFsdWU6IHJlY29yZHMgfSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdChyZXF1ZXN0T3B0aW9ucykpIHx8IHt9O1xuXG4gICAgICBpZiAocmVjb3JkcyAmJiBwYWdlVG9HZXQgPT09IDEpIHtcbiAgICAgICAgdXNlckRhdGEuZGF0YSA9IHJlY29yZHM7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmRzICYmIHBhZ2VUb0dldCA+IDEpIHtcbiAgICAgICAgdXNlckRhdGEuZGF0YS5wdXNoKC4uLnJlY29yZHMpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgcmV0dXJuZWQgcmVzdWx0cyBhcmUgdGhlIG1heGltdW0gbnVtYmVyIG9mIHJlY29yZHMgcGVyIHBhZ2UsXG4gICAgICAvLyB3ZSBhcmUgbm90IGRvbmUgeWV0LCBzbyByZWN1cnNlLi4uXG4gICAgICBpZiAocmVjb3Jkcy5sZW5ndGggPT09IHJlY29yZHNQZXJQYWdlICYmIHBhZ2VUb0dldCA8PSBtYXhQYWdlcykge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRVc2VyRGF0YShvcHRpb25zLCB1c2VyRGF0YSwgcGFnZVRvR2V0ICsgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdXNlckRhdGE7XG4gICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24odXNlckRhdGEsIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yTWVzc2FnZTogZXJyLm5hbWUgIT09ICdTdGF0dXNDb2RlRXJyb3InID9cbiAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGVycikgICAgICAgICAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShlcnIuc3RhdHVzQ29kZSArICcgLSAnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tZXNzYWdlXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICB9XG5cbn1cbiJdfQ==
//# sourceMappingURL=Adapter.js.map
