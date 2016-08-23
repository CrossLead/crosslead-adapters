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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcbWFpbFxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFBdUMsUUFBUTs7OztzQkFDUixRQUFROzs7OzJCQUNSLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBOERyQixzQkFBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0I7VUFFdkUsWUFBWSxFQUNkLG1CQUFtQixFQVVqQixTQUFTLEVBZ0JULE9BQU87Ozs7OztBQTNCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QiwwQkFBWSxFQUFaLFlBQVk7QUFDWiw2QkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBYSxFQUFiLGFBQWE7QUFDYixxQkFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO2FBQ2pDOzs7MERBSW9CLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDdkQscUJBQU8sTUFBSyxXQUFXLENBQUM7QUFDdEIsMkJBQVcsRUFBWCxXQUFXO0FBQ1gsK0JBQWUsRUFBZixlQUFlO0FBQ2YsNkJBQWEsRUFBYixhQUFhO0FBQ2IsZ0NBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBTyxFQUFHLFVBQVU7QUFDcEIsdUJBQU8sRUFBRyxxRUFDMEIsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLHNEQUM5QyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsNkJBQ3BFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FB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LGdCQUFVLEVBQW9CLGdCQUFnQjtBQUM5QyxrQkFBWSxFQUFrQixZQUFZO0FBQzFDLG1CQUFhLEVBQWlCLGtCQUFrQjtBQUNoRCxlQUFTLEVBQXFCLFNBQVM7QUFDdkMsbUJBQWEsRUFBaUIsYUFBYTtBQUMzQyxZQUFNLEVBQXdCLGNBQWM7QUFDNUMsbUJBQWEsRUFBaUIsMkJBQTJCO0FBQ3pELGdCQUFVLEVBQW9CLHdCQUF3QjtBQUN0RCxvQkFBYyxFQUFnQixjQUFjO0FBQzVDLDBCQUFvQixFQUFVLHNCQUFzQjtBQUNwRCx1QkFBaUIsRUFBYSxtQkFBbUI7QUFDakQsb0JBQWMsRUFBZ0IsY0FBYztBQUM1QywwQkFBb0IsRUFBVSxzQkFBc0I7QUFDcEQsdUJBQWlCLEVBQWEsbUJBQW1CO0FBQ2pELHFCQUFlLEVBQWUsZUFBZTtBQUM3QywyQkFBcUIsRUFBUyxzQkFBc0I7QUFDcEQsd0JBQWtCLEVBQVksbUJBQW1CO0FBQ2pELGtDQUE0QixFQUFFLDRCQUE0QjtBQUMxRCw4QkFBd0IsRUFBTSx3QkFBd0I7QUFDdEQsc0JBQWdCLEVBQWMsZ0JBQWdCO0FBQzlDLGVBQVMsRUFBcUIsU0FBUztBQUN2QyxjQUFRLEVBQXNCLFFBQVE7QUFDdEMsbUJBQWEsRUFBaUIsYUFBYTtLQUM1Qzs7OztTQTNEa0Isb0JBQW9COzs7cUJBQXBCLG9CQUFvQiIsImZpbGUiOiJjbEFkYXB0ZXJzXFxvZmZpY2UzNjVcXG1haWxcXGluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XHJcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgICAgICAgZnJvbSAnLi4vYmFzZS9BZGFwdGVyJztcclxuXHJcblxyXG4vKipcclxuICogT2ZmaWNlIDM2NSBNYWlsIGFkYXB0ZXJcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NU1haWxBZGFwdGVyIGV4dGVuZHMgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIge1xyXG5cclxuXHJcbiAgLy8gY29sbGVjdCB0aGVzZSBmaWVsZHMgYWx3YXlzLi4uXHJcbiAgc3RhdGljIGJhc2VGaWVsZHMgPSBbXHJcbiAgICAnSWQnLFxyXG4gICAgJ0NhdGVnb3JpZXMnLFxyXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXHJcbiAgICAnU3ViamVjdCcsXHJcbiAgICAnSW1wb3J0YW5jZScsXHJcbiAgICAnSGFzQXR0YWNobWVudHMnLFxyXG4gICAgJ1BhcmVudEZvbGRlcklkJyxcclxuICAgICdGcm9tJyxcclxuICAgICdTZW5kZXInLFxyXG4gICAgJ1RvUmVjaXBpZW50cycsXHJcbiAgICAnQ2NSZWNpcGllbnRzJyxcclxuICAgICdCY2NSZWNpcGllbnRzJyxcclxuICAgICdSZXBseVRvJyxcclxuICAgICdDb252ZXJzYXRpb25JZCcsXHJcbiAgICAnRGF0ZVRpbWVSZWNlaXZlZCcsXHJcbiAgICAnRGF0ZVRpbWVTZW50JyxcclxuICAgICdJc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCcsXHJcbiAgICAnSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCcsXHJcbiAgICAnSXNSZWFkJ1xyXG4gIF1cclxuXHJcblxyXG4gIC8vIGNvbnZlcnQgdGhlIG5hbWVzIG9mIHRoZSBhcGkgcmVzcG9uc2UgZGF0YVxyXG4gIHN0YXRpYyBmaWVsZE5hbWVNYXAgPSB7XHJcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxyXG4gICAgJ2VtYWlscyc6ICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJyxcclxuICAgICdtZXNzYWdlSWQnOiAgICAgICAgICAgICAgICAgICdJZCcsXHJcbiAgICAnY29udmVyc2F0aW9uSWQnOiAgICAgICAgICAgICAnQ29udmVyc2F0aW9uSWQnLFxyXG4gICAgJ2RhdGVUaW1lU2VudCc6ICAgICAgICAgICAgICAgJ0RhdGVUaW1lU2VudCcsXHJcbiAgICAnZGF0ZVRpbWVSZWNlaXZlZCc6ICAgICAgICAgICAnRGF0ZVRpbWVSZWNlaXZlZCcsXHJcbiAgICAnaW1wb3J0YW5jZSc6ICAgICAgICAgICAgICAgICAnSW1wb3J0YW5jZScsXHJcbiAgICAnZm9sZGVySWQnOiAgICAgICAgICAgICAgICAgICAnUGFyZW50Rm9sZGVySWQnLFxyXG4gICAgJ2NhdGVnb3JpZXMnOiAgICAgICAgICAgICAgICAgJ0NhdGVnb3JpZXMnLFxyXG4gICAgJ2NvbnRlbnRUeXBlJzogICAgICAgICAgICAgICAgJ0JvZHkuQ29udGVudFR5cGUnLFxyXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgJ1N1YmplY3QnLFxyXG4gICAgJ2JvZHlQcmV2aWV3JzogICAgICAgICAgICAgICAgJ0JvZHlQcmV2aWV3JyxcclxuICAgICdib2R5JzogICAgICAgICAgICAgICAgICAgICAgICdCb2R5LkNvbnRlbnQnLFxyXG4gICAgJ2Zyb21BZGRyZXNzJzogICAgICAgICAgICAgICAgJ0Zyb20uRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxyXG4gICAgJ2Zyb21OYW1lJzogICAgICAgICAgICAgICAgICAgJ0Zyb20uRW1haWxBZGRyZXNzLk5hbWUnLFxyXG4gICAgJ3RvUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAgJ1RvUmVjaXBpZW50cycsXHJcbiAgICAndG9SZWNpcGllbnRBZGRyZXNzJzogICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxyXG4gICAgJ3RvUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcclxuICAgICdjY1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgICdDY1JlY2lwaWVudHMnLFxyXG4gICAgJ2NjUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcclxuICAgICdjY1JlY2lwaWVudE5hbWUnOiAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXHJcbiAgICAnYmNjUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAnQmNjUmVjaXBpZW50cycsXHJcbiAgICAnYmNjUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxyXG4gICAgJ2JjY1JlY2lwaWVudE5hbWUnOiAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcclxuICAgICdpc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCc6ICdJc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCcsXHJcbiAgICAnaXNSZWFkUmVjZWlwdFJlcXVlc3RlZCc6ICAgICAnSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCcsXHJcbiAgICAnaGFzQXR0YWNobWVudHMnOiAgICAgICAgICAgICAnSGFzQXR0YWNobWVudHMnLFxyXG4gICAgJ2lzRHJhZnQnOiAgICAgICAgICAgICAgICAgICAgJ0lzRHJhZnQnLFxyXG4gICAgJ2lzUmVhZCc6ICAgICAgICAgICAgICAgICAgICAgJ0lzUmVhZCcsXHJcbiAgICAnYXR0YWNobWVudHMnOiAgICAgICAgICAgICAgICAnYXR0YWNobWVudHMnLCBcclxuICB9XHJcblxyXG5cclxuICBhc3luYyBnZXRCYXRjaERhdGEodXNlclByb2ZpbGVzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcclxuXHJcbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMgICA9IHtcclxuICAgICAgICAgICAgdXNlclByb2ZpbGVzLFxyXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXHJcbiAgICAgICAgICAgIGZpbHRlckVuZERhdGUsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgY29uc3QgZW1haWxEYXRhID0gYXdhaXQqIHVzZXJQcm9maWxlcy5tYXAodXNlclByb2ZpbGUgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFVzZXJEYXRhKHtcclxuICAgICAgICAgIHVzZXJQcm9maWxlLFxyXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgICAgIGFkZGl0aW9uYWxGaWVsZHMsXHJcbiAgICAgICAgICBhcGlUeXBlOiAgJ21lc3NhZ2VzJyxcclxuICAgICAgICAgICRmaWx0ZXI6ICBgIElzRHJhZnQgZXEgZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lU2VudCBnZSAke2ZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBEYXRlVGltZVNlbnQgbHQgJHtmaWx0ZXJFbmREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKX1cclxuICAgICAgICAgICAgICAgICAgICBgLnJlcGxhY2UoL1xccysvZywgJyAnKVxyXG4gICAgICAgICAgICAgICAgICAgICAudHJpbSgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gcmVwbGFjZSBkYXRhIGtleXMgd2l0aCBkZXNpcmVkIG1hcHBpbmdzLi4uXHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBfLm1hcChlbWFpbERhdGEsIHVzZXIgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVtYWlsQXJyYXkgPSAodXNlci5zdWNjZXNzICYmIHVzZXIuZGF0YSkgfHwgW107XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIC4uLnVzZXIudXNlclByb2ZpbGUsXHJcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGU6ICB1c2VyLmZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgICAgIGZpbHRlckVuZERhdGU6ICAgIHVzZXIuZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgICAgIHVzZXIuc3VjY2VzcyxcclxuICAgICAgICAgIGVycm9yTWVzc2FnZTogICAgIHVzZXIuZXJyb3JNZXNzYWdlLFxyXG4gICAgICAgICAgLy8gbWFwIGRhdGEgd2l0aCBkZXNpcmVkIGtleSBuYW1lcy4uLlxyXG4gICAgICAgICAgZGF0YTogXy5tYXAoZW1haWxBcnJheSwgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtYXBwZWRFbWFpbE1lc3NhZ2UgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNoYW5nZSB0byBkZXNpcmVkIG5hbWVzXHJcbiAgICAgICAgICAgIF8uZWFjaChmaWVsZE5hbWVNYXAsIChoYXZlLCB3YW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbWFwcGVkID0gXy5nZXQob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIGhhdmUpO1xyXG4gICAgICAgICAgICAgIGlmIChtYXBwZWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW3dhbnRdID0gL15kYXRlVGltZS8udGVzdCh3YW50KSA/IG5ldyBEYXRlKG1hcHBlZCkgOiBtYXBwZWQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWIgaW5mbyBmcm9tIGRpZmZlcmVudCBjb3JyZXNwb25kZW50IHR5cGVzLi4uXHJcbiAgICAgICAgICAgIC8vIChzaW5jZSB3ZSdyZSB1c2luZyBhbiBhcnJheSBsaXRlcmFsIGhlcmUsICdmb3Igb2YnIHN5bnRheCB3aWxsIGNvbXBpbGUgcmVhc29uYWJseSlcclxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIFsndG8nLCAnY2MnLCAnYmNjJ10pIHtcclxuICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHt0eXBlfVJlY2lwaWVudGA7XHJcbiAgICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW2Ake2tleX1zYF0gPSBvcmlnaW5hbEVtYWlsTWVzc2FnZVtmaWVsZE5hbWVNYXBbYCR7a2V5fXNgXV1cclxuICAgICAgICAgICAgICAgIC5tYXAocmVjaXBpZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBfLmdldChyZWNpcGllbnQsIGZpZWxkTmFtZU1hcFtgJHtrZXl9QWRkcmVzc2BdKSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAgICBfLmdldChyZWNpcGllbnQsIGZpZWxkTmFtZU1hcFtgJHtrZXl9TmFtZWBdKVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1hcHBlZEVtYWlsTWVzc2FnZTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyByZXR1cm4gcmVzdWx0cyBhbmQgc3VjY2VzcyFcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxyXG4gICAgICAgIHJlc3VsdHMsXHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxyXG4gICAgICB9O1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2Uuc3RhY2spO1xyXG4gICAgICBjb25zb2xlLmxvZygnT2ZmaWNlMzY1IEdldEJhdGNoRGF0YSBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycm9yTWVzc2FnZSkpO1xyXG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufVxyXG4iXX0=
//# sourceMappingURL=index.js.map
