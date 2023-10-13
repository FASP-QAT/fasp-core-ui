import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { MultiSelect } from 'react-multi-select-component';
import { Button, Card, CardBody, CardFooter, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT, JEXCEL_DATE_FORMAT_WITHOUT_DATE, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY, STRING_TO_DATE_FORMAT } from '../../Constants.js';
import DropdownService from '../../api/DropdownService.js';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
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
        this.getPlanningUnitArray = this.getPlanningUnitArray.bind(this);
        this.getNotificationSummary = this.getNotificationSummary.bind(this);
        this.buildNotificationSummaryJExcel = this.buildNotificationSummaryJExcel.bind(this);
        this.viewBatchData = this.viewBatchData.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.selectedForNotification = this.selectedForNotification.bind(this)
        this.loaded = this.loaded.bind(this);
        this.loaded1 = this.loaded1.bind(this);
        this.selected = this.selected.bind(this);
    }
    viewBatchData(event, row) {
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
    }
    getPlanningUnitArray() {
        let planningUnits = this.state.planningUnits;
        let planningUnitArray = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
            }, this);
        this.setState({
            planningUnitArray
        }, () => {
            this.filterData(planningUnitArray);
        })
    }
    displayButton() {
        var validation = true;
        var tableJson = this.el.getJson(null, false).filter(c => c[19] == 1);
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
            var tableJson = this.el.getJson(null, false).filter(c => c[19] == 1);
            for (var i = 0; i < tableJson.length; i++) {
                let json = {
                    addressed: tableJson[i][0],
                    notificationType: {},
                    notificationId: tableJson[i][15],
                    shipmentLinkingId: 0
                }
                changedmtList.push(json);
            }
            ManualTaggingService.updateNotification(changedmtList)
                .then(response => {
                    this.setState({
                        message: i18n.t('static.mt.dataUpdateSuccess'),
                        color: 'green',
                        loading: false,
                        loading1: false,
                        displaySubmitButton: false
                    },
                        () => {
                            this.hideSecondComponent();
                            this.getNotificationSummary(0);
                        })
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                        valid = false;
                    } else {
                        if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }
    changed = function (instance, cell, x, y, value) {
        if (x == 0) {
            this.el.setValueFromCoords(19, y, 1, true);
        }
        this.displayButton();
    }.bind(this);
    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(13, y, 1, true);
    }.bind(this);
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 10 && !isNaN(rowData[10]) && rowData[10].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(10, y, parseFloat(rowData[10]), true);
        }
        elInstance.setValueFromCoords(13, y, 1, true);
    }
    onPaste(instance, data) {
        if (data.length == 1 && Object.keys(data[0])[2] == "value") {
            (instance).setValueFromCoords(10, data[0].y, parseFloat(data[0].value), true);
        }
        else {
            for (var i = 0; i < data.length; i++) {
                (instance).setValueFromCoords(13, data[i].y, 1, true);
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
        this.getNotificationSummary(1);
    }
    filterData = (planningUnitIds) => {
        document.getElementById('div2').style.display = 'block';
        var programId = this.state.programId;
        var addressed = document.getElementById("addressed").value;
        planningUnitIds = planningUnitIds;
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
                        var programDataJson = this.state.programDataJson;
                        var shipmentList = [];
                        var roPrimeNoList = [];
                        var planningUnitDataList = programDataJson.programData.planningUnitDataList;
                        var gprogramDataBytes = CryptoJS.AES.decrypt(programDataJson.programData.generalData, SECRET_KEY);
                        var gprogramData = gprogramDataBytes.toString(CryptoJS.enc.Utf8);
                        var gprogramJson = JSON.parse(gprogramData);
                        var linkedShipmentsList = gprogramJson.shipmentLinkingList != null ? gprogramJson.shipmentLinkingList : []
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
                                shipmentLinkingId: list[l].shipmentLinkingId,
                                realmCountryPlanningUnit: shipmentListFilter[0].realmCountryPlanningUnit
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
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    } catch (error) {
                    }
                })
            }
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
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version,
                            value: myResult[i].id,
                            programId: myResult[i].programId,
                            version: myResult[i].version
                        }
                        proList.push(programJson)
                    }
                }
                if (proList.length == 1) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = a.label.toLowerCase();
                            b = b.label.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        loading: false,
                        programId: proList[0].value
                    }, () => {
                        this.getPlanningUnitList();
                    })
                } else {
                    if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = a.label.toLowerCase();
                                b = b.label.toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            loading: false,
                            programId: localStorage.getItem("sesProgramId")
                        }, () => {
                            this.getPlanningUnitList();
                        });
                    } else {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = a.label.toLowerCase();
                                b = b.label.toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            loading: false
                        })
                    }
                }
            }.bind(this)
        }.bind(this)
    }
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
            data[7] = getLabelText(manualTaggingList[j].realmCountryPlanningUnit.label, this.state.lang)
            data[8] = manualTaggingList[j].expectedDeliveryDate
            data[9] = manualTaggingList[j].erpShipmentStatus
            data[10] = Math.round((manualTaggingList[j].shipmentQty) / (manualTaggingList[j].conversionFactor) / manualTaggingList[j].realmCountryPlanningUnit.multiplier)
            data[11] = manualTaggingList[j].realmCountryPlanningUnit.multiplier
            data[12] = `=ROUND(K${parseInt(j) + 1}*L${parseInt(j) + 1},0)`;
            data[13] = manualTaggingList[j].notes
            data[14] = this.state.roPrimeNoListOriginal.filter(c => c.roNo == manualTaggingList[j].roNo && c.roPrimeLineNo == manualTaggingList[j].roPrimeLineNo)[0];
            data[15] = manualTaggingList[j].notificationId;
            data[16] = manualTaggingList[j].shipmentLinkingId;
            data[17] = manualTaggingList[j].roNo;
            data[18] = manualTaggingList[j].roPrimeLineNo;
            data[19] = 0;
            manualTaggingArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
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
                    title: i18n.t('static.manualTagging.aru'),
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
                    title: i18n.t('static.manualTagging.conversionERPToPU'),
                    type: 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
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
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selectedForNotification,
            onchange: this.changed,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            updateTable: function (el, cell, x, y, source, value, id) {
            }.bind(this),
            onsearch: function (el) {
            },
            onfilter: function (el) {
            },
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.mt.viewArtmisHistory'),
                            onclick: function () {
                                let roNo = obj.getValueFromCoords(17, y).toString().trim();
                                let roPrimeLineNo = obj.getValueFromCoords(18, y).toString().trim();
                                ManualTaggingService.getARTMISHistory(roNo, roPrimeLineNo)
                                    .then(response => {
                                        this.setState({
                                            artmisHistory: response.data
                                        }, () => {
                                            this.toggleLarge();
                                        });
                                    }).catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
            notificationSummaryArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv1"), '');
        jexcel.destroy(document.getElementById("tableDiv1"), true);
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
                    mask: '#,##',
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
            onload: this.loaded1,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
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
    selectedForNotification = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if (y != 0) {
                localStorage.setItem("sesProgramIdReport", this.state.programId.split("_")[0]);
                localStorage.setItem("sesVersionIdReport", this.state.programId.split("_")[1].substring(1) + "  (Local)");
                window.open(window.location.origin + `/#/shipment/manualTagging/2`);
            }
        }
    }
    selected = function (instance, cell, x, y, value, e) {
        var instance = (instance).jexcel;
        if (e.buttons == 1) {
            if (y != 0) {
                this.setState({
                    programId: this.state.programs.filter(c => c.programId == this.state.instance.getValueFromCoords(2, x)).sort((a, b) => {
                        var itemLabelA = a.version;
                        var itemLabelB = b.version
                        return itemLabelA < itemLabelB ? 1 : -1;
                    })[0].value
                }, () => {
                    document.getElementById("addressed").value = 0;
                    this.getPlanningUnitList();
                })
            }
        }
    }.bind(this)
    loaded1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
    }
    getNotificationSummary(callGetProgram) {
        ManualTaggingService.getNotificationSummary()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        notificationSummary: listArray,
                        loading: false
                    }, () => {
                        if (callGetProgram) {
                            this.getProgramList();
                        } else {
                            this.filterData(this.state.planningUnitIds);
                        }
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
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        }, () => {
            this.sampleFunction();
        })
    }
    sampleFunction() {
        this.setState({
            test: 10
        }, () => {
            this.buildJexcel()
        })
    }
    buildJexcel() {
        try {
            this.el = jexcel(document.getElementById("tableDivOrderDetails"), '');
            jexcel.destroy(document.getElementById("tableDivOrderDetails"), true);
        } catch (err) {
        }
        var json = [];
        var orderHistory = this.state.artmisHistory.erpOrderList.sort((a, b) => {
            var itemLabelA = moment(a.dataReceivedOn);
            var itemLabelB = moment(b.dataReceivedOn);
            return itemLabelA < itemLabelB ? 1 : -1;
        })
        for (var sb = 0; sb < orderHistory.length; sb++) {
            var data = [];
            data[0] = orderHistory[sb].procurementAgentOrderNo;
            data[1] = orderHistory[sb].planningUnitName;
            data[2] = moment(orderHistory[sb].expectedDeliveryDate).format("YYYY-MM-DD");
            data[3] = orderHistory[sb].status;
            data[4] = orderHistory[sb].qty;
            data[5] = orderHistory[sb].cost;
            data[6] = moment(orderHistory[sb].dataReceivedOn).format("YYYY-MM-DD");
            data[7] = orderHistory[sb].changeCode;
            data[8] = sb;
            json.push(data);
        }
        var options = {
            data: json,
            columnDrag: true,
            columns: [
                { title: i18n.t('static.mt.roNoAndRoLineNo'), type: 'text', width: 150 },
                { title: i18n.t('static.manualTagging.erpPlanningUnit'), type: 'text', width: 200 },
                { title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.manualTagging.erpStatus'), type: 'text', width: 150 },
                { title: i18n.t('static.manualTagging.erpShipmentQty'), type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.', width: 100 },
                { title: i18n.t('static.shipment.totalCost'), type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.', width: 100 },
                { title: i18n.t('static.mt.dataReceivedOn'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.manualTagging.changeCode'), type: 'text', width: 100 },
                { type: 'hidden' }
            ],
            pagination: false,
            search: false,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            allowInsertRow: true,
            allowManualInsertRow: false,
            allowExport: false,
            editable: false,
            license: JEXCEL_PRO_KEY,
            onload: this.loadedOrderHistory,
            updateTable: function (el, cell, x, y, source, value, id) {
                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                var elInstance = el;
                var index = elInstance.getJson(null, false).findIndex(c => c[8] == 0);
                for (var j = 0; j < colArr.length; j++) {
                    var col = (colArr[j]).concat(parseInt(index) + 1);
                    var cell = elInstance.getCell(col);
                    cell.classList.add('historyBold');
                }
            }.bind(this),
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        var elVar = jexcel(document.getElementById("tableDivOrderDetails"), options);
        this.el = elVar;
        try {
            this.el = jexcel(document.getElementById("tableDivShipmentDetails"), '');
            jexcel.destroy(document.getElementById("tableDivShipmentDetails"), true);
        } catch (err) {
        }
        var json = [];
        var shipmentHistory = this.state.artmisHistory.erpShipmentList.sort((a, b) => {
            var itemLabelA = moment(a.dataReceivedOn);
            var itemLabelB = moment(b.dataReceivedOn);
            return itemLabelA < itemLabelB ? 1 : -1;
        })
        for (var sb = 0; sb < shipmentHistory.length; sb++) {
            var data = [];
            data[0] = shipmentHistory[sb].procurementAgentShipmentNo;
            data[1] = moment(shipmentHistory[sb].deliveryDate).format("YYYY-MM-DD");
            data[2] = shipmentHistory[sb].batchNo;
            data[3] = moment(shipmentHistory[sb].expiryDate).format("YYYY-MM-DD");
            data[4] = shipmentHistory[sb].qty;
            data[5] = moment(shipmentHistory[sb].dataReceivedOn).format("YYYY-MM-DD");
            data[6] = shipmentHistory[sb].changeCode;
            data[7] = sb;
            json.push(data);
        }
        var options = {
            data: json,
            columnDrag: true,
            columns: [
                { title: i18n.t('static.mt.roNoAndRoLineNo'), type: 'text', width: 150 },
                { title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.supplyPlan.batchId'), type: 'text', width: 150 },
                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT_WITHOUT_DATE }, width: 100 },
                { title: i18n.t('static.supplyPlan.shipmentQty'), type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.', width: 100 },
                { title: i18n.t('static.mt.dataReceivedOn'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.manualTagging.changeCode'), type: 'text', width: 100 },
                { type: 'hidden' }
            ],
            pagination: false,
            search: false,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            allowInsertRow: true,
            allowManualInsertRow: false,
            allowExport: false,
            editable: false,
            license: JEXCEL_PRO_KEY,
            onload: this.loadedShipmentHistory,
            updateTable: function (el, cell, x, y, source, value, id) {
                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                var elInstance = el;
                var index = elInstance.getJson(null, false).findIndex(c => c[7] == 0);
                for (var j = 0; j < colArr.length; j++) {
                    var col = (colArr[j]).concat(parseInt(index) + 1);
                    var cell = elInstance.getCell(col);
                    cell.classList.add('historyBold');
                }
            }.bind(this),
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        var elVar = jexcel(document.getElementById("tableDivShipmentDetails"), options);
        this.el = elVar;
    }
    loadedOrderHistory(instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("jss")[2].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[8].title = i18n.t('static.manualTagging.changeOrderOrder');
    }
    loadedShipmentHistory(instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("jss")[3].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[7].title = i18n.t('static.manualTagging.changeOrderShipment');
    }
    getPlanningUnitList() {
        var programId = this.state.programId != -1 && this.state.programId != undefined ? this.state.programId.toString().split("_")[0] : -1;
        if (programId != -1) {
            var programJson = {
                tracerCategoryIds: [],
                programIds: [programId]
            }
            DropdownService.getProgramPlanningUnitDropdownList(programJson).then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
                        var curUser = AuthenticationService.getLoggedInUserId();
                        var programId = (this.state.programId);
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
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                } catch (error) {
                }
            })
        }
    }
    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP}`);
            return dateMonthAsWord.toUpperCase();
        } else {
            return "";
        }
    }
    formatExpiryDate(cell, row) {
        if (cell != null && cell != "") {
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP_WITHOUT_DATE}`);
            return dateMonthAsWord;
        } else {
            return "";
        }
    }
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
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
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
                text: i18n.t('static.manualTagging.erpShipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'cost',
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
                    {item.label}
                </option>
            )
        }, this);
        const { planningUnits } = this.state;
        let planningUnitMultiList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
            }, this);
        planningUnitMultiList = Array.from(planningUnitMultiList);
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardBody className="pb-lg-5">
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-lg modalWidth' + this.props.className}>
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
                                        <div className='consumptionDataEntryTable'>
                                            <div id="tableDivOrderDetails" className={"jexcelremoveReadonlybackground"}>
                                            </div>
                                        </div>
                                        <br />
                                        <span><b>{i18n.t('static.supplyPlan.shipmentsDetails')}</b></span>
                                        <br />
                                        <br />
                                        <div className='consumptionDataEntryTable'>
                                            <div id="tableDivShipmentDetails" className={"jexcelremoveReadonlybackground"}>
                                            </div>
                                        </div>
                                    </div><br />
                                </ModalBody>
                                <ModalFooter>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.toggleLarge()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                        </Modal>
                        <div className="col-md-12 pl-0">
                            <div id="tableDiv1" className="jexcelremoveReadonlybackground RowClickable consumptionDataEntryTable TableWidth100">
                            </div>
                        </div>
                        <div className="col-md-12 pl-0">
                            <Row>
                                <FormGroup className="col-md-3 ZindexFeild">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                onChange={(e) => { this.programChange(e); }}
                                            >
                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3 ZindexFeild">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                    <div className="controls ">
                                        <MultiSelect
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="sm"
                                            value={this.state.hasSelectAll ? planningUnitMultiList : this.state.planningUnitValues}
                                            onChange={(e) => { this.filterData(e) }}
                                            options={planningUnitMultiList && planningUnitMultiList.length > 0 ? planningUnitMultiList : []}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3 ZindexFeild">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.mt.addressed')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="addressed"
                                                id="addressed"
                                                bsSize="sm"
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
                                <div id="tableDiv" className="RemoveStriped TableWidth100">
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