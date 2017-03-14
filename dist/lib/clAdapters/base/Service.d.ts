export default class Service {
    config: any;
    constructor(config: any);
    init(): Promise<boolean>;
}
