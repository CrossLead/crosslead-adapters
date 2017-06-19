"use strict";
/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
var AdapterStatus;
(function (AdapterStatus) {
    AdapterStatus[AdapterStatus["ACTIVE"] = 1] = "ACTIVE";
    AdapterStatus[AdapterStatus["DELETED"] = 2] = "DELETED";
})(AdapterStatus || (AdapterStatus = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdapterStatus;
//# sourceMappingURL=adapterStatus.js.map