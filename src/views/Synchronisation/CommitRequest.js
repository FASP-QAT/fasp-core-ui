import React from "react";
import {
    Card, CardBody,
    Label, FormGroup,
    Form
} from 'reactstrap';
import { Formik } from 'formik';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions.js";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY } from '../../Constants.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import 'react-select/dist/react-select.min.css';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import moment from "moment";
import ProgramService from "../../api/ProgramService.js";
import MultiSelect from 'react-multi-select-component';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js'
import AuthenticationService from "../Common/AuthenticationService";
// import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions.js";

export default class CommitRequest extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        var startDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD")
        this.state = {
            loading: true,
            lang: localStorage.getItem("lang"),
            rangeValue: localStorage.getItem("sesRangeValue") != "" ? JSON.parse(localStorage.getItem("sesRangeValue")) : { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            programValues: [],
            programs: [],
            localProgramsList: []

        }
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
        this.handleChangeProgram = this.handleChangeProgram.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.loaded = this.loaded.bind(this);
    }

    handleChangeProgram(programIds) {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
        }, () => {
            if (programIds.length > 0) {
                this.fetchData();
            } else {
                if (this.state.tableEl != "" && this.state.tableEl != undefined) {
                    this.state.tableEl.destroy();
                }
            }
        })

    }

    fetchData() {
        if (this.state.tableEl != "" && this.state.tableEl != undefined) {
            this.state.tableEl.destroy();
        }
        var rangeValue = this.state.rangeValue;
        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        var programIds = [];
        this.state.programValues.map(c => programIds.push(c.value));
        var json = {
            startDate: startDate,
            stopDate: stopDate,
            programIds: programIds
        }
        ProgramService.getCommitRequests(json, -1)
            .then(response => {
                var responseData = response.data;
                console.log("responseData+++", responseData)
                var json = [];
                for (var sb = 0; sb < responseData.length; sb++) {
                    var data = [];
                    data[0] = getLabelText(responseData[sb].program.label, this.state.lang); //A
                    data[1] = responseData[sb].committedVersionId;
                    data[2] = getLabelText(responseData[sb].versionType.label, this.state.lang);
                    data[3] = responseData[sb].notes; //C
                    data[4] = responseData[sb].createdBy.username; //E
                    data[5] = moment(responseData[sb].createdDate).format("YYYY-MM-DD HH:mm:ss"); //F
                    data[6] = responseData[sb].status == 1 ? i18n.t("static.commitReqiest.statusPending") : responseData[sb].status == 2 ? i18n.t("static.commitReqiest.statusCompleted") : i18n.t("static.commitReqiest.statusFailed");
                    data[7] = responseData[sb].status == 2 ? moment(responseData[sb].completedDate).format("YYYY-MM-DD HH:mm:ss") : null; //F
                    data[8] = responseData[sb].status == 1 ? (1 / 3) * 100 : (responseData[sb].status == 2 && (this.state.localProgramsList.filter(c => c.programId == responseData[sb].program.id && c.versionId == responseData[sb].committedVersionId).length > 0)) ? (2 / 3) * 100 : (3 / 3) * 100;
                    data[9] = (responseData[sb].status == 2 && (this.state.localProgramsList.filter(c => c.programId == responseData[sb].program.id && c.versionId == responseData[sb].committedVersionId).length > 0)) ? 1 : 0;
                    data[10] = responseData[sb].program.id
                    json.push(data);
                }
                var options = {
                    data: json,
                    columnDrag: true,
                    columns: [
                        { title: i18n.t('static.dataSource.program'), type: 'text', width: 100 },
                        { title: i18n.t('static.program.version'), type: 'text', type: 'numeric', mask: '#,##', width: 80 },
                        { title: i18n.t('static.report.versiontype'), type: 'text', width: 100 },
                        { title: i18n.t('static.common.note'), type: 'text', width: 200 },
                        { title: i18n.t('static.report.createdBy'), type: 'text', width: 100 },
                        { title: i18n.t('static.report.createdDate'), type: 'calendar', options: { isTime: 1, format: "DD-Mon-YY HH24:MM PM" }, width: 100 },
                        { title: i18n.t('static.status.status'), type: 'text', width: 100 },
                        { title: i18n.t('static.commitRequest.completedDate'), type: 'calendar', options: { isTime: 1, format: "DD-Mon-YY HH24:MM PM" }, width: 100 },
                        { title: i18n.t('static.commitRequest.commitProgress'), type: 'progressbar', width: 100 },
                        { title: "Clickable", type: 'hidden', width: 100 },
                        { title: "Program Id", type: 'hidden', width: 100 },
                    ],
                    text: {
                        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
                    oneditionend: this.onedit,
                    copyCompatibility: true,
                    allowExport: false,
                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                    position: 'top',
                    editable: false,
                    filters: true,
                    license: JEXCEL_PRO_KEY,
                    contextMenu: function (obj, x, y, e) {

                    }.bind(this),

                };
                var elVar = jexcel(document.getElementById("tableData"), options);
                this.el = elVar;
                this.setState({
                    tableEl: elVar
                })
            }).catch(
                error => {
                    this.setState({
                        loading: false
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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

    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            var elInstance = instance.jexcel;
            var rowData = elInstance.getRowData(x);
            let clickable = rowData[9];
            console.log("Clickable+++", clickable);
            if (clickable == 1) {
                this.setState({ loading: true });
                var checkboxesChecked = [];
                var programIdsToSyncArray = [];
                checkboxesChecked.push({ programId: rowData[10], versionId: -1 })

                // checkboxesChecked.push({ programId: programId, versionId: -1 })
                ProgramService.getAllProgramData(checkboxesChecked)
                    .then(response => {
                        console.log("Resposne+++", response);
                        var json = response.data;
                        var updatedJson = [];
                        for (var r = 0; r < json.length; r++) {
                            var planningUnitList = json[r].planningUnitList;
                            var consumptionList = json[r].consumptionList;
                            var inventoryList = json[r].inventoryList;
                            var shipmentList = json[r].shipmentList;
                            var batchInfoList = json[r].batchInfoList;
                            var problemReportList = json[r].problemReportList;
                            var supplyPlan = json[r].supplyPlan;
                            var generalData = json[r];
                            delete generalData.consumptionList;
                            delete generalData.inventoryList;
                            delete generalData.shipmentList;
                            delete generalData.batchInfoList;
                            delete generalData.supplyPlan;
                            delete generalData.planningUnitList;
                            generalData.actionList = [];
                            var generalEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(generalData), SECRET_KEY).toString();
                            var planningUnitDataList = [];
                            for (var pu = 0; pu < planningUnitList.length; pu++) {
                                // console.log("json[r].consumptionList.filter(c => c.planningUnit.id == planningUnitList[pu].id)+++",programDataJson);
                                // console.log("json[r].consumptionList.filter(c => c.planningUnit.id == planningUnitList[pu].id)+++",programDataJson.consumptionList);
                                var planningUnitDataJson = {
                                    consumptionList: consumptionList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
                                    inventoryList: inventoryList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
                                    shipmentList: shipmentList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
                                    batchInfoList: batchInfoList.filter(c => c.planningUnitId == planningUnitList[pu].id),
                                    supplyPlan: supplyPlan.filter(c => c.planningUnitId == planningUnitList[pu].id)
                                }
                                var encryptedPlanningUnitDataText = CryptoJS.AES.encrypt(JSON.stringify(planningUnitDataJson), SECRET_KEY).toString();
                                planningUnitDataList.push({ planningUnitId: planningUnitList[pu].id, planningUnitData: encryptedPlanningUnitDataText })
                            }
                            var programDataJson = {
                                generalData: generalEncryptedData,
                                planningUnitDataList: planningUnitDataList
                            };
                            updatedJson.push(programDataJson);
                        }
                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
                            var program = transaction.objectStore('programQPLDetails');
                            var getRequest = program.getAll();
                            getRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext'),
                                    color: 'red'
                                })
                                this.hideFirstComponent()
                            }.bind(this);
                            getRequest.onsuccess = function (event) {
                                var myResult = [];
                                myResult = getRequest.result;
                                var userId = AuthenticationService.getLoggedInUserId();
                                console.log("Myresult+++", myResult);

                                var programDataTransaction1 = db1.transaction(['programData'], 'readwrite');
                                var programDataOs1 = programDataTransaction1.objectStore('programData');
                                for (var dpd = 0; dpd < checkboxesChecked.length; dpd++) {
                                    var rowData = elInstance.getRowData(x);
                                    var checkIfProgramExists = myResult.filter(c => c.programId == rowData[10] && c.version == rowData[1] && c.readonly == 1 && c.userId == userId);
                                    console.log("checkIfProgramExists+++", checkIfProgramExists);
                                    var programIdToDelete = 0;
                                    if (checkIfProgramExists.length > 0) {
                                        programIdToDelete = checkIfProgramExists[0].id;
                                    }
                                    var programRequest1 = programDataOs1.delete(checkIfProgramExists[0].id);
                                }
                                programDataTransaction1.oncomplete = function (event) {
                                    var programDataTransaction3 = db1.transaction(['programQPLDetails'], 'readwrite');
                                    var programDataOs3 = programDataTransaction3.objectStore('programQPLDetails');

                                    for (var dpd = 0; dpd < checkboxesChecked.length; dpd++) {
                                        var rowData = elInstance.getRowData(x);
                                        var checkIfProgramExists = myResult.filter(c => c.programId == rowData[10] && c.version == rowData[1] && c.readonly == 1 && c.userId == userId);
                                        console.log("checkIfProgramExists+++", checkIfProgramExists);
                                        var programIdToDelete = 0;
                                        if (checkIfProgramExists.length > 0) {
                                            programIdToDelete = checkIfProgramExists[0].id;
                                        }
                                        var programRequest3 = programDataOs3.delete(checkIfProgramExists[0].id);
                                    }
                                    programDataTransaction3.oncomplete = function (event) {
                                        var programDataTransaction2 = db1.transaction(['downloadedProgramData'], 'readwrite');
                                        var programDataOs2 = programDataTransaction2.objectStore('downloadedProgramData');

                                        for (var dpd = 0; dpd < checkboxesChecked.length; dpd++) {
                                            var rowData = elInstance.getRowData(x);
                                            var checkIfProgramExists = myResult.filter(c => c.programId == rowData[10] && c.version == rowData[1] && c.readonly == 1 && c.userId == userId);
                                            console.log("checkIfProgramExists+++", checkIfProgramExists);
                                            var programIdToDelete = 0;
                                            if (checkIfProgramExists.length > 0) {
                                                programIdToDelete = checkIfProgramExists[0].id;
                                            }
                                            var programRequest2 = programDataOs2.delete(checkIfProgramExists[0].id);
                                        }
                                        programDataTransaction2.oncomplete = function (event) {

                                            var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                            var programSaveData = transactionForSavingData.objectStore('programData');
                                            for (var r = 0; r < json.length; r++) {
                                                json[r].actionList = [];
                                                // json[r].openCount = 0;
                                                // json[r].addressedCount = 0;
                                                // json[r].programCode = json[r].programCode;
                                                // var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[r]), SECRET_KEY);
                                                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                var version = json[r].requestedProgramVersion;
                                                if (version == -1) {
                                                    version = json[r].currentVersion.versionId
                                                }
                                                var item = {
                                                    id: json[r].programId + "_v" + version + "_uId_" + userId,
                                                    programId: json[r].programId,
                                                    version: version,
                                                    programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                                    programData: updatedJson[r],
                                                    userId: userId,
                                                    programCode: json[r].programCode,
                                                    // openCount: 0,
                                                    // addressedCount: 0
                                                };
                                                programIdsToSyncArray.push(json[r].programId + "_v" + version + "_uId_" + userId)
                                                // console.log("Item------------>", item);
                                                var putRequest = programSaveData.put(item);

                                            }
                                            transactionForSavingData.oncomplete = function (event) {
                                                var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                                                var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');
                                                for (var r = 0; r < json.length; r++) {
                                                    // var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[r]), SECRET_KEY);
                                                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                    var version = json[r].requestedProgramVersion;
                                                    if (version == -1) {
                                                        version = json[r].currentVersion.versionId
                                                    }
                                                    var item = {
                                                        id: json[r].programId + "_v" + version + "_uId_" + userId,
                                                        programId: json[r].programId,
                                                        version: version,
                                                        programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                                        programData: updatedJson[r],
                                                        userId: userId
                                                    };
                                                    // console.log("Item------------>", item);
                                                    var putRequest = downloadedProgramSaveData.put(item);

                                                }
                                                transactionForSavingDownloadedProgramData.oncomplete = function (event) {
                                                    var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                                                    var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                                                    var programIds = []
                                                    for (var r = 0; r < json.length; r++) {
                                                        var programQPLDetailsJson = {
                                                            id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                                                            programId: json[r].programId,
                                                            version: json[r].currentVersion.versionId,
                                                            userId: userId,
                                                            programCode: json[r].programCode,
                                                            openCount: 0,
                                                            addressedCount: 0,
                                                            programModified: 0,
                                                            readonly: 0
                                                        };
                                                        programIds.push(json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId);
                                                        var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                                    }
                                                    programQPLDetailsTransaction.oncomplete = function (event) {
                                                        this.goToMasterDataSync(programIdsToSyncArray);
                                                    }.bind(this)
                                                }.bind(this)
                                            }.bind(this);
                                        }.bind(this);
                                    }.bind(this);
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    })
            }
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            //   if (this.state.selBudget.length != 0) {
            //     if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_BUDGET')) {
            //       this.props.history.push({
            //         pathname: `/budget/editBudget/${this.el.getValueFromCoords(0, x)}`,
            //       });
            //     }
            //   }
        }
    }.bind(this);

    goToMasterDataSync(programIds) {
        console.log("ProgramIds++++", programIds);
        console.log("this props++++", this)
        console.log("this props++++", this.props)
        this.props.history.push({ pathname: `/masterDataSync/green/` + i18n.t('static.program.downloadsuccess'), state: { "programIds": programIds } });
      }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ rangeValue: value, consumptionChangedFlag: 0 })
            localStorage.setItem("sesRangeValue", JSON.stringify(value));
            this.formSubmit(this.state.planningUnit, value);
        }
    }

    componentDidMount = function () {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].readonly) {
                        proList.push({ programId: myResult[i].programId, versionId: myResult[i].version });
                    }
                }
                ProgramService.getProgramList()
                    .then(response => {
                        console.log(JSON.stringify(response.data))
                        console.log("ProList+++", proList);
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });


                        this.setState({
                            programs: listArray, loading: false, localProgramsList: proList
                        })
                    }).catch(
                        error => {
                            this.setState({
                                programs: [], loading: false
                            })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
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
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
            }.bind(this)
        }.bind(this)
    };

    render() {
        const checkOnline = localStorage.getItem('sessionType');
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const { programs } = this.state;
        let programList = [];
        programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    { label: getLabelText(item.label, this.state.lang), value: item.programId }
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <Card>
                    <CardBody className="pb-lg-5 pt-lg-0">
                        <Formik
                            render={
                                ({
                                }) => (
                                    <Form name='simpleForm'>
                                        <div className=" pl-0">
                                            <div className="row">
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">

                                                        <Picker
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            ref={this.pickRange}
                                                            value={rangeValue}
                                                            lang={pickerLang}
                                                            //theme="light"
                                                            onChange={this.handleRangeChange}
                                                            onDismiss={this.handleRangeDissmis}
                                                        >
                                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>

                                                    <MultiSelect

                                                        bsSize="sm"
                                                        name="programIds"
                                                        id="programIds"
                                                        value={this.state.programValues}
                                                        onChange={(e) => { this.handleChangeProgram(e) }}
                                                        options={programList && programList.length > 0 ? programList : []}
                                                    />
                                                    {!!this.props.error &&
                                                        this.props.touched && (
                                                            <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                        )}

                                                </FormGroup>
                                            </div>
                                        </div>
                                    </Form>
                                )} />

                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            {/* <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="consumptionDataEntry" useLocalData={1} /> */}
                            <div className="table-responsive">
                                <div id="tableData" />
                            </div>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
}
