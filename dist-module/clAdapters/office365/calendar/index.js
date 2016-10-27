import _regeneratorRuntime from 'babel-runtime/regenerator';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _extends from 'babel-runtime/helpers/extends';
import _Promise from 'babel-runtime/core-js/promise';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _class, _temp;

import moment from 'moment';
import * as _ from 'lodash';
import Office365BaseAdapter from '../base/Adapter';

/**
 * Office 365 Calendar adapter
 */
var Office365CalendarAdapter = (_temp = _class = function (_Office365BaseAdapter) {
  _inherits(Office365CalendarAdapter, _Office365BaseAdapter);

  function Office365CalendarAdapter() {
    _classCallCheck(this, Office365CalendarAdapter);

    return _possibleConstructorReturn(this, (Office365CalendarAdapter.__proto__ || _Object$getPrototypeOf(Office365CalendarAdapter)).apply(this, arguments));
  }

  _createClass(Office365CalendarAdapter, [{
    key: 'getBatchData',


    // collect these fields always...
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(userProfiles, filterStartDate, filterEndDate, additionalFields) {
        var _this2 = this;

        var fieldNameMap, dataAdapterRunStats, eventData, results;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fieldNameMap = this.constructor.fieldNameMap;
                dataAdapterRunStats = {
                  emails: userProfiles,
                  filterStartDate: filterStartDate,
                  filterEndDate: filterEndDate,
                  success: false,
                  runDate: moment().utc().toDate()
                };
                _context.prev = 2;
                _context.next = 5;
                return _Promise.all(userProfiles.map(function (userProfile) {
                  return _this2.getUserData({
                    userProfile: userProfile,
                    filterStartDate: filterStartDate,
                    filterEndDate: filterEndDate,
                    additionalFields: additionalFields,
                    apiType: 'calendarview'
                  });
                }));

              case 5:
                eventData = _context.sent;


                // replace data keys with desired mappings...
                results = _.map(eventData, function (user) {
                  return _extends({}, user.userProfile, {
                    filterStartDate: user.filterStartDate,
                    filterEndDate: user.filterEndDate,
                    success: user.success,
                    errorMessage: user.errorMessage,
                    // map data with desired key names...
                    data: _.map(user.data || [], function (originalEvent) {
                      var mappedEvent = {};

                      // change to desired names
                      _.each(fieldNameMap, function (have, want) {
                        var mapped = _.get(originalEvent, have);
                        if (mapped !== undefined) {
                          mappedEvent[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                        }
                      });

                      if (mappedEvent.responseStatus && mappedEvent.responseStatus.Response) {
                        mappedEvent.responseStatus = mappedEvent.responseStatus.Response;
                      }

                      mappedEvent['attendees'] = originalEvent[fieldNameMap['attendees']].map(function (attendee) {
                        return {
                          address: _.get(attendee, fieldNameMap['attendeeAddress']),
                          name: _.get(attendee, fieldNameMap['attendeeName']),
                          response: _.get(attendee, 'Status')
                        };
                      });

                      return mappedEvent;
                    })
                  });
                });

                // return results and success!

                return _context.abrupt('return', _extends({}, dataAdapterRunStats, {
                  results: results,
                  success: true
                }));

              case 10:
                _context.prev = 10;
                _context.t0 = _context['catch'](2);

                console.log(_context.t0.stack);
                console.log('Office365 GetBatchData Error: ' + _JSON$stringify(_context.t0));
                return _context.abrupt('return', _extends({}, dataAdapterRunStats, { errorMessage: _context.t0 }));

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 10]]);
      }));

      function getBatchData(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return getBatchData;
    }()

    // convert the names of the api response data

  }]);

  return Office365CalendarAdapter;
}(Office365BaseAdapter), _class.baseFields = ['Id', 'Attendees', 'Calendar', 'Categories', 'DateTimeCreated', 'DateTimeLastModified', 'End', 'EndTimeZone', 'HasAttachments', 'Importance', 'iCalUID', 'IsAllDay', 'IsCancelled', 'IsOrganizer', 'Location', 'Organizer', 'Recurrence', 'ResponseRequested', 'ResponseStatus', 'SeriesMasterId', 'ShowAs', 'Start', 'StartTimeZone', 'Subject', 'Type', 'WebLink', 'Sensitivity'], _class.fieldNameMap = {
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
  'recurrance': 'Recurrance',
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
}, _temp);
export { Office365CalendarAdapter as default };
//# sourceMappingURL=../../../clAdapters/office365/calendar/index.js.map