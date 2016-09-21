import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';

var Configuration = function Configuration(credentials, options) {
  _classCallCheck(this, Configuration);

  this.credentials = credentials || {};
  this.options = _extends({
    apiVersion: '1'
  }, options);
};

export default Configuration;
//# sourceMappingURL=../../clAdapters/base/Configuration.js.map