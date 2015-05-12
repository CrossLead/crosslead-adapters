'use strict';

var AdapterTypes = require('./adapterTypes'),
  ClMockAdapter = require('./clMockAdapter'),
  NetSuiteAdapter = require('./netSuiteAdapter');

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
    case AdapterTypes.CL_MOCK:
      return new ClMockAdapter();
    default:
      throw new Error('Unknown type');
  }
};
