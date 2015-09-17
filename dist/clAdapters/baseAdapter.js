'use strict';

/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {BaseAdapter}
 */
var BaseAdapter = module.exports = function BaseAdapter() {
  /**
   * @member {Object}
   */
  this.credentials = {};

  /**
   * If this adapter supports external entity fields, it must provide
   * a key to uniquely associate that field as having come from this
   * adapter instance. For example, a NetSuite adapter may simply
   * expose its `credentials.account` value also as its `extEntityKey`
   * @member {String}
   */
  Object.defineProperty(this, 'extEntityKey', {
    get: function get() {
      return '';
    },
    configurable: true,
    enumerable: true
  });
};

/**
 * Connects to datasource. Requires `credentials` member to be filled out
 * @virtual
 * @return {Promise.<BaseAdapter>} initialzed adapter
 */
BaseAdapter.prototype.init = function () {
  throw new Error('Must be implemented by subclass');
};

/**
 * Adapters may be stateful. For instance, they may need to store
 * auth tokens, search continuation ids, etc or cache results.
 * Invoke this method to reset an adapter to a clean state, which
 * requires recalling `init()`
 */
BaseAdapter.prototype.reset = function () {};

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
BaseAdapter.prototype.getFieldData = function () /*field, query*/{
  throw new Error('Must be implemented by subclass');
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvYmFzZUFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7QUFTYixJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsV0FBVyxHQUFHOzs7O0FBSXhELE1BQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7QUFTdEIsUUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO0FBQzFDLE9BQUcsRUFBRSxlQUFXO0FBQ2QsYUFBTyxFQUFFLENBQUM7S0FDWDtBQUNELGdCQUFZLEVBQUUsSUFBSTtBQUNsQixjQUFVLEVBQUUsSUFBSTtHQUNqQixDQUFDLENBQUM7Q0FDSixDQUFDOzs7Ozs7O0FBT0YsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QyxRQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Q0FDcEQsQ0FBQzs7Ozs7Ozs7QUFRRixXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxZQUFXLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWTVDLFdBQVcsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLDRCQUE2QjtBQUNoRSxRQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Q0FDcEQsQ0FBQyIsImZpbGUiOiJjbEFkYXB0ZXJzL2Jhc2VBZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGFsbCBhZGFwdGVyc1xuICpcbiAqIEBjbGFzc1xuICogQGFic3RyYWN0XG4gKiBAcmV0dXJuIHtCYXNlQWRhcHRlcn1cbiAqL1xudmFyIEJhc2VBZGFwdGVyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBCYXNlQWRhcHRlcigpIHtcbiAgLyoqXG4gICAqIEBtZW1iZXIge09iamVjdH1cbiAgICovXG4gIHRoaXMuY3JlZGVudGlhbHMgPSB7fTtcblxuICAvKipcbiAgICogSWYgdGhpcyBhZGFwdGVyIHN1cHBvcnRzIGV4dGVybmFsIGVudGl0eSBmaWVsZHMsIGl0IG11c3QgcHJvdmlkZVxuICAgKiBhIGtleSB0byB1bmlxdWVseSBhc3NvY2lhdGUgdGhhdCBmaWVsZCBhcyBoYXZpbmcgY29tZSBmcm9tIHRoaXNcbiAgICogYWRhcHRlciBpbnN0YW5jZS4gRm9yIGV4YW1wbGUsIGEgTmV0U3VpdGUgYWRhcHRlciBtYXkgc2ltcGx5XG4gICAqIGV4cG9zZSBpdHMgYGNyZWRlbnRpYWxzLmFjY291bnRgIHZhbHVlIGFsc28gYXMgaXRzIGBleHRFbnRpdHlLZXlgXG4gICAqIEBtZW1iZXIge1N0cmluZ31cbiAgICovXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZXh0RW50aXR5S2V5Jywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbn07XG5cbi8qKlxuICogQ29ubmVjdHMgdG8gZGF0YXNvdXJjZS4gUmVxdWlyZXMgYGNyZWRlbnRpYWxzYCBtZW1iZXIgdG8gYmUgZmlsbGVkIG91dFxuICogQHZpcnR1YWxcbiAqIEByZXR1cm4ge1Byb21pc2UuPEJhc2VBZGFwdGVyPn0gaW5pdGlhbHplZCBhZGFwdGVyXG4gKi9cbkJhc2VBZGFwdGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRocm93IG5ldyBFcnJvcignTXVzdCBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzcycpO1xufTtcblxuLyoqXG4gKiBBZGFwdGVycyBtYXkgYmUgc3RhdGVmdWwuIEZvciBpbnN0YW5jZSwgdGhleSBtYXkgbmVlZCB0byBzdG9yZVxuICogYXV0aCB0b2tlbnMsIHNlYXJjaCBjb250aW51YXRpb24gaWRzLCBldGMgb3IgY2FjaGUgcmVzdWx0cy5cbiAqIEludm9rZSB0aGlzIG1ldGhvZCB0byByZXNldCBhbiBhZGFwdGVyIHRvIGEgY2xlYW4gc3RhdGUsIHdoaWNoXG4gKiByZXF1aXJlcyByZWNhbGxpbmcgYGluaXQoKWBcbiAqL1xuQmFzZUFkYXB0ZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyoqXG4gKiBHZXRzIHNwZWNpZmllZCBmaWVsZCBkYXRhIGZyb20gZGF0YXNvdXJjZVxuICogQHBhcmFtICB7T2JqZWN0fSBmaWVsZCBhZGFwdGVyIGZpZWxkXG4gKiBAcGFyYW0gIHtPYmplY3R9IFtxdWVyeV0gb3B0aW9uYWwgcGFyYW1zXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IFtxdWVyeS5za2lwPTBdIGluZGV4IHRvIHNraXAgdG9cbiAqIEBwYXJhbSAge051bWJlcn0gW3F1ZXJ5LmxpbWl0XSByZXN1bHRzIHBhZ2Ugc2l6ZVxuICogQHJldHVybiB7UHJvbWlzZS48T2JqZWN0Pn0gcmVzdWx0IG9iamVjdFxuICogQHJldHVybiB7TnVtYmVyfSByZXN1bHQuY291bnQgdG90YWwgcmVzdWx0c1xuICogQHJldHVybiB7T2JqZWN0W119IHJlc3VsdC5yZXN1bHRzIHJlc3VsdCBvYmplY3RzXG4gKi9cbkJhc2VBZGFwdGVyLnByb3RvdHlwZS5nZXRGaWVsZERhdGEgPSBmdW5jdGlvbiggLypmaWVsZCwgcXVlcnkqLyApIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzJyk7XG59O1xuIl19
//# sourceMappingURL=../clAdapters/baseAdapter.js.map