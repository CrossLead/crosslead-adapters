import { Configuration } from '../base/index';
import { AdapterCredentials } from '../base/Adapter';
import { ConfigurationOptions } from '../base/Configuration';

export class GoogleMailConfiguration extends Configuration {
  constructor(public credentials: AdapterCredentials = {}, options?: ConfigurationOptions) {
    super(credentials);

    this.options = Object.assign({
      apiVersion: '1'
    }, options);

  }
}