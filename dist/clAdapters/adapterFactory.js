"use strict";
const adapters = require("./");
const adapterTypes_1 = require("./adapterTypes");
/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
class AdapterFactory {
    /**
     * Static factory
     * @param  {AdapterType} type
     * @return {BaseAdapter} concrete adapter subclass
     */
    static createAdapter(type) {
        switch (type) {
            case adapterTypes_1.default.CUSTOM:
                throw new Error('Custom adapters provide their own approach');
            case adapterTypes_1.default.NETSUITE:
                return new adapters.NetSuiteAdapter();
            case adapterTypes_1.default.CL_MOCK:
                return new adapters.CLMockAdapter();
            case adapterTypes_1.default.OFFICE365:
                return new adapters.Office365MailAdapter();
            case adapterTypes_1.default.OFFICE365_CALENDAR:
                return new adapters.Office365CalendarAdapter();
            case adapterTypes_1.default.GOOGLE:
                return new adapters.GoogleAdapter();
            case adapterTypes_1.default.GOOGLE_CALENDAR:
                return new adapters.GoogleCalendarAdapter();
            case adapterTypes_1.default.JIRA:
                return new adapters.JiraAdapter();
            case adapterTypes_1.default.SLACK:
                return new adapters.SlackAdapter();
            default:
                throw new Error('Unknown type');
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdapterFactory;
