import * as crypto from 'crypto';

/**
 * Per RFC 2822, if the local part of an email address contains a dot
 * either at the beginning or end of the address, or more than one
 * dot sequentially inside, it must be quoted.
 * It looks like Google enforces this; however, a domain that we
 * pull data for via a service account might not.
 */
export default function sanitizeLocalPart(addr: string) {
  const [localPart, domain] = addr.split('@');
  return (/^\./.test(localPart) || /\.\./.test(localPart) || /\.$/.test(localPart)) ? `"${localPart}"@${domain}` : addr;
}

/**
 * Compute and return the SHA-256 hash of the given string.
 */
export function hashString(str: string) {
  const hash = crypto.createHash('sha256');
  hash.write(str);
  return hash.digest('hex');
}
