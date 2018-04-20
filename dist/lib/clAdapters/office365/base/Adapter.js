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
const uuid = require("node-uuid");
const crypto = require("crypto");
const request = require("request-promise");
const moment = require("moment");
const _ = require("lodash");
const Adapter_1 = require("../../base/Adapter");
const Service_1 = require("./Service");
const Configuration_1 = require("./Configuration");
/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */
class Office365BaseAdapter extends Adapter_1.default {
    constructor() {
        super(...arguments);
        this.sensitiveCredentialsFields = ['certificate'];
    }
    reset() {
        delete this._config;
        delete this._service;
        return this;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._config = new Configuration_1.default(this.credentials);
            this._service = new Service_1.default(this._config);
            yield this._service.init();
            console.log(`Successfully initialized ${this.constructor.name} for email: ${this.credentials['email']}`);
            return this;
        });
    }
    runConnectionTest(connectionData) {
        return __awaiter(this, void 0, void 0, function* () {
            this._config = new Configuration_1.default(connectionData.credentials);
            const today = () => moment().utc().startOf('day'), filterStartDate = today().add(-1, 'days').toDate(), filterEndDate = today().toDate(), data = yield this.getBatchData([{
                    email: this._config.credentials['email'],
                    emailAfterMapping: this._config.credentials['email']
                }], filterStartDate, filterEndDate, '');
            // to see if it really worked, we need to pass in the first result
            return data.success && data.results[0] ? data.results[0] : data;
        });
    }
    getBatchData(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Must override in subclass!`);
        });
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accessToken &&
                (typeof this.accessTokenExpires !== 'undefined') &&
                this.accessTokenExpires > new Date()) {
                return this.accessToken;
            }
            const { credentials: { clientId, tenantId, certificate, certificateThumbprint }, options: { apiVersion } } = this._config;
            const tokenRequestUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token?api-version=${apiVersion}`;
            const jwtHeader = {
                'alg': 'RS256',
                'x5t': certificateThumbprint
            };
            // expire token in one hour
            const accessTokenExpires = ((new Date()).getTime() + 360000) / 1000;
            // grab new access token 10 seconds before expiration
            this.accessTokenExpires = new Date(accessTokenExpires * 1000 - 10000);
            const jwtPayload = {
                'aud': tokenRequestUrl,
                'exp': accessTokenExpires,
                'iss': clientId,
                'jti': uuid.v4(),
                'nbf': accessTokenExpires - 2 * 3600,
                'sub': clientId
            };
            const encode = (header) => new Buffer(JSON.stringify(header)).toString('base64'), encodedJwtHeader = encode(jwtHeader), encodedJwtPayload = encode(jwtPayload), stringToSign = encodedJwtHeader + '.' + encodedJwtPayload, encodedSignedJwtInfo = crypto
                .createSign('RSA-SHA256')
                .update(stringToSign)
                .sign(certificate, 'base64');
            const tokenRequestFormData = {
                client_id: clientId,
                client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                grant_type: 'client_credentials',
                resource: 'https://outlook.office365.com/',
                client_assertion: encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo
            };
            const tokenRequestOptions = {
                method: 'POST',
                port: 443,
                uri: tokenRequestUrl,
                formData: tokenRequestFormData,
            };
            let result;
            try {
                result = yield request(tokenRequestOptions);
            }
            catch (err) {
                if (err.message) {
                    throw new Error(err.message);
                }
                else {
                    throw err;
                }
            }
            const tokenData = JSON.parse(result);
            if (!(tokenData && tokenData.access_token)) {
                throw new Error('Could not get access token');
            }
            return this.accessToken = tokenData.access_token;
        });
    }
    getUserData(options, userData, pageToGet = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userProfile, filterStartDate, filterEndDate, additionalFields, $filter, apiType, maxPages = 20, recordsPerPage = 25 } = options;
            // accumulation of data
            userData = userData || { userProfile, filterStartDate, filterEndDate };
            const accessToken = yield this.getAccessToken(), { apiVersion } = this._config.options, skip = (pageToGet - 1) * recordsPerPage, 
            // extract static property...
            { baseFields = [] } = this.constructor, 
            // parameters to query email with...
            params = {
                startDateTime: filterStartDate.toISOString(),
                endDateTime: filterEndDate.toISOString(),
                $top: recordsPerPage,
                $skip: skip,
                $select: baseFields.join(',') + (additionalFields ? `,${additionalFields}` : ''),
            };
            if (apiType !== 'calendarview') {
                params.$filter = $filter;
            }
            // format parameters for url
            const urlParams = _(params)
                .map((value, key) => `${key}=${value}`)
                .join('&');
            const requestOptions = {
                method: 'GET',
                uri: `https://outlook.office365.com/api/v${apiVersion}/users('${userProfile.emailAfterMapping}')/${apiType}?${urlParams}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json;odata.metadata=none'
                }
            };
            try {
                userData.success = true;
                const { value: records = [] } = JSON.parse(yield request(requestOptions)) || {};
                const e = userProfile.emailAfterMapping;
                if (userProfile.getAttachments && records.length) {
                    for (let recIter = 0; recIter < records.length; recIter++) {
                        const rec = records[recIter];
                        const mid = rec.Id || '';
                        rec.attachments = [];
                        const attachmentOptions = {
                            method: 'GET',
                            uri: `https://outlook.office365.com/api/v${apiVersion}/users('${e}')/messages/${mid}/attachments`,
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                Accept: 'application/json;odata.metadata=none'
                            }
                        };
                        const attachmentData = JSON.parse(yield request(attachmentOptions)) || {};
                        if (attachmentData.value && attachmentData.value.length > 0) {
                            rec.attachments = attachmentData.value;
                        }
                    }
                }
                if (records && pageToGet === 1) {
                    userData.data = records;
                }
                if (records && pageToGet > 1) {
                    userData.data.push(...records);
                }
                // if the returned results are the maximum number of records per page,
                // we are not done yet, so recurse...
                if (records.length === recordsPerPage && pageToGet <= maxPages) {
                    return this.getUserData(options, userData, pageToGet + 1);
                }
                else {
                    return userData;
                }
            }
            catch (err) {
                Object.assign(userData, {
                    success: false,
                    errorMessage: new Error(err.name !== 'StatusCodeError' ?
                        JSON.stringify(err) :
                        JSON.parse(err.message
                            .replace(err.statusCode + ' - ', '')
                            .replace(/\"/g, '"'))
                            .message)
                });
                return true;
            }
        });
    }
    getFieldData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Office365 adapters currently do not support `getFieldData()`');
        });
    }
}
Office365BaseAdapter.baseFields = {};
exports.default = Office365BaseAdapter;
//# sourceMappingURL=Adapter.js.map