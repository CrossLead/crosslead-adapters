'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _googleapis = require('googleapis');

var googleapis = _interopRequireWildcard(_googleapis);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _index = require('../base/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// google calendar api
var calendar = googleapis.calendar('v3');

var credentialMappings = {
  'certificate': 'private_key',
  'serviceEmail': 'client_email',
  'email': 'adminEmail'
};

var GoogleCalendarAdapter = function (_Adapter) {
  _inherits(GoogleCalendarAdapter, _Adapter);

  // constructor needs to call super
  function GoogleCalendarAdapter() {
    _classCallCheck(this, GoogleCalendarAdapter);

    return _possibleConstructorReturn(this, (GoogleCalendarAdapter.__proto__ || Object.getPrototypeOf(GoogleCalendarAdapter)).call(this));
  }

  // convert the names of the api response data


  _createClass(GoogleCalendarAdapter, [{
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
        var credentials, want, alternate, email;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                credentials = this.credentials;

                if (credentials) {
                  _context.next = 3;
                  break;
                }

                throw new Error('credentials required for adapter.');

              case 3:

                // map Google json keys to keys used in this library
                for (want in credentialMappings) {
                  alternate = credentialMappings[want];

                  if (!credentials[want]) {
                    credentials[want] = credentials[alternate];
                  }
                }

                // validate required credential properties
                Object.keys(credentialMappings).forEach(function (prop) {
                  if (!credentials[prop]) {
                    throw new Error('Property ' + prop + ' required in adapter credentials!');
                  }
                });

                this._config = new GoogleCalendarAdapter.Configuration(credentials);
                this._service = new GoogleCalendarAdapter.Service(this._config);

                _context.next = 9;
                return this._service.init();

              case 9:
                email = credentials.serviceEmail;


                console.log('Successfully initialized google calendar adapter for email: ' + email);

                return _context.abrupt('return', this);

              case 12:
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

    // currently doing nothing with fields here, but keeping as placeholder

  }, {
    key: 'getBatchData',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var userProfiles = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var _this2 = this;

        var filterStartDate = arguments[1];
        var filterEndDate /*, fields */ = arguments[2];
        var fieldNameMap, opts, groupRunStats, results;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                fieldNameMap = this.constructor.fieldNameMap;

                // api options...
                // https://developers.google.com/google-apps/calendar/v3/

                opts = {
                  alwaysIncludeEmail: true,
                  calendarId: 'primary',
                  singleEvents: true,
                  timeMax: filterEndDate.toISOString(),
                  timeMin: filterStartDate.toISOString(),
                  orderBy: 'startTime'
                };
                groupRunStats = {
                  success: true,
                  runDate: (0, _moment2.default)().utc().toDate(),
                  filterStartDate: filterStartDate,
                  filterEndDate: filterEndDate,
                  emails: userProfiles
                };
                _context5.prev = 3;
                _context5.next = 6;
                return Promise.all(userProfiles.map(function () {
                  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(userProfile) {
                    var individualRunStats, _ret, errorMessage;

                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            individualRunStats = _extends({
                              filterStartDate: filterStartDate,
                              filterEndDate: filterEndDate
                            }, userProfile, {
                              success: true,
                              runDate: (0, _moment2.default)().utc().toDate()
                            });
                            _context4.prev = 1;
                            return _context4.delegateYield(regeneratorRuntime.mark(function _callee3() {
                              var getEvents, _ref5, items, data;

                              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                while (1) {
                                  switch (_context3.prev = _context3.next) {
                                    case 0:
                                      _context3.next = 2;
                                      return _this2.authorize(userProfile.emailAfterMapping);

                                    case 2:
                                      opts.auth = _context3.sent;

                                      // function to recurse through pageTokens
                                      getEvents = function () {
                                        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(data) {
                                          var events, _data$items;

                                          return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                            while (1) {
                                              switch (_context2.prev = _context2.next) {
                                                case 0:
                                                  _context2.next = 2;
                                                  return new Promise(function (res, rej) {
                                                    // add page token if given
                                                    if (data && data.nextPageToken) {
                                                      opts.pageToken = data.nextPageToken;
                                                    }

                                                    calendar.events.list(opts, function (err, d) {
                                                      return err ? rej(err) : res(d);
                                                    });
                                                  });

                                                case 2:
                                                  events = _context2.sent;


                                                  // if we already have data being accumulated, add to items
                                                  if (data) {
                                                    (_data$items = data.items).push.apply(_data$items, _toConsumableArray(events.items));
                                                  } else {
                                                    data = events;
                                                  }

                                                  // if there is a token for the next page, continue...

                                                  if (!events.nextPageToken) {
                                                    _context2.next = 9;
                                                    break;
                                                  }

                                                  data.nextPageToken = events.nextPageToken;
                                                  _context2.next = 8;
                                                  return getEvents(data);

                                                case 8:
                                                  return _context2.abrupt('return', _context2.sent);

                                                case 9:
                                                  return _context2.abrupt('return', data);

                                                case 10:
                                                case 'end':
                                                  return _context2.stop();
                                              }
                                            }
                                          }, _callee2, _this2);
                                        }));

                                        return function getEvents(_x3) {
                                          return _ref4.apply(this, arguments);
                                        };
                                      }();

                                      _context3.next = 6;
                                      return getEvents();

                                    case 6:
                                      _ref5 = _context3.sent;
                                      items = _ref5.items;
                                      data = _.map(items, function (item) {

                                        var out = {};

                                        _.each(fieldNameMap, function (have, want) {
                                          var modified = _.get(item, have);
                                          if (/^dateTime/.test(want)) {
                                            modified = new Date(modified);
                                          }
                                          if (modified !== undefined) {
                                            out[want] = modified;
                                          }
                                        });

                                        var attendeeSelf = _.find(out.attendees, function (attendee) {
                                          return attendee.self;
                                        });

                                        if (attendeeSelf) {
                                          out.responseStatus = attendeeSelf.responseStatus;
                                        }

                                        out.attendees = _.map(out.attendees, function (attendee) {
                                          var email = attendee.email;
                                          var responseStatus = attendee.responseStatus;

                                          return { address: email, response: responseStatus };
                                        });

                                        return out;
                                      });

                                      // request all events for this user in the given time frame

                                      return _context3.abrupt('return', {
                                        v: Object.assign(individualRunStats, { data: data })
                                      });

                                    case 10:
                                    case 'end':
                                      return _context3.stop();
                                  }
                                }
                              }, _callee3, _this2);
                            })(), 't0', 3);

                          case 3:
                            _ret = _context4.t0;

                            if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                              _context4.next = 6;
                              break;
                            }

                            return _context4.abrupt('return', _ret.v);

                          case 6:
                            _context4.next = 14;
                            break;

                          case 8:
                            _context4.prev = 8;
                            _context4.t1 = _context4['catch'](1);

                            // if the batch collection failed...
                            console.log('GoogleCalendarAdapter.getBatchData Error:', _context4.t1.stack);

                            errorMessage = _context4.t1;


                            if (/invalid_grant/.test(errorMessage.toString())) {
                              errorMessage = 'Email address: ' + userProfile.emailAfterMapping + ' not found in this Google Calendar account.';
                            }

                            return _context4.abrupt('return', Object.assign(individualRunStats, {
                              errorMessage: errorMessage,
                              success: false,
                              data: []
                            }));

                          case 14:
                          case 'end':
                            return _context4.stop();
                        }
                      }
                    }, _callee4, _this2, [[1, 8]]);
                  }));

                  return function (_x2) {
                    return _ref3.apply(this, arguments);
                  };
                }()));

              case 6:
                results = _context5.sent;
                return _context5.abrupt('return', Object.assign(groupRunStats, { results: results }));

              case 10:
                _context5.prev = 10;
                _context5.t0 = _context5['catch'](3);
                return _context5.abrupt('return', Object.assign(groupRunStats, {
                  errorMessage: _context5.t0,
                  success: false
                }));

              case 13:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[3, 10]]);
      }));

      function getBatchData() {
        return _ref2.apply(this, arguments);
      }

      return getBatchData;
    }()
  }, {
    key: 'runConnectionTest',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        var email, data;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                email = this.credentials.email;
                _context6.prev = 1;
                _context6.next = 4;
                return this.getBatchData([{ email: email, emailAfterMapping: email }], (0, _moment2.default)().toDate(), (0, _moment2.default)().add(-1, 'day').toDate());

              case 4:
                data = _context6.sent;
                return _context6.abrupt('return', data);

              case 8:
                _context6.prev = 8;
                _context6.t0 = _context6['catch'](1);

                console.log(_context6.t0.stack || _context6.t0);
                return _context6.abrupt('return', {
                  error: _context6.t0,
                  success: false
                });

              case 12:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[1, 8]]);
      }));

      function runConnectionTest() {
        return _ref6.apply(this, arguments);
      }

      return runConnectionTest;
    }()
  }, {
    key: 'runMessageTest',
    value: function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                // TODO: does this need to be different?
                console.warn('Note: runMessageTest() currently calls runConnectionTest()');
                return _context7.abrupt('return', this.runConnectionTest());

              case 2:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function runMessageTest() {
        return _ref7.apply(this, arguments);
      }

      return runMessageTest;
    }()

    // create authenticated token for api requests for given user

  }, {
    key: 'authorize',
    value: function () {
      var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(email) {
        var _credentials, serviceEmail, certificate, auth;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _credentials = this.credentials;
                serviceEmail = _credentials.serviceEmail;
                certificate = _credentials.certificate;
                auth = new googleapis.auth.JWT(
                // email of google app admin...
                serviceEmail,
                // no need for keyFile...
                null,
                // the private key itself...
                certificate,
                // scopes...
                ['https://www.googleapis.com/auth/calendar.readonly'],
                // the email of the individual we want to authenticate
                // ('sub' property of the json web token)
                email);

                // await authorization

                return _context8.abrupt('return', new Promise(function (res, rej) {
                  return auth.authorize(function (err) {
                    err ? rej(err) : res(auth);
                  });
                }));

              case 5:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function authorize(_x4) {
        return _ref8.apply(this, arguments);
      }

      return authorize;
    }()
  }]);

  return GoogleCalendarAdapter;
}(_index.Adapter);

GoogleCalendarAdapter.Configuration = _index.Configuration;
GoogleCalendarAdapter.Service = _index.Service;
GoogleCalendarAdapter.fieldNameMap = {
  // Desired...                          // Given...
  'eventId': 'id',
  'attendees': 'attendees',
  'dateTimeCreated': 'created',
  'dateTimeLastModified': 'updated',
  'attendeeAddress': 'EmailAddress.Address',
  'attendeeName': 'EmailAddress.Name',
  'iCalUId': 'iCalUID',
  'location': 'location',
  'status': 'status',
  'isCreator': 'creator.self',
  'isOrganizer': 'organizer.self',
  'organizerEmail': 'organizer.email',
  'recurrance': 'recurrance',
  'responseStatus': 'responseStatus',
  'dateTimeStart': 'start.dateTime',
  'dateTimeEnd': 'end.dateTime',
  'subject': 'summary',
  'url': 'htmlLink',
  'hangoutLink': 'hangoutLink',
  'privacy': 'visibility'
};
exports.default = GoogleCalendarAdapter;
//# sourceMappingURL=../../clAdapters/google-calendar/index.js.map