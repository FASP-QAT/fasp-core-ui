import moment, { months } from 'moment';

export default function incomplianceProblem(index,username,userId,problemActionList) {
    // console.log("000000=====>in ");
    var filterObj = problemActionList[index];
    var transList = filterObj.problemTransList;
    let tempProblemTransObj = {
        problemReportTransId: '',
        problemStatus: {
            id: 4,
            label: {
                active: true,
                labelId: 27104,
                label_en: "In-Compliance",
                label_sp: null,
                label_fr: null,
                label_pr: null
            }
        },
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
    var problemStatusObject = {
        id: 4,
        label: {
            active: true,
            labelId: 27104,
            label_en: "In-Compliance",
            label_sp: null,
            label_fr: null,
            label_pr: null
        }
    }
    filterObj.problemStatus = problemStatusObject;

}