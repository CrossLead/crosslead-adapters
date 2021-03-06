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
const utils_1 = require("../../../utils/utils");
const index_1 = require("../../base/index");
const Adapter_1 = require("../base/Adapter");
const Service_1 = require("../base/Service");
const errors_1 = require("../errors");
const util_1 = require("../../util/util");
const credentialMappings = {
    username: 'username',
    password: 'password',
    connectUrl: 'connectUrl'
};
const TEST_EMAIL = 'mark.bradley@crosslead.com';
const mapVal = (name, val) => {
    if (!val) {
        return val;
    }
    if (val.Content) {
        return util_1.sanitize(val.Content);
    }
    if (/^(start|end|create)Time/.test(name)) {
        return new Date(val);
    }
    return val;
};
exports.fieldNameMap = {
    // Desired...                          // Given...
    'eventId': 'ItemId.attributes.Id',
    'attendees': 'Attendees',
    'categories': 'Categories.String',
    'createTime': 'DateTimeCreated',
    'attendeeAddress': 'Mailbox.EmailAddress',
    'attendeeName': 'Mailbox.EmailAddress.Name',
    'hasAttachments': 'HasAttachments',
    'importance': 'Importance',
    'iCalUId': 'ItemId.attributes.Id',
    'allDay': 'IsAllDayEvent',
    'canceled': 'IsCancelled',
    // 'isOrganizer':                         'IsOrganizer',
    'location': 'Location',
    'organizerName': 'Organizer.Mailbox.Name',
    'organizerEmail': 'Organizer.Mailbox.EmailAddress.Address',
    'responseRequested': 'ResponseRequested',
    'response': 'MyResponseType',
    // 'seriesMasterId':                      'SeriesMasterId',
    'showAs': 'ShowAs',
    'startTime': 'Start',
    'endTime': 'End',
    'name': 'Subject',
    'type': 'CalendarItemType',
    'url': 'NetShowUrl',
    'privacy': 'Sensitivity',
    'description': 'Body',
};
class ExchangeServiceCalendarAdapter extends Adapter_1.default {
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
            // map json keys to keys used in this library
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
            this._config = new ExchangeServiceCalendarAdapter.Configuration(credentials);
            this._service = new Service_1.default(this._config);
            yield this._service.init();
            console.log(`Successfully initialized exchange service calendar adapter for username: ${credentials.username}`);
            return this;
        });
    }
    // currently doing nothing with fields here, but keeping as placeholder
    getBatchData(userProfiles = [], filterStartDate, filterEndDate, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filterStartDate.getTime() > filterEndDate.getTime()) {
                throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
            }
            const { fieldNameMap } = ExchangeServiceCalendarAdapter;
            const groupRunStats = {
                success: true,
                runDate: moment().utc().toDate(),
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                emails: userProfiles,
                results: []
            };
            try {
                const adapter = this;
                // collect events for this group of emails
                const results = yield Promise.all(userProfiles.map((userProfile) => __awaiter(this, void 0, void 0, function* () {
                    const individualRunStats = Object.assign({ filterStartDate,
                        filterEndDate }, userProfile, { success: true, runDate: moment().utc().toDate(), errorMessage: null });
                    const addr = userProfile.emailAfterMapping;
                    try {
                        const result = yield this._service.findItem(filterStartDate.toISOString(), filterEndDate.toISOString(), addr);
                        const items = _.get(result, 'ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem');
                        const data = [];
                        if (items && items.length) {
                            for (const item of items) {
                                const out = {};
                                _.each(fieldNameMap, (origField, mappedField) => {
                                    const origVal = _.get(item, origField);
                                    out[mappedField] = mapVal(mappedField, origVal);
                                });
                                yield this.attachAttendees(out, item, addr);
                                out.attendees = _.map(out.attendees, (attendee) => {
                                    const { Mailbox: email, ResponseType: response } = attendee;
                                    return { email: email.EmailAddress, response };
                                });
                                _.remove(out.attendees, (attendee) => {
                                    return !attendee.email;
                                });
                                out.canceled = adapter.parseBoolean(out.canceled);
                                out.allDay = adapter.parseBoolean(out.allDay);
                                out.hasAttachments = adapter.parseBoolean(out.hasAttachments);
                                data.push(out);
                            }
                        }
                        return Object.assign(individualRunStats, { data });
                    }
                    catch (error) {
                        let errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));
                        const msg = errorMessage.message.toString();
                        if (/primary SMTP address must be specified/.test(msg) ||
                            /ErrorNonPrimarySmtpAddress/.test(msg)) {
                            errorMessage = errors_1.createExchangeServiceError('NotPrimaryEmail', new Error(`Email address: must use primary SMTP address for ${userProfile.emailAfterMapping}.`));
                        }
                        else if (/SMTP address has no mailbox associated/.test(msg) ||
                            /ErrorNonExistentMailbox/.test(msg)) {
                            errorMessage = errors_1.createExchangeServiceError('NoMailbox', new Error(`Email address: ${userProfile.emailAfterMapping} has no mailbox.`));
                        }
                        else if (/ServerBusy/.test(msg)) {
                            errorMessage = errors_1.createExchangeServiceError('ServerBusy', new Error(msg));
                        }
                        else if (/ErrorInternalServerError/.test(msg)) {
                            errorMessage = errors_1.createExchangeServiceError('InternalServerError', new Error(msg));
                        }
                        else if (/NTLM StatusCode 401/.test(msg)) {
                            // Service account is unauthorized-- throw error to exit all
                            throw error;
                        }
                        else {
                            errorMessage = errors_1.createExchangeServiceError('UnclassifiedError', new Error(msg));
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
                let errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));
                if (/NTLM StatusCode 401/.test(errorMessage.message.toString())) {
                    const credsHash = this.hashCreds();
                    errorMessage = errors_1.createExchangeServiceError('UnauthorizedClient', new Error('Credentials are not valid for ExchangeService: ' + credsHash));
                }
                return Object.assign(groupRunStats, {
                    errorMessage,
                    success: false
                });
            }
        });
    }
    hashCreds() {
        return utils_1.hashString(this.credentials.password);
    }
    attachAttendees(out, item, addr) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = _.get(item, 'ItemId.attributes');
            const itemId = _.get(attributes, 'Id');
            const itemChangeKey = _.get(attributes, 'ChangeKey');
            let attendees = yield this._service.getRequiredAttendees(itemId, itemChangeKey, addr);
            // If an object is returned
            if (attendees) {
                if (attendees.length) {
                    out.attendees = attendees;
                }
                else if (attendees.Mailbox) {
                    out.attendees = [attendees];
                }
            }
            if (!out.attendees) {
                out.attendees = [];
            }
            attendees = yield this._service.getOptionalAttendees(itemId, itemChangeKey, addr);
            if (attendees) {
                if (attendees.length) {
                    out.attendees.push(...attendees);
                }
                else if (attendees.Mailbox) {
                    out.attendees.push(attendees);
                }
            }
        });
    }
    getDatesOf(eventid, userProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const addr = userProfile.emailAfterMapping;
            let ret = null;
            try {
                ret = yield this._service.getDatesOf(eventid, addr);
            }
            catch (err) {
                console.log(`Caught error getting date of event ${eventid}: ${err.toString()}`);
            }
            return ret;
        });
    }
    runConnectionTest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.init();
                // Just call a the method to expand a distribution list to get a response
                const result = yield this._service.ews.run('ExpandDL', {
                    'Mailbox': {
                        EmailAddress: 'all@company.com'
                    }
                });
                return {
                    success: true,
                    data: result
                };
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
}
ExchangeServiceCalendarAdapter.Configuration = index_1.Configuration;
ExchangeServiceCalendarAdapter.Service = Service_1.default;
// convert the names of the api response data
ExchangeServiceCalendarAdapter.fieldNameMap = exports.fieldNameMap;
exports.default = ExchangeServiceCalendarAdapter;
//# sourceMappingURL=index.js.map