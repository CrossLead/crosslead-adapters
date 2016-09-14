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
      'isRead': 'IsRead',
      'attachments': 'attachments'
    },
    enumerable: true
  }]);

  return Office365MailAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365MailAdapter;
module.exports = exports['default'];

// replace data keys with desired mappings...

// return results and success!
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L21haWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFBdUMsUUFBUTs7OztzQkFDUixRQUFROzs7OzJCQUNSLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBOERyQixzQkFBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7VUFFdkUsWUFBWSxFQUNkLG1CQUFtQixFQVVqQixTQUFTLEVBZ0JULE9BQU87Ozs7OztBQTNCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QiwwQkFBWSxFQUFaLFlBQVk7QUFDWiw2QkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBYSxFQUFiLGFBQWE7QUFDYixxQkFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO2FBQ2pDOzs7MERBSW9CLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDdkQscUJBQU8sTUFBSyxXQUFXLENBQUM7QUFDdEIsMkJBQVcsRUFBWCxXQUFXO0FBQ1gsK0JBQWUsRUFBZixlQUFlO0FBQ2YsNkJBQWEsRUFBYixhQUFhO0FBQ2IsZ0NBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBTyxFQUFHLFVBQVU7QUFDcEIsdUJBQU8sRUFBRyxxRUFDMEIsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLHNEQUM5QyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsNkJBQ3BFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxD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QUFVLEVBQW9CLGdCQUFnQjtBQUM5QyxrQkFBWSxFQUFrQixZQUFZO0FBQzFDLG1CQUFhLEVBQWlCLGtCQUFrQjtBQUNoRCxlQUFTLEVBQXFCLFNBQVM7QUFDdkMsbUJBQWEsRUFBaUIsYUFBYTtBQUMzQyxZQUFNLEVBQXdCLGNBQWM7QUFDNUMsbUJBQWEsRUFBaUIsMkJBQTJCO0FBQ3pELGdCQUFVLEVBQW9CLHdCQUF3QjtBQUN0RCxvQkFBYyxFQUFnQixjQUFjO0FBQzVDLDBCQUFvQixFQUFVLHNCQUFzQjtBQUNwRCx1QkFBaUIsRUFBYSxtQkFBbUI7QUFDakQsb0JBQWMsRUFBZ0IsY0FBYztBQUM1QywwQkFBb0IsRUFBVSxzQkFBc0I7QUFDcEQsdUJBQWlCLEVBQWEsbUJBQW1CO0FBQ2pELHFCQUFlLEVBQWUsZUFBZTtBQUM3QywyQkFBcUIsRUFBUyxzQkFBc0I7QUFDcEQsd0JBQWtCLEVBQVksbUJBQW1CO0FBQ2pELGtDQUE0QixFQUFFLDRCQUE0QjtBQUMxRCw4QkFBd0IsRUFBTSx3QkFBd0I7QUFDdEQsc0JBQWdCLEVBQWMsZ0JBQWdCO0FBQzlDLGVBQVMsRUFBcUIsU0FBUztBQUN2QyxjQUFRLEVBQXNCLFFBQVE7QUFDdEMsbUJBQWEsRUFBaUIsYUFBYTtLQUM1Qzs7OztTQTNEa0Isb0JBQW9COzs7cUJBQXBCLG9CQUFvQiIsImZpbGUiOiJjbEFkYXB0ZXJzL29mZmljZTM2NS9tYWlsL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgXyAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbG9kYXNoJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlQWRhcHRlciAgICAgICBmcm9tICcuLi9iYXNlL0FkYXB0ZXInO1xuXG5cbi8qKlxuICogT2ZmaWNlIDM2NSBNYWlsIGFkYXB0ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2ZmaWNlMzY1TWFpbEFkYXB0ZXIgZXh0ZW5kcyBPZmZpY2UzNjVCYXNlQWRhcHRlciB7XG5cblxuICAvLyBjb2xsZWN0IHRoZXNlIGZpZWxkcyBhbHdheXMuLi5cbiAgc3RhdGljIGJhc2VGaWVsZHMgPSBbXG4gICAgJ0lkJyxcbiAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXG4gICAgJ1N1YmplY3QnLFxuICAgICdJbXBvcnRhbmNlJyxcbiAgICAnSGFzQXR0YWNobWVudHMnLFxuICAgICdQYXJlbnRGb2xkZXJJZCcsXG4gICAgJ0Zyb20nLFxuICAgICdTZW5kZXInLFxuICAgICdUb1JlY2lwaWVudHMnLFxuICAgICdDY1JlY2lwaWVudHMnLFxuICAgICdCY2NSZWNpcGllbnRzJyxcbiAgICAnUmVwbHlUbycsXG4gICAgJ0NvbnZlcnNhdGlvbklkJyxcbiAgICAnRGF0ZVRpbWVSZWNlaXZlZCcsXG4gICAgJ0RhdGVUaW1lU2VudCcsXG4gICAgJ0lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ0lzUmVhZCdcbiAgXVxuXG5cbiAgLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXG4gIHN0YXRpYyBmaWVsZE5hbWVNYXAgPSB7XG4gICAgLy8gRGVzaXJlZC4uLiAgICAgICAgICAgICAgICAgLy8gR2l2ZW4uLi5cbiAgICAnZW1haWxzJzogICAgICAgICAgICAgICAgICAgICAndmFsdWUnLFxuICAgICdtZXNzYWdlSWQnOiAgICAgICAgICAgICAgICAgICdJZCcsXG4gICAgJ2NvbnZlcnNhdGlvbklkJzogICAgICAgICAgICAgJ0NvbnZlcnNhdGlvbklkJyxcbiAgICAnZGF0ZVRpbWVTZW50JzogICAgICAgICAgICAgICAnRGF0ZVRpbWVTZW50JyxcbiAgICAnZGF0ZVRpbWVSZWNlaXZlZCc6ICAgICAgICAgICAnRGF0ZVRpbWVSZWNlaXZlZCcsXG4gICAgJ2ltcG9ydGFuY2UnOiAgICAgICAgICAgICAgICAgJ0ltcG9ydGFuY2UnLFxuICAgICdmb2xkZXJJZCc6ICAgICAgICAgICAgICAgICAgICdQYXJlbnRGb2xkZXJJZCcsXG4gICAgJ2NhdGVnb3JpZXMnOiAgICAgICAgICAgICAgICAgJ0NhdGVnb3JpZXMnLFxuICAgICdjb250ZW50VHlwZSc6ICAgICAgICAgICAgICAgICdCb2R5LkNvbnRlbnRUeXBlJyxcbiAgICAnc3ViamVjdCc6ICAgICAgICAgICAgICAgICAgICAnU3ViamVjdCcsXG4gICAgJ2JvZHlQcmV2aWV3JzogICAgICAgICAgICAgICAgJ0JvZHlQcmV2aWV3JyxcbiAgICAnYm9keSc6ICAgICAgICAgICAgICAgICAgICAgICAnQm9keS5Db250ZW50JyxcbiAgICAnZnJvbUFkZHJlc3MnOiAgICAgICAgICAgICAgICAnRnJvbS5FbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2Zyb21OYW1lJzogICAgICAgICAgICAgICAgICAgJ0Zyb20uRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICd0b1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgICdUb1JlY2lwaWVudHMnLFxuICAgICd0b1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ3RvUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnY2NSZWNpcGllbnRzJzogICAgICAgICAgICAgICAnQ2NSZWNpcGllbnRzJyxcbiAgICAnY2NSZWNpcGllbnRBZGRyZXNzJzogICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdjY1JlY2lwaWVudE5hbWUnOiAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2JjY1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgJ0JjY1JlY2lwaWVudHMnLFxuICAgICdiY2NSZWNpcGllbnRBZGRyZXNzJzogICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2JjY1JlY2lwaWVudE5hbWUnOiAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnaXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnOiAnSXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdpc1JlYWRSZWNlaXB0UmVxdWVzdGVkJzogICAgICdJc1JlYWRSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnaGFzQXR0YWNobWVudHMnOiAgICAgICAgICAgICAnSGFzQXR0YWNobWVudHMnLFxuICAgICdpc0RyYWZ0JzogICAgICAgICAgICAgICAgICAgICdJc0RyYWZ0JyxcbiAgICAnaXNSZWFkJzogICAgICAgICAgICAgICAgICAgICAnSXNSZWFkJyxcbiAgICAnYXR0YWNobWVudHMnOiAgICAgICAgICAgICAgICAnYXR0YWNobWVudHMnLCBcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKHVzZXJQcm9maWxlcywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XG5cbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzICAgPSB7XG4gICAgICAgICAgICB1c2VyUHJvZmlsZXMsXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICAgIH07XG5cbiAgICB0cnkge1xuXG4gICAgICBjb25zdCBlbWFpbERhdGEgPSBhd2FpdCogdXNlclByb2ZpbGVzLm1hcCh1c2VyUHJvZmlsZSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVzZXJEYXRhKHtcbiAgICAgICAgICB1c2VyUHJvZmlsZSxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgICAgIGFwaVR5cGU6ICAnbWVzc2FnZXMnLFxuICAgICAgICAgICRmaWx0ZXI6ICBgIElzRHJhZnQgZXEgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBEYXRlVGltZVNlbnQgZ2UgJHtmaWx0ZXJTdGFydERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lU2VudCBsdCAke2ZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxuICAgICAgICAgICAgICAgICAgICBgLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgICAgICAgICAgICAgICAgLnRyaW0oKVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyByZXBsYWNlIGRhdGEga2V5cyB3aXRoIGRlc2lyZWQgbWFwcGluZ3MuLi5cbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBfLm1hcChlbWFpbERhdGEsIHVzZXIgPT4ge1xuICAgICAgICBjb25zdCBlbWFpbEFycmF5ID0gKHVzZXIuc3VjY2VzcyAmJiB1c2VyLmRhdGEpIHx8IFtdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnVzZXIudXNlclByb2ZpbGUsXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlOiAgdXNlci5maWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZTogICAgdXNlci5maWx0ZXJFbmREYXRlLFxuICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgICAgIHVzZXIuc3VjY2VzcyxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICAgICB1c2VyLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAvLyBtYXAgZGF0YSB3aXRoIGRlc2lyZWQga2V5IG5hbWVzLi4uXG4gICAgICAgICAgZGF0YTogXy5tYXAoZW1haWxBcnJheSwgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFwcGVkRW1haWxNZXNzYWdlID0ge307XG5cbiAgICAgICAgICAgIC8vIGNoYW5nZSB0byBkZXNpcmVkIG5hbWVzXG4gICAgICAgICAgICBfLmVhY2goZmllbGROYW1lTWFwLCAoaGF2ZSwgd2FudCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBtYXBwZWQgPSBfLmdldChvcmlnaW5hbEVtYWlsTWVzc2FnZSwgaGF2ZSk7XG4gICAgICAgICAgICAgIGlmIChtYXBwZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZVt3YW50XSA9IC9eZGF0ZVRpbWUvLnRlc3Qod2FudCkgPyBuZXcgRGF0ZShtYXBwZWQpIDogbWFwcGVkO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ3JhYiBpbmZvIGZyb20gZGlmZmVyZW50IGNvcnJlc3BvbmRlbnQgdHlwZXMuLi5cbiAgICAgICAgICAgIC8vIChzaW5jZSB3ZSdyZSB1c2luZyBhbiBhcnJheSBsaXRlcmFsIGhlcmUsICdmb3Igb2YnIHN5bnRheCB3aWxsIGNvbXBpbGUgcmVhc29uYWJseSlcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ3RvJywgJ2NjJywgJ2JjYyddKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3R5cGV9UmVjaXBpZW50YDtcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW2Ake2tleX1zYF0gPSBvcmlnaW5hbEVtYWlsTWVzc2FnZVtmaWVsZE5hbWVNYXBbYCR7a2V5fXNgXV1cbiAgICAgICAgICAgICAgICAubWFwKHJlY2lwaWVudCA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBfLmdldChyZWNpcGllbnQsIGZpZWxkTmFtZU1hcFtgJHtrZXl9QWRkcmVzc2BdKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogICAgXy5nZXQocmVjaXBpZW50LCBmaWVsZE5hbWVNYXBbYCR7a2V5fU5hbWVgXSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hcHBlZEVtYWlsTWVzc2FnZTtcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHJldHVybiByZXN1bHRzIGFuZCBzdWNjZXNzIVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cyxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcbiAgICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3JNZXNzYWdlKSk7XG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcbiAgICB9XG5cbiAgfVxuXG59XG4iXX0=
//# sourceMappingURL=index.js.map
