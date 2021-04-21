import moment, { months } from 'moment';

export default function incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj) {
    // console.log("000000=====>in ");
    var filterObj = problemActionList[index];
    var transList = filterObj.problemTransList;
    let tempProblemTransObj = {
        problemReportTransId: '',
        problemStatus: incomplianceProblemStatusObj,
        notes: '',
        reviewed: false,
        createdBy: {
            userId: userId,
            username: username
        },
        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
    }
    transList.push(tempProblemTransObj);
    filterObj.problemTransList = transList;
    filterObj.reviewed = false;
    var problemStatusObject = incomplianceProblemStatusObj
    filterObj.problemStatus = problemStatusObject;

}