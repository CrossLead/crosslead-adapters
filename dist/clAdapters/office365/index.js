'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mail = require('./mail/');

var _mail2 = _interopRequireDefault(_mail);

var _calendar = require('./calendar/');

var _calendar2 = _interopRequireDefault(_calendar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Office365MailAdapter: _mail2.default,
  Office365CalendarAdapter: _calendar2.default
};
//# sourceMappingURL=../../clAdapters/office365/index.js.map