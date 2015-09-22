import googleapis from 'googleapis';
import moment     from 'moment';
import { Adapter, Configuration, Service } from '../base/';


// google calendar api
const calendar = googleapis.calendar('v3');

/*
  Google Calendar API abstraction

  Expects credentials to be of the form...

    {
      "private_key_id": "***********",
      "private_key": "-----PRIVATE KEY-----",
      "client_email": "**********@developer.gserviceaccount.com",
      "client_id": "********.apps.googleusercontent.com",
      "type": "service_account"
    }

  which is produced as a json file from the Google Dev Console upon
  creating service account credentials.
*/
export default class GoogleCalendarAdapter extends Adapter {
  // static attribute classes
  static Configuration = Configuration;
  static Service = Service;


  // constructor needs to call super
  constructor() {
    super();
  }


  reset() {
    delete this._config;
    delete this._service;
    return this;
  }


  async init() {

    // validate required credential properties
    [
      'private_key',
      'client_email',
      'adminEmail'
    ]
    .forEach(prop => {
      if (!this.credentials[prop]) {
        throw new Error(`Property ${prop} required in adapter credentials!`);
      }
    });

    this._config  = new GoogleCalendarAdapter.Configuration(this.credentials);
    this._service = new GoogleCalendarAdapter.Service(this._config);

    await this._service.init();

    /* eslint-disable */
    // snake_case to keep with google auth JSON output
    const { client_email: email } = this.credentials;

    console.log(
      `Successfully initialized google calendar adapter for email: ${email}`
    );
    /* eslint-enable */

    return this;
  }


  async getBatchData(emails=[], filterStartDate, filterEndDate) {

    const emailGroupRunStats = {
      filterStartDate,
      filterEndDate,
      emails,
      success: true,
      runDate: moment().utc().toDate()
    };

    try {
      // collect events for this group of emails
      emailGroupRunStats.results = await* emails.map(async(email) => {

        // get authorization for this user
        const authClient = await this.authorize(email);

        // function to recurse through pageTokens
        const getEvents = async(data) => {

          // request first results...
          const results = await new Promise((res, rej) => {

            const opts = {
              // api options...
              // https://developers.google.com/google-apps/calendar/v3/
              auth:                 authClient,
              alwaysIncludeEmail:   true,
              calendarId:           'primary',
              singleEvents:         true,
              timeMax:              filterStartDate.toISOString(),
              timeMin:              filterEndDate.toISOString(),
              orderBy:              'startTime'
            };

            // add page token if given
            if (data && data.nextPageToken) {
              opts.pageToken = data.nextPageToken;
            }

            calendar.events.list(
              opts, (err, data) => err ? rej(err) : res(data)
            );
          });

          // if we already have data being accumulated, add to items
          if (data) {
            data.items.push(...results.items);
          } else {
            data = results;
          }

          // if there is a token for the next page, continue...
          if (results.nextPageToken) {
            data.nextPageToken = results.nextPageToken;
            return await getEvents(data);
          }

          return data;
        };

        // request all events for this user in the given time frame
        const eventData = await getEvents();

        // add user email as property to data
        return Object.assign(eventData, { email });
      });

      return emailGroupRunStats;
    } catch (error) {
      // if the batch collection failed...

      Object.assign(emailGroupRunStats, {
        success: false,
        errorMessage: error
      });

      console.log('GoogleCalendarAdapter.getBatchData Error:', error.stack);
      return emailGroupRunStats;
    }


    return this;
  }


  async runConnectionTest() {
    /* eslint-disable */
    const { credentials: { adminEmail } } = this;

    try {
      const events = await this.getBatchData(
        [ adminEmail ],
        moment().toDate(),
        moment().add(-1, 'day').toDate()
      )
      return events;
    } catch (error) {
      console.log(error.stack || error);
      throw new Error('Connection test error!');
    }
    /* eslint-enable */
  }


  async runMessageTest() {
    // TODO: does this need to be different?
    console.warn('Note: runMessageTest() currently calls runConnectionTest()');
    return this.runConnectionTest();
  }


  // create authenticated token for api requests for given user
  async authorize(email) {

    /* eslint-disable */
    // snake_case to keep with google auth JSON output
    const { credentials: { client_email, private_key } } = this;

    const auth = new googleapis.auth.JWT(
      // email of google app admin...
      client_email,
      // no need for keyFile...
      null,
      // the private key itself...
      private_key,
      // scopes...
      ['https://www.googleapis.com/auth/calendar.readonly'],
      // the email of the individual we want to authenticate
      // ('sub' property of the json web token)
      email
    );
    /* eslint-enable */

    // await authorization
    return new Promise((res, rej) => auth.authorize(err => {
      err ? rej(err) : res(auth);
    }));
  }

}
