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
exports.AdapterTypes = adapterTypes_1.AdapterTypes;
exports.AdapterLinkedAccountTypes = adapterTypes_1.AdapterLinkedAccountTypes;
exports.OrgWideAdapterTypes = adapterTypes_1.OrgWideAdapterTypes;
const adapters = require("./clAdapters/");
exports.adapters = adapters;
const _1 = require("./clAdapters/");
exports.Adapter = _1.Adapter;
exports.GlobalRelayAdapter = _1.GlobalRelayAdapter;
exports.GlobalRelayMessageType = _1.GlobalRelayMessageType;
const ClAdaptersClient = require("./client/");
exports.ClAdaptersClient = ClAdaptersClient;
exports.default = {
    Fields,
    Adapter: _1.Adapter,
    AdapterFactory: adapterFactory_1.default,
    AdapterTypes: adapterTypes_1.AdapterTypes,
    AdapterLinkedAccountTypes: adapterTypes_1.AdapterLinkedAccountTypes,
    OrgWideAdapterTypes: adapterTypes_1.OrgWideAdapterTypes,
    AdapterStatus: adapterStatus_1.default,
    adapters
};
//# sourceMappingURL=index.js.map