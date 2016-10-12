import Adapter from '../base/Adapter';
import url from 'url';
import request from 'request';

export default class JiraAdapter extends Adapter {
}

JiraAdapter.prototype.makeRequest = async (path) => {
  this.protocol = 'https';
  this.hostname = 'crosslead.atlassian.net';
  this.apiVersion = 2;
  this.port = null;
  this.username = 'michelle.shu@crosslead.com';
  this.password = 'gmaSAtN*CL13';

  const uri = url.format({
    protocol: this.protocol,
    hostname: this.hostname,
    port: this.port,
    pathname: 'rest/api/' + this.apiVersion + path
  });

  const options = {
    rejectUnauthorized: true,
    uri: uri,
    method: 'GET',
    auth: {
      user: this.username,
      pass: this.password
    }
  };

  return request(options);
};

JiraAdapter.prototype.getIssueHierarchy = async () => {
  const result = await this.makeRequest('issue/createmeta');
  console.log(result);
  return result;
};
