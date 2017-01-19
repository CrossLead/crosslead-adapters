import test from "ava";
import CLAdapters from "../lib/";

const NS_TEST_ACCOUNT_VALUE = "123456";

test("should exist in the proper namespace", function(t) {
  t.truthy(CLAdapters.AdapterTypes);
  t.deepEqual(CLAdapters.AdapterTypes.NETSUITE, 2);
});

test("should return the NetSuite account as the extEntityKey", function(t) {
  const nsAdapter = CLAdapters.AdapterFactory.createAdapter(CLAdapters.AdapterTypes.NETSUITE);
  t.true(nsAdapter instanceof CLAdapters.adapters.NetSuiteAdapter);
  nsAdapter.credentials.account = NS_TEST_ACCOUNT_VALUE;
  t.deepEqual(nsAdapter.extEntityKey, NS_TEST_ACCOUNT_VALUE);
});
