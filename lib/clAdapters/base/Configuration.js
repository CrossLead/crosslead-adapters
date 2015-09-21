export default class Configuration {

  constructor(credentials, options) {
    this.credentials = credentials || {};
    this.options = {
      apiVersion: '1',
      ...options
    };
  }

}
