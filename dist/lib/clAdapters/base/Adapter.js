"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
;
/**
 * Abstract base class for all adapters
 *
 * @class
 * @abstract
 * @return {Adapter}
 */
class Adapter {
    constructor() {
        this.credentials = {};
        Object.defineProperty(this, 'extEntityKey', {
            get: function () {
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Must be implemented by subclass');
        });
    }
    /**
     * Adapters may be stateful. For instance, they may need to store
     * auth tokens, search continuation ids, etc or cache results.
     * Invoke this method to reset an adapter to a clean state, which
     * requires recalling `init()`
     */
    reset() { }
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
    getFieldData(field, query) {
        throw new Error('Must be implemented by subclass');
    }
}
exports.default = Adapter;
//# sourceMappingURL=Adapter.js.map