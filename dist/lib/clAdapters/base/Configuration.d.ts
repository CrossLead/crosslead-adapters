import { AdapterCredentials } from './Adapter';
export interface ConfigurationOptions {
    [key: string]: any;
    apiVersion?: string;
}
export default class Configuration {
    credentials: AdapterCredentials;
    options: ConfigurationOptions;
    constructor(credentials?: AdapterCredentials, options?: ConfigurationOptions);
}
