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
    value: function getBatchData(userProfiles, filterStartDate, filterEndDate, additionalFields) {
      var fieldNameMap, dataAdapterRunStats, eventData, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            fieldNameMap = this.constructor.fieldNameMap;
            dataAdapterRunStats = {
              emails: userProfiles,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              success: false,
              runDate: (0, _moment2['default'])().utc().toDate()
            };
            context$2$0.prev = 2;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(_Promise.all(userProfiles.map(function (userProfile) {
              return _this.getUserData(_extends({}, userProfile, {
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                additionalFields: additionalFields,
                apiType: 'events',
                $filter: (' DateTimeCreated ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                      and DateTimeCreated lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                  ').replace(/\s+/g, ' ').trim()
              }));
            })));

          case 5:
            eventData = context$2$0.sent;
            results = _lodash2['default'].map(eventData, function (user) {
              return _extends({}, user.userProfile, {
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
              });
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

// replace data keys with desired mappings...

// return results and success!
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcY2FsZW5kYXJcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQXVDLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQTRFekIsc0JBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRXZFLFlBQVksRUFDZCxtQkFBbUIsRUFVakIsU0FBUyxFQWFULE9BQU87Ozs7OztBQXhCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFFLFlBQVk7QUFDcEIsNkJBQWUsRUFBZixlQUFlO0FBQ2YsMkJBQWEsRUFBYixhQUFhO0FBQ2IscUJBQU8sRUFBRSxLQUFLO0FBQ2QscUJBQU8sRUFBRSwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTthQUNqQzs7OzBEQUlvQixZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsV0FBVztxQkFBSSxNQUFLLFdBQVcsY0FDcEUsV0FBVztBQUNkLCtCQUFlLEVBQWYsZUFBZTtBQUNmLDZCQUFhLEVBQWIsYUFBYTtBQUNiLGdDQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsdUJBQU8sRUFBRSxRQUFRO0FBQ2pCLHVCQUFPLEVBQUcsMEJBQXVCLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyx1REFDeEMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDJCQUN2RSxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUNwQixJQUFJLEVBQUU7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VSxFQUE2QixhQUFhO0FBQ3BELG1CQUFhLEVBQTBCLGFBQWE7QUFDcEQsb0JBQWMsRUFBeUIsc0JBQXNCO0FBQzdELDZCQUF1QixFQUFnQix5QkFBeUI7QUFDaEUsMkJBQXFCLEVBQWtCLHVCQUF1QjtBQUM5RCw0QkFBc0IsRUFBaUIsd0JBQXdCO0FBQy9ELHNDQUFnQyxFQUFPLGtDQUFrQztBQUN6RSxtQ0FBNkIsRUFBVSwrQkFBK0I7QUFDdEUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLDJDQUFxQyxFQUFFLHVDQUF1QztBQUM5RSxtQ0FBNkIsRUFBVSwrQkFBK0I7QUFDdEUsb0NBQThCLEVBQVMsZ0NBQWdDO0FBQ3ZFLHFCQUFlLEVBQXdCLDZCQUE2QjtBQUNwRSxzQkFBZ0IsRUFBdUIsZ0NBQWdDO0FBQ3ZFLGtCQUFZLEVBQTJCLFlBQVk7QUFDbkQseUJBQW1CLEVBQW9CLG1CQUFtQjtBQUMxRCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELHNCQUFnQixFQUF1QixnQkFBZ0I7QUFDdkQsY0FBUSxFQUErQixRQUFRO0FBQy9DLHFCQUFlLEVBQXdCLE9BQU87QUFDOUMscUJBQWUsRUFBd0IsZUFBZTtBQUN0RCxtQkFBYSxFQUEwQixLQUFLO0FBQzVDLG1CQUFhLEVBQTBCLGFBQWE7QUFDcEQsZUFBUyxFQUE4QixTQUFTO0FBQ2hELFlBQU0sRUFBaUMsTUFBTTtBQUM3QyxXQUFLLEVBQWtDLFNBQVM7S0FDakQ7Ozs7U0F6RWtCLHdCQUF3Qjs7O3FCQUF4Qix3QkFBd0IiLCJmaWxlIjoiY2xBZGFwdGVyc1xcb2ZmaWNlMzY1XFxjYWxlbmRhclxcaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9tZW50ICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbW9tZW50JztcclxuaW1wb3J0IF8gICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XHJcbmltcG9ydCBPZmZpY2UzNjVCYXNlQWRhcHRlciAgICAgICBmcm9tICcuLi9iYXNlL0FkYXB0ZXInO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBPZmZpY2UgMzY1IENhbGVuZGFyIGFkYXB0ZXJcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIE9mZmljZTM2NUJhc2VBZGFwdGVyIHtcclxuXHJcbiAgLy8gY29sbGVjdCB0aGVzZSBmaWVsZHMgYWx3YXlzLi4uXHJcbiAgc3RhdGljIGJhc2VGaWVsZHMgPSBbXHJcbiAgICAnSWQnLFxyXG4gICAgJ0F0dGVuZGVlcycsXHJcbiAgICAnQ2FsZW5kYXInLFxyXG4gICAgJ0NhdGVnb3JpZXMnLFxyXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXHJcbiAgICAnRGF0ZVRpbWVMYXN0TW9kaWZpZWQnLFxyXG4gICAgJ0VuZCcsXHJcbiAgICAnRW5kVGltZVpvbmUnLFxyXG4gICAgJ0hhc0F0dGFjaG1lbnRzJyxcclxuICAgICdJbXBvcnRhbmNlJyxcclxuICAgICdpQ2FsVUlEJyxcclxuICAgICdJc0FsbERheScsXHJcbiAgICAnSXNDYW5jZWxsZWQnLFxyXG4gICAgJ0lzT3JnYW5pemVyJyxcclxuICAgICdMb2NhdGlvbicsXHJcbiAgICAnT3JnYW5pemVyJyxcclxuICAgICdSZWN1cnJlbmNlJyxcclxuICAgICdSZXNwb25zZVJlcXVlc3RlZCcsXHJcbiAgICAnUmVzcG9uc2VTdGF0dXMnLFxyXG4gICAgJ1Nlcmllc01hc3RlcklkJyxcclxuICAgICdTaG93QXMnLFxyXG4gICAgJ1N0YXJ0JyxcclxuICAgICdTdGFydFRpbWVab25lJyxcclxuICAgICdTdWJqZWN0JyxcclxuICAgICdUeXBlJyxcclxuICAgICdXZWJMaW5rJ1xyXG4gIF1cclxuXHJcbiAgLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXHJcbiAgc3RhdGljIGZpZWxkTmFtZU1hcCA9IHtcclxuICAgIC8vIERlc2lyZWQuLi4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdpdmVuLi4uXHJcbiAgICAnZXZlbnRJZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSWQnLFxyXG4gICAgJ2F0dGVuZGVlcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0F0dGVuZGVlcycsXHJcbiAgICAnY2FsZW5kYXJOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnQ2FsZW5kYXInLFxyXG4gICAgJ2NhdGVnb3JpZXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NhdGVnb3JpZXMnLFxyXG4gICAgJ2RhdGVUaW1lQ3JlYXRlZCc6ICAgICAgICAgICAgICAgICAgICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXHJcbiAgICAnZGF0ZVRpbWVMYXN0TW9kaWZpZWQnOiAgICAgICAgICAgICAgICAnRGF0ZVRpbWVMYXN0TW9kaWZpZWQnLFxyXG4gICAgJ2F0dGVuZGVlQWRkcmVzcyc6ICAgICAgICAgICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcclxuICAgICdhdHRlbmRlZU5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXHJcbiAgICAnaGFzQXR0YWNobWVudHMnOiAgICAgICAgICAgICAgICAgICAgICAnSGFzQXR0YWNobWVudHMnLFxyXG4gICAgJ2ltcG9ydGFuY2UnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ltcG9ydGFuY2UnLFxyXG4gICAgJ2lDYWxVSUQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lDYWxVSUQnLFxyXG4gICAgJ2FsbERheSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lzQWxsRGF5JyxcclxuICAgICdjYW5jZWxlZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJc0NhbmNlbGxlZCcsXHJcbiAgICAnaXNPcmdhbml6ZXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnSXNPcmdhbml6ZXInLFxyXG4gICAgJ2xvY2F0aW9uTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkRpc3BsYXlOYW1lJyxcclxuICAgICdsb2NhdGlvbkFkZHJlc3NTdHJlZXQnOiAgICAgICAgICAgICAgICdMb2NhdGlvbi5BZGRyZXNzLlN0cmVldCcsXHJcbiAgICAnbG9jYXRpb25BZGRyZXNzQ2l0eSc6ICAgICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5DaXR5JyxcclxuICAgICdsb2NhdGlvbkFkZHJlc3NTdGF0ZSc6ICAgICAgICAgICAgICAgICdMb2NhdGlvbi5BZGRyZXNzLlN0YXRlJyxcclxuICAgICdsb2NhdGlvbkFkZHJlc3NDb3VudHJ5T3JSZWdpb24nOiAgICAgICdMb2NhdGlvbi5BZGRyZXNzLkNvdW50cnlPclJlZ2lvbicsXHJcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0FjY3VyYWN5JzogICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuQWNjdXJhY3knLFxyXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNBbHRpdHVkZSc6ICAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkFsdGl0dWRlJyxcclxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzQWx0aXR1ZGVBY2N1cmFjeSc6ICdMb2NhdGlvbi5Db29yZGluYXRlcy5BbHRpdHVkZUFjY3VyYWN5JyxcclxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzTGF0aXR1ZGUnOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5MYXRpdHVkZScsXHJcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0xvbmdpdHVkZSc6ICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuTG9uZ2l0dWRlJyxcclxuICAgICdvcmdhbml6ZXJOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICdPcmdhbml6ZXIuRW1haWxBZGRyZXNzLk5hbWUnLFxyXG4gICAgJ29yZ2FuaXplckVtYWlsJzogICAgICAgICAgICAgICAgICAgICAgJ09yZ2FuaXplci5FbWFpbEFkZHJlc3MuQWRkcmVzcycsXHJcbiAgICAncmVjdXJyYW5jZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVjdXJyYW5jZScsXHJcbiAgICAncmVzcG9uc2VSZXF1ZXN0ZWQnOiAgICAgICAgICAgICAgICAgICAnUmVzcG9uc2VSZXF1ZXN0ZWQnLFxyXG4gICAgJ3Jlc3BvbnNlU3RhdHVzJzogICAgICAgICAgICAgICAgICAgICAgJ1Jlc3BvbnNlU3RhdHVzJyxcclxuICAgICdzZXJpZXNNYXN0ZXJJZCc6ICAgICAgICAgICAgICAgICAgICAgICdTZXJpZXNNYXN0ZXJJZCcsXHJcbiAgICAnc2hvd0FzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU2hvd0FzJyxcclxuICAgICdkYXRlVGltZVN0YXJ0JzogICAgICAgICAgICAgICAgICAgICAgICdTdGFydCcsXHJcbiAgICAnc3RhcnRUaW1lWm9uZSc6ICAgICAgICAgICAgICAgICAgICAgICAnU3RhcnRUaW1lWm9uZScsXHJcbiAgICAnZGF0ZVRpbWVFbmQnOiAgICAgICAgICAgICAgICAgICAgICAgICAnRW5kJyxcclxuICAgICdlbmRUaW1lWm9uZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICdFbmRUaW1lWm9uZScsXHJcbiAgICAnc3ViamVjdCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU3ViamVjdCcsXHJcbiAgICAndHlwZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVHlwZScsXHJcbiAgICAndXJsJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV2ViTGluaydcclxuICB9XHJcblxyXG5cclxuICBhc3luYyBnZXRCYXRjaERhdGEodXNlclByb2ZpbGVzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcclxuXHJcbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMgICA9IHtcclxuICAgICAgICAgICAgZW1haWxzOiB1c2VyUHJvZmlsZXMsXHJcbiAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgIHRyeSB7XHJcblxyXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCogdXNlclByb2ZpbGVzLm1hcCh1c2VyUHJvZmlsZSA9PiB0aGlzLmdldFVzZXJEYXRhKHtcclxuICAgICAgICAuLi51c2VyUHJvZmlsZSxcclxuICAgICAgICBmaWx0ZXJTdGFydERhdGUsXHJcbiAgICAgICAgZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgICBhZGRpdGlvbmFsRmllbGRzLFxyXG4gICAgICAgIGFwaVR5cGU6ICdldmVudHMnLFxyXG4gICAgICAgICRmaWx0ZXI6ICBgIERhdGVUaW1lQ3JlYXRlZCBnZSAke2ZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XHJcbiAgICAgICAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVDcmVhdGVkIGx0ICR7ZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XHJcbiAgICAgICAgICAgICAgICAgIGAucmVwbGFjZSgvXFxzKy9nLCAnICcpXHJcbiAgICAgICAgICAgICAgICAgICAudHJpbSgpXHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICAgIC8vIHJlcGxhY2UgZGF0YSBrZXlzIHdpdGggZGVzaXJlZCBtYXBwaW5ncy4uLlxyXG4gICAgICBjb25zdCByZXN1bHRzID0gXy5tYXAoZXZlbnREYXRhLCB1c2VyID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgLi4udXNlci51c2VyUHJvZmlsZSxcclxuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZTogIHVzZXIuZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZTogICAgdXNlci5maWx0ZXJFbmREYXRlLFxyXG4gICAgICAgICAgc3VjY2VzczogICAgICAgICAgdXNlci5zdWNjZXNzLFxyXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiAgICAgdXNlci5lcnJvck1lc3NhZ2UsXHJcbiAgICAgICAgICAvLyBtYXAgZGF0YSB3aXRoIGRlc2lyZWQga2V5IG5hbWVzLi4uXHJcbiAgICAgICAgICBkYXRhOiBfLm1hcCh1c2VyLmRhdGEgfHwgW10sIG9yaWdpbmFsRXZlbnQgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtYXBwZWRFdmVudCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy8gY2hhbmdlIHRvIGRlc2lyZWQgbmFtZXNcclxuICAgICAgICAgICAgXy5lYWNoKGZpZWxkTmFtZU1hcCwgKGhhdmUsIHdhbnQpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBtYXBwZWQgPSBfLmdldChvcmlnaW5hbEV2ZW50LCBoYXZlKTtcclxuICAgICAgICAgICAgICBpZiAobWFwcGVkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1hcHBlZEV2ZW50W3dhbnRdID0gL15kYXRlVGltZS8udGVzdCh3YW50KSA/IG5ldyBEYXRlKG1hcHBlZCkgOiBtYXBwZWQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1hcHBlZEV2ZW50W2BhdHRlbmRlZXNgXSA9IG9yaWdpbmFsRXZlbnRbZmllbGROYW1lTWFwW2BhdHRlbmRlZXNgXV1cclxuICAgICAgICAgICAgICAubWFwKGF0dGVuZGVlID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGFkZHJlc3M6ICBfLmdldChhdHRlbmRlZSwgZmllbGROYW1lTWFwW2BhdHRlbmRlZUFkZHJlc3NgXSksXHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICAgICBfLmdldChhdHRlbmRlZSwgZmllbGROYW1lTWFwW2BhdHRlbmRlZU5hbWVgXSksXHJcbiAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBfLmdldChhdHRlbmRlZSwgJ1N0YXR1cycpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbWFwcGVkRXZlbnQ7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gcmV0dXJuIHJlc3VsdHMgYW5kIHN1Y2Nlc3MhXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cyxcclxuICAgICAgICByZXN1bHRzLFxyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWVcclxuICAgICAgfTtcclxuXHJcbiAgICB9IGNhdGNoIChlcnJvck1lc3NhZ2UpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcclxuICAgICAgY29uc29sZS5sb2coJ09mZmljZTM2NSBHZXRCYXRjaERhdGEgRXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvck1lc3NhZ2UpKTtcclxuICAgICAgcmV0dXJuIHsgLi4uZGF0YUFkYXB0ZXJSdW5TdGF0cywgZXJyb3JNZXNzYWdlIH07XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcblxyXG59XHJcbiJdfQ==
//# sourceMappingURL=index.js.map
