import moment from 'moment';
/**
 * This function is used to add transaction when problem status is changed to open
 * @param {*} index This is the index of the problem
 * @param {*} username This is the username who is the modified by of the problem 
 * @param {*} userId This is the userId who is the modified by of the problem  
 * @param {*} problemActionList This is the list of all the problems
 * @param {*} openProblemStatusObj This is the open problem status obj with details of open status 
 */
export default function openProblem(index, username, userId, problemActionList, openProblemStatusObj) {
    var filterObj = problemActionList[index];
    var transList = filterObj.problemTransList;
    let tempProblemTransObj = {
        problemReportTransId: '',
        problemStatus: openProblemStatusObj,
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
    var problemStatusObject = openProblemStatusObj
    filterObj.problemStatus = problemStatusObject;
}