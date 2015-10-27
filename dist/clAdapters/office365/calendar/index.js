'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _baseAdapter = require('../base/Adapter');

var _baseAdapter2 = _interopRequireDefault(_baseAdapter);

/**
 * Office 365 Calendar adapter
 */

var Office365CalendarAdapter = (function (_Office365BaseAdapter) {
  _inherits(Office365CalendarAdapter, _Office365BaseAdapter);

  function Office365CalendarAdapter() {
    _classCallCheck(this, Office365CalendarAdapter);

    _get(Object.getPrototypeOf(Office365CalendarAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365CalendarAdapter, [{
    key: 'getBatchData',
    value: function getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {
      var fieldNameMap, dataAdapterRunStats, eventData, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            fieldNameMap = this.constructor.fieldNameMap;
            dataAdapterRunStats = {
              emails: emails,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              success: false,
              runDate: (0, _moment2['default'])().utc().toDate()
            };
            context$2$0.prev = 2;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(_Promise.all(emails.map(function (email) {
              return _this.getUserData({
                email: email,
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                additionalFields: additionalFields,
                apiType: 'events',
                $filter: (' DateTimeCreated ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                      and DateTimeCreated lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                  ').replace(/\s+/g, ' ').trim()
              });
            })));

          case 5:
            eventData = context$2$0.sent;

            console.log(JSON.stringify(eventData[0].data, null, 2));

            // replace data keys with desired mappings...
            results = _lodash2['default'].map(eventData, function (user) {
              return {
                email: user.email,
                filterStartDate: user.filterStartDate,
                filterEndDate: user.filterEndDate,
                success: user.success,
                errorMessage: user.errorMessage,
                // map data with desired key names...
                data: _lodash2['default'].map(user.data || [], function (originalEvent) {
                  var mappedEvent = {};

                  // change to desired names
                  _lodash2['default'].each(fieldNameMap, function (have, want) {
                    var mapped = _lodash2['default'].get(originalEvent, have);
                    if (mapped !== undefined) {
                      mappedEvent[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                    }
                  });

                  mappedEvent['attendees'] = originalEvent[fieldNameMap['attendees']].map(function (attendee) {
                    return {
                      address: _lodash2['default'].get(attendee, fieldNameMap['attendeeAddress']),
                      name: _lodash2['default'].get(attendee, fieldNameMap['attendeeName']),
                      response: _lodash2['default'].get(attendee, 'Status')
                    };
                  });

                  return mappedEvent;
                })
              };
            });
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, {
              results: results,
              success: true
            }));

          case 11:
            context$2$0.prev = 11;
            context$2$0.t0 = context$2$0['catch'](2);

            console.log(context$2$0.t0.stack);
            console.log('Office365 GetBatchData Error: ' + JSON.stringify(context$2$0.t0));
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, { errorMessage: context$2$0.t0 }));

          case 16:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[2, 11]]);
    }
  }], [{
    key: 'baseFields',

    // collect these fields always...
    value: ['Id', 'Attendees', 'Calendar', 'Categories', 'DateTimeCreated', 'DateTimeLastModified', 'End', 'EndTimeZone', 'HasAttachments', 'Importance', 'iCalUID', 'IsAllDay', 'IsCancelled', 'IsOrganizer', 'Location', 'Organizer', 'Recurrence', 'ResponseRequested', 'ResponseStatus', 'SeriesMasterId', 'ShowAs', 'Start', 'StartTimeZone', 'Subject', 'Type', 'WebLink'],

    // convert the names of the api response data
    enumerable: true
  }, {
    key: 'fieldNameMap',
    value: {
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
      'iCalUID': 'iCalUID',
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
      'url': 'WebLink'
    },
    enumerable: true
  }]);

  return Office365CalendarAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365CalendarAdapter;
module.exports = exports['default'];

