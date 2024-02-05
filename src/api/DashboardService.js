import axios from "axios";
import { API_URL } from '../Constants.js';
class DashboardService {
    applicationLevelDashboard() {
        return axios.get(`${API_URL}/api/applicationLevelDashboard`, {}
        );
    }
    realmLevelDashboard(realmId) {
        realmId = 1;
        return axios.get(`${API_URL}/api/realmLevelDashboard`, {
        });
    }
    applicationLevelDashboardUserList() {
        return axios.get(`${API_URL}/api/applicationLevelDashboardUserList`, {
        });
    }
    realmLevelDashboardUserList(realmId) {
        realmId = 1;
        return axios.get(`${API_URL}/api/realmLevelDashboardUserList`, {
        });
    }
    openIssues() {
        return axios.get(`${API_URL}/api/ticket/openIssues`, {
        });
    }
    supplyPlanReviewerLevelDashboard() {
        return axios.get(`${API_URL}/api/supplyPlanReviewerLevelDashboard`, {
        });
    }
}
export default new DashboardService();