import { GoogleError, GoogleErrorType, createGoogleError, InvalidGrant } from '../../google/errors';
import * as googleapis from 'googleapis';
import { UserProfile } from '../../../common/types';
import * as _ from 'lodash';

// google calendar api
const calendar = googleapis.calendar('v3');

export function handleGoogleError(res: Function, rej: Function, returnVal?: any) {
  return (err: any, result: any) => {
    if (err) {
      let mapped = err;
      if (err instanceof Error) {
        // Map to custom errors
        if (/unauthorized_client/.test(err.message.toString())) {
          mapped = createGoogleError(
            'UnauthorizedClient',
            err
          );
        }
        // TODO: other types
      } else if (!err.kind) {
        // Not a GoogleError
        mapped = new Error(JSON.stringify(err));
      }
      // Leave GoogleErrors
      rej(mapped);
    } else {
      res(typeof returnVal !== 'undefined' ?  returnVal : result);
    }
  };
}

export async function calendarIdsFor(userProfile: UserProfile, auth: any): Promise<string[]> {

  /**
   * calendar ids we want to
   * retrieve events from
   */
  const includedCalendarIds = new Set([
    'primary',
    userProfile.email.toLowerCase(),
    userProfile.emailAfterMapping.toLowerCase()
  ]);

  /**
   * all calendar ids in the users calendar
   */
  return _.chain(await (new Promise((res, rej) => {
    calendar.calendarList.list(
      {auth},
      (err: any, d: any) => handleGoogleError(res, rej)(err, d && d.items)
    );
  })))
    .filter((item: any) => includedCalendarIds.has(item.id.toLowerCase()))
    .map('id')
    .value();
}
