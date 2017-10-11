import * as moment                     from 'moment';
import * as _                          from 'lodash';
import Office365BaseAdapter       from '../base/Adapter';


/**
 * Office 365 Calendar adapter
 */
export default class Office365CalendarAdapter extends Office365BaseAdapter {

  // collect these fields always...
  static baseFields = [
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
  static fieldNameMap: { [key: string]: string } = {
    // Desired...                          // Given...
    'eventId':                             'Id',
    'attendees':                           'Attendees',
    'calendarName':                        'Calendar',
    'categories':                          'Categories',
    'createTime':                          'DateTimeCreated',
    'dateTimeLastModified':                'DateTimeLastModified',
    'attendeeAddress':                     'EmailAddress.Address',
    'attendeeName':                        'EmailAddress.Name',
    'hasAttachments':                      'HasAttachments',
    'importance':                          'Importance',
    'iCalUId':                             'iCalUId',
    'allDay':                              'IsAllDay',
    'canceled':                            'IsCancelled',
    'isOrganizer':                         'IsOrganizer',
    'location':                            'Location.DisplayName',
    'locationAddressStreet':               'Location.Address.Street',
    'locationAddressCity':                 'Location.Address.City',
    'locationAddressState':                'Location.Address.State',
    'locationAddressCountryOrRegion':      'Location.Address.CountryOrRegion',
    'locationCoordinatesAccuracy':         'Location.Coordinates.Accuracy',
    'locationCoordinatesAltitude':         'Location.Coordinates.Altitude',
    'locationCoordinatesAltitudeAccuracy': 'Location.Coordinates.AltitudeAccuracy',
    'locationCoordinatesLatitude':         'Location.Coordinates.Latitude',
    'locationCoordinatesLongitude':        'Location.Coordinates.Longitude',
    'organizerName':                       'Organizer.EmailAddress.Name',
    'organizerEmail':                      'Organizer.EmailAddress.Address',
    'recurrence':                          'Recurrence',
    'responseRequested':                   'ResponseRequested',
    'response':                            'ResponseStatus',
    'seriesMasterId':                      'SeriesMasterId',
    'showAs':                              'ShowAs',
    'startTime':                           'Start',
    'startTimeZone':                       'StartTimeZone',
    'endTime':                             'End',
    'endTimeZone':                         'EndTimeZone',
    'name':                                'Subject',
    'type':                                'Type',
    'url':                                 'WebLink',
    'privacy':                             'Sensitivity'
  };


  async getBatchData(userProfiles: any[], filterStartDate: Date, filterEndDate: Date, additionalFields?: any) {

    const { fieldNameMap } = Office365CalendarAdapter,
          dataAdapterRunStats   = {
            emails: userProfiles,
            filterStartDate,
            filterEndDate,
            success: false,
            runDate: moment().utc().toDate()
          };

    try {
      const eventData = await Promise.all(userProfiles.map(userProfile => this.getUserData({
        userProfile,
        filterStartDate,
        filterEndDate,
        additionalFields,
        apiType: 'calendarview'
      })));

      // replace data keys with desired mappings...
      const results = _.map(eventData, (user: any) => {
        return {
          ...user.userProfile,
          filterStartDate:  user.filterStartDate,
          filterEndDate:    user.filterEndDate,
          success:          user.success,
          errorMessage:     user.errorMessage,
          // map data with desired key names...
          data: _.map(user.data || [], (originalEvent: any) => {
            const mappedEvent: any = {};

            // change to desired names
            _.each(fieldNameMap, (have: string, want: string) => {
              const mapped = _.get(originalEvent, have);
              if (mapped !== undefined) {
                mappedEvent[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
              }
            });

            if (mappedEvent.responseStatus && mappedEvent.responseStatus.Response) {
              mappedEvent.responseStatus = mappedEvent.responseStatus.Response;
            }

            mappedEvent[`attendees`] = originalEvent[fieldNameMap[`attendees`]]
              .map((attendee: any) => {
                return {
                  email:    _.get(attendee, fieldNameMap[`attendeeAddress`]),
                  name:     _.get(attendee, fieldNameMap[`attendeeName`]),
                  response: _.get(attendee, 'Status')
                };
              });

            return mappedEvent;
          })
        };
      });

      // return results and success!
      return {
        ...dataAdapterRunStats,
        results,
        success: true
      };

    } catch (errorMessage) {
      console.log(errorMessage.stack);
      console.log('Office365 GetBatchData Error: ' + JSON.stringify(errorMessage));
      return { ...dataAdapterRunStats, errorMessage };
    }

  }


}
