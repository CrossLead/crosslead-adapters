"use strict";
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
        Object.defineProperty(this, 'extEntityKey', {
            get: function () {
                return '';
            },
            configurable: true,
            enumerable: true
        });
    }
    /**
     * Adapters may be stateful. For instance, they may need to store
     * auth tokens, search continuation ids, etc or cache results.
     * Invoke this method to reset an adapter to a clean state, which
     * requires recalling `init()`
     */
    reset() { }
    parseBoolean(str) {
        return !str || str === 'true' || str === 'TRUE';
    }
}
exports.default = Adapter;
//# sourceMappingURL=Adapter.js.map