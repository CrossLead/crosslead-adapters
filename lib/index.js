/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */

'use strict';

require('es6-promise').polyfill();

/**
 * Main package
 * @return {CLAdapters}
 */
var CLAdapters = module.exports = {};

// Fields namespace
CLAdapters.Fields = require('./clAdapters/fields');

CLAdapters.AdapterFactory = require('./clAdapters/adapterFactory');
CLAdapters.AdapterStatus = require('./clAdapters/adapterStatus');
CLAdapters.AdapterTypes = require('./clAdapters/adapterTypes');
CLAdapters.BaseAdapter = require('./clAdapters/baseAdapter');
CLAdapters.ClMockAdapter = require('./clAdapters/ClMockAdapter');
CLAdapters.NetSuiteAdapter = require('./clAdapters/netsuiteAdapter');
