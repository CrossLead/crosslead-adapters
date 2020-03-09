import { Adapter, NetSuiteAdapter, CLMockAdapter, Office365MailAdapter, Office365CalendarAdapter, GoogleAdapter, GoogleCalendarAdapter, GoogleOauthCalendarAdapter, JiraAdapter, SlackAdapter, MicrosoftTeamsAdapter, ActiveSyncCalendarAdapter, ExchangeServiceCalendarAdapter, GlobalRelayAdapter } from './';
import { AdapterTypes as Types } from './adapterTypes';
/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
export default class AdapterFactory {
    /**
     * Static factory
     * @param  {AdapterType} type
     * @return {BaseAdapter} concrete adapter subclass
     */
    static createAdapter(type: Types.CUSTOM): never;
    static createAdapter(type: Types.NETSUITE): NetSuiteAdapter;
    static createAdapter(type: Types.CL_MOCK): CLMockAdapter;
    static createAdapter(type: Types.OFFICE365): Office365MailAdapter;
    static createAdapter(type: Types.OFFICE365_CALENDAR): Office365CalendarAdapter;
    static createAdapter(type: Types.GOOGLE): GoogleAdapter;
    static createAdapter(type: Types.GOOGLE_CALENDAR): GoogleCalendarAdapter;
    static createAdapter(type: Types.JIRA): JiraAdapter;
    static createAdapter(type: Types.SLACK): SlackAdapter;
    static createAdapter(type: Types.MICROSOFT_TEAMS): MicrosoftTeamsAdapter;
    static createAdapter(type: Types.ACTIVE_SYNC_CALENDAR): ActiveSyncCalendarAdapter;
    static createAdapter(type: Types.EXCHANGE_SERVICE_CALENDAR): ExchangeServiceCalendarAdapter;
    static createAdapter(type: Types.GOOGLE_OAUTH_CALENDAR): GoogleOauthCalendarAdapter;
    static createAdapter(type: Types.GLOBAL_RELAY): GlobalRelayAdapter;
    static createAdapter(type: Types): Adapter;
}
