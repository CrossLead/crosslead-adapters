export function Service(config) {
  this.config = config;
};

Service.prototype.init = function () {
  return Promise.resolve(true);
};
//# sourceMappingURL=../../clAdapters/google-mail/google-js-service.js.map