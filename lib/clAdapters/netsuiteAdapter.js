'use strict';

var util = require('util'),
  BaseAdapter = require('./baseAdapter'),
  Fields = require('./fields'),
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

  // SearchId cache, one per field type
  this._searchIds = {};
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

/**
 * @override
 */
NetSuiteAdapter.prototype.getFieldData = function(field, query) {
  console.log(field);
  var _this = this;
  return new Promise(function(resolve /*,reject*/ ) {
    var typeName;
    query = query || {};

    var preferences = new NetSuite.Search.SearchPreferences();
    preferences.pageSize = query.limit || 10;
    _this._service.setSearchPreferences(preferences);

    if (field.type === Fields.Types.USER) {
      if (field.extId === 'department#internalId') {
        if (query.skip) {
          if (!_this._searchIds['department#internalId']) {
            throw new Error('NetSuite paged searches must start with an initial search to generate a search session');
          }
          // Round down then add 1 since netsuite page indices are one-based
          var pageIndex = Math.floor(query.skip / preferences.pageSize) + 1;
          console.log('searchMoreWithId with pageIndex "%d"', pageIndex);
          _this._service.searchMoreWithId(_this._searchIds['department#internalId'], pageIndex)
            .then(function(result) {
              resolve({
                count: result.searchResult.totalRecords,
                results: result.searchResult.recordList.record
              });
            });
        } else {
          // No criteria right now
          var search = new NetSuite.Search.EmployeeSearchBasic();
          return _this._service.search(search)
            .then(function(result) {
              if (result.searchResult.totalPages > 1) {
                _this._searchIds['department#internalId'] = result.searchResult.searchId;
              }

              resolve({
                count: result.searchResult.totalRecords,
                results: result.searchResult.recordList.record
              });
            });
        }
      }
    } else {
      throw new Error('Unknown field or retrieval NYI by NetSuiteAdapter:', field);
    }
  })
};
