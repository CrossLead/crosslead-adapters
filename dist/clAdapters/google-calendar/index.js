'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

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
    value: function getBatchData(emails, filterStartDate, filterEndDate /*, fields */) {
      if (emails === undefined) emails = [];
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
              emails: emails
            };
            context$2$0.prev = 3;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(_Promise.all(emails.map(function callee$2$0(email) {
              var individualRunStats, _ret, errorMessage;

              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                var _this2 = this;

                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    individualRunStats = {
                      filterStartDate: filterStartDate,
                      filterEndDate: filterEndDate,
                      email: email,
                      success: true,
                      runDate: (0, _moment2['default'])().utc().toDate()
                    };
                    context$3$0.prev = 1;
                    context$3$0.next = 4;
                    return _regeneratorRuntime.awrap((function callee$3$0() {
                      var getEvents, _ref, items, data;

                      return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                        var _this = this;

                        while (1) switch (context$4$0.prev = context$4$0.next) {
                          case 0:
                            context$4$0.next = 2;
                            return _regeneratorRuntime.awrap(this.authorize(email));

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
            return _regeneratorRuntime.awrap(this.getBatchData([email], (0, _moment2['default'])().toDate(), (0, _moment2['default'])().add(-1, 'day').toDate()));

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGdvb2dsZS1jYWxlbmRhclxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBQXVCLFlBQVk7Ozs7c0JBQ1osUUFBUTs7OztzQkFDUixRQUFROzs7O29CQUNpQixVQUFVOzs7QUFHMUQsSUFBTSxRQUFRLEdBQUcsd0JBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzQyxJQUFNLGtCQUFrQixHQUFHO0FBQ3pCLGVBQWEsRUFBRyxhQUFhO0FBQzdCLGdCQUFjLEVBQUUsY0FBYztBQUM5QixTQUFPLEVBQVMsWUFBWTtDQUM3QixDQUFBOztJQUdvQixxQkFBcUI7WUFBckIscUJBQXFCOztlQUFyQixxQkFBcUI7Ozs7Ozs7Ozs7OztXQU1sQjs7QUFFcEIsZUFBUyxFQUE4QixJQUFJO0FBQzNDLGlCQUFXLEVBQTRCLFdBQVc7QUFDbEQsdUJBQWlCLEVBQXNCLFNBQVM7QUFDaEQsNEJBQXNCLEVBQWlCLFNBQVM7QUFDaEQsdUJBQWlCLEVBQXNCLHNCQUFzQjtBQUM3RCxvQkFBYyxFQUF5QixtQkFBbUI7QUFDMUQsZUFBUyxFQUE4QixTQUFTO0FBQ2hELGdCQUFVLEVBQTZCLFVBQVU7QUFDakQsY0FBUSxFQUErQixRQUFRO0FBQy9DLGlCQUFXLEVBQTRCLGNBQWM7QUFDckQsbUJBQWEsRUFBMEIsZ0JBQWdCO0FBQ3ZELHNCQUFnQixFQUF1QixpQkFBaUI7QUFDeEQsa0JBQVksRUFBMkIsWUFBWTtBQUNuRCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELHFCQUFlLEVBQXdCLGdCQUFnQjtBQUN2RCxtQkFBYSxFQUEwQixjQUFjO0FBQ3JELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxXQUFLLEVBQWtDLFVBQVU7QUFDakQsbUJBQWEsRUFBMEIsYUFBYTtLQUNyRDs7Ozs7O0FBR1UsV0E5QlEscUJBQXFCLEdBOEIxQjswQkE5QksscUJBQXFCOztBQStCdEMsK0JBL0JpQixxQkFB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cUI7OztxQkFBckIscUJBQXFCIiwiZmlsZSI6ImNsQWRhcHRlcnNcXGdvb2dsZS1jYWxlbmRhclxcaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ29vZ2xlYXBpcyBmcm9tICdnb29nbGVhcGlzJztcbmltcG9ydCBtb21lbnQgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgXyAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQWRhcHRlciwgQ29uZmlndXJhdGlvbiwgU2VydmljZSB9IGZyb20gJy4uL2Jhc2UvJztcblxuLy8gZ29vZ2xlIGNhbGVuZGFyIGFwaVxuY29uc3QgY2FsZW5kYXIgPSBnb29nbGVhcGlzLmNhbGVuZGFyKCd2MycpO1xuXG5jb25zdCBjcmVkZW50aWFsTWFwcGluZ3MgPSB7XG4gICdjZXJ0aWZpY2F0ZScgOiAncHJpdmF0ZV9rZXknLFxuICAnc2VydmljZUVtYWlsJzogJ2NsaWVudF9lbWFpbCcsXG4gICdlbWFpbCcgICAgICAgOiAnYWRtaW5FbWFpbCdcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb29nbGVDYWxlbmRhckFkYXB0ZXIgZXh0ZW5kcyBBZGFwdGVyIHtcblxuICBzdGF0aWMgQ29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb247XG4gIHN0YXRpYyBTZXJ2aWNlID0gU2VydmljZTtcblxuICAvLyBjb252ZXJ0IHRoZSBuYW1lcyBvZiB0aGUgYXBpIHJlc3BvbnNlIGRhdGFcbiAgc3RhdGljIGZpZWxkTmFtZU1hcCA9IHtcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxuICAgICdldmVudElkJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpZCcsXG4gICAgJ2F0dGVuZGVlcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F0dGVuZGVlcycsXG4gICAgJ2RhdGVUaW1lQ3JlYXRlZCc6ICAgICAgICAgICAgICAgICAgICAgJ2NyZWF0ZWQnLFxuICAgICdkYXRlVGltZUxhc3RNb2RpZmllZCc6ICAgICAgICAgICAgICAgICd1cGRhdGVkJyxcbiAgICAnYXR0ZW5kZWVBZGRyZXNzJzogICAgICAgICAgICAgICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdhdHRlbmRlZU5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2lDYWxVSUQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lDYWxVSUQnLFxuICAgICdsb2NhdGlvbic6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsb2NhdGlvbicsXG4gICAgJ3N0YXR1cyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cycsXG4gICAgJ2lzQ3JlYXRvcic6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NyZWF0b3Iuc2VsZicsXG4gICAgJ2lzT3JnYW5pemVyJzogICAgICAgICAgICAgICAgICAgICAgICAgJ29yZ2FuaXplci5zZWxmJyxcbiAgICAnb3JnYW5pemVyRW1haWwnOiAgICAgICAgICAgICAgICAgICAgICAnb3JnYW5pemVyLmVtYWlsJyxcbiAgICAncmVjdXJyYW5jZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAncmVjdXJyYW5jZScsXG4gICAgJ3Jlc3BvbnNlU3RhdHVzJzogICAgICAgICAgICAgICAgICAgICAgJ3Jlc3BvbnNlU3RhdHVzJyxcbiAgICAnZGF0ZVRpbWVTdGFydCc6ICAgICAgICAgICAgICAgICAgICAgICAnc3RhcnQuZGF0ZVRpbWUnLFxuICAgICdkYXRlVGltZUVuZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICdlbmQuZGF0ZVRpbWUnLFxuICAgICdzdWJqZWN0JzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdW1tYXJ5JyxcbiAgICAndXJsJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHRtbExpbmsnLFxuICAgICdoYW5nb3V0TGluayc6ICAgICAgICAgICAgICAgICAgICAgICAgICdoYW5nb3V0TGluaydcbiAgfVxuXG4gIC8vIGNvbnN0cnVjdG9yIG5lZWRzIHRvIGNhbGwgc3VwZXJcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG5cbiAgcmVzZXQoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NvbmZpZztcbiAgICBkZWxldGUgdGhpcy5fc2VydmljZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgYXN5bmMgaW5pdCgpIHtcblxuICAgIGNvbnN0IHsgY3JlZGVudGlhbHMgfSA9IHRoaXM7XG5cbiAgICBpZiAoIWNyZWRlbnRpYWxzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWRlbnRpYWxzIHJlcXVpcmVkIGZvciBhZGFwdGVyLicpO1xuICAgIH1cblxuICAgIC8vIG1hcCBHb29nbGUganNvbiBrZXlzIHRvIGtleXMgdXNlZCBpbiB0aGlzIGxpYnJhcnlcbiAgICBmb3IgKGNvbnN0IHdhbnQgaW4gY3JlZGVudGlhbE1hcHBpbmdzKSB7XG4gICAgICBjb25zdCBhbHRlcm5hdGUgPSBjcmVkZW50aWFsTWFwcGluZ3Nbd2FudF07XG4gICAgICBpZiAoIWNyZWRlbnRpYWxzW3dhbnRdKSB7XG4gICAgICAgIGNyZWRlbnRpYWxzW3dhbnRdID0gY3JlZGVudGlhbHNbYWx0ZXJuYXRlXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB2YWxpZGF0ZSByZXF1aXJlZCBjcmVkZW50aWFsIHByb3BlcnRpZXNcbiAgICBPYmplY3Qua2V5cyhjcmVkZW50aWFsTWFwcGluZ3MpXG4gICAgICAuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFsc1twcm9wXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtwcm9wfSByZXF1aXJlZCBpbiBhZGFwdGVyIGNyZWRlbnRpYWxzIWApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIHRoaXMuX2NvbmZpZyAgPSBuZXcgR29vZ2xlQ2FsZW5kYXJBZGFwdGVyLkNvbmZpZ3VyYXRpb24oY3JlZGVudGlhbHMpO1xuICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgR29vZ2xlQ2FsZW5kYXJBZGFwdGVyLlNlcnZpY2UodGhpcy5fY29uZmlnKTtcblxuICAgIGF3YWl0IHRoaXMuX3NlcnZpY2UuaW5pdCgpO1xuXG4gICAgY29uc3QgeyBzZXJ2aWNlRW1haWw6IGVtYWlsIH0gPSBjcmVkZW50aWFscztcblxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYFN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCBnb29nbGUgY2FsZW5kYXIgYWRhcHRlciBmb3IgZW1haWw6ICR7ZW1haWx9YFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgLy8gY3VycmVudGx5IGRvaW5nIG5vdGhpbmcgd2l0aCBmaWVsZHMgaGVyZSwgYnV0IGtlZXBpbmcgYXMgcGxhY2Vob2xkZXJcbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKGVtYWlscz1bXSwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlIC8qLCBmaWVsZHMgKi8pIHtcblxuICAgIGNvbnN0IHsgZmllbGROYW1lTWFwIH0gPSB0aGlzLmNvbnN0cnVjdG9yO1xuXG4gICAgLy8gYXBpIG9wdGlvbnMuLi5cbiAgICAvLyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nb29nbGUtYXBwcy9jYWxlbmRhci92My9cbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgYWx3YXlzSW5jbHVkZUVtYWlsOiAgIHRydWUsXG4gICAgICBjYWxlbmRhcklkOiAgICAgICAgICAgJ3ByaW1hcnknLFxuICAgICAgc2luZ2xlRXZlbnRzOiAgICAgICAgIHRydWUsXG4gICAgICB0aW1lTWF4OiAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgdGltZU1pbjogICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgb3JkZXJCeTogICAgICAgICAgICAgICdzdGFydFRpbWUnXG4gICAgfTtcblxuXG4gICAgY29uc3QgZ3JvdXBSdW5TdGF0cyA9IHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKSxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLFxuICAgICAgZmlsdGVyRW5kRGF0ZTogZmlsdGVyRW5kRGF0ZSxcbiAgICAgIGVtYWlsczogZW1haWxzXG4gICAgfTtcblxuXG4gICAgdHJ5IHtcblxuICAgICAgLy8gY29sbGVjdCBldmVudHMgZm9yIHRoaXMgZ3JvdXAgb2YgZW1haWxzXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQqIGVtYWlscy5tYXAoYXN5bmMoZW1haWwpID0+IHtcblxuICAgICAgICBjb25zdCBpbmRpdmlkdWFsUnVuU3RhdHMgPSB7XG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgZW1haWwsXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gYWRkIGF1dGggdG9rZW5zIHRvIHJlcXVlc3RcbiAgICAgICAgICBvcHRzLmF1dGggPSBhd2FpdCB0aGlzLmF1dGhvcml6ZShlbWFpbCk7XG5cbiAgICAgICAgICAvLyBmdW5jdGlvbiB0byByZWN1cnNlIHRocm91Z2ggcGFnZVRva2Vuc1xuICAgICAgICAgIGNvbnN0IGdldEV2ZW50cyA9IGFzeW5jKGRhdGEpID0+IHtcblxuICAgICAgICAgICAgLy8gcmVxdWVzdCBmaXJzdCByZXN1bHRzLi4uXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICAgIC8vIGFkZCBwYWdlIHRva2VuIGlmIGdpdmVuXG4gICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEubmV4dFBhZ2VUb2tlbikge1xuICAgICAgICAgICAgICAgIG9wdHMucGFnZVRva2VuID0gZGF0YS5uZXh0UGFnZVRva2VuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2FsZW5kYXIuZXZlbnRzLmxpc3QoXG4gICAgICAgICAgICAgICAgb3B0cywgKGVyciwgZGF0YSkgPT4gZXJyID8gcmVqKGVycikgOiByZXMoZGF0YSlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgZGF0YSBiZWluZyBhY2N1bXVsYXRlZCwgYWRkIHRvIGl0ZW1zXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICBkYXRhLml0ZW1zLnB1c2goLi4ucmVzdWx0cy5pdGVtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSB0b2tlbiBmb3IgdGhlIG5leHQgcGFnZSwgY29udGludWUuLi5cbiAgICAgICAgICAgIGlmIChyZXN1bHRzLm5leHRQYWdlVG9rZW4pIHtcbiAgICAgICAgICAgICAgZGF0YS5uZXh0UGFnZVRva2VuID0gcmVzdWx0cy5uZXh0UGFnZVRva2VuO1xuICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RXZlbnRzKGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29uc3QgeyBpdGVtcyB9ID0gYXdhaXQgZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgICBjb25zdCBkYXRhID0gXy5tYXAoaXRlbXMsIGl0ZW0gPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBvdXQgPSB7fTtcblxuICAgICAgICAgICAgXy5lYWNoKGZpZWxkTmFtZU1hcCwgKGhhdmUsIHdhbnQpID0+IHtcbiAgICAgICAgICAgICAgbGV0IG1vZGlmaWVkID0gXy5nZXQoaXRlbSwgaGF2ZSk7XG4gICAgICAgICAgICAgIGlmICgvXmRhdGVUaW1lLy50ZXN0KHdhbnQpKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSBuZXcgRGF0ZShtb2RpZmllZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKG1vZGlmaWVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvdXRbd2FudF0gPSBtb2RpZmllZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG91dC5hdHRlbmRlZXMgPSBfLm1hcChvdXQuYXR0ZW5kZWVzLCBhdHRlbmRlZSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgZW1haWwsIHJlc3BvbnNlU3RhdHVzIH0gPSBhdHRlbmRlZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWRkcmVzczogZW1haWwsIHJlc3BvbnNlOiByZXNwb25zZVN0YXR1cyB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyByZXF1ZXN0IGFsbCBldmVudHMgZm9yIHRoaXMgdXNlciBpbiB0aGUgZ2l2ZW4gdGltZSBmcmFtZVxuICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGluZGl2aWR1YWxSdW5TdGF0cywgeyBkYXRhIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIGJhdGNoIGNvbGxlY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgY29uc29sZS5sb2coJ0dvb2dsZUNhbGVuZGFyQWRhcHRlci5nZXRCYXRjaERhdGEgRXJyb3I6JywgZXJyb3Iuc3RhY2spO1xuXG4gICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IGVycm9yO1xuXG4gICAgICAgICAgaWYgKC9pbnZhbGlkX2dyYW50Ly50ZXN0KGVycm9yTWVzc2FnZS50b1N0cmluZygpKSkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gYEVtYWlsIGFkZHJlc3M6ICR7ZW1haWx9IG5vdCBmb3VuZCBpbiB0aGlzIEdvb2dsZSBDYWxlbmRhciBhY2NvdW50LmA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5kaXZpZHVhbFJ1blN0YXRzLCB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IFtdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGdyb3VwUnVuU3RhdHMsIHsgcmVzdWx0cyB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ3JvdXBSdW5TdGF0cywge1xuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH1cblxuXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KCkge1xuICAgIGNvbnN0IHsgY3JlZGVudGlhbHM6IHsgZW1haWwgfSB9ID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXG4gICAgICAgIFsgZW1haWwgXSxcbiAgICAgICAgbW9tZW50KCkudG9EYXRlKCksXG4gICAgICAgIG1vbWVudCgpLmFkZCgtMSwgJ2RheScpLnRvRGF0ZSgpXG4gICAgICApXG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvci5zdGFjayB8fCBlcnJvcik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcixcbiAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIGFzeW5jIHJ1bk1lc3NhZ2VUZXN0KCkge1xuICAgIC8vIFRPRE86IGRvZXMgdGhpcyBuZWVkIHRvIGJlIGRpZmZlcmVudD9cbiAgICBjb25zb2xlLndhcm4oJ05vdGU6IHJ1bk1lc3NhZ2VUZXN0KCkgY3VycmVudGx5IGNhbGxzIHJ1bkNvbm5lY3Rpb25UZXN0KCknKTtcbiAgICByZXR1cm4gdGhpcy5ydW5Db25uZWN0aW9uVGVzdCgpO1xuICB9XG5cblxuICAvLyBjcmVhdGUgYXV0aGVudGljYXRlZCB0b2tlbiBmb3IgYXBpIHJlcXVlc3RzIGZvciBnaXZlbiB1c2VyXG4gIGFzeW5jIGF1dGhvcml6ZShlbWFpbCkge1xuXG4gICAgY29uc3QgeyBjcmVkZW50aWFsczogeyBzZXJ2aWNlRW1haWwsIGNlcnRpZmljYXRlIH0gfSA9IHRoaXM7XG5cbiAgICBjb25zdCBhdXRoID0gbmV3IGdvb2dsZWFwaXMuYXV0aC5KV1QoXG4gICAgICAvLyBlbWFpbCBvZiBnb29nbGUgYXBwIGFkbWluLi4uXG4gICAgICBzZXJ2aWNlRW1haWwsXG4gICAgICAvLyBubyBuZWVkIGZvciBrZXlGaWxlLi4uXG4gICAgICBudWxsLFxuICAgICAgLy8gdGhlIHByaXZhdGUga2V5IGl0c2VsZi4uLlxuICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAvLyBzY29wZXMuLi5cbiAgICAgIFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9jYWxlbmRhci5yZWFkb25seSddLFxuICAgICAgLy8gdGhlIGVtYWlsIG9mIHRoZSBpbmRpdmlkdWFsIHdlIHdhbnQgdG8gYXV0aGVudGljYXRlXG4gICAgICAvLyAoJ3N1YicgcHJvcGVydHkgb2YgdGhlIGpzb24gd2ViIHRva2VuKVxuICAgICAgZW1haWxcbiAgICApO1xuXG4gICAgLy8gYXdhaXQgYXV0aG9yaXphdGlvblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IGF1dGguYXV0aG9yaXplKGVyciA9PiB7XG4gICAgICBlcnIgPyByZWooZXJyKSA6IHJlcyhhdXRoKTtcbiAgICB9KSk7XG4gIH1cblxufVxuIl19
//# sourceMappingURL=index.js.map
