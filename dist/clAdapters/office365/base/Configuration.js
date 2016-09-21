'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Configuration2 = require('../../base/Configuration');

var _Configuration3 = _interopRequireDefault(_Configuration2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Office365BaseConfiguration = function (_Configuration) {
  _inherits(Office365BaseConfiguration, _Configuration);

  function Office365BaseConfiguration() {
    var _ref;

    _classCallCheck(this, Office365BaseConfiguration);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = Office365BaseConfiguration.__proto__ || Object.getPrototypeOf(Office365BaseConfiguration)).call.apply(_ref, [this].concat(args)));

    Object.assign(_this.options, { apiVersion: '1.0' });
    return _this;
  }

  return Office365BaseConfiguration;
}(_Configuration3.default);

exports.default = Office365BaseConfiguration;
;
//# sourceMappingURL=../../../clAdapters/office365/base/Configuration.js.map