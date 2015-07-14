'use strict';

var util = require('util'),
  BaseAdapter = require('./baseAdapter');

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
};

util.inherits(GoogleAdapter, BaseAdapter);

/**
 * @override
 */
GoogleAdapter.prototype.init = function() {
};

/**
 * @override
 */
GoogleAdapter.prototype.reset = function() {
};
