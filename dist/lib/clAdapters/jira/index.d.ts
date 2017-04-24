import Adapter from '../base/Adapter';
import * as request from 'request';
export declare type JiraCredentials = {
    username: string;
    password: string;
    host: string;
    protocol: string;
    port: string;
};
export interface JiraRequestOpts extends request.CoreOptions {
    uri: string;
}
export interface JiraAdapterRequestResult {
    code: 200 | 500;
    message: string;
    data: any;
    success: boolean;
}
export default class JiraAdapter extends Adapter {
    credentials: JiraCredentials;
    sensitiveCredentialsFields: (keyof JiraCredentials)[];
    apiVersion: number;
    init(): Promise<void>;
    getFieldData(): Promise<void>;
    /**
     * Rate limit api requests to once per second
     */
    makeRequest(path: string, query?: any): Promise<JiraAdapterRequestResult>;
    getAllIssues(params: any): Promise<any[]>;
    runConnectionTest(): Promise<JiraAdapterRequestResult>;
    getIssueHierarchy(): Promise<JiraAdapterRequestResult>;
    getIssueTypes(): Promise<JiraAdapterRequestResult>;
    getUnresolvedEpicsForProject(projectId: string, epicTypeId: string): Promise<any[]>;
    getUnresolvedEpicsForProjects(projectIds: string[], epicTypeId: string): Promise<any[]>;
    getEpicsForProject(projectId: string, epicTypeId: string, formattedStartDate: string, formattedEndDate: string): Promise<any[]>;
    getEpicsForProjects(projectIds: string[], epicTypeId: string, formattedStartDate: string, formattedEndDate: string): Promise<any[]>;
    getIssuesForEpic(epicKey: string, issueTypes: string[], formattedStartDate: string, formattedEndDate: string): Promise<any[]>;
    getIssuesForEpics(epicKeys: string[], issueTypes: string[], formattedStartDate: string, formattedEndDate: string): Promise<any[]>;
    getIssue(issueId: string): Promise<JiraAdapterRequestResult>;
    getComments(issueId: string): Promise<JiraAdapterRequestResult>;
    getUser(username: string): Promise<JiraAdapterRequestResult>;
}
