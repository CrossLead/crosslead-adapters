(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
module.exports = {
  ACTIVE: 1,
  DELETED: 2,
};

},{}],2:[function(require,module,exports){
'use strict';

/**
 * Enumeration for different adapter types
 *
 * @enum
 */
module.exports = {
  CUSTOM: 1,
  NETSUITE: 2,
  CL_MOCK: 3,
  OFFICE365: 4,
  GOOGLE: 5
};

},{}],3:[function(require,module,exports){
'use strict';

/**
 * Adapter data fields
 * @return {Fields}
 1*/
var Fields = module.exports = {};

// Search fields
Fields.Types = require('./types');

},{"./types":4}],4:[function(require,module,exports){
'use strict';

/**
 * Enumeration for different data field types
 *
 * @enum
 */
module.exports = {
  EXT_ENTITY: 1,
  USER: 2,
  GROUP: 3,
  ORGANIZATION: 4,
  RELATIONSHIP: 5
};

},{}],5:[function(require,module,exports){
(function (global){
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

  // Fields namespace
  CLAdapters.Fields = require('./clAdapters/fields');

  CLAdapters.AdapterStatus = require('./clAdapters/adapterStatus');
  CLAdapters.AdapterTypes = require('./clAdapters/adapterTypes');

  this.CLAdapters = CLAdapters;
}).call((function() {
  return this || (typeof window !== 'undefined' ? window : global);
})());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./clAdapters/adapterStatus":1,"./clAdapters/adapterTypes":2,"./clAdapters/fields":3}]},{},[5]);
