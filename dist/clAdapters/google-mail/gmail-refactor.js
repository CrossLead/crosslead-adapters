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

// google mail api
var gmail = _googleapis2['default'].gmail('v1');

var credentialMappings = {
  'certificate': 'private_key',
  'serviceEmail': 'client_email',
  'email': 'adminEmail'
};

var GoogleMailAdapter = (function (_Adapter) {
  _inherits(GoogleMailAdapter, _Adapter);

  _createClass(GoogleMailAdapter, null, [{
    key: 'Configuration',
    value: _base.Configuration,
    enumerable: true
  }, {
    key: 'Service',
    value: _base.Service,

    // constructor needs to call super
    enumerable: true
  }]);

  function GoogleMailAdapter() {
    _classCallCheck(this, GoogleMailAdapter);

    _get(Object.getPrototypeOf(GoogleMailAdapter.prototype), 'constructor', this).call(this);
  }

  _createClass(GoogleMailAdapter, [{
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

            this._config = new GoogleMailAdapter.Configuration(credentials);
            this._service = new GoogleMailAdapter.Service(this._config);

            context$2$0.next = 9;
            return _regeneratorRuntime.awrap(this._service.init());

          case 9:
            email = credentials.serviceEmail;

            console.log('Successfully initialized google mail adapter for email: ' + email);

            return context$2$0.abrupt('return', this);

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getBatchData',
    value: function getBatchData(emails, filterStartDate, filterEndDate, fields) {
      if (emails === undefined) emails = [];
      var opts;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this3 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            opts = {
              after: filterStartDate.toISOString(),
              before: filterEndDate.toISOString()
            };
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(_Promise.all(emails.map(function callee$2$0(email) {
              var emailGroupRunStats, _ret, errorMessage;

              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                var _this2 = this;

                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    emailGroupRunStats = {
                      filterStartDate: filterStartDate,
                      filterEndDate: filterEndDate,
                      email: email,
                      success: true,
                      runDate: (0, _moment2['default'])().utc().toDate()
                    };
                    context$3$0.prev = 1;
                    context$3$0.next = 4;
                    return _regeneratorRuntime.awrap((function callee$3$0() {
                      var getEvents, _ref, results;

                      return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                        var _this = this;

                        while (1) switch (context$4$0.prev = context$4$0.next) {
                          case 0:
                            context$4$0.prev = 0;
                            context$4$0.next = 3;
                            return _regeneratorRuntime.awrap(this.authorize(email));

                          case 3:
                            opts.auth = context$4$0.sent;
                            context$4$0.next = 10;
                            break;

                          case 6:
                            context$4$0.prev = 6;
                            context$4$0.t0 = context$4$0['catch'](0);

                            console.log('Auth error: ', context$4$0.t0);
                            throw context$4$0.t0;

                          case 10:
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

                                      gmail.messages.list(opts, function (err, data) {
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

                            context$4$0.next = 13;
                            return _regeneratorRuntime.awrap(getEvents());

                          case 13:
                            _ref = context$4$0.sent;
                            results = _ref.items;
                            return context$4$0.abrupt('return', {
                              v: _Object$assign(emailGroupRunStats, { results: results })
                            });

                          case 16:
                          case 'end':
                            return context$4$0.stop();
                        }
                      }, null, _this2, [[0, 6]]);
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
                    console.log('GoogleMailAdapter.getBatchData Error:', context$3$0.t0.stack);

                    errorMessage = context$3$0.t0;

                    if (/invalid_grant/.test(errorMessage.toString())) {
                      errorMessage = 'Email address: ' + email + ' not found in this Google Mail account.';
                    }

                    return context$3$0.abrupt('return', _Object$assign(emailGroupRunStats, {
                      errorMessage: errorMessage,
                      success: false,
                      results: []
                    }));

                  case 15:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this3, [[1, 9]]);
            })));

          case 3:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'runConnectionTest',
    value: function runConnectionTest() {
      var email, events;
      return _regeneratorRuntime.async(function runConnectionTest$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            email = this.credentials.email;
            context$2$0.prev = 1;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.getBatchData([email], (0, _moment2['default'])().toDate(), (0, _moment2['default'])().add(-1, 'day').toDate()));

          case 4:
            events = context$2$0.sent;
            return context$2$0.abrupt('return', events[0]);

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

            console.log(email);

            auth = new _googleapis2['default'].auth.JWT(
            // email of google app admin...
            serviceEmail,
            // no need for keyFile...
            null,
            // the private key itself...
            certificate,
            // scopes...
            ['https://www.googleapis.com/auth/gmail.readonly'],
            // the email of the individual we want to authenticate
            // ('sub' property of the json web token)
            'mcgrit@crossleadadapters.com');
            return context$2$0.abrupt('return', new _Promise(function (res, rej) {
              return auth.authorize(function (err) {
                err ? rej(err) : res(auth);
              });
            }));

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return GoogleMailAdapter;
})(_base.Adapter);

exports['default'] = GoogleMailAdapter;
module.exports = exports['default'];

// api options...
// https://developers.google.com/google-apps/gmail

// collect events for this group of emails

// add auth tokens to request

// function to recurse through pageTokens

// request first results...

// request all events for this user in the given time frame

// await authorization
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvZ29vZ2xlLW1haWwvZ21haWwtcmVmYWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBQXVCLFlBQVk7Ozs7c0JBQ1osUUFBUTs7OztvQkFDaUIsVUFBVTs7O0FBRzFELElBQU0sS0FBSyxHQUFHLHdCQUFXLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFHckMsSUFBTSxrQkFBa0IsR0FBRztBQUN6QixlQUFhLEVBQUcsYUFBYTtBQUM3QixnQkFBYyxFQUFFLGNBQWM7QUFDOUIsU0FBTyxFQUFTLFlBQVk7Q0FDN0IsQ0FBQTs7SUFHb0IsaUJBQWlCO1lBQWpCLGlCQUFpQjs7ZUFBakIsaUJBQWlCOzs7Ozs7Ozs7Ozs7QUFPekIsV0FQUSxpQkFBaUIsR0FPdEI7MEJBUEssaUJBQWlCOztBQVFsQywrQkFSaUIsaUJBQWlCLDZDQVExQjtHQUNUOztlQVRrQixpQkFBaUI7O1dBWS9CLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FHUztVQUVBLFdBQVcsRUFPUixJQUFJLEVBQ1AsU0FBUyxFQW1CSyxLQUFLOzs7O0FBM0JuQix1QkFBVyxHQUFLLElBQUksQ0FBcEIsV0FBVzs7Z0JBRWQsV0FBVzs7Ozs7a0JBQ1IsSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUM7Ozs7O0FBSXRELGlCQUFXLElBQUksSUFBSSxrQkFBa0IsRUFBRTtBQUMvQix1QkFBUyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQzs7QUFDMUMsa0JBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDdEIsMkJBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7ZUFDNUM7YUFDRjs7O0FBR0QseUJBQVksa0JBQWtCLENBQUMsQ0FDNUIs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QkFBSSxHQUFHLElBQUksd0JBQVcsSUFBSSxDQUFDLEdBQUc7O0FBRWxDLHdCQUFZOztBQUVaLGdCQUFJOztBQUVKLHVCQUFXOztBQUVYLGFBQUMsZ0RBQWdELENBQUM7OztBQUdsRCwwQ0FBOEIsQ0FDL0I7Z0RBR00sYUFBWSxVQUFDLEdBQUcsRUFBRSxHQUFHO3FCQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDckQsbUJBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2VBQzVCLENBQUM7YUFBQSxDQUFDOzs7Ozs7O0tBQ0o7OztTQXJNa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiJjbEFkYXB0ZXJzL2dvb2dsZS1tYWlsL2dtYWlsLXJlZmFjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdvb2dsZWFwaXMgZnJvbSAnZ29vZ2xlYXBpcyc7XG5pbXBvcnQgbW9tZW50ICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IHsgQWRhcHRlciwgQ29uZmlndXJhdGlvbiwgU2VydmljZSB9IGZyb20gJy4uL2Jhc2UvJztcblxuLy8gZ29vZ2xlIG1haWwgYXBpXG5jb25zdCBnbWFpbCA9IGdvb2dsZWFwaXMuZ21haWwoJ3YxJyk7XG5cblxuY29uc3QgY3JlZGVudGlhbE1hcHBpbmdzID0ge1xuICAnY2VydGlmaWNhdGUnIDogJ3ByaXZhdGVfa2V5JyxcbiAgJ3NlcnZpY2VFbWFpbCc6ICdjbGllbnRfZW1haWwnLFxuICAnZW1haWwnICAgICAgIDogJ2FkbWluRW1haWwnXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29vZ2xlTWFpbEFkYXB0ZXIgZXh0ZW5kcyBBZGFwdGVyIHtcblxuICBzdGF0aWMgQ29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb247XG4gIHN0YXRpYyBTZXJ2aWNlID0gU2VydmljZTtcblxuXG4gIC8vIGNvbnN0cnVjdG9yIG5lZWRzIHRvIGNhbGwgc3VwZXJcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG5cbiAgcmVzZXQoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NvbmZpZztcbiAgICBkZWxldGUgdGhpcy5fc2VydmljZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgYXN5bmMgaW5pdCgpIHtcblxuICAgIGNvbnN0IHsgY3JlZGVudGlhbHMgfSA9IHRoaXM7XG5cbiAgICBpZiAoIWNyZWRlbnRpYWxzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWRlbnRpYWxzIHJlcXVpcmVkIGZvciBhZGFwdGVyLicpO1xuICAgIH1cblxuICAgIC8vIG1hcCBHb29nbGUganNvbiBrZXlzIHRvIGtleXMgdXNlZCBpbiB0aGlzIGxpYnJhcnlcbiAgICBmb3IgKGNvbnN0IHdhbnQgaW4gY3JlZGVudGlhbE1hcHBpbmdzKSB7XG4gICAgICBjb25zdCBhbHRlcm5hdGUgPSBjcmVkZW50aWFsTWFwcGluZ3Nbd2FudF07XG4gICAgICBpZiAoIWNyZWRlbnRpYWxzW3dhbnRdKSB7XG4gICAgICAgIGNyZWRlbnRpYWxzW3dhbnRdID0gY3JlZGVudGlhbHNbYWx0ZXJuYXRlXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB2YWxpZGF0ZSByZXF1aXJlZCBjcmVkZW50aWFsIHByb3BlcnRpZXNcbiAgICBPYmplY3Qua2V5cyhjcmVkZW50aWFsTWFwcGluZ3MpXG4gICAgICAuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFsc1twcm9wXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtwcm9wfSByZXF1aXJlZCBpbiBhZGFwdGVyIGNyZWRlbnRpYWxzIWApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIHRoaXMuX2NvbmZpZyAgPSBuZXcgR29vZ2xlTWFpbEFkYXB0ZXIuQ29uZmlndXJhdGlvbihjcmVkZW50aWFscyk7XG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBHb29nbGVNYWlsQWRhcHRlci5TZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG5cbiAgICBhd2FpdCB0aGlzLl9zZXJ2aWNlLmluaXQoKTtcblxuICAgIGNvbnN0IHsgc2VydmljZUVtYWlsOiBlbWFpbCB9ID0gY3JlZGVudGlhbHM7XG5cbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGBTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgZ29vZ2xlIG1haWwgYWRhcHRlciBmb3IgZW1haWw6ICR7ZW1haWx9YFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKGVtYWlscz1bXSwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBmaWVsZHMpIHtcblxuICAgIC8vIGFwaSBvcHRpb25zLi4uXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ29vZ2xlLWFwcHMvZ21haWxcbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgYWZ0ZXI6ICAgICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLFxuICAgICAgYmVmb3JlOiAgICAgICAgICAgICAgIGZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKVxuICAgIH07XG5cbiAgICAvLyBjb2xsZWN0IGV2ZW50cyBmb3IgdGhpcyBncm91cCBvZiBlbWFpbHNcbiAgICByZXR1cm4gYXdhaXQqIGVtYWlscy5tYXAoYXN5bmMoZW1haWwpID0+IHtcblxuICAgICAgY29uc3QgZW1haWxHcm91cFJ1blN0YXRzID0ge1xuICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgIGVtYWlsLFxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gYWRkIGF1dGggdG9rZW5zIHRvIHJlcXVlc3RcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBvcHRzLmF1dGggPSBhd2FpdCB0aGlzLmF1dGhvcml6ZShlbWFpbCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0F1dGggZXJyb3I6ICcsIGVycm9yKTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gZnVuY3Rpb24gdG8gcmVjdXJzZSB0aHJvdWdoIHBhZ2VUb2tlbnNcbiAgICAgICAgY29uc3QgZ2V0RXZlbnRzID0gYXN5bmMoZGF0YSkgPT4ge1xuXG4gICAgICAgICAgLy8gcmVxdWVzdCBmaXJzdCByZXN1bHRzLi4uXG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICAgICAgLy8gYWRkIHBhZ2UgdG9rZW4gaWYgZ2l2ZW5cbiAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEubmV4dFBhZ2VUb2tlbikge1xuICAgICAgICAgICAgICBvcHRzLnBhZ2VUb2tlbiA9IGRhdGEubmV4dFBhZ2VUb2tlbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ21haWwubWVzc2FnZXMubGlzdChcbiAgICAgICAgICAgICAgb3B0cywgKGVyciwgZGF0YSkgPT4gZXJyID8gcmVqKGVycikgOiByZXMoZGF0YSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgZGF0YSBiZWluZyBhY2N1bXVsYXRlZCwgYWRkIHRvIGl0ZW1zXG4gICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEuaXRlbXMucHVzaCguLi5yZXN1bHRzLml0ZW1zKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IHJlc3VsdHM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSB0b2tlbiBmb3IgdGhlIG5leHQgcGFnZSwgY29udGludWUuLi5cbiAgICAgICAgICBpZiAocmVzdWx0cy5uZXh0UGFnZVRva2VuKSB7XG4gICAgICAgICAgICBkYXRhLm5leHRQYWdlVG9rZW4gPSByZXN1bHRzLm5leHRQYWdlVG9rZW47XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0RXZlbnRzKGRhdGEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHsgaXRlbXM6IHJlc3VsdHMgfSA9IGF3YWl0IGdldEV2ZW50cygpO1xuXG4gICAgICAgIC8vIHJlcXVlc3QgYWxsIGV2ZW50cyBmb3IgdGhpcyB1c2VyIGluIHRoZSBnaXZlbiB0aW1lIGZyYW1lXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGVtYWlsR3JvdXBSdW5TdGF0cywgeyByZXN1bHRzIH0pO1xuXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBpZiB0aGUgYmF0Y2ggY29sbGVjdGlvbiBmYWlsZWQuLi5cbiAgICAgICAgY29uc29sZS5sb2coJ0dvb2dsZU1haWxBZGFwdGVyLmdldEJhdGNoRGF0YSBFcnJvcjonLCBlcnJvci5zdGFjayk7XG5cbiAgICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IGVycm9yO1xuXG4gICAgICAgIGlmICgvaW52YWxpZF9ncmFudC8udGVzdChlcnJvck1lc3NhZ2UudG9TdHJpbmcoKSkpIHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgRW1haWwgYWRkcmVzczogJHtlbWFpbH0gbm90IGZvdW5kIGluIHRoaXMgR29vZ2xlIE1haWwgYWNjb3VudC5gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZW1haWxHcm91cFJ1blN0YXRzLCB7XG4gICAgICAgICAgZXJyb3JNZXNzYWdlLFxuICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgIHJlc3VsdHM6IFtdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgfSk7XG4gIH1cblxuXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KCkge1xuICAgIGNvbnN0IHsgY3JlZGVudGlhbHM6IHsgZW1haWwgfSB9ID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBldmVudHMgPSBhd2FpdCB0aGlzLmdldEJhdGNoRGF0YShcbiAgICAgICAgWyBlbWFpbCBdLFxuICAgICAgICBtb21lbnQoKS50b0RhdGUoKSxcbiAgICAgICAgbW9tZW50KCkuYWRkKC0xLCAnZGF5JykudG9EYXRlKClcbiAgICAgIClcbiAgICAgIHJldHVybiBldmVudHNbMF07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yLnN0YWNrIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVycm9yLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgYXN5bmMgcnVuTWVzc2FnZVRlc3QoKSB7XG4gICAgLy8gVE9ETzogZG9lcyB0aGlzIG5lZWQgdG8gYmUgZGlmZmVyZW50P1xuICAgIGNvbnNvbGUud2FybignTm90ZTogcnVuTWVzc2FnZVRlc3QoKSBjdXJyZW50bHkgY2FsbHMgcnVuQ29ubmVjdGlvblRlc3QoKScpO1xuICAgIHJldHVybiB0aGlzLnJ1bkNvbm5lY3Rpb25UZXN0KCk7XG4gIH1cblxuXG4gIC8vIGNyZWF0ZSBhdXRoZW50aWNhdGVkIHRva2VuIGZvciBhcGkgcmVxdWVzdHMgZm9yIGdpdmVuIHVzZXJcbiAgYXN5bmMgYXV0aG9yaXplKGVtYWlsKSB7XG5cbiAgICBjb25zdCB7IGNyZWRlbnRpYWxzOiB7IHNlcnZpY2VFbWFpbCwgY2VydGlmaWNhdGUgfSB9ID0gdGhpcztcblxuICAgIGNvbnNvbGUubG9nKGVtYWlsKTtcblxuICAgIGNvbnN0IGF1dGggPSBuZXcgZ29vZ2xlYXBpcy5hdXRoLkpXVChcbiAgICAgIC8vIGVtYWlsIG9mIGdvb2dsZSBhcHAgYWRtaW4uLi5cbiAgICAgIHNlcnZpY2VFbWFpbCxcbiAgICAgIC8vIG5vIG5lZWQgZm9yIGtleUZpbGUuLi5cbiAgICAgIG51bGwsXG4gICAgICAvLyB0aGUgcHJpdmF0ZSBrZXkgaXRzZWxmLi4uXG4gICAgICBjZXJ0aWZpY2F0ZSxcbiAgICAgIC8vIHNjb3Blcy4uLlxuICAgICAgWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2dtYWlsLnJlYWRvbmx5J10sXG4gICAgICAvLyB0aGUgZW1haWwgb2YgdGhlIGluZGl2aWR1YWwgd2Ugd2FudCB0byBhdXRoZW50aWNhdGVcbiAgICAgIC8vICgnc3ViJyBwcm9wZXJ0eSBvZiB0aGUganNvbiB3ZWIgdG9rZW4pXG4gICAgICAnbWNncml0QGNyb3NzbGVhZGFkYXB0ZXJzLmNvbSdcbiAgICApO1xuXG4gICAgLy8gYXdhaXQgYXV0aG9yaXphdGlvblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IGF1dGguYXV0aG9yaXplKGVyciA9PiB7XG4gICAgICBlcnIgPyByZWooZXJyKSA6IHJlcyhhdXRoKTtcbiAgICB9KSk7XG4gIH1cblxufVxuIl19
//# sourceMappingURL=../../clAdapters/google-mail/gmail-refactor.js.map