export default class Service {

  constructor(public config: any) { }

  async init() {
    return true;
  }

}
