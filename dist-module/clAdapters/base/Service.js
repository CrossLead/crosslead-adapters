import _regeneratorRuntime from "babel-runtime/regenerator";
import _asyncToGenerator from "babel-runtime/helpers/asyncToGenerator";
import _classCallCheck from "babel-runtime/helpers/classCallCheck";
import _createClass from "babel-runtime/helpers/createClass";

var Service = function () {
  function Service(config) {
    _classCallCheck(this, Service);

    this.config = config;
  }

  _createClass(Service, [{
    key: "init",
    value: function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", true);

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }]);

  return Service;
}();

export { Service as default };
//# sourceMappingURL=../../clAdapters/base/Service.js.map