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
const googleapis = require("googleapis");
const moment = require("moment");
const _ = require("lodash");
const index_1 = require("../../base/index");
const errors_1 = require("../errors");
const util_1 = require("../../util/google/util");
const calendar = googleapis.calendar('v3');
exports.fieldNameMap = {
    // Desired...                          // Given...
    'eventId': 'id',
    'attendees': 'attendees',
    'createTime': 'created',
    'dateTimeLastModified': 'updated',
    'attendeeAddress': 'EmailAddress.Address',
    'attendeeName': 'EmailAddress.Name',
    'iCalUId': 'iCalUID',
    'location': 'location',
    'status': 'status',
    'isCreator': 'creator.self',
    'isOrganizer': 'organizer.self',
    'organizerEmail': 'organizer.email',
    'recurrence': 'recurrence',
    'response': 'responseStatus',
    'seriesMasterId': 'recurringEventId',
    'startTime': 'start.dateTime',
    'endTime': 'end.dateTime',
    'name': 'summary',
    'url': 'htmlLink',
    'hangoutLink': 'hangoutLink',
    'privacy': 'visibility',
    'description': 'description',
};
class GoogleOauthCalendarAdapter extends index_1.Adapter {
    // constructor needs to call super
    constructor() {
        super();
        this.credentials = {
            access_token: '',
            refresh_token: '',
            email: '',
            clientId: '',
            clientSecret: '',
            redirectUrl: ''
        };
        this.sensitiveCredentialsFields = ['refresh_token', 'access_token'];
    }
    getFieldData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Google adapters currently do not support `getFieldData()`');
        });
    }
    reset() {
        delete this._config;
        delete this._service;
        return this;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const { credentials } = this;
            if (!credentials) {
                throw new Error('Credentials required for adapter.');
            }
            if (!(credentials.clientId && credentials.clientSecret && credentials.redirectUrl)) {
                throw new Error('OAuth params needed by this adapter are missing');
            }
            this.auth = new googleapis.auth.OAuth2(credentials.clientId, credentials.clientSecret, credentials.redirectUrl);
            this.auth.setCredentials({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token
            });
            // validate required credential properties
            ['access_token', 'refresh_token', 'email'].forEach(prop => {
                if (!credentials[prop]) {
                    throw new Error(`Property ${prop} required in adapter credentials!`);
                }
            });
            this._config = new GoogleOauthCalendarAdapter.Configuration(credentials);
            this._service = new GoogleOauthCalendarAdapter.Service(this._config);
            yield this._service.init();
            const { email: email } = credentials;
            console.log(`Successfully initialized google oauth calendar adapter for email: ${email}`);
            return this;
        });
    }
    getBatchData(userProfiles = [], filterStartDate, filterEndDate, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn('getBatchData is currently unimplemented in google oauth calendar adapter');
            return [];
        });
    }
    getData(filterStartDate, filterEndDate, properties) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filterStartDate.getTime() > filterEndDate.getTime()) {
                throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
            }
            const { fieldNameMap } = GoogleOauthCalendarAdapter;
            // api options...
            // https://developers.google.com/google-apps/calendar/v3/
            const opts = {
                alwaysIncludeEmail: true,
                singleEvents: true,
                timeMax: filterEndDate.toISOString(),
                timeMin: filterStartDate.toISOString(),
                orderBy: 'startTime'
            };
            const individualRunStats = {
                filterStartDate,
                filterEndDate,
                success: true,
                runDate: moment().utc().toDate(),
                errorMessage: null
            };
            try {
                const auth = this.auth;
                const getEvents = (requestOpts) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        return yield new Promise((res, rej) => {
                            calendar.events.list(requestOpts, util_1.handleGoogleError(res, rej));
                        });
                    }
                    catch (err) {
                        const context = JSON.stringify({ requestOpts });
                        throw (/invalid_request/.test(err.message) ?
                            new Error(`Caught invalid_request getting events: ${err.message}, ${context}`) :
                            new Error(`Caught exception getting events: ${err.message}, ${context}`));
                    }
                });
                const apiResult = yield getEvents(Object.assign({}, opts, { auth, calendarId: 'primary' }));
                const data = _.map(apiResult.items, (item) => {
                    const out = {};
                    _.each(fieldNameMap, (have, want) => {
                        let modified = _.get(item, have);
                        if (/^(start|end|create)Time/.test(want)) {
                            modified = new Date(modified);
                        }
                        if (modified !== undefined) {
                            out[want] = modified;
                        }
                    });
                    const attendeeSelf = _.find(out['attendees'], (attendee) => {
                        return attendee.self;
                    });
                    if (attendeeSelf) {
                        out['response'] = attendeeSelf.responseStatus;
                    }
                    out['attendees'] = _.map(out['attendees'], (attendee) => {
                        const { email, responseStatus } = attendee;
                        return { email: email, response: responseStatus };
                    });
                    return out;
                });
                return Object.assign(individualRunStats, { results: [{
                            filterStartDate,
                            filterEndDate,
                            success: true,
                            userId: properties.userId,
                            email: properties.email,
                            data
                        }]
                });
            }
            catch (error) {
                console.log(error);
                let errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));
                if (/invalid_grant/.test(errorMessage.message.toString())) {
                    errorMessage = errors_1.createGoogleError('InvalidGrant', new Error(`Email address: ${properties.email} has not authorized crosslead to access their calendar.`));
                }
                return Object.assign(individualRunStats, {
                    errorMessage,
                    success: false,
                    data: []
                });
            }
        });
    }
    getDatesOf(eventId, userProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = this.auth;
            let ret = null;
            try {
                const calendarIds = yield util_1.calendarIdsFor(userProfile, auth);
                const items = _.flatten(yield Promise.all(_.map(calendarIds, (calendarId) => new Promise((res, rej) => calendar.events.get({ calendarId, eventId, auth }, util_1.handleGoogleError(res, rej))))));
                if (items && items.length > 0) {
                    const item = items[0];
                    const start = item.start && new Date(item.start);
                    const end = item.end && new Date(item.end);
                    if (!(start && end)) {
                        throw new Error(`Retrieved event ${eventId} missing one or more date fields; found ${JSON.stringify(Object.keys(item))}`);
                    }
                    ret = { start, end };
                }
            }
            catch (err) {
                const subject = auth.subject;
                const context = `subject = ${subject}`;
                throw (/invalid_request/.test(err.message) ?
                    new Error(`Caught invalid_request getting events: ${err.message}, ${context}`) :
                    new Error(`Caught exception getting events: ${err.message}, ${context}`));
            }
            return ret;
        });
    }
    runConnectionTest() {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn('runConnectionTest is currently unimplemented in google oauth calendar adapter');
        });
    }
    runMessageTest() {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn('runMessageTest is currently unimplemented in google oauth calendar adapter');
        });
    }
}
GoogleOauthCalendarAdapter.Configuration = index_1.Configuration;
GoogleOauthCalendarAdapter.Service = index_1.Service;
// convert the names of the api response data
GoogleOauthCalendarAdapter.fieldNameMap = exports.fieldNameMap;
exports.default = GoogleOauthCalendarAdapter;
//# sourceMappingURL=index.js.map