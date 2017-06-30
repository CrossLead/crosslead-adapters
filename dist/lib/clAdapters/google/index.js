"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mail_1 = require("./mail");
const calendar_1 = require("./calendar");
const oauthCalendar_1 = require("./oauthCalendar");
exports.default = {
    GoogleMailAdapter: mail_1.default,
    GoogleCalendarAdapter: calendar_1.default,
    GoogleOauthCalendarAdapter: oauthCalendar_1.default
};
//# sourceMappingURL=index.js.map