var Configuration = function Configuration(credentials, options) {
  babelHelpers.classCallCheck(this, Configuration);

  this.credentials = credentials || {};
  this.options = babelHelpers.extends({
    apiVersion: '1'
  }, options);
};

export default Configuration;
//# sourceMappingURL=../../clAdapters/base/Configuration.js.map