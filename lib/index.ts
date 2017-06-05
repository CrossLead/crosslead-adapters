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
import AdapterTypes from './clAdapters/adapterTypes';
import AdapterLinkedAccountTypes from './clAdapters/adapterLinkedAccountTypes';
import * as adapters from './clAdapters/';
import * as ClAdaptersClient from './client/';

export { Fields };
export { AdapterFactory };
export { AdapterStatus };
export { AdapterTypes };
export { AdapterLinkedAccountTypes };
export { adapters };
export { ClAdaptersClient };

export default {
  Fields,
  AdapterFactory,
  AdapterTypes,
  AdapterLinkedAccountTypes,
  AdapterStatus,
  adapters
};
