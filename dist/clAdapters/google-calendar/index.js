'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _googleapis = require('googleapis');

var _googleapis2 = _interopRequireDefault(_googleapis);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _base = require('../base/');

// google calendar api
var calendar = _googleapis2['default'].calendar('v3');

var credentialMappings = {
  'certificate': 'private_key',
  'serviceEmail': 'client_email',
  'email': 'adminEmail'
};

var GoogleCalendarAdapter = (function (_Adapter) {
  _inherits(GoogleCalendarAdapter, _Adapter);

  _createClass(GoogleCalendarAdapter, null, [{
    key: 'Configuration',
    value: _base.Configuration,
    enumerable: true
  }, {
    key: 'Service',
    value: _base.Service,

    // convert the names of the api response data
    enumerable: true
  }, {
    key: 'fieldNameMap',
    value: {
      // Desired...                          // Given...
      'eventId': 'id',
      'attendees': 'attendees',
      'dateTimeCreated': 'created',
      'dateTimeLastModified': 'updated',
      'attendeeAddress': 'EmailAddress.Address',
      'attendeeName': 'EmailAddress.Name',
      'iCalUID': 'iCalUID',
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
      'hangoutLink': 'hangoutLink'
    },

    // constructor needs to call super
    enumerable: true
  }]);

  function GoogleCalendarAdapter() {
    _classCallCheck(this, GoogleCalendarAdapter);

    _get(Object.getPrototypeOf(GoogleCalendarAdapter.prototype), 'constructor', this).call(this);
  }

  _createClass(GoogleCalendarAdapter, [{
    key: 'reset',
    value: function reset() {
      delete this._config;
      delete this._service;
      return this;
    }
  }, {
    key: 'init',
    value: function init() {
      var credentials, want, alternate, email;
      return _regeneratorRuntime.async(function init$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            credentials = this.credentials;

            if (credentials) {
              context$2$0.next = 3;
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

            context$2$0.next = 9;
            return _regeneratorRuntime.awrap(this._service.init());

          case 9:
            email = credentials.serviceEmail;

            console.log('Successfully initialized google calendar adapter for email: ' + email);

            return context$2$0.abrupt('return', this);

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    // currently doing nothing with fields here, but keeping as placeholder
  }, {
    key: 'getBatchData',
    value: function getBatchData(userProfiles, filterStartDate, filterEndDate /*, fields */) {
      if (userProfiles === undefined) userProfiles = [];
      var fieldNameMap, opts, groupRunStats, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this3 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            fieldNameMap = this.constructor.fieldNameMap;
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
              runDate: (0, _moment2['default'])().utc().toDate(),
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              emails: userProfiles
            };
            context$2$0.prev = 3;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(_Promise.all(userProfiles.map(function callee$2$0(userProfile) {
              var individualRunStats, _ret, errorMessage;

              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                var _this2 = this;

                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    individualRunStats = _extends({
                      filterStartDate: filterStartDate,
                      filterEndDate: filterEndDate
                    }, userProfile, {
                      success: true,
                      runDate: (0, _moment2['default'])().utc().toDate()
                    });
                    context$3$0.prev = 1;
                    context$3$0.next = 4;
                    return _regeneratorRuntime.awrap((function callee$3$0() {
                      var getEvents, _ref, items, data;

                      return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                        var _this = this;

                        while (1) switch (context$4$0.prev = context$4$0.next) {
                          case 0:
                            context$4$0.next = 2;
                            return _regeneratorRuntime.awrap(this.authorize(userProfile.emailAfterMapping));

                          case 2:
                            opts.auth = context$4$0.sent;

                            getEvents = function getEvents(data) {
                              var results, _data$items;

                              return _regeneratorRuntime.async(function getEvents$(context$5$0) {
                                while (1) switch (context$5$0.prev = context$5$0.next) {
                                  case 0:
                                    context$5$0.next = 2;
                                    return _regeneratorRuntime.awrap(new _Promise(function (res, rej) {
                                      // add page token if given
                                      if (data && data.nextPageToken) {
                                        opts.pageToken = data.nextPageToken;
                                      }

                                      calendar.events.list(opts, function (err, data) {
                                        return err ? rej(err) : res(data);
                                      });
                                    }));

                                  case 2:
                                    results = context$5$0.sent;

                                    // if we already have data being accumulated, add to items
                                    if (data) {
                                      (_data$items = data.items).push.apply(_data$items, _toConsumableArray(results.items));
                                    } else {
                                      data = results;
                                    }

                                    // if there is a token for the next page, continue...

                                    if (!results.nextPageToken) {
                                      context$5$0.next = 9;
                                      break;
                                    }

                                    data.nextPageToken = results.nextPageToken;
                                    context$5$0.next = 8;
                                    return _regeneratorRuntime.awrap(getEvents(data));

                                  case 8:
                                    return context$5$0.abrupt('return', context$5$0.sent);

                                  case 9:
                                    return context$5$0.abrupt('return', data);

                                  case 10:
                                  case 'end':
                                    return context$5$0.stop();
                                }
                              }, null, _this);
                            };

                            context$4$0.next = 6;
                            return _regeneratorRuntime.awrap(getEvents());

                          case 6:
                            _ref = context$4$0.sent;
                            items = _ref.items;
                            data = _lodash2['default'].map(items, function (item) {

                              var out = {};

                              _lodash2['default'].each(fieldNameMap, function (have, want) {
                                var modified = _lodash2['default'].get(item, have);
                                if (/^dateTime/.test(want)) {
                                  modified = new Date(modified);
                                }
                                if (modified !== undefined) {
                                  out[want] = modified;
                                }
                              });

                              out.attendees = _lodash2['default'].map(out.attendees, function (attendee) {
                                var email = attendee.email;
                                var responseStatus = attendee.responseStatus;

                                return { address: email, response: responseStatus };
                              });

                              return out;
                            });
                            return context$4$0.abrupt('return', {
                              v: _Object$assign(individualRunStats, { data: data })
                            });

                          case 10:
                          case 'end':
                            return context$4$0.stop();
                        }
                      }, null, _this2);
                    })());

                  case 4:
                    _ret = context$3$0.sent;

                    if (!(typeof _ret === 'object')) {
                      context$3$0.next = 7;
                      break;
                    }

                    return context$3$0.abrupt('return', _ret.v);

                  case 7:
                    context$3$0.next = 15;
                    break;

                  case 9:
                    context$3$0.prev = 9;
                    context$3$0.t0 = context$3$0['catch'](1);

                    // if the batch collection failed...
                    console.log('GoogleCalendarAdapter.getBatchData Error:', context$3$0.t0.stack);

                    errorMessage = context$3$0.t0;

                    if (/invalid_grant/.test(errorMessage.toString())) {
                      errorMessage = 'Email address: ' + email + ' not found in this Google Calendar account.';
                    }

                    return context$3$0.abrupt('return', _Object$assign(individualRunStats, {
                      errorMessage: errorMessage,
                      success: false,
                      data: []
                    }));

                  case 15:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this3, [[1, 9]]);
            })));

          case 6:
            results = context$2$0.sent;
            return context$2$0.abrupt('return', _Object$assign(groupRunStats, { results: results }));

          case 10:
            context$2$0.prev = 10;
            context$2$0.t0 = context$2$0['catch'](3);
            return context$2$0.abrupt('return', _Object$assign(groupRunStats, {
              errorMessage: context$2$0.t0,
              success: false
            }));

          case 13:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[3, 10]]);
    }
  }, {
    key: 'runConnectionTest',
    value: function runConnectionTest() {
      var email, data;
      return _regeneratorRuntime.async(function runConnectionTest$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            email = this.credentials.email;
            context$2$0.prev = 1;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.getBatchData([{ email: email, emailAfterMapping: email }], (0, _moment2['default'])().toDate(), (0, _moment2['default'])().add(-1, 'day').toDate()));

          case 4:
            data = context$2$0.sent;
            return context$2$0.abrupt('return', data);

          case 8:
            context$2$0.prev = 8;
            context$2$0.t0 = context$2$0['catch'](1);

            console.log(context$2$0.t0.stack || context$2$0.t0);
            return context$2$0.abrupt('return', {
              error: context$2$0.t0,
              success: false
            });

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 8]]);
    }
  }, {
    key: 'runMessageTest',
    value: function runMessageTest() {
      return _regeneratorRuntime.async(function runMessageTest$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            // TODO: does this need to be different?
            console.warn('Note: runMessageTest() currently calls runConnectionTest()');
            return context$2$0.abrupt('return', this.runConnectionTest());

          case 2:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    // create authenticated token for api requests for given user
  }, {
    key: 'authorize',
    value: function authorize(email) {
      var _credentials, serviceEmail, certificate, auth;

      return _regeneratorRuntime.async(function authorize$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _credentials = this.credentials;
            serviceEmail = _credentials.serviceEmail;
            certificate = _credentials.certificate;
            auth = new _googleapis2['default'].auth.JWT(
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
            return context$2$0.abrupt('return', new _Promise(function (res, rej) {
              return auth.authorize(function (err) {
                err ? rej(err) : res(auth);
              });
            }));

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return GoogleCalendarAdapter;
})(_base.Adapter);

exports['default'] = GoogleCalendarAdapter;
module.exports = exports['default'];

// api options...
// https://developers.google.com/google-apps/calendar/v3/

// collect events for this group of emails

// add auth tokens to request

// function to recurse through pageTokens

// request first results...

// request all events for this user in the given time frame

// await authorization
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGdvb2dsZS1jYWxlbmRhclxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFBdUIsWUFBWTs7OztzQkFDWixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7b0JBQ2lCLFVBQVU7OztBQUcxRCxJQUFNLFFBQVEsR0FBRyx3QkFBVyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNDLElBQU0sa0JBQWtCLEdBQUc7QUFDekIsZUFBYSxFQUFHLGFBQWE7QUFDN0IsZ0JBQWMsRUFBRSxjQUFjO0FBQzlCLFNBQU8sRUFBUyxZQUFZO0NBQzdCLENBQUE7O0lBR29CLHFCQUFxQjtZQUFyQixxQkFBcUI7O2VBQXJCLHFCQUFxQjs7Ozs7Ozs7Ozs7O1dBTWxCOztBQUVwQixlQUFTLEVBQThCLElBQUk7QUFDM0MsaUJBQVcsRUFBNEIsV0FBVztBQUNsRCx1QkFBaUIsRUFBc0IsU0FBUztBQUNoRCw0QkFBc0IsRUFBaUIsU0FBUztBQUNoRCx1QkFBaUIsRUFBc0Isc0JBQXNCO0FBQzdELG9CQUFjLEVBQXlCLG1CQUFtQjtBQUMxRCxlQUFTLEVBQThCLFNBQVM7QUFDaEQsZ0JBQVUsRUFBNkIsVUFBVTtBQUNqRCxjQUFRLEVBQStCLFFBQVE7QUFDL0MsaUJBQVcsRUFBNEIsY0FBYztBQUNyRCxtQkFBYSxFQUEwQixnQkFBZ0I7QUFDdkQsc0JBQWdCLEVBQXVCLGlCQUFpQjtBQUN4RCxrQkFBWSxFQUEyQixZQUFZO0FBQ25ELHNCQUFnQixFQUF1QixnQkFBZ0I7QUFDdkQscUJBQWUsRUFBd0IsZ0JBQWdCO0FBQ3ZELG1CQUFhLEVBQTBCLGNBQWM7QUFDckQsZUFBUyxFQUE4QixTQUFTO0FBQ2hELFdBQUssRUFBa0MsVUFBVTtBQUNqRCxtQkFBYSxFQUEwQixhQUFhO0tBQ3JEOzs7Ozs7QUFHVSxXQTlCUSxxQkFBcUIsR0E4QjFCOzBCQTlCSyxxQkFBcUI7O0FBK0J0QywrQkEvQmlCLHFC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QUFDO2FBQUEsQ0FBQzs7Ozs7OztLQUNKOzs7U0F2UWtCLHFCQUFxQjs7O3FCQUFyQixxQkFBcUIiLCJmaWxlIjoiY2xBZGFwdGVyc1xcZ29vZ2xlLWNhbGVuZGFyXFxpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnb29nbGVhcGlzIGZyb20gJ2dvb2dsZWFwaXMnO1xyXG5pbXBvcnQgbW9tZW50ICAgICBmcm9tICdtb21lbnQnO1xyXG5pbXBvcnQgXyAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgeyBBZGFwdGVyLCBDb25maWd1cmF0aW9uLCBTZXJ2aWNlIH0gZnJvbSAnLi4vYmFzZS8nO1xyXG5cclxuLy8gZ29vZ2xlIGNhbGVuZGFyIGFwaVxyXG5jb25zdCBjYWxlbmRhciA9IGdvb2dsZWFwaXMuY2FsZW5kYXIoJ3YzJyk7XHJcblxyXG5jb25zdCBjcmVkZW50aWFsTWFwcGluZ3MgPSB7XHJcbiAgJ2NlcnRpZmljYXRlJyA6ICdwcml2YXRlX2tleScsXHJcbiAgJ3NlcnZpY2VFbWFpbCc6ICdjbGllbnRfZW1haWwnLFxyXG4gICdlbWFpbCcgICAgICAgOiAnYWRtaW5FbWFpbCdcclxufVxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvb2dsZUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIEFkYXB0ZXIge1xyXG5cclxuICBzdGF0aWMgQ29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb247XHJcbiAgc3RhdGljIFNlcnZpY2UgPSBTZXJ2aWNlO1xyXG5cclxuICAvLyBjb252ZXJ0IHRoZSBuYW1lcyBvZiB0aGUgYXBpIHJlc3BvbnNlIGRhdGFcclxuICBzdGF0aWMgZmllbGROYW1lTWFwID0ge1xyXG4gICAgLy8gRGVzaXJlZC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2l2ZW4uLi5cclxuICAgICdldmVudElkJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpZCcsXHJcbiAgICAnYXR0ZW5kZWVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAnYXR0ZW5kZWVzJyxcclxuICAgICdkYXRlVGltZUNyZWF0ZWQnOiAgICAgICAgICAgICAgICAgICAgICdjcmVhdGVkJyxcclxuICAgICdkYXRlVGltZUxhc3RNb2RpZmllZCc6ICAgICAgICAgICAgICAgICd1cGRhdGVkJyxcclxuICAgICdhdHRlbmRlZUFkZHJlc3MnOiAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXHJcbiAgICAnYXR0ZW5kZWVOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxyXG4gICAgJ2lDYWxVSUQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lDYWxVSUQnLFxyXG4gICAgJ2xvY2F0aW9uJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xvY2F0aW9uJyxcclxuICAgICdzdGF0dXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdGF0dXMnLFxyXG4gICAgJ2lzQ3JlYXRvcic6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NyZWF0b3Iuc2VsZicsXHJcbiAgICAnaXNPcmdhbml6ZXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnb3JnYW5pemVyLnNlbGYnLFxyXG4gICAgJ29yZ2FuaXplckVtYWlsJzogICAgICAgICAgICAgICAgICAgICAgJ29yZ2FuaXplci5lbWFpbCcsXHJcbiAgICAncmVjdXJyYW5jZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAncmVjdXJyYW5jZScsXHJcbiAgICAncmVzcG9uc2VTdGF0dXMnOiAgICAgICAgICAgICAgICAgICAgICAncmVzcG9uc2VTdGF0dXMnLFxyXG4gICAgJ2RhdGVUaW1lU3RhcnQnOiAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXJ0LmRhdGVUaW1lJyxcclxuICAgICdkYXRlVGltZUVuZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICdlbmQuZGF0ZVRpbWUnLFxyXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N1bW1hcnknLFxyXG4gICAgJ3VybCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2h0bWxMaW5rJyxcclxuICAgICdoYW5nb3V0TGluayc6ICAgICAgICAgICAgICAgICAgICAgICAgICdoYW5nb3V0TGluaydcclxuICB9XHJcblxyXG4gIC8vIGNvbnN0cnVjdG9yIG5lZWRzIHRvIGNhbGwgc3VwZXJcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICBkZWxldGUgdGhpcy5fY29uZmlnO1xyXG4gICAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG5cclxuICBhc3luYyBpbml0KCkge1xyXG5cclxuICAgIGNvbnN0IHsgY3JlZGVudGlhbHMgfSA9IHRoaXM7XHJcblxyXG4gICAgaWYgKCFjcmVkZW50aWFscykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWRlbnRpYWxzIHJlcXVpcmVkIGZvciBhZGFwdGVyLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hcCBHb29nbGUganNvbiBrZXlzIHRvIGtleXMgdXNlZCBpbiB0aGlzIGxpYnJhcnlcclxuICAgIGZvciAoY29uc3Qgd2FudCBpbiBjcmVkZW50aWFsTWFwcGluZ3MpIHtcclxuICAgICAgY29uc3QgYWx0ZXJuYXRlID0gY3JlZGVudGlhbE1hcHBpbmdzW3dhbnRdO1xyXG4gICAgICBpZiAoIWNyZWRlbnRpYWxzW3dhbnRdKSB7XHJcbiAgICAgICAgY3JlZGVudGlhbHNbd2FudF0gPSBjcmVkZW50aWFsc1thbHRlcm5hdGVdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgcmVxdWlyZWQgY3JlZGVudGlhbCBwcm9wZXJ0aWVzXHJcbiAgICBPYmplY3Qua2V5cyhjcmVkZW50aWFsTWFwcGluZ3MpXHJcbiAgICAgIC5mb3JFYWNoKHByb3AgPT4ge1xyXG4gICAgICAgIGlmICghY3JlZGVudGlhbHNbcHJvcF0pIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtwcm9wfSByZXF1aXJlZCBpbiBhZGFwdGVyIGNyZWRlbnRpYWxzIWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY29uZmlnICA9IG5ldyBHb29nbGVDYWxlbmRhckFkYXB0ZXIuQ29uZmlndXJhdGlvbihjcmVkZW50aWFscyk7XHJcbiAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IEdvb2dsZUNhbGVuZGFyQWRhcHRlci5TZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XHJcblxyXG4gICAgYXdhaXQgdGhpcy5fc2VydmljZS5pbml0KCk7XHJcblxyXG4gICAgY29uc3QgeyBzZXJ2aWNlRW1haWw6IGVtYWlsIH0gPSBjcmVkZW50aWFscztcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgYFN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCBnb29nbGUgY2FsZW5kYXIgYWRhcHRlciBmb3IgZW1haWw6ICR7ZW1haWx9YFxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG5cclxuICAvLyBjdXJyZW50bHkgZG9pbmcgbm90aGluZyB3aXRoIGZpZWxkcyBoZXJlLCBidXQga2VlcGluZyBhcyBwbGFjZWhvbGRlclxyXG4gIGFzeW5jIGdldEJhdGNoRGF0YSh1c2VyUHJvZmlsZXM9W10sIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSAvKiwgZmllbGRzICovKSB7XHJcblxyXG4gICAgY29uc3QgeyBmaWVsZE5hbWVNYXAgfSA9IHRoaXMuY29uc3RydWN0b3I7XHJcblxyXG4gICAgLy8gYXBpIG9wdGlvbnMuLi5cclxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2dvb2dsZS1hcHBzL2NhbGVuZGFyL3YzL1xyXG4gICAgY29uc3Qgb3B0cyA9IHtcclxuICAgICAgYWx3YXlzSW5jbHVkZUVtYWlsOiAgIHRydWUsXHJcbiAgICAgIGNhbGVuZGFySWQ6ICAgICAgICAgICAncHJpbWFyeScsXHJcbiAgICAgIHNpbmdsZUV2ZW50czogICAgICAgICB0cnVlLFxyXG4gICAgICB0aW1lTWF4OiAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLFxyXG4gICAgICB0aW1lTWluOiAgICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgIG9yZGVyQnk6ICAgICAgICAgICAgICAnc3RhcnRUaW1lJ1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgY29uc3QgZ3JvdXBSdW5TdGF0cyA9IHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKCksXHJcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICBmaWx0ZXJFbmREYXRlOiBmaWx0ZXJFbmREYXRlLFxyXG4gICAgICBlbWFpbHM6IHVzZXJQcm9maWxlc1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdHJ5IHtcclxuXHJcbiAgICAgIC8vIGNvbGxlY3QgZXZlbnRzIGZvciB0aGlzIGdyb3VwIG9mIGVtYWlsc1xyXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQqIHVzZXJQcm9maWxlcy5tYXAoYXN5bmModXNlclByb2ZpbGUpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kaXZpZHVhbFJ1blN0YXRzID0ge1xyXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgICAgIC4uLnVzZXJQcm9maWxlLFxyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIGFkZCBhdXRoIHRva2VucyB0byByZXF1ZXN0XHJcbiAgICAgICAgICBvcHRzLmF1dGggPSBhd2FpdCB0aGlzLmF1dGhvcml6ZSh1c2VyUHJvZmlsZS5lbWFpbEFmdGVyTWFwcGluZyk7XHJcblxyXG4gICAgICAgICAgLy8gZnVuY3Rpb24gdG8gcmVjdXJzZSB0aHJvdWdoIHBhZ2VUb2tlbnNcclxuICAgICAgICAgIGNvbnN0IGdldEV2ZW50cyA9IGFzeW5jKGRhdGEpID0+IHtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlcXVlc3QgZmlyc3QgcmVzdWx0cy4uLlxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gYWRkIHBhZ2UgdG9rZW4gaWYgZ2l2ZW5cclxuICAgICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLm5leHRQYWdlVG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIG9wdHMucGFnZVRva2VuID0gZGF0YS5uZXh0UGFnZVRva2VuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY2FsZW5kYXIuZXZlbnRzLmxpc3QoXHJcbiAgICAgICAgICAgICAgICBvcHRzLCAoZXJyLCBkYXRhKSA9PiBlcnIgPyByZWooZXJyKSA6IHJlcyhkYXRhKVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIGRhdGEgYmVpbmcgYWNjdW11bGF0ZWQsIGFkZCB0byBpdGVtc1xyXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuaXRlbXMucHVzaCguLi5yZXN1bHRzLml0ZW1zKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0cztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSB0b2tlbiBmb3IgdGhlIG5leHQgcGFnZSwgY29udGludWUuLi5cclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMubmV4dFBhZ2VUb2tlbikge1xyXG4gICAgICAgICAgICAgIGRhdGEubmV4dFBhZ2VUb2tlbiA9IHJlc3VsdHMubmV4dFBhZ2VUb2tlbjtcclxuICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RXZlbnRzKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgY29uc3QgeyBpdGVtcyB9ID0gYXdhaXQgZ2V0RXZlbnRzKCk7XHJcblxyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IF8ubWFwKGl0ZW1zLCBpdGVtID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgXy5lYWNoKGZpZWxkTmFtZU1hcCwgKGhhdmUsIHdhbnQpID0+IHtcclxuICAgICAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBfLmdldChpdGVtLCBoYXZlKTtcclxuICAgICAgICAgICAgICBpZiAoL15kYXRlVGltZS8udGVzdCh3YW50KSkge1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSBuZXcgRGF0ZShtb2RpZmllZCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChtb2RpZmllZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRbd2FudF0gPSBtb2RpZmllZDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgb3V0LmF0dGVuZGVlcyA9IF8ubWFwKG91dC5hdHRlbmRlZXMsIGF0dGVuZGVlID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCB7IGVtYWlsLCByZXNwb25zZVN0YXR1cyB9ID0gYXR0ZW5kZWU7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWRkcmVzczogZW1haWwsIHJlc3BvbnNlOiByZXNwb25zZVN0YXR1cyB9O1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyByZXF1ZXN0IGFsbCBldmVudHMgZm9yIHRoaXMgdXNlciBpbiB0aGUgZ2l2ZW4gdGltZSBmcmFtZVxyXG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5kaXZpZHVhbFJ1blN0YXRzLCB7IGRhdGEgfSk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAvLyBpZiB0aGUgYmF0Y2ggY29sbGVjdGlvbiBmYWlsZWQuLi5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdHb29nbGVDYWxlbmRhckFkYXB0ZXIuZ2V0QmF0Y2hEYXRhIEVycm9yOicsIGVycm9yLnN0YWNrKTtcclxuXHJcbiAgICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gZXJyb3I7XHJcblxyXG4gICAgICAgICAgaWYgKC9pbnZhbGlkX2dyYW50Ly50ZXN0KGVycm9yTWVzc2FnZS50b1N0cmluZygpKSkge1xyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgRW1haWwgYWRkcmVzczogJHtlbWFpbH0gbm90IGZvdW5kIGluIHRoaXMgR29vZ2xlIENhbGVuZGFyIGFjY291bnQuYDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpbmRpdmlkdWFsUnVuU3RhdHMsIHtcclxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgZGF0YTogW11cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ3JvdXBSdW5TdGF0cywgeyByZXN1bHRzIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ3JvdXBSdW5TdGF0cywge1xyXG4gICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IsXHJcbiAgICAgICAgc3VjY2VzczogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcblxyXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KCkge1xyXG4gICAgY29uc3QgeyBjcmVkZW50aWFsczogeyBlbWFpbCB9IH0gPSB0aGlzO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldEJhdGNoRGF0YShcclxuICAgICAgICBbIHsgZW1haWwsIGVtYWlsQWZ0ZXJNYXBwaW5nOiBlbWFpbCB9IF0sXHJcbiAgICAgICAgbW9tZW50KCkudG9EYXRlKCksXHJcbiAgICAgICAgbW9tZW50KCkuYWRkKC0xLCAnZGF5JykudG9EYXRlKClcclxuICAgICAgKVxyXG5cclxuICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnJvci5zdGFjayB8fCBlcnJvcik7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZXJyb3IsXHJcbiAgICAgICAgc3VjY2VzczogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIGFzeW5jIHJ1bk1lc3NhZ2VUZXN0KCkge1xyXG4gICAgLy8gVE9ETzogZG9lcyB0aGlzIG5lZWQgdG8gYmUgZGlmZmVyZW50P1xyXG4gICAgY29uc29sZS53YXJuKCdOb3RlOiBydW5NZXNzYWdlVGVzdCgpIGN1cnJlbnRseSBjYWxscyBydW5Db25uZWN0aW9uVGVzdCgpJyk7XHJcbiAgICByZXR1cm4gdGhpcy5ydW5Db25uZWN0aW9uVGVzdCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIGNyZWF0ZSBhdXRoZW50aWNhdGVkIHRva2VuIGZvciBhcGkgcmVxdWVzdHMgZm9yIGdpdmVuIHVzZXJcclxuICBhc3luYyBhdXRob3JpemUoZW1haWwpIHtcclxuXHJcbiAgICBjb25zdCB7IGNyZWRlbnRpYWxzOiB7IHNlcnZpY2VFbWFpbCwgY2VydGlmaWNhdGUgfSB9ID0gdGhpcztcclxuXHJcbiAgICBjb25zdCBhdXRoID0gbmV3IGdvb2dsZWFwaXMuYXV0aC5KV1QoXHJcbiAgICAgIC8vIGVtYWlsIG9mIGdvb2dsZSBhcHAgYWRtaW4uLi5cclxuICAgICAgc2VydmljZUVtYWlsLFxyXG4gICAgICAvLyBubyBuZWVkIGZvciBrZXlGaWxlLi4uXHJcbiAgICAgIG51bGwsXHJcbiAgICAgIC8vIHRoZSBwcml2YXRlIGtleSBpdHNlbGYuLi5cclxuICAgICAgY2VydGlmaWNhdGUsXHJcbiAgICAgIC8vIHNjb3Blcy4uLlxyXG4gICAgICBbJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvY2FsZW5kYXIucmVhZG9ubHknXSxcclxuICAgICAgLy8gdGhlIGVtYWlsIG9mIHRoZSBpbmRpdmlkdWFsIHdlIHdhbnQgdG8gYXV0aGVudGljYXRlXHJcbiAgICAgIC8vICgnc3ViJyBwcm9wZXJ0eSBvZiB0aGUganNvbiB3ZWIgdG9rZW4pXHJcbiAgICAgIGVtYWlsXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGF3YWl0IGF1dGhvcml6YXRpb25cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IGF1dGguYXV0aG9yaXplKGVyciA9PiB7XHJcbiAgICAgIGVyciA/IHJlaihlcnIpIDogcmVzKGF1dGgpO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbn1cclxuIl19
//# sourceMappingURL=index.js.map
