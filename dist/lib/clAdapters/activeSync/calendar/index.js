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
const index_1 = require("../../base/index");
const asclient = require("asclient");
const Adapter_1 = require("../base/Adapter");
const autodiscover_activesync_1 = require("autodiscover-activesync");
const credentialMappings = {
    'username': 'username',
    'email': 'email',
    'password': 'password',
};
const ACCEPTED_STATUS = '3';
exports.fieldNameMap = {
    // Desired...                          // Given...
    // ? :                                 'TimeZone', // Do we need this?  I don't think so...
    'eventId': 'UID',
    'attendees': 'Attendees',
    'dateTimeCreated': 'DtStamp',
    'attendeeAddress': 'Email',
    'attendeeName': 'Name',
    // 'iCalUId':                             'iCalUID', // Does not appear to be available
    'location': 'Location',
    'status': 'AttendeeStatus',
    'organizerEmail': 'OrganizerEmail',
    'recurrence': 'Recurrence',
    'responseRequested': 'ResponseRequested',
    'responseStatus': 'ResponseType',
    // 'seriesMasterId':                      'recurringEventId', // Does not appear to be available
    'dateTimeStart': 'StartTime',
    'dateTimeEnd': 'EndTime',
    'subject': 'Subject',
    'url': 'WebLink',
    // 'hangoutLink':                         'hangoutLink',  // Does not appear to be available
    'privacy': 'Sensitivity'
};
class ActiveSyncCalendarAdapter extends Adapter_1.default {
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
            this._config = new ActiveSyncCalendarAdapter.Configuration(credentials);
            this._service = new ActiveSyncCalendarAdapter.Service(this._config);
            yield this._service.init();
            const { email: email } = credentials;
            console.log(`Successfully initialized active sync calendar adapter for email: ${email}`);
            return this;
        });
    }
    getData(filterStartDate, filterEndDate, properties) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filterStartDate.getTime() > filterEndDate.getTime()) {
                throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
            }
            const { email: username, password, connectUrl: endpoint } = this.credentials;
            const individualRunStats = {
                filterStartDate,
                filterEndDate,
                success: true,
                runDate: moment().utc().toDate(),
                errorMessage: null
            };
            try {
                const options = {
                    username,
                    password,
                    endpoint,
                    folders: [],
                    folderSyncKey: '0',
                    device: {
                        id: '0000000',
                        type: 'iPhone',
                        model: 'iPhone Simulator',
                        operatingSystem: 'iPhone OS8.1'
                    }
                };
                const myCalClient = asclient(options);
                yield myCalClient.provision();
                const folderSync = (yield myCalClient.folderSync()).body.FolderSync;
                // const folderSyncKey = folderSync.SyncKey;
                // console.log('syncKey', folderSyncKey );
                const calFolder = _.find(options.folders, (folder) => {
                    return folder.Type[0] === '8'; // Calendar type
                });
                const serverId = calFolder.ServerId[0];
                // options.folderSyncKey = '1010372622';
                yield myCalClient.enableCalendarSync();
                yield myCalClient.sync();
                const contents = myCalClient.contents;
                const folders = contents[serverId];
                const startDate = moment(filterStartDate);
                const endDate = moment(filterEndDate);
                const events = _.compact(_.map(folders, (folder) => {
                    const event = folder.ApplicationData[0];
                    const startTime = moment(event.StartTime[0]);
                    const endTime = moment(event.EndTime[0]);
                    if (startTime.isBefore(startDate) || endTime.isAfter(endDate)) {
                        return null;
                    }
                    return event;
                }));
                const mappedEvents = _.map(events || [], (originalEvent) => {
                    const mappedEvent = {};
                    // console.log('event', JSON.stringify(originalEvent, null, 2));
                    // change to desired names
                    _.each(exports.fieldNameMap, (have, want) => {
                        const val = _.get(originalEvent, have);
                        const mapped = val && val.length ? val[0] : val;
                        if (mapped !== undefined) {
                            mappedEvent[want] = /^dateTime/.test(want) ? moment(mapped).toDate() : mapped;
                        }
                    });
                    if (mappedEvent.responseStatus && mappedEvent.responseStatus.Response) {
                        mappedEvent.responseStatus = mappedEvent.responseStatus.Response;
                    }
                    const attendees = originalEvent[exports.fieldNameMap['attendees']];
                    if (attendees && attendees.length) {
                        const attendeePeople = attendees[0].Attendee;
                        mappedEvent['attendees'] = attendeePeople
                            .map((attendee) => {
                            let acceptedStatus = _.get(attendee, 'AttendeeStatus[0]') || '0';
                            if (acceptedStatus === ACCEPTED_STATUS) {
                                acceptedStatus = 'Accepted';
                            }
                            return {
                                address: _.get(attendee, 'Email[0]'),
                                name: _.get(attendee, 'Name[0]'),
                                response: acceptedStatus
                            };
                        });
                    }
                    else {
                        mappedEvent['attendees'] = [];
                    }
                    // Make it the same as the eventId for now, since it does not look like this value available
                    mappedEvent.iCalUId = mappedEvent.eventId;
                    const recurrence = mappedEvent['recurrence'];
                    if (recurrence) {
                        const mappedRecurrence = {};
                        mappedRecurrence.type = _.get(recurrence, 'Type[0]');
                        mappedRecurrence.interval = _.get(recurrence, 'Interval[0]');
                        mappedRecurrence.dayOfWeek = _.get(recurrence, 'DayOfWeek[0]');
                        mappedRecurrence.firstDayOfWeek = _.get(recurrence, 'FirstDayOfWeek[0]');
                        mappedRecurrence.occurrences = _.get(recurrence, 'Occurrences[0]');
                        mappedRecurrence.weekOfMonth = _.get(recurrence, 'WeekOfMonth[0]');
                        mappedRecurrence.monthOfYear = _.get(recurrence, 'MonthOfYear[0]');
                        mappedRecurrence.until = _.get(recurrence, 'Until[0]');
                        mappedRecurrence.dayOfMonth = _.get(recurrence, 'DayOfMonth[0]');
                        mappedRecurrence.calendarType = _.get(recurrence, 'CalendarType[0]');
                        mappedRecurrence.isLeapMonth = _.get(recurrence, 'IsLeapMonth[0]');
                        mappedRecurrence.firstDayOfWeek = _.get(recurrence, 'FirstDayOfWeek[0]');
                        mappedEvent['recurrence'] = mappedRecurrence;
                    }
                    return mappedEvent;
                });
                const results = [{
                        filterStartDate,
                        filterEndDate,
                        success: true,
                        userId: properties.userId,
                        email: properties.email,
                        data: mappedEvents
                    }];
                return Object.assign(individualRunStats, { results });
            }
            catch (error) {
                return Object.assign(individualRunStats, {
                    errorMessage: error,
                    success: false
                });
            }
        });
    }
    runConnectionTest() {
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
            try {
                const connectUrl = yield autodiscover_activesync_1.default({
                    emailAddress: credentials.email,
                    username: credentials.username,
                    password: credentials.password
                });
                this.credentials.connectUrl = connectUrl || '';
                if (connectUrl) {
                    console.log(`Successfully connected to: ${connectUrl}`);
                }
                return {
                    success: !!connectUrl,
                    connectUrl
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
ActiveSyncCalendarAdapter.Configuration = index_1.Configuration;
ActiveSyncCalendarAdapter.Service = index_1.Service;
// convert the names of the api response data
ActiveSyncCalendarAdapter.fieldNameMap = exports.fieldNameMap;
exports.default = ActiveSyncCalendarAdapter;
//# sourceMappingURL=index.js.map