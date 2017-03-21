"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../base/index");
class GoogleMailConfiguration extends index_1.Configuration {
    constructor(credentials = {}, options) {
        super(credentials);
        this.credentials = credentials;
        this.options = Object.assign({
            apiVersion: '1'
        }, options);
    }
}
exports.GoogleMailConfiguration = GoogleMailConfiguration;
//# sourceMappingURL=google-js-config.js.map