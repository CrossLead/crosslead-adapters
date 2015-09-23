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

    const { serviceEmail: email } = credentials;

    console.log(
      `Successfully initialized google calendar adapter for email: ${email}`
    );

    return this;
  }


  async getBatchData(emails=[], filterStartDate, filterEndDate, options) {

    // api options...
    // https://developers.google.com/google-apps/calendar/v3/
    const opts = {
      alwaysIncludeEmail:   true,
      calendarId:           'primary',
      singleEvents:         true,
      timeMax:              filterStartDate.toISOString(),
      timeMin:              filterEndDate.toISOString(),
      orderBy:              'startTime',
      ...options
    };

    // collect events for this group of emails
    return await* emails.map(async(email) => {

      const emailGroupRunStats = {
        filterStartDate,
        filterEndDate,
        email,
        success: true,
        runDate: moment().utc().toDate()
      };

      try {
        // add auth tokens to request
        opts.auth = await this.authorize(email);

        // function to recurse through pageTokens
        const getEvents = async(data) => {

          // request first results...
          const results = await new Promise((res, rej) => {
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

        const results = (await getEvents()).items;

        // request all events for this user in the given time frame
        return Object.assign(emailGroupRunStats, { results });

      } catch (error) {
        // if the batch collection failed...
        console.log('GoogleCalendarAdapter.getBatchData Error:', error.stack);

        return Object.assign(emailGroupRunStats, {
          success: false,
          errorMessage: error,
          results : []
        });
      }

    });
  }


  async runConnectionTest() {
    const { credentials: { email } } = this;

    try {
      const events = await this.getBatchData(
        [ email ],
        moment().toDate(),
        moment().add(-1, 'day').toDate()
      )
      return events[0];
    } catch (error) {
      console.log(error.stack || error);
      return {
        success: false,
        error
      }
    }
  }


  async runMessageTest() {
    // TODO: does this need to be different?
    console.warn('Note: runMessageTest() currently calls runConnectionTest()');
    return this.runConnectionTest();
  }


  // create authenticated token for api requests for given user
  async authorize(email) {

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

    // await authorization
    return new Promise((res, rej) => auth.authorize(err => {
      err ? rej(err) : res(auth);
    }));
  }

}
