import moment, { months } from 'moment';

export default function createProcurementScheduleProblems(programObj,versionID,problemObj,planningUnitObj,shipmentId,newAddShipment,problemActionIndex,userId,username,problemActionList){
    var json = {
        problemReportId: 0,
        program: {
            id: programObj.programId,
            label: programObj.label,
            code: programObj.programCode
        },
        versionId: versionID,
        realmProblem: problemObj,
        dt: '',
        region: {
            id: 0
        },
        planningUnit: {
            id: planningUnitObj.planningUnit.id,
            label: planningUnitObj.planningUnit.label,

        },
        shipmentId: shipmentId,
        data5: '',
        planningUnitActive: true,
        newAdded: newAddShipment,
        problemActionIndex: problemActionIndex,
        index: 0,
        problemCategory: {
            id: 2,
            label: { label_en: 'Procurement Schedule' }
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
}