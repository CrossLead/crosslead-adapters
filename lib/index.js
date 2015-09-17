/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */
import Fields             from './clAdapters/fields';
import AdapterFactory     from './clAdapters/adapterFactory';
import AdapterStatus      from './clAdapters/adapterStatus';
import AdapterTypes       from './clAdapters/adapterTypes';
import BaseAdapter        from './clAdapters/baseAdapter';
import CLMockAdapter      from './clAdapters/clMockAdapter';
import NetSuiteAdapter    from './clAdapters/netsuite/';
import Office365Adapter   from './clAdapters/office365/';
import GoogleAdapter      from './clAdapters/google-mail/';


/**
 * Main package
 * @return {CLAdapters}
 */
export default {
  Fields,
  AdapterFactory,
  AdapterStatus,
  AdapterTypes,
  BaseAdapter,
  CLMockAdapter,
  NetSuiteAdapter,
  Office365Adapter,
  GoogleAdapter
}
