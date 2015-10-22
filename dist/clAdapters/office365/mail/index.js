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
 * Office 365 Mail adapter
 */

var Office365MailAdapter = (function (_Office365BaseAdapter) {
  _inherits(Office365MailAdapter, _Office365BaseAdapter);

  function Office365MailAdapter() {
    _classCallCheck(this, Office365MailAdapter);

    _get(Object.getPrototypeOf(Office365MailAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365MailAdapter, [{
    key: 'getBatchData',
    value: function getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {
      var emailFieldNameMap, dataAdapterRunStats, emailData, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            emailFieldNameMap = Office365MailAdapter.emailFieldNameMap;
            dataAdapterRunStats = {
              emails: emails,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              success: false,
              runDate: (0, _moment2['default'])().utc().toDate()
            };
            context$2$0.prev = 2;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(_Promise.all(emails.map(function (email) {
              return _this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields);
            })));

          case 5:
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

          case 10:
            context$2$0.prev = 10;
            context$2$0.t0 = context$2$0['catch'](2);

            console.log(context$2$0.t0.stack);
            console.log('Office365 GetBatchData Error: ' + JSON.stringify(context$2$0.t0));
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, { errorMessage: context$2$0.t0 }));

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[2, 10]]);
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
              $select: Office365MailAdapter.baseFields.join(',') + additionalFields,
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
  }], [{
    key: 'baseFields',

    // collect these fields always...
    value: ['Id', 'Categories', 'DateTimeCreated', 'Subject', 'Importance', 'HasAttachments', 'ParentFolderId', 'From', 'Sender', 'ToRecipients', 'CcRecipients', 'BccRecipients', 'ReplyTo', 'ConversationId', 'DateTimeReceived', 'DateTimeSent', 'IsDeliveryReceiptRequested', 'IsReadReceiptRequested', 'IsRead'],

    // convert the names of the api response data
    enumerable: true
  }, {
    key: 'emailFieldNameMap',
    value: {
      // Desired...                 // Given...
      'emails': 'value',
      'messageId': 'Id',
      'conversationId': 'ConversationId',
      'dateTimeSent': 'DateTimeSent',
      'dateTimeReceived': 'DateTimeReceived',
      'importance': 'Importance',
      'folderId': 'ParentFolderId',
      'categories': 'Categories',
      'contentType': 'Body.ContentType',
      'subject': 'Subject',
      'bodyPreview': 'BodyPreview',
      'body': 'Body.Content',
      'fromAddress': 'From.EmailAddress.Address',
      'fromName': 'From.EmailAddress.Name',
      'toRecipients': 'ToRecipients',
      'toRecipientAddress': 'EmailAddress.Address',
      'toRecipientName': 'EmailAddress.Name',
      'ccRecipients': 'CcRecipients',
      'ccRecipientAddress': 'EmailAddress.Address',
      'ccRecipientName': 'EmailAddress.Name',
      'bccRecipients': 'BccRecipients',
      'bccRecipientAddress': 'EmailAddress.Address',
      'bccRecipientName': 'EmailAddress.Name',
      'isDeliveryReceiptRequested': 'IsDeliveryReceiptRequested',
      'isReadReceiptRequested': 'IsReadReceiptRequested',
      'hasAttachments': 'HasAttachments',
      'isDraft': 'IsDraft',
      'isRead': 'IsRead'
    },
    enumerable: true
  }]);

  return Office365MailAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365MailAdapter;
module.exports = exports['default'];

// replace data keys with desired mappings...

// return results and success!

// parameters to query email with...

