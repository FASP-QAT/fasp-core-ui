import moment, { months } from 'moment';

export default function createSupplyPlanningProblems(programObj, versionID, problemObj, regionObj, planningUnitObj, causeJson, problemActionIndex, userId, username, problemActionList,openProblemStatusObj) {

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
        data5: JSON.stringify(causeJson),
        planningUnitActive: true,
        regionActive: true,
        newAdded: false,
        problemActionIndex: problemActionIndex,
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
                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
            }
        ]
    }
    problemActionList.push(json);
    // problemActionIndex++;

}