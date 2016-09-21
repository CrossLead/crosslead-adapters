'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdapterTypes = exports.AdapterStatus = exports.Fields = undefined;

var _fields = require('../clAdapters/fields/');

var _Fields = _interopRequireWildcard(_fields);

var _adapterStatus = require('../clAdapters/adapterStatus');

var _adapterStatus2 = _interopRequireDefault(_adapterStatus);

var _adapterTypes = require('../clAdapters/adapterTypes');

var _adapterTypes2 = _interopRequireDefault(_adapterTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.Fields = _Fields; /**
                           * crosslead-adapters-client
                           * https://github.com/CrossLead/crosslead-adapters
                           *
                           * Copyright (c) 2015 McChrystal Group
                           *
                           * @ignore
                           */

/**
 * CLAdapters functionality available on client. Mostly a subset
 * of server functionality like common enums
 * @return {CLAdapters}
 */

exports.AdapterStatus = _adapterStatus2.default;
exports.AdapterTypes = _adapterTypes2.default;
//# sourceMappingURL=../client/index.js.map