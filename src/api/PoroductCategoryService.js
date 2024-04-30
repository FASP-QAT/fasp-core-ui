import axios from "axios";
import { API_URL } from '../Constants.js';
class ProductCategoryService {
    getProductCategoryListByRealmId(json) {
        return axios.get(`${API_URL}/api/productCategory/realmId/${json}`, {}
        );
    }
    addProductCategory(json) {
        return axios.put(`${API_URL}/api/productCategory`, json, {}
        );
    }
}
export default new ProductCategoryService();