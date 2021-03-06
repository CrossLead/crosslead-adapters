"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const Adapter_1 = require("../base/Adapter");
const errors_1 = require("../errors");
const rate_limit_1 = require("../../../utils/rate-limit");
const utils_1 = require("../../../utils/utils");
const util_1 = require("../../util/google/util");
// google calendar api
const calendar = googleapis.calendar('v3');
const credentialMappings = {
    'certificate': 'private_key',
    'serviceEmail': 'client_email',
    'email': 'adminEmail'
};
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
class GoogleCalendarAdapter extends Adapter_1.default {
    // constructor needs to call super
    constructor() {
        super();
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
                throw new Error('credentials required for adapter.');
            }
            // map Google json keys to keys used in this library
            for (const want in credentialMappings) {
                const alternate = credentialMappings[want];
                if (!credentials[want]) {
                    credentials[want] = credentials[alternate];
                }
            }
            // validate required credential properties
            Object.keys(credentialMappings)
                .forEach(prop => {
                if (!credentials[prop]) {
                    throw new Error(`Property ${prop} required in adapter credentials!`);
                }
            });
            this._config = new GoogleCalendarAdapter.Configuration(credentials);
            this._service = new GoogleCalendarAdapter.Service(this._config);
            yield this._service.init();
            const { serviceEmail: email } = credentials;
            console.log(`Successfully initialized google calendar adapter for email: ${email}`);
            return this;
        });
    }
    // currently doing nothing with fields here, but keeping as placeholder
    getBatchData(userProfiles = [], filterStartDate, filterEndDate, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filterStartDate.getTime() > filterEndDate.getTime()) {
                throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
            }
            const { fieldNameMap } = GoogleCalendarAdapter;
            // api options...
            // https://developers.google.com/google-apps/calendar/v3/
            const opts = {
                alwaysIncludeEmail: true,
                singleEvents: true,
                timeMax: filterEndDate.toISOString(),
                timeMin: filterStartDate.toISOString(),
                orderBy: 'startTime'
            };
            const groupRunStats = {
                success: true,
                runDate: moment().utc().toDate(),
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                emails: userProfiles,
                results: []
            };
            try {
                // collect events for this group of emails
                const results = yield Promise.all(userProfiles.map((userProfile) => __awaiter(this, void 0, void 0, function* () {
                    const individualRunStats = Object.assign({ filterStartDate,
                        filterEndDate }, userProfile, { success: true, runDate: moment().utc().toDate(), errorMessage: null });
                    try {
                        // add auth tokens to request
                        const auth = yield this.authorize(userProfile.emailAfterMapping);
                        // function to recurse through pageTokens
                        const getEvents = (requestOpts, data) => __awaiter(this, void 0, void 0, function* () {
                            // add page token if given
                            if (data && data.nextPageToken) {
                                requestOpts.pageToken = data.nextPageToken;
                            }
                            // request first results...
                            const events = yield this.getEvents(requestOpts);
                            // It turns out that once in while, null is returned
                            // from calendar.events.list .
                            if (!events) {
                                return data;
                            }
                            // if we already have data being accumulated, add to items
                            if (data) {
                                data.items.push(...events.items);
                            }
                            else {
                                data = events;
                            }
                            // if there is a token for the next page, continue...
                            if (events.nextPageToken) {
                                data.nextPageToken = events.nextPageToken;
                                return yield getEvents(requestOpts, data);
                            }
                            return data;
                        });
                        const calendarIds = yield util_1.calendarIdsFor(userProfile, auth);
                        /**
                         * get all items from all calendars in the date
                         * range, and flatten
                         */
                        const items = _.flatten(yield Promise.all(_.map(calendarIds, (calendarId) => getEvents(Object.assign({}, opts, { auth, calendarId })).then(r => r && r.items))));
                        const data = _.map(items, (item) => {
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
                                return { email, response: responseStatus };
                            });
                            return out;
                        });
                        // request all events for this user in the given time frame
                        return Object.assign(individualRunStats, { data });
                    }
                    catch (error) {
                        let errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));
                        if (/invalid_grant/.test(errorMessage.message.toString())) {
                            errorMessage = errors_1.createGoogleError('InvalidGrant', new Error(`Email address: ${userProfile.emailAfterMapping} not found in this Google Calendar account.`));
                        }
                        else if (errorMessage.message.toString() === 'The user must be signed up for Google Calendar.') {
                            errorMessage = errors_1.createGoogleError('NotACalendarUser', new Error(`User ${userProfile.emailAfterMapping} must be signed up for Google Calendar (aka, the user account is probably suspended)`));
                        }
                        return Object.assign(individualRunStats, {
                            errorMessage,
                            success: false,
                            data: []
                        });
                    }
                })));
                return Object.assign(groupRunStats, { results });
            }
            catch (error) {
                return Object.assign(groupRunStats, {
                    errorMessage: error,
                    success: false
                });
            }
        });
    }
    runConnectionTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const { credentials: { email } } = this;
            try {
                const data = yield this.getBatchData([{ email, emailAfterMapping: email }], moment().add(-1, 'day').toDate(), moment().toDate());
                const firstResult = Array.isArray(data.results) && data.results[0];
                if (firstResult && firstResult.errorMessage) {
                    return {
                        success: false,
                        message: firstResult.errorMessage
                    };
                }
                else {
                    return {
                        success: true
                    };
                }
            }
            catch (error) {
                console.log(error.stack || error);
                return {
                    message: error.message,
                    success: false
                };
            }
        });
    }
    runMessageTest() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: does this need to be different?
            console.warn('Note: runMessageTest() currently calls runConnectionTest()');
            return this.runConnectionTest();
        });
    }
    // create authenticated token for api requests for given user
    authorize(email) {
        return __awaiter(this, void 0, void 0, function* () {
            email = utils_1.default(email);
            const { credentials: { serviceEmail, certificate } } = this;
            const auth = new googleapis.auth.JWT(
            // email of google app admin...
            serviceEmail, 
            // no need for keyFile...
            null, 
            // the private key itself...
            certificate, 
            // scopes...
            ['https://www.googleapis.com/auth/calendar.readonly'], 
            // the email of the individual we want to authenticate
            // ('sub' property of the json web token)
            email);
            try {
                return yield new Promise((res, rej) => auth.authorize(util_1.handleGoogleError(res, rej, auth)));
            }
            catch (err) {
                const context = JSON.stringify({ serviceEmail, email });
                throw (/invalid_request/.test(err.message) ?
                    new Error(`Caught invalid_request performing authorization: ${err.message}, ${context}`) :
                    new Error(`Caught exception performing authorization: ${err.message ? err.message : err.toString()}: ${context}`));
            }
        });
    }
    getEvents(requestOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield new Promise((res, rej) => {
                    calendar.events.list(requestOpts, util_1.handleGoogleError(res, rej));
                });
            }
            catch (err) {
                const subject = requestOpts && requestOpts.auth ? requestOpts.auth.subject : '';
                const context = `subject = ${subject}`;
                throw (/invalid_request/.test(err.message) ?
                    new Error(`Caught invalid_request getting events: ${err.message}, ${context}`) :
                    new Error(`Caught exception getting events: ${err.message}, ${context}`));
            }
        });
    }
    getDatesOf(eventId, userProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.authorize(userProfile.emailAfterMapping);
            let ret = null;
            try {
                const calendarIds = yield util_1.calendarIdsFor(userProfile, auth);
                const items = _.flatten(yield Promise.all(_.map(calendarIds, (calendarId) => new Promise((res, rej) => calendar.events.get({ calendarId, eventId, auth }, util_1.handleGoogleError(res, rej))))));
                if (items && items.length) {
                    ret = { start: new Date(items[0].start.dateTime), end: new Date(items[0].end.dateTime) };
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
}
GoogleCalendarAdapter.Configuration = index_1.Configuration;
GoogleCalendarAdapter.Service = index_1.Service;
// convert the names of the api response data
GoogleCalendarAdapter.fieldNameMap = exports.fieldNameMap;
__decorate([
    rate_limit_1.default()
], GoogleCalendarAdapter.prototype, "getEvents", null);
exports.default = GoogleCalendarAdapter;
//# sourceMappingURL=index.js.map