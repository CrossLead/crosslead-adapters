import { Field } from '../fields/';
import { DateRange, UserProfile } from '../../common/types';

export interface OAuthParams {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
};

/**
 *
 * adapter credential object
 *
 */
export interface AdapterCredentials {
  [key: string]: string;
};

/**
 * Result from running runConnectionTest
 */
export type ConnectionTestResult = {
  success: boolean;
  message?: string;
};

/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {Adapter}
 */
abstract class Adapter {

  /**
   * If this adapter supports external entity fields, it must provide
   * a key to uniquely associate that field as having come from this
   * adapter instance. For example, a NetSuite adapter may simply
   * expose its `credentials.account` value also as its `extEntityKey`
   * @member {String}
   */
  extEntityKey: string;
  abstract credentials: AdapterCredentials;

  /**
   * List of sensitive credentials fields for this adapter. Allows
   * application code to implement specialized logic, such as
   * encrypting values of passwords.
   */
  abstract sensitiveCredentialsFields: string[];

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
  abstract async init(): Promise<any>;


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
  abstract getFieldData(field?: Field, query?: any): any;

  public parseBoolean(str?: string) {
    return !str || str === 'true' || str === 'TRUE' || str === '1';
  }

  /**
   * Queries the underlying service for the start and end date of
   * the given eventId, accessed via the user specified by the
   * given user profile object.
   * Current supported by all calendar adapters EXCEPT for ActiveSync.
   */
  public async getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange|null> {
    console.error( 'Detected invocation of unimplemented getDatesOf function' );
    return null;
  }
}

export default Adapter;
