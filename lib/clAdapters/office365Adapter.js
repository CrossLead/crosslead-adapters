'use strict';

var util = require('util'),
  BaseAdapter = require('./baseAdapter'),
  Fields = require('./fields'),
  Office365 = require('./office365-js.js');

/**
 * Office365Adapter
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
 * @return {Office365Adapter}
 */
var Office365Adapter = module.exports = function Office365Adapter() {
  BaseAdapter.call(this);

  // SearchId cache, one per field
  this._searchIds = {};
  this._cachedDataByFieldType = {};
};

util.inherits(Office365Adapter, BaseAdapter);

/**
 * @override
 */
Office365Adapter.prototype.init = function() {
  var _this = this;
  this._config = new Office365.Configuration(this.credentials);
  this._service = new Office365.Service(this._config);
  return this._service
    .init()
    .then(function( /*client*/ ) {
      var msg = 'Successfully initialized Office365 for email: %s';
      console.log(msg, _this.credentials.email);
      return _this;
    });
};

/**
 * @override
 */
Office365Adapter.prototype.reset = function() {
  this._searchIds = {};
  this._cachedDataByFieldType = {};
  delete this._config;
  delete this._service;
};

/**
 * @override
 */
Office365Adapter.prototype.getFieldData = function(field, query) {
  
};
