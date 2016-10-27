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
  Fields,
  AdapterFactory,
  AdapterTypes,
  AdapterStatus,
  adapters
};

export * as Fields from './clAdapters/fields';
export AdapterFactory from './clAdapters/adapterFactory';
export AdapterStatus from './clAdapters/adapterStatus';
export AdapterTypes from './clAdapters/adapterTypes';
export * as adapters from './clAdapters/';
// client
export * as ClAdaptersClient from './client/';
