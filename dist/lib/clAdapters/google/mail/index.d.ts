import GoogleBaseAdapter from '../base/Adapter';
import * as GoogleMail from './google-js.js';
declare class GoogleMailAdapter extends GoogleBaseAdapter {
    _config: GoogleMail.Configuration;
    _service: GoogleMail.Service;
    runConnectionTest: typeof runConnectionTest;
    runMessageTest: typeof runMessageTest;
    getBatchData: typeof getBatchData;
    init(): Promise<this>;
}
export default GoogleMailAdapter;
export declare function getBatchData(...args: any[]): Promise<any>;
export declare function runConnectionTest(connectionData: any): any;
export declare function runMessageTest(connectionData: any): any;
