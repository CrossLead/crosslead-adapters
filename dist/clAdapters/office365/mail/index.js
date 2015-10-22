'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

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
      var fieldNameMap, dataAdapterRunStats, emailData, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            fieldNameMap = this.constructor.fieldNameMap;
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
              return _this.getUserData({
                email: email,
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                additionalFields: additionalFields,
                apiType: 'messages',
                $filter: (' IsDraft eq false\n                      and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                      and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                  ').replace(/\s+/g, ' ').trim()
              });
            })));

          case 5:
            emailData = context$2$0.sent;
            results = _lodash2['default'].map(emailData, function (user) {
              var emailArray = user.success && user.data[fieldNameMap.emails] || [];
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
                  _lodash2['default'].each(fieldNameMap, function (have, want) {
                    var mapped = _lodash2['default'].get(originalEmailMessage, have);
                    mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                  });

                  // grab info from different correspondent types...
                  // (since we're using an array literal here, 'for of' syntax will compile reasonably)
                  var _arr = ['to', 'cc', 'bcc'];

                  var _loop = function () {
                    var type = _arr[_i];
                    var key = type + 'Recipient';
                    mappedEmailMessage[key + 's'] = originalEmailMessage[fieldNameMap[key + 's']].map(function (recipient) {
                      return {
                        address: _lodash2['default'].get(recipient, fieldNameMap[key + 'Address']),
                        name: _lodash2['default'].get(recipient, fieldNameMap[key + 'Name'])
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
  }], [{
    key: 'baseFields',

    // collect these fields always...
    value: ['Id', 'Categories', 'DateTimeCreated', 'Subject', 'Importance', 'HasAttachments', 'ParentFolderId', 'From', 'Sender', 'ToRecipients', 'CcRecipients', 'BccRecipients', 'ReplyTo', 'ConversationId', 'DateTimeReceived', 'DateTimeSent', 'IsDeliveryReceiptRequested', 'IsReadReceiptRequested', 'IsRead'],

    // convert the names of the api response data
    enumerable: true
  }, {
    key: 'fieldNameMap',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L21haWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFBdUMsUUFBUTs7OztzQkFDUixRQUFROzs7OzJCQUNSLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBNkRyQixzQkFBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7VUFFakUsWUFBWSxFQUNkLG1CQUFtQixFQVVqQixTQUFTLEVBY1QsT0FBTzs7Ozs7O0FBekJQLHdCQUFZLEdBQUssSUFBSSxDQUFDLFdBQVcsQ0FBakMsWUFBWTtBQUNkLCtCQUFtQixHQUFLO0FBQ3RCLG9CQUFNLEVBQU4sTUFBTTtBQUNOLDZCQUFlLEVBQWYsZUFBZTtBQUNmLDJCQUFhLEVBQWIsYUFBYTtBQUNiLHFCQUFPLEVBQUUsS0FBSztBQUNkLHFCQUFPLEVBQUUsMEJBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7YUFDakM7OzswREFJb0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7cUJBQUksTUFBSyxXQUFXLENBQUM7QUFDNUQscUJBQUssRUFBTCxLQUFLO0FBQ0wsK0JBQWUsRUFBZixlQUFlO0FBQ2YsNkJBQWEsRUFBYixhQUFhO0FBQ2IsZ0NBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBTyxFQUFHLFVBQVU7QUFDcEIsdUJBQU8sRUFBRyxtRUFDMEIsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLG9EQUM5QyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsMkJBQ3BFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQ3BCLElB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QkFBZ0I7QUFDOUMsa0JBQVksRUFBa0IsWUFBWTtBQUMxQyxtQkFBYSxFQUFpQixrQkFBa0I7QUFDaEQsZUFBUyxFQUFxQixTQUFTO0FBQ3ZDLG1CQUFhLEVBQWlCLGFBQWE7QUFDM0MsWUFBTSxFQUF3QixjQUFjO0FBQzVDLG1CQUFhLEVBQWlCLDJCQUEyQjtBQUN6RCxnQkFBVSxFQUFvQix3QkFBd0I7QUFDdEQsb0JBQWMsRUFBZ0IsY0FBYztBQUM1QywwQkFBb0IsRUFBVSxzQkFBc0I7QUFDcEQsdUJBQWlCLEVBQWEsbUJBQW1CO0FBQ2pELG9CQUFjLEVBQWdCLGNBQWM7QUFDNUMsMEJBQW9CLEVBQVUsc0JBQXNCO0FBQ3BELHVCQUFpQixFQUFhLG1CQUFtQjtBQUNqRCxxQkFBZSxFQUFlLGVBQWU7QUFDN0MsMkJBQXFCLEVBQVMsc0JBQXNCO0FBQ3BELHdCQUFrQixFQUFZLG1CQUFtQjtBQUNqRCxrQ0FBNEIsRUFBRSw0QkFBNEI7QUFDMUQsOEJBQXdCLEVBQU0sd0JBQXdCO0FBQ3RELHNCQUFnQixFQUFjLGdCQUFnQjtBQUM5QyxlQUFTLEVBQXFCLFNBQVM7QUFDdkMsY0FBUSxFQUFzQixRQUFRO0tBQ3ZDOzs7O1NBMURrQixvQkFBb0I7OztxQkFBcEIsb0JBQW9CIiwiZmlsZSI6ImNsQWRhcHRlcnMvb2ZmaWNlMzY1L21haWwvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9tZW50ICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbW9tZW50JztcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IE9mZmljZTM2NUJhc2VBZGFwdGVyICAgICAgIGZyb20gJy4uL2Jhc2UvQWRhcHRlcic7XG5cblxuLyoqXG4gKiBPZmZpY2UgMzY1IE1haWwgYWRhcHRlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVNYWlsQWRhcHRlciBleHRlbmRzIE9mZmljZTM2NUJhc2VBZGFwdGVyIHtcblxuXG4gIC8vIGNvbGxlY3QgdGhlc2UgZmllbGRzIGFsd2F5cy4uLlxuICBzdGF0aWMgYmFzZUZpZWxkcyA9IFtcbiAgICAnSWQnLFxuICAgICdDYXRlZ29yaWVzJyxcbiAgICAnRGF0ZVRpbWVDcmVhdGVkJyxcbiAgICAnU3ViamVjdCcsXG4gICAgJ0ltcG9ydGFuY2UnLFxuICAgICdIYXNBdHRhY2htZW50cycsXG4gICAgJ1BhcmVudEZvbGRlcklkJyxcbiAgICAnRnJvbScsXG4gICAgJ1NlbmRlcicsXG4gICAgJ1RvUmVjaXBpZW50cycsXG4gICAgJ0NjUmVjaXBpZW50cycsXG4gICAgJ0JjY1JlY2lwaWVudHMnLFxuICAgICdSZXBseVRvJyxcbiAgICAnQ29udmVyc2F0aW9uSWQnLFxuICAgICdEYXRlVGltZVJlY2VpdmVkJyxcbiAgICAnRGF0ZVRpbWVTZW50JyxcbiAgICAnSXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdJc1JlYWRSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnSXNSZWFkJ1xuICBdXG5cblxuICAvLyBjb252ZXJ0IHRoZSBuYW1lcyBvZiB0aGUgYXBpIHJlc3BvbnNlIGRhdGFcbiAgc3RhdGljIGZpZWxkTmFtZU1hcCA9IHtcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxuICAgICdlbWFpbHMnOiAgICAgICAgICAgICAgICAgICAgICd2YWx1ZScsXG4gICAgJ21lc3NhZ2VJZCc6ICAgICAgICAgICAgICAgICAgJ0lkJyxcbiAgICAnY29udmVyc2F0aW9uSWQnOiAgICAgICAgICAgICAnQ29udmVyc2F0aW9uSWQnLFxuICAgICdkYXRlVGltZVNlbnQnOiAgICAgICAgICAgICAgICdEYXRlVGltZVNlbnQnLFxuICAgICdkYXRlVGltZVJlY2VpdmVkJzogICAgICAgICAgICdEYXRlVGltZVJlY2VpdmVkJyxcbiAgICAnaW1wb3J0YW5jZSc6ICAgICAgICAgICAgICAgICAnSW1wb3J0YW5jZScsXG4gICAgJ2ZvbGRlcklkJzogICAgICAgICAgICAgICAgICAgJ1BhcmVudEZvbGRlcklkJyxcbiAgICAnY2F0ZWdvcmllcyc6ICAgICAgICAgICAgICAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ2NvbnRlbnRUeXBlJzogICAgICAgICAgICAgICAgJ0JvZHkuQ29udGVudFR5cGUnLFxuICAgICdzdWJqZWN0JzogICAgICAgICAgICAgICAgICAgICdTdWJqZWN0JyxcbiAgICAnYm9keVByZXZpZXcnOiAgICAgICAgICAgICAgICAnQm9keVByZXZpZXcnLFxuICAgICdib2R5JzogICAgICAgICAgICAgICAgICAgICAgICdCb2R5LkNvbnRlbnQnLFxuICAgICdmcm9tQWRkcmVzcyc6ICAgICAgICAgICAgICAgICdGcm9tLkVtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnZnJvbU5hbWUnOiAgICAgICAgICAgICAgICAgICAnRnJvbS5FbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ3RvUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAgJ1RvUmVjaXBpZW50cycsXG4gICAgJ3RvUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAndG9SZWNpcGllbnROYW1lJzogICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdjY1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgICdDY1JlY2lwaWVudHMnLFxuICAgICdjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2NjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnYmNjUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAnQmNjUmVjaXBpZW50cycsXG4gICAgJ2JjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnYmNjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdpc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCc6ICdJc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ2lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnOiAgICAgJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdoYXNBdHRhY2htZW50cyc6ICAgICAgICAgICAgICdIYXNBdHRhY2htZW50cycsXG4gICAgJ2lzRHJhZnQnOiAgICAgICAgICAgICAgICAgICAgJ0lzRHJhZnQnLFxuICAgICdpc1JlYWQnOiAgICAgICAgICAgICAgICAgICAgICdJc1JlYWQnXG4gIH1cblxuXG4gIGFzeW5jIGdldEJhdGNoRGF0YShlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcykge1xuXG4gICAgY29uc3QgeyBmaWVsZE5hbWVNYXAgfSA9IHRoaXMuY29uc3RydWN0b3IsXG4gICAgICAgICAgZGF0YUFkYXB0ZXJSdW5TdGF0cyAgID0ge1xuICAgICAgICAgICAgZW1haWxzLFxuICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKClcbiAgICAgICAgICB9O1xuXG4gICAgdHJ5IHtcblxuICAgICAgY29uc3QgZW1haWxEYXRhID0gYXdhaXQqIGVtYWlscy5tYXAoZW1haWwgPT4gdGhpcy5nZXRVc2VyRGF0YSh7XG4gICAgICAgIGVtYWlsLFxuICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgICAgIGFwaVR5cGU6ICAnbWVzc2FnZXMnLFxuICAgICAgICAkZmlsdGVyOiAgYCBJc0RyYWZ0IGVxIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lU2VudCBnZSAke2ZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lU2VudCBsdCAke2ZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxuICAgICAgICAgICAgICAgICAgYC5yZXBsYWNlKC9cXHMrL2csICcgJylcbiAgICAgICAgICAgICAgICAgICAudHJpbSgpXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIHJlcGxhY2UgZGF0YSBrZXlzIHdpdGggZGVzaXJlZCBtYXBwaW5ncy4uLlxuICAgICAgY29uc3QgcmVzdWx0cyA9IF8ubWFwKGVtYWlsRGF0YSwgdXNlciA9PiB7XG4gICAgICAgIGNvbnN0IGVtYWlsQXJyYXkgPSAodXNlci5zdWNjZXNzICYmIHVzZXIuZGF0YVtmaWVsZE5hbWVNYXAuZW1haWxzXSkgfHwgW107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZW1haWw6ICAgICAgICAgICAgdXNlci5lbWFpbCxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGU6ICB1c2VyLmZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlOiAgICB1c2VyLmZpbHRlckVuZERhdGUsXG4gICAgICAgICAgc3VjY2VzczogICAgICAgICAgdXNlci5zdWNjZXNzLFxuICAgICAgICAgIGVycm9yTWVzc2FnZTogICAgIHVzZXIuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgIC8vIG1hcCBkYXRhIHdpdGggZGVzaXJlZCBrZXkgbmFtZXMuLi5cbiAgICAgICAgICBkYXRhOiBfLm1hcChlbWFpbEFycmF5LCBvcmlnaW5hbEVtYWlsTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYXBwZWRFbWFpbE1lc3NhZ2UgPSB7fTtcblxuICAgICAgICAgICAgLy8gY2hhbmdlIHRvIGRlc2lyZWQgbmFtZXNcbiAgICAgICAgICAgIF8uZWFjaChmaWVsZE5hbWVNYXAsIChoYXZlLCB3YW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRW1haWxNZXNzYWdlLCBoYXZlKTtcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW3dhbnRdID0gL15kYXRlVGltZS8udGVzdCh3YW50KSA/IG5ldyBEYXRlKG1hcHBlZCkgOiBtYXBwZWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ3JhYiBpbmZvIGZyb20gZGlmZmVyZW50IGNvcnJlc3BvbmRlbnQgdHlwZXMuLi5cbiAgICAgICAgICAgIC8vIChzaW5jZSB3ZSdyZSB1c2luZyBhbiBhcnJheSBsaXRlcmFsIGhlcmUsICdmb3Igb2YnIHN5bnRheCB3aWxsIGNvbXBpbGUgcmVhc29uYWJseSlcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3RvJywgJ2NjJywgJ2JjYyddKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3R5cGV9UmVjaXBpZW50YDtcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW2Ake2tleX1zYF0gPSBvcmlnaW5hbEVtYWlsTWVzc2FnZVtmaWVsZE5hbWVNYXBbYCR7a2V5fXNgXV1cbiAgICAgICAgICAgICAgICAubWFwKHJlY2lwaWVudCA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBfLmdldChyZWNpcGllbnQsIGZpZWxkTmFtZU1hcFtgJHtrZXl9QWRkcmVzc2BdKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogICAgXy5nZXQocmVjaXBpZW50LCBmaWVsZE5hbWVNYXBbYCR7a2V5fU5hbWVgXSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hcHBlZEVtYWlsTWVzc2FnZTtcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHJldHVybiByZXN1bHRzIGFuZCBzdWNjZXNzIVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cyxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcbiAgICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3JNZXNzYWdlKSk7XG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcbiAgICB9XG5cbiAgfVxuXG59XG4iXX0=
//# sourceMappingURL=../../../clAdapters/office365/mail/index.js.map