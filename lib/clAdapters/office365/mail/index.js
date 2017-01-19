import moment                     from 'moment';
import * as _                          from 'lodash';
import Office365BaseAdapter       from '../base/Adapter';


/**
 * Office 365 Mail adapter
 */
export default class Office365MailAdapter extends Office365BaseAdapter {


  // collect these fields always...
  static baseFields = [
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
  static fieldNameMap = {
    // Desired...                 // Given...
    'emails':                     'value',
    'messageId':                  'Id',
    'conversationId':             'ConversationId',
    'dateTimeSent':               'DateTimeSent',
    'dateTimeReceived':           'DateTimeReceived',
    'importance':                 'Importance',
    'folderId':                   'ParentFolderId',
    'categories':                 'Categories',
    'contentType':                'Body.ContentType',
    'subject':                    'Subject',
    'bodyPreview':                'BodyPreview',
    'body':                       'Body.Content',
    'fromAddress':                'From.EmailAddress.Address',
    'fromName':                   'From.EmailAddress.Name',
    'toRecipients':               'ToRecipients',
    'toRecipientAddress':         'EmailAddress.Address',
    'toRecipientName':            'EmailAddress.Name',
    'ccRecipients':               'CcRecipients',
    'ccRecipientAddress':         'EmailAddress.Address',
    'ccRecipientName':            'EmailAddress.Name',
    'bccRecipients':              'BccRecipients',
    'bccRecipientAddress':        'EmailAddress.Address',
    'bccRecipientName':           'EmailAddress.Name',
    'isDeliveryReceiptRequested': 'IsDeliveryReceiptRequested',
    'isReadReceiptRequested':     'IsReadReceiptRequested',
    'hasAttachments':             'HasAttachments',
    'isDraft':                    'IsDraft',
    'isRead':                     'IsRead',
    'attachments':                'attachments',
  };


  async getBatchData(userProfiles, filterStartDate, filterEndDate, additionalFields) {

    const { fieldNameMap } = this.constructor,
          dataAdapterRunStats   = {
            userProfiles,
            filterStartDate,
            filterEndDate,
            success: false,
            runDate: moment().utc().toDate()
          };

    try {

      const emailData = await Promise.all(userProfiles.map(userProfile => {
        return this.getUserData({
          userProfile,
          filterStartDate,
          filterEndDate,
          additionalFields,
          apiType:  'messages',
          $filter:  ` IsDraft eq false
                        and DateTimeSent ge ${filterStartDate.toISOString().substring(0, 10)}
                        and DateTimeSent lt ${filterEndDate.toISOString().substring(0, 10)}
                    `.replace(/\s+/g, ' ')
                     .trim()
        });
      }));

      // replace data keys with desired mappings...
      const results = _.map(emailData, user => {
        const emailArray = (user.success && user.data) || [];
        return {
          ...user.userProfile,
          filterStartDate:  user.filterStartDate,
          filterEndDate:    user.filterEndDate,
          success:          user.success,
          errorMessage:     user.errorMessage,
          // map data with desired key names...
          data: _.map(emailArray, originalEmailMessage => {
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
                .map(recipient => {
                  return {
                    address: _.get(recipient, fieldNameMap[`${key}Address`]),
                    name:    _.get(recipient, fieldNameMap[`${key}Name`])
                  };
                });
            }

            return mappedEmailMessage;
          })
        };
      });

      // return results and success!
      return {
        ...dataAdapterRunStats,
        results,
        success: true
      };

    } catch (errorMessage) {
      console.log(errorMessage.stack);
      console.log('Office365 GetBatchData Error: ' + JSON.stringify(errorMessage));
      return { ...dataAdapterRunStats, errorMessage };
    }

  }

}
