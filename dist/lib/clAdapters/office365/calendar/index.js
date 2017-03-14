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
                            _.each(fieldNameMap, (have, want) => {
                                const mapped = _.get(originalEvent, have);
                                if (mapped !== undefined) {
                                    mappedEvent[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                                }
                            });
                            if (mappedEvent.responseStatus && mappedEvent.responseStatus.Response) {
                                mappedEvent.responseStatus = mappedEvent.responseStatus.Response;
                            }
                            mappedEvent[`attendees`] = originalEvent[fieldNameMap[`attendees`]]
                                .map((attendee) => {
                                return {
                                    address: _.get(attendee, fieldNameMap[`attendeeAddress`]),
                                    name: _.get(attendee, fieldNameMap[`attendeeName`]),
                                    response: _.get(attendee, 'Status')
                                };
                            });
                            return mappedEvent;
                        }) });
                });
                // return results and success!
                return Object.assign({}, dataAdapterRunStats, { results, success: true });
            }
            catch (errorMessage) {
                console.log(errorMessage.stack);
                console.log('Office365 GetBatchData Error: ' + JSON.stringify(errorMessage));
                return Object.assign({}, dataAdapterRunStats, { errorMessage });
            }
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
    'Sensitivity'
];
// convert the names of the api response data
Office365CalendarAdapter.fieldNameMap = {
    // Desired...                          // Given...
    'eventId': 'Id',
    'attendees': 'Attendees',
    'calendarName': 'Calendar',
    'categories': 'Categories',
    'dateTimeCreated': 'DateTimeCreated',
    'dateTimeLastModified': 'DateTimeLastModified',
    'attendeeAddress': 'EmailAddress.Address',
    'attendeeName': 'EmailAddress.Name',
    'hasAttachments': 'HasAttachments',
    'importance': 'Importance',
    'iCalUId': 'iCalUId',
    'allDay': 'IsAllDay',
    'canceled': 'IsCancelled',
    'isOrganizer': 'IsOrganizer',
    'locationName': 'Location.DisplayName',
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
    'responseStatus': 'ResponseStatus',
    'seriesMasterId': 'SeriesMasterId',
    'showAs': 'ShowAs',
    'dateTimeStart': 'Start',
    'startTimeZone': 'StartTimeZone',
    'dateTimeEnd': 'End',
    'endTimeZone': 'EndTimeZone',
    'subject': 'Subject',
    'type': 'Type',
    'url': 'WebLink',
    'privacy': 'Sensitivity'
};
exports.default = Office365CalendarAdapter;
//# sourceMappingURL=index.js.map