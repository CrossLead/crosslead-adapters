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
                apiType: 'events',
                $filter: (' Start ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                      and Start lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                  ').replace(/\s+/g, ' ').trim()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcY2FsZW5kYXJcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQXVDLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7OzsyQkFDUixpQkFBaUI7Ozs7Ozs7O0lBTW5DLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQTRFekIsc0JBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRXZFLFlBQVksRUFDZCxtQkFBbUIsRUFVakIsU0FBUyxFQWFULE9BQU87Ozs7OztBQXhCUCx3QkFBWSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQWpDLFlBQVk7QUFDZCwrQkFBbUIsR0FBSztBQUN0QixvQkFBTSxFQUFFLFlBQVk7QUFDcEIsNkJBQWUsRUFBZixlQUFlO0FBQ2YsMkJBQWEsRUFBYixhQUFhO0FBQ2IscUJBQU8sRUFBRSxLQUFLO0FBQ2QscUJBQU8sRUFBRSwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTthQUNqQzs7OzBEQUlvQixZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsV0FBVztxQkFBSSxNQUFLLFdBQVcsQ0FBQztBQUN4RSwyQkFBVyxFQUFYLFdBQVc7QUFDWCwrQkFBZSxFQUFmLGVBQWU7QUFDZiw2QkFBYSxFQUFiLGFBQWE7QUFDYixnQ0FBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLHVCQUFPLEVBQUUsUUFBUTtBQUNqQix1QkFBTyxFQUFHLGdCQUFhLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyw2Q0FDeEMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLDJCQUM3RCxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxD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QStCLFVBQVU7QUFDakQsZ0JBQVUsRUFBNkIsYUFBYTtBQUNwRCxtQkFBYSxFQUEwQixhQUFhO0FBQ3BELG9CQUFjLEVBQXlCLHNCQUFzQjtBQUM3RCw2QkFBdUIsRUFBZ0IseUJBQXlCO0FBQ2hFLDJCQUFxQixFQUFrQix1QkFBdUI7QUFDOUQsNEJBQXNCLEVBQWlCLHdCQUF3QjtBQUMvRCxzQ0FBZ0MsRUFBTyxrQ0FBa0M7QUFDekUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG1DQUE2QixFQUFVLCtCQUErQjtBQUN0RSwyQ0FBcUMsRUFBRSx1Q0FBdUM7QUFDOUUsbUNBQTZCLEVBQVUsK0JBQStCO0FBQ3RFLG9DQUE4QixFQUFTLGdDQUFnQztBQUN2RSxxQkFBZSxFQUF3Qiw2QkFBNkI7QUFDcEUsc0JBQWdCLEVBQXVCLGdDQUFnQztBQUN2RSxrQkFBWSxFQUEyQixZQUFZO0FBQ25ELHlCQUFtQixFQUFvQixtQkFBbUI7QUFDMUQsc0JBQWdCLEVBQXVCLGdCQUFnQjtBQUN2RCxzQkFBZ0IsRUFBdUIsZ0JBQWdCO0FBQ3ZELGNBQVEsRUFBK0IsUUFBUTtBQUMvQyxxQkFBZSxFQUF3QixPQUFPO0FBQzlDLHFCQUFlLEVBQXdCLGVBQWU7QUFDdEQsbUJBQWEsRUFBMEIsS0FBSztBQUM1QyxtQkFBYSxFQUEwQixhQUFhO0FBQ3BELGVBQVMsRUFBOEIsU0FBUztBQUNoRCxZQUFNLEVBQWlDLE1BQU07QUFDN0MsV0FBSyxFQUFrQyxTQUFTO0tBQ2pEOzs7O1NBekVrQix3QkFBd0I7OztxQkFBeEIsd0JBQXdCIiwiZmlsZSI6ImNsQWRhcHRlcnNcXG9mZmljZTM2NVxcY2FsZW5kYXJcXGluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbWVudCAgICAgICAgICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XHJcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgICAgICAgZnJvbSAnLi4vYmFzZS9BZGFwdGVyJztcclxuXHJcblxyXG4vKipcclxuICogT2ZmaWNlIDM2NSBDYWxlbmRhciBhZGFwdGVyXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVDYWxlbmRhckFkYXB0ZXIgZXh0ZW5kcyBPZmZpY2UzNjVCYXNlQWRhcHRlciB7XHJcblxyXG4gIC8vIGNvbGxlY3QgdGhlc2UgZmllbGRzIGFsd2F5cy4uLlxyXG4gIHN0YXRpYyBiYXNlRmllbGRzID0gW1xyXG4gICAgJ0lkJyxcclxuICAgICdBdHRlbmRlZXMnLFxyXG4gICAgJ0NhbGVuZGFyJyxcclxuICAgICdDYXRlZ29yaWVzJyxcclxuICAgICdEYXRlVGltZUNyZWF0ZWQnLFxyXG4gICAgJ0RhdGVUaW1lTGFzdE1vZGlmaWVkJyxcclxuICAgICdFbmQnLFxyXG4gICAgJ0VuZFRpbWVab25lJyxcclxuICAgICdIYXNBdHRhY2htZW50cycsXHJcbiAgICAnSW1wb3J0YW5jZScsXHJcbiAgICAnaUNhbFVJRCcsXHJcbiAgICAnSXNBbGxEYXknLFxyXG4gICAgJ0lzQ2FuY2VsbGVkJyxcclxuICAgICdJc09yZ2FuaXplcicsXHJcbiAgICAnTG9jYXRpb24nLFxyXG4gICAgJ09yZ2FuaXplcicsXHJcbiAgICAnUmVjdXJyZW5jZScsXHJcbiAgICAnUmVzcG9uc2VSZXF1ZXN0ZWQnLFxyXG4gICAgJ1Jlc3BvbnNlU3RhdHVzJyxcclxuICAgICdTZXJpZXNNYXN0ZXJJZCcsXHJcbiAgICAnU2hvd0FzJyxcclxuICAgICdTdGFydCcsXHJcbiAgICAnU3RhcnRUaW1lWm9uZScsXHJcbiAgICAnU3ViamVjdCcsXHJcbiAgICAnVHlwZScsXHJcbiAgICAnV2ViTGluaydcclxuICBdXHJcblxyXG4gIC8vIGNvbnZlcnQgdGhlIG5hbWVzIG9mIHRoZSBhcGkgcmVzcG9uc2UgZGF0YVxyXG4gIHN0YXRpYyBmaWVsZE5hbWVNYXAgPSB7XHJcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxyXG4gICAgJ2V2ZW50SWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lkJyxcclxuICAgICdhdHRlbmRlZXMnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICdBdHRlbmRlZXMnLFxyXG4gICAgJ2NhbGVuZGFyTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ0NhbGVuZGFyJyxcclxuICAgICdjYXRlZ29yaWVzJzogICAgICAgICAgICAgICAgICAgICAgICAgICdDYXRlZ29yaWVzJyxcclxuICAgICdkYXRlVGltZUNyZWF0ZWQnOiAgICAgICAgICAgICAgICAgICAgICdEYXRlVGltZUNyZWF0ZWQnLFxyXG4gICAgJ2RhdGVUaW1lTGFzdE1vZGlmaWVkJzogICAgICAgICAgICAgICAgJ0RhdGVUaW1lTGFzdE1vZGlmaWVkJyxcclxuICAgICdhdHRlbmRlZUFkZHJlc3MnOiAgICAgICAgICAgICAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXHJcbiAgICAnYXR0ZW5kZWVOYW1lJzogICAgICAgICAgICAgICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxyXG4gICAgJ2hhc0F0dGFjaG1lbnRzJzogICAgICAgICAgICAgICAgICAgICAgJ0hhc0F0dGFjaG1lbnRzJyxcclxuICAgICdpbXBvcnRhbmNlJzogICAgICAgICAgICAgICAgICAgICAgICAgICdJbXBvcnRhbmNlJyxcclxuICAgICdpQ2FsVUlEJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpQ2FsVUlEJyxcclxuICAgICdhbGxEYXknOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJc0FsbERheScsXHJcbiAgICAnY2FuY2VsZWQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSXNDYW5jZWxsZWQnLFxyXG4gICAgJ2lzT3JnYW5pemVyJzogICAgICAgICAgICAgICAgICAgICAgICAgJ0lzT3JnYW5pemVyJyxcclxuICAgICdsb2NhdGlvbk5hbWUnOiAgICAgICAgICAgICAgICAgICAgICAgICdMb2NhdGlvbi5EaXNwbGF5TmFtZScsXHJcbiAgICAnbG9jYXRpb25BZGRyZXNzU3RyZWV0JzogICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5TdHJlZXQnLFxyXG4gICAgJ2xvY2F0aW9uQWRkcmVzc0NpdHknOiAgICAgICAgICAgICAgICAgJ0xvY2F0aW9uLkFkZHJlc3MuQ2l0eScsXHJcbiAgICAnbG9jYXRpb25BZGRyZXNzU3RhdGUnOiAgICAgICAgICAgICAgICAnTG9jYXRpb24uQWRkcmVzcy5TdGF0ZScsXHJcbiAgICAnbG9jYXRpb25BZGRyZXNzQ291bnRyeU9yUmVnaW9uJzogICAgICAnTG9jYXRpb24uQWRkcmVzcy5Db3VudHJ5T3JSZWdpb24nLFxyXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNBY2N1cmFjeSc6ICAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkFjY3VyYWN5JyxcclxuICAgICdsb2NhdGlvbkNvb3JkaW5hdGVzQWx0aXR1ZGUnOiAgICAgICAgICdMb2NhdGlvbi5Db29yZGluYXRlcy5BbHRpdHVkZScsXHJcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0FsdGl0dWRlQWNjdXJhY3knOiAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuQWx0aXR1ZGVBY2N1cmFjeScsXHJcbiAgICAnbG9jYXRpb25Db29yZGluYXRlc0xhdGl0dWRlJzogICAgICAgICAnTG9jYXRpb24uQ29vcmRpbmF0ZXMuTGF0aXR1ZGUnLFxyXG4gICAgJ2xvY2F0aW9uQ29vcmRpbmF0ZXNMb25naXR1ZGUnOiAgICAgICAgJ0xvY2F0aW9uLkNvb3JkaW5hdGVzLkxvbmdpdHVkZScsXHJcbiAgICAnb3JnYW5pemVyTmFtZSc6ICAgICAgICAgICAgICAgICAgICAgICAnT3JnYW5pemVyLkVtYWlsQWRkcmVzcy5OYW1lJyxcclxuICAgICdvcmdhbml6ZXJFbWFpbCc6ICAgICAgICAgICAgICAgICAgICAgICdPcmdhbml6ZXIuRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxyXG4gICAgJ3JlY3VycmFuY2UnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY3VycmFuY2UnLFxyXG4gICAgJ3Jlc3BvbnNlUmVxdWVzdGVkJzogICAgICAgICAgICAgICAgICAgJ1Jlc3BvbnNlUmVxdWVzdGVkJyxcclxuICAgICdyZXNwb25zZVN0YXR1cyc6ICAgICAgICAgICAgICAgICAgICAgICdSZXNwb25zZVN0YXR1cycsXHJcbiAgICAnc2VyaWVzTWFzdGVySWQnOiAgICAgICAgICAgICAgICAgICAgICAnU2VyaWVzTWFzdGVySWQnLFxyXG4gICAgJ3Nob3dBcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1Nob3dBcycsXHJcbiAgICAnZGF0ZVRpbWVTdGFydCc6ICAgICAgICAgICAgICAgICAgICAgICAnU3RhcnQnLFxyXG4gICAgJ3N0YXJ0VGltZVpvbmUnOiAgICAgICAgICAgICAgICAgICAgICAgJ1N0YXJ0VGltZVpvbmUnLFxyXG4gICAgJ2RhdGVUaW1lRW5kJzogICAgICAgICAgICAgICAgICAgICAgICAgJ0VuZCcsXHJcbiAgICAnZW5kVGltZVpvbmUnOiAgICAgICAgICAgICAgICAgICAgICAgICAnRW5kVGltZVpvbmUnLFxyXG4gICAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1N1YmplY3QnLFxyXG4gICAgJ3R5cGUnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1R5cGUnLFxyXG4gICAgJ3VybCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dlYkxpbmsnXHJcbiAgfVxyXG5cclxuXHJcbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKHVzZXJQcm9maWxlcywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XHJcblxyXG4gICAgY29uc3QgeyBmaWVsZE5hbWVNYXAgfSA9IHRoaXMuY29uc3RydWN0b3IsXHJcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzICAgPSB7XHJcbiAgICAgICAgICAgIGVtYWlsczogdXNlclByb2ZpbGVzLFxyXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXHJcbiAgICAgICAgICAgIGZpbHRlckVuZERhdGUsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgY29uc3QgZXZlbnREYXRhID0gYXdhaXQqIHVzZXJQcm9maWxlcy5tYXAodXNlclByb2ZpbGUgPT4gdGhpcy5nZXRVc2VyRGF0YSh7XHJcbiAgICAgICAgdXNlclByb2ZpbGUsXHJcbiAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICAgIGZpbHRlckVuZERhdGUsXHJcbiAgICAgICAgYWRkaXRpb25hbEZpZWxkcyxcclxuICAgICAgICBhcGlUeXBlOiAnZXZlbnRzJyxcclxuICAgICAgICAkZmlsdGVyOiAgYCBTdGFydCBnZSAke2ZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XHJcbiAgICAgICAgICAgICAgICAgICAgICBhbmQgU3RhcnQgbHQgJHtmaWx0ZXJFbmREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKX1cclxuICAgICAgICAgICAgICAgICAgYC5yZXBsYWNlKC9cXHMrL2csICcgJylcclxuICAgICAgICAgICAgICAgICAgIC50cmltKClcclxuICAgICAgfSkpO1xyXG5cclxuICAgICAgLy8gcmVwbGFjZSBkYXRhIGtleXMgd2l0aCBkZXNpcmVkIG1hcHBpbmdzLi4uXHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBfLm1hcChldmVudERhdGEsIHVzZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAuLi51c2VyLnVzZXJQcm9maWxlLFxyXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlOiAgdXNlci5maWx0ZXJTdGFydERhdGUsXHJcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlOiAgICB1c2VyLmZpbHRlckVuZERhdGUsXHJcbiAgICAgICAgICBzdWNjZXNzOiAgICAgICAgICB1c2VyLnN1Y2Nlc3MsXHJcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICAgICB1c2VyLmVycm9yTWVzc2FnZSxcclxuICAgICAgICAgIC8vIG1hcCBkYXRhIHdpdGggZGVzaXJlZCBrZXkgbmFtZXMuLi5cclxuICAgICAgICAgIGRhdGE6IF8ubWFwKHVzZXIuZGF0YSB8fCBbXSwgb3JpZ2luYWxFdmVudCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZEV2ZW50ID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBjaGFuZ2UgdG8gZGVzaXJlZCBuYW1lc1xyXG4gICAgICAgICAgICBfLmVhY2goZmllbGROYW1lTWFwLCAoaGF2ZSwgd2FudCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZCA9IF8uZ2V0KG9yaWdpbmFsRXZlbnQsIGhhdmUpO1xyXG4gICAgICAgICAgICAgIGlmIChtYXBwZWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbWFwcGVkRXZlbnRbd2FudF0gPSAvXmRhdGVUaW1lLy50ZXN0KHdhbnQpID8gbmV3IERhdGUobWFwcGVkKSA6IG1hcHBlZDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbWFwcGVkRXZlbnRbYGF0dGVuZGVlc2BdID0gb3JpZ2luYWxFdmVudFtmaWVsZE5hbWVNYXBbYGF0dGVuZGVlc2BdXVxyXG4gICAgICAgICAgICAgIC5tYXAoYXR0ZW5kZWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgYWRkcmVzczogIF8uZ2V0KGF0dGVuZGVlLCBmaWVsZE5hbWVNYXBbYGF0dGVuZGVlQWRkcmVzc2BdKSxcclxuICAgICAgICAgICAgICAgICAgbmFtZTogICAgIF8uZ2V0KGF0dGVuZGVlLCBmaWVsZE5hbWVNYXBbYGF0dGVuZGVlTmFtZWBdKSxcclxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IF8uZ2V0KGF0dGVuZGVlLCAnU3RhdHVzJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtYXBwZWRFdmVudDtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyByZXR1cm4gcmVzdWx0cyBhbmQgc3VjY2VzcyFcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxyXG4gICAgICAgIHJlc3VsdHMsXHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxyXG4gICAgICB9O1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2Uuc3RhY2spO1xyXG4gICAgICBjb25zb2xlLmxvZygnT2ZmaWNlMzY1IEdldEJhdGNoRGF0YSBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycm9yTWVzc2FnZSkpO1xyXG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuXHJcbn1cclxuIl19
//# sourceMappingURL=index.js.map
