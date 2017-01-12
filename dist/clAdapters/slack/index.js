"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const Adapter_1 = require("../base/Adapter");
const request_1 = require("request");
const rate_limit_1 = require("../../utils/rate-limit");
class SlackAdapter extends Adapter_1.default {
    /**
     * Rate limit (at prototype level) slack api calls to once per second.
     */
    static callSlackApiMethod(method, params = {}) {
        let paramString = '';
        for (const p in params) {
            paramString += `${p}=${params[p]}&`;
        }
        return new Promise((resolve, reject) => {
            request_1.default.get(`${this.baseApiUrl}/${method}?${paramString}`, (err, resp, body) => {
                if (!err && resp.statusCode === 200) {
                    resolve(JSON.parse(body));
                }
                else {
                    reject(err);
                }
            });
        });
    }
    // null init function...
    init() { }
}
SlackAdapter.baseApiUrl = 'https://slack.com/api';
__decorate([
    rate_limit_1.default(1000)
], SlackAdapter, "callSlackApiMethod", null);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SlackAdapter;
