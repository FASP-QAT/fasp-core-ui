import axios from "axios"
import { API_URL } from '../Constants.js'

class MasterSyncService {
    getLanguageListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getLanguageListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getCountryListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getCountryListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getCurrencyListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getCurrencyListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getUnitListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getUnitListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getUnitTypeList() {
        return axios.get(`${API_URL}/api/getUnitTypeListForSync`, {
        });
    }

    getOrganisationListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getOrganisationListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }

    getHealthAreaListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getHealthAreaListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }

    getRegionListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getRegionListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }

    getFundingSourceListForSync(lastSyncDate, realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getFundingSourceListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }
    getSubFundingSourceListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getSubFundingSourceListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }

    getProductListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getProductListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }

    getProductCategoryListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getProductCategoryListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getDataSourceListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getDataSourceListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getDataSourceTypeListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getDataSourceTypeListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getShipmentStatusListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getShipmentStatusListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getShipmentStatusAllowedListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getShipmentStatusAllowedListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getPlanningUnitListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getPlanningUnitListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }

    getLogisticsUnitListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getLogisticsUnitListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }

    getManufacturerListForSync(lastSyncDate,realmId) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        var realmId = parseInt(realmId);
        return axios.get(`${API_URL}/api/getManufacturerListForSync?lastSyncDate=${lastSyncDate}&realmId=${realmId}`, {
        });
    }


}
export default new MasterSyncService()