'use strict';

var _ = require('lodash');
var Q = require('q');

var Service = module.exports = function Service(config) {
  this.config = config;
};

Service.prototype.init = function() {
  return Q.when(true);//todo
};