/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {Adapter}
 */
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var Adapter = (function () {
  function Adapter() {
    _classCallCheck(this, Adapter);

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
  }

  /**
   * Connects to datasource. Requires `credentials` member to be filled out
   * @virtual
   * @return {Promise.<Adapter>} initialzed adapter
   */

  _createClass(Adapter, [{
    key: 'init',
    value: function init() {
      return _regeneratorRuntime.async(function init$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            throw new Error('Must be implemented by subclass');

          case 1:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Adapters may be stateful. For instance, they may need to store
     * auth tokens, search continuation ids, etc or cache results.
     * Invoke this method to reset an adapter to a clean state, which
     * requires recalling `init()`
     */
  }, {
    key: 'reset',
    value: function reset() {}

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
  }, {
    key: 'getFieldData',
    value: function getFieldData() /*field, query*/{
      throw new Error('Must be implemented by subclass');
    }
  }]);

  return Adapter;
})();

exports['default'] = Adapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGJhc2VcXEFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQU9xQixPQUFPO0FBR2YsV0FIUSxPQUFPLEdBR1o7MEJBSEssT0FBTzs7Ozs7QUFPeEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7OztBQVN0QixVQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7QUFDMUMsU0FBRyxFQUFFLGVBQVc7QUFDZCxlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0Qsa0JBQVksRUFBRSxJQUFJO0FBQ2xCLGdCQUFVLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7R0FDSjs7Ozs7Ozs7ZUF2QmtCLE9BQU87O1dBK0JoQjs7OztrQkFDRixJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQzs7Ozs7OztLQUNuRDs7Ozs7Ozs7OztXQVNJLGlCQUFHLEVBQUU7Ozs7Ozs7Ozs7Ozs7O1dBYUUsd0NBQXFCO0FBQy9CLFlBQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztLQUNwRDs7O1NBekRrQixPQUFPOzs7cUJBQVAsT0FBTyIsImZpbGUiOiJjbEFkYXB0ZXJzXFxiYXNlXFxBZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhbGwgYWRhcHRlcnNcbiAqXG4gKiBAY2xhc3NcbiAqIEBhYnN0cmFjdFxuICogQHJldHVybiB7QWRhcHRlcn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWRhcHRlciB7XG5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogSWYgdGhpcyBhZGFwdGVyIHN1cHBvcnRzIGV4dGVybmFsIGVudGl0eSBmaWVsZHMsIGl0IG11c3QgcHJvdmlkZVxuICAgICAqIGEga2V5IHRvIHVuaXF1ZWx5IGFzc29jaWF0ZSB0aGF0IGZpZWxkIGFzIGhhdmluZyBjb21lIGZyb20gdGhpc1xuICAgICAqIGFkYXB0ZXIgaW5zdGFuY2UuIEZvciBleGFtcGxlLCBhIE5ldFN1aXRlIGFkYXB0ZXIgbWF5IHNpbXBseVxuICAgICAqIGV4cG9zZSBpdHMgYGNyZWRlbnRpYWxzLmFjY291bnRgIHZhbHVlIGFsc28gYXMgaXRzIGBleHRFbnRpdHlLZXlgXG4gICAgICogQG1lbWJlciB7U3RyaW5nfVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZXh0RW50aXR5S2V5Jywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbm5lY3RzIHRvIGRhdGFzb3VyY2UuIFJlcXVpcmVzIGBjcmVkZW50aWFsc2AgbWVtYmVyIHRvIGJlIGZpbGxlZCBvdXRcbiAgICogQHZpcnR1YWxcbiAgICogQHJldHVybiB7UHJvbWlzZS48QWRhcHRlcj59IGluaXRpYWx6ZWQgYWRhcHRlclxuICAgKi9cbiAgYXN5bmMgaW5pdCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3MnKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFkYXB0ZXJzIG1heSBiZSBzdGF0ZWZ1bC4gRm9yIGluc3RhbmNlLCB0aGV5IG1heSBuZWVkIHRvIHN0b3JlXG4gICAqIGF1dGggdG9rZW5zLCBzZWFyY2ggY29udGludWF0aW9uIGlkcywgZXRjIG9yIGNhY2hlIHJlc3VsdHMuXG4gICAqIEludm9rZSB0aGlzIG1ldGhvZCB0byByZXNldCBhbiBhZGFwdGVyIHRvIGEgY2xlYW4gc3RhdGUsIHdoaWNoXG4gICAqIHJlcXVpcmVzIHJlY2FsbGluZyBgaW5pdCgpYFxuICAgKi9cbiAgcmVzZXQoKSB7fVxuXG5cbiAgLyoqXG4gICAqIEdldHMgc3BlY2lmaWVkIGZpZWxkIGRhdGEgZnJvbSBkYXRhc291cmNlXG4gICAqIEBwYXJhbSAge09iamVjdH0gZmllbGQgYWRhcHRlciBmaWVsZFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IFtxdWVyeV0gb3B0aW9uYWwgcGFyYW1zXG4gICAqIEBwYXJhbSAge051bWJlcn0gW3F1ZXJ5LnNraXA9MF0gaW5kZXggdG8gc2tpcCB0b1xuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IFtxdWVyeS5saW1pdF0gcmVzdWx0cyBwYWdlIHNpemVcbiAgICogQHJldHVybiB7UHJvbWlzZS48T2JqZWN0Pn0gcmVzdWx0IG9iamVjdFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHJlc3VsdC5jb3VudCB0b3RhbCByZXN1bHRzXG4gICAqIEByZXR1cm4ge09iamVjdFtdfSByZXN1bHQucmVzdWx0cyByZXN1bHQgb2JqZWN0c1xuICAgKi9cbiAgZ2V0RmllbGREYXRhKCAvKmZpZWxkLCBxdWVyeSovICkge1xuICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzcycpO1xuICB9XG5cbn1cbiJdfQ==
//# sourceMappingURL=Adapter.js.map
