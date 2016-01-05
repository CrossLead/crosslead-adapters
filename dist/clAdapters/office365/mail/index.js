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
    value: function getBatchData(userProfiles, filterStartDate, filterEndDate, additionalFields) {
      var fieldNameMap, dataAdapterRunStats, emailData, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            fieldNameMap = this.constructor.fieldNameMap;
            dataAdapterRunStats = {
              userProfiles: userProfiles,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              success: false,
              runDate: (0, _moment2['default'])().utc().toDate()
            };
            context$2$0.prev = 2;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(_Promise.all(userProfiles.map(function (userProfile) {
              return _this.getUserData({
                userProfile: userProfile,
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                additionalFields: additionalFields,
                apiType: 'messages',
                $filter: (' IsDraft eq false\n                        and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                        and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                    ').replace(/\s+/g, ' ').trim()
              });
            })));

          case 5:
            emailData = context$2$0.sent;
            results = _lodash2['default'].map(emailData, function (user) {
              var emailArray = user.success && user.data || [];
              return _extends({}, user.userProfile, {
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
                    if (mapped !== undefined) {
                      mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                    }
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
              });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcbWFpbFxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFBdUMsUUFBUTs7OztzQkFDUixRQUFROzs7OzJCQUNSLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBNkRyQixzQkFBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7VUFFdkUsWUFBWSxFQUNkLG1CQUFtQixFQVVqQixTQUFTLEVBZ0JULE9BQU87Ozs7OztBQTNCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QiwwQkFBWSxFQUFaLFlBQVk7QUFDWiw2QkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBYSxFQUFiLGFBQWE7QUFDYixxQkFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO2FBQ2pDOzs7MERBSW9CLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDdkQscUJBQU8sTUFBSyxXQUFXLENBQUM7QUFDdEIsMkJBQVcsRUFBWCxXQUFXO0FBQ1gsK0JBQWUsRUFBZixlQUFlO0FBQ2YsNkJBQWEsRUFBYixhQUFhO0FBQ2IsZ0NBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBTyxFQUFHLFVBQVU7QUFDcEIsdUJBQU8sRUFBRyxxRUFDMEIsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLHNEQUM5QyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsNkJBQ3BFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQ3BCLElBQUksRUFBRTtlQUNuQixDQUFDLENBQUM7YUFDSixDQUFDOzs7QUFiSSxxQkFBUztBQWdCVCxtQkFBTyxHQUFHLG9CQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDdkMsa0JBQU0sVUFBVSxHQUFHLEFBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFLLEVBQUUsQ0FBQztBQUNyRCxrQ0FDSyxJQUFJLENBQUMsV0FBVztBQUNuQiwrQkFBZSxFQUFHLElBQUksQ0FBQyxlQUFlO0FBQ3RDLDZCQUFhLEVBQUssSUFBSSxDQUFDLGFBQWE7QUFDcEMsdUJBQU8sRUFBVyxJQUFJLENBQUMsT0FBTztBQUM5Qiw0QkFBWSxFQUFNLElBQUksQ0FBQyxZQUFZOztBQUVuQyxvQkFBSSxFQUFFLG9CQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBQSxvQkFBb0IsRUFBSTtBQUM5QyxzQkFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7OztBQUc5QixzQ0FBRSxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNuQyx3QkFBTSxNQUFNLEdBQUcsb0JBQUUsR0FBRyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELHdCQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDeEIsd0NBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUM7cUJBQy9FO21CQUNGLENBQUMsQ0FBQzs7Ozs2QkFJZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQzs7O0FBQWpDLHdCQUFNLElBQUksV0FBQSxDQUFBO0FBQ2Isd0JBQU0sR0FBRyxHQUFNLElBQUksY0FBVyxDQUFDO0FBQy9CLHNDQUFrQixDQUFJLEdBQUcsT0FBSSxHQUFHLG9CQUFvQixDQUFDLFlBQVksQ0FBSSxHQUFHLE9BQUksQ0FBQyxDQUMxRSxHQUFHLENBQUMsVUFBQSxTQUFTLEVBQUk7QUFDaEIsNkJBQU87QUFDTCwrQkFBTyxFQUFFLG9CQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFJLEdBQUcsYUFBVSxDQUFDO0FBQ3hELDRCQUFJLEVBQUssb0JBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUksR0FBRyxVQUFPLENBQUM7dUJBQ3RELENBQUE7cUJBQ0YsQ0FBQyxDQUFDOzs7QUFSUCwyREFBd0M7O21CQVN2Qzs7QUFFRCx5QkFBTyxrQkFBa0IsQ0FBQztpQkFDM0IsQ0FBQztpQkFDRjthQUNILENBQUM7NkRBSUcsbUJBQW1CO0FBQ3RCLHFCQUFPLEVBQVAsT0FBTztBQUNQLHFCQUFPLEVBQUUsSUFBSTs7Ozs7OztBQUlmLG1CQUFPLENBQUMsR0FBRyxDQUFDLGVBQWEsS0FBSyxDQUFDLENBQUM7QUFDaEMsbUJBQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLFNBQVMsZ0JBQWMsQ0FBQyxDQUFDOzZEQUNqRSxtQkFBbUIsSUFBRSxZQUFZLGdCQUFBOzs7Ozs7O0tBR2hEOzs7OztXQXpJbUIsQ0FDbEIsSUFBSSxFQUNKLFlBQVksRUFDWixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixRQUFRLEVBQ1IsY0FBYyxFQUNkLGNBQWMsRUFDZCxlQUFlLEVBQ2YsU0FBUyxFQUNULGdCQUFnQixFQUNoQixrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLDRCQUE0QixFQUM1Qix3QkFBd0IsRUFDeEIsUUFBUSxDQUNUOzs7Ozs7V0FJcUI7O0FBRXBCLGNBQVEsRUFBc0IsT0FBTztBQUNyQyxpQkFBVyxFQUFtQixJQUFJO0FBQ2xDLHNCQUFnQixFQUFjLGdCQUFnQjtBQUM5QyxvQkFBYyxFQUFnQixjQUFjO0FBQzVDLHdCQUFrQixFQUFZLGtCQUFrQjtBQUNoRCxrQkFBWSxFQUFrQixZQUFZO0FBQzFDLGdCQUFVLEVBQW9CLGdCQUFnQjtBQUM5QyxrQkFBWSxFQUFrQixZQUFZO0FBQzFDLG1CQUFhLEVBQWlCLGtCQUFrQjtBQUNoRCxlQUFTLEVBQXFCLFNBQVM7QUFDdkMsbUJBQWEsRUFBaUIsYUFBYTtBQUMzQyxZQUFNLEVBQXdCLGNBQWM7QUFDNUMsbUJBQWEsRUFBaUIsMkJBQTJCO0FBQ3pELGdCQUFVLEVBQW9CLHdCQUF3QjtBQUN0RCxvQkFBYyxFQUFnQixjQUFjO0FBQzVDLDBCQUFvQixFQUFVLHNCQUFzQjtBQUNwRCx1QkFBaUIsRUFBYSxtQkFBbUI7QUFDakQsb0JBQWMsRUFBZ0IsY0FBYztBQUM1QywwQkFBb0IsRUFBVSxzQkFBc0I7QUFDcEQsdUJBQWlCLEVBQWEsbUJBQW1CO0FBQ2pELHFCQUFlLEVBQWUsZUFBZTtBQUM3QywyQkFBcUIsRUFBUyxzQkFBc0I7QUFDcEQsd0JBQWtCLEVBQVksbUJBQW1CO0FBQ2pELGtDQUE0QixFQUFFLDRCQUE0QjtBQUMxRCw4QkFBd0IsRUFBTSx3QkFBd0I7QUFDdEQsc0JBQWdCLEVBQWMsZ0JBQWdCO0FBQzlDLGVBQVMsRUFBcUIsU0FBUztBQUN2QyxjQUFRLEVBQXNCLFFBQVE7S0FDdkM7Ozs7U0ExRGtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiY2xBZGFwdGVyc1xcb2ZmaWNlMzY1XFxtYWlsXFxpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb21lbnQgICAgICAgICAgICAgICAgICAgICBmcm9tICdtb21lbnQnO1xyXG5pbXBvcnQgXyAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IE9mZmljZTM2NUJhc2VBZGFwdGVyICAgICAgIGZyb20gJy4uL2Jhc2UvQWRhcHRlcic7XHJcblxyXG5cclxuLyoqXHJcbiAqIE9mZmljZSAzNjUgTWFpbCBhZGFwdGVyXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVNYWlsQWRhcHRlciBleHRlbmRzIE9mZmljZTM2NUJhc2VBZGFwdGVyIHtcclxuXHJcblxyXG4gIC8vIGNvbGxlY3QgdGhlc2UgZmllbGRzIGFsd2F5cy4uLlxyXG4gIHN0YXRpYyBiYXNlRmllbGRzID0gW1xyXG4gICAgJ0lkJyxcclxuICAgICdDYXRlZ29yaWVzJyxcclxuICAgICdEYXRlVGltZUNyZWF0ZWQnLFxyXG4gICAgJ1N1YmplY3QnLFxyXG4gICAgJ0ltcG9ydGFuY2UnLFxyXG4gICAgJ0hhc0F0dGFjaG1lbnRzJyxcclxuICAgICdQYXJlbnRGb2xkZXJJZCcsXHJcbiAgICAnRnJvbScsXHJcbiAgICAnU2VuZGVyJyxcclxuICAgICdUb1JlY2lwaWVudHMnLFxyXG4gICAgJ0NjUmVjaXBpZW50cycsXHJcbiAgICAnQmNjUmVjaXBpZW50cycsXHJcbiAgICAnUmVwbHlUbycsXHJcbiAgICAnQ29udmVyc2F0aW9uSWQnLFxyXG4gICAgJ0RhdGVUaW1lUmVjZWl2ZWQnLFxyXG4gICAgJ0RhdGVUaW1lU2VudCcsXHJcbiAgICAnSXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnLFxyXG4gICAgJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxyXG4gICAgJ0lzUmVhZCdcclxuICBdXHJcblxyXG5cclxuICAvLyBjb252ZXJ0IHRoZSBuYW1lcyBvZiB0aGUgYXBpIHJlc3BvbnNlIGRhdGFcclxuICBzdGF0aWMgZmllbGROYW1lTWFwID0ge1xyXG4gICAgLy8gRGVzaXJlZC4uLiAgICAgICAgICAgICAgICAgLy8gR2l2ZW4uLi5cclxuICAgICdlbWFpbHMnOiAgICAgICAgICAgICAgICAgICAgICd2YWx1ZScsXHJcbiAgICAnbWVzc2FnZUlkJzogICAgICAgICAgICAgICAgICAnSWQnLFxyXG4gICAgJ2NvbnZlcnNhdGlvbklkJzogICAgICAgICAgICAgJ0NvbnZlcnNhdGlvbklkJyxcclxuICAgICdkYXRlVGltZVNlbnQnOiAgICAgICAgICAgICAgICdEYXRlVGltZVNlbnQnLFxyXG4gICAgJ2RhdGVUaW1lUmVjZWl2ZWQnOiAgICAgICAgICAgJ0RhdGVUaW1lUmVjZWl2ZWQnLFxyXG4gICAgJ2ltcG9ydGFuY2UnOiAgICAgICAgICAgICAgICAgJ0ltcG9ydGFuY2UnLFxyXG4gICAgJ2ZvbGRlcklkJzogICAgICAgICAgICAgICAgICAgJ1BhcmVudEZvbGRlcklkJyxcclxuICAgICdjYXRlZ29yaWVzJzogICAgICAgICAgICAgICAgICdDYXRlZ29yaWVzJyxcclxuICAgICdjb250ZW50VHlwZSc6ICAgICAgICAgICAgICAgICdCb2R5LkNvbnRlbnRUeXBlJyxcclxuICAgICdzdWJqZWN0JzogICAgICAgICAgICAgICAgICAgICdTdWJqZWN0JyxcclxuICAgICdib2R5UHJldmlldyc6ICAgICAgICAgICAgICAgICdCb2R5UHJldmlldycsXHJcbiAgICAnYm9keSc6ICAgICAgICAgICAgICAgICAgICAgICAnQm9keS5Db250ZW50JyxcclxuICAgICdmcm9tQWRkcmVzcyc6ICAgICAgICAgICAgICAgICdGcm9tLkVtYWlsQWRkcmVzcy5BZGRyZXNzJyxcclxuICAgICdmcm9tTmFtZSc6ICAgICAgICAgICAgICAgICAgICdGcm9tLkVtYWlsQWRkcmVzcy5OYW1lJyxcclxuICAgICd0b1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgICdUb1JlY2lwaWVudHMnLFxyXG4gICAgJ3RvUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcclxuICAgICd0b1JlY2lwaWVudE5hbWUnOiAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXHJcbiAgICAnY2NSZWNpcGllbnRzJzogICAgICAgICAgICAgICAnQ2NSZWNpcGllbnRzJyxcclxuICAgICdjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXHJcbiAgICAnY2NSZWNpcGllbnROYW1lJzogICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxyXG4gICAgJ2JjY1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgJ0JjY1JlY2lwaWVudHMnLFxyXG4gICAgJ2JjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcclxuICAgICdiY2NSZWNpcGllbnROYW1lJzogICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXHJcbiAgICAnaXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnOiAnSXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnLFxyXG4gICAgJ2lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnOiAgICAgJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxyXG4gICAgJ2hhc0F0dGFjaG1lbnRzJzogICAgICAgICAgICAgJ0hhc0F0dGFjaG1lbnRzJyxcclxuICAgICdpc0RyYWZ0JzogICAgICAgICAgICAgICAgICAgICdJc0RyYWZ0JyxcclxuICAgICdpc1JlYWQnOiAgICAgICAgICAgICAgICAgICAgICdJc1JlYWQnXHJcbiAgfVxyXG5cclxuXHJcbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKHVzZXJQcm9maWxlcywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XHJcblxyXG4gICAgY29uc3QgeyBmaWVsZE5hbWVNYXAgfSA9IHRoaXMuY29uc3RydWN0b3IsXHJcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzICAgPSB7XHJcbiAgICAgICAgICAgIHVzZXJQcm9maWxlcyxcclxuICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKClcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgdHJ5IHtcclxuXHJcbiAgICAgIGNvbnN0IGVtYWlsRGF0YSA9IGF3YWl0KiB1c2VyUHJvZmlsZXMubWFwKHVzZXJQcm9maWxlID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRVc2VyRGF0YSh7XHJcbiAgICAgICAgICB1c2VyUHJvZmlsZSxcclxuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgICAgIGZpbHRlckVuZERhdGUsXHJcbiAgICAgICAgICBhZGRpdGlvbmFsRmllbGRzLFxyXG4gICAgICAgICAgYXBpVHlwZTogICdtZXNzYWdlcycsXHJcbiAgICAgICAgICAkZmlsdGVyOiAgYCBJc0RyYWZ0IGVxIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBEYXRlVGltZVNlbnQgZ2UgJHtmaWx0ZXJTdGFydERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVTZW50IGx0ICR7ZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XHJcbiAgICAgICAgICAgICAgICAgICAgYC5yZXBsYWNlKC9cXHMrL2csICcgJylcclxuICAgICAgICAgICAgICAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIHJlcGxhY2UgZGF0YSBrZXlzIHdpdGggZGVzaXJlZCBtYXBwaW5ncy4uLlxyXG4gICAgICBjb25zdCByZXN1bHRzID0gXy5tYXAoZW1haWxEYXRhLCB1c2VyID0+IHtcclxuICAgICAgICBjb25zdCBlbWFpbEFycmF5ID0gKHVzZXIuc3VjY2VzcyAmJiB1c2VyLmRhdGEpIHx8IFtdO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAuLi51c2VyLnVzZXJQcm9maWxlLFxyXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlOiAgdXNlci5maWx0ZXJTdGFydERhdGUsXHJcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlOiAgICB1c2VyLmZpbHRlckVuZERhdGUsXHJcbiAgICAgICAgICBzdWNjZXNzOiAgICAgICAgICB1c2VyLnN1Y2Nlc3MsXHJcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICAgICB1c2VyLmVycm9yTWVzc2FnZSxcclxuICAgICAgICAgIC8vIG1hcCBkYXRhIHdpdGggZGVzaXJlZCBrZXkgbmFtZXMuLi5cclxuICAgICAgICAgIGRhdGE6IF8ubWFwKGVtYWlsQXJyYXksIG9yaWdpbmFsRW1haWxNZXNzYWdlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWFwcGVkRW1haWxNZXNzYWdlID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBjaGFuZ2UgdG8gZGVzaXJlZCBuYW1lc1xyXG4gICAgICAgICAgICBfLmVhY2goZmllbGROYW1lTWFwLCAoaGF2ZSwgd2FudCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRW1haWxNZXNzYWdlLCBoYXZlKTtcclxuICAgICAgICAgICAgICBpZiAobWFwcGVkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZVt3YW50XSA9IC9eZGF0ZVRpbWUvLnRlc3Qod2FudCkgPyBuZXcgRGF0ZShtYXBwZWQpIDogbWFwcGVkO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFiIGluZm8gZnJvbSBkaWZmZXJlbnQgY29ycmVzcG9uZGVudCB0eXBlcy4uLlxyXG4gICAgICAgICAgICAvLyAoc2luY2Ugd2UncmUgdXNpbmcgYW4gYXJyYXkgbGl0ZXJhbCBoZXJlLCAnZm9yIG9mJyBzeW50YXggd2lsbCBjb21waWxlIHJlYXNvbmFibHkpXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3RvJywgJ2NjJywgJ2JjYyddKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7dHlwZX1SZWNpcGllbnRgO1xyXG4gICAgICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZVtgJHtrZXl9c2BdID0gb3JpZ2luYWxFbWFpbE1lc3NhZ2VbZmllbGROYW1lTWFwW2Ake2tleX1zYF1dXHJcbiAgICAgICAgICAgICAgICAubWFwKHJlY2lwaWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogXy5nZXQocmVjaXBpZW50LCBmaWVsZE5hbWVNYXBbYCR7a2V5fUFkZHJlc3NgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogICAgXy5nZXQocmVjaXBpZW50LCBmaWVsZE5hbWVNYXBbYCR7a2V5fU5hbWVgXSlcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtYXBwZWRFbWFpbE1lc3NhZ2U7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gcmV0dXJuIHJlc3VsdHMgYW5kIHN1Y2Nlc3MhXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cyxcclxuICAgICAgICByZXN1bHRzLFxyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWVcclxuICAgICAgfTtcclxuXHJcbiAgICB9IGNhdGNoIChlcnJvck1lc3NhZ2UpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcclxuICAgICAgY29uc29sZS5sb2coJ09mZmljZTM2NSBHZXRCYXRjaERhdGEgRXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvck1lc3NhZ2UpKTtcclxuICAgICAgcmV0dXJuIHsgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cywgZXJyb3JNZXNzYWdlIH07XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn1cclxuIl19
//# sourceMappingURL=index.js.map
