import request                    from 'request-promise';
import moment                     from 'moment';
import _                          from 'lodash';
import Office365BaseAdapter       from '../base/Adapter';


/**
 * Office 365 Calendar adapter
 */
export default class Office365CalendarAdapter extends Office365BaseAdapter {

  async getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {

    const { emailFieldNameMap } = Office365Adapter,
          dataAdapterRunStats   = {
            emails,
            filterStartDate,
            filterEndDate,
            success: false,
            runDate: moment().utc().toDate()
          };

    try {

      const emailData = await* emails.map(email => this.getEmailsForUser(
        email,
        filterStartDate,
        filterEndDate,
        additionalFields
      ));

      // replace data keys with desired mappings...
      const results = _.map(emailData, user => {
        const emailArray = (user.success && user.data[emailFieldNameMap.emails]) || [];
        return {
          email:            user.email,
          filterStartDate:  user.filterStartDate,
          filterEndDate:    user.filterEndDate,
          success:          user.success,
          errorMessage:     user.errorMessage,
          // map data with desired key names...
          data: _.map(emailArray, originalEmailMessage => {
            const mappedEmailMessage = {};

            // change to desired names
            _.each(emailFieldNameMap, (have, want) => {
              const mapped = _.get(originalEmailMessage, have);
              mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
            });

            // grab info from different correspondent types...
            // (since we're using an array literal here, 'for of' syntax will compile reasonably)
            for (const type of ['to', 'cc', 'bcc']) {
              const key = `${type}Recipient`;
              mappedEmailMessage[`${key}s`] = originalEmailMessage[emailFieldNameMap[`${key}s`]]
                .map(recipient => {
                  return {
                    address: _.get(recipient, emailFieldNameMap[`${key}Address`]),
                    name:    _.get(recipient, emailFieldNameMap[`${key}Name`])
                  }
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

  async getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData, pageToGet=1) {
    // accumulation of data
    emailData = emailData || { email, filterStartDate, filterEndDate };

    const accessToken     = await this.getAccessToken(),
          { apiVersion }  = this._config.options,
          recordsPerPage  = 25,
          maxPages        = 20,
          skip            = ((pageToGet -1) * recordsPerPage) + 1,
          // parameters to query email with...
          params          = {
            $top:     recordsPerPage,
            $skip:    skip,
            $select:  Office365Adapter.baseFields.join(',') + additionalFields,
            $filter:  ` IsDraft eq false
                          and DateTimeSent ge ${filterStartDate.toISOString().substring(0, 10)}
                          and DateTimeSent lt ${filterEndDate.toISOString().substring(0, 10)}
                      `.replace(/\s+/g, ' ')
                       .trim()
          };

    // format parameters for url
    const urlParams = _(params)
      .map((value, key) => `${key}=${value}`)
      .join('&');

    const emailRequestOptions = {
      method: 'GET',
      uri: `https://outlook.office365.com/api/v${apiVersion}/users('${email}')/messages?${urlParams}`,
      headers : {
        Authorization: `Bearer ${accessToken}`,
        Accept:        'application/json;odata.metadata=none'
      }
    };

    try {
      emailData.success = true;
      const parsedBody = JSON.parse(await request(emailRequestOptions));

      if (parsedBody && pageToGet === 1) {
        emailData.data = parsedBody;
      }

      if (parsedBody.value && pageToGet > 1) {
        emailData.data.value.push(...parsedBody.value);
      }

      // if the returned results are the maximum number of records per page,
      // we are not done yet, so recurse...
      if (parsedBody && parsedBody.value.length === recordsPerPage && pageToGet <= maxPages) {
        return this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData, pageToGet + 1);
      } else {
        return emailData;
      }

    } catch (err) {
      Object.assign(emailData, {
        success: false,
        errorMessage: err.name !== 'StatusCodeError' ?
                        JSON.stringify(err)          :
                        JSON.parse(
                              err.message
                                 .replace(err.statusCode + ' - ', '')
                                 .replace(/\"/g, '"')
                            )
                            .message
      });
      return true;
    }

  }


}
