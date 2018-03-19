import { UserProfile } from '../../../common/types';
export declare function handleGoogleError(res: Function, rej: Function, returnVal?: any): (err: any, result: any) => void;
export declare function calendarIdsFor(userProfile: UserProfile, auth: any): Promise<string[]>;
