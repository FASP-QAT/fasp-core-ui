import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { MultiSelect } from 'react-multi-select-component';
import { Prompt } from 'react-router-dom';
import { Button, Card, CardBody, CardFooter, Col, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { contrast, hideSecondComponent, filterOptions } from "../../CommonComponent/JavascriptCommonFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew';
import getLabelText from '../../CommonComponent/getLabelText';
import getProblemDesc from '../../CommonComponent/getProblemDesc';
import getSuggestion from '../../CommonComponent/getSuggestion';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import { SECRET_KEY } from '../../Constants.js';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ProblemListDashboard from '../Report/ProblemListDashboard';
import ProblemListFormulas from '../Report/ProblemListFormulas.js';
import ProgramService from '../../api/ProgramService';
const entityname = i18n.t('static.report.problem');
/**
 * This component is used to display the Problem List for multiple planning units
 */
export default class ProblemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            procurementUnitList: [],
            supplierList: [],
            problemStatusList: [],
            data: [],
            message: '',
            planningUnitId: '',
            lang: localStorage.getItem('lang'),
            loading: false,
            problemCategoryList: [],
            problemStatusValues: [],
            programId: localStorage.getItem("sesProgramId") != "" ? localStorage.getItem("sesProgramId") : '',
            showProblemDashboard: 0,
            showUpdateButton: false,
            problemDetail: {},
            problemTypeId: localStorage.getItem("sesProblemType") != "" ? localStorage.getItem("sesProblemType") : -1,
            productCategoryId: localStorage.getItem("sesProblemCategory") != "" ? localStorage.getItem("sesProblemCategory") : -1,
            reviewedStatusId: localStorage.getItem("sesReviewed") != "" ? localStorage.getItem("sesReviewed") : -1,
            notesPopup: false
        }
        this.fetchData = this.fetchData.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getNote = this.getNote.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.updateState = this.updateState.bind(this);
        this.getProblemListAfterCalculation = this.getProblemListAfterCalculation.bind(this);
        this.handleProblemStatusChange = this.handleProblemStatusChange.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.exportPDF = this.exportPDF.bind(this);
        this.addDoubleQuoteToRowContent = this.addDoubleQuoteToRowContent.bind(this);
        this.filterProblemStatus = this.filterProblemStatus.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.toggleLargeNotes = this.toggleLargeNotes.bind(this);
        this.actionCanceledNotes = this.actionCanceledNotes.bind(this);
        this.getNotes = this.getNotes.bind(this);
    }
    /**
     * This function is used to update the state of this component from any other component
     * @param {*} parameterName This is the name of the key
     * @param {*} value This is the value for the key
     */
    updateState(key, value) {
        this.setState({
            [key]: value
        })
    }
    /**
     * This function is used to hide the messages that are there in div1 after 30 seconds
     */
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.showUpdateButton == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * This function is used to fetch list all the offline programs, problem status and problem category that the user have downloaded
     */
    componentDidMount = function () {
        document.getElementById("tableDiv").closest('.card').classList.add("removeCardwrap");
        this.hideFirstComponent();
        const lan = localStorage.getItem("lang");
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = [];
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var programJson = {
                            name: myResult[i].programCode + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList[i] = programJson
                    }
                }
                var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                var problemStatusRequest = problemStatusOs.getAll();
                problemStatusRequest.onerror = function (event) {
                };
                problemStatusRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = problemStatusRequest.result;
                    var proListProblemStatus = []
                    for (var i = 0; i < myResult.length; i++) {
                        var Json = {
                            name: getLabelText(myResult[i].label, lan),
                            id: myResult[i].id
                        }
                        proListProblemStatus[i] = Json
                    }
                    proListProblemStatus.sort((a, b) => {
                        var itemLabelA = a.name.toUpperCase();
                        var itemLabelB = b.name.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        problemListForUpdate: myResult,
                        problemStatusList: proListProblemStatus,
                        programQPLDetails: getRequest.result
                    }, () => {
                        if (localStorage.getItem("sesProblemStatus") != '' && localStorage.getItem("sesProblemStatus") != undefined) {
                            let sessionProblemList = JSON.parse(localStorage.getItem("sesProblemStatus"));
                            let sessionProgramListStored = [];
                            for (var i = 0; i < sessionProblemList.length; i++) {
                                let objA = proListProblemStatus.filter(c => c.id == sessionProblemList[i].value)[0];
                                var Json = {
                                    label: objA.name,
                                    value: objA.id
                                }
                                sessionProgramListStored.push(Json);
                            }
                            this.setState({
                                problemStatusValues: sessionProgramListStored
                            })
                        } else {
                            let statusA = proListProblemStatus.filter(c => c.id == 1)[0];
                            let statusB = proListProblemStatus.filter(c => c.id == 3)[0];
                            var Json1 = { label: statusA.name, value: statusA.id }
                            var Json2 = { label: statusB.name, value: statusB.id }
                            this.setState({
                                problemStatusValues: [Json1, Json2]
                            })
                        }
                    })
                    var problemCategoryTransaction = db1.transaction(['problemCategory'], 'readwrite');
                    var problemCategoryOs = problemCategoryTransaction.objectStore('problemCategory');
                    var problemCategoryRequest = problemCategoryOs.getAll();
                    problemCategoryRequest.onerror = function (event) {
                    };
                    problemCategoryRequest.onsuccess = function (e) {
                        var myResultC = [];
                        myResultC = problemCategoryRequest.result;
                        var procList = []
                        for (var i = 0; i < myResultC.length; i++) {
                            var Json = {
                                name: getLabelText(myResultC[i].label, lan),
                                id: myResultC[i].id
                            }
                            procList[i] = Json
                        }
                        procList.sort((a, b) => {
                            var itemLabelA = a.name.toUpperCase();
                            var itemLabelB = b.name.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            problemCategoryList: procList
                        })
                        var programIdd = this.props.match.params.programId;
                        if (programIdd != '' && programIdd != undefined) {
                            this.setState({
                                programList: proList.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                programId: programIdd
                            }, () => {
                                if (this.state.programId != '' && this.state.programId != undefined) {
                                    this.getProblemListAfterCalculation();
                                }
                            })
                        }
                        else if (proList.length == 1) {
                            this.setState({
                                programList: proList.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                programId: proList[0].id
                            }, () => {
                                if (this.state.programId != '' && this.state.programId != undefined) {
                                    this.getProblemListAfterCalculation();
                                }
                            })
                        } else if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                            this.setState({
                                programList: proList.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                programId: localStorage.getItem("sesProgramId")
                            }, () => {
                                if (this.state.programId != '' && this.state.programId != undefined) {
                                    this.getProblemListAfterCalculation();
                                }
                            })
                        } else {
                            this.setState({
                                programList: proList.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                })
                            })
                        }
                    }.bind(this)
                }.bind(this);
            }.bind(this);
        }.bind(this);
    };
    /**
     * This function is used to filter the problem status list based on reviewer role and for in-compliance status
     */
    filterProblemStatus = function (instance, cell, c, r, source) {
        var hasRole = false;
        AuthenticationService.getLoggedInUserRole().map(c => {
            if (c.roleId == 'ROLE_SUPPLY_PLAN_REVIEWER') {
                hasRole = true;
            }
        });
        var mylist = [];
        mylist = this.state.problemStatusList;
        mylist = hasRole == true ? mylist.filter(c => c.id != 4) : mylist.filter(c => c.id != 2 && c.id != 4);
        return mylist;
    }.bind(this)
    /**
     * This function is called before saving the problem data to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        var elInstance = this.state.languageEl;
        for (var y = 0; y < json.length; y++) {
            var col = ("K").concat(parseInt(y) + 1);
            var rowData = elInstance.getRowData(y);
            var value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
            }
            var col = ("L").concat(parseInt(y) + 1);
            var value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "" && rowData[10] == 3) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
            }
        }
        return valid;
    }
    /**
     * This function is called when something in the problem list table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    rowChanged = function (instance, cell, x, y, value) {
        this.setState({ showUpdateButton: true });
        var elInstance = this.state.languageEl;
        var rowData = elInstance.getRowData(y);
        if (x != 21 && rowData[21] != 1) {
            elInstance.setValueFromCoords(21, y, 1, true);
        }
        if (x == 10 || x == 11) {
            var col = ("L").concat(parseInt(y) + 1);
            var colk = ("K").concat(parseInt(y) + 1);
            if (rowData[10] == "") {
                this.el.setStyle(colk, "background-color", "transparent");
                this.el.setStyle(colk, "background-color", "yellow");
                this.el.setComments(colk, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(colk, "background-color", "transparent");
                this.el.setComments(colk, "");
            }
            if (rowData[11] == "" && rowData[10] == 3) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
    }.bind(this)
    /**
     * This function is called when submit button of the problem list is clicked and is used to save problem list if all the data is successfully validated.
     */
    updateChangedProblems = function () {
        this.setState({
            showUpdateButton: false
        }, () => {
            var isDataValid = this.checkValidation();
            if (isDataValid == true) {
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    var programId = this.state.programId;
                    db1 = e.target.result;
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var program = transaction.objectStore('programData');
                    var getRequest = program.get(programId.toString());
                    getRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        });
                    };
                    getRequest.onsuccess = function (event) {
                        var programQPLDetailsTransaction1 = db1.transaction(['programQPLDetails'], 'readwrite');
                        var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('programQPLDetails');
                        var programQPLDetailsGetRequest = programQPLDetailsOs1.get(programId.toString());
                        programQPLDetailsGetRequest.onsuccess = function (event) {
                            var programObj = getRequest.result;
                            var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData.generalData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            var programQPLDetails = programQPLDetailsGetRequest.result;
                            var elInstance = this.state.languageEl;
                            var json = elInstance.getJson();
                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                            let username = decryptedUser.username;
                            var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                            var changedProblemsList = json.filter(c => c[21] == 1);
                            let problemList = this.state.data;
                            let problemReportListForUpdate = this.state.problemReportListForUpdate;
                            problemList = problemList.filter(c => c.planningUnitActive != false);
                            for (var i = 0; i < changedProblemsList.length; i++) {
                                if ((changedProblemsList[i])[0] != 0) {
                                    var indexToUpdate = problemReportListForUpdate.findIndex(c =>
                                        c.problemReportId == (changedProblemsList[i])[0]
                                    );
                                } else {
                                    var indexToUpdate = (changedProblemsList[i])[1];
                                }
                                var probObj = problemReportListForUpdate[indexToUpdate];
                                probObj.lastModifiedBy = { userId: userId, username: username }
                                probObj.lastModifiedDate = curDate;
                                var probTransList = probObj.problemTransList;
                                var changedProblemStatusId = parseInt((changedProblemsList[i])[10]);
                                var statusObj = this.state.problemListForUpdate.filter(c => parseInt(c.id) == changedProblemStatusId)[0];
                                let tempProblemTransObj = {
                                    problemReportTransId: '',
                                    problemStatus: statusObj,
                                    notes: (changedProblemsList[i])[11],
                                    reviewed: false,
                                    createdBy: {
                                        userId: userId,
                                        username: username
                                    },
                                    createdDate: curDate
                                }
                                probTransList.push(tempProblemTransObj);
                                probObj.problemTransList = probTransList;
                                probObj.reviewed = false;
                                var problemStatusObject = statusObj
                                probObj.problemStatus = problemStatusObject;
                                problemReportListForUpdate[indexToUpdate] = probObj;
                            }
                            programJson.problemReportList = problemReportListForUpdate;
                            programJson.currentVersionNotes = this.state.currentVersionNotes;
                            var openCount = (problemReportListForUpdate.filter(c => c.problemStatus.id == 1)).length;
                            var addressedCount = (problemReportListForUpdate.filter(c => c.problemStatus.id == 3)).length;
                            programQPLDetails.openCount = openCount;
                            programQPLDetails.addressedCount = addressedCount;
                            programObj.programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                            var problemTransaction = db1.transaction(['programData'], 'readwrite');
                            var problemOs = problemTransaction.objectStore('programData');
                            var putRequest = problemOs.put(programObj);
                            putRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext'),
                                    color: '#BA0C2F'
                                })
                            }.bind(this);
                            putRequest.onsuccess = function (event) {
                                var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                                var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                                var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetails);
                                programQPLDetailsRequest.onsuccess = function (event) {
                                    this.fetchData();
                                }.bind(this);
                            }.bind(this);
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({ message: i18n.t('static.label.validData') });
            }
        });
    }.bind(this)
    /**
     * This function is used to toggle the modal for problem trans list
     * @param {*} problemReportId This is the problem report Id for which you want to see the transcation
     * @param {*} problemActionIndex This is the index for the problem for which you want to see the transcation
     */
    toggleLarge(problemReportId, problemActionIndex) {
        var problemTransList = [];
        var problemType = "";
        var problemCreatedDate = "";
        if (problemReportId != undefined) {
            if (problemReportId != 0) {
                problemTransList = this.state.problemList.filter(c => c.problemReportId == problemReportId)[0].problemTransList;
                problemType = getLabelText(this.state.problemList.filter(c => c.problemReportId == problemReportId)[0].problemType.label, this.state.lang)
                problemCreatedDate = this.state.problemList.filter(c => c.problemReportId == problemReportId)[0].createdDate
            } else {
                problemTransList = this.state.problemList.filter(c => c.problemActionIndex == problemActionIndex)[0].problemTransList;
                problemType = getLabelText(this.state.problemList.filter(c => c.problemActionIndex == problemActionIndex)[0].problemType.label, this.state.lang)
                problemCreatedDate = this.state.problemList.filter(c => c.problemActionIndex == problemActionIndex)[0].createdDate
            }
        }
        this.setState({
            problemTransDetailsModal: !this.state.problemTransDetailsModal,
            problemTransList: problemTransList,
            problemType: problemType,
            problemCreatedDate: problemCreatedDate
        });
    }
    /**
     * This function is used to build the table for problem list display
     */
    buildJExcel() {
        let problemList = this.state.data;
        problemList = problemList.filter(c => c.planningUnitActive != false && c.regionActive != false);
        this.setState({ problemList: problemList });
        let problemArray = [];
        let count = 0;
        for (var j = 0; j < problemList.length; j++) {
            data = [];
            data[0] = problemList[j].problemReportId
            data[1] = problemList[j].problemActionIndex
            data[2] = problemList[j].program.code
            data[3] = problemList[j].versionId
            data[4] = (problemList[j].region != null && problemList[j].region.id != 0) ? (getLabelText(problemList[j].region.label, this.state.lang)) : ''
            data[5] = getLabelText(problemList[j].planningUnit.label, this.state.lang)
            data[6] = (problemList[j].dt != null) ? (moment(problemList[j].dt).format('MMM-YY')) : ''
            data[7] = problemList[j].problemType.id == 1 ? problemList[j].problemCategory.id : (problemList[j].realmProblem.criticality.id == 1 ? 4 : (problemList[j].realmProblem.criticality.id == 2 ? 5 : 6))
            data[8] = getProblemDesc(problemList[j], this.state.lang)
            data[9] = getSuggestion(problemList[j], this.state.lang)
            data[10] = problemList[j].problemStatus.id
            data[11] = this.getNote(problemList[j], this.state.lang)
            data[12] = problemList[j].problemStatus.id
            data[13] = problemList[j].planningUnit.id
            data[14] = problemList[j].realmProblem.problem.problemId
            data[15] = problemList[j].realmProblem.problem.actionUrl
            data[16] = problemList[j].realmProblem.criticality.id
            data[17] = problemList[j].reviewed
            data[20] = getLabelText(problemList[j].realmProblem.criticality.label, this.state.lang)
            data[18] = problemList[j].reviewNotes != null ? problemList[j].reviewNotes : ''
            data[19] = (problemList[j].reviewedDate != null && problemList[j].reviewedDate != '') ? moment(problemList[j].reviewedDate).format(`${DATE_FORMAT_CAP}`) : ''
            data[21] = 0
            data[22] = problemList[j].problemType.id
            problemArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = problemArray;
        var qplEditable = this.state.programQPLDetails.filter(c => c.id == this.state.programId)[0].readonly;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [10, 10, 10, 10, 10, 100, 10, 50, 180, 180, 50, 100, 10, 10, 10, 10, 10, 50, 100, 50, 50],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                    readOnly: true,
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    title: i18n.t("static.problemActionReport.problemCategory"),
                    type: 'dropdown',
                    width: 80,
                    source: this.state.problemCategoryList,
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.problemDescription'),
                    type: 'text',
                    readOnly: true,
                    width: 300,
                },
                {
                    title: i18n.t('static.report.suggession'),
                    type: 'text',
                    readOnly: true,
                    width: 300,
                },
                {
                    title: i18n.t('static.report.problemStatus'),
                    type: 'dropdown',
                    source: this.state.problemStatusList,
                    filter: this.filterProblemStatus
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    width: 300
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    title: i18n.t('static.supplyPlanReview.review'),
                    type: 'checkbox',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.reviewNotes'),
                    type: 'text',
                    readOnly: true,
                    width: 260
                },
                {
                    title: i18n.t('static.report.reviewedDate'),
                    type: 'text',
                    readOnly: true,
                },
                {
                    title: i18n.t('static.report.Criticality'),
                    type: 'text',
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
            ],
            editable: !qplEditable,
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            filters: true,
            license: JEXCEL_PRO_KEY,
            onchange: this.rowChanged,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.report.problemTransDetails'),
                            onclick: function () {
                                var rowData = obj.getRowData(y);
                                this.toggleLarge(rowData[0], rowData[1]);
                            }.bind(this)
                        });
                    }
                }
                return items;
            }.bind(this),
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el;
                var lastY = -1;
                if (y != null && lastY != y) {
                    var rowData = elInstance.getRowData(y);
                    var colArr = ['K', 'L']
                    if (rowData[12] == 2 || rowData[12] == 4) {
                        for (var c = 0; c < colArr.length; c++) {
                            var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                        }
                    } else {
                        for (var c = 0; c < colArr.length; c++) {
                            var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                        }
                    }
                    lastY = y;
                }
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            loading: false, languageEl: languageEl
        })
    }
    /**
     * This function is used to add the double quotes to the row
     * @param {*} arr This is the arr of the row elements
     * @returns This function returns the row with double quotes
     */
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    /**
     * This function is used to export the data in CSV format
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"');
        csvRow.push('')
        this.state.problemStatusValues.map(ele =>
            csvRow.push('"' + (i18n.t('static.report.problemStatus') + ' : ' + (ele.label).toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.problemType') + ' : ' + document.getElementById("problemTypeId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.problemActionReport.problemCategory') + ' , ' + document.getElementById("problemCategoryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        headers.push(i18n.t('static.planningunit.planningunit').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.problemActionReport.problemCategory').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.report.problemDescription').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.report.suggession').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.report.problemStatus').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.program.notes').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.supplyPlanReview.review').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.report.reviewNotes').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.report.reviewedDate').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.problemAction.criticality').replaceAll(' ', '%20'));
        var A = [this.addDoubleQuoteToRowContent(headers)];
        this.state.data.map(
            ele => A.push(this.addDoubleQuoteToRowContent([
                getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(' ', '%20'),
                (ele.problemType.id == 1 ? getLabelText(ele.problemCategory.label, this.state.lang) : (ele.realmProblem.criticality.id == 1 ? this.state.problemCategoryList.filter(c => c.id == 4)[0].name : (ele.realmProblem.criticality.id == 2 ? this.state.problemCategoryList.filter(c => c.id == 5)[0].name : this.state.problemCategoryList.filter(c => c.id == 6)[0].name))).replaceAll(' ', '%20'),
                getProblemDesc(ele, this.state.lang).replaceAll(' ', '%20'),
                getSuggestion(ele, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.problemStatus.label, this.state.lang).replaceAll(' ', '%20'),
                this.getNote(ele, this.state.lang) == null ? "" : this.getNote(ele, this.state.lang).replaceAll(' ', '%20'),
                ele.reviewed == false ? i18n.t('static.program.no') : i18n.t('static.program.yes'),
                ele.reviewNotes == null ? '' : (ele.reviewNotes).replaceAll(' ', '%20'),
                (ele.reviewedDate == "" || ele.reviewedDate == null) ? '' : moment(ele.reviewedDate).format(`${DATE_FORMAT_CAP_FOUR_DIGITS}`).replaceAll(' ', '%20'),
                getLabelText(ele.realmProblem.criticality.label, this.state.lang).replaceAll(' ', '%20')
            ])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.qatProblemActionReport') + '.csv';
        document.body.appendChild(a)
        a.click()
    }
    /**
     * This function is used to export the data in PDF format
     */
    exportPDF() {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6)
                doc.setPage(i)
                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 20, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 20, {
                    align: 'center'
                })
            }
        }
        const addHeaders = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.qatProblemActionReport'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    var statusText = doc.splitTextToSize((i18n.t('static.report.problemStatus') + ' : ' + (this.state.problemStatusValues.map(ele => ele.label)).join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 110, statusText)
                    doc.text(i18n.t('static.report.problemType') + ' : ' + document.getElementById("problemTypeId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.problemActionReport.problemCategory') + ' : ' + document.getElementById("problemCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const headers = [];
        headers.push(i18n.t('static.planningunit.planningunit'));
        headers.push(i18n.t('static.problemActionReport.problemCategory'));
        headers.push(i18n.t('static.report.problemDescription'));
        headers.push(i18n.t('static.report.suggession'));
        headers.push(i18n.t('static.report.problemStatus'));
        headers.push(i18n.t('static.program.notes'));
        headers.push(i18n.t('static.supplyPlanReview.review'));
        headers.push(i18n.t('static.report.reviewNotes'));
        headers.push(i18n.t('static.report.reviewedDate'));
        headers.push(i18n.t('static.problemAction.criticality'));
        let data = this.state.data.map(ele => [
            getLabelText(ele.planningUnit.label, this.state.lang),
            (ele.problemType.id == 1 ? getLabelText(ele.problemCategory.label, this.state.lang) : (ele.realmProblem.criticality.id == 1 ? this.state.problemCategoryList.filter(c => c.id == 4)[0].name : (ele.realmProblem.criticality.id == 2 ? this.state.problemCategoryList.filter(c => c.id == 5)[0].name : this.state.problemCategoryList.filter(c => c.id == 6)[0].name))),
            getProblemDesc(ele, this.state.lang),
            getSuggestion(ele, this.state.lang),
            getLabelText(ele.problemStatus.label, this.state.lang),
            this.getNote(ele, this.state.lang),
            ele.reviewed == false ? i18n.t('static.program.no') : i18n.t('static.program.yes'),
            ele.reviewNotes,
            (ele.reviewedDate == "" || ele.reviewedDate == null) ? '' : moment(ele.reviewedDate).format(`${DATE_FORMAT_CAP}`),
            getLabelText(ele.realmProblem.criticality.label, this.state.lang)
        ]);
        let content = {
            margin: { top: 90, bottom: 80 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 40 },
                2: { cellWidth: 150 },
                3: { cellWidth: 150 },
                4: { cellWidth: 30 },
                5: { cellWidth: 130 },
                6: { cellWidth: 30 },
                7: { cellWidth: 90 },
                8: { cellWidth: 50 },
                9: { cellWidth: 40 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.qatProblemActionReport') + '.pdf')
    }
    /**
     * This function is called on row click and is used to redirect user to screen which can resolve this problem
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if (y == 5 || y == 7 || y == 8 || y == 9) {
                if ((x == 0 && value != 0) || (y == 0)) {
                } else {
                    if (this.state.data.length != 0) {
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROBLEM')) {
                            if (this.el.getValueFromCoords(12, x) != 4 && this.el.getValueFromCoords(12, x) != 2) {
                                var planningunitId = this.el.getValueFromCoords(13, x);
                                var programId = document.getElementById('programId').value;
                                var versionId = this.el.getValueFromCoords(3, x)
                                window.open(window.location.origin + `/#${this.el.getValueFromCoords(15, x)}/${programId}/${versionId}/${planningunitId}`);
                            }
                        }
                    }
                }
            }
        }
    }.bind(this);
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson();
        for (var j = 0; j < json.length; j++) {
            var colArr = ['U']
            var rowData = elInstance.getRowData(j);
            var criticalityId = rowData[16];
            if (criticalityId == 3) {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', '#f48282');
                    let textColor = contrast('#f48282');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            } else if (criticalityId == 2) {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'orange');
                    let textColor = contrast('orange');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            } else if (criticalityId == 1) {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'yellow');
                    let textColor = contrast('yellow');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            }
        }
    }
    /**
     * This function is used to call the rebuild function to rebuild the problem list
     */
    getProblemListAfterCalculation() {
        this.setState({
            data: [],
            message: '',
            loading: true
        },
            () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        let programId = document.getElementById('programId').value;
        this.setState({ programId: programId });
        if (programId != 0) {
            localStorage.setItem("sesProgramId", programId);
            this.refs.problemListChild.qatProblemActions(programId, "loading", false);
        } else {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [], loading: false });
        }
    }
    /**
     * This function is used to fetch the problem list data
     */
    fetchData() {
        var cont = false;
        if (this.state.showUpdateButton == true) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({
                data: [],
                message: '',
                loading: true,
                showProblemDashboard: 0,
                showUpdateButton: false,
                programId: document.getElementById('programId').value,
                problemTypeId: document.getElementById('problemTypeId').value,
                productCategoryId: document.getElementById('problemCategoryId').value,
                reviewedStatusId: document.getElementById('reviewedStatusId').value
            },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                    localStorage.setItem("sesProblemType", document.getElementById('problemTypeId').value);
                    localStorage.setItem("sesProblemCategory", document.getElementById('problemCategoryId').value);
                    localStorage.setItem("sesReviewed", document.getElementById('reviewedStatusId').value);
                    localStorage.setItem("sesProgramId", document.getElementById('programId').value);
                });
            let programId = document.getElementById('programId').value;
            let problemStatusIds = this.state.problemStatusValues.map(ele => (ele.value));
            let problemTypeId = document.getElementById('problemTypeId').value;
            let problemCategoryId = document.getElementById('problemCategoryId').value;
            let reviewedCheck = document.getElementById('reviewedStatusId').value;
            this.setState({ programId: programId });
            if (parseInt(programId) != 0 && problemStatusIds != [] && problemTypeId != 0 && problemCategoryId != 0) {
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({ loading: false });
                };
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var programTransaction = transaction.objectStore('programData');
                    var programRequest = programTransaction.get(programId);
                    programRequest.onerror = function (event) {
                        this.setState({ loading: false });
                    };
                    programRequest.onsuccess = function (event) {
                        this.setState({ loading: true },
                            () => {
                            })
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var problemReportList = (programJson.problemReportList);
                        this.setState({
                            problemReportListUnFiltered: problemReportList,
                            showProblemDashboard: 1,
                            currentVersionNotesHistory: programJson.currentVersionTrans != undefined ? programJson.currentVersionTrans : [],
                            currentVersionNotes: programJson.currentVersionNotes != undefined ? programJson.currentVersionNotes : ""
                        })
                        var problemReportFilterList = problemReportList;
                        var myStartDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
                        problemReportFilterList = problemReportFilterList.filter(c => (c.problemStatus.id == 4 ? moment(c.createdDate).format("YYYY-MM-DD") >= myStartDate : true) && problemStatusIds.includes(c.problemStatus.id));
                        if (problemTypeId != -1) {
                            problemReportFilterList = problemReportFilterList.filter(c => (c.problemType.id == problemTypeId));
                        }
                        if (problemCategoryId != -1) {
                            problemReportFilterList = problemReportFilterList.filter(c => (c.problemCategory.id == problemCategoryId));
                        }
                        if (reviewedCheck != -1) {
                            problemReportFilterList = problemReportFilterList.filter(c => (c.reviewed == reviewedCheck));
                        }
                        this.setState({
                            data: problemReportFilterList,
                            message: '',
                            problemReportListForUpdate: problemReportList
                        },
                            () => {
                                this.buildJExcel();
                            });
                    }.bind(this)
                }.bind(this)
            }
            else if (programId == 0) {
                this.setState({ message: i18n.t('static.common.selectProgram'), data: [], loading: false },
                    () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    });
            }
            else if (problemStatusIds != []) {
                this.setState({ message: i18n.t('static.report.selectProblemStatus'), data: [], loading: false },
                    () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    });
            }
            else if (problemTypeId == 0) {
                this.setState({ message: i18n.t('static.report.selectProblemType'), data: [], loading: false },
                    () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    });
            }
        }
    }
    /**
     * This function is used to show the notes of the problem
     * @param {*} row This is instance of the row for which notes should be visible
     * @param {*} lang This is the name of the language in which notes should be displayed
     * @returns Returns the latest notes for a problem
     */
    getNote(row, lang) {
        var transList = row.problemTransList.filter(c => c.reviewed == false);
        if (transList.length == 0) {
            return ""
        } else {
            var listLength = transList.length;
            return transList[listLength - 1].notes;
        }
    }
    /**
     * This function is called when status filter is changed
     * @param {*} event This is the on change event
     */
    handleProblemStatusChange = (event) => {
        var cont = false;
        if (this.state.showUpdateButton == true) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            var problemStatusIds = event
            problemStatusIds = problemStatusIds.sort(function (a, b) {
                return parseInt(a.value) - parseInt(b.value);
            })
            this.setState({
                problemStatusValues: problemStatusIds.map(ele => ele),
                problemStatusLabels: problemStatusIds.map(ele => ele.label),
                showUpdateButton: false
            }, () => {
                localStorage.setItem("sesProblemStatus", JSON.stringify(this.state.problemStatusValues));
                this.fetchData()
            })
        }
    }
    /**
     * This function is used to toggle the notes history model
     */
    toggleLargeNotes() {
        this.setState({
            notesPopup: !this.state.notesPopup,
        }, () => {
            if (this.state.notesPopup) {
                if (localStorage.getItem('sessionType') === 'Online') {
                    this.setState({
                        loading:true
                    })
                    ProgramService.getNotesHistory(this.state.programId.split("_")[0])
                        .then(response => {
                            var listArray = response.data;
                            this.setState({
                                currentVersionNotesHistory:listArray,
                                loading:false
                            },()=>{
                                setTimeout(function () {
                                    this.getNotes()
                                }.bind(this), 100);
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    loadingForNotes: false
                                })
                                if (error.message === "Network Error") {
                                    this.setState({
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                        loading: false
                                    });
                                } else {
                                    switch (error.response ? error.response.status : "") {
                                        case 401:
                                            this.props.history.push(`/login/static.message.sessionExpired`)
                                            break;
                                        case 403:
                                            this.props.history.push(`/accessDenied`)
                                            break;
                                        case 500:
                                        case 404:
                                        case 406:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false
                                            });
                                            break;
                                        default:
                                            this.setState({
                                                message: 'static.unkownError',
                                                loading: false
                                            });
                                            break;
                                    }
                                }
                            }
                        );
                } else {
                    setTimeout(function () {
                        this.getNotes()
                    }.bind(this), 100);
                }
            }
        });
    }
    getNotes() {
        var listArray = this.state.currentVersionNotesHistory;
        if (this.state.notesTransTableEl != "" && this.state.notesTransTableEl != undefined) {
            jexcel.destroy(document.getElementById("notesTransTable"), true);
        }
        var json = [];
        for (var sb = listArray.length - 1; sb >= 0; sb--) {
            var data = [];
            data[0] = listArray[sb].versionId;
            data[1] = getLabelText(listArray[sb].versionStatus.label, this.state.lang);
            data[2] = listArray[sb].notes;
            data[3] = listArray[sb].lastModifiedBy.username;
            data[4] = moment(listArray[sb].lastModifiedDate).format("YYYY-MM-DD HH:mm:ss");
            json.push(data);
        }
        var options = {
            data: json,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.report.version'), type: 'text', width: 50 },
                { title: i18n.t('static.integration.versionStatus'), type: 'text', width: 80 },
                { title: i18n.t('static.program.notes'), type: 'text', width: 250 },
                {
                    title: i18n.t("static.common.lastModifiedBy"),
                    type: "text",
                },
                {
                    title: i18n.t("static.common.lastModifiedDate"),
                    type: "calendar",
                    options: { isTime: 1, format: "DD-Mon-YY HH24:MI" },
                },
            ],
            editable: false,
            onload: function (instance, cell) {
                jExcelLoadedFunction(instance, 1);
            }.bind(this),
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: "top",
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var elVar = jexcel(document.getElementById("notesTransTable"), options);
        this.el = elVar;
        this.setState({ notesTransTableEl: elVar, loadingForNotes: false });
    }
    /**
     * This is used to display the content
     * @returns The problem list data in tabular format along with the different filters
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        let id = AuthenticationService.displayDashboardBasedOnRole();
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);
        const { problemStatusList } = this.state;
        let problemStatus = problemStatusList.length > 0
            && problemStatusList.map((item, i) => {
                return ({ label: item.name, value: item.id })
            }, this);
        const { problemCategoryList } = this.state;
        let problemCategories = problemCategoryList.length > 0
            && problemCategoryList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const columnsTrans = [
            {
                dataField: 'problemStatus.label',
                text: i18n.t('static.report.problemStatus'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'notes',
                text: i18n.t('static.program.notes'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
            },
            {
                dataField: 'reviewed',
                text: i18n.t('static.supplyPlanReview.review'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return cell == true ? i18n.t('static.program.yes') : i18n.t('static.program.no');
                }
            },
            {
                dataField: 'createdBy.username',
                text: i18n.t('static.report.lastmodifiedby'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
            },
            {
                dataField: 'createdDate',
                text: i18n.t('static.report.lastmodifieddate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return new moment(cell).format(DATE_FORMAT_CAP);
                }
            },
        ];
        const optionsTrans = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '15', value: 15
            }, {
                text: '25', value: 25
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.data.length
            }]
        }
        return (
            <div className="animated">
                <Prompt
                    when={this.state.showUpdateButton == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.fetchData} objectStore="programData" page="problemList"></QatProblemActionNew>
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <Card>
                    <ProblemListFormulas ref="formulaeChild" />
                    <div className="Card-header-addicon problemListMarginTop">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a className="card-header-action">
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleLargeNotes() }}><small className="supplyplanformulas">{i18n.t('static.problemContext.viewTrans')}</small></span>
                                </a>&nbsp;
                                <a className="card-header-action">
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.report.problemReportStatusDetails')}</small></span>
                                </a>
                                {this.state.data.length > 0 && <img style={{ verticalAlign: 'bottom', height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />} &nbsp;
                                {this.state.data.length > 0 && <img style={{ verticalAlign: 'bottom', height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV()} />} &nbsp;
                                {this.state.programId != 0 && <a href="javascript:void();" title={i18n.t('static.qpl.recalculate')} onClick={this.getProblemListAfterCalculation}><i className="fa fa-refresh"></i></a>}
                                &nbsp;&nbsp;
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Col md="9 pl-1">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls problemListSelectField">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                name="programId" id="programId"
                                                onChange={(e) => { this.getProblemListAfterCalculation() }}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programs}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.problemStatus')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls problemListSelectField">
                                        <MultiSelect
                                            name="problemStatusId"
                                            id="problemStatusId"
                                            value={this.state.problemStatusValues}
                                            onChange={(e) => { this.handleProblemStatusChange(e) }}
                                            options={problemStatus && problemStatus.length > 0 ? problemStatus : []}
                                            labelledBy={i18n.t('static.common.select')}
                                            overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                            selectSomeItems: i18n.t('static.common.select')}}
                                            filterOptions={filterOptions}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.problemType')}</Label>
                                    <div className="controls problemListSelectField">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                value={this.state.problemTypeId}
                                                name="problemTypeId" id="problemTypeId"
                                                onChange={this.fetchData}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                <option value="1">{i18n.t('static.report.problemAction.automatic')}</option>
                                                <option value="2">{i18n.t('static.report.problemAction.manual')}</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.problemActionReport.problemCategory')}</Label>
                                    <div className="controls problemListSelectField">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                name="problemCategoryId" id="problemCategoryId"
                                                onChange={this.fetchData}
                                                value={this.state.productCategoryId}
                                            >
                                                <option value="-1">{i18n.t("static.common.all")}</option>
                                                {problemCategories}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlanReview.review')}</Label>
                                    <div className="controls problemListSelectField">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                name="reviewedStatusId" id="reviewedStatusId"
                                                onChange={this.fetchData}
                                                value={this.state.reviewedStatusId}
                                            >
                                                <option value="-1">{i18n.t("static.common.all")}</option>
                                                <option value="1">{i18n.t("static.program.yes")}</option>
                                                <option value="0">{i18n.t("static.program.no")}</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <FormGroup className="col-md-6 mt-5 pl-0" >
                            <ul className="legendcommitversion list-group">
                                <li><span className="problemList-red legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.high')}</span></li>
                                <li><span className="problemList-orange legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.medium')}</span></li>
                                <li><span className="problemList-yellow legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.low')} </span></li>
                            </ul>
                        </FormGroup>
                        <div className="" >
                            <div className='row'>
                                <div className='col-md-6'>
                                    {this.state.showProblemDashboard == 1 && this.state.programId != 0 && <ProblemListDashboard problemListUnFilttered={this.state.problemReportListUnFiltered} problemCategoryList={this.state.problemCategoryList} problemStatusList={this.state.problemStatusList} />}
                                </div>
                                <FormGroup className="col-md-6">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.notes')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input type="textarea"
                                                name="notes"
                                                id="notes"
                                                // valid={!errors.notes && this.state.notes != ''}
                                                // invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { this.notesChange(e); }}
                                                // onBlur={handleBlur}
                                                value={this.state.currentVersionNotes}
                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.notes}</FormFeedback> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                            <div className='ProblemListTableBorder'>
                                <div id="tableDiv" className='consumptionDataEntryTable' style={{ display: this.state.loading ? "none" : "block" }}>
                                </div>
                            </div>
                        </div>
                    </CardBody >
                    <CardFooter>
                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => this.cancelClicked(id)}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        {this.state.showUpdateButton && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.updateChangedProblems}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>}
                    </CardFooter>
                </Card >
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                        </div>
                    </div>
                </div>
                <Modal isOpen={this.state.problemTransDetailsModal}
                    className={'modal-md modalWidthExpiredStock'}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.report.problemTransDetails')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <ToolkitProvider
                                keyField="problemActionIndex"
                                data={this.state.problemTransList}
                                columns={columnsTrans}
                                search={{ searchFormatted: true }}
                                hover
                                filter={filterFactory()}
                            >
                                {
                                    props => (
                                        <div className="col-md-12 bg-white pb-1 mb-2">
                                            <div className="row">
                                                <FormGroup className="col-md-6 ">
                                                    <Label for="problemType">{i18n.t('static.report.problemType')}</Label>
                                                    <Input type="text"
                                                        name="problemType"
                                                        id="problemType"
                                                        bsSize="sm"
                                                        readOnly
                                                        value={this.state.problemType}
                                                    />
                                                </FormGroup>
                                                <FormGroup className="col-md-6 ">
                                                    <Label for="createdDate">{i18n.t('static.report.createdDate')}</Label>
                                                    <Input type="text"
                                                        name="createdDate"
                                                        id="createdDate"
                                                        bsSize="sm"
                                                        readOnly
                                                        value={moment(this.state.problemCreatedDate).format(DATE_FORMAT_CAP)}
                                                        className="form-control-sm form-control date-color"
                                                    />
                                                </FormGroup>
                                            </div>
                                            <div className="TableCust">
                                                <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div>
                                                <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                    pagination={paginationFactory(optionsTrans)}
                                                    {...props.baseProps}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            </ToolkitProvider>
                        </ModalBody>
                        <ModalFooter>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.toggleLarge()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </div>
                </Modal>
                <Modal isOpen={this.state.notesPopup}
                    className={'modal-lg modalWidth ' + this.props.className}>
                    <ModalHeader toggle={() => this.toggleLargeNotes()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.problemContext.transDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <div className="">
                            <div id="notesTransTable" className="AddListbatchtrHeight"></div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceledNotes()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
            </div >
        );
    }
    notesChange(event) {
        this.setState({
            currentVersionNotes: event.target.value,
            showUpdateButton: true
        })
    }
    /**
     * This function is called when cancel button is clicked
     * @param {*} id Id is based on role so that it can be redirected to specific dashboard
     */
    cancelClicked(id) {
        this.props.history.push(`/ApplicationDashboard/` + id + '/red/' + i18n.t('static.message.cancelled', { entityname }));
    }
    /**
     * This function is called when cancel button for notes modal popup is clicked
     */
    actionCanceledNotes() {
        this.setState({
            message: i18n.t('static.actionCancelled'),
            color: "#BA0C2F",
        }, () => {
            hideSecondComponent();
            this.toggleLargeNotes();
        })
    }
}
