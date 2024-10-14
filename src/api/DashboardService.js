import axios from "axios";
import { API_URL } from '../Constants.js';
class DashboardService {
    applicationLevelDashboard() {
        return axios.get(`${API_URL}/api/dashboard/applicationLevel`, {}
        );
    }
    realmLevelDashboard(realmId) {
        realmId = 1;
        return axios.get(`${API_URL}/api/dashboard/realmLevel`, {
        });
    }
    applicationLevelDashboardUserList() {
        return axios.get(`${API_URL}/api/dashboard/applicationLevel/userList`, {
        });
    }
    realmLevelDashboardUserList() {
        return axios.get(`${API_URL}/api/dashboard/realmLevel/userList`, {
        });
    }
    openIssues() {
        return axios.get(`${API_URL}/api/ticket/openIssues`, {
        });
    }
    supplyPlanReviewerLevelDashboard() {
        return axios.get(`${API_URL}/api/dashboard/supplyPlanReviewerLevel`, {
        });
    }
    getDashboardTop() {
        return axios.get(`${API_URL}/api/dashboard/supplyPlanTop`, {
        });
    }
    getDashboardBottom(json) {
        return axios.post(`${API_URL}/api/dashboard/supplyPlanBottom`, json, {
        });
    }
}
export default new DashboardService();