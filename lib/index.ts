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
import { AdapterTypes,
         AdapterNameMap,
         AdapterLinkedAccountTypes,
         OrgWideAdapterTypes,
       } from './clAdapters/adapterTypes';

import * as adapters from './clAdapters/';
import { Adapter,
         AdapterCredentials,
         ActiveSyncCalendarAdapter,
         ConnectionTestResult,
         GlobalRelayAdapter,
         GlobalRelayMessageType,
         GlobalRelayMessage,
         GlobalRelayCredentials,
       } from './clAdapters/';
import * as ClAdaptersClient from './client/';

export { Fields };
export { Adapter };
export { AdapterFactory };
export { AdapterStatus };
export { AdapterTypes };
export { AdapterNameMap };
export { AdapterLinkedAccountTypes };
export { OrgWideAdapterTypes };
export { adapters };
export { ClAdaptersClient };
export { ConnectionTestResult };
export { GlobalRelayAdapter,
         GlobalRelayMessageType,
         GlobalRelayMessage,
         GlobalRelayCredentials };
export default {
  Fields,
  Adapter,
  AdapterFactory,
  AdapterTypes,
  AdapterNameMap,
  AdapterLinkedAccountTypes,
  OrgWideAdapterTypes,
  AdapterStatus,
  adapters
};
