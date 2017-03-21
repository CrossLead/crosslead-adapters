import BaseAdapter from './base/Adapter';
import * as Fields from './fields/';
/**
 * `credentials` should always be:
 * ```
 * {
 *   appId: '123456',
 *   apiKey: '999999'
 * }
 * ```
 */
export declare type CLMockAdapterCredentials = {
    appId: string;
    apiKey: string;
};
/**
 * CLMockAdapter
 *
 * @class
 * @return {ClMockAdapter}
 */
declare class CLMockAdapter extends BaseAdapter {
    credentials: CLMockAdapterCredentials;
    sensitiveCredentialsFields: (keyof CLMockAdapterCredentials)[];
    numResultsToGenerate: number;
    constructor();
    init(): Promise<{}>;
    /**
     * Reflects given field in this `result` format:
     * ```
     * {
     *   {fieldType}ExtId: rand # between 1-50,
     *   {extId}: Float (0-1.0)
     * }
     * ```
     *
     * For example, for a "Fields.Types.USER" field w/extId 'user#utilizationRate', would return:
     * ```
     * {
     *   userExtId: 50,
     *   'user#utilizationRate': 0.55
     * }
     * ```
     *
     * Returns between 0-50 results in pages of `query.limit` (default 5)
     * @override
     */
    getFieldData(field: Fields.Field, query: any): Promise<{
        count: number;
        results: {
            [key: string]: number;
        }[];
    }>;
}
export default CLMockAdapter;
