import { default as Configuration, ConfigurationOptions } from '../../base/Configuration';
import { AdapterCredentials } from '../../base/Adapter';

export default class Office365BaseConfiguration extends Configuration {
  constructor(credentials: AdapterCredentials, options?: ConfigurationOptions) {
    super(credentials, options);
    Object.assign(this.options,  { apiVersion: '1.0' });
  }
};
