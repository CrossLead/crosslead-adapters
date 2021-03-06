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
const Adapter_1 = require("../base/Adapter");
const request = require("request-promise");
const util_1 = require("../../util/util");
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
/**
 * Office 365 Calendar adapter
 */
class Office365CalendarAdapter extends Adapter_1.default {
    getBatchData(userProfiles, filterStartDate, filterEndDate, additionalFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fieldNameMap } = Office365CalendarAdapter, dataAdapterRunStats = {
                emails: userProfiles,
                filterStartDate,
                filterEndDate,
                success: false,
                runDate: moment().utc().toDate()
            };
            try {
                const eventData = yield Promise.all(userProfiles.map(userProfile => this.getUserData({
                    userProfile,
                    filterStartDate,
                    filterEndDate,
                    additionalFields,
                    apiType: 'calendarview'
                })));
                // replace data keys with desired mappings...
                const results = _.map(eventData, (user) => {
                    return Object.assign({}, user.userProfile, { filterStartDate: user.filterStartDate, filterEndDate: user.filterEndDate, success: user.success, errorMessage: user.errorMessage, 
                        // map data with desired key names...
                        data: _.map(user.data || [], (originalEvent) => {
                            const mappedEvent = {};
                            // change to desired names
                            _.each(fieldNameMap, (origField, mappedField) => {
                                const origVal = _.get(originalEvent, origField);
                                mappedEvent[mappedField] = mapVal(mappedField, origVal);
                            });
                            if (mappedEvent.response && mappedEvent.response.Response) {
                                mappedEvent.response = mappedEvent.response.Response;
                            }
                            mappedEvent[`attendees`] = originalEvent[fieldNameMap[`attendees`]]
                                .map((attendee) => {
                                return {
                                    email: _.get(attendee, fieldNameMap[`attendeeAddress`]),
                                    name: _.get(attendee, fieldNameMap[`attendeeName`]),
                                    response: _.get(attendee, 'Status.Response', 'None')
                                };
                            });
                            return mappedEvent;
                        }) });
                });
                // return results and success!
                return Object.assign({}, dataAdapterRunStats, { results, success: true });
            }
            catch (err) {
                console.error(`Caught error calling getBatchData: ${err.toString()}`);
                return Object.assign({}, dataAdapterRunStats, { errorMessage: new Error(err.toString()) });
            }
        });
    }
    getDatesOf(eventId, userProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = yield this.getAccessToken(), { apiVersion } = this._config.options;
            const emailAddr = userProfile.emailAfterMapping;
            const uri = `https://outlook.office365.com/api/v${apiVersion}/users('${emailAddr}')/events/${eventId}?$select=Start,End`;
            const requestOptions = {
                method: 'GET',
                uri,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json;odata.metadata=none'
                }
            };
            let ret = null;
            try {
                const value = JSON.parse(yield request(requestOptions)) || {};
                const start = value && value.Start ? value.Start : null;
                const end = value && value.End ? value.End : null;
                ret = { start, end };
            }
            catch (err) {
                console.error(`Caught error getting start time of event ${eventId} for ${emailAddr}: ${err.toString()}`);
            }
            return ret;
        });
    }
}
// collect these fields always...
Office365CalendarAdapter.baseFields = [
    'Id',
    'Attendees',
    'Calendar',
    'Categories',
    'DateTimeCreated',
    'DateTimeLastModified',
    'End',
    'EndTimeZone',
    'HasAttachments',
    'Importance',
    'iCalUID',
    'IsAllDay',
    'IsCancelled',
    'IsOrganizer',
    'Location',
    'Organizer',
    'Recurrence',
    'ResponseRequested',
    'ResponseStatus',
    'SeriesMasterId',
    'ShowAs',
    'Start',
    'StartTimeZone',
    'Subject',
    'Type',
    'WebLink',
    'Sensitivity',
    'Body',
];
// convert the names of the api response data
Office365CalendarAdapter.fieldNameMap = {
    // Desired...                          // Given...
    'eventId': 'Id',
    'attendees': 'Attendees',
    'calendarName': 'Calendar',
    'categories': 'Categories',
    'createTime': 'DateTimeCreated',
    'dateTimeLastModified': 'DateTimeLastModified',
    'attendeeAddress': 'EmailAddress.Address',
    'attendeeName': 'EmailAddress.Name',
    'hasAttachments': 'HasAttachments',
    'importance': 'Importance',
    'iCalUId': 'iCalUId',
    'allDay': 'IsAllDay',
    'canceled': 'IsCancelled',
    'isOrganizer': 'IsOrganizer',
    'location': 'Location.DisplayName',
    'locationAddressStreet': 'Location.Address.Street',
    'locationAddressCity': 'Location.Address.City',
    'locationAddressState': 'Location.Address.State',
    'locationAddressCountryOrRegion': 'Location.Address.CountryOrRegion',
    'locationCoordinatesAccuracy': 'Location.Coordinates.Accuracy',
    'locationCoordinatesAltitude': 'Location.Coordinates.Altitude',
    'locationCoordinatesAltitudeAccuracy': 'Location.Coordinates.AltitudeAccuracy',
    'locationCoordinatesLatitude': 'Location.Coordinates.Latitude',
    'locationCoordinatesLongitude': 'Location.Coordinates.Longitude',
    'organizerName': 'Organizer.EmailAddress.Name',
    'organizerEmail': 'Organizer.EmailAddress.Address',
    'recurrence': 'Recurrence',
    'responseRequested': 'ResponseRequested',
    'response': 'ResponseStatus',
    'seriesMasterId': 'SeriesMasterId',
    'showAs': 'ShowAs',
    'startTime': 'Start',
    'startTimeZone': 'StartTimeZone',
    'endTime': 'End',
    'endTimeZone': 'EndTimeZone',
    'name': 'Subject',
    'type': 'Type',
    'url': 'WebLink',
    'privacy': 'Sensitivity',
    'description': 'Body',
};
exports.default = Office365CalendarAdapter;
//# sourceMappingURL=index.js.map