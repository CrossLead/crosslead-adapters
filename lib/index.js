/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */

'use strict';

/**
 * Main package
 * @return {CLAdapters}
 */
var CLAdapters = module.exports = {};

CLAdapters.AdapterFactory = require('./clAdapters/adapterFactory');
CLAdapters.AdapterStatus = require('./clAdapters/adapterStatus');
CLAdapters.AdapterTypes = require('./clAdapters/adapterTypes');
CLAdapters.BaseAdapter = require('./clAdapters/baseAdapter');
CLAdapters.NetSuiteAdapter = require('./clAdapters/netsuiteAdapter');
