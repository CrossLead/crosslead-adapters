import moment                     from 'moment';
import _                          from 'lodash';
import Office365BaseAdapter       from '../base/Adapter';


/**
 * Office 365 Calendar adapter
 */
export default class Office365CalendarAdapter extends Office365BaseAdapter {

  // collect these fields always...
  static baseFields = [
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
    'WebLink'
  ]

  // convert the names of the api response data
  static fieldNameMap = {
    // Desired...                          // Given...
    'events':                              'value',
    'attendees':                           'Attendees',
    'calendarName':                        'Calendar',
    'categories':                          'Categories',
    'dateTimeCreated':                     'DateTimeCreated',
    'dateTimeLastModified':                'DateTimeLastModified',
    'attendeeAddress':                     'EmailAddress.Address',
    'attendeeName':                        'EmailAddress.Name',
    'hasAttachments':                      'HasAttachments',
    'importance':                          'Importance',
    'iCalUID':                             'iCalUID',
    'allDay':                              'IsAllDay',
    'canceled':                            'IsCancelled',
    'isOrganizer':                         'IsOrganizer',
    'locationName':                        'Location.DisplayName',
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
    'recurrance':                          'Recurrance',
    'responseRequested':                   'ResponseRequested',
    'responseStatus':                      'ResponseStatus',
    'seriesMasterId':                      'SeriesMasterId',
    'showAs':                              'ShowAs',
    'dateTimeStart':                       'Start',
    'startTimeZone':                       'StartTimeZone',
    'subject':                             'Subject',
    'type':                                'Type',
    'url':                                 'WebLink'
  }


  async getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {

    const { fieldNameMap } = this.constructor,
          dataAdapterRunStats   = {
            emails,
            filterStartDate,
            filterEndDate,
            success: false,
            runDate: moment().utc().toDate()
          };

    try {

      const eventData = await* emails.map(email => this.getUserData({
        email,
        filterStartDate,
        filterEndDate,
        additionalFields,
        apiType: 'events',
        $filter:  ` DateTimeCreated ge ${filterStartDate.toISOString().substring(0, 10)}
                      and DateTimeCreated lt ${filterEndDate.toISOString().substring(0, 10)}
                  `.replace(/\s+/g, ' ')
                   .trim()
      }));

      // replace data keys with desired mappings...
      const results = _.map(eventData, user => {
        const eventArray = (user.success && user.data[fieldNameMap.events]) || [];
        return {
          email:            user.email,
          filterStartDate:  user.filterStartDate,
          filterEndDate:    user.filterEndDate,
          success:          user.success,
          errorMessage:     user.errorMessage,
          // map data with desired key names...
          data: _.map(eventArray, originalEvent => {
            const mappedEvent = {};

            // change to desired names
            _.each(fieldNameMap, (have, want) => {
              const mapped = _.get(originalEvent, have);
              mappedEvent[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
            });

            mappedEvent[`attendees`] = originalEvent[fieldNameMap[`attendees`]]
              .map(attendee => {
                return {
                  address: _.get(attendee, fieldNameMap[`attendeeAddress`]),
                  name:    _.get(attendee, fieldNameMap[`attendeeName`])
                }
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
