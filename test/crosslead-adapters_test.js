'use strict';

var CLAdapters = require('../');
var should = require('should');

describe('crossleadAdapters', function() {

  it('should exist in the proper namespace', function() {
    should.exist(CLAdapters.AdapterTypes);
    CLAdapters.AdapterTypes.NETSUITE.should.equal(2);
  });

});