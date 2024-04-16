import moment from 'moment';
/**
 * This function is used to add transaction when problem status is changed to incompliance
 * @param {*} index This is the index of the problem
 * @param {*} username This is the username who is the modified by of the problem 
 * @param {*} userId This is the userId who is the modified by of the problem  
 * @param {*} problemActionList This is the list of all the problems
 * @param {*} incomplianceProblemStatusObj This is the In compliance problem status obj with details of In compliance status 
 */
export default function incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj) {
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