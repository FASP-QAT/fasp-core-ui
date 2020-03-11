import axios from "axios";
class HealthAreaService {
    getRealmList() {
        return axios.get(`http://localhost:8080/FASP/api/getRealmList`, {
        });
    }
}
export default new HealthAreaService()