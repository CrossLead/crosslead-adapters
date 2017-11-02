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
        return !str || str === 'true' || str === 'TRUE' || str === '1';
    }
    /**
     * Queries the underlying service for the start and end date of
     * the given eventId, accessed via the user specified by the
     * given user profile object.
     * Current supported by all calendar adapters EXCEPT for ActiveSync.
     */
    getDatesOf(eventId, userProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error('Detected invocation of unimplemented getDatesOf function');
            return null;
        });
    }
}
exports.default = Adapter;
//# sourceMappingURL=Adapter.js.map