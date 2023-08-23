import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Formik } from 'formik';
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import NumberFormat from 'react-number-format';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap';
import * as Yup from 'yup';
// import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP,JEXCEL_PAGINATION_OPTION } from '../../Constants.js'
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import ProgramService from '../../api/ProgramService';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { contrast } from '../../CommonComponent/JavascriptCommonFunctions';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_PAGINATION_OPTION, SECRET_KEY, APPROVED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, CANCELLED_SHIPMENT_STATUS, DATE_FORMAT_CAP, DELIVERED_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, NO_OF_MONTHS_ON_LEFT_CLICKED, NO_OF_MONTHS_ON_RIGHT_CLICKED, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SHIPMENT_DATA_SOURCE_TYPE, SHIPPED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, TBD_PROCUREMENT_AGENT_ID, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, JEXCEL_PRO_KEY, NO_OF_MONTHS_ON_LEFT_CLICKED_REGION, NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DATE_FORMAT, JEXCEL_DATE_FORMAT_SM, API_URL } from '../../Constants.js';
import i18n from '../../i18n';
import ConsumptionInSupplyPlanComponent from "../SupplyPlan/ConsumptionInSupplyPlan";
import InventoryInSupplyPlanComponent from "../SupplyPlan/InventoryInSupplyPlan";
import ShipmentsInSupplyPlanComponent from "../SupplyPlan/ShipmentsInSupplyPlan";
import getProblemDesc from '../../CommonComponent/getProblemDesc';
import getSuggestion from '../../CommonComponent/getSuggestion';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
// import { JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import { Link } from 'react-router-dom';
// import { NavLink } from 'react-router-dom';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService';
import { MultiSelect } from 'react-multi-select-component';
import ProblemListFormulas from '../Report/ProblemListFormulas.js'
import DataSourceService from '../../api/DataSourceService';
import RealmCountryService from '../../api/RealmCountryService';
import FundingSourceService from '../../api/FundingSourceService';
import ShipmentStatusService from '../../api/ShipmentStatusService';
import CurrencyService from '../../api/CurrencyService';
import BudgetService from '../../api/BudgetService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import CryptoJS from 'crypto-js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import DropdownService from '../../api/DropdownService';

const entityname = i18n.t('static.report.problem');

