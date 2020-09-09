import React from "react";


import {
    Card, CardBody, CardHeader, CardFooter,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    Input, InputGroup, Label, FormGroup, Form, Row, Nav, NavItem, NavLink, Collapse, TabPane, TabContent, FormFeedback
} from 'reactstrap';
import * as Yup from 'yup';
import i18n from '../../i18n';
import 'react-contexify/dist/ReactContexify.min.css';
import DatePicker from 'react-datepicker';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION, DATE_FORMAT_SM, DATE_PLACEHOLDER_TEXT, TBD_FUNDING_SOURCE, TBD_PROCUREMENT_AGENT_ID } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Link } from "react-router-dom";
import NumberFormat from 'react-number-format';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png'
import ShipmentsInSupplyPlanComponent from "../SupplyPlan/ShipmentsInSupplyPlan.js";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import InventoryInSupplyPlanComponent from "../SupplyPlan/InventoryInSupplyPlan.js";
import ConsumptionInSupplyPlanComponent from "../SupplyPlan/ConsumptionInSupplyPlan";
import { calculateSupplyPlan } from "../SupplyPlan/SupplyPlanCalculations";
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import AuthenticationService from "../Common/AuthenticationService";
// import SupplyPlanFormulas from "./SupplyPlanFormulas";

const entityname = i18n.t('static.dashboard.whatIf')

let initialValues = {
    scenarioId: '',
    percentage: ''
}

const validationSchema = function (values, t) {
    console.log("made by us schema--->", values)
    return Yup.object().shape({
        scenarioId: Yup.string()
            .required(i18n.t('static.whatIf.validScenario')),
    })
}

const validate = (getValidationSchema) => {

    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

const chartOptions = {
    title: {
        display: true,
        text: i18n.t('static.dashboard.stockstatus')
    },
    scales: {
        yAxes: [{
            id: 'A',
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.dashboard.unit'),
                fontColor: 'black'
            },
            stacked: false,
            ticks: {
                beginAtZero: true,
                fontColor: 'black',
                callback: function (value) {
                    return value.toLocaleString();
                }
            },
            gridLines: {
                color: 'rgba(171,171,171,171)',
                borderDash: [8, 4],
            },
            position: 'left',
        },
        {
            id: 'B',
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.dashboard.months'),
                fontColor: 'black'
            },
            stacked: false,
            ticks: {
                beginAtZero: true,
                fontColor: 'black'
            },
            gridLines: {
                color: 'rgba(171,171,171,1)',
                lineWidth: 0.5
            },
            position: 'right',
        }
        ],
        xAxes: [{
            ticks: {
                fontColor: 'black'
            },
        }]
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItems, data) {
                return (tooltipItems.yLabel.toLocaleString());
            }
        },
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false
    ,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}


export default class WhatIfReportComponent extends React.Component {

    constructor(props) {
        super(props);
        let rows = [];
        this.state = {
            loading: true,
            monthsArray: [],
            programList: [],
            planningUnitList: [],
            planningUnitName: "",
            regionList: [],
            consumptionTotalData: [],
            shipmentsTotalData: [],
            manualShipmentsTotalData: [],
            deliveredShipmentsTotalData: [],
            shippedShipmentsTotalData: [],
            orderedShipmentsTotalData: [],
            plannedShipmentsTotalData: [],
            erpShipmentsTotalData: [],
            deliveredErpShipmentsTotalData: [],
            shippedErpShipmentsTotalData: [],
            orderedErpShipmentsTotalData: [],
            plannedErpShipmentsTotalData: [],
            consumptionDataForAllMonths: [],
            amcTotalData: [],
            consumptionFilteredArray: [],
            regionListFiltered: [],
            consumptionTotalMonthWise: [],
            consumptionChangedFlag: 0,
            inventoryTotalData: [],
            expectedBalTotalData: [],
            suggestedShipmentsTotalData: [],
            inventoryFilteredArray: [],
            inventoryTotalMonthWise: [],
            projectedTotalMonthWise: [],
            inventoryChangedFlag: 0,
            monthCount: 0,
            monthCountConsumption: 0,
            monthCountAdjustments: 0,
            minStockArray: [],
            maxStockArray: [],
            minStockMoS: [],
            maxStockMoS: [],
            minMonthOfStock: 0,
            reorderFrequency: 0,
            programPlanningUnitList: [],
            openingBalanceArray: [],
            closingBalanceArray: [],
            monthsOfStockArray: [],
            suggestedShipmentChangedFlag: 0,
            message: '',
            activeTab: new Array(3).fill('1'),
            jsonArrForGraph: [],
            display: 'none',
            lang: localStorage.getItem('lang'),
            unmetDemand: [],
            expiredStock: [],
            versionId: "",
            accordion: [true],
            showTotalShipment: false,
            showManualShipment: false,
            showErpShipment: false,
            expiredStockArr: [],
            scenarioId: '',
            percentage: '',
            startDate: '',
            stopDate: '',
            rows: rows,
            expiredStockDetails: [],
            expiredStockDetailsTotal: 0,
            showShipments: 0,
            paColors: [],
            programSelect: "",
            showInventory: 0,
            showConsumption: 0
        }
        this.getMonthArray = this.getMonthArray.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.consumptionDetailsClicked = this.consumptionDetailsClicked.bind(this);

        this.adjustmentsDetailsClicked = this.adjustmentsDetailsClicked.bind(this);

        this.leftClicked = this.leftClicked.bind(this);
        this.rightClicked = this.rightClicked.bind(this);
        this.leftClickedConsumption = this.leftClickedConsumption.bind(this);
        this.rightClickedConsumption = this.rightClickedConsumption.bind(this);

        this.leftClickedAdjustments = this.leftClickedAdjustments.bind(this);
        this.rightClickedAdjustments = this.rightClickedAdjustments.bind(this);

        this.actionCanceled = this.actionCanceled.bind(this);

        this.suggestedShipmentsDetailsClicked = this.suggestedShipmentsDetailsClicked.bind(this);
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);

        this.toggleAccordionTotalShipments = this.toggleAccordionTotalShipments.bind(this);
        this.toggleAccordionManualShipments = this.toggleAccordionManualShipments.bind(this);
        this.toggleAccordionErpShipments = this.toggleAccordionErpShipments.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addRow = this.addRow.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.toggle = this.toggle.bind(this);
        this.tabPane = this.tabPane.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.dataChangeEndDate = this.dataChangeEndDate.bind(this);
        this.updateState = this.updateState.bind(this)
        this.updateFieldData = this.updateFieldData.bind(this);
        this.saveSupplyPlan = this.saveSupplyPlan.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    roundN = num => {
        if (num != '') {
            return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
        } else {
            return ''
        }
    }

    formatter = value => {
        if (value != '' && !isNaN(Number.parseInt(value))) {
            var cell1 = value
            cell1 += '';
            var x = cell1.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        } else if (isNaN(Number.parseInt(value))) {
            return value;
        } else {
            return ''
        }
    }

    formatterDouble = value => {
        if (value != '' && !isNaN(Number.parseInt(value))) {
            var cell1 = this.roundN(value)
            cell1 += '';
            var x = cell1.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        } else if (isNaN(Number.parseInt(value))) {
            return value;
        } else {
            return ''
        }
    }

    updateFieldData(value) {
        console.log("Value", value);
        // console.log(event.value)
        this.setState({ planningUnit: value, planningUnitId: value != "" && value != undefined ? value.value : 0 });

    }

