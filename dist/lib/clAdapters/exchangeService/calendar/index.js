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
require("moment-recur");
const _ = require("lodash");
const index_1 = require("../../base/index");
const Adapter_1 = require("../base/Adapter");
const EWS = require("node-ews");
const credentialMappings = {
    username: 'username',
    password: 'password',
    connectUrl: 'connectUrl'
};
const ORGANIZER_STATUS = '1';
const ACCEPTED_STATUS = '3';
const TEST_EMAIL = 'mark.bradley@crosslead.com';
exports.fieldNameMap = {
    // Desired...                          // Given...
    'eventId': 'ItemId.attributes.Id',
    'attendees': 'Attendees',
    'categories': 'Categories.String',
    'dateTimeCreated': 'DateTimeCreated',
    'attendeeAddress': 'Mailbox.EmailAddress',
    'attendeeName': 'Mailbox.EmailAddress.Name',
    'hasAttachments': 'HasAttachments',
    'importance': 'Importance',
    // 'iCalUId':                             'iCalUId',
    'allDay': 'IsAllDayEvent',
    'canceled': 'IsCancelled',
    // 'isOrganizer':                         'IsOrganizer',
    'locationName': 'Location',
    'organizerName': 'Organizer.Mailbox.Name',
    'organizerEmail': 'Organizer.Mailbox.EmailAddress.Address',
    'responseRequested': 'ResponseRequested',
    'responseStatus': 'MyResponseType',
    // 'seriesMasterId':                      'SeriesMasterId',
    'showAs': 'ShowAs',
    'dateTimeStart': 'Start',
    'dateTimeEnd': 'End',
    'subject': 'Subject',
    'type': 'CalendarItemType',
    // 'url':                                 'WebLink',
    'privacy': 'Sensitivity'
};
function handleExchangeError(res, rej, returnVal) {
    return (err, result) => {
        if (err) {
            let mapped = err;
            if (err instanceof Error) {
                // Map to custom errors
                if (/unauthorized_client/.test(err.message.toString())) {
                    // mapped = createGoogleError(
                    //   'UnauthorizedClient',
                    //   err
                    // );
                }
                // TODO: other types
            }
            else if (!err.kind) {
                // Not a GoogleError
                mapped = new Error(JSON.stringify(err));
            }
            // Leave GoogleErrors
            rej(mapped);
        }
        else {
            res(typeof returnVal !== 'undefined' ? returnVal : result);
        }
    };
}
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
            console.log('inited!');
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
            this._service = new ExchangeServiceCalendarAdapter.Service(this._config);
            yield this._service.init();
            const { username: username } = credentials;
            console.log(`Successfully initialized active sync calendar adapter for username: ${username}`);
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
                this.initEws();
                // collect events for this group of emails
                const results = yield Promise.all(userProfiles.map((userProfile) => __awaiter(this, void 0, void 0, function* () {
                    const individualRunStats = Object.assign({ filterStartDate,
                        filterEndDate }, userProfile, { success: true, runDate: moment().utc().toDate(), errorMessage: null });
                    this.setImpersonationUser(userProfile.emailAfterMapping);
                    try {
                        const result = yield this.findItem(filterStartDate.toISOString(), filterEndDate.toISOString());
                        const items = _.get(result, 'ResponseMessages.FindItemResponseMessage.RootFolder.Items.CalendarItem');
                        const data = [];
                        for (const item of items) {
                            console.log('item', JSON.stringify(item, null, 2));
                            const out = {};
                            _.each(fieldNameMap, (have, want) => {
                                let modified = _.get(item, have);
                                if (/^dateTime/.test(want)) {
                                    modified = new Date(modified);
                                }
                                if (modified !== undefined) {
                                    out[want] = modified;
                                }
                            });
                            yield this.attachAttendees(out, item);
                            out['attendees'] = _.map(out['attendees'], (attendee) => {
                                const { Mailbox: email, ResponseType: responseStatus } = attendee;
                                return { address: email.EmailAddress, response: responseStatus };
                            });
                            console.log('out', JSON.stringify(out, null, 2));
                            data.push(out);
                        }
                        // console.log('data', JSON.stringify(data, null, 2));
                        // request all events for this user in the given time frame
                        return Object.assign(individualRunStats, { data });
                    }
                    catch (error) {
                        let errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));
                        if (/invalid_grant/.test(errorMessage.message.toString())) {
                            errorMessage = {
                                type: 'InvalidGrant',
                                error: new Error(`Email address: ${userProfile.emailAfterMapping} not found in this Exchange Calendar account.`)
                            };
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
    setImpersonationUser(emailAddress) {
        this.soapHeader = {
            't:ExchangeImpersonation': {
                't:ConnectingSID': {
                    't:PrimarySmtpAddress': emailAddress
                }
            }
        };
    }
    initEws() {
        const { credentials } = this;
        if (!credentials) {
            throw new Error('credentials required for adapter.');
        }
        // validate required credential properties
        Object.keys(credentialMappings)
            .forEach(prop => {
            if (!credentials[prop]) {
                throw new Error(`Property ${prop} required in adapter credentials!`);
            }
        });
        const ewsConfig = {
            username: this.credentials.username,
            password: this.credentials.password,
            host: this.credentials.connectUrl
        };
        this.ews = new EWS(ewsConfig);
    }
    attachAttendees(out, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = _.get(item, 'ItemId.attributes');
            const itemId = _.get(attributes, 'Id');
            const itemChangeKey = _.get(attributes, 'ChangeKey');
            let attendees = yield this.getRequiredAttendees(itemId, itemChangeKey);
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
            attendees = yield this.getOptionalAttendees(itemId, itemChangeKey);
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
    getOptionalAttendees(itemId, itemChangeKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                ItemShape: {
                    BaseShape: 'IdOnly',
                    AdditionalProperties: [
                        {
                            FieldURI: {
                                attributes: {
                                    FieldURI: 'calendar:OptionalAttendees'
                                }
                            }
                        }
                    ]
                },
                ItemIds: [
                    {
                        ItemId: {
                            attributes: {
                                Id: itemId,
                                ChangeKey: itemChangeKey
                            }
                        }
                    }
                ]
            };
            const result = yield this.ews.run('GetItem', ewsArgs, this.soapHeader);
            const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.OptionalAttendees.Attendee');
            return attendees;
        });
    }
    getRequiredAttendees(itemId, itemChangeKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                ItemShape: {
                    BaseShape: 'IdOnly',
                    AdditionalProperties: [
                        {
                            FieldURI: {
                                attributes: {
                                    FieldURI: 'calendar:RequiredAttendees'
                                }
                            }
                        }
                    ]
                },
                ItemIds: [
                    {
                        ItemId: {
                            attributes: {
                                Id: itemId,
                                ChangeKey: itemChangeKey
                            }
                        }
                    }
                ]
            };
            const result = yield this.ews.run('GetItem', ewsArgs, this.soapHeader);
            const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.CalendarItem.RequiredAttendees.Attendee');
            return attendees;
        });
    }
    findItem(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                attributes: {
                    Traversal: 'Shallow'
                },
                ItemShape: {
                    BaseShape: 'AllProperties'
                },
                CalendarView: {
                    attributes: {
                        StartDate: startDate,
                        EndDate: endDate
                    }
                },
                ParentFolderIds: {
                    DistinguishedFolderId: {
                        attributes: {
                            Id: 'calendar'
                        }
                    }
                }
            };
            return this.ews.run('FindItem', ewsArgs, this.soapHeader);
        });
    }
    runConnectionTest() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initEws();
            try {
                // Just call a the method to expand a distribution list to get a response
                const result = yield this.ews.run('ExpandDL', {
                    'Mailbox': {
                        EmailAddress: 'all@company.com'
                    }
                });
                // console.log('result', JSON.stringify(result, null, 2));
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
ExchangeServiceCalendarAdapter.Service = index_1.Service;
// convert the names of the api response data
ExchangeServiceCalendarAdapter.fieldNameMap = exports.fieldNameMap;
exports.default = ExchangeServiceCalendarAdapter;
//# sourceMappingURL=index.js.map