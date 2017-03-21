import { Certificate } from 'tls';
import test from 'ava';
import CLAdapters from '../lib/';
import { GoogleCalendarAdapter, NetSuiteAdapter } from '../lib/clAdapters';

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
