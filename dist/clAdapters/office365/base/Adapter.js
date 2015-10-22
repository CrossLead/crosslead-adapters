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
            this._config = new _Configuration2['default'](this.credentials, { apiVersion: '1.0' });
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
            return _regeneratorRuntime.awrap(this.getBatchData([this._config.credentials.email], filterStartDate, filterEndDate, ''));

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

      var email, filterStartDate, filterEndDate, additionalFields, $filter, apiType, _options$maxPages, maxPages, _options$recordsPerPage, recordsPerPage, accessToken, apiVersion, skip,
      // extract static property...
      baseFields, params, urlParams, requestOptions, parsedBody, _userData$data$value;

      return _regeneratorRuntime.async(function getUserData$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            email = options.email;
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
            userData = userData || { email: email, filterStartDate: filterStartDate, filterEndDate: filterEndDate };

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
              $select: baseFields.join(',') + additionalFields
            };
            urlParams = (0, _lodash2['default'])(params).map(function (value, key) {
              return key + '=' + value;
            }).join('&');
            requestOptions = {
              method: 'GET',
              uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + email + '\')/' + apiType + '?' + urlParams,
              headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json;odata.metadata=none'
              }
            };
            context$2$0.prev = 20;

            userData.success = true;
            context$2$0.t0 = JSON;
            context$2$0.next = 25;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(requestOptions));

          case 25:
            context$2$0.t1 = context$2$0.sent;
            parsedBody = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (parsedBody && pageToGet === 1) {
              userData.data = parsedBody;
            }

            if (parsedBody.value && pageToGet > 1) {
              (_userData$data$value = userData.data.value).push.apply(_userData$data$value, _toConsumableArray(parsedBody.value));
            }

            // if the returned results are the maximum number of records per page,
            // we are not done yet, so recurse...

            if (!(parsedBody && parsedBody.value.length === recordsPerPage && pageToGet <= maxPages)) {
              context$2$0.next = 33;
              break;
            }

            return context$2$0.abrupt('return', this.getUserData(options, userData, pageToGet + 1));

          case 33:
            return context$2$0.abrupt('return', userData);

          case 34:
            context$2$0.next = 40;
            break;

          case 36:
            context$2$0.prev = 36;
            context$2$0.t2 = context$2$0['catch'](20);

            _Object$assign(userData, {
              success: false,
              errorMessage: context$2$0.t2.name !== 'StatusCodeError' ? JSON.stringify(context$2$0.t2) : JSON.parse(context$2$0.t2.message.replace(context$2$0.t2.statusCode + ' - ', '').replace(/\"/g, '"')).message
            });
            return context$2$0.abrupt('return', true);

          case 40:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[20, 36]]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2Jhc2UvQWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUF1QyxXQUFXOzs7O3NCQUNYLFFBQVE7Ozs7OEJBQ1IsaUJBQWlCOzs7O3NCQUNqQixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7MkJBQ1Isb0JBQW9COzs7O3VCQUNwQixXQUFXOzs7OzZCQUNYLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBR2xDLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUzs7OztBQUNSLGdCQUFJLENBQUMsT0FBTyxHQUFJLCtCQUErQixJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDdkYsZ0JBQUksQ0FBQyxRQUFRLEdBQUcseUJBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7NkNBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFOzs7QUFDMUIsbUJBQU8sQ0FBQyxHQUFHLCtCQUE2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksb0JBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUcsQ0FBQztnREFDL0YsSUFBSTs7Ozs7OztLQUNaOzs7V0FHc0IsMkJBQUMsY0FBYztVQUc5QixLQUFLLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixJQUFJOzs7O0FBTFYsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsK0JBQStCLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFcEUsaUJBQUssR0FBYSxTQUFsQixLQUFLO3FCQUFtQiwwQkFBUSxDQUFD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YXB0ZXJzL29mZmljZTM2NS9iYXNlL0FkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXVpZCAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbm9kZS11dWlkJztcbmltcG9ydCBjcnlwdG8gICAgICAgICAgICAgICAgICAgICBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHJlcXVlc3QgICAgICAgICAgICAgICAgICAgIGZyb20gJ3JlcXVlc3QtcHJvbWlzZSc7XG5pbXBvcnQgbW9tZW50ICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbW9tZW50JztcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEFkYXB0ZXIgICAgICAgICAgICAgICAgICAgIGZyb20gJy4uLy4uL2Jhc2UvQWRhcHRlcic7XG5pbXBvcnQgT2ZmaWNlMzY1QmFzZVNlcnZpY2UgICAgICAgZnJvbSAnLi9TZXJ2aWNlJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbiBmcm9tICcuL0NvbmZpZ3VyYXRpb24nO1xuXG5cbi8qKlxuICogQ29tbW9uIHJlc2V0LCBydW5Db25uZWN0aW9uVGVzdCwgYW5kIGdldEFjY2Vzc1Rva2VuIG1ldGhvZHMuLi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgZXh0ZW5kcyBBZGFwdGVyIHtcblxuXG4gIHJlc2V0KCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jb25maWc7XG4gICAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBpbml0KCkge1xuICAgIHRoaXMuX2NvbmZpZyAgPSBuZXcgT2ZmaWNlMzY1QmFzZUNvbmZpZ3VyYXRpb24odGhpcy5jcmVkZW50aWFscywgeyBhcGlWZXJzaW9uOiAnMS4wJyB9KVxuICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgT2ZmaWNlMzY1QmFzZVNlcnZpY2UodGhpcy5fY29uZmlnKTtcbiAgICBhd2FpdCB0aGlzLl9zZXJ2aWNlLmluaXQoKTtcbiAgICBjb25zb2xlLmxvZyhgU3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSBmb3IgZW1haWw6ICR7dGhpcy5jcmVkZW50aWFscy5lbWFpbH1gKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgYXN5bmMgcnVuQ29ubmVjdGlvblRlc3QoY29ubmVjdGlvbkRhdGEpIHtcbiAgICB0aGlzLl9jb25maWcgPSBuZXcgT2ZmaWNlMzY1QmFzZUNvbmZpZ3VyYXRpb24oY29ubmVjdGlvbkRhdGEuY3JlZGVudGlhbHMpO1xuXG4gICAgY29uc3QgdG9kYXkgICAgICAgICAgID0gKCkgPT4gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JyksXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlID0gdG9kYXkoKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCksXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZSAgID0gdG9kYXkoKS50b0RhdGUoKSxcbiAgICAgICAgICBkYXRhICAgICAgICAgICAgPSBhd2FpdCB0aGlzLmdldEJhdGNoRGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuZW1haWxdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgIC8vdG8gc2VlIGlmIGl0IHJlYWxseSB3b3JrZWQsIHdlIG5lZWQgdG8gcGFzcyBpbiB0aGUgZmlyc3QgcmVzdWx0XG4gICAgcmV0dXJuIGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0gPyBkYXRhLnJlc3VsdHNbMF06IGRhdGE7XG4gIH1cblxuXG4gIGFzeW5jIGdldEFjY2Vzc1Rva2VuKCkge1xuXG4gICAgaWYgKHRoaXMuYWNjZXNzVG9rZW4gJiYgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPiBuZXcgRGF0ZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hY2Nlc3NUb2tlbjtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBjcmVkZW50aWFscyA6IHtcbiAgICAgICAgY2xpZW50SWQsXG4gICAgICAgIHRlbmFudElkLFxuICAgICAgICBjZXJ0aWZpY2F0ZSxcbiAgICAgICAgY2VydGlmaWNhdGVUaHVtYnByaW50XG4gICAgICB9LFxuICAgICAgb3B0aW9ucyA6IHtcbiAgICAgICAgYXBpVmVyc2lvblxuICAgICAgfVxuICAgIH0gPSB0aGlzLl9jb25maWc7XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RVcmwgPSBgaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tLyR7dGVuYW50SWR9L29hdXRoMi90b2tlbj9hcGktdmVyc2lvbj0ke2FwaVZlcnNpb259YDtcblxuICAgIGNvbnN0IGp3dEhlYWRlciA9IHtcbiAgICAgICdhbGcnOiAnUlMyNTYnLFxuICAgICAgJ3g1dCc6IGNlcnRpZmljYXRlVGh1bWJwcmludFxuICAgIH07XG5cbiAgICAvLyBleHBpcmUgdG9rZW4gaW4gb25lIGhvdXJcbiAgICBjb25zdCBhY2Nlc3NUb2tlbkV4cGlyZXMgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSArIDM2MDAwMCkgLyAxMDAwO1xuXG4gICAgLy8gZ3JhYiBuZXcgYWNjZXNzIHRva2VuIDEwIHNlY29uZHMgYmVmb3JlIGV4cGlyYXRpb25cbiAgICB0aGlzLmFjY2Vzc1Rva2VuRXhwaXJlcyA9IG5ldyBEYXRlKGFjY2Vzc1Rva2VuRXhwaXJlcyoxMDAwIC0gMTAwMDApO1xuXG4gICAgY29uc3Qgand0UGF5bG9hZCA9IHtcbiAgICAgICdhdWQnOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgICAnZXhwJzogYWNjZXNzVG9rZW5FeHBpcmVzLFxuICAgICAgJ2lzcyc6IGNsaWVudElkLFxuICAgICAgJ2p0aSc6IHV1aWQudjQoKSxcbiAgICAgICduYmYnOiBhY2Nlc3NUb2tlbkV4cGlyZXMgLSAyKjM2MDAsIC8vIG9uZSBob3VyIGJlZm9yZSBub3dcbiAgICAgICdzdWInOiBjbGllbnRJZFxuICAgIH07XG5cbiAgICBjb25zdCBlbmNvZGUgICAgICAgICAgICAgICA9IGhlYWRlciA9PiBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KGhlYWRlcikpLnRvU3RyaW5nKCdiYXNlNjQnKSxcbiAgICAgICAgICBlbmNvZGVkSnd0SGVhZGVyICAgICA9IGVuY29kZShqd3RIZWFkZXIpLFxuICAgICAgICAgIGVuY29kZWRKd3RQYXlsb2FkICAgID0gZW5jb2RlKGp3dFBheWxvYWQpLFxuICAgICAgICAgIHN0cmluZ1RvU2lnbiAgICAgICAgID0gZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkLFxuICAgICAgICAgIGVuY29kZWRTaWduZWRKd3RJbmZvID0gY3J5cHRvXG4gICAgICAgICAgICAuY3JlYXRlU2lnbignUlNBLVNIQTI1NicpXG4gICAgICAgICAgICAudXBkYXRlKHN0cmluZ1RvU2lnbilcbiAgICAgICAgICAgIC5zaWduKGNlcnRpZmljYXRlLCAnYmFzZTY0Jyk7XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RGb3JtRGF0YSA9IHtcbiAgICAgIGNsaWVudF9pZDogY2xpZW50SWQsXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uX3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXInLFxuICAgICAgZ3JhbnRfdHlwZTogJ2NsaWVudF9jcmVkZW50aWFscycsXG4gICAgICByZXNvdXJjZTogJ2h0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tLycsXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uOiBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQgKyAnLicgKyBlbmNvZGVkU2lnbmVkSnd0SW5mb1xuICAgIH07XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBwb3J0OiA0NDMsXG4gICAgICB1cmk6IHRva2VuUmVxdWVzdFVybCxcbiAgICAgIGZvcm1EYXRhOiB0b2tlblJlcXVlc3RGb3JtRGF0YSxcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRva2VuRGF0YSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdCh0b2tlblJlcXVlc3RPcHRpb25zKSk7XG4gICAgICBpZiAodG9rZW5EYXRhICYmIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW4gPSB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZ2V0IGFjY2VzcyB0b2tlbi4nKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoICh0b2tlbkRhdGEpIHtcbiAgICAgIGlmICh0b2tlbkRhdGEubmFtZSA9PT0gJ1N0YXR1c0NvZGVFcnJvcicpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKFxuICAgICAgICAgIHRva2VuRGF0YVxuICAgICAgICAgICAgLm1lc3NhZ2VcbiAgICAgICAgICAgIC5yZXBsYWNlKHRva2VuRGF0YS5zdGF0dXNDb2RlICsgJyAtICcsICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcXCIvZywgJ1wiJylcbiAgICAgICAgKTtcblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZURhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRva2VuRGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICBhc3luYyBnZXRVc2VyRGF0YShvcHRpb25zLCB1c2VyRGF0YSwgcGFnZVRvR2V0PTEpIHtcblxuICAgIGNvbnN0IHtcbiAgICAgIGVtYWlsLFxuICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgICAkZmlsdGVyLFxuICAgICAgYXBpVHlwZSxcbiAgICAgIG1heFBhZ2VzID0gMjAsXG4gICAgICByZWNvcmRzUGVyUGFnZSA9IDI1XG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICAvLyBhY2N1bXVsYXRpb24gb2YgZGF0YVxuICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgeyBlbWFpbCwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlIH07XG5cbiAgICBjb25zdCBhY2Nlc3NUb2tlbiAgICAgICAgICA9IGF3YWl0IHRoaXMuZ2V0QWNjZXNzVG9rZW4oKSxcbiAgICAgICAgICB7IGFwaVZlcnNpb24gfSAgICAgICA9IHRoaXMuX2NvbmZpZy5vcHRpb25zLFxuICAgICAgICAgIHNraXAgICAgICAgICAgICAgICAgID0gKChwYWdlVG9HZXQgLTEpICogcmVjb3Jkc1BlclBhZ2UpICsgMSxcbiAgICAgICAgICAvLyBleHRyYWN0IHN0YXRpYyBwcm9wZXJ0eS4uLlxuICAgICAgICAgIHsgYmFzZUZpZWxkcyB9ICAgICAgID0gdGhpcy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAvLyBwYXJhbWV0ZXJzIHRvIHF1ZXJ5IGVtYWlsIHdpdGguLi5cbiAgICAgICAgICBwYXJhbXMgICAgICAgICAgICAgICA9IHtcbiAgICAgICAgICAgICRmaWx0ZXIsXG4gICAgICAgICAgICAkdG9wOiAgICAgcmVjb3Jkc1BlclBhZ2UsXG4gICAgICAgICAgICAkc2tpcDogICAgc2tpcCxcbiAgICAgICAgICAgICRzZWxlY3Q6ICBiYXNlRmllbGRzLmpvaW4oJywnKSArIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgICAgICAgfTtcblxuICAgIC8vIGZvcm1hdCBwYXJhbWV0ZXJzIGZvciB1cmxcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBfKHBhcmFtcylcbiAgICAgIC5tYXAoKHZhbHVlLCBrZXkpID0+IGAke2tleX09JHt2YWx1ZX1gKVxuICAgICAgLmpvaW4oJyYnKTtcblxuICAgIGNvbnN0IHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHVyaTogYGh0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tL2FwaS92JHthcGlWZXJzaW9ufS91c2VycygnJHtlbWFpbH0nKS8ke2FwaVR5cGV9PyR7dXJsUGFyYW1zfWAsXG4gICAgICBoZWFkZXJzIDoge1xuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YCxcbiAgICAgICAgQWNjZXB0OiAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb247b2RhdGEubWV0YWRhdGE9bm9uZSdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHVzZXJEYXRhLnN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgY29uc3QgcGFyc2VkQm9keSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdChyZXF1ZXN0T3B0aW9ucykpO1xuXG4gICAgICBpZiAocGFyc2VkQm9keSAmJiBwYWdlVG9HZXQgPT09IDEpIHtcbiAgICAgICAgdXNlckRhdGEuZGF0YSA9IHBhcnNlZEJvZHk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJzZWRCb2R5LnZhbHVlICYmIHBhZ2VUb0dldCA+IDEpIHtcbiAgICAgICAgdXNlckRhdGEuZGF0YS52YWx1ZS5wdXNoKC4uLnBhcnNlZEJvZHkudmFsdWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgcmV0dXJuZWQgcmVzdWx0cyBhcmUgdGhlIG1heGltdW0gbnVtYmVyIG9mIHJlY29yZHMgcGVyIHBhZ2UsXG4gICAgICAvLyB3ZSBhcmUgbm90IGRvbmUgeWV0LCBzbyByZWN1cnNlLi4uXG4gICAgICBpZiAocGFyc2VkQm9keSAmJiBwYXJzZWRCb2R5LnZhbHVlLmxlbmd0aCA9PT0gcmVjb3Jkc1BlclBhZ2UgJiYgcGFnZVRvR2V0IDw9IG1heFBhZ2VzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVzZXJEYXRhKG9wdGlvbnMsIHVzZXJEYXRhLCBwYWdlVG9HZXQgKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1c2VyRGF0YTtcbiAgICAgIH1cblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgT2JqZWN0LmFzc2lnbih1c2VyRGF0YSwge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnIubmFtZSAhPT0gJ1N0YXR1c0NvZGVFcnJvcicgP1xuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZXJyKSAgICAgICAgICA6XG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKGVyci5zdGF0dXNDb2RlICsgJyAtICcsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1lc3NhZ2VcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIH1cblxufVxuIl19
//# sourceMappingURL=../../../clAdapters/office365/base/Adapter.js.map