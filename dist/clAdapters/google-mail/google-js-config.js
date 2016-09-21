'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.Configuration = Configuration;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Configuration(credentials, options) {
  this.credentials = credentials || {};
  this.options = (0, _assign2.default)({
    apiVersion: '1'
  }, options);
};
//# sourceMappingURL=../../clAdapters/google-mail/google-js-config.js.map