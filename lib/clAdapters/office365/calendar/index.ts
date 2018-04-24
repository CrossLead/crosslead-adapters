import * as moment                     from 'moment';
import * as _                          from 'lodash';
import Office365BaseAdapter            from '../base/Adapter';
import * as request                    from 'request-promise';
import { DateRange, UserProfile }      from '../../../common/types';
import { sanitize }                    from '../../util/util';


const mapVal = (name: string, val: any) => {

    if ( !val ) {
        return val;
    }

    if (val.Content) {
        return sanitize(val.Content);
    }

    if (/^(start|end|create)Time/.test(name)) {
        return new Date(val);
    }

    return val;
};

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
    'Sensitivity',
    'Body',
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
    'privacy':                             'Sensitivity',
    'description':                         'Body',
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
            _.each(fieldNameMap, (origField: string, mappedField: string) => {
              const origVal = _.get(originalEvent, origField);
              mappedEvent[mappedField] = mapVal(mappedField, origVal);
            });

            if (mappedEvent.response && mappedEvent.response.Response) {
              mappedEvent.response = mappedEvent.response.Response;
            }

            mappedEvent[`attendees`] = originalEvent[fieldNameMap[`attendees`]]
              .map((attendee: any) => {
                return {
                  email:    _.get(attendee, fieldNameMap[`attendeeAddress`]),
                  name:     _.get(attendee, fieldNameMap[`attendeeName`]),
                  response: _.get(attendee, 'Status.Response', 'None')
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

    } catch (err) {
      console.error( `Caught error calling getBatchData: ${err.toString()}` );
      return { ...dataAdapterRunStats, errorMessage: new Error(err.toString()) };
    }

  }

  async getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange|null> {

    const accessToken = await this.getAccessToken(),
          { apiVersion } = this._config.options;
    const emailAddr = userProfile.emailAfterMapping;
    const uri = `https://outlook.office365.com/api/v${apiVersion}/users('${emailAddr}')/events/${eventId}?$select=Start,End`;
    const requestOptions = {
      method: 'GET',
      uri,
      headers : {
        Authorization: `Bearer ${accessToken}`,
        Accept:        'application/json;odata.metadata=none'
      }
    };

    let ret = null;
    try {
      const value: any = JSON.parse(await request(requestOptions)) || {};
      const start = value && value.Start ? value.Start : null;
      const end = value && value.End ? value.End : null;
      ret = {start, end};
    } catch (err) {
      console.error( `Caught error getting start time of event ${eventId} for ${emailAddr}: ${err.toString()}` );
    }

    return ret;
  }

}
