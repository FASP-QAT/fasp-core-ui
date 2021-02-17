import moment, { months } from 'moment';

export default function getProblemCriticality(criticalityId) {
    // var criticalityJson = {};
    if (criticalityId == 3) {
        var criticalityJson = {
            id: 3,
            label: {
                createdBy: null,
                createdDate: null,
                lastModifiedBy: null,
                lastModifiedDate: null,
                active: true,
                labelId: 460,
                label_en: "High",
                label_sp: null,
                label_fr: null,
                label_pr: null
            },
            colorHtmlCode: "FF3333"
        }
        return criticalityJson;
    } else if (criticalityId == 2) {
        var criticalityJson = {
            id: 2,
            label: {
                createdBy: null,
                createdDate: null,
                lastModifiedBy: null,
                lastModifiedDate: null,
                active: true,
                labelId: 459,
                label_en: "Medium",
                label_sp: null,
                label_fr: null,
                label_pr: null
            },
            colorHtmlCode: "FF9333"
        }
        return criticalityJson;
    } else if (criticalityId == 1) {

        var criticalityJson = {
            id: 1,
            label: {
                createdBy: null,
                createdDate: null,
                lastModifiedBy: null,
                lastModifiedDate: null,
                active: true,
                labelId: 458,
                label_en: "Low",
                label_sp: null,
                label_fr: null,
                label_pr: null
            },
            colorHtmlCode: "FFF633"
        }
        return criticalityJson;
    }


}