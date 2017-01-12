"use strict";
function Configuration(credentials, options) {
    this.credentials = credentials || {};
    this.options = Object.assign({
        apiVersion: '1'
    }, options);
}
exports.Configuration = Configuration;
;
