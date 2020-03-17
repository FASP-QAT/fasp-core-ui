import axios from "axios";
import { API_URL } from '../Constants.js';


class ProductService {

    addProduct(json) {
        return axios.post(`${API_URL}/api/product/`, json ,{}
        );
    }

    getProductList() {
        return axios.get(`${API_URL}/api/product/`, {
        });
    }

    editProduct(json) {
        console.log("----json",json);
        return axios.put(`${API_URL}/api/product/`, json, {}
        );
    }


}
export default new ProductService();