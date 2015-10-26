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
              var emailArray = user.success && user.data || [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L21haWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFBdUMsUUFBUTs7OztzQkFDUixRQUFROzs7OzJCQUNSLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBNkRyQixzQkFBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7VUFFakUsWUFBWSxFQUNkLG1CQUFtQixFQVVqQixTQUFTLEVBY1QsT0FBTzs7Ozs7O0FBekJQLHdCQUFZLEdBQUssSUFBSSxDQUFDLFdBQVcsQ0FBakMsWUFBWTtBQUNkLCtCQUFtQixHQUFLO0FBQ3RCLG9CQUFNLEVBQU4sTUFBTTtBQUNOLDZCQUFlLEVBQWYsZUFBZTtBQUNmLDJCQUFhLEVBQWIsYUFBYTtBQUNiLHFCQUFPLEVBQUUsS0FBSztBQUNkLHFCQUFPLEVBQUUsMEJBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7YUFDakM7OzswREFJb0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7cUJBQUksTUFBSyxXQUFXLENBQUM7QUFDNUQscUJBQUssRUFBTCxLQUFLO0FBQ0wsK0JBQWUsRUFBZixlQUFlO0FBQ2YsNkJBQWEsRUFBYixhQUFhO0FBQ2IsZ0NBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBTyxFQUFHLFVBQVU7QUFDcEIsdUJBQU8sRUFBRyxtRUFDMEIsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLG9EQUM5QyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsMkJBQ3BFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQ3BCLElBQUksRUFBRTtlQUNuQixDQUFDO2FBQUEsQ0FBQzs7O0FBWEcscUJBQVM7QUFjVCxtQkFBTyxHQUFHLG9CQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDdkMsa0JBQU0sVUFBVSxHQUFHLEFBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFLLEVBQUUsQ0FBQztBQUNyRCxxQkFBTztBQUNMLHFCQUFLLEVBQWEsSUFBSSxDQUFDLEtBQUs7QUFDNUIsK0JBQWUsRUFBRyxJQUFJLENBQUMsZUFBZTtBQUN0Qyw2QkFBYSxFQUFLLElBQUksQ0FBQyxhQUFhO0FBQ3BDLHVCQUFPLEVBQVcsSUFBSSxDQUFDLE9BQU87QUFDOUIsNEJBQVksRUFBTSxJQUFJLENBQUMsWUFBWTs7QUFFbkMsb0JBQUksRUFBRSxvQkFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQUEsb0JBQW9CLEVBQUk7QUFDOUMsc0JBQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDOzs7QUFHOUIsc0NBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbkMsd0JBQU0sTUFBTSxHQUFHLG9CQUFFLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRCxzQ0FBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQzttQkFDL0UsQ0FBQyxDQUFDOzs7OzZCQUlnQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDOzs7QUFBakMsd0JBQU0sSUFBSSxXQUFBLENBQUE7QUFDYix3QkFBTSxHQUFHLEdBQU0sSUFBSSxjQUFXLENBQUM7QUFDL0Isc0NBQWtCLENBQUksR0FBRyxPQUFJLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxDQUFJLEdBQUcsT0FBSSxDQUFDLENBQzFFLEdBQUcsQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNoQiw2QkFBTztBQUNMLCtCQUFPLEVBQUUsb0JBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUksR0FBRyxhQUFVLENBQUM7QUFDeEQsNEJBQUksRUFBSyxvQkFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBSSxHQUFHLFVBQU8sQ0FBQzt1QkFDdEQsQ0FBQTtxQkFDRixDQUFDLENBQUM7OztBQVJQLDJEQUF3Qzs7bUJBU3ZDOztBQUVELHlCQUFPLGtCQUFrQixDQUFDO2lCQUMzQixDQUFDO2VBQ0gsQ0FBQzthQUNILENBQUM7NkRBSUcsbUJBQW1CO0FBQ3RCLHFCQUFPLEVBQVAsT0FBTztBQUNQLHFCQUFPLEVBQUUsSUFBSTs7Ozs7OztBQUlmLG1CQUFPLENBQUMsR0FBRyxDQUFDLGVBQWEsS0FBSyxDQUFDLENBQUM7QUFDaEMsbUJBQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLFNBQVMsZ0JBQWMsQ0FBQyxDQUFDOzZEQUNqRSxtQkFBbUIsSUFBRSxZQUFZLGdCQUFBOzs7Ozs7O0tBR2hEOzs7OztXQXJJbUIsQ0FDbEIsSUFBSSxFQUNKLFlBQVksRUFDWixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixRQUFRLEVBQ1IsY0FBYyxFQUNkLGNBQWMsRUFDZCxlQUFlLEVBQ2YsU0FBUyxFQUNULGdCQUFnQixFQUNoQixrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLDRCQUE0QixFQUM1Qix3QkFBd0IsRUFDeEIsUUFBUSxDQUNUOzs7Ozs7V0FJcUI7O0FBRXBCLGNBQVEsRUFBc0IsT0FBTztBQUNyQyxpQkFBVyxFQUFtQixJQUFJO0FBQ2xDLHNCQUFnQixFQUFjLGdCQUFnQjtBQUM5QyxvQkFBYyxFQUFnQixjQUFjO0FBQzVDLHdCQUFrQixFQUFZLGtCQUFrQjtBQUNoRCxrQkFBWSxFQUFrQixZQUFZO0FBQzFDLGdCQUFVLEVBQW9CLGdCQUFnQjtBQUM5QyxrQkFBWSxFQUFrQixZQUFZO0FBQzFDLG1CQUFhLEVBQWlCLGtCQUFrQjtBQUNoRCxlQUFTLEVBQXFCLFNBQVM7QUFDdkMsbUJBQWEsRUFBaUIsYUFBYTtBQUMzQyxZQUFNLEVBQXdCLGNBQWM7QUFDNUMsbUJBQWEsRUFBaUIsMkJBQTJCO0FBQ3pELGdCQUFVLEVBQW9CLHdCQUF3QjtBQUN0RCxvQkFBYyxFQUFnQixjQUFjO0FBQzVDLDBCQUFvQixFQUFVLHNCQUFzQjtBQUNwRCx1QkFBaUIsRUFBYSxtQkFBbUI7QUFDakQsb0JBQWMsRUFBZ0IsY0FBYztBQUM1QywwQkFBb0IsRUFBVSxzQkFBc0I7QUFDcEQsdUJBQWlCLEVBQWEsbUJBQW1CO0FBQ2pELHFCQUFlLEVBQWUsZUFBZTtBQUM3QywyQkFBcUIsRUFBUyxzQkFBc0I7QUFDcEQsd0JBQWtCLEVBQVksbUJBQW1CO0FBQ2pELGtDQUE0QixFQUFFLDRCQUE0QjtBQUMxRCw4QkFBd0IsRUFBTSx3QkFBd0I7QUFDdEQsc0JBQWdCLEVBQWMsZ0JBQWdCO0FBQzlDLGVBQVMsRUFBcUIsU0FBUztBQUN2QyxjQUFRLEVBQXNCLFFBQVE7S0FDdkM7Ozs7U0ExRGtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiY2xBZGFwdGVycy9vZmZpY2UzNjUvbWFpbC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb21lbnQgICAgICAgICAgICAgICAgICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IF8gICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgICAgICAgZnJvbSAnLi4vYmFzZS9BZGFwdGVyJztcblxuXG4vKipcbiAqIE9mZmljZSAzNjUgTWFpbCBhZGFwdGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NU1haWxBZGFwdGVyIGV4dGVuZHMgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIge1xuXG5cbiAgLy8gY29sbGVjdCB0aGVzZSBmaWVsZHMgYWx3YXlzLi4uXG4gIHN0YXRpYyBiYXNlRmllbGRzID0gW1xuICAgICdJZCcsXG4gICAgJ0NhdGVnb3JpZXMnLFxuICAgICdEYXRlVGltZUNyZWF0ZWQnLFxuICAgICdTdWJqZWN0JyxcbiAgICAnSW1wb3J0YW5jZScsXG4gICAgJ0hhc0F0dGFjaG1lbnRzJyxcbiAgICAnUGFyZW50Rm9sZGVySWQnLFxuICAgICdGcm9tJyxcbiAgICAnU2VuZGVyJyxcbiAgICAnVG9SZWNpcGllbnRzJyxcbiAgICAnQ2NSZWNpcGllbnRzJyxcbiAgICAnQmNjUmVjaXBpZW50cycsXG4gICAgJ1JlcGx5VG8nLFxuICAgICdDb252ZXJzYXRpb25JZCcsXG4gICAgJ0RhdGVUaW1lUmVjZWl2ZWQnLFxuICAgICdEYXRlVGltZVNlbnQnLFxuICAgICdJc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdJc1JlYWQnXG4gIF1cblxuXG4gIC8vIGNvbnZlcnQgdGhlIG5hbWVzIG9mIHRoZSBhcGkgcmVzcG9uc2UgZGF0YVxuICBzdGF0aWMgZmllbGROYW1lTWFwID0ge1xuICAgIC8vIERlc2lyZWQuLi4gICAgICAgICAgICAgICAgIC8vIEdpdmVuLi4uXG4gICAgJ2VtYWlscyc6ICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJyxcbiAgICAnbWVzc2FnZUlkJzogICAgICAgICAgICAgICAgICAnSWQnLFxuICAgICdjb252ZXJzYXRpb25JZCc6ICAgICAgICAgICAgICdDb252ZXJzYXRpb25JZCcsXG4gICAgJ2RhdGVUaW1lU2VudCc6ICAgICAgICAgICAgICAgJ0RhdGVUaW1lU2VudCcsXG4gICAgJ2RhdGVUaW1lUmVjZWl2ZWQnOiAgICAgICAgICAgJ0RhdGVUaW1lUmVjZWl2ZWQnLFxuICAgICdpbXBvcnRhbmNlJzogICAgICAgICAgICAgICAgICdJbXBvcnRhbmNlJyxcbiAgICAnZm9sZGVySWQnOiAgICAgICAgICAgICAgICAgICAnUGFyZW50Rm9sZGVySWQnLFxuICAgICdjYXRlZ29yaWVzJzogICAgICAgICAgICAgICAgICdDYXRlZ29yaWVzJyxcbiAgICAnY29udGVudFR5cGUnOiAgICAgICAgICAgICAgICAnQm9keS5Db250ZW50VHlwZScsXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgJ1N1YmplY3QnLFxuICAgICdib2R5UHJldmlldyc6ICAgICAgICAgICAgICAgICdCb2R5UHJldmlldycsXG4gICAgJ2JvZHknOiAgICAgICAgICAgICAgICAgICAgICAgJ0JvZHkuQ29udGVudCcsXG4gICAgJ2Zyb21BZGRyZXNzJzogICAgICAgICAgICAgICAgJ0Zyb20uRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdmcm9tTmFtZSc6ICAgICAgICAgICAgICAgICAgICdGcm9tLkVtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAndG9SZWNpcGllbnRzJzogICAgICAgICAgICAgICAnVG9SZWNpcGllbnRzJyxcbiAgICAndG9SZWNpcGllbnRBZGRyZXNzJzogICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICd0b1JlY2lwaWVudE5hbWUnOiAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2NjUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAgJ0NjUmVjaXBpZW50cycsXG4gICAgJ2NjUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnY2NSZWNpcGllbnROYW1lJzogICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdiY2NSZWNpcGllbnRzJzogICAgICAgICAgICAgICdCY2NSZWNpcGllbnRzJyxcbiAgICAnYmNjUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdiY2NSZWNpcGllbnROYW1lJzogICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJzogJ0lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnaXNSZWFkUmVjZWlwdFJlcXVlc3RlZCc6ICAgICAnSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ2hhc0F0dGFjaG1lbnRzJzogICAgICAgICAgICAgJ0hhc0F0dGFjaG1lbnRzJyxcbiAgICAnaXNEcmFmdCc6ICAgICAgICAgICAgICAgICAgICAnSXNEcmFmdCcsXG4gICAgJ2lzUmVhZCc6ICAgICAgICAgICAgICAgICAgICAgJ0lzUmVhZCdcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XG5cbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzICAgPSB7XG4gICAgICAgICAgICBlbWFpbHMsXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICAgIH07XG5cbiAgICB0cnkge1xuXG4gICAgICBjb25zdCBlbWFpbERhdGEgPSBhd2FpdCogZW1haWxzLm1hcChlbWFpbCA9PiB0aGlzLmdldFVzZXJEYXRhKHtcbiAgICAgICAgZW1haWwsXG4gICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgYWRkaXRpb25hbEZpZWxkcyxcbiAgICAgICAgYXBpVHlwZTogICdtZXNzYWdlcycsXG4gICAgICAgICRmaWx0ZXI6ICBgIElzRHJhZnQgZXEgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVTZW50IGdlICR7ZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKX1cbiAgICAgICAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVTZW50IGx0ICR7ZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICAgICAgICBgLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgICAgICAgICAgICAgIC50cmltKClcbiAgICAgIH0pKTtcblxuICAgICAgLy8gcmVwbGFjZSBkYXRhIGtleXMgd2l0aCBkZXNpcmVkIG1hcHBpbmdzLi4uXG4gICAgICBjb25zdCByZXN1bHRzID0gXy5tYXAoZW1haWxEYXRhLCB1c2VyID0+IHtcbiAgICAgICAgY29uc3QgZW1haWxBcnJheSA9ICh1c2VyLnN1Y2Nlc3MgJiYgdXNlci5kYXRhKSB8fCBbXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBlbWFpbDogICAgICAgICAgICB1c2VyLmVtYWlsLFxuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZTogIHVzZXIuZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgIGZpbHRlckVuZERhdGU6ICAgIHVzZXIuZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICBzdWNjZXNzOiAgICAgICAgICB1c2VyLnN1Y2Nlc3MsXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiAgICAgdXNlci5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgLy8gbWFwIGRhdGEgd2l0aCBkZXNpcmVkIGtleSBuYW1lcy4uLlxuICAgICAgICAgIGRhdGE6IF8ubWFwKGVtYWlsQXJyYXksIG9yaWdpbmFsRW1haWxNZXNzYWdlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZEVtYWlsTWVzc2FnZSA9IHt9O1xuXG4gICAgICAgICAgICAvLyBjaGFuZ2UgdG8gZGVzaXJlZCBuYW1lc1xuICAgICAgICAgICAgXy5lYWNoKGZpZWxkTmFtZU1hcCwgKGhhdmUsIHdhbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbWFwcGVkID0gXy5nZXQob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIGhhdmUpO1xuICAgICAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2Vbd2FudF0gPSAvXmRhdGVUaW1lLy50ZXN0KHdhbnQpID8gbmV3IERhdGUobWFwcGVkKSA6IG1hcHBlZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBncmFiIGluZm8gZnJvbSBkaWZmZXJlbnQgY29ycmVzcG9uZGVudCB0eXBlcy4uLlxuICAgICAgICAgICAgLy8gKHNpbmNlIHdlJ3JlIHVzaW5nIGFuIGFycmF5IGxpdGVyYWwgaGVyZSwgJ2ZvciBvZicgc3ludGF4IHdpbGwgY29tcGlsZSByZWFzb25hYmx5KVxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIFsndG8nLCAnY2MnLCAnYmNjJ10pIHtcbiAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7dHlwZX1SZWNpcGllbnRgO1xuICAgICAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2VbYCR7a2V5fXNgXSA9IG9yaWdpbmFsRW1haWxNZXNzYWdlW2ZpZWxkTmFtZU1hcFtgJHtrZXl9c2BdXVxuICAgICAgICAgICAgICAgIC5tYXAocmVjaXBpZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IF8uZ2V0KHJlY2lwaWVudCwgZmllbGROYW1lTWFwW2Ake2tleX1BZGRyZXNzYF0pLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAgICBfLmdldChyZWNpcGllbnQsIGZpZWxkTmFtZU1hcFtgJHtrZXl9TmFtZWBdKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbWFwcGVkRW1haWxNZXNzYWdlO1xuICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgLy8gcmV0dXJuIHJlc3VsdHMgYW5kIHN1Y2Nlc3MhXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxuICAgICAgICByZXN1bHRzLFxuICAgICAgICBzdWNjZXNzOiB0cnVlXG4gICAgICB9O1xuXG4gICAgfSBjYXRjaCAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2Uuc3RhY2spO1xuICAgICAgY29uc29sZS5sb2coJ09mZmljZTM2NSBHZXRCYXRjaERhdGEgRXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvck1lc3NhZ2UpKTtcbiAgICAgIHJldHVybiB7IC4uLmRhdGFBZGFwdGVyUnVuU3RhdHMsIGVycm9yTWVzc2FnZSB9O1xuICAgIH1cblxuICB9XG5cbn1cbiJdfQ==
//# sourceMappingURL=../../../clAdapters/office365/mail/index.js.map