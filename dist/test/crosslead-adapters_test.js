"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const _1 = require("../lib/");
const NS_TEST_ACCOUNT_VALUE = '123456';
ava_1.default('should exist in the proper namespace', function (t) {
    t.truthy(_1.default.AdapterTypes);
    t.deepEqual(_1.default.AdapterTypes.NETSUITE, 2);
});
ava_1.default('should return the NetSuite account as the extEntityKey', function (t) {
    const nsAdapter = _1.default.AdapterFactory.createAdapter(_1.default.AdapterTypes.NETSUITE);
    t.true(nsAdapter instanceof _1.default.adapters.NetSuiteAdapter);
    nsAdapter.credentials['account'] = NS_TEST_ACCOUNT_VALUE;
    t.deepEqual(nsAdapter.extEntityKey, NS_TEST_ACCOUNT_VALUE);
});
//# sourceMappingURL=crosslead-adapters_test.js.map