"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mail_1 = require("./mail");
const calendar_1 = require("./calendar");
const errors_1 = require("./errors");
exports.default = {
    GoogleMailAdapter: mail_1.default,
    GoogleCalendarAdapter: calendar_1.default,
    InvalidGrantError: errors_1.InvalidGrantError,
    UnauthorizedClientError: errors_1.UnauthorizedClientError
};
//# sourceMappingURL=index.js.map