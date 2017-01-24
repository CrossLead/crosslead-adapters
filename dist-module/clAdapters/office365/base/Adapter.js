import _Object$assign from 'babel-runtime/core-js/object/assign';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import * as uuid from 'node-uuid';
import * as crypto from 'crypto';
import request from 'request-promise';
import moment from 'moment';
import _ from 'lodash';
import Adapter from '../../base/Adapter';
import Office365BaseService from './Service';
import Office365BaseConfiguration from './Configuration';

/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */

var Office365BaseAdapter = function (_Adapter) {
  _inherits(Office365BaseAdapter, _Adapter);

  function Office365BaseAdapter() {
    _classCallCheck(this, Office365BaseAdapter);

    return _possibleConstructorReturn(this, (Office365BaseAdapter.__proto__ || _Object$getPrototypeOf(Office365BaseAdapter)).apply(this, arguments));
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
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this._config = new Office365BaseConfiguration(this.credentials);
                this._service = new Office365BaseService(this._config);
                _context.next = 4;
                return this._service.init();

              case 4:
                console.log('Successfully initialized ' + this.constructor.name + ' for email: ' + this.credentials.email);
                return _context.abrupt('return', this);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: 'runConnectionTest',
    value: function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(connectionData) {
        var today, filterStartDate, filterEndDate, data;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this._config = new Office365BaseConfiguration(connectionData.credentials);

                today = function today() {
                  return moment().utc().startOf('day');
                };

                filterStartDate = today().add(-1, 'days').toDate();
                filterEndDate = today().toDate();
                _context2.next = 6;
                return this.getBatchData([{
                  email: this._config.credentials.email,
                  emailAfterMapping: this._config.credentials.email
                }], filterStartDate, filterEndDate, '');

              case 6:
                data = _context2.sent;
                return _context2.abrupt('return', data.success && data.results[0] ? data.results[0] : data);

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function runConnectionTest(_x) {
        return _ref2.apply(this, arguments);
      }

      return runConnectionTest;
    }()
  }, {
    key: 'getAccessToken',
    value: function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3() {
        var _config, _config$credentials, clientId, tenantId, certificate, certificateThumbprint, apiVersion, tokenRequestUrl, jwtHeader, accessTokenExpires, jwtPayload, encode, encodedJwtHeader, encodedJwtPayload, stringToSign, encodedSignedJwtInfo, tokenRequestFormData, tokenRequestOptions, tokenData, messageData;

        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(this.accessToken && this.accessTokenExpires > new Date())) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt('return', this.accessToken);

              case 2:
                _config = this._config, _config$credentials = _config.credentials, clientId = _config$credentials.clientId, tenantId = _config$credentials.tenantId, certificate = _config$credentials.certificate, certificateThumbprint = _config$credentials.certificateThumbprint, apiVersion = _config.options.apiVersion;
                tokenRequestUrl = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token?api-version=' + apiVersion;
                jwtHeader = {
                  'alg': 'RS256',
                  'x5t': certificateThumbprint
                };

                // expire token in one hour

                accessTokenExpires = (new Date().getTime() + 360000) / 1000;

                // grab new access token 10 seconds before expiration

                this.accessTokenExpires = new Date(accessTokenExpires * 1000 - 10000);

                jwtPayload = {
                  'aud': tokenRequestUrl,
                  'exp': accessTokenExpires,
                  'iss': clientId,
                  'jti': uuid.v4(),
                  'nbf': accessTokenExpires - 2 * 3600, // one hour before now
                  'sub': clientId
                };
                encode = function encode(header) {
                  return new Buffer(_JSON$stringify(header)).toString('base64');
                }, encodedJwtHeader = encode(jwtHeader), encodedJwtPayload = encode(jwtPayload), stringToSign = encodedJwtHeader + '.' + encodedJwtPayload, encodedSignedJwtInfo = crypto.createSign('RSA-SHA256').update(stringToSign).sign(certificate, 'base64');
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
                _context3.prev = 11;
                _context3.t0 = JSON;
                _context3.next = 15;
                return request(tokenRequestOptions);

              case 15:
                _context3.t1 = _context3.sent;
                tokenData = _context3.t0.parse.call(_context3.t0, _context3.t1);

                if (!(tokenData && tokenData.access_token)) {
                  _context3.next = 21;
                  break;
                }

                return _context3.abrupt('return', this.accessToken = tokenData.access_token);

              case 21:
                throw new Error('Could not get access token.');

              case 22:
                _context3.next = 32;
                break;

              case 24:
                _context3.prev = 24;
                _context3.t2 = _context3['catch'](11);

                if (!(_context3.t2.name === 'StatusCodeError')) {
                  _context3.next = 31;
                  break;
                }

                messageData = JSON.parse(_context3.t2.message.replace(_context3.t2.statusCode + ' - ', '').replace(/\"/g, '"'));
                throw new Error(messageData);

              case 31:
                throw new Error(_context3.t2);

              case 32:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[11, 24]]);
      }));

      function getAccessToken() {
        return _ref3.apply(this, arguments);
      }

      return getAccessToken;
    }()
  }, {
    key: 'getUserData',
    value: function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(options, userData) {
        var pageToGet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        var userProfile, filterStartDate, filterEndDate, additionalFields, $filter, apiType, _options$maxPages, maxPages, _options$recordsPerPa, recordsPerPage, accessToken, apiVersion, skip, baseFields, params, urlParams, requestOptions, _ref5, records, e, recIter, rec, mid, attachmentOptions, attachmentData, _userData$data;

        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                userProfile = options.userProfile, filterStartDate = options.filterStartDate, filterEndDate = options.filterEndDate, additionalFields = options.additionalFields, $filter = options.$filter, apiType = options.apiType, _options$maxPages = options.maxPages, maxPages = _options$maxPages === undefined ? 20 : _options$maxPages, _options$recordsPerPa = options.recordsPerPage, recordsPerPage = _options$recordsPerPa === undefined ? 25 : _options$recordsPerPa;

                // accumulation of data

                userData = userData || { userProfile: userProfile, filterStartDate: filterStartDate, filterEndDate: filterEndDate };

                _context4.next = 4;
                return this.getAccessToken();

              case 4:
                accessToken = _context4.sent;
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
                urlParams = _(params).map(function (value, key) {
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
                _context4.prev = 12;

                userData.success = true;

                _context4.t1 = JSON;
                _context4.next = 17;
                return request(requestOptions);

              case 17:
                _context4.t2 = _context4.sent;
                _context4.t0 = _context4.t1.parse.call(_context4.t1, _context4.t2);

                if (_context4.t0) {
                  _context4.next = 21;
                  break;
                }

                _context4.t0 = {};

              case 21:
                _ref5 = _context4.t0;
                records = _ref5.value;
                e = userProfile.emailAfterMapping;

                if (!(userProfile.getAttachments && records.length)) {
                  _context4.next = 43;
                  break;
                }

                recIter = 0;

              case 26:
                if (!(recIter < records.length)) {
                  _context4.next = 43;
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
                _context4.t4 = JSON;
                _context4.next = 34;
                return request(attachmentOptions);

              case 34:
                _context4.t5 = _context4.sent;
                _context4.t3 = _context4.t4.parse.call(_context4.t4, _context4.t5);

                if (_context4.t3) {
                  _context4.next = 38;
                  break;
                }

                _context4.t3 = {};

              case 38:
                attachmentData = _context4.t3;

                if (attachmentData.value && attachmentData.value.length > 0) {
                  rec.attachments = attachmentData.value;
                }

              case 40:
                recIter++;
                _context4.next = 26;
                break;

              case 43:

                if (records && pageToGet === 1) {
                  userData.data = records;
                }

                if (records && pageToGet > 1) {
                  (_userData$data = userData.data).push.apply(_userData$data, _toConsumableArray(records));
                }

                // if the returned results are the maximum number of records per page,
                // we are not done yet, so recurse...

                if (!(records.length === recordsPerPage && pageToGet <= maxPages)) {
                  _context4.next = 49;
                  break;
                }

                return _context4.abrupt('return', this.getUserData(options, userData, pageToGet + 1));

              case 49:
                return _context4.abrupt('return', userData);

              case 50:
                _context4.next = 56;
                break;

              case 52:
                _context4.prev = 52;
                _context4.t6 = _context4['catch'](12);

                _Object$assign(userData, {
                  success: false,
                  errorMessage: _context4.t6.name !== 'StatusCodeError' ? _JSON$stringify(_context4.t6) : JSON.parse(_context4.t6.message.replace(_context4.t6.statusCode + ' - ', '').replace(/\"/g, '"')).message
                });
                return _context4.abrupt('return', true);

              case 56:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[12, 52]]);
      }));

      function getUserData(_x3, _x4) {
        return _ref4.apply(this, arguments);
      }

      return getUserData;
    }()
  }]);

  return Office365BaseAdapter;
}(Adapter);

export { Office365BaseAdapter as default };
//# sourceMappingURL=../../../clAdapters/office365/base/Adapter.js.map