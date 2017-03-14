"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const _ = require("lodash");
const Adapter_1 = require("../base/Adapter");
/**
 * Office 365 Mail adapter
 */
class Office365MailAdapter extends Adapter_1.default {
    getBatchData(userProfiles, filterStartDate, filterEndDate, additionalFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fieldNameMap } = Office365MailAdapter, dataAdapterRunStats = {
                userProfiles,
                filterStartDate,
                filterEndDate,
                success: false,
                runDate: moment().utc().toDate()
            };
            try {
                const emailData = yield Promise.all(userProfiles.map(userProfile => {
                    return this.getUserData({
                        userProfile,
                        filterStartDate,
                        filterEndDate,
                        additionalFields,
                        apiType: 'messages',
                        $filter: ` IsDraft eq false
                        and DateTimeSent ge ${filterStartDate.toISOString().substring(0, 10)}
                        and DateTimeSent lt ${filterEndDate.toISOString().substring(0, 10)}
                    `.replace(/\s+/g, ' ')
                            .trim()
                    });
                }));
                // replace data keys with desired mappings...
                const results = _.map(emailData, (user) => {
                    const emailArray = (user.success && user.data) || [];
                    return Object.assign({}, user.userProfile, { filterStartDate: user.filterStartDate, filterEndDate: user.filterEndDate, success: user.success, errorMessage: user.errorMessage, 
                        // map data with desired key names...
                        data: _.map(emailArray, (originalEmailMessage) => {
                            const mappedEmailMessage = {};
                            // change to desired names
                            _.each(fieldNameMap, (have, want) => {
                                const mapped = _.get(originalEmailMessage, have);
                                if (mapped !== undefined) {
                                    mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                                }
                            });
                            // grab info from different correspondent types...
                            // (since we're using an array literal here, 'for of' syntax will compile reasonably)
                            for (const type of ['to', 'cc', 'bcc']) {
                                const key = `${type}Recipient`;
                                mappedEmailMessage[`${key}s`] = originalEmailMessage[fieldNameMap[`${key}s`]]
                                    .map((recipient) => {
                                    return {
                                        address: _.get(recipient, fieldNameMap[`${key}Address`]),
                                        name: _.get(recipient, fieldNameMap[`${key}Name`])
                                    };
                                });
                            }
                            return mappedEmailMessage;
                        }) });
                });
                // return results and success!
                return Object.assign({}, dataAdapterRunStats, { results, success: true });
            }
            catch (errorMessage) {
                console.log(errorMessage.stack);
                console.log('Office365 GetBatchData Error: ' + JSON.stringify(errorMessage));
                return Object.assign({}, dataAdapterRunStats, { errorMessage });
            }
        });
    }
}
// collect these fields always...
Office365MailAdapter.baseFields = [
    'Id',
    'Categories',
    'DateTimeCreated',
    'Subject',
    'Importance',
    'HasAttachments',
    'ParentFolderId',
    'From',
    'Sender',
    'ToRecipients',
    'CcRecipients',
    'BccRecipients',
    'ReplyTo',
    'ConversationId',
    'DateTimeReceived',
    'DateTimeSent',
    'IsDeliveryReceiptRequested',
    'IsReadReceiptRequested',
    'IsRead'
];
// convert the names of the api response data
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
    'attachments': 'attachments',
};
exports.default = Office365MailAdapter;
//# sourceMappingURL=index.js.map