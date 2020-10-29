import moment, { months } from 'moment';

export default function openProblem(index,username,userId,problemActionList) {

    var filterObj = problemActionList[index];
    var transList = filterObj.problemTransList;
    let tempProblemTransObj = {
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
        notes: '',
        createdBy: {
            userId: userId,
            username: username
        },
        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
    }
    transList.push(tempProblemTransObj);
    filterObj.problemTransList = transList;

    var problemStatusObject = {
        id: 1,
        label: {
            active: true,
            labelId: 461,
            label_en: "Open",
            label_sp: null,
            label_fr: null,
            label_pr: null
        }
    }
    filterObj.problemStatus = problemStatusObject;

}