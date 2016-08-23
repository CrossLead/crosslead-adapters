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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGJhc2VcXEFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQU9xQixPQUFPO0FBR2YsV0FIUSxPQUFPLEdBR1o7MEJBSEssT0FBTzs7Ozs7QUFPeEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7OztBQVN0QixVQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7QUFDMUMsU0FBRyxFQUFFLGVBQVc7QUFDZCxlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0Qsa0JBQVksRUFBRSxJQUFJO0FBQ2xCLGdCQUFVLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7R0FDSjs7Ozs7Ozs7ZUF2QmtCLE9BQU87O1dBK0JoQjs7OztrQkFDRixJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQzs7Ozs7OztLQUNuRDs7Ozs7Ozs7OztXQVNJLGlCQUFHLEVBQUU7Ozs7Ozs7Ozs7Ozs7O1dBYUUsd0NBQXFCO0FBQy9CLFlBQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztLQUNwRDs7O1NBekRrQixPQUFPOzs7cUJBQVAsT0FBTyIsImZpbGUiOiJjbEFkYXB0ZXJzXFxiYXNlXFxBZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGFsbCBhZGFwdGVyc1xyXG4gKlxyXG4gKiBAY2xhc3NcclxuICogQGFic3RyYWN0XHJcbiAqIEByZXR1cm4ge0FkYXB0ZXJ9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGFwdGVyIHtcclxuXHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAbWVtYmVyIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHRoaXMgYWRhcHRlciBzdXBwb3J0cyBleHRlcm5hbCBlbnRpdHkgZmllbGRzLCBpdCBtdXN0IHByb3ZpZGVcclxuICAgICAqIGEga2V5IHRvIHVuaXF1ZWx5IGFzc29jaWF0ZSB0aGF0IGZpZWxkIGFzIGhhdmluZyBjb21lIGZyb20gdGhpc1xyXG4gICAgICogYWRhcHRlciBpbnN0YW5jZS4gRm9yIGV4YW1wbGUsIGEgTmV0U3VpdGUgYWRhcHRlciBtYXkgc2ltcGx5XHJcbiAgICAgKiBleHBvc2UgaXRzIGBjcmVkZW50aWFscy5hY2NvdW50YCB2YWx1ZSBhbHNvIGFzIGl0cyBgZXh0RW50aXR5S2V5YFxyXG4gICAgICogQG1lbWJlciB7U3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2V4dEVudGl0eUtleScsIHtcclxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgZW51bWVyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQ29ubmVjdHMgdG8gZGF0YXNvdXJjZS4gUmVxdWlyZXMgYGNyZWRlbnRpYWxzYCBtZW1iZXIgdG8gYmUgZmlsbGVkIG91dFxyXG4gICAqIEB2aXJ0dWFsXHJcbiAgICogQHJldHVybiB7UHJvbWlzZS48QWRhcHRlcj59IGluaXRpYWx6ZWQgYWRhcHRlclxyXG4gICAqL1xyXG4gIGFzeW5jIGluaXQoKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3MnKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBBZGFwdGVycyBtYXkgYmUgc3RhdGVmdWwuIEZvciBpbnN0YW5jZSwgdGhleSBtYXkgbmVlZCB0byBzdG9yZVxyXG4gICAqIGF1dGggdG9rZW5zLCBzZWFyY2ggY29udGludWF0aW9uIGlkcywgZXRjIG9yIGNhY2hlIHJlc3VsdHMuXHJcbiAgICogSW52b2tlIHRoaXMgbWV0aG9kIHRvIHJlc2V0IGFuIGFkYXB0ZXIgdG8gYSBjbGVhbiBzdGF0ZSwgd2hpY2hcclxuICAgKiByZXF1aXJlcyByZWNhbGxpbmcgYGluaXQoKWBcclxuICAgKi9cclxuICByZXNldCgpIHt9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHNwZWNpZmllZCBmaWVsZCBkYXRhIGZyb20gZGF0YXNvdXJjZVxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZmllbGQgYWRhcHRlciBmaWVsZFxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gW3F1ZXJ5XSBvcHRpb25hbCBwYXJhbXNcclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IFtxdWVyeS5za2lwPTBdIGluZGV4IHRvIHNraXAgdG9cclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IFtxdWVyeS5saW1pdF0gcmVzdWx0cyBwYWdlIHNpemVcclxuICAgKiBAcmV0dXJuIHtQcm9taXNlLjxPYmplY3Q+fSByZXN1bHQgb2JqZWN0XHJcbiAgICogQHJldHVybiB7TnVtYmVyfSByZXN1bHQuY291bnQgdG90YWwgcmVzdWx0c1xyXG4gICAqIEByZXR1cm4ge09iamVjdFtdfSByZXN1bHQucmVzdWx0cyByZXN1bHQgb2JqZWN0c1xyXG4gICAqL1xyXG4gIGdldEZpZWxkRGF0YSggLypmaWVsZCwgcXVlcnkqLyApIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzcycpO1xyXG4gIH1cclxuXHJcbn1cclxuIl19
//# sourceMappingURL=Adapter.js.map
