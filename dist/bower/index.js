(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  ACTIVE: 1,
  DELETED: 2
};
module.exports = exports["default"];


},{}],2:[function(require,module,exports){
/**
 * Enumeration for different adapter types
 *
 * @enum
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  CUSTOM: 1,
  NETSUITE: 2,
  CL_MOCK: 3,
  OFFICE365: 4,
  GOOGLE: 5,
  GOOGLE_CALENDAR: 6
};
module.exports = exports["default"];


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
/**
 * crosslead-adapters-client
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _clAdaptersFields = require('../clAdapters/fields/');

var _clAdaptersFields2 = _interopRequireDefault(_clAdaptersFields);

var _clAdaptersAdapterStatus = require('../clAdapters/adapterStatus');

var _clAdaptersAdapterStatus2 = _interopRequireDefault(_clAdaptersAdapterStatus);

var _clAdaptersAdapterTypes = require('../clAdapters/adapterTypes');

var _clAdaptersAdapterTypes2 = _interopRequireDefault(_clAdaptersAdapterTypes);

/**
 * CLAdapters functionality available on client. Mostly a subset
 * of server functionality like common enums
 * @return {CLAdapters}
 */
exports['default'] = {
  Fields: _clAdaptersFields2['default'],
  AdapterStatus: _clAdaptersAdapterStatus2['default'],
  AdapterTypes: _clAdaptersAdapterTypes2['default']
};
module.exports = exports['default'];


},{"../clAdapters/adapterStatus":1,"../clAdapters/adapterTypes":2,"../clAdapters/fields/":3,"babel-runtime/helpers/interop-require-default":6}],6:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
};

exports.__esModule = true;
},{}]},{},[5]);
