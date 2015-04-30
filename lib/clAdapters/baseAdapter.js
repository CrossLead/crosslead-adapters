'use strict';

/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {BaseAdapter}
 */
var BaseAdapter = module.exports = function BaseAdapter() {
  /**
   * @member {Object}
   */
  this.credentials = {};
};

/**
 * Connects to datasource. Requires `credentials` member to be filled out
 * @virtual
 * @return {Promise.<BaseAdapter>} initialzed adapter
 */
BaseAdapter.prototype.init = function() {
  throw new Error('Must be implemented by subclass');
};