    resetClicked() {
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var whatIfProgramDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                var whatIfProgramDataOs = whatIfProgramDataTransaction.objectStore('whatIfProgramData');
                var item = {
                    id: programRequest.result.id,
                    programId: programRequest.result.programId,
                    version: programRequest.result.version,
                    programName: (CryptoJS.AES.encrypt(JSON.stringify((programRequest.result.label)), SECRET_KEY)).toString(),
                    programData: programRequest.result.programData,
                    userId: programRequest.result.userId
                }
                var whatIfRequest = whatIfProgramDataOs.put(item);
                whatIfRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                whatIfRequest.onsuccess = function (e) {
                    this.formSubmit(this.state.planningUnit, this.state.monthCount);
                    this.setState({
                        message: i18n.t('static.whatIf.supplyPlanReset'),
                        color: 'green',
                        rows: [],
                        scenarioId: '',
                        percentage: '',
                        startDate: '',
                        stopDate: ''
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)

    }

    saveSupplyPlan() {
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var whatIfProgramDataTransaction = db1.transaction(['programData'], 'readwrite');
                var whatIfProgramDataOs = whatIfProgramDataTransaction.objectStore('programData');
                var item = {
                    id: programRequest.result.id,
                    programId: programRequest.result.programId,
                    version: programRequest.result.version,
                    programName: (CryptoJS.AES.encrypt(JSON.stringify((programRequest.result.label)), SECRET_KEY)).toString(),
                    programData: programRequest.result.programData,
                    userId: programRequest.result.userId
                }
                var whatIfRequest = whatIfProgramDataOs.put(item);
                whatIfRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                whatIfRequest.onsuccess = function (e) {
                    this.formSubmit(this.state.planningUnit, this.state.monthCount);
                    this.setState({
                        message: i18n.t('static.whatIf.supplyPlanSaved'),
                        color: 'green',
                        rows: [],
                        scenarioId: '',
                        percentage: '',
                        startDate: '',
                        stopDate: ''
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    setTextAndValue = (event) => {
        if (event.target.name === 'scenarioId') {
            this.setState({ scenarioId: event.target.value });
            if (event.target.value == 1 || event.target.value == 2) {
                document.getElementById("consumptionScenariosFields").style.display = "inline-flex";
            } else {
                document.getElementById("consumptionScenariosFields").style.display = "none";
            }
        } else if (event.target.name === 'percentage') {
            this.setState({ percentage: event.target.value });
        }
    };

    dataChangeDate(date) {
        this.setState({ startDate: date });
    }

    dataChangeEndDate(date) {
        this.setState({ stopDate: date });
    }

    toggle(tabPane, tab) {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }

    addRow() {
        this.setState({ loading: true });
        var db1;
        var storeOS;
        var programId = (document.getElementById("programId").value);
        var planningUnitId = (document.getElementById("planningUnitId").value);
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('whatIfProgramData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                if (this.state.scenarioId == 3) {
                    var shipmentList = programJson.shipmentList;
                    var shipmentUnFundedList = shipmentList.filter(c => c.fundingSource.id == "" || c.fundingSource.id == TBD_FUNDING_SOURCE && c.planningUnit.id == planningUnitId);
                    console.log("Shipment un funded shipment", shipmentUnFundedList);
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var index = 0;
                        if (shipmentUnFundedList[i].shipmentId > 0) {
                            index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                        } else {
                            index = shipmentUnFundedList[i].index;
                        }
                        shipmentList[index].active = 0;
                    }
                    programJson.shipmentList = shipmentList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: "",
                            stopDate: ""
                        })

                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        document.getElementById("consumptionScenariosFields").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this);
                    }.bind(this)
                } else if (this.state.scenarioId == 1) {
                    var consumptionList = programJson.consumptionList;
                    var consumptionFiltered = consumptionList.filter(c => c.active == true
                        && c.planningUnit.id == planningUnitId
                        && moment(c.consumptionDate).format("YYYY-MM") >= moment(this.state.startDate).format("YYYY-MM")
                        && moment(c.consumptionDate).format("YYYY-MM") <= moment(this.state.stopDate).format("YYYY-MM")
                        && (c.actualFlag).toString() == "false"
                    );
                    console.log("Consumption List", consumptionFiltered);
                    for (var i = 0; i < consumptionFiltered.length; i++) {
                        var index = 0;
                        if (consumptionFiltered[i].consumptionId > 0) {
                            index = consumptionList.findIndex(c => c.consumptionId == consumptionFiltered[i].consumptionId);
                        } else {
                            index = consumptionList.findIndex(c =>
                                c.region.id == consumptionFiltered[i].region.id &&
                                c.planningUnit.id == consumptionFiltered[i].planningUnit.id &&
                                moment(c.consumptionDate).format("YYYY-MM") == moment(consumptionFiltered[i].consumptionDate).filter("YYYY-MM") &&
                                c.actualFlag == consumptionFiltered[i].actualFlag
                            );
                        }
                        consumptionList[index].consumptionQty = parseInt(parseInt(consumptionFiltered[i].consumptionQty) + parseInt(((parseInt(this.state.percentage)) / 100) * parseInt(consumptionFiltered[i].consumptionQty)));
                    }
                    programJson.consumptionList = consumptionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: moment(this.state.startDate).format(DATE_FORMAT_CAP),
                            stopDate: moment(this.state.stopDate).format(DATE_FORMAT_CAP),
                        })
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        document.getElementById("consumptionScenariosFields").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this);
                    }.bind(this)
                } else if (this.state.scenarioId == 2) {
                    var consumptionList = programJson.consumptionList;
                    var consumptionFiltered = consumptionList.filter(c => c.active == true
                        && c.planningUnit.id == planningUnitId
                        && moment(c.consumptionDate).format("YYYY-MM") >= moment(this.state.startDate).format("YYYY-MM")
                        && moment(c.consumptionDate).format("YYYY-MM") <= moment(this.state.stopDate).format("YYYY-MM")
                        && (c.actualFlag).toString() == "false"
                    );
                    console.log("Consumption List", consumptionFiltered);
                    for (var i = 0; i < consumptionFiltered.length; i++) {
                        var index = 0;
                        if (consumptionFiltered[i].consumptionId > 0) {
                            index = consumptionList.findIndex(c => c.consumptionId == consumptionFiltered[i].consumptionId);
                        } else {
                            index = consumptionList.findIndex(c =>
                                c.region.id == consumptionFiltered[i].region.id &&
                                c.planningUnit.id == consumptionFiltered[i].planningUnit.id &&
                                moment(c.consumptionDate).format("YYYY-MM") == moment(consumptionFiltered[i].consumptionDate).filter("YYYY-MM") &&
                                c.actualFlag == consumptionFiltered[i].actualFlag
                            );
                        }
                        consumptionList[index].consumptionQty = parseInt(parseInt(consumptionFiltered[i].consumptionQty) - parseInt(((parseInt(this.state.percentage)) / 100) * parseInt(consumptionFiltered[i].consumptionQty)));
                    }
                    programJson.consumptionList = consumptionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: moment(this.state.startDate).format(DATE_FORMAT_CAP),
                            stopDate: moment(this.state.stopDate).format(DATE_FORMAT_CAP),
                        })
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        document.getElementById("consumptionScenariosFields").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this);
                    }.bind(this)
                } else if (this.state.scenarioId == 4) {
                    var shipmentList = programJson.shipmentList;
                    var shipmentUnFundedList = shipmentList.filter(c => moment(c.submittedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                    console.log("Shipment un funded shipment", shipmentUnFundedList);
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var index = 0;
                        if (shipmentUnFundedList[i].shipmentId > 0) {
                            index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                        } else {
                            index = shipmentUnFundedList[i].index;
                        }
                        shipmentList[index].active = 0;
                    }
                    programJson.shipmentList = shipmentList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: "",
                            stopDate: ""
                        })

                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        document.getElementById("consumptionScenariosFields").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this);

                    }.bind(this)
                } else if (this.state.scenarioId == 5) {
                    var shipmentList = programJson.shipmentList;
                    var shipmentUnFundedList = shipmentList.filter(c => moment(c.approvedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                    console.log("Shipment un funded shipment", shipmentUnFundedList);
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var index = 0;
                        if (shipmentUnFundedList[i].shipmentId > 0) {
                            index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                        } else {
                            index = shipmentUnFundedList[i].index;
                        }
                        shipmentList[index].active = 0;
                    }
                    programJson.shipmentList = shipmentList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: "",
                            stopDate: ""
                        })

                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        document.getElementById("consumptionScenariosFields").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this);

                    }.bind(this)
                } else if (this.state.scenarioId == 6) {
                    console.log("In6")
                    var shipmentList = programJson.shipmentList;
                    var shipmentUnFundedList = shipmentList.filter(c => (moment(c.shippedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)) || (moment(c.arrivedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS)));
                    console.log("Shipment un funded shipment", shipmentUnFundedList);
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var index = 0;
                        if (shipmentUnFundedList[i].shipmentId > 0) {
                            index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                        } else {
                            index = shipmentUnFundedList[i].index;
                        }
                        shipmentList[index].active = 0;
                    }
                    programJson.shipmentList = shipmentList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: "",
                            stopDate: ""
                        })

                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        document.getElementById("consumptionScenariosFields").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this);

                    }.bind(this)
                }
            }.bind(this)
        }.bind(this)
    }

    touchAll(errors) {
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('whatIfForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    toggleAccordionTotalShipments() {
        this.setState({
            showTotalShipment: !this.state.showTotalShipment
        })
        var fields = document.getElementsByClassName("totalShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }

        fields = document.getElementsByClassName("manualShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true && this.state.showManualShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }

        fields = document.getElementsByClassName("erpShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true && this.state.showErpShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }

    }

    toggleAccordionManualShipments() {
        this.setState({
            showManualShipment: !this.state.showManualShipment
        })
        var fields = document.getElementsByClassName("manualShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showManualShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    toggleAccordionErpShipments() {
        this.setState({
            showErpShipment: !this.state.showErpShipment
        })
        var fields = document.getElementsByClassName("erpShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showErpShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    exportCSV = () => {

        var csvRow = [];
        csvRow.push(i18n.t('static.program.program') + ' , ' + (((this.state.programSelect).label).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + (((this.state.planningUnit).label).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')

        const header = [...[""], ... (this.state.monthsArray.map(item => (
            item.monthName.concat(" ").concat(item.monthYear)
        ))
        )]
        var A = [header]

        var openningArr = [...[i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20')], ... this.state.openingBalanceArray]
        var consumptionArr = [...[("-" + i18n.t('static.supplyPlan.consumption')).replaceAll(' ', '%20')], ...this.state.consumptionTotalData]
        var shipmentArr = [...[("+" + i18n.t('static.dashboard.shipments')).replaceAll(' ', '%20')], ...this.state.shipmentsTotalData]
        var suggestedArr = [...[("   " + i18n.t('static.supplyPlan.suggestedShipments')).replaceAll(' ', '%20')], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var manualEntryShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.manualEntryShipments')).replaceAll(' ', '%20')], ...this.state.manualShipmentsTotalData]

        var deliveredShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20')], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
        var shippedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20')], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
        var orderedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered')).replaceAll(' ', '%20')], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
        var plannedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned')).replaceAll(' ', '%20')], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]

        var erpShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.erpShipments')).replaceAll(' ', '%20')], ...this.state.erpShipmentsTotalData]
        var deliveredErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20')], ...this.state.deliveredErpShipmentsTotalData.map(item => item.qty)]
        var shippedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20')], ...this.state.shippedErpShipmentsTotalData.map(item => item.qty)]
        var orderedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered')).replaceAll(' ', '%20')], ...this.state.orderedErpShipmentsTotalData.map(item => item.qty)]
        var plannedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned')).replaceAll(' ', '%20')], ...this.state.plannedErpShipmentsTotalData.map(item => item.qty)]

        var inventoryArr = [...[(i18n.t('static.supplyPlan.adjustments')).replaceAll(' ', '%20')], ...this.state.inventoryTotalData]
        var closingBalanceArr = [...[(i18n.t('static.supplyPlan.endingBalance')).replaceAll(' ', '%20')], ...this.state.closingBalanceArray]
        var monthsOfStockArr = [...[(i18n.t('static.supplyPlan.monthsOfStock')).replaceAll(' ', '%20')], ... this.state.monthsOfStockArray]
        var amcgArr = [...[(i18n.t('static.supplyPlan.amc')).replaceAll(' ', '%20')], ...this.state.amcTotalData]

        var minStocArr = [...[(i18n.t('static.supplyPlan.minStockMos')).replaceAll(' ', '%20')], ...this.state.minStockMoS]
        var maxStockArr = [...[(i18n.t('static.supplyPlan.maxStockMos')).replaceAll(' ', '%20')], ...this.state.maxStockMoS]
        var unmetDemandArr = [...[(i18n.t('static.supplyPlan.unmetDemandStr')).replaceAll(' ', '%20')], ...this.state.unmetDemand]


        A.push(openningArr)
        A.push(consumptionArr)
        A.push(shipmentArr)
        A.push(suggestedArr)
        A.push(manualEntryShipmentsArr)
        A.push(deliveredShipmentArr)
        A.push(shippedShipmentArr)
        A.push(orderedShipmentArr)
        A.push(plannedShipmentArr)
        A.push(erpShipmentsArr)
        A.push(deliveredErpShipmentArr)
        A.push(shippedErpShipmentArr)
        A.push(orderedErpShipmentArr)
        A.push(plannedErpShipmentArr)
        A.push(inventoryArr)
        A.push(closingBalanceArr)
        A.push(monthsOfStockArr)
        A.push(amcgArr)

        A.push(minStocArr)
        A.push(maxStockArr)
        A.push(unmetDemandArr)
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.supplyPlan') + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    exportPDF = () => {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()
            doc.setFont('helvetica', 'bold')

            // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                /*doc.addImage(data, 10, 30, {
                align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.supplyPlan'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.program.program') + ' : ' + (this.state.programSelect).label, doc.internal.pageSize.width / 8, 80, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnit).label, doc.internal.pageSize.width / 8, 90, {
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

        doc.setFontSize(15);

        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 100;
        var aspectwidth1 = (width - h1);

        doc.addImage(canvasImg, 'png', 50, 110, 750, 290, 'CANVAS');
        // doc.addImage(canvasImg, 'png', 50, 110, aspectwidth1, (height - h1) * 3 / 4);
        const header = [...[""], ... (this.state.monthsArray.map(item => (
            item.monthName.concat(" ").concat(item.monthYear)
        ))
        )]

        const headers = [header];
        var openningArr = [...[i18n.t('static.supplyPlan.openingBalance')], ... this.state.openingBalanceArray]
        var consumptionArr = [...[("-" + i18n.t('static.supplyPlan.consumption'))], ...this.state.consumptionTotalData]
        var shipmentArr = [...[("+" + i18n.t('static.dashboard.shipments'))], ...this.state.shipmentsTotalData]
        var suggestedArr = [...[("   " + i18n.t('static.supplyPlan.suggestedShipments'))], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var manualEntryShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.manualEntryShipments'))], ...this.state.manualShipmentsTotalData]

        var deliveredShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered'))], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
        var shippedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped'))], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
        var orderedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered'))], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
        var plannedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned'))], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]

        var erpShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.erpShipments'))], ...this.state.erpShipmentsTotalData]
        var deliveredErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered'))], ...this.state.deliveredErpShipmentsTotalData.map(item => item.qty)]
        var shippedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped'))], ...this.state.shippedErpShipmentsTotalData.map(item => item.qty)]
        var orderedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered'))], ...this.state.orderedErpShipmentsTotalData.map(item => item.qty)]
        var plannedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned'))], ...this.state.plannedErpShipmentsTotalData.map(item => item.qty)]

        var inventoryArr = [...[(i18n.t('static.supplyPlan.adjustments'))], ...this.state.inventoryTotalData]
        var closingBalanceArr = [...[(i18n.t('static.supplyPlan.endingBalance'))], ...this.state.closingBalanceArray]
        var monthsOfStockArr = [...[(i18n.t('static.supplyPlan.monthsOfStock'))], ... this.state.monthsOfStockArray]
        var amcgArr = [...[(i18n.t('static.supplyPlan.amc'))], ...this.state.amcTotalData]

        var minStocArr = [...[(i18n.t('static.supplyPlan.minStockMos'))], ...this.state.minStockMoS]
        var maxStockArr = [...[(i18n.t('static.supplyPlan.maxStockMos'))], ...this.state.maxStockMoS]
        var unmetDemandArr = [...[(i18n.t('static.supplyPlan.unmetDemandStr'))], ...this.state.unmetDemand]

        const data = [openningArr.map(c => this.formatter(c)), consumptionArr.map(c => this.formatter(c)), shipmentArr.map(c => this.formatter(c)), suggestedArr.map(c => this.formatter(c)), manualEntryShipmentsArr.map(c => this.formatter(c)), deliveredShipmentArr.map(c => this.formatter(c)), shippedShipmentArr.map(c => this.formatter(c)), orderedShipmentArr.map(c => this.formatter(c)), plannedShipmentArr.map(c => this.formatter(c)), erpShipmentsArr.map(c => this.formatter(c)), deliveredErpShipmentArr.map(c => this.formatter(c)), shippedErpShipmentArr.map(c => this.formatter(c)), orderedErpShipmentArr.map(c => this.formatter(c)), plannedErpShipmentArr.map(c => this.formatter(c)), inventoryArr.map(c => this.formatter(c)), closingBalanceArr.map(c => this.formatter(c)), monthsOfStockArr.map(c => this.formatterDouble(c)), amcgArr.map(c => this.formatter(c)), minStocArr.map(c => this.formatter(c)), maxStockArr.map(c => this.formatter(c)), unmetDemandArr.map(c => this.formatter(c))];

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: height,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8 },
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.supplyPlan') + ".pdf")

    }

    componentDidMount() {
        var fields = document.getElementsByClassName("totalShipments");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }

        fields = document.getElementsByClassName("manualShipments");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }

        fields = document.getElementsByClassName("erpShipments");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false
                })
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            label: programJson1.programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson);
                    }
                }
                this.setState({
                    programList: proList,
                    loading: false
                })
            }.bind(this);
        }.bind(this);
    };

    getPlanningUnitList(value) {
        document.getElementById("planningUnitId").value = 0;
        document.getElementById("planningUnit").value = "";
        this.setState({
            loading: true,
            display: 'none',
            planningUnitChange: false,
            programSelect: value,
            programId: value != "" && value != undefined ? value.value : 0,
            planningUnit: ""
        })
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(value != "" && value != undefined ? value.value : 0);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var whatIfProgramDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                var whatIfProgramDataOs = whatIfProgramDataTransaction.objectStore('whatIfProgramData');
                var item = {
                    id: programRequest.result.id,
                    programId: programRequest.result.programId,
                    version: programRequest.result.version,
                    programName: (CryptoJS.AES.encrypt(JSON.stringify((programRequest.result.label)), SECRET_KEY)).toString(),
                    programData: programRequest.result.programData,
                    userId: programRequest.result.userId
                }
                var whatIfRequest = whatIfProgramDataOs.put(item);
                whatIfRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false
                    })
                }.bind(this);
                whatIfRequest.onsuccess = function (e) {
                    for (var i = 0; i < programJson.regionList.length; i++) {
                        var regionJson = {
                            // name: // programJson.regionList[i].regionId,
                            name: getLabelText(programJson.regionList[i].label, this.state.lang),
                            id: programJson.regionList[i].regionId
                        }
                        regionList.push(regionJson)
                    }
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
                    planningunitRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    planningunitRequest.onsuccess = function (e) {
                        var myResult = [];
                        myResult = planningunitRequest.result;
                        var programId = (value != "" && value != undefined ? value.value : 0).split("_")[0];
                        var proList = []
                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId && myResult[i].active == true) {
                                var productJson = {
                                    label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                    value: myResult[i].planningUnit.id
                                }
                                proList.push(productJson);
                                planningList.push(myResult[i]);
                            }
                        }

                        var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
                        var puOs = puTransaction.objectStore('planningUnit');
                        var puRequest = puOs.getAll();
                        var planningUnitListForConsumption = []
                        puRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        puRequest.onsuccess = function (e) {
                            var puResult = [];
                            puResult = puRequest.result;
                            planningUnitListForConsumption = puResult;


                            var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                            var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                            var dataSourceRequest = dataSourceOs.getAll();
                            dataSourceRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext'),
                                    loading: false
                                })
                            }.bind(this);
                            dataSourceRequest.onsuccess = function (event) {
                                var dataSourceResult = [];
                                dataSourceResult = dataSourceRequest.result;
                                for (var k = 0; k < dataSourceResult.length; k++) {
                                    if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0 && dataSourceResult[k].active == true) {
                                        if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                            dataSourceListAll.push(dataSourceResult[k]);

                                        }
                                    }
                                }
                                this.setState({
                                    planningUnitList: proList,
                                    programPlanningUnitList: myResult,
                                    regionList: regionList,
                                    programJson: programJson,
                                    dataSourceListAll: dataSourceListAll,
                                    planningUnitListForConsumption: planningUnitListForConsumption,
                                    loading: false
                                })
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    getMonthArray(currentDate) {
        var month = [];
        var curDate = currentDate.subtract(MONTHS_IN_PAST_FOR_SUPPLY_PLAN, 'months');
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')), monthName: i18n.t("static.common." + (curDate.format('MMM')).toLowerCase()), monthYear: curDate.format('YY') })
        for (var i = 1; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')), monthName: i18n.t("static.common." + (curDate.format('MMM')).toLowerCase()), monthYear: curDate.format('YY') })
        }
        this.setState({
            monthsArray: month
        })
        return month;
    }

    formSubmit(value, monthCount) {
        // this.setState({
        //     showTotalShipment: false,
        //     showManualShipment: false,
        //     showErpShipment: false
        // })
        // this.toggleAccordionTotalShipments();
        // this.toggleAccordionManualShipments();
        // this.toggleAccordionErpShipments();

        if (value != "" && value != undefined ? value.value : 0 != 0) {
            this.setState({
                planningUnitChange: true,
                display: 'block'
            })
        } else {
            this.setState({
                planningUnitChange: true,
                display: 'none'
            })
        }
        this.setState({ loading: true });
        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));
        var planningUnitId = value != "" && value != undefined ? value.value : 0;
        var planningUnitName = value.label;

        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
        var regionListFiltered = this.state.regionList;
        var consumptionTotalData = [];
        var shipmentsTotalData = [];
        var manualShipmentsTotalData = [];
        var deliveredShipmentsTotalData = [];
        var shippedShipmentsTotalData = [];
        var orderedShipmentsTotalData = [];
        var plannedShipmentsTotalData = [];
        var erpShipmentsTotalData = [];
        var deliveredErpShipmentsTotalData = [];
        var shippedErpShipmentsTotalData = [];
        var orderedErpShipmentsTotalData = [];
        var plannedErpShipmentsTotalData = [];
        var totalExpiredStockArr = [];
        var amcTotalData = [];
        var minStockMoS = [];
        var maxStockMoS = [];
        var inventoryTotalData = [];
        var suggestedShipmentsTotalData = [];
        var openingBalanceArray = [];
        var closingBalanceArray = [];
        var jsonArrForGraph = [];
        var monthsOfStockArray = [];
        var unmetDemand = [];
        var consumptionArrayForRegion = [];
        var inventoryArrayForRegion = [];
        var paColors = []
        var lastActualConsumptionDate = [];
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                this.setState({
                    shelfLife: programPlanningUnit.shelfLife,
                    versionId: programJson.currentVersion.versionId,
                    monthsInPastForAMC: programPlanningUnit.monthsInPastForAmc,
                    monthsInFutureForAMC: programPlanningUnit.monthsInFutureForAmc,
                    reorderFrequency: programPlanningUnit.reorderFrequencyInMonths,
                    minMonthsOfStock: programPlanningUnit.minMonthsOfStock
                })

                var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                var shipmentStatusRequest = shipmentStatusOs.getAll();
                shipmentStatusRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false
                    })
                }.bind(this);
                shipmentStatusRequest.onsuccess = function (event) {
                    var shipmentStatusResult = [];
                    shipmentStatusResult = shipmentStatusRequest.result;
                    var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                    var papuOs = papuTransaction.objectStore('procurementAgent');
                    var papuRequest = papuOs.getAll();
                    papuRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        console.log("ProgramJson", programJson);
                        var supplyPlanData = [];
                        if (programJson.supplyPlan != undefined) {
                            supplyPlanData = (programJson.supplyPlan).filter(c => c.planningUnitId == planningUnitId);
                        }
                        if (supplyPlanData.length > 0) {
                            var lastClosingBalance = 0;
                            for (var n = 0; n < m.length; n++) {
                                var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).format("YYYY-MM-DD"));
                                if (jsonList.length > 0) {
                                    openingBalanceArray.push(jsonList[0].openingBalance);
                                    consumptionTotalData.push({ consumptionQty: jsonList[0].consumptionQty, consumptionType: jsonList[0].actualFlag, textColor: jsonList[0].actualFlag == 1 ? "#000000" : "rgb(170, 85, 161)" });
                                    shipmentsTotalData.push(jsonList[0].shipmentTotalQty);
                                    manualShipmentsTotalData.push(jsonList[0].manualTotalQty);

                                    // Tomorrow begin from here
                                    var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == this.state.planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate) && c.erpFlag.toString() == "false");
                                    var sd1 = [];
                                    var sd2 = [];
                                    var sd3 = [];
                                    var sd4 = [];
                                    var paColor = "";
                                    if (shipmentDetails != "" && shipmentDetails != undefined) {
                                        for (var i = 0; i < shipmentDetails.length; i++) {
                                            if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd1.push(shipmentDetail);
                                            } else if (shipmentDetails[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd2.push(shipmentDetail);
                                            } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd3.push(shipmentDetail);
                                            } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd4.push(shipmentDetail);
                                            }
                                        }
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd1.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        deliveredShipmentsTotalData.push({ qty: jsonList[0].receivedShipmentsTotalData, month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        deliveredShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd2.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        shippedShipmentsTotalData.push({ qty: jsonList[0].shippedShipmentsTotalData, month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        shippedShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd3.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        orderedShipmentsTotalData.push({ qty: jsonList[0].approvedShipmentsTotalData, month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        orderedShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd4.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        plannedShipmentsTotalData.push({ qty: parseInt(jsonList[0].submittedShipmentsTotalData) + parseInt(jsonList[0].onholdShipmentsTotalData) + parseInt(jsonList[0].plannedShipmentsTotalData), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        plannedShipmentsTotalData.push("")
                                    }

                                    erpShipmentsTotalData.push(jsonList[0].erpTotalQty);


                                    var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == this.state.planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate) && c.erpFlag.toString() == "true");
                                    var sd1 = [];
                                    var sd2 = [];
                                    var sd3 = [];
                                    var sd4 = [];
                                    if (shipmentDetails != "" && shipmentDetails != undefined) {
                                        for (var i = 0; i < shipmentDetails.length; i++) {
                                            if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd1.push(shipmentDetail);
                                            } else if (shipmentDetails[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd2.push(shipmentDetail);
                                            } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd3.push(shipmentDetail);
                                            } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                    if (index == -1) {
                                                        paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + shipmentDetails[i].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor = "#efefef"
                                                    }
                                                }
                                                sd4.push(shipmentDetail);
                                            }
                                        }
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd1.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        deliveredErpShipmentsTotalData.push({ qty: jsonList[0].receivedErpShipmentsTotalData, month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        deliveredErpShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd2.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        shippedErpShipmentsTotalData.push({ qty: jsonList[0].shippedErpShipmentsTotalData, month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        shippedErpShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd3.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        orderedErpShipmentsTotalData.push({ qty: jsonList[0].approvedErpShipmentsTotalData, month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        orderedErpShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (sd4.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        plannedErpShipmentsTotalData.push({ qty: parseInt(jsonList[0].submittedErpShipmentsTotalData) + parseInt(jsonList[0].onholdErpShipmentsTotalData) + parseInt(jsonList[0].plannedErpShipmentsTotalData), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour) });
                                    } else {
                                        plannedErpShipmentsTotalData.push("")
                                    }

                                    inventoryTotalData.push(jsonList[0].adjustmentQty == 0 ? "" : jsonList[0].adjustmentQty);
                                    totalExpiredStockArr.push({ qty: jsonList[0].expiredStock, details: jsonList[0].batchDetails, month: m[n] });
                                    monthsOfStockArray.push(jsonList[0].mos);
                                    amcTotalData.push(jsonList[0].amc)
                                    minStockMoS.push(jsonList[0].minStockMoS)
                                    maxStockMoS.push(jsonList[0].maxStockMoS)
                                    unmetDemand.push(jsonList[0].unmetDemand == 0 ? "" : jsonList[0].unmetDemand);
                                    closingBalanceArray.push(jsonList[0].closingBalance)


                                    lastClosingBalance = jsonList[0].closingBalance

                                    // suggestedShipmentsTotalData.push(jsonList[0].suggestedShipmentsTotalData);
                                    // consumptionArrayForRegion = consumptionArrayForRegion.concat(jsonList[0].consumptionArrayForRegion);
                                    // inventoryArrayForRegion = inventoryArrayForRegion.concat(jsonList[0].inventoryArrayForRegion);
                                    var sstd = {}
                                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                    var compare = (m[n].startDate >= currentMonth);
                                    var stockInHand = jsonList[0].closingBalance;
                                    if (compare && parseInt(stockInHand) <= parseInt(jsonList[0].minStock)) {
                                        var suggestedOrd = parseInt(jsonList[0].maxStock - jsonList[0].minStock);
                                        if (suggestedOrd == 0) {
                                            var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                                parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                                parseFloat(programJson.arrivedToDeliveredLeadTime);
                                            var expectedDeliveryDate = moment(m[n].startDate).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                            var isEmergencyOrder = 0;
                                            if (expectedDeliveryDate >= currentMonth) {
                                                isEmergencyOrder = 0;
                                            } else {
                                                isEmergencyOrder = 1;
                                            }
                                            sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder };
                                        } else {
                                            var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                                parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                                parseFloat(programJson.arrivedToDeliveredLeadTime);
                                            var expectedDeliveryDate = moment(m[n].startDate).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                            var isEmergencyOrder = 0;
                                            if (expectedDeliveryDate >= currentMonth) {
                                                isEmergencyOrder = 0;
                                            } else {
                                                isEmergencyOrder = 1;
                                            }
                                            sstd = { "suggestedOrderQty": suggestedOrd, "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder };
                                        }
                                    } else {
                                        var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                            parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                            parseFloat(programJson.arrivedToDeliveredLeadTime);
                                        var expectedDeliveryDate = moment(m[n].startDate).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                        var isEmergencyOrder = 0;
                                        if (expectedDeliveryDate >= currentMonth) {
                                            isEmergencyOrder = 0;
                                        } else {
                                            isEmergencyOrder = 1;
                                        }
                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder };
                                    }
                                    suggestedShipmentsTotalData.push(sstd);

                                    var consumptionListForRegion = (programJson.consumptionList).filter(c => (c.consumptionDate >= m[n].startDate && c.consumptionDate <= m[n].endDate) && c.planningUnit.id == this.state.planningUnitId && c.active == true);
                                    var inventoryListForRegion = (programJson.inventoryList).filter(c => (c.inventoryDate >= m[n].startDate && c.inventoryDate <= m[n].endDate) && c.planningUnit.id == this.state.planningUnitId && c.active == true);
                                    var consumptionTotalForRegion = 0;
                                    var totalAdjustmentsQtyForRegion = 0;
                                    var totalActualQtyForRegion = 0;
                                    var projectedInventoryForRegion = 0;
                                    var regionsReportingActualInventory = [];
                                    var totalNoOfRegions = (this.state.regionListFiltered).length;
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var consumptionQtyForRegion = 0;
                                        var actualFlagForRegion = "";
                                        var consumptionListForRegionalDetails = consumptionListForRegion.filter(c => c.region.id == regionListFiltered[r].id);
                                        var noOfActualEntries = (consumptionListForRegionalDetails.filter(c => c.actualFlag.toString() == "true")).length;
                                        for (var cr = 0; cr < consumptionListForRegionalDetails.length; cr++) {
                                            if (noOfActualEntries > 0) {
                                                if (consumptionListForRegionalDetails[cr].actualFlag.toString() == "true") {
                                                    consumptionQtyForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                    consumptionTotalForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                }
                                                actualFlagForRegion = true;
                                            } else {
                                                consumptionQtyForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                consumptionTotalForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                actualFlagForRegion = false;
                                            }
                                        }
                                        if (consumptionListForRegionalDetails.length == 0) {
                                            consumptionQtyForRegion = "";
                                        }
                                        consumptionArrayForRegion.push({ "regionId": regionListFiltered[r].id, "qty": consumptionQtyForRegion, "actualFlag": actualFlagForRegion, "month": m[n] })

                                        var adjustmentsQtyForRegion = 0;
                                        var actualQtyForRegion = 0;
                                        var inventoryListForRegionalDetails = inventoryListForRegion.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionListFiltered[r].id);
                                        var actualCount = 0;
                                        var adjustmentsCount = 0;
                                        for (var cr = 0; cr < inventoryListForRegionalDetails.length; cr++) {
                                            if (inventoryListForRegionalDetails[cr].actualQty != 0 && inventoryListForRegionalDetails[cr].actualQty != null && inventoryListForRegionalDetails[cr].actualQty != "") {
                                                actualCount += 1;
                                                actualQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].actualQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                                totalActualQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].actualQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                                var index = regionsReportingActualInventory.findIndex(c => c == regionListFiltered[r].id);
                                                if (index == -1) {
                                                    regionsReportingActualInventory.push(regionListFiltered[r].id)
                                                }
                                            }
                                            if (inventoryListForRegionalDetails[cr].adjustmentQty != 0 && inventoryListForRegionalDetails[cr].adjustmentQty != null && inventoryListForRegionalDetails[cr].adjustmentQty != "") {
                                                adjustmentsCount += 1;
                                                adjustmentsQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].adjustmentQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                                totalAdjustmentsQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].adjustmentQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                            }
                                        }
                                        if (actualCount == 0) {
                                            actualQtyForRegion = "";
                                        }
                                        if (adjustmentsCount == 0) {
                                            adjustmentsQtyForRegion = "";
                                        }
                                        inventoryArrayForRegion.push({ "regionId": regionListFiltered[r].id, "adjustmentsQty": adjustmentsQtyForRegion, "actualQty": actualQtyForRegion, "month": m[n] })
                                    }
                                    consumptionArrayForRegion.push({ "regionId": -1, "qty": consumptionTotalForRegion, "actualFlag": true, "month": m[n] })
                                    console.log("auto adjustments", autoAdjustments);
                                    var invListForAuto = inventoryListForRegion.filter(c => (c.region == null || c.region.id == 0));
                                    var autoAdjustments = 0;
                                    for (var j = 0; j < invListForAuto.length; j++) {
                                        autoAdjustments += invListForAuto[j].adjustmentQty;
                                    }
                                    var projectedInventoryForRegion = jsonList[0].closingBalance - (autoAdjustments != "" ? autoAdjustments : 0);
                                    console.log("project Inventory", projectedInventoryForRegion);
                                    if (regionsReportingActualInventory.length != totalNoOfRegions) {
                                        totalActualQtyForRegion = i18n.t('static.supplyPlan.notAllRegionsHaveActualStock');
                                    }
                                    inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": totalAdjustmentsQtyForRegion, "actualQty": totalActualQtyForRegion, "finalInventory": jsonList[0].closingBalance, "autoAdjustments": autoAdjustments, "projectedInventory": projectedInventoryForRegion, "month": m[n] })
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var consumptionListForRegion = (programJson.consumptionList).filter(c => c.planningUnit.id == this.state.planningUnitId && c.active == true && c.actualFlag.toString() == "true");
                                        let conmax = moment.max(consumptionListForRegion.map(d => moment(d.consumptionDate)))
                                        lastActualConsumptionDate.push({ lastActualConsumptionDate: conmax, region: regionListFiltered[r].id });
                                    }
                                    var json = {
                                        month: m[n].month,
                                        consumption: jsonList[0].consumptionQty,
                                        stock: jsonList[0].closingBalance,
                                        planned: plannedShipmentsTotalData.qty + plannedErpShipmentsTotalData.qty,
                                        delivered: deliveredShipmentsTotalData.qty + deliveredErpShipmentsTotalData.qty,
                                        shipped: shippedShipmentsTotalData.qty + shippedErpShipmentsTotalData.qty,
                                        ordered: orderedShipmentsTotalData.qty + orderedErpShipmentsTotalData.qty,
                                        mos: jsonList[0].mos,
                                        minMos: jsonList[0].minStockMoS,
                                        maxMos: jsonList[0].maxStockMoS
                                    }
                                    jsonArrForGraph.push(json);
                                } else {
                                    openingBalanceArray.push(lastClosingBalance);
                                    consumptionTotalData.push({ consumptionQty: "", consumptionType: "", textColor: "" });
                                    shipmentsTotalData.push(0);
                                    suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": moment(m[n].startDate).format("YYYY-MM-DD"), "isEmergencyOrder": 0 });
                                    manualShipmentsTotalData.push(0);
                                    deliveredShipmentsTotalData.push("");
                                    shippedShipmentsTotalData.push("");
                                    orderedShipmentsTotalData.push("");
                                    plannedShipmentsTotalData.push("");
                                    erpShipmentsTotalData.push(0);
                                    deliveredErpShipmentsTotalData.push("");
                                    shippedErpShipmentsTotalData.push("");
                                    orderedErpShipmentsTotalData.push("");
                                    plannedErpShipmentsTotalData.push("");
                                    inventoryTotalData.push("");
                                    totalExpiredStockArr.push({ qty: 0, details: [], month: m[n] });
                                    monthsOfStockArray.push("")
                                    amcTotalData.push("");
                                    minStockMoS.push("");
                                    maxStockMoS.push("")
                                    unmetDemand.push("");
                                    closingBalanceArray.push(lastClosingBalance);
                                    for (var i = 0; i < this.state.regionListFiltered.length; i++) {
                                        consumptionArrayForRegion.push({ "regionId": regionListFiltered[i].id, "qty": "", "actualFlag": "", "month": m[n] })
                                        inventoryArrayForRegion.push({ "regionId": regionListFiltered[i].id, "adjustmentsQty": "", "actualQty": "", "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                    }
                                    consumptionArrayForRegion.push({ "regionId": -1, "qty": "", "actualFlag": "", "month": m[n] })
                                    inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": "", "actualQty": i18n.t('static.supplyPlan.notAllRegionsHaveActualStock'), "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                    lastActualConsumptionDate.push("");

                                    var json = {
                                        month: m[n].month,
                                        consumption: 0,
                                        stock: lastClosingBalance,
                                        planned: 0,
                                        delivered: 0,
                                        shipped: 0,
                                        ordered: 0,
                                        mos: "",
                                        minMos: "",
                                        maxMos: ""
                                    }
                                    jsonArrForGraph.push(json);
                                }
                            }
                            // console.log("supplyPlan", supplyPlan);
                            console.log("consumptionTotalData", consumptionTotalData);
                            this.setState({
                                openingBalanceArray: openingBalanceArray,
                                consumptionTotalData: consumptionTotalData,
                                expiredStockArr: totalExpiredStockArr,
                                shipmentsTotalData: shipmentsTotalData,
                                suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                                manualShipmentsTotalData: manualShipmentsTotalData,
                                deliveredShipmentsTotalData: deliveredShipmentsTotalData,
                                shippedShipmentsTotalData: shippedShipmentsTotalData,
                                orderedShipmentsTotalData: orderedShipmentsTotalData,
                                plannedShipmentsTotalData: plannedShipmentsTotalData,
                                erpShipmentsTotalData: erpShipmentsTotalData,
                                deliveredErpShipmentsTotalData: deliveredErpShipmentsTotalData,
                                shippedErpShipmentsTotalData: shippedErpShipmentsTotalData,
                                orderedErpShipmentsTotalData: orderedErpShipmentsTotalData,
                                plannedErpShipmentsTotalData: plannedErpShipmentsTotalData,
                                inventoryTotalData: inventoryTotalData,
                                monthsOfStockArray: monthsOfStockArray,
                                amcTotalData: amcTotalData,
                                minStockMoS: minStockMoS,
                                maxStockMoS: maxStockMoS,
                                unmetDemand: unmetDemand,
                                inventoryFilteredArray: inventoryArrayForRegion,
                                regionListFiltered: regionListFiltered,
                                consumptionFilteredArray: consumptionArrayForRegion,
                                planningUnitName: planningUnitName,
                                lastActualConsumptionDate: moment(Date.now()).format("YYYY-MM-DD"),
                                // lastActualConsumptionDateArr: supplyPlanData[0].lastActualConsumptionDate,
                                lastActualConsumptionDateArr: lastActualConsumptionDate,
                                paColors: paColors,
                                jsonArrForGraph: jsonArrForGraph,
                                closingBalanceArray: closingBalanceArray,
                                loading: false
                            })
                        } else {
                            this.setState({ loading: false })
                            // calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'programData', 'supplyPlan', this);
                        }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    toggleLarge(supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder, shipmentType) {
        var supplyPlanType = supplyPlanType;
        this.setState({
            consumptionError: '',
            inventoryError: '',
            shipmentError: '',
            shipmentDuplicateError: '',
            shipmentBudgetError: '',
            shipmentBatchError: '',
            suggestedShipmentError: '',
            suggestedShipmentDuplicateError: '',
            budgetError: '',
            consumptionBatchError: '',
            inventoryBatchError: '',
            shipmentValidationBatchError: '',
            consumptionDuplicateError: '',
            inventoryDuplicateError: '',
            consumptionBatchInfoDuplicateError: '',
            consumptionBatchInfoNoStockError: '',
            inventoryBatchInfoDuplicateError: '',
            inventoryBatchInfoNoStockError: '',
            shipmentBatchInfoDuplicateError: '',
            inventoryNoStockError: '',
            consumptionNoStockError: '',
            noFundsBudgetError: '',
            consumptionBatchInfoChangedFlag: 0,
            inventoryBatchInfoChangedFlag: 0,
            consumptionChangedFlag: 0,
            inventoryChangedFlag: 0,
            budgetChangedFlag: 0,
            shipmentBatchInfoChangedFlag: 0,
            shipmentChangedFlag: 0,
            suggestedShipmentChangedFlag: 0,
            shipmentDatesChangedFlag: 0,
            shipmentDatesError: '',
            shipmentQtyChangedFlag: 0,
            qtyCalculatorValidationError: "",
            showShipments: 0,
            showInventory: 0,
            showConsumption: 0

        })
        if (supplyPlanType == 'Consumption') {
            var monthCountConsumption = this.state.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption,
            });
            this.formSubmit(this.state.planningUnit, monthCountConsumption);
        } else if (supplyPlanType == 'SuggestedShipments') {
            this.setState({
                shipments: !this.state.shipments
            });
            this.suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder);
        } else if (supplyPlanType == 'shipments') {
            this.setState({
                shipments: !this.state.shipments
            });
            this.shipmentsDetailsClicked(shipmentType, startDate, endDate);
        } else if (supplyPlanType == 'Adjustments') {
            var monthCountAdjustments = this.state.monthCount;
            this.setState({
                adjustments: !this.state.adjustments,
                monthCountAdjustments: monthCountAdjustments
            });
            this.formSubmit(this.state.planningUnit, monthCountAdjustments);
        } else if (supplyPlanType == 'expiredStock') {
            this.setState({ loading: true });
            var details = (this.state.expiredStockArr).filter(c => moment(c.month.startDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD"))
            console.log("startDate", startDate)
            if (startDate != undefined) {
                this.setState({
                    expiredStockModal: !this.state.expiredStockModal,
                    expiredStockDetails: details[0].details,
                    expiredStockDetailsTotal: details[0].qty,
                    loading: false
                })
            } else {
                this.setState({
                    expiredStockModal: !this.state.expiredStockModal
                })
            }
        }
    }

    actionCanceledExpiredStock() {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal,
            message: i18n.t('static.message.cancelled'),
            color: 'red',
        })
    }

    actionCanceled(supplyPlanType) {
        var inputs = document.getElementsByClassName("submitBtn");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        this.setState({
            message: i18n.t('static.message.cancelled'),
            color: 'red',
            consumptionError: '',
            inventoryError: '',
            shipmentError: '',
            suggestedShipmentError: '',
            shipmentDuplicateError: '',
            shipmentBudgetError: '',
            shipmentBatchError: '',
            suggestedShipmentDuplicateError: '',
            budgetError: '',
            consumptionBatchError: '',
            inventoryBatchError: '',
            shipmentValidationBatchError: '',
            consumptionChangedFlag: 0,
            suggestedShipmentChangedFlag: 0,
            shipmentChangedFlag: 0,
            inventoryChangedFlag: 0,
            consumptionDuplicateError: '',
            inventoryDuplicateError: '',
            inventoryNoStockError: '',
            consumptionNoStockError: '',
            consumptionBatchInfoDuplicateError: '',
            consumptionBatchInfoNoStockError: '',
            inventoryBatchInfoDuplicateError: '',
            inventoryBatchInfoNoStockError: '',
            shipmentBatchInfoDuplicateError: '',
            noFundsBudgetError: '',
            consumptionBatchInfoChangedFlag: 0,
            inventoryBatchInfoChangedFlag: 0,
            consumptionChangedFlag: 0,
            inventoryChangedFlag: 0,
            budgetChangedFlag: 0,
            shipmentBatchInfoChangedFlag: 0,
            shipmentChangedFlag: 0,
            suggestedShipmentChangedFlag: 0,
            shipmentDatesChangedFlag: 0,
            shipmentDatesError: '',
            shipmentQtyChangedFlag: 0,
            qtyCalculatorValidationError: "",
            showShipments: 0,
            showInventory: 0

        },
            () => {
                this.hideSecondComponent();
            })
        this.toggleLarge(supplyPlanType);
    }

    leftClicked() {
        var monthCount = (this.state.monthCount) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(this.state.planningUnit, monthCount)
    }

    rightClicked() {
        var monthCount = (this.state.monthCount) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(this.state.planningUnit, monthCount)
    }

    leftClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption)
    }

    rightClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption);
    }

    leftClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments)
    }

    rightClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments);
    }

    // Consumption Functionality

    // Show consumption details
    consumptionDetailsClicked(startDate, endDate, region, actualFlag, month) {
        this.setState({ loading: true });
        var elInstance = this.state.consumptionBatchInfoTableEl;
        if (elInstance != undefined && elInstance != "") {
            elInstance.destroy();
        }
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
            var programRequest = programDataOs.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var batchInfoList = programJson.batchInfoList;
                var consumptionListUnFiltered = (programJson.consumptionList);
                var consumptionList = consumptionListUnFiltered.filter(con =>
                    con.planningUnit.id == planningUnitId
                    && con.region.id == region
                    && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
                this.setState({
                    programJsonAfterConsumptionClicked: programJson,
                    consumptionListUnFiltered: consumptionListUnFiltered,
                    batchInfoList: batchInfoList,
                    programJson: programJson,
                    consumptionList: consumptionList,
                    showConsumption: 1,
                    consumptionMonth: month,
                    consumptionStartDate: startDate,
                    consumptionRegion: region
                })
                this.refs.consumptionChild.showConsumptionData();
            }.bind(this)
        }.bind(this)
    }
    // Consumption Functionality

    // Adjustments Functionality
    // Show adjustments details
    adjustmentsDetailsClicked(region, month, endDate, inventoryType) {
        this.setState({ loading: true });
        var elInstance = this.state.inventoryBatchInfoTableEl;
        if (elInstance != undefined && elInstance != "") {
            elInstance.destroy();
        }
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('whatIfProgramData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var batchInfoList = programJson.batchInfoList;
                var inventoryListUnFiltered = (programJson.inventoryList);
                var inventoryList = (programJson.inventoryList).filter(c =>
                    c.planningUnit.id == planningUnitId &&
                    c.region != null && c.region.id != 0 &&
                    c.region.id == region &&
                    moment(c.inventoryDate).format("MMM YY") == month);
                if (inventoryType == 1) {
                    inventoryList = inventoryList.filter(c => c.actualQty != "" && c.actualQty != 0 && c.actualQty != null);
                } else {
                    inventoryList = inventoryList.filter(c => c.adjustmentQty != "" && c.adjustmentQty != 0 && c.adjustmentQty != null);
                }
                this.setState({
                    batchInfoList: batchInfoList,
                    programJson: programJson,
                    inventoryListUnFiltered: inventoryListUnFiltered,
                    inventoryList: inventoryList,
                    showInventory: 1,
                    inventoryType: inventoryType,
                    inventoryMonth: month,
                    inventoryEndDate: endDate,
                    inventoryRegion: region
                })
                this.refs.inventoryChild.showInventoryData();
            }.bind(this)
        }.bind(this)
    }
    // Adjustments Functionality

    // Shipments functionality
    // Suggested shipments

    //Show Suggested shipments details
    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder) {
        this.setState({ loading: true });
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('whatIfProgramData');
            var programRequest = programTransaction.get(programId);
            var consumptionTotalData = [];
            var filteredArray = [];
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var planningUnitId = document.getElementById("planningUnitId").value;
                var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
                var shelfLife = programPlanningUnit.shelfLife;
                if (month != "") {
                    var suggestedShipmentList = this.state.suggestedShipmentsTotalData.filter(c => c.month == month && c.suggestedOrderQty != "");
                } else {
                    var suggestedShipmentList = [];
                    var json = {
                        suggestedOrderQty: 0
                    }
                    suggestedShipmentList.push(json);
                }
                var shipmentList = [];
                var emergencyOrder = true;
                if (isEmergencyOrder == 0) {
                    emergencyOrder = false;
                }
                var json = {
                    shipmentQty: suggestedShipmentList[0].suggestedOrderQty,
                    index: -1,
                    suggestedQty: suggestedShipmentList[0].suggestedOrderQty,
                    emergencyOrder: emergencyOrder,
                    shipmentId: 0,
                    accountFlag: true,
                    active: true,
                    erpFlag: false,
                    batchInfoList: [],
                    shipmentStatus: {
                        id: ""
                    },
                    procurementAgent: {
                        id: ""
                    },
                    fundingSource: {
                        id: ""
                    },
                    budget: {
                        id: ""
                    },
                    dataSource: {
                        id: ""
                    },
                    currency: {
                        currencyId: ""
                    }
                }
                shipmentList.push(json);
                console.log("Shipment list", shipmentList);
                this.setState({
                    shipmentListUnFiltered: programJson.shipmentList,
                    programJson: programJson,
                    shelfLife: shelfLife,
                    shipmentList: shipmentList,
                    showShipments: 1,
                })
                this.refs.shipmentChild.showShipmentData();
            }.bind(this)
        }.bind(this)
    }

    filterBatchInfoForExistingData = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[3];
        console.log("Value", value);
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }

        return mylist;
    }.bind(this)

    // Shipments Functionality

    tabPane() {
        let bar = {}
        if (this.state.jsonArrForGraph.length > 0)
            bar = {

                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: [
                    {
                        label: i18n.t('static.supplyPlan.planned'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#a5c5ec',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
                    },
                    {
                        label: i18n.t('static.supplyPlan.ordered'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#20a8d8',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.ordered)),
                    },
                    {
                        label: i18n.t('static.supplyPlan.shipped'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#7372cb',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.shipped)),
                    },
                    {
                        label: i18n.t('static.supplyPlan.delivered'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#042e6a',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.delivered)),
                    }, {
                        label: i18n.t('static.report.stock'),
                        stack: 2,
                        type: 'line',
                        yAxisID: 'A',
                        borderColor: '#d0cece',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.stock))
                    }, {
                        label: i18n.t('static.supplyPlan.consumption'),
                        type: 'line',
                        stack: 3,
                        yAxisID: 'A',
                        backgroundColor: 'transparent',
                        borderColor: '#f45c45',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.consumption))
                    },
                    {
                        label: i18n.t('static.supplyPlan.monthsOfStock'),
                        type: 'line',
                        stack: 4,
                        yAxisID: 'B',
                        backgroundColor: 'transparent',
                        borderColor: '#8be665',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.mos))
                    },
                    {
                        label: i18n.t('static.supplyPlan.minStockMos'),
                        type: 'line',
                        stack: 5,
                        yAxisID: 'B',
                        backgroundColor: 'transparent',
                        borderColor: '#59cacc',
                        borderStyle: 'dotted',
                        borderDash: [10, 10],
                        fill: '+1',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        pointStyle: 'line',
                        yValueFormatString: "$#,##0",
                        lineTension: 0,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.minMos))
                    },
                    {
                        label: i18n.t('static.supplyPlan.maxStockMos'),
                        type: 'line',
                        stack: 6,
                        yAxisID: 'B',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#59cacc',
                        borderStyle: 'dotted',
                        borderDash: [10, 10],
                        fill: true,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        yValueFormatString: "$#,##0",
                        data: this.state.jsonArrForGraph.map((item, index) => (item.maxMos))
                    }
                ]

            };
        return (
            <>
                <TabPane tabId="1">
                    <div id="supplyPlanTableId" style={{ display: this.state.display }}>
                        <Formik
                            enableReinitialize={true}
                            initialValues={initialValues}
                            validate={validate(validationSchema)}
                            onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
                                this.addRow();
                                resetForm({
                                    scenarioId: '',
                                    percentage: '',
                                    startDate: '',
                                    stopDate: ''
                                });
                            }}
                            render={
                                ({
                                    values,
                                    errors,
                                    touched,
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    isSubmitting,
                                    isValid,
                                    setTouched
                                }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='whatIfForm'>

                                            <Col md="12 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="">
                                                        <Label htmlFor="select">{i18n.t('static.whatIf.scenario')}</Label>
                                                        <div className="controls WhatifInputFeild">
                                                            {/* <InputGroup> */}
                                                            <Input
                                                                type="select"
                                                                name="scenarioId"
                                                                id="scenarioId"
                                                                bsSize="sm"
                                                                valid={!errors.scenarioId}
                                                                invalid={touched.scenarioId && !!errors.scenarioId}
                                                                onBlur={handleBlur}
                                                                value={this.state.scenarioId}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                <option value="1">{i18n.t('static.whatIf.increaseConsumption')}</option>
                                                                <option value="2">{i18n.t('static.whatIf.decreaseConsumption')}</option>
                                                                <option value="3">{i18n.t('static.whatIf.removeUnFundedShipments')}</option>
                                                                <option value="4">{i18n.t('static.whatIf.removePlannedShipmentsNotInLeadTimes')}</option>
                                                                <option value="5">{i18n.t('static.whatIf.removeApprovedShipmentsNotInLeadTimes')}</option>
                                                                <option value="6">{i18n.t('static.whatIf.removeShippedShipmentsNotInLeadTimes')}</option>

                                                            </Input>
                                                            {/* </InputGroup> */}
                                                        </div>
                                                        <FormFeedback className="red">{errors.scenarioId}</FormFeedback>
                                                    </FormGroup>
                                                    <div id="consumptionScenariosFields" style={{ display: 'none' }}>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="select">{i18n.t('static.whatIf.percentage')}</Label>
                                                            <div className="controls WhatifInputFeild">
                                                                {/* <InputGroup> */}
                                                                <Input
                                                                    type="number"
                                                                    name="percentage"
                                                                    id="percentage"
                                                                    bsSize="sm"
                                                                    valid={!errors.percentage}
                                                                    invalid={touched.percentage && !!errors.percentage}
                                                                    onBlur={handleBlur}
                                                                    value={this.state.percentage}
                                                                    onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                                >
                                                                </Input>
                                                                {/* </InputGroup> */}
                                                            </div>
                                                            <FormFeedback className="red">{errors.percentage}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
                                                            <div className="controls WhatifInputFeild">
                                                                {/* <InputGroup> */}
                                                                <DatePicker
                                                                    id="startDate"
                                                                    name="startDate"
                                                                    bsSize="sm"
                                                                    selected={this.state.startDate}
                                                                    onChange={(date) => { this.dataChangeDate(date) }}
                                                                    placeholderText={DATE_PLACEHOLDER_TEXT}
                                                                    // placeholderText="mm-dd-yyy"
                                                                    className="form-control-sm form-control date-color"
                                                                    disabledKeyboardNavigation
                                                                    autoComplete={"off"}
                                                                    dateFormat={DATE_FORMAT_SM}
                                                                />
                                                                {/* </InputGroup> */}
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
                                                            <div className="controls WhatifInputFeild">
                                                                {/* <InputGroup> */}
                                                                <DatePicker
                                                                    id="stopDate"
                                                                    name="stopDate"
                                                                    bsSize="sm"
                                                                    selected={this.state.stopDate}
                                                                    onChange={(date) => { this.dataChangeEndDate(date) }}
                                                                    minDate={this.state.startDate}
                                                                    placeholderText={DATE_PLACEHOLDER_TEXT}
                                                                    className="form-control-sm form-control date-color"
                                                                    disabledKeyboardNavigation
                                                                    autoComplete={"off"}
                                                                    dateFormat={DATE_FORMAT_SM}
                                                                />
                                                                {/* </InputGroup> */}
                                                            </div>
                                                        </FormGroup>
                                                    </div>
                                                    <FormGroup className="tab-ml-1 mt-4">
                                                        <Button type="submit" size="md" color="success" onClick={() => this.touchAll(errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </div>
                                            </Col>

                                        </Form>
                                    )} />
                        <div className="animated fadeIn">

                            <Row className="float-right">
                                <div className="col-md-12">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                </div>
                            </Row>
                            <Row>
                                <div className="col-md-12">
                                    <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                    <span className="supplyplan-rarrow" onClick={this.rightClicked}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                                </div>
                            </Row>

                            <Table className="table-bordered text-center mt-2 overflowhide" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th className="BorderNoneSupplyPlan"></th>
                                        <th className="supplyplanTdWidth"></th>
                                        {
                                            this.state.monthsArray.map(item => (
                                                <th className="supplyplanTdWidthForMonths" style={{ padding: '10px 0 !important' }}>{item.monthName.concat(" ").concat(item.monthYear)}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>

                                    <tr bgcolor='#d9d9d9'>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left"><b>{i18n.t('static.supplyPlan.openingBalance')}</b></td>
                                        {
                                            this.state.openingBalanceArray.map(item1 => (
                                                <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                            ))
                                        }
                                    </tr>
                                    <tr className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '')}>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left"><b>- {i18n.t('static.supplyPlan.consumption')}</b></td>
                                        {
                                            this.state.consumptionTotalData.map(item1 => (
                                                <td align="right" style={{ color: item1.textColor }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionTotalShipments()}>
                                            {this.state.showTotalShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                        </td>
                                        <td align="left"><b>+ {i18n.t('static.dashboard.shipments')}</b></td>
                                        {
                                            this.state.shipmentsTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>

                                    <tr className="totalShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.suggestedShipments')}</td>
                                        {
                                            this.state.suggestedShipmentsTotalData.map(item1 => {
                                                if (item1.suggestedOrderQty.toString() != "") {
                                                    if (item1.isEmergencyOrder == 1) {
                                                        return (<td align="right" bgcolor='red' style={{ color: "#FFF" }} className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                    }
                                                } else {
                                                    var compare = item1.month >= moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                    if (compare) {
                                                        return (<td>{item1.suggestedOrderQty}</td>)
                                                    } else {
                                                        return (<td>{item1.suggestedOrderQty}</td>)
                                                    }
                                                }
                                            })
                                        }
                                    </tr>

                                    <tr className="totalShipments hoverTd">
                                        <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionManualShipments()}>
                                            {this.state.showManualShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                        </td>
                                        <td align="left" onClick={() => this.toggleLarge('SuggestedShipments', "", 0, '', '', "0")}>&emsp;&emsp;{i18n.t('static.supplyPlan.manualEntryShipments')}</td>
                                        {
                                            this.state.manualShipmentsTotalData.map(item1 => (
                                                <td align="right" onClick={() => this.toggleLarge('SuggestedShipments', "", 0, '', '', "0")}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>

                                    <tr className="manualShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>

                                        {
                                            this.state.deliveredShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }

                                    </tr>

                                    <tr className="manualShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                        {
                                            this.state.shippedShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>

                                    <tr className="manualShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.ordered')}</td>
                                        {
                                            this.state.orderedShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr className="manualShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                        {
                                            this.state.plannedShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr className="totalShipments">
                                        <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionErpShipments()}>
                                            {this.state.showErpShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                        </td>
                                        <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.erpShipments')}</td>
                                        {
                                            this.state.erpShipmentsTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr className="erpShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>
                                        {
                                            this.state.deliveredErpShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>

                                    <tr className="erpShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                        {
                                            this.state.shippedErpShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr className="erpShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.ordered')}</td>
                                        {
                                            this.state.orderedErpShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr className="erpShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                        {
                                            this.state.plannedErpShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '')}>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left"><b>+/- {i18n.t('static.supplyPlan.adjustments')}</b></td>
                                        {
                                            this.state.inventoryTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left"><b>- {i18n.t('static.supplyplan.exipredStock')}</b></td>
                                        {
                                            this.state.expiredStockArr.map(item1 => {
                                                if (item1.toString() != "") {
                                                    if (item1.qty != 0) {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('expiredStock', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, '')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                    } else {
                                                        return (<td align="right"></td>)
                                                    }
                                                } else {
                                                    return (<td align="right">{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left"><b>{i18n.t('static.supplyPlan.endingBalance')}</b></td>
                                        {
                                            this.state.closingBalanceArray.map(item1 => (
                                                <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left"><b>{i18n.t('static.supplyPlan.monthsOfStock')}</b></td>
                                        {
                                            this.state.monthsOfStockArray.map(item1 => (
                                                <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">{i18n.t('static.supplyPlan.amc')}</td>
                                        {
                                            this.state.amcTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">{i18n.t('static.supplyPlan.minStockMos')}</td>
                                        {
                                            this.state.minStockMoS.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">{i18n.t('static.supplyPlan.maxStockMos')}</td>
                                        {
                                            this.state.maxStockMoS.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">{i18n.t('static.supplyPlan.unmetDemandStr')}</td>
                                        {
                                            this.state.unmetDemand.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                        <div className="row" >
                            {
                                this.state.jsonArrForGraph.length > 0
                                &&
                                <div className="col-md-12" >

                                    <div className="col-md-11 float-right">
                                        <div className="chart-wrapper chart-graph-report">
                                            <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                        </div>
                                    </div>   </div>}

                        </div>
                    </div>

                    {/* Consumption modal */}
                    <Modal isOpen={this.state.consumption}
                        className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.dashboard.consumptiondetails')}</strong>
                            <ul className="legendcommitversion">
                                <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                                <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                            </ul>
                        </ModalHeader>
                        <ModalBody>
                            <h6 className="red">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h6>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow-dataentry" onClick={this.leftClickedConsumption}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedConsumption}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th className="regionTdWidthConsumption"></th>
                                        {
                                            this.state.monthsArray.map(item => (
                                                <th className="supplyplanTdWidthForMonths">{item.monthName.concat(" ").concat(item.monthYear)}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.regionListFiltered.map(item => (
                                            <tr>
                                                <td align="left">{item.name}</td>
                                                {
                                                    this.state.consumptionFilteredArray.filter(c => c.regionId == item.id).map(item1 => {
                                                        if (item1.qty.toString() != '') {
                                                            if (item1.actualFlag.toString() == 'true') {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                            } else {
                                                                return (<td align="right" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                            }
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, ``, `${item1.month.month}`)}></td>)
                                                        }
                                                    })

                                                }
                                            </tr>
                                        )
                                        )
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.total')}</th>
                                        {
                                            this.state.consumptionFilteredArray.filter(c => c.regionId == -1).map(item => (
                                                <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></th>
                                            ))
                                        }
                                    </tr>
                                </tfoot>
                            </Table>
                            {this.state.showConsumption == 1 && <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} consumptionPage="whatIf" />}
                            <div className="table-responsive mt-3">
                                <div id="consumptionTable" />
                            </div>
                            <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                            <div className="table-responsive">
                                <div id="consumptionBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>

                            <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledConsumption()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.consumptionChild.saveConsumptionBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.consumptionChild.saveConsumption}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Consumption modal */}
                    {/* Adjustments modal */}
                    <Modal isOpen={this.state.adjustments}
                        className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">{i18n.t('static.supplyPlan.adjustmentsDetails')}</ModalHeader>
                        <ModalBody>
                            <h6 className="red">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h6>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow-dataentry-adjustment" onClick={this.leftClickedAdjustments}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedAdjustments}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th className="regionTdWidthAdjustments"></th>
                                        {
                                            this.state.monthsArray.map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (<th colSpan="2">{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr>
                                        <th></th>
                                        {
                                            this.state.monthsArray.map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (
                                                        <>
                                                            <th>{i18n.t("static.inventoryType.adjustment")}</th>
                                                            <th>{i18n.t("static.inventory.inventory")}</th>
                                                        </>)
                                                }
                                            })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.regionListFiltered.map(item => (
                                            <tr>
                                                <td style={{ textAlign: 'left' }}>{item.name}</td>
                                                {
                                                    this.state.inventoryFilteredArray.filter(c => c.regionId == item.id).map((item1, count) => {
                                                        if (count >= 3 && count <= 9) {
                                                            if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                    </>
                                                                )
                                                            } else if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() == "" || item1.actualQty.toString() == 0)) {
                                                                var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.regionId == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                                var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                                if (currentMonthDate > lastActualConsumptionDate) {
                                                                    return (
                                                                        <>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                            <td align="right"></td>
                                                                        </>
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}></td>
                                                                        </>
                                                                    )
                                                                }

                                                            } else if (item1.adjustmentsQty.toString() == '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.regionId == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                                var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                                if (currentMonthDate > lastActualConsumptionDate) {
                                                                    return (
                                                                        <>
                                                                            <td align="right"></td>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>

                                                                        </>
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                        </>
                                                                    )
                                                                }
                                                            } else {
                                                                var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.regionId == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                                var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                                if (currentMonthDate > lastActualConsumptionDate) {
                                                                    return (<><td align="right"></td><td align="right"></td></>)
                                                                } else {
                                                                    return (<><td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}></td>
                                                                    </>)
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            </tr>
                                        )
                                        )

                                    }
                                    <tr bgcolor='#d9d9d9'>
                                        <td style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.total')}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (
                                                        <>
                                                            <td style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentsQty} />
                                                            </td>
                                                            {(item.actualQty) > 0 ? <td style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.actualQty} /></td> : <td style={{ textAlign: 'left' }}>{item.actualQty}</td>}
                                                        </>
                                                    )
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan" colSpan="15"></td>
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td align="left">{i18n.t("static.supplyPlan.projectedInventory")}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (
                                                        <td colSpan="2">{item.projectedInventory}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td align="left">{i18n.t("static.supplyPlan.autoAdjustment")}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item1, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    if (item1.autoAdjustments.toString() != '') {
                                                        return (<td colSpan="2" ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.autoAdjustments} /></td>)
                                                    } else {
                                                        return (<td colSpan="2"></td>)
                                                    }
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td align="left">{i18n.t("static.supplyPlan.finalInventory")}</td>
                                        {
                                            this.state.closingBalanceArray.map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (
                                                        <td colSpan="2">{item}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                            {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} inventoryPage="whatIf" />}
                            <div className="table-responsive">
                                <div id="adjustmentsTable" className="table-responsive" />
                            </div>
                            <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                            <div className="table-responsive">
                                <div id="inventoryBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>

                            <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.inventoryChild.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.inventoryChild.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* adjustments modal */}
                    {/* Shipments modal */}
                    <Modal isOpen={this.state.shipments}
                        className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalHeader toggle={() => this.toggleLarge('shipments')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.supplyPlan.shipmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                        </ModalHeader>
                        <ModalBody>
                            {this.state.showShipments && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} shipmentPage="whatIf" />}
                            <h6 className="red">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError || this.state.supplyPlanError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentsDetailsTable" />
                            </div>

                            <h6 className="red">{this.state.qtyCalculatorValidationError}</h6>
                            <div className="table-responsive">
                                <div id="qtyCalculatorTable"></div>
                            </div>

                            <div className="table-responsive">
                                <div id="qtyCalculatorTable1"></div>
                            </div>

                            <div id="showSaveQtyButtonDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledShipments('qtyCalculator')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                            </div>

                            <h6 className="red">{this.state.shipmentDatesError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentDatesTable"></div>
                            </div>
                            <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                            </div>
                            <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>
                            <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipments()}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('shipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Shipments modal */}
                    {/* Expired Stock modal */}
                    <Modal isOpen={this.state.expiredStockModal}
                        className={'modal-md ' + this.props.className} style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalHeader toggle={() => this.toggleLarge('expiredStock')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.dashboard.expiryDetails')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th>{i18n.t('static.inventory.batchNumber')}</th>
                                        <th>{i18n.t('static.inventory.expireDate')}</th>
                                        <th>{i18n.t('static.supplyPlan.qatGenerated')}</th>
                                        <th>{i18n.t('static.supplyPlan.expiredQty')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.expiredStockDetails.map(item => (
                                            <tr>
                                                <td align="left">{item.batchNo}</td>
                                                <td align="left">{moment(item.expiryDate).format(DATE_FORMAT_CAP)}</td>
                                                <td align="left">{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                <td align="right">{item.expiredQty}</td>
                                            </tr>
                                        )
                                        )
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{ textAlign: 'left' }} colSpan="3">{i18n.t('static.supplyPlan.total')}</th>
                                        <th style={{ textAlign: 'right' }}>{this.state.expiredStockDetailsTotal}</th>
                                    </tr>
                                </tfoot>
                            </Table>
                        </ModalBody>
                        <ModalFooter>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledExpiredStock()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Expired stock modal */}
                </TabPane>
                <TabPane tabId="2">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0" id="realmDiv">
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th className="text-left">{i18n.t('static.whatIf.scenario')}</th>
                                            <th className="text-left">{i18n.t('static.common.startdate')}</th>
                                            <th className="text-left">{i18n.t('static.common.stopdate')}</th>
                                            <th className="text-left">{i18n.t('static.whatIf.percentage')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>{this.state.rows[idx].scenarioName}</td>
                                                    <td>{this.state.rows[idx].startDate}</td>
                                                    <td>{this.state.rows[idx].stopDate}</td>
                                                    <td>{this.state.rows[idx].percentage}</td>

                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>
            </>
        );
    }

    render() {
        const { programList } = this.state;

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <h5 className="red">{this.state.supplyPlanError}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                                {/* <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link> */}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pt-lg-0 pb-lg-0">
                        <div className=" pl-0">
                            <div className="row">
                                <FormGroup className="col-md-4">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls ">
                                        <Select
                                            name="programSelect"
                                            id="programSelect"
                                            bsSize="sm"
                                            options={this.state.programList}
                                            value={this.state.programSelect}
                                            onChange={(e) => { this.getPlanningUnitList(e); }}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-4 mb-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label>
                                    <div className="controls ">
                                        <Select
                                            name="planningUnit"
                                            id="planningUnit"
                                            bsSize="sm"
                                            options={this.state.planningUnitList}
                                            value={this.state.planningUnit}
                                            onChange={(e) => { this.updateFieldData(e); this.formSubmit(e, this.state.monthCount) }}
                                        />
                                    </div>
                                </FormGroup>
                                <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                            </div>
                            <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                                <ul className="legendcommitversion list-group">
                                    {
                                        this.state.paColors.map(item1 => (
                                            <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                                        ))
                                    }
                                    <li><span className="lightgreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.tbd')}</span></li>
                                    <li><span className="lightgreenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.multipleShipments')}</span></li>
                                    <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyShipments')} </span></li>
                                    <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                                    <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                                </ul>
                            </FormGroup>
                            <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px' }} style={{ display: this.state.display }}>
                                <ul className="legendcommitversion list-group">
                                    <li><span className="lightgreylegend "></span> <span className="legendcommitversionText"> {i18n.t("static.supplyPlan.minMonthsOfStock")} - {this.state.minMonthsOfStock}</span></li>
                                    <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.reorderFrequencyInMonths")} - {this.state.reorderFrequency}</span></li>
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.mospast")} - {this.state.monthsInPastForAMC}</span></li>
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.mosfuture")} - {this.state.monthsInFutureForAMC}</span></li>
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.shelfLife")} - {this.state.shelfLife}</span></li>
                                </ul>
                            </FormGroup>
                        </div>
                        <div className="animated fadeIn" style={{ display: this.state.display }}>
                            <Row>
                                <Col xs="12" md="12" className="mb-4">
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '1'}
                                                onClick={() => { this.toggle(0, '1'); }}>
                                                {i18n.t('static.dashboard.supplyPlan')}</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '2'}
                                                onClick={() => { this.toggle(0, '2'); }}>
                                                {i18n.t('static.whatIf.scenarioList')}
                                            </NavLink>

                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={this.state.activeTab[0]}>
                                        {this.tabPane()}
                                    </TabContent>
                                </Col>
                            </Row>
                        </div>
                    </CardBody>
                    <CardFooter className="pb-5">
                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        <Button style={{ display: this.state.display }} type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                        <Button style={{ display: this.state.display }} type="submit" size="md" color="success" className="float-right mr-1" onClick={this.saveSupplyPlan}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                    </CardFooter>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        this.setState({ loading: true })
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('whatIfProgramData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var shipmentListUnFiltered = programJson.shipmentList;
                this.setState({
                    shipmentListUnFiltered: shipmentListUnFiltered
                })
                var shipmentList = [];
                // var tableEditableBasedOnSupplyPlan = true;
                if (supplyPlanType == 'deliveredShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'shippedShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'orderedShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'plannedShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'deliveredErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'shippedErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'orderedErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'plannedErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                }
                this.setState({
                    showShipments: 1,
                    shipmentList: shipmentList,
                    shipmentListUnFiltered: shipmentListUnFiltered
                })
                this.refs.shipmentChild.showShipmentData();
            }.bind(this)
        }.bind(this)
    }

    updateState(parameterName, value) {
        console.log("in update state")
        this.setState({
            [parameterName]: value
        })

    }

    actionCanceledShipments(type) {
        if (type == "qtyCalculator") {
            document.getElementById("showSaveQtyButtonDiv").style.display = 'none';
            (this.refs.shipmentChild.state.qtyCalculatorTableEl).destroy();
            (this.refs.shipmentChild.state.qtyCalculatorTableEl1).destroy();
            this.refs.shipmentChild.state.shipmentQtyChangedFlag = 0;
            this.setState({
                qtyCalculatorValidationError: "",
                shipmentQtyChangedFlag: 0
            })
        } else if (type == "shipmentDates") {
            document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'none';
            (this.refs.shipmentChild.state.shipmentDatesTableEl).destroy();
            this.refs.shipmentChild.state.shipmentDatesChangedFlag = 0;
            this.setState({
                shipmentDatesChangedFlag: 0,
                shipmentDatesError: ""
            })
        } else if (type == "shipmentBatch") {
            document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'none';
            (this.refs.shipmentChild.state.shipmentBatchInfoTableEl).destroy();
            this.refs.shipmentChild.state.shipmentBatchInfoChangedFlag = 0;
            this.setState({
                shipmentBatchInfoChangedFlag: 0,
                shipmentValidationBatchError: "",
                shipmentBatchInfoDuplicateError: ""
            })
        }
    }

    actionCanceledInventory() {
        document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
        (this.refs.inventoryChild.state.inventoryBatchInfoTableEl).destroy();
        this.refs.inventoryChild.state.inventoryBatchInfoChangedFlag = 0;
        this.setState({
            inventoryBatchInfoChangedFlag: 0,
            inventoryBatchInfoDuplicateError: "",
            inventoryBatchInfoNoStockError: "",
            inventoryBatchError: ""
        })
    }

    actionCanceledConsumption() {
        document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'none';
        (this.refs.consumptionChild.state.consumptionBatchInfoTableEl).destroy();
        this.refs.consumptionChild.state.consumptionBatchInfoChangedFlag = 0;
        this.setState({
            consumptionBatchInfoChangedFlag: 0,
            consumptionBatchInfoDuplicateError: "",
            consumptionBatchInfoNoStockError: "",
            consumptionBatchError: ""
        })
    }

}
