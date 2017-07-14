import * as moment from 'moment';
import 'moment-recur';
import * as _ from 'lodash';
import { Configuration, Service } from '../../base/index';
import * as asclient from 'asclient';
import ActiveSyncBaseAdapter from '../base/Adapter';
import autodiscover from 'autodiscover-activesync';

const credentialMappings: { [key: string]: string } = {
  'username' : 'username',
  'email'    : 'email',
  'password' : 'password',
};

const ORGANIZER_STATUS: string = '1';
const ACCEPTED_STATUS: string = '3';

/**
 * ActiveSync fields
 *
 * MeetingStatus
 *
 * 0 The event is an appointment, which has no attendees.
 * 1 or 9 The event is a meeting and the user is the meeting organizer.
 * 3 or 11 This event is a meeting, and the user is not the meeting organizer; the meeting was received from someone else.
 * 5 or 13 The meeting has been canceled and the user was the meeting organizer.
 * 7 or 15 The meeting has been canceled. The user was not the meeting organizer; the meeting was received from someone else.
 *
 */

export const fieldNameMap = {
  // Desired...                          // Given...
  // ? :                                 'TimeZone', // Do we need this?  I don't think so...
  'eventId':                             'UID',
  'attendees':                           'Attendees',
  'dateTimeCreated':                     'DtStamp',
  'attendeeAddress':                     'Email',
  'attendeeName':                        'Name',
  // 'iCalUId':                             'iCalUID', // Does not appear to be available
  'location':                            'Location',
  'status':                              'AttendeeStatus',
  'organizerEmail':                      'OrganizerEmail',
  'recurrence':                          'Recurrence',
  'responseRequested':                   'ResponseRequested',
  'responseStatus':                      'ResponseType',
  // 'seriesMasterId':                      'recurringEventId', // Does not appear to be available
  'dateTimeStart':                       'StartTime',
  'dateTimeEnd':                         'EndTime',
  'subject':                             'Subject',
  'url':                                 'WebLink',
  'allDay':                              'AllDayEvent',
  // 'hangoutLink':                         'hangoutLink',  // Does not appear to be available
  'privacy':                             'Sensitivity'
};


export default class ActiveSyncCalendarAdapter extends ActiveSyncBaseAdapter {

  static Configuration = Configuration;
  static Service = Service;

  // convert the names of the api response data
  static fieldNameMap = fieldNameMap;



  _config: Configuration;
  _service: Service;

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

    const { credentials }: { credentials: {[k: string]: string} } = this;

    if (!credentials) {
      throw new Error('credentials required for adapter.');
    }

    // map json keys to keys used in this library
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

    this._config  = new ActiveSyncCalendarAdapter.Configuration(credentials);
    this._service = new ActiveSyncCalendarAdapter.Service(this._config);

    await this._service.init();

    const { email: email } = credentials;

    console.log(
      `Successfully initialized active sync calendar adapter for email: ${email}`
    );

