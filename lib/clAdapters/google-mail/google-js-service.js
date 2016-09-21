export function Service(config) {
  this.config = config;
};

Service.prototype.init = function() {
  return Promise.resolve(true);
};
