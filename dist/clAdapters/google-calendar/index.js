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

                              var attendeeSelf = _lodash2['default'].find(out.attendees, function (attendee) {
                                return attendee.self;
                              });

                              if (attendeeSelf) {
                                out.responseStatus = attendeeSelf.responseStatus;
                              }

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
                      errorMessage = 'Email address: ' + userProfile.emailAfterMapping + ' not found in this Google Calendar account.';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvZ29vZ2xlLWNhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBQXVCLFlBQVk7Ozs7c0JBQ1osUUFBUTs7OztzQkFDUixRQUFROzs7O29CQUNpQixVQUFVOzs7QUFHMUQsSUFBTSxRQUFRLEdBQUcsd0JBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzQyxJQUFNLGtCQUFrQixHQUFHO0FBQ3pCLGVBQWEsRUFBRyxhQUFhO0FBQzdCLGdCQUFjLEVBQUUsY0FBYztBQUM5QixTQUFPLEVBQVMsWUFBWTtDQUM3QixDQUFBOztJQUdvQixxQkFBcUI7WUFBckIscUJBQXFCOztlQUFyQixxQkFBcUI7Ozs7Ozs7Ozs7OztXQU1sQjs7QUFFcEIsZUFBUyxFQUE4QixJQUFJO0FBQzNDLGlCQUFXLEVBQTRCLFdBQVc7QUFDbEQsdUJBQWlCLEVBQXNCLFNBQVM7QUFDaEQsNEJBQXNCLEVBQWlCLFNBQVM7QUFDaEQsdUJBQWlCLEVBQXNCLHNCQUFzQjtBQUM3RCxvQkFBYyxFQUF5QixtQkFBbUI7QUFDMUQsZUFBUyxFQUE4QixTQUFTO0FBQ2hELGdCQUFVLEVBQTZCLFVBQVU7QUFDakQsY0FBUSxFQUErQixRQUFRO0FBQy9DLGlCQUFXLEVBQTRCLGNBQWM7QUFDckQsbUJBQWEsRUFBMEIsZ0JBQWdCO0FBQ3ZELHNCQUFnQixFQUF1QixpQkFBaUI7QUFDeEQsa0JBQVksRUFBMkIsWUFBWTtBQUNuRCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELHFCQUFlLEVBQXdCLGdCQUFnQjtBQUN2RCxtQkFBYSxFQUEwQixjQUFjO0FBQ3JELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxXQUFLLEVBQWtDLFVBQVU7QUFDakQsbUJBQWEsRUFBMEIsYUFBYTtBQUNwRCxlQUFTLEVBQThCLFlBQVk7S0FDcEQ7Ozs7OztBQUdVLFdBL0JRLHFCQUFxQixHQStCMUI7MEJBL0JLLHFCQUFx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R0FBRzs7QUFFbEMsd0JBQVk7O0FBRVosZ0JBQUk7O0FBRUosdUJBQVc7O0FBRVgsYUFBQyxtREFBbUQsQ0FBQzs7O0FBR3JELGlCQUFLLENBQ047Z0RBR00sYUFBWSxVQUFDLEdBQUcsRUFBRSxHQUFHO3FCQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDckQsbUJBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2VBQzVCLENBQUM7YUFBQSxDQUFDOzs7Ozs7O0tBQ0o7OztTQWpSa0IscUJBQXFCOzs7cUJBQXJCLHFCQUFxQiIsImZpbGUiOiJjbEFkYXB0ZXJzL2dvb2dsZS1jYWxlbmRhci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnb29nbGVhcGlzIGZyb20gJ2dvb2dsZWFwaXMnO1xuaW1wb3J0IG1vbWVudCAgICAgZnJvbSAnbW9tZW50JztcbmltcG9ydCBfICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBBZGFwdGVyLCBDb25maWd1cmF0aW9uLCBTZXJ2aWNlIH0gZnJvbSAnLi4vYmFzZS8nO1xuXG4vLyBnb29nbGUgY2FsZW5kYXIgYXBpXG5jb25zdCBjYWxlbmRhciA9IGdvb2dsZWFwaXMuY2FsZW5kYXIoJ3YzJyk7XG5cbmNvbnN0IGNyZWRlbnRpYWxNYXBwaW5ncyA9IHtcbiAgJ2NlcnRpZmljYXRlJyA6ICdwcml2YXRlX2tleScsXG4gICdzZXJ2aWNlRW1haWwnOiAnY2xpZW50X2VtYWlsJyxcbiAgJ2VtYWlsJyAgICAgICA6ICdhZG1pbkVtYWlsJ1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvb2dsZUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIEFkYXB0ZXIge1xuXG4gIHN0YXRpYyBDb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbjtcbiAgc3RhdGljIFNlcnZpY2UgPSBTZXJ2aWNlO1xuXG4gIC8vIGNvbnZlcnQgdGhlIG5hbWVzIG9mIHRoZSBhcGkgcmVzcG9uc2UgZGF0YVxuICBzdGF0aWMgZmllbGROYW1lTWFwID0ge1xuICAgIC8vIERlc2lyZWQuLi4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdpdmVuLi4uXG4gICAgJ2V2ZW50SWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lkJyxcbiAgICAnYXR0ZW5kZWVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAnYXR0ZW5kZWVzJyxcbiAgICAnZGF0ZVRpbWVDcmVhdGVkJzogICAgICAgICAgICAgICAgICAgICAnY3JlYXRlZCcsXG4gICAgJ2RhdGVUaW1lTGFzdE1vZGlmaWVkJzogICAgICAgICAgICAgICAgJ3VwZGF0ZWQnLFxuICAgICdhdHRlbmRlZUFkZHJlc3MnOiAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2F0dGVuZGVlTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnaUNhbFVJZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaUNhbFVJRCcsXG4gICAgJ2xvY2F0aW9uJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xvY2F0aW9uJyxcbiAgICAnc3RhdHVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3RhdHVzJyxcbiAgICAnaXNDcmVhdG9yJzogICAgICAgICAgICAgICAgICAgICAgICAgICAnY3JlYXRvci5zZWxmJyxcbiAgICAnaXNPcmdhbml6ZXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnb3JnYW5pemVyLnNlbGYnLFxuICAgICdvcmdhbml6ZXJFbWFpbCc6ICAgICAgICAgICAgICAgICAgICAgICdvcmdhbml6ZXIuZW1haWwnLFxuICAgICdyZWN1cnJhbmNlJzogICAgICAgICAgICAgICAgICAgICAgICAgICdyZWN1cnJhbmNlJyxcbiAgICAncmVzcG9uc2VTdGF0dXMnOiAgICAgICAgICAgICAgICAgICAgICAncmVzcG9uc2VTdGF0dXMnLFxuICAgICdkYXRlVGltZVN0YXJ0JzogICAgICAgICAgICAgICAgICAgICAgICdzdGFydC5kYXRlVGltZScsXG4gICAgJ2RhdGVUaW1lRW5kJzogICAgICAgICAgICAgICAgICAgICAgICAgJ2VuZC5kYXRlVGltZScsXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N1bW1hcnknLFxuICAgICd1cmwnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdodG1sTGluaycsXG4gICAgJ2hhbmdvdXRMaW5rJzogICAgICAgICAgICAgICAgICAgICAgICAgJ2hhbmdvdXRMaW5rJyxcbiAgICAncHJpdmFjeSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmlzaWJpbGl0eSdcbiAgfVxuXG4gIC8vIGNvbnN0cnVjdG9yIG5lZWRzIHRvIGNhbGwgc3VwZXJcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG5cbiAgcmVzZXQoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NvbmZpZztcbiAgICBkZWxldGUgdGhpcy5fc2VydmljZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgYXN5bmMgaW5pdCgpIHtcblxuICAgIGNvbnN0IHsgY3JlZGVudGlhbHMgfSA9IHRoaXM7XG5cbiAgICBpZiAoIWNyZWRlbnRpYWxzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWRlbnRpYWxzIHJlcXVpcmVkIGZvciBhZGFwdGVyLicpO1xuICAgIH1cblxuICAgIC8vIG1hcCBHb29nbGUganNvbiBrZXlzIHRvIGtleXMgdXNlZCBpbiB0aGlzIGxpYnJhcnlcbiAgICBmb3IgKGNvbnN0IHdhbnQgaW4gY3JlZGVudGlhbE1hcHBpbmdzKSB7XG4gICAgICBjb25zdCBhbHRlcm5hdGUgPSBjcmVkZW50aWFsTWFwcGluZ3Nbd2FudF07XG4gICAgICBpZiAoIWNyZWRlbnRpYWxzW3dhbnRdKSB7XG4gICAgICAgIGNyZWRlbnRpYWxzW3dhbnRdID0gY3JlZGVudGlhbHNbYWx0ZXJuYXRlXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB2YWxpZGF0ZSByZXF1aXJlZCBjcmVkZW50aWFsIHByb3BlcnRpZXNcbiAgICBPYmplY3Qua2V5cyhjcmVkZW50aWFsTWFwcGluZ3MpXG4gICAgICAuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFsc1twcm9wXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtwcm9wfSByZXF1aXJlZCBpbiBhZGFwdGVyIGNyZWRlbnRpYWxzIWApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIHRoaXMuX2NvbmZpZyAgPSBuZXcgR29vZ2xlQ2FsZW5kYXJBZGFwdGVyLkNvbmZpZ3VyYXRpb24oY3JlZGVudGlhbHMpO1xuICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgR29vZ2xlQ2FsZW5kYXJBZGFwdGVyLlNlcnZpY2UodGhpcy5fY29uZmlnKTtcblxuICAgIGF3YWl0IHRoaXMuX3NlcnZpY2UuaW5pdCgpO1xuXG4gICAgY29uc3QgeyBzZXJ2aWNlRW1haWw6IGVtYWlsIH0gPSBjcmVkZW50aWFscztcblxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYFN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCBnb29nbGUgY2FsZW5kYXIgYWRhcHRlciBmb3IgZW1haWw6ICR7ZW1haWx9YFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgLy8gY3VycmVudGx5IGRvaW5nIG5vdGhpbmcgd2l0aCBmaWVsZHMgaGVyZSwgYnV0IGtlZXBpbmcgYXMgcGxhY2Vob2xkZXJcbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKHVzZXJQcm9maWxlcz1bXSwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlIC8qLCBmaWVsZHMgKi8pIHtcblxuICAgIGNvbnN0IHsgZmllbGROYW1lTWFwIH0gPSB0aGlzLmNvbnN0cnVjdG9yO1xuXG4gICAgLy8gYXBpIG9wdGlvbnMuLi5cbiAgICAvLyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nb29nbGUtYXBwcy9jYWxlbmRhci92My9cbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgYWx3YXlzSW5jbHVkZUVtYWlsOiAgIHRydWUsXG4gICAgICBjYWxlbmRhcklkOiAgICAgICAgICAgJ3ByaW1hcnknLFxuICAgICAgc2luZ2xlRXZlbnRzOiAgICAgICAgIHRydWUsXG4gICAgICB0aW1lTWF4OiAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgdGltZU1pbjogICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgb3JkZXJCeTogICAgICAgICAgICAgICdzdGFydFRpbWUnXG4gICAgfTtcblxuXG4gICAgY29uc3QgZ3JvdXBSdW5TdGF0cyA9IHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKSxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLFxuICAgICAgZmlsdGVyRW5kRGF0ZTogZmlsdGVyRW5kRGF0ZSxcbiAgICAgIGVtYWlsczogdXNlclByb2ZpbGVzXG4gICAgfTtcblxuXG4gICAgdHJ5IHtcblxuICAgICAgLy8gY29sbGVjdCBldmVudHMgZm9yIHRoaXMgZ3JvdXAgb2YgZW1haWxzXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQqIHVzZXJQcm9maWxlcy5tYXAoYXN5bmModXNlclByb2ZpbGUpID0+IHtcblxuICAgICAgICBjb25zdCBpbmRpdmlkdWFsUnVuU3RhdHMgPSB7XG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgLi4udXNlclByb2ZpbGUsXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gYWRkIGF1dGggdG9rZW5zIHRvIHJlcXVlc3RcbiAgICAgICAgICBvcHRzLmF1dGggPSBhd2FpdCB0aGlzLmF1dGhvcml6ZSh1c2VyUHJvZmlsZS5lbWFpbEFmdGVyTWFwcGluZyk7XG5cbiAgICAgICAgICAvLyBmdW5jdGlvbiB0byByZWN1cnNlIHRocm91Z2ggcGFnZVRva2Vuc1xuICAgICAgICAgIGNvbnN0IGdldEV2ZW50cyA9IGFzeW5jKGRhdGEpID0+IHtcblxuICAgICAgICAgICAgLy8gcmVxdWVzdCBmaXJzdCByZXN1bHRzLi4uXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICAgIC8vIGFkZCBwYWdlIHRva2VuIGlmIGdpdmVuXG4gICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEubmV4dFBhZ2VUb2tlbikge1xuICAgICAgICAgICAgICAgIG9wdHMucGFnZVRva2VuID0gZGF0YS5uZXh0UGFnZVRva2VuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2FsZW5kYXIuZXZlbnRzLmxpc3QoXG4gICAgICAgICAgICAgICAgb3B0cywgKGVyciwgZGF0YSkgPT4gZXJyID8gcmVqKGVycikgOiByZXMoZGF0YSlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgZGF0YSBiZWluZyBhY2N1bXVsYXRlZCwgYWRkIHRvIGl0ZW1zXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICBkYXRhLml0ZW1zLnB1c2goLi4ucmVzdWx0cy5pdGVtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSB0b2tlbiBmb3IgdGhlIG5leHQgcGFnZSwgY29udGludWUuLi5cbiAgICAgICAgICAgIGlmIChyZXN1bHRzLm5leHRQYWdlVG9rZW4pIHtcbiAgICAgICAgICAgICAgZGF0YS5uZXh0UGFnZVRva2VuID0gcmVzdWx0cy5uZXh0UGFnZVRva2VuO1xuICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RXZlbnRzKGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29uc3QgeyBpdGVtcyB9ID0gYXdhaXQgZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgICBjb25zdCBkYXRhID0gXy5tYXAoaXRlbXMsIGl0ZW0gPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBvdXQgPSB7fTtcblxuICAgICAgICAgICAgXy5lYWNoKGZpZWxkTmFtZU1hcCwgKGhhdmUsIHdhbnQpID0+IHtcbiAgICAgICAgICAgICAgbGV0IG1vZGlmaWVkID0gXy5nZXQoaXRlbSwgaGF2ZSk7XG4gICAgICAgICAgICAgIGlmICgvXmRhdGVUaW1lLy50ZXN0KHdhbnQpKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWQgPSBuZXcgRGF0ZShtb2RpZmllZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKG1vZGlmaWVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvdXRbd2FudF0gPSBtb2RpZmllZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgY29uc3QgYXR0ZW5kZWVTZWxmID0gXy5maW5kKG91dC5hdHRlbmRlZXMsIChhdHRlbmRlZSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gYXR0ZW5kZWUuc2VsZjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoYXR0ZW5kZWVTZWxmKSB7XG4gICAgICAgICAgICAgIG91dC5yZXNwb25zZVN0YXR1cyA9IGF0dGVuZGVlU2VsZi5yZXNwb25zZVN0YXR1cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3V0LmF0dGVuZGVlcyA9IF8ubWFwKG91dC5hdHRlbmRlZXMsIGF0dGVuZGVlID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBlbWFpbCwgcmVzcG9uc2VTdGF0dXMgfSA9IGF0dGVuZGVlO1xuICAgICAgICAgICAgICByZXR1cm4geyBhZGRyZXNzOiBlbWFpbCwgcmVzcG9uc2U6IHJlc3BvbnNlU3RhdHVzIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIHJlcXVlc3QgYWxsIGV2ZW50cyBmb3IgdGhpcyB1c2VyIGluIHRoZSBnaXZlbiB0aW1lIGZyYW1lXG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5kaXZpZHVhbFJ1blN0YXRzLCB7IGRhdGEgfSk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgYmF0Y2ggY29sbGVjdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICBjb25zb2xlLmxvZygnR29vZ2xlQ2FsZW5kYXJBZGFwdGVyLmdldEJhdGNoRGF0YSBFcnJvcjonLCBlcnJvci5zdGFjayk7XG5cbiAgICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gZXJyb3I7XG5cbiAgICAgICAgICBpZiAoL2ludmFsaWRfZ3JhbnQvLnRlc3QoZXJyb3JNZXNzYWdlLnRvU3RyaW5nKCkpKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgRW1haWwgYWRkcmVzczogJHt1c2VyUHJvZmlsZS5lbWFpbEFmdGVyTWFwcGluZ30gbm90IGZvdW5kIGluIHRoaXMgR29vZ2xlIENhbGVuZGFyIGFjY291bnQuYDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpbmRpdmlkdWFsUnVuU3RhdHMsIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YTogW11cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ3JvdXBSdW5TdGF0cywgeyByZXN1bHRzIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihncm91cFJ1blN0YXRzLCB7XG4gICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IsXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgfVxuXG5cbiAgYXN5bmMgcnVuQ29ubmVjdGlvblRlc3QoKSB7XG4gICAgY29uc3QgeyBjcmVkZW50aWFsczogeyBlbWFpbCB9IH0gPSB0aGlzO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldEJhdGNoRGF0YShcbiAgICAgICAgWyB7IGVtYWlsLCBlbWFpbEFmdGVyTWFwcGluZzogZW1haWwgfSBdLFxuICAgICAgICBtb21lbnQoKS50b0RhdGUoKSxcbiAgICAgICAgbW9tZW50KCkuYWRkKC0xLCAnZGF5JykudG9EYXRlKClcbiAgICAgIClcblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yLnN0YWNrIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgYXN5bmMgcnVuTWVzc2FnZVRlc3QoKSB7XG4gICAgLy8gVE9ETzogZG9lcyB0aGlzIG5lZWQgdG8gYmUgZGlmZmVyZW50P1xuICAgIGNvbnNvbGUud2FybignTm90ZTogcnVuTWVzc2FnZVRlc3QoKSBjdXJyZW50bHkgY2FsbHMgcnVuQ29ubmVjdGlvblRlc3QoKScpO1xuICAgIHJldHVybiB0aGlzLnJ1bkNvbm5lY3Rpb25UZXN0KCk7XG4gIH1cblxuXG4gIC8vIGNyZWF0ZSBhdXRoZW50aWNhdGVkIHRva2VuIGZvciBhcGkgcmVxdWVzdHMgZm9yIGdpdmVuIHVzZXJcbiAgYXN5bmMgYXV0aG9yaXplKGVtYWlsKSB7XG5cbiAgICBjb25zdCB7IGNyZWRlbnRpYWxzOiB7IHNlcnZpY2VFbWFpbCwgY2VydGlmaWNhdGUgfSB9ID0gdGhpcztcblxuICAgIGNvbnN0IGF1dGggPSBuZXcgZ29vZ2xlYXBpcy5hdXRoLkpXVChcbiAgICAgIC8vIGVtYWlsIG9mIGdvb2dsZSBhcHAgYWRtaW4uLi5cbiAgICAgIHNlcnZpY2VFbWFpbCxcbiAgICAgIC8vIG5vIG5lZWQgZm9yIGtleUZpbGUuLi5cbiAgICAgIG51bGwsXG4gICAgICAvLyB0aGUgcHJpdmF0ZSBrZXkgaXRzZWxmLi4uXG4gICAgICBjZXJ0aWZpY2F0ZSxcbiAgICAgIC8vIHNjb3Blcy4uLlxuICAgICAgWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2NhbGVuZGFyLnJlYWRvbmx5J10sXG4gICAgICAvLyB0aGUgZW1haWwgb2YgdGhlIGluZGl2aWR1YWwgd2Ugd2FudCB0byBhdXRoZW50aWNhdGVcbiAgICAgIC8vICgnc3ViJyBwcm9wZXJ0eSBvZiB0aGUganNvbiB3ZWIgdG9rZW4pXG4gICAgICBlbWFpbFxuICAgICk7XG5cbiAgICAvLyBhd2FpdCBhdXRob3JpemF0aW9uXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4gYXV0aC5hdXRob3JpemUoZXJyID0+IHtcbiAgICAgIGVyciA/IHJlaihlcnIpIDogcmVzKGF1dGgpO1xuICAgIH0pKTtcbiAgfVxuXG59XG4iXX0=
//# sourceMappingURL=index.js.map
