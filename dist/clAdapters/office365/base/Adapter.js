'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

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
            console.log('Successfully initialized ' + this.name + ' for email: ' + this.credentials.email);
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
  }]);

  return Office365BaseAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365BaseAdapter;
module.exports = exports['default'];

//to see if it really worked, we need to pass in the first result

// expire token in one hour
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2Jhc2UvQWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXVDLFdBQVc7Ozs7c0JBQ1gsUUFBUTs7Ozs4QkFDUixpQkFBaUI7Ozs7c0JBQ2pCLFFBQVE7Ozs7MkJBQ1Isb0JBQW9COzs7O3VCQUNwQixXQUFXOzs7OzZCQUNYLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBR2xDLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUzs7OztBQUNSLGdCQUFJLENBQUMsT0FBTyxHQUFJLCtCQUErQixJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDdkYsZ0JBQUksQ0FBQyxRQUFRLEdBQUcseUJBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7NkNBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFOzs7QUFDMUIsbUJBQU8sQ0FBQyxHQUFHLCtCQUE2QixJQUFJLENBQUMsSUFBSSxvQkFBZSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBRyxDQUFDO2dEQUNuRixJQUFJOzs7Ozs7O0tBQ1o7OztXQUdzQiwyQkFBQyxjQUFjO1VBRzlCLEtBQUssRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLElBQUk7Ozs7QUFMVixnQkFBSSxDQUFDLE9BQU8sR0FBRywrQkFBK0IsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVwRSxpQkFBSyxHQUFhLFNBQWxCLEtBQUs7cUJBQW1CLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtB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RyxHQUFHLGlCQUFpQixHQUFHLEdBQUcsR0FBRyxvQkFBb0I7YUFDMUY7QUFFSywrQkFBbUIsR0FBRztBQUMxQixvQkFBTSxFQUFFLE1BQU07QUFDZCxrQkFBSSxFQUFFLEdBQUc7QUFDVCxpQkFBRyxFQUFFLGVBQWU7QUFDcEIsc0JBQVEsRUFBRSxvQkFBb0I7YUFDL0I7OzZCQUdtQixJQUFJOzs2Q0FBYSxpQ0FBUSxtQkFBbUIsQ0FBQzs7OztBQUF6RCxxQkFBUyxrQkFBUSxLQUFLOztrQkFDeEIsU0FBUyxJQUFJLFNBQVMsQ0FBQyxZQUFZLENBQUE7Ozs7O2dEQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxZQUFZOzs7a0JBRTFDLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDOzs7Ozs7Ozs7O2tCQUc1QyxlQUFVLElBQUksS0FBSyxpQkFBaUIsQ0FBQTs7Ozs7QUFDaEMsdUJBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUM1QixlQUNHLE9BQU8sQ0FDUCxPQUFPLENBQUMsZUFBVSxVQUFVLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUN6QyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUN2QjtrQkFFSyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUM7OztrQkFFdEIsSUFBSSxLQUFLLGdCQUFXOzs7Ozs7O0tBRy9COzs7U0F6SGtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiY2xBZGFwdGVycy9vZmZpY2UzNjUvYmFzZS9BZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHV1aWQgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ25vZGUtdXVpZCc7XG5pbXBvcnQgY3J5cHRvICAgICAgICAgICAgICAgICAgICAgZnJvbSAnY3J5cHRvJztcbmltcG9ydCByZXF1ZXN0ICAgICAgICAgICAgICAgICAgICBmcm9tICdyZXF1ZXN0LXByb21pc2UnO1xuaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgQWRhcHRlciAgICAgICAgICAgICAgICAgICAgZnJvbSAnLi4vLi4vYmFzZS9BZGFwdGVyJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlU2VydmljZSAgICAgICBmcm9tICcuL1NlcnZpY2UnO1xuaW1wb3J0IE9mZmljZTM2NUJhc2VDb25maWd1cmF0aW9uIGZyb20gJy4vQ29uZmlndXJhdGlvbic7XG5cblxuLyoqXG4gKiBDb21tb24gcmVzZXQsIHJ1bkNvbm5lY3Rpb25UZXN0LCBhbmQgZ2V0QWNjZXNzVG9rZW4gbWV0aG9kcy4uLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVCYXNlQWRhcHRlciBleHRlbmRzIEFkYXB0ZXIge1xuXG5cbiAgcmVzZXQoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NvbmZpZztcbiAgICBkZWxldGUgdGhpcy5fc2VydmljZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5fY29uZmlnICA9IG5ldyBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbih0aGlzLmNyZWRlbnRpYWxzLCB7IGFwaVZlcnNpb246ICcxLjAnIH0pXG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBPZmZpY2UzNjVCYXNlU2VydmljZSh0aGlzLl9jb25maWcpO1xuICAgIGF3YWl0IHRoaXMuX3NlcnZpY2UuaW5pdCgpO1xuICAgIGNvbnNvbGUubG9nKGBTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgJHt0aGlzLm5hbWV9IGZvciBlbWFpbDogJHt0aGlzLmNyZWRlbnRpYWxzLmVtYWlsfWApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICBhc3luYyBydW5Db25uZWN0aW9uVGVzdChjb25uZWN0aW9uRGF0YSkge1xuICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbihjb25uZWN0aW9uRGF0YS5jcmVkZW50aWFscyk7XG5cbiAgICBjb25zdCB0b2RheSAgICAgICAgICAgPSAoKSA9PiBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKSxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGUgPSB0b2RheSgpLmFkZCgtMSwgJ2RheXMnKS50b0RhdGUoKSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlICAgPSB0b2RheSgpLnRvRGF0ZSgpLFxuICAgICAgICAgIGRhdGEgICAgICAgICAgICA9IGF3YWl0IHRoaXMuZ2V0QmF0Y2hEYXRhKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3RoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgLy90byBzZWUgaWYgaXQgcmVhbGx5IHdvcmtlZCwgd2UgbmVlZCB0byBwYXNzIGluIHRoZSBmaXJzdCByZXN1bHRcbiAgICByZXR1cm4gZGF0YS5zdWNjZXNzICYmIGRhdGEucmVzdWx0c1swXSA/IGRhdGEucmVzdWx0c1swXTogZGF0YTtcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0QWNjZXNzVG9rZW4oKSB7XG5cbiAgICBpZiAodGhpcy5hY2Nlc3NUb2tlbiAmJiB0aGlzLmFjY2Vzc1Rva2VuRXhwaXJlcyA+IG5ldyBEYXRlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFjY2Vzc1Rva2VuO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGNyZWRlbnRpYWxzIDoge1xuICAgICAgICBjbGllbnRJZCxcbiAgICAgICAgdGVuYW50SWQsXG4gICAgICAgIGNlcnRpZmljYXRlLFxuICAgICAgICBjZXJ0aWZpY2F0ZVRodW1icHJpbnRcbiAgICAgIH0sXG4gICAgICBvcHRpb25zIDoge1xuICAgICAgICBhcGlWZXJzaW9uXG4gICAgICB9XG4gICAgfSA9IHRoaXMuX2NvbmZpZztcblxuICAgIGNvbnN0IHRva2VuUmVxdWVzdFVybCA9IGBodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vJHt0ZW5hbnRJZH0vb2F1dGgyL3Rva2VuP2FwaS12ZXJzaW9uPSR7YXBpVmVyc2lvbn1gO1xuXG4gICAgY29uc3Qgand0SGVhZGVyID0ge1xuICAgICAgJ2FsZyc6ICdSUzI1NicsXG4gICAgICAneDV0JzogY2VydGlmaWNhdGVUaHVtYnByaW50XG4gICAgfTtcblxuICAgIC8vIGV4cGlyZSB0b2tlbiBpbiBvbmUgaG91clxuICAgIGNvbnN0IGFjY2Vzc1Rva2VuRXhwaXJlcyA9ICgobmV3IERhdGUoKSkuZ2V0VGltZSgpICsgMzYwMDAwKSAvIDEwMDA7XG5cbiAgICAvLyBncmFiIG5ldyBhY2Nlc3MgdG9rZW4gMTAgc2Vjb25kcyBiZWZvcmUgZXhwaXJhdGlvblxuICAgIHRoaXMuYWNjZXNzVG9rZW5FeHBpcmVzID0gbmV3IERhdGUoYWNjZXNzVG9rZW5FeHBpcmVzKjEwMDAgLSAxMDAwMCk7XG5cbiAgICBjb25zdCBqd3RQYXlsb2FkID0ge1xuICAgICAgJ2F1ZCc6IHRva2VuUmVxdWVzdFVybCxcbiAgICAgICdleHAnOiBhY2Nlc3NUb2tlbkV4cGlyZXMsXG4gICAgICAnaXNzJzogY2xpZW50SWQsXG4gICAgICAnanRpJzogdXVpZC52NCgpLFxuICAgICAgJ25iZic6IGFjY2Vzc1Rva2VuRXhwaXJlcyAtIDIqMzYwMCwgLy8gb25lIGhvdXIgYmVmb3JlIG5vd1xuICAgICAgJ3N1Yic6IGNsaWVudElkXG4gICAgfTtcblxuICAgIGNvbnN0IGVuY29kZSAgICAgICAgICAgICAgID0gaGVhZGVyID0+IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoaGVhZGVyKSkudG9TdHJpbmcoJ2Jhc2U2NCcpLFxuICAgICAgICAgIGVuY29kZWRKd3RIZWFkZXIgICAgID0gZW5jb2RlKGp3dEhlYWRlciksXG4gICAgICAgICAgZW5jb2RlZEp3dFBheWxvYWQgICAgPSBlbmNvZGUoand0UGF5bG9hZCksXG4gICAgICAgICAgc3RyaW5nVG9TaWduICAgICAgICAgPSBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQsXG4gICAgICAgICAgZW5jb2RlZFNpZ25lZEp3dEluZm8gPSBjcnlwdG9cbiAgICAgICAgICAgIC5jcmVhdGVTaWduKCdSU0EtU0hBMjU2JylcbiAgICAgICAgICAgIC51cGRhdGUoc3RyaW5nVG9TaWduKVxuICAgICAgICAgICAgLnNpZ24oY2VydGlmaWNhdGUsICdiYXNlNjQnKTtcblxuICAgIGNvbnN0IHRva2VuUmVxdWVzdEZvcm1EYXRhID0ge1xuICAgICAgY2xpZW50X2lkOiBjbGllbnRJZCxcbiAgICAgIGNsaWVudF9hc3NlcnRpb25fdHlwZTogJ3VybjppZXRmOnBhcmFtczpvYXV0aDpjbGllbnQtYXNzZXJ0aW9uLXR5cGU6and0LWJlYXJlcicsXG4gICAgICBncmFudF90eXBlOiAnY2xpZW50X2NyZWRlbnRpYWxzJyxcbiAgICAgIHJlc291cmNlOiAnaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vJyxcbiAgICAgIGNsaWVudF9hc3NlcnRpb246IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZCArICcuJyArIGVuY29kZWRTaWduZWRKd3RJbmZvXG4gICAgfTtcblxuICAgIGNvbnN0IHRva2VuUmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgIHVyaTogdG9rZW5SZXF1ZXN0VXJsLFxuICAgICAgZm9ybURhdGE6IHRva2VuUmVxdWVzdEZvcm1EYXRhLFxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdG9rZW5EYXRhID0gSlNPTi5wYXJzZShhd2FpdCByZXF1ZXN0KHRva2VuUmVxdWVzdE9wdGlvbnMpKTtcbiAgICAgIGlmICh0b2tlbkRhdGEgJiYgdG9rZW5EYXRhLmFjY2Vzc190b2tlbikge1xuICAgICAgICByZXR1cm4gdGhpcy5hY2Nlc3NUb2tlbiA9IHRva2VuRGF0YS5hY2Nlc3NfdG9rZW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBnZXQgYWNjZXNzIHRva2VuLicpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKHRva2VuRGF0YSkge1xuICAgICAgaWYgKHRva2VuRGF0YS5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xuICAgICAgICBjb25zdCBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgdG9rZW5EYXRhXG4gICAgICAgICAgICAubWVzc2FnZVxuICAgICAgICAgICAgLnJlcGxhY2UodG9rZW5EYXRhLnN0YXR1c0NvZGUgKyAnIC0gJywgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcIi9nLCAnXCInKVxuICAgICAgICApO1xuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlRGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodG9rZW5EYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuIl19
//# sourceMappingURL=../../../clAdapters/office365/base/Adapter.js.map