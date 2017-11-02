"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../google/errors");
const googleapis = require("googleapis");
const _ = require("lodash");
// google calendar api
const calendar = googleapis.calendar('v3');
function handleGoogleError(res, rej, returnVal) {
    return (err, result) => {
        if (err) {
            let mapped = err;
            if (err instanceof Error) {
                // Map to custom errors
                if (/unauthorized_client/.test(err.message.toString())) {
                    mapped = errors_1.createGoogleError('UnauthorizedClient', err);
                }
                // TODO: other types
            }
            else if (!err.kind) {
                // Not a GoogleError
                mapped = new Error(JSON.stringify(err));
            }
            // Leave GoogleErrors
            rej(mapped);
        }
        else {
            res(typeof returnVal !== 'undefined' ? returnVal : result);
        }
    };
}
exports.handleGoogleError = handleGoogleError;
function calendarIdsFor(userProfile, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * calendar ids we want to
         * retrieve events from
         */
        const includedCalendarIds = new Set([
            'primary',
            userProfile.email.toLowerCase(),
            userProfile.emailAfterMapping.toLowerCase()
        ]);
        /**
         * all calendar ids in the users calendar
         */
        return _.chain(yield (new Promise((res, rej) => {
            calendar.calendarList.list({ auth }, (err, d) => handleGoogleError(res, rej)(err, d && d.items));
        })))
            .filter((item) => includedCalendarIds.has(item.id.toLowerCase()))
            .map('id')
            .value();
    });
}
exports.calendarIdsFor = calendarIdsFor;
//# sourceMappingURL=util.js.map