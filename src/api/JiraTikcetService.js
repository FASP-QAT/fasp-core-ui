import axios from "axios";
import { API_URL, JIRA_PROJECT_ISSUE_TYPE_BUG_REPORT, JIRA_PROJECT_KEY, JIRA_PROJECT_ISSUE_TYPE_EMAIL_REQUEST } from "../Constants";
import AuthenticationService from "../views/Common/AuthenticationService";


class JiraTicketService {
    
    addBugReportIssue(json) {        
        var mainObject =  new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_BUG_REPORT}`;

        fields.summary = json.summary;
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;
        mainObject.fields = fields;

        return axios.post(`${API_URL}/api/ticket/addIssue`, mainObject, {}
        );
    }

    addEmailRequestIssue(json) {
                
        var mainObject =  new Object();
        var fields = new Object();
        var project = new Object();
        var issuetype = new Object();
        project.key = `${JIRA_PROJECT_KEY}`;
        issuetype.name = `${JIRA_PROJECT_ISSUE_TYPE_EMAIL_REQUEST}`;

        fields.summary = json.summary;
        fields.description = this.getDataInFormat(json);
        fields.project = project;
        fields.issuetype = issuetype;
        mainObject.fields = fields;
        
        console.log(mainObject);
        return axios.post(`${API_URL}/api/ticket/addIssue`, mainObject, {}
        );
    }

    addIssueAttachment(json, issueId) {
        if(issueId != '') {                        
            let formData = new FormData();
            formData.append("file", json.file);
            return axios.post(`${API_URL}/api/ticket/addIssueAttachment/${issueId}`, formData, {headers : { "Content-Type": "multipart/form-data",}}
            );
        }
    }

    getDataInFormat(json) {
        json.createdBy = AuthenticationService.getLoggedInUsername();
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