'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClAdaptersClient = exports.adapters = exports.AdapterTypes = exports.AdapterStatus = exports.AdapterFactory = exports.Fields = undefined;

var _fields = require('./clAdapters/fields');

var Fields = _interopRequireWildcard(_fields);

var _Fields = _interopRequireWildcard(_fields);

var _adapterFactory = require('./clAdapters/adapterFactory');

var _adapterFactory2 = _interopRequireDefault(_adapterFactory);

var _adapterStatus = require('./clAdapters/adapterStatus');

var _adapterStatus2 = _interopRequireDefault(_adapterStatus);

var _adapterTypes = require('./clAdapters/adapterTypes');

var _adapterTypes2 = _interopRequireDefault(_adapterTypes);

var _clAdapters = require('./clAdapters/');

var adapters = _interopRequireWildcard(_clAdapters);

var _adapters = _interopRequireWildcard(_clAdapters);

var _client = require('./client/');

var _ClAdaptersClient = _interopRequireWildcard(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
  Fields: Fields,
  AdapterFactory: _adapterFactory2.default,
  AdapterTypes: _adapterTypes2.default,
  AdapterStatus: _adapterStatus2.default,
  adapters: adapters
}; /**
    * crosslead-adapters
    * https://github.com/CrossLead/crosslead-adapters
    *
    * Copyright (c) 2016 CrossLead
    *
    * @ignore
    */

exports.Fields = _Fields;
exports.AdapterFactory = _adapterFactory2.default;
exports.AdapterStatus = _adapterStatus2.default;
exports.AdapterTypes = _adapterTypes2.default;
exports.adapters = _adapters;
// client

exports.ClAdaptersClient = _ClAdaptersClient;
//# sourceMappingURL=index.js.map