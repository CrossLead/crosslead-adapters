/**
 * crosslead-adapters
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2016 CrossLead
 *
 * @ignore
 */
import * as _Fields from './clAdapters/fields';
import _AdapterFactory from './clAdapters/adapterFactory';
import _AdapterStatus from './clAdapters/adapterStatus';
import _AdapterTypes from './clAdapters/adapterTypes';
import * as _adapters from './clAdapters/';
import * as _ClAdaptersClient from './client/';

export const Fields = _Fields;
export const AdapterFactory = _AdapterFactory;
export const AdapterStatus = _AdapterStatus;
export const AdapterTypes = _AdapterTypes;
export const adapters = _adapters;
export const ClAdaptersClient = _ClAdaptersClient;

export default {
  Fields,
  AdapterFactory,
  AdapterTypes,
  AdapterStatus,
  adapters
};
