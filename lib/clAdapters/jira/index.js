import Adapter from '../base/Adapter';
import url from 'url';
import request from 'request';

export default class JiraAdapter extends Adapter {
  constructor() {
    super();
    this.apiVersion = 2;
  }

  init() {
  }

  makeRequest(path, query) {
    const uri = url.format({
      protocol: this.credentials.protocol || 'https',
      hostname: this.credentials.host,
      port: this.credentials.port,
      pathname: 'rest/api/' + this.apiVersion + '/' + path
    });

    const authorizationString = new Buffer(this.credentials.username + ':' + this.credentials.password).toString('base64');

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
        let success = response && response.statusCode < 400;

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
          message: errorMessage || error,
          data: body,
          success: success
        });
      });
    });
  }

  async getAllIssues(requestPath, params) {
    const requestParams = params || {};
    requestParams.startAt = 0;
    requestParams.maxResults = 50;

    let resultCount,
        issues = [];
    do {
      const result = await this.makeRequest(requestPath, requestParams),
            data = JSON.parse(result.data);

      if (data.issues && data.issues.length) {
        resultCount = data.issues.length;
        issues = issues.concat(data.issues);
        requestParams.startAt += resultCount;
      } else {
        resultCount = 0;
      }
    } while (resultCount && resultCount === requestParams.maxResults);

    return issues;
  }

  async runConnectionTest() {
    return await this.makeRequest('myself');
  }

  async getIssueHierarchy() {
    return await this.makeRequest('issue/createmeta');
  }

  async getUnresolvedEpicsForProject(projectId) {
    return await this.getAllIssues('search', {
      jql: 'project=' + projectId + ' AND issuetype=Epic AND resolution=Unresolved'
    });
  }
}
