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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvYmFzZS9BZGFwdGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFPcUIsT0FBTztBQUdmLFdBSFEsT0FBTyxHQUdaOzBCQUhLLE9BQU87Ozs7O0FBT3hCLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7QUFTdEIsVUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO0FBQzFDLFNBQUcsRUFBRSxlQUFXO0FBQ2QsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELGtCQUFZLEVBQUUsSUFBSTtBQUNsQixnQkFBVSxFQUFFLElBQUk7S0FDakIsQ0FBQyxDQUFDO0dBQ0o7Ozs7Ozs7O2VBdkJrQixPQUFPOztXQStCaEI7Ozs7a0JBQ0YsSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUM7Ozs7Ozs7S0FDbkQ7Ozs7Ozs7Ozs7V0FTSSxpQkFBRyxFQUFFOzs7Ozs7Ozs7Ozs7OztXQWFFLHdDQUFxQjtBQUMvQixZQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDcEQ7OztTQXpEa0IsT0FBTzs7O3FCQUFQLE9BQU8iLCJmaWxlIjoiY2xBZGFwdGVycy9iYXNlL0FkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGFsbCBhZGFwdGVyc1xuICpcbiAqIEBjbGFzc1xuICogQGFic3RyYWN0XG4gKiBAcmV0dXJuIHtBZGFwdGVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGFwdGVyIHtcblxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXIge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGlzIGFkYXB0ZXIgc3VwcG9ydHMgZXh0ZXJuYWwgZW50aXR5IGZpZWxkcywgaXQgbXVzdCBwcm92aWRlXG4gICAgICogYSBrZXkgdG8gdW5pcXVlbHkgYXNzb2NpYXRlIHRoYXQgZmllbGQgYXMgaGF2aW5nIGNvbWUgZnJvbSB0aGlzXG4gICAgICogYWRhcHRlciBpbnN0YW5jZS4gRm9yIGV4YW1wbGUsIGEgTmV0U3VpdGUgYWRhcHRlciBtYXkgc2ltcGx5XG4gICAgICogZXhwb3NlIGl0cyBgY3JlZGVudGlhbHMuYWNjb3VudGAgdmFsdWUgYWxzbyBhcyBpdHMgYGV4dEVudGl0eUtleWBcbiAgICAgKiBAbWVtYmVyIHtTdHJpbmd9XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdleHRFbnRpdHlLZXknLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQ29ubmVjdHMgdG8gZGF0YXNvdXJjZS4gUmVxdWlyZXMgYGNyZWRlbnRpYWxzYCBtZW1iZXIgdG8gYmUgZmlsbGVkIG91dFxuICAgKiBAdmlydHVhbFxuICAgKiBAcmV0dXJuIHtQcm9taXNlLjxBZGFwdGVyPn0gaW5pdGlhbHplZCBhZGFwdGVyXG4gICAqL1xuICBhc3luYyBpbml0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzcycpO1xuICB9XG5cblxuICAvKipcbiAgICogQWRhcHRlcnMgbWF5IGJlIHN0YXRlZnVsLiBGb3IgaW5zdGFuY2UsIHRoZXkgbWF5IG5lZWQgdG8gc3RvcmVcbiAgICogYXV0aCB0b2tlbnMsIHNlYXJjaCBjb250aW51YXRpb24gaWRzLCBldGMgb3IgY2FjaGUgcmVzdWx0cy5cbiAgICogSW52b2tlIHRoaXMgbWV0aG9kIHRvIHJlc2V0IGFuIGFkYXB0ZXIgdG8gYSBjbGVhbiBzdGF0ZSwgd2hpY2hcbiAgICogcmVxdWlyZXMgcmVjYWxsaW5nIGBpbml0KClgXG4gICAqL1xuICByZXNldCgpIHt9XG5cblxuICAvKipcbiAgICogR2V0cyBzcGVjaWZpZWQgZmllbGQgZGF0YSBmcm9tIGRhdGFzb3VyY2VcbiAgICogQHBhcmFtICB7T2JqZWN0fSBmaWVsZCBhZGFwdGVyIGZpZWxkXG4gICAqIEBwYXJhbSAge09iamVjdH0gW3F1ZXJ5XSBvcHRpb25hbCBwYXJhbXNcbiAgICogQHBhcmFtICB7TnVtYmVyfSBbcXVlcnkuc2tpcD0wXSBpbmRleCB0byBza2lwIHRvXG4gICAqIEBwYXJhbSAge051bWJlcn0gW3F1ZXJ5LmxpbWl0XSByZXN1bHRzIHBhZ2Ugc2l6ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlLjxPYmplY3Q+fSByZXN1bHQgb2JqZWN0XG4gICAqIEByZXR1cm4ge051bWJlcn0gcmVzdWx0LmNvdW50IHRvdGFsIHJlc3VsdHNcbiAgICogQHJldHVybiB7T2JqZWN0W119IHJlc3VsdC5yZXN1bHRzIHJlc3VsdCBvYmplY3RzXG4gICAqL1xuICBnZXRGaWVsZERhdGEoIC8qZmllbGQsIHF1ZXJ5Ki8gKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzJyk7XG4gIH1cblxufVxuIl19
//# sourceMappingURL=../../clAdapters/base/Adapter.js.map