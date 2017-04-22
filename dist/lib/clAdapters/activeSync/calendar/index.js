"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const index_1 = require("../../base/index");
const asclient = require("asclient");
const Adapter_1 = require("../base/Adapter");
const autodiscover_activesync_1 = require("autodiscover-activesync");
// google calendar api
const calendar = 'someurl';
const credentialMappings = {
    'username': 'username',
    'email': 'email',
    'password': 'password',
};
function handleActiveSyncError(res, rej, returnVal) {
    return (err, result) => {
        if (err) {
            rej(err instanceof Error
                ? err
                : new Error(JSON.stringify(err)));
        }
        else {
            res(typeof returnVal !== 'undefined' ? returnVal : result);
        }
    };
}
/*

ApplicationData [
  {
    "Timezone": [
      "aAEAAEMAZQBuAHQAcgBhAGwAIABTAHQAYQBuAGQAYQByAGQAIABUAGkAbQBlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsAAAABAAIAAAAAAAAAAAAAACgAVQBUAEMALQAwADYAOgAwADAAKQAgAEMAZQBuAHQAcgBhAGwAIABUAGkAbQBlACAAKABVAFMAIAAmACAAQwAAAAMAAAACAAIAAAAAAAAAxP///w=="
    ],
    "DtStamp": [
      "20160828T000358Z"
    ],
    "StartTime": [
      "20160830T170000Z"
    ],
    "Subject": [
      "Admin Role"
    ],
    "UID": [
      "D5E3BB89-4D5C-42E1-921C-ADF40309BC4C"
    ],
    "OrganizerName": [
      "Mark Bradley"
    ],
    "OrganizerEmail": [
      "mark.bradley@crosslead.com"
    ],
    "Attendees": [
      {
        "Attendee": [
          {
            "Email": [
              "alex.laverty@crosslead.com"
            ],
            "Name": [
              "Alex Laverty"
            ],
            "AttendeeStatus": [
              "3"
            ],
            "AttendeeType": [
              "1"
            ]
          },
          {
            "Email": [
              "ben.southgate@crosslead.com"
            ],
            "Name": [
              "Ben Southgate"
            ],
            "AttendeeStatus": [
              "3"
            ],
            "AttendeeType": [
              "1"
            ]
          },
          {
            "Email": [
              "christian.yang@crosslead.com"
            ],
            "Name": [
              "Christian Yang"
            ],
            "AttendeeStatus": [
              "3"
            ],
            "AttendeeType": [
              "1"
            ]
          }
        ]
      }
    ],
    "Location": [
      "Google Hangout"
    ],
    "EndTime": [
      "20160830T180000Z"
    ],
    "Body": [
      {
        "Type": [
          "1"
        ],
        "EstimatedDataSize": [
          "199"
        ],
        "Truncated": [
          "1"
        ]
      }
    ],
    "Sensitivity": [
      "0"
    ],
    "BusyStatus": [
      "2"
    ],
    "AllDayEvent": [
      "0"
    ],
    "Reminder": [
      ""
    ],
    "MeetingStatus": [
      "1"
    ],
    "NativeBodyType": [
      "1"
    ],
    "ResponseRequested": [
      "1"
    ],
    "ResponseType": [
      "1"
    ]
  }

ApplicationData { ApplicationData:
   [ { Timezone: [Object],
       DtStamp: [Object],
       StartTime: [Object],
       Subject: [Object],
       UID: [Object],
       OrganizerName: [Object],
       OrganizerEmail: [Object],
       Attendees: [Object],
       Location: [Object],
       EndTime: [Object],
       Recurrence: [Object],
       Body: [Object],
       Sensitivity: [Object],
       BusyStatus: [Object],
       AllDayEvent: [Object],
       Reminder: [Object],
       Exceptions: [Object],
       MeetingStatus: [Object],
       NativeBodyType: [Object],
       DisallowNewTimeProposal: [Object],
       ResponseRequested: [Object],
       AppointmentReplyTime: [Object],
       ResponseType: [Object] } ] }
*/
exports.fieldNameMap = {
    // Desired...                          // Given...
    'eventId': 'UID',
    'attendees': 'Attendees',
    'dateTimeCreated': 'DtStamp',
    'dateTimeLastModified': 'updated',
    'attendeeAddress': 'EmailAddress.Address',
    'attendeeName': 'EmailAddress.Name',
    'iCalUId': 'iCalUID',
    'location': 'Location',
    'status': 'MeetingStatus',
    'isCreator': 'creator.self',
    'isOrganizer': 'organizer.self',
    'organizerEmail': 'OrganizerEmail',
    'recurrence': 'Recurrence',
    'responseStatus': 'responseStatus',
    'seriesMasterId': 'recurringEventId',
    'dateTimeStart': 'StartTime',
    'dateTimeEnd': 'EndTime',
    'subject': 'Subject',
    'url': 'htmlLink',
    'hangoutLink': 'hangoutLink',
    'privacy': 'visibility'
};
class ActiveSyncCalendarAdapter extends Adapter_1.default {
    // constructor needs to call super
    constructor() {
        super();
    }
    reset() {
        delete this._config;
        delete this._service;
        return this;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const { credentials } = this;
            if (!credentials) {
                throw new Error('credentials required for adapter.');
            }
            // map Google json keys to keys used in this library
            for (const want in credentialMappings) {
                const alternate = credentialMappings[want];
                if (!credentials[want]) {
                    credentials[want] = credentials[alternate];
                }
            }
            // validate required credential properties
            Object.keys(credentialMappings)
                .forEach(prop => {
                if (!credentials[prop]) {
                    throw new Error(`Property ${prop} required in adapter credentials!`);
                }
            });
            this._config = new ActiveSyncCalendarAdapter.Configuration(credentials);
            this._service = new ActiveSyncCalendarAdapter.Service(this._config);
            yield this._service.init();
            const { email: email } = credentials;
            console.log(`Successfully initialized active sync calendar adapter for email: ${email}`);
            return this;
        });
    }
    getCalendarData(email, password, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                username: email,
                password,
                endpoint,
                folders: [{
                        Type: ['8 '] // Calendar
                    }],
                folderSyncKey: 0,
                device: {
                    id: '0000000',
                    type: 'iPhone',
                    model: 'iPhone Simulator',
                    operatingSystem: 'iPhone OS8.1'
                }
            };
            const myCalClient = asclient(options);
            // const test = await myCalClient.testConnectivity();
            // console.log('testConnectivity!');
            yield myCalClient.provision();
            /*
            const folderSync = (await myCalClient.folderSync()).body.FolderSync;
            const folderSyncKey = folderSync.SyncKey;
         
            const calFolder = _.find(folderSync.Changes[0].Add, (folder: any) => {
              return folder.Type && folder.Type[0] === '8'; // Calendar Type
            });
         
            { ServerId: [ '2' ],
           ParentId: [ '0' ],
           DisplayName: [ 'Calendar' ],
           Type: [ '8' ] }
           */
            // console.log('calFolder', calFolder );
            // console.log('syncKey', folderSyncKey );
            // console.log('changes', JSON.stringify(folderSync.Changes[0].Add, null, 2) );
            yield myCalClient.enableCalendarSync();
            yield myCalClient.sync();
            console.log('folders', options.folders);
            const contents = myCalClient.contents;
            console.log('contents', { contents });
            const folders = contents['2'];
            for (const folder of folders) {
                // console.log('ServerId', { ServerId : folder.ServerId } );
                console.log('ApplicationData', JSON.stringify(folder.ApplicationData, null, 2));
            }
        });
    }
    // currently doing nothing with fields here, but keeping as placeholder
    getBatchData(userProfiles = [], filterStartDate, filterEndDate, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filterStartDate.getTime() > filterEndDate.getTime()) {
                throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
            }
            const { fieldNameMap } = ActiveSyncCalendarAdapter;
            // api options...
            // https://developers.google.com/google-apps/calendar/v3/
            const opts = {
                alwaysIncludeEmail: true,
                singleEvents: true,
                timeMax: filterEndDate.toISOString(),
                timeMin: filterStartDate.toISOString(),
                orderBy: 'startTime'
            };
            const groupRunStats = {
                success: true,
                runDate: moment().utc().toDate(),
                filterStartDate: filterStartDate,
                filterEndDate: filterEndDate,
                emails: userProfiles,
                results: []
            };
            try {
                return { results: [] };
            }
            catch (error) {
                return Object.assign(groupRunStats, {
                    errorMessage: error,
                    success: false
                });
            }
        });
    }
    runConnectionTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const { credentials } = this;
            if (!credentials) {
                throw new Error('credentials required for adapter.');
            }
            // map Google json keys to keys used in this library
            for (const want in credentialMappings) {
                const alternate = credentialMappings[want];
                if (!credentials[want]) {
                    credentials[want] = credentials[alternate];
                }
            }
            // validate required credential properties
            Object.keys(credentialMappings)
                .forEach(prop => {
                if (!credentials[prop]) {
                    throw new Error(`Property ${prop} required in adapter credentials!`);
                }
            });
            try {
                const connectUrl = yield autodiscover_activesync_1.default({
                    emailAddress: credentials.email,
                    username: credentials.username,
                    password: credentials.password
                });
                this.credentials.connectUrl = connectUrl || '';
                if (connectUrl) {
                    console.log(`Successfully connected to: ${connectUrl}`);
                }
                return {
                    success: !!connectUrl,
                    connectUrl
                };
            }
            catch (error) {
                console.log(error.stack || error);
                return {
                    message: error.message,
                    success: false
                };
            }
        });
    }
    runMessageTest() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
            /*
            const { credentials }: { credentials: {[k: string]: string} } = this;
        
            const data = await this.getBatchData(
              [ { email : credentials.email } ],
              moment().add(-1, 'day').toDate(),
              moment().toDate()
            );
        
            const firstResult = Array.isArray(data.results) && data.results[0];
        
            if (firstResult && firstResult.errorMessage) {
              return {
                success: false,
                message: firstResult.errorMessage
              };
            } else {
              return {
                success: true
              };
            }
            */
        });
    }
    // create authenticated token for api requests for given user
    authorize(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const { credentials: { email, password } } = this;
            const auth = {
                authorize: (result) => { }
            };
            /*
            new googleapis.auth.JWT(
              // email of google app admin...
              email,
              // no need for keyFile...
              null,
              // the private key itself...
              password,
              // scopes...
              ['https://www.googleapis.com/auth/calendar.readonly'],
              // the email of the individual we want to authenticate
              // ('sub' property of the json web token)
              userEmail
            );
            */
            // await authorization
            return new Promise((res, rej) => {
                const result = handleActiveSyncError(res, rej, auth);
                auth.authorize(result);
            });
        });
    }
}
ActiveSyncCalendarAdapter.Configuration = index_1.Configuration;
ActiveSyncCalendarAdapter.Service = index_1.Service;
// convert the names of the api response data
ActiveSyncCalendarAdapter.fieldNameMap = exports.fieldNameMap;
exports.default = ActiveSyncCalendarAdapter;
//# sourceMappingURL=index.js.map