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
      baseFields, params, urlParams, requestOptions, _ref, records, e, recIter, rec, mid, attachmentOptions, attachmentData, _userData$data;

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
            skip = (pageToGet - 1) * recordsPerPage;
            baseFields = this.constructor.baseFields;
            params = {
              startDateTime: filterStartDate.toISOString(),
              endDateTime: filterEndDate.toISOString(),
              $top: recordsPerPage,
              $skip: skip,
              $select: baseFields.join(',') + (additionalFields ? ',' + additionalFields : '')
            };

            if (apiType !== 'calendarview') {
              params.$filter = $filter;
            }

            // format parameters for url
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
            context$2$0.prev = 21;

            userData.success = true;

            context$2$0.t1 = JSON;
            context$2$0.next = 26;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(requestOptions));

          case 26:
            context$2$0.t2 = context$2$0.sent;
            context$2$0.t0 = context$2$0.t1.parse.call(context$2$0.t1, context$2$0.t2);

            if (context$2$0.t0) {
              context$2$0.next = 30;
              break;
            }

            context$2$0.t0 = {};

          case 30:
            _ref = context$2$0.t0;
            records = _ref.value;
            e = userProfile.emailAfterMapping;

            if (!(userProfile.getAttachments && records.length)) {
              context$2$0.next = 52;
              break;
            }

            recIter = 0;

          case 35:
            if (!(recIter < records.length)) {
              context$2$0.next = 52;
              break;
            }

            rec = records[recIter];
            mid = rec.Id || '';

            rec.attachments = [];
            attachmentOptions = {
              method: 'GET',
              uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + e + '\')/messages/' + mid + '/attachments',
              headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json;odata.metadata=none'
              }
            };
            context$2$0.t4 = JSON;
            context$2$0.next = 43;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(attachmentOptions));

          case 43:
            context$2$0.t5 = context$2$0.sent;
            context$2$0.t3 = context$2$0.t4.parse.call(context$2$0.t4, context$2$0.t5);

            if (context$2$0.t3) {
              context$2$0.next = 47;
              break;
            }

            context$2$0.t3 = {};

          case 47:
            attachmentData = context$2$0.t3;

            if (attachmentData.value && attachmentData.value.length > 0) {
              rec.attachments = attachmentData.value;
            }

          case 49:
            recIter++;
            context$2$0.next = 35;
            break;

          case 52:

            if (records && pageToGet === 1) {
              userData.data = records;
            }

            if (records && pageToGet > 1) {
              (_userData$data = userData.data).push.apply(_userData$data, _toConsumableArray(records));
            }

            // if the returned results are the maximum number of records per page,
            // we are not done yet, so recurse...

            if (!(records.length === recordsPerPage && pageToGet <= maxPages)) {
              context$2$0.next = 58;
              break;
            }

            return context$2$0.abrupt('return', this.getUserData(options, userData, pageToGet + 1));

          case 58:
            return context$2$0.abrupt('return', userData);

          case 59:
            context$2$0.next = 65;
            break;

          case 61:
            context$2$0.prev = 61;
            context$2$0.t6 = context$2$0['catch'](21);

            _Object$assign(userData, {
              success: false,
              errorMessage: context$2$0.t6.name !== 'StatusCodeError' ? JSON.stringify(context$2$0.t6) : JSON.parse(context$2$0.t6.message.replace(context$2$0.t6.statusCode + ' - ', '').replace(/\"/g, '"')).message
            });
            return context$2$0.abrupt('return', true);

          case 65:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[21, 61]]);
    }
  }]);

  return Office365BaseAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365BaseAdapter;
module.exports = exports['default'];

//to see if it really worked, we need to pass in the first result

// expire token in one hour

