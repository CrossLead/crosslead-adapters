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
implementedFields[Fields.Types.EXT_ENTITY] = {
  'customer#balance': true,
  'customer#daysOverdue': true
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
  // represents all user records for search page size 10 starting at index 3.
  // EXT_ENTITY fields are have an additional layer for entityType, e.g.:
  // this._cachedDataByFieldType[Fields.Types.EXT_ENTITY]['customer'][10][3]
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

NetSuiteAdapter.prototype._setCacheValue = function(field, limit, skip, data) {
  var fieldCache = this._cachedDataByFieldType[field.type] = this._cachedDataByFieldType[field.type] || {};

  if (field.type === Fields.Types.EXT_ENTITY) {
    fieldCache = this._cachedDataByFieldType[field.type][field.entityType] = this._cachedDataByFieldType[field.type][field.entityType] || {};
  }

  fieldCache[limit] = fieldCache[limit] || {};
  fieldCache[limit][skip] = data;
};

NetSuiteAdapter.prototype._getCacheValue = function(field, limit, skip) {
  var fieldCache = this._cachedDataByFieldType[field.type];
  if (!fieldCache) {
    return undefined;
  }

  if (field.type === Fields.Types.EXT_ENTITY) {
    fieldCache = fieldCache[field.entityType];
  }
  return fieldCache &&
    fieldCache[limit] &&
    fieldCache[limit][skip];
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
    var cached = _this._getCacheValue(field, preferences.pageSize, query.skip);
    if (cached) {
      return resolve(cached);
    }

    var pageIndex, search;
    if (field.type === Fields.Types.USER) {
      if (query.skip) {
        if (!_this._searchIds[field.extId]) {
          throw new Error('NetSuite paged searches must start with an initial search to generate a search session');
        }
        // Round down then add 1 since netsuite page indices are one-based
        pageIndex = Math.floor(query.skip / preferences.pageSize) + 1;
        console.log('searchMoreWithId with pageIndex "%d"', pageIndex);
        return _this._service.searchMoreWithId(_this._searchIds[field.extId], pageIndex)
          .then(function(result) {
            var data = {
              count: result.searchResult.totalRecords,
              results: result.searchResult.recordList.record
            };
            _this._setCacheValue(field, preferences.pageSize, query.skip, data);
            return resolve(data);
          });
      } else {
        // No criteria right now
        search = new NetSuite.Search.EmployeeSearchBasic();
        return _this._service.search(search)
          .then(function(result) {
            if (result.searchResult.totalPages > 1) {
              _this._searchIds[field.extId] = result.searchResult.searchId;
            }

            var data = {
              count: result.searchResult.totalRecords,
              results: result.searchResult.recordList.record
            };
            _this._setCacheValue(field, preferences.pageSize, query.skip, data);
            return resolve(data);
          });
      }
    } else if (field.type === Fields.Types.EXT_ENTITY) {
      if (field.entityType === 'customer') {
        if (query.skip) {
          if (!_this._searchIds[field.extId]) {
            throw new Error('NetSuite paged searches must start with an initial search to generate a search session');
          }
          // Round down then add 1 since netsuite page indices are one-based
          pageIndex = Math.floor(query.skip / preferences.pageSize) + 1;
          console.log('searchMoreWithId with pageIndex "%d"', pageIndex);
          return _this._service.searchMoreWithId(_this._searchIds[field.extId], pageIndex)
            .then(function(result) {
              var data = {
                count: result.searchResult.totalRecords,
                results: result.searchResult.searchRowList.searchRow
              };
              _this._setCacheValue(field, preferences.pageSize, query.skip, data);
              return resolve(data);
            });
        } else {
          // No criteria right now
          search = new NetSuite.Search.CustomerSearchAdvanced();
          search.columns = new NetSuite.Search.CustomerSearchRow();
          search.columns.basic = new NetSuite.Search.CustomerSearchRowBasic();

          // For now, always include all SearchColumn fields since storing an extra field
          // is far less costly than having to do another roundtrip to retrieve another field
          var entityIdField = new NetSuite.Search.Fields.SearchColumnStringField();
          entityIdField.field = 'entityId';
          search.columns.basic.searchColumnFields.push(entityIdField);

          var internalIdField = new NetSuite.Search.Fields.SearchColumnSelectField();
          internalIdField.field = 'internalId';
          search.columns.basic.searchColumnFields.push(internalIdField);

          var balanceField = new NetSuite.Search.Fields.SearchColumnDoubleField();
          balanceField.field = 'balance';
          search.columns.basic.searchColumnFields.push(balanceField);

          var daysOverdueField = new NetSuite.Search.Fields.SearchColumnLongField();
          daysOverdueField.field = 'daysOverdue';
          search.columns.basic.searchColumnFields.push(daysOverdueField);

          return _this._service.search(search)
            .then(function(result) {
              if (result.searchResult.totalPages > 1) {
                _this._searchIds[field.extId] = result.searchResult.searchId;
              }

              var data = {
                count: result.searchResult.totalRecords,
                results: result.searchResult.searchRowList.searchRow
              };
              _this._setCacheValue(field, preferences.pageSize, query.skip, data);
              return resolve(data);
            });
        }
      } else {
        return reject(new Error('Unknown EXT_ENTITY entityType:', field.entityType));
      }
    }
  });
};
