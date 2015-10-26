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
                    mappedEvent[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
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

          case 10:
            context$2$0.prev = 10;
            context$2$0.t0 = context$2$0['catch'](2);

            console.log(context$2$0.t0.stack);
            console.log('Office365 GetBatchData Error: ' + JSON.stringify(context$2$0.t0));
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, { errorMessage: context$2$0.t0 }));

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[2, 10]]);
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

// replace data keys with desired mappings...

// return results and success!
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2NhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQXVDLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQTBFekIsc0JBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRWpFLFlBQVksRUFDZCxtQkFBbUIsRUFVakIsU0FBUyxFQWFULE9BQU87Ozs7OztBQXhCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFOLE1BQU07QUFDTiw2QkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBYSxFQUFiLGFBQWE7QUFDYixxQkFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO2FBQ2pDOzs7MERBSW9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO3FCQUFJLE1BQUssV0FBVyxDQUFDO0FBQzVELHFCQUFLLEVBQUwsS0FBSztBQUNMLCtCQUFlLEVBQWYsZUFBZTtBQUNmLDZCQUFhLEVBQWIsYUFBYTtBQUNiLGdDQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsdUJBQU8sRUFBRSxRQUFRO0FBQ2pCLHVCQUFPLEVBQUcsMEJBQXVCLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyx1REFDeEMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDJCQUN2RSxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUNwQixJQUFJLEVBQUU7ZUFDbkIsQ0FBQzthQUFBLENBQUM7OztBQVZHLHFCQUFTO0FBYVQsbUJBQU8sR0FBRyxvQkFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQUEsSUFBSSxFQUFJO0FBQ3ZDLHFCQUFPO0FBQ0wscUJBQUssRUFBYSxJQUFJLENBQUMsS0FBSztBQUM1QiwrQkFBZSxFQUFHLElBQUksQ0FBQyxlQUFlO0FBQ3RDLDZCQUFhLEVBQUssSUFBSSxDQUFDLGFBQWE7QUFDcEMsdUJBQU8sRUFBVyxJQUFJLENBQUMsT0FBTztBQUM5Qiw0QkFBWSxFQUFNLElBQUksQ0FBQyxZQUFZOztBQUVuQyxvQkFBSSxFQUFFLG9CQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRSxVQUFBLGFBQWEsRUFBSTtBQUM1QyxzQkFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDOzs7QUFHdkIsc0NBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbkMsd0JBQU0sTUFBTSxHQUFHLG9CQUFFLEdBQUcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUMsK0JBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQzttQkFDeEUsQ0FBQyxDQUFDOztBQUVILDZCQUFXLGFBQWEsR0FBRyxhQUFhLENBQUMsWUFBWSxhQUFhLENBQUMsQ0FDaEUsR0FBRyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ2YsMkJBQU87QUFDTCw2QkFBTyxFQUFHLG9CQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxtQkFBbUIsQ0FBQztBQUMxRCwwQkFBSSxFQUFNLG9CQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxnQkFBZ0IsQ0FBQztBQUN2RCw4QkFBUSxFQUFFLG9CQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO3FCQUNwQyxDQUFBO21CQUNGLENBQUMsQ0FBQzs7QUFFTCx5QkFBTyxXQUFXLENBQUM7aUJBQ3BCLENBQUM7ZUFDSCxDQUFDO2FBQ0gsQ0FBQzs2REFJRyxtQkFBbUI7QUFDdEIscUJBQU8sRUFBUCxPQUFPO0FBQ1AscUJBQU8sRUFBRSxJQUFJOzs7Ozs7O0FBSWYsbUJBQU8sQ0FBQyxHQUFHLENBQUMsZUFBYSxLQUFLLENBQUMsQ0FBQztBQUNoQyxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUMsU0FBUyxnQkFBYyxDQUFDLENBQUM7NkRBQ2pFLG1CQUFtQixJQUFFLFlBQVksZ0JBQUE7Ozs7Ozs7S0FHaEQ7Ozs7O1dBN0ltQixDQUNsQixJQUFJLEVBQ0osV0FBVyxFQUNYLFVBQVUsRUFDVixZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLHNCQUFzQixFQUN0QixLQUFLLEVBQ0wsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osU0FBUyxFQUNULFVBQVUsRUFDVixhQUFhLEVBQ2IsYUFBYSxFQUNiLFVBQVUsRUFDVixXQUFXLEVBQ1gsWUFBWSxFQUNaLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLFFBQVEsRUFDUixPQUFPLEVBQ1AsZUFBZSxFQUNmLFNBQVMsRUFDVCxNQUFNLEVBQ04sU0FBUyxDQUNWOzs7Ozs7V0FHcUI7O0FBRXBCLGVBQVMsRUFBOEIsSUFBSTtBQUMzQyxpQkFBVyxFQUE0QixXQUFXO0FBQ2xELG9CQUFjLEVBQXlCLFVBQVU7QUFDakQsa0JBQVksRUFBMkIsWUFBWTtBQUNuRCx1QkFBaUIsRUFBc0IsaUJBQWlCO0FBQ3hELDRCQUFzQixFQUFpQixzQkFBc0I7QUFDN0QsdUJBQWlCLEVBQXNCLHNCQUFzQjtBQUM3RCxvQkFBYyxFQUF5QixtQkFBbUI7QUFDMUQsc0JBQWdCLEVBQXVCLGdCQUFnQjtBQUN2RCxrQkFBWSxFQUEyQixZQUFZO0FBQ25ELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxjQUFRLEVBQStCLFVBQVU7QUFDakQsZ0JBQVUsRUFBNkIsYUFBYTtBQUNwRCxtQkFBYSxFQUEwQixhQUFhO0FBQ3BELG9CQUFjLEVBQXlCLHNCQUFzQjtBQUM3RCw2QkFBdUIsRUFBZ0IseUJBQXlCO0FBQ2hFLDJCQUFxQixFQUFrQix1QkFBdUI7QUFDOUQsNEJBQXNCLEVBQWlCLHdCQUF3QjtBQUMvRCxzQ0FBZ0MsRUFBTyxrQ0FBa0M7QUFDekUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG1DQUE2QixFQUFVLCtCQUErQjtBQUN0RSwyQ0FBcUMsRUFBRSx1Q0FBdUM7QUFDOUUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG9DQUE4QixFQUFTLGdDQUFnQztBQUN2RSxxQkFBZSxFQUF3Qiw2QkFBNkI7QUFDcEUsc0JBQWdCLEVBQXVCLGdDQUFnQztBQUN2RSxrQkFBWSxFQUEyQixZQUFZO0FBQ25ELHlCQUFtQixFQUFvQixtQkFBbUI7QUFDMUQsc0JBQWdCLEVBQXVCLGdCQUFnQjtBQUN2RCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELGNBQVEsRUFBK0IsUUFBUTtBQUMvQyxxQkFBZSxFQUF3QixPQUFPO0FBQzlDLHFCQUFlLEVBQXdCLGVBQWU7QUFDdEQsZUFBUyxFQUE4QixTQUFTO0FBQ2hELFlBQU0sRUFBaUMsTUFBTTtBQUM3QyxXQUFLLEVBQWtDLFNBQVM7S0FDakQ7Ozs7U0F2RWtCLHdCQUF3Qjs7O3FCQUF4Qix3QkFBd0IiLCJmaWxlIjoiY2xBZGFwdGVycy9vZmZpY2UzNjUvY2FsZW5kYXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9tZW50ICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbW9tZW50JztcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IE9mZmljZTM2NUJhc2VBZGFwdGVyICAgICAgIGZyb20gJy4uL2Jhc2UvQWRhcHRlcic7XG5cblxuLyoqXG4gKiBPZmZpY2UgMzY1IENhbGVuZGFyIGFkYXB0ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2ZmaWNlMzY1Q2FsZW5kYXJBZGFwdGVyIGV4dGVuZHMgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIge1xuXG4gIC8vIGNvbGxlY3QgdGhlc2UgZmllbGRzIGFsd2F5cy4uLlxuICBzdGF0aWMgYmFzZUZpZWxkcyA9IFtcbiAgICAnSWQnLFxuICAgICdBdHRlbmRlZXMnLFxuICAgICdDYWxlbmRhcicsXG4gICAgJ0NhdGVnb3JpZXMnLFxuICAgICdEYXRlVGltZUNyZWF0ZWQnLFxuICAgICdEYXRlVGltZUxhc3RNb2RpZmllZCcsXG4gICAgJ0VuZCcsXG4gICAgJ0VuZFRpbWVab25lJyxcbiAgICAnSGFzQXR0YWNobWVudHMnLFxuICAgICdJbXBvcnRhbmNlJyxcbiAgICAnaUNhbFVJRCcsXG4gICAgJ0lzQWxsRGF5JyxcbiAgICAnSXNDYW5jZWxsZWQnLFxuICAgICdJc09yZ2FuaXplcicsXG4gICAgJ0xvY2F0aW9uJyxcbiAgICAnT3JnYW5pemVyJyxcbiAgICAnUmVjdXJyZW5jZScsXG4gICAgJ1Jlc3BvbnNlUmVxdWVzdGVkJyxcbiAgICAnUmVzcG9uc2VTdGF0dXMnLFxuICAgICdTZXJpZXNNYXN0ZXJJZCcsXG4gICAgJ1Nob3dBcycsXG4gICAgJ1N0YXJ0JyxcbiAgICAnU3RhcnRUaW1lWm9uZScsXG4gICAgJ1N1YmplY3QnLFxuICAgICdUeXBlJyxcbiAgICAnV2ViTGluaydcbiAgXVxuXG4gIC8vIGNvbnZlcnQgdGhlIG5hbWVzIG9mIHRoZSBhcGkgcmVzcG9uc2UgZGF0YVxuICBzdGF0aWMgZmllbGROYW1lTWFwID0ge1xuICAgIC8vIERlc2lyZWQuLi4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdpdmVuLi4uXG4gICAgJ2V2ZW50SWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lkJyxcbiAgICAnYXR0ZW5kZWVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAnQXR0ZW5kZWVzJyxcbiAgICAnY2FsZW5kYXJOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnQ2FsZW5kYXInLFxuICAgICdjYXRlZ29yaWVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICdDYXRlZ29yaWVzJyxcbiAgICAnZGF0ZVRpbWVDcmVhdGVkJzogICAgICAgICAgICAgICAgICAgICAnRGF0ZVRpbWVDcmVhdGVkJyxcbiAgICAnZGF0ZVRpbWVMYXN0TW9kaWZpZWQnOiAgICAgICAgICAgICAgICAnRGF0ZVRpbWVMYXN0TW9kaWZpZWQnLFxuICAgICdhdHRlbmRlZUFkZHJlc3MnOiAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2F0dGVuZGVlTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnaGFzQXR0YWNobWVudHMnOiAgICAgICAgICAgICAgICAgICAgICAnSGFzQXR0YWNobWVudHMnLFxuICAgICdpbXBvcnRhbmNlJzogICAgICAgICAgICAgICAgICAgICAgICAgICdJbXBvcnRhbmNlJyxcbiAgICAnaUNhbFVJRCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaUNhbFVJRCcsXG4gICAgJ2FsbERheSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lzQWxsRGF5JyxcbiAgICAnY2FuY2VsZWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSXNDYW5jZWxsZWQnLFxuICAgICdpc09yZ2FuaXplcic6ICAgICAgICAgICAgICAgICAgICAgICAgICdJc09yZ2FuaXplcicsXG4gICAgJ2xvY2F0aW9uTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkRpc3BsYXlOYW1lJyxcbiAgICAnbG9jYXRpb25BZGRyZXNzU3RyZWV0JzogICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5TdHJlZXQnLFxuICAgICdsb2NhdGlvbkFkZHJlc3NDaXR5JzogICAgICAgICAgICAgICAgICdMb2NhdGlvbi5BZGRyZXNzLkNpdHknLFxuICAgICdsb2NhdGlvbkFkZHJlc3NTdGF0ZSc6ICAgICAgICAgICAgICAgICdMb2NhdGlvbi5BZGRyZXNzLlN0YXRlJyxcbiAgICAnbG9jYXRpb25BZGRyZXNzQ291bnRyeU9yUmVnaW9uJzogICAgICAnTG9jYXRpb24uQWRkcmVzcy5Db3VudHJ5T3JSZWdpb24nLFxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzQWNjdXJhY3knOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5BY2N1cmFjeScsXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNBbHRpdHVkZSc6ICAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkFsdGl0dWRlJyxcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0FsdGl0dWRlQWNjdXJhY3knOiAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuQWx0aXR1ZGVBY2N1cmFjeScsXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNMYXRpdHVkZSc6ICAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkxhdGl0dWRlJyxcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0xvbmdpdHVkZSc6ICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuTG9uZ2l0dWRlJyxcbiAgICAnb3JnYW5pemVyTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAnT3JnYW5pemVyLkVtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnb3JnYW5pemVyRW1haWwnOiAgICAgICAgICAgICAgICAgICAgICAnT3JnYW5pemVyLkVtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAncmVjdXJyYW5jZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVjdXJyYW5jZScsXG4gICAgJ3Jlc3BvbnNlUmVxdWVzdGVkJzogICAgICAgICAgICAgICAgICAgJ1Jlc3BvbnNlUmVxdWVzdGVkJyxcbiAgICAncmVzcG9uc2VTdGF0dXMnOiAgICAgICAgICAgICAgICAgICAgICAnUmVzcG9uc2VTdGF0dXMnLFxuICAgICdzZXJpZXNNYXN0ZXJJZCc6ICAgICAgICAgICAgICAgICAgICAgICdTZXJpZXNNYXN0ZXJJZCcsXG4gICAgJ3Nob3dBcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1Nob3dBcycsXG4gICAgJ2RhdGVUaW1lU3RhcnQnOiAgICAgICAgICAgICAgICAgICAgICAgJ1N0YXJ0JyxcbiAgICAnc3RhcnRUaW1lWm9uZSc6ICAgICAgICAgICAgICAgICAgICAgICAnU3RhcnRUaW1lWm9uZScsXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N1YmplY3QnLFxuICAgICd0eXBlJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUeXBlJyxcbiAgICAndXJsJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV2ViTGluaydcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XG5cbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzICAgPSB7XG4gICAgICAgICAgICBlbWFpbHMsXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICAgIH07XG5cbiAgICB0cnkge1xuXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCogZW1haWxzLm1hcChlbWFpbCA9PiB0aGlzLmdldFVzZXJEYXRhKHtcbiAgICAgICAgZW1haWwsXG4gICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgYWRkaXRpb25hbEZpZWxkcyxcbiAgICAgICAgYXBpVHlwZTogJ2V2ZW50cycsXG4gICAgICAgICRmaWx0ZXI6ICBgIERhdGVUaW1lQ3JlYXRlZCBnZSAke2ZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lQ3JlYXRlZCBsdCAke2ZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApfVxuICAgICAgICAgICAgICAgICAgYC5yZXBsYWNlKC9cXHMrL2csICcgJylcbiAgICAgICAgICAgICAgICAgICAudHJpbSgpXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIHJlcGxhY2UgZGF0YSBrZXlzIHdpdGggZGVzaXJlZCBtYXBwaW5ncy4uLlxuICAgICAgY29uc3QgcmVzdWx0cyA9IF8ubWFwKGV2ZW50RGF0YSwgdXNlciA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZW1haWw6ICAgICAgICAgICAgdXNlci5lbWFpbCxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGU6ICB1c2VyLmZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlOiAgICB1c2VyLmZpbHRlckVuZERhdGUsXG4gICAgICAgICAgc3VjY2VzczogICAgICAgICAgdXNlci5zdWNjZXNzLFxuICAgICAgICAgIGVycm9yTWVzc2FnZTogICAgIHVzZXIuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgIC8vIG1hcCBkYXRhIHdpdGggZGVzaXJlZCBrZXkgbmFtZXMuLi5cbiAgICAgICAgICBkYXRhOiBfLm1hcCh1c2VyLmRhdGEgfHwgW10sIG9yaWdpbmFsRXZlbnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFwcGVkRXZlbnQgPSB7fTtcblxuICAgICAgICAgICAgLy8gY2hhbmdlIHRvIGRlc2lyZWQgbmFtZXNcbiAgICAgICAgICAgIF8uZWFjaChmaWVsZE5hbWVNYXAsIChoYXZlLCB3YW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRXZlbnQsIGhhdmUpO1xuICAgICAgICAgICAgICBtYXBwZWRFdmVudFt3YW50XSA9IC9eZGF0ZVRpbWUvLnRlc3Qod2FudCkgPyBuZXcgRGF0ZShtYXBwZWQpIDogbWFwcGVkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1hcHBlZEV2ZW50W2BhdHRlbmRlZXNgXSA9IG9yaWdpbmFsRXZlbnRbZmllbGROYW1lTWFwW2BhdHRlbmRlZXNgXV1cbiAgICAgICAgICAgICAgLm1hcChhdHRlbmRlZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIGFkZHJlc3M6ICBfLmdldChhdHRlbmRlZSwgZmllbGROYW1lTWFwW2BhdHRlbmRlZUFkZHJlc3NgXSksXG4gICAgICAgICAgICAgICAgICBuYW1lOiAgICAgXy5nZXQoYXR0ZW5kZWUsIGZpZWxkTmFtZU1hcFtgYXR0ZW5kZWVOYW1lYF0pLFxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IF8uZ2V0KGF0dGVuZGVlLCAnU3RhdHVzJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gbWFwcGVkRXZlbnQ7XG4gICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyByZXR1cm4gcmVzdWx0cyBhbmQgc3VjY2VzcyFcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmRhdGFBZGFwdGVyUnVuU3RhdHMsXG4gICAgICAgIHJlc3VsdHMsXG4gICAgICAgIHN1Y2Nlc3M6IHRydWVcbiAgICAgIH07XG5cbiAgICB9IGNhdGNoIChlcnJvck1lc3NhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZS5zdGFjayk7XG4gICAgICBjb25zb2xlLmxvZygnT2ZmaWNlMzY1IEdldEJhdGNoRGF0YSBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycm9yTWVzc2FnZSkpO1xuICAgICAgcmV0dXJuIHsgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cywgZXJyb3JNZXNzYWdlIH07XG4gICAgfVxuXG4gIH1cblxuXG59XG4iXX0=
//# sourceMappingURL=../../../clAdapters/office365/calendar/index.js.map