import moment from 'moment';
/**
 * This function component is used to create the json for procurement schedule problems
 * @param {*} programObj This is the program obj
 * @param {*} versionID This is version Id for which this problem has to be builf
 * @param {*} problemObj This is problem obj with details of problem
 * @param {*} regionObj This is the region object with details of region for which the problem is being created
 * @param {*} planningUnitObj This is the planning unit object with details of planning unit for which the problem is being created
 * @param {*} causeJson This is json for the reason on why this problem is created
 * @param {*} problemActionIndex This is index of the problem
 * @param {*} userId This is the user Id who is the created by of the problem
 * @param {*} username This is the username who is the created by of the problem
 * @param {*} problemActionList This is the list of all the existing problems
 * @param {*} openProblemStatusObj This is the Open problem status obj with details of open status
 */
export default function createProcurementScheduleProblems(programObj, versionID, problemObj, planningUnitObj, shipmentId, tempShipmentId, newAddShipment, problemActionIndex, userId, username, problemActionList, shipmentDetailsJson, openProblemStatusObj) {
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
        tempShipmentId: tempShipmentId,
        data5: JSON.stringify(shipmentDetailsJson),
        planningUnitActive: true,
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