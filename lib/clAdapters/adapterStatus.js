'use strict';

/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
module.exports = {
  ACTIVE: 1,
  DELETED: 2,
};
