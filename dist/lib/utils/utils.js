"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Per RFC 2822, if the local part of an email address contains a dot
 * either at the beginning or end of the address, or more than one
 * dot sequentially inside, it must be quoted.
 * It looks like Google enforces this; however, a domain that we
 * pull data for via a service account might not.
 */
function sanitizeLocalPart(addr) {
    const [localPart, domain] = addr.split('@');
    return (/^\./.test(localPart) || /\.\./.test(localPart) || /\.$/.test(localPart)) ? `"${localPart}"@${domain}` : addr;
}
exports.default = sanitizeLocalPart;
//# sourceMappingURL=utils.js.map