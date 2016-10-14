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
}

JiraAdapter.prototype.makeRequest = function(path) {
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

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject({
          code: response.statusCode,
          message: error,
          data: body,
          success: false
        });
      } else {
        resolve({
          code: response.statusCode,
          data: body,
          success: true
        });
      }
    });
  });
};

JiraAdapter.prototype.getIssueHierarchy = async function() {
  return await this.makeRequest('issue/createmeta');
};

JiraAdapter.prototype.runConnectionTest = async function() {
  const testResult = await this.makeRequest('myself');
  if (testResult.code === 401) {
    testResult.errorMessage = 'Failed to authorize user.';
    testResult.success = false;
  }
  return testResult;
};
