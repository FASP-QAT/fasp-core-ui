import axios from "axios"
import { API_URL } from '../Constants.js'

class QuantimedImportService {
    
    importForecastData(json) {
        let programId = json.programId;
        if(programId != '') {                        
            let formData = new FormData();
            formData.append("file", json.file);
            return axios.post(`${API_URL}/api/quantimed/quantimedImport/${programId}`, formData, {headers : { "Content-Type": "multipart/form-data",}}
            );
        }
    }

    addImportedForecastData(json) {
        return axios.post(`${API_URL}/api/quantimed/addQuantimedImport`, json, {}
        );
    }

}
export default new QuantimedImportService()