// return results and success!
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2NhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQXVDLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQTRFekIsc0JBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRWpFLFlBQVksRUFDZCxtQkFBbUIsRUFVakIsU0FBUyxFQWVULE9BQU87Ozs7OztBQTFCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFOLE1BQU07QUFDTiw2QkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBYSxFQUFiLGFBQWE7QUFDYixxQkFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO2FBQ2pDOzs7MERBSW9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO3FCQUFJLE1BQUssV0FBVyxDQUFDO0FBQzVELHFCQUFLLEVBQUwsS0FBSztBQUNMLCtCQUFlLEVBQWYsZUFBZTtBQUNmLDZCQUFhLEVBQWIsYUFBYTtBQUNiLGdDQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsdUJBQU8sRUFBRSxRQUFRO0FBQ2pCLHVCQUFPLEVBQUcsMEJBQXVCLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyx1REFDeEMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDJCQUN2RSxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUNwQixJQUFJLEVBQUU7ZUFDbkIsQ0FBQzthQUFBLENBQUM7OztBQVZHLHFCQUFTOztBQVlmLG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBR2xELG1CQUFPLEdBQUcsb0JBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFBLElBQUksRUFBSTtBQUN2QyxxQkFBTztBQUNMLHFCQUFLLEVBQWEsSUFBSSxDQUFDLEtBQUs7QUFDNUIsK0JBQWUsRUFBRyxJQUFJLENBQUMsZUFBZTtBQUN0Qyw2QkFBYSxFQUFLLElBQUksQ0FBQyxhQUFhO0FBQ3BDLHVCQUFPLEVBQVcsSUFBSSxDQUFDLE9BQU87QUFDOUIsNEJBQVksRUFBTSxJQUFJLENBQUMsWUFBWTs7QUFFbkMsb0JBQUksRUFBRSxvQkFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsVUFBQSxhQUFhLEVBQUk7QUFDNUMsc0JBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQzs7O0FBR3ZCLHNDQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ25DLHdCQUFNLE1BQU0sR0FBRyxvQkFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFDLHdCQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDeEIsaUNBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQztxQkFDeEU7bUJBQ0YsQ0FBQyxDQUFDOztBQUVILDZCQUFXLGFBQWEsR0FBRyxhQUFhLENBQUMsWUFBWSxhQUFhLENBQUMsQ0FDaEUsR0FBRyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ2YsMkJBQU87QUFDTCw2QkFBTyxFQUFHLG9CQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxtQkFBbUIsQ0FBQztBQUMxRCwwQkFBSSxFQUFNLG9CQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxnQkFBZ0IsQ0FBQztBQUN2RCw4QkFBUSxFQUFFLG9CQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO3FCQUNwQyxDQUFBO21CQUNGLENBQUMsQ0FBQzs7QUFFTCx5QkFBTyxXQUFXLENBQUM7aUJBQ3BCLENBQUM7ZUFDSCxDQUFDO2FBQ0gsQ0FBQzs2REFJRyxtQkFBbUI7QUFDdEIscUJBQU8sRUFBUCxPQUFPO0FBQ1AscUJBQU8sRUFBRSxJQUFJOzs7Ozs7O0FBSWYsbUJBQU8sQ0FBQyxHQUFHLENBQUMsZUFBYSxLQUFLLENBQUMsQ0FBQztBQUNoQyxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUMsU0FBUyxnQkFBYyxDQUFDLENBQUM7NkRBQ2pFLG1CQUFtQixJQUFFLFlBQVksZ0JBQUE7Ozs7Ozs7S0FHaEQ7Ozs7O1dBbkptQixDQUNsQixJQUFJLEVBQ0osV0FBVyxFQUNYLFVBQVUsRUFDVixZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLHNCQUFzQixFQUN0QixLQUFLLEVBQ0wsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osU0FBUyxFQUNULFVBQVUsRUFDVixhQUFhLEVBQ2IsYUFBYSxFQUNiLFVBQVUsRUFDVixXQUFXLEVBQ1gsWUFBWSxFQUNaLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLFFBQVEsRUFDUixPQUFPLEVBQ1AsZUFBZSxFQUNmLFNBQVMsRUFDVCxNQUFNLEVBQ04sU0FBUyxDQUNWOzs7Ozs7V0FHcUI7O0FBRXBCLGVBQVMsRUFBOEIsSUFBSTtBQUMzQyxpQkFBVyxFQUE0QixXQUFXO0FBQ2xELG9CQUFjLEVBQXlCLFVBQVU7QUFDakQsa0JBQVksRUFBMkIsWUFBWTtBQUNuRCx1QkFBaUIsRUFBc0IsaUJBQWlCO0FBQ3hELDRCQUFzQixFQUFpQixzQkFBc0I7QUFDN0QsdUJBQWlCLEVBQXNCLHNCQUFzQjtBQUM3RCxvQkFBYyxFQUF5QixtQkFBbUI7QUFDMUQsc0JBQWdCLEVBQXVCLGdCQUFnQjtBQUN2RCxrQkFBWSxFQUEyQixZQUFZO0FBQ25ELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxjQUFRLEVBQStCLFVBQVU7QUFDakQsZ0JBQVUsRUFBNkIsYUFBYTtBQUNwRCxtQkFBYSxFQUEwQixhQUFhO0FBQ3BELG9CQUFjLEVBQXlCLHNCQUFzQjtBQUM3RCw2QkFBdUIsRUFBZ0IseUJBQXlCO0FBQ2hFLDJCQUFxQixFQUFrQix1QkFBdUI7QUFDOUQsNEJBQXNCLEVBQWlCLHdCQUF3QjtBQUMvRCxzQ0FBZ0MsRUFBTyxrQ0FBa0M7QUFDekUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG1DQUE2QixFQUFVLCtCQUErQjtBQUN0RSwyQ0FBcUMsRUFBRSx1Q0FBdUM7QUFDOUUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG9DQUE4QixFQUFTLGdDQUFnQztBQUN2RSxxQkFBZSxFQUF3Qiw2QkFBNkI7QUFDcEUsc0JBQWdCLEVBQXVCLGdDQUFnQztBQUN2RSxrQkFBWSxFQUEyQixZQUFZO0FBQ25ELHlCQUFtQixFQUFvQixtQkFBbUI7QUFDMUQsc0JBQWdCLEVBQXVCLGdCQUFnQjtBQUN2RCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELGNBQVEsRUFBK0IsUUFBUTtBQUMvQyxxQkFBZSxFQUF3QixPQUFPO0FBQzlDLHFCQUFlLEVBQXdCLGVBQWU7QUFDdEQsbUJBQWEsRUFBMEIsS0FBSztBQUM1QyxtQkFBYSxFQUEwQixhQUFhO0FBQ3BELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxZQUFNLEVBQWlDLE1BQU07QUFDN0MsV0FBSyxFQUFrQyxTQUFTO0tBQ2pEOzs7O1NBekVrQix3QkFBd0I7OztxQkFBeEIsd0JBQXdCIiwiZmlsZSI6ImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2NhbGVuZGFyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgXyAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbG9kYXNoJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlQWRhcHRlciAgICAgICBmcm9tICcuLi9iYXNlL0FkYXB0ZXInO1xuXG5cbi8qKlxuICogT2ZmaWNlIDM2NSBDYWxlbmRhciBhZGFwdGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIE9mZmljZTM2NUJhc2VBZGFwdGVyIHtcblxuICAvLyBjb2xsZWN0IHRoZXNlIGZpZWxkcyBhbHdheXMuLi5cbiAgc3RhdGljIGJhc2VGaWVsZHMgPSBbXG4gICAgJ0lkJyxcbiAgICAnQXR0ZW5kZWVzJyxcbiAgICAnQ2FsZW5kYXInLFxuICAgICdDYXRlZ29yaWVzJyxcbiAgICAnRGF0ZVRpbWVDcmVhdGVkJyxcbiAgICAnRGF0ZVRpbWVMYXN0TW9kaWZpZWQnLFxuICAgICdFbmQnLFxuICAgICdFbmRUaW1lWm9uZScsXG4gICAgJ0hhc0F0dGFjaG1lbnRzJyxcbiAgICAnSW1wb3J0YW5jZScsXG4gICAgJ2lDYWxVSUQnLFxuICAgICdJc0FsbERheScsXG4gICAgJ0lzQ2FuY2VsbGVkJyxcbiAgICAnSXNPcmdhbml6ZXInLFxuICAgICdMb2NhdGlvbicsXG4gICAgJ09yZ2FuaXplcicsXG4gICAgJ1JlY3VycmVuY2UnLFxuICAgICdSZXNwb25zZVJlcXVlc3RlZCcsXG4gICAgJ1Jlc3BvbnNlU3RhdHVzJyxcbiAgICAnU2VyaWVzTWFzdGVySWQnLFxuICAgICdTaG93QXMnLFxuICAgICdTdGFydCcsXG4gICAgJ1N0YXJ0VGltZVpvbmUnLFxuICAgICdTdWJqZWN0JyxcbiAgICAnVHlwZScsXG4gICAgJ1dlYkxpbmsnXG4gIF1cblxuICAvLyBjb252ZXJ0IHRoZSBuYW1lcyBvZiB0aGUgYXBpIHJlc3BvbnNlIGRhdGFcbiAgc3RhdGljIGZpZWxkTmFtZU1hcCA9IHtcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxuICAgICdldmVudElkJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJZCcsXG4gICAgJ2F0dGVuZGVlcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0F0dGVuZGVlcycsXG4gICAgJ2NhbGVuZGFyTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0NhbGVuZGFyJyxcbiAgICAnY2F0ZWdvcmllcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ2RhdGVUaW1lQ3JlYXRlZCc6ICAgICAgICAgICAgICAgICAgICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXG4gICAgJ2RhdGVUaW1lTGFzdE1vZGlmaWVkJzogICAgICAgICAgICAgICAgJ0RhdGVUaW1lTGFzdE1vZGlmaWVkJyxcbiAgICAnYXR0ZW5kZWVBZGRyZXNzJzogICAgICAgICAgICAgICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdhdHRlbmRlZU5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2hhc0F0dGFjaG1lbnRzJzogICAgICAgICAgICAgICAgICAgICAgJ0hhc0F0dGFjaG1lbnRzJyxcbiAgICAnaW1wb3J0YW5jZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnSW1wb3J0YW5jZScsXG4gICAgJ2lDYWxVSUQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lDYWxVSUQnLFxuICAgICdhbGxEYXknOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJc0FsbERheScsXG4gICAgJ2NhbmNlbGVkJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lzQ2FuY2VsbGVkJyxcbiAgICAnaXNPcmdhbml6ZXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnSXNPcmdhbml6ZXInLFxuICAgICdsb2NhdGlvbk5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdMb2NhdGlvbi5EaXNwbGF5TmFtZScsXG4gICAgJ2xvY2F0aW9uQWRkcmVzc1N0cmVldCc6ICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkFkZHJlc3MuU3RyZWV0JyxcbiAgICAnbG9jYXRpb25BZGRyZXNzQ2l0eSc6ICAgICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5DaXR5JyxcbiAgICAnbG9jYXRpb25BZGRyZXNzU3RhdGUnOiAgICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5TdGF0ZScsXG4gICAgJ2xvY2F0aW9uQWRkcmVzc0NvdW50cnlPclJlZ2lvbic6ICAgICAgJ0xvY2F0aW9uLkFkZHJlc3MuQ291bnRyeU9yUmVnaW9uJyxcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0FjY3VyYWN5JzogICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuQWNjdXJhY3knLFxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzQWx0aXR1ZGUnOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5BbHRpdHVkZScsXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNBbHRpdHVkZUFjY3VyYWN5JzogJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkFsdGl0dWRlQWNjdXJhY3knLFxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzTGF0aXR1ZGUnOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5MYXRpdHVkZScsXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNMb25naXR1ZGUnOiAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkxvbmdpdHVkZScsXG4gICAgJ29yZ2FuaXplck5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgJ09yZ2FuaXplci5FbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ29yZ2FuaXplckVtYWlsJzogICAgICAgICAgICAgICAgICAgICAgJ09yZ2FuaXplci5FbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ3JlY3VycmFuY2UnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY3VycmFuY2UnLFxuICAgICdyZXNwb25zZVJlcXVlc3RlZCc6ICAgICAgICAgICAgICAgICAgICdSZXNwb25zZVJlcXVlc3RlZCcsXG4gICAgJ3Jlc3BvbnNlU3RhdHVzJzogICAgICAgICAgICAgICAgICAgICAgJ1Jlc3BvbnNlU3RhdHVzJyxcbiAgICAnc2VyaWVzTWFzdGVySWQnOiAgICAgICAgICAgICAgICAgICAgICAnU2VyaWVzTWFzdGVySWQnLFxuICAgICdzaG93QXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdTaG93QXMnLFxuICAgICdkYXRlVGltZVN0YXJ0JzogICAgICAgICAgICAgICAgICAgICAgICdTdGFydCcsXG4gICAgJ3N0YXJ0VGltZVpvbmUnOiAgICAgICAgICAgICAgICAgICAgICAgJ1N0YXJ0VGltZVpvbmUnLFxuICAgICdkYXRlVGltZUVuZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICdFbmQnLFxuICAgICdlbmRUaW1lWm9uZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICdFbmRUaW1lWm9uZScsXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N1YmplY3QnLFxuICAgICd0eXBlJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUeXBlJyxcbiAgICAndXJsJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV2ViTGluaydcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XG5cbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzICAgPSB7XG4gICAgICAgICAgICBlbWFpbHMsXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICAgIH07XG5cbiAgICB0cnkge1xuXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCogZW1haWxzLm1hcChlbWFpbCA9PiB0aGlzLmdldFVzZXJEYXRhKHtcbiAgICAgICAgZW1haWwsXG4gICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgYWRkaXRpb25hbEZpZWxkcyxcbiAgICAgICAgYXBpVHlwZTogJ2V2ZW50cycsXG4gICAgICAgICRmaWx0ZXI6ICBgIERhdGVUaW1lQ3JlYXRlZCBnZSAke2ZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lQ3JlYXRlZCBsdCAke2ZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxuICAgICAgICAgICAgICAgICAgYC5yZXBsYWNlKC9cXHMrL2csICcgJylcbiAgICAgICAgICAgICAgICAgICAudHJpbSgpXG4gICAgICB9KSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGV2ZW50RGF0YVswXS5kYXRhLCBudWxsLCAyKSk7XG5cbiAgICAgIC8vIHJlcGxhY2UgZGF0YSBrZXlzIHdpdGggZGVzaXJlZCBtYXBwaW5ncy4uLlxuICAgICAgY29uc3QgcmVzdWx0cyA9IF8ubWFwKGV2ZW50RGF0YSwgdXNlciA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZW1haWw6ICAgICAgICAgICAgdXNlci5lbWFpbCxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGU6ICB1c2VyLmZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlOiAgICB1c2VyLmZpbHRlckVuZERhdGUsXG4gICAgICAgICAgc3VjY2VzczogICAgICAgICAgdXNlci5zdWNjZXNzLFxuICAgICAgICAgIGVycm9yTWVzc2FnZTogICAgIHVzZXIuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgIC8vIG1hcCBkYXRhIHdpdGggZGVzaXJlZCBrZXkgbmFtZXMuLi5cbiAgICAgICAgICBkYXRhOiBfLm1hcCh1c2VyLmRhdGEgfHwgW10sIG9yaWdpbmFsRXZlbnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFwcGVkRXZlbnQgPSB7fTtcblxuICAgICAgICAgICAgLy8gY2hhbmdlIHRvIGRlc2lyZWQgbmFtZXNcbiAgICAgICAgICAgIF8uZWFjaChmaWVsZE5hbWVNYXAsIChoYXZlLCB3YW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRXZlbnQsIGhhdmUpO1xuICAgICAgICAgICAgICBpZiAobWFwcGVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBtYXBwZWRFdmVudFt3YW50XSA9IC9eZGF0ZVRpbWUvLnRlc3Qod2FudCkgPyBuZXcgRGF0ZShtYXBwZWQpIDogbWFwcGVkO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbWFwcGVkRXZlbnRbYGF0dGVuZGVlc2BdID0gb3JpZ2luYWxFdmVudFtmaWVsZE5hbWVNYXBbYGF0dGVuZGVlc2BdXVxuICAgICAgICAgICAgICAubWFwKGF0dGVuZGVlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgYWRkcmVzczogIF8uZ2V0KGF0dGVuZGVlLCBmaWVsZE5hbWVNYXBbYGF0dGVuZGVlQWRkcmVzc2BdKSxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICAgICBfLmdldChhdHRlbmRlZSwgZmllbGROYW1lTWFwW2BhdHRlbmRlZU5hbWVgXSksXG4gICAgICAgICAgICAgICAgICByZXNwb25zZTogXy5nZXQoYXR0ZW5kZWUsICdTdGF0dXMnKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtYXBwZWRFdmVudDtcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHJldHVybiByZXN1bHRzIGFuZCBzdWNjZXNzIVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cyxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcbiAgICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3JNZXNzYWdlKSk7XG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcbiAgICB9XG5cbiAgfVxuXG5cbn1cbiJdfQ==
//# sourceMappingURL=index.js.map
