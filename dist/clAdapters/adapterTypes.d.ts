/**
 * Enumeration for different adapter types
 *
 * @enum
 */
export declare enum AdapterTypes {
    CUSTOM = 1,
    NETSUITE = 2,
    CL_MOCK = 3,
    OFFICE365 = 4,
    GOOGLE = 5,
    GOOGLE_CALENDAR = 6,
    OFFICE365_CALENDAR = 7,
    JIRA = 8,
    SLACK = 9,
    ACTIVE_SYNC_CALENDAR = 10,
    EXCHANGE_SERVICE_CALENDAR = 11,
    GOOGLE_OAUTH_CALENDAR = 12,
    GLOBAL_RELAY = 13,
    MICROSOFT_TEAMS = 14,
}
export declare const AdapterNameMap: (string | null)[];
/**
 * Array of enums values for different user linked adapter types
 *
 * @array
 */
export declare const AdapterLinkedAccountTypes: AdapterTypes[];
/**
 * Array of enums values that represent org-wide adapters
 *
 * @array
 */
export declare const OrgWideAdapterTypes: AdapterTypes[];
/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
export declare enum AdapterStatus {
    ACTIVE = 1,
    DELETED = 2,
    DISABLED = 3,
    FAILED = 4,
}
