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

    getProcurementUnitForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/procurementUnit/${lastSyncDate}`, {
        });
    }

    getPlanningUnitForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/planningUnit/${lastSyncDate}`, {
        });
    }

    getForecastingUnitForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/forecastingUnit/${lastSyncDate}`, {
        });
    }

    getRealmCountryPlanningUnitForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/realmCountryPlanningUnit/${lastSyncDate}`, {
        });
    }

    getProgramPlanningUnitForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/programPlanningUnit/${lastSyncDate}`, {
        });
    }

    getProcurementAgentPlanningUnitForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/procurementAgent/planningUnit/${lastSyncDate}`, {
        });
    }

    getProcurementAgentProcurementUnitForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/procurementAgent/procurementUnit/${lastSyncDate}`, {
        });
    }

    getShipmentStatusForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/shipmentStatus/${lastSyncDate}`, {
        });
    }

    getProblemListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/problem/lastSyncDate/${lastSyncDate}`, {
        });
    }

    getProblemStatusListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/problemStatus/${lastSyncDate}`, {
        });
    }

    getProblemCategoryForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/problemCategory/${lastSyncDate}`, {
        });
    }

    syncProgram(programId, versionId, userId, lastSyncDate) {
        console.log("In service")
        return axios.get(`${API_URL}/api/programData/shipmentSync/programId/${programId}/versionId/${versionId}/userId/${userId}/lastSyncDate/${lastSyncDate}`, {
        });
    }

    getSyncAllMasters(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/allMasters/${lastSyncDate}`, {
        });
    }

    getSyncAllMastersForProgram(lastSyncDate, programIds) {
        return axios.post(`${API_URL}/api/sync/allMasters/forPrograms/${lastSyncDate}/`, programIds, {
        });
    }

}
export default new MasterSyncService()