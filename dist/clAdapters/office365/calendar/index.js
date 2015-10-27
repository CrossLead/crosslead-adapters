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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2NhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQXVDLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQTBFekIsc0JBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRWpFLFlBQVksRUFDZCxtQkFBbUIsRUFVakIsU0FBUyxFQWFULE9BQU87Ozs7OztBQXhCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFOLE1BQU07QUFDTiw2QkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBYSxFQUFiLGFBQWE7QUFDYixxQkFBTyxFQUFFLEtBQUs7QUFDZCxxQkFBTyxFQUFFLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFO2FBQ2pDOzs7MERBSW9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO3FCQUFJLE1BQUssV0FBVyxDQUFDO0FBQzVELHFCQUFLLEVBQUwsS0FBSztBQUNMLCtCQUFlLEVBQWYsZUFBZTtBQUNmLDZCQUFhLEVBQWIsYUFBYTtBQUNiLGdDQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsdUJBQU8sRUFBRSxRQUFRO0FBQ2pCLHVCQUFPLEVBQUcsMEJBQXVCLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyx1REFDeEMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDJCQUN2RSxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUNw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QUFTO0FBQ2hELGNBQVEsRUFBK0IsVUFBVTtBQUNqRCxnQkFBVSxFQUE2QixhQUFhO0FBQ3BELG1CQUFhLEVBQTBCLGFBQWE7QUFDcEQsb0JBQWMsRUFBeUIsc0JBQXNCO0FBQzdELDZCQUF1QixFQUFnQix5QkFBeUI7QUFDaEUsMkJBQXFCLEVBQWtCLHVCQUF1QjtBQUM5RCw0QkFBc0IsRUFBaUIsd0JBQXdCO0FBQy9ELHNDQUFnQyxFQUFPLGtDQUFrQztBQUN6RSxtQ0FBNkIsRUFBVSwrQkFBK0I7QUFDdEUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLDJDQUFxQyxFQUFFLHVDQUF1QztBQUM5RSxtQ0FBNkIsRUFBVSwrQkFBK0I7QUFDdEUsb0NBQThCLEVBQVMsZ0NBQWdDO0FBQ3ZFLHFCQUFlLEVBQXdCLDZCQUE2QjtBQUNwRSxzQkFBZ0IsRUFBdUIsZ0NBQWdDO0FBQ3ZFLGtCQUFZLEVBQTJCLFlBQVk7QUFDbkQseUJBQW1CLEVBQW9CLG1CQUFtQjtBQUMxRCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELHNCQUFnQixFQUF1QixnQkFBZ0I7QUFDdkQsY0FBUSxFQUErQixRQUFRO0FBQy9DLHFCQUFlLEVBQXdCLE9BQU87QUFDOUMscUJBQWUsRUFBd0IsZUFBZTtBQUN0RCxlQUFTLEVBQThCLFNBQVM7QUFDaEQsWUFBTSxFQUFpQyxNQUFNO0FBQzdDLFdBQUssRUFBa0MsU0FBUztLQUNqRDs7OztTQXZFa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3QiIsImZpbGUiOiJjbEFkYXB0ZXJzL29mZmljZTM2NS9jYWxlbmRhci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb21lbnQgICAgICAgICAgICAgICAgICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IF8gICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgICAgICAgZnJvbSAnLi4vYmFzZS9BZGFwdGVyJztcblxuXG4vKipcbiAqIE9mZmljZSAzNjUgQ2FsZW5kYXIgYWRhcHRlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVDYWxlbmRhckFkYXB0ZXIgZXh0ZW5kcyBPZmZpY2UzNjVCYXNlQWRhcHRlciB7XG5cbiAgLy8gY29sbGVjdCB0aGVzZSBmaWVsZHMgYWx3YXlzLi4uXG4gIHN0YXRpYyBiYXNlRmllbGRzID0gW1xuICAgICdJZCcsXG4gICAgJ0F0dGVuZGVlcycsXG4gICAgJ0NhbGVuZGFyJyxcbiAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXG4gICAgJ0RhdGVUaW1lTGFzdE1vZGlmaWVkJyxcbiAgICAnRW5kJyxcbiAgICAnRW5kVGltZVpvbmUnLFxuICAgICdIYXNBdHRhY2htZW50cycsXG4gICAgJ0ltcG9ydGFuY2UnLFxuICAgICdpQ2FsVUlEJyxcbiAgICAnSXNBbGxEYXknLFxuICAgICdJc0NhbmNlbGxlZCcsXG4gICAgJ0lzT3JnYW5pemVyJyxcbiAgICAnTG9jYXRpb24nLFxuICAgICdPcmdhbml6ZXInLFxuICAgICdSZWN1cnJlbmNlJyxcbiAgICAnUmVzcG9uc2VSZXF1ZXN0ZWQnLFxuICAgICdSZXNwb25zZVN0YXR1cycsXG4gICAgJ1Nlcmllc01hc3RlcklkJyxcbiAgICAnU2hvd0FzJyxcbiAgICAnU3RhcnQnLFxuICAgICdTdGFydFRpbWVab25lJyxcbiAgICAnU3ViamVjdCcsXG4gICAgJ1R5cGUnLFxuICAgICdXZWJMaW5rJ1xuICBdXG5cbiAgLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXG4gIHN0YXRpYyBmaWVsZE5hbWVNYXAgPSB7XG4gICAgLy8gRGVzaXJlZC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2l2ZW4uLi5cbiAgICAnZXZlbnRJZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSWQnLFxuICAgICdhdHRlbmRlZXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICdBdHRlbmRlZXMnLFxuICAgICdjYWxlbmRhck5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdDYWxlbmRhcicsXG4gICAgJ2NhdGVnb3JpZXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NhdGVnb3JpZXMnLFxuICAgICdkYXRlVGltZUNyZWF0ZWQnOiAgICAgICAgICAgICAgICAgICAgICdEYXRlVGltZUNyZWF0ZWQnLFxuICAgICdkYXRlVGltZUxhc3RNb2RpZmllZCc6ICAgICAgICAgICAgICAgICdEYXRlVGltZUxhc3RNb2RpZmllZCcsXG4gICAgJ2F0dGVuZGVlQWRkcmVzcyc6ICAgICAgICAgICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnYXR0ZW5kZWVOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdoYXNBdHRhY2htZW50cyc6ICAgICAgICAgICAgICAgICAgICAgICdIYXNBdHRhY2htZW50cycsXG4gICAgJ2ltcG9ydGFuY2UnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ltcG9ydGFuY2UnLFxuICAgICdpQ2FsVUlEJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpQ2FsVUlEJyxcbiAgICAnYWxsRGF5JzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSXNBbGxEYXknLFxuICAgICdjYW5jZWxlZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJc0NhbmNlbGxlZCcsXG4gICAgJ2lzT3JnYW5pemVyJzogICAgICAgICAgICAgICAgICAgICAgICAgJ0lzT3JnYW5pemVyJyxcbiAgICAnbG9jYXRpb25OYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnTG9jYXRpb24uRGlzcGxheU5hbWUnLFxuICAgICdsb2NhdGlvbkFkZHJlc3NTdHJlZXQnOiAgICAgICAgICAgICAgICdMb2NhdGlvbi5BZGRyZXNzLlN0cmVldCcsXG4gICAgJ2xvY2F0aW9uQWRkcmVzc0NpdHknOiAgICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkFkZHJlc3MuQ2l0eScsXG4gICAgJ2xvY2F0aW9uQWRkcmVzc1N0YXRlJzogICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkFkZHJlc3MuU3RhdGUnLFxuICAgICdsb2NhdGlvbkFkZHJlc3NDb3VudHJ5T3JSZWdpb24nOiAgICAgICdMb2NhdGlvbi5BZGRyZXNzLkNvdW50cnlPclJlZ2lvbicsXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNBY2N1cmFjeSc6ICAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkFjY3VyYWN5JyxcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0FsdGl0dWRlJzogICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuQWx0aXR1ZGUnLFxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzQWx0aXR1ZGVBY2N1cmFjeSc6ICdMb2NhdGlvbi5Db29yZGluYXRlcy5BbHRpdHVkZUFjY3VyYWN5JyxcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0xhdGl0dWRlJzogICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuTGF0aXR1ZGUnLFxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzTG9uZ2l0dWRlJzogICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5Mb25naXR1ZGUnLFxuICAgICdvcmdhbml6ZXJOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICdPcmdhbml6ZXIuRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdvcmdhbml6ZXJFbWFpbCc6ICAgICAgICAgICAgICAgICAgICAgICdPcmdhbml6ZXIuRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdyZWN1cnJhbmNlJzogICAgICAgICAgICAgICAgICAgICAgICAgICdSZWN1cnJhbmNlJyxcbiAgICAncmVzcG9uc2VSZXF1ZXN0ZWQnOiAgICAgICAgICAgICAgICAgICAnUmVzcG9uc2VSZXF1ZXN0ZWQnLFxuICAgICdyZXNwb25zZVN0YXR1cyc6ICAgICAgICAgICAgICAgICAgICAgICdSZXNwb25zZVN0YXR1cycsXG4gICAgJ3Nlcmllc01hc3RlcklkJzogICAgICAgICAgICAgICAgICAgICAgJ1Nlcmllc01hc3RlcklkJyxcbiAgICAnc2hvd0FzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU2hvd0FzJyxcbiAgICAnZGF0ZVRpbWVTdGFydCc6ICAgICAgICAgICAgICAgICAgICAgICAnU3RhcnQnLFxuICAgICdzdGFydFRpbWVab25lJzogICAgICAgICAgICAgICAgICAgICAgICdTdGFydFRpbWVab25lJyxcbiAgICAnc3ViamVjdCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU3ViamVjdCcsXG4gICAgJ3R5cGUnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1R5cGUnLFxuICAgICd1cmwnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdXZWJMaW5rJ1xuICB9XG5cblxuICBhc3luYyBnZXRCYXRjaERhdGEoZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcblxuICAgIGNvbnN0IHsgZmllbGROYW1lTWFwIH0gPSB0aGlzLmNvbnN0cnVjdG9yLFxuICAgICAgICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMgICA9IHtcbiAgICAgICAgICAgIGVtYWlscyxcbiAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpXG4gICAgICAgICAgfTtcblxuICAgIHRyeSB7XG5cbiAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGF3YWl0KiBlbWFpbHMubWFwKGVtYWlsID0+IHRoaXMuZ2V0VXNlckRhdGEoe1xuICAgICAgICBlbWFpbCxcbiAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgICBhcGlUeXBlOiAnZXZlbnRzJyxcbiAgICAgICAgJGZpbHRlcjogIGAgRGF0ZVRpbWVDcmVhdGVkIGdlICR7ZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKX1cbiAgICAgICAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVDcmVhdGVkIGx0ICR7ZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICAgICAgICBgLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgICAgICAgICAgICAgIC50cmltKClcbiAgICAgIH0pKTtcblxuICAgICAgLy8gcmVwbGFjZSBkYXRhIGtleXMgd2l0aCBkZXNpcmVkIG1hcHBpbmdzLi4uXG4gICAgICBjb25zdCByZXN1bHRzID0gXy5tYXAoZXZlbnREYXRhLCB1c2VyID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBlbWFpbDogICAgICAgICAgICB1c2VyLmVtYWlsLFxuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZTogIHVzZXIuZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgIGZpbHRlckVuZERhdGU6ICAgIHVzZXIuZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICBzdWNjZXNzOiAgICAgICAgICB1c2VyLnN1Y2Nlc3MsXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiAgICAgdXNlci5lcnJvck1lc3NhZ2UsXG4gICAgICAgICAgLy8gbWFwIGRhdGEgd2l0aCBkZXNpcmVkIGtleSBuYW1lcy4uLlxuICAgICAgICAgIGRhdGE6IF8ubWFwKHVzZXIuZGF0YSB8fCBbXSwgb3JpZ2luYWxFdmVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYXBwZWRFdmVudCA9IHt9O1xuXG4gICAgICAgICAgICAvLyBjaGFuZ2UgdG8gZGVzaXJlZCBuYW1lc1xuICAgICAgICAgICAgXy5lYWNoKGZpZWxkTmFtZU1hcCwgKGhhdmUsIHdhbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbWFwcGVkID0gXy5nZXQob3JpZ2luYWxFdmVudCwgaGF2ZSk7XG4gICAgICAgICAgICAgIGlmIChtYXBwZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1hcHBlZEV2ZW50W3dhbnRdID0gL15kYXRlVGltZS8udGVzdCh3YW50KSA/IG5ldyBEYXRlKG1hcHBlZCkgOiBtYXBwZWQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBtYXBwZWRFdmVudFtgYXR0ZW5kZWVzYF0gPSBvcmlnaW5hbEV2ZW50W2ZpZWxkTmFtZU1hcFtgYXR0ZW5kZWVzYF1dXG4gICAgICAgICAgICAgIC5tYXAoYXR0ZW5kZWUgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICBhZGRyZXNzOiAgXy5nZXQoYXR0ZW5kZWUsIGZpZWxkTmFtZU1hcFtgYXR0ZW5kZWVBZGRyZXNzYF0pLFxuICAgICAgICAgICAgICAgICAgbmFtZTogICAgIF8uZ2V0KGF0dGVuZGVlLCBmaWVsZE5hbWVNYXBbYGF0dGVuZGVlTmFtZWBdKSxcbiAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBfLmdldChhdHRlbmRlZSwgJ1N0YXR1cycpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG1hcHBlZEV2ZW50O1xuICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgLy8gcmV0dXJuIHJlc3VsdHMgYW5kIHN1Y2Nlc3MhXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxuICAgICAgICByZXN1bHRzLFxuICAgICAgICBzdWNjZXNzOiB0cnVlXG4gICAgICB9O1xuXG4gICAgfSBjYXRjaCAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2Uuc3RhY2spO1xuICAgICAgY29uc29sZS5sb2coJ09mZmljZTM2NSBHZXRCYXRjaERhdGEgRXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvck1lc3NhZ2UpKTtcbiAgICAgIHJldHVybiB7IC4uLmRhdGFBZGFwdGVyUnVuU3RhdHMsIGVycm9yTWVzc2FnZSB9O1xuICAgIH1cblxuICB9XG5cblxufVxuIl19
//# sourceMappingURL=index.js.map
