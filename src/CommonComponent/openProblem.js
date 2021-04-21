import moment, { months } from 'moment';

export default function openProblem(index,username,userId,problemActionList,openProblemStatusObj) {

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
    // reviewed: false,
    filterObj.reviewed = false; 

    var problemStatusObject = openProblemStatusObj
    filterObj.problemStatus = problemStatusObject;

}