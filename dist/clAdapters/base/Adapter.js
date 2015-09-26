/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {BaseAdapter}
 */
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var BaseAdapter = (function () {
  function BaseAdapter() {
    _classCallCheck(this, BaseAdapter);

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
   * @return {Promise.<BaseAdapter>} initialzed adapter
   */

  _createClass(BaseAdapter, [{
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

  return BaseAdapter;
})();

exports['default'] = BaseAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvYmFzZS9BZGFwdGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFPcUIsV0FBVztBQUduQixXQUhRLFdBQVcsR0FHaEI7MEJBSEssV0FBVzs7Ozs7QUFPNUIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7OztBQVN0QixVQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7QUFDMUMsU0FBRyxFQUFFLGVBQVc7QUFDZCxlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0Qsa0JBQVksRUFBRSxJQUFJO0FBQ2xCLGdCQUFVLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7R0FDSjs7Ozs7Ozs7ZUF2QmtCLFdBQVc7O1dBK0JwQjs7OztrQkFDRixJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQzs7Ozs7OztLQUNuRDs7Ozs7Ozs7OztXQVNJLGlCQUFHLEVBQUU7Ozs7Ozs7Ozs7Ozs7O1dBYUUsd0NBQXFCO0FBQy9CLFlBQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztLQUNwRDs7O1NBekRrQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiJjbEFkYXB0ZXJzL2Jhc2UvQWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYWxsIGFkYXB0ZXJzXG4gKlxuICogQGNsYXNzXG4gKiBAYWJzdHJhY3RcbiAqIEByZXR1cm4ge0Jhc2VBZGFwdGVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlQWRhcHRlciB7XG5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogSWYgdGhpcyBhZGFwdGVyIHN1cHBvcnRzIGV4dGVybmFsIGVudGl0eSBmaWVsZHMsIGl0IG11c3QgcHJvdmlkZVxuICAgICAqIGEga2V5IHRvIHVuaXF1ZWx5IGFzc29jaWF0ZSB0aGF0IGZpZWxkIGFzIGhhdmluZyBjb21lIGZyb20gdGhpc1xuICAgICAqIGFkYXB0ZXIgaW5zdGFuY2UuIEZvciBleGFtcGxlLCBhIE5ldFN1aXRlIGFkYXB0ZXIgbWF5IHNpbXBseVxuICAgICAqIGV4cG9zZSBpdHMgYGNyZWRlbnRpYWxzLmFjY291bnRgIHZhbHVlIGFsc28gYXMgaXRzIGBleHRFbnRpdHlLZXlgXG4gICAgICogQG1lbWJlciB7U3RyaW5nfVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZXh0RW50aXR5S2V5Jywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbm5lY3RzIHRvIGRhdGFzb3VyY2UuIFJlcXVpcmVzIGBjcmVkZW50aWFsc2AgbWVtYmVyIHRvIGJlIGZpbGxlZCBvdXRcbiAgICogQHZpcnR1YWxcbiAgICogQHJldHVybiB7UHJvbWlzZS48QmFzZUFkYXB0ZXI+fSBpbml0aWFsemVkIGFkYXB0ZXJcbiAgICovXG4gIGFzeW5jIGluaXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzJyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZGFwdGVycyBtYXkgYmUgc3RhdGVmdWwuIEZvciBpbnN0YW5jZSwgdGhleSBtYXkgbmVlZCB0byBzdG9yZVxuICAgKiBhdXRoIHRva2Vucywgc2VhcmNoIGNvbnRpbnVhdGlvbiBpZHMsIGV0YyBvciBjYWNoZSByZXN1bHRzLlxuICAgKiBJbnZva2UgdGhpcyBtZXRob2QgdG8gcmVzZXQgYW4gYWRhcHRlciB0byBhIGNsZWFuIHN0YXRlLCB3aGljaFxuICAgKiByZXF1aXJlcyByZWNhbGxpbmcgYGluaXQoKWBcbiAgICovXG4gIHJlc2V0KCkge31cblxuXG4gIC8qKlxuICAgKiBHZXRzIHNwZWNpZmllZCBmaWVsZCBkYXRhIGZyb20gZGF0YXNvdXJjZVxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGZpZWxkIGFkYXB0ZXIgZmllbGRcbiAgICogQHBhcmFtICB7T2JqZWN0fSBbcXVlcnldIG9wdGlvbmFsIHBhcmFtc1xuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IFtxdWVyeS5za2lwPTBdIGluZGV4IHRvIHNraXAgdG9cbiAgICogQHBhcmFtICB7TnVtYmVyfSBbcXVlcnkubGltaXRdIHJlc3VsdHMgcGFnZSBzaXplXG4gICAqIEByZXR1cm4ge1Byb21pc2UuPE9iamVjdD59IHJlc3VsdCBvYmplY3RcbiAgICogQHJldHVybiB7TnVtYmVyfSByZXN1bHQuY291bnQgdG90YWwgcmVzdWx0c1xuICAgKiBAcmV0dXJuIHtPYmplY3RbXX0gcmVzdWx0LnJlc3VsdHMgcmVzdWx0IG9iamVjdHNcbiAgICovXG4gIGdldEZpZWxkRGF0YSggLypmaWVsZCwgcXVlcnkqLyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3MnKTtcbiAgfVxuXG59XG4iXX0=
//# sourceMappingURL=../../clAdapters/base/Adapter.js.map