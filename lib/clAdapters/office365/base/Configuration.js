import Configuration from '../../base/Configuration';

export default class Office365BaseConfiguration extends Configuration {
  constructor(...args) {
    super(...args);
    Object.assign(this.options,  { apiVersion: '1.0' });
  }
};
