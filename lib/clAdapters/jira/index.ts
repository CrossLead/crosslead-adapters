import Adapter from '../base/Adapter';
import * as moment from 'moment';
import * as url from 'url';
import * as request from 'request';
import rateLimit from '../../utils/rate-limit';

export interface JiraRequestOpts extends request.CoreOptions {
  uri: string;
}

export interface JiraAdapterRequestResult {
  code: 200 | 500;
  message: string;
  data: any;
  success: boolean;
};


export default class JiraAdapter extends Adapter {

  apiVersion = 2;

  async init() {}

  /**
   * Rate limit api requests to once per second
   */
  @rateLimit(200)
  makeRequest(path: string, query?: any): Promise<JiraAdapterRequestResult> {
    const uri = url.format({
      protocol: this.credentials['protocol'] || 'https',
      hostname: this.credentials['host'],
      port: this.credentials['port'],
      pathname: 'rest/api/' + this.apiVersion + '/' + path
    });

    const authorizationString = new Buffer(
      this.credentials['username'] + ':' + this.credentials['password']
    ).toString('base64');





    const options: JiraRequestOpts = {
      uri: uri,
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + authorizationString
      }
    };

    if (query) {
      options.qs = query;
    }

    return new Promise<JiraAdapterRequestResult>((resolve) => {
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

  async getAllIssues(params: any) {
    const requestParams = params || {};
    requestParams.startAt = 0;
    requestParams.maxResults = 50;

    let resultCount,
        issues: any[] = [];
    do {
      const result = await this.makeRequest('search', requestParams),
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

  runConnectionTest() {
    return this.makeRequest('myself');
  }

  getIssueHierarchy() {
    return this.makeRequest('issue/createmeta');
  }

  getUnresolvedEpicsForProject(projectId: string) {
    return this.getAllIssues({
      jql: `project = ${projectId} AND issuetype = "Epic Story" AND resolution = Unresolved`
    });
  }

  getEpicsForProject(projectId: string, formattedStartDate: Date, formattedEndDate: Date) {
    return this.getAllIssues({
      jql: `project = ${projectId} AND issuetype = "Epic Story" AND
      updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getIssuesForEpic(epicId: string, issueTypes: string[], formattedStartDate: Date, formattedEndDate: Date) {
    return this.getAllIssues({
      jql: `"Epic Link" = ${epicId} AND
        issuetype IN (${issueTypes.join(',')}) AND
        updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getIssue(issueId: string) {
    return this.makeRequest(`issue/${issueId}`);
  }

  getComments(issueId: string) {
    return this.makeRequest(`issue/${issueId}/comment`);
  }

  getUser(username: string) {
    return this.makeRequest('user', { username: username });
  }
}
