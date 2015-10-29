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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvZ29vZ2xlLWNhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQUF1QixZQUFZOzs7O3NCQUNaLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OztvQkFDaUIsVUFBVTs7O0FBRzFELElBQU0sUUFBUSxHQUFHLHdCQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFM0MsSUFBTSxrQkFBa0IsR0FBRztBQUN6QixlQUFhLEVBQUcsYUFBYTtBQUM3QixnQkFBYyxFQUFFLGNBQWM7QUFDOUIsU0FBTyxFQUFTLFlBQVk7Q0FDN0IsQ0FBQTs7SUFHb0IscUJBQXFCO1lBQXJCLHFCQUFxQjs7ZUFBckIscUJBQXFCOzs7Ozs7Ozs7Ozs7V0FNbEI7O0FBRXBCLGVBQVMsRUFBOEIsSUFBSTtBQUMzQyxpQkFBVyxFQUE0QixXQUFXO0FBQ2xELHVCQUFpQixFQUFzQixTQUFTO0FBQ2hELDRCQUFzQixFQUFpQixTQUFTO0FBQ2hELHVCQUFpQixFQUFzQixzQkFBc0I7QUFDN0Qsb0JBQWMsRUFBeUIsbUJBQW1CO0FBQzFELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxnQkFBVSxFQUE2QixVQUFVO0FBQ2pELGNBQVEsRUFBK0IsUUFBUTtBQUMvQyxpQkFBVyxFQUE0QixjQUFjO0FBQ3JELG1CQUFhLEVBQTBCLGdCQUFnQjtBQUN2RCxzQkFBZ0IsRUFBdUIsaUJBQWlCO0FBQ3hELGtCQUFZLEVBQTJCLFlBQVk7QUFDbkQsc0JBQWdCLEVBQXVCLGdCQUFnQjtBQUN2RCxxQkFBZSxFQUF3QixnQkFBZ0I7QUFDdkQsbUJBQWEsRUFBMEIsY0FBYztBQUNyRCxlQUFTLEVBQThCLFNBQVM7QUFDaEQsV0FBSyxFQUFrQyxVQUFVO0FBQ2pELG1CQUFhLEVBQTBCLGFBQWE7S0FDckQ7Ozs7OztBQUdVLFdBOUJRLHFCQUFxQixHQThCMUI7MEJBOUJLLHFCQUFxQjs7QUErQnRDLCtCQS9CaUIscUJBQXFC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Ozs7cUJBQXJCLHFCQUFxQiIsImZpbGUiOiJjbEFkYXB0ZXJzL2dvb2dsZS1jYWxlbmRhci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnb29nbGVhcGlzIGZyb20gJ2dvb2dsZWFwaXMnO1xuaW1wb3J0IG1vbWVudCAgICAgZnJvbSAnbW9tZW50JztcbmltcG9ydCBfICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBBZGFwdGVyLCBDb25maWd1cmF0aW9uLCBTZXJ2aWNlIH0gZnJvbSAnLi4vYmFzZS8nO1xuXG4vLyBnb29nbGUgY2FsZW5kYXIgYXBpXG5jb25zdCBjYWxlbmRhciA9IGdvb2dsZWFwaXMuY2FsZW5kYXIoJ3YzJyk7XG5cbmNvbnN0IGNyZWRlbnRpYWxNYXBwaW5ncyA9IHtcbiAgJ2NlcnRpZmljYXRlJyA6ICdwcml2YXRlX2tleScsXG4gICdzZXJ2aWNlRW1haWwnOiAnY2xpZW50X2VtYWlsJyxcbiAgJ2VtYWlsJyAgICAgICA6ICdhZG1pbkVtYWlsJ1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvb2dsZUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIEFkYXB0ZXIge1xuXG4gIHN0YXRpYyBDb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbjtcbiAgc3RhdGljIFNlcnZpY2UgPSBTZXJ2aWNlO1xuXG4gIC8vIGNvbnZlcnQgdGhlIG5hbWVzIG9mIHRoZSBhcGkgcmVzcG9uc2UgZGF0YVxuICBzdGF0aWMgZmllbGROYW1lTWFwID0ge1xuICAgIC8vIERlc2lyZWQuLi4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdpdmVuLi4uXG4gICAgJ2V2ZW50SWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lkJyxcbiAgICAnYXR0ZW5kZWVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAnYXR0ZW5kZWVzJyxcbiAgICAnZGF0ZVRpbWVDcmVhdGVkJzogICAgICAgICAgICAgICAgICAgICAnY3JlYXRlZCcsXG4gICAgJ2RhdGVUaW1lTGFzdE1vZGlmaWVkJzogICAgICAgICAgICAgICAgJ3VwZGF0ZWQnLFxuICAgICdhdHRlbmRlZUFkZHJlc3MnOiAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2F0dGVuZGVlTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnaUNhbFVJRCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaUNhbFVJRCcsXG4gICAgJ2xvY2F0aW9uJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xvY2F0aW9uJyxcbiAgICAnc3RhdHVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3RhdHVzJyxcbiAgICAnaXNDcmVhdG9yJzogICAgICAgICAgICAgICAgICAgICAgICAgICAnY3JlYXRvci5zZWxmJyxcbiAgICAnaXNPcmdhbml6ZXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnb3JnYW5pemVyLnNlbGYnLFxuICAgICdvcmdhbml6ZXJFbWFpbCc6ICAgICAgICAgICAgICAgICAgICAgICdvcmdhbml6ZXIuZW1haWwnLFxuICAgICdyZWN1cnJhbmNlJzogICAgICAgICAgICAgICAgICAgICAgICAgICdyZWN1cnJhbmNlJyxcbiAgICAncmVzcG9uc2VTdGF0dXMnOiAgICAgICAgICAgICAgICAgICAgICAncmVzcG9uc2VTdGF0dXMnLFxuICAgICdkYXRlVGltZVN0YXJ0JzogICAgICAgICAgICAgICAgICAgICAgICdzdGFydC5kYXRlVGltZScsXG4gICAgJ2RhdGVUaW1lRW5kJzogICAgICAgICAgICAgICAgICAgICAgICAgJ2VuZC5kYXRlVGltZScsXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N1bW1hcnknLFxuICAgICd1cmwnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdodG1sTGluaycsXG4gICAgJ2hhbmdvdXRMaW5rJzogICAgICAgICAgICAgICAgICAgICAgICAgJ2hhbmdvdXRMaW5rJ1xuICB9XG5cbiAgLy8gY29uc3RydWN0b3IgbmVlZHMgdG8gY2FsbCBzdXBlclxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cblxuICByZXNldCgpIHtcbiAgICBkZWxldGUgdGhpcy5fY29uZmlnO1xuICAgIGRlbGV0ZSB0aGlzLl9zZXJ2aWNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICBhc3luYyBpbml0KCkge1xuXG4gICAgY29uc3QgeyBjcmVkZW50aWFscyB9ID0gdGhpcztcblxuICAgIGlmICghY3JlZGVudGlhbHMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3JlZGVudGlhbHMgcmVxdWlyZWQgZm9yIGFkYXB0ZXIuJyk7XG4gICAgfVxuXG4gICAgLy8gbWFwIEdvb2dsZSBqc29uIGtleXMgdG8ga2V5cyB1c2VkIGluIHRoaXMgbGlicmFyeVxuICAgIGZvciAoY29uc3Qgd2FudCBpbiBjcmVkZW50aWFsTWFwcGluZ3MpIHtcbiAgICAgIGNvbnN0IGFsdGVybmF0ZSA9IGNyZWRlbnRpYWxNYXBwaW5nc1t3YW50XTtcbiAgICAgIGlmICghY3JlZGVudGlhbHNbd2FudF0pIHtcbiAgICAgICAgY3JlZGVudGlhbHNbd2FudF0gPSBjcmVkZW50aWFsc1thbHRlcm5hdGVdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlIHJlcXVpcmVkIGNyZWRlbnRpYWwgcHJvcGVydGllc1xuICAgIE9iamVjdC5rZXlzKGNyZWRlbnRpYWxNYXBwaW5ncylcbiAgICAgIC5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzW3Byb3BdKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAke3Byb3B9IHJlcXVpcmVkIGluIGFkYXB0ZXIgY3JlZGVudGlhbHMhYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgdGhpcy5fY29uZmlnICA9IG5ldyBHb29nbGVDYWxlbmRhckFkYXB0ZXIuQ29uZmlndXJhdGlvbihjcmVkZW50aWFscyk7XG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBHb29nbGVDYWxlbmRhckFkYXB0ZXIuU2VydmljZSh0aGlzLl9jb25maWcpO1xuXG4gICAgYXdhaXQgdGhpcy5fc2VydmljZS5pbml0KCk7XG5cbiAgICBjb25zdCB7IHNlcnZpY2VFbWFpbDogZW1haWwgfSA9IGNyZWRlbnRpYWxzO1xuXG4gICAgY29uc29sZS5sb2coXG4gICAgICBgU3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkIGdvb2dsZSBjYWxlbmRhciBhZGFwdGVyIGZvciBlbWFpbDogJHtlbWFpbH1gXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICAvLyBjdXJyZW50bHkgZG9pbmcgbm90aGluZyB3aXRoIGZpZWxkcyBoZXJlLCBidXQga2VlcGluZyBhcyBwbGFjZWhvbGRlclxuICBhc3luYyBnZXRCYXRjaERhdGEoZW1haWxzPVtdLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUgLyosIGZpZWxkcyAqLykge1xuXG4gICAgY29uc3QgeyBmaWVsZE5hbWVNYXAgfSA9IHRoaXMuY29uc3RydWN0b3I7XG5cbiAgICAvLyBhcGkgb3B0aW9ucy4uLlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2dvb2dsZS1hcHBzL2NhbGVuZGFyL3YzL1xuICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICBhbHdheXNJbmNsdWRlRW1haWw6ICAgdHJ1ZSxcbiAgICAgIGNhbGVuZGFySWQ6ICAgICAgICAgICAncHJpbWFyeScsXG4gICAgICBzaW5nbGVFdmVudHM6ICAgICAgICAgdHJ1ZSxcbiAgICAgIHRpbWVNYXg6ICAgICAgICAgICAgICBmaWx0ZXJFbmREYXRlLnRvSVNPU3RyaW5nKCksXG4gICAgICB0aW1lTWluOiAgICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCksXG4gICAgICBvcmRlckJ5OiAgICAgICAgICAgICAgJ3N0YXJ0VGltZSdcbiAgICB9O1xuXG5cbiAgICBjb25zdCBncm91cFJ1blN0YXRzID0ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpLFxuICAgICAgZmlsdGVyU3RhcnREYXRlOiBmaWx0ZXJTdGFydERhdGUsXG4gICAgICBmaWx0ZXJFbmREYXRlOiBmaWx0ZXJFbmREYXRlLFxuICAgICAgZW1haWxzOiBlbWFpbHNcbiAgICB9O1xuXG5cbiAgICB0cnkge1xuXG4gICAgICAvLyBjb2xsZWN0IGV2ZW50cyBmb3IgdGhpcyBncm91cCBvZiBlbWFpbHNcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCogZW1haWxzLm1hcChhc3luYyhlbWFpbCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGluZGl2aWR1YWxSdW5TdGF0cyA9IHtcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICBlbWFpbCxcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBhZGQgYXV0aCB0b2tlbnMgdG8gcmVxdWVzdFxuICAgICAgICAgIG9wdHMuYXV0aCA9IGF3YWl0IHRoaXMuYXV0aG9yaXplKGVtYWlsKTtcblxuICAgICAgICAgIC8vIGZ1bmN0aW9uIHRvIHJlY3Vyc2UgdGhyb3VnaCBwYWdlVG9rZW5zXG4gICAgICAgICAgY29uc3QgZ2V0RXZlbnRzID0gYXN5bmMoZGF0YSkgPT4ge1xuXG4gICAgICAgICAgICAvLyByZXF1ZXN0IGZpcnN0IHJlc3VsdHMuLi5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgICAgICAgLy8gYWRkIHBhZ2UgdG9rZW4gaWYgZ2l2ZW5cbiAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5uZXh0UGFnZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgb3B0cy5wYWdlVG9rZW4gPSBkYXRhLm5leHRQYWdlVG9rZW47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjYWxlbmRhci5ldmVudHMubGlzdChcbiAgICAgICAgICAgICAgICBvcHRzLCAoZXJyLCBkYXRhKSA9PiBlcnIgPyByZWooZXJyKSA6IHJlcyhkYXRhKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSBkYXRhIGJlaW5nIGFjY3VtdWxhdGVkLCBhZGQgdG8gaXRlbXNcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgIGRhdGEuaXRlbXMucHVzaCguLi5yZXN1bHRzLml0ZW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGEgPSByZXN1bHRzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIHRva2VuIGZvciB0aGUgbmV4dCBwYWdlLCBjb250aW51ZS4uLlxuICAgICAgICAgICAgaWYgKHJlc3VsdHMubmV4dFBhZ2VUb2tlbikge1xuICAgICAgICAgICAgICBkYXRhLm5leHRQYWdlVG9rZW4gPSByZXN1bHRzLm5leHRQYWdlVG9rZW47XG4gICAgICAgICAgICAgIHJldHVybiBhd2FpdCBnZXRFdmVudHMoZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zdCB7IGl0ZW1zIH0gPSBhd2FpdCBnZXRFdmVudHMoKTtcblxuICAgICAgICAgIGNvbnN0IGRhdGEgPSBfLm1hcChpdGVtcywgaXRlbSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IG91dCA9IHt9O1xuXG4gICAgICAgICAgICBfLmVhY2goZmllbGROYW1lTWFwLCAoaGF2ZSwgd2FudCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgbW9kaWZpZWQgPSBfLmdldChpdGVtLCBoYXZlKTtcbiAgICAgICAgICAgICAgaWYgKC9eZGF0ZVRpbWUvLnRlc3Qod2FudCkpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IG5ldyBEYXRlKG1vZGlmaWVkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAobW9kaWZpZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG91dFt3YW50XSA9IG1vZGlmaWVkO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgb3V0LmF0dGVuZGVlcyA9IF8ubWFwKG91dC5hdHRlbmRlZXMsIGF0dGVuZGVlID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBlbWFpbCwgcmVzcG9uc2VTdGF0dXMgfSA9IGF0dGVuZGVlO1xuICAgICAgICAgICAgICByZXR1cm4geyBhZGRyZXNzOiBlbWFpbCwgcmVzcG9uc2U6IHJlc3BvbnNlU3RhdHVzIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIHJlcXVlc3QgYWxsIGV2ZW50cyBmb3IgdGhpcyB1c2VyIGluIHRoZSBnaXZlbiB0aW1lIGZyYW1lXG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5kaXZpZHVhbFJ1blN0YXRzLCB7IGRhdGEgfSk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgYmF0Y2ggY29sbGVjdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgICBjb25zb2xlLmxvZygnR29vZ2xlQ2FsZW5kYXJBZGFwdGVyLmdldEJhdGNoRGF0YSBFcnJvcjonLCBlcnJvci5zdGFjayk7XG5cbiAgICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gZXJyb3I7XG5cbiAgICAgICAgICBpZiAoL2ludmFsaWRfZ3JhbnQvLnRlc3QoZXJyb3JNZXNzYWdlLnRvU3RyaW5nKCkpKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgRW1haWwgYWRkcmVzczogJHtlbWFpbH0gbm90IGZvdW5kIGluIHRoaXMgR29vZ2xlIENhbGVuZGFyIGFjY291bnQuYDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpbmRpdmlkdWFsUnVuU3RhdHMsIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YTogW11cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ3JvdXBSdW5TdGF0cywgeyByZXN1bHRzIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihncm91cFJ1blN0YXRzLCB7XG4gICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IsXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgfVxuXG5cbiAgYXN5bmMgcnVuQ29ubmVjdGlvblRlc3QoKSB7XG4gICAgY29uc3QgeyBjcmVkZW50aWFsczogeyBlbWFpbCB9IH0gPSB0aGlzO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldEJhdGNoRGF0YShcbiAgICAgICAgWyBlbWFpbCBdLFxuICAgICAgICBtb21lbnQoKS50b0RhdGUoKSxcbiAgICAgICAgbW9tZW50KCkuYWRkKC0xLCAnZGF5JykudG9EYXRlKClcbiAgICAgIClcblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yLnN0YWNrIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgYXN5bmMgcnVuTWVzc2FnZVRlc3QoKSB7XG4gICAgLy8gVE9ETzogZG9lcyB0aGlzIG5lZWQgdG8gYmUgZGlmZmVyZW50P1xuICAgIGNvbnNvbGUud2FybignTm90ZTogcnVuTWVzc2FnZVRlc3QoKSBjdXJyZW50bHkgY2FsbHMgcnVuQ29ubmVjdGlvblRlc3QoKScpO1xuICAgIHJldHVybiB0aGlzLnJ1bkNvbm5lY3Rpb25UZXN0KCk7XG4gIH1cblxuXG4gIC8vIGNyZWF0ZSBhdXRoZW50aWNhdGVkIHRva2VuIGZvciBhcGkgcmVxdWVzdHMgZm9yIGdpdmVuIHVzZXJcbiAgYXN5bmMgYXV0aG9yaXplKGVtYWlsKSB7XG5cbiAgICBjb25zdCB7IGNyZWRlbnRpYWxzOiB7IHNlcnZpY2VFbWFpbCwgY2VydGlmaWNhdGUgfSB9ID0gdGhpcztcblxuICAgIGNvbnN0IGF1dGggPSBuZXcgZ29vZ2xlYXBpcy5hdXRoLkpXVChcbiAgICAgIC8vIGVtYWlsIG9mIGdvb2dsZSBhcHAgYWRtaW4uLi5cbiAgICAgIHNlcnZpY2VFbWFpbCxcbiAgICAgIC8vIG5vIG5lZWQgZm9yIGtleUZpbGUuLi5cbiAgICAgIG51bGwsXG4gICAgICAvLyB0aGUgcHJpdmF0ZSBrZXkgaXRzZWxmLi4uXG4gICAgICBjZXJ0aWZpY2F0ZSxcbiAgICAgIC8vIHNjb3Blcy4uLlxuICAgICAgWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2NhbGVuZGFyLnJlYWRvbmx5J10sXG4gICAgICAvLyB0aGUgZW1haWwgb2YgdGhlIGluZGl2aWR1YWwgd2Ugd2FudCB0byBhdXRoZW50aWNhdGVcbiAgICAgIC8vICgnc3ViJyBwcm9wZXJ0eSBvZiB0aGUganNvbiB3ZWIgdG9rZW4pXG4gICAgICBlbWFpbFxuICAgICk7XG5cbiAgICAvLyBhd2FpdCBhdXRob3JpemF0aW9uXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4gYXV0aC5hdXRob3JpemUoZXJyID0+IHtcbiAgICAgIGVyciA/IHJlaihlcnIpIDogcmVzKGF1dGgpO1xuICAgIH0pKTtcbiAgfVxuXG59XG4iXX0=
//# sourceMappingURL=index.js.map
