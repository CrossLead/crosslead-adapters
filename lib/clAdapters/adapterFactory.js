'use strict';

var AdapterTypes = require('./adapterTypes'),
  CLMockAdapter = require('./clMockAdapter'),
  NetSuiteAdapter = require('./netsuiteAdapter'),
  Office365Adapter = require('./office365Adapter'),
  GoogleAdapter = require('./googleAdapter');

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
      return new CLMockAdapter();
    case AdapterTypes.OFFICE365:
      return new Office365Adapter();
    case AdapterTypes.GOOGLE:
      return new GoogleAdapter();
    default:
      throw new Error('Unknown type');
  }
};
