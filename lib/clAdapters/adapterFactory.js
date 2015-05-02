'use strict';

var AdapterTypes = require('./adapterTypes'),
  NetSuiteAdapter = require('./NetSuiteAdapter');

/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
var AdapterFactory = module.exports = function AdapterFactory() {};

/**
 * Static factory
 * @param  {AdapterType} type
 * @return {BaseAdapter} concrete adapter subclass
 */
AdapterFactory.createAdapter = function(type) {
  switch (type) {
    case AdapterTypes.CUSTOM:
      throw new Error('Custom adapters provide their own approach');
    case AdapterTypes.NETSUITE:
      return new NetSuiteAdapter();
    default:
      throw new Error('Unknown type');
  }
};
