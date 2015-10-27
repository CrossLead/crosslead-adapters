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
      var opts, groupRunStats, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this3 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
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
            context$2$0.prev = 2;
            context$2$0.next = 5;
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
                      var getEvents, _ref, data;

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
                            data = _ref.items;
                            return context$4$0.abrupt('return', {
                              v: _Object$assign(individualRunStats, { data: data })
                            });

                          case 9:
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

          case 5:
            results = context$2$0.sent;
            return context$2$0.abrupt('return', _Object$assign(groupRunStats, { results: results }));

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](2);
            return context$2$0.abrupt('return', _Object$assign(groupRunStats, {
              errorMessage: context$2$0.t0,
              success: false
            }));

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[2, 9]]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvZ29vZ2xlLWNhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQUF1QixZQUFZOzs7O3NCQUNaLFFBQVE7Ozs7b0JBQ2lCLFVBQVU7OztBQUcxRCxJQUFNLFFBQVEsR0FBRyx3QkFBVyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNDLElBQU0sa0JBQWtCLEdBQUc7QUFDekIsZUFBYSxFQUFHLGFBQWE7QUFDN0IsZ0JBQWMsRUFBRSxjQUFjO0FBQzlCLFNBQU8sRUFBUyxZQUFZO0NBQzdCLENBQUE7O0lBR29CLHFCQUFxQjtZQUFyQixxQkFBcUI7O2VBQXJCLHFCQUFxQjs7Ozs7Ozs7Ozs7O0FBTzdCLFdBUFEscUJBQXFCLEdBTzFCOzBCQVBLLHFCQUFxQjs7QUFRdEMsK0JBUmlCLHFCQUFxQiw2Q0FROUI7R0FDVDs7ZUFUa0IscUJBQXFCOztXQVluQyxpQkFBRztBQUNOLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNwQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDckIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBR1M7VUFFQSxXQUFXLEVBT1IsSUFBSSxFQUNQLFNBQVMsRUFtQkssS0FBSzs7OztBQTNCbkIsdUJBQVcsR0FBSyxJQUFJLENBQXBCLFdBQVc7O2dCQUVkLFdBQVc7Ozs7O2tCQUNSLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDOzs7OztBQUl0RCxpQkFBVyxJQUFJLElBQUksa0JBQWtCLEVBQUU7QUFDL0IsdUJBQVMsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7O0FBQzFDLGtCQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3RCLDJCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2VBQzVDO2FBQ0Y7OztBQUdELHlCQUFZLGtCQUFrQixDQUFDLENBQzVCLE9BQU8s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QzNCO0FBQ0wsbUJBQUssZ0JBQUE7QUFDTCxxQkFBTyxFQUFFLEtBQUs7YUFDZjs7Ozs7OztLQUVKOzs7V0FHbUI7Ozs7O0FBRWxCLG1CQUFPLENBQUMsSUFBSSxDQUFDLDREQUE0RCxDQUFDLENBQUM7Z0RBQ3BFLElBQUksQ0FBQyxpQkFBaUIsRUFBRTs7Ozs7OztLQUNoQzs7Ozs7V0FJYyxtQkFBQyxLQUFLO3dCQUVJLFlBQVksRUFBRSxXQUFXLEVBRTFDLElBQUk7Ozs7OzJCQUY2QyxJQUFJLENBQW5ELFdBQVc7QUFBSSx3QkFBWSxnQkFBWixZQUFZO0FBQUUsdUJBQVcsZ0JBQVgsV0FBVztBQUUxQyxnQkFBSSxHQUFHLElBQUksd0JBQVcsSUFBSSxDQUFDLEdBQUc7O0FBRWxDLHdCQUFZOztBQUVaLGdCQUFJOztBQUVKLHVCQUFXOztBQUVYLGFBQUMsbURBQW1ELENBQUM7OztBQUdyRCxpQkFBSyxDQUNOO2dEQUdNLGFBQVksVUFBQyxHQUFHLEVBQUUsR0FBRztxQkFBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ3JELG1CQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztlQUM1QixDQUFDO2FBQUEsQ0FBQzs7Ozs7OztLQUNKOzs7U0F4TmtCLHFCQUFxQjs7O3FCQUFyQixxQkFBcUIiLCJmaWxlIjoiY2xBZGFwdGVycy9nb29nbGUtY2FsZW5kYXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ29vZ2xlYXBpcyBmcm9tICdnb29nbGVhcGlzJztcbmltcG9ydCBtb21lbnQgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgeyBBZGFwdGVyLCBDb25maWd1cmF0aW9uLCBTZXJ2aWNlIH0gZnJvbSAnLi4vYmFzZS8nO1xuXG4vLyBnb29nbGUgY2FsZW5kYXIgYXBpXG5jb25zdCBjYWxlbmRhciA9IGdvb2dsZWFwaXMuY2FsZW5kYXIoJ3YzJyk7XG5cbmNvbnN0IGNyZWRlbnRpYWxNYXBwaW5ncyA9IHtcbiAgJ2NlcnRpZmljYXRlJyA6ICdwcml2YXRlX2tleScsXG4gICdzZXJ2aWNlRW1haWwnOiAnY2xpZW50X2VtYWlsJyxcbiAgJ2VtYWlsJyAgICAgICA6ICdhZG1pbkVtYWlsJ1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvb2dsZUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIEFkYXB0ZXIge1xuXG4gIHN0YXRpYyBDb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbjtcbiAgc3RhdGljIFNlcnZpY2UgPSBTZXJ2aWNlO1xuXG5cbiAgLy8gY29uc3RydWN0b3IgbmVlZHMgdG8gY2FsbCBzdXBlclxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cblxuICByZXNldCgpIHtcbiAgICBkZWxldGUgdGhpcy5fY29uZmlnO1xuICAgIGRlbGV0ZSB0aGlzLl9zZXJ2aWNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICBhc3luYyBpbml0KCkge1xuXG4gICAgY29uc3QgeyBjcmVkZW50aWFscyB9ID0gdGhpcztcblxuICAgIGlmICghY3JlZGVudGlhbHMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3JlZGVudGlhbHMgcmVxdWlyZWQgZm9yIGFkYXB0ZXIuJyk7XG4gICAgfVxuXG4gICAgLy8gbWFwIEdvb2dsZSBqc29uIGtleXMgdG8ga2V5cyB1c2VkIGluIHRoaXMgbGlicmFyeVxuICAgIGZvciAoY29uc3Qgd2FudCBpbiBjcmVkZW50aWFsTWFwcGluZ3MpIHtcbiAgICAgIGNvbnN0IGFsdGVybmF0ZSA9IGNyZWRlbnRpYWxNYXBwaW5nc1t3YW50XTtcbiAgICAgIGlmICghY3JlZGVudGlhbHNbd2FudF0pIHtcbiAgICAgICAgY3JlZGVudGlhbHNbd2FudF0gPSBjcmVkZW50aWFsc1thbHRlcm5hdGVdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlIHJlcXVpcmVkIGNyZWRlbnRpYWwgcHJvcGVydGllc1xuICAgIE9iamVjdC5rZXlzKGNyZWRlbnRpYWxNYXBwaW5ncylcbiAgICAgIC5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzW3Byb3BdKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAke3Byb3B9IHJlcXVpcmVkIGluIGFkYXB0ZXIgY3JlZGVudGlhbHMhYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgdGhpcy5fY29uZmlnICA9IG5ldyBHb29nbGVDYWxlbmRhckFkYXB0ZXIuQ29uZmlndXJhdGlvbihjcmVkZW50aWFscyk7XG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBHb29nbGVDYWxlbmRhckFkYXB0ZXIuU2VydmljZSh0aGlzLl9jb25maWcpO1xuXG4gICAgYXdhaXQgdGhpcy5fc2VydmljZS5pbml0KCk7XG5cbiAgICBjb25zdCB7IHNlcnZpY2VFbWFpbDogZW1haWwgfSA9IGNyZWRlbnRpYWxzO1xuXG4gICAgY29uc29sZS5sb2coXG4gICAgICBgU3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkIGdvb2dsZSBjYWxlbmRhciBhZGFwdGVyIGZvciBlbWFpbDogJHtlbWFpbH1gXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICAvLyBjdXJyZW50bHkgZG9pbmcgbm90aGluZyB3aXRoIGZpZWxkcyBoZXJlLCBidXQga2VlcGluZyBhcyBwbGFjZWhvbGRlclxuICBhc3luYyBnZXRCYXRjaERhdGEoZW1haWxzPVtdLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUgLyosIGZpZWxkcyAqLykge1xuXG4gICAgLy8gYXBpIG9wdGlvbnMuLi5cbiAgICAvLyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nb29nbGUtYXBwcy9jYWxlbmRhci92My9cbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgYWx3YXlzSW5jbHVkZUVtYWlsOiAgIHRydWUsXG4gICAgICBjYWxlbmRhcklkOiAgICAgICAgICAgJ3ByaW1hcnknLFxuICAgICAgc2luZ2xlRXZlbnRzOiAgICAgICAgIHRydWUsXG4gICAgICB0aW1lTWF4OiAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgdGltZU1pbjogICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgb3JkZXJCeTogICAgICAgICAgICAgICdzdGFydFRpbWUnXG4gICAgfTtcblxuXG4gICAgY29uc3QgZ3JvdXBSdW5TdGF0cyA9IHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKSxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLFxuICAgICAgZmlsdGVyRW5kRGF0ZTogZmlsdGVyRW5kRGF0ZSxcbiAgICAgIGVtYWlsczogZW1haWxzXG4gICAgfTtcblxuXG4gICAgdHJ5IHtcblxuICAgICAgLy8gY29sbGVjdCBldmVudHMgZm9yIHRoaXMgZ3JvdXAgb2YgZW1haWxzXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQqIGVtYWlscy5tYXAoYXN5bmMoZW1haWwpID0+IHtcblxuICAgICAgICBjb25zdCBpbmRpdmlkdWFsUnVuU3RhdHMgPSB7XG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgZW1haWwsXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gYWRkIGF1dGggdG9rZW5zIHRvIHJlcXVlc3RcbiAgICAgICAgICBvcHRzLmF1dGggPSBhd2FpdCB0aGlzLmF1dGhvcml6ZShlbWFpbCk7XG5cbiAgICAgICAgICAvLyBmdW5jdGlvbiB0byByZWN1cnNlIHRocm91Z2ggcGFnZVRva2Vuc1xuICAgICAgICAgIGNvbnN0IGdldEV2ZW50cyA9IGFzeW5jKGRhdGEpID0+IHtcblxuICAgICAgICAgICAgLy8gcmVxdWVzdCBmaXJzdCByZXN1bHRzLi4uXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICAgIC8vIGFkZCBwYWdlIHRva2VuIGlmIGdpdmVuXG4gICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEubmV4dFBhZ2VUb2tlbikge1xuICAgICAgICAgICAgICAgIG9wdHMucGFnZVRva2VuID0gZGF0YS5uZXh0UGFnZVRva2VuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2FsZW5kYXIuZXZlbnRzLmxpc3QoXG4gICAgICAgICAgICAgICAgb3B0cywgKGVyciwgZGF0YSkgPT4gZXJyID8gcmVqKGVycikgOiByZXMoZGF0YSlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgZGF0YSBiZWluZyBhY2N1bXVsYXRlZCwgYWRkIHRvIGl0ZW1zXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICBkYXRhLml0ZW1zLnB1c2goLi4ucmVzdWx0cy5pdGVtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSB0b2tlbiBmb3IgdGhlIG5leHQgcGFnZSwgY29udGludWUuLi5cbiAgICAgICAgICAgIGlmIChyZXN1bHRzLm5leHRQYWdlVG9rZW4pIHtcbiAgICAgICAgICAgICAgZGF0YS5uZXh0UGFnZVRva2VuID0gcmVzdWx0cy5uZXh0UGFnZVRva2VuO1xuICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RXZlbnRzKGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29uc3QgeyBpdGVtczogZGF0YSB9ID0gYXdhaXQgZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgICAvLyByZXF1ZXN0IGFsbCBldmVudHMgZm9yIHRoaXMgdXNlciBpbiB0aGUgZ2l2ZW4gdGltZSBmcmFtZVxuICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGluZGl2aWR1YWxSdW5TdGF0cywgeyBkYXRhIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIGJhdGNoIGNvbGxlY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgY29uc29sZS5sb2coJ0dvb2dsZUNhbGVuZGFyQWRhcHRlci5nZXRCYXRjaERhdGEgRXJyb3I6JywgZXJyb3Iuc3RhY2spO1xuXG4gICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IGVycm9yO1xuXG4gICAgICAgICAgaWYgKC9pbnZhbGlkX2dyYW50Ly50ZXN0KGVycm9yTWVzc2FnZS50b1N0cmluZygpKSkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gYEVtYWlsIGFkZHJlc3M6ICR7ZW1haWx9IG5vdCBmb3VuZCBpbiB0aGlzIEdvb2dsZSBDYWxlbmRhciBhY2NvdW50LmA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5kaXZpZHVhbFJ1blN0YXRzLCB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IFtdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGdyb3VwUnVuU3RhdHMsIHsgcmVzdWx0cyB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ3JvdXBSdW5TdGF0cywge1xuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH1cblxuXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KCkge1xuICAgIGNvbnN0IHsgY3JlZGVudGlhbHM6IHsgZW1haWwgfSB9ID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXG4gICAgICAgIFsgZW1haWwgXSxcbiAgICAgICAgbW9tZW50KCkudG9EYXRlKCksXG4gICAgICAgIG1vbWVudCgpLmFkZCgtMSwgJ2RheScpLnRvRGF0ZSgpXG4gICAgICApXG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvci5zdGFjayB8fCBlcnJvcik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcixcbiAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIGFzeW5jIHJ1bk1lc3NhZ2VUZXN0KCkge1xuICAgIC8vIFRPRE86IGRvZXMgdGhpcyBuZWVkIHRvIGJlIGRpZmZlcmVudD9cbiAgICBjb25zb2xlLndhcm4oJ05vdGU6IHJ1bk1lc3NhZ2VUZXN0KCkgY3VycmVudGx5IGNhbGxzIHJ1bkNvbm5lY3Rpb25UZXN0KCknKTtcbiAgICByZXR1cm4gdGhpcy5ydW5Db25uZWN0aW9uVGVzdCgpO1xuICB9XG5cblxuICAvLyBjcmVhdGUgYXV0aGVudGljYXRlZCB0b2tlbiBmb3IgYXBpIHJlcXVlc3RzIGZvciBnaXZlbiB1c2VyXG4gIGFzeW5jIGF1dGhvcml6ZShlbWFpbCkge1xuXG4gICAgY29uc3QgeyBjcmVkZW50aWFsczogeyBzZXJ2aWNlRW1haWwsIGNlcnRpZmljYXRlIH0gfSA9IHRoaXM7XG5cbiAgICBjb25zdCBhdXRoID0gbmV3IGdvb2dsZWFwaXMuYXV0aC5KV1QoXG4gICAgICAvLyBlbWFpbCBvZiBnb29nbGUgYXBwIGFkbWluLi4uXG4gICAgICBzZXJ2aWNlRW1haWwsXG4gICAgICAvLyBubyBuZWVkIGZvciBrZXlGaWxlLi4uXG4gICAgICBudWxsLFxuICAgICAgLy8gdGhlIHByaXZhdGUga2V5IGl0c2VsZi4uLlxuICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAvLyBzY29wZXMuLi5cbiAgICAgIFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9jYWxlbmRhci5yZWFkb25seSddLFxuICAgICAgLy8gdGhlIGVtYWlsIG9mIHRoZSBpbmRpdmlkdWFsIHdlIHdhbnQgdG8gYXV0aGVudGljYXRlXG4gICAgICAvLyAoJ3N1YicgcHJvcGVydHkgb2YgdGhlIGpzb24gd2ViIHRva2VuKVxuICAgICAgZW1haWxcbiAgICApO1xuXG4gICAgLy8gYXdhaXQgYXV0aG9yaXphdGlvblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IGF1dGguYXV0aG9yaXplKGVyciA9PiB7XG4gICAgICBlcnIgPyByZWooZXJyKSA6IHJlcyhhdXRoKTtcbiAgICB9KSk7XG4gIH1cblxufVxuIl19
//# sourceMappingURL=index.js.map
