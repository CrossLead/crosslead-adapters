import googleapis from 'googleapis';
import moment     from 'moment';
import { Adapter, Configuration, Service } from '../base/';


// google calendar api
const calendar = googleapis.calendar('v3');


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


  async getBatchData(emails=[], filterStartDate, filterEndDate, fields) {

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

        // request all events for this user in the given time frame
        const events = await new Promise((res, rej) => {

          // TODO: logic for requesting events here...

          calendar.events.list({
            auth: authClient,
            calendarId: 'primary',
            singleEvents: true,
            orderBy: 'startTime'
          }, (err, response) => err ? rej(err) : res(response));

        });

        return events;
      });

      return emailGroupRunStats;
    } catch (error) {
      // if the batch collection failed...

      Object.assign(emailGroupRunStats, {
        success: false,
        errorMessage: error
      });

      console.log('GoogleCalendarAdapter.getBatchData Error:', error);
      return emailGroupRunStats;
    }


    return this;
  }


  async runConnectionTest() {
    /* eslint-disable */
    const { credentials: { adminEmail } } = this;

    const now = moment().utc();
    try {
      const events = await this.getBatchData(
        [ adminEmail ],
        now.toDate(),
        now.add(-1, 'day').toDate()
      )
      return events && events.items[0];
    } catch (error) {
      throw new Error('Connection test error!', error);
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

    const authClient = new googleapis.auth.JWT(
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
    await new Promise((res, rej) => {
      authClient.authorize((err, tokens) => {
        err ? rej(err) : res(tokens);
      });
    });

    return authClient;
  }

}
