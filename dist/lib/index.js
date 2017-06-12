"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2016 CrossLead
 *
 * @ignore
 */
const Fields = require("./clAdapters/fields");
exports.Fields = Fields;
const adapterFactory_1 = require("./clAdapters/adapterFactory");
exports.AdapterFactory = adapterFactory_1.default;
const adapterStatus_1 = require("./clAdapters/adapterStatus");
exports.AdapterStatus = adapterStatus_1.default;
const adapterTypes_1 = require("./clAdapters/adapterTypes");
exports.AdapterTypes = adapterTypes_1.default;
const adapterLinkedAccountTypes_1 = require("./clAdapters/adapterLinkedAccountTypes");
exports.AdapterLinkedAccountTypes = adapterLinkedAccountTypes_1.default;
const adapters = require("./clAdapters/");
exports.adapters = adapters;
const ClAdaptersClient = require("./client/");
exports.ClAdaptersClient = ClAdaptersClient;
exports.default = {
    Fields,
    AdapterFactory: adapterFactory_1.default,
    AdapterTypes: adapterTypes_1.default,
    AdapterLinkedAccountTypes: adapterLinkedAccountTypes_1.default,
    AdapterStatus: adapterStatus_1.default,
    adapters
};
//# sourceMappingURL=index.js.map