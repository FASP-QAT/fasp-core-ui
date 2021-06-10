import { DATE_FORMAT_CAP, INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';

import React, { isValidElement } from "react";
import ReactDOM from 'react-dom';
import * as JsStoreFunctions from "../../CommonComponent/JsStoreFunctions.js";
import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, CardFooter, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import pdfIcon from '../../assets/img/pdf.png';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import jsPDF from "jspdf";
import AuthenticationService from '../Common/AuthenticationService.js';
import MultiSelect from 'react-multi-select-component';
import "jspdf-autotable";
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import { qatProblemActions } from '../../CommonComponent/QatProblemActions';
import getProblemDesc from '../../CommonComponent/getProblemDesc';
import getSuggestion from '../../CommonComponent/getSuggestion';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import actualIcon from '../../assets/img/actual.png';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import ProblemListFormulas from '../Report/ProblemListFormulas.js'
import QatProblemActions from '../../CommonComponent/QatProblemActions'
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew'
import ProblemListDashboard from '../Report/ProblemListDashboard';
import { Prompt } from 'react-router-dom';
const entityname = i18n.t('static.report.problem');

export default class ConsumptionDetails extends React.Component {

    constructor(props) {
        super(props);
        // this.options = props.options;
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
            // problemStatusValues: localStorage.getItem("sesProblemStatus") != "" ? JSON.parse(localStorage.getItem("sesProblemStatus")) : [{ label: "Open", value: 1 }, { label: "Addressed", value: 3 }],
            programId: localStorage.getItem("sesProgramId") != "" ? localStorage.getItem("sesProgramId") : '',
            showProblemDashboard: 0,
            showUpdateButton: false,
            problemDetail: {},
            problemTypeId: localStorage.getItem("sesProblemType") != "" ? localStorage.getItem("sesProblemType") : -1,
            productCategoryId: localStorage.getItem("sesProblemCategory") != "" ? localStorage.getItem("sesProblemCategory") : -1,
            reviewedStatusId: localStorage.getItem("sesReviewed") != "" ? localStorage.getItem("sesReviewed") : -1

        }


        this.fetchData = this.fetchData.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addMannualProblem = this.addMannualProblem.bind(this);
        this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
        this.buttonFormatter = this.buttonFormatter.bind(this);
        this.addMapping = this.addMapping.bind(this);
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
    }

    // updateState(ekValue) {
    //     this.setState({ loading: ekValue });
    // }
    updateState(key, value) {
        this.setState({
            [key]: value
        })
    }

    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.showUpdateButton == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    componentDidMount = function () {
        // qatProblemActions();
        // console.log("]]]]]]]======>", localStorage.getItem("sesProblemStatus"));



        this.hideFirstComponent();
        // let problemStatusId = document.getElementById('problemStatusId').value;
        // console.log("problemStatusId ---------> ", problemStatusId);
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
            var shipStatusList = []
            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        // var programJson = bytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programJson);
                        var programJson = {
                            // getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version
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
                    // Handle errors!
                    // this.hideSecondComponent();
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
                        var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        problemListForUpdate: myResult,
                        problemStatusList: proListProblemStatus
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
                        // Handle errors!
                        // this.hideSecondComponent();
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
                            var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            problemCategoryList: procList
                        })

                        // document.getElementById("problemTypeId").value = localStorage.getItem("sesProblemType");
                        // document.getElementById("problemCategoryId").value = localStorage.getItem("sesProblemCategory");
                        // document.getElementById("reviewedStatusId").value = localStorage.getItem("sesReviewed");
                        // console.log("]]]]]]====>", localStorage.getItem("sesProblemCategory"));

                        // var programIdd = this.props.match.params.programId;
                        // var needToCalculate = this.props.match.params.calculate;
                        // if (programIdd != '' && programIdd != undefined) {
                        //     document.getElementById("programId").value = programIdd;
                        //     // console.log("value==================>", needToCalculate);
                        //     if (needToCalculate == "true") {
                        //         // console.log("============>***");
                        //         this.getProblemListAfterCalculation();
                        //     } else {
                        //         this.fetchData();
                        //     }
                        // }

                        var needToCalculate = this.props.match.params.calculate;
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
                                    this.fetchData();
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
                                    this.fetchData();
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
                                    // if (needToCalculate == "false") {
                                    //     this.fetchData();
                                    // } else {
                                    // this.getProblemListAfterCalculation();
                                    this.fetchData();

                                    // }
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



    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        // console.log('in rowClassNameFormat')
        // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
        if (row.realmProblem.criticality.id == 3) {
            return row.realmProblem.criticality.id == 3 && row.problemStatus.id == 1 ? 'background-red-problemList' : '';
        } else if (row.realmProblem.criticality.id == 2) {
            return row.realmProblem.criticality.id == 2 && row.problemStatus.id == 1 ? 'background-orange' : '';
        } else {
            return row.realmProblem.criticality.id == 1 && row.problemStatus.id == 1 ? 'background-yellow' : '';
        }
    }

    filterProblemStatus = function (instance, cell, c, r, source) {

        var hasRole = false;
        AuthenticationService.getLoggedInUserRole().map(c => {
            if (c.roleId == 'ROLE_SUPPLY_PLAN_REVIEWER') {
                hasRole = true;

            }
        });

        var mylist = [];
        var json = instance.jexcel.getJson(null, false)
        mylist = this.state.problemStatusList;
        // console.log(">>>",mylist);
        mylist = hasRole == true ? mylist.filter(c => c.id != 4) : mylist.filter(c => c.id != 2 && c.id != 4);
        console.log(">>>", mylist);
        return mylist;
    }.bind(this)

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

    updateChangedProblems = function () {

        this.setState({
            showUpdateButton: false
        }, () => {
            var isDataValid = this.checkValidation();
            if (isDataValid == true) {
                var db1;
                var storeOS;
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
                            var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            var programQPLDetails = programQPLDetailsGetRequest.result;
                            //=========================================================================
                            var elInstance = this.state.languageEl;
                            var json = elInstance.getJson();
                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                            var userId = userBytes.toString(CryptoJS.enc.Utf8);

                            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                            let username = decryptedUser.username;

                            var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));

                            var changedProblemsList = json.filter(c => c[21] == 1);
                            var problemListDate = moment(Date.now()).subtract(12, 'months').endOf('month').format("YYYY-MM-DD");
                            let problemList = this.state.data;
                            let problemReportListForUpdate = this.state.problemReportListForUpdate;
                            problemList = problemList.filter(c => moment(c.createdDate).format("YYYY-MM-DD") > problemListDate && c.planningUnitActive != false);
                            console.log("changedProblemsList+++", changedProblemsList);
                            for (var i = 0; i < changedProblemsList.length; i++) {
                                if ((changedProblemsList[i])[0] != 0) {
                                    console.log("in if+++");
                                    var indexToUpdate = problemReportListForUpdate.findIndex(c =>
                                        c.problemReportId == (changedProblemsList[i])[0]
                                    );
                                } else {
                                    console.log("in else+++", (changedProblemsList[i])[1]);
                                    // var indexToUpdate = problemReportListForUpdate.findIndex(c =>
                                    //     c.problemActionIndex == (changedProblemsList[i])[1]
                                    // );
                                    var indexToUpdate = (changedProblemsList[i])[1];
                                }

                                var probObj = problemReportListForUpdate[indexToUpdate];
                                // var probObj = (changedProblemsList[i])[0] != 0 ? problemList.filter(c => c.problemReportId == indexToUpdate)[0] : problemList.filter(c => c.problemActionIndex == indexToUpdate)[0];
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
                            //=========================================================================
                            programJson.problemReportList = problemReportListForUpdate;
                            var openCount = (problemReportListForUpdate.filter(c => c.problemStatus.id == 1)).length;
                            var addressedCount = (problemReportListForUpdate.filter(c => c.problemStatus.id == 3)).length;
                            programQPLDetails.openCount = openCount;
                            programQPLDetails.addressedCount = addressedCount;
                            programObj.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                            var problemTransaction = db1.transaction(['programData'], 'readwrite');
                            var problemOs = problemTransaction.objectStore('programData');
                            var putRequest = problemOs.put(programObj);
                            putRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext'),
                                    color: 'red'
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
    toggleProblemDetails(problemReportId, problemActionIndex) {
        var problemDetail = ''
        if (problemReportId != undefined) {
            if (problemReportId != 0) {
                problemDetail = this.state.problemList.filter(c => c.problemReportId == problemReportId)[0];
            } else {
                problemDetail = this.state.problemList.filter(c => c.problemActionIndex == problemActionIndex)[0];
            }
        }
        this.setState({
            problemDetailsModal: !this.state.problemDetailsModal,
            problemDetail: problemDetail
        });
    }

    buildJExcel() {
        var problemListDate = moment(Date.now()).subtract(12, 'months').endOf('month').format("YYYY-MM-DD");
        let problemList = this.state.data;
        problemList = problemList.filter(c => moment(c.createdDate).format("YYYY-MM-DD") > problemListDate && c.planningUnitActive != false && c.regionActive != false);
        // we set this in state becasue we need to use it on modal popup
        this.setState({ problemList: problemList });
        let problemArray = [];
        let count = 0;
        for (var j = 0; j < problemList.length; j++) {
            data = [];
            data[0] = problemList[j].problemReportId
            data[1] = problemList[j].problemActionIndex
            data[2] = problemList[j].program.code
            data[3] = problemList[j].versionId
            data[4] = (problemList[j].region.label != null) ? (getLabelText(problemList[j].region.label, this.state.lang)) : ''
            data[5] = getLabelText(problemList[j].planningUnit.label, this.state.lang)
            data[6] = (problemList[j].dt != null) ? (moment(problemList[j].dt).format('MMM-YY')) : ''
            // data[7] = moment(problemList[j].createdDate).format('MMM-YY')
            data[7] = problemList[j].problemCategory.id
            data[8] = getProblemDesc(problemList[j], this.state.lang)
            data[9] = getSuggestion(problemList[j], this.state.lang)
            // data[10] = getLabelText(problemList[j].problemStatus.label, this.state.lang)
            data[10] = problemList[j].problemStatus.id
            data[11] = this.getNote(problemList[j], this.state.lang)
            data[12] = problemList[j].problemStatus.id
            data[13] = problemList[j].planningUnit.id
            data[14] = problemList[j].realmProblem.problem.problemId
            data[15] = problemList[j].realmProblem.problem.actionUrl
            data[16] = problemList[j].realmProblem.criticality.id
            data[17] = problemList[j].reviewed
            data[20] = getLabelText(problemList[j].realmProblem.criticality.label, this.state.lang)
            // data[20] = problemList[j].problemType.id
            data[18] = problemList[j].reviewNotes != null ? problemList[j].reviewNotes : ''
            data[19] = (problemList[j].reviewedDate != null && problemList[j].reviewedDate != '') ? moment(problemList[j].reviewedDate).format(`${DATE_FORMAT_CAP}`) : ''
            data[21] = 0
            problemArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = problemArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [10, 10, 10, 10, 10, 100, 10, 50, 180, 180, 50, 100, 10, 10, 10, 10, 10, 50, 100, 50, 50],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'problemReportId',
                    type: 'hidden',
                },
                {
                    title: 'problemActionIndex',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.program.programCode'),
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.program.versionId'),
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.region.region'),
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                    readOnly: true,
                },
                {
                    title: i18n.t('static.report.month'),
                    type: 'hidden',
                },
                // {
                //     title: i18n.t('static.report.createdDate'),
                //     type: 'hidden',
                // },
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
                },
                {
                    title: i18n.t('static.report.suggession'),
                    type: 'text',
                    readOnly: true,
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
                },
                {
                    title: i18n.t('static.common.action'),
                    type: 'hidden',
                },
                {
                    title: 'planningUnitId',
                    type: 'hidden',
                },
                {
                    title: 'problemId',
                    type: 'hidden',
                },
                {
                    title: 'actionUrl',
                    type: 'hidden',
                },

                {
                    title: 'Problem Type',
                    type: 'hidden',
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
                    title: 'isChanged',
                    type: 'hidden',
                },
            ],
            editable: true,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            filters: true,
            license: JEXCEL_PRO_KEY,
            // oneditionend: this.onedit,
            onchange: this.rowChanged,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                var items = [];

                if (y != null) {
                    // console.log("in context menue===>", this.el.getValueFromCoords(12, y));
                    // if (obj.options.allowInsertRow == true && (this.el.getValueFromCoords(12, y) != 4 && this.el.getValueFromCoords(12, y) != 2)) {
                    if (obj.options.allowInsertRow == true) {
                        // items.push({
                        //     title: i18n.t('static.report.problemDescription'),
                        //     onclick: function () {
                        //         var rowData = obj.getRowData(y);
                        //         this.toggleProblemDetails(rowData[0], rowData[1]);
                        //     }.bind(this)
                        // });
                        items.push({
                            title: i18n.t('static.report.problemTransDetails'),
                            onclick: function () {
                                var rowData = obj.getRowData(y);
                                this.toggleLarge(rowData[0], rowData[1]);
                            }.bind(this)
                        });

                        // items.push({
                        //     title: i18n.t('static.problemContext.editProblem'),
                        //     onclick: function () {
                        //         // let problemStatusId = document.getElementById('problemStatusId').value;
                        //         let problemTypeId = document.getElementById('problemTypeId').value;
                        //         var index = 0;
                        //         if (this.el.getValueFromCoords(1, y) == "") {
                        //             var index = 0;
                        //         } else {
                        //             index = this.el.getValueFromCoords(1, y);
                        //         }
                        //         console.log("URL====>", `/report/editProblem/${this.el.getValueFromCoords(0, y)}/${this.state.programId}/${index}/${this.el.getValueFromCoords(12, y)}/${this.el.getValueFromCoords(17, y)}`);
                        //         this.props.history.push({
                        //             pathname: `/report/editProblem/${this.el.getValueFromCoords(0, y)}/${this.state.programId}/${index}/${this.el.getValueFromCoords(12, y)}/${this.el.getValueFromCoords(17, y)}`,
                        //         });
                        //         // this.props.history.push({
                        //         //     pathname: `/report/editProblem/${this.el.getValueFromCoords(0, x)}/${this.state.programId}/${index}/${problemStatusId}/${problemTypeId}`,
                        //         // });


                        //         // console.log("onclick------>", this.el.getValueFromCoords(12, y));
                        //         // var planningunitId = this.el.getValueFromCoords(13, y);
                        //         // var programId = document.getElementById('programId').value;
                        //         // var versionId = this.el.getValueFromCoords(3, y)
                        //         // window.open(window.location.origin + `/#${this.el.getValueFromCoords(15, y)}/${programId}/${versionId}/${planningunitId}`);
                        //     }.bind(this)
                        // });
                    }
                }
                return items;
            }.bind(this),
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                var lastY = -1;
                if (y != null && lastY != y) {
                    var rowData = elInstance.getRowData(y);
                    // if (rowData[12] != -1 && rowData[12] !== "" && rowData[12] != undefined) {
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
                    // }
                }
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            loading: false, languageEl: languageEl
        })
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV(columns) {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"');
        csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.report.problemStatus') + ' : ' + document.getElementById("problemStatusId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
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
        // headers.push(i18n.t('static.program.versionId').replaceAll(' ', '%20'));
        // headers.push(i18n.t('static.program.programCode').replaceAll(' ', '%20'));
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
        // columns.map((item, idx) => { item.hidden == true ? '' : headers[idx] = ((item.text).replaceAll(' ', '%20'))});
        var A = [this.addDoubleQuoteToRowContent(headers)];
        this.state.data.map(
            ele => A.push(this.addDoubleQuoteToRowContent([
                // (ele.program.code).replaceAll(' ', '%20'),
                // ele.versionId,
                getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.problemCategory.label, this.state.lang).replaceAll(' ', '%20'),
                getProblemDesc(ele, this.state.lang).replaceAll(' ', '%20'),
                getSuggestion(ele, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.problemStatus.label, this.state.lang).replaceAll(' ', '%20'),
                // this.getNote(ele, this.state.lang).replaceAll(' ', '%20'),
                this.getNote(ele, this.state.lang) == null ? "" : this.getNote(ele, this.state.lang).replaceAll(' ', '%20'),
                ele.reviewed == false ? i18n.t('static.program.no') : i18n.t('static.program.yes'),
                ele.reviewNotes == null ? '' : (ele.reviewNotes).replaceAll(' ', '%20'),
                (ele.reviewedDate == "" || ele.reviewedDate == null) ? '' : moment(ele.reviewedDate).format(`${DATE_FORMAT_CAP}`).replaceAll(' ', '%20'),
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

    exportPDF(columns) {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()

            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6)
                doc.setPage(i)
                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })

                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })

                    // doc.text(i18n.t('static.report.problemStatus') + ' : ' + document.getElementById("problemStatusId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                    //     align: 'left'
                    // })
                    var statusText = doc.splitTextToSize((i18n.t('static.report.problemStatus') + ' : ' + (this.state.problemStatusValues.map(ele => ele.label)).join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 130, statusText)

                    doc.text(i18n.t('static.report.problemType') + ' : ' + document.getElementById("problemTypeId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.problemActionReport.problemCategory') + ' : ' + document.getElementById("problemCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
                        align: 'left'
                    })

                }



            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const title = i18n.t('static.report.qatProblemActionReport');
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;

        const headers = [];
        // headers.push(i18n.t('static.program.programCode'));
        // headers.push(i18n.t('static.program.versionId'));
        headers.push(i18n.t('static.planningunit.planningunit'));
        // headers.push(i18n.t('static.report.createdDate'));
        headers.push(i18n.t('static.problemActionReport.problemCategory'));
        headers.push(i18n.t('static.report.problemDescription'));
        headers.push(i18n.t('static.report.suggession'));
        headers.push(i18n.t('static.report.problemStatus'));
        headers.push(i18n.t('static.program.notes'));

        headers.push(i18n.t('static.supplyPlanReview.review'));
        headers.push(i18n.t('static.report.reviewNotes'));
        headers.push(i18n.t('static.report.reviewedDate'));

        headers.push(i18n.t('static.problemAction.criticality'));
        // columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.data.map(ele => [
            // (ele.program.code),
            // ele.versionId,
            getLabelText(ele.planningUnit.label, this.state.lang),
            // moment(ele.createdDate).format('MMM-YY'),
            getLabelText(ele.problemCategory.label, this.state.lang),
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
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 50 },
                2: { cellWidth: 100 },
                3: { cellWidth: 140 },
                4: { cellWidth: 30 },
                5: { cellWidth: 140 },
                6: { cellWidth: 30 },
                7: { cellWidth: 130 },
                8: { cellWidth: 50 },
                9: { cellWidth: 40 },

            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.qatProblemActionReport') + '.pdf')
    }

    selected = function (instance, cell, x, y, value) {
        // console.log("y+++", y);
        if (y == 5 || y == 7 || y == 8 || y == 9) {
            if ((x == 0 && value != 0) || (y == 0)) {
                // console.log("HEADER SELECTION--------------------------");
            } else {
                // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
                if (this.state.data.length != 0) {
                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROBLEM')) {
                        // console.log("this.el.getValueFromCoords(12, y)===>", this.el.getRowData(x));
                        if (this.el.getValueFromCoords(12, x) != 4 && this.el.getValueFromCoords(12, x) != 2) {
                            // console.log("onclick------>", this.el.getValueFromCoords(12, x));
                            var planningunitId = this.el.getValueFromCoords(13, x);
                            var programId = document.getElementById('programId').value;
                            var versionId = this.el.getValueFromCoords(3, x)
                            window.open(window.location.origin + `/#${this.el.getValueFromCoords(15, x)}/${programId}/${versionId}/${planningunitId}`);
                            // let problemStatusId = document.getElementById('problemStatusId').value;
                            // let problemTypeId = document.getElementById('problemTypeId').value;
                            // var index = 0;
                            // if (this.el.getValueFromCoords(1, x) == "") {
                            //     var index = 0;
                            // } else {
                            //     index = this.el.getValueFromCoords(1, x);
                            // }
                            // console.log("URL====>", `/report/editProblem/${this.el.getValueFromCoords(0, x)}/${this.state.programId}/${index}/${this.el.getValueFromCoords(12, x)}/${this.el.getValueFromCoords(17, x)}`);
                            // this.props.history.push({
                            //     pathname: `/report/editProblem/${this.el.getValueFromCoords(0, x)}/${this.state.programId}/${index}/${this.el.getValueFromCoords(12, x)}/${this.el.getValueFromCoords(17, x)}`,
                            // });
                            // this.props.history.push({
                            //     pathname: `/report/editProblem/${this.el.getValueFromCoords(0, x)}/${this.state.programId}/${index}/${problemStatusId}/${problemTypeId}`,
                            // });
                        }

                    }
                }
            }
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {

        jExcelLoadedFunction(instance);

        var elInstance = instance.jexcel;
        var json = elInstance.getJson();
        for (var j = 0; j < json.length; j++) {
            // var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'S']
            var colArr = ['U']
            var rowData = elInstance.getRowData(j);
            var criticalityId = rowData[16];
            var problemStatusId = rowData[12];
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

    getProblemListAfterCalculation() {
        this.setState({
            data: [],
            message: '',
            loading: true
        },
            () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
        // alert("hello");

        let programId = document.getElementById('programId').value;
        this.setState({ programId: programId });
        if (programId != 0) {
            localStorage.setItem("sesProgramId", programId);
            this.refs.problemListChild.qatProblemActions(programId, "loading", false);
        } else {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [], loading: false });
        }

    }
    fetchData() {
        // alert("hi 2");

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
                    this.el.destroy();
                    localStorage.setItem("sesProblemType", document.getElementById('problemTypeId').value);
                    localStorage.setItem("sesProblemCategory", document.getElementById('problemCategoryId').value);
                    localStorage.setItem("sesReviewed", document.getElementById('reviewedStatusId').value);
                    localStorage.setItem("sesProgramId", document.getElementById('programId').value);
                });
            let programId = document.getElementById('programId').value;
            // let problemStatusId = document.getElementById('problemStatusId').value;
            let problemStatusIds = this.state.problemStatusValues.map(ele => (ele.value));
            // let problemStatusId =-1;
            let problemTypeId = document.getElementById('problemTypeId').value;
            let problemCategoryId = document.getElementById('problemCategoryId').value;
            let reviewedCheck = document.getElementById('reviewedStatusId').value;

            this.setState({ programId: programId });
            if (parseInt(programId) != 0 && problemStatusIds != [] && problemTypeId != 0 && problemCategoryId != 0) {

                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                var procurementAgentList = [];
                var fundingSourceList = [];
                var budgetList = [];
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
                                console.log("callback")
                            })
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);

                        var problemReportList = (programJson.problemReportList);
                        this.setState({
                            problemReportListUnFiltered: problemReportList,
                            showProblemDashboard: 1
                        })
                        var problemReportFilterList = problemReportList;
                        console.log("problemList===========>", problemReportList);
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
                        this.el.destroy();
                    });
            }
            else if (problemStatusIds != []) {
                this.setState({ message: i18n.t('static.report.selectProblemStatus'), data: [], loading: false },
                    () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        this.el.destroy();
                    });
            }
            else if (problemTypeId == 0) {
                this.setState({ message: i18n.t('static.report.selectProblemType'), data: [], loading: false },
                    () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        this.el.destroy();
                    });
            }
        }
    }

    // editProblem(problem, index) {
    //     if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROBLEM')) {
    //         let problemStatusId = document.getElementById('problemStatusId').value;
    //         let problemTypeId = document.getElementById('problemTypeId').value;
    //         this.props.history.push({
    //             pathname: `/report/editProblem/${problem.problemReportId}/ ${this.state.programId}/${problem.problemActionIndex}/${problemStatusId}/${problemTypeId}`,
    //             // state: { language }
    //         });
    //     }

    // }

    addMannualProblem() {
        console.log("-------------------addNewProblem--------------------");
        this.props.history.push("/report/addProblem");
        // this.props.history.push("/role/addRole");
    }

    buttonFormatter(cell, row) {
        if (row.problemStatus.id == 2) {
            return <span></span>
        } else {
            return <Button type="button" size="sm" onClick={(event) => this.addMapping(event, cell, row)} color="info"><i className="fa fa-pencil"></i></Button>;
        }

    }

    addMapping(event, cell, row) {

        var planningunitId = row.planningUnit.id;
        var programId = document.getElementById('programId').value;
        var versionId = row.versionId
        event.stopPropagation();
        // if (row.realmProblem.problem.problemId != 2) {
        alert(`${cell}/${programId}/${versionId}/${planningunitId}`);
        this.props.history.push({
            // pathname: `/programProduct/addProgramProduct/${cell}`,
            // pathname: `/report/addProblem`,
            pathname: `${cell}/${programId}/${versionId}/${planningunitId}`,
        });
        // } else {
        //     this.props.history.push({
        //         pathname: `${cell}`,
        //     });
        // }


    }

    getNote(row, lang) {
        var transList = row.problemTransList.filter(c => c.reviewed == false);
        var listLength = transList.length;
        return transList[listLength - 1].notes;
    }
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
            console.log('***', event)
            var problemStatusIds = event
            problemStatusIds = problemStatusIds.sort(function (a, b) {
                return parseInt(a.value) - parseInt(b.value);
            })
            this.setState({
                problemStatusValues: problemStatusIds.map(ele => ele),
                problemStatusLabels: problemStatusIds.map(ele => ele.label),
                showUpdateButton: false
            }, () => {
                console.log("problemStatusValues===>", this.state.problemStatusValues);
                localStorage.setItem("sesProblemStatus", JSON.stringify(this.state.problemStatusValues));
                this.fetchData()
            })
        }

    }

    render() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const lan = 'en';
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        // const { problemStatusList } = this.state;
        // let problemStatus = problemStatusList.length > 0
        //     && problemStatusList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.id}>{item.name}</option>
        //         )
        //     }, this);

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

        const columns = [
            {
                dataField: 'program.programCode',
                text: i18n.t('static.program.programCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                // formatter: (cell, row) => {
                //     return getLabelText(cell, this.state.lang);
                // }
            },
            {
                dataField: 'versionId',
                text: i18n.t('static.program.versionId'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '60px' },
            },
            {
                dataField: 'region.label',
                text: i18n.t('static.region.region'),
                hidden: true,
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }

            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.planningunit.planningunit'),
                sort: true,
                hidden: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'dt',
                text: i18n.t('static.report.month'),
                sort: true,
                hidden: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        var modifiedDate = moment(cell).format('MMM-YY');
                        return modifiedDate;
                    }
                }
            },
            {
                dataField: 'createdDate',
                text: i18n.t('static.report.createdDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        var modifiedDate = moment(cell).format('MMM-YY');
                        console.log("date===>", modifiedDate);
                        return modifiedDate;
                    }
                }
            },
            {
                dataField: 'realmProblem.problem.label',
                text: i18n.t('static.report.problemDescription'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '230px' },
                formatter: (cell, row) => {
                    return getProblemDesc(row, this.state.lang);
                }
            },
            {
                dataField: 'realmProblem.problem.actionLabel',
                text: i18n.t('static.report.suggession'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '250px' },
                formatter: (cell, row) => {
                    // return getLabelText(cell, this.state.lang);
                    return getSuggestion(row, this.state.lang);
                }
            },
            {
                dataField: 'problemStatus.label',
                text: i18n.t('static.report.problemStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '90px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'problemTransList',
                text: i18n.t('static.program.notes'),
                sort: true,
                align: 'center',
                style: { width: '100px' },
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return this.getNote(row, this.state.lang);
                }
            },
            {
                dataField: 'realmProblem.problem.actionUrl',
                text: i18n.t('static.common.action'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '50px' },
                formatter: this.buttonFormatter
            }

        ];
        const options = {
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
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.data.length
            }]
        }

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
                {/* <QatProblemActions ref="problemListChild" updateState={this.updateState} fetchData={this.fetchData} objectStore="programData"></QatProblemActions> */}
                <Prompt
                    when={this.state.showUpdateButton == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.fetchData} objectStore="programData"></QatProblemActionNew>
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card>
                    <ProblemListFormulas ref="formulaeChild" />
                    <div className="Card-header-addicon problemListMarginTop">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a className="card-header-action">
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.report.problemReportStatusDetails')}</small></span>
                                    {/* <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link> */}
                                </a>
                                {this.state.data.length > 0 && <img style={{ verticalAlign: 'bottom', height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />} &nbsp;
                                {this.state.data.length > 0 && <img style={{ verticalAlign: 'bottom', height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />} &nbsp;
                                {this.state.programId != 0 && <a href="javascript:void();" title={i18n.t('static.qpl.recalculate')} onClick={this.getProblemListAfterCalculation}><i className="fa fa-refresh"></i></a>}
                                &nbsp;&nbsp;
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROBLEM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addMannualProblem}><i className="fa fa-plus-square"></i></a>}

                            </div>
                        </div>
                    </div>
                    {/* {this.state.data.length > 0 && <div className="Card-header-reporticon">
                        <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />
                        </div>
                    </div>} */}
                    <CardBody className="pb-lg-5 pt-lg-0">
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
                                                // onChange={(e) => { this.getProblemListAfterCalculation() }}
                                                onChange={(e) => { this.fetchData() }}
                                            >
                                                {/* <option value="0">Please select</option> */}
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programs}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                {/* <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.problemStatus')}</Label>
                                    <div className="controls problemListSelectField">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                name="problemStatusId" id="problemStatusId"
                                                onChange={this.fetchData}
                                            // value={1}
                                            >
                                                <option value="-1">{i18n.t("static.problemList.problemStatus")}</option>
                                                {problemStatus}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup> */}
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
                                                {/* <option value="3">Automatic / Manual</option> */}
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
                        {/* {this.state.data.length > 0 &&  */}
                        <FormGroup className="col-md-6 mt-5 pl-0" >
                            <ul className="legendcommitversion list-group">
                                <li><span className="problemList-red legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.high')}</span></li>
                                <li><span className="problemList-orange legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.medium')}</span></li>
                                <li><span className="problemList-yellow legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.low')} </span></li>
                            </ul>
                        </FormGroup>
                        <div className="" style={{ display: this.state.loading ? "none" : "block" }}>
                            {this.state.showProblemDashboard == 1 && <ProblemListDashboard problemListUnFilttered={this.state.problemReportListUnFiltered} problemCategoryList={this.state.problemCategoryList} problemStatusList={this.state.problemStatusList} />}

                            {/* <div className="ProgramListSearch"> */}
                            <div id="tableDiv">
                            </div>
                            {/* </div> */}
                        </div>
                    </CardBody>
                    <CardFooter>
                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => this.cancelClicked(id)}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        {this.state.showUpdateButton && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.updateChangedProblems}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>}
                    </CardFooter>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
                {/* Problem Transaction details modal */}
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
                                            {/* <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active" ><b>{i18n.t('static.report.problemTransDetails')}</b></a></li></ul> */}
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
                                                    // rowEvents={{
                                                    //     onClick: (e, row, rowIndex) => {
                                                    //         this.editProblem(row);
                                                    //     }
                                                    // }}
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
                {/* Problem Transaction details modal */}

                {/* Problem details  modal */}
                <Modal isOpen={this.state.problemDetailsModal}
                    className={'modal-md modalWidthExpiredStock'}>
                    <ModalHeader toggle={() => this.toggleProblemDetails()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.report.problemDescription')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            {this.state.problemDetailsModal && <div className="row">
                                <FormGroup className="col-md-6 ">
                                    <Label for="program">{i18n.t('static.program.program')}</Label>
                                    <Input type="text"
                                        readOnly
                                        value={this.state.problemDetail.program.code}
                                    />

                                </FormGroup>
                                <FormGroup className="col-md-6 ">
                                    <Label for="planningunit">{i18n.t('static.planningunit.planningunit')}</Label>
                                    <Input type="text"
                                        bsSize="sm"
                                        readOnly
                                        value={getLabelText(this.state.problemDetail.planningUnit.label, this.state.lang)}
                                    />
                                </FormGroup>
                            </div>
                            }
                        </ModalBody>
                        <ModalFooter>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.toggleProblemDetails()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </div>
                </Modal>
                {/* Problem  details modal */}
            </div >
        );
    }

    cancelClicked(id) {
        this.props.history.push(`/ApplicationDashboard/` + id + '/red/' + i18n.t('static.message.cancelled', { entityname }));
    }

}



