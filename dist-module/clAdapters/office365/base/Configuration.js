import Configuration from '../../base/Configuration';

var Office365BaseConfiguration = function (_Configuration) {
  babelHelpers.inherits(Office365BaseConfiguration, _Configuration);

  function Office365BaseConfiguration() {
    var _ref;

    babelHelpers.classCallCheck(this, Office365BaseConfiguration);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = babelHelpers.possibleConstructorReturn(this, (_ref = Office365BaseConfiguration.__proto__ || Object.getPrototypeOf(Office365BaseConfiguration)).call.apply(_ref, [this].concat(args)));

    Object.assign(_this.options, { apiVersion: '1.0' });
    return _this;
  }

  return Office365BaseConfiguration;
}(Configuration);

export default Office365BaseConfiguration;
;
//# sourceMappingURL=../../../clAdapters/office365/base/Configuration.js.map