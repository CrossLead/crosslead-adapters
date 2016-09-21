'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _Adapter = require('../base/Adapter');

var _Adapter2 = _interopRequireDefault(_Adapter);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Office 365 Calendar adapter
 */
var Office365CalendarAdapter = function (_Office365BaseAdapter) {
  (0, _inherits3.default)(Office365CalendarAdapter, _Office365BaseAdapter);

  function Office365CalendarAdapter() {
    (0, _classCallCheck3.default)(this, Office365CalendarAdapter);
    return (0, _possibleConstructorReturn3.default)(this, (Office365CalendarAdapter.__proto__ || (0, _getPrototypeOf2.default)(Office365CalendarAdapter)).apply(this, arguments));
  }

  (0, _createClass3.default)(Office365CalendarAdapter, [{
    key: 'getBatchData',


    // collect these fields always...
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(userProfiles, filterStartDate, filterEndDate, additionalFields) {
        var _this2 = this;

        var fieldNameMap, dataAdapterRunStats, eventData, results;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fieldNameMap = this.constructor.fieldNameMap;
                dataAdapterRunStats = {
                  emails: userProfiles,
                  filterStartDate: filterStartDate,
                  filterEndDate: filterEndDate,
                  success: false,
                  runDate: (0, _moment2.default)().utc().toDate()
                };
                _context.prev = 2;
                _context.next = 5;
                return _promise2.default.all(userProfiles.map(function (userProfile) {
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
                  return (0, _extends3.default)({}, user.userProfile, {
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

                return _context.abrupt('return', (0, _extends3.default)({}, dataAdapterRunStats, {
                  results: results,
                  success: true
                }));

              case 10:
                _context.prev = 10;
                _context.t0 = _context['catch'](2);

                console.log(_context.t0.stack);
                console.log('Office365 GetBatchData Error: ' + (0, _stringify2.default)(_context.t0));
                return _context.abrupt('return', (0, _extends3.default)({}, dataAdapterRunStats, { errorMessage: _context.t0 }));

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
}(_Adapter2.default);

Office365CalendarAdapter.baseFields = ['Id', 'Attendees', 'Calendar', 'Categories', 'DateTimeCreated', 'DateTimeLastModified', 'End', 'EndTimeZone', 'HasAttachments', 'Importance', 'iCalUID', 'IsAllDay', 'IsCancelled', 'IsOrganizer', 'Location', 'Organizer', 'Recurrence', 'ResponseRequested', 'ResponseStatus', 'SeriesMasterId', 'ShowAs', 'Start', 'StartTimeZone', 'Subject', 'Type', 'WebLink', 'Sensitivity'];
Office365CalendarAdapter.fieldNameMap = {
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
};
exports.default = Office365CalendarAdapter;
//# sourceMappingURL=../../../clAdapters/office365/calendar/index.js.map