// parameters to query email with...
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2Jhc2UvQWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUF1QyxXQUFXOzs7O3NCQUNYLFFBQVE7Ozs7OEJBQ1IsaUJBQWlCOzs7O3NCQUNqQixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7MkJBQ1Isb0JBQW9COzs7O3VCQUNwQixXQUFXOzs7OzZCQUNYLGlCQUFpQjs7Ozs7Ozs7SUFLbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBR2xDLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUzs7OztBQUNSLGdCQUFJLENBQUMsT0FBTyxHQUFJLCtCQUErQixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDaEUsZ0JBQUksQ0FBQyxRQUFRLEdBQUcseUJBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7NkNBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFOzs7QUFDMUIsbUJBQU8sQ0FBQyxHQUFHLCtCQUE2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksb0JBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUcsQ0FBQztnREFDL0YsSUFBSTs7Ozs7OztLQUNaOzs7V0FHc0IsMkJBQUMsY0FBYztVQUc5QixLQUFLLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixJQUFJOzs7O0FBTFYsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsK0JBQStCLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFcEUsaUJBQUssR0FBYSxTQUFsQixLQUFLO3FCQUFtQiwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFL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IiwiZmlsZSI6ImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2Jhc2UvQWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1dWlkICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdub2RlLXV1aWQnO1xuaW1wb3J0IGNyeXB0byAgICAgICAgICAgICAgICAgICAgIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgcmVxdWVzdCAgICAgICAgICAgICAgICAgICAgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcbmltcG9ydCBtb21lbnQgICAgICAgICAgICAgICAgICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IF8gICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgQWRhcHRlciAgICAgICAgICAgICAgICAgICAgZnJvbSAnLi4vLi4vYmFzZS9BZGFwdGVyJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlU2VydmljZSAgICAgICBmcm9tICcuL1NlcnZpY2UnO1xuaW1wb3J0IE9mZmljZTM2NUJhc2VDb25maWd1cmF0aW9uIGZyb20gJy4vQ29uZmlndXJhdGlvbic7XG5cbi8qKlxuICogQ29tbW9uIHJlc2V0LCBydW5Db25uZWN0aW9uVGVzdCwgYW5kIGdldEFjY2Vzc1Rva2VuIG1ldGhvZHMuLi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgZXh0ZW5kcyBBZGFwdGVyIHtcblxuXG4gIHJlc2V0KCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jb25maWc7XG4gICAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBpbml0KCkge1xuICAgIHRoaXMuX2NvbmZpZyAgPSBuZXcgT2ZmaWNlMzY1QmFzZUNvbmZpZ3VyYXRpb24odGhpcy5jcmVkZW50aWFscylcbiAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE9mZmljZTM2NUJhc2VTZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG4gICAgYXdhaXQgdGhpcy5fc2VydmljZS5pbml0KCk7XG4gICAgY29uc29sZS5sb2coYFN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZm9yIGVtYWlsOiAke3RoaXMuY3JlZGVudGlhbHMuZW1haWx9YCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KGNvbm5lY3Rpb25EYXRhKSB7XG4gICAgdGhpcy5fY29uZmlnID0gbmV3IE9mZmljZTM2NUJhc2VDb25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcblxuICAgIGNvbnN0IHRvZGF5ICAgICAgICAgICA9ICgpID0+IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLFxuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSA9IHRvZGF5KCkuYWRkKC0xLCAnZGF5cycpLnRvRGF0ZSgpLFxuICAgICAgICAgIGZpbHRlckVuZERhdGUgICA9IHRvZGF5KCkudG9EYXRlKCksXG4gICAgICAgICAgZGF0YSAgICAgICAgICAgID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxBZnRlck1hcHBpbmc6IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgIC8vdG8gc2VlIGlmIGl0IHJlYWxseSB3b3JrZWQsIHdlIG5lZWQgdG8gcGFzcyBpbiB0aGUgZmlyc3QgcmVzdWx0XG4gICAgcmV0dXJuIGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0gPyBkYXRhLnJlc3VsdHNbMF06IGRhdGE7XG4gIH1cblxuXG4gIGFzeW5jIGdldEFjY2Vzc1Rva2VuKCkge1xuXG4gICAgaWYgKHRoaXMuYWNjZXNzVG9rZW4gJiYgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPiBuZXcgRGF0ZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hY2Nlc3NUb2tlbjtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBjcmVkZW50aWFscyA6IHtcbiAgICAgICAgY2xpZW50SWQsXG4gICAgICAgIHRlbmFudElkLFxuICAgICAgICBjZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2VydGlmaWNhdGVUaHVtYnByaW50XG4gICAgICB9LFxuICAgICAgb3B0aW9ucyA6IHtcbiAgICAgICAgYXBpVmVyc2lvblxuICAgICAgfVxuICAgIH0gPSB0aGlzLl9jb25maWc7XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RVcmwgPSBgaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tLyR7dGVuYW50SWR9L29hdXRoMi90b2tlbj9hcGktdmVyc2lvbj0ke2FwaVZlcnNpb259YDtcblxuICAgIGNvbnN0IGp3dEhlYWRlciA9IHtcbiAgICAgICdhbGcnOiAnUlMyNTYnLFxuICAgICAgJ3g1dCc6IGNlcnRpZmljYXRlVGh1bWJwcmludFxuICAgIH07XG5cbiAgICAvLyBleHBpcmUgdG9rZW4gaW4gb25lIGhvdXJcbiAgICBjb25zdCBhY2Nlc3NUb2tlbkV4cGlyZXMgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSArIDM2MDAwMCkgLyAxMDAwO1xuXG4gICAgLy8gZ3JhYiBuZXcgYWNjZXNzIHRva2VuIDEwIHNlY29uZHMgYmVmb3JlIGV4cGlyYXRpb25cbiAgICB0aGlzLmFjY2Vzc1Rva2VuRXhwaXJlcyA9IG5ldyBEYXRlKGFjY2Vzc1Rva2VuRXhwaXJlcyoxMDAwIC0gMTAwMDApO1xuXG4gICAgY29uc3Qgand0UGF5bG9hZCA9IHtcbiAgICAgICdhdWQnOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgICAnZXhwJzogYWNjZXNzVG9rZW5FeHBpcmVzLFxuICAgICAgJ2lzcyc6IGNsaWVudElkLFxuICAgICAgJ2p0aSc6IHV1aWQudjQoKSxcbiAgICAgICduYmYnOiBhY2Nlc3NUb2tlbkV4cGlyZXMgLSAyKjM2MDAsIC8vIG9uZSBob3VyIGJlZm9yZSBub3dcbiAgICAgICdzdWInOiBjbGllbnRJZFxuICAgIH07XG5cbiAgICBjb25zdCBlbmNvZGUgICAgICAgICAgICAgICA9IGhlYWRlciA9PiBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KGhlYWRlcikpLnRvU3RyaW5nKCdiYXNlNjQnKSxcbiAgICAgICAgICBlbmNvZGVkSnd0SGVhZGVyICAgICA9IGVuY29kZShqd3RIZWFkZXIpLFxuICAgICAgICAgIGVuY29kZWRKd3RQYXlsb2FkICAgID0gZW5jb2RlKGp3dFBheWxvYWQpLFxuICAgICAgICAgIHN0cmluZ1RvU2lnbiAgICAgICAgID0gZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkLFxuICAgICAgICAgIGVuY29kZWRTaWduZWRKd3RJbmZvID0gY3J5cHRvXG4gICAgICAgICAgICAuY3JlYXRlU2lnbignUlNBLVNIQTI1NicpXG4gICAgICAgICAgICAudXBkYXRlKHN0cmluZ1RvU2lnbilcbiAgICAgICAgICAgIC5zaWduKGNlcnRpZmljYXRlLCAnYmFzZTY0Jyk7XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RGb3JtRGF0YSA9IHtcbiAgICAgIGNsaWVudF9pZDogY2xpZW50SWQsXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uX3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXInLFxuICAgICAgZ3JhbnRfdHlwZTogJ2NsaWVudF9jcmVkZW50aWFscycsXG4gICAgICByZXNvdXJjZTogJ2h0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tLycsXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uOiBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQgKyAnLicgKyBlbmNvZGVkU2lnbmVkSnd0SW5mb1xuICAgIH07XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBwb3J0OiA0NDMsXG4gICAgICB1cmk6IHRva2VuUmVxdWVzdFVybCxcbiAgICAgIGZvcm1EYXRhOiB0b2tlblJlcXVlc3RGb3JtRGF0YSxcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRva2VuRGF0YSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdCh0b2tlblJlcXVlc3RPcHRpb25zKSk7XG4gICAgICBpZiAodG9rZW5EYXRhICYmIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW4gPSB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZ2V0IGFjY2VzcyB0b2tlbi4nKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoICh0b2tlbkRhdGEpIHtcbiAgICAgIGlmICh0b2tlbkRhdGEubmFtZSA9PT0gJ1N0YXR1c0NvZGVFcnJvcicpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKFxuICAgICAgICAgIHRva2VuRGF0YVxuICAgICAgICAgICAgLm1lc3NhZ2VcbiAgICAgICAgICAgIC5yZXBsYWNlKHRva2VuRGF0YS5zdGF0dXNDb2RlICsgJyAtICcsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcXCIvZywgJ1wiJylcbiAgICAgICAgKTtcblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZURhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRva2VuRGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICBhc3luYyBnZXRVc2VyRGF0YShvcHRpb25zLCB1c2VyRGF0YSwgcGFnZVRvR2V0PTEpIHtcbiAgICBjb25zdCB7XG4gICAgICB1c2VyUHJvZmlsZSxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgJGZpbHRlcixcbiAgICAgIGFwaVR5cGUsXG4gICAgICBtYXhQYWdlcyA9IDIwLFxuICAgICAgcmVjb3Jkc1BlclBhZ2UgPSAyNVxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gYWNjdW11bGF0aW9uIG9mIGRhdGFcbiAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IHsgdXNlclByb2ZpbGUsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSB9O1xuXG4gICAgY29uc3QgYWNjZXNzVG9rZW4gICAgICAgICAgPSBhd2FpdCB0aGlzLmdldEFjY2Vzc1Rva2VuKCksXG4gICAgICAgICAgeyBhcGlWZXJzaW9uIH0gICAgICAgPSB0aGlzLl9jb25maWcub3B0aW9ucyxcbiAgICAgICAgICBza2lwICAgICAgICAgICAgICAgICA9IChwYWdlVG9HZXQgLSAxKSAqIHJlY29yZHNQZXJQYWdlLFxuICAgICAgICAgIC8vIGV4dHJhY3Qgc3RhdGljIHByb3BlcnR5Li4uXG4gICAgICAgICAgeyBiYXNlRmllbGRzIH0gICAgICAgPSB0aGlzLmNvbnN0cnVjdG9yLFxuICAgICAgICAgIC8vIHBhcmFtZXRlcnMgdG8gcXVlcnkgZW1haWwgd2l0aC4uLlxuICAgICAgICAgIHBhcmFtcyAgICAgICAgICAgICAgID0ge1xuICAgICAgICAgICAgc3RhcnREYXRlVGltZTogZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBlbmREYXRlVGltZTogZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgJHRvcDogICAgIHJlY29yZHNQZXJQYWdlLFxuICAgICAgICAgICAgJHNraXA6ICAgIHNraXAsXG4gICAgICAgICAgICAkc2VsZWN0OiAgYmFzZUZpZWxkcy5qb2luKCcsJykgKyAoYWRkaXRpb25hbEZpZWxkcyA/IGAsJHthZGRpdGlvbmFsRmllbGRzfWA6ICcnKSxcbiAgICAgICAgICB9O1xuICAgIGlmKGFwaVR5cGUgIT09ICdjYWxlbmRhcnZpZXcnKSB7XG4gICAgICBwYXJhbXMuJGZpbHRlciA9ICRmaWx0ZXI7XG4gICAgfVxuXG4gICAgLy8gZm9ybWF0IHBhcmFtZXRlcnMgZm9yIHVybFxuICAgIGNvbnN0IHVybFBhcmFtcyA9IF8ocGFyYW1zKVxuICAgICAgLm1hcCgodmFsdWUsIGtleSkgPT4gYCR7a2V5fT0ke3ZhbHVlfWApXG4gICAgICAuam9pbignJicpO1xuXG4gICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJpOiBgaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vYXBpL3Yke2FwaVZlcnNpb259L3VzZXJzKCcke3VzZXJQcm9maWxlLmVtYWlsQWZ0ZXJNYXBwaW5nfScpLyR7YXBpVHlwZX0/JHt1cmxQYXJhbXN9YCxcbiAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthY2Nlc3NUb2tlbn1gLFxuICAgICAgICBBY2NlcHQ6ICAgICAgICAnYXBwbGljYXRpb24vanNvbjtvZGF0YS5tZXRhZGF0YT1ub25lJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgdXNlckRhdGEuc3VjY2VzcyA9IHRydWU7XG5cbiAgICAgIGNvbnN0IHsgdmFsdWU6IHJlY29yZHMgfSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdChyZXF1ZXN0T3B0aW9ucykpIHx8IHt9O1xuICAgICAgY29uc3QgZSA9IHVzZXJQcm9maWxlLmVtYWlsQWZ0ZXJNYXBwaW5nO1xuXG4gICAgICBpZih1c2VyUHJvZmlsZS5nZXRBdHRhY2htZW50cyAmJiByZWNvcmRzLmxlbmd0aCkge1xuICAgICAgICBmb3IodmFyIHJlY0l0ZXIgPSAwOyByZWNJdGVyIDwgcmVjb3Jkcy5sZW5ndGg7IHJlY0l0ZXIrKykge1xuICAgICAgICAgIGNvbnN0IHJlYyA9IHJlY29yZHNbcmVjSXRlcl07XG4gICAgICAgICAgY29uc3QgbWlkID0gcmVjLklkIHx8ICcnO1xuICAgICAgICAgIHJlYy5hdHRhY2htZW50cyA9IFtdO1xuICAgICAgICAgIGNvbnN0IGF0dGFjaG1lbnRPcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHVyaTogYGh0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tL2FwaS92JHthcGlWZXJzaW9ufS91c2VycygnJHtlfScpL21lc3NhZ2VzLyR7bWlkfS9hdHRhY2htZW50c2AsXG4gICAgICAgICAgICBoZWFkZXJzIDoge1xuICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YCxcbiAgICAgICAgICAgICAgQWNjZXB0OiAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb247b2RhdGEubWV0YWRhdGE9bm9uZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IGF0dGFjaG1lbnREYXRhID0gSlNPTi5wYXJzZShhd2FpdCByZXF1ZXN0KGF0dGFjaG1lbnRPcHRpb25zKSkgfHwge307XG4gICAgICAgICAgaWYoYXR0YWNobWVudERhdGEudmFsdWUgJiYgYXR0YWNobWVudERhdGEudmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVjLmF0dGFjaG1lbnRzID0gYXR0YWNobWVudERhdGEudmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmRzICYmIHBhZ2VUb0dldCA9PT0gMSkge1xuICAgICAgICB1c2VyRGF0YS5kYXRhID0gcmVjb3JkcztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZHMgJiYgcGFnZVRvR2V0ID4gMSkge1xuICAgICAgICB1c2VyRGF0YS5kYXRhLnB1c2goLi4ucmVjb3Jkcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHRoZSByZXR1cm5lZCByZXN1bHRzIGFyZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgcmVjb3JkcyBwZXIgcGFnZSxcbiAgICAgIC8vIHdlIGFyZSBub3QgZG9uZSB5ZXQsIHNvIHJlY3Vyc2UuLi5cbiAgICAgIGlmIChyZWNvcmRzLmxlbmd0aCA9PT0gcmVjb3Jkc1BlclBhZ2UgJiYgcGFnZVRvR2V0IDw9IG1heFBhZ2VzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVzZXJEYXRhKG9wdGlvbnMsIHVzZXJEYXRhLCBwYWdlVG9HZXQgKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1c2VyRGF0YTtcbiAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgT2JqZWN0LmFzc2lnbih1c2VyRGF0YSwge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnIubmFtZSAhPT0gJ1N0YXR1c0NvZGVFcnJvcicgP1xuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZXJyKSAgICAgICAgICA6XG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKGVyci5zdGF0dXNDb2RlICsgJyAtICcsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1lc3NhZ2VcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIH1cblxufVxuIl19
//# sourceMappingURL=Adapter.js.map
