"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Adapter_1 = require("../base/Adapter");
const request = require("request");
const rate_limit_1 = require("../../utils/rate-limit");
class SlackAdapter extends Adapter_1.default {
    constructor() {
        super(...arguments);
        this.credentials = {
            access_token: '',
            scope: '',
            user_id: '',
            team_name: '',
            team_id: ''
        };
        this.sensitiveCredentialsFields = ['access_token'];
    }
    /**
     * Rate limit (at prototype level) slack api calls to once per second.
     */
    static callSlackApiMethod(method, params = {}) {
        let paramString = '';
        for (const p in params) {
            paramString += `${p}=${params[p]}&`;
        }
        return new Promise((resolve, reject) => {
            request.get(`${this.baseApiUrl}/${method}?${paramString}`, (err, resp, body) => {
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
    init() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getFieldData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Slack adapters currently do not support `getFieldData()`');
        });
    }
}
SlackAdapter.baseApiUrl = 'https://slack.com/api';
__decorate([
    rate_limit_1.default(1000)
], SlackAdapter, "callSlackApiMethod", null);
exports.default = SlackAdapter;
//# sourceMappingURL=index.js.map