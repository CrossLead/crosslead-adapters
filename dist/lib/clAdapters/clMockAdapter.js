"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Adapter_1 = require("./base/Adapter");
const Fields = require("./fields/");
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
class CLMockAdapter extends Adapter_1.default {
    constructor() {
        super();
        /**
         * @override
         */
        Object.defineProperty(this, 'extEntityKey', {
            get: function () {
                return this.credentials.appId;
            }
        });
    }
}
;
exports.default = CLMockAdapter;
/**
 * @override
 */
CLMockAdapter.prototype.init = function () {
    const _this = this;
    const p = new Promise((resolve, reject) => {
        if (_this.credentials.appId === '123456' && _this.credentials.apiKey === '999999') {
            resolve(_this);
        }
        else {
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
    let typeName;
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
    const skip = query.skip || 0;
    if (!skip) {
        this.numResultsToGenerate = Math.floor(Math.random() * 50);
        console.log('CLMockAdapter: Generating %d results', this.numResultsToGenerate);
    }
    const result = {
        count: this.numResultsToGenerate,
        results: []
    };
    const createResult = function () {
        const r = {};
        r[typeName + 'ExtId'] = Math.floor(Math.random() * 3) + 1;
        r[field.extId] = Math.random();
        return r;
    };
    const pageSize = query.limit || 5;
    const resultsToReturn = Math.min(pageSize, this.numResultsToGenerate - skip);
    for (let i = 0; i < resultsToReturn; i++) {
        result.results.push(createResult());
    }
    return Promise.resolve(result);
};
//# sourceMappingURL=clMockAdapter.js.map