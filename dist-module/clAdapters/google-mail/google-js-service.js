"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

exports.Service = Service;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Service(config) {
  this.config = config;
};

Service.prototype.init = function () {
  return _promise2.default.resolve(true);
};
//# sourceMappingURL=../../clAdapters/google-mail/google-js-service.js.map