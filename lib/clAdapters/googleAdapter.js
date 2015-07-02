'use strict';

var util = require('util'),
  BaseAdapter = require('./baseAdapter'),
  Fields = require('./fields');

/**
 * GoogleAdapter
 *
 * `credentials` format:
 * ```
 * {
 *   email: 'test@test.com',
 *   password: 'password',
 *   account: 123456,
 *   role: 3
 * }
 * ```
 * @class
 * @return {GoogleAdapter}
 */
var GoogleAdapter = module.exports = function GoogleAdapter() {
  BaseAdapter.call(this);

  // SearchId cache, one per field
  this._searchIds = {};
  this._cachedDataByFieldType = {};
};

util.inherits(GoogleAdapter, BaseAdapter);

/**
 * @override
 */
GoogleAdapter.prototype.init = function() {
  var _this = this;
  return this;
};

/**
 * @override
 */
GoogleAdapter.prototype.reset = function() {
};

/**
 * @override
 */
GoogleAdapter.prototype.getFieldData = function(field, query) {
  
};
