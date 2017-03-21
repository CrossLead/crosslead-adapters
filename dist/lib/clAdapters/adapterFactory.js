"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const adapterTypes_1 = require("./adapterTypes");
/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
class AdapterFactory {
    static createAdapter(type) {
        switch (type) {
            case adapterTypes_1.default.CUSTOM:
                throw new Error('Custom adapters provide their own approach');
            case adapterTypes_1.default.NETSUITE:
                return new _1.NetSuiteAdapter();
            case adapterTypes_1.default.CL_MOCK:
                return new _1.CLMockAdapter();
            case adapterTypes_1.default.OFFICE365:
                return new _1.Office365MailAdapter();
            case adapterTypes_1.default.OFFICE365_CALENDAR:
                return new _1.Office365CalendarAdapter();
            case adapterTypes_1.default.GOOGLE:
                return new _1.GoogleAdapter();
            case adapterTypes_1.default.GOOGLE_CALENDAR:
                return new _1.GoogleCalendarAdapter();
            case adapterTypes_1.default.JIRA:
                return new _1.JiraAdapter();
            case adapterTypes_1.default.SLACK:
                return new _1.SlackAdapter();
            default:
                throw new Error(`Unknown type ${type}`);
        }
    }
}
exports.default = AdapterFactory;
//# sourceMappingURL=adapterFactory.js.map