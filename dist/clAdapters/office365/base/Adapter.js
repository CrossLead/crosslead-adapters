'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

var _nodeUuid = require('node-uuid');

var uuid = _interopRequireWildcard(_nodeUuid);

var _crypto = require('crypto');

var crypto = _interopRequireWildcard(_crypto);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Adapter2 = require('../../base/Adapter');

var _Adapter3 = _interopRequireDefault(_Adapter2);

var _Service = require('./Service');

var _Service2 = _interopRequireDefault(_Service);

var _Configuration = require('./Configuration');

var _Configuration2 = _interopRequireDefault(_Configuration);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */
var Office365BaseAdapter = function (_Adapter) {
  (0, _inherits3.default)(Office365BaseAdapter, _Adapter);

  function Office365BaseAdapter() {
    (0, _classCallCheck3.default)(this, Office365BaseAdapter);
    return (0, _possibleConstructorReturn3.default)(this, (Office365BaseAdapter.__proto__ || (0, _getPrototypeOf2.default)(Office365BaseAdapter)).apply(this, arguments));
  }

  (0, _createClass3.default)(Office365BaseAdapter, [{
    key: 'reset',
    value: function reset() {
      delete this._config;
      delete this._service;
      return this;
    }
  }, {
    key: 'init',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this._config = new _Configuration2.default(this.credentials);
                this._service = new _Service2.default(this._config);
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
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(connectionData) {
        var today, filterStartDate, filterEndDate, data;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this._config = new _Configuration2.default(connectionData.credentials);

                today = function today() {
                  return (0, _moment2.default)().utc().startOf('day');
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
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        var _config, _config$credentials, clientId, tenantId, certificate, certificateThumbprint, apiVersion, tokenRequestUrl, jwtHeader, accessTokenExpires, jwtPayload, encode, encodedJwtHeader, encodedJwtPayload, stringToSign, encodedSignedJwtInfo, tokenRequestFormData, tokenRequestOptions, tokenData, messageData;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(this.accessToken && this.accessTokenExpires > new Date())) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt('return', this.accessToken);

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
                  return new Buffer((0, _stringify2.default)(header)).toString('base64');
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
                _context3.prev = 17;
                _context3.t0 = JSON;
                _context3.next = 21;
                return (0, _requestPromise2.default)(tokenRequestOptions);

              case 21:
                _context3.t1 = _context3.sent;
                tokenData = _context3.t0.parse.call(_context3.t0, _context3.t1);

                if (!(tokenData && tokenData.access_token)) {
                  _context3.next = 27;
                  break;
                }

                return _context3.abrupt('return', this.accessToken = tokenData.access_token);

              case 27:
                throw new Error('Could not get access token.');

              case 28:
                _context3.next = 38;
                break;

              case 30:
                _context3.prev = 30;
                _context3.t2 = _context3['catch'](17);

                if (!(_context3.t2.name === 'StatusCodeError')) {
                  _context3.next = 37;
                  break;
                }

                messageData = JSON.parse(_context3.t2.message.replace(_context3.t2.statusCode + ' - ', '').replace(/\"/g, '"'));
                throw new Error(messageData);

              case 37:
                throw new Error(_context3.t2);

              case 38:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[17, 30]]);
      }));

      function getAccessToken() {
        return _ref3.apply(this, arguments);
      }

      return getAccessToken;
    }()
  }, {
    key: 'getUserData',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(options, userData) {
        var pageToGet = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        var userProfile, filterStartDate, filterEndDate, additionalFields, $filter, apiType, _options$maxPages, maxPages, _options$recordsPerPa, recordsPerPage, accessToken, apiVersion, skip, baseFields, params, urlParams, requestOptions, _ref5, records, e, recIter, rec, mid, attachmentOptions, attachmentData, _userData$data;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                userProfile = options.userProfile;
                filterStartDate = options.filterStartDate;
                filterEndDate = options.filterEndDate;
                additionalFields = options.additionalFields;
                $filter = options.$filter;
                apiType = options.apiType;
                _options$maxPages = options.maxPages;
                maxPages = _options$maxPages === undefined ? 20 : _options$maxPages;
                _options$recordsPerPa = options.recordsPerPage;
                recordsPerPage = _options$recordsPerPa === undefined ? 25 : _options$recordsPerPa;

                // accumulation of data

                userData = userData || { userProfile: userProfile, filterStartDate: filterStartDate, filterEndDate: filterEndDate };

                _context4.next = 13;
                return this.getAccessToken();

              case 13:
                accessToken = _context4.sent;
                apiVersion = this._config.options.apiVersion;
                skip = (pageToGet - 1) * recordsPerPage;

                // extract static property...
                baseFields = this.constructor.baseFields;

                // parameters to query email with...
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
                urlParams = (0, _lodash2.default)(params).map(function (value, key) {
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
                _context4.prev = 21;

                userData.success = true;

                _context4.t1 = JSON;
                _context4.next = 26;
                return (0, _requestPromise2.default)(requestOptions);

              case 26:
                _context4.t2 = _context4.sent;
                _context4.t0 = _context4.t1.parse.call(_context4.t1, _context4.t2);

                if (_context4.t0) {
                  _context4.next = 30;
                  break;
                }

                _context4.t0 = {};

              case 30:
                _ref5 = _context4.t0;
                records = _ref5.value;
                e = userProfile.emailAfterMapping;

                if (!(userProfile.getAttachments && records.length)) {
                  _context4.next = 52;
                  break;
                }

                recIter = 0;

              case 35:
                if (!(recIter < records.length)) {
                  _context4.next = 52;
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
                _context4.next = 43;
                return (0, _requestPromise2.default)(attachmentOptions);

              case 43:
                _context4.t5 = _context4.sent;
                _context4.t3 = _context4.t4.parse.call(_context4.t4, _context4.t5);

                if (_context4.t3) {
                  _context4.next = 47;
                  break;
                }

                _context4.t3 = {};

              case 47:
                attachmentData = _context4.t3;

                if (attachmentData.value && attachmentData.value.length > 0) {
                  rec.attachments = attachmentData.value;
                }

              case 49:
                recIter++;
                _context4.next = 35;
                break;

              case 52:

                if (records && pageToGet === 1) {
                  userData.data = records;
                }

                if (records && pageToGet > 1) {
                  (_userData$data = userData.data).push.apply(_userData$data, (0, _toConsumableArray3.default)(records));
                }

                // if the returned results are the maximum number of records per page,
                // we are not done yet, so recurse...

                if (!(records.length === recordsPerPage && pageToGet <= maxPages)) {
                  _context4.next = 58;
                  break;
                }

                return _context4.abrupt('return', this.getUserData(options, userData, pageToGet + 1));

              case 58:
                return _context4.abrupt('return', userData);

              case 59:
                _context4.next = 65;
                break;

              case 61:
                _context4.prev = 61;
                _context4.t6 = _context4['catch'](21);

                (0, _assign2.default)(userData, {
                  success: false,
                  errorMessage: _context4.t6.name !== 'StatusCodeError' ? (0, _stringify2.default)(_context4.t6) : JSON.parse(_context4.t6.message.replace(_context4.t6.statusCode + ' - ', '').replace(/\"/g, '"')).message
                });
                return _context4.abrupt('return', true);

              case 65:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[21, 61]]);
      }));

      function getUserData(_x3, _x4) {
        return _ref4.apply(this, arguments);
      }

      return getUserData;
    }()
  }]);
  return Office365BaseAdapter;
}(_Adapter3.default);

exports.default = Office365BaseAdapter;
//# sourceMappingURL=../../../clAdapters/office365/base/Adapter.js.map