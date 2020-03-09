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
            case adapterTypes_1.AdapterTypes.CUSTOM:
                throw new Error('Custom adapters provide their own approach');
            case adapterTypes_1.AdapterTypes.NETSUITE:
                return new _1.NetSuiteAdapter();
            case adapterTypes_1.AdapterTypes.CL_MOCK:
                return new _1.CLMockAdapter();
            case adapterTypes_1.AdapterTypes.OFFICE365:
                return new _1.Office365MailAdapter();
            case adapterTypes_1.AdapterTypes.OFFICE365_CALENDAR:
                return new _1.Office365CalendarAdapter();
            case adapterTypes_1.AdapterTypes.GOOGLE:
                return new _1.GoogleAdapter();
            case adapterTypes_1.AdapterTypes.GOOGLE_CALENDAR:
                return new _1.GoogleCalendarAdapter();
            case adapterTypes_1.AdapterTypes.JIRA:
                return new _1.JiraAdapter();
            case adapterTypes_1.AdapterTypes.SLACK:
                return new _1.SlackAdapter();
            case adapterTypes_1.AdapterTypes.ACTIVE_SYNC_CALENDAR:
                return new _1.ActiveSyncCalendarAdapter();
            case adapterTypes_1.AdapterTypes.EXCHANGE_SERVICE_CALENDAR:
                return new _1.ExchangeServiceCalendarAdapter();
            case adapterTypes_1.AdapterTypes.GOOGLE_OAUTH_CALENDAR:
                return new _1.GoogleOauthCalendarAdapter();
            case adapterTypes_1.AdapterTypes.GLOBAL_RELAY:
                return new _1.GlobalRelayAdapter();
            case adapterTypes_1.AdapterTypes.MICROSOFT_TEAMS:
                return new _1.MicrosoftTeamsAdapter();
            default:
                throw new Error(`Unknown type ${type}`);
        }
    }
}
exports.default = AdapterFactory;
//# sourceMappingURL=adapterFactory.js.map