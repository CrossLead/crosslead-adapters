"use strict";
const crypto = require("crypto");
const requestPromise = require("request-promise");
const moment = require("moment");
const querystring = require("querystring");
const _ = require("lodash");
const Adapter_1 = require("../base/Adapter");
const GoogleMail = require("./google-js.js");
class GoogleMailAdapter extends Adapter_1.default {
    constructor() {
        super(...arguments);
        this.runConnectionTest = runConnectionTest;
        this.runMessageTest = runMessageTest;
        this.getBatchData = getBatchData;
    }
    init() {
        const _this = this;
        this._config = new GoogleMail.Configuration(this.credentials);
        this._service = new GoogleMail.Service(this._config);
        return this._service
            .init()
            .then(() => {
            const msg = 'Successfully initialized gmail adapter for email: %s';
            console.log(msg, _this.credentials.email);
            return _this;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GoogleMailAdapter;
GoogleMailAdapter.prototype.reset = function () {
    delete this._config;
    delete this._service;
};
const getSingleMessageDetails = function (...args) {
    const [messageId, userEmail, token, apiVersion, additionalFields, result] = args;
    let additionalFieldsToQuery = additionalFields.replace('BodyPreview', 'snippet');
    additionalFieldsToQuery = additionalFieldsToQuery.replace('Body', 'payload(parts)');
    additionalFieldsToQuery = additionalFieldsToQuery.replace('Subject', 'payload(parts)');
    if (additionalFieldsToQuery !== '') {
        additionalFieldsToQuery = ',' + additionalFieldsToQuery;
    }
    const messageRequestOptions = {
        method: 'GET',
        uri: ('https://www.googleapis.com/gmail/v' +
            apiVersion +
            '/users/' +
            userEmail +
            '/messages/' +
            messageId +
            '?fields=id,threadId,labelIds,payload(headers)' +
            additionalFieldsToQuery),
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/json;odata.metadata=none'
        }
    };
    return requestPromise(messageRequestOptions)
        .then((messageDetails) => {
        result.messageData = JSON.parse(messageDetails);
        if (additionalFields.indexOf('Subject') === -1) {
            // remove subject header
            const headers = _.get(result, 'messageData.payload.headers');
            const n = _.get(headers, 'length');
            if (n > 0) {
                for (let headerIter = 0; headerIter < n; headerIter++) {
                    if (headers[headerIter].name === 'Subject') {
                        headers[headerIter].value = '';
                    }
                }
            }
        }
        return true;
    });
};
const getAccessToken = function (...args) {
    const [clientId, adminEmail, userEmail, privateKey] = args;
    const tokenRequestUrl = 'https://www.googleapis.com/oauth2/v3/token';
    const unixEpochTime = Math.floor((new Date()).getTime() / 1000);
    const jwtHeader = {
        alg: 'RS256',
        typ: 'JWT'
    };
    const jwtPayload = {
        'iss': adminEmail,
        'scope': 'https://www.googleapis.com/auth/gmail.readonly',
        'aud': tokenRequestUrl,
        'exp': unixEpochTime + 3600,
        'iat': unixEpochTime,
        'sub': userEmail
    };
    const encodedJwtHeader = new Buffer(JSON.stringify(jwtHeader)).toString('base64');
    const encodedJwtPayload = new Buffer(JSON.stringify(jwtPayload)).toString('base64');
    const stringToSign = encodedJwtHeader + '.' + encodedJwtPayload;
    // sign it!
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(stringToSign);
    const encodedSignedJwtInfo = signer.sign(privateKey, 'base64');
    // define assertion
    const clientAssertion = encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo;
    const tokenRequestFormData = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: clientAssertion
    };
    const requestData = querystring.stringify(tokenRequestFormData);
    const requestDataLength = requestData.length;
    const tokenRequestOptions = {
        method: 'POST',
        port: 443,
        uri: tokenRequestUrl,
        body: requestData,
        multipart: false,
        headers: {
            'Content-Length': requestDataLength,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return requestPromise(tokenRequestOptions)
        .then((body) => {
        const tokenData = JSON.parse(body);
        if (tokenData && tokenData.access_token) {
            return tokenData.access_token;
        }
        else {
            return Promise.reject('Could not get access token.');
        }
    })
        .catch((err) => {
        const tokenData = JSON.parse(JSON.stringify(err));
        if (tokenData.name === 'StatusCodeError') {
            const entireMessage = tokenData.message;
            const messageJson = entireMessage.replace(tokenData.statusCode + ' - ', '');
            const messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
            // console.log('-----');
            // console.log(messageData);
            return Promise.reject(messageData);
        }
        else {
            return Promise.reject(err);
        }
    });
};
const getMoreEmails = function (...args) {
    const [messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, nextPageToken] = args;
    emailRequestOptions.uri = firstUri + '&pageToken=' + nextPageToken;
    let tempPageToken = '';
    return requestPromise(emailRequestOptions)
        .then((body) => {
        const messageDetailPromises = [];
        const messageList = JSON.parse(body);
        tempPageToken = messageList.nextPageToken;
        if (messageList.messages) {
            for (let messageIter = 0; messageIter < messageList.messages.length; messageIter++) {
                const messageId = messageList.messages[messageIter].id;
                const nextMessage = { messageId: messageId };
                messages.push(nextMessage);
                messageDetailPromises.push(getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, nextMessage));
            }
        }
        return Promise.all(messageDetailPromises);
    })
        .then(() => {
        if (tempPageToken) {
            return getMoreEmails(messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, tempPageToken);
        }
        else {
            return true;
        }
    });
};
const getUserEmails = function (...args) {
    const [clientId, serviceEmail, userEmail, privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, result] = args;
    let token = '';
    let emailRequestOptions = {};
    let firstUri = '';
    return getAccessToken(clientId, serviceEmail, userEmail, privateKey)
        .then((tokenResponse) => {
        token = tokenResponse;
        const queryFilter = '\"after:' +
            filterStartDate.toISOString().substring(0, 10).replace(/-/g, '/') +
            ' before:' +
            filterEndDate.toISOString().substring(0, 10).replace(/-/g, '/') +
            '\"';
        firstUri = 'https://www.googleapis.com/gmail/v' +
            apiVersion +
            '/users/' +
            userEmail +
            '/messages?maxResults=100&q=' +
            queryFilter;
        emailRequestOptions = {
            method: 'GET',
            uri: firstUri,
            headers: {
                Authorization: 'Bearer ' + token,
                Accept: 'application/json;odata.metadata=none'
            }
        };
        return requestPromise(emailRequestOptions);
    })
        .then((body) => {
        const messageDetailPromises = [];
        result.data = {};
        result.data.messageList = JSON.parse(body);
        result.data.messages = [];
        const messages = _.get(result, 'data.messageList.messages');
        if (messages) {
            for (let messageIter = 0; messageIter < messages.length; messageIter++) {
                const messageId = messages[messageIter].id;
                result.data.messages.push({ messageId: messageId });
                messageDetailPromises.push(getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, result.data.messages[messageIter]));
            }
        }
        return Promise.all(messageDetailPromises);
    })
        .then(() => {
        // console.log(result.data.messageList);
        if (result.data.messageList.nextPageToken) {
            return getMoreEmails(result.data.messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, result.data.messageList.nextPageToken);
        }
        else {
            return true;
        }
    })
        .then(() => {
        result.success = true;
    })
        .catch((err) => {
        result.success = false;
        if (err.name === 'StatusCodeError') {
            const entireMessage = err.message;
            const messageJson = entireMessage.replace(err.statusCode + ' - ', '');
            const messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
            result.errorMessage = new Error(messageData.error.message);
        }
        else {
            result.errorMessage = err;
        }
        return true;
    });
};
const getHeaderValue = function (message, headerName) {
    const headerValues = _(message.payload.headers)
        .filter((header) => {
        return header.name === headerName;
    })
        .pluck('value')
        .value();
    if (headerValues.length > 0) {
        return headerValues[0];
    }
    else {
        return null;
    }
};
const getEmailAddressObjectFromString = function (value) {
    const returnObject = {
        name: value,
        address: value
    };
    if (value && value.indexOf('>') > 0) {
        const valueArray = value.split(' ');
        returnObject.address = valueArray[valueArray.length - 1].replace('<', '').replace('>', '');
        returnObject.name = value.replace(' ' + valueArray[valueArray.length - 1], '');
    }
    return returnObject;
};
const convertEmailListToArrayOfEmailAddressObjects = function (emailList) {
    const emailAddressObjectArray = [];
    if (emailList) {
        const emailArray = emailList.split(',');
        for (let emailIter = 0; emailIter < emailArray.length; emailIter++) {
            emailAddressObjectArray.push(getEmailAddressObjectFromString(emailArray[emailIter]));
        }
    }
    return emailAddressObjectArray;
};
const hasLabel = function (message, labelValue) {
    return message.labelIds && message.labelIds.length && (message.labelIds.indexOf(labelValue) >= 0);
};
const getFirstScalarPart = function (partToCheck) {
    let returnObject = partToCheck;
    _.forEach(partToCheck.headers, (header) => {
        if (header.name === 'Content-Type' && header.value.indexOf('multipart/') > -1 && partToCheck.parts.length > 0) {
            returnObject = getFirstScalarPart(partToCheck.parts[0]);
        }
    });
    return returnObject;
};
const mapEmailData = function (emailData) {
    const mappedData = [];
    for (let userIter = 0; userIter < emailData.length; userIter++) {
        const mappedUser = _.assign({}, emailData[userIter], {
            data: [],
            success: emailData[userIter].success,
            errorMessage: emailData[userIter].errorMessage
        });
        if (emailData[userIter].success) {
            for (let i = 0; i < emailData[userIter].data.messages.length; i++) {
                const originalEmailMessage = emailData[userIter].data.messages[i];
                let mappedEmailMessage = {};
                mappedEmailMessage = originalEmailMessage;
                const messageData = originalEmailMessage.messageData;
                mappedEmailMessage.messageId = originalEmailMessage.messageId;
                mappedEmailMessage.conversationId = messageData.threadId;
                mappedEmailMessage.dateTimeSent = moment(new Date(getHeaderValue(messageData, 'Date'))).utc().toDate();
                const dateReceived = getHeaderValue(messageData, 'Received');
                if (dateReceived) {
                    const datePartOfValue = dateReceived.split(';')[1];
                    mappedEmailMessage.dateTimeReceived = moment(new Date(datePartOfValue)).utc().toDate();
                }
                mappedEmailMessage.importance = 'Normal';
                if (hasLabel(messageData, 'IMPORTANT')) {
                    mappedEmailMessage.importance = 'Important';
                }
                mappedEmailMessage.categories = messageData.labelIds;
                if (hasLabel(messageData, 'SENT')) {
                    mappedEmailMessage.folderId = 'Sent Items';
                    mappedEmailMessage.folderName = 'Sent Items';
                }
                else {
                    mappedEmailMessage.folderId = 'Inbox';
                    mappedEmailMessage.folderName = 'Inbox';
                }
                mappedEmailMessage.subject = getHeaderValue(messageData, 'Subject');
                mappedEmailMessage.bodyPreview = messageData.snippet;
                if (messageData.payload.parts && messageData.payload.parts.length > 0) {
                    const partToCheck = getFirstScalarPart(messageData.payload.parts[0]);
                    mappedEmailMessage.contentType = partToCheck.mimeType;
                    mappedEmailMessage.body = new Buffer(partToCheck.body.data, 'base64').toString();
                }
                mappedEmailMessage.isDeliveryReceiptRequested = null;
                mappedEmailMessage.isReadReceiptRequested = null;
                mappedEmailMessage.hasAttachments = null;
                mappedEmailMessage.isDraft = null;
                mappedEmailMessage.isRead = hasLabel(messageData, 'READ');
                mappedEmailMessage.fromAddress = getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).address;
                mappedEmailMessage.fromName = getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).name;
                mappedEmailMessage.toRecipients =
                    convertEmailListToArrayOfEmailAddressObjects(getHeaderValue(messageData, 'To'));
                mappedEmailMessage.ccRecipients =
                    convertEmailListToArrayOfEmailAddressObjects(getHeaderValue(messageData, 'Cc'));
                mappedEmailMessage.bccRecipients =
                    convertEmailListToArrayOfEmailAddressObjects(getHeaderValue(messageData, 'Bcc'));
                delete mappedEmailMessage.messageData;
                mappedUser.data.push(mappedEmailMessage);
            }
        }
        mappedData.push(mappedUser);
    }
    return mappedData;
};
const getEmailData = function (...args) {
    const [emails, filterStartDate, filterEndDate, additionalFields, clientId, serviceEmail, privateKey, apiVersion] = args;
    const emailResults = [];
    const emailResultPromises = [];
    for (let emailIter = 0; emailIter < emails.length; emailIter++) {
        // initialize emailResults with the email object passed in
        // and add filter dates
        emailResults[emailIter] = _.assign({}, emails[emailIter], {
            filterStartDate: filterStartDate,
            filterEndDate: filterEndDate
        });
        emailResultPromises.push(getUserEmails(clientId, serviceEmail, emails[emailIter].emailAfterMapping, privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, emailResults[emailIter]));
    }
    return Promise.all(emailResultPromises)
        .then(() => {
        return emailResults;
    });
};
function getBatchData(...args) {
    const [emails, filterStartDate, filterEndDate, additionalFields] = args;
    const clientId = this._config.credentials.clientId;
    const clientEmail = this._config.credentials.email;
    const serviceEmail = this._config.credentials.serviceEmail;
    const privateKey = this._config.credentials.certificate;
    const apiVersion = this._config.options.apiVersion;
    const dataAdapterRunStats = {
        success: true,
        runDate: moment().utc().toDate(),
        filterStartDate: filterStartDate,
        filterEndDate: filterEndDate,
        emails: emails
    };
    // first try to get token for the admin - if that fails, then all will fail
    return getAccessToken(clientId, serviceEmail, clientEmail, privateKey)
        .then(() => {
        return getEmailData(emails, filterStartDate, filterEndDate, additionalFields, clientId, serviceEmail, privateKey, apiVersion);
    })
        .then((emailData) => {
        return mapEmailData(emailData);
    })
        .then((mappedEmailData) => {
        dataAdapterRunStats.results = mappedEmailData;
        return dataAdapterRunStats;
    })
        .catch((err) => {
        dataAdapterRunStats.success = false;
        dataAdapterRunStats.errorMessage = err;
        return dataAdapterRunStats;
    });
}
exports.getBatchData = getBatchData;
;
function runConnectionTest(connectionData) {
    const _this = this;
    _this._config = new GoogleMail.Configuration(connectionData.credentials);
    const filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate();
    const filterEndDate = moment().utc().startOf('day').toDate();
    return _this.getBatchData([{ emailAfterMapping: _this._config.credentials.email }], filterStartDate, filterEndDate, '')
        .then((data) => {
        if (data.success && data.results[0]) {
            // to see if it really worked, we need to pass in the first result
            return data.results[0];
        }
        else {
            return data;
        }
    });
}
exports.runConnectionTest = runConnectionTest;
;
function runMessageTest(connectionData) {
    const _this = this;
    _this._config = new GoogleMail.Configuration(connectionData.credentials);
    const filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate();
    const filterEndDate = moment().utc().startOf('day').add(1, 'days').toDate();
    return _this
        .getBatchData([_this._config.credentials.email], filterStartDate, filterEndDate, 'Subject,BodyPreview,Body')
        .then((data) => {
        console.log('runMessageTest worked');
        console.log(data.results[0]);
    })
        .catch((err) => {
        console.log('runMessageTest Error: ' + JSON.stringify(err));
    });
}
exports.runMessageTest = runMessageTest;
;
//# sourceMappingURL=index.js.map