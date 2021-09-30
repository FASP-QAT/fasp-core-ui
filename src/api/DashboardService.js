import axios from "axios";
import { API_URL } from '../Constants.js';

class DashboardService {

    applicationLevelDashboard() {
        return axios.get(`${API_URL}/api/applicationLevelDashboard/`, {}
        );
    }

    realmLevelDashboard(realmId) {
        realmId = 1;
        return axios.get(`${API_URL}/api/realmLevelDashboard/${realmId}`,{
        });
    }

    applicationLevelDashboardUserList() {
        return axios.get(`${API_URL}/api/applicationLevelDashboardUserList/`, {
        });
    }
    realmLevelDashboardUserList(realmId) {
        realmId = 1;
        console.log("realmId---"+realmId);
        return axios.get(`${API_URL}/api/realmLevelDashboardUserList/${realmId}`, {
        });
    }

    openIssues() {
        return axios.get(`${API_URL}/api/jira/openIssues/`, {
        });
    }
}
export default new DashboardService();