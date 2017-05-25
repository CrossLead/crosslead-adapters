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
})(AdapterTypes || (AdapterTypes = {}));
;
exports.default = AdapterTypes;
//# sourceMappingURL=adapterTypes.js.map