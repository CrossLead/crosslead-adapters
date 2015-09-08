'use strict';

var CLAdapters = require('../');
var should = require('should');

describe('crossleadAdapters', function() {

  it('should exist in the proper namespace', function() {
    should.exist(CLAdapters.AdapterTypes);
    CLAdapters.AdapterTypes.NETSUITE.should.equal(2);
  });

  var nsTestAccountValue = '123456';
  it('should return the NetSuite account as the extEntityKey', function() {
    var nsAdapter = CLAdapters.AdapterFactory.createAdapter(CLAdapters.AdapterTypes.NETSUITE);
    should(nsAdapter instanceof CLAdapters.NetSuiteAdapter).equal(true);
    nsAdapter.credentials.account = nsTestAccountValue;
    should(nsAdapter.extEntityKey).equal(nsTestAccountValue);
  });
});
