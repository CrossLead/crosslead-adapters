"use strict";
function Service(config) {
    this.config = config;
}
exports.Service = Service;
;
Service.prototype.init = function () {
    return Promise.resolve(true);
};
