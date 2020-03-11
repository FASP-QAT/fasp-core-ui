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

    getOrganisationListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getOrganisationListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getHealthAreaListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getHealthAreaListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getRegionListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getRegionListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getFundingSourceListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getFundingSourceListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }
    getSubFundingSourceListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getSubFundingSourceListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getProductListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getProductListForSync?lastSyncDate=${lastSyncDate}`, {
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

    getPlanningUnitListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getPlanningUnitListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getLogisticsUnitListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getLogisticsUnitListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }

    getManufacturerListForSync(lastSyncDate) {
        var lastSyncDate;
        if (lastSyncDate == null) {
            lastSyncDate = null
        } else {
            lastSyncDate = lastSyncDate.lastSyncDate
        }
        return axios.get(`${API_URL}/api/getManufacturerListForSync?lastSyncDate=${lastSyncDate}`, {
        });
    }


}
export default new MasterSyncService()