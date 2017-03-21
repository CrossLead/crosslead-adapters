import * as util from 'util';
import BaseAdapter from './base/Adapter';
import * as Fields from './fields/';

/**
 * `credentials` should always be:
 * ```
 * {
 *   appId: '123456',
 *   apiKey: '999999'
 * }
 * ```
 */
export type CLMockAdapterCredentials = {
  appId: string;
  apiKey: string;
};

/**
 * CLMockAdapter
 *
 * @class
 * @return {ClMockAdapter}
 */
class CLMockAdapter extends BaseAdapter {
  credentials: CLMockAdapterCredentials = {
    appId: '',
    apiKey: ''
  };
  sensitiveCredentialsFields: (keyof CLMockAdapterCredentials)[] = ['apiKey'];
  numResultsToGenerate: number;

  constructor() {
    super();
    /**
     * @override
     */
    Object.defineProperty(this, 'extEntityKey', {
      get: function() {
        return this.credentials.appId;
      }
    });
  }

  init() {
    const p = new Promise((resolve, reject) => {
      if (this.credentials.appId === '123456' && this.credentials.apiKey === '999999') {
        resolve(this);
      } else {
        reject('Wrong credentials, please use appId "123456" and apiKey "999999"');
      }
    });

    return p;
  }

  /**
   * Reflects given field in this `result` format:
   * ```
   * {
   *   {fieldType}ExtId: rand # between 1-50,
   *   {extId}: Float (0-1.0)
   * }
   * ```
   *
   * For example, for a "Fields.Types.USER" field w/extId 'user#utilizationRate', would return:
   * ```
   * {
   *   userExtId: 50,
   *   'user#utilizationRate': 0.55
   * }
   * ```
   *
   * Returns between 0-50 results in pages of `query.limit` (default 5)
   * @override
   */
  getFieldData(field: Fields.Field, query: any) {
    query = query || {};
    let typeName: string;
    console.log(field);
    switch (field.type) {
      case Fields.Types.USER:
        typeName = 'user';
        break;
      case Fields.Types.GROUP:
        typeName = 'group';
        break;
      default:
        typeName = 'unknown';
        break;
    }

    const skip = query.skip || 0;
    if (!skip) {
      this.numResultsToGenerate = Math.floor(Math.random() * 50);
      console.log('CLMockAdapter: Generating %d results', this.numResultsToGenerate);
    }

    const result = {
      count: this.numResultsToGenerate,
      results: [] as { [key: string]: number }[]
    };

    const createResult = function() {
      const r: { [key: string]: number } = {};
      r[typeName + 'ExtId'] = Math.floor(Math.random() * 3) + 1;
      r[field.extId] = Math.random();
      return r;
    };

    const pageSize = query.limit || 5;
    const resultsToReturn = Math.min(pageSize, this.numResultsToGenerate - skip);
    for (let i = 0; i < resultsToReturn; i++) {
      result.results.push(createResult());
    }

    return Promise.resolve(result);
  }
};

export default CLMockAdapter;