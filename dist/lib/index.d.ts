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
export declare const Fields: typeof _Fields;
export declare const AdapterFactory: typeof _AdapterFactory;
export declare const AdapterStatus: typeof _AdapterStatus;
export declare const AdapterTypes: typeof _AdapterTypes;
export declare const AdapterLinkedAccountTypes: _AdapterTypes[];
export declare const adapters: typeof _adapters;
export declare const ClAdaptersClient: typeof _ClAdaptersClient;
declare var _default: {
    Fields: typeof _Fields;
    AdapterFactory: typeof _AdapterFactory;
    AdapterTypes: typeof _AdapterTypes;
    AdapterLinkedAccountTypes: _AdapterTypes[];
    AdapterStatus: typeof _AdapterStatus;
    adapters: typeof _adapters;
};
export default _default;
