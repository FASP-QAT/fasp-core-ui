import axios from "axios"
import { API_URL } from '../Constants.js'

class MasterSyncService {
    
    getLanguageListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/language/${lastSyncDate}`, {
        });
    }

    getCountryListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/country/${lastSyncDate}`, {
        });
    }

    getBudgetListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/budget/${lastSyncDate}`, {
        });
    }

    getCurrencyListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/currency/${lastSyncDate}`, {
        });
    }

    getUnitListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/unit/${lastSyncDate}`, {
        });
    }

    getOrganisationListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/organisation/${lastSyncDate}`, {
        });
    }

    getProcurementAgentListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/procurementAgent/${lastSyncDate}`, {
        });
    }
    getHealthAreaListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/healthArea/${lastSyncDate}`, {
        });
    }

    getRegionListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/region/${lastSyncDate}`, {
        });
    }

    getFundingSourceListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/fundingSource/${lastSyncDate}`, {
        });
    }
    getSubFundingSourceListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/subFundingSource/${lastSyncDate}`, {
        });
    }

    getSupplierListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/supplier/${lastSyncDate}`, {
        });
    }

    getTracerCategoryListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/tracerCategory/${lastSyncDate}`, {
        });
    }

    getProductCategoryListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/productCategory/${lastSyncDate}`, {
        });
    }

    getProgramListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/program/${lastSyncDate}`, {
        });
    }

    getRealmCountryListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/realmCountry/${lastSyncDate}`, {
        });
    }

    getRealmListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/realm/${lastSyncDate}`, {
        });
    }

    getDataSourceListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/dataSource/${lastSyncDate}`, {
        });
    }

    getDimensionListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/dimension/${lastSyncDate}`, {
        });
    }

    getDataSourceTypeListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/dataSourceType/${lastSyncDate}`, {
        });
    }


}
export default new MasterSyncService()