'use strict';

var util = require('util'),
  BaseAdapter = require('./baseAdapter'),
  NetSuite = require('netsuite-js');

/**
 * NetSuiteAdapter
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
 * @return {NetSuiteAdapter}
 */
var NetSuiteAdapter = module.exports = function NetSuiteAdapter() {
  BaseAdapter.call(this);
};

util.inherits(NetSuiteAdapter, BaseAdapter);

/**
 * @override
 */
NetSuiteAdapter.prototype.init = function() {
  var _this = this;
  this._config = new NetSuite.Configuration(this.credentials);
  this._service = new NetSuite.Service(this._config);
  return this._service
    .init()
    .then(function( /*client*/ ) {
      var msg = 'Successfully initialized NetSuiteAdapter for email: %s, account: %s, role: %d';
      console.log(msg, _this.credentials.email, _this.credentials.account, _this.credentials.role);
      return _this;
    });
};