
/**
 * Enumeration for different adapter types
 *
 * @enum
 */
export enum AdapterTypes {
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
};

// This map needs to be kept in sync with the above AdapterTypes enum.
// I'd switch it to a string enum, but for the fact that users of this
// library put the integer values into databases and so forth.

export const AdapterNameMap = [
  null,
  'Custom',
  'Netsuite',
  'Mock',
  'Office 365',
  'Google Mail',
  'Google Calendar',
  'Office 365 Calendar',
  'JIRA',
  'Slack',
  'ActiveSync',
  'Exchange Service Calendar',
  'Google OAuth Calendar',
  'Global Relay',
  'Microsoft Teams'
];

/**
 * Array of enums values for different user linked adapter types
 *
 * @array
 */
export const AdapterLinkedAccountTypes = [
  AdapterTypes.ACTIVE_SYNC_CALENDAR,
  AdapterTypes.GOOGLE_OAUTH_CALENDAR
];

/**
 * Array of enums values that represent org-wide adapters
 *
 * @array
 */
export const OrgWideAdapterTypes = [
  AdapterTypes.GOOGLE_CALENDAR,
  AdapterTypes.OFFICE365_CALENDAR,
  AdapterTypes.EXCHANGE_SERVICE_CALENDAR,
  AdapterTypes.MICROSOFT_TEAMS,
  AdapterTypes.SLACK
];


/**
 * Enumeration for adapter status. This is really only for
 * application-specific serialization but both `crosslead-platform`
 * and background workers will need this, so this as a
 * common place is as good as any.
 *
 * @enum
 */
export enum AdapterStatus {
  ACTIVE = 1,
  DELETED = 2,
  DISABLED = 3,
  FAILED = 4, // Used to capture failed credentials; any adapter marked FAILED can safely be deleted.
}
