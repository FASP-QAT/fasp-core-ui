import axios from "axios";
import { API_URL, ASSIGNEE_ID_FOR_BUG_ISSUE, ASSIGNEE_ID_FOR_CHANGE_REQUEST, ASSIGNEE_ID_FOR_NON_BUG_ISSUE, JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_MASTER_DATA, JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_USER, JIRA_PROJECT_ISSUE_TYPE_BUG_REPORT, JIRA_PROJECT_ISSUE_TYPE_CHANGE_REQUEST, JIRA_PROJECT_KEY, JIRA_SUBJECT_PREFIX_DEMO, JIRA_SUBJECT_PREFIX_UAT } from "../Constants";
class JiraTicketService {
    addBugReportIssue(json) {
        var mainObject = new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        var reporter = new Object();
        var assignee = new Object();
        var priority = new Object();
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_BUG_REPORT}`;
        assignee.id = `${ASSIGNEE_ID_FOR_BUG_ISSUE}`;
        //To set Ticket priority
        if(json.priority == 1) {
            json.priority = 'Highest';//Replacing no. with actual priority string
            priority.name = 'Highest';
        } else if(json.priority == 2) {
            json.priority = 'High';
            priority.name = 'High';
        } else if(json.priority == 3) {
            json.priority = 'Medium';
            priority.name = 'Medium';
        } else if(json.priority == 4) {
            json.priority = 'Low';
            priority.name = 'Low';
        } else {
            json.priority = 'Lowest';
            priority.name = 'Lowest';
        }

        if ((`${API_URL}`).includes('uat-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_UAT}` + json.summary;
        } else if ((`${API_URL}`).includes('demo-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_DEMO}` + json.summary;
        } else {
            fields.summary = json.summary;
        }
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;
        fields.reporter = reporter;
        fields.assignee = assignee;
        fields.priority = priority;
        mainObject.fields = fields;
        return axios.post(`${API_URL}/api/ticket/addIssue`, mainObject, {}
        );
    }
    addEmailRequestIssue(json) {
        var mainObject = new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();var priority = new Object();
        var reporter = new Object();
        var assignee = new Object();
        var priority = new Object();
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_MASTER_DATA}`;
        assignee.id = `${ASSIGNEE_ID_FOR_NON_BUG_ISSUE}`;

        //To set Ticket priority
        if(json.priority == 1) {
            json.priority = 'Highest';//Replacing no. with actual priority string
            priority.name = 'Highest';
        } else if(json.priority == 2) {
            json.priority = 'High';
            priority.name = 'High';
        } else if(json.priority == 3) {
            json.priority = 'Medium';
            priority.name = 'Medium';
        } else if(json.priority == 4) {
            json.priority = 'Low';
            priority.name = 'Low';
        } else {
            json.priority = 'Lowest';
            priority.name = 'Lowest';
        }

        if ((`${API_URL}`).includes('uat-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_UAT}` + json.summary;
        } else if ((`${API_URL}`).includes('demo-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_DEMO}` + json.summary;
        } else {
            fields.summary = json.summary;
        }
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;
        fields.reporter = reporter;
        fields.assignee = assignee;
        fields.priority = priority;
        mainObject.fields = fields;
        return axios.post(`${API_URL}/api/ticket/addIssue`, mainObject, {}
        );
    }
    addUpdateUserRequest(json) {
        var mainObject = new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        var reporter = new Object();
        var assignee = new Object();
        var priority = new Object();
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_USER}`;
        assignee.id = `${ASSIGNEE_ID_FOR_NON_BUG_ISSUE}`;

        //To set Ticket priority
        if(json.priority == 1) {
            json.priority = 'Highest';//Replacing no. with actual priority string
            priority.name = 'Highest';
        } else if(json.priority == 2) {
            json.priority = 'High';
            priority.name = 'High';
        } else if(json.priority == 3) {
            json.priority = 'Medium';
            priority.name = 'Medium';
        } else if(json.priority == 4) {
            json.priority = 'Low';
            priority.name = 'Low';
        } else {
            json.priority = 'Lowest';
            priority.name = 'Lowest';
        }

        if ((`${API_URL}`).includes('uat-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_UAT}` + json.summary;
        } else if ((`${API_URL}`).includes('demo-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_DEMO}` + json.summary;
        } else {
            fields.summary = json.summary;
        }
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;
        fields.reporter = reporter;
        fields.customfield_10063 = json.realm;
        fields.assignee = assignee;
        fields.priority = priority;
        mainObject.fields = fields;
        return axios.post(`${API_URL}/api/ticket/addIssue`, mainObject, {}
        );
    }
    addIssueAttachment(json, issueId) {
        if (issueId != '') {
            let formData = new FormData();
            formData.append("file", json.file);
            return axios.post(`${API_URL}/api/ticket/addIssueAttachment/${issueId}`, formData, { headers: { "Content-Type": "multipart/form-data", } }
            );
        }
    }
    addChangeRequest(json) {
        var mainObject = new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        var reporter = new Object();
        var assignee = new Object();
        var priority = new Object();
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_CHANGE_REQUEST}`;
        assignee.id = `${ASSIGNEE_ID_FOR_CHANGE_REQUEST}`;

        //To set Ticket priority
        if(json.priority == 1) {
            json.priority = 'Highest';//Replacing no. with actual priority string
            priority.name = 'Highest';
        } else if(json.priority == 2) {
            json.priority = 'High';
            priority.name = 'High';
        } else if(json.priority == 3) {
            json.priority = 'Medium';
            priority.name = 'Medium';
        } else if(json.priority == 4) {
            json.priority = 'Low';
            priority.name = 'Low';
        } else {
            json.priority = 'Lowest';
            priority.name = 'Lowest';
        }

        if ((`${API_URL}`).includes('uat-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_UAT}` + json.summary;
        } else if ((`${API_URL}`).includes('demo-api.')) {
            fields.summary = `${JIRA_SUBJECT_PREFIX_DEMO}` + json.summary;
        } else {
            fields.summary = json.summary;
        }
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;
        fields.reporter = reporter;
        fields.assignee = assignee;
        fields.priority = priority;
        mainObject.fields = fields;
        return axios.post(`${API_URL}/api/ticket/addIssue`, mainObject, {}
        );
    }

    getDataInFormat(json) {
        json.createdDate = new Date();
        var str = JSON.stringify(json);
        var formatStr = "";
        var dataKey;
        var dataValue;
        for (var key in json) {
            dataKey = key;
            dataValue = json[key];
            formatStr = formatStr.concat(dataKey.charAt(0).toUpperCase()).concat(dataKey.slice(1)).concat(" = ").concat(dataValue).concat("\n");
        }
        return formatStr;
    }
}
export default new JiraTicketService()