import moment from 'moment';
import * as _ from 'lodash';
import Office365BaseAdapter from '../base/Adapter';

/**
 * Office 365 Mail adapter
 */

var Office365MailAdapter = function (_Office365BaseAdapter) {
  babelHelpers.inherits(Office365MailAdapter, _Office365BaseAdapter);

  function Office365MailAdapter() {
    babelHelpers.classCallCheck(this, Office365MailAdapter);
    return babelHelpers.possibleConstructorReturn(this, (Office365MailAdapter.__proto__ || Object.getPrototypeOf(Office365MailAdapter)).apply(this, arguments));
  }

  babelHelpers.createClass(Office365MailAdapter, [{
    key: 'getBatchData',


    // collect these fields always...
    value: function () {
      var _ref = babelHelpers.asyncToGenerator(regeneratorRuntime.mark(function _callee(userProfiles, filterStartDate, filterEndDate, additionalFields) {
        var _this2 = this;

        var fieldNameMap, dataAdapterRunStats, emailData, results;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fieldNameMap = this.constructor.fieldNameMap;
                dataAdapterRunStats = {
                  userProfiles: userProfiles,
                  filterStartDate: filterStartDate,
                  filterEndDate: filterEndDate,
                  success: false,
                  runDate: moment().utc().toDate()
                };
                _context.prev = 2;
                _context.next = 5;
                return Promise.all(userProfiles.map(function (userProfile) {
                  return _this2.getUserData({
                    userProfile: userProfile,
                    filterStartDate: filterStartDate,
                    filterEndDate: filterEndDate,
                    additionalFields: additionalFields,
                    apiType: 'messages',
                    $filter: (' IsDraft eq false\n                        and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                        and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                    ').replace(/\s+/g, ' ').trim()
                  });
                }));

              case 5:
                emailData = _context.sent;


                // replace data keys with desired mappings...
                results = _.map(emailData, function (user) {
                  var emailArray = user.success && user.data || [];
                  return babelHelpers.extends({}, user.userProfile, {
                    filterStartDate: user.filterStartDate,
                    filterEndDate: user.filterEndDate,
                    success: user.success,
                    errorMessage: user.errorMessage,
                    // map data with desired key names...
                    data: _.map(emailArray, function (originalEmailMessage) {
                      var mappedEmailMessage = {};

                      // change to desired names
                      _.each(fieldNameMap, function (have, want) {
                        var mapped = _.get(originalEmailMessage, have);
                        if (mapped !== undefined) {
                          mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                        }
                      });

                      // grab info from different correspondent types...
                      // (since we're using an array literal here, 'for of' syntax will compile reasonably)
                      var _arr = ['to', 'cc', 'bcc'];

                      var _loop = function _loop() {
                        var type = _arr[_i];
                        var key = type + 'Recipient';
                        mappedEmailMessage[key + 's'] = originalEmailMessage[fieldNameMap[key + 's']].map(function (recipient) {
                          return {
                            address: _.get(recipient, fieldNameMap[key + 'Address']),
                            name: _.get(recipient, fieldNameMap[key + 'Name'])
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

                // return results and success!

                return _context.abrupt('return', babelHelpers.extends({}, dataAdapterRunStats, {
                  results: results,
                  success: true
                }));

              case 10:
                _context.prev = 10;
                _context.t0 = _context['catch'](2);

                console.log(_context.t0.stack);
                console.log('Office365 GetBatchData Error: ' + JSON.stringify(_context.t0));
                return _context.abrupt('return', babelHelpers.extends({}, dataAdapterRunStats, { errorMessage: _context.t0 }));

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 10]]);
      }));

      function getBatchData(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return getBatchData;
    }()

    // convert the names of the api response data

  }]);
  return Office365MailAdapter;
}(Office365BaseAdapter);

Office365MailAdapter.baseFields = ['Id', 'Categories', 'DateTimeCreated', 'Subject', 'Importance', 'HasAttachments', 'ParentFolderId', 'From', 'Sender', 'ToRecipients', 'CcRecipients', 'BccRecipients', 'ReplyTo', 'ConversationId', 'DateTimeReceived', 'DateTimeSent', 'IsDeliveryReceiptRequested', 'IsReadReceiptRequested', 'IsRead'];
Office365MailAdapter.fieldNameMap = {
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
};
export default Office365MailAdapter;
//# sourceMappingURL=../../../clAdapters/office365/mail/index.js.map