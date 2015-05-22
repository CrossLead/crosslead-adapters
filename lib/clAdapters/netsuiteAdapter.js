'use strict';

var util = require('util'),
  BaseAdapter = require('./baseAdapter'),
  Fields = require('./fields'),
  NetSuite = require('netsuite-js');

var implementedFields = {};
implementedFields[Fields.Types.USER] = {
  'department#internalId': true,
  'supervisor#internalId': true
};

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

  // SearchId cache, one per field
  this._searchIds = {};

  // Cache results by field type -> limit (pagesize) -> skip, e.g.:
  // this._cachedDataByFieldType[Fields.Types.USER][10][3]
  // represents all user records for search page size 10 starting at index 3
  this._cachedDataByFieldType = {};
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
NetSuiteAdapter.prototype.reset = function() {
  this._searchIds = {};
  this._cachedDataByFieldType = {};
  delete this._config;
  delete this._service;
};

NetSuiteAdapter.prototype._setCacheValue = function(fieldType, limit, skip, data) {
  this._cachedDataByFieldType[fieldType] = this._cachedDataByFieldType[fieldType] || {};
  this._cachedDataByFieldType[fieldType][limit] = this._cachedDataByFieldType[fieldType][limit] || {};
  this._cachedDataByFieldType[fieldType][limit][skip] = data;
};

/**
 * @override
 */
NetSuiteAdapter.prototype.getFieldData = function(field, query) {
  console.log(field);
  var _this = this;
  return new Promise(function(resolve, reject) {
    query = query || {};

    var preferences = new NetSuite.Search.SearchPreferences();
    preferences.pageSize = query.limit || 10;
    _this._service.setSearchPreferences(preferences);

    if (!implementedFields[field.type] || !implementedFields[field.type][field.extId]) {
      return reject(new Error('Unknown field or retrieval NYI by NetSuiteAdapter:', field));
    }

    // Cache hit?
    if (_this._cachedDataByFieldType[field.type] &&
      _this._cachedDataByFieldType[field.type][preferences.pageSize] &&
      _this._cachedDataByFieldType[field.type][preferences.pageSize][query.skip]) {
      return resolve(_this._cachedDataByFieldType[field.type][preferences.pageSize][query.skip]);
    }

    if (field.type === Fields.Types.USER) {
      if (query.skip) {
        if (!_this._searchIds[field.extId]) {
          throw new Error('NetSuite paged searches must start with an initial search to generate a search session');
        }
        // Round down then add 1 since netsuite page indices are one-based
        var pageIndex = Math.floor(query.skip / preferences.pageSize) + 1;
        console.log('searchMoreWithId with pageIndex "%d"', pageIndex);
        _this._service.searchMoreWithId(_this._searchIds[field.extId], pageIndex)
          .then(function(result) {
            var data = {
              count: result.searchResult.totalRecords,
              results: result.searchResult.recordList.record
            };
            _this._setCacheValue(field.type, preferences.pageSize, query.skip, data);
            return resolve(data);
          });
      } else {
        // No criteria right now
        var search = new NetSuite.Search.EmployeeSearchBasic();
        return _this._service.search(search)
          .then(function(result) {
            if (result.searchResult.totalPages > 1) {
              _this._searchIds[field.extId] = result.searchResult.searchId;
            }

            var data = {
              count: result.searchResult.totalRecords,
              results: result.searchResult.recordList.record
            };
            _this._setCacheValue(field.type, preferences.pageSize, query.skip, data);
            return resolve(data);
          });
      }
    }
  });
};
