import moment, { months } from 'moment';

export default function createProcurementScheduleProblems(programObj, versionID, problemObj, planningUnitObj, shipmentId, newAddShipment, problemActionIndex, userId, username, problemActionList, shipmentDetailsJson,openProblemStatusObj) {
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
        data5: JSON.stringify(shipmentDetailsJson),
        planningUnitActive: true,
        // regionActive: true,
        newAdded: newAddShipment,
        problemActionIndex: problemActionIndex,
        index: 0,
        problemCategory: problemObj.problem.problemCategory,
        problemStatus: openProblemStatusObj,
        problemType: problemObj.problemType,
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
                problemStatus: openProblemStatusObj,
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