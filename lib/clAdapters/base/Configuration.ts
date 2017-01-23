import { AdapterCredentials } from './Adapter';


export interface ConfigurationOptions {
  [key: string]: any;
  apiVersion?: string;
}


export default class Configuration {

  options: ConfigurationOptions;

  constructor(
    public credentials: AdapterCredentials = {},
    options: ConfigurationOptions = {}
  ) {
    this.options = {
      apiVersion: '1',
      ...options
    };
  }

}
