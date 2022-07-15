import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, CardFooter, FormGroup, Input, InputGroup, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { STRING_TO_DATE_FORMAT, JEXCEL_DATE_FORMAT, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import moment from 'moment';
import i18n from '../../i18n';
import ProgramService from '../../api/ProgramService.js';
import ProductService from '../../api/ProductService';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
import { MultiSelect } from 'react-multi-select-component';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import CryptoJS from 'crypto-js'


const entityname = i18n.t('static.mt.shipmentLinkingNotification');
export default class ShipmentLinkingNotifications extends Component {

    constructor(props) {
        super(props);
        this.state = {
            batchDetails: [],
            notificationSummary: [],
            color: '',
            message: '',
            loading: true,
            loading1: false,
            programs: [],
            planningUnits: [],
            instance: '',
            artmisHistory: [],
            lang: 'en',
            displaySubmitButton: false,
            planningUnitArray: [],
            hasSelectAll: true
        }
        this.displayButton = this.displayButton.bind(this);
        this.filterData = this.filterData.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.getProgramList = this.getProgramList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.programChange = this.programChange.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.filterData1 = this.filterData1.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        // this.buildARTMISHistory = this.buildARTMISHistory.bind(this);
        this.getPlanningUnitArray = this.getPlanningUnitArray.bind(this);
        this.getNotificationSummary = this.getNotificationSummary.bind(this);
        this.buildNotificationSummaryJExcel = this.buildNotificationSummaryJExcel.bind(this);
        this.viewBatchData = this.viewBatchData.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.selectedForNotification = this.selectedForNotification.bind(this)
    }

    viewBatchData(event, row) {
        console.log("event---", event);
        console.log("row---", row);
        console.log("row length---", row.shipmentList.length);
        if (row.shipmentList.length > 1 || (row.shipmentList.length == 1 && row.shipmentList[0].batchNo != null)) {
            var batchDetails = row.shipmentList.filter(c => (c.fileName === row.maxFilename));

            batchDetails.sort(function (a, b) {
                var dateA = new Date(a.expiryDate).getTime();
                var dateB = new Date(b.expiryDate).getTime();
                return dateA > dateB ? 1 : -1;
            })
            this.setState({
                batchDetails
            });
        } else {
            this.setState({
                batchDetails: []
            });
        }
        // batchDetails
    }

    getPlanningUnitArray() {
        let planningUnits = this.state.planningUnits;
        let planningUnitArray = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        this.setState({
            planningUnitArray
        }, () => {
            this.filterData(planningUnitArray);
        })
    }

    displayButton() {
        var validation = true;
        var tableJson = this.el.getJson(null, false).filter(c => c[18] == 1);
        if (validation == true) {

            this.setState({
                displaySubmitButton: (tableJson.length > 0 ? true : false)
            })
        } else {
            this.setState({
                displaySubmitButton: false
            })
        }
    }



    filterData1() {
        this.filterData(this.state.planningUnitIds);
    }
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.actionCancelled'))
    }
    updateDetails() {
        document.getElementById('div2').style.display = 'block';
        var programId = this.state.programId;

        this.setState({ loading: true })
        var validation = true;
        var changedmtList = []
        if (validation == true) {
            var tableJson = this.el.getJson(null, false).filter(c => c[18] == 1);
            for (var i = 0; i < tableJson.length; i++) {
                let json = {
                    addressed: tableJson[i][1],
                    notificationType: {},
                    notificationId: tableJson[i][14],
                    shipmentLinkingId: 0
                }
                changedmtList.push(json);
            }
            console.log("FINAL SUBMIT changedmtList---", changedmtList);
            ManualTaggingService.updateNotification(changedmtList)
                .then(response => {
                    // document.getElementById('div2').style.display = 'block';
                    this.setState({
                        message: i18n.t('static.mt.dataUpdateSuccess'),
                        color: 'green',
                        loading: false,
                        loading1: false,
                        displaySubmitButton: false
                    },
                        () => {
                            this.hideSecondComponent();
                            this.filterData(this.state.planningUnitIds);
                            this.getNotificationSummary();
                        })

                }).catch(
                    error => {
                        console.log("Error@@@@@@@@@@", error)
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                color: '#BA0C2F',
                                loading: false,
                                loading1: false
                            }, () => {
                                this.hideSecondComponent();
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
                                        loading: false,
                                        loading1: false,
                                        color: '#BA0C2F',
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        loading1: false,
                                        color: '#BA0C2F',
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        loading1: false,
                                        color: '#BA0C2F',
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
    }


    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(13, y);
            if (parseInt(value) == 1 && this.el.getValueFromCoords(0, y) == true) {


                var col = ("K").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                var value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                value = value.replace(/,/g, "");
                var notificationType = this.el.getValue(`R${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (notificationType == 2) {
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        console.log("------------------1----------------------")
                        valid = false;
                    } else {
                        // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                        if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                            console.log("------------------2----------------------")
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                            console.log("------------------3----------------------")
                        }

                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    console.log("------------------4----------------------")
                }

            }
        }
        return valid;
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        //conversion factor
        // if (x == 10) {

        //     var col = ("K").concat(parseInt(y) + 1);
        //     value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        //     var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
        //         console.log("------------------5----------------------")
        //     } else {
        //         // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
        //         if (!(reg.test(value))) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, i18n.t('static.message.invalidnumber'));
        //             console.log("------------------6----------------------")
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //             console.log("------------------7----------------------")

        //         }

        //     }
        //     var qty = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        //     this.el.setValueFromCoords(11, y, Math.round(qty * (value != null && value != "" ? value : 1)), true);
        // }

        // // if (x == 9) {

        // // }

        // // //Active
        // if (x != 13) {
        //     this.el.setValueFromCoords(13, y, 1, true);
        //     if (x == 0) {
        //         value = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        //         if (value === "false") {
        //             this.el.setValueFromCoords(10, y, "", true);
        //             this.el.setValueFromCoords(12, y, "", true);
        //             var qty = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        //             this.el.setValueFromCoords(11, y, Math.round(qty), true);
        //             this.el.setStyle(("K").concat(parseInt(y) + 1), "background-color", "transparent");
        //             this.el.setComments(("K").concat(parseInt(y) + 1), "");
        //             console.log("------------------8----------------------")
        //         }
        //     }
        // }
        if (x == 0) {
            this.el.setValueFromCoords(18, y, 1, true);
        }
        this.displayButton();


    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(13, y, 1, true);
    }.bind(this);

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 10 && !isNaN(rowData[10]) && rowData[10].toString().indexOf('.') != -1) {
            // console.log("RESP---------", parseFloat(rowData[3]));
            elInstance.setValueFromCoords(10, y, parseFloat(rowData[10]), true);
        }
        elInstance.setValueFromCoords(13, y, 1, true);
    }


    onPaste(instance, data) {
        if (data.length == 1 && Object.keys(data[0])[2] == "value") {
            (instance.jexcel).setValueFromCoords(10, data[0].y, parseFloat(data[0].value), true);
        }
        else {
            for (var i = 0; i < data.length; i++) {
                (instance.jexcel).setValueFromCoords(13, data[i].y, 1, true);
            }
        }
    }

    programChange(event) {
        if (event.target.value != -1) {
            localStorage.setItem("sesProgramId", event.target.value);
        }
        this.setState({
            programId: event.target.value,
            hasSelectAll: true
        }, () => {
            this.getPlanningUnitList();
        })
    }

    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {

        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);


    }

    componentDidMount() {
        this.hideFirstComponent();
        this.getProgramList();
        this.getNotificationSummary();
    }

    filterData = (planningUnitIds) => {
        document.getElementById('div2').style.display = 'block';
        var programId = this.state.programId;
        var addressed = document.getElementById("addressed").value;

        planningUnitIds = planningUnitIds;
        // .sort(function (a, b) {
        //     return parseInt(a.value) - parseInt(b.value);
        // })
        this.setState({
            hasSelectAll: false,
            planningUnitIds,
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {
            if (programId != -1 && planningUnitIds != null && planningUnitIds != "") {
                this.setState({
                    loading: true,
                    planningUnitIds
                })

                ManualTaggingService.getShipmentLinkingNotification(this.state.programDataJson.programId, this.state.programDataJson.version)
                    .then(response => {
                        let list = (addressed != -1 ? response.data.filter(c => (c.addressed == (addressed == 1 ? true : false))) : response.data);
                        console.log("List@@@@@@@", list)
                        var programDataJson = this.state.programDataJson;
                        console.log("programDataJson@@@@@@@@@@@", programDataJson)
                        var shipmentList = [];
                        var roPrimeNoList = [];
                        var planningUnitDataList = programDataJson.programData.planningUnitDataList;
                        var gprogramDataBytes = CryptoJS.AES.decrypt(programDataJson.programData.generalData, SECRET_KEY);
                        var gprogramData = gprogramDataBytes.toString(CryptoJS.enc.Utf8);
                        var gprogramJson = JSON.parse(gprogramData);
                        var linkedShipmentsList = gprogramJson.shipmentLinkingList != null ? gprogramJson.shipmentLinkingList : []
                        console.log("linkedShipmentsList@@@@@@@@@", linkedShipmentsList);
                        for (var pu = 0; pu < planningUnitIds.length; pu++) {
                            var planningUnitData = planningUnitDataList.filter(c => c.planningUnitId == planningUnitIds[pu].value)[0];
                            var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var planningUnitDataJson = JSON.parse(programData);
                            shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
                        }
                        var outputList = []
                        for (var l = 0; l < list.length; l++) {
                            var linkedShipmentListFilter = linkedShipmentsList.filter(c => c.shipmentLinkingId == list[l].shipmentLinkingId);
                            var shipmentListFilter = shipmentList.filter(c => c.shipmentId == linkedShipmentListFilter[0].childShipmentId);
                            var json = {
                                notificationId: list[l].notificationId,
                                addressed: list[l].addressed,
                                notificationType: list[l].notificationType,
                                active: linkedShipmentListFilter[0].active,
                                parentShipmentId: linkedShipmentListFilter[0].parentShipmentId,
                                childShipmentId: linkedShipmentListFilter[0].childShipmentId,
                                roNo: linkedShipmentListFilter[0].roNo,
                                roPrimeLineNo: linkedShipmentListFilter[0].roPrimeLineNo,
                                orderNo: linkedShipmentListFilter[0].orderNo,
                                primeLineNo: linkedShipmentListFilter[0].primeLineNo,
                                knShipmentNo: linkedShipmentListFilter[0].knShipmentNo,
                                erpPlanningUnit: linkedShipmentListFilter[0].erpPlanningUnit,
                                qatPlanningUnit: shipmentListFilter[0].planningUnit,
                                expectedDeliveryDate: shipmentListFilter[0].expectedDeliveryDate,
                                erpShipmentStatus: linkedShipmentListFilter[0].erpShipmentStatus,
                                shipmentQty: shipmentListFilter[0].shipmentQty,
                                conversionFactor: linkedShipmentListFilter[0].conversionFactor,
                                notes: shipmentListFilter[0].notes,
                                shipmentLinkingId: list[l].shipmentLinkingId
                            }
                            outputList.push(json);
                        }

                        for (var sl = 0; sl < outputList.length; sl++) {
                            roPrimeNoList.push({
                                "roNo": outputList[sl].roNo,
                                "roPrimeLineNo": outputList[sl].roPrimeLineNo
                            })

                        }
                        ManualTaggingService.getDataBasedOnRoNoAndRoPrimeLineNo(roPrimeNoList)
                            .then(response => {
                                console.log("In eklseresponse.data@@@@@@@@@@@@@@", response.data)
                                this.setState({
                                    outputList: outputList,
                                    roPrimeNoListOriginal: response.data
                                }, () => {
                                    this.buildJExcel();
                                });
                            }).catch(
                                error => {
                                }
                            );
                    }).catch(
                        error => {
                            console.log("Error@@@@@@@@@@", error)
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
                                    color: '#BA0C2F',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
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
                                            color: '#BA0C2F',
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent();
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            color: '#BA0C2F',
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent();
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            color: '#BA0C2F',
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent();
                                        });
                                        break;
                                }
                            }
                        }
                    );
            } else {
                this.setState({
                    outputList: []
                }, () => {
                    try {
                        this.state.languageEl.destroy();
                    } catch (error) {

                    }
                })
            }
            // else if (programId == -1) {
            //     console.log("2-programId------>", programId);
            //     this.setState({
            //         outputList: [],
            //         message: i18n.t('static.program.validselectprogramtext'),
            //         color: 'red'
            //     }, () => {
            //         this.el = jexcel(document.getElementById("tableDiv"), '');
            //         this.el.destroy();
            //     });
            // } else if (planningUnitIds != null && planningUnitIds != "") {
            //     console.log("3-programId------>", programId);
            //     this.setState({
            //         outputList: [],
            //         message: i18n.t('static.procurementUnit.validPlanningUnitText'),
            //         color: 'red'
            //     }, () => {
            //         this.el = jexcel(document.getElementById("tableDiv"), '');
            //         this.el.destroy();
            //     });
            // }
        })




    }

    getProgramList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programData);
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version,
                            value: myResult[i].id,
                            programId: myResult[i].programId,
                            version: myResult[i].version
                        }
                        proList.push(programJson)
                    }
                }
                console.log("proList.length@@@@@@@@@@", proList.length)
                if (proList.length == 1) {
                    this.setState({
                        programs: proList,
                        loading: false,
                        programId: proList[0].value
                    }, () => {
                        this.getPlanningUnitList();
                    })
                } else {
                    if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                        this.setState({
                            programs: proList,
                            loading: false,
                            programId: localStorage.getItem("sesProgramId")
                        }, () => {
                            this.getPlanningUnitList();
                        });
                    } else {
                        this.setState({
                            programs: proList,
                            loading: false
                        })
                    }
                }

            }.bind(this)
        }.bind(this)

    }


    // buildARTMISHistory() {
    //     let artmisHistoryList = this.state.artmisHistory;
    //     let artmisHistoryArray = [];
    //     let count = 0;
    //     this.el = jexcel(document.getElementById("tableDiv2"), '');
    //     this.el.destroy();
    //     var json = [];
    //     var data = artmisHistoryArray;

    //     var options = {
    //         data: data,
    //         columnDrag: true,
    //         colWidths: [40, 30, 40, 45, 30, 30, 35, 25, 35],
    //         colHeaderClasses: ["Reqasterisk"],
    //         columns: [

    //             {
    //                 title: i18n.t('static.mt.roNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.mt.roPrimeLineNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.mt.orderNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.mt.primeLineNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {

    //                 title: i18n.t('static.manualTagging.erpPlanningUnit'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.manualTagging.erpStatus'),
    //                 type: 'text',
    //                 readOnly: true
    //             },

    //             {
    //                 title: i18n.t('static.supplyPlan.shipmentQty'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: "Received On",
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //         ],
    //         editable: true,
    //         text: {
    //             showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
    //             show: '',
    //             entries: '',
    //         },
    //         onload: this.loadedERP,
    //         pagination: localStorage.getItem("sesRecordCount"),
    //         search: true,
    //         columnSorting: true,
    //         tableOverflow: true,
    //         wordWrap: true,
    //         allowInsertColumn: false,
    //         allowManualInsertColumn: false,
    //         allowDeleteRow: false,
    //         // onselection: this.selected,
    //         copyCompatibility: true,
    //         allowExport: false,
    //         paginationOptions: JEXCEL_PAGINATION_OPTION,
    //         position: 'top',
    //         filters: true,
    //         license: JEXCEL_PRO_KEY,
    //         contextMenu: function (obj, x, y, e) {
    //             return [];
    //         }.bind(this),
    //     };


    //     var instance = jexcel(document.getElementById("tableDiv2"), options);
    //     this.el = instance;
    //     this.setState({
    //         instance, loading: false
    //     })
    // }

    buildJExcel() {
        let manualTaggingList = this.state.outputList;
        let manualTaggingArray = [];
        let count = 0;

        for (var j = 0; j < manualTaggingList.length; j++) {
            data = [];
            data[0] = manualTaggingList[j].addressed;
            data[1] = manualTaggingList[j].active;
            data[2] = getLabelText(manualTaggingList[j].notificationType.label);
            data[3] = manualTaggingList[j].parentShipmentId + " (" + (manualTaggingList[j].childShipmentId + ")");
            data[4] = manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo + " | " + (manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo) + (manualTaggingList[j].knShipmentNo != "" && manualTaggingList[j].knShipmentNo != null ? " | " + manualTaggingList[j].knShipmentNo : "");
            data[5] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
            data[6] = getLabelText(manualTaggingList[j].qatPlanningUnit.label, this.state.lang)
            data[7] = manualTaggingList[j].expectedDeliveryDate
            data[8] = manualTaggingList[j].erpShipmentStatus
            data[9] = Math.round((manualTaggingList[j].shipmentQty) / (manualTaggingList[j].conversionFactor))
            data[10] = manualTaggingList[j].conversionFactor
            data[11] = `=ROUND(J${parseInt(j) + 1}*K${parseInt(j) + 1},0)`;
            data[12] = manualTaggingList[j].notes
            data[13] = this.state.roPrimeNoListOriginal.filter(c => c.roNo == manualTaggingList[j].roNo && c.roPrimeLineNo == manualTaggingList[j].roPrimeLineNo)[0];
            data[14] = manualTaggingList[j].notificationId;
            data[15] = manualTaggingList[j].shipmentLinkingId;
            data[16] = manualTaggingList[j].roNo;
            data[17] = manualTaggingList[j].roPrimeLineNo;
            data[18] = 0;
            manualTaggingArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = manualTaggingArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [40, 40, 0, 50, 0, 80, 80, 30, 35, 25, 35, 35, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.mt.isAddressed'),
                    type: 'checkbox',
                },
                {
                    title: i18n.t('static.mt.linked'),
                    type: 'checkbox',
                    readOnly: true
                    // readOnly: this.state.versionId.toString().includes("Local") ? false : true
                    // mask: '#,##', decimal: '.'
                },
                {
                    title: i18n.t('static.mt.notificationType'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.mt.parentShipmentId(childShipmentId)'),
                    type: 'numeric',
                    readOnly: true
                    // mask: '#,##', decimal: '.'
                },
                {
                    title: i18n.t('static.manualTagging.RONO'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.erpPlanningUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.qatProduct'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT },
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.status'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.supplyPlan.qty'),
                    type: 'numeric',
                    mask: '#,##', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.conversionFactor'),
                    type: 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                    // readOnly: true
                },

                {
                    title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                    type: 'numeric',
                    mask: '#,##', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Original data",
                    type: 'hidden',
                },
                {
                    title: "Notification Id",
                    type: 'hidden',
                },
                {
                    title: "Shipment Linking Id",
                    type: 'hidden',
                },
                {
                    title: "Order No",
                    type: 'hidden',
                },
                {
                    title: "Prime Line No",
                    type: 'hidden',
                },
                {
                    title: "Changed",
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
            onselection: this.selectedForNotification,
            onchange: this.changed,

            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            updateTable: function (el, cell, x, y, source, value, id) {
                // var elInstance = el.jexcel;
                // if (y != null) {
                //     var rowData = elInstance.getRowData(y);
                //     console.log("RowData@@@@@@@@", rowData)
                //     if (rowData[20] == 1) {
                //         var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                //         cell.classList.add('readonly');
                //         var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                //         cell.classList.add('readonly');
                //         var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                //         cell.classList.add('readonly');
                //         if (rowData[0] == false) {
                //             var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                //             cell.classList.add('readonly');
                //             var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                //             cell.classList.add('readonly');
                //         }
                //     } else {
                //         if (rowData[0] == false) {
                //             var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                //             cell.classList.add('readonly');
                //             var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                //             cell.classList.add('readonly');
                //         } else {
                //             var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                //             cell.classList.remove('readonly');
                //             var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                //             cell.classList.remove('readonly');
                //         }
                //     }
                // }
            }.bind(this),
            onsearch: function (el) {
                el.jexcel.updateTable();
            },
            onfilter: function (el) {
                el.jexcel.updateTable();
            },
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            // title: i18n.t('static.dashboard.linkShipment'),
                            title: i18n.t('static.mt.viewArtmisHistory'),
                            onclick: function () {
                                let roNo = this.el.getValueFromCoords(16, y).toString().trim();
                                let roPrimeLineNo = this.el.getValueFromCoords(17, y).toString().trim();
                                ManualTaggingService.getARTMISHistory(roNo, roPrimeLineNo)
                                    .then(response => {
                                        this.setState({
                                            artmisHistory: response.data
                                        }, () => {
                                            this.toggleLarge();
                                        });
                                    }).catch(
                                        error => {
                                            console.log("Error@@@@@@@@@@", error)
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                }, () => {
                                                    this.hideSecondComponent()
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
                                                        }, () => {
                                                            this.hideSecondComponent()
                                                        });
                                                        break;
                                                    case 412:
                                                        this.setState({
                                                            message: error.response.data.messageCode,
                                                            loading: false
                                                        }, () => {
                                                            this.hideSecondComponent()
                                                        });
                                                        break;
                                                    default:
                                                        this.setState({
                                                            message: 'static.unkownError',
                                                            loading: false
                                                        }, () => {
                                                            this.hideSecondComponent()
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    );
                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this),
        };


        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }
    buildNotificationSummaryJExcel() {
        let notificationSummaryList = this.state.notificationSummary;
        let notificationSummaryArray = [];
        let count = 0;

        for (var j = 0; j < notificationSummaryList.length; j++) {
            data = [];

            data[0] = getLabelText(notificationSummaryList[j].label);
            data[1] = notificationSummaryList[j].notificationCount;
            data[2] = notificationSummaryList[j].programId;
            data[3] = this.state.programs.filter(c => c.programId == notificationSummaryList[j].programId).sort((a, b) => {
                var itemLabelA = a.version;
                var itemLabelB = b.version
                return itemLabelA < itemLabelB ? 1 : -1;
            })[0].value
            notificationSummaryArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv1"), '');
        this.el.destroy();
        var json = [];
        var data = notificationSummaryArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [10, 10],
            columns: [

                {
                    title: i18n.t('static.program.programName'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.mt.notificationCount'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: "programId",
                    type: 'hidden',
                },
                {
                    title: "programId",
                    type: 'hidden',
                }
            ],
            editable: false,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded1,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            // onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };


        var instance = jexcel(document.getElementById("tableDiv1"), options);
        this.el = instance;
        this.setState({
            instance, loading: false
        })
    }

    selectedForNotification = function (instance, cell, x, y, value) {
        if (y != 0) {
            console.log("ProgramId@@@@@@@", this.state.programId.split("_")[0]);
            console.log("VersionId@@@@@@@", this.state.programId.split("_")[1].substring(1) + "  (Local)");
            localStorage.setItem("sesProgramIdReport", this.state.programId.split("_")[0]);
            localStorage.setItem("sesVersionIdReport", this.state.programId.split("_")[1].substring(1) + "  (Local)");

            window.open(window.location.origin + `/#/shipment/manualTagging/2`);
        }
    }

    selected = function (instance, x1, y1, x2, y2, origin) {
        var instance = (instance).jexcel;
        console.log("RESP------>x1", x1);
        console.log("RESP------>y1", y1);
        console.log("RESP------>x2", x2);
        console.log("RESP------>y2", y2);
        console.log("RESP------>origin-x1", instance.getValueFromCoords(2, y1));


        // if (y1 == 0 && y2 != 0) {
        //     console.log("RESP------>Header");
        // } else {
        //     console.log("RESP------>Not");
        //     this.setState({
        //         programId: instance.getValueFromCoords(2, y1)
        //     }, () => {
        //         document.getElementById("addressed").value = 0;
        //         this.getPlanningUnitList();
        //     })
        // }
        let typeofColumn = instance.selectedHeader;
        if (typeof typeofColumn === 'string') {
            console.log("RESP------>Header");
        } else {
            console.log("RESP------>not Header");
            this.setState({
                programId: instance.getValueFromCoords(3, y1)
            }, () => {
                document.getElementById("addressed").value = 0;
                this.getPlanningUnitList();
            })
        }

        // if ((x == 0 && value != 0) || (y == 0)) {
        // // console.log("HEADER SELECTION--------------------------");
        // } else {
        // var instance = (instance).jexcel;
        // console.log("selected instance---", instance)
        // console.log("selected cell---", cell)
        // console.log("selected x---", x)
        // console.log("selected y---", y)
        // console.log("selected value---", value)
        // // console.log("selected program---", this.el);
        // console.log("selected program id---", instance.getValueFromCoords(2, x))
        // if (instance.getValueFromCoords(2, x) != null && instance.getValueFromCoords(2, x) != "") {
        // this.setState({
        // programId: instance.getValueFromCoords(2, x)
        // }, () => {
        // this.getPlanningUnitList();
        // })
        // }
        // }

    }.bind(this)

    loaded1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        console.log("asterisk---", document.getElementsByClassName("resizable")[2])
        var asterisk = document.getElementsByClassName("resizable")[2];

        var tr = asterisk.firstChild;
        tr.children[10].classList.add('AsteriskTheadtrTd');
    }




    getNotificationSummary() {
        ManualTaggingService.getNotificationSummary()
            .then(response => {
                if (response.status == 200) {
                    console.log("notification summary---", response.data);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        notificationSummary: listArray,
                        loading: false
                    }, () => {
                        this.buildNotificationSummaryJExcel();
                    })

                }
                else {

                    this.setState({
                        message: response.data.messageCode,
                        color: '#BA0C2F',
                        loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    console.log("Error@@@@@@@@@@@", error)
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            color: '#BA0C2F',
                            loading: false
                        }, () => {
                            this.hideSecondComponent();
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
                                    color: '#BA0C2F',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    color: '#BA0C2F',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    color: '#BA0C2F',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                        }
                    }
                }
            );
    }

    toggleLarge() {
        this.setState({
            manualTag: !this.state.manualTag,
            batchDetails: []
        })
    }

    getPlanningUnitList() {
        console.log("this.state.programId.split@@@@", this.state.programId);
        var programId = this.state.programId != -1 && this.state.programId != undefined ? this.state.programId.toString().split("_")[0] : -1;
        if (programId != -1) {
            ProgramService.getProgramPlaningUnitListByProgramId(programId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        var db1;
                        var storeOS;
                        getDatabase();
                        var thisAsParameter = this;
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onerror = function (event) {
                            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                            this.props.updateState("color", "#BA0C2F");
                            this.props.hideFirstComponent();
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction;
                            var programTransaction;
                            transaction = db1.transaction(['programData'], 'readwrite');
                            programTransaction = transaction.objectStore('programData');
                            // Yaha program Id dalna hai actual wala
                            var curUser = AuthenticationService.getLoggedInUserId();
                            var programId = (this.state.programId);
                            console.log("ProgramId@@@@@@@@@@@@", programId)
                            var programRequest = programTransaction.get(programId);
                            programRequest.onsuccess = function (event) {
                                var programDataJson = programRequest.result;
                                this.setState({
                                    planningUnits: listArray,
                                    programDataJson: programDataJson
                                }, () => {
                                    this.getPlanningUnitArray();
                                })
                            }.bind(this)
                        }.bind(this)
                    }
                    else {

                        this.setState({
                            message: response.data.messageCode,
                            color: '#BA0C2F'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        console.log("Error@@@@@@@@@@", error)
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                color: '#BA0C2F',
                                loading: false
                            }, () => {
                                this.hideSecondComponent();
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
                                        color: '#BA0C2F',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        color: '#BA0C2F',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        color: '#BA0C2F',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
            this.setState({
                outputList: [],
                planningUnits: []
            }, () => {
                try {
                    this.state.languageEl.destroy();
                } catch (error) {

                }
            })
        }
        // this.filterData();

    }


    formatDate(cell, row) {
        if (cell != null && cell != "") {
            // var modifiedDate = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP}`);
            return dateMonthAsWord.toUpperCase();
        } else {
            return "";
        }
    }

    formatExpiryDate(cell, row) {
        if (cell != null && cell != "") {
            // var modifiedDate = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP_WITHOUT_DATE}`);
            return dateMonthAsWord;
        } else {
            return "";
        }
    }
    // DATE_FORMAT_CAP_WITHOUT_DATE

    addCommas(cell, row) {
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    formatLabel(cell, row) {
        if (cell != null && cell != "") {
            return getLabelText(cell.label, 'en');
        } else {
            return "";
        }
    }


    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

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
                text: 'All', value: this.state.artmisHistory.length
            }]
        }

        const columns1 = [
            {
                dataField: 'procurementAgentOrderNo',
                text: i18n.t('static.mt.roNoAndRoLineNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'planningUnitName',
                text: i18n.t('static.manualTagging.erpPlanningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },

            {
                dataField: 'expectedDeliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'status',
                text: i18n.t('static.manualTagging.erpStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'qty',
                // text: i18n.t('static.shipment.qty'),
                text: i18n.t('static.manualTagging.erpShipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'cost',
                // text: i18n.t('static.shipment.qty'),
                text: i18n.t('static.shipment.totalCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'dataReceivedOn',
                text: i18n.t('static.mt.dataReceivedOn'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'changeCode',
                text: i18n.t('static.manualTagging.changeCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }

        ];
        const columns2 = [
            {
                dataField: 'procurementAgentShipmentNo',
                text: i18n.t('static.mt.roNoAndRoLineNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'deliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'batchNo',
                text: i18n.t('static.supplyPlan.batchId'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'expiryDate',
                text: i18n.t('static.supplyPlan.expiryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatExpiryDate
            },
            {
                dataField: 'qty',
                text: i18n.t('static.supplyPlan.shipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'dataReceivedOn',
                text: i18n.t('static.mt.dataReceivedOn'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'changeCode',
                text: i18n.t('static.manualTagging.changeCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }

        ];



        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.value}>
                    {/* {getLabelText(item.label, this.state.lang)} */}
                    {item.label}
                </option>
            )
        }, this);


        const { planningUnits } = this.state;
        let planningUnitMultiList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        planningUnitMultiList = Array.from(planningUnitMultiList);

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card>
                    <CardBody className="pb-lg-5">
                        {/* Consumption modal */}
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            {/* <div style={{ display: this.state.loading1 ? "none" : "block" }}> */}
                            <div>
                                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                                    <strong>{i18n.t('static.mt.erpHistoryTitle')}</strong>
                                    <Button size="md" color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1" onClick={() => this.toggleLarge()}> <i className="fa fa-times"></i></Button>
                                </ModalHeader>
                                <ModalBody>
                                    <div>
                                        <span><b>{i18n.t('static.manualTagging.orderDetails')}</b></span>
                                        <br />
                                        <br />
                                        <ToolkitProvider
                                            keyField="optList"
                                            data={this.state.artmisHistory.erpOrderList != undefined && this.state.artmisHistory.erpOrderList.sort((a, b) => {
                                                var itemLabelA = moment(a.dataReceivedOn); // ignore upper and lowercase
                                                var itemLabelB = moment(b.dataReceivedOn);
                                                return itemLabelA < itemLabelB ? 1 : -1;
                                            })}
                                            columns={columns1}
                                            search={{ searchFormatted: true }}
                                            hover
                                            filter={filterFactory()}
                                        >
                                            {
                                                props => (
                                                    <div className="TableCust FortablewidthMannualtaggingtable3 reactTableNotification">
                                                        {/* <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
            <SearchBar {...props.searchProps} />
            <ClearSearchButton {...props.searchProps} />
        </div> */}
                                                        <BootstrapTable striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                            // pagination={paginationFactory(options)}
                                                            rowEvents={{
                                                            }}
                                                            {...props.baseProps}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </ToolkitProvider>
                                        <br />
                                        <span><b>{i18n.t('static.supplyPlan.shipmentsDetails')}</b></span>
                                        <br />
                                        <br />

                                        <ToolkitProvider
                                            keyField="optList"
                                            data={this.state.artmisHistory.erpShipmentList != undefined && this.state.artmisHistory.erpShipmentList.sort((a, b) => {
                                                var itemLabelA = moment(a.dataReceivedOn); // ignore upper and lowercase
                                                var itemLabelB = moment(b.dataReceivedOn);
                                                return itemLabelA < itemLabelB ? 1 : -1;
                                            })}
                                            columns={columns2}
                                            search={{ searchFormatted: true }}
                                            hover
                                            filter={filterFactory()}
                                        >
                                            {
                                                props => (
                                                    <div className="TableCust ShipmentNotificationtable ">
                                                        {/* <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
            <SearchBar {...props.searchProps} />
            <ClearSearchButton {...props.searchProps} />
        </div> */}
                                                        <BootstrapTable striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                            // pagination={paginationFactory(options)}
                                                            rowEvents={{
                                                            }}
                                                            {...props.baseProps}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </ToolkitProvider>

                                    </div><br />
                                </ModalBody>
                                <ModalFooter>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.toggleLarge()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                            {/* <div style={{ display: this.state.loading1 ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </Modal>
                        {/* Consumption modal */}
                        <div className="col-md-12 pl-0">
                            <div id="tableDiv1" className="jexcelremoveReadonlybackground RowClickable consumptionDataEntryTable">
                            </div>
                        </div>
                        <div className="col-md-12 pl-0">
                            <Row>


                                <FormGroup className="col-md-3 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                // onChange={this.getPlanningUnitList}
                                                onChange={(e) => { this.programChange(e); }}
                                            >
                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>


                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                    <div className="controls ">
                                        {/* <InMultiputGroup> */}
                                        <MultiSelect
                                            // type="select"
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="sm"
                                            value={this.state.hasSelectAll ? planningUnitMultiList : this.state.planningUnitValues}
                                            onChange={(e) => { this.filterData(e) }}
                                            options={planningUnitMultiList && planningUnitMultiList.length > 0 ? planningUnitMultiList : []}
                                        />

                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.mt.addressed')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="addressed"
                                                id="addressed"
                                                bsSize="sm"
                                                // value={this.state.addressed}
                                                onChange={this.filterData1}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                <option value="1">{i18n.t('static.mt.addressed')}</option>
                                                <option value="0" selected>{i18n.t('static.mt.notAddressed')}</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </Row>
                            <div className="ReportSearchMarginTop consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                <div id="tableDiv" className="RemoveStriped">
                                </div>
                                {/* <div id="tableDiv1" className="jexcelremoveReadonlybackground">
                                        </div> */}
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



                        </div>



                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            &nbsp;
                            {this.state.displaySubmitButton && <Button type="submit" size="md" color="success" onClick={this.updateDetails} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                        </FormGroup>
                    </CardFooter>
                </Card>

            </div>
        );
    }

}