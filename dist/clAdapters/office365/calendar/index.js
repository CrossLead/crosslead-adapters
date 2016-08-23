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
              return _this.getUserData({
                userProfile: userProfile,
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                additionalFields: additionalFields,
                apiType: 'calendarview'
              });
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

                  if (mappedEvent.responseStatus && mappedEvent.responseStatus.Response) {
                    mappedEvent.responseStatus = mappedEvent.responseStatus.Response;
                  }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcY2FsZW5kYXJcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQXVDLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQTRFekIsc0JBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRXZFLFlBQVksRUFDZCxtQkFBbUIsRUFTakIsU0FBUyxFQVNULE9BQU87Ozs7OztBQW5CUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFFLFlBQVk7QUFDcEIsNkJBQWUsRUFBZixlQUFlO0FBQ2YsMkJBQWEsRUFBYixhQUFhO0FBQ2IscUJBQU8sRUFBRSxLQUFLO0FBQ2QscUJBQU8sRUFBRSwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTthQUNqQzs7OzBEQUdvQixZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsV0FBVztxQkFBSSxNQUFLLFdBQVcsQ0FBQztBQUN4RSwyQkFBVyxFQUFYLFdBQVc7QUFDWCwrQkFBZSxFQUFmLGVBQWU7QUFDZiw2QkFBYSxFQUFiLGFBQWE7QUFDYixnQ0FBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLHVCQUFPLEVBQUUsY0FBYztlQUN4QixDQUFDO2FBQUEsQ0FBQzs7O0FBTkcscUJBQVM7QUFTVCxtQkFBTyxHQUFHLG9CQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDdkMsa0NBQ0ssSUFBSSxDQUFDLFdBQVc7QUFDbkIsK0JBQWUsRUFBRyxJQUFJLENBQUMsZUFBZTtBQUN0Qyw2QkFBYSxFQUFLLElBQUksQ0FBQyxh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RUFBeUIsc0JBQXNCO0FBQzdELDZCQUF1QixFQUFnQix5QkFBeUI7QUFDaEUsMkJBQXFCLEVBQWtCLHVCQUF1QjtBQUM5RCw0QkFBc0IsRUFBaUIsd0JBQXdCO0FBQy9ELHNDQUFnQyxFQUFPLGtDQUFrQztBQUN6RSxtQ0FBNkIsRUFBVSwrQkFBK0I7QUFDdEUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLDJDQUFxQyxFQUFFLHVDQUF1QztBQUM5RSxtQ0FBNkIsRUFBVSwrQkFBK0I7QUFDdEUsb0NBQThCLEVBQVMsZ0NBQWdDO0FBQ3ZFLHFCQUFlLEVBQXdCLDZCQUE2QjtBQUNwRSxzQkFBZ0IsRUFBdUIsZ0NBQWdDO0FBQ3ZFLGtCQUFZLEVBQTJCLFlBQVk7QUFDbkQseUJBQW1CLEVBQW9CLG1CQUFtQjtBQUMxRCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELHNCQUFnQixFQUF1QixnQkFBZ0I7QUFDdkQsY0FBUSxFQUErQixRQUFRO0FBQy9DLHFCQUFlLEVBQXdCLE9BQU87QUFDOUMscUJBQWUsRUFBd0IsZUFBZTtBQUN0RCxtQkFBYSxFQUEwQixLQUFLO0FBQzVDLG1CQUFhLEVBQTBCLGFBQWE7QUFDcEQsZUFBUyxFQUE4QixTQUFTO0FBQ2hELFlBQU0sRUFBaUMsTUFBTTtBQUM3QyxXQUFLLEVBQWtDLFNBQVM7S0FDakQ7Ozs7U0F6RWtCLHdCQUF3Qjs7O3FCQUF4Qix3QkFBd0IiLCJmaWxlIjoiY2xBZGFwdGVyc1xcb2ZmaWNlMzY1XFxjYWxlbmRhclxcaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9tZW50ICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbW9tZW50JztcclxuaW1wb3J0IF8gICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XHJcbmltcG9ydCBPZmZpY2UzNjVCYXNlQWRhcHRlciAgICAgICBmcm9tICcuLi9iYXNlL0FkYXB0ZXInO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBPZmZpY2UgMzY1IENhbGVuZGFyIGFkYXB0ZXJcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIE9mZmljZTM2NUJhc2VBZGFwdGVyIHtcclxuXHJcbiAgLy8gY29sbGVjdCB0aGVzZSBmaWVsZHMgYWx3YXlzLi4uXHJcbiAgc3RhdGljIGJhc2VGaWVsZHMgPSBbXHJcbiAgICAnSWQnLFxyXG4gICAgJ0F0dGVuZGVlcycsXHJcbiAgICAnQ2FsZW5kYXInLFxyXG4gICAgJ0NhdGVnb3JpZXMnLFxyXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXHJcbiAgICAnRGF0ZVRpbWVMYXN0TW9kaWZpZWQnLFxyXG4gICAgJ0VuZCcsXHJcbiAgICAnRW5kVGltZVpvbmUnLFxyXG4gICAgJ0hhc0F0dGFjaG1lbnRzJyxcclxuICAgICdJbXBvcnRhbmNlJyxcclxuICAgICdpQ2FsVUlEJyxcclxuICAgICdJc0FsbERheScsXHJcbiAgICAnSXNDYW5jZWxsZWQnLFxyXG4gICAgJ0lzT3JnYW5pemVyJyxcclxuICAgICdMb2NhdGlvbicsXHJcbiAgICAnT3JnYW5pemVyJyxcclxuICAgICdSZWN1cnJlbmNlJyxcclxuICAgICdSZXNwb25zZVJlcXVlc3RlZCcsXHJcbiAgICAnUmVzcG9uc2VTdGF0dXMnLFxyXG4gICAgJ1Nlcmllc01hc3RlcklkJyxcclxuICAgICdTaG93QXMnLFxyXG4gICAgJ1N0YXJ0JyxcclxuICAgICdTdGFydFRpbWVab25lJyxcclxuICAgICdTdWJqZWN0JyxcclxuICAgICdUeXBlJyxcclxuICAgICdXZWJMaW5rJ1xyXG4gIF1cclxuXHJcbiAgLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXHJcbiAgc3RhdGljIGZpZWxkTmFtZU1hcCA9IHtcclxuICAgIC8vIERlc2lyZWQuLi4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdpdmVuLi4uXHJcbiAgICAnZXZlbnRJZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSWQnLFxyXG4gICAgJ2F0dGVuZGVlcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0F0dGVuZGVlcycsXHJcbiAgICAnY2FsZW5kYXJOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnQ2FsZW5kYXInLFxyXG4gICAgJ2NhdGVnb3JpZXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NhdGVnb3JpZXMnLFxyXG4gICAgJ2RhdGVUaW1lQ3JlYXRlZCc6ICAgICAgICAgICAgICAgICAgICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXHJcbiAgICAnZGF0ZVRpbWVMYXN0TW9kaWZpZWQnOiAgICAgICAgICAgICAgICAnRGF0ZVRpbWVMYXN0TW9kaWZpZWQnLFxyXG4gICAgJ2F0dGVuZGVlQWRkcmVzcyc6ICAgICAgICAgICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcclxuICAgICdhdHRlbmRlZU5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXHJcbiAgICAnaGFzQXR0YWNobWVudHMnOiAgICAgICAgICAgICAgICAgICAgICAnSGFzQXR0YWNobWVudHMnLFxyXG4gICAgJ2ltcG9ydGFuY2UnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ltcG9ydGFuY2UnLFxyXG4gICAgJ2lDYWxVSWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lDYWxVSWQnLFxyXG4gICAgJ2FsbERheSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lzQWxsRGF5JyxcclxuICAgICdjYW5jZWxlZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJc0NhbmNlbGxlZCcsXHJcbiAgICAnaXNPcmdhbml6ZXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnSXNPcmdhbml6ZXInLFxyXG4gICAgJ2xvY2F0aW9uTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkRpc3BsYXlOYW1lJyxcclxuICAgICdsb2NhdGlvbkFkZHJlc3NTdHJlZXQnOiAgICAgICAgICAgICAgICdMb2NhdGlvbi5BZGRyZXNzLlN0cmVldCcsXHJcbiAgICAnbG9jYXRpb25BZGRyZXNzQ2l0eSc6ICAgICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5DaXR5JyxcclxuICAgICdsb2NhdGlvbkFkZHJlc3NTdGF0ZSc6ICAgICAgICAgICAgICAgICdMb2NhdGlvbi5BZGRyZXNzLlN0YXRlJyxcclxuICAgICdsb2NhdGlvbkFkZHJlc3NDb3VudHJ5T3JSZWdpb24nOiAgICAgICdMb2NhdGlvbi5BZGRyZXNzLkNvdW50cnlPclJlZ2lvbicsXHJcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0FjY3VyYWN5JzogICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuQWNjdXJhY3knLFxyXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNBbHRpdHVkZSc6ICAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkFsdGl0dWRlJyxcclxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzQWx0aXR1ZGVBY2N1cmFjeSc6ICdMb2NhdGlvbi5Db29yZGluYXRlcy5BbHRpdHVkZUFjY3VyYWN5JyxcclxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzTGF0aXR1ZGUnOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5MYXRpdHVkZScsXHJcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0xvbmdpdHVkZSc6ICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuTG9uZ2l0dWRlJyxcclxuICAgICdvcmdhbml6ZXJOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICdPcmdhbml6ZXIuRW1haWxBZGRyZXNzLk5hbWUnLFxyXG4gICAgJ29yZ2FuaXplckVtYWlsJzogICAgICAgICAgICAgICAgICAgICAgJ09yZ2FuaXplci5FbWFpbEFkZHJlc3MuQWRkcmVzcycsXHJcbiAgICAncmVjdXJyYW5jZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVjdXJyYW5jZScsXHJcbiAgICAncmVzcG9uc2VSZXF1ZXN0ZWQnOiAgICAgICAgICAgICAgICAgICAnUmVzcG9uc2VSZXF1ZXN0ZWQnLFxyXG4gICAgJ3Jlc3BvbnNlU3RhdHVzJzogICAgICAgICAgICAgICAgICAgICAgJ1Jlc3BvbnNlU3RhdHVzJyxcclxuICAgICdzZXJpZXNNYXN0ZXJJZCc6ICAgICAgICAgICAgICAgICAgICAgICdTZXJpZXNNYXN0ZXJJZCcsXHJcbiAgICAnc2hvd0FzJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU2hvd0FzJyxcclxuICAgICdkYXRlVGltZVN0YXJ0JzogICAgICAgICAgICAgICAgICAgICAgICdTdGFydCcsXHJcbiAgICAnc3RhcnRUaW1lWm9uZSc6ICAgICAgICAgICAgICAgICAgICAgICAnU3RhcnRUaW1lWm9uZScsXHJcbiAgICAnZGF0ZVRpbWVFbmQnOiAgICAgICAgICAgICAgICAgICAgICAgICAnRW5kJyxcclxuICAgICdlbmRUaW1lWm9uZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICdFbmRUaW1lWm9uZScsXHJcbiAgICAnc3ViamVjdCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU3ViamVjdCcsXHJcbiAgICAndHlwZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVHlwZScsXHJcbiAgICAndXJsJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV2ViTGluaydcclxuICB9XHJcblxyXG5cclxuICBhc3luYyBnZXRCYXRjaERhdGEodXNlclByb2ZpbGVzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcclxuXHJcbiAgICBjb25zdCB7IGZpZWxkTmFtZU1hcCB9ID0gdGhpcy5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMgICA9IHtcclxuICAgICAgICAgICAgZW1haWxzOiB1c2VyUHJvZmlsZXMsXHJcbiAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcclxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGF3YWl0KiB1c2VyUHJvZmlsZXMubWFwKHVzZXJQcm9maWxlID0+IHRoaXMuZ2V0VXNlckRhdGEoe1xyXG4gICAgICAgIHVzZXJQcm9maWxlLFxyXG4gICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgICBmaWx0ZXJFbmREYXRlLFxyXG4gICAgICAgIGFkZGl0aW9uYWxGaWVsZHMsXHJcbiAgICAgICAgYXBpVHlwZTogJ2NhbGVuZGFydmlldydcclxuICAgICAgfSkpO1xyXG5cclxuICAgICAgLy8gcmVwbGFjZSBkYXRhIGtleXMgd2l0aCBkZXNpcmVkIG1hcHBpbmdzLi4uXHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBfLm1hcChldmVudERhdGEsIHVzZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAuLi51c2VyLnVzZXJQcm9maWxlLFxyXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlOiAgdXNlci5maWx0ZXJTdGFydERhdGUsXHJcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlOiAgICB1c2VyLmZpbHRlckVuZERhdGUsXHJcbiAgICAgICAgICBzdWNjZXNzOiAgICAgICAgICB1c2VyLnN1Y2Nlc3MsXHJcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICAgICB1c2VyLmVycm9yTWVzc2FnZSxcclxuICAgICAgICAgIC8vIG1hcCBkYXRhIHdpdGggZGVzaXJlZCBrZXkgbmFtZXMuLi5cclxuICAgICAgICAgIGRhdGE6IF8ubWFwKHVzZXIuZGF0YSB8fCBbXSwgb3JpZ2luYWxFdmVudCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZEV2ZW50ID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBjaGFuZ2UgdG8gZGVzaXJlZCBuYW1lc1xyXG4gICAgICAgICAgICBfLmVhY2goZmllbGROYW1lTWFwLCAoaGF2ZSwgd2FudCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRXZlbnQsIGhhdmUpO1xyXG4gICAgICAgICAgICAgIGlmIChtYXBwZWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbWFwcGVkRXZlbnRbd2FudF0gPSAvXmRhdGVUaW1lLy50ZXN0KHdhbnQpID8gbmV3IERhdGUobWFwcGVkKSA6IG1hcHBlZDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKG1hcHBlZEV2ZW50LnJlc3BvbnNlU3RhdHVzICYmIG1hcHBlZEV2ZW50LnJlc3BvbnNlU3RhdHVzLlJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgbWFwcGVkRXZlbnQucmVzcG9uc2VTdGF0dXMgPSBtYXBwZWRFdmVudC5yZXNwb25zZVN0YXR1cy5SZXNwb25zZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbWFwcGVkRXZlbnRbYGF0dGVuZGVlc2BdID0gb3JpZ2luYWxFdmVudFtmaWVsZE5hbWVNYXBbYGF0dGVuZGVlc2BdXVxyXG4gICAgICAgICAgICAgIC5tYXAoYXR0ZW5kZWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgYWRkcmVzczogIF8uZ2V0KGF0dGVuZGVlLCBmaWVsZE5hbWVNYXBbYGF0dGVuZGVlQWRkcmVzc2BdKSxcclxuICAgICAgICAgICAgICAgICAgbmFtZTogICAgIF8uZ2V0KGF0dGVuZGVlLCBmaWVsZE5hbWVNYXBbYGF0dGVuZGVlTmFtZWBdKSxcclxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IF8uZ2V0KGF0dGVuZGVlLCAnU3RhdHVzJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtYXBwZWRFdmVudDtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyByZXR1cm4gcmVzdWx0cyBhbmQgc3VjY2VzcyFcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxyXG4gICAgICAgIHJlc3VsdHMsXHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxyXG4gICAgICB9O1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2Uuc3RhY2spO1xyXG4gICAgICBjb25zb2xlLmxvZygnT2ZmaWNlMzY1IEdldEJhdGNoRGF0YSBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycm9yTWVzc2FnZSkpO1xyXG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuXHJcbn1cclxuIl19
//# sourceMappingURL=index.js.map
