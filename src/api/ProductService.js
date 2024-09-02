import axios from "axios";
import { API_URL } from '../Constants.js';
class ProductService {
    getProductCategoryList(realmId) {
        return axios.get(`${API_URL}/api/productCategory/realmId/${realmId}`, {}
        );
    }
    getConsumptionData(inputjson) {
        return axios.post(`${API_URL}/api/report/consumptionForecastVsActual`, inputjson, {});
    }
    getStockStatusMatrixData(inputjson) {
        return axios.post(`${API_URL}/api/report/stockStatusMatrix`, inputjson, {}
        );
    }
    getProductCategoryListByProgram(realmId, programId) {
        return axios.get(`${API_URL}/api/productCategory/realmId/${realmId}/programId/${programId}`, {}
        );
    }
    getProductCategoryListForErpLinking(realmCountryId){
        return axios.get(`${API_URL}/api/erpLinking/productCategory/realmCountryId/${realmCountryId}`, {}
        );
    }
}
export default new ProductService();