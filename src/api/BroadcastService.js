import axios from "axios";
import { API_URL } from '../Constants.js';

class BroadcastService {

    getCategories() {
        return axios.get(`${API_URL}/api/broadcast/categories`, {});
    }

    getRecipientCount(json) {
        return axios.post(`${API_URL}/api/broadcast/recipientCount`, json, {});
    }

    sendBroadcast(json) {
        return axios.post(`${API_URL}/api/broadcast/send`, json, {});
    }

    saveDraft(json) {
        return axios.post(`${API_URL}/api/broadcast/draft`, json, {});
    }

    getRecipientsByBroadcastId(broadcastId) {
        return axios.get(`${API_URL}/api/broadcast/${broadcastId}/recipients`, {});
    }

    getBroadcastHistory() {
        return axios.get(`${API_URL}/api/broadcast/history`, {});
    }

    getPreferencesByToken(token) {
        return axios.get(`${API_URL}/api/public/unsubscribe/preferences?token=${token}`, {});
    }

    unsubscribeByToken(json) {
        return axios.post(`${API_URL}/api/public/unsubscribe`, json, {});
    }

}

export default new BroadcastService();
