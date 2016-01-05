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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcYmFzZVxcQWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUF1QyxXQUFXOzs7O3NCQUNYLFFBQVE7Ozs7OEJBQ1IsaUJBQWlCOzs7O3NCQUNqQixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7MkJBQ1Isb0JBQW9COzs7O3VCQUNwQixXQUFXOzs7OzZCQUNYLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBR2xDLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUzs7OztBQUNSLGdCQUFJLENBQUMsT0FBTyxHQUFJLCtCQUErQixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDaEUsZ0JBQUksQ0FBQyxRQUFRLEdBQUcseUJBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7NkNBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFOzs7QUFDMUIsbUJBQU8sQ0FBQyxHQUFHLCtCQUE2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksb0JBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUcsQ0FBQztnREFDL0YsSUFBSTs7Ozs7OztLQUNaOzs7V0FHc0IsMkJBQUMsY0FBYztVQUc5QixLQUFLLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixJQUFJOzs7O0FBTFYsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsK0JBQStCLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFcEUsaUJBQUssR0FBYSxTQUFsQixLQUFLO3FCQUFtQiwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFBQTs7QUFDckQsMkJBQWUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ2xELHlCQUFhLEdBQUssS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFOzs2Q0FDVixJQUFJLENBQUMsWUFBWSxDQUNyQixDQUFFO0FBQ0EsbUJBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLO0FBQ3JDLCtCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUs7YUFDbEQsQ0FBRSxFQUNILGVBQWUsRUFDZixhQUFhLEVBQ2IsRUFBRSxDQUNIOzs7QUFSbkIsZ0JBQUk7Z0RBV0gsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUUsSUFBSTs7Ozs7OztLQUMvRDs7O1dBR21CO3dDQVFkLFFBQVEsRUFDUixRQUFRLEVBQ1IsV0FBVyxFQUNYLHFCQUFxQixFQUdyQixVQUFVLEVBSVIsZUFBZSxFQUVmLFNBQVMsRUFNVCxrQkFBa0IsRUFLbEIsVUFBVSxFQVNWLE1BQU0sRUFDTixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixvQkFBb0IsRUFLcEIsb0JBQW9CLEVBUXBCLG1CQUFtQixFQVFqQixTQUFTLEVBUVAsV0FBVzs7Ozs7a0JBdkVqQixJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBOzs7OztnREFDbkQsSUFBSSxDQUFDLFdBQVc7OztzQkFhckIsSUFBSSxDQUFDLE9BQU87MENBVGQsV0FBVztBQUNULG9CQUFRLHVCQUFSLFFBQVE7QUFDUixvQkFBUSx1QkFBUixRQUFRO0FBQ1IsdUJBQVcsdUJBQVgsV0FBVztBQUNYLGlDQUFxQix1QkFBckIscUJBQXFCO0FBR3JCLHNCQUFVLFdBRFosT0FBTyxDQUNMLFVBQVU7QUFJUiwyQkFBZSwwQ0FBd0MsUUFBUSxrQ0FBNkIsVUFBVTtBQUV0RyxxQkFBUyxHQUFHO0FBQ2hCLG1CQUFLLEVBQUUsT0FBTztBQUNkLG1CQUFLLEVBQUUscUJBQXFCO2FBQzdCO0FBR0ssOEJBQWtCLEdBQUcsQ0FBQyxBQUFDLElBQUksSUFBSSxFQUFFLENBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFBLEdBQUksSUFBSTs7O0FBR25FLGdCQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEdBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDOztBQUU5RCxzQkFBVSxHQUFHO0FBQ2pCLG1CQUFLLEVBQUUsZUFBZTtBQUN0QixtQkFBSyxFQUFFLGtCQUFrQjtBQUN6QixtQkFBSyxFQUFFLFFBQVE7QUFDZixtQkFBSyxFQUFFLHNCQUFLLEVBQUUsRUFBRTtBQUNoQixtQkFBSyxFQUFFLGtCQUFrQixHQUFHLENBQUMsR0FBQyxJQUFJO0FBQ2xDLG1CQUFLLEVBQUUsUUFBUTthQUNoQjtBQUVLLGtCQUFNLEdBQWlCLFNBQXZCLE1BQU0sQ0FBaUIsTUFBTTtxQkFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzthQUFBLEVBQ3RGLGdCQUFnQixHQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFDeEMsaUJBQWlCLEdBQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUN6QyxZQUFZLEdBQVcsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHLGlCQUFpQixFQUNqRSxvQkFBb0IsR0FBRyxvQkFDcEIsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUN4QixNQUFNLENBQUMsWUFBWSxDQUFDLENBQ3BCLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO0FBRTlCLGdDQUFvQixHQUFHO0FBQzNCLHVCQUFTLEVBQUUsUUFBUTtBQUNuQixtQ0FBcUIsRUFBRSx3REFBd0Q7QUFDL0Usd0JBQVUsRUFBRSxvQkFBb0I7QUFDaEMsc0JBQVEsRUFBRSxnQ0FBZ0M7QUFDMUMsOEJBQWdCLEVBQUUsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHLGlCQUFpQixHQUFHLEdBQUcsR0FBRyxvQkFBb0I7YUFDMUY7QUFFSywrQkFBbUIsR0FBRztBQUMxQixvQkFBTSxFQUFFLE1BQU07QUFDZCxrQkFBSSxFQUFFLEdBQUc7QUFDVCxpQkFBRyxFQUFFLGVBQWU7QUFDcEIsc0JBQVEsRUFBRSxvQkFBb0I7YUFDL0I7OzZCQUdtQixJQUFJOzs2Q0FBYSxpQ0FBUSxtQkFBbUIsQ0FBQzs7OztBQUF6RCxxQkFBUyxrQkFBUSxLQUFLOztrQkFDeEIsU0FBUyxJQUFJLFNBQVMsQ0FBQyxZQUFZLENBQUE7Ozs7O2dEQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxZQUFZOzs7a0JBRTFDLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDOzs7Ozs7Ozs7O2tCQUc1QyxlQUFVLElBQUksS0FBSyxpQkFBaUIsQ0FBQTs7Ozs7QUFDaEMsdUJBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUM1QixlQUNHLE9BQU8sQ0FDUCxPQUFPLENBQUMsZUFBVSxVQUFVLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUN6QyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUN2QjtrQkFFSyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUM7OztrQkFFdEIsSUFBSSxLQUFLLGdCQUFXOzs7Ozs7O0tBRy9COzs7V0FHZ0IscUJBQUMsT0FBTyxFQUFFLFFBQVE7VUFBRSxTQUFTLHlEQUFDLENBQUM7O1VBRzVDLFdBQVcsRUFDWCxlQUFlLEVBQ2YsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixPQUFPLEVBQ1AsT0FBTyxxQkFDUCxRQUFRLDJCQUNSLGNBQWMsRUFNVixXQUFXLEVBQ1QsVUFBVSxFQUNaLElBQUk7O0FBRUYsZ0JBQVUsRUFFWixNQUFNLEVBUU4sU0FBUyxFQUlULGNBQWMsUUFZSCxPQUFPOzs7OztBQTNDdEIsdUJBQVcsR0FRVCxPQUFPLENBUlQsV0FBVztBQUNYLDJCQUFlLEdBT2IsT0FBTyxDQVBULGVBQWU7QUFDZix5QkFBYSxHQU1YLE9BQU8sQ0FOVCxhQUFhO0FBQ2IsNEJBQWdCLEdBS2QsT0FBTyxDQUxULGdCQUFnQjtBQUNoQixtQkFBTyxHQUlMLE9BQU8sQ0FKVCxPQUFPO0FBQ1AsbUJBQU8sR0FHTCxPQUFPLENBSFQsT0FBTztnQ0FHTCxPQUFPLENBRlQsUUFBUTtBQUFSLG9CQUFRLHFDQUFHLEVBQUU7c0NBRVgsT0FBTyxDQURULGNBQWM7QUFBZCwwQkFBYywyQ0FBRyxFQUFFOzs7QUFJckIsb0JBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxXQUFXLEVBQVgsV0FBVyxFQUFFLGVBQWUsRUFBZixlQUFlLEVBQUUsYUFBYSxFQUFiLGFBQWEsRUFBRSxDQUFDOzs7NkNBRXBDLElBQUksQ0FBQyxjQUFjLEVBQUU7OztBQUFsRCx1QkFBVztBQUNULHNCQUFVLEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQXpDLFVBQVU7QUFDWixnQkFBSSxHQUFtQixBQUFDLENBQUMsU0FBUyxHQUFFLENBQUMsQ0FBQSxHQUFJLGNBQWMsR0FBSSxDQUFDO0FBRTFELHNCQUFVLEdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBckMsVUFBVTtBQUVaLGtCQUFNLEdBQWlCO0FBQ3JCLHFCQUFPLEVBQVAsT0FBTztBQUNQLGtCQUFJLEVBQU0sY0FBYztBQUN4QixtQkFBSyxFQUFLLElBQUk7QUFDZCxxQkFBTyxFQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksZ0JBQWdCLFNBQU8sZ0JBQWdCLEdBQUksRUFBRSxDQUFBLEFBQUM7YUFDakY7QUFHRCxxQkFBUyxHQUFHLHlCQUFFLE1BQU0sQ0FBQyxDQUN4QixHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUUsR0FBRztxQkFBUSxHQUFHLFNBQUksS0FBSzthQUFFLENBQUMsQ0FDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUVOLDBCQUFjLEdBQUc7QUFDckIsb0JBQU0sRUFBRSxLQUFLO0FBQ2IsaUJBQUcsMENBQXdDLFVBQVUsaUJBQVcsV0FBVyxDQUFDLGlCQUFpQixZQUFNLE9BQU8sU0FBSSxTQUFTLEFBQUU7QUFDekgscUJBQU8sRUFBRztBQUNSLDZCQUFhLGNBQVksV0FBVyxBQUFFO0FBQ3RDLHNCQUFNLEVBQVMsc0NBQXNDO2VBQ3REO2FBQ0Y7OztBQUdDLG9CQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7NkJBRUcsSUFBSTs7NkNBQWEsaUNBQVEsY0FBYyxDQUFDOzs7OzRDQUFuQyxLQUFLOzs7Ozs7OzZCQUFtQyxFQUFFOzs7O0FBQTNELG1CQUFPLFFBQWQsS0FBSzs7QUFFYixnQkFBSSxPQUFPLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtBQUM5QixzQkFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7YUFDekI7O0FBRUQsZ0JBQUksT0FBTyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7QUFDNUIsZ0NBQUEsUUFBUSxDQUFDLElBQUksRUFBQyxJQUFJLE1BQUEsb0NBQUksT0FBTyxFQUFDLENBQUM7YUFDaEM7Ozs7O2tCQUlHLE9BQU8sQ0FBQyxNQUFNLEtBQUssY0FBYyxJQUFJLFNBQVMsSUFBSSxRQUFRLENBQUE7Ozs7O2dEQUNyRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQzs7O2dEQUVsRCxRQUFROzs7Ozs7Ozs7O0FBSWpCLDJCQUFjLFFBQVEsRUFBRTtBQUN0QixxQkFBTyxFQUFFLEtBQUs7QUFDZCwwQkFBWSxFQUFFLGVBQUksSUFBSSxLQUFLLGlCQUFpQixHQUM1QixJQUFJLENBQUMsU0FBUyxnQkFBSyxHQUNuQixJQUFJLENBQUMsS0FBSyxDQUNKLGVBQUksT0FBTyxDQUNQLE9BQU8sQ0FBQyxlQUFJLFVBQVUsR0FBRyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQ25DLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQ3hCLENBQ0EsT0FBTzthQUM3QixDQUFDLENBQUM7Z0RBQ0ksSUFBSTs7Ozs7OztLQUdkOzs7U0E5TWtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiY2xBZGFwdGVyc1xcb2ZmaWNlMzY1XFxiYXNlXFxBZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHV1aWQgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ25vZGUtdXVpZCc7XHJcbmltcG9ydCBjcnlwdG8gICAgICAgICAgICAgICAgICAgICBmcm9tICdjcnlwdG8nO1xyXG5pbXBvcnQgcmVxdWVzdCAgICAgICAgICAgICAgICAgICAgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcclxuaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XHJcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgQWRhcHRlciAgICAgICAgICAgICAgICAgICAgZnJvbSAnLi4vLi4vYmFzZS9BZGFwdGVyJztcclxuaW1wb3J0IE9mZmljZTM2NUJhc2VTZXJ2aWNlICAgICAgIGZyb20gJy4vU2VydmljZSc7XHJcbmltcG9ydCBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbiBmcm9tICcuL0NvbmZpZ3VyYXRpb24nO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb21tb24gcmVzZXQsIHJ1bkNvbm5lY3Rpb25UZXN0LCBhbmQgZ2V0QWNjZXNzVG9rZW4gbWV0aG9kcy4uLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgZXh0ZW5kcyBBZGFwdGVyIHtcclxuXHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgZGVsZXRlIHRoaXMuX2NvbmZpZztcclxuICAgIGRlbGV0ZSB0aGlzLl9zZXJ2aWNlO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBhc3luYyBpbml0KCkge1xyXG4gICAgdGhpcy5fY29uZmlnICA9IG5ldyBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbih0aGlzLmNyZWRlbnRpYWxzKVxyXG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBPZmZpY2UzNjVCYXNlU2VydmljZSh0aGlzLl9jb25maWcpO1xyXG4gICAgYXdhaXQgdGhpcy5fc2VydmljZS5pbml0KCk7XHJcbiAgICBjb25zb2xlLmxvZyhgU3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSBmb3IgZW1haWw6ICR7dGhpcy5jcmVkZW50aWFscy5lbWFpbH1gKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcblxyXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KGNvbm5lY3Rpb25EYXRhKSB7XHJcbiAgICB0aGlzLl9jb25maWcgPSBuZXcgT2ZmaWNlMzY1QmFzZUNvbmZpZ3VyYXRpb24oY29ubmVjdGlvbkRhdGEuY3JlZGVudGlhbHMpO1xyXG5cclxuICAgIGNvbnN0IHRvZGF5ICAgICAgICAgICA9ICgpID0+IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLFxyXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlID0gdG9kYXkoKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCksXHJcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlICAgPSB0b2RheSgpLnRvRGF0ZSgpLFxyXG4gICAgICAgICAgZGF0YSAgICAgICAgICAgID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsgeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbEFmdGVyTWFwcGluZzogdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgLy90byBzZWUgaWYgaXQgcmVhbGx5IHdvcmtlZCwgd2UgbmVlZCB0byBwYXNzIGluIHRoZSBmaXJzdCByZXN1bHRcclxuICAgIHJldHVybiBkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5yZXN1bHRzWzBdID8gZGF0YS5yZXN1bHRzWzBdOiBkYXRhO1xyXG4gIH1cclxuXHJcblxyXG4gIGFzeW5jIGdldEFjY2Vzc1Rva2VuKCkge1xyXG5cclxuICAgIGlmICh0aGlzLmFjY2Vzc1Rva2VuICYmIHRoaXMuYWNjZXNzVG9rZW5FeHBpcmVzID4gbmV3IERhdGUoKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5hY2Nlc3NUb2tlbjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7XHJcbiAgICAgIGNyZWRlbnRpYWxzIDoge1xyXG4gICAgICAgIGNsaWVudElkLFxyXG4gICAgICAgIHRlbmFudElkLFxyXG4gICAgICAgIGNlcnRpZmljYXRlLFxyXG4gICAgICAgIGNlcnRpZmljYXRlVGh1bWJwcmludFxyXG4gICAgICB9LFxyXG4gICAgICBvcHRpb25zIDoge1xyXG4gICAgICAgIGFwaVZlcnNpb25cclxuICAgICAgfVxyXG4gICAgfSA9IHRoaXMuX2NvbmZpZztcclxuXHJcbiAgICBjb25zdCB0b2tlblJlcXVlc3RVcmwgPSBgaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tLyR7dGVuYW50SWR9L29hdXRoMi90b2tlbj9hcGktdmVyc2lvbj0ke2FwaVZlcnNpb259YDtcclxuXHJcbiAgICBjb25zdCBqd3RIZWFkZXIgPSB7XHJcbiAgICAgICdhbGcnOiAnUlMyNTYnLFxyXG4gICAgICAneDV0JzogY2VydGlmaWNhdGVUaHVtYnByaW50XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGV4cGlyZSB0b2tlbiBpbiBvbmUgaG91clxyXG4gICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcmVzID0gKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyAzNjAwMDApIC8gMTAwMDtcclxuXHJcbiAgICAvLyBncmFiIG5ldyBhY2Nlc3MgdG9rZW4gMTAgc2Vjb25kcyBiZWZvcmUgZXhwaXJhdGlvblxyXG4gICAgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPSBuZXcgRGF0ZShhY2Nlc3NUb2tlbkV4cGlyZXMqMTAwMCAtIDEwMDAwKTtcclxuXHJcbiAgICBjb25zdCBqd3RQYXlsb2FkID0ge1xyXG4gICAgICAnYXVkJzogdG9rZW5SZXF1ZXN0VXJsLFxyXG4gICAgICAnZXhwJzogYWNjZXNzVG9rZW5FeHBpcmVzLFxyXG4gICAgICAnaXNzJzogY2xpZW50SWQsXHJcbiAgICAgICdqdGknOiB1dWlkLnY0KCksXHJcbiAgICAgICduYmYnOiBhY2Nlc3NUb2tlbkV4cGlyZXMgLSAyKjM2MDAsIC8vIG9uZSBob3VyIGJlZm9yZSBub3dcclxuICAgICAgJ3N1Yic6IGNsaWVudElkXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGVuY29kZSAgICAgICAgICAgICAgID0gaGVhZGVyID0+IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoaGVhZGVyKSkudG9TdHJpbmcoJ2Jhc2U2NCcpLFxyXG4gICAgICAgICAgZW5jb2RlZEp3dEhlYWRlciAgICAgPSBlbmNvZGUoand0SGVhZGVyKSxcclxuICAgICAgICAgIGVuY29kZWRKd3RQYXlsb2FkICAgID0gZW5jb2RlKGp3dFBheWxvYWQpLFxyXG4gICAgICAgICAgc3RyaW5nVG9TaWduICAgICAgICAgPSBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQsXHJcbiAgICAgICAgICBlbmNvZGVkU2lnbmVkSnd0SW5mbyA9IGNyeXB0b1xyXG4gICAgICAgICAgICAuY3JlYXRlU2lnbignUlNBLVNIQTI1NicpXHJcbiAgICAgICAgICAgIC51cGRhdGUoc3RyaW5nVG9TaWduKVxyXG4gICAgICAgICAgICAuc2lnbihjZXJ0aWZpY2F0ZSwgJ2Jhc2U2NCcpO1xyXG5cclxuICAgIGNvbnN0IHRva2VuUmVxdWVzdEZvcm1EYXRhID0ge1xyXG4gICAgICBjbGllbnRfaWQ6IGNsaWVudElkLFxyXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uX3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXInLFxyXG4gICAgICBncmFudF90eXBlOiAnY2xpZW50X2NyZWRlbnRpYWxzJyxcclxuICAgICAgcmVzb3VyY2U6ICdodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS8nLFxyXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uOiBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQgKyAnLicgKyBlbmNvZGVkU2lnbmVkSnd0SW5mb1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB0b2tlblJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgcG9ydDogNDQzLFxyXG4gICAgICB1cmk6IHRva2VuUmVxdWVzdFVybCxcclxuICAgICAgZm9ybURhdGE6IHRva2VuUmVxdWVzdEZvcm1EYXRhLFxyXG4gICAgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKGF3YWl0IHJlcXVlc3QodG9rZW5SZXF1ZXN0T3B0aW9ucykpO1xyXG4gICAgICBpZiAodG9rZW5EYXRhICYmIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hY2Nlc3NUb2tlbiA9IHRva2VuRGF0YS5hY2Nlc3NfdG9rZW47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZ2V0IGFjY2VzcyB0b2tlbi4nKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAodG9rZW5EYXRhKSB7XHJcbiAgICAgIGlmICh0b2tlbkRhdGEubmFtZSA9PT0gJ1N0YXR1c0NvZGVFcnJvcicpIHtcclxuICAgICAgICBjb25zdCBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UoXHJcbiAgICAgICAgICB0b2tlbkRhdGFcclxuICAgICAgICAgICAgLm1lc3NhZ2VcclxuICAgICAgICAgICAgLnJlcGxhY2UodG9rZW5EYXRhLnN0YXR1c0NvZGUgKyAnIC0gJywgJycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFwiL2csICdcIicpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2VEYXRhKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodG9rZW5EYXRhKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIGFzeW5jIGdldFVzZXJEYXRhKG9wdGlvbnMsIHVzZXJEYXRhLCBwYWdlVG9HZXQ9MSkge1xyXG5cclxuICAgIGNvbnN0IHtcclxuICAgICAgdXNlclByb2ZpbGUsXHJcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgYWRkaXRpb25hbEZpZWxkcyxcclxuICAgICAgJGZpbHRlcixcclxuICAgICAgYXBpVHlwZSxcclxuICAgICAgbWF4UGFnZXMgPSAyMCxcclxuICAgICAgcmVjb3Jkc1BlclBhZ2UgPSAyNVxyXG4gICAgfSA9IG9wdGlvbnM7XHJcblxyXG4gICAgLy8gYWNjdW11bGF0aW9uIG9mIGRhdGFcclxuICAgIHVzZXJEYXRhID0gdXNlckRhdGEgfHwgeyB1c2VyUHJvZmlsZSwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlIH07XHJcblxyXG4gICAgY29uc3QgYWNjZXNzVG9rZW4gICAgICAgICAgPSBhd2FpdCB0aGlzLmdldEFjY2Vzc1Rva2VuKCksXHJcbiAgICAgICAgICB7IGFwaVZlcnNpb24gfSAgICAgICA9IHRoaXMuX2NvbmZpZy5vcHRpb25zLFxyXG4gICAgICAgICAgc2tpcCAgICAgICAgICAgICAgICAgPSAoKHBhZ2VUb0dldCAtMSkgKiByZWNvcmRzUGVyUGFnZSkgKyAxLFxyXG4gICAgICAgICAgLy8gZXh0cmFjdCBzdGF0aWMgcHJvcGVydHkuLi5cclxuICAgICAgICAgIHsgYmFzZUZpZWxkcyB9ICAgICAgID0gdGhpcy5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgIC8vIHBhcmFtZXRlcnMgdG8gcXVlcnkgZW1haWwgd2l0aC4uLlxyXG4gICAgICAgICAgcGFyYW1zICAgICAgICAgICAgICAgPSB7XHJcbiAgICAgICAgICAgICRmaWx0ZXIsXHJcbiAgICAgICAgICAgICR0b3A6ICAgICByZWNvcmRzUGVyUGFnZSxcclxuICAgICAgICAgICAgJHNraXA6ICAgIHNraXAsXHJcbiAgICAgICAgICAgICRzZWxlY3Q6ICBiYXNlRmllbGRzLmpvaW4oJywnKSArIChhZGRpdGlvbmFsRmllbGRzID8gYCwke2FkZGl0aW9uYWxGaWVsZHN9YDogJycpLFxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAvLyBmb3JtYXQgcGFyYW1ldGVycyBmb3IgdXJsXHJcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBfKHBhcmFtcylcclxuICAgICAgLm1hcCgodmFsdWUsIGtleSkgPT4gYCR7a2V5fT0ke3ZhbHVlfWApXHJcbiAgICAgIC5qb2luKCcmJyk7XHJcblxyXG4gICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgIHVyaTogYGh0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tL2FwaS92JHthcGlWZXJzaW9ufS91c2VycygnJHt1c2VyUHJvZmlsZS5lbWFpbEFmdGVyTWFwcGluZ30nKS8ke2FwaVR5cGV9PyR7dXJsUGFyYW1zfWAsXHJcbiAgICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FjY2Vzc1Rva2VufWAsXHJcbiAgICAgICAgQWNjZXB0OiAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb247b2RhdGEubWV0YWRhdGE9bm9uZSdcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICB1c2VyRGF0YS5zdWNjZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHsgdmFsdWU6IHJlY29yZHMgfSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdChyZXF1ZXN0T3B0aW9ucykpIHx8IHt9O1xyXG5cclxuICAgICAgaWYgKHJlY29yZHMgJiYgcGFnZVRvR2V0ID09PSAxKSB7XHJcbiAgICAgICAgdXNlckRhdGEuZGF0YSA9IHJlY29yZHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChyZWNvcmRzICYmIHBhZ2VUb0dldCA+IDEpIHtcclxuICAgICAgICB1c2VyRGF0YS5kYXRhLnB1c2goLi4ucmVjb3Jkcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIHRoZSByZXR1cm5lZCByZXN1bHRzIGFyZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgcmVjb3JkcyBwZXIgcGFnZSxcclxuICAgICAgLy8gd2UgYXJlIG5vdCBkb25lIHlldCwgc28gcmVjdXJzZS4uLlxyXG4gICAgICBpZiAocmVjb3Jkcy5sZW5ndGggPT09IHJlY29yZHNQZXJQYWdlICYmIHBhZ2VUb0dldCA8PSBtYXhQYWdlcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFVzZXJEYXRhKG9wdGlvbnMsIHVzZXJEYXRhLCBwYWdlVG9HZXQgKyAxKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdXNlckRhdGE7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgT2JqZWN0LmFzc2lnbih1c2VyRGF0YSwge1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yTWVzc2FnZTogZXJyLm5hbWUgIT09ICdTdGF0dXNDb2RlRXJyb3InID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZXJyKSAgICAgICAgICA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKGVyci5zdGF0dXNDb2RlICsgJyAtICcsICcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcIi9nLCAnXCInKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1lc3NhZ2VcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59XHJcbiJdfQ==
//# sourceMappingURL=Adapter.js.map
