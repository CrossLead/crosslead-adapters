/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2016 CrossLead
 *
 * @ignore
 */
import * as Fields from './clAdapters/fields';
import AdapterFactory from './clAdapters/adapterFactory';
import AdapterStatus from './clAdapters/adapterStatus';
import { AdapterTypes, AdapterLinkedAccountTypes, OrgWideAdapterTypes } from './clAdapters/adapterTypes';
import * as adapters from './clAdapters/';
import { Adapter, ConnectionTestResult, GlobalRelayAdapter, GlobalRelayMessageType, GlobalRelayMessage, GlobalRelayCredentials } from './clAdapters/';
import * as ClAdaptersClient from './client/';
export { Fields };
export { Adapter };
export { AdapterFactory };
export { AdapterStatus };
export { AdapterTypes };
export { AdapterLinkedAccountTypes };
export { OrgWideAdapterTypes };
export { adapters };
export { ClAdaptersClient };
export { ConnectionTestResult };
export { GlobalRelayAdapter, GlobalRelayMessageType, GlobalRelayMessage, GlobalRelayCredentials };
declare var _default: {
    Fields: typeof Fields;
    Adapter: typeof Adapter;
    AdapterFactory: typeof AdapterFactory;
    AdapterTypes: typeof AdapterTypes;
    AdapterLinkedAccountTypes: AdapterTypes[];
    OrgWideAdapterTypes: AdapterTypes[];
    AdapterStatus: typeof AdapterStatus;
    adapters: typeof adapters;
};
export default _default;
