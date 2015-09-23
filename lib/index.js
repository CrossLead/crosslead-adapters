/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */
import Fields                 from './clAdapters/fields';
import AdapterFactory         from './clAdapters/adapterFactory';
import AdapterStatus          from './clAdapters/adapterStatus';
import AdapterTypes           from './clAdapters/adapterTypes';
import adapters               from './clAdapters/';

/**
 * Main package
 * @return {CLAdapters}
 */
export default {
  Fields,
  AdapterFactory,
  AdapterStatus,
  AdapterTypes,
  ...adapters
}