const validationSchemaForAddingProblem = function (values) {
    return Yup.object().shape({
        problemDescription: Yup.string()
            .matches(/^[^'":\\]+$/, i18n.t("static.label.someSpecialCaseNotAllowed"))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.editStatus.problemDescText')),
        modelPlanningUnitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
        suggession: Yup.string()
            .matches(/^[^'":\\]+$/, i18n.t('static.label.someSpecialCaseNotAllowed'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.editStatus.problemSuggestionText')),
        modelCriticalityId: Yup.string()
            .required(i18n.t('static.editStatus.validCriticality'))
    })
}
const validateForAddingProblem = (getValidationSchema) => {
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



const validationSchema = function (values) {
    return Yup.object().shape({
        programId: Yup.string()
            .required(i18n.t('static.budget.budgetamountdesc')),
        versionStatusId: Yup.number().typeError(i18n.t('static.program.validstatus'))
            // .required(i18n.t('static.program.validstatus')).notOneOf([0, 1], i18n.t('static.program.validstatus')),
            .required(i18n.t('static.program.validstatus')),
        needNotesValidation: Yup.boolean(),
        versionNotes: Yup.string()
            .when("needNotesValidation", {
                is: val => {
                    return document.getElementById("needNotesValidation").value === "true";
                },
                then: Yup.string().required(i18n.t('static.program.validnotestext')),
                otherwise: Yup.string().notRequired()
            }),
        // versionNotes: Yup.string()
        //     .required(i18n.t('static.program.validnotestext')),
        // stopDate: Yup.string()
        //     .required(i18n.t('static.budget.stopdatetext'))
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        // console.log('validationSchema' + JSON.stringify(validationSchema))

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


class EditSupplyPlanStatus extends Component {
    constructor(props) {
        super(props);

        this.state = {
            problemTransList: [],
            transView: false,
            data: [],
            problemStatusList: [],
            problemEl: '',
            problemTransEl: '',
            problemList: [],
            monthsArray: [],
            programList: [],
            planningUnits: [],
            procurementAgentPlanningUnits: [],
            planningUnitName: [],
            regionList: [],
            consumptionTotalData: [],
            shipmentsTotalData: [],
            // manualShipmentsTotalData: [],
            deliveredShipmentsTotalData: [],
            shippedShipmentsTotalData: [],
            orderedShipmentsTotalData: [],
            plannedShipmentsTotalData: [],
            // erpShipmentsTotalData: [],
            // deliveredErpShipmentsTotalData: [],
            // shippedErpShipmentsTotalData: [],
            // orderedErpShipmentsTotalData: [],
            // plannedErpShipmentsTotalData: [],
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
            inventoryChangedFlag: 0,
            monthCount: 0,
            monthCountConsumption: 0,
            monthCountAdjustments: 0,
            monthCountShipments: 0,
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
            maxQtyArray: [],
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
            dataSourceListAll: [],
            expiredStockDetails: [],
            expiredStockArr: [],
            expiredStockDetails: [],
            expiredStockDetailsTotal: 0,
            showShipments: 0,
            paColors: [],
            programSelect: "",
            showInventory: 0,
            showConsumption: 0,
            consumptionStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            inventoryStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            shipmentStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            batchInfoInInventoryPopUp: [],
            problemCategoryList: [],
            ledgerForBatch: [],
            showBatchSaveButton: false,

            program: {
                programId: this.props.match.params.programId,
                label: {
                    label_en: ''
                }, versionStatus: { id: '', label: { label_en: '' } },
                realmCountry: { country: { id: '', label: { label_en: '' } } },
                organisation: { id: '', label: { label_en: '' } },
                healthArea: { id: '', label: { label_en: '' } },
                programManager: {
                    userId: '',
                    username: ''
                },

                currentVersion: {
                    versionId: '',
                    versionStatus: {
                        id: ''
                    },
                    notes: ''
                },
                programNotes: '',
                airFreightPerc: '',
                seaFreightPerc: '',
                plannedToDraftLeadTime: '',
                draftToSubmittedLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                arrivedToDeliveredLeadTime: '',
                monthsInPastForAmc: '',
                monthsInFutureForAmc: '',
                regionArray: [],
                regionList: [],
                problemStatusListForEdit: [],
                shipmentQtyTotalForPopup: 0,
                batchQtyTotalForPopup: 0
            },
            statuses: [],
            regionList: [],
            editable: false,
            problemStatusValues: [{ label: "Open", value: 1 }, { label: "Addressed", value: 3 }],
            problemCategoryList: [],
            problemReportChanged: 0,
            remainingDataChanged:0,
            problemReviewedList: [{ name: i18n.t("static.program.yes"), id: 1 }, { name: i18n.t("static.program.no"), id: 0 }],
            problemReviewedValues: [{ label: i18n.t("static.program.no"), value: 0 }],
            isModalOpen: false,
            planningUnitList: [],
            regionList: [],
            isSubmitClicked: false,
            criticalities: [],
            criticalitiesList: [],
            submitMessage: "",
            submitColor: ""

        }
        this.formSubmit = this.formSubmit.bind(this);
        this.consumptionDetailsClicked = this.consumptionDetailsClicked.bind(this);
        this.updateState = this.updateState.bind(this);
        this.toggle = this.toggle.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.getNote = this.getNote.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.rowChanged = this.rowChanged.bind(this);
        this.toggleTransView = this.toggleTransView.bind(this);
        this.updateState = this.updateState.bind(this);
        this.handleProblemStatusChange = this.handleProblemStatusChange.bind(this);
        this.handleProblemReviewedChange = this.handleProblemReviewedChange.bind(this);
        this.buildProblemTransJexcel = this.buildProblemTransJexcel.bind(this);
        this.loaded1 = this.loaded1.bind(this);
        this.addMannualProblem = this.addMannualProblem.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.roundAMC=this.roundAMC.bind(this);
    }

    roundAMC(amc){
        if(amc!=null){
        if(Number(amc).toFixed(0)>=100){
            return Number(amc).toFixed(0);
        }else if(Number(amc).toFixed(1)>=10){
            return Number(amc).toFixed(1);
        }else if(Number(amc).toFixed(2)>=1){
            return Number(amc).toFixed(2);
        }else{
            return Number(amc).toFixed(3);
        }
    }else{
        return null;
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

    getProblemCriticality() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['problemCriticality'], 'readwrite');
            var problemCriticality = transaction.objectStore('problemCriticality');
            var getRequest = problemCriticality.getAll();
            var problemCriticalities = [];

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var filteredGetRequestList = myResult;
                for (var i = 0; i < filteredGetRequestList.length; i++) {
                    problemCriticalities.push({
                        name: filteredGetRequestList[i].label.label_en,
                        id: filteredGetRequestList[i].id,
                    });
                }
                // console.log("DATASET-------->", problemCriticalities);
                this.setState({
                    criticalitiesList: problemCriticalities,
                    loading: false
                })
            }.bind(this);
        }.bind(this);

    }

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })

    }

    rowChanged = function (instance, cell, x, y, value) {
        this.setState({
            problemReportChanged: 1
        })
        var elInstance = this.state.problemEl;
        // var problemListDate = moment(Date.now()).subtract(12, 'months').endOf('month').format("YYYY-MM-DD");
        let problemList = this.state.problemList;
        var rowData1 = elInstance.getRowData(y);
        problemList = problemList.filter(c => c.problemReportId == rowData1[0]);
        // console.log("problemList in changed method ***", problemList);
        if (x == 10) {
            if (problemList[0].problemStatus.id != value) {
                // console.log("in if 1***");
                elInstance.setValueFromCoords(20, y, true, true);
            }
            if (problemList[0].problemStatus.id == value) {
                elInstance.setValueFromCoords(20, y, false, true);
                // console.log("in if 2***");
            }
        }

        if (x == 10 || x == 20 || x == 21) {
            var rowData = elInstance.getRowData(y);
            // console.log("problemStatus on server ***", problemList[0].problemStatus.id);
            // console.log("current problem status ***", rowData[10]);
            // console.log("problemStatus on server ***", problemList[0].reviewed);
            // console.log("current problem status ***", rowData[20]);
            // console.log("condition1***", problemList[0].problemStatus.id != rowData[10]);
            // console.log("condition2***", problemList[0].reviewed.toString() != rowData[20].toString());
            if ((problemList[0].problemStatus.id != rowData[10]) || (problemList[0].reviewed.toString() != rowData[20].toString()) || (problemList[0].reviewNotes.toString() != rowData[21].toString())) {
                // console.log("in if***");
                elInstance.setValueFromCoords(22, y, 1, true);
            } else {
                // console.log("in else***");
                elInstance.setValueFromCoords(22, y, 0, true);
            }
        }

        if (x == 20) {
            if (value.toString() == "false") {
                elInstance.setValueFromCoords(21, y, "", true);
            }
        }
    }
    hideFirstComponent() {

    }

    hideSecondComponent() {

    }

    hideThirdComponent() {

    }

    hideFourthComponent() {

    }

    hideFifthComponent() {

    }

    hideMessageComponent() {
        document.getElementById('div3').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
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

    toggleLarge(supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder, shipmentType, count) {
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
            showShipments: 0,
            showInventory: 0,
            showConsumption: 0,
            batchInfoInInventoryPopUp: [],

        })
        if (supplyPlanType == 'Consumption') {
            var monthCountConsumption = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption,
                consumptionStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
            });
            this.formSubmit(monthCountConsumption);
        } else if (supplyPlanType == 'SuggestedShipments') {
            var roleList = AuthenticationService.getLoggedInUserRole();
            if ((roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') || this.state.programQPLDetails.filter(c => c.id == this.state.programId)[0].readonly) {
            } else {
                var monthCountShipments = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
                this.setState({
                    shipments: !this.state.shipments,
                    monthCountShipments: monthCountShipments,
                    shipmentStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
                    isSuggested: 1,
                }, () => {
                    this.formSubmit(monthCountShipments)
                    if (this.state.shipments) {
                        this.suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder, startDate, endDate);
                    }
                });
            }
        } else if (supplyPlanType == 'shipments') {
            var monthCountShipments = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
            this.setState({
                shipments: !this.state.shipments,
                monthCountShipments: monthCountShipments,
                shipmentStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
                isSuggested: 0,
                loading: true
            }, () => {
                // if (this.state.shipments) {
                //     this.shipmentsDetailsClicked(shipmentType, startDate, endDate);
                // }
                this.formSubmit(monthCountShipments, 1, startDate, endDate)
                // if (this.state.shipments) {
                // }
            });
        } else if (supplyPlanType == 'Adjustments') {
            var monthCountAdjustments = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
            this.setState({
                adjustments: !this.state.adjustments,
                monthCountAdjustments: monthCountAdjustments,
                inventoryStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
            });
            this.formSubmit(monthCountAdjustments);
        } else if (supplyPlanType == 'expiredStock') {
            this.setState({ loading: true });
            var details = (this.state.expiredStockArr).filter(c => moment(c.month.startDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD"))

            if (startDate != undefined) {
                this.setState({
                    expiredStockModal: !this.state.expiredStockModal,
                    expiredStockDetails: details[0].details,
                    expiredStockDetailsTotal: details[0].qty,
                    loading: false,
                    ledgerForBatch: []
                })
            } else {
                this.setState({
                    expiredStockModal: !this.state.expiredStockModal,
                    loading: false,
                    ledgerForBatch: []
                })
            }
        }
    }

    toggleTransView(problemTransList) {
        // console.log("====>", problemTransList);
        this.setState({ transView: !this.state.transView, problemTransList: problemTransList }, () => {
            this.test();
        })
    }

    test() {
        // console.log("In test+++");
        this.setState({
            test: 1
        }, () => {
            this.buildProblemTransJexcel();
        })
    }
    toggleTransModal() {
        this.setState({ transView: !this.state.transView })
    }
    leftClicked = () => {
        var monthCount = (this.state.monthCount) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(monthCount)
    }

    rightClicked = () => {
        var monthCount = (this.state.monthCount) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(monthCount)
    }

    leftClickedConsumption = () => {
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption)
    }

    rightClickedConsumption = () => {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption);
    }

    leftClickedAdjustments = () => {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments)
    }

    rightClickedAdjustments = () => {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments);
    }

    leftClickedShipments = () => {
        var monthCountShipments = (this.state.monthCountShipments) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountShipments: monthCountShipments
        })
        // console.log("Mohit form submit 30")
        this.formSubmit(monthCountShipments)
    }

    rightClickedShipments = () => {
        var monthCountShipments = (this.state.monthCountShipments) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountShipments: monthCountShipments
        })
        // console.log("Mohit form submit 31")
        this.formSubmit(monthCountShipments);
    }

    consumptionDetailsClicked = (startDate, endDate, region, actualFlag, month) => {
        this.setState({ loading: true, consumptionStartDateClicked: startDate });
        var elInstance = this.state.consumptionBatchInfoTableEl;
        if (elInstance != undefined && elInstance != "") {
            // elInstance.destroy();
            jexcel.destroy(document.getElementById("consumptionBatchInfoTable"), true);
        }
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = this.state.program;
                // var programQPLDetails = [];
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                // programQPLDetails.push({
                //     id: programJson.programId,
                //     programId: programJson.programId,
                //     version: programJson.currentVersion.versionId,
                //     userId: userId,
                //     programCode: programJson.programCode,
                //     openCount: 0,
                //     addressedCount: 0,
                //     programModified: 0,
                //     readonly: 0
                // })
                var batchInfoList = programJson.batchInfoList;
                DataSourceService.getAllDataSourceList().then(response => {
                    var dataSourceList = [];
                    response.data.map(c => {
                        dataSourceList.push({
                            name: getLabelText(c.label, this.state.lang),
                            id: c.dataSourceId,
                            dataSourceTypeId: c.dataSourceType.id,
                            active: c.active,
                            label: c.label
                        })
                    })
                    this.setState({
                        dataSourceList: dataSourceList,
                        // programQPLDetails:programQPLDetails,
                        // programId:programJson.programId
                    })

                    RealmCountryService.getRealmCountryPlanningUnitByProgramId([this.props.match.params.programId]).then(response1 => {
                        var rcpuList = [];
                        response1.data.map(c => {
                            rcpuList.push({
                                name: getLabelText(c.label, this.state.lang),
                                id: c.realmCountryPlanningUnitId,
                                multiplier: c.multiplier,
                                active: c.active,
                                label: c.label
                            })
                        })
                        this.setState({
                            realmCountryPlanningUnitList: rcpuList
                        })
                        // console.log("++++Rcpu:List", rcpuList)


                        var batchList = [];
                        var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);
                        // console.log("Shipment list=============>", shipmentList);
                        for (var sl = 0; sl < shipmentList.length; sl++) {
                            var bdl = shipmentList[sl].batchInfoList;
                            for (var bd = 0; bd < bdl.length; bd++) {
                                var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                if (index == -1) {
                                    var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == planningUnitId && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                    if (batchDetailsToPush.length > 0) {
                                        batchList.push(batchDetailsToPush[0]);
                                    }
                                }
                            }
                        }
                        // console.log("Btach List============>", batchList);
                        var consumptionListUnFiltered = (programJson.consumptionList);
                        var consumptionList = consumptionListUnFiltered.filter(con =>
                            con.planningUnit.id == planningUnitId
                            && con.region.id == region
                            && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
                        this.setState({
                            programJsonAfterConsumptionClicked: programJson,
                            consumptionListUnFiltered: consumptionListUnFiltered,
                            batchInfoList: batchList,
                            programJson: programJson,
                            generalProgramJson: programJson,
                            consumptionList: consumptionList,
                            showConsumption: 1,
                            consumptionMonth: month,
                            consumptionStartDate: startDate,
                            consumptionRegion: region
                        }, () => {
                            if (this.refs.consumptionChild != undefined) {
                                this.refs.consumptionChild.showConsumptionData();
                            } else {
                                this.setState({
                                    loading: false
                                })
                            }
                        })
                    }).catch(error => { 
                        // console.log("Error+++", error) 
                    });
                }).catch(error => { 
                    // console.log("Error+++", error) 
                });
            }.bind(this)
        }.bind(this)
    }

    adjustmentsDetailsClicked(region, month, endDate, inventoryType) {
        this.setState({ loading: true, inventoryStartDateClicked: moment(endDate).startOf('month').format("YYYY-MM-DD") })
        var elInstance = this.state.inventoryBatchInfoTableEl;
        if (elInstance != undefined && elInstance != "") {
            // elInstance.destroy();
            jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);

        }
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (event) {
                // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                // var programQPLDetails=[];
                var programJson = this.state.program;
                var batchInfoList = programJson.batchInfoList;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                // programQPLDetails.push({
                //     id: programJson.programId,
                //     programId: programJson.programId,
                //     version: programJson.currentVersion.versionId,
                //     userId: userId,
                //     programCode: programJson.programCode,
                //     openCount: 0,
                //     addressedCount: 0,
                //     programModified: 0,
                //     readonly: 0
                // })

                DataSourceService.getAllDataSourceList().then(response => {
                    var dataSourceList = [];
                    response.data.map(c => {
                        dataSourceList.push({
                            name: getLabelText(c.label, this.state.lang),
                            id: c.dataSourceId,
                            dataSourceTypeId: c.dataSourceType.id,
                            active: c.active,
                            label: c.label
                        })
                    })
                    this.setState({
                        dataSourceList: dataSourceList,
                        // programQPLDetails:programQPLDetails
                    })

                    RealmCountryService.getRealmCountryPlanningUnitByProgramId([this.props.match.params.programId]).then(response1 => {
                        var rcpuList = [];
                        response1.data.map(c => {
                            rcpuList.push({
                                name: getLabelText(c.label, this.state.lang),
                                id: c.realmCountryPlanningUnitId,
                                multiplier: c.multiplier,
                                active: c.active,
                                label: c.label
                            })
                        })
                        this.setState({
                            realmCountryPlanningUnitList: rcpuList
                        })
                        // console.log("++++Rcpu:List", rcpuList)

                        var batchList = [];
                        var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);

                        for (var sl = 0; sl < shipmentList.length; sl++) {
                            var bdl = shipmentList[sl].batchInfoList;
                            for (var bd = 0; bd < bdl.length; bd++) {
                                var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                if (index == -1) {
                                    var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == planningUnitId && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                    if (batchDetailsToPush.length > 0) {
                                        batchList.push(batchDetailsToPush[0]);
                                    }
                                }
                            }
                        }
                        var inventoryListUnFiltered = (programJson.inventoryList);
                        var inventoryList = (programJson.inventoryList).filter(c =>
                            c.planningUnit.id == planningUnitId &&
                            c.region != null && c.region.id != 0 &&
                            c.region.id == region &&
                            moment(c.inventoryDate).format("MMM YY") == month);
                        if (inventoryType == 1) {
                            inventoryList = inventoryList.filter(c => c.actualQty !== "" && c.actualQty != undefined && c.actualQty != null);
                        } else {
                            inventoryList = inventoryList.filter(c => c.adjustmentQty !== "" && c.adjustmentQty != undefined && c.adjustmentQty != null);
                        }
                        this.setState({
                            batchInfoList: batchList,
                            programJson: programJson,
                            generalProgramJson: programJson,
                            inventoryListUnFiltered: inventoryListUnFiltered,
                            inventoryList: inventoryList,
                            showInventory: 1,
                            inventoryType: inventoryType,
                            inventoryMonth: month,
                            inventoryEndDate: endDate,
                            inventoryRegion: region,

                        }, () => {
                            if (this.refs.inventoryChild != undefined) {
                                this.refs.inventoryChild.showInventoryData();
                            } else {
                                this.setState({
                                    loading: false
                                })
                            }
                        })
                    }).catch(error => { 
                        // console.log("Error+++", error) 
                    });
                }).catch(error => { 
                    // console.log("Error+++", error) 
                });
            }.bind(this)
        }.bind(this)
    }

    suggestedShipmentsDetailsClicked = (month, quantity, isEmergencyOrder) => {

    }

    shipmentsDetailsClicked = (supplyPlanType, startDate, endDate) => {
        this.setState({ loading: true, shipmentStartDateClicked: startDate })
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (event) {
                // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                // var programQPLDetails=[];
                var programJson = this.state.program;
                var shipmentListUnFiltered = programJson.shipmentList;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                // programQPLDetails.push({
                //     id: programJson.programId,
                //     programId: programJson.programId,
                //     version: programJson.currentVersion.versionId,
                //     userId: userId,
                //     programCode: programJson.programCode,
                //     openCount: 0,
                //     addressedCount: 0,
                //     programModified: 0,
                //     readonly: 0
                // })
                this.setState({
                    shipmentListUnFiltered: shipmentListUnFiltered,
                    // programQPLDetails:programQPLDetails
                })
                var shipmentList = programJson.shipmentList.filter(c => c.active.toString() == "true");

                DataSourceService.getAllDataSourceList().then(response => {
                    var dataSourceList = [];
                    response.data.map(c => {
                        dataSourceList.push({
                            name: getLabelText(c.label, this.state.lang),
                            id: c.dataSourceId,
                            dataSourceTypeId: c.dataSourceType.id,
                            active: c.active,
                            label: c.label
                        })
                    })
                    this.setState({
                        dataSourceList: dataSourceList
                    })

                    RealmCountryService.getRealmCountryPlanningUnitByProgramId([this.props.match.params.programId]).then(response1 => {
                        var rcpuList = [];
                        response1.data.map(c => {
                            rcpuList.push({
                                name: getLabelText(c.label, this.state.lang),
                                id: c.realmCountryPlanningUnitId,
                                multiplier: c.multiplier,
                                active: c.active,
                                label: c.label
                            })
                        })
                        this.setState({
                            realmCountryPlanningUnitList: rcpuList
                        })

                        ShipmentStatusService.getShipmentStatusListActive().then(response1 => {
                            var shipmentStatusList = [];
                            response1.data.map(c => {
                                shipmentStatusList.push({
                                    name: getLabelText(c.label, this.state.lang),
                                    id: c.shipmentStatusId,
                                    active: c.active,
                                    label: c.label
                                })
                            })
                            this.setState({
                                shipmentStatusList: shipmentStatusList
                            })

                            ProcurementAgentService.getProcurementAgentListAll().then(response2 => {
                                var paList = [];
                                response2.data.map(c => {
                                    paList.push({
                                        name: c.procurementAgentCode,
                                        id: c.procurementAgentId,
                                        active: c.active,
                                        label: c.label
                                    })
                                })
                                this.setState({
                                    procurementAgentList: paList
                                })

                                FundingSourceService.getFundingSourceListAll().then(response3 => {
                                    var fsList = [];
                                    response3.data.map(c => {
                                        fsList.push({
                                            name: c.fundingSourceCode,
                                            id: c.fundingSourceId,
                                            active: c.active,
                                            label: c.label
                                        })
                                    })
                                    this.setState({
                                        fundingSourceList: fsList
                                    })

                                    DropdownService.getBudgetDropdownBasedOnProgram(this.props.match.params.programId).then(response4 => {
                                        var bList = [];
                                        response4.data.map(c => {
                                            bList.push({
                                                name: c.code,
                                                id: c.id,
                                                // fundingSource: c.fundingSource,
                                                // currency: c.currency,
                                                // budgetAmt: c.budgetAmt,
                                                active: true,
                                                // programs: c.programs,
                                                label: c.label,
                                                // startDate: c.startDate,
                                                // stopDate: c.stopDate
                                            })
                                        })
                                        this.setState({
                                            budgetList: bList
                                        })

                                        CurrencyService.getCurrencyList().then(response5 => {
                                            var cList = [];
                                            response5.data.map(c => {
                                                cList.push({
                                                    name: getLabelText(c.label, this.state.lang),
                                                    id: c.currencyId,
                                                    active: c.active,
                                                    label: c.label
                                                })
                                            })
                                            this.setState({
                                                currencyList: cList
                                            })

                                            // var tableEditableBasedOnSupplyPlan = true;
                                            if (supplyPlanType == 'deliveredShipments') {
                                                shipmentList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'shippedShipments') {
                                                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'orderedShipments') {
                                                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'plannedShipments') {
                                                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'deliveredErpShipments') {
                                                shipmentList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'shippedErpShipments') {
                                                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'orderedErpShipments') {
                                                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'plannedErpShipments') {
                                                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'allShipments') {
                                                shipmentList = shipmentList.filter(c => 
                                                    (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate)
                                                    // && c.erpFlag == false 
                                                    // && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS 
                                                    && c.planningUnit.id == document.getElementById("planningUnitId").value
                                                    // && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)
                                                );
                                                if (document.getElementById("addRowId") != null) {
                                                    document.getElementById("addRowId").style.display = "block"
                                                }
                                            } else {
                                                shipmentList = []
                                            }
                                            this.setState({
                                                showShipments: 1,
                                                shipmentList: shipmentList,
                                                shipmentListUnFiltered: shipmentListUnFiltered,
                                                programJson: programJson,
                                                generalProgramJson: programJson,
                                                shipmentStartDateClicked: startDate,
                                                loading: true
                                            }, () => {
                                                if (this.refs.shipmentChild != undefined) {
                                                    this.refs.shipmentChild.showShipmentData();
                                                } else {
                                                    this.setState({
                                                        loading: false
                                                    })
                                                }
                                            })
                                        }).catch(error => {  });
                                    }).catch(error => {  });
                                }).catch(error => {  });
                            }).catch(error => {  });
                        }).catch(error => {  });
                    }).catch(error => {  });
                }).catch(error => { });
            }.bind(this)
        }.bind(this)
    }

    toggleAccordionTotalShipments = () => {
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

    toggleAccordionManualShipments = () => {
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

    toggleAccordionErpShipments = () => {
        console.log(this.state.showErpShipment)
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

    actionCanceledExpiredStock() {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal,
            message: i18n.t('static.actionCancelled'),
            color: '#BA0C2F',
        })
        this.hideFirstComponent()
    }

    actionCanceled(supplyPlanType) {
        var inputs = document.getElementsByClassName("submitBtn");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        this.setState({
            loading: false,
            message: i18n.t('static.actionCancelled'),
            color: '#BA0C2F',
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
            showInventory: 0,
            showConsumption: 0,
            batchInfoInInventoryPopUp: [],

        },
            () => {
                this.hideFirstComponent();
            })
        this.toggleLarge(supplyPlanType);
    }

    actionCanceledShipments(type) {
        if (type == "qtyCalculator") {
            document.getElementById("showSaveQtyButtonDiv").style.display = 'none';
            // (this.refs.shipmentChild.state.qtyCalculatorTableEl).destroy();
            // (this.refs.shipmentChild.state.qtyCalculatorTableEl1).destroy();
            jexcel.destroy(document.getElementById("qtyCalculatorTable"), true);
            jexcel.destroy(document.getElementById("qtyCalculatorTable1"), true);

            this.refs.shipmentChild.state.shipmentQtyChangedFlag = 0;
            this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
            this.setState({
                qtyCalculatorValidationError: "",
                shipmentQtyChangedFlag: 0
            })
        } else if (type == "shipmentDates") {
            document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'none';
            // (this.refs.shipmentChild.state.shipmentDatesTableEl).destroy();
            jexcel.destroy(document.getElementById("shipmentDatesTable"), true);

            this.refs.shipmentChild.state.shipmentDatesChangedFlag = 0;
            this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
            this.setState({
                shipmentDatesChangedFlag: 0,
                shipmentDatesError: ""
            })
        } else if (type == "shipmentBatch") {
            document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'none';
            // (this.refs.shipmentChild.state.shipmentBatchInfoTableEl).destroy();
            jexcel.destroy(document.getElementById("shipmentBatchInfoTable"), true);

            this.refs.shipmentChild.state.shipmentBatchInfoChangedFlag = 0;
            this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
            this.setState({
                shipmentBatchInfoChangedFlag: 0,
                shipmentValidationBatchError: "",
                shipmentBatchInfoDuplicateError: ""
            })
        }
    }

    actionCanceledInventory() {
        document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
        // (this.refs.inventoryChild.state.inventoryBatchInfoTableEl).destroy();
        jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);

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
        // (this.refs.consumptionChild.state.consumptionBatchInfoTableEl).destroy();
        jexcel.destroy(document.getElementById("consumptionBatchInfoTable"), true);

        this.refs.consumptionChild.state.consumptionBatchInfoChangedFlag = 0;
        this.setState({
            consumptionBatchInfoChangedFlag: 0,
            consumptionBatchInfoDuplicateError: "",
            consumptionBatchInfoNoStockError: "",
            consumptionBatchError: ""
        })
    }

    formSubmit = (monthCount, isShipment, startDate, stopDate) => {
        // this.setState({
        //     showTotalShipment: false,
        //     showManualShipment: false,
        //     showErpShipment: false
        // })
        // this.toggleAccordionTotalShipments();
        // this.toggleAccordionManualShipments();
        // this.toggleAccordionErpShipments();
        if (document.getElementById("planningUnitId").value != 0) {
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

        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));

        var programId = document.getElementById("programId").value;
        var regionId = -1;
        var planningUnitId = document.getElementById("planningUnitId").value;

        var planningUnit = document.getElementById("planningUnitId");
        var planningUnitName = planningUnit.options[planningUnit.selectedIndex].text;

        var programPlanningUnit = ((this.state.planningUnits).filter(p => p.planningUnit.id == planningUnitId))[0];
        var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
        var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

        var regionListFiltered = [];
        if (regionId != -1) {
            regionListFiltered = (this.state.regionList).filter(r => r.id == regionId);
        } else {
            regionListFiltered = this.state.regionList
        }
        var consumptionTotalData = [];
        var shipmentsTotalData = [];
        // var manualShipmentsTotalData = [];
        var deliveredShipmentsTotalData = [];
        var shippedShipmentsTotalData = [];
        var orderedShipmentsTotalData = [];
        var plannedShipmentsTotalData = [];
        // var erpShipmentsTotalData = [];
        // var deliveredErpShipmentsTotalData = [];
        // var shippedErpShipmentsTotalData = [];
        // var orderedErpShipmentsTotalData = [];
        // var plannedErpShipmentsTotalData = [];
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
        var maxQtyArray = [];
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
                loading: false,
                color: "#BA0C2F"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programJson = this.state.program;
            var realmTransaction = db1.transaction(['realm'], 'readwrite');
            var realmOs = realmTransaction.objectStore('realm');
            var realmRequest = realmOs.get(programJson.realmCountry.realm.realmId);
            realmRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
                })
                this.hideFirstComponent()
            }.bind(this);
            realmRequest.onsuccess = function (event) {
                var maxForMonths = 0;
                var realm = realmRequest.result;
                var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                // console.log("realm.minMosMaxGaurdrail", realm.minMosMaxGaurdrail);
                var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                if (DEFAULT_MIN_MONTHS_OF_STOCK > programPlanningUnit.minMonthsOfStock) {
                    maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                } else {
                    maxForMonths = programPlanningUnit.minMonthsOfStock
                }
                var minStockMoSQty = parseInt(maxForMonths);

                // Calculations for Max Stock
                var minForMonths = 0;
                var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + programPlanningUnit.reorderFrequencyInMonths)) {
                    minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                } else {
                    minForMonths = (maxForMonths + programPlanningUnit.reorderFrequencyInMonths);
                }
                var maxStockMoSQty = parseInt(minForMonths);
                // console.log("maxStockMoSQty-------->", maxStockMoSQty);
                // console.log("DEFAULT_MIN_MAX_MONTHS_OF_STOCK------------->", DEFAULT_MIN_MAX_MONTHS_OF_STOCK)
                if (maxStockMoSQty < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                    maxStockMoSQty = DEFAULT_MIN_MAX_MONTHS_OF_STOCK;
                }
                // console.log("Min Stock MoS", minStockMoSQty);
                // console.log("Min Stock MoS", maxStockMoSQty);
                this.setState({
                    shelfLife: programPlanningUnit.shelfLife,
                    versionId: programJson.currentVersion.versionId,
                    monthsInPastForAMC: programPlanningUnit.monthsInPastForAmc,
                    monthsInFutureForAMC: programPlanningUnit.monthsInFutureForAmc,
                    reorderFrequency: programPlanningUnit.reorderFrequencyInMonths,
                    minMonthsOfStock: programPlanningUnit.minMonthsOfStock,
                    minStockMoSQty: minStockMoSQty,
                    maxStockMoSQty: maxStockMoSQty,
                    planBasedOn: programPlanningUnit.planBasedOn,
                    minQtyPpu: programPlanningUnit.minQty,
                    distributionLeadTime: programPlanningUnit.distributionLeadTime

                })

                var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                var shipmentStatusRequest = shipmentStatusOs.getAll();
                shipmentStatusRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "#BA0C2F"
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
                            loading: false,
                            color: "#BA0C2F"
                        })
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        // console.log("ProgramJson", programJson);
                        var supplyPlanData = [];
                        if (programJson.supplyPlan != undefined) {
                            supplyPlanData = (programJson.supplyPlan).filter(c => c.planningUnitId == planningUnitId);
                        }
                        this.setState({
                            supplyPlanDataForAllTransDate: supplyPlanData,
                            allShipmentsList: programJson.shipmentList
                        })
                        // if (supplyPlanData.length > 0) {
                        var lastClosingBalance = 0;
                        var lastBatchDetails = [];
                        var lastIsActualClosingBalance = 0;
                        for (var n = 0; n < m.length; n++) {
                            var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).format("YYYY-MM-DD"));
                            var prevMonthJsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).subtract(1, 'months').format("YYYY-MM-DD"));
                            if (jsonList.length > 0) {
                                openingBalanceArray.push({ isActual: prevMonthJsonList.length > 0 && prevMonthJsonList[0].regionCountForStock == prevMonthJsonList[0].regionCount ? 1 : 0, balance: jsonList[0].openingBalance });
                                consumptionTotalData.push({ consumptionQty: jsonList[0].consumptionQty, consumptionType: jsonList[0].actualFlag, textColor: jsonList[0].actualFlag == 1 ? "#000000" : "rgb(170, 85, 161)" });
                                // manualShipmentsTotalData.push(jsonList[0].manualTotalQty);

                                // Tomorrow begin from here
                                var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[n].startDate && c.receivedDate <= m[n].endDate) : (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate))
                                    // && c.erpFlag.toString() == "false"
                                );
                                shipmentsTotalData.push(shipmentDetails.length > 0 ? jsonList[0].shipmentTotalQty : "");
                                var sd1 = [];
                                var sd2 = [];
                                var sd3 = [];
                                var sd4 = [];
                                var isEmergencyOrder1 = 0;
                                var isEmergencyOrder2 = 0;
                                var isEmergencyOrder3 = 0;
                                var isEmergencyOrder4 = 0;
                                var isLocalProcurementAgent1 = 0;
                                var isLocalProcurementAgent2 = 0;
                                var isLocalProcurementAgent3 = 0;
                                var isLocalProcurementAgent4 = 0;
                                var paColor1 = "";
                                var paColor2 = "";
                                var paColor3 = "";
                                var paColor4 = "";
                                var paColor1Array = [];
                                var paColor2Array = [];
                                var paColor3Array = [];
                                var paColor4Array = [];
                                var isErp1 = 0;
                                var isErp2 = 0;
                                var isErp3 = 0;
                                var isErp4 = 0;
                                if (shipmentDetails != "" && shipmentDetails != undefined) {
                                    for (var i = 0; i < shipmentDetails.length; i++) {
                                        if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor1 = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == paColor1);
                                                if (index == -1) {
                                                    paColors.push({ color: paColor1, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (shipmentDetails[i].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor1 = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor1 = "#efefef"
                                                }
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder1 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent1 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp1 = true;
                                            }
                                            sd1.push(shipmentDetail);
                                            if (paColor1Array.indexOf(paColor1) === -1) {
                                                paColor1Array.push(paColor1);
                                            }
                                        } else if (shipmentDetails[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor2 = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == paColor2);
                                                if (index == -1) {
                                                    paColors.push({ color: paColor2, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (shipmentDetails[i].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor2 = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor2 = "#efefef"
                                                }
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder2 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent2 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp2 = true;
                                            }
                                            sd2.push(shipmentDetail);

                                            if (paColor2Array.indexOf(paColor2) === -1) {
                                                paColor2Array.push(paColor2);
                                            }
                                        } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {

                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor3 = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == paColor3);
                                                if (index == -1) {
                                                    paColors.push({ color: paColor3, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (shipmentDetails[i].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor3 = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor3 = "#efefef"
                                                }
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder3 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent3 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp3 = true;
                                            }
                                            sd3.push(shipmentDetail);

                                            if (paColor3Array.indexOf(paColor3) === -1) {
                                                paColor3Array.push(paColor3);
                                            }
                                        } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {

                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor4 = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == paColor4);
                                                if (index == -1) {
                                                    paColors.push({ color: paColor4, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (shipmentDetails[i].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor4 = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor4 = "#efefef"
                                                }
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder4 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent4 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp4 = true;
                                            }
                                            sd4.push(shipmentDetail);
                                            if (paColor4Array.indexOf(paColor4) === -1) {
                                                paColor4Array.push(paColor4);
                                            }
                                        }
                                    }
                                }

                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor1;
                                    if (paColor1Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    deliveredShipmentsTotalData.push({ qty: Number(jsonList[0].receivedShipmentsTotalData) + Number(jsonList[0].receivedErpShipmentsTotalData), month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder1, isLocalProcurementAgent: isLocalProcurementAgent1, isErp: isErp1 });
                                } else {
                                    deliveredShipmentsTotalData.push("")
                                }

                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor2;
                                    if (paColor2Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    shippedShipmentsTotalData.push({ qty: Number(jsonList[0].shippedShipmentsTotalData) + Number(jsonList[0].shippedErpShipmentsTotalData), month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder2, isLocalProcurementAgent: isLocalProcurementAgent2, isErp: isErp2 });
                                } else {
                                    shippedShipmentsTotalData.push("")
                                }

                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor3;
                                    if (paColor3Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    orderedShipmentsTotalData.push({ qty: Number(jsonList[0].approvedShipmentsTotalData) + Number(jsonList[0].submittedShipmentsTotalData) + Number(jsonList[0].approvedErpShipmentsTotalData) + Number(jsonList[0].submittedErpShipmentsTotalData), month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder3, isLocalProcurementAgent: isLocalProcurementAgent3, isErp: isErp3 });
                                } else {
                                    orderedShipmentsTotalData.push("")
                                }

                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor4;
                                    if (paColor4Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    plannedShipmentsTotalData.push({ qty: Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(jsonList[0].onholdErpShipmentsTotalData) + Number(jsonList[0].plannedErpShipmentsTotalData), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder4, isLocalProcurementAgent: isLocalProcurementAgent4, isErp: isErp4 });
                                } else {
                                    plannedShipmentsTotalData.push("")
                                }

                                // erpShipmentsTotalData.push(jsonList[0].erpTotalQty);


                                // var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[n].startDate && c.receivedDate <= m[n].endDate) : (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate)) && c.erpFlag.toString() == "true");
                                // var sd1 = [];
                                // var sd2 = [];
                                // var sd3 = [];
                                // var sd4 = [];
                                // var isEmergencyOrder1 = 0;
                                // var isEmergencyOrder2 = 0;
                                // var isEmergencyOrder3 = 0;
                                // var isEmergencyOrder4 = 0;
                                // var isLocalProcurementAgent1 = 0;
                                // var isLocalProcurementAgent2 = 0;
                                // var isLocalProcurementAgent3 = 0;
                                // var isLocalProcurementAgent4 = 0;
                                // var paColor1 = "";
                                // var paColor2 = "";
                                // var paColor3 = "";
                                // var paColor4 = "";
                                // var paColor1Array = [];
                                // var paColor2Array = [];
                                // var paColor3Array = [];
                                // var paColor4Array = [];
                                // if (shipmentDetails != "" && shipmentDetails != undefined) {
                                //     for (var i = 0; i < shipmentDetails.length; i++) {
                                //         if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                //             if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                //                 var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                 var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                 var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                 paColor1 = procurementAgent.colorHtmlCode;
                                //                 var index = paColors.findIndex(c => c.color == paColor1);
                                //                 if (index == -1) {
                                //                     paColors.push({ color: paColor1, text: procurementAgent.procurementAgentCode })
                                //                 }
                                //             } else {
                                //                 if (shipmentDetails[i].procurementAgent.id != "") {
                                //                     var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor1 = "#efefef"
                                //                 } else {
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor1 = "#efefef"
                                //                 }
                                //             }
                                //             if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                //                 isEmergencyOrder1 = true
                                //             }
                                //             if (shipmentDetails[i].localProcurement.toString() == "true") {
                                //                 isLocalProcurementAgent1 = true;
                                //             }
                                //             sd1.push(shipmentDetail);
                                //             if (paColor1Array.indexOf(paColor1) === -1) {
                                //                 paColor1Array.push(paColor1);
                                //             }
                                //         } else if (shipmentDetails[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                //             if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                //                 var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                 var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                 var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                 paColor2 = procurementAgent.colorHtmlCode;
                                //                 var index = paColors.findIndex(c => c.color == paColor2);
                                //                 if (index == -1) {
                                //                     paColors.push({ color: paColor2, text: procurementAgent.procurementAgentCode })
                                //                 }
                                //             } else {
                                //                 if (shipmentDetails[i].procurementAgent.id != "") {
                                //                     var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor2 = "#efefef"
                                //                 } else {
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor2 = "#efefef"
                                //                 }
                                //             }
                                //             if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                //                 isEmergencyOrder2 = true
                                //             }
                                //             if (shipmentDetails[i].localProcurement.toString() == "true") {
                                //                 isLocalProcurementAgent2 = true;
                                //             }
                                //             sd2.push(shipmentDetail);

                                //             if (paColor2Array.indexOf(paColor2) === -1) {
                                //                 paColor2Array.push(paColor2);
                                //             }
                                //         } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {

                                //             if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                //                 var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                 var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                 var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                 paColor3 = procurementAgent.colorHtmlCode;
                                //                 var index = paColors.findIndex(c => c.color == paColor3);
                                //                 if (index == -1) {
                                //                     paColors.push({ color: paColor3, text: procurementAgent.procurementAgentCode })
                                //                 }
                                //             } else {
                                //                 if (shipmentDetails[i].procurementAgent.id != "") {
                                //                     var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor3 = "#efefef"
                                //                 } else {
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor3 = "#efefef"
                                //                 }
                                //             }
                                //             if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                //                 isEmergencyOrder3 = true
                                //             }
                                //             if (shipmentDetails[i].localProcurement.toString() == "true") {
                                //                 isLocalProcurementAgent3 = true;
                                //             }
                                //             sd3.push(shipmentDetail);
                                //             if (paColor3Array.indexOf(paColor3) === -1) {
                                //                 paColor3Array.push(paColor3);
                                //             }
                                //         } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                //             if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                //                 var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                 var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                 var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                 paColor4 = procurementAgent.colorHtmlCode;
                                //                 var index = paColors.findIndex(c => c.color == paColor4);
                                //                 if (index == -1) {
                                //                     paColors.push({ color: paColor4, text: procurementAgent.procurementAgentCode })
                                //                 }
                                //             } else {
                                //                 if (shipmentDetails[i].procurementAgent.id != "") {
                                //                     var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor4 = "#efefef"
                                //                 } else {
                                //                     var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                //                     var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                //                     paColor4 = "#efefef"
                                //                 }
                                //             }
                                //             if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                //                 isEmergencyOrder4 = true
                                //             }
                                //             if (shipmentDetails[i].localProcurement.toString() == "true") {
                                //                 isLocalProcurementAgent4 = true;
                                //             }
                                //             sd4.push(shipmentDetail);
                                //             if (paColor4Array.indexOf(paColor4) === -1) {
                                //                 paColor4Array.push(paColor4);
                                //             }
                                //         }
                                //     }
                                // }

                                // if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                //     var colour = paColor1;
                                //     if (paColor1Array.length > 1) {
                                //         colour = "#d9ead3";
                                //     }
                                //     deliveredErpShipmentsTotalData.push({ qty: jsonList[0].receivedErpShipmentsTotalData, month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder1, isLocalProcurementAgent: isLocalProcurementAgent1 });
                                // } else {
                                //     deliveredErpShipmentsTotalData.push("")
                                // }

                                // if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                //     var colour = paColor2;
                                //     if (paColor2Array.length > 1) {
                                //         colour = "#d9ead3";
                                //     }
                                //     shippedErpShipmentsTotalData.push({ qty: jsonList[0].shippedErpShipmentsTotalData, month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder2, isLocalProcurementAgent: isLocalProcurementAgent2 });
                                // } else {
                                //     shippedErpShipmentsTotalData.push("")
                                // }

                                // if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                //     var colour = paColor3;
                                //     if (paColor3Array.length > 1) {
                                //         colour = "#d9ead3";
                                //     }
                                //     orderedErpShipmentsTotalData.push({ qty: parseInt(jsonList[0].approvedErpShipmentsTotalData) + parseInt(jsonList[0].submittedErpShipmentsTotalData), month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder3, isLocalProcurementAgent: isLocalProcurementAgent3 });
                                // } else {
                                //     orderedErpShipmentsTotalData.push("")
                                // }

                                // if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                                //     var colour = paColor4;
                                //     if (paColor4Array.length > 1) {
                                //         colour = "#d9ead3";
                                //     }
                                //     plannedErpShipmentsTotalData.push({ qty: parseInt(jsonList[0].onholdErpShipmentsTotalData) + parseInt(jsonList[0].plannedErpShipmentsTotalData), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder4, isLocalProcurementAgent: isLocalProcurementAgent4 });
                                // } else {
                                //     plannedErpShipmentsTotalData.push("")
                                // }
                                // console.log("deliveredShipmentsTotalData", deliveredShipmentsTotalData);

                                inventoryTotalData.push(jsonList[0].adjustmentQty == 0 ? jsonList[0].regionCountForStock > 0 ? jsonList[0].nationalAdjustment : "" : jsonList[0].regionCountForStock > 0 ? jsonList[0].nationalAdjustment : jsonList[0].adjustmentQty);
                                totalExpiredStockArr.push({ qty: jsonList[0].expiredStock, details: jsonList[0].batchDetails.filter(c => moment(c.expiryDate).format("YYYY-MM-DD") >= m[n].startDate && moment(c.expiryDate).format("YYYY-MM-DD") <= m[n].endDate), month: m[n] });
                                monthsOfStockArray.push(jsonList[0].mos != null ? parseFloat(jsonList[0].mos).toFixed(1) : jsonList[0].mos);
                                maxQtyArray.push(this.roundAMC(jsonList[0].maxStock))
                                amcTotalData.push(jsonList[0].amc != null ? this.roundAMC(Number(jsonList[0].amc)) : "");
                                minStockMoS.push(jsonList[0].minStockMoS)
                                maxStockMoS.push(jsonList[0].maxStockMoS)
                                unmetDemand.push(jsonList[0].unmetDemand == 0 ? "" : jsonList[0].unmetDemand);
                                closingBalanceArray.push({ isActual: jsonList[0].regionCountForStock == jsonList[0].regionCount ? 1 : 0, balance: jsonList[0].closingBalance, batchInfoList: jsonList[0].batchDetails })
                                // closingBalanceArray.push(jsonList[0].closingBalance)


                                lastClosingBalance = jsonList[0].closingBalance;
                                lastBatchDetails = jsonList[0].batchDetails;
                                lastIsActualClosingBalance = jsonList[0].regionCountForStock == jsonList[0].regionCount ? 1 : 0;

                                // suggestedShipmentsTotalData.push(jsonList[0].suggestedShipmentsTotalData);
                                // consumptionArrayForRegion = consumptionArrayForRegion.concat(jsonList[0].consumptionArrayForRegion);
                                // inventoryArrayForRegion = inventoryArrayForRegion.concat(jsonList[0].inventoryArrayForRegion);
                                var sstd = {}
                                if (this.state.planBasedOn == 1) {
                                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                    var compare = (m[n].startDate >= currentMonth);
                                    // var stockInHand = jsonList[0].closingBalance;
                                    var amc = Number(jsonList[0].amc);
                                    var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).format("YYYY-MM"));
                                    var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(1, 'months').format("YYYY-MM"));
                                    var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(2, 'months').format("YYYY-MM"));
                                    var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;

                                    var suggestShipment = false;
                                    var useMax = false;
                                    if (compare) {
                                        if (Number(amc) == 0) {
                                            suggestShipment = false;
                                        } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && (Number(mosForMonth2) > Number(minStockMoSQty) || Number(mosForMonth3) > Number(minStockMoSQty))) {
                                            suggestShipment = false;
                                        } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                            suggestShipment = true;
                                            useMax = true;
                                        } else if (Number(mosForMonth1) == 0) {
                                            suggestShipment = true;
                                            if (Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                                useMax = true;
                                            } else {
                                                useMax = false;
                                            }
                                        }
                                    } else {
                                        suggestShipment = false;
                                    }
                                    var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                        parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                        parseFloat(programJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    if (suggestShipment) {
                                        var suggestedOrd = 0;
                                        if (useMax) {
                                            suggestedOrd = Number(Math.round(amc * Number(maxStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                                        } else {
                                            suggestedOrd = Number(Math.round(amc * Number(minStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                                        }
                                        if (suggestedOrd <= 0) {
                                            sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                        } else {
                                            sstd = { "suggestedOrderQty": suggestedOrd, "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
                                        }
                                    } else {
                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                    }
                                    suggestedShipmentsTotalData.push(sstd);
                                } else {
                                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                    var compare = (m[n].startDate >= currentMonth);
                                    // var stockInHand = jsonList[0].closingBalance;
                                    var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(this.state.distributionLeadTime, 'months').format("YYYY-MM"));
                                    // console.log("Spd1@@@@@@@@@@@", spd1)
                                    // console.log("Spd1@@@@@@@@@@@mn.startDate", m[n].startDate)
                                    var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(1 + this.state.distributionLeadTime, 'months').format("YYYY-MM"));
                                    var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(2 + this.state.distributionLeadTime, 'months').format("YYYY-MM"));
                                    var amc = spd1.length > 0 ? Number(spd1[0].amc) : 0;
                                    var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;

                                    var cbForMonth1 = spd1.length > 0 ? spd1[0].closingBalance : 0;
                                    var cbForMonth2 = spd2.length > 0 ? spd2[0].closingBalance : 0;
                                    var cbForMonth3 = spd3.length > 0 ? spd3[0].closingBalance : 0;
                                    var unmetDemandForMonth1 = spd1.length > 0 ? spd1[0].unmetDemand : 0;

                                    var maxStockForMonth1 = spd1.length > 0 ? spd1[0].maxStock : 0;
                                    var minStockForMonth1 = spd1.length > 0 ? spd1[0].minStock : 0;

                                    var suggestShipment = false;
                                    var useMax = false;
                                    if (compare) {
                                        if (Number(amc) == 0) {
                                            suggestShipment = false;
                                        } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(this.state.minQtyPpu) && (Number(cbForMonth2) > Number(this.state.minQtyPpu) || Number(cbForMonth3) > Number(this.state.minQtyPpu))) {
                                            suggestShipment = false;
                                        } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(this.state.minQtyPpu) && Number(cbForMonth2) < Number(this.state.minQtyPpu) && Number(cbForMonth3) < Number(this.state.minQtyPpu)) {
                                            suggestShipment = true;
                                            useMax = true;
                                        } else if (Number(cbForMonth1) == 0) {
                                            suggestShipment = true;
                                            if (Number(cbForMonth2) < Number(this.state.minQtyPpu) && Number(cbForMonth3) < Number(this.state.minQtyPpu)) {
                                                useMax = true;
                                            } else {
                                                useMax = false;
                                            }
                                        }
                                    } else {
                                        suggestShipment = false;
                                    }
                                    var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                        parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                        parseFloat(programJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    if (suggestShipment) {
                                        var suggestedOrd = 0;
                                        if (useMax) {
                                            suggestedOrd = Number(Math.round(Number(maxStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                        } else {
                                            suggestedOrd = Number(Math.round(Number(minStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                        }
                                        if (suggestedOrd <= 0) {
                                            sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                        } else {
                                            sstd = { "suggestedOrderQty": suggestedOrd, "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
                                        }
                                    } else {
                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                    }
                                    suggestedShipmentsTotalData.push(sstd);
                                }

                                var consumptionListForRegion = (programJson.consumptionList).filter(c => (c.consumptionDate >= m[n].startDate && c.consumptionDate <= m[n].endDate) && c.planningUnit.id == planningUnitId && c.active == true);
                                var inventoryListForRegion = (programJson.inventoryList).filter(c => (c.inventoryDate >= m[n].startDate && c.inventoryDate <= m[n].endDate) && c.planningUnit.id == planningUnitId && c.active == true);
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
                                                consumptionQtyForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                consumptionTotalForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                            }
                                            actualFlagForRegion = true;
                                        } else {
                                            consumptionQtyForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                            consumptionTotalForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
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
                                        if (inventoryListForRegionalDetails[cr].actualQty != undefined && inventoryListForRegionalDetails[cr].actualQty != null && inventoryListForRegionalDetails[cr].actualQty !== "") {
                                            actualCount += 1;
                                            actualQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                            totalActualQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                            var index = regionsReportingActualInventory.findIndex(c => c == regionListFiltered[r].id);
                                            if (index == -1) {
                                                regionsReportingActualInventory.push(regionListFiltered[r].id)
                                            }
                                        }
                                        if (inventoryListForRegionalDetails[cr].adjustmentQty != undefined && inventoryListForRegionalDetails[cr].adjustmentQty != null && inventoryListForRegionalDetails[cr].adjustmentQty !== "") {
                                            adjustmentsCount += 1;
                                            adjustmentsQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                            totalAdjustmentsQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
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

                                var projectedInventoryForRegion = jsonList[0].closingBalance - (jsonList[0].nationalAdjustment != "" ? jsonList[0].nationalAdjustment : 0);
                                // console.log("project Inventory", projectedInventoryForRegion);
                                if (regionsReportingActualInventory.length != totalNoOfRegions) {
                                    totalActualQtyForRegion = i18n.t('static.supplyPlan.notAllRegionsHaveActualStock');
                                }
                                inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": totalAdjustmentsQtyForRegion, "actualQty": totalActualQtyForRegion, "finalInventory": jsonList[0].closingBalance, "autoAdjustments": jsonList[0].nationalAdjustment, "projectedInventory": projectedInventoryForRegion, "month": m[n] })
                                for (var r = 0; r < totalNoOfRegions; r++) {
                                    var consumptionListForRegion = (programJson.consumptionList).filter(c => c.planningUnit.id == this.state.planningUnitId && c.active == true && c.actualFlag.toString() == "true");
                                    let conmax = moment.max(consumptionListForRegion.map(d => moment(d.consumptionDate)))
                                    lastActualConsumptionDate.push({ lastActualConsumptionDate: conmax, region: regionListFiltered[r].id });
                                }
                                var json = {
                                    month: m[n].monthName.concat(" ").concat(m[n].monthYear),
                                    consumption: jsonList[0].consumptionQty,
                                    stock: jsonList[0].closingBalance,
                                    planned: Number(plannedShipmentsTotalData[n] != "" ? plannedShipmentsTotalData[n].qty : 0)
                                    // + Number(plannedErpShipmentsTotalData[n] != "" ? plannedErpShipmentsTotalData[n].qty : 0)
                                    ,
                                    delivered: Number(deliveredShipmentsTotalData[n] != "" ? deliveredShipmentsTotalData[n].qty : 0)
                                    // + Number(deliveredErpShipmentsTotalData[n] != "" ? deliveredErpShipmentsTotalData[n].qty : 0)
                                    ,
                                    shipped: Number(shippedShipmentsTotalData[n] != "" ? shippedShipmentsTotalData[n].qty : 0)
                                    // + Number(shippedErpShipmentsTotalData[n] != "" ? shippedErpShipmentsTotalData[n].qty : 0)
                                    ,
                                    ordered: Number(orderedShipmentsTotalData[n] != "" ? orderedShipmentsTotalData[n].qty : 0)
                                    // + Number(orderedErpShipmentsTotalData[n] != "" ? orderedErpShipmentsTotalData[n].qty : 0)
                                    ,
                                    mos: jsonList[0].mos != null ? parseFloat(jsonList[0].mos).toFixed(2) : jsonList[0].mos,
                                    minMos: minStockMoSQty,
                                    maxMos: maxStockMoSQty,
                                    minQty: this.roundAMC(jsonList[0].minStock),
                                    maxQty: this.roundAMC(jsonList[0].maxStock),
                                    planBasedOn: programPlanningUnit.planBasedOn
                                }
                                jsonArrForGraph.push(json);
                            } else {
                                openingBalanceArray.push({ isActual: lastIsActualClosingBalance, balance: lastClosingBalance });
                                consumptionTotalData.push({ consumptionQty: "", consumptionType: "", textColor: "" });
                                shipmentsTotalData.push("");
                                suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": moment(m[n].startDate).format("YYYY-MM-DD"), "isEmergencyOrder": 0 });
                                // manualShipmentsTotalData.push(0);
                                deliveredShipmentsTotalData.push("");
                                shippedShipmentsTotalData.push("");
                                orderedShipmentsTotalData.push("");
                                plannedShipmentsTotalData.push("");
                                // erpShipmentsTotalData.push(0);
                                // deliveredErpShipmentsTotalData.push("");
                                // shippedErpShipmentsTotalData.push("");
                                // orderedErpShipmentsTotalData.push("");
                                // plannedErpShipmentsTotalData.push("");
                                inventoryTotalData.push("");
                                totalExpiredStockArr.push({ qty: 0, details: [], month: m[n] });
                                monthsOfStockArray.push(null)
                                maxQtyArray.push(null)
                                amcTotalData.push("");
                                minStockMoS.push(minStockMoSQty);
                                maxStockMoS.push(maxStockMoSQty)
                                unmetDemand.push("");
                                closingBalanceArray.push({ isActual: 0, balance: lastClosingBalance, batchInfoList: lastBatchDetails });
                                for (var i = 0; i < this.state.regionListFiltered.length; i++) {
                                    consumptionArrayForRegion.push({ "regionId": regionListFiltered[i].id, "qty": "", "actualFlag": "", "month": m[n] })
                                    inventoryArrayForRegion.push({ "regionId": regionListFiltered[i].id, "adjustmentsQty": "", "actualQty": "", "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                }
                                consumptionArrayForRegion.push({ "regionId": -1, "qty": "", "actualFlag": "", "month": m[n] })
                                inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": "", "actualQty": i18n.t('static.supplyPlan.notAllRegionsHaveActualStock'), "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                lastActualConsumptionDate.push("");

                                var json = {
                                    month: m[n].monthName.concat(" ").concat(m[n].monthYear),
                                    consumption: null,
                                    stock: lastClosingBalance,
                                    planned: 0,
                                    delivered: 0,
                                    shipped: 0,
                                    ordered: 0,
                                    mos: "",
                                    minMos: minStockMoSQty,
                                    maxMos: maxStockMoSQty,
                                    minQty: 0,
                                    maxQty: 0,
                                    planBasedOn: programPlanningUnit.planBasedOn
                                }
                                jsonArrForGraph.push(json);
                            }
                        }
                        // console.log("supplyPlan", supplyPlan);
                        // console.log("consumptionTotalData", consumptionTotalData);
                        this.setState({
                            openingBalanceArray: openingBalanceArray,
                            consumptionTotalData: consumptionTotalData,
                            expiredStockArr: totalExpiredStockArr,
                            shipmentsTotalData: shipmentsTotalData,
                            suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                            // manualShipmentsTotalData: manualShipmentsTotalData,
                            deliveredShipmentsTotalData: deliveredShipmentsTotalData,
                            shippedShipmentsTotalData: shippedShipmentsTotalData,
                            orderedShipmentsTotalData: orderedShipmentsTotalData,
                            plannedShipmentsTotalData: plannedShipmentsTotalData,
                            // erpShipmentsTotalData: erpShipmentsTotalData,
                            // deliveredErpShipmentsTotalData: deliveredErpShipmentsTotalData,
                            // shippedErpShipmentsTotalData: shippedErpShipmentsTotalData,
                            // orderedErpShipmentsTotalData: orderedErpShipmentsTotalData,
                            // plannedErpShipmentsTotalData: plannedErpShipmentsTotalData,
                            inventoryTotalData: inventoryTotalData,
                            monthsOfStockArray: monthsOfStockArray,
                            maxQtyArray: maxQtyArray,
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
                        }, () => {
                            if (isShipment) {
                                this.shipmentsDetailsClicked('allShipments', startDate, stopDate);
                            }
                        })
                        // } else {
                        //     this.setState({ loading: false })
                        //     // calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'programData', 'supplyPlan', this);
                        // }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }



    dataChange(event) {
        let { program } = this.state
        if (event.target.name === "versionStatusId") {
            program.currentVersion.versionStatus.id = event.target.value
        }
        if (event.target.name === "versionNotes") {
            program.currentVersion.notes = event.target.value
        }

        this.setState(
            {
                program,
                remainingDataChanged:1
            }
        )

    };


    getPlanningUnit = () => {
        let programId = this.props.match.params.programId;

        // AuthenticationService.setupAxiosInterceptors();

        ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
            // console.log('**' + JSON.stringify(response.data))
            this.setState({
                planningUnits: (response.data).sort(function (a, b) {
                    a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
                    b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                }.bind(this)), message: ''
            })
        })
            .catch(
                error => {
                    // console.log("Error+++", error)
                    this.setState({
                        planningUnits: [],
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
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

    getDatasource = () => {

        this.setState({
            display: 'none'
        })
        var db1;
        var storeOS;
        getDatabase();
        var dataSourceListAll = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (e) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
            var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
            var dataSourceRequest = dataSourceOs.getAll();
            dataSourceRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            dataSourceRequest.onsuccess = function (event) {
                var dataSourceResult = [];
                dataSourceResult = dataSourceRequest.result;
                for (var k = 0; k < dataSourceResult.length; k++) {
                    if (dataSourceResult[k].program.id == this.props.match.params.programId || dataSourceResult[k].program.id == 0 && dataSourceResult[k].active == true) {
                        if (dataSourceResult[k].realm.id == this.state.program.realmCountry.realm.realmId) {
                            dataSourceListAll.push(dataSourceResult[k]);

                        }
                    }
                }
                // console.log('getDatasource', dataSourceListAll)
                this.setState({
                    dataSourceListAll: dataSourceListAll,
                })
            }.bind(this);
        }.bind(this);

    }



    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramData({ "programId": this.props.match.params.programId, "versionId": this.props.match.params.versionId })
            .then(response => {
                // console.log("===========>", response.data)
                let { program } = this.state
                program = response.data
                var regionList = []
                for (var i = 0; i < program.regionList.length; i++) {
                    var regionJson = {
                        name: getLabelText(program.regionList[i].label, this.state.lang),
                        id: program.regionList[i].regionId
                    }
                    regionList[i] = regionJson

                }
                var hasRole = false;
                // console.log("AuthenticationService.getLoggedInUserRole()====>", AuthenticationService.getLoggedInUserRole());
                AuthenticationService.getLoggedInUserRole().map(c => {
                    if (c.roleId == 'ROLE_SUPPLY_PLAN_REVIEWER') {
                        hasRole = true;

                    }
                });
                var programQPLDetails = [];
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                programQPLDetails.push({
                    id: program.programId,
                    programId: program.programId,
                    version: program.currentVersion.versionId,
                    userId: userId,
                    programCode: program.programCode,
                    openCount: 0,
                    addressedCount: 0,
                    programModified: 0,
                    readonly: 0
                })

                this.setState({
                    program,
                    programQPLDetails: programQPLDetails,
                    programId: program.programId,
                    regionList: regionList,
                    data: response.data.problemReportList,
                    editable: program.currentVersion.versionType.id == 2 && program.currentVersion.versionStatus.id == 1 && hasRole ? true : false

                }, () => {
                    this.getPlanningUnit()
                    // this.getDatasource()
                    this.fetchData();
                    this.buildJExcel()
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
                })

            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

        // AuthenticationService.setupAxiosInterceptors();
        ProgramService.getVersionStatusList().then(response => {
            // console.log('**' + JSON.stringify(response.data))
            this.setState({
                statuses: response.data,
            })
        })
            .catch(
                error => {
                    this.setState({
                        statuses: [],
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

        ProgramService.getProblemStatusList().then(response => {
            // console.log('**' + JSON.stringify(response.data))
            var myResult = (response.data)
            var proList = []
            for (var i = 0; i < myResult.length; i++) {
                var Json = {
                    name: getLabelText(myResult[i].label, lan),
                    id: myResult[i].id,
                    userManaged: myResult[i].userManaged
                }
                proList.push(Json);
            }
            this.setState({
                problemStatusListForEdit: proList
            })
        })
            .catch(
                error => {
                    this.setState({
                        statuses: [],
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

        const lan = localStorage.getItem("lang");
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
            var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
            var problemStatusRequest = problemStatusOs.getAll();

            problemStatusRequest.onerror = function (event) {
                // Handle errors!
                // this.hideSecondComponent();
            };
            problemStatusRequest.onsuccess = function (e) {
                var myResult = [];
                var problemStatusJson = [];
                myResult = problemStatusRequest.result;
                var proList = []
                for (var i = 0; i < myResult.length; i++) {
                    var Json = {
                        name: getLabelText(myResult[i].label, lan),
                        id: myResult[i].id
                    }
                    proList[i] = Json

                    if (myResult[i].id == 1 || myResult[i].id == 3) {
                        problemStatusJson.push({ label: getLabelText(myResult[i].label, lan), value: myResult[i].id });
                    }
                }


                this.setState({
                    problemStatusList: proList,
                    problemStatusValues: problemStatusJson
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
                    this.setState({
                        problemCategoryList: procList
                    })

                }.bind(this)

            }.bind(this);
        }.bind(this);

    }

    formatter = value => {
        if (value != null && value !== '' && !isNaN(Number(value))) {
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
        } else if (value != null && isNaN(Number(value))) {
            return value;
        } else {
            return ''
        }
    }

    toggle(tabPane, tab) {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }

    tabPane() {
        const chartOptions = {
            title: {
                display: true,
                text: this.state.planningUnitName != "" && this.state.planningUnitName != undefined && this.state.planningUnitName != null ? (this.state.program.programCode + "~v" + this.state.program.currentVersion.versionId + " - " + this.state.planningUnitName) : entityname
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
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
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'left',
                },
                {
                    id: 'B',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.supplyPlan.monthsOfStock'),
                        fontColor: 'black'
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'right',
                }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else {
                            return (tooltipItems.yLabel.toLocaleString());
                        }
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

        var chartOptions1 = {
            title: {
                display: true,
                text: this.state.planningUnitName != "" && this.state.planningUnitName != undefined && this.state.planningUnitName != null ? (this.state.program.programCode + "~v" + this.state.program.currentVersion.versionId + " - " + this.state.planningUnitName) : entityname
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
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
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'left',
                }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else {
                            return (tooltipItems.yLabel.toLocaleString());
                        }
                    }.bind(this)
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

        const { planningUnits } = this.state;

        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnit.id}>
                        {getLabelText(item.planningUnit.label, this.state.lang)}
                    </option>
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

        const { problemReviewedList } = this.state;
        let problemReviewed = problemReviewedList.length > 0
            && problemReviewedList.map((item, i) => {
                return ({ label: item.name, value: item.id })
            }, this);


        let bar = {}
        if (this.state.jsonArrForGraph.length > 0) {
            var datasets = [
                {
                    label: i18n.t('static.supplyplan.exipredStock'),
                    yAxisID: 'A',
                    type: 'line',
                    stack: 7,
                    data: this.state.expiredStockArr.map((item, index) => (item.qty > 0 ? item.qty : null)),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    showLine: false,
                    pointStyle: 'triangle',
                    pointBackgroundColor: '#ED8944',
                    pointBorderColor: '#212721',
                    pointRadius: 10

                },
                {
                    label: i18n.t('static.supplyPlan.consumption'),
                    type: 'line',
                    stack: 3,
                    yAxisID: 'A',
                    backgroundColor: 'transparent',
                    borderColor: '#ba0c2f',
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: true,
                    data: this.state.jsonArrForGraph.map((item, index) => (item.consumption))
                },
                {
                    label: i18n.t('static.report.actualConsumption'),
                    yAxisID: 'A',
                    type: 'line',
                    stack: 7,
                    data: this.state.consumptionTotalData.map((item, index) => (item.consumptionType == 1 ? item.consumptionQty : null)),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    showLine: false,
                    pointStyle: 'point',
                    pointBackgroundColor: '#ba0c2f',
                    pointBorderColor: '#ba0c2f',
                    pointRadius: 3
                },
                {
                    label: i18n.t('static.supplyPlan.delivered'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#002f6c',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.delivered)),
                },
                {
                    label: i18n.t('static.supplyPlan.shipped'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#49A4A1',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.shipped)),
                },
                {
                    label: i18n.t('static.supplyPlan.submitted'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#0067B9',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.ordered)),
                },
                {
                    label: i18n.t('static.supplyPlan.planned'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#A7C6ED',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
                },
                {
                    label: i18n.t('static.report.stock'),
                    stack: 2,
                    type: 'line',
                    yAxisID: 'A',
                    borderColor: '#cfcdc9',
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: true,
                    data: this.state.jsonArrForGraph.map((item, index) => (item.stock))
                },
                {
                    label: this.state.planBasedOn == 1 ? i18n.t('static.supplyPlan.minStockMos') : i18n.t('static.product.minQuantity'),
                    type: 'line',
                    stack: 5,
                    yAxisID: this.state.planBasedOn == 1 ? 'B' : 'A',
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
                    pointRadius: 0,
                    yValueFormatString: "$#,##0",
                    lineTension: 0,
                    data: this.state.jsonArrForGraph.map((item, index) => (this.state.planBasedOn == 1 ? item.minMos : item.minQty))
                },
                {
                    label: this.state.planBasedOn == 1 ? i18n.t('static.supplyPlan.maxStockMos') : i18n.t('static.supplyPlan.maxQty'),
                    type: 'line',
                    stack: 6,
                    yAxisID: this.state.planBasedOn == 1 ? 'B' : 'A',
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
                    pointRadius: 0,
                    showInLegend: true,
                    yValueFormatString: "$#,##0",
                    data: this.state.jsonArrForGraph.map((item, index) => (this.state.planBasedOn == 1 ? item.maxMos : item.maxQty))
                }
            ];
            if (this.state.jsonArrForGraph.length > 0 && this.state.planBasedOn == 1) {
                datasets.push({
                    label: i18n.t('static.supplyPlan.monthsOfStock'),
                    type: 'line',
                    stack: 4,
                    yAxisID: 'B',
                    backgroundColor: 'transparent',
                    borderColor: '#118b70',
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: true,
                    data: this.state.jsonArrForGraph.map((item, index) => (item.mos))
                })
            }
            bar = {

                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: datasets

            };
        }

        const { problemCategoryList } = this.state;
        let problemCategories = problemCategoryList.length > 0
            && problemCategoryList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);
        return (
            <>
                <TabPane tabId="1">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0" id="realmDiv">
                                <div className="table-responsive RemoveStriped">
                                    {/* <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                        <div className="controls">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="sm"
                                                    value={this.state.planningUnitId}
                                                    onChange={() => { this.formSubmit(this.state.monthCount); }}
                                                >
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {planningUnitList}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-12 mt-2 pl-0" style={{ display: this.state.display }}>
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
                                            <li><span className="lightgreylegend "></span> <span className="legendcommitversionText"> {i18n.t("static.supplyPlan.minMonthsOfStock")} : {this.state.minMonthsOfStock}</span></li>
                                            <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.reorderInterval")} : {this.state.reorderFrequency}</span></li>
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.mospast")} : {this.state.monthsInPastForAMC}</span></li>
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.mosfuture")} : {this.state.monthsInFutureForAMC}</span></li>
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.shelfLife")} : {this.state.shelfLife}</span></li>
                                        </ul>
                                    </FormGroup> */}

                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                        <div className="controls">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="sm"
                                                    value={this.state.planningUnitId}
                                                    onChange={() => { this.formSubmit(this.state.monthCount); }}
                                                >
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {planningUnitList}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px' }} style={{ display: this.state.display }}>
                                        <ul className="legendcommitversion list-group">
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.planningUnitSettings")} : </b></span></li>
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.amcPastOrFuture")} : {this.state.monthsInPastForAMC}/{this.state.monthsInFutureForAMC}</span></li>
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.shelfLife")} : {this.state.shelfLife}</span></li>
                                            {this.state.planBasedOn == 1 ? <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.minStockMos")} : {this.state.minStockMoSQty}</span></li> : <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.product.minQuantity")} : {this.formatter(this.state.minQtyPpu)}</span></li>}
                                            <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.reorderInterval")} : {this.state.reorderFrequency}</span></li>
                                            {this.state.planBasedOn == 1 ? <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.maxStockMos")} : {this.state.maxStockMoSQty}</span></li> : <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.product.distributionLeadTime")} : {this.formatter(this.state.distributionLeadTime)}</span></li>}
                                        </ul>
                                    </FormGroup>
                                    <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px' }} style={{ display: this.state.display }}>
                                        <ul className="legendcommitversion list-group">
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.consumption")} : </b></span></li>
                                            <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.supplyPlan.forecastedConsumption')}</i></span></li>
                                            <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                                        </ul>
                                    </FormGroup>
                                    <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px' }} style={{ display: this.state.display }}>
                                        <ul className="legendcommitversion list-group">
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.dashboard.shipments")} : </b></span></li>
                                            {
                                                this.state.paColors.map(item1 => (
                                                    <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                                                ))
                                            }
                                            <li><span className="lightgreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.tbd')}</span></li>
                                            <li><span className="lightgreenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.multipleShipments')}</span></li>
                                            <li><span className="legend-localprocurment legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.report.localprocurement')}</span></li>
                                            <li><span className="legend-emergencyComment legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                                            <li><span className="legend-erp legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.shipment.erpShipment')}</span></li>
                                        </ul>
                                    </FormGroup>
                                    <FormGroup className="col-md-12 mt-2 pl-0  mt-3" style={{ display: this.state.display }}>
                                        <ul className="legendcommitversion list-group">
                                            <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.stockBalance")}/{i18n.t("static.report.mos")} : </b></span></li>
                                            <li><span className="legendcolor"></span> <span className="legendcommitversionText"><b>{i18n.t('static.supplyPlan.actualBalance')}</b></span></li>
                                            <li><span className="legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.projectedBalance')}</span></li>
                                            <li><span className="legendcolor" style={{ backgroundColor: "#BA0C2F" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.stockout')}</span></li>
                                            <li><span className="legendcolor" style={{ backgroundColor: "#f48521" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.lowstock')}</span></li>
                                            <li><span className="legendcolor" style={{ backgroundColor: "#118b70" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.okaystock')}</span></li>
                                            <li><span className="legendcolor" style={{ backgroundColor: "#edb944" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.overstock')}</span></li>
                                            <li><span className="legendcolor" style={{ backgroundColor: "#cfcdc9" }}></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlanFormula.na')}</span></li>
                                        </ul>
                                    </FormGroup>

                                    <div className="" id="supplyPlanTableId" style={{ display: this.state.display }}>
                                        <Row className="float-right">
                                            {/* <div className="col-md-12">
                                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />

                                            </div> */}
                                        </Row>
                                        {/* <Row> */}
                                        <div className="col-md-12">
                                            <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                            <span className="supplyplan-rarrow" onClick={this.rightClicked}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                                        </div>
                                        {/* </Row> */}
                                        <div className="table-scroll">
                                            <div className="table-wrap table-responsive">
                                                <Table className="table-bordered text-center mt-2 overflowhide" bordered size="sm" options={this.options}>
                                                    <thead>
                                                        <tr>
                                                            <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                            <th className="supplyplanTdWidth sticky-col first-col clone"></th>
                                                            {
                                                                this.state.monthsArray.map(item => {
                                                                    var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                                                                    var compare = false;
                                                                    if (moment(currentDate).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD")) {
                                                                        compare = true;
                                                                    }
                                                                    return (<th className={compare ? "supplyplan-Thead supplyplanTdWidthForMonths " : "supplyplanTdWidthForMonths "} style={{ padding: '10px 0 !important' }}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                                })
                                                            }
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        <tr bgcolor='#d9d9d9'>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.openingBalance')}</b></td>
                                                            {
                                                                this.state.openingBalanceArray.map(item1 => (
                                                                    <td align="right">{item1.isActual == 1 ? <b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} /></b> : <NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} />}</td>
                                                                ))
                                                            }
                                                        </tr>
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone"><b>- {i18n.t('static.supplyPlan.consumption')}</b></td>
                                                            {
                                                                this.state.consumptionTotalData.map((item1, count) => {
                                                                    if (item1.consumptionType == 1) {
                                                                        if (item1.consumptionQty != null) {
                                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                                        } else {
                                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}>{""}</td>)
                                                                        }
                                                                    } else {
                                                                        if (item1.consumptionQty != null) {
                                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><i><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></i></td>)
                                                                        } else {
                                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><i>{""}</i></td>)
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalShipments()}>
                                                                {this.state.showTotalShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                            </td>
                                                            <td align="left" className="sticky-col first-col clone" ><b>+ {i18n.t('static.dashboard.shipments')}</b></td>
                                                            {
                                                                this.state.shipmentsTotalData.map((item1, index) => {
                                                                    if(item1.toString()!=""){
                                                                        return(<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${this.state.monthsArray[index].startDate}`, `${this.state.monthsArray[index].endDate}`, ``, 'allShipments', index)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                                    }else{
                                                                        return(<td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>

                                                        <tr className="totalShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.suggestedShipments')}</td>
                                                            {
                                                                this.state.suggestedShipmentsTotalData.map(item1 => {
                                                                    if (item1.suggestedOrderQty.toString() != "") {
                                                                        if (item1.isEmergencyOrder == 1) {
                                                                            return (<td align="right" className="emergencyComment"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                                        } else {
                                                                            return (<td align="right" ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td>{item1.suggestedOrderQty}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>

                                                        {/* <tr className="totalShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionManualShipments()}>
                                                                {this.state.showManualShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                            </td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.manualEntryShipments')}</td>
                                                            {
                                                                this.state.manualShipmentsTotalData.map(item1 => (
                                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                                ))
                                                            }
                                                        </tr> */}

                                                        <tr className="totalShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>

                                                            {
                                                                this.state.deliveredShipmentsTotalData.map((item1, count) => {
                                                                    if (item1.toString() != "") {
                                                                        var classNameForShipments = "";
                                                                        if (item1.isLocalProcurementAgent) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                                            }
                                                                        }
                                                                        if (item1.isErp) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                                            }
                                                                        }
                                                                        if (item1.isEmergencyOrder) {
                                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                                        }
                                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }

                                                        </tr>

                                                        <tr className="totalShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                                            {
                                                                this.state.shippedShipmentsTotalData.map((item1, count) => {
                                                                    if (item1.toString() != "") {
                                                                        var classNameForShipments = "";
                                                                        if (item1.isLocalProcurementAgent) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                                            }
                                                                        }
                                                                        if (item1.isErp) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                                            }
                                                                        }
                                                                        if (item1.isEmergencyOrder) {
                                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                                        }
                                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>

                                                        <tr className="totalShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.submitted')}</td>
                                                            {
                                                                this.state.orderedShipmentsTotalData.map((item1, count) => {
                                                                    if (item1.toString() != "") {
                                                                        var classNameForShipments = "";
                                                                        if (item1.isLocalProcurementAgent) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                                            }
                                                                        }
                                                                        if (item1.isErp) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                                            }
                                                                        }
                                                                        if (item1.isEmergencyOrder) {
                                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                                        }
                                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                        <tr className="totalShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                                            {
                                                                this.state.plannedShipmentsTotalData.map((item1, count) => {
                                                                    if (item1.toString() != "") {
                                                                        var classNameForShipments = "";
                                                                        if (item1.isLocalProcurementAgent) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                                            }
                                                                        }
                                                                        if (item1.isErp) {
                                                                            if (item1.textColor == "#fff") {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                                            } else {
                                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                                            }
                                                                        }
                                                                        if (item1.isEmergencyOrder) {
                                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                                        }
                                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                        {/* <tr className="totalShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionErpShipments()}>
                                                                {this.state.showErpShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                            </td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.erpShipments')}</td>
                                                            {
                                                                this.state.erpShipmentsTotalData.map(item1 => (
                                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                                ))
                                                            }
                                                        </tr>
                                                        <tr className="erpShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>
                                                            {
                                                                this.state.deliveredErpShipmentsTotalData.map(item1 => {
                                                                    if (item1.toString() != "") {
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>

                                                        <tr className="erpShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                                            {
                                                                this.state.shippedErpShipmentsTotalData.map(item1 => {
                                                                    if (item1.toString() != "") {
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                        <tr className="erpShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.submitted')}</td>
                                                            {
                                                                this.state.orderedErpShipmentsTotalData.map(item1 => {
                                                                    if (item1.toString() != "") {
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                        <tr className="erpShipments">
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                                            {
                                                                this.state.plannedErpShipmentsTotalData.map(item1 => {
                                                                    if (item1.toString() != "") {
                                                                        if (item1.textColor == "#fff") {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="right" >{item1}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr> */}
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone"><b>+/- {i18n.t('static.supplyPlan.adjustments')}</b></td>
                                                            {
                                                                this.state.inventoryTotalData.map((item1, count) => {
                                                                    if (item1 != null) {
                                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                                    } else {
                                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{""}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone"><b>- {i18n.t('static.supplyplan.exipredStock')}</b></td>
                                                            {
                                                                this.state.expiredStockArr.map(item1 => {
                                                                    if (item1.toString() != "") {
                                                                        if (item1.qty != 0) {
                                                                            return (<td align="right" className="hoverTd redColor" onClick={() => this.toggleLarge('expiredStock', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, '')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.endingBalance')}</b></td>
                                                            {
                                                                this.state.closingBalanceArray.map((item1, count) => {
                                                                    return (<td align="right" bgcolor={this.state.planBasedOn == 1 ? (item1.balance == 0 ? '#BA0C2F' : '') : (item1.balance == null ? "#cfcdc9" : item1.balance == 0 ? "#BA0C2F" : item1.balance < this.state.minQtyPpu ? "#f48521" : item1.balance > this.state.maxQtyArray[count] ? "#edb944" : "#118b70")} className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{item1.isActual == 1 ? <b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} /></b> : <NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} />}</td>)
                                                                })
                                                            }
                                                        </tr>
                                                        {this.state.planBasedOn == 1 && <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.monthsOfStock')}</b></td>
                                                            {
                                                                this.state.monthsOfStockArray.map(item1 => (
                                                                    <td align="right" style={{ backgroundColor: item1 == null ? "#cfcdc9" : item1 == 0 ? "#BA0C2F" : item1 < this.state.minStockMoSQty ? "#f48521" : item1 > this.state.maxStockMoSQty ? "#edb944" : "#118b70" }}>{item1 != null ? <NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /> : i18n.t('static.supplyPlanFormula.na')}</td>
                                                                ))
                                                            }
                                                        </tr>}
                                                        {this.state.planBasedOn == 2 && <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.maxQty')}</b></td>
                                                            {
                                                                this.state.maxQtyArray.map(item1 => (
                                                                    <td align="right">{item1 != null ? <NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /> : ""}</td>
                                                                ))
                                                            }
                                                        </tr>}
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone" title={i18n.t('static.supplyplan.amcmessage')}>{i18n.t('static.supplyPlan.amc')}</td>
                                                            {
                                                                this.state.amcTotalData.map(item1 => (
                                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                                ))
                                                            }
                                                        </tr>
                                                        {/* <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">{i18n.t('static.supplyPlan.minStockMos')}</td>
                                                            {
                                                                this.state.minStockMoS.map(item1 => (
                                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                                ))
                                                            }
                                                        </tr>
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">{i18n.t('static.supplyPlan.maxStockMos')}</td>
                                                            {
                                                                this.state.maxStockMoS.map(item1 => (
                                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                                ))
                                                            }
                                                        </tr> */}
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td align="left" className="sticky-col first-col clone">{i18n.t('static.supplyPlan.unmetDemandStr')}</td>
                                                            {
                                                                this.state.unmetDemand.map(item1 => {
                                                                    if (item1 != null) {
                                                                        return (<td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                                    } else {
                                                                        return (<td align="right">{""}</td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </div>

                                            {
                                                this.state.jsonArrForGraph.length > 0
                                                &&
                                                <div className="" >

                                                    <div className="graphwidth">
                                                        <div className="col-md-12">
                                                            <div className="chart-wrapper chart-graph-report">
                                                                {this.state.planBasedOn == 1 && <Bar id="cool-canvas" data={bar} options={chartOptions} />}
                                                                {this.state.planBasedOn == 2 && <Bar id="cool-canvas" data={bar} options={chartOptions1} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="offset-4 col-md-8"> <span>{i18n.t('static.supplyPlan.noteBelowGraph')}</span></div>
                                                </div>}
                                        </div>
                                    </div>
                                    {/* {
                        this.state.jsonArrForGraph.length > 0
                        &&
                        <div className="col-md-12 " >

                            <div className="col-md-12">
                                <div className="chart-wrapper chart-graph-report">
                                    <Bar id="cool-canvas1" data={bar1} options={chartOptions1} />
                                </div>
                            </div>  
                                    </div>
                            </div>  
                                    </div>
                            </div>  
                                    </div>
                            </div>  
                                    </div>
                            </div>  
                                    </div>
                            </div>  
                                    </div>
                            </div>  
                             </div>} */}
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tabId="2">
                    <Col md="12 pl-0 mt-3">
                        <div className="d-md-flex Selectdiv2">
                            <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.problemStatus')}</Label>
                                {/* <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span> */}
                                <div className="controls problemListSelectField">
                                    <MultiSelect
                                        name="problemStatusId"
                                        id="problemStatusId"
                                        options={problemStatus && problemStatus.length > 0 ? problemStatus : []}
                                        value={this.state.problemStatusValues}
                                        onChange={(e) => { this.handleProblemStatusChange(e) }}
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
                                            // value={this.state.hqStatusId}
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
                                        // value={1}
                                        >
                                            <option value="-1">{i18n.t("static.common.all")}</option>
                                            {problemCategories}
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                            <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.problemReport.reviewed')}</Label>
                                {/* <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span> */}
                                <div className="controls problemListSelectField">
                                    <MultiSelect
                                        name="reviewedStatusId"
                                        id="reviewedStatusId"
                                        options={problemReviewed && problemReviewed.length > 0 ? problemReviewed : []}
                                        value={this.state.problemReviewedValues}
                                        onChange={(e) => { this.handleProblemReviewedChange(e) }}
                                        labelledBy={i18n.t('static.common.select')}
                                    />
                                </div>
                            </FormGroup>
                            {/* <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlanReview.review')}</Label>
                                <div className="controls SelectField">
                                    <InputGroup>
                                        <Input type="select"
                                            bsSize="sm"
                                            name="reviewedStatusId" id="reviewedStatusId"
                                            onChange={this.fetchData}
                                        >
                                            <option value="0">No</option>
                                            <option value="1">Yes</option>

                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup> */}
                            {/* {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROBLEM') &&
                                <div className="col-md-4 card-header-action">
                                    <a className="pull-right" href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addMannualProblem}><i className="fa fa-plus-square"></i></a>
                                </div>
                            } */}
                        </div>
                    </Col>
                    {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROBLEM') &&
                        <div className="col-md-12 card-header-action">
                            <a className="pull-right" style={{ marginTop: '-21px' }} href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addMannualProblem}><i className="fa fa-plus-square"></i></a>
                        </div>
                    }
                    <br />
                    <FormGroup className="col-md-6 mt-5 pl-0" >
                        <ul className="legendcommitversion list-group">
                            <li><span className="problemList-red legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.high')}</span></li>
                            <li><span className="problemList-orange legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.medium')}</span></li>
                            <li><span className="problemList-yellow legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.problemList.low')} </span></li>
                        </ul>
                    </FormGroup>
                    <div className="consumptionDataEntryTable RemoveStriped qat-problemListSearch EditStatusTable">
                        <div id="problemListDiv" className="" />
                    </div>
                </TabPane>

            </>
        );
    }

    handleProblemStatusChange = (event) => {
        var cont = false;
        if (this.state.problemReportChanged == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            // console.log('***', event)
            var problemStatusIds = event
            problemStatusIds = problemStatusIds.sort(function (a, b) {
                return parseInt(a.value) - parseInt(b.value);
            })
            this.setState({
                problemStatusValues: problemStatusIds.map(ele => ele),
                problemStatusLabels: problemStatusIds.map(ele => ele.label),
                problemReportChanged: 0
            }, () => {
                // console.log("problemStatusValues===>", this.state.problemStatusValues);
                this.fetchData()
            })
        }
    }
    handleProblemReviewedChange = (event) => {
        var cont = false;
        if (this.state.problemReportChanged == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            // console.log('***', event)
            var problemReviewedIds = event
            problemReviewedIds = problemReviewedIds.sort(function (a, b) {
                return parseInt(a.value) - parseInt(b.value);
            })
            this.setState({
                problemReviewedValues: problemReviewedIds.map(ele => ele),
                problemReviewedLabels: problemReviewedIds.map(ele => ele.label),
                problemReportChanged: 0
            }, () => {
                // console.log("problemReviewedValues===>", this.state.problemReviewedValues);
                this.fetchData()
            })
        }
    }

    getNote(row, lang) {
        var transList = row.problemTransList.filter(c => c.reviewed == false);
        if (transList.length == 0) {
            // console.log("this problem report id do not have trans+++", row.problemReportId);
            return ""
        } else {
            var listLength = transList.length;
            return transList[listLength - 1].notes;
        }
    }

    fetchData() {
        var cont = false;
        if (this.state.problemReportChanged == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            // alert("hi 2");
            this.setState({
                problemList: [],
                message: '',
                loading: true,
                problemReportChanged: 0
            },
                () => {
                    this.el = jexcel(document.getElementById("problemListDiv"), '');
                    // this.el.destroy();
                    jexcel.destroy(document.getElementById("problemListDiv"), true);
                });

            // let problemStatusId = ;
            let problemStatusIds = this.state.problemStatusValues.map(ele => (ele.value));
            // console.log("D-------------->Problem status Ids ------------------>", problemStatusIds)
            // let reviewedStatusId = document.getElementById('reviewedStatusId').value;
            let reviewedStatusId = this.state.problemReviewedValues.map(ele => (ele.value));
            var problemReportList = this.state.data;
            var problemReportFilterList = problemReportList;
            let problemTypeId = document.getElementById('problemTypeId').value;
            let problemCategoryId = document.getElementById('problemCategoryId').value;
            // console.log("problemReportList====>", problemReportList);
            if (problemStatusIds != []) {
                var myStartDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
                problemReportFilterList = problemReportFilterList.filter(c => (c.problemStatus.id == 4 ? moment(c.createdDate).format("YYYY-MM-DD") >= myStartDate : true) && problemStatusIds.includes(c.problemStatus.id));
                if (reviewedStatusId != []) {
                    problemReportFilterList = problemReportFilterList.filter(c => reviewedStatusId.includes(c.reviewed == true ? 1 : 0));
                    // if (reviewedStatusId == 0) {
                    //     problemReportFilterList = problemReportFilterList.filter(c => c.reviewed == false);
                    // } else {
                    //     problemReportFilterList = problemReportFilterList.filter(c => c.reviewed == true);
                    // }
                }
                if (problemTypeId != -1) {
                    problemReportFilterList = problemReportFilterList.filter(c => (c.problemType.id == problemTypeId));
                }
                if (problemCategoryId != -1) {
                    problemReportFilterList = problemReportFilterList.filter(c => (c.problemCategory.id == problemCategoryId));
                }
                // console.log("problemReportFilterList after filter------------->", problemReportFilterList)
                this.setState({
                    problemList: problemReportFilterList,
                    message: ''
                },
                    () => {
                        this.buildJExcel();
                    });

                // if (problemStatusId == -1 && reviewedStatusId == 0) {
                //     problemReportFilterList = problemReportList.filter(c => (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.reviewed == false);
                //     this.setState({
                //         problemList: problemReportFilterList,
                //         message: ''
                //     },
                //         () => {
                //             this.buildJExcel();
                //         });
                // }
                // else if (problemStatusId != -1 && reviewedStatusId == 0) {
                //     if (problemStatusId == 2) {
                //         var myStartDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
                //         // var myEndDate = moment(Date.now()).format("YYYY-MM-DD");
                //         problemReportFilterList = problemReportList.filter(c => moment(c.createdDate).format("YYYY-MM-DD") >= myStartDate && c.problemStatus.id == problemStatusId && c.reviewed == false);
                //     } else {
                //         problemReportFilterList = problemReportList.filter(c => c.problemStatus.id == problemStatusId && c.reviewed == false);
                //     }
                //     this.setState({
                //         problemList: problemReportFilterList,
                //         message: ''
                //     },
                //         () => {
                //             this.buildJExcel();
                //         });
                // } else if (problemStatusId == -1 && reviewedStatusId == 1) {
                //     problemReportFilterList = problemReportList.filter(c => (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.reviewed == true);
                //     this.setState({
                //         problemList: problemReportFilterList,
                //         message: ''
                //     },
                //         () => {
                //             this.buildJExcel();
                //         });
                // }
                // else if (problemStatusId != -1 && reviewedStatusId == 1) {
                //     if (problemStatusId == 2) {
                //         var myStartDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
                //         // var myEndDate = moment(Date.now()).format("YYYY-MM-DD");
                //         problemReportFilterList = problemReportList.filter(c => moment(c.createdDate).format("YYYY-MM-DD") >= myStartDate && c.problemStatus.id == problemStatusId && c.reviewed == true);
                //     } else {
                //         problemReportFilterList = problemReportList.filter(c => c.problemStatus.id == problemStatusId && c.reviewed == true);
                //     }
                //     this.setState({
                //         problemList: problemReportFilterList,
                //         message: ''
                //     },
                //         () => {
                //             this.buildJExcel();
                //         });
                // }



            }
            else if (problemStatusIds == []) {
                this.setState({ message: i18n.t('static.report.selectProblemStatus'), problemList: [], loading: false },
                    () => {
                        this.el = jexcel(document.getElementById("problemListDiv"), '');
                        // this.el.destroy();
                        jexcel.destroy(document.getElementById("problemListDiv"), true);

                    });
            }
        }
    }

    filterProblemStatus = function (instance, cell, c, r, source) {
        var mylist = [];
        // var json = instance.jexcel.getJson(null, false)
        mylist = this.state.problemStatusListForEdit;
        mylist = mylist.filter(c => c.userManaged == true);
        return mylist;
    }.bind(this)

    buildProblemTransJexcel() {
        // console.log("In jexcel+++", this.state.problemTransList);
        var currentTrans = this.state.problemTransList.sort((function (a, b) {
            a = a.createdDate
            b = b.createdDate
            return a > b ? -1 : a < b ? 1 : 0;
        }));

        let dataArray = [];
        let count = 0;
        for (var j = 0; j < currentTrans.length; j++) {
            data = [];
            data[0] = currentTrans[j].problemStatus.label.label_en;
            data[1] = currentTrans[j].notes;
            data[2] = currentTrans[j].createdBy.username;
            data[3] = currentTrans[j].createdDate;
            dataArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("problemTransDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("problemTransDiv"), true);

        var json = [];
        var data = dataArray;

        var options = {
            data: data,
            columnDrag: true,
            columns: [
                {
                    title: i18n.t('static.report.problemStatus'),
                    type: 'text',

                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',

                },
                {
                    title: i18n.t('static.report.lastmodifiedby'),
                    type: 'text',

                },
                {
                    title: i18n.t('static.report.lastmodifieddate'),
                    type: 'calendar',
                    format: JEXCEL_DATE_FORMAT_SM

                },

            ],
            onload: this.loaded1,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            parseFormulas: true,
            license: JEXCEL_PRO_KEY,
            // text: {
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
            //     show: '',
            //     entries: '',
            // },
        };
        var problemTransEl = jexcel(document.getElementById("problemTransDiv"), options);
        this.el = problemTransEl;
        this.setState({
            problemTransEl: problemTransEl
        })
    }
    loaded1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
    }

    buildJExcel() {
        // var problemListDate = moment(Date.now()).subtract(12, 'months').endOf('month').format("YYYY-MM-DD");
        let problemList = this.state.problemList;
        problemList = problemList;
        // console.log("problemList---->", problemList);
        let problemArray = [];
        let count = 0;

        for (var j = 0; j < problemList.length; j++) {
            data = [];
            data[0] = problemList[j].problemReportId
            data[1] = problemList[j].problemActionIndex
            data[2] = ""
            data[3] = problemList[j].versionId
            data[4] = ""
            data[5] = getLabelText(problemList[j].planningUnit.label, this.state.lang)
            data[6] = (problemList[j].dt != null) ? (moment(problemList[j].dt).format('MMM-YY')) : ''
            data[7] = problemList[j].problemCategory.id
            data[8] = getProblemDesc(problemList[j], this.state.lang)
            data[9] = getSuggestion(problemList[j], this.state.lang)
            data[10] = problemList[j].problemStatus.id
            data[11] = this.getNote(problemList[j], this.state.lang)
            data[12] = problemList[j].problemStatus.id
            data[13] = problemList[j].planningUnit.id
            data[14] = problemList[j].realmProblem.problem.problemId
            data[15] = ""
            data[16] = problemList[j].realmProblem.criticality.id

            data[17] = problemList[j].reviewNotes != null ? problemList[j].reviewNotes : ''
            data[18] = (problemList[j].reviewedDate != null && problemList[j].reviewedDate != '') ? moment(problemList[j].reviewedDate).format(`${DATE_FORMAT_CAP}`) : ''

            data[19] = getLabelText(problemList[j].realmProblem.criticality.label, this.state.lang)
            data[20] = problemList[j].reviewed
            data[21] = ''

            data[22] = 0
            data[23] = problemList[j].problemTransList
            problemArray[count] = data;
            count++;





        }
        // if (problemList.length == 0) {
        //     data = [];
        //     problemArray[0] = data;
        // }
        // console.log("problemArray---->", problemArray);
        this.el = jexcel(document.getElementById("problemListDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("problemListDiv"), true);

        var json = [];
        var data = problemArray;

        var options = {
            data: data,
            columnDrag: true,
            // colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    // title: 'problemReportId',
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: 'problemActionIndex',
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: i18n.t('static.program.programCode'),
                    // type: 'hidden',
                    // width: 0
                    // readOnly:true
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: i18n.t('static.program.versionId'),
                    // type: 'hidden',
                    // readOnly: true,
                    // width: 70
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: i18n.t('static.region.region'),
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                    readOnly: true,
                    width: 80
                },
                {
                    // title: i18n.t('static.report.month'),
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
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
                    width: 120
                },
                {
                    title: i18n.t('static.report.suggession'),
                    type: 'text',
                    readOnly: true,
                    width: 120
                },
                {
                    title: i18n.t('static.report.problemStatus'),
                    type: 'dropdown',
                    source: this.state.problemStatusListForEdit,
                    width: 80,
                    filter: this.filterProblemStatus,
                    readOnly: !this.state.editable
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    readOnly: true,
                    width: 120
                },
                {
                    // title: i18n.t('static.common.action'),
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: 'planningUnitId',
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: 'problemId',
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: 'actionUrl',
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    // title: 'criticalitiId',
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },

                {
                    title: i18n.t('static.report.reviewNotes'),
                    type: 'text',
                    width: 120,
                    readOnly: true

                },
                {
                    title: i18n.t('static.report.reviewedDate'),
                    type: 'text',
                    width: 80,
                    readOnly: true

                },

                {
                    title: i18n.t('static.problemAction.criticality'),
                    type: 'text',
                    readOnly: true,
                    width: 80
                },
                {
                    title: i18n.t('static.supplyPlanReview.review'),
                    type: 'checkbox',
                    width: 50,
                    readOnly: !this.state.editable
                },
                {
                    title: !this.state.editable ? 'A' : i18n.t('static.supplyPlanReview.reviewNotes'),
                    type: !this.state.editable ? 'text' : 'text',
                    visible: !this.state.editable ? false : true,
                    readOnly: !this.state.editable,
                    width: 120,
                },

                {
                    // title: 'isChanged',
                    // type: 'hidden',
                    // width: 0
                    title: 'A',
                    type: 'text',
                    visible: false,
                    width: 0,
                    readOnly: true, autoCasting: false
                },
                {
                    title: 'transList',
                    type: 'hidden',
                    width: 0
                },


            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el;
                if (this.state.editable) {
                    var rowData = elInstance.getRowData(y);
                    if (rowData[12] == 4) {
                        var cell = elInstance.getCell(("S").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("T").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    if (this.state.editable) {
                        if (rowData[20].toString() == "true") {
                            var cell = elInstance.getCell(("V").concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                        } else {
                            var cell = elInstance.getCell(("V").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                            // elInstance.setValueFromCoords(x, y, "", true);
                        }
                    }
                }

                // var elInstance = instance.jexcel;
                // var json = elInstance.getJson();
                // for (var j = 0; j < json.length; j++) {
                // var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'S']
                // var colArr = ['U']
                var rowData = elInstance.getRowData(y);
                var criticalityId = rowData[16];
                var problemStatusId = rowData[12];
                if (criticalityId == 3) {
                    // console.log("In if");
                    var cell = elInstance.getCell(("T").concat(parseInt(y) + 1))
                    // console.log("cell classlist------------------>", cell.classList);
                    cell.classList.add('highCriticality');
                } else if (criticalityId == 2) {
                    // console.log("In if 1");
                    var cell = elInstance.getCell(("T").concat(parseInt(y) + 1))
                    cell.classList.add('mediumCriticality');
                } else if (criticalityId == 1) {
                    // console.log("In if 2");
                    var cell = elInstance.getCell(("T").concat(parseInt(y) + 1))
                    cell.classList.add('lowCriticality');
                    // }
                }
            }.bind(this),
            onsearch: function (el) {
                // el.jexcel.updateTable();
            },
            onfilter: function (el) {
                // el.jexcel.updateTable();
            },
            // editable: this.state.editable,
            // text: {
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
            //     show: '',
            //     entries: '',
            // },

            // updateTable: function (el, cell, x, y, source, value, id) {
            // }.bind(this),

            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            allowManualInsertRow: false,
            onchange: this.rowChanged,
            // onselection: this.selected,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            // editable: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            parseFormulas: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items1 = [];
                // console.log("y====",y);
                if (y != null) {
                    items1.push({
                        title: i18n.t('static.problemContext.viewTrans'),
                        onclick: function () {
                            var myObj = obj.getRowData(y);
                            // console.log("my obj===>", myObj);
                            this.toggleTransView(myObj[23]);
                        }.bind(this)
                    });

                }
                return items1;
            }.bind(this)
        };
        var problemEl = jexcel(document.getElementById("problemListDiv"), options);
        this.el = problemEl;
        this.setState({
            problemEl: problemEl
        })
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    updateFieldData = (value) => {
        let { program } = this.state;
        this.setState({ regionId: value });
        var regionId = value;
        var regionIdArray = [];
        for (var i = 0; i < regionId.length; i++) {
            regionIdArray[i] = regionId[i].value;
        }
        program.regionArray = regionIdArray;



        this.setState({
            program: program,
            // programQPLDetails:programQPLDetails, 
            // programId:program.programId
        });
    }

    touchAll(setTouched, errors) {
        setTouched({
            versionStatusId: true,
            versionNotes: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('supplyplanForm', (fieldName) => {
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

    touchAllForAddingProblem(setTouched, errors) {
        setTouched({
            problemDescription: true,
            modelPlanningUnitId: true,
            modelCriticalityId: true,
            suggession: true
        }
        )
        this.validateFormForAddingProblem(errors)
    }
    validateFormForAddingProblem(errors) {
        this.findFirstError('addProblemForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }

    addMannualProblem() {
        // console.log("-------------------addNewProblem--------------------");
        this.getProblemCriticality();
        this.setState({
            isModalOpen: !this.state.isModalOpen,
        }, () => {
        });
    }

    submitManualProblem(criticalityId, regionId, modelPlanningUnitId, problemDescription, suggession) {
        var json = {
            "realmProblem": {
                "realmProblemId": criticalityId == 1 ? "25" : criticalityId == 2 ? "26" : "27",
                "problemType": {
                    "id": "2"
                }
            },
            "program": {
                "id": this.props.match.params.programId
            },
            "versionId": this.props.match.params.versionId,
            "problemStatus": {
                "id": "1"
            },
            "dt": moment(new Date()).format("YYYY-MM-DD"),
            "region": {
                "id": regionId
            },
            "planningUnit": {
                "id": modelPlanningUnitId
            },
            "data5": '{"problemDescription":"' + problemDescription + '", "suggession":"' + suggession + '"}',
            "notes": ""
        }
        ProgramService.createManualProblem(json)
            .then(response => {
                if (response.status == 200) {
                    // this.props.history.push('/report/editStatus/' + this.props.match.params.programId + '/' + this.props.match.params.versionId + '/' + false + '/green/' + i18n.t('static.problem.addedSuccessfully'));
                    this.setState({
                        message: response.data.message,
                        problemReportChanged: 0,
                        remainingDataChanged:0,

                        // isModalOpen: !this.state.isModalOpen,
                    })
                    // window.location.reload(false);
                    this.componentDidMount();
                    this.toggle(0, '2');

                } else {
                    this.setState({
                        message: response.data.message,
                    })
                }
            })
            .catch(
                error => {

                    // console.log(error)
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: error.message 
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 404:
                                this.props.history.push(`/login/${error.response.data.messageCode}`)
                                break;
                            case 500:
                            case 401:
                            case 403:
                            case 406:
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
    }

    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        })
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { statuses } = this.state;
        let statusList = statuses.length > 0
            && statuses.map((item, i) => {
                return (
                    // <option key={i} value={item.id} disabled={item.id == 1 ? "disabled" : ""} >
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option >
                )
            }, this);

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );


        const columns = [
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

        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnit.id}>{getLabelText(item.planningUnit.label, this.state.lang)}</option>
                )
            }, this);


        const { criticalitiesList } = this.state;
        let criticalities = criticalitiesList.length > 0
            && criticalitiesList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { regionList } = this.state;
        let regions = regionList.length > 0
            && regionList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <h5 className={this.state.submitColor} id="div3">{i18n.t(this.state.submitMessage)}</h5>

                <Col sm={12} sm={12} style={{ flexBasis: 'auto' }}>
                    <Card>
                        <ProblemListFormulas ref="formulaeChild" />
                        <div className="Card-header-addicon">
                            <div className="card-header-actions">
                                <a className="">
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.report.problemReportStatusDetails')}</small></span>
                                    {/* <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link> */}
                                </a>
                            </div>
                        </div>
                        {/* <CardHeader>
                            <i className="icon-note"></i><strong>{i18n.t('static.report.updatestatus')}</strong>{' '}
                        </CardHeader> */}
                        <CardBody>
                            <Formik
                                render={
                                    ({
                                    }) => (
                                        <Form name='simpleForm'>
                                            <Col md="12 pl-0">
                                                <div className="row">
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                        <div className="controls">
                                                            <InputGroup>
                                                                <Input type="text"
                                                                    name="programId"
                                                                    id="programId"
                                                                    bsSize="sm"
                                                                    value={this.state.program.label.label_en}
                                                                    disabled />
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                </div>
                                            </Col>
                                        </Form>

                                    )} />

                            {/* </CardBody> */}
                            <Row>
                                <Col xs="12" md="12" className="mb-4">
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '1'}
                                                onClick={() => { this.toggle(0, '1'); }}
                                            >
                                                {i18n.t('static.dashboard.supplyPlan')}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '2'}
                                                onClick={() => { this.toggle(0, '2'); }}
                                            >
                                                {i18n.t('static.dashboard.qatProblemList')}
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={this.state.activeTab[0]}>
                                        {this.tabPane()}
                                    </TabContent>
                                </Col>
                            </Row>

                        </CardBody>
                        <Modal isOpen={this.state.consumption}
                            className={'modal-lg ' + this.props.className, "modalWidth"} >
                            <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.dashboard.consumptiondetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                                <ul className="legendcommitversion list-group" style={{ display: 'inline-flex' }}>
                                    <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.supplyPlan.forecastedConsumption')}</i></span></li>
                                    <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                                </ul>
                                <div className=" card-header-actions" style={{ marginTop: '19px' }}>
                                    <a className="card-header-action">
                                        {/* <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span> */}
                                        <Link to={`/consumptionDetails/` + this.state.programId + `/0/` + this.state.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.consumptionDataEntry')}</small></Link>
                                    </a>
                                </div>
                            </ModalHeader>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <ModalBody>
                                    <h6 className="red" id="div2">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h6>
                                    <div className="col-md-12">
                                        <span className="supplyplan-larrow-dataentry" onClick={this.leftClickedConsumption}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                        <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedConsumption}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                                    </div>
                                    <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                        <thead>
                                            <tr>
                                                <th className="regionTdWidthConsumption"></th>
                                                {
                                                    this.state.monthsArray.map((item, count) => {
                                                        if (count < 7) {
                                                            return (<th className={moment(this.state.consumptionStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead supplyplanTdWidthForMonths" : "supplyplanTdWidthForMonths"}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                        }
                                                    })
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.regionListFiltered.map(item => (
                                                    <tr>
                                                        <td align="left">{item.name}</td>
                                                        {
                                                            this.state.consumptionFilteredArray.filter(c => c.regionId == item.id).map((item1, count) => {
                                                                if (count < 7) {
                                                                    if (item1.qty.toString() != '') {
                                                                        if (item1.actualFlag.toString() == 'true') {
                                                                            return (<td align="center" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                        } else {
                                                                            return (<td align="center" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><i><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></i></td>)
                                                                        }
                                                                    } else {
                                                                        return (<td align="center"></td>)
                                                                    }
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
                                                    this.state.consumptionFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                        if (count < 7) {
                                                            return (<th style={{ textAlign: 'center' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></th>)
                                                        }
                                                    })
                                                }
                                            </tr>
                                        </tfoot>
                                    </Table>
                                    {this.state.showConsumption == 1 && <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="supplyPlanCompare" useLocalData={0} />}
                                    <div className="mt-3">
                                        <div id="consumptionTable" />
                                    </div>
                                    <h6 className="red" id="div3">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                                    <div className="">
                                        <div id="consumptionBatchInfoTable" className="AddListbatchtrHeight"></div>
                                    </div>

                                    <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                        <span>{i18n.t("static.dataEntry.missingBatchNote")}</span>
                                        <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledConsumption()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    </div>
                                    <div className="pt-4"></div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {/* Consumption modal */}
                        {/* Adjustments modal */}
                        <Modal isOpen={this.state.adjustments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.supplyPlan.adjustmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                                <div className="card-header-actions" style={{ marginTop: '0px' }}>
                                    <a className="card-header-action">
                                        {/* <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span> */}
                                        <Link to={`/inventory/addInventory/` + this.state.programId + `/0/` + this.state.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.adjustmentDataEntry')}</small></Link>
                                    </a>
                                </div>
                            </ModalHeader>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <ModalBody>
                                    <h6 className="red" id="div2">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h6>
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
                                                        if (count < 7) {
                                                            return (<th colSpan="2" className={moment(this.state.inventoryStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead" : ""}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                        }
                                                    })
                                                }
                                            </tr>
                                            <tr>
                                                <th></th>
                                                {
                                                    this.state.monthsArray.map((item, count) => {
                                                        if (count < 7) {
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
                                                                if (count < 7) {
                                                                    if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                        return (
                                                                            <>
                                                                                <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                                <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                            </>
                                                                        )
                                                                    } else if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() == "" || item1.actualQty.toString() == 0)) {
                                                                        return (
                                                                            <>
                                                                                <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                                <td align="center"></td>
                                                                            </>
                                                                        )
                                                                    } else if (item1.adjustmentsQty.toString() == '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                        return (
                                                                            <>
                                                                                <td align="center"></td>
                                                                                <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>

                                                                            </>
                                                                        )
                                                                    } else {
                                                                        return (<><td align="center"></td><td align="center"></td></>)
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
                                                        if (count < 7) {
                                                            return (
                                                                <>
                                                                    <td style={{ textAlign: 'center' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentsQty} />
                                                                    </td>
                                                                    {(item.actualQty) > 0 ? <td style={{ textAlign: 'center' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.actualQty} /></td> : <td style={{ textAlign: 'left' }}>{item.actualQty}</td>}
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
                                                        if (count < 7) {
                                                            return (
                                                                <td colSpan="2"><NumberFormat displayType={'text'} thousandSeparator={true} value={item.projectedInventory} /></td>
                                                            )

                                                        }
                                                    })
                                                }
                                            </tr>
                                            <tr bgcolor='#d9d9d9'>
                                                <td align="left">{i18n.t("static.supplyPlan.autoAdjustment")}</td>
                                                {
                                                    this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item1, count) => {
                                                        if (count < 7) {
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
                                                        if (count < 7) {
                                                            return (
                                                                <td colSpan="2" className={item.balance != 0 ? "hoverTd" : ""} onClick={() => item.balance != 0 ? this.setState({ batchInfoInInventoryPopUp: item.batchInfoList }) : ""}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.balance} /></td>
                                                            )
                                                        }
                                                    })
                                                }
                                            </tr>
                                        </tbody>
                                    </Table>
                                    {this.state.batchInfoInInventoryPopUp.filter(c => c.qty > 0).length > 0 &&
                                        <>
                                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                                <thead>
                                                    <tr>
                                                        <th>{i18n.t("static.supplyPlan.batchId")}</th>
                                                        <th>{i18n.t('static.report.createdDate')}</th>
                                                        <th>{i18n.t('static.inventory.expireDate')}</th>
                                                        <th>{i18n.t('static.supplyPlan.qatGenerated')}</th>
                                                        <th>{i18n.t("static.report.qty")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.batchInfoInInventoryPopUp.filter(c => c.qty > 0).map(item => (
                                                        <tr>
                                                            <td>{item.batchNo}</td>
                                                            <td>{moment(item.createdDate).format(DATE_FORMAT_CAP)}</td>
                                                            <td>{moment(item.expiryDate).format(DATE_FORMAT_CAP)}</td>
                                                            <td>{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table><br />
                                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.setState({ batchInfoInInventoryPopUp: [] })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button><br />
                                        </>
                                    }
                                    {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} inventoryPage="supplyPlanCompare" hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} adjustmentsDetailsClicked={this.adjustmentsDetailsClicked} useLocalData={0} />}
                                    <div className="mt-3">
                                        <div id="adjustmentsTable" className="" />
                                    </div>
                                    <h6 className="red" id="div3">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                                    <div className="">
                                        <div id="inventoryBatchInfoTable" className="AddListbatchtrHeight"></div>
                                    </div>

                                    <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                        <span>{i18n.t("static.dataEntry.missingBatchNote")}</span>
                                        <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    </div>
                                    <div className="pt-4"></div>
                                </ModalBody>
                                <ModalFooter>
                                    {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.inventoryChild.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {/* adjustments modal */}

                        {/* Shipments modal */}
                        <Modal isOpen={this.state.shipments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('shipments')} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.supplyPlan.shipmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                                <ul className="legendcommitversion">
                                    <li className="mt-2"><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                                    <li className="mt-2"><span className=" mediumGreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.doNotIncludeInProjectedShipment')} </span></li>
                                    <li className="mt-2"><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.shipment.erpShipment')} </span></li>
                                    <li className="mt-2"><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.common.readonlyData')} </span></li>
                                </ul>
                                <div className="card-header-actions" style={{ marginTop: '-21px' }}>
                                    <a className="card-header-action">
                                        {/* <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span> */}
                                        <Link to={`/shipment/shipmentDetails/` + this.state.programId + `/0/` + this.state.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.shipmentDataEntry')}</small></Link>
                                    </a>
                                </div>
                            </ModalHeader>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <ModalBody>
                                    <div>
                                        <div className="col-md-12">
                                            <span className="supplyplan-larrow-dataentry" onClick={this.leftClickedShipments}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                            <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedShipments}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                                        </div>
                                        <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                            <thead>
                                                <tr>
                                                    <th className="regionTdWidthConsumption"></th>
                                                    {
                                                        this.state.monthsArray.map((item, count) => {
                                                            if (count < 7) {
                                                                if(this.state.shipmentsTotalData[count]!=undefined && this.state.shipmentsTotalData[count].toString()!=''){
                                                                    return (<th onClick={() => this.shipmentsDetailsClicked('allShipments', `${item.startDate}`, `${item.endDate}`)} className={moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead supplyplanTdWidthForMonths hoverTd" : "supplyplanTdWidthForMonths hoverTd"}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                                }else{
                                                                    return (<th className={moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead supplyplanTdWidthForMonths" : "supplyplanTdWidthForMonths"}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                                }
                                                            }
                                                        })
                                                    }
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td align="left">{i18n.t('static.dashboard.shipments')}</td>
                                                    {
                                                        this.state.shipmentsTotalData.map((item1, count) => {
                                                            if (count < 7) {
                                                                if (item1.toString() != '') {
                                                                    return (<td align="center" className={this.state.monthsArray.findIndex(c => moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(c.startDate).format("YYYY-MM-DD")) == count ? "supplyplan-Thead hoverTd" : "hoverTd"} onClick={() => this.shipmentsDetailsClicked('allShipments', `${this.state.monthsArray[count].startDate}`, `${this.state.monthsArray[count].endDate}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                                } else {
                                                                    return (<td align="center"></td>)
                                                                }
                                                            }
                                                        })
                                                    }
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    {this.state.showShipments == 1 && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} hideFourthComponent={this.hideFourthComponent} hideFifthComponent={this.hideFifthComponent} shipmentPage="supplyPlanCompare" useLocalData={0} />}
                                    <h6 className="red" id="div2">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError}</h6>
                                    <div className="">
                                        <div id="shipmentsDetailsTable" />
                                    </div>
                                    {this.refs.shipmentChild != undefined && this.refs.shipmentChild.state.originalShipmentIdForPopup !== "" && <><br /><strong>{this.refs.shipmentChild != undefined && this.refs.shipmentChild.state.originalShipmentIdForPopup !== "" ? "For Shipment Id " + this.refs.shipmentChild.state.originalShipmentIdForPopup : ""}</strong></>}
                                    <h6 className="red" id="div3">{this.state.qtyCalculatorValidationError}</h6>
                                    <div className="RemoveStriped">
                                        <div id="qtyCalculatorTable"></div>
                                    </div>

                                    <div className="RemoveStriped">
                                        <div id="qtyCalculatorTable1" className="jexcelremoveReadonlybackground"></div>
                                    </div>

                                    <div id="showSaveQtyButtonDiv" style={{ display: 'none' }}>
                                        <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('qtyCalculator')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    </div>

                                    <h6 className="red" id="div4">{this.state.shipmentDatesError}</h6>
                                    <div className="">
                                        <div id="shipmentDatesTable"></div>
                                    </div>
                                    <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                                        <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    </div>
                                    <h6 className="red" id="div5">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                                    <div className="">
                                        <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight"></div>
                                    </div>
                                    <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                        <Button size="md" color="danger" id="shipmentDetailsPopCancelButton" className="float-right mr-1 " onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                        <b><h3 className="float-right mr-2">{i18n.t("static.supplyPlan.shipmentQty") + " : " + this.addCommas(this.state.shipmentQtyTotalForPopup) + " / " + i18n.t("static.supplyPlan.batchQty") + " : " + this.addCommas(this.state.batchQtyTotalForPopup)}</h3></b>
                                    </div>
                                    <div className="pt-4"></div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('shipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {/* Shipments modal */}
                        {/* Expired Stock modal */}
                        <Modal isOpen={this.state.expiredStockModal}
                            className={'modal-md modalWidthExpiredStock'}>
                            <ModalHeader toggle={() => this.toggleLarge('expiredStock')} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.dashboard.expiryDetails')}</strong>
                            </ModalHeader>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <ModalBody>
                                    <span style={{ float: "right" }}><b>{i18n.t("static.supplyPlan.batchInfoNote")}</b></span>
                                    <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                        <thead>
                                            <tr>
                                                <th>{i18n.t('static.inventory.batchNumber')}</th>
                                                <th>{i18n.t('static.report.createdDate')}</th>
                                                <th>{i18n.t('static.inventory.expireDate')}</th>
                                                <th>{i18n.t('static.supplyPlan.qatGenerated')}</th>
                                                <th>{i18n.t('static.supplyPlan.expiredQty')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.expiredStockDetails.map(item => (
                                                    <tr>
                                                        <td className="hoverTd" onClick={() => this.showShipmentWithBatch(item.batchNo, item.expiryDate)}>{item.batchNo}</td>
                                                        <td>{moment(item.createdDate).format(DATE_FORMAT_CAP)}</td>
                                                        <td>{moment(item.expiryDate).format(DATE_FORMAT_CAP)}</td>
                                                        <td>{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                        <td className="hoverTd" onClick={() => this.showBatchLedgerClicked(item.batchNo, item.createdDate, item.expiryDate)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.expiredQty} /></td>
                                                    </tr>
                                                )
                                                )
                                            }
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th colSpan="4">{i18n.t('static.supplyPlan.total')}</th>
                                                <th><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.expiredStockDetailsTotal} /></th>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                    {this.state.ledgerForBatch.length > 0 &&
                                        <>
                                            <br></br>
                                            {i18n.t("static.inventory.batchNumber") + " : " + this.state.ledgerForBatch[0].batchNo}
                                            <br></br>
                                            {i18n.t("static.batchLedger.note")}
                                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "60px" }} rowSpan="2" align="center">{i18n.t("static.common.month")}</th>
                                                        <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.openingBalance")}</th>
                                                        <th colSpan="3" align="center">{i18n.t("static.supplyPlan.userEnteredBatches")}</th>
                                                        <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.autoAllocated") + " (+/-)"}</th>
                                                        <th rowSpan="2" align="center">{i18n.t("static.report.closingbalance")}</th>
                                                    </tr>
                                                    <tr>
                                                        <th align="center">{i18n.t("static.supplyPlan.consumption") + " (-)"}</th>
                                                        <th align="center">{i18n.t("static.inventoryType.adjustment") + " (+/-)"}</th>
                                                        <th align="center">{i18n.t("static.shipment.shipment") + " (+)"}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        ((moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiryDate).format("YYYY-MM") == moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].transDate).format("YYYY-MM")) ? this.state.ledgerForBatch.slice(0, -1) : this.state.ledgerForBatch).map(item => (
                                                            <tr>
                                                                <td>{moment(item.transDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</td>
                                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.openingBalance} /></td>
                                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.consumptionQty} /></td>
                                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentQty} /></td>
                                                                <td>{item.shipmentQty == 0 ? null : <NumberFormat displayType={'text'} thousandSeparator={true} value={item.shipmentQty} />}</td>
                                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={0 - Number(item.unallocatedQty)} /></td>
                                                                {item.stockQty != null && Number(item.stockQty) > 0 ? <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></b></td> : <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></td>}
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td align="right" colSpan="6"><b>{i18n.t("static.supplyPlan.expiry")}</b></td>
                                                        <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiredQty} /></b></td>
                                                    </tr>
                                                </tfoot>
                                            </Table>
                                        </>
                                    }
                                </ModalBody>
                                <ModalFooter>
                                    <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledExpiredStock()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {/* problem trans modal */}
                        <Modal isOpen={this.state.transView}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleTransModal()} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.problemContext.transDetails')}</strong>
                            </ModalHeader>

                            <ModalBody>
                                <br></br>
                                <br></br>
                                <div className="RemoveStriped qat-problemListSearch">
                                    <div id="problemTransDiv" className="" />
                                </div>

                                {/* <ToolkitProvider
                                    keyField="problemReportId"
                                    data={this.state.problemTransList}
                                    columns={columns}
                                    search={{ searchFormatted: true }}
                                    hover
                                    filter={filterFactory()}
                                >
                                    {
                                        props => (
                                            <div className="col-md-12 bg-white pb-1 mb-2">
                                                <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active" >
                                                  
                                                </a></li></ul>
                                                <div className="TableCust">
                                                    <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">

                                                        <SearchBar {...props.searchProps} />
                                                        <ClearSearchButton {...props.searchProps} />
                                                    </div>
                                                    <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                        pagination={paginationFactory(options)}
                                                        rowEvents={{
                                                            onClick: (e, row, rowIndex) => {
                                                                this.editProblem(row);
                                                            }
                                                        }}
                                                        {...props.baseProps}
                                                    />


                                                </div>
                                            </div>
                                        )
                                    }
                                </ToolkitProvider> */}

                            </ModalBody>
                            {/* <ModalFooter>
                            </ModalFooter> */}
                        </Modal>
                        {/* problem trans modal */}
                        <Modal isOpen={this.state.isModalOpen}
                            className={'modal-lg ' + this.props.className}>
                            <ModalHeader>
                                <strong>{i18n.t('static.dashboard.add.problem')}</strong>
                                <Button size="md" onClick={this.modelOpenClose} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                            </ModalHeader>
                            <ModalBody className='pb-lg-0'>
                                {/* <h6 className="red" id="div3"></h6> */}
                                <Col sm={12} style={{ flexBasis: 'auto' }}>
                                    {/* <Card> */}
                                    <Formik
                                        initialValues={{
                                            problemDescription: '',
                                            modelPlanningUnitId: '',
                                            modelCriticalityId: '',
                                            suggession: ''
                                        }}
                                        validate={validateForAddingProblem(validationSchemaForAddingProblem)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            // console.log("inside for prolem report changes if", this.state.problemReportChanged)

                                            // if (!this.state.isSubmitClicked) {
                                            var criticalityId = (document.getElementById("modelCriticalityId").value)
                                            var regionId = (document.getElementById("modelRegionId").value);
                                            var modelPlanningUnitId = (document.getElementById("modelPlanningUnitId").value);
                                            var problemDescription = (document.getElementById("problemDescription").value);
                                            var suggession = (document.getElementById("suggession").value);

                                            if (this.state.problemReportChanged) {
                                                this.setState({
                                                    isModalOpen: !this.state.isModalOpen,
                                                })
                                                confirmAlert({
                                                    message: 'There is some review changes in table, if you wish to add Manual problem than you will lose all review changes. Are you sure you want to add this manual problem ?',
                                                    buttons: [
                                                        {
                                                            label: i18n.t('static.program.yes'),
                                                            onClick: () => {
                                                                this.setState({ loading: true, isSubmitClicked: true }, () => {
                                                                    // console.log("criticalityId", criticalityId)
                                                                    this.submitManualProblem(criticalityId, regionId, modelPlanningUnitId, problemDescription, suggession);
                                                                })
                                                            }
                                                        },
                                                        {
                                                            label: i18n.t('static.program.no'),
                                                            onClick: () => {
                                                                this.setState({
                                                                    // problemReportChanged: !this.state.problemReportChanged,
                                                                    isSubmitClicked: true
                                                                })
                                                                // 
                                                            }
                                                        }
                                                    ]
                                                });
                                            } else {
                                                this.setState({ loading: true, isSubmitClicked: true, isModalOpen: !this.state.isModalOpen }, () => {
                                                    this.submitManualProblem(criticalityId, regionId, modelPlanningUnitId, problemDescription, suggession);

                                                })
                                            }
                                            // this.setState({
                                            //     problemReportChanged: !this.state.problemReportChanged,
                                            //     // isSubmitClicked: true
                                            // })
                                            // this.toggle(0, '2');
                                            // }

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
                                                setTouched,
                                                handleReset,
                                                setFieldValue,
                                                setFieldTouched
                                            }) => (
                                                <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='addProblemForm' autocomplete="off">
                                                    {/* <CardBody> */}
                                                    <div className="col-md-12">
                                                        <div style={{ display: this.state.treeFlag ? "none" : "block" }} className="">
                                                            <div className='row'>
                                                                <FormGroup className="col-md-6">
                                                                    <Label for="programCode">{i18n.t('static.planningunit.planningunit')}<span className="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="modelPlanningUnitId"
                                                                        id="modelPlanningUnitId"
                                                                        bsSize="sm"
                                                                        valid={!errors.modelPlanningUnitId}
                                                                        invalid={touched.modelPlanningUnitId && !!errors.modelPlanningUnitId}
                                                                        onChange={(e) => { handleChange(e) }}
                                                                        onBlur={handleBlur}
                                                                        required
                                                                    >
                                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                                        {planningUnitList}
                                                                    </Input>
                                                                    <FormFeedback className="red">{errors.modelPlanningUnitId}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-6">
                                                                    <Label>{i18n.t('static.report.Criticality')}<span className="red Reqasterisk">*</span></Label>
                                                                    <Input type="select"
                                                                        bsSize="sm"
                                                                        name="modelCriticalityId"
                                                                        id="modelCriticalityId"
                                                                        valid={!errors.modelCriticalityId}
                                                                        invalid={touched.modelCriticalityId && !!errors.modelCriticalityId}
                                                                        onChange={(e) => { handleChange(e) }}
                                                                        onBlur={handleBlur}
                                                                        required
                                                                    >
                                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                                        {criticalities}
                                                                    </Input>
                                                                    <FormFeedback className="red">{errors.modelCriticalityId}</FormFeedback>
                                                                </FormGroup>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <FormGroup className="col-md-6">
                                                                <Label>{i18n.t('static.region.region')}</Label>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    name="modelRegionId"
                                                                    id="modelRegionId"

                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {regions}
                                                                </Input>
                                                                <FormFeedback className="red">{errors.modelRegionId}</FormFeedback>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-6">
                                                                <Label>{i18n.t('static.report.problemDescription')}<span className="red Reqasterisk">*</span></Label>
                                                                <Input type="text"
                                                                    // maxLength={600}
                                                                    bsSize="sm"
                                                                    name="problemDescription"
                                                                    id="problemDescription"
                                                                    valid={!errors.problemDescription}
                                                                    invalid={touched.problemDescription && !!errors.problemDescription}
                                                                    onChange={(e) => { handleChange(e) }}
                                                                    onBlur={handleBlur}
                                                                    required
                                                                >
                                                                </Input>
                                                                <FormFeedback className="red">{errors.problemDescription}</FormFeedback>
                                                            </FormGroup>

                                                            {/* <FormGroup className="col-md-6">
                                                                    <Label>{i18n.t('static.common.notes')}</Label>
                                                                    <Input type="textarea"
                                                                        // maxLength={600}
                                                                        bsSize="sm"
                                                                        name="notes"
                                                                        id="notes"
                                                                    // valid={!errors.problemId}
                                                                    // invalid={touched.problemId && !!errors.problemId}
                                                                    // onChange={(e) => { handleChange(e) }}
                                                                    // onBlur={handleBlur}
                                                                    // required
                                                                    >
                                                                    </Input>
                                                                </FormGroup> */}
                                                        </div>
                                                        <div className='row'>
                                                            <FormGroup className="col-md-6">
                                                                <Label>{i18n.t('static.report.suggession')}<span className="red Reqasterisk">*</span></Label>
                                                                <Input type="textarea"
                                                                    // maxLength={600}
                                                                    bsSize="sm"
                                                                    name="suggession"
                                                                    id="suggession"
                                                                    valid={!errors.suggession}
                                                                    invalid={touched.suggession && !!errors.suggession}
                                                                    onChange={(e) => { handleChange(e) }}
                                                                    onBlur={handleBlur}
                                                                    required
                                                                >
                                                                </Input>
                                                                <FormFeedback className="red">{errors.suggession}</FormFeedback>
                                                            </FormGroup>
                                                        </div>


                                                        <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
                                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                            <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClickedModal}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                            &nbsp;
                                                        </FormGroup>
                                                    </div>
                                                </Form>
                                            )} />
                                </Col>
                                <br />
                            </ModalBody>
                        </Modal>

                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                programId: this.props.match.params.programId,
                                versionId: this.props.match.params.versionId,
                                versionStatusId: this.state.program.currentVersion.versionStatus.id,
                                versionNotes: this.state.program.currentVersion.notes
                            }}
                            validate={validate(validationSchema)}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                document.getElementById("submitButton").disabled = true;
                                var elInstance = this.state.problemEl;
                                var json = elInstance.getJson();
                                // console.log("problemList===>", json);
                                // console.log("program===>", this.state.program);
                                var reviewedProblemList = [];
                                var isAllCheckForReviewed = true;
                                for (var i = 0; i < json.length; i++) {
                                    var map = new Map(Object.entries(json[i]));

                                    if (map.get("22") == 1) {
                                        reviewedProblemList.push({
                                            problemReportId: map.get("0"),
                                            problemStatus: {
                                                id: map.get("10")
                                            },
                                            reviewed: map.get("20"),
                                            notes: map.get("21")
                                        });
                                    }
                                    if (map.get("20") == false && map.get("12") != 4) {
                                        isAllCheckForReviewed = false
                                    }
                                    // if (map.get("20") == 1) {
                                    //     reviewedProblemList.push({
                                    //         problemReportId: map.get("0"),
                                    //         problemStatus: {
                                    //             id: map.get("10")
                                    //         },
                                    //         reviewed: map.get("18"),
                                    //         notes: map.get("19")
                                    //     });
                                    // }
                                    // if (map.get("18") == false && map.get("12") != 4) {
                                    //     isAllCheckForReviewed = false
                                    // }
                                }
                                // console.log("D--------------->reviewedProblemList------------->", reviewedProblemList);
                                if ((isAllCheckForReviewed == true && this.state.program.currentVersion.versionStatus.id == 2) || (this.state.program.currentVersion.versionStatus.id != 2)) {

                                    // console.log("reviewedProblemList===>", reviewedProblemList);
                                    ProgramService.updateProgramStatus(this.state.program, reviewedProblemList)
                                        .then(response => {
                                            if(this.state.program.currentVersion.versionStatus.id!=1){
                                                // console.log("messageCode", response)
                                                this.props.history.push(`/report/supplyPlanVersionAndReview/` + 'green/' + i18n.t("static.message.supplyplanversionapprovedsuccess"))
                                            }else{
                                                document.getElementById("submitButton").disabled = false;
                                            this.setState({
                                                submitMessage: "static.message.supplyplanversionapprovedsuccess",
                                                submitColor: "green",
                                                problemReportChanged: 0,
                                                remainingDataChanged:0

                                                // isModalOpen: !this.state.isModalOpen,
                                            }, () => {
                                                this.hideMessageComponent()
                                                this.componentDidMount();
                                            })
                                        }

                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        // message: 'static.unkownError',
                                                        submitMessage: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                        submitColor: "red",
                                                        loading: false
                                                    }, () => {
                                                        this.hideMessageComponent()
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
                                                                submitMessage: error.response.data.messageCode,
                                                                submitColor: "red",
                                                                loading: false
                                                            }, () => {
                                                                this.hideMessageComponent()
                                                            });
                                                            break;
                                                        case 412:
                                                            this.setState({
                                                                submitMessage: error.response.data.messageCode,
                                                                submitColor: "red",
                                                                loading: false
                                                            }, () => {
                                                                this.hideMessageComponent()
                                                            });
                                                            break;
                                                        default:
                                                            this.setState({
                                                                submitMessage: 'static.unkownError',
                                                                submitColor: "red",
                                                                loading: false
                                                            }, () => {
                                                                this.hideMessageComponent()
                                                            });
                                                            break;
                                                    }
                                                }
                                            }
                                        );
                                } else {
                                    document.getElementById("submitButton").disabled = false;
                                    alert("To approve a supply plan – Reviewed must all be checked.");
                                }

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
                                    <Form onSubmit={handleSubmit} noValidate name='supplyplanForm'>
                                        <CardBody className="pt-lg-0">
                                            <Col md="12 pl-0">
                                                <div className="row">

                                                    {/*  <FormGroup className="tab-ml-1">
                                                        <Label for="programName">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Input type="text"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            valid={!errors.programId}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.program.label.label_en}
                                                            disabled />
                                                        <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                    </FormGroup> */}
                                                    <FormGroup className="col-md-3">

                                                        <Label htmlFor="versionNotes">{i18n.t('static.program.notes')}</Label>

                                                        <Input
                                                            type="textarea"
                                                            maxLength={65535}
                                                            name="versionNotes"
                                                            id="versionNotes"
                                                            value={this.state.program.currentVersion.notes}
                                                            bsSize="sm"
                                                            valid={!errors.versionNotes}
                                                            invalid={touched.versionNotes && !!errors.versionNotes || this.state.program.currentVersion.versionStatus.id == 3 ? this.state.program.currentVersion.notes == '' : false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            readOnly={!this.state.editable}
                                                            required
                                                        />
                                                        <FormFeedback className="red">{errors.versionNotes}</FormFeedback>

                                                    </FormGroup>

                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="versionStatusId">{i18n.t('static.common.status')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Input
                                                            type="select"
                                                            name="versionStatusId"
                                                            id="versionStatusId"
                                                            bsSize="sm"
                                                            valid={!errors.versionStatusId}
                                                            invalid={touched.versionStatusId && !!errors.versionStatusId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.program.currentVersion.versionStatus.id}
                                                            disabled={!this.state.editable}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {statusList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.versionStatusId}</FormFeedback>
                                                    </FormGroup>
                                                    <Input
                                                        type="hidden"
                                                        name="needNotesValidation"
                                                        id="needNotesValidation"
                                                        value={(this.state.program.currentVersion.versionStatus.id == 3 ? true : false)}
                                                    />
                                                </div>
                                            </Col>
                                        </CardBody>
                                        <CardFooter>
                                            <FormGroup>
                                                {this.state.editable && (this.state.problemReportChanged==1 || this.state.remainingDataChanged==1) && <Button type="submit" size="md" color="success" id="submitButton" className="float-left mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>}
                                                {this.state.editable && (this.state.problemReportChanged==1 || this.state.remainingDataChanged==1) && <Button type="button" size="md" color="warning" className="float-left mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i>{i18n.t('static.common.reset')}</Button>}
                                                <Button type="button" size="md" color="danger" className="float-left mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>

                                                &nbsp;
                                            </FormGroup>
                                        </CardFooter>
                                    </Form>
                                )} />
                    </Card>

                </Col>

            </div >
        );

    }

    showBatchLedgerClicked(batchNo, createdDate, expiryDate) {
        this.setState({ loading: true })
        var supplyPlanForAllDate = this.state.supplyPlanDataForAllTransDate.filter(c => moment(c.transDate).format("YYYY-MM") >= moment(createdDate).format("YYYY-MM") && moment(c.transDate).format("YYYY-MM") <= moment(expiryDate).format("YYYY-MM"));
        var allBatchLedger = [];
        supplyPlanForAllDate.map(c =>
            c.batchDetails.map(bd => {
                var batchInfo = bd;
                batchInfo.transDate = c.transDate;
                allBatchLedger.push(batchInfo);
            }));
        var ledgerForBatch = allBatchLedger.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
        this.setState({
            ledgerForBatch: ledgerForBatch,
            loading: false
        })
        // console.log("ledgerForBatch+++", ledgerForBatch)
    }

    showShipmentWithBatch(batchNo, expiryDate) {
        var shipmentList = this.state.allShipmentsList;
        shipmentList.map((sl, count) => {
            var batchInfoList = sl.batchInfoList;
            var bi = batchInfoList.filter(c => c.batch.batchNo == batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
            if (bi.length > 0) {
                var shipmentStatus = sl.shipmentStatus.id;
                var index = count;
                this.setState({
                    indexOfShipmentContainingBatch: index
                })
                var date = "";
                if (shipmentStatus == DELIVERED_SHIPMENT_STATUS && sl.receivedDate != "" && sl.receivedDate != null && sl.receivedDate != undefined && sl.receivedDate != "Invalid date") {
                    date = moment(sl.receivedDate).format("YYYY-MM-DD");
                } else {
                    date = moment(sl.expectedDeliveryDate).format("YYYY-MM-DD");
                }
                var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                const monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN - 2;
                this.setState({
                    monthCount: monthDifference
                }, () => {
                    this.toggleLarge('shipments', '', '', moment(date).startOf('month').format("YYYY-MM-DD"), moment(date).endOf('month').format("YYYY-MM-DD"), ``, 'allShipments');
                })
            }
        })
    }

    cancelClicked = () => {
        var cont = false;
        if (this.state.problemReportChanged == 1 || this.state.remainingDataChanged==1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.props.history.push(`/report/supplyPlanVersionAndReview/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
        }
    }
    resetClicked = () => {
        var cont = false;
        if (this.state.problemReportChanged == 1 || this.state.remainingDataChanged==1) {
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
                problemReportChanged:0,
                remainingDataChanged:0
            },()=>{
                this.componentDidMount();
            })
        }
    }

    resetClickedModal=()=>{

    }

    updateState(parameterName, value) {
        // console.log("in update state")
        this.setState({
            [parameterName]: value
        })
    }
}

export default EditSupplyPlanStatus