"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Enumeration for different adapter types
 *
 * @enum
 */
var AdapterTypes;
(function (AdapterTypes) {
    AdapterTypes[AdapterTypes["CUSTOM"] = 1] = "CUSTOM";
    AdapterTypes[AdapterTypes["NETSUITE"] = 2] = "NETSUITE";
    AdapterTypes[AdapterTypes["CL_MOCK"] = 3] = "CL_MOCK";
    AdapterTypes[AdapterTypes["OFFICE365"] = 4] = "OFFICE365";
    AdapterTypes[AdapterTypes["GOOGLE"] = 5] = "GOOGLE";
    AdapterTypes[AdapterTypes["GOOGLE_CALENDAR"] = 6] = "GOOGLE_CALENDAR";
    AdapterTypes[AdapterTypes["OFFICE365_CALENDAR"] = 7] = "OFFICE365_CALENDAR";
    AdapterTypes[AdapterTypes["JIRA"] = 8] = "JIRA";
    AdapterTypes[AdapterTypes["SLACK"] = 9] = "SLACK";
    AdapterTypes[AdapterTypes["ACTIVE_SYNC_CALENDAR"] = 10] = "ACTIVE_SYNC_CALENDAR";
    AdapterTypes[AdapterTypes["EXCHANGE_SERVICE_CALENDAR"] = 11] = "EXCHANGE_SERVICE_CALENDAR";
    AdapterTypes[AdapterTypes["GOOGLE_OAUTH_CALENDAR"] = 12] = "GOOGLE_OAUTH_CALENDAR";
    AdapterTypes[AdapterTypes["GLOBAL_RELAY"] = 13] = "GLOBAL_RELAY";
})(AdapterTypes = exports.AdapterTypes || (exports.AdapterTypes = {}));
;
// This map needs to be kept in sync with the above AdapterTypes enum.
// I'd switch it to a string enum, but for the fact that users of this
// library put the integer values into databases and so forth.
exports.AdapterNameMap = [
    null,
    'Custom',
    'Netsuite',
    'Mock',
    'Office 365',
    'Google Mail',
    'Google Calendar',
    'Office 365 Calendar',
    'JIRA',
    'Slack',
    'ActiveSync',
    'Exchange Service Calendar',
    'Google OAuth Calendar',
    'Global Relay',
];
/**
 * Array of enums values for different user linked adapter types
 *
 * @array
 */
exports.AdapterLinkedAccountTypes = [
    AdapterTypes.ACTIVE_SYNC_CALENDAR,
    AdapterTypes.GOOGLE_OAUTH_CALENDAR
];
/**
 * Array of enums values that represent org-wide adapters
 *
 * @array
 */
exports.OrgWideAdapterTypes = [
    AdapterTypes.GOOGLE_CALENDAR,
    AdapterTypes.OFFICE365_CALENDAR,
    AdapterTypes.EXCHANGE_SERVICE_CALENDAR,
];
/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
var AdapterStatus;
(function (AdapterStatus) {
    AdapterStatus[AdapterStatus["ACTIVE"] = 1] = "ACTIVE";
    AdapterStatus[AdapterStatus["DELETED"] = 2] = "DELETED";
    AdapterStatus[AdapterStatus["DISABLED"] = 3] = "DISABLED";
    AdapterStatus[AdapterStatus["FAILED"] = 4] = "FAILED";
})(AdapterStatus = exports.AdapterStatus || (exports.AdapterStatus = {}));
//# sourceMappingURL=adapterTypes.js.map