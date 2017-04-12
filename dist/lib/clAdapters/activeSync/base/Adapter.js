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
const index_1 = require("../../base/index");
const autodiscover = require("autodiscover-activesync");
class ActiveSyncBaseAdapter extends index_1.Adapter {
    constructor() {
        super(...arguments);
        this.credentials = {
            username: '',
            email: '',
            password: ''
        };
        this.sensitiveCredentialsFields = ['password'];
    }
    getFieldData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Active Sync adapters currently do not support `getFieldData()`');
        });
    }
    getAutodiscoverUrl(emailAddress, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield autodiscover({
                emailAddress,
                username: emailAddress,
                password
            });
            return response;
        });
    }
}
exports.default = ActiveSyncBaseAdapter;
//# sourceMappingURL=Adapter.js.map