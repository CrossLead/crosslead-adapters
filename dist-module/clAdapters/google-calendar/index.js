import _typeof from 'babel-runtime/helpers/typeof';
import _Object$assign from 'babel-runtime/core-js/object/assign';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _extends from 'babel-runtime/helpers/extends';
import _Promise from 'babel-runtime/core-js/promise';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _class, _temp;

import * as googleapis from 'googleapis';
import moment from 'moment';
import * as _ from 'lodash';
import { Adapter, Configuration, Service } from '../base/index';

// google calendar api
var calendar = googleapis.calendar('v3');

var credentialMappings = {
  'certificate': 'private_key',
  'serviceEmail': 'client_email',
  'email': 'adminEmail'
};

var GoogleCalendarAdapter = (_temp = _class = function (_Adapter) {
  _inherits(GoogleCalendarAdapter, _Adapter);

  // constructor needs to call super
  function GoogleCalendarAdapter() {
    _classCallCheck(this, GoogleCalendarAdapter);

    return _possibleConstructorReturn(this, (GoogleCalendarAdapter.__proto__ || _Object$getPrototypeOf(GoogleCalendarAdapter)).call(this));
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
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var credentials, want, alternate, email;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
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
                _Object$keys(credentialMappings).forEach(function (prop) {
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
      var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5() {
        var userProfiles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        var _this2 = this;

        var filterStartDate = arguments[1];
        var filterEndDate /*, fields */ = arguments[2];
        var fieldNameMap, opts, groupRunStats, results;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
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
                  runDate: moment().utc().toDate(),
                  filterStartDate: filterStartDate,
                  filterEndDate: filterEndDate,
                  emails: userProfiles
                };
                _context5.prev = 3;
                _context5.next = 6;
                return _Promise.all(userProfiles.map(function () {
                  var _ref3 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(userProfile) {
                    var individualRunStats, _ret, errorMessage;

                    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            individualRunStats = _extends({
                              filterStartDate: filterStartDate,
                              filterEndDate: filterEndDate
                            }, userProfile, {
                              success: true,
                              runDate: moment().utc().toDate()
                            });
                            _context4.prev = 1;
                            return _context4.delegateYield(_regeneratorRuntime.mark(function _callee3() {
                              var getEvents, _ref5, items, data;

                              return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                                while (1) {
                                  switch (_context3.prev = _context3.next) {
                                    case 0:
                                      _context3.next = 2;
                                      return _this2.authorize(userProfile.emailAfterMapping);

                                    case 2:
                                      opts.auth = _context3.sent;

                                      // function to recurse through pageTokens
                                      getEvents = function () {
                                        var _ref4 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(data) {
                                          var events, _data$items;

                                          return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                                            while (1) {
                                              switch (_context2.prev = _context2.next) {
                                                case 0:
                                                  _context2.next = 2;
                                                  return new _Promise(function (res, rej) {
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
                                          var email = attendee.email,
                                              responseStatus = attendee.responseStatus;

                                          return { address: email, response: responseStatus };
                                        });

                                        return out;
                                      });

                                      // request all events for this user in the given time frame

                                      return _context3.abrupt('return', {
                                        v: _Object$assign(individualRunStats, { data: data })
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

                            return _context4.abrupt('return', _Object$assign(individualRunStats, {
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
                return _context5.abrupt('return', _Object$assign(groupRunStats, { results: results }));

              case 10:
                _context5.prev = 10;
                _context5.t0 = _context5['catch'](3);
                return _context5.abrupt('return', _Object$assign(groupRunStats, {
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
      var _ref6 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6() {
        var email, data, firstResult;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                email = this.credentials.email;
                _context6.prev = 1;
                _context6.next = 4;
                return this.getBatchData([{ email: email, emailAfterMapping: email }], moment().add(-1, 'day').toDate(), moment().toDate());

              case 4:
                data = _context6.sent;
                firstResult = Array.isArray(data.results) && data.results[0];

                if (!(firstResult && firstResult.errorMessage)) {
                  _context6.next = 10;
                  break;
                }

                return _context6.abrupt('return', {
                  success: false,
                  message: firstResult.errorMessage
                });

              case 10:
                return _context6.abrupt('return', {
                  success: true
                });

              case 11:
                _context6.next = 17;
                break;

              case 13:
                _context6.prev = 13;
                _context6.t0 = _context6['catch'](1);

                console.log(_context6.t0.stack || _context6.t0);
                return _context6.abrupt('return', {
                  message: _context6.t0.message,
                  success: false
                });

              case 17:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[1, 13]]);
      }));

      function runConnectionTest() {
        return _ref6.apply(this, arguments);
      }

      return runConnectionTest;
    }()
  }, {
    key: 'runMessageTest',
    value: function () {
      var _ref7 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee7() {
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
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
      var _ref8 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee8(email) {
        var _credentials, serviceEmail, certificate, auth;

        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _credentials = this.credentials, serviceEmail = _credentials.serviceEmail, certificate = _credentials.certificate;
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

                return _context8.abrupt('return', new _Promise(function (res, rej) {
                  return auth.authorize(function (err) {
                    err ? rej(err) : res(auth);
                  });
                }));

              case 3:
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
}(Adapter), _class.Configuration = Configuration, _class.Service = Service, _class.fieldNameMap = {
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
}, _temp);
export { GoogleCalendarAdapter as default };
//# sourceMappingURL=../../clAdapters/google-calendar/index.js.map