"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const _1 = require("../lib/");
const clAdapters_1 = require("../lib/clAdapters");
const errors_1 = require("../lib/clAdapters/google/errors");
const NS_TEST_ACCOUNT_VALUE = '123456';
const error = new Error('Original message');
ava_1.default('should exist in the proper namespace', t => {
    t.truthy(_1.default.AdapterTypes);
    t.deepEqual(_1.default.AdapterTypes.NETSUITE, 2);
});
ava_1.default('should return the NetSuite account as the extEntityKey', t => {
    const nsAdapter = _1.default.AdapterFactory.createAdapter(_1.default.AdapterTypes.NETSUITE);
    t.true(nsAdapter instanceof clAdapters_1.NetSuiteAdapter);
    nsAdapter.credentials.account = NS_TEST_ACCOUNT_VALUE;
    t.deepEqual(nsAdapter.extEntityKey, NS_TEST_ACCOUNT_VALUE);
});
ava_1.default('should throw if missing credentials', (t) => __awaiter(this, void 0, void 0, function* () {
    const a = new _1.default.adapters.NetSuiteAdapter();
    const adapter = _1.default.AdapterFactory.createAdapter(_1.default.AdapterTypes.GOOGLE_CALENDAR);
    t.true(adapter instanceof clAdapters_1.GoogleCalendarAdapter);
    yield t.throws(adapter.init());
    adapter.credentials = {
        certificate: 'test',
        serviceEmail: 'test@test.com',
        email: 'test@test.com'
    };
    yield t.notThrows(adapter.init());
}));
ava_1.default('should have original stack when wrapping errors', t => {
    const invalidGrantErr = new errors_1.InvalidGrantError(error);
    t.deepEqual(error.stack, invalidGrantErr.stack);
});
//# sourceMappingURL=crosslead-adapters_test.js.map