'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CLMockAdapter;

var _util = require('util');

var util = _interopRequireWildcard(_util);

var _Adapter = require('./base/Adapter');

var _Adapter2 = _interopRequireDefault(_Adapter);

var _fields = require('./fields/');

var Fields = _interopRequireWildcard(_fields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * CLMockAdapter
 *
 * `credentials` should always be:
 * ```
 * {
 *   appId: '123456',
 *   apiKey: '999999'
 * }
 * ```
 * @class
 * @return {ClMockAdapter}
 */
function CLMockAdapter() {
  _Adapter2.default.call(this);

  /**
   * @override
   */
  Object.defineProperty(this, 'extEntityKey', {
    get: function get() {
      return this.credentials.appId;
    }
  });
};

util.inherits(CLMockAdapter, _Adapter2.default);

/**
 * @override
 */
CLMockAdapter.prototype.init = function () {
  var _this = this;
  var p = new Promise(function (resolve, reject) {
    if (_this.credentials.appId === '123456' && _this.credentials.apiKey === '999999') {
      resolve(_this);
    } else {
      reject('Wrong credentials, please use appId "123456" and apiKey "999999"');
    }
  });

  return p;
};

/**
 * Reflects given field in this `result` format:
 * ```
 * {
 *   {fieldType}ExtId: rand # between 1-50,
 *   {extId}: Float (0-1.0)
 * }
 * ```
 *
 * For example, for a "Fields.Types.USER" field w/extId 'user#utilizationRate', would return:
 * ```
 * {
 *   userExtId: 50,
 *   'user#utilizationRate': 0.55
 * }
 * ```
 *
 * Returns between 0-50 results in pages of `query.limit` (default 5)
 * @override
 */
CLMockAdapter.prototype.getFieldData = function (field, query) {
  query = query || {};
  var typeName = void 0;
  console.log(field);
  switch (field.type) {
    case Fields.Types.USER:
      typeName = 'user';
      break;
    case Fields.Types.GROUP:
      typeName = 'group';
      break;
    default:
      typeName = 'unknown';
      break;
  }

  var skip = query.skip || 0;
  if (!skip) {
    this.numResultsToGenerate = Math.floor(Math.random() * 50);
    console.log('CLMockAdapter: Generating %d results', this.numResultsToGenerate);
  }

  var result = {
    count: this.numResultsToGenerate,
    results: []
  };

  var createResult = function createResult() {
    var r = {};
    r[typeName + 'ExtId'] = Math.floor(Math.random() * 3) + 1;
    r[field.extId] = Math.random();
    return r;
  };

  var pageSize = query.limit || 5;
  var resultsToReturn = Math.min(pageSize, this.numResultsToGenerate - skip);
  for (var i = 0; i < resultsToReturn; i++) {
    result.results.push(createResult());
  }

  return Promise.resolve(result);
};
//# sourceMappingURL=../clAdapters/clMockAdapter.js.map