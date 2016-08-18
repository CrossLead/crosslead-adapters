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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvZ29vZ2xlLWNhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBQXVCLFlBQVk7Ozs7c0JBQ1osUUFBUTs7OztzQkFDUixRQUFROzs7O29CQUNpQixVQUFVOzs7QUFHMUQsSUFBTSxRQUFRLEdBQUcsd0JBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzQyxJQUFNLGtCQUFrQixHQUFHO0FBQ3pCLGVBQWEsRUFBRyxhQUFhO0FBQzdCLGdCQUFjLEVBQUUsY0FBYztBQUM5QixTQUFPLEVBQVMsWUFBWTtDQUM3QixDQUFBOztJQUdvQixxQkFBcUI7WUFBckIscUJBQXFCOztlQUFyQixxQkFBcUI7Ozs7Ozs7Ozs7OztXQU1sQjs7QUFFcEIsZUFBUyxFQUE4QixJQUFJO0FBQzNDLGlCQUFXLEVBQTRCLFdBQVc7QUFDbEQsdUJBQWlCLEVBQXNCLFNBQVM7QUFDaEQsNEJBQXNCLEVBQWlCLFNBQVM7QUFDaEQsdUJBQWlCLEVBQXNCLHNCQUFzQjtBQUM3RCxvQkFBYyxFQUF5QixtQkFBbUI7QUFDMUQsZUFBUyxFQUE4QixTQUFTO0FBQ2hELGdCQUFVLEVBQTZCLFVBQVU7QUFDakQsY0FBUSxFQUErQixRQUFRO0FBQy9DLGlCQUFXLEVBQTRCLGNBQWM7QUFDckQsbUJBQWEsRUFBMEIsZ0JBQWdCO0FBQ3ZELHNCQUFnQixFQUF1QixpQkFBaUI7QUFDeEQsa0JBQVksRUFBMkIsWUFBWTtBQUNuRCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELHFCQUFlLEVBQXdCLGdCQUFnQjtBQUN2RCxtQkFBYSxFQUEwQixjQUFjO0FBQ3JELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxXQUFLLEVBQWtDLFVBQVU7QUFDakQsbUJBQWEsRUFBMEIsYUFBYTtLQUNyRDs7Ozs7O0FBR1UsV0E5QlEscUJBQXFCLEdBOEIxQjswQkE5QksscUJBQXFCOztBQStCdEMsK0JBL0JpQixxQkFBcUIsNkNBK0I5QjtHQUNUOztlQWhDa0IscUJBQXFCOztXQW1DbkMsaUJBQUc7QUFDTixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3JCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUdTO1VBRUEsV0FBVyxFQU9SLElBQUksRUFDUCxTQUFTLEVBbUJLLEtBQUs7Ozs7QUEzQm5CLHVCQUFXLEdBQUssSUFBSSxDQUFwQixXQUFXOztnQkFFZCxXQUFXOzs7OztrQkFDUixJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQzs7Ozs7QUFJdEQsaUJBQVcsSUFBSSxJQUFJLGtCQUFrQixFQUFFO0FBQy9CLHVCQUFTLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDOztBQUMxQyxrQkFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0QiwyQkFBVyxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztlQUM1QzthQUNGOzs7QUFHRCx5QkFBWSxrQkFBa0IsQ0FBQyxDQUM1QixPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDZixrQkFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0QixzQkFBTSxJQUFJLEtBQUssZUFBYSxJQUFJLHVDQUFvQyxDQUFDO2VBQ3RFO2FBQ0YsQ0FBQyxDQUFDOztBQUVMLGdCQUFJLENBQUMsT0FBTyxHQUFJLElBQUkscUJBQXFCLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JFLGdCQUFJLENBQUMsUUFBUSxHQUFHLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7OzZDQUUxRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTs7O0FBRUosaUJBQUssR0FBSyxXQUFXLENBQW5DLFlBQVk7O0FBRXBCLG1CQUFPLENBQUMsR0FBRyxrRUFDc0QsS0FBSyxDQUNyRSxDQUFDOztnREFFSyxJQUFJOzs7Ozs7O0tBQ1o7Ozs7O1dBSWlCLHNCQUFDLFlBQVksRUFBSyxlQUFlLEVBQUUsYUFBYTtVQUEvQyxZQUFZLGdCQUFaLFlBQVksR0FBQyxFQUFFO1VBRXhCLFlBQVksRUFJZCxJQUFJLEVBVUosYUFBYSxFQVlYLE9BQU87Ozs7OztBQTFCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFJZCxnQkFBSSxHQUFHO0FBQ1gsZ0NBQWtCLEVBQUksSUFBSTtBQUMxQix3QkFBVSxFQUFZLFNBQVM7QUFDL0IsMEJBQVksRUFBVSxJQUFJO0FBQzFCLHFCQUFPLEVBQWUsYUFBYSxDQUFDLFdBQVcsRUFBRTtBQUNqRCxxQkFBTyxFQUFlLGVBQWUsQ0FBQyxXQUFXLEVBQUU7QUFDbkQscUJBQU8sRUFBZSxXQUFXO2FBQ2xDO0FBR0sseUJBQWEsR0FBRztBQUNwQixxQkFBTyxFQUFFLElBQUk7QUFDYixxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO0FBQ2hDLDZCQUFlLEVBQUUsZUFBZTtBQUNoQywyQkFBYSxFQUFFLGFBQWE7QUFDNUIsb0JBQU0sRUFBRSxZQUFZO2FBQ3JCOzs7MERBTXdCLFlBQVksQ0FBQyxHQUFHLENBQUMsb0JBQU0sV0FBVztrQkFFakQsa0JBQWtCLFFBbUZsQixZQUFZOzs7Ozs7O0FBbkZaLHNDQUFrQjtBQUN0QixxQ0FBZSxFQUFmLGVBQWU7QUFDZixtQ0FBYSxFQUFiLGFBQWE7dUJBQ1YsV0FBVztBQUNkLDZCQUFPLEVBQUUsSUFBSTtBQUNiLDZCQUFPLEVBQUUsMEJBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7Ozs7OzBCQVExQixTQUFTLFFBOEJQLEtBQUssRUFFUCxJQUFJOzs7Ozs7Ozs2REFuQ1EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUM7OztBQUEvRCxnQ0FBSSxDQUFDLElBQUk7O0FBR0gscUNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBUyxJQUFJO2tDQUdwQixPQUFPOzs7Ozs7cUVBQVMsYUFBWSxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUs7O0FBRTlDLDBDQUFJLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQzlCLDRDQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7dUNBQ3JDOztBQUVELDhDQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDbEIsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFFLElBQUk7K0NBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO3VDQUFBLENBQ2hELENBQUM7cUNBQ0gsQ0FBQzs7O0FBVEksMkNBQU87OztBQVliLHdDQUFJLElBQUksRUFBRTtBQUNSLHFEQUFBLElBQUksQ0FBQyxLQUFLLEVBQUMsSUFBSSxNQUFBLGlDQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUMsQ0FBQztxQ0FDbkMsTUFBTTtBQUNMLDBDQUFJLEdBQUcsT0FBTyxDQUFDO3FDQUNoQjs7Ozt5Q0FHRyxPQUFPLENBQUMsYUFBYTs7Ozs7QUFDdkIsd0NBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQzs7cUVBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUM7Ozs7Ozt3RUFHdkIsSUFBSTs7Ozs7Ozs2QkFDWjs7OzZEQUV1QixTQUFTLEVBQUU7Ozs7QUFBM0IsaUNBQUssUUFBTCxLQUFLO0FBRVAsZ0NBQUksR0FBRyxvQkFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQUEsSUFBSSxFQUFJOztBQUVoQyxrQ0FBTSxHQUFHLEdBQUcsRUFBRSxDQUFDOztBQUVmLGtEQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ25DLG9DQUFJLFFBQVEsR0FBRyxvQkFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pDLG9DQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDMUIsMENBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQ0FDL0I7QUFDRCxvQ0FBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLHFDQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO2lDQUN0QjsrQkFDRixDQUFDLENBQUM7O0FBR0gsa0NBQU0sWUFBWSxHQUFHLG9CQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQ3ZELHVDQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUM7K0JBQ3RCLENBQUMsQ0FBQzs7QUFFSCxrQ0FBSSxZQUFZLEVBQUU7QUFDaEIsbUNBQUcsQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQzsrQkFDbEQ7O0FBRUQsaUNBQUcsQ0FBQyxTQUFTLEdBQUcsb0JBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBQSxRQUFRLEVBQUk7b0NBQ3ZDLEtBQUssR0FBcUIsUUFBUSxDQUFsQyxLQUFLO29DQUFFLGNBQWMsR0FBSyxRQUFRLENBQTNCLGNBQWM7O0FBQzdCLHVDQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLENBQUM7K0JBQ3JELENBQUMsQ0FBQzs7QUFFSCxxQ0FBTyxHQUFHLENBQUM7NkJBQ1osQ0FBQzs7aUNBR0ssZUFBYyxrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBSixJQUFJLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJbEQsMkJBQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLEVBQUUsZUFBTSxLQUFLLENBQUMsQ0FBQzs7QUFFbEUsZ0NBQVk7O0FBRWhCLHdCQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7QUFDakQsa0NBQVksdUJBQXFCLEtBQUssZ0RBQTZDLENBQUM7cUJBQ3JGOzt3REFFTSxlQUFjLGtCQUFrQixFQUFFO0FBQ3ZDLGtDQUFZLEVBQVosWUFBWTtBQUNaLDZCQUFPLEVBQUUsS0FBSztBQUNkLDBCQUFJLEVBQUUsRUFBRTtxQkFDVCxDQUFDOzs7Ozs7O2FBR0wsQ0FBQzs7O0FBbEdJLG1CQUFPO2dEQW9HTixlQUFjLGFBQWEsRUFBRSxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUUsQ0FBQzs7Ozs7Z0RBRXpDLGVBQWMsYUFBYSxFQUFFO0FBQ2xDLDBCQUFZLGdCQUFPO0FBQ25CLHFCQUFPLEVBQUUsS0FBSzthQUNmLENBQUM7Ozs7Ozs7S0FHTDs7O1dBR3NCO1VBQ0UsS0FBSyxFQUdwQixJQUFJOzs7O0FBSFcsaUJBQUssR0FBTyxJQUFJLENBQS9CLFdBQVcsQ0FBSSxLQUFLOzs7NkNBR1AsSUFBSSxDQUFDLFlBQVksQ0FDbEMsQ0FBRSxFQUFFLEtBQUssRUFBTCxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLENBQUUsRUFDdkMsMEJBQVEsQ0FBQyxNQUFNLEVBQUUsRUFDakIsMEJBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2pDOzs7QUFKSyxnQkFBSTtnREFNSCxJQUFJOzs7Ozs7QUFFWCxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxlQUFNLEtBQUssa0JBQVMsQ0FBQyxDQUFDO2dEQUMzQjtBQUNMLG1CQUFLLGdCQUFBO0FBQ0wscUJBQU8sRUFBRSxLQUFLO2FBQ2Y7Ozs7Ozs7S0FFSjs7O1dBR21COzs7OztBQUVsQixtQkFBTyxDQUFDLElBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO2dEQUNwRSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Ozs7Ozs7S0FDaEM7Ozs7O1dBSWMsbUJBQUMsS0FBSzt3QkFFSSxZQUFZLEVBQUUsV0FBVyxFQUUxQyxJQUFJOzs7OzsyQkFGNkMsSUFBSSxDQUFuRCxXQUFXO0FBQUksd0JBQVksZ0JBQVosWUFBWTtBQUFFLHVCQUFXLGdCQUFYLFdBQVc7QUFFMUMsZ0JBQUksR0FBRyxJQUFJLHdCQUFXLElBQUksQ0FBQyxHQUFHOztBQUVsQyx3QkFBWTs7QUFFWixnQkFBSTs7QUFFSix1QkFBVzs7QUFFWCxhQUFDLG1EQUFtRCxDQUFDOzs7QUFHckQsaUJBQUssQ0FDTjtnREFHTSxhQUFZLFVBQUMsR0FBRyxFQUFFLEdBQUc7cUJBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNyRCxtQkFBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7ZUFDNUIsQ0FBQzthQUFBLENBQUM7Ozs7Ozs7S0FDSjs7O1NBaFJrQixxQkFBcUI7OztxQkFBckIscUJBQXFCIiwiZmlsZSI6ImNsQWRhcHRlcnMvZ29vZ2xlLWNhbGVuZGFyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdvb2dsZWFwaXMgZnJvbSAnZ29vZ2xlYXBpcyc7XG5pbXBvcnQgbW9tZW50ICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IF8gICAgICAgICAgZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEFkYXB0ZXIsIENvbmZpZ3VyYXRpb24sIFNlcnZpY2UgfSBmcm9tICcuLi9iYXNlLyc7XG5cbi8vIGdvb2dsZSBjYWxlbmRhciBhcGlcbmNvbnN0IGNhbGVuZGFyID0gZ29vZ2xlYXBpcy5jYWxlbmRhcigndjMnKTtcblxuY29uc3QgY3JlZGVudGlhbE1hcHBpbmdzID0ge1xuICAnY2VydGlmaWNhdGUnIDogJ3ByaXZhdGVfa2V5JyxcbiAgJ3NlcnZpY2VFbWFpbCc6ICdjbGllbnRfZW1haWwnLFxuICAnZW1haWwnICAgICAgIDogJ2FkbWluRW1haWwnXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29vZ2xlQ2FsZW5kYXJBZGFwdGVyIGV4dGVuZHMgQWRhcHRlciB7XG5cbiAgc3RhdGljIENvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uO1xuICBzdGF0aWMgU2VydmljZSA9IFNlcnZpY2U7XG5cbiAgLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXG4gIHN0YXRpYyBmaWVsZE5hbWVNYXAgPSB7XG4gICAgLy8gRGVzaXJlZC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2l2ZW4uLi5cbiAgICAnZXZlbnRJZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaWQnLFxuICAgICdhdHRlbmRlZXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICdhdHRlbmRlZXMnLFxuICAgICdkYXRlVGltZUNyZWF0ZWQnOiAgICAgICAgICAgICAgICAgICAgICdjcmVhdGVkJyxcbiAgICAnZGF0ZVRpbWVMYXN0TW9kaWZpZWQnOiAgICAgICAgICAgICAgICAndXBkYXRlZCcsXG4gICAgJ2F0dGVuZGVlQWRkcmVzcyc6ICAgICAgICAgICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnYXR0ZW5kZWVOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdpQ2FsVUlkJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpQ2FsVUlEJyxcbiAgICAnbG9jYXRpb24nOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbG9jYXRpb24nLFxuICAgICdzdGF0dXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdGF0dXMnLFxuICAgICdpc0NyZWF0b3InOiAgICAgICAgICAgICAgICAgICAgICAgICAgICdjcmVhdG9yLnNlbGYnLFxuICAgICdpc09yZ2FuaXplcic6ICAgICAgICAgICAgICAgICAgICAgICAgICdvcmdhbml6ZXIuc2VsZicsXG4gICAgJ29yZ2FuaXplckVtYWlsJzogICAgICAgICAgICAgICAgICAgICAgJ29yZ2FuaXplci5lbWFpbCcsXG4gICAgJ3JlY3VycmFuY2UnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JlY3VycmFuY2UnLFxuICAgICdyZXNwb25zZVN0YXR1cyc6ICAgICAgICAgICAgICAgICAgICAgICdyZXNwb25zZVN0YXR1cycsXG4gICAgJ2RhdGVUaW1lU3RhcnQnOiAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXJ0LmRhdGVUaW1lJyxcbiAgICAnZGF0ZVRpbWVFbmQnOiAgICAgICAgICAgICAgICAgICAgICAgICAnZW5kLmRhdGVUaW1lJyxcbiAgICAnc3ViamVjdCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3VtbWFyeScsXG4gICAgJ3VybCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2h0bWxMaW5rJyxcbiAgICAnaGFuZ291dExpbmsnOiAgICAgICAgICAgICAgICAgICAgICAgICAnaGFuZ291dExpbmsnXG4gIH1cblxuICAvLyBjb25zdHJ1Y3RvciBuZWVkcyB0byBjYWxsIHN1cGVyXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuXG4gIHJlc2V0KCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jb25maWc7XG4gICAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG4gIGFzeW5jIGluaXQoKSB7XG5cbiAgICBjb25zdCB7IGNyZWRlbnRpYWxzIH0gPSB0aGlzO1xuXG4gICAgaWYgKCFjcmVkZW50aWFscykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmVkZW50aWFscyByZXF1aXJlZCBmb3IgYWRhcHRlci4nKTtcbiAgICB9XG5cbiAgICAvLyBtYXAgR29vZ2xlIGpzb24ga2V5cyB0byBrZXlzIHVzZWQgaW4gdGhpcyBsaWJyYXJ5XG4gICAgZm9yIChjb25zdCB3YW50IGluIGNyZWRlbnRpYWxNYXBwaW5ncykge1xuICAgICAgY29uc3QgYWx0ZXJuYXRlID0gY3JlZGVudGlhbE1hcHBpbmdzW3dhbnRdO1xuICAgICAgaWYgKCFjcmVkZW50aWFsc1t3YW50XSkge1xuICAgICAgICBjcmVkZW50aWFsc1t3YW50XSA9IGNyZWRlbnRpYWxzW2FsdGVybmF0ZV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdmFsaWRhdGUgcmVxdWlyZWQgY3JlZGVudGlhbCBwcm9wZXJ0aWVzXG4gICAgT2JqZWN0LmtleXMoY3JlZGVudGlhbE1hcHBpbmdzKVxuICAgICAgLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHNbcHJvcF0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3BlcnR5ICR7cHJvcH0gcmVxdWlyZWQgaW4gYWRhcHRlciBjcmVkZW50aWFscyFgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLl9jb25maWcgID0gbmV3IEdvb2dsZUNhbGVuZGFyQWRhcHRlci5Db25maWd1cmF0aW9uKGNyZWRlbnRpYWxzKTtcbiAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IEdvb2dsZUNhbGVuZGFyQWRhcHRlci5TZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG5cbiAgICBhd2FpdCB0aGlzLl9zZXJ2aWNlLmluaXQoKTtcblxuICAgIGNvbnN0IHsgc2VydmljZUVtYWlsOiBlbWFpbCB9ID0gY3JlZGVudGlhbHM7XG5cbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGBTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgZ29vZ2xlIGNhbGVuZGFyIGFkYXB0ZXIgZm9yIGVtYWlsOiAke2VtYWlsfWBcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG4gIC8vIGN1cnJlbnRseSBkb2luZyBub3RoaW5nIHdpdGggZmllbGRzIGhlcmUsIGJ1dCBrZWVwaW5nIGFzIHBsYWNlaG9sZGVyXG4gIGFzeW5jIGdldEJhdGNoRGF0YSh1c2VyUHJvZmlsZXM9W10sIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSAvKiwgZmllbGRzICovKSB7XG5cbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcjtcblxuICAgIC8vIGFwaSBvcHRpb25zLi4uXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ29vZ2xlLWFwcHMvY2FsZW5kYXIvdjMvXG4gICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgIGFsd2F5c0luY2x1ZGVFbWFpbDogICB0cnVlLFxuICAgICAgY2FsZW5kYXJJZDogICAgICAgICAgICdwcmltYXJ5JyxcbiAgICAgIHNpbmdsZUV2ZW50czogICAgICAgICB0cnVlLFxuICAgICAgdGltZU1heDogICAgICAgICAgICAgIGZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKSxcbiAgICAgIHRpbWVNaW46ICAgICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUudG9JU09TdHJpbmcoKSxcbiAgICAgIG9yZGVyQnk6ICAgICAgICAgICAgICAnc3RhcnRUaW1lJ1xuICAgIH07XG5cblxuICAgIGNvbnN0IGdyb3VwUnVuU3RhdHMgPSB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKCksXG4gICAgICBmaWx0ZXJTdGFydERhdGU6IGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgIGZpbHRlckVuZERhdGU6IGZpbHRlckVuZERhdGUsXG4gICAgICBlbWFpbHM6IHVzZXJQcm9maWxlc1xuICAgIH07XG5cblxuICAgIHRyeSB7XG5cbiAgICAgIC8vIGNvbGxlY3QgZXZlbnRzIGZvciB0aGlzIGdyb3VwIG9mIGVtYWlsc1xuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0KiB1c2VyUHJvZmlsZXMubWFwKGFzeW5jKHVzZXJQcm9maWxlKSA9PiB7XG5cbiAgICAgICAgY29uc3QgaW5kaXZpZHVhbFJ1blN0YXRzID0ge1xuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgIC4uLnVzZXJQcm9maWxlLFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKClcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIGFkZCBhdXRoIHRva2VucyB0byByZXF1ZXN0XG4gICAgICAgICAgb3B0cy5hdXRoID0gYXdhaXQgdGhpcy5hdXRob3JpemUodXNlclByb2ZpbGUuZW1haWxBZnRlck1hcHBpbmcpO1xuXG4gICAgICAgICAgLy8gZnVuY3Rpb24gdG8gcmVjdXJzZSB0aHJvdWdoIHBhZ2VUb2tlbnNcbiAgICAgICAgICBjb25zdCBnZXRFdmVudHMgPSBhc3luYyhkYXRhKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIHJlcXVlc3QgZmlyc3QgcmVzdWx0cy4uLlxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICAgICAgICAvLyBhZGQgcGFnZSB0b2tlbiBpZiBnaXZlblxuICAgICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLm5leHRQYWdlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBvcHRzLnBhZ2VUb2tlbiA9IGRhdGEubmV4dFBhZ2VUb2tlbjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNhbGVuZGFyLmV2ZW50cy5saXN0KFxuICAgICAgICAgICAgICAgIG9wdHMsIChlcnIsIGRhdGEpID0+IGVyciA/IHJlaihlcnIpIDogcmVzKGRhdGEpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIGRhdGEgYmVpbmcgYWNjdW11bGF0ZWQsIGFkZCB0byBpdGVtc1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgZGF0YS5pdGVtcy5wdXNoKC4uLnJlc3VsdHMuaXRlbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGF0YSA9IHJlc3VsdHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgdG9rZW4gZm9yIHRoZSBuZXh0IHBhZ2UsIGNvbnRpbnVlLi4uXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5uZXh0UGFnZVRva2VuKSB7XG4gICAgICAgICAgICAgIGRhdGEubmV4dFBhZ2VUb2tlbiA9IHJlc3VsdHMubmV4dFBhZ2VUb2tlbjtcbiAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldEV2ZW50cyhkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnN0IHsgaXRlbXMgfSA9IGF3YWl0IGdldEV2ZW50cygpO1xuXG4gICAgICAgICAgY29uc3QgZGF0YSA9IF8ubWFwKGl0ZW1zLCBpdGVtID0+IHtcblxuICAgICAgICAgICAgY29uc3Qgb3V0ID0ge307XG5cbiAgICAgICAgICAgIF8uZWFjaChmaWVsZE5hbWVNYXAsIChoYXZlLCB3YW50KSA9PiB7XG4gICAgICAgICAgICAgIGxldCBtb2RpZmllZCA9IF8uZ2V0KGl0ZW0sIGhhdmUpO1xuICAgICAgICAgICAgICBpZiAoL15kYXRlVGltZS8udGVzdCh3YW50KSkge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gbmV3IERhdGUobW9kaWZpZWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChtb2RpZmllZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb3V0W3dhbnRdID0gbW9kaWZpZWQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIGNvbnN0IGF0dGVuZGVlU2VsZiA9IF8uZmluZChvdXQuYXR0ZW5kZWVzLCAoYXR0ZW5kZWUpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGF0dGVuZGVlLnNlbGY7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGF0dGVuZGVlU2VsZikge1xuICAgICAgICAgICAgICBvdXQucmVzcG9uc2VTdGF0dXMgPSBhdHRlbmRlZVNlbGYucmVzcG9uc2VTdGF0dXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG91dC5hdHRlbmRlZXMgPSBfLm1hcChvdXQuYXR0ZW5kZWVzLCBhdHRlbmRlZSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgZW1haWwsIHJlc3BvbnNlU3RhdHVzIH0gPSBhdHRlbmRlZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgYWRkcmVzczogZW1haWwsIHJlc3BvbnNlOiByZXNwb25zZVN0YXR1cyB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyByZXF1ZXN0IGFsbCBldmVudHMgZm9yIHRoaXMgdXNlciBpbiB0aGUgZ2l2ZW4gdGltZSBmcmFtZVxuICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGluZGl2aWR1YWxSdW5TdGF0cywgeyBkYXRhIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIGJhdGNoIGNvbGxlY3Rpb24gZmFpbGVkLi4uXG4gICAgICAgICAgY29uc29sZS5sb2coJ0dvb2dsZUNhbGVuZGFyQWRhcHRlci5nZXRCYXRjaERhdGEgRXJyb3I6JywgZXJyb3Iuc3RhY2spO1xuXG4gICAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IGVycm9yO1xuXG4gICAgICAgICAgaWYgKC9pbnZhbGlkX2dyYW50Ly50ZXN0KGVycm9yTWVzc2FnZS50b1N0cmluZygpKSkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gYEVtYWlsIGFkZHJlc3M6ICR7ZW1haWx9IG5vdCBmb3VuZCBpbiB0aGlzIEdvb2dsZSBDYWxlbmRhciBhY2NvdW50LmA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5kaXZpZHVhbFJ1blN0YXRzLCB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IFtdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGdyb3VwUnVuU3RhdHMsIHsgcmVzdWx0cyB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ3JvdXBSdW5TdGF0cywge1xuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH1cblxuXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KCkge1xuICAgIGNvbnN0IHsgY3JlZGVudGlhbHM6IHsgZW1haWwgfSB9ID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXG4gICAgICAgIFsgeyBlbWFpbCwgZW1haWxBZnRlck1hcHBpbmc6IGVtYWlsIH0gXSxcbiAgICAgICAgbW9tZW50KCkudG9EYXRlKCksXG4gICAgICAgIG1vbWVudCgpLmFkZCgtMSwgJ2RheScpLnRvRGF0ZSgpXG4gICAgICApXG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvci5zdGFjayB8fCBlcnJvcik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlcnJvcixcbiAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIGFzeW5jIHJ1bk1lc3NhZ2VUZXN0KCkge1xuICAgIC8vIFRPRE86IGRvZXMgdGhpcyBuZWVkIHRvIGJlIGRpZmZlcmVudD9cbiAgICBjb25zb2xlLndhcm4oJ05vdGU6IHJ1bk1lc3NhZ2VUZXN0KCkgY3VycmVudGx5IGNhbGxzIHJ1bkNvbm5lY3Rpb25UZXN0KCknKTtcbiAgICByZXR1cm4gdGhpcy5ydW5Db25uZWN0aW9uVGVzdCgpO1xuICB9XG5cblxuICAvLyBjcmVhdGUgYXV0aGVudGljYXRlZCB0b2tlbiBmb3IgYXBpIHJlcXVlc3RzIGZvciBnaXZlbiB1c2VyXG4gIGFzeW5jIGF1dGhvcml6ZShlbWFpbCkge1xuXG4gICAgY29uc3QgeyBjcmVkZW50aWFsczogeyBzZXJ2aWNlRW1haWwsIGNlcnRpZmljYXRlIH0gfSA9IHRoaXM7XG5cbiAgICBjb25zdCBhdXRoID0gbmV3IGdvb2dsZWFwaXMuYXV0aC5KV1QoXG4gICAgICAvLyBlbWFpbCBvZiBnb29nbGUgYXBwIGFkbWluLi4uXG4gICAgICBzZXJ2aWNlRW1haWwsXG4gICAgICAvLyBubyBuZWVkIGZvciBrZXlGaWxlLi4uXG4gICAgICBudWxsLFxuICAgICAgLy8gdGhlIHByaXZhdGUga2V5IGl0c2VsZi4uLlxuICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAvLyBzY29wZXMuLi5cbiAgICAgIFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9jYWxlbmRhci5yZWFkb25seSddLFxuICAgICAgLy8gdGhlIGVtYWlsIG9mIHRoZSBpbmRpdmlkdWFsIHdlIHdhbnQgdG8gYXV0aGVudGljYXRlXG4gICAgICAvLyAoJ3N1YicgcHJvcGVydHkgb2YgdGhlIGpzb24gd2ViIHRva2VuKVxuICAgICAgZW1haWxcbiAgICApO1xuXG4gICAgLy8gYXdhaXQgYXV0aG9yaXphdGlvblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IGF1dGguYXV0aG9yaXplKGVyciA9PiB7XG4gICAgICBlcnIgPyByZWooZXJyKSA6IHJlcyhhdXRoKTtcbiAgICB9KSk7XG4gIH1cblxufVxuIl19
//# sourceMappingURL=index.js.map
