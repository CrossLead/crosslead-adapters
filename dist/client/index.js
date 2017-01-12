/**
 * crosslead-adapters-client
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */
"use strict";
/**
 * CLAdapters functionality available on client. Mostly a subset
 * of server functionality like common enums
 * @return {CLAdapters}
 */
const _Fields = require("../clAdapters/fields/");
exports.Fields = _Fields;
var adapterStatus_1 = require("../clAdapters/adapterStatus");
exports.AdapterStatus = adapterStatus_1.default;
var adapterTypes_1 = require("../clAdapters/adapterTypes");
exports.AdapterTypes = adapterTypes_1.default;
