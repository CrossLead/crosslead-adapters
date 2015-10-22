'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _baseAdapter = require('../base/Adapter');

var _baseAdapter2 = _interopRequireDefault(_baseAdapter);

/**
 * Office 365 Calendar adapter
 */

var Office365CalendarAdapter = (function (_Office365BaseAdapter) {
  _inherits(Office365CalendarAdapter, _Office365BaseAdapter);

  function Office365CalendarAdapter() {
    _classCallCheck(this, Office365CalendarAdapter);

    _get(Object.getPrototypeOf(Office365CalendarAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365CalendarAdapter, [{
    key: 'getBatchData',
    value: function getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {
      var _Office365Adapter, emailFieldNameMap, dataAdapterRunStats, emailData, results;

      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _Office365Adapter = Office365Adapter;
            emailFieldNameMap = _Office365Adapter.emailFieldNameMap;
            dataAdapterRunStats = {
              emails: emails,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              success: false,
              runDate: (0, _moment2['default'])().utc().toDate()
            };
            context$2$0.prev = 3;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(_Promise.all(emails.map(function (email) {
              return _this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields);
            })));

          case 6:
            emailData = context$2$0.sent;
            results = _lodash2['default'].map(emailData, function (user) {
              var emailArray = user.success && user.data[emailFieldNameMap.emails] || [];
              return {
                email: user.email,
                filterStartDate: user.filterStartDate,
                filterEndDate: user.filterEndDate,
                success: user.success,
                errorMessage: user.errorMessage,
                // map data with desired key names...
                data: _lodash2['default'].map(emailArray, function (originalEmailMessage) {
                  var mappedEmailMessage = {};

                  // change to desired names
                  _lodash2['default'].each(emailFieldNameMap, function (have, want) {
                    var mapped = _lodash2['default'].get(originalEmailMessage, have);
                    mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                  });

                  // grab info from different correspondent types...
                  // (since we're using an array literal here, 'for of' syntax will compile reasonably)
                  var _arr = ['to', 'cc', 'bcc'];

                  var _loop = function () {
                    var type = _arr[_i];
                    var key = type + 'Recipient';
                    mappedEmailMessage[key + 's'] = originalEmailMessage[emailFieldNameMap[key + 's']].map(function (recipient) {
                      return {
                        address: _lodash2['default'].get(recipient, emailFieldNameMap[key + 'Address']),
                        name: _lodash2['default'].get(recipient, emailFieldNameMap[key + 'Name'])
                      };
                    });
                  };

                  for (var _i = 0; _i < _arr.length; _i++) {
                    _loop();
                  }

                  return mappedEmailMessage;
                })
              };
            });
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, {
              results: results,
              success: true
            }));

          case 11:
            context$2$0.prev = 11;
            context$2$0.t0 = context$2$0['catch'](3);

            console.log(context$2$0.t0.stack);
            console.log('Office365 GetBatchData Error: ' + JSON.stringify(context$2$0.t0));
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, { errorMessage: context$2$0.t0 }));

          case 16:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[3, 11]]);
    }
  }, {
    key: 'getEmailsForUser',
    value: function getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData) {
      var pageToGet = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];

      var accessToken, apiVersion, recordsPerPage, maxPages, skip, params, urlParams, emailRequestOptions, parsedBody, _emailData$data$value;

      return _regeneratorRuntime.async(function getEmailsForUser$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            // accumulation of data
            emailData = emailData || { email: email, filterStartDate: filterStartDate, filterEndDate: filterEndDate };

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.getAccessToken());

          case 3:
            accessToken = context$2$0.sent;
            apiVersion = this._config.options.apiVersion;
            recordsPerPage = 25;
            maxPages = 20;
            skip = (pageToGet - 1) * recordsPerPage + 1;
            params = {
              $top: recordsPerPage,
              $skip: skip,
              $select: Office365Adapter.baseFields.join(',') + additionalFields,
              $filter: (' IsDraft eq false\n                          and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                          and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                      ').replace(/\s+/g, ' ').trim()
            };
            urlParams = (0, _lodash2['default'])(params).map(function (value, key) {
              return key + '=' + value;
            }).join('&');
            emailRequestOptions = {
              method: 'GET',
              uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + email + '\')/messages?' + urlParams,
              headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json;odata.metadata=none'
              }
            };
            context$2$0.prev = 11;

            emailData.success = true;
            context$2$0.t0 = JSON;
            context$2$0.next = 16;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(emailRequestOptions));

          case 16:
            context$2$0.t1 = context$2$0.sent;
            parsedBody = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (parsedBody && pageToGet === 1) {
              emailData.data = parsedBody;
            }

            if (parsedBody.value && pageToGet > 1) {
              (_emailData$data$value = emailData.data.value).push.apply(_emailData$data$value, _toConsumableArray(parsedBody.value));
            }

            // if the returned results are the maximum number of records per page,
            // we are not done yet, so recurse...

            if (!(parsedBody && parsedBody.value.length === recordsPerPage && pageToGet <= maxPages)) {
              context$2$0.next = 24;
              break;
            }

            return context$2$0.abrupt('return', this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData, pageToGet + 1));

          case 24:
            return context$2$0.abrupt('return', emailData);

          case 25:
            context$2$0.next = 31;
            break;

          case 27:
            context$2$0.prev = 27;
            context$2$0.t2 = context$2$0['catch'](11);

            _Object$assign(emailData, {
              success: false,
              errorMessage: context$2$0.t2.name !== 'StatusCodeError' ? JSON.stringify(context$2$0.t2) : JSON.parse(context$2$0.t2.message.replace(context$2$0.t2.statusCode + ' - ', '').replace(/\"/g, '"')).message
            });
            return context$2$0.abrupt('return', true);

          case 31:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[11, 27]]);
    }
  }]);

  return Office365CalendarAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365CalendarAdapter;
