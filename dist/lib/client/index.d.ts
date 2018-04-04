/**
 * crosslead-adapters-client
 * https://github.com/CrossLead/crosslead-adapters
 *
 * Copyright (c) 2015 McChrystal Group
 *
 * @ignore
 */
/**
 * CLAdapters functionality available on client. Mostly a subset
 * of server functionality like common enums
 * @return {CLAdapters}
 */
import * as _Fields from '../clAdapters/fields/';
export declare const Fields: typeof _Fields;
export { default as AdapterStatus } from '../clAdapters/adapterStatus';
export { AdapterTypes, AdapterLinkedAccountTypes, OrgWideAdapterTypes } from '../clAdapters/adapterTypes';
