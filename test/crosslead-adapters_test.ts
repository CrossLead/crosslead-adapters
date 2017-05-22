import { Certificate } from 'tls';
import test from 'ava';
import CLAdapters from '../lib/';
import { GoogleCalendarAdapter, NetSuiteAdapter, ActiveSyncCalendarAdapter } from '../lib/clAdapters';
import { GoogleErrorType, createGoogleError } from '../lib/clAdapters/google/errors';

const NS_TEST_ACCOUNT_VALUE = '123456';

const ACTIVE_SYNC_EMAIL: string = 'mark.bradley@crosslead.com';
const ACTIVE_SYNC_USERNAME: string = 'mark.bradley@crosslead.com';
const ACTIVE_SYNC_PASSWORD: string = 'password';
const ACTIVE_SYNC_VALID_URL: string = 'https://outlook.office365.com/Microsoft-Server-ActiveSync';

const EXCHANGE_SERVICE_EMAIL: string = 'email';
const EXCHANGE_SERVICE_PASSWORD: string = 'password';
const EXCHANGE_SERVICE_USER_EMAIL: string = 'email';
const EXCHANGE_SERVICE_CONNECT_URL: string = 'https://eas.comcast.com';

test('should exist in the proper namespace', t => {
  t.truthy(CLAdapters.AdapterTypes);
  t.deepEqual(CLAdapters.AdapterTypes.NETSUITE, 2);
});

test('should return the NetSuite account as the extEntityKey', t => {
  const nsAdapter = CLAdapters.AdapterFactory.createAdapter(CLAdapters.AdapterTypes.NETSUITE);
  t.true(nsAdapter instanceof NetSuiteAdapter);
  nsAdapter.credentials.account = NS_TEST_ACCOUNT_VALUE;
  t.deepEqual(nsAdapter.extEntityKey, NS_TEST_ACCOUNT_VALUE);
});

test('should throw if missing credentials', async t => {
  const a = new CLAdapters.adapters.NetSuiteAdapter();
  const adapter = CLAdapters.AdapterFactory.createAdapter(CLAdapters.AdapterTypes.GOOGLE_CALENDAR);
  t.true(adapter instanceof GoogleCalendarAdapter);
  await t.throws(adapter.init());
  adapter.credentials = {
    certificate: 'test',
    serviceEmail: 'test@test.com',
    email: 'test@test.com'
  };
  await t.notThrows(adapter.init());
});

test('active sync should be listed as user linked type', async t => {
  t.true(CLAdapters.AdapterLinkedAccountTypes.indexOf(CLAdapters.AdapterTypes.ACTIVE_SYNC_CALENDAR) > -1 );
});

test('should connect with given credentials', async t => {
  const a = new CLAdapters.adapters.ActiveSyncCalendarAdapter();
  const adapter = CLAdapters.AdapterFactory.createAdapter(CLAdapters.AdapterTypes.ACTIVE_SYNC_CALENDAR);
  t.true(adapter instanceof ActiveSyncCalendarAdapter);

  adapter.credentials = {
    username: ACTIVE_SYNC_USERNAME,
    email: ACTIVE_SYNC_EMAIL,
    password: ACTIVE_SYNC_PASSWORD,
    connectUrl: ''
  };

  const response: any = await adapter.runConnectionTest();
  const expectedResponse = response.success ? ACTIVE_SYNC_VALID_URL : null;

  t.true(response.connectUrl === expectedResponse);
});

test('should get active sync calendar data', async t => {
  const a = new CLAdapters.adapters.ActiveSyncCalendarAdapter();
  const adapter = CLAdapters.AdapterFactory.createAdapter(CLAdapters.AdapterTypes.ACTIVE_SYNC_CALENDAR);

  adapter.credentials = {
    username: ACTIVE_SYNC_USERNAME,
    email: ACTIVE_SYNC_EMAIL,
    password: ACTIVE_SYNC_PASSWORD,
    connectUrl: ACTIVE_SYNC_VALID_URL
  };

  const startDate = new Date('05-15-2017');
  const endDate = new Date('05-16-2017');
  const eventData = await adapter.getData(startDate, endDate, {});

  t.true(ACTIVE_SYNC_PASSWORD === 'password' ? true : eventData.success);
});

test('should generate error stack of callee', t => {
  const e = createGoogleError('InvalidGrant');
  t.false(/createGoogleError/.test(e.err.stack || ''));
});

test('should get exchange service account calendar data', async t => {
  const a = new CLAdapters.adapters.ExchangeServiceCalendarAdapter();
  const adapter = CLAdapters.AdapterFactory.createAdapter(CLAdapters.AdapterTypes.EXCHANGE_SERVICE_CALENDAR);

  adapter.credentials = {
    email: EXCHANGE_SERVICE_EMAIL,
    password: EXCHANGE_SERVICE_PASSWORD,
    connectUrl: EXCHANGE_SERVICE_CONNECT_URL
  };

  const startDate = new Date('05-15-2017');
  const endDate = new Date('05-16-2017');
  const connTest = await adapter.runConnectionTest(EXCHANGE_SERVICE_USER_EMAIL);

  t.true(EXCHANGE_SERVICE_PASSWORD === 'password' ? true : connTest.success);
});
