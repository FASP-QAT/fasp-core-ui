import axios from "axios";
import { API_URL, JIRA_PROJECT_ISSUE_TYPE_BUG_REPORT, JIRA_PROJECT_KEY, JIRA_PROJECT_ISSUE_TYPE_EMAIL_REQUEST, JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_MASTER_DATA, JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_USER, ASSIGNEE_ID_FOR_BUG_ISSUE, ASSIGNEE_ID_FOR_NON_BUG_ISSUE, JIRA_PROJECT_ISSUE_TYPE_CHANGE_REQUEST, ASSIGNEE_ID_FOR_CHANGE_REQUEST } from "../Constants";
import AuthenticationService from "../views/Common/AuthenticationService";


class JiraTicketService {
    
    addBugReportIssue(json) {  
        
        var mainObject =  new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        var reporter = new Object();
        var assignee = new Object();
        // var requestParticipants = [];
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_BUG_REPORT}`;        
        assignee.id = `${ASSIGNEE_ID_FOR_BUG_ISSUE}`;
        // requestParticipants.push(`${PARTICIPANT_ID_FOR_BUG_ISSUE}`);

        fields.summary = json.summary;
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;        
        fields.reporter = reporter;
        fields.assignee = assignee;
        // fields.requestParticipants = requestParticipants;
        mainObject.fields = fields;
        console.log(mainObject);
        return axios.post(`${API_URL}/api/jira/addIssue`, mainObject, {}
        );
    }

    //Add or Update Master Data
    addEmailRequestIssue(json) {
        
        var mainObject =  new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        var reporter = new Object();
        var assignee = new Object();
        // var requestParticipants = [];
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_MASTER_DATA}`;        
        assignee.id = `${ASSIGNEE_ID_FOR_NON_BUG_ISSUE}`;
        // requestParticipants.push(`${PARTICIPANT_ID_FOR_NON_BUG_ISSUE}`);

        fields.summary = json.summary;
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;        
        fields.reporter = reporter;
        fields.assignee = assignee; 
        // fields.requestParticipants = requestParticipants;
        mainObject.fields = fields;
        
        console.log(mainObject);
        return axios.post(`${API_URL}/api/jira/addIssue`, mainObject, {}
        );
    }

    //Add or Update User
    addUpdateUserRequest(json) {
        
        var mainObject =  new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        var reporter = new Object();
        var assignee = new Object();
        // var requestParticipants = [];
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_ADD_UPDATE_USER}`;   
        assignee.id = `${ASSIGNEE_ID_FOR_NON_BUG_ISSUE}`;     
        // requestParticipants.push(`${PARTICIPANT_ID_FOR_NON_BUG_ISSUE}`);

        fields.summary = json.summary;
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;
        fields.reporter = reporter;
        fields.customfield_10063 = json.realm;   
        fields.assignee = assignee;     
        // fields.requestParticipants = requestParticipants;
        mainObject.fields = fields;
        
        console.log(mainObject);
        return axios.post(`${API_URL}/api/jira/addIssue`, mainObject, {}
        );
    }

    addIssueAttachment(json, issueId) {
        if(issueId != '') {                        
            let formData = new FormData();
            formData.append("file", json.file);
            return axios.post(`${API_URL}/api/jira/addIssueAttachment/${issueId}`, formData, {headers : { "Content-Type": "multipart/form-data",}}
            );
        }
    }

    addChangeRequest(json) {  
        
        var mainObject =  new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        var reporter = new Object();
        var assignee = new Object();
        // var requestParticipants = [];
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_CHANGE_REQUEST}`;        
        assignee.id = `${ASSIGNEE_ID_FOR_CHANGE_REQUEST}`;
        // requestParticipants.push(`${PARTICIPANT_ID_FOR_BUG_ISSUE}`);

        fields.summary = json.summary;
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;        
        fields.reporter = reporter;
        fields.assignee = assignee;
        // fields.requestParticipants = requestParticipants;
        mainObject.fields = fields;
        console.log(mainObject);
        return axios.post(`${API_URL}/api/jira/addIssue`, mainObject, {}
        );
    }


    getDataInFormat(json) {
        json.createdDate = new Date();
        var str = JSON.stringify(json);        
        var formatStr = ""; 
        var dataKey;
        var dataValue;
        for(var key in json) {            
            dataKey = key;
            dataValue = json[key];
            formatStr = formatStr.concat(dataKey.charAt(0).toUpperCase()).concat(dataKey.slice(1)).concat(" = ").concat(dataValue).concat("\n");
         }       
         console.log("Format String :",formatStr);
        return formatStr;
    }
    
}
export default new JiraTicketService()