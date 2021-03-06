import * as _ from 'lodash';
import * as util from 'util';
import * as Fields from '../fields';
import * as NetSuite from 'netsuite-js';
import { Adapter, Configuration, Service } from '../base/index';
import { AdapterCredentials } from '../base/Adapter';

const implementedFields: {
  [key: number]: {
    [key: string]: boolean | undefined;
  }
} = {

  [Fields.Types.USER]: {
    'department#internalId': true,
    'supervisor#internalId': true
  },

  [Fields.Types.EXT_ENTITY]: {
    'customer#balance': true,
    'customer#overdueBalance': true,
    'customer#daysOverdue': true
  }

};

/**
 * `credentials` format:
 * ```
 * {
 *   email: 'test@test.com',
 *   password: 'password',
 *   account: 123456,
 *   role: 3
 * }
 * ```
 */
export type NetSuiteCredentials = {
  email: string;
  password: string;
  account: string;
  role: string;
};

/**
 * NetSuiteAdapter
 *
 * @class
 * @return {NetSuiteAdapter}
 */
export default class NetSuiteAdapter extends Adapter {

  /**
   * SearchId cache, one per field
   */
  _searchIds: { [key: string]: string } = {};


  /**
   * Cache results by field type -> limit (pagesize) -> skip, e.g.:
   * this._cachedDataByFieldType[Fields.Types.USER][10][3]
   * represents all user records for search page size 10 starting at index 3.
   * EXT_ENTITY fields are have an additional layer for entityType, e.g.:
   * this._cachedDataByFieldType[Fields.Types.EXT_ENTITY]['customer'][10][3]
   */
  _cachedDataByFieldType: { [key: string]: any } = {};

  _config: any;
  _service: any;

  credentials: NetSuiteCredentials = {
    email: '',
    password: '',
    account: '',
    role: ''
  };
  sensitiveCredentialsFields: (keyof NetSuiteCredentials)[] = ['password'];

  constructor() {
    super();

    /**
     * @override
     */
    Object.defineProperty(this, 'extEntityKey', {
      get: function() {
        return this.credentials['account'];
      }
    });
  }


  init() {
    this._config = new NetSuite.Configuration(this.credentials);
    this._service = new NetSuite.Service(this._config);
    return this._service
      .init()
      .then(( /*client*/ ) => {
        const msg = 'Successfully initialized NetSuiteAdapter for email: %s, account: %s, role: %d';
        console.log(msg, this.credentials['email'], this.credentials['account'], this.credentials['role']);
        return this;
      });
  }


  reset() {
    this._searchIds = {};
    this._cachedDataByFieldType = {};
    delete this._config;
    delete this._service;
  }


  _setCacheValue(field: any, limit: number, skip: number, data: any) {
    let fieldCache = this._cachedDataByFieldType[field.type] = this._cachedDataByFieldType[field.type] || {};

    if (field.type === Fields.Types.EXT_ENTITY) {
      fieldCache
        = this._cachedDataByFieldType[field.type][field.entityType]
        = this._cachedDataByFieldType[field.type][field.entityType] || {};
    }

    fieldCache[limit] = fieldCache[limit] || {};
    fieldCache[limit][skip] = _.cloneDeep(data);
  }


