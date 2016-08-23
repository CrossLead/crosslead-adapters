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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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

            // console.log('s');
            // console.log(filterStartDate);
            // console.log('e');
            // console.log(filterEndDate);

            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(this.getAccessToken());

          case 13:
            accessToken = context$2$0.sent;
            apiVersion = this._config.options.apiVersion;
            skip = (pageToGet - 1) * recordsPerPage;
            baseFields = this.constructor.baseFields;
            params = {
              $filter: $filter,
              startDateTime: filterStartDate.toISOString(),
              endDateTime: filterEndDate.toISOString(),
              $top: recordsPerPage,
              $skip: skip
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
            console.log('START GET');
            console.log(requestOptions.uri);
            context$2$0.t1 = JSON;
            context$2$0.next = 27;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(requestOptions));

          case 27:
            context$2$0.t2 = context$2$0.sent;
            context$2$0.t0 = context$2$0.t1.parse.call(context$2$0.t1, context$2$0.t2);

            if (context$2$0.t0) {
              context$2$0.next = 31;
              break;
            }

            context$2$0.t0 = {};

          case 31:
            _ref = context$2$0.t0;
            records = _ref.value;
            e = userProfile.emailAfterMapping;

            console.log('END GET');
            //console.log(records);
            console.log('FFFFFFFFFFFFFFF888888888888');

            if (!(userProfile.getAttachments && records.length)) {
              context$2$0.next = 55;
              break;
            }

            recIter = 0;

          case 38:
            if (!(recIter < records.length)) {
              context$2$0.next = 55;
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
            context$2$0.next = 46;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(attachmentOptions));

          case 46:
            context$2$0.t5 = context$2$0.sent;
            context$2$0.t3 = context$2$0.t4.parse.call(context$2$0.t4, context$2$0.t5);

            if (context$2$0.t3) {
              context$2$0.next = 50;
              break;
            }

            context$2$0.t3 = {};

          case 50:
            attachmentData = context$2$0.t3;

            if (attachmentData.value && attachmentData.value.length > 0) {
              rec.attachments = attachmentData.value;
            }

          case 52:
            recIter++;
            context$2$0.next = 38;
            break;

          case 55:
            console.log('FFFFFFFFFFFFFFF88899999999999999');
            // console.log(records.length);
            // console.log(mid);
            // console.log('444444444444444444444444b');
            // const attachments = JSON.parse(await request(attachmentOptions)) || {};
            // console.log('5555555555555555555555555');
            // console.log(records[0]);
            // console.log('---------------------------');
            // //console.log(attachments);
            // console.log('---------------------------');
            // fs.writeFileSync('bbb.txt', JSON.stringify(attachments));

            // const fBuffer = new Buffer(attachments.value[0].ContentBytes, 'base64');
            // fs.writeFileSync('bbb.png', fBuffer);
            // console.log('---------------------------232332');
            if (records && pageToGet === 1) {
              userData.data = records;
            }

            if (records && pageToGet > 1) {
              (_userData$data = userData.data).push.apply(_userData$data, _toConsumableArray(records));
            }

            // if the returned results are the maximum number of records per page,
            // we are not done yet, so recurse...

            if (!(records.length === recordsPerPage && pageToGet <= maxPages)) {
              context$2$0.next = 62;
              break;
            }

            return context$2$0.abrupt('return', this.getUserData(options, userData, pageToGet + 1));

          case 62:
            return context$2$0.abrupt('return', userData);

          case 63:
            context$2$0.next = 69;
            break;

          case 65:
            context$2$0.prev = 65;
            context$2$0.t6 = context$2$0['catch'](20);

            _Object$assign(userData, {
              success: false,
              errorMessage: context$2$0.t6.name !== 'StatusCodeError' ? JSON.stringify(context$2$0.t6) : JSON.parse(context$2$0.t6.message.replace(context$2$0.t6.statusCode + ' - ', '').replace(/\"/g, '"')).message
            });
            return context$2$0.abrupt('return', true);

          case 69:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[20, 65]]);
    }
  }]);

  return Office365BaseAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365BaseAdapter;
module.exports = exports['default'];

//to see if it really worked, we need to pass in the first result

// expire token in one hour

// parameters to query email with...
//$select:  baseFields.join(',') + (additionalFields ? `,${additionalFields}`: ''),

