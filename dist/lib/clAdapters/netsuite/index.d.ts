import { Adapter } from '../base/index';
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
export default class NetSuiteAdapter extends Adapter {
    /**
     * SearchId cache, one per field
     */
    _searchIds: {
        [key: string]: string;
    };
    /**
     * Cache results by field type -> limit (pagesize) -> skip, e.g.:
     * this._cachedDataByFieldType[Fields.Types.USER][10][3]
     * represents all user records for search page size 10 starting at index 3.
     * EXT_ENTITY fields are have an additional layer for entityType, e.g.:
     * this._cachedDataByFieldType[Fields.Types.EXT_ENTITY]['customer'][10][3]
     */
    _cachedDataByFieldType: {
        [key: string]: any;
    };
    _config: any;
    _service: any;
    constructor();
    init(): any;
    reset(): void;
    _setCacheValue(field: any, limit: number, skip: number, data: any): void;
    _getCacheValue(field: any, limit: number, skip: number): any;
    getFieldData(field: any, query: any): Promise<{}>;
}
