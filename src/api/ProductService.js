import axios from "axios";
import { API_URL } from '../Constants.js';


class ProductService {

    addProduct(json) {
        return axios.post(`${API_URL}/api/product/`, json, {}
        );
    }

    getProductList() {
        return axios.get(`${API_URL}/api/product/`, {
        });
    }

    editProduct(json) {
        console.log("----json", json);
        return axios.put(`${API_URL}/api/product/`, json, {}
        );
    }

    getProdcutCategoryListByRealmId(json) {
        // /productCategory/realmId/{realmId}/list/{productCategoryId}/{includeCurrentLevel}/{includeAllChildren}
        return axios.get(`${API_URL}/api/productCategory/realmId/${json}/list/1/1/1`, {}
        );
    }
    getProductDataById(json) {
        return axios.get(`${API_URL}/api/product/${json}`, {}
        );

    }


}
export default new ProductService();