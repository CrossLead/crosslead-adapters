import Adapter from '../base/Adapter';
import * as moment from 'moment';
import * as url from 'url';
import * as request from 'request';
import rateLimit from '../../utils/rate-limit';

export type JiraCredentials = {
  username: string;
  email: string;
  password: string;
  host: string;
  protocol: string;
  port: string;
};

export interface JiraRequestOpts extends request.CoreOptions {
  uri: string;
}

export interface JiraAdapterRequestResult {
  err: string;
  data: any;
  success: boolean;
};


export default class JiraAdapter extends Adapter {
  credentials: JiraCredentials = {
    username: '',
    email: '',
    password: '',
    host: '',
    protocol: '',
    port: ''
  };
  sensitiveCredentialsFields: (keyof JiraCredentials)[] = ['password'];

  apiVersion = 2;

  async init() {}

  async getFieldData() {
    throw new Error('JIRA adapters currently do not support `getFieldData()`');
  }

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

    return new Promise<JiraAdapterRequestResult>( resolve => {
      request(options, (error, response, data) => {
        let errorMessage = null;
        const success = !error &&
              (response &&
               (typeof response.statusCode !== 'undefined') &&
               response.statusCode < 400);
        if (error && error.code === 'ECONNREFUSED') {
          errorMessage = 'Failed to connect to JIRA';
        }
        if (response && response.statusCode === 401) {
          errorMessage = 'Failed to authorize JIRA adapter';
        }
        const err = errorMessage ? new Error(errorMessage) : error;
        resolve({success, err, data});
      });
    })
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

  getIssueTypes() {
    return this.makeRequest('issuetype');
  }

  getUnresolvedEpicsForProject(projectId: string, epicTypeId: string) {
    return this.getAllIssues({
      jql: `project = ${projectId} AND issuetype = ${epicTypeId} AND resolution = Unresolved`
    });
  }

  getUnresolvedEpicsForProjects(projectIds: string[], epicTypeId: string) {
    return this.getAllIssues({
      jql: `project IN (${projectIds.join(',')}) AND issuetype = ${epicTypeId} AND resolution = Unresolved`
    });
  }

  getEpicsForProject(projectId: string, epicTypeId: string, formattedStartDate: string, formattedEndDate: string) {
    return this.getAllIssues({
      jql: `project = ${projectId} AND issuetype = ${epicTypeId} AND
      updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getEpicsForProjects(projectIds: string[], epicTypeId: string, formattedStartDate: string, formattedEndDate: string) {
    return this.getAllIssues({
      jql: `project IN (${projectIds.join(',')}) AND issuetype = ${epicTypeId} AND
      updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getIssuesForEpic(epicKey: string, issueTypes: string[], formattedStartDate: string, formattedEndDate: string) {
    return this.getAllIssues({
      jql: `"Epic Link" = ${epicKey} AND
        issuetype IN (${issueTypes.join(',')}) AND
        updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getIssuesForEpics(epicKeys: string[], issueTypes: string[], formattedStartDate: string, formattedEndDate: string) {
    return this.getAllIssues({
      jql: `"Epic Link" IN (${epicKeys.join(',')}) AND
        issuetype IN (${issueTypes.join(',')}) AND
        updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getUnlinkedProjectIssues(projectIds: string[], issueTypes: string[], formattedStartDate: string, formattedEndDate: string) {
    return this.getAllIssues({
      jql: `"Epic Link" is EMPTY AND project IN (${projectIds.join(',')}) AND issuetype IN (${issueTypes.join(',')}) AND resolution = Unresolved and updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
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
