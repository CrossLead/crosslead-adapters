import googleapis from 'googleapis';
import moment     from 'moment';
import { Adapter, Configuration, Service } from '../base/';


// google calendar api
const calendar = googleapis.calendar('v3');

const credentialMappings = {
  'certificate' : 'private_key',
  'serviceEmail': 'client_email',
  'email'       : 'adminEmail'
}


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

    this._config  = new GoogleCalendarAdapter.Configuration(credentials);
    this._service = new GoogleCalendarAdapter.Service(this._config);

    await this._service.init();

    /* eslint-disable */
    // snake_case to keep with google auth JSON output
    const { serviceEmail: email } = credentials;

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
        return (await getEvents()).items;
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
    const { credentials: { email } } = this;

    try {
      const events = await this.getBatchData(
        [ email ],
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
    const { credentials: { serviceEmail, certificate } } = this;

    const auth = new googleapis.auth.JWT(
      // email of google app admin...
      serviceEmail,
      // no need for keyFile...
      null,
      // the private key itself...
      certificate,
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
