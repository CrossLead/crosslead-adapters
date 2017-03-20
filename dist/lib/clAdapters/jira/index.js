"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Adapter_1 = require("../base/Adapter");
const url = require("url");
const request = require("request");
const rate_limit_1 = require("../../utils/rate-limit");
;
class JiraAdapter extends Adapter_1.default {
    constructor() {
        super(...arguments);
        this.apiVersion = 2;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Rate limit api requests to once per second
     */
    makeRequest(path, query) {
        const uri = url.format({
            protocol: this.credentials['protocol'] || 'https',
            hostname: this.credentials['host'],
            port: this.credentials['port'],
            pathname: 'rest/api/' + this.apiVersion + '/' + path
        });
        const authorizationString = new Buffer(this.credentials['username'] + ':' + this.credentials['password']).toString('base64');
        const options = {
            uri: uri,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + authorizationString
            }
        };
        if (query) {
            options.qs = query;
        }
        return new Promise((resolve) => {
            request(options, (error, response, body) => {
                let errorMessage = null;
                let success = (response &&
                    (typeof response.statusCode !== 'undefined') &&
                    response.statusCode < 400);
                if (error) {
                    success = false;
                    if (error.code === 'ECONNREFUSED') {
                        errorMessage = 'Failed to connect to JIRA adapter.';
                    }
                }
                if (response && response.statusCode === 401) {
                    success = false;
                    errorMessage = 'Failed to authorize JIRA adapter.';
                }
                resolve({
                    code: success ? 200 : 500,
                    message: (errorMessage && new Error(errorMessage)) || error,
                    data: body,
                    success: success
                });
            });
        });
    }
    getAllIssues(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestParams = params || {};
            requestParams.startAt = 0;
            requestParams.maxResults = 50;
            let resultCount, issues = [];
            do {
                const result = yield this.makeRequest('search', requestParams), data = JSON.parse(result.data);
                if (data.issues && data.issues.length) {
                    resultCount = data.issues.length;
                    issues = issues.concat(data.issues);
                    requestParams.startAt += resultCount;
                }
                else {
                    resultCount = 0;
                }
            } while (resultCount && resultCount === requestParams.maxResults);
            return issues;
        });
    }
    runConnectionTest() {
        return this.makeRequest('myself');
    }
    getIssueHierarchy() {
        return this.makeRequest('issue/createmeta');
    }
    getIssueTypes() {
        return this.makeRequest('issuetype');
    }
    getUnresolvedEpicsForProject(projectId, epicTypeId) {
        return this.getAllIssues({
            jql: `project = ${projectId} AND issuetype = ${epicTypeId} AND resolution = Unresolved`
        });
    }
    getEpicsForProject(projectId, epicTypeId, formattedStartDate, formattedEndDate) {
        return this.getAllIssues({
            jql: `project = ${projectId} AND issuetype = ${epicTypeId} AND
      updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
        });
    }
    getIssuesForEpic(epicKey, issueTypes, formattedStartDate, formattedEndDate) {
        return this.getAllIssues({
            jql: `"Epic Link" = ${epicKey} AND
        issuetype IN (${issueTypes.join(',')}) AND
        updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
        });
    }
    getIssue(issueId) {
        return this.makeRequest(`issue/${issueId}`);
    }
    getComments(issueId) {
        return this.makeRequest(`issue/${issueId}/comment`);
    }
    getUser(username) {
        return this.makeRequest('user', { username: username });
    }
}
__decorate([
    rate_limit_1.default(200)
], JiraAdapter.prototype, "makeRequest", null);
exports.default = JiraAdapter;
//# sourceMappingURL=index.js.map