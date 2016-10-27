import _Object$assign from 'babel-runtime/core-js/object/assign';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import Configuration from '../../base/Configuration';

var Office365BaseConfiguration = function (_Configuration) {
  _inherits(Office365BaseConfiguration, _Configuration);

  function Office365BaseConfiguration() {
    var _ref;

    _classCallCheck(this, Office365BaseConfiguration);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = Office365BaseConfiguration.__proto__ || _Object$getPrototypeOf(Office365BaseConfiguration)).call.apply(_ref, [this].concat(args)));

    _Object$assign(_this.options, { apiVersion: '1.0' });
    return _this;
  }

  return Office365BaseConfiguration;
}(Configuration);

export { Office365BaseConfiguration as default };
;
//# sourceMappingURL=../../../clAdapters/office365/base/Configuration.js.map