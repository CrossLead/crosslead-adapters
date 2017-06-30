"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Configuration_1 = require("../../base/Configuration");
class Office365BaseConfiguration extends Configuration_1.default {
    constructor(credentials, options) {
        super(credentials, options);
        Object.assign(this.options, { apiVersion: '1.0' });
    }
}
exports.default = Office365BaseConfiguration;
;
//# sourceMappingURL=Configuration.js.map