module.exports = exports['default'];

// replace data keys with desired mappings...

// return results and success!

// parameters to query email with...

// format parameters for url
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2NhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzhCQUF1QyxpQkFBaUI7Ozs7c0JBQ2pCLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQUV6QixzQkFBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7NkJBRWpFLGlCQUFpQixFQUNuQixtQkFBbUIsRUFVakIsU0FBUyxFQVFULE9BQU87Ozs7Ozs7Z0NBbkJlLGdCQUFnQjtBQUF0Qyw2QkFBaUIscUJBQWpCLGlCQUFpQjtBQUNuQiwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFOLE1BQU07QUFDTiw2QkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBYSxFQUFiLGFBQWE7QUFDYixxQkFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO2FBQ2pDOzs7MERBSW9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO3FCQUFJLE1BQUssZ0JBQWdCLENBQ2hFLEtBQUssRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLGdCQUFnQixDQUNqQjthQUFBLENBQUM7OztBQUxJLHFCQUFTO0FBUVQsbUJBQU8sR0FBRyxvQkFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQUEsSUFBSSxFQUFJO0FBQ3ZDLGtCQUFNLFVBQVUsR0FBRyxBQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSyxFQUFFLENBQUM7QUFDL0UscUJBQU87QUFDTCxxQkFBSyxFQUFhLElBQUksQ0FBQyxL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QUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDOzs7Z0RBRXhHLFNBQVM7Ozs7Ozs7Ozs7QUFJbEIsMkJBQWMsU0FBUyxFQUFFO0FBQ3ZCLHFCQUFPLEVBQUUsS0FBSztBQUNkLDBCQUFZLEVBQUUsZUFBSSxJQUFJLEtBQUssaUJBQWlCLEdBQzVCLElBQUksQ0FBQyxTQUFTLGdCQUFLLEdBQ25CLElBQUksQ0FBQyxLQUFLLENBQ0osZUFBSSxPQUFPLENBQ1AsT0FBTyxDQUFDLGVBQUksVUFBVSxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FDbkMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FDeEIsQ0FDQSxPQUFPO2FBQzdCLENBQUMsQ0FBQztnREFDSSxJQUFJOzs7Ozs7O0tBR2Q7OztTQWhKa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3QiIsImZpbGUiOiJjbEFkYXB0ZXJzL29mZmljZTM2NS9jYWxlbmRhci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZXF1ZXN0ICAgICAgICAgICAgICAgICAgICBmcm9tICdyZXF1ZXN0LXByb21pc2UnO1xuaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgXyAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbG9kYXNoJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlQWRhcHRlciAgICAgICBmcm9tICcuLi9iYXNlL0FkYXB0ZXInO1xuXG5cbi8qKlxuICogT2ZmaWNlIDM2NSBDYWxlbmRhciBhZGFwdGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIE9mZmljZTM2NUJhc2VBZGFwdGVyIHtcblxuICBhc3luYyBnZXRCYXRjaERhdGEoZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcblxuICAgIGNvbnN0IHsgZW1haWxGaWVsZE5hbWVNYXAgfSA9IE9mZmljZTM2NUFkYXB0ZXIsXG4gICAgICAgICAgZGF0YUFkYXB0ZXJSdW5TdGF0cyAgID0ge1xuICAgICAgICAgICAgZW1haWxzLFxuICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKClcbiAgICAgICAgICB9O1xuXG4gICAgdHJ5IHtcblxuICAgICAgY29uc3QgZW1haWxEYXRhID0gYXdhaXQqIGVtYWlscy5tYXAoZW1haWwgPT4gdGhpcy5nZXRFbWFpbHNGb3JVc2VyKFxuICAgICAgICBlbWFpbCxcbiAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICBhZGRpdGlvbmFsRmllbGRzXG4gICAgICApKTtcblxuICAgICAgLy8gcmVwbGFjZSBkYXRhIGtleXMgd2l0aCBkZXNpcmVkIG1hcHBpbmdzLi4uXG4gICAgICBjb25zdCByZXN1bHRzID0gXy5tYXAoZW1haWxEYXRhLCB1c2VyID0+IHtcbiAgICAgICAgY29uc3QgZW1haWxBcnJheSA9ICh1c2VyLnN1Y2Nlc3MgJiYgdXNlci5kYXRhW2VtYWlsRmllbGROYW1lTWFwLmVtYWlsc10pIHx8IFtdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGVtYWlsOiAgICAgICAgICAgIHVzZXIuZW1haWwsXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlOiAgdXNlci5maWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZTogICAgdXNlci5maWx0ZXJFbmREYXRlLFxuICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgICAgIHVzZXIuc3VjY2VzcyxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICAgICB1c2VyLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAvLyBtYXAgZGF0YSB3aXRoIGRlc2lyZWQga2V5IG5hbWVzLi4uXG4gICAgICAgICAgZGF0YTogXy5tYXAoZW1haWxBcnJheSwgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFwcGVkRW1haWxNZXNzYWdlID0ge307XG5cbiAgICAgICAgICAgIC8vIGNoYW5nZSB0byBkZXNpcmVkIG5hbWVzXG4gICAgICAgICAgICBfLmVhY2goZW1haWxGaWVsZE5hbWVNYXAsIChoYXZlLCB3YW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRW1haWxNZXNzYWdlLCBoYXZlKTtcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW3dhbnRdID0gL15kYXRlVGltZS8udGVzdCh3YW50KSA/IG5ldyBEYXRlKG1hcHBlZCkgOiBtYXBwZWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ3JhYiBpbmZvIGZyb20gZGlmZmVyZW50IGNvcnJlc3BvbmRlbnQgdHlwZXMuLi5cbiAgICAgICAgICAgIC8vIChzaW5jZSB3ZSdyZSB1c2luZyBhbiBhcnJheSBsaXRlcmFsIGhlcmUsICdmb3Igb2YnIHN5bnRheCB3aWxsIGNvbXBpbGUgcmVhc29uYWJseSlcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3RvJywgJ2NjJywgJ2JjYyddKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3R5cGV9UmVjaXBpZW50YDtcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW2Ake2tleX1zYF0gPSBvcmlnaW5hbEVtYWlsTWVzc2FnZVtlbWFpbEZpZWxkTmFtZU1hcFtgJHtrZXl9c2BdXVxuICAgICAgICAgICAgICAgIC5tYXAocmVjaXBpZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IF8uZ2V0KHJlY2lwaWVudCwgZW1haWxGaWVsZE5hbWVNYXBbYCR7a2V5fUFkZHJlc3NgXSksXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICAgIF8uZ2V0KHJlY2lwaWVudCwgZW1haWxGaWVsZE5hbWVNYXBbYCR7a2V5fU5hbWVgXSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hcHBlZEVtYWlsTWVzc2FnZTtcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHJldHVybiByZXN1bHRzIGFuZCBzdWNjZXNzIVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cyxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcbiAgICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3JNZXNzYWdlKSk7XG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcbiAgICB9XG5cbiAgfVxuXG4gIGFzeW5jIGdldEVtYWlsc0ZvclVzZXIoZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxEYXRhLCBwYWdlVG9HZXQ9MSkge1xuICAgIC8vIGFjY3VtdWxhdGlvbiBvZiBkYXRhXG4gICAgZW1haWxEYXRhID0gZW1haWxEYXRhIHx8IHsgZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSB9O1xuXG4gICAgY29uc3QgYWNjZXNzVG9rZW4gICAgID0gYXdhaXQgdGhpcy5nZXRBY2Nlc3NUb2tlbigpLFxuICAgICAgICAgIHsgYXBpVmVyc2lvbiB9ICA9IHRoaXMuX2NvbmZpZy5vcHRpb25zLFxuICAgICAgICAgIHJlY29yZHNQZXJQYWdlICA9IDI1LFxuICAgICAgICAgIG1heFBhZ2VzICAgICAgICA9IDIwLFxuICAgICAgICAgIHNraXAgICAgICAgICAgICA9ICgocGFnZVRvR2V0IC0xKSAqIHJlY29yZHNQZXJQYWdlKSArIDEsXG4gICAgICAgICAgLy8gcGFyYW1ldGVycyB0byBxdWVyeSBlbWFpbCB3aXRoLi4uXG4gICAgICAgICAgcGFyYW1zICAgICAgICAgID0ge1xuICAgICAgICAgICAgJHRvcDogICAgIHJlY29yZHNQZXJQYWdlLFxuICAgICAgICAgICAgJHNraXA6ICAgIHNraXAsXG4gICAgICAgICAgICAkc2VsZWN0OiAgT2ZmaWNlMzY1QWRhcHRlci5iYXNlRmllbGRzLmpvaW4oJywnKSArIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgICAgICAgICAkZmlsdGVyOiAgYCBJc0RyYWZ0IGVxIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBEYXRlVGltZVNlbnQgZ2UgJHtmaWx0ZXJTdGFydERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVTZW50IGx0ICR7ZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICAgICAgICAgICAgYC5yZXBsYWNlKC9cXHMrL2csICcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgLnRyaW0oKVxuICAgICAgICAgIH07XG5cbiAgICAvLyBmb3JtYXQgcGFyYW1ldGVycyBmb3IgdXJsXG4gICAgY29uc3QgdXJsUGFyYW1zID0gXyhwYXJhbXMpXG4gICAgICAubWFwKCh2YWx1ZSwga2V5KSA9PiBgJHtrZXl9PSR7dmFsdWV9YClcbiAgICAgIC5qb2luKCcmJyk7XG5cbiAgICBjb25zdCBlbWFpbFJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHVyaTogYGh0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tL2FwaS92JHthcGlWZXJzaW9ufS91c2VycygnJHtlbWFpbH0nKS9tZXNzYWdlcz8ke3VybFBhcmFtc31gLFxuICAgICAgaGVhZGVycyA6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FjY2Vzc1Rva2VufWAsXG4gICAgICAgIEFjY2VwdDogICAgICAgICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICBlbWFpbERhdGEuc3VjY2VzcyA9IHRydWU7XG4gICAgICBjb25zdCBwYXJzZWRCb2R5ID0gSlNPTi5wYXJzZShhd2FpdCByZXF1ZXN0KGVtYWlsUmVxdWVzdE9wdGlvbnMpKTtcblxuICAgICAgaWYgKHBhcnNlZEJvZHkgJiYgcGFnZVRvR2V0ID09PSAxKSB7XG4gICAgICAgIGVtYWlsRGF0YS5kYXRhID0gcGFyc2VkQm9keTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcnNlZEJvZHkudmFsdWUgJiYgcGFnZVRvR2V0ID4gMSkge1xuICAgICAgICBlbWFpbERhdGEuZGF0YS52YWx1ZS5wdXNoKC4uLnBhcnNlZEJvZHkudmFsdWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgcmV0dXJuZWQgcmVzdWx0cyBhcmUgdGhlIG1heGltdW0gbnVtYmVyIG9mIHJlY29yZHMgcGVyIHBhZ2UsXG4gICAgICAvLyB3ZSBhcmUgbm90IGRvbmUgeWV0LCBzbyByZWN1cnNlLi4uXG4gICAgICBpZiAocGFyc2VkQm9keSAmJiBwYXJzZWRCb2R5LnZhbHVlLmxlbmd0aCA9PT0gcmVjb3Jkc1BlclBhZ2UgJiYgcGFnZVRvR2V0IDw9IG1heFBhZ2VzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEVtYWlsc0ZvclVzZXIoZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxEYXRhLCBwYWdlVG9HZXQgKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBlbWFpbERhdGE7XG4gICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oZW1haWxEYXRhLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVyci5uYW1lICE9PSAnU3RhdHVzQ29kZUVycm9yJyA/XG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShlcnIpICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoZXJyLnN0YXR1c0NvZGUgKyAnIC0gJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWVzc2FnZVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgfVxuXG5cbn1cbiJdfQ==
//# sourceMappingURL=../../../clAdapters/office365/calendar/index.js.map