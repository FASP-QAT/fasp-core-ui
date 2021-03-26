import moment, { months } from 'moment';

export default function createDataQualityProblems(programObj, versionID, problemObj, regionObj, planningUnitObj,causeJson, problemActionIndex, userId, username,problemActionList) {

    var json = {
        problemReportId: 0,
        program: {
            id: programObj.programId,
            label: programObj.label,
            code: programObj.programCode
        },
        versionId: versionID,
        realmProblem: problemObj,

        dt: moment(Date.now()).utcOffset('-0500').format("YYYY-MM-DD"),
        region: {
            id: regionObj.regionId,
            label: regionObj.label
        },
        planningUnit: {
            id: planningUnitObj.planningUnit.id,
            label: planningUnitObj.planningUnit.label,

        },
        shipmentId: '',
        data5:JSON.stringify(causeJson),
        planningUnitActive: true,
        newAdded: false,

        problemActionIndex: problemActionIndex,

        problemCategory: {
            id: 1,
            label: { label_en: 'Data Quality' }
        },
        problemStatus: {
            id: 1,
            label: { label_en: 'Open' }
        },
        problemType: {
            id: 1,
            label: {
                label_en: 'Automatic'
            }
        },
        reviewed: false,
        reviewNotes: '',
        reviewedDate: '',
        createdBy: {
            userId: userId,
            username: username
        },
        createdDate: moment(Date.now()).utcOffset('-0500').format("YYYY-MM-DD HH:mm:ss"),
        lastModifiedBy: {
            userId: userId,
            username: username
        },
        lastModifiedDate: moment(Date.now()).utcOffset('-0500').format("YYYY-MM-DD HH:mm:ss"),
        problemTransList: [
            {
                problemReportTransId: '',
                problemStatus: {
                    id: 1,
                    label: {
                        active: true,
                        labelId: 461,
                        label_en: "Open",
                        label_sp: null,
                        label_fr: null,
                        label_pr: null
                    }
                },
                notes: "",
                reviewed: false,
                createdBy: {
                    userId: userId,
                    username: username
                },
                createdDate: moment(Date.now()).utcOffset('-0500').format("YYYY-MM-DD HH:mm:ss")
            }
        ]
    }
    problemActionList.push(json);
    // problemActionIndex++;

}