// format parameters for url
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L21haWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBQXVDLGlCQUFpQjs7OztzQkFDakIsUUFBUTs7OztzQkFDUixRQUFROzs7OzJCQUNSLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBNkRyQixzQkFBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7VUFFakUsaUJBQWlCLEVBQ25CLG1CQUFtQixFQVVqQixTQUFTLEVBUVQsT0FBTzs7Ozs7O0FBbkJQLDZCQUFpQixHQUFLLG9CQUFvQixDQUExQyxpQkFBaUI7QUFDbkIsK0JBQW1CLEdBQUs7QUFDdEIsb0JBQU0sRUFBTixNQUFNO0FBQ04sNkJBQWUsRUFBZixlQUFlO0FBQ2YsMkJBQWEsRUFBYixhQUFhO0FBQ2IscUJBQU8sRUFBRSxLQUFLO0FBQ2QscUJBQU8sRUFBRSwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTthQUNqQzs7OzBEQUlvQixNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztxQkFBSSxNQUFLLGdCQUFnQixDQUNoRSxLQUFLLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixnQkFBZ0IsQ0FDakI7YUFBQSxDQUFDOzs7QUFMSSxxQkFBUztBQVFULG1CQUFPLEdBQUcsb0JBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFBLElBQUksRUFBSTtBQUN2QyxrQkFBTSxVQUFVLEdBQUcsQUFBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUssRUFBRSxDQUFDO0FBQy9FLHFCQUFPO0FBQ0wscUJBQUssRUFBYSxJQUFJLENBQUMsS0FBSztBQUM1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QXdCLGNBQWM7QUFDNUMsbUJBQWEsRUFBaUIsMkJBQTJCO0FBQ3pELGdCQUFVLEVBQW9CLHdCQUF3QjtBQUN0RCxvQkFBYyxFQUFnQixjQUFjO0FBQzVDLDBCQUFvQixFQUFVLHNCQUFzQjtBQUNwRCx1QkFBaUIsRUFBYSxtQkFBbUI7QUFDakQsb0JBQWMsRUFBZ0IsY0FBYztBQUM1QywwQkFBb0IsRUFBVSxzQkFBc0I7QUFDcEQsdUJBQWlCLEVBQWEsbUJBQW1CO0FBQ2pELHFCQUFlLEVBQWUsZUFBZTtBQUM3QywyQkFBcUIsRUFBUyxzQkFBc0I7QUFDcEQsd0JBQWtCLEVBQVksbUJBQW1CO0FBQ2pELGtDQUE0QixFQUFFLDRCQUE0QjtBQUMxRCw4QkFBd0IsRUFBTSx3QkFBd0I7QUFDdEQsc0JBQWdCLEVBQWMsZ0JBQWdCO0FBQzlDLGVBQVMsRUFBcUIsU0FBUztBQUN2QyxjQUFRLEVBQXNCLFFBQVE7S0FDdkM7Ozs7U0ExRGtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiY2xBZGFwdGVycy9vZmZpY2UzNjUvbWFpbC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZXF1ZXN0ICAgICAgICAgICAgICAgICAgICBmcm9tICdyZXF1ZXN0LXByb21pc2UnO1xuaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgXyAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbG9kYXNoJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlQWRhcHRlciAgICAgICBmcm9tICcuLi9iYXNlL0FkYXB0ZXInO1xuXG5cbi8qKlxuICogT2ZmaWNlIDM2NSBNYWlsIGFkYXB0ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2ZmaWNlMzY1TWFpbEFkYXB0ZXIgZXh0ZW5kcyBPZmZpY2UzNjVCYXNlQWRhcHRlciB7XG5cblxuICAvLyBjb2xsZWN0IHRoZXNlIGZpZWxkcyBhbHdheXMuLi5cbiAgc3RhdGljIGJhc2VGaWVsZHMgPSBbXG4gICAgJ0lkJyxcbiAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXG4gICAgJ1N1YmplY3QnLFxuICAgICdJbXBvcnRhbmNlJyxcbiAgICAnSGFzQXR0YWNobWVudHMnLFxuICAgICdQYXJlbnRGb2xkZXJJZCcsXG4gICAgJ0Zyb20nLFxuICAgICdTZW5kZXInLFxuICAgICdUb1JlY2lwaWVudHMnLFxuICAgICdDY1JlY2lwaWVudHMnLFxuICAgICdCY2NSZWNpcGllbnRzJyxcbiAgICAnUmVwbHlUbycsXG4gICAgJ0NvbnZlcnNhdGlvbklkJyxcbiAgICAnRGF0ZVRpbWVSZWNlaXZlZCcsXG4gICAgJ0RhdGVUaW1lU2VudCcsXG4gICAgJ0lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ0lzUmVhZCdcbiAgXVxuXG5cbiAgLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXG4gIHN0YXRpYyBlbWFpbEZpZWxkTmFtZU1hcCA9IHtcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxuICAgICdlbWFpbHMnOiAgICAgICAgICAgICAgICAgICAgICd2YWx1ZScsXG4gICAgJ21lc3NhZ2VJZCc6ICAgICAgICAgICAgICAgICAgJ0lkJyxcbiAgICAnY29udmVyc2F0aW9uSWQnOiAgICAgICAgICAgICAnQ29udmVyc2F0aW9uSWQnLFxuICAgICdkYXRlVGltZVNlbnQnOiAgICAgICAgICAgICAgICdEYXRlVGltZVNlbnQnLFxuICAgICdkYXRlVGltZVJlY2VpdmVkJzogICAgICAgICAgICdEYXRlVGltZVJlY2VpdmVkJyxcbiAgICAnaW1wb3J0YW5jZSc6ICAgICAgICAgICAgICAgICAnSW1wb3J0YW5jZScsXG4gICAgJ2ZvbGRlcklkJzogICAgICAgICAgICAgICAgICAgJ1BhcmVudEZvbGRlcklkJyxcbiAgICAnY2F0ZWdvcmllcyc6ICAgICAgICAgICAgICAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ2NvbnRlbnRUeXBlJzogICAgICAgICAgICAgICAgJ0JvZHkuQ29udGVudFR5cGUnLFxuICAgICdzdWJqZWN0JzogICAgICAgICAgICAgICAgICAgICdTdWJqZWN0JyxcbiAgICAnYm9keVByZXZpZXcnOiAgICAgICAgICAgICAgICAnQm9keVByZXZpZXcnLFxuICAgICdib2R5JzogICAgICAgICAgICAgICAgICAgICAgICdCb2R5LkNvbnRlbnQnLFxuICAgICdmcm9tQWRkcmVzcyc6ICAgICAgICAgICAgICAgICdGcm9tLkVtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnZnJvbU5hbWUnOiAgICAgICAgICAgICAgICAgICAnRnJvbS5FbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ3RvUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAgJ1RvUmVjaXBpZW50cycsXG4gICAgJ3RvUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAndG9SZWNpcGllbnROYW1lJzogICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdjY1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgICdDY1JlY2lwaWVudHMnLFxuICAgICdjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2NjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnYmNjUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAnQmNjUmVjaXBpZW50cycsXG4gICAgJ2JjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnYmNjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdpc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCc6ICdJc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ2lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnOiAgICAgJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdoYXNBdHRhY2htZW50cyc6ICAgICAgICAgICAgICdIYXNBdHRhY2htZW50cycsXG4gICAgJ2lzRHJhZnQnOiAgICAgICAgICAgICAgICAgICAgJ0lzRHJhZnQnLFxuICAgICdpc1JlYWQnOiAgICAgICAgICAgICAgICAgICAgICdJc1JlYWQnXG4gIH1cblxuXG4gIGFzeW5jIGdldEJhdGNoRGF0YShlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcykge1xuXG4gICAgY29uc3QgeyBlbWFpbEZpZWxkTmFtZU1hcCB9ID0gT2ZmaWNlMzY1TWFpbEFkYXB0ZXIsXG4gICAgICAgICAgZGF0YUFkYXB0ZXJSdW5TdGF0cyAgID0ge1xuICAgICAgICAgICAgZW1haWxzLFxuICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKClcbiAgICAgICAgICB9O1xuXG4gICAgdHJ5IHtcblxuICAgICAgY29uc3QgZW1haWxEYXRhID0gYXdhaXQqIGVtYWlscy5tYXAoZW1haWwgPT4gdGhpcy5nZXRFbWFpbHNGb3JVc2VyKFxuICAgICAgICBlbWFpbCxcbiAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICBhZGRpdGlvbmFsRmllbGRzXG4gICAgICApKTtcblxuICAgICAgLy8gcmVwbGFjZSBkYXRhIGtleXMgd2l0aCBkZXNpcmVkIG1hcHBpbmdzLi4uXG4gICAgICBjb25zdCByZXN1bHRzID0gXy5tYXAoZW1haWxEYXRhLCB1c2VyID0+IHtcbiAgICAgICAgY29uc3QgZW1haWxBcnJheSA9ICh1c2VyLnN1Y2Nlc3MgJiYgdXNlci5kYXRhW2VtYWlsRmllbGROYW1lTWFwLmVtYWlsc10pIHx8IFtdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGVtYWlsOiAgICAgICAgICAgIHVzZXIuZW1haWwsXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlOiAgdXNlci5maWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZTogICAgdXNlci5maWx0ZXJFbmREYXRlLFxuICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgICAgIHVzZXIuc3VjY2VzcyxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICAgICB1c2VyLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAvLyBtYXAgZGF0YSB3aXRoIGRlc2lyZWQga2V5IG5hbWVzLi4uXG4gICAgICAgICAgZGF0YTogXy5tYXAoZW1haWxBcnJheSwgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFwcGVkRW1haWxNZXNzYWdlID0ge307XG5cbiAgICAgICAgICAgIC8vIGNoYW5nZSB0byBkZXNpcmVkIG5hbWVzXG4gICAgICAgICAgICBfLmVhY2goZW1haWxGaWVsZE5hbWVNYXAsIChoYXZlLCB3YW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRW1haWxNZXNzYWdlLCBoYXZlKTtcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW3dhbnRdID0gL15kYXRlVGltZS8udGVzdCh3YW50KSA/IG5ldyBEYXRlKG1hcHBlZCkgOiBtYXBwZWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ3JhYiBpbmZvIGZyb20gZGlmZmVyZW50IGNvcnJlc3BvbmRlbnQgdHlwZXMuLi5cbiAgICAgICAgICAgIC8vIChzaW5jZSB3ZSdyZSB1c2luZyBhbiBhcnJheSBsaXRlcmFsIGhlcmUsICdmb3Igb2YnIHN5bnRheCB3aWxsIGNvbXBpbGUgcmVhc29uYWJseSlcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3RvJywgJ2NjJywgJ2JjYyddKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3R5cGV9UmVjaXBpZW50YDtcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW2Ake2tleX1zYF0gPSBvcmlnaW5hbEVtYWlsTWVzc2FnZVtlbWFpbEZpZWxkTmFtZU1hcFtgJHtrZXl9c2BdXVxuICAgICAgICAgICAgICAgIC5tYXAocmVjaXBpZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IF8uZ2V0KHJlY2lwaWVudCwgZW1haWxGaWVsZE5hbWVNYXBbYCR7a2V5fUFkZHJlc3NgXSksXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICAgIF8uZ2V0KHJlY2lwaWVudCwgZW1haWxGaWVsZE5hbWVNYXBbYCR7a2V5fU5hbWVgXSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hcHBlZEVtYWlsTWVzc2FnZTtcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHJldHVybiByZXN1bHRzIGFuZCBzdWNjZXNzIVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cyxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcbiAgICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3JNZXNzYWdlKSk7XG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcbiAgICB9XG5cbiAgfVxuXG4gIGFzeW5jIGdldEVtYWlsc0ZvclVzZXIoZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxEYXRhLCBwYWdlVG9HZXQ9MSkge1xuICAgIC8vIGFjY3VtdWxhdGlvbiBvZiBkYXRhXG4gICAgZW1haWxEYXRhID0gZW1haWxEYXRhIHx8IHsgZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSB9O1xuXG4gICAgY29uc3QgYWNjZXNzVG9rZW4gICAgID0gYXdhaXQgdGhpcy5nZXRBY2Nlc3NUb2tlbigpLFxuICAgICAgICAgIHsgYXBpVmVyc2lvbiB9ICA9IHRoaXMuX2NvbmZpZy5vcHRpb25zLFxuICAgICAgICAgIHJlY29yZHNQZXJQYWdlICA9IDI1LFxuICAgICAgICAgIG1heFBhZ2VzICAgICAgICA9IDIwLFxuICAgICAgICAgIHNraXAgICAgICAgICAgICA9ICgocGFnZVRvR2V0IC0xKSAqIHJlY29yZHNQZXJQYWdlKSArIDEsXG4gICAgICAgICAgLy8gcGFyYW1ldGVycyB0byBxdWVyeSBlbWFpbCB3aXRoLi4uXG4gICAgICAgICAgcGFyYW1zICAgICAgICAgID0ge1xuICAgICAgICAgICAgJHRvcDogICAgIHJlY29yZHNQZXJQYWdlLFxuICAgICAgICAgICAgJHNraXA6ICAgIHNraXAsXG4gICAgICAgICAgICAkc2VsZWN0OiAgT2ZmaWNlMzY1TWFpbEFkYXB0ZXIuYmFzZUZpZWxkcy5qb2luKCcsJykgKyBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgICAgICAgJGZpbHRlcjogIGAgSXNEcmFmdCBlcSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVTZW50IGdlICR7ZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lU2VudCBsdCAke2ZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxuICAgICAgICAgICAgICAgICAgICAgIGAucmVwbGFjZSgvXFxzKy9nLCAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgIC50cmltKClcbiAgICAgICAgICB9O1xuXG4gICAgLy8gZm9ybWF0IHBhcmFtZXRlcnMgZm9yIHVybFxuICAgIGNvbnN0IHVybFBhcmFtcyA9IF8ocGFyYW1zKVxuICAgICAgLm1hcCgodmFsdWUsIGtleSkgPT4gYCR7a2V5fT0ke3ZhbHVlfWApXG4gICAgICAuam9pbignJicpO1xuXG4gICAgY29uc3QgZW1haWxSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmk6IGBodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS9hcGkvdiR7YXBpVmVyc2lvbn0vdXNlcnMoJyR7ZW1haWx9JykvbWVzc2FnZXM/JHt1cmxQYXJhbXN9YCxcbiAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthY2Nlc3NUb2tlbn1gLFxuICAgICAgICBBY2NlcHQ6ICAgICAgICAnYXBwbGljYXRpb24vanNvbjtvZGF0YS5tZXRhZGF0YT1ub25lJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgZW1haWxEYXRhLnN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgY29uc3QgcGFyc2VkQm9keSA9IEpTT04ucGFyc2UoYXdhaXQgcmVxdWVzdChlbWFpbFJlcXVlc3RPcHRpb25zKSk7XG5cbiAgICAgIGlmIChwYXJzZWRCb2R5ICYmIHBhZ2VUb0dldCA9PT0gMSkge1xuICAgICAgICBlbWFpbERhdGEuZGF0YSA9IHBhcnNlZEJvZHk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJzZWRCb2R5LnZhbHVlICYmIHBhZ2VUb0dldCA+IDEpIHtcbiAgICAgICAgZW1haWxEYXRhLmRhdGEudmFsdWUucHVzaCguLi5wYXJzZWRCb2R5LnZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIHJldHVybmVkIHJlc3VsdHMgYXJlIHRoZSBtYXhpbXVtIG51bWJlciBvZiByZWNvcmRzIHBlciBwYWdlLFxuICAgICAgLy8gd2UgYXJlIG5vdCBkb25lIHlldCwgc28gcmVjdXJzZS4uLlxuICAgICAgaWYgKHBhcnNlZEJvZHkgJiYgcGFyc2VkQm9keS52YWx1ZS5sZW5ndGggPT09IHJlY29yZHNQZXJQYWdlICYmIHBhZ2VUb0dldCA8PSBtYXhQYWdlcykge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbWFpbHNGb3JVc2VyKGVtYWlsLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIGVtYWlsRGF0YSwgcGFnZVRvR2V0ICsgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZW1haWxEYXRhO1xuICAgICAgfVxuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBPYmplY3QuYXNzaWduKGVtYWlsRGF0YSwge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnIubmFtZSAhPT0gJ1N0YXR1c0NvZGVFcnJvcicgP1xuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZXJyKSAgICAgICAgICA6XG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKGVyci5zdGF0dXNDb2RlICsgJyAtICcsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1lc3NhZ2VcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIH1cblxuXG59XG4iXX0=
//# sourceMappingURL=../../../clAdapters/office365/mail/index.js.map