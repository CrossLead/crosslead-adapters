'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{return Promise.resolve(value).then(function(value){return step("next",value);},function(err){return step("throw",err);});}}return step("next");});};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {Adapter}
 */var Adapter=function(){function Adapter(){_classCallCheck(this,Adapter);/**
     * @member {Object}
     */this.credentials={};/**
     * If this adapter supports external entity fields, it must provide
     * a key to uniquely associate that field as having come from this
     * adapter instance. For example, a NetSuite adapter may simply
     * expose its `credentials.account` value also as its `extEntityKey`
     * @member {String}
     */Object.defineProperty(this,'extEntityKey',{get:function get(){return'';},configurable:true,enumerable:true});}/**
   * Connects to datasource. Requires `credentials` member to be filled out
   * @virtual
   * @return {Promise.<Adapter>} initialzed adapter
   */_createClass(Adapter,[{key:'init',value:function(){var _ref=_asyncToGenerator(regeneratorRuntime.mark(function _callee(){return regeneratorRuntime.wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:throw new Error('Must be implemented by subclass');case 1:case'end':return _context.stop();}}},_callee,this);}));function init(){return _ref.apply(this,arguments);}return init;}()/**
   * Adapters may be stateful. For instance, they may need to store
   * auth tokens, search continuation ids, etc or cache results.
   * Invoke this method to reset an adapter to a clean state, which
   * requires recalling `init()`
   */},{key:'reset',value:function reset(){}/**
   * Gets specified field data from datasource
   * @param  {Object} field adapter field
   * @param  {Object} [query] optional params
   * @param  {Number} [query.skip=0] index to skip to
   * @param  {Number} [query.limit] results page size
   * @return {Promise.<Object>} result object
   * @return {Number} result.count total results
   * @return {Object[]} result.results result objects
   */},{key:'getFieldData',value:function getFieldData()/*field, query*/{throw new Error('Must be implemented by subclass');}}]);return Adapter;}();exports.default=Adapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvYmFzZS9BZGFwdGVyLmpzIl0sIm5hbWVzIjpbIkFkYXB0ZXIiLCJjcmVkZW50aWFscyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2V0IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoic25DQUFBOzs7Ozs7TUFPcUJBLFEsWUFHbkIsa0JBQWMsK0JBQ1o7O09BR0EsS0FBS0MsV0FBTCxDQUFtQixFQUFuQixDQUVBOzs7Ozs7T0FPQUMsT0FBT0MsY0FBUCxDQUFzQixJQUF0QixDQUE0QixjQUE1QixDQUE0QyxDQUMxQ0MsSUFBSyxjQUFXLENBQ2QsTUFBTyxFQUFQLENBQ0QsQ0FIeUMsQ0FJMUNDLGFBQWMsSUFKNEIsQ0FLMUNDLFdBQVksSUFMOEIsQ0FBNUMsRUFPRCxDQUdEOzs7O2tQQU1RLElBQUlDLE1BQUosQ0FBVSxpQ0FBVixDLGlJQUlSOzs7OzswQ0FNUSxDQUFFLENBR1Y7Ozs7Ozs7Ozt3REFVYyxnQkFBbUIsQ0FDL0IsS0FBTSxJQUFJQSxNQUFKLENBQVUsaUNBQVYsQ0FBTixDQUNELEMsdUNBekRrQlAsTyIsImZpbGUiOiJjbEFkYXB0ZXJzL2Jhc2UvQWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYWxsIGFkYXB0ZXJzXG4gKlxuICogQGNsYXNzXG4gKiBAYWJzdHJhY3RcbiAqIEByZXR1cm4ge0FkYXB0ZXJ9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkYXB0ZXIge1xuXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqXG4gICAgICogQG1lbWJlciB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuY3JlZGVudGlhbHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIElmIHRoaXMgYWRhcHRlciBzdXBwb3J0cyBleHRlcm5hbCBlbnRpdHkgZmllbGRzLCBpdCBtdXN0IHByb3ZpZGVcbiAgICAgKiBhIGtleSB0byB1bmlxdWVseSBhc3NvY2lhdGUgdGhhdCBmaWVsZCBhcyBoYXZpbmcgY29tZSBmcm9tIHRoaXNcbiAgICAgKiBhZGFwdGVyIGluc3RhbmNlLiBGb3IgZXhhbXBsZSwgYSBOZXRTdWl0ZSBhZGFwdGVyIG1heSBzaW1wbHlcbiAgICAgKiBleHBvc2UgaXRzIGBjcmVkZW50aWFscy5hY2NvdW50YCB2YWx1ZSBhbHNvIGFzIGl0cyBgZXh0RW50aXR5S2V5YFxuICAgICAqIEBtZW1iZXIge1N0cmluZ31cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2V4dEVudGl0eUtleScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH0sXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb25uZWN0cyB0byBkYXRhc291cmNlLiBSZXF1aXJlcyBgY3JlZGVudGlhbHNgIG1lbWJlciB0byBiZSBmaWxsZWQgb3V0XG4gICAqIEB2aXJ0dWFsXG4gICAqIEByZXR1cm4ge1Byb21pc2UuPEFkYXB0ZXI+fSBpbml0aWFsemVkIGFkYXB0ZXJcbiAgICovXG4gIGFzeW5jIGluaXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzJyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZGFwdGVycyBtYXkgYmUgc3RhdGVmdWwuIEZvciBpbnN0YW5jZSwgdGhleSBtYXkgbmVlZCB0byBzdG9yZVxuICAgKiBhdXRoIHRva2Vucywgc2VhcmNoIGNvbnRpbnVhdGlvbiBpZHMsIGV0YyBvciBjYWNoZSByZXN1bHRzLlxuICAgKiBJbnZva2UgdGhpcyBtZXRob2QgdG8gcmVzZXQgYW4gYWRhcHRlciB0byBhIGNsZWFuIHN0YXRlLCB3aGljaFxuICAgKiByZXF1aXJlcyByZWNhbGxpbmcgYGluaXQoKWBcbiAgICovXG4gIHJlc2V0KCkge31cblxuXG4gIC8qKlxuICAgKiBHZXRzIHNwZWNpZmllZCBmaWVsZCBkYXRhIGZyb20gZGF0YXNvdXJjZVxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGZpZWxkIGFkYXB0ZXIgZmllbGRcbiAgICogQHBhcmFtICB7T2JqZWN0fSBbcXVlcnldIG9wdGlvbmFsIHBhcmFtc1xuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IFtxdWVyeS5za2lwPTBdIGluZGV4IHRvIHNraXAgdG9cbiAgICogQHBhcmFtICB7TnVtYmVyfSBbcXVlcnkubGltaXRdIHJlc3VsdHMgcGFnZSBzaXplXG4gICAqIEByZXR1cm4ge1Byb21pc2UuPE9iamVjdD59IHJlc3VsdCBvYmplY3RcbiAgICogQHJldHVybiB7TnVtYmVyfSByZXN1bHQuY291bnQgdG90YWwgcmVzdWx0c1xuICAgKiBAcmV0dXJuIHtPYmplY3RbXX0gcmVzdWx0LnJlc3VsdHMgcmVzdWx0IG9iamVjdHNcbiAgICovXG4gIGdldEZpZWxkRGF0YSggLypmaWVsZCwgcXVlcnkqLyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3MnKTtcbiAgfVxuXG59XG4iXX0=
//# sourceMappingURL=../../clAdapters/base/Adapter.js.map