  _getCacheValue(field: any, limit: number, skip: number) {
    let fieldCache = this._cachedDataByFieldType[field.type];
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


  getFieldData(field: any, query: any) {
    console.log(field);
    return new Promise((resolve, reject) => {
      query = query || {};

      const preferences = new NetSuite.Search.SearchPreferences();
      preferences.pageSize = query.limit || 10;
      this._service.setSearchPreferences(preferences);

      if (!implementedFields[field.type] || !implementedFields[field.type][field.extId]) {
        return reject(new Error('Unknown field or retrieval NYI by NetSuiteAdapter:' + field));
      }

      // Cache hit?
      const cached = this._getCacheValue(field, preferences.pageSize, query.skip);
      if (cached) {
        return resolve(cached);
      }

      let pageIndex, search;
      if (field.type === Fields.Types.USER) {
        if (query.skip) {
          if (!this._searchIds[field.extId]) {
            throw new Error('NetSuite paged searches must start with an initial search to generate a search session');
          }
          // Round down then add 1 since netsuite page indices are one-based
          pageIndex = Math.floor(query.skip / preferences.pageSize) + 1;
          console.log('searchMoreWithId with pageIndex "%d"', pageIndex);
          return this._service.searchMoreWithId(this._searchIds[field.extId], pageIndex)
            .then((result: any) => {
              const data = {
                count: result.searchResult.totalRecords,
                results: result.searchResult.recordList.record
              };
              this._setCacheValue(field, preferences.pageSize, query.skip, data);
              return resolve(data);
            });
        } else {
          // No criteria right now
          search = new NetSuite.Search.EmployeeSearchBasic();
          return this._service.search(search)
            .then((result: any) => {
              if (result.searchResult.totalPages > 1) {
                this._searchIds[field.extId] = result.searchResult.searchId;
              }

              const data = {
                count: result.searchResult.totalRecords,
                results: result.searchResult.recordList.record
              };
              this._setCacheValue(field, preferences.pageSize, query.skip, data);
              return resolve(data);
            });
        }
      } else if (field.type === Fields.Types.EXT_ENTITY) {
        if (field.entityType === 'customer') {
          if (query.skip) {
            if (!this._searchIds[field.extId]) {
              throw new Error('NetSuite paged searches must start with an initial search to generate a search session');
            }
            // Round down then add 1 since netsuite page indices are one-based
            pageIndex = Math.floor(query.skip / preferences.pageSize) + 1;
            console.log('searchMoreWithId with pageIndex "%d"', pageIndex);
            return this._service.searchMoreWithId(this._searchIds[field.extId], pageIndex)
              .then((result: any) => {
                const data = {
                  count: result.searchResult.totalRecords,
                  results: result.searchResult.searchRowList.searchRow
                };
                this._setCacheValue(field, preferences.pageSize, query.skip, data);
                return resolve(data);
              });
          } else {
            // No criteria right now
            search = new NetSuite.Search.CustomerSearchAdvanced();
            search.columns = new NetSuite.Search.CustomerSearchRow();
            search.columns.basic = new NetSuite.Search.CustomerSearchRowBasic();

            // For now, always include all SearchColumn fields since storing an extra field
            // is far less costly than having to do another roundtrip to retrieve another field
            const entityIdField = new NetSuite.Search.Fields.SearchColumnStringField();
            entityIdField.field = 'entityId';
            search.columns.basic.searchColumnFields.push(entityIdField);

            const internalIdField = new NetSuite.Search.Fields.SearchColumnSelectField();
            internalIdField.field = 'internalId';
            search.columns.basic.searchColumnFields.push(internalIdField);

            const balanceField = new NetSuite.Search.Fields.SearchColumnDoubleField();
            balanceField.field = 'balance';
            search.columns.basic.searchColumnFields.push(balanceField);

            const overdueBalanceField = new NetSuite.Search.Fields.SearchColumnDoubleField();
            overdueBalanceField.field = 'overdueBalance';
            search.columns.basic.searchColumnFields.push(overdueBalanceField);

            const daysOverdueField = new NetSuite.Search.Fields.SearchColumnLongField();
            daysOverdueField.field = 'daysOverdue';
            search.columns.basic.searchColumnFields.push(daysOverdueField);

            return this._service.search(search)
              .then((result: any) => {
                if (result.searchResult.totalPages > 1) {
                  this._searchIds[field.extId] = result.searchResult.searchId;
                }

                const data = {
                  count: result.searchResult.totalRecords,
                  results: result.searchResult.searchRowList.searchRow
                };
                this._setCacheValue(field, preferences.pageSize, query.skip, data);
                return resolve(data);
              });
          }
        } else {
          return reject(new Error('Unknown EXT_ENTITY entityType:' + field.entityType));
        }
      }
    });
  };



};


