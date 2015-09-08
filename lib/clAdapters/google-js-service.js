'use strict';

var Service = module.exports = function Service(config) {
  this.config = config;
};

Service.prototype.init = function() {
  return Promise.resolve(true);
};
