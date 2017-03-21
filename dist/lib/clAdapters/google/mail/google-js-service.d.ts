import { Service, Configuration } from '../../base/index';
export declare class GoogleMailService extends Service {
    config: Configuration;
    constructor(config: Configuration);
    init(): Promise<boolean>;
}
