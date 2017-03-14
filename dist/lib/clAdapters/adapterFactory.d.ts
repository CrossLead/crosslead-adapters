import { NetSuiteAdapter, CLMockAdapter } from './';
import Types from './adapterTypes';
/**
 * Adapter factory
 *
 * @class
 * @return {AdapterFactory}
 */
export default class AdapterFactory {
    /**
     * Static factory
     * @param  {AdapterType} type
     * @return {BaseAdapter} concrete adapter subclass
     */
    static createAdapter(type: Types): CLMockAdapter | NetSuiteAdapter;
}