// format parameters for url
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcYmFzZVxcQWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUF1QyxXQUFXOzs7O3NCQUNYLFFBQVE7Ozs7OEJBQ1IsaUJBQWlCOzs7O3NCQUNqQixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7MkJBQ1Isb0JBQW9COzs7O3VCQUNwQixXQUFXOzs7OzZCQUNYLGlCQUFpQjs7OztrQkFDekMsSUFBSTs7Ozs7Ozs7SUFLRSxvQkFBb0I7WUFBcEIsb0JBQW9COztXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7K0JBQXBCLG9CQUFvQjs7O2VBQXBCLG9CQUFvQjs7V0FHbEMsaUJBQUc7QUFDTixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3JCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVTOzs7O0FBQ1IsZ0JBQUksQ0FBQyxPQUFPLEdBQUksK0JBQStCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNoRSxnQkFBSSxDQUFDLFFBQVEsR0FBRyx5QkFBeUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs2Q0FDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7OztBQUMxQixtQkFBTyxDQUFDLEdBQUcsK0JBQTZCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxvQkFBZSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBRyxDQUFDO2dEQUMvRixJQUFJOzs7Ozs7O0tBQ1o7OztXQUdzQiwyQkFBQyxjQUFjO1VBRzlCLEtBQUssRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLElBQUk7Ozs7QUFMVixnQkFBSSxDQUFDLE9BQU8sR0FBRywrQkFBK0IsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVwRSxpQkFBSyxHQUFhLFNBQWxCLEtBQUs7cUJBQW1CLDBCQUFRLENBQUMsR0FBRyxFQUFFLENB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QU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQ3hCLENBQ0EsT0FBTzthQUM3QixDQUFDLENBQUM7Z0RBQ0ksSUFBSTs7Ozs7OztLQUdkOzs7U0EzUGtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiY2xBZGFwdGVyc1xcb2ZmaWNlMzY1XFxiYXNlXFxBZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHV1aWQgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ25vZGUtdXVpZCc7XHJcbmltcG9ydCBjcnlwdG8gICAgICAgICAgICAgICAgICAgICBmcm9tICdjcnlwdG8nO1xyXG5pbXBvcnQgcmVxdWVzdCAgICAgICAgICAgICAgICAgICAgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcclxuaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XHJcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgQWRhcHRlciAgICAgICAgICAgICAgICAgICAgZnJvbSAnLi4vLi4vYmFzZS9BZGFwdGVyJztcclxuaW1wb3J0IE9mZmljZTM2NUJhc2VTZXJ2aWNlICAgICAgIGZyb20gJy4vU2VydmljZSc7XHJcbmltcG9ydCBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbiBmcm9tICcuL0NvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5cclxuLyoqXHJcbiAqIENvbW1vbiByZXNldCwgcnVuQ29ubmVjdGlvblRlc3QsIGFuZCBnZXRBY2Nlc3NUb2tlbiBtZXRob2RzLi4uXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVCYXNlQWRhcHRlciBleHRlbmRzIEFkYXB0ZXIge1xyXG5cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICBkZWxldGUgdGhpcy5fY29uZmlnO1xyXG4gICAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGFzeW5jIGluaXQoKSB7XHJcbiAgICB0aGlzLl9jb25maWcgID0gbmV3IE9mZmljZTM2NUJhc2VDb25maWd1cmF0aW9uKHRoaXMuY3JlZGVudGlhbHMpXHJcbiAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE9mZmljZTM2NUJhc2VTZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XHJcbiAgICBhd2FpdCB0aGlzLl9zZXJ2aWNlLmluaXQoKTtcclxuICAgIGNvbnNvbGUubG9nKGBTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGZvciBlbWFpbDogJHt0aGlzLmNyZWRlbnRpYWxzLmVtYWlsfWApO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuXHJcbiAgYXN5bmMgcnVuQ29ubmVjdGlvblRlc3QoY29ubmVjdGlvbkRhdGEpIHtcclxuICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbihjb25uZWN0aW9uRGF0YS5jcmVkZW50aWFscyk7XHJcblxyXG4gICAgY29uc3QgdG9kYXkgICAgICAgICAgID0gKCkgPT4gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JyksXHJcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGUgPSB0b2RheSgpLmFkZCgtMSwgJ2RheXMnKS50b0RhdGUoKSxcclxuICAgICAgICAgIGZpbHRlckVuZERhdGUgICA9IHRvZGF5KCkudG9EYXRlKCksXHJcbiAgICAgICAgICBkYXRhICAgICAgICAgICAgPSBhd2FpdCB0aGlzLmdldEJhdGNoRGF0YShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWyB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbEFmdGVyTWFwcGluZzogdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAvL3RvIHNlZSBpZiBpdCByZWFsbHkgd29ya2VkLCB3ZSBuZWVkIHRvIHBhc3MgaW4gdGhlIGZpcnN0IHJlc3VsdFxyXG4gICAgcmV0dXJuIGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0gPyBkYXRhLnJlc3VsdHNbMF06IGRhdGE7XHJcbiAgfVxyXG5cclxuXHJcbiAgYXN5bmMgZ2V0QWNjZXNzVG9rZW4oKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuYWNjZXNzVG9rZW4gJiYgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPiBuZXcgRGF0ZSgpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFjY2Vzc1Rva2VuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHtcclxuICAgICAgY3JlZGVudGlhbHMgOiB7XHJcbiAgICAgICAgY2xpZW50SWQsXHJcbiAgICAgICAgdGVuYW50SWQsXHJcbiAgICAgICAgY2VydGlmaWNhdGUsXHJcbiAgICAgICAgY2VydGlmaWNhdGVUaHVtYnByaW50XHJcbiAgICAgIH0sXHJcbiAgICAgIG9wdGlvbnMgOiB7XHJcbiAgICAgICAgYXBpVmVyc2lvblxyXG4gICAgICB9XHJcbiAgICB9ID0gdGhpcy5fY29uZmlnO1xyXG5cclxuICAgIGNvbnN0IHRva2VuUmVxdWVzdFVybCA9IGBodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vJHt0ZW5hbnRJZH0vb2F1dGgyL3Rva2VuP2FwaS12ZXJzaW9uPSR7YXBpVmVyc2lvbn1gO1xyXG5cclxuICAgIGNvbnN0IGp3dEhlYWRlciA9IHtcclxuICAgICAgJ2FsZyc6ICdSUzI1NicsXHJcbiAgICAgICd4NXQnOiBjZXJ0aWZpY2F0ZVRodW1icHJpbnRcclxuICAgIH07XHJcblxyXG4gICAgLy8gZXhwaXJlIHRva2VuIGluIG9uZSBob3VyXHJcbiAgICBjb25zdCBhY2Nlc3NUb2tlbkV4cGlyZXMgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSArIDM2MDAwMCkgLyAxMDAwO1xyXG5cclxuICAgIC8vIGdyYWIgbmV3IGFjY2VzcyB0b2tlbiAxMCBzZWNvbmRzIGJlZm9yZSBleHBpcmF0aW9uXHJcbiAgICB0aGlzLmFjY2Vzc1Rva2VuRXhwaXJlcyA9IG5ldyBEYXRlKGFjY2Vzc1Rva2VuRXhwaXJlcyoxMDAwIC0gMTAwMDApO1xyXG5cclxuICAgIGNvbnN0IGp3dFBheWxvYWQgPSB7XHJcbiAgICAgICdhdWQnOiB0b2tlblJlcXVlc3RVcmwsXHJcbiAgICAgICdleHAnOiBhY2Nlc3NUb2tlbkV4cGlyZXMsXHJcbiAgICAgICdpc3MnOiBjbGllbnRJZCxcclxuICAgICAgJ2p0aSc6IHV1aWQudjQoKSxcclxuICAgICAgJ25iZic6IGFjY2Vzc1Rva2VuRXhwaXJlcyAtIDIqMzYwMCwgLy8gb25lIGhvdXIgYmVmb3JlIG5vd1xyXG4gICAgICAnc3ViJzogY2xpZW50SWRcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZW5jb2RlICAgICAgICAgICAgICAgPSBoZWFkZXIgPT4gbmV3IEJ1ZmZlcihKU09OLnN0cmluZ2lmeShoZWFkZXIpKS50b1N0cmluZygnYmFzZTY0JyksXHJcbiAgICAgICAgICBlbmNvZGVkSnd0SGVhZGVyICAgICA9IGVuY29kZShqd3RIZWFkZXIpLFxyXG4gICAgICAgICAgZW5jb2RlZEp3dFBheWxvYWQgICAgPSBlbmNvZGUoand0UGF5bG9hZCksXHJcbiAgICAgICAgICBzdHJpbmdUb1NpZ24gICAgICAgICA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZCxcclxuICAgICAgICAgIGVuY29kZWRTaWduZWRKd3RJbmZvID0gY3J5cHRvXHJcbiAgICAgICAgICAgIC5jcmVhdGVTaWduKCdSU0EtU0hBMjU2JylcclxuICAgICAgICAgICAgLnVwZGF0ZShzdHJpbmdUb1NpZ24pXHJcbiAgICAgICAgICAgIC5zaWduKGNlcnRpZmljYXRlLCAnYmFzZTY0Jyk7XHJcblxyXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0Rm9ybURhdGEgPSB7XHJcbiAgICAgIGNsaWVudF9pZDogY2xpZW50SWQsXHJcbiAgICAgIGNsaWVudF9hc3NlcnRpb25fdHlwZTogJ3VybjppZXRmOnBhcmFtczpvYXV0aDpjbGllbnQtYXNzZXJ0aW9uLXR5cGU6and0LWJlYXJlcicsXHJcbiAgICAgIGdyYW50X3R5cGU6ICdjbGllbnRfY3JlZGVudGlhbHMnLFxyXG4gICAgICByZXNvdXJjZTogJ2h0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tLycsXHJcbiAgICAgIGNsaWVudF9hc3NlcnRpb246IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZCArICcuJyArIGVuY29kZWRTaWduZWRKd3RJbmZvXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHRva2VuUmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICBwb3J0OiA0NDMsXHJcbiAgICAgIHVyaTogdG9rZW5SZXF1ZXN0VXJsLFxyXG4gICAgICBmb3JtRGF0YTogdG9rZW5SZXF1ZXN0Rm9ybURhdGEsXHJcbiAgICB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHRva2VuRGF0YSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdCh0b2tlblJlcXVlc3RPcHRpb25zKSk7XHJcbiAgICAgIGlmICh0b2tlbkRhdGEgJiYgdG9rZW5EYXRhLmFjY2Vzc190b2tlbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW5EYXRhLmFjY2Vzc190b2tlbjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBnZXQgYWNjZXNzIHRva2VuLicpO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoICh0b2tlbkRhdGEpIHtcclxuICAgICAgaWYgKHRva2VuRGF0YS5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShcclxuICAgICAgICAgIHRva2VuRGF0YVxyXG4gICAgICAgICAgICAubWVzc2FnZVxyXG4gICAgICAgICAgICAucmVwbGFjZSh0b2tlbkRhdGEuc3RhdHVzQ29kZSArICcgLSAnLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcXCIvZywgJ1wiJylcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZURhdGEpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0b2tlbkRhdGEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgYXN5bmMgZ2V0VXNlckRhdGEob3B0aW9ucywgdXNlckRhdGEsIHBhZ2VUb0dldD0xKSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIHVzZXJQcm9maWxlLFxyXG4gICAgICBmaWx0ZXJTdGFydERhdGUsXHJcbiAgICAgIGZpbHRlckVuZERhdGUsXHJcbiAgICAgIGFkZGl0aW9uYWxGaWVsZHMsXHJcbiAgICAgICRmaWx0ZXIsXHJcbiAgICAgIGFwaVR5cGUsXHJcbiAgICAgIG1heFBhZ2VzID0gMjAsXHJcbiAgICAgIHJlY29yZHNQZXJQYWdlID0gMjVcclxuICAgIH0gPSBvcHRpb25zO1xyXG5cclxuICAgIC8vIGFjY3VtdWxhdGlvbiBvZiBkYXRhXHJcbiAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IHsgdXNlclByb2ZpbGUsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSB9O1xyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKCdzJyk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhmaWx0ZXJTdGFydERhdGUpO1xyXG4gICAgLy8gY29uc29sZS5sb2coJ2UnKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKGZpbHRlckVuZERhdGUpO1xyXG5cclxuICAgIGNvbnN0IGFjY2Vzc1Rva2VuICAgICAgICAgID0gYXdhaXQgdGhpcy5nZXRBY2Nlc3NUb2tlbigpLFxyXG4gICAgICAgICAgeyBhcGlWZXJzaW9uIH0gICAgICAgPSB0aGlzLl9jb25maWcub3B0aW9ucyxcclxuICAgICAgICAgIHNraXAgICAgICAgICAgICAgICAgID0gKHBhZ2VUb0dldCAtIDEpICogcmVjb3Jkc1BlclBhZ2UsXHJcbiAgICAgICAgICAvLyBleHRyYWN0IHN0YXRpYyBwcm9wZXJ0eS4uLlxyXG4gICAgICAgICAgeyBiYXNlRmllbGRzIH0gICAgICAgPSB0aGlzLmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgLy8gcGFyYW1ldGVycyB0byBxdWVyeSBlbWFpbCB3aXRoLi4uXHJcbiAgICAgICAgICBwYXJhbXMgICAgICAgICAgICAgICA9IHtcclxuICAgICAgICAgICAgJGZpbHRlcixcclxuICAgICAgICAgICAgc3RhcnREYXRlVGltZTogZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGVuZERhdGVUaW1lOiBmaWx0ZXJFbmREYXRlLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICAgICR0b3A6ICAgICByZWNvcmRzUGVyUGFnZSxcclxuICAgICAgICAgICAgJHNraXA6ICAgIHNraXAsXHJcbiAgICAgICAgICAgIC8vJHNlbGVjdDogIGJhc2VGaWVsZHMuam9pbignLCcpICsgKGFkZGl0aW9uYWxGaWVsZHMgPyBgLCR7YWRkaXRpb25hbEZpZWxkc31gOiAnJyksXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgIC8vIGZvcm1hdCBwYXJhbWV0ZXJzIGZvciB1cmxcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IF8ocGFyYW1zKVxyXG4gICAgICAubWFwKCh2YWx1ZSwga2V5KSA9PiBgJHtrZXl9PSR7dmFsdWV9YClcclxuICAgICAgLmpvaW4oJyYnKTtcclxuXHJcbiAgICBjb25zdCByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgdXJpOiBgaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vYXBpL3Yke2FwaVZlcnNpb259L3VzZXJzKCcke3VzZXJQcm9maWxlLmVtYWlsQWZ0ZXJNYXBwaW5nfScpLyR7YXBpVHlwZX0/JHt1cmxQYXJhbXN9YCxcclxuICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YCxcclxuICAgICAgICBBY2NlcHQ6ICAgICAgICAnYXBwbGljYXRpb24vanNvbjtvZGF0YS5tZXRhZGF0YT1ub25lJ1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHVzZXJEYXRhLnN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICBjb25zb2xlLmxvZygnU1RBUlQgR0VUJyk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3RPcHRpb25zLnVyaSk7XHJcbiAgICAgIGNvbnN0IHsgdmFsdWU6IHJlY29yZHMgfSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdChyZXF1ZXN0T3B0aW9ucykpIHx8IHt9O1xyXG4gICAgICBjb25zdCBlID0gdXNlclByb2ZpbGUuZW1haWxBZnRlck1hcHBpbmc7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdFTkQgR0VUJyk7XHJcbiAgICAgIC8vY29uc29sZS5sb2cocmVjb3Jkcyk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdGRkZGRkZGRkZGRkZGRkY4ODg4ODg4ODg4ODgnKTtcclxuXHJcbiAgICAgIGlmKHVzZXJQcm9maWxlLmdldEF0dGFjaG1lbnRzICYmIHJlY29yZHMubGVuZ3RoKSB7XHJcbiAgICAgICAgZm9yKHZhciByZWNJdGVyID0gMDsgcmVjSXRlciA8IHJlY29yZHMubGVuZ3RoOyByZWNJdGVyKyspIHtcclxuICAgICAgICAgIGNvbnN0IHJlYyA9IHJlY29yZHNbcmVjSXRlcl07XHJcbiAgICAgICAgICBjb25zdCBtaWQgPSByZWMuSWQgfHwgJyc7XHJcbiAgICAgICAgICByZWMuYXR0YWNobWVudHMgPSBbXTtcclxuICAgICAgICAgIGNvbnN0IGF0dGFjaG1lbnRPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICB1cmk6IGBodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS9hcGkvdiR7YXBpVmVyc2lvbn0vdXNlcnMoJyR7ZX0nKS9tZXNzYWdlcy8ke21pZH0vYXR0YWNobWVudHNgLFxyXG4gICAgICAgICAgICBoZWFkZXJzIDoge1xyXG4gICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthY2Nlc3NUb2tlbn1gLFxyXG4gICAgICAgICAgICAgIEFjY2VwdDogICAgICAgICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBjb25zdCBhdHRhY2htZW50RGF0YSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdChhdHRhY2htZW50T3B0aW9ucykpIHx8IHt9O1xyXG4gICAgICAgICAgaWYoYXR0YWNobWVudERhdGEudmFsdWUgJiYgYXR0YWNobWVudERhdGEudmFsdWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZWMuYXR0YWNobWVudHMgPSBhdHRhY2htZW50RGF0YS52YWx1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coJ0ZGRkZGRkZGRkZGRkZGRjg4ODk5OTk5OTk5OTk5OTk5Jyk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKHJlY29yZHMubGVuZ3RoKTtcclxuICAgICAgLy8gY29uc29sZS5sb2cobWlkKTtcclxuICAgICAgLy8gY29uc29sZS5sb2coJzQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NGInKTtcclxuICAgICAgLy8gY29uc3QgYXR0YWNobWVudHMgPSBKU09OLnBhcnNlKGF3YWl0IHJlcXVlc3QoYXR0YWNobWVudE9wdGlvbnMpKSB8fCB7fTtcclxuICAgICAgLy8gY29uc29sZS5sb2coJzU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTUnKTtcclxuICAgICAgLy8gY29uc29sZS5sb2cocmVjb3Jkc1swXSk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcclxuICAgICAgLy8gLy9jb25zb2xlLmxvZyhhdHRhY2htZW50cyk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcclxuICAgICAgLy8gZnMud3JpdGVGaWxlU3luYygnYmJiLnR4dCcsIEpTT04uc3RyaW5naWZ5KGF0dGFjaG1lbnRzKSk7XHJcblxyXG4gICAgICAvLyBjb25zdCBmQnVmZmVyID0gbmV3IEJ1ZmZlcihhdHRhY2htZW50cy52YWx1ZVswXS5Db250ZW50Qnl0ZXMsICdiYXNlNjQnKTtcclxuICAgICAgLy8gZnMud3JpdGVGaWxlU3luYygnYmJiLnBuZycsIGZCdWZmZXIpO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tMjMyMzMyJyk7XHJcbiAgICAgIGlmIChyZWNvcmRzICYmIHBhZ2VUb0dldCA9PT0gMSkge1xyXG4gICAgICAgIHVzZXJEYXRhLmRhdGEgPSByZWNvcmRzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocmVjb3JkcyAmJiBwYWdlVG9HZXQgPiAxKSB7XHJcbiAgICAgICAgdXNlckRhdGEuZGF0YS5wdXNoKC4uLnJlY29yZHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiB0aGUgcmV0dXJuZWQgcmVzdWx0cyBhcmUgdGhlIG1heGltdW0gbnVtYmVyIG9mIHJlY29yZHMgcGVyIHBhZ2UsXHJcbiAgICAgIC8vIHdlIGFyZSBub3QgZG9uZSB5ZXQsIHNvIHJlY3Vyc2UuLi5cclxuICAgICAgaWYgKHJlY29yZHMubGVuZ3RoID09PSByZWNvcmRzUGVyUGFnZSAmJiBwYWdlVG9HZXQgPD0gbWF4UGFnZXMpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRVc2VyRGF0YShvcHRpb25zLCB1c2VyRGF0YSwgcGFnZVRvR2V0ICsgMSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHVzZXJEYXRhO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIE9iamVjdC5hc3NpZ24odXNlckRhdGEsIHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVyci5uYW1lICE9PSAnU3RhdHVzQ29kZUVycm9yJyA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGVycikgICAgICAgICAgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIubWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShlcnIuc3RhdHVzQ29kZSArICcgLSAnLCAnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXCIvZywgJ1wiJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tZXNzYWdlXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufVxyXG4iXX0=
//# sourceMappingURL=Adapter.js.map
