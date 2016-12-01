(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CLAdapters = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
exports.default = {
  ACTIVE: 1,
  DELETED: 2
};

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Enumeration for different adapter types
 *
 * @enum
 */
exports.default = {
  CUSTOM: 1,
  NETSUITE: 2,
  CL_MOCK: 3,
  OFFICE365: 4,
  GOOGLE: 5,
  GOOGLE_CALENDAR: 6,
  OFFICE365_CALENDAR: 7,
  JIRA: 8,
  SLACK: 9
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _types = require('./types');

Object.defineProperty(exports, 'Types', {
  enumerable: true,
  get: function get() {
    return _types.Types;
  }
});

},{"./types":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Enumeration for different data field types
 *
 * @enum
 */
var Types = exports.Types = {
  EXT_ENTITY: 1,
  USER: 2,
  GROUP: 3,
  ORGANIZATION: 4,
  RELATIONSHIP: 5
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdapterTypes = exports.AdapterStatus = exports.Fields = undefined;

var _fields = require('../clAdapters/fields/');

var _Fields = _interopRequireWildcard(_fields);

var _adapterStatus = require('../clAdapters/adapterStatus');

var _adapterStatus2 = _interopRequireDefault(_adapterStatus);

var _adapterTypes = require('../clAdapters/adapterTypes');

var _adapterTypes2 = _interopRequireDefault(_adapterTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.Fields = _Fields; /**
                           * crosslead-adapters-client
                           * https://github.com/CrossLead/crosslead-adapters
                           *
                           * Copyright (c) 2015 McChrystal Group
                           *
                           * @ignore
                           */

/**
 * CLAdapters functionality available on client. Mostly a subset
 * of server functionality like common enums
 * @return {CLAdapters}
 */

exports.AdapterStatus = _adapterStatus2.default;
exports.AdapterTypes = _adapterTypes2.default;

},{"../clAdapters/adapterStatus":1,"../clAdapters/adapterTypes":2,"../clAdapters/fields/":3}]},{},[5])(5)
});