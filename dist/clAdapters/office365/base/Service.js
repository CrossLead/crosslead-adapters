'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Service2 = require('../../base/Service');

var _Service3 = _interopRequireDefault(_Service2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Office365BaseService = function (_Service) {
  _inherits(Office365BaseService, _Service);

  function Office365BaseService() {
    _classCallCheck(this, Office365BaseService);

    return _possibleConstructorReturn(this, (Office365BaseService.__proto__ || Object.getPrototypeOf(Office365BaseService)).apply(this, arguments));
  }

  return Office365BaseService;
}(_Service3.default);

exports.default = Office365BaseService;
;
//# sourceMappingURL=../../../clAdapters/office365/base/Service.js.map