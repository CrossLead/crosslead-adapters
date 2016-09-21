"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Service = Service;
function Service(config) {
  this.config = config;
};

Service.prototype.init = function () {
  return Promise.resolve(true);
};
//# sourceMappingURL=../../clAdapters/google-mail/google-js-service.js.map