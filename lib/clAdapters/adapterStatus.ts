/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
enum AdapterStatus {
  ACTIVE = 1,
  DELETED = 2,
  DISABLED = 3,
  FAILED = 4, // Used to capture failed credentials; any adapter marked FAILED can safely be deleted.
}


export default AdapterStatus;
