import _Promise from "babel-runtime/core-js/promise";
export function Service(config) {
  this.config = config;
};

Service.prototype.init = function () {
  return _Promise.resolve(true);
};
//# sourceMappingURL=../../clAdapters/google-mail/google-js-service.js.map