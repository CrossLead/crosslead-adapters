import { Service, Configuration } from '../../base/index';

export class GoogleMailService extends Service {
  constructor(public config: Configuration)  {
    super(config);
  }

  async init() {
    return true;
  }
}
