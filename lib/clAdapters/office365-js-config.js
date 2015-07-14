'use strict';

var _ = require('lodash');

var Configuration = module.exports = function Configuration(credentials, options) {
  this.credentials = credentials || {};
  this.options = _.merge({
    apiVersion: '1.0'
  }, options);
};
