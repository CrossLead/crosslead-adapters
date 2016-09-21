var Service = function () {
  function Service(config) {
    babelHelpers.classCallCheck(this, Service);

    this.config = config;
  }

  babelHelpers.createClass(Service, [{
    key: "init",
    value: function () {
      var _ref = babelHelpers.asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
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

export default Service;
//# sourceMappingURL=../../clAdapters/base/Service.js.map