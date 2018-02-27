/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
declare enum AdapterStatus {
    ACTIVE = 1,
    DELETED = 2,
    DISABLED = 3,
    FAILED = 4,
}
export default AdapterStatus;
