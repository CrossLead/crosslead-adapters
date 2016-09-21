'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Configuration = function Configuration(credentials, options) {
  _classCallCheck(this, Configuration);

  this.credentials = credentials || {};
  this.options = _extends({
    apiVersion: '1'
  }, options);
};

exports.default = Configuration;
//# sourceMappingURL=../../clAdapters/base/Configuration.js.map