    return this;
  }

  private expandDaysOfWeek(daysOfWeek: number) {
    let arr: string[] = [];

    if ((daysOfWeek & 1) === 1) {
      arr.push('Sunday');
    }
    if ((daysOfWeek & 2) === 2) {
      arr.push('Monday');
    }
    if ((daysOfWeek & 4) === 4) {
      arr.push('Tuesday');
    }
    if ((daysOfWeek & 8) === 8) {
      arr.push('Wednesday');
    }
    if ((daysOfWeek & 16) === 16) {
      arr.push('Thursday');
    }
    if ((daysOfWeek & 32) === 32) {
      arr.push('Friday');
    }

    if ((daysOfWeek & 62) === 62) { // weekdays
      arr = arr.concat(...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    }

    if ((daysOfWeek & 64) === 64) {
      arr.push('Saturday');
    }

    if ((daysOfWeek & 65) === 65) { // Weekends
      arr = arr.concat(...['Saturday', 'Sunday']);
    }

    // if ((daysOfWeek & 127) === 127) { // Last day of Month
      // arr = arr.concat(...['Saturday', 'Sunday']);
    // }

    return arr;
  }

  // https://msdn.microsoft.com/en-us/library/dn292994(v=exchg.80).aspx
  private getRecurrence(startTime: any, filterEndDate: any, recurrenceObj: any) {
    // If the recurrence ends before now, then check it
    if (recurrenceObj.Until) {
      if (filterEndDate.isAfter(moment(recurrenceObj.Until[0]))) {
        return null;
      }
    }

    let recurrence = startTime.recur();
    const intervalStr = _.get(recurrenceObj, 'Interval[0]');
    const type: number = parseInt(recurrenceObj.Type[0]);
    const occurrencesStr = _.get(recurrenceObj, 'Occurrences[0]');

    switch (type) {
      case 0: { // Daily
        const daysOfWeek = _.get(recurrenceObj, 'DayOfWeek[0]');

        if (daysOfWeek) {
          const daysOfWeekInt: number = parseInt(daysOfWeek);
          const daysOfWeekArr: string[] = this.expandDaysOfWeek(daysOfWeekInt);
          recurrence = recurrence.every(daysOfWeekArr).daysOfWeek();
        } else {
          const interval: number = intervalStr ? parseInt(intervalStr) : 1;
          recurrence = recurrence.every(interval).days();
        }
        break;
      }
      case 1: { // Weekly
        if (intervalStr && parseInt(intervalStr) > 1) {
          recurrence = recurrence.every(parseInt(intervalStr)).weeks();
        } else {
          const daysOfWeek: number = parseInt(_.get(recurrenceObj, 'DayOfWeek[0]'));
          const daysOfWeekArr: string[] = this.expandDaysOfWeek(daysOfWeek);

          recurrence = recurrence.every(daysOfWeekArr).daysOfWeek();
        }

        break;
      }

      case 2: {
        // Monthly
        const dayOfMonth: number = parseInt(_.get(recurrenceObj, 'DayOfMonth[0]'));

        recurrence = recurrence.every(dayOfMonth).dayOfMonth();
        // Interval is optional, but how do I use it?

        break;
      }
      case 3: { // Monthly on nth day
        const weekOfMonth: number = parseInt(_.get(recurrenceObj, 'WeekOfMonth[0]'));
        const daysOfWeek: number = parseInt(_.get(recurrenceObj, 'DayOfWeek[0]'));

        if (daysOfWeek === 127) { // Indicates day of month
          recurrence = recurrence.every(weekOfMonth).dayOfMonth();
        } else if (daysOfWeek === 62 || daysOfWeek === 65 ) { // Indicates nth weekday or weekend of month
          const daysOfWeekArr: string[] = this.expandDaysOfWeek(daysOfWeek);
          recurrence = recurrence.every(daysOfWeekArr).daysOfWeek()
                        .every([weekOfMonth]).weeksOfMonthByDay();

        } else {
          const dayOfWeek: string = this.expandDaysOfWeek(daysOfWeek)[0];
          recurrence = recurrence.every(dayOfWeek).daysOfWeek()
                        .every([weekOfMonth - 1]).weeksOfMonthByDay();
        }

        // Interval is optional, but how do I use it?

        break;
      }
      case 5: { // Yearly
        const dayOfMonth: number = parseInt(_.get(recurrenceObj, 'DayOfMonth[0]'));
        const monthOfYear: number = parseInt(_.get(recurrenceObj, 'MonthOfYear[0]'));

        recurrence = recurrence.every(dayOfMonth).daysOfMonth()
                               .every(monthOfYear).monthsOfYear();

        // Interval is optional, but how do I use it?

        break;
      }

      case 6: { // Yearly on nth day
        const weekOfMonth: number = parseInt(_.get(recurrenceObj, 'WeekOfMonth[0]'));
        const monthOfYear: number = parseInt(_.get(recurrenceObj, 'MonthOfYear[0]'));
        // const daysOfWeek: number = parseInt(_.get(recurrenceObj, 'DayOfWeek[0]') || '0' );

        recurrence = recurrence.every(weekOfMonth).weeksOfMonth()
                               .every(monthOfYear).monthsOfYear();
        // Interval is optional, but how do I use it?

        break;
      }
    }

    if (occurrencesStr) {
      recurrence = this.checkOccurences(recurrence, parseInt(occurrencesStr), filterEndDate);
    }

    return recurrence;
  }

  private checkOccurences(recurrence: any, occurrences: number, filterEndDate: any ) {
    if (occurrences) {
      const lastDate = recurrence.next(occurrences).reverse()[0];

      if (filterEndDate.isAfter(lastDate)) {
        return null;
      }
    }

    return recurrence;
  }

  private isDeleted(exceptionsObj: any, event: any) {
    if (!exceptionsObj) {
      return false;
    }

    const exceptions: any[] = _.get(exceptionsObj, 'Exception') || [];

    for (const exception of exceptions) {
      const exExStartTime = _.get(exception, 'ExceptionStartTime[0]');
      const exStartTime = _.get(exception, 'StartTime[0]');

      if (exExStartTime === event.StartTime[0] && exExStartTime !== exStartTime) {
        return true;
      }
    }

    return false;
  }

  private setIfExists(fieldName: string, event: any, exEvent: any) {
    if (exEvent[fieldName]) {
      event[fieldName] = exEvent[fieldName];
    }
  }

  private getExceptionEvents(event: any, exceptionsObj: any, filterStartDate: any, filterEndDate: any) {
    const exceptions: any[] = _.get(exceptionsObj, 'Exception') || [];
    const exceptionEvents: any[] = [];
    const adapter = this;

    for (const exception of exceptions) {
      const startTimeStr = _.get(exception, 'StartTime[0]') ||
                            _.get(exception, 'DtStamp[0]');

      const endTimeStr = _.get(exception, 'EndTime[0]');

      if (startTimeStr && endTimeStr) {
        const startTime = moment(startTimeStr);
        const endTime = moment(endTimeStr);

        if (startTime.isSameOrAfter(filterStartDate) && endTime.isSameOrBefore(filterEndDate) ) {
          const instanceEvent: any = _.clone(event);

          // Set the iCalUId to the event id
          instanceEvent.iCalUId = event.UID[0];
          instanceEvent.UID = [instanceEvent.iCalUId + `-${startTime.year()}${startTime.month()}${startTime.date()}`];

          instanceEvent.StartTime = [ startTime.utc().format().replace(/[-:]/g, '') ];
          instanceEvent.EndTime = [ endTime.utc().format().replace(/[-:]/g, '') ];

          if (!adapter.isDeleted(exceptionsObj, instanceEvent)) {
            adapter.setIfExists('Subject', instanceEvent, exception);
            adapter.setIfExists('Location', instanceEvent, exception);
            adapter.setIfExists('BusyStatus', instanceEvent, exception);
            adapter.setIfExists('ResponseType', instanceEvent, exception);
            adapter.setIfExists('MeetingStatus', instanceEvent, exception);
            exceptionEvents.push(instanceEvent);
          }
        }
      }
    }

    return exceptionEvents;
  }

  // Create and add cloned instances of the event if recurrence, or just add the event
  private addToEvents (events: any[], folder: any, filterStartDate: any, filterEndDate: any) {
    const adapter = this;
    const event: any = folder.ApplicationData[0];

    const startTime: any = moment(event.StartTime[0]);
    const endTime: any = moment(event.EndTime[0]);
    const exceptions: any = _.get(event, 'Exceptions[0]');

    const exceptionEvents = adapter.getExceptionEvents(event, exceptions, filterStartDate, filterEndDate);

    if (exceptionEvents.length) {
      events.push(...exceptionEvents);
    }

    const recurrenceObj: any = _.get(event, 'Recurrence[0]');

    if (recurrenceObj) {
      const recurrence = adapter.getRecurrence(startTime, filterEndDate, recurrenceObj);

      if (recurrence) {
        const UID: string = event.UID[0];

        for (const date: any = moment(filterStartDate); date.isSameOrBefore(filterEndDate); date.add(1, 'days')) {

          if (recurrence.matches(date)) {
            startTime.year(date.year());
            startTime.month(date.month());
            startTime.date(date.date());
            endTime.year(date.year());
            endTime.month(date.month());
            endTime.date(date.date());

            const instanceEvent: any = _.clone(event);

            // Set the iCalUId to the event id
            instanceEvent.iCalUId = UID;
            instanceEvent.UID = [UID + `-${date.year()}${date.month()}${date.date()}`];

            instanceEvent.StartTime = [ startTime.utc().format().replace(/[-:]/g, '') ];
            instanceEvent.EndTime = [ endTime.utc().format().replace(/[-:]/g, '') ];

            if (!adapter.isDeleted(exceptions, instanceEvent) && !adapter.eventExists(events, instanceEvent)) {
              events.push(instanceEvent);
            }
          }
        }
      }
    } else if (!adapter.isDeleted(exceptions, event) && !adapter.eventExists(events, event)) {
      events.push(event);
    }
  }

  private eventExists(events: any[], event: any) {
    const startTime = event.StartTime[0];
    const subject = event.Subject ? event.Subject[0] : null;

    return !!_.find(events, (ev: any) => {
      const evStartTime = ev.StartTime[0];
      const evSubject = ev.Subject ? ev.Subject[0] : null;
      return evStartTime === startTime && evSubject === subject;
    });
  }

  async getData(filterStartDate: Date, filterEndDate: Date, properties: any) {
    if (filterStartDate.getTime() > filterEndDate.getTime()) {
      throw new Error(`filterStartDate must be less than or equal to filterEndDate`);
    }

    const { email: username, password, connectUrl: endpoint } = this.credentials;

    const individualRunStats = {
      filterStartDate,
      filterEndDate,
      success: true,
      runDate: moment().utc().toDate(),
      errorMessage: null
    };

    try {
      const options = {
        username,
        password,
        endpoint,
        folders : [],
        folderSyncKey : '0',
        device: {
          id: '0000000',
          type: 'iPhone',
          model: 'iPhone Simulator',
          operatingSystem: 'iPhone OS8.1'
        }
      };

      const myCalClient = asclient(options);

      await myCalClient.provision();

      const folderSync = (await myCalClient.folderSync()).body.FolderSync;
      // const folderSyncKey = folderSync.SyncKey;

      // console.log('syncKey', folderSyncKey );

      const calFolder = _.find(options.folders, (folder: any) => {
        return folder.Type[0] === '8'; // Calendar type
      });

      const serverId = calFolder.ServerId[0];

      // options.folderSyncKey = '1010372622';
      await myCalClient.enableCalendarSync();
      await myCalClient.sync();

      const contents = myCalClient.contents;
      const folders: any[] = contents[serverId];

      const startDate = moment(filterStartDate);
      const endDate = moment(filterEndDate);

      const adapter = this;
      // console.log('folders', JSON.stringify(folders, null, 2));

      const rawEvents: any[] = [];

      _.each(folders, (folder: any) => {
        adapter.addToEvents(rawEvents, folder, startDate, endDate);
      });

      const events: any[] = _.compact(_.map(rawEvents, (event: any) => {
        const startTime: any = moment(event.StartTime[0]);
        const endTime: any = moment(event.EndTime[0]);

        if (startTime.isBefore(startDate) || endTime.isAfter(endDate) ) {
          return null;
        }

        // console.log('event', JSON.stringify(event, null, 2));
        return event;
      }));

      events.sort( (a: any, b: any) => {
        return a.StartTime[0].localeCompare(b.StartTime[0]);
      });

      const mappedEvents = _.map(events || [], (originalEvent: any) => {
        const mappedEvent: any = {};

        // console.log(originalEvent.StartTime[0] + ':' + originalEvent.Subject[0]);

        // change to desired names
        _.each(fieldNameMap, (have: string, want: string) => {
          const val = _.get(originalEvent, have);
          const mapped = val && val.length ? val[0] : val;

          if (mapped !== undefined) {
            mappedEvent[want] = /^dateTime/.test(want) ? moment(mapped).toDate() : mapped;
          }
        });

        const responseStatus = _.get(mappedEvent, 'responseStatus');

        if (mappedEvent.responseStatus === ACCEPTED_STATUS || mappedEvent.responseStatus === ORGANIZER_STATUS) {
          mappedEvent.responseStatus = 'Accepted';
        }

        const attendees = originalEvent[fieldNameMap['attendees']];

        if (attendees && attendees.length) {
          const attendeePeople = attendees[0].Attendee;

          mappedEvent['attendees'] = attendeePeople
            .map((attendee: any) => {
              let acceptedStatus: string = _.get(attendee, 'AttendeeStatus[0]') || '0';

              if (acceptedStatus === ACCEPTED_STATUS) {
                acceptedStatus = 'Accepted';
              }

              return {
                address:  _.get(attendee, 'Email[0]'),
                name:     _.get(attendee, 'Name[0]'),
                response: acceptedStatus
              };
            });
        } else {
          mappedEvent['attendees'] = [];
        }

        // Make it the same as the eventId for now, since it does not look like this value is available
        mappedEvent.iCalUId = originalEvent.iCalUId || mappedEvent.eventId;
        mappedEvent.allDay = adapter.parseBoolean(mappedEvent.allDay);

        const recurrence = mappedEvent['recurrence'];

        if (recurrence) {
          const mappedRecurrence: any = {};

          mappedRecurrence.type = _.get(recurrence, 'Type[0]');
          mappedRecurrence.interval = _.get(recurrence, 'Interval[0]');
          mappedRecurrence.dayOfWeek = _.get(recurrence, 'DayOfWeek[0]');
          mappedRecurrence.firstDayOfWeek = _.get(recurrence, 'FirstDayOfWeek[0]');
          mappedRecurrence.occurrences = _.get(recurrence, 'Occurrences[0]');
          mappedRecurrence.weekOfMonth = _.get(recurrence, 'WeekOfMonth[0]');
          mappedRecurrence.monthOfYear = _.get(recurrence, 'MonthOfYear[0]');
          mappedRecurrence.until = _.get(recurrence, 'Until[0]');
          mappedRecurrence.dayOfMonth = _.get(recurrence, 'DayOfMonth[0]');
          mappedRecurrence.calendarType = _.get(recurrence, 'CalendarType[0]');
          mappedRecurrence.isLeapMonth = _.get(recurrence, 'IsLeapMonth[0]');
          mappedRecurrence.firstDayOfWeek = _.get(recurrence, 'FirstDayOfWeek[0]');

          mappedEvent['recurrence'] = mappedRecurrence;
        }

        // console.log('mapped event', JSON.stringify(mappedEvent, null, 2));
        return mappedEvent;
      });

      const results = [{
        filterStartDate,
        filterEndDate,
        success: true,
        userId: properties.userId,
        email: properties.email,
        data: mappedEvents
      }];

      return Object.assign(individualRunStats, { results } );
    } catch ( error ) {
      return Object.assign(individualRunStats, {
        errorMessage: error,
        success: false
      });
    }
  }

  async runConnectionTest() {

    const { credentials }: { credentials: {[k: string]: string} } = this;

    if (!credentials) {
      throw new Error('credentials required for adapter.');
    }

    // map keys to keys used in this library
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
      const connectUrl: string | null = await autodiscover({
        emailAddress : credentials.email,
        username: credentials.username,
        password: credentials.password
      });

      this.credentials.connectUrl = connectUrl || '';

      if (connectUrl) {
        console.log(
          `Successfully connected to: ${connectUrl}`
        );
      }

      return {
        success : !!connectUrl,
        connectUrl
      };
    } catch (error) {
      console.log(error.stack || error);
      return {
        message: error.message,
        success: false
      };
    }
  }
}
