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
import * as adapters from './clAdapters/';

export default {
  Fields: Fields,
  AdapterFactory: AdapterFactory,
  AdapterTypes: AdapterTypes,
  AdapterStatus: AdapterStatus,
  adapters: adapters
};

import * as _Fields from './clAdapters/fields';
export { _Fields as Fields };
import _AdapterFactory from './clAdapters/adapterFactory';
export { _AdapterFactory as AdapterFactory };
import _AdapterStatus from './clAdapters/adapterStatus';
export { _AdapterStatus as AdapterStatus };
import _AdapterTypes from './clAdapters/adapterTypes';
export { _AdapterTypes as AdapterTypes };
import * as _adapters from './clAdapters/';
export { _adapters as adapters };
// client

import * as _ClAdaptersClient from './client/';
export { _ClAdaptersClient as ClAdaptersClient };
//# sourceMappingURL=index.js.map