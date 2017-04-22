import { Certificate } from 'tls';
import test from 'ava';
import CLAdapters from '../lib/';
import { GoogleCalendarAdapter, NetSuiteAdapter, ActiveSyncCalendarAdapter } from '../lib/clAdapters';

const NS_TEST_ACCOUNT_VALUE = '123456';

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
  const pw: string = '8ChAgI0u*JxT';
  t.true(adapter instanceof ActiveSyncCalendarAdapter);

  //await adapter.getCalendarData( 'mark.bradley@crosslead.com', pw, 'https://outlook.office365.com/Microsoft-Server-ActiveSync');

  adapter.credentials = {
    username: 'mark.bradley@crosslead.com',
    email: 'mark.bradley@crosslead.com',
    password: pw
  };

  const response = await adapter.runConnectionTest();

  console.log(response);

  // await t.throws(adapter.init());
  // await t.notThrows(adapter.init());
});
