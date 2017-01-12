"use strict";
/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2016 CrossLead
 *
 * @ignore
 */
const _Fields = require("./clAdapters/fields");
const adapterFactory_1 = require("./clAdapters/adapterFactory");
const adapterStatus_1 = require("./clAdapters/adapterStatus");
const adapterTypes_1 = require("./clAdapters/adapterTypes");
const _adapters = require("./clAdapters/");
const _ClAdaptersClient = require("./client/");
exports.Fields = _Fields;
exports.AdapterFactory = adapterFactory_1.default;
exports.AdapterStatus = adapterStatus_1.default;
exports.AdapterTypes = adapterTypes_1.default;
exports.adapters = _adapters;
exports.ClAdaptersClient = _ClAdaptersClient;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    Fields: exports.Fields,
    AdapterFactory: exports.AdapterFactory,
    AdapterTypes: exports.AdapterTypes,
    AdapterStatus: exports.AdapterStatus,
    adapters: exports.adapters
};
