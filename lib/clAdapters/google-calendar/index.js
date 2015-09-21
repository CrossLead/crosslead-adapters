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
    this._config  = new GoogleCalendarAdapter.Configuration(this.credentials);
    this._service = new GoogleCalendarAdapter.Service(this._config);

    await this._service.init()

    /* eslint-disable */
    // snake_case to keep with google auth JSON output
    const { client_email } = this.credentials;

    console.log(
      `Successfully initialized google calendar adapter for email: ${client_email}`
    );
    /* eslint-enable */

    return this;
  }


  async getBatchData(emails=[], filterStartDate, filterEndDate, additionalFields) {

    const emailGroupRunStats = {
      success: true,
      runDate: moment().utc().toDate(),
      filterStartDate: filterStartDate,
      filterEndDate: filterEndDate,
      emails: emails
    };

    try {
      // collect events for this group of emails
      emailGroupRunStats.results = await* emails.map(async(email) => {
        // get authorization for this user
        const authClient = await this.authorize(email);

        // request all events for this user in the given time frame
        const events = new Promise((res, rej) => {

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

      console.log('GoogleCalendarAdapter GetBatchData Error:', error);
      return emailGroupRunStats;
    }


    return this;
  }



  async runConnectionTest() {
    throw new Error('Not implemented!');
  }



  async runMessageTest() {
    throw new Error('Not implemented!');
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
