'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _Adapter = require('../base/Adapter');

var _Adapter2 = _interopRequireDefault(_Adapter);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Office 365 Mail adapter
 */
var Office365MailAdapter = (_temp = _class = function (_Office365BaseAdapter) {
  (0, _inherits3.default)(Office365MailAdapter, _Office365BaseAdapter);

  function Office365MailAdapter() {
    (0, _classCallCheck3.default)(this, Office365MailAdapter);
    return (0, _possibleConstructorReturn3.default)(this, (Office365MailAdapter.__proto__ || (0, _getPrototypeOf2.default)(Office365MailAdapter)).apply(this, arguments));
  }

  (0, _createClass3.default)(Office365MailAdapter, [{
    key: 'getBatchData',


    // collect these fields always...
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(userProfiles, filterStartDate, filterEndDate, additionalFields) {
        var _this2 = this;

        var fieldNameMap, dataAdapterRunStats, emailData, results;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fieldNameMap = this.constructor.fieldNameMap, dataAdapterRunStats = {
                  userProfiles: userProfiles,
                  filterStartDate: filterStartDate,
                  filterEndDate: filterEndDate,
                  success: false,
                  runDate: (0, _moment2.default)().utc().toDate()
                };
                _context.prev = 1;
                _context.next = 4;
                return _promise2.default.all(userProfiles.map(function (userProfile) {
                  return _this2.getUserData({
                    userProfile: userProfile,
                    filterStartDate: filterStartDate,
                    filterEndDate: filterEndDate,
                    additionalFields: additionalFields,
                    apiType: 'messages',
                    $filter: (' IsDraft eq false\n                        and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                        and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                    ').replace(/\s+/g, ' ').trim()
                  });
                }));

              case 4:
                emailData = _context.sent;


                // replace data keys with desired mappings...
                results = _.map(emailData, function (user) {
                  var emailArray = user.success && user.data || [];
                  return (0, _extends3.default)({}, user.userProfile, {
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

                return _context.abrupt('return', (0, _extends3.default)({}, dataAdapterRunStats, {
                  results: results,
                  success: true
                }));

              case 9:
                _context.prev = 9;
                _context.t0 = _context['catch'](1);

                console.log(_context.t0.stack);
                console.log('Office365 GetBatchData Error: ' + (0, _stringify2.default)(_context.t0));
                return _context.abrupt('return', (0, _extends3.default)({}, dataAdapterRunStats, { errorMessage: _context.t0 }));

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 9]]);
      }));

      function getBatchData(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return getBatchData;
    }()

    // convert the names of the api response data

  }]);
  return Office365MailAdapter;
}(_Adapter2.default), _class.baseFields = ['Id', 'Categories', 'DateTimeCreated', 'Subject', 'Importance', 'HasAttachments', 'ParentFolderId', 'From', 'Sender', 'ToRecipients', 'CcRecipients', 'BccRecipients', 'ReplyTo', 'ConversationId', 'DateTimeReceived', 'DateTimeSent', 'IsDeliveryReceiptRequested', 'IsReadReceiptRequested', 'IsRead'], _class.fieldNameMap = {
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
}, _temp);
exports.default = Office365MailAdapter;
//# sourceMappingURL=../../../clAdapters/office365/mail/index.js.map