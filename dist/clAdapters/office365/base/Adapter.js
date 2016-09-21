'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeUuid = require('node-uuid');

var uuid = _interopRequireWildcard(_nodeUuid);

var _crypto = require('crypto');

var crypto = _interopRequireWildcard(_crypto);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _Adapter2 = require('../../base/Adapter');

var _Adapter3 = _interopRequireDefault(_Adapter2);

var _Service = require('./Service');

var _Service2 = _interopRequireDefault(_Service);

var _Configuration = require('./Configuration');

var _Configuration2 = _interopRequireDefault(_Configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */
var Office365BaseAdapter = function (_Adapter) {
  _inherits(Office365BaseAdapter, _Adapter);

  function Office365BaseAdapter() {
    _classCallCheck(this, Office365BaseAdapter);

    return _possibleConstructorReturn(this, (Office365BaseAdapter.__proto__ || Object.getPrototypeOf(Office365BaseAdapter)).apply(this, arguments));
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
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(connectionData) {
        var today, filterStartDate, filterEndDate, data;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var _config, _config$credentials, clientId, tenantId, certificate, certificateThumbprint, apiVersion, tokenRequestUrl, jwtHeader, accessTokenExpires, jwtPayload, encode, encodedJwtHeader, encodedJwtPayload, stringToSign, encodedSignedJwtInfo, tokenRequestFormData, tokenRequestOptions, tokenData, messageData;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
                  return new Buffer(JSON.stringify(header)).toString('base64');
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
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(options, userData) {
        var pageToGet = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        var userProfile, filterStartDate, filterEndDate, additionalFields, $filter, apiType, _options$maxPages, maxPages, _options$recordsPerPa, recordsPerPage, accessToken, apiVersion, skip, baseFields, params, urlParams, requestOptions, _ref5, records, e, recIter, rec, mid, attachmentOptions, attachmentData, _userData$data;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
                  (_userData$data = userData.data).push.apply(_userData$data, _toConsumableArray(records));
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

                Object.assign(userData, {
                  success: false,
                  errorMessage: _context4.t6.name !== 'StatusCodeError' ? JSON.stringify(_context4.t6) : JSON.parse(_context4.t6.message.replace(_context4.t6.statusCode + ' - ', '').replace(/\"/g, '"')).message
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