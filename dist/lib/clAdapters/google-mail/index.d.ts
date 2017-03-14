import BaseAdapter from '../base/Adapter';
declare class GoogleAdapter extends BaseAdapter {
    runConnectionTest: typeof runConnectionTest;
    runMessageTest: typeof runMessageTest;
    getBatchData: typeof getBatchData;
}
export default GoogleAdapter;
export declare function getBatchData(...args: any[]): Promise<any>;
export declare function runConnectionTest(connectionData: any): any;
export declare function runMessageTest(connectionData: any): any;
