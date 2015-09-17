export default class Service {

  constructor(config) {
    this.config = config;
  }

  async init() {
    return true;
  }

}
