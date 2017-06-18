"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
class Configuration {
    constructor(credentials = {}, options = {}) {
        this.credentials = credentials;
        this.options = __assign({ apiVersion: '1' }, options);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Configuration;
//# sourceMappingURL=Configuration.js.map