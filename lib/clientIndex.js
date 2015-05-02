/**
 * crosslead-adapters-client
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */

'use strict';
(function() {
  /**
   * CLAdapters functionality available on client. Mostly a subset
   * of server functionality like common enums
   * @return {CLAdapters}
   */
  var CLAdapters = {};

  CLAdapters.AdapterStatus = require('./clAdapters/adapterStatus');
  CLAdapters.AdapterTypes = require('./clAdapters/adapterTypes');

  this.CLAdapters = CLAdapters;
}).call((function() {
  return this || (typeof window !== 'undefined' ? window : global);
})());
