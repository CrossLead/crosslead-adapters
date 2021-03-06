import Adapter from '../base/Adapter';
export declare enum GlobalRelayMessageType {
    Chat = 0,
    Update = 1,
    Plan = 2,
    Team = 3,
    Work = 4,
}
export declare type GlobalRelayMessage = {
    type: GlobalRelayMessageType;
    from: string;
    to: string[];
    body: string;
    date: Date;
    thread?: string;
    objId?: string;
    attachments?: string[];
};
export declare type GlobalRelayCredentials = {
    username: string;
    password: string;
    host: string;
    port: string;
    rcptTo: string;
    secure: string;
};
export declare class GlobalRelayAdapter extends Adapter {
    credentials: GlobalRelayCredentials;
    sensitiveCredentialsFields: (keyof GlobalRelayCredentials)[];
    init(): Promise<void>;
    getFieldData(): Promise<void>;
    runConnectionTest(): void;
    archive(msg: GlobalRelayMessage): Promise<{}>;
}
