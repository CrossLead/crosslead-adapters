import { Configuration } from '../base/index';
import { AdapterCredentials } from '../base/Adapter';
import { ConfigurationOptions } from '../base/Configuration';
export declare class GoogleMailConfiguration extends Configuration {
    credentials: AdapterCredentials;
    constructor(credentials?: AdapterCredentials, options?: ConfigurationOptions);
}
