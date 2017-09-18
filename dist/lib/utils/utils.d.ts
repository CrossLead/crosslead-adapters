/**
 * Per RFC 2822, if the local part of an email address contains a dot
 * either at the beginning or end of the address, or more than one
 * dot sequentially inside, it must be quoted.
 * It looks like Google enforces this; however, a domain that we
 * pull data for via a service account might not.
 */
export default function sanitizeLocalPart(addr: string): string;
/**
 * Compute and return the SHA-256 hash of the given string.
 */
export declare function hashString(str: string): string;
