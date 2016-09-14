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
    value: ['Id', 'Attendees', 'Calendar', 'Categories', 'DateTimeCreated', 'DateTimeLastModified', 'End', 'EndTimeZone', 'HasAttachments', 'Importance', 'iCalUID', 'IsAllDay', 'IsCancelled', 'IsOrganizer', 'Location', 'Organizer', 'Recurrence', 'ResponseRequested', 'ResponseStatus', 'SeriesMasterId', 'ShowAs', 'Start', 'StartTimeZone', 'Subject', 'Type', 'WebLink', 'Sensitivity'],

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
      'url': 'WebLink',
      'privacy': 'Sensitivity'
    },
    enumerable: true
  }]);

  return Office365CalendarAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365CalendarAdapter;
module.exports = exports['default'];

// replace data keys with desired mappings...

// return results and success!
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2NhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQXVDLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQThFekIsc0JBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRXZFLFlBQVksRUFDZCxtQkFBbUIsRUFTakIsU0FBUyxFQVNULE9BQU87Ozs7OztBQW5CUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFFLFlBQVk7QUFDcEIsNkJBQWUsRUFBZixlQUFlO0FBQ2YsMkJBQWEsRUFBYixhQUFhO0FBQ2IscUJBQU8sRUFBRSxLQUFLO0FBQ2QscUJBQU8sRUFBRSwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTthQUNqQzs7OzBEQUdvQixZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsV0FBVztxQkFBSSxNQUFLLFdBQVcsQ0FBQztBQUN4RSwyQkFBVyxFQUFYLFdBQVc7QUFDWCwrQkFBZSxFQUFmLGVBQWU7QUFDZiw2QkFBYSxFQUFiLGFBQWE7QUFDYixnQ0FBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLHVCQUFPLEVBQUUsY0FBYztlQUN4QixDQUFDO2FBQUEsQ0FBQzs7O0FBTkcscUJBQVM7QUFTVCxtQkFBTyxHQUFHLG9CQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDdkMsa0NBQ0ssSUFBSSxDQUFDLFdBQVc7QUFDbkIsK0JBQWUsRUFBRyxJQUFJLENBQUMsZUFBZTtBQUN0Qyw2QkFBYSxFQUFLLElBQUksQ0FBQyxhQUFh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LG9CQUFjLEVBQXlCLHNCQUFzQjtBQUM3RCw2QkFBdUIsRUFBZ0IseUJBQXlCO0FBQ2hFLDJCQUFxQixFQUFrQix1QkFBdUI7QUFDOUQsNEJBQXNCLEVBQWlCLHdCQUF3QjtBQUMvRCxzQ0FBZ0MsRUFBTyxrQ0FBa0M7QUFDekUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG1DQUE2QixFQUFVLCtCQUErQjtBQUN0RSwyQ0FBcUMsRUFBRSx1Q0FBdUM7QUFDOUUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG9DQUE4QixFQUFTLGdDQUFnQztBQUN2RSxxQkFBZSxFQUF3Qiw2QkFBNkI7QUFDcEUsc0JBQWdCLEVBQXVCLGdDQUFnQztBQUN2RSxrQkFBWSxFQUEyQixZQUFZO0FBQ25ELHlCQUFtQixFQUFvQixtQkFBbUI7QUFDMUQsc0JBQWdCLEVBQXVCLGdCQUFnQjtBQUN2RCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELGNBQVEsRUFBK0IsUUFBUTtBQUMvQyxxQkFBZSxFQUF3QixPQUFPO0FBQzlDLHFCQUFlLEVBQXdCLGVBQWU7QUFDdEQsbUJBQWEsRUFBMEIsS0FBSztBQUM1QyxtQkFBYSxFQUEwQixhQUFhO0FBQ3BELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxZQUFNLEVBQWlDLE1BQU07QUFDN0MsV0FBSyxFQUFrQyxTQUFTO0FBQ2hELGVBQVMsRUFBOEIsYUFBYTtLQUNyRDs7OztTQTNFa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3QiIsImZpbGUiOiJjbEFkYXB0ZXJzL29mZmljZTM2NS9jYWxlbmRhci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb21lbnQgICAgICAgICAgICAgICAgICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IF8gICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgICAgICAgZnJvbSAnLi4vYmFzZS9BZGFwdGVyJztcblxuXG4vKipcbiAqIE9mZmljZSAzNjUgQ2FsZW5kYXIgYWRhcHRlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVDYWxlbmRhckFkYXB0ZXIgZXh0ZW5kcyBPZmZpY2UzNjVCYXNlQWRhcHRlciB7XG5cbiAgLy8gY29sbGVjdCB0aGVzZSBmaWVsZHMgYWx3YXlzLi4uXG4gIHN0YXRpYyBiYXNlRmllbGRzID0gW1xuICAgICdJZCcsXG4gICAgJ0F0dGVuZGVlcycsXG4gICAgJ0NhbGVuZGFyJyxcbiAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXG4gICAgJ0RhdGVUaW1lTGFzdE1vZGlmaWVkJyxcbiAgICAnRW5kJyxcbiAgICAnRW5kVGltZVpvbmUnLFxuICAgICdIYXNBdHRhY2htZW50cycsXG4gICAgJ0ltcG9ydGFuY2UnLFxuICAgICdpQ2FsVUlEJyxcbiAgICAnSXNBbGxEYXknLFxuICAgICdJc0NhbmNlbGxlZCcsXG4gICAgJ0lzT3JnYW5pemVyJyxcbiAgICAnTG9jYXRpb24nLFxuICAgICdPcmdhbml6ZXInLFxuICAgICdSZWN1cnJlbmNlJyxcbiAgICAnUmVzcG9uc2VSZXF1ZXN0ZWQnLFxuICAgICdSZXNwb25zZVN0YXR1cycsXG4gICAgJ1Nlcmllc01hc3RlcklkJyxcbiAgICAnU2hvd0FzJyxcbiAgICAnU3RhcnQnLFxuICAgICdTdGFydFRpbWVab25lJyxcbiAgICAnU3ViamVjdCcsXG4gICAgJ1R5cGUnLFxuICAgICdXZWJMaW5rJyxcbiAgICAnU2Vuc2l0aXZpdHknXG4gIF1cblxuICAvLyBjb252ZXJ0IHRoZSBuYW1lcyBvZiB0aGUgYXBpIHJlc3BvbnNlIGRhdGFcbiAgc3RhdGljIGZpZWxkTmFtZU1hcCA9IHtcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxuICAgICdldmVudElkJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJZCcsXG4gICAgJ2F0dGVuZGVlcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0F0dGVuZGVlcycsXG4gICAgJ2NhbGVuZGFyTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0NhbGVuZGFyJyxcbiAgICAnY2F0ZWdvcmllcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ2RhdGVUaW1lQ3JlYXRlZCc6ICAgICAgICAgICAgICAgICAgICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXG4gICAgJ2RhdGVUaW1lTGFzdE1vZGlmaWVkJzogICAgICAgICAgICAgICAgJ0RhdGVUaW1lTGFzdE1vZGlmaWVkJyxcbiAgICAnYXR0ZW5kZWVBZGRyZXNzJzogICAgICAgICAgICAgICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdhdHRlbmRlZU5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2hhc0F0dGFjaG1lbnRzJzogICAgICAgICAgICAgICAgICAgICAgJ0hhc0F0dGFjaG1lbnRzJyxcbiAgICAnaW1wb3J0YW5jZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnSW1wb3J0YW5jZScsXG4gICAgJ2lDYWxVSWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lDYWxVSWQnLFxuICAgICdhbGxEYXknOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJc0FsbERheScsXG4gICAgJ2NhbmNlbGVkJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lzQ2FuY2VsbGVkJyxcbiAgICAnaXNPcmdhbml6ZXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnSXNPcmdhbml6ZXInLFxuICAgICdsb2NhdGlvbk5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdMb2NhdGlvbi5EaXNwbGF5TmFtZScsXG4gICAgJ2xvY2F0aW9uQWRkcmVzc1N0cmVldCc6ICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkFkZHJlc3MuU3RyZWV0JyxcbiAgICAnbG9jYXRpb25BZGRyZXNzQ2l0eSc6ICAgICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5DaXR5JyxcbiAgICAnbG9jYXRpb25BZGRyZXNzU3RhdGUnOiAgICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5TdGF0ZScsXG4gICAgJ2xvY2F0aW9uQWRkcmVzc0NvdW50cnlPclJlZ2lvbic6ICAgICAgJ0xvY2F0aW9uLkFkZHJlc3MuQ291bnRyeU9yUmVnaW9uJyxcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0FjY3VyYWN5JzogICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuQWNjdXJhY3knLFxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzQWx0aXR1ZGUnOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5BbHRpdHVkZScsXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNBbHRpdHVkZUFjY3VyYWN5JzogJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkFsdGl0dWRlQWNjdXJhY3knLFxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzTGF0aXR1ZGUnOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5MYXRpdHVkZScsXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNMb25naXR1ZGUnOiAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkxvbmdpdHVkZScsXG4gICAgJ29yZ2FuaXplck5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgJ09yZ2FuaXplci5FbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ29yZ2FuaXplckVtYWlsJzogICAgICAgICAgICAgICAgICAgICAgJ09yZ2FuaXplci5FbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ3JlY3VycmFuY2UnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY3VycmFuY2UnLFxuICAgICdyZXNwb25zZVJlcXVlc3RlZCc6ICAgICAgICAgICAgICAgICAgICdSZXNwb25zZVJlcXVlc3RlZCcsXG4gICAgJ3Jlc3BvbnNlU3RhdHVzJzogICAgICAgICAgICAgICAgICAgICAgJ1Jlc3BvbnNlU3RhdHVzJyxcbiAgICAnc2VyaWVzTWFzdGVySWQnOiAgICAgICAgICAgICAgICAgICAgICAnU2VyaWVzTWFzdGVySWQnLFxuICAgICdzaG93QXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdTaG93QXMnLFxuICAgICdkYXRlVGltZVN0YXJ0JzogICAgICAgICAgICAgICAgICAgICAgICdTdGFydCcsXG4gICAgJ3N0YXJ0VGltZVpvbmUnOiAgICAgICAgICAgICAgICAgICAgICAgJ1N0YXJ0VGltZVpvbmUnLFxuICAgICdkYXRlVGltZUVuZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICdFbmQnLFxuICAgICdlbmRUaW1lWm9uZSc6ICAgICAgICAgICAgICAgICAgICAgICAgICdFbmRUaW1lWm9uZScsXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N1YmplY3QnLFxuICAgICd0eXBlJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUeXBlJyxcbiAgICAndXJsJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV2ViTGluaycsXG4gICAgJ3ByaXZhY3knOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1NlbnNpdGl2aXR5J1xuICB9XG5cblxuICBhc3luYyBnZXRCYXRjaERhdGEodXNlclByb2ZpbGVzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcblxuICAgIGNvbnN0IHsgZmllbGROYW1lTWFwIH0gPSB0aGlzLmNvbnN0cnVjdG9yLFxuICAgICAgICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMgICA9IHtcbiAgICAgICAgICAgIGVtYWlsczogdXNlclByb2ZpbGVzLFxuICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKClcbiAgICAgICAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGF3YWl0KiB1c2VyUHJvZmlsZXMubWFwKHVzZXJQcm9maWxlID0+IHRoaXMuZ2V0VXNlckRhdGEoe1xuICAgICAgICB1c2VyUHJvZmlsZSxcbiAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgICBhcGlUeXBlOiAnY2FsZW5kYXJ2aWV3J1xuICAgICAgfSkpO1xuXG4gICAgICAvLyByZXBsYWNlIGRhdGEga2V5cyB3aXRoIGRlc2lyZWQgbWFwcGluZ3MuLi5cbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBfLm1hcChldmVudERhdGEsIHVzZXIgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnVzZXIudXNlclByb2ZpbGUsXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlOiAgdXNlci5maWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZTogICAgdXNlci5maWx0ZXJFbmREYXRlLFxuICAgICAgICAgIHN1Y2Nlc3M6ICAgICAgICAgIHVzZXIuc3VjY2VzcyxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICAgICB1c2VyLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAvLyBtYXAgZGF0YSB3aXRoIGRlc2lyZWQga2V5IG5hbWVzLi4uXG4gICAgICAgICAgZGF0YTogXy5tYXAodXNlci5kYXRhIHx8IFtdLCBvcmlnaW5hbEV2ZW50ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZEV2ZW50ID0ge307XG5cbiAgICAgICAgICAgIC8vIGNoYW5nZSB0byBkZXNpcmVkIG5hbWVzXG4gICAgICAgICAgICBfLmVhY2goZmllbGROYW1lTWFwLCAoaGF2ZSwgd2FudCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBtYXBwZWQgPSBfLmdldChvcmlnaW5hbEV2ZW50LCBoYXZlKTtcbiAgICAgICAgICAgICAgaWYgKG1hcHBlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWFwcGVkRXZlbnRbd2FudF0gPSAvXmRhdGVUaW1lLy50ZXN0KHdhbnQpID8gbmV3IERhdGUobWFwcGVkKSA6IG1hcHBlZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChtYXBwZWRFdmVudC5yZXNwb25zZVN0YXR1cyAmJiBtYXBwZWRFdmVudC5yZXNwb25zZVN0YXR1cy5SZXNwb25zZSkge1xuICAgICAgICAgICAgICBtYXBwZWRFdmVudC5yZXNwb25zZVN0YXR1cyA9IG1hcHBlZEV2ZW50LnJlc3BvbnNlU3RhdHVzLlJlc3BvbnNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtYXBwZWRFdmVudFtgYXR0ZW5kZWVzYF0gPSBvcmlnaW5hbEV2ZW50W2ZpZWxkTmFtZU1hcFtgYXR0ZW5kZWVzYF1dXG4gICAgICAgICAgICAgIC5tYXAoYXR0ZW5kZWUgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICBhZGRyZXNzOiAgXy5nZXQoYXR0ZW5kZWUsIGZpZWxkTmFtZU1hcFtgYXR0ZW5kZWVBZGRyZXNzYF0pLFxuICAgICAgICAgICAgICAgICAgbmFtZTogICAgIF8uZ2V0KGF0dGVuZGVlLCBmaWVsZE5hbWVNYXBbYGF0dGVuZGVlTmFtZWBdKSxcbiAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBfLmdldChhdHRlbmRlZSwgJ1N0YXR1cycpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG1hcHBlZEV2ZW50O1xuICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgLy8gcmV0dXJuIHJlc3VsdHMgYW5kIHN1Y2Nlc3MhXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxuICAgICAgICByZXN1bHRzLFxuICAgICAgICBzdWNjZXNzOiB0cnVlXG4gICAgICB9O1xuXG4gICAgfSBjYXRjaCAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2Uuc3RhY2spO1xuICAgICAgY29uc29sZS5sb2coJ09mZmljZTM2NSBHZXRCYXRjaERhdGEgRXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvck1lc3NhZ2UpKTtcbiAgICAgIHJldHVybiB7IC4uLmRhdGFBZGFwdGVyUnVuU3RhdHMsIGVycm9yTWVzc2FnZSB9O1xuICAgIH1cblxuICB9XG5cblxufVxuIl19
//# sourceMappingURL=index.js.map
