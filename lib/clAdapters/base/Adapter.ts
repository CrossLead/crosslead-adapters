import { Field } from '../fields/';

/**
 *
 * adapter credential object
 *
 */
export interface AdapterCredentials {
  [key: string]: string;
};



/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {Adapter}
 */
export default class Adapter {

  /**
   * If this adapter supports external entity fields, it must provide
   * a key to uniquely associate that field as having come from this
   * adapter instance. For example, a NetSuite adapter may simply
   * expose its `credentials.account` value also as its `extEntityKey`
   * @member {String}
   */
  extEntityKey: string;
  credentials: AdapterCredentials = {};

  constructor() {
    Object.defineProperty(this, 'extEntityKey', {
      get: function() {
        return '';
      },
      configurable: true,
      enumerable: true
    });
  }


  /**
   * Connects to datasource. Requires `credentials` member to be filled out
   * @virtual
   * @return {Promise.<Adapter>} initialzed adapter
   */
  async init(): Promise<any> {
    throw new Error('Must be implemented by subclass');
  }


  /**
   * Adapters may be stateful. For instance, they may need to store
   * auth tokens, search continuation ids, etc or cache results.
   * Invoke this method to reset an adapter to a clean state, which
   * requires recalling `init()`
   */
  reset() {}


  /**
   * Gets specified field data from datasource
   * @param  {Object} field adapter field
   * @param  {Object} [query] optional params
   * @param  {Number} [query.skip=0] index to skip to
   * @param  {Number} [query.limit] results page size
   * @return {Promise.<Object>} result object
   * @return {Number} result.count total results
   * @return {Object[]} result.results result objects
   */
  getFieldData(field?: Field, query?: any): any {
    throw new Error('Must be implemented by subclass');
  }

}
