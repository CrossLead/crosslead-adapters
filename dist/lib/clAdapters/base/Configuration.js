"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Configuration {
    constructor(credentials = {}, options = {}) {
        this.credentials = credentials;
        this.options = Object.assign({ apiVersion: '1' }, options);
    }
}
exports.default = Configuration;
//# sourceMappingURL=Configuration.js.map