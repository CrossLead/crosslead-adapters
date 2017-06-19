"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const index_1 = require("../../base/index");
class GoogleBaseAdapter extends index_1.Adapter {
    constructor() {
        super(...arguments);
        this.credentials = {
            serviceEmail: '',
            email: '',
            certificate: ''
        };
        this.sensitiveCredentialsFields = ['certificate'];
    }
    getFieldData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Google adapters currently do not support `getFieldData()`');
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GoogleBaseAdapter;
//# sourceMappingURL=Adapter.js.map