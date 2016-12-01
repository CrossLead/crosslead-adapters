import Adapter from '../base/Adapter';
import moment from 'moment';
import url from 'url';
import request from 'request';
import rateLimit from '../../utils/rate-limit';

export default class JiraAdapter extends Adapter {
  constructor() {
    super();
    this.apiVersion = 2;
  }

  init() {}

  /**
   * Rate limit api requests to once per second
   */
  @rateLimit(200)
  makeRequest(path, query) {
    const uri = url.format({
      protocol: this.credentials.protocol || 'https',
      hostname: this.credentials.host,
      port: this.credentials.port,
      pathname: 'rest/api/' + this.apiVersion + '/' + path
    });

    const authorizationString = new Buffer(
      this.credentials.username + ':' + this.credentials.password
    ).toString('base64');

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

  async getAllIssues(params) {
    const requestParams = params || {};
    requestParams.startAt = 0;
    requestParams.maxResults = 50;

    let resultCount,
        issues = [];
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

  getUnresolvedEpicsForProject(projectId) {
    return this.getAllIssues({
      jql: `project = ${projectId} AND issuetype = Epic AND resolution = Unresolved`
    });
  }

  getEpicsForProject(projectId, startDate, endDate) {
    const formattedStartDate = moment(startDate).format('YYYY/MM/DD HH:mm'),
          formattedEndDate = moment(endDate).format('YYYY/MM/DD HH:mm');

    return this.getAllIssues({
      jql: `project = ${projectId} AND issuetype = Epic AND
      updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getIssuesForEpic(epicId, issueTypes, startDate, endDate) {
    const formattedStartDate = moment(startDate).format('YYYY/MM/DD HH:mm'),
          formattedEndDate = moment(endDate).format('YYYY/MM/DD HH:mm');

    return this.getAllIssues({
      jql: `("Epic Link" = ${epicId} OR parent IN tempoEpicIssues(${epicId})) AND
        issuetype IN (${issueTypes.join(',')}) AND
        updatedDate >= "${formattedStartDate}" AND updatedDate <= "${formattedEndDate}"`
    });
  }

  getComments(issueId) {
    return this.makeRequest(`issue/${issueId}/comment`);
  }

  getUser(username) {
    return this.makeRequest('user', { username: username });
  }
}
