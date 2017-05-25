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
const asclient = require("asclient");
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
            this._config = new ExchangeServiceCalendarAdapter.Configuration(credentials);
            this._service = new ExchangeServiceCalendarAdapter.Service(this._config);
            yield this._service.init();
            const { username: username } = credentials;
            console.log(`Successfully initialized active sync calendar adapter for username: ${username}`);
            return this;
        });
    }
    expandDaysOfWeek(daysOfWeek) {
        let arr = [];
        if ((daysOfWeek & 1) === 1) {
            arr.push('Sunday');
        }
        if ((daysOfWeek & 2) === 2) {
            arr.push('Monday');
        }
        if ((daysOfWeek & 4) === 4) {
            arr.push('Tuesday');
        }
        if ((daysOfWeek & 8) === 8) {
            arr.push('Wednesday');
        }
        if ((daysOfWeek & 16) === 16) {
            arr.push('Thursday');
        }
        if ((daysOfWeek & 32) === 32) {
            arr.push('Friday');
        }
        if ((daysOfWeek & 62) === 62) {
            arr = arr.concat(...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        }
        if ((daysOfWeek & 64) === 64) {
            arr.push('Saturday');
        }
        if ((daysOfWeek & 65) === 65) {
            arr = arr.concat(...['Saturday', 'Sunday']);
        }
        // if ((daysOfWeek & 127) === 127) { // Last day of Month
        // arr = arr.concat(...['Saturday', 'Sunday']);
        // }
        return arr;
    }
    // https://msdn.microsoft.com/en-us/library/dn292994(v=exchg.80).aspx
    getRecurrence(startTime, filterEndDate, recurrenceObj) {
        // If the recurrence ends before now, then check it
        if (recurrenceObj.Until) {
            if (filterEndDate.isAfter(moment(recurrenceObj.Until[0]))) {
                return null;
            }
        }
        let recurrence = startTime.recur();
        const intervalStr = _.get(recurrenceObj, 'Interval[0]');
        const type = parseInt(recurrenceObj.Type[0]);
        switch (type) {
            case 0: {
                const daysOfWeek = _.get(recurrenceObj, 'DayOfWeek[0]');
                if (daysOfWeek) {
                    const daysOfWeekInt = parseInt(daysOfWeek);
                    const daysOfWeekArr = this.expandDaysOfWeek(daysOfWeekInt);
                    recurrence = recurrence.every(daysOfWeekArr).daysOfWeek();
                }
                else {
                    const interval = intervalStr ? parseInt(intervalStr) : 1;
                    recurrence = recurrence.every(interval).days();
                }
                break;
            }
            case 1: {
                if (intervalStr && parseInt(intervalStr) > 1) {
                    recurrence = recurrence.every(parseInt(intervalStr)).weeks();
                }
                else {
                    const daysOfWeek = parseInt(_.get(recurrenceObj, 'DayOfWeek[0]'));
                    const daysOfWeekArr = this.expandDaysOfWeek(daysOfWeek);
                    recurrence = recurrence.every(daysOfWeekArr).daysOfWeek();
                }
                break;
            }
            case 2: {
                // Monthly
                const dayOfMonth = parseInt(_.get(recurrenceObj, 'DayOfMonth[0]'));
                recurrence = recurrence.every(dayOfMonth).dayOfMonth();
                // Interval is optional, but how do I use it?
                break;
            }
            case 3: {
                const weekOfMonth = parseInt(_.get(recurrenceObj, 'WeekOfMonth[0]'));
                const daysOfWeek = parseInt(_.get(recurrenceObj, 'DayOfWeek[0]'));
                if (daysOfWeek === 127) {
                    recurrence = recurrence.every(weekOfMonth).dayOfMonth();
                }
                else if (daysOfWeek === 62 || daysOfWeek === 65) {
                    const daysOfWeekArr = this.expandDaysOfWeek(daysOfWeek);
                    recurrence = recurrence.every(daysOfWeekArr).daysOfWeek()
                        .every([weekOfMonth]).weeksOfMonthByDay();
                }
                // Interval is optional, but how do I use it?
                break;
            }
            case 5: {
                const dayOfMonth = parseInt(_.get(recurrenceObj, 'DayOfMonth[0]'));
                const monthOfYear = parseInt(_.get(recurrenceObj, 'MonthOfYear[0]'));
                recurrence = recurrence.every(dayOfMonth).daysOfMonth()
                    .every(monthOfYear).monthsOfYear();
                // Interval is optional, but how do I use it?
                break;
            }
            case 6: {
                const weekOfMonth = parseInt(_.get(recurrenceObj, 'WeekOfMonth[0]'));
                const monthOfYear = parseInt(_.get(recurrenceObj, 'MonthOfYear[0]'));
                // const daysOfWeek: number = parseInt(_.get(recurrenceObj, 'DayOfWeek[0]') || '0' );
                recurrence = recurrence.every(weekOfMonth).weeksOfMonth()
                    .every(monthOfYear).monthsOfYear();
                // Interval is optional, but how do I use it?
                break;
            }
        }
        return recurrence;
    }
    isDeleted(exceptionsObj, event) {
        if (!exceptionsObj) {
            return false;
        }
        const exceptions = _.get(exceptionsObj, 'Exception') || [];
        for (const exception of exceptions) {
            const exStartTime = _.get(exception, 'ExceptionStartTime[0]');
            if (exStartTime === event.StartTime[0]) {
                return true;
            }
        }
        return false;
    }
    getExceptionEvents(event, exceptionsObj, filterStartDate, filterEndDate) {
        const exceptions = _.get(exceptionsObj, 'Exception') || [];
        const exceptionEvents = [];
        const adapter = this;
        for (const exception of exceptions) {
            const startTimeStr = _.get(exception, 'StartTime[0]') ||
                _.get(exception, 'DtStamp[0]');
            const endTimeStr = _.get(exception, 'EndTime[0]');
            if (startTimeStr && endTimeStr) {
                const startTime = moment(startTimeStr);
                const endTime = moment(endTimeStr);
                if (startTime.isSameOrAfter(filterStartDate) && endTime.isSameOrBefore(filterEndDate)) {
                    const instanceEvent = _.clone(event);
                    // Set the iCalUId to the event id
                    instanceEvent.iCalUId = event.UID[0];
                    instanceEvent.UID = [instanceEvent.iCalUId + `-${startTime.year()}${startTime.month()}${startTime.date()}`];
                    instanceEvent.StartTime = [startTime.utc().format().replace(/[-:]/g, '')];
                    instanceEvent.EndTime = [endTime.utc().format().replace(/[-:]/g, '')];
                    if (!adapter.isDeleted(exceptionsObj, instanceEvent)) {
                        exceptionEvents.push(instanceEvent);
                    }
                }
            }
        }
        return exceptionEvents;
    }
    // Create and add cloned instances of the event if recurrence, or just add the event
    addToEvents(events, folder, filterStartDate, filterEndDate) {
        const adapter = this;
        const event = folder.ApplicationData[0];
        const startTime = moment(event.StartTime[0]);
        const endTime = moment(event.EndTime[0]);
        const exceptions = _.get(event, 'Exceptions[0]');
        const exceptionEvents = adapter.getExceptionEvents(event, exceptions, filterStartDate, filterEndDate);
        if (exceptionEvents.length) {
            events.push(...exceptionEvents);
        }
        else {
            const recurrenceObj = _.get(event, 'Recurrence[0]');
            if (recurrenceObj) {
                const recurrence = adapter.getRecurrence(startTime, filterEndDate, recurrenceObj);
                if (recurrence) {
                    const UID = event.UID[0];
                    for (const date = moment(filterStartDate); date.isSameOrBefore(filterEndDate); date.add(1, 'days')) {
                        if (recurrence.matches(date)) {
                            startTime.year(date.year());
                            startTime.month(date.month());
                            startTime.date(date.date());
                            endTime.year(date.year());
                            endTime.month(date.month());
                            endTime.date(date.date());
                            const instanceEvent = _.clone(event);
                            // Set the iCalUId to the event id
                            instanceEvent.iCalUId = UID;
                            instanceEvent.UID = [UID + `-${date.year()}${date.month()}${date.date()}`];
                            instanceEvent.StartTime = [startTime.utc().format().replace(/[-:]/g, '')];
                            instanceEvent.EndTime = [endTime.utc().format().replace(/[-:]/g, '')];
                            if (!adapter.isDeleted(exceptions, instanceEvent)) {
                                events.push(instanceEvent);
                            }
                        }
                    }
                }
            }
            else if (!adapter.isDeleted(exceptions, event)) {
                events.push(event);
            }
        }
    }
    getData(filterStartDate, filterEndDate, properties) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filterStartDate.getTime() > filterEndDate.getTime()) {
                throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
            }
            const { username, password, connectUrl: endpoint } = this.credentials;
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
                const adapter = this;
                // console.log('folders', JSON.stringify(folders, null, 2));
                const rawEvents = [];
                _.each(folders, (folder) => {
                    adapter.addToEvents(rawEvents, folder, startDate, endDate);
                });
                const events = _.compact(_.map(rawEvents, (event) => {
                    const startTime = moment(event.StartTime[0]);
                    const endTime = moment(event.EndTime[0]);
                    if (startTime.isBefore(startDate) || endTime.isAfter(endDate)) {
                        return null;
                    }
                    // console.log('event', JSON.stringify(event, null, 2));
                    return event;
                }));
                const mappedEvents = _.map(events || [], (originalEvent) => {
                    const mappedEvent = {};
                    // console.log(originalEvent.StartTime[0] + ':' + originalEvent.Subject[0]);
                    // change to desired names
                    _.each(exports.fieldNameMap, (have, want) => {
                        const val = _.get(originalEvent, have);
                        const mapped = val && val.length ? val[0] : val;
                        if (mapped !== undefined) {
                            mappedEvent[want] = /^dateTime/.test(want) ? moment(mapped).toDate() : mapped;
                        }
                    });
                    const responseStatus = _.get(mappedEvent, 'responseStatus');
                    if (mappedEvent.responseStatus === ACCEPTED_STATUS || mappedEvent.responseStatus === ORGANIZER_STATUS) {
                        mappedEvent.responseStatus = 'Accepted';
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
                    // Make it the same as the eventId for now, since it does not look like this value is available
                    mappedEvent.iCalUId = originalEvent.iCalUId || mappedEvent.eventId;
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
                    // console.log('mapped event', JSON.stringify(mappedEvent, null, 2));
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
    // currently doing nothing with fields here, but keeping as placeholder
    getBatchData(userProfiles = [], filterStartDate, filterEndDate, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filterStartDate.getTime() > filterEndDate.getTime()) {
                throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
            }
            const { fieldNameMap } = ExchangeServiceCalendarAdapter;
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
                        const getEvents = (requestOpts, data) => __awaiter(this, void 0, void 0, function* () {
                            // request first results...
                            const events = yield new Promise((res, rej) => {
                                // add page token if given
                                if (data && data.nextPageToken) {
                                    requestOpts.pageToken = data.nextPageToken;
                                }
                                // calendar.events.list(
                                //   requestOpts, handleExchangeError(res, rej)
                                // );
                            });
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
                        /**
                         * calendar ids we want to
                         * retrieve events from
                         */
                        const includedCalendarIds = new Set([
                            'primary',
                            userProfile.email.toLowerCase(),
                            userProfile.emailAfterMapping.toLowerCase()
                        ]);
                        /**
                         * all calendar ids in the users calendar
                         */
                        const calendarIds = _.chain(yield new Promise((res, rej) => {
                            // calendar.calendarList.list(
                            //   { ...opts, auth },
                            //   (err: any, d: any) => handleExchangeError(res, rej)(err, d && d.items)
                            // );
                        }))
                            .filter((item) => includedCalendarIds.has(item.id.toLowerCase()))
                            .map('id')
                            .value();
                        /**
                         * get all items from all calendars in the date
                         * range, and flatten
                         */
                        const items = _.flatten(yield Promise.all(_.map(calendarIds, (calendarId) => getEvents(Object.assign({}, opts, { /*auth, */ calendarId })).then(r => r && r.items))));
                        const data = _.map(items, (item) => {
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
                            const attendeeSelf = _.find(out['attendees'], (attendee) => {
                                return attendee.self;
                            });
                            if (attendeeSelf) {
                                out['responseStatus'] = attendeeSelf.responseStatus;
                            }
                            out['attendees'] = _.map(out['attendees'], (attendee) => {
                                const { email, responseStatus } = attendee;
                                return { address: email, response: responseStatus };
                            });
                            return out;
                        });
                        // request all events for this user in the given time frame
                        return Object.assign(individualRunStats, { data });
                    }
                    catch (error) {
                        let errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));
                        if (/invalid_grant/.test(errorMessage.message.toString())) {
                            errorMessage = {
                                type: 'InvalidGrant',
                                error: new Error(`Email address: ${userProfile.emailAfterMapping} not found in this Google Calendar account.`)
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
    initEws(emailAddress) {
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
        if (emailAddress) {
            this.soapHeader = {
                't:ExchangeImpersonation': {
                    't:ConnectingSID': {
                        't:PrimarySmtpAddress': emailAddress
                    }
                }
            };
        }
        this.ews = new EWS(ewsConfig);
    }
    getOptionalAttendees(item) {
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
                                Id: 'AAAaAENoYXJsaWVfSGVycmluQGNvbWNhc3QuY29tAEYAAAAAAEZFRVD4aRlDkMB+MOCFFlkHAK1mMxd6s0JEoaYzaFf6u00AAAUIo0UAAFHWG9oSQLxCkl4PYLFJM5sAAa0mCjMAAA==',
                                ChangeKey: 'DwAAABYAAABR1hvaEkC8QpJeD2CxSTObAAGtfpfn'
                            }
                        }
                    }
                ]
            };
            const result = yield this.ews.run('GetItem', ewsArgs, this.soapHeader);
            const attendees = _.get(result, 'ResponseMessages.GetItemResponseMessage.Items.OptionalAttendees.Attendee');
            return attendees;
        });
    }
    findItem(userEmail, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                attributes: {
                    Traversal: 'Shallow'
                },
                ItemShape: {
                    BaseShape: 'IdOnly',
                    AdditionalProperties: {
                        FieldURI: {
                            attributes: {
                                FieldURI: 'calendar:RequiredAttendees'
                            }
                        }
                    }
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
            // const items = 'ResponseMessages.FindItemResponseMessage.Items.CalendarItem'
            return this.ews.run('FindItem', ewsArgs, this.soapHeader);
        });
    }
    getFolder(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ews) {
                throw new Error('EWS has not been inited!');
            }
            const ewsArgs = {
                FolderShape: {
                    BaseShape: 'IdOnly'
                },
                FolderIds: {
                    DistinguishedFolderId: {
                        attributes: {
                            Id: 'calendar'
                        },
                        Mailbox: {
                            EmailAddress: userEmail
                        }
                    }
                }
            };
            return this.ews.run('GetFolder', ewsArgs, this.soapHeader);
        });
    }
    runConnectionTest() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initEws(TEST_EMAIL);
            try {
                // const result = await this.getItem();
                // const result = await this.findItem(TEST_EMAIL, '2017-05-20T05:00:00Z', '2017-05-21T05:00:00Z');
                // const result = await this.findItem(TEST_EMAIL, '2017-05-23T05:00:00Z', '2017-05-24T05:00:00Z' );
                // const result = await this.getFolder(TEST_EMAIL);
                // Just call a the method to expand a distribution list to get a response
                const result = yield this.ews.run('ExpandDL', {
                    'Mailbox': {
                        EmailAddress: 'all@company.com'
                    }
                });
                console.log('result', JSON.stringify(result, null, 2));
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