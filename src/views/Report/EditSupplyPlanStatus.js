import React, { Component, lazy } from 'react';
import ProgramService from '../../api/ProgramService';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Input, Table, InputGroup } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import NumberFormat from 'react-number-format';
import moment from "moment";
import { Bar, Line, Pie } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import Select from 'react-select';
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN, MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS, PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DEFAULT_MAX_MONTHS_OF_STOCK, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INVENTORY_DATA_SOURCE_TYPE, SHIPMENT_DATA_SOURCE_TYPE, QAT_DATA_SOURCE_ID, FIRST_DATA_ENTRY_DATE } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import jexcel from 'jexcel';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import "../../../node_modules/jexcel/dist/jexcel.css";
const entityname = i18n.t('static.program.program');
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

const validationSchema = function (values) {
    return Yup.object().shape({
        programId: Yup.string()
            .required(i18n.t('static.budget.budgetamountdesc')),
        versionStatusId: Yup.number().typeError(i18n.t('static.program.validstatus'))
            .required(i18n.t('static.program.validstatus')).min(0, i18n.t('static.program.validstatus')),
        // startDate: Yup.string()
        //     .required(i18n.t('static.budget.startdatetext')),
        // stopDate: Yup.string()
        //     .required(i18n.t('static.budget.stopdatetext'))
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


class EditSupplyPlanStatus extends Component {
    constructor(props) {
        super(props);

        this.state = {
            monthsArray: [],
            programList: [],
            planningUnits: [],
            procurementAgentPlanningUnits: [],
            planningUnitName: [],
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
            dataSourceListAll:[],

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
                    }
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
                regionList: []
            },
            statuses: [],
            regionList: []
        }


    }

    getMonthArray(currentDate) {
        var month = [];
        var curDate = currentDate.subtract(MONTHS_IN_PAST_FOR_SUPPLY_PLAN, 'months');
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        for (var i = 1; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        }
        this.setState({
            monthsArray: month
        })
        return month;
    }

    toggleLarge = (supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder, shipmentType) => {
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
            noFundsBudgetError: ''

        })
        if (supplyPlanType == 'Consumption') {
            var monthCountConsumption = this.state.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption,
            });
            this.formSubmit(monthCountConsumption);
        } else if (supplyPlanType == 'SuggestedShipments') {
            this.setState({
                suggestedShipments: !this.state.suggestedShipments,
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
            this.formSubmit(monthCountAdjustments);
        }
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
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption)
    }

    rightClickedConsumption = () => {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption);
    }

    leftClickedAdjustments = () => {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments)
    }

    rightClickedAdjustments = () => {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments);
    }
    consumptionDetailsClicked = (startDate, endDate, region, actualFlag, month) => {
        console.log('region', region)
        if (this.state.consumptionChangedFlag == 0) {
            var elInstance = this.state.consumptionBatchInfoTableEl;
            if (elInstance != undefined && elInstance != "") {
                elInstance.destroy();
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || c.dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE);
            var dataSourceList = [];
            for (var k = 0; k < dataSourceListAll.length; k++) {
                var dataSourceJson = {
                    name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                    id: dataSourceListAll[k].dataSourceId
                }
                dataSourceList.push(dataSourceJson);
            }
            console.log('dataSourceList',dataSourceList)
            var myVar = '';

            var programJson = this.state.program
            var batchList = []
            var batchInfoList = programJson.batchInfoList;
            for (var k = 0; k < batchInfoList.length; k++) {
                if (batchInfoList[k].expiryDate >= startDate && batchInfoList[k].createdDate <= startDate) {
                    var batchJson = {
                        name: batchInfoList[k].batchNo,
                        id: batchInfoList[k].batchId
                    }
                    batchList.push(batchJson);
                }
            }
            this.setState({
                batchInfoList: batchList,
                batchInfoListAllForConsumption: batchInfoList
            })
            var consumptionListUnFiltered = (programJson.consumptionList);
            this.setState({
                consumptionListUnFiltered: consumptionListUnFiltered,
                inventoryListUnFiltered: programJson.inventoryList
            })
            var consumptionList = consumptionListUnFiltered.filter(con =>
                con.planningUnit.id == planningUnitId
                && con.region.id == region
                && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
            this.el = jexcel(document.getElementById("consumptionDetailsTable"), '');
            this.el.destroy();
            var data = [];
            var consumptionDataArr = []
            console.log('*consumptionList', consumptionList)
            for (var j = 0; j < consumptionList.length; j++) {
                data = [];
                data[0] = month;
                data[1] = consumptionList[j].region.id;
                data[2] = consumptionList[j].dataSource.id;
                data[3] = consumptionList[j].consumptionQty;
                data[4] = consumptionList[j].dayOfStockOut;
                if (consumptionList[j].notes === null || ((consumptionList[j].notes).trim() == "NULL")) {
                    data[5] = "";
                } else {
                    data[5] = consumptionList[j].notes;
                }
                data[6] = consumptionListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && c.consumptionDate == consumptionList[j].consumptionDate && c.actualFlag.toString() == consumptionList[j].actualFlag.toString());
                data[7] = startDate;
                data[8] = consumptionList[j].actualFlag;
                data[9] = consumptionList[j].active;
                data[10] = consumptionList[j].batchInfoList;
                consumptionDataArr[j] = data;
            }
            if (consumptionList.length == 0) {
                data = [];
                data[0] = month;
                data[1] = region;
                data[2] = "";
                data[3] = "";
                data[4] = "";
                data[5] = "";
                data[6] = -1;
                data[7] = startDate;
                data[8] = "";
                data[9] = true;
                data[10] = [];
                consumptionDataArr[0] = data;
            }
            var options = {
                data: consumptionDataArr,
                colWidths: [80, 150, 200, 80, 80, 350],
                columns: [
                    { type: 'text', readOnly: true, title: i18n.t('static.report.month') },
                    { type: 'dropdown', readOnly: true, source: this.state.regionList, title: i18n.t('static.region.region') },
                    { type: 'dropdown', source: dataSourceList, title: i18n.t('static.inventory.dataSource') },
                    { type: 'numeric', title: i18n.t('static.consumption.consumptionqty') },
                    { type: 'numeric', title: i18n.t('static.consumption.daysofstockout') },
                    { type: 'text', title: i18n.t('static.program.notes') },
                    { type: 'hidden', title: i18n.t('static.supplyPlan.index') },
                    { type: 'hidden', title: i18n.t('static.report.consumptionDate') },
                    { type: 'checkbox', title: i18n.t('static.consumption.actualflag') },
                    { type: 'checkbox', title: i18n.t('static.common.active') },
                    { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo') }
                ],
                pagination: false,
                search: false,
                columnSorting: true,
                tableOverflow: true,
                wordWrap: true,
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
                allowManualInsertRow: false,
                editable: false,
                allowInsertRow: false,
                text: {
                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                    show: '',
                    entries: '',
                },
                onload: this.loadedConsumption,
                updateTable: function (el, cell, x, y, source, value, id) {
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);
                    var batchInfo = rowData[10];
                    if (batchInfo != "") {
                        var cell = elInstance.getCell(`D${y + 1}`)
                        cell.classList.add('readonly');
                    }
                }
            };
            myVar = jexcel(document.getElementById("consumptionDetailsTable"), options);
            this.el = myVar;
            this.setState({
                consumptionEl: myVar
            })

        } else {
            this.setState({
                consumptionError: i18n.t('static.supplyPlan.saveDataFirst')
            })
        }
    }

    loadedConsumption = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }

    loadedBatchInfoConsumption = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    adjustmentsDetailsClicked(region, month, endDate) {
        if (this.state.inventoryChangedFlag == 0) {
            var elInstance = this.state.inventoryBatchInfoTableEl;
            if (elInstance != undefined && elInstance != "") {
                elInstance.destroy();
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var db1;
            var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE);
            var dataSourceList = [];
            for (var k = 0; k < dataSourceListAll.length; k++) {
                var dataSourceJson = {
                    name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                    id: dataSourceListAll[k].dataSourceId
                }
                dataSourceList.push(dataSourceJson);
            }
            console.log('dataSourceList adj'+dataSourceList)
             var countrySKUList = [];
            var countrySKUListAll = [];
            var myVar = '';
            var programJson = this.state.program;
            var batchList = []
            var batchInfoList = programJson.batchInfoList;
            for (var k = 0; k < batchInfoList.length; k++) {
                if (batchInfoList[k].expiryDate >= moment(endDate).startOf("month").format("YYYY-MM-DD") && batchInfoList[k].createdDate <= moment(endDate).startOf("month").format("YYYY-MM-DD")) {
                    var batchJson = {
                        name: batchInfoList[k].batchNo,
                        id: batchInfoList[k].batchId
                    }
                    batchList.push(batchJson);
                }
            }
            this.setState({
                batchInfoList: batchList,
                batchInfoListAllForInventory: batchInfoList
            })
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;

                var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                var countrySKURequest = countrySKUOs.getAll();
                countrySKURequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                countrySKURequest.onsuccess = function (event) {
                    var countrySKUResult = [];
                    countrySKUResult = countrySKURequest.result;
                    for (var k = 0; k < countrySKUResult.length; k++) {
                        if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId) {
                            var countrySKUJson = {
                                name: getLabelText(countrySKUResult[k].label, this.state.lang),
                                id: countrySKUResult[k].realmCountryPlanningUnitId
                            }

                            countrySKUList.push(countrySKUJson);
                            countrySKUListAll.push(countrySKUResult[k]);
                        }
                    }
                    this.setState({
                        countrySKUListAll: countrySKUListAll
                    })
                    var inventoryListUnFiltered = (programJson.inventoryList)
                    this.setState({
                        inventoryListUnFiltered: inventoryListUnFiltered
                    })
                    var inventoryList = (programJson.inventoryList).filter(c =>
                        c.planningUnit.id == planningUnitId &&
                        c.region.id == region &&
                        moment(c.inventoryDate).format("MMM YY") == month);
                    this.el = jexcel(document.getElementById("adjustmentsTable"), '');
                    this.el.destroy();
                    var data = [];
                    var inventoryDataArr = [];
                    var readonlyCountrySKU = true;
                    console.log('inventoryList', inventoryList)
                    for (var j = 0; j < inventoryList.length; j++) {
                        var expectedBal = "";
                            if (inventoryList[j].adjustmentQty != "" && inventoryList[j].actualQty != "" && inventoryList[j].adjustmentQty != null && inventoryList[j].actualQty != null) {
                                expectedBal = parseInt(inventoryList[j].actualQty) - parseInt(inventoryList[j].adjustmentQty);
                            }
                            var readonlyCountrySKU = true;
                            var adjustmentType = "1";
                            if (inventoryList[j].actualQty == "" || inventoryList[j].actualQty == 0) {
                                adjustmentType = "2"
                            }
                            var readonlyAdjustmentType = "";
                            if (inventoryList[j].batchInfoList.length != 0) {
                                readonlyAdjustmentType = true
                            } else {
                                readonlyAdjustmentType = false
                            }

                            data = [];
                            data[0] = month; //A
                            data[1] = inventoryList[j].region.id; //B
                            data[2] = inventoryList[j].dataSource.id; //C
                            data[3] = inventoryList[j].realmCountryPlanningUnit.id; //D
                            data[4] = inventoryList[j].multiplier; //E
                            // data[5] = adjustmentType;

                            data[5] = adjustmentType; //F
                            data[6] = ``; //G
                            data[7] = inventoryList[j].adjustmentQty; //H
                            data[8] = `=E${parseInt(j) + 1}*H${parseInt(j) + 1}`; //I
                            data[9] = inventoryList[j].actualQty; //J
                            data[10] = `=E${parseInt(j) + 1}*J${parseInt(j) + 1}`;

                            if (inventoryList[j].notes === null || ((inventoryList[j].notes).trim() == "NULL")) {
                                data[11] = "";
                            } else {
                                data[11] = inventoryList[j].notes;
                            }
                            data[12] = inventoryListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && moment(c.inventoryDate).format("MMM YY") == month && c.inventoryDate == inventoryList[j].inventoryDate && c.realmCountryPlanningUnit.id == inventoryList[j].realmCountryPlanningUnit.id);
                            data[13] = inventoryList[j].active;
                            data[14] = endDate;
                            data[15] = inventoryList[j].batchInfoList;
                            inventoryDataArr[j] = data;
                        }
                        if (inventoryList.length == 0) {
                            var readonlyCountrySKU = false;
                            // var openingBalance = (this.state.openingBalanceRegionWise.filter(c => c.month.month == month && c.region.id == region)[0]).balance;
                            // var consumptionQty = (this.state.consumptionFilteredArray.filter(c => c.month.month == month && c.region.id == region)[0]).consumptionQty;
                            // var expectedBalPlanningUnitQty = (openingBalance - consumptionQty);
                            data = [];
                            data[0] = month;
                            data[1] = region;
                            data[2] = "";
                            data[3] = "";
                            data[4] = "";
                            data[5] = "";
                            data[6] = ``;
                            data[7] = "";
                            data[8] = `=E1*H1`;
                            data[9] = "";
                            data[10] = `=E1*J1`;
                            data[11] = "";
                            data[12] = -1;
                            data[13] = true;
                            data[14] = endDate;
                            data[15] = [];
                            inventoryDataArr[0] = data;
                        }
                        var options = {
                            data: inventoryDataArr,
                            columnDrag: true,
                            colWidths: [80, 100, 100, 150, 10, 100, 10, 80, 10, 80, 10, 200, 10, 50, 10, 10],
                            columns: [
                                { title: i18n.t('static.report.month'), type: 'text', readOnly: true },
                                { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: true, source: this.state.regionList },
                                { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList },
                                { title: i18n.t('static.planningunit.countrysku'), type: 'dropdown', source: countrySKUList, readOnly: readonlyCountrySKU },
                                { title: i18n.t('static.supplyPlan.conversionUnits'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: readonlyAdjustmentType },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.inventory.manualAdjustment'), type: 'numeric', mask: '[-]#,##' },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.inventory.actualStock'), type: 'numeric', mask: '#,##' },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.program.notes'), type: 'text' },
                                { title: i18n.t('static.supplyPlan.index'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.inventory.active'), type: 'checkbox' },
                                { title: i18n.t('static.inventory.inventoryDate'), type: 'hidden' },
                                { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo') }
                            ],
                            pagination: false,
                            search: false,
                            columnSorting: true,
                            tableOverflow: true,
                            wordWrap: true,
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            allowDeleteRow: false,
                            // allowInsertRow: false,
                            allowManualInsertRow: false,
                            onchange: this.inventoryChanged,
                            oneditionend: this.inventoryOnedit,
                            text: {
                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                show: '',
                                entries: '',
                            },
                            onload: this.loadedInventory,
                            updateTable: function (el, cell, x, y, source, value, id) {
                                var elInstance = el.jexcel;
                                var rowData = elInstance.getRowData(y);
                                var batchInfo = rowData[15];
                                if (batchInfo != "") {
                                    // 7 and 9
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                } else {
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                }
                                var adjustmentType = rowData[5];
                                if (adjustmentType == 1) {
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                } else {
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                }
                            }.bind(this)
                           
                                    
                    };
                    myVar = jexcel(document.getElementById("adjustmentsTable"), options);
                    this.el = myVar;
                    this.setState({
                        inventoryEl: myVar
                    })
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                inventoryError: i18n.t('static.supplyPlan.saveDataFirst')
            })
        }
    }

    loadedInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }


    loadedBatchInfoInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    suggestedShipmentsDetailsClicked = (month, quantity, isEmergencyOrder) => {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
        var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == SHIPMENT_DATA_SOURCE_TYPE);
        var dataSourceList = [];
        for (var k = 0; k < dataSourceListAll.length; k++) {
            var dataSourceJson = {
                name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                id: dataSourceListAll[k].dataSourceId
            }
            dataSourceList.push(dataSourceJson);
        }
        var myVar = '';
        var programJson = this.state.program
        this.setState({
            shipmentListUnFiltered: programJson.shipmentList
        })

        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
            var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
            var papuRequest = papuOs.getAll();
            papuRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            papuRequest.onsuccess = function (event) {
                var papuResult = [];
                papuResult = papuRequest.result;
                for (var k = 0; k < papuResult.length; k++) {
                    if (papuResult[k].planningUnit.id == planningUnitId) {
                        var papuJson = {
                            name: getLabelText(papuResult[k].procurementAgent.label, this.state.lang),
                            id: papuResult[k].procurementAgent.id
                        }
                        procurementAgentList.push(papuJson);
                    }
                }

                var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var paOs = paTransaction.objectStore('procurementAgent');
                var paRequest = paOs.getAll();
                paRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                paRequest.onsuccess = function (event) {
                    var paResult = [];
                    paResult = paRequest.result;
                    this.setState({
                        procurementAgentListAllForLeadTimes: paResult
                    })

                    var suggestedShipmentList = [];
                    suggestedShipmentList = this.state.suggestedShipmentsTotalData.filter(c => c.month == month && c.suggestedOrderQty != "");
                    console.log('suggestedShipmentList', suggestedShipmentList)
                    this.el = jexcel(document.getElementById("suggestedShipmentsDetailsTable"), '');
                    this.el.destroy();
                    var data = [];
                    var suggestedShipmentsArr = []
                    var orderedDate = moment(Date.now()).format("YYYY-MM-DD");
                    for (var j = 0; j < suggestedShipmentList.length; j++) {
                        var readOnlySuggestedOrderQty = true;
                        data = [];
                        // data[0]= expectedDeliveryDateEnFormat;
                        data[0] = i18n.t('static.supplyPlan.suggested');
                        data[1] = this.state.planningUnitName;
                        data[2] = suggestedShipmentList[j].suggestedOrderQty;
                        data[3] = `=C${j + 1}`;
                        data[4] = "";
                        data[5] = "";
                        data[6] = suggestedShipmentList[j].shipmentMode;
                        data[7] = "";
                        data[8] = orderedDate;
                        data[9] = "";
                        data[10] = isEmergencyOrder;
                        suggestedShipmentsArr[j] = data;
                    }
                    if (suggestedShipmentList.length == 0) {
                        var readOnlySuggestedOrderQty = false;
                        data = [];
                        // data[0]= expectedDeliveryDateEnFormat;
                        data[0] = i18n.t('static.supplyPlan.suggested');
                        data[1] = this.state.planningUnitName;
                        data[2] = "";
                        data[3] = `=C1`;
                        data[4] = "";
                        data[5] = "";
                        data[6] = "";
                        data[7] = "";
                        data[8] = orderedDate;
                        data[9] = "";
                        data[10] = isEmergencyOrder;
                        suggestedShipmentsArr[0] = data;
                    }
                    var options = {
                        data: suggestedShipmentsArr,
                        colWidths: [150, 200, 80, 80, 150, 350, 150, 150, 80, 100],
                        columns: [
                            { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.shipmentStatus') },
                            { type: 'text', readOnly: true, title: i18n.t('static.planningunit.planningunit') },
                            { type: 'numeric', readOnly: readOnlySuggestedOrderQty, title: i18n.t('static.supplyPlan.suggestedOrderQty') },
                            { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty') },
                            { type: 'dropdown', source: dataSourceList, title: i18n.t('static.datasource.datasource') },
                            { type: 'dropdown', source: procurementAgentList, title: i18n.t('static.procurementagent.procurementagent') },
                            { type: 'dropdown', source: ['Sea', 'Air'], title: i18n.t('static.supplyPlan.shipmentMode') },
                            { type: 'text', title: i18n.t('static.program.notes') },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.orderDate') },
                            { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), null] }, title: i18n.t('static.supplyPlan.expectedDeliveryDate') },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.emergencyOrder') }
                        ],
                        pagination: false,
                        search: false,
                        columnSorting: true,
                        tableOverflow: true,
                        wordWrap: true,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: false,
                        allowInsertRow: false,
                        allowManualInsertRow: false,
                        editable: false,
                        text: {
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        }//,
                        // onload: this.loadedSuggestedShipements
                    };
                    myVar = jexcel(document.getElementById("suggestedShipmentsDetailsTable"), options);
                    this.el = myVar;
                    this.setState({
                        suggestedShipmentsEl: myVar
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    loadedSuggestedShipments = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }




    shipmentsDetailsClicked = (supplyPlanType, startDate, endDate) => {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var procurementAgentList = [];
        var procurementAgentListAll = [];
        var fundingSourceList = [];
        var budgetList = [];
        var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == SHIPMENT_DATA_SOURCE_TYPE);
        var dataSourceList = [];
        for (var k = 0; k < dataSourceListAll.length; k++) {
            var dataSourceJson = {
                name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                id: dataSourceListAll[k].dataSourceId
            }
            dataSourceList.push(dataSourceJson);
        }
         var shipmentStatusList = [];
        var shipmentStatusListAll = [];
        var currencyList = [];
        var currencyListAll = [];
        var procurementUnitList = [];
        var procurementUnitListAll = [];
        var supplierList = [];
        var fundingSourceList = [];
        var myVar = '';
        var db1;
        var elVar = "";
        var programJson = this.state.program;
        var airFreightPerc = programJson.airFreightPerc;
        var seaFreightPerc = programJson.seaFreightPerc;

        var batchInfoListAll = programJson.batchInfoList;
        this.setState({
            batchInfoListAll: batchInfoListAll
        })
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
            var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
            var papuRequest = papuOs.getAll();
            papuRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            papuRequest.onsuccess = function (event) {
                var papuResult = [];
                papuResult = papuRequest.result;
                for (var k = 0; k < papuResult.length; k++) {
                    if (papuResult[k].planningUnit.id == planningUnitId && papuResult[k].active == true) {
                        var papuJson = {
                            name: getLabelText(papuResult[k].procurementAgent.label, this.state.lang),
                            id: papuResult[k].procurementAgent.id
                        }
                        procurementAgentList.push(papuJson);
                        procurementAgentListAll.push(papuResult[k]);
                    }
                }

                var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                var fsOs = fsTransaction.objectStore('fundingSource');
                var fsRequest = fsOs.getAll();
                fsRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                fsRequest.onsuccess = function (event) {
                    var fsResult = [];
                    fsResult = fsRequest.result;
                    for (var k = 0; k < fsResult.length; k++) {
                        if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId && fsResult[k].active == true) {
                            var fsJson = {
                                name: getLabelText(fsResult[k].label, this.state.lang) + " - " + fsResult[k].fundingSourceCode,
                                id: fsResult[k].fundingSourceId
                            }
                            fundingSourceList.push(fsJson);
                        }
                    }



                    var procurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                    var procurementUnitOs = procurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                    var procurementUnitRequest = procurementUnitOs.getAll();
                    procurementUnitRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    procurementUnitRequest.onsuccess = function (event) {
                        var procurementUnitResult = [];
                        procurementUnitResult = (procurementUnitRequest.result).filter(c => c.active == true);
                        for (var k = 0; k < procurementUnitResult.length; k++) {
                            var procurementUnitJson = {
                                name: getLabelText(procurementUnitResult[k].procurementUnit.label, this.state.lang),
                                id: procurementUnitResult[k].procurementUnit.id
                            }
                            procurementUnitList.push(procurementUnitJson);
                            procurementUnitListAll.push(procurementUnitResult[k]);
                        }
                        this.setState({
                            procurementUnitListAll: procurementUnitListAll,
                            procurementAgentListAll: procurementAgentListAll
                        });

                        var puTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                        var puOs = puTransaction.objectStore('procurementUnit');
                        var puRequest = puOs.getAll();
                        puRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                        }.bind(this);
                        puRequest.onsuccess = function (event) {
                            var puResult = [];
                            puResult = (puRequest.result);
                            this.setState({
                                procurementListForSupplier: puResult,
                            });
                            var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                            var supplierOs = supplierTransaction.objectStore('supplier');
                            var supplierRequest = supplierOs.getAll();
                            supplierRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext')
                                })
                            }.bind(this);
                            supplierRequest.onsuccess = function (event) {
                                var supplierResult = [];
                                supplierResult = supplierRequest.result;
                                for (var k = 0; k < supplierResult.length; k++) {
                                    if (supplierResult[k].realm.id == programJson.realmCountry.realm.realmId && supplierResult[k].active == true) {
                                        var supplierJson = {
                                            name: getLabelText(supplierResult[k].label, this.state.lang),
                                            id: supplierResult[k].supplierId
                                        }
                                        supplierList.push(supplierJson);
                                    }
                                }

                                var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                                var shipmentStatusRequest = shipmentStatusOs.getAll();
                                shipmentStatusRequest.onerror = function (event) {
                                    this.setState({
                                        supplyPlanError: i18n.t('static.program.errortext')
                                    })
                                }.bind(this);
                                shipmentStatusRequest.onsuccess = function (event) {
                                    var shipmentStatusResult = [];
                                    shipmentStatusResult = shipmentStatusRequest.result;
                                    for (var k = 0; k < shipmentStatusResult.length; k++) {

                                        var shipmentStatusJson = {
                                            name: getLabelText(shipmentStatusResult[k].label, this.state.lang),
                                            id: shipmentStatusResult[k].shipmentStatusId
                                        }
                                        shipmentStatusList[k] = shipmentStatusJson
                                        shipmentStatusListAll.push(shipmentStatusResult[k])
                                    }
                                    this.setState({ shipmentStatusList: shipmentStatusListAll })

                                    var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                    var currencyOs = currencyTransaction.objectStore('currency');
                                    var currencyRequest = currencyOs.getAll();
                                    currencyRequest.onerror = function (event) {
                                        this.setState({
                                            supplyPlanError: i18n.t('static.program.errortext')
                                        })
                                    }.bind(this);
                                    currencyRequest.onsuccess = function (event) {
                                        var currencyResult = [];
                                        currencyResult = (currencyRequest.result).filter(c => c.active == true);
                                        for (var k = 0; k < currencyResult.length; k++) {

                                            var currencyJson = {
                                                name: getLabelText(currencyResult[k].label, this.state.lang),
                                                id: currencyResult[k].currencyId
                                            }
                                            currencyList.push(currencyJson);
                                            currencyListAll.push(currencyResult[k]);
                                        }

                                        var bTransaction = db1.transaction(['budget'], 'readwrite');
                                        var bOs = bTransaction.objectStore('budget');
                                        var bRequest = bOs.getAll();
                                        var budgetListAll = []
                                        bRequest.onerror = function (event) {
                                            this.setState({
                                                supplyPlanError: i18n.t('static.program.errortext')
                                            })
                                        }.bind(this);
                                        bRequest.onsuccess = function (event) {
                                            var bResult = [];
                                            bResult = bRequest.result;
                                            for (var k = 0; k < bResult.length; k++) {
                                                if (bResult[k].program.id == programJson.programId && bResult[k].active == true) {
                                                    var bJson = {
                                                        name: getLabelText(bResult[k].label, this.state.lang) + " - " + bResult[k].budgetCode,
                                                        id: bResult[k].budgetId
                                                    }
                                                    budgetList.push(bJson);
                                                    budgetListAll.push({
                                                        name: getLabelText(bResult[k].label, this.state.lang),
                                                        id: bResult[k].budgetId,
                                                        fundingSource: bResult[k].fundingSource
                                                    })
                                                }

                                            }
                                            this.setState({
                                                budgetList: budgetListAll,
                                                budgetListAll: bResult,
                                                currencyListAll: currencyListAll
                                            })

                                            var shipmentListUnFiltered = programJson.shipmentList;
                                            this.setState({
                                                shipmentListUnFiltered: shipmentListUnFiltered
                                            })
                                            var shipmentList = [];
                                            var tableEditableBasedOnSupplyPlan = true;
                                            if (supplyPlanType == 'deliveredShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'shippedShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'orderedShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'plannedShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'deliveredErpShipments') {
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            } else if (supplyPlanType == 'shippedErpShipments') {
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            } else if (supplyPlanType == 'orderedErpShipments') {
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            } else if (supplyPlanType == 'plannedErpShipments') {
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            }

                                            this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
                                            this.el.destroy();
                                            var data = [];
                                            var shipmentsArr = [];
                                            for (var i = 0; i < shipmentList.length; i++) {
                                                var moq = 0;
                                                var pricePerUnit = 0;
                                                var userQty = "";
                                                var procurementAgentPlanningUnit = {}
                                                if (shipmentList[i].procurementAgent.id != "") {
                                                    procurementAgentPlanningUnit = procurementAgentListAll.filter(p => p.procurementAgent.id == shipmentList[i].procurementAgent.id)[0];
                                                    moq = procurementAgentPlanningUnit.moq;
                                                    pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                                                    if (shipmentList[i].procurementUnit.id != 0) {
                                                        var procurementUnit = procurementUnitListAll.filter(p => p.procurementUnit.id == shipmentList[i].procurementUnit.id && p.procurementAgent.id == shipmentList[i].procurementAgent.id)[0];
                                                        if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                                                            pricePerUnit = procurementUnit.vendorPrice;
                                                        }
                                                    }

                                                    if (procurementAgentPlanningUnit.unitsPerPallet != 0 && procurementAgentPlanningUnit.unitsPerContainer != 0) {
                                                        userQty = shipmentList[i].shipmentQty;
                                                    }
                                                }
                                                var totalShipmentQty = 0;

                                                var shipmentBatchInfoList = shipmentList[i].batchInfoList;
                                                for (var sb = 0; sb < shipmentBatchInfoList.length; sb++) {
                                                    totalShipmentQty += parseInt(shipmentBatchInfoList[sb].shipmentQty);
                                                }

                                                var orderNo = shipmentList[i].orderNo;
                                                var primeLineNo = shipmentList[i].primeLineNo;
                                                var orderNoAndPrimeLineNo = "";
                                                if (orderNo != null && orderNo != "") {
                                                    orderNoAndPrimeLineNo = orderNo;
                                                }
                                                if (primeLineNo != null && primeLineNo != "") {
                                                    orderNoAndPrimeLineNo = orderNoAndPrimeLineNo.concat("~").concat(primeLineNo);
                                                }

                                                var shipmentMode = 1;
                                                if (shipmentList[i].shipmentMode == "Air") {
                                                    shipmentMode = 2;
                                                }
                                                // budgetAmount = budgetAmount.toFixed(2);
                                                data[0] = shipmentList[i].expectedDeliveryDate; // A
                                                data[1] = shipmentList[i].shipmentStatus.id; //B
                                                data[2] = orderNoAndPrimeLineNo; //C
                                                data[3] = shipmentList[i].dataSource.id; // D
                                                data[4] = shipmentList[i].procurementAgent.id; //E
                                                data[5] = shipmentList[i].currency.currencyId;//F
                                                data[6] = shipmentList[i].currency.conversionRateToUsd;//G
                                                data[7] = shipmentList[i].fundingSource.id;//H
                                                data[8] = shipmentList[i].budget.id;//I
                                                data[9] = this.state.planningUnitName; //J
                                                data[10] = shipmentList[i].suggestedQty; //K
                                                data[11] = moq; //L
                                                if (shipmentList[i].procurementAgent.id != "") {
                                                    data[12] = procurementAgentPlanningUnit.unitsPerPalletEuro1;//M
                                                    data[13] = procurementAgentPlanningUnit.unitsPerPalletEuro2;//N
                                                    data[14] = procurementAgentPlanningUnit.unitsPerContainer;//O
                                                } else {
                                                    data[12] = 0;//M
                                                    data[13] = 0;//N
                                                    data[14] = 0;//O
                                                }
                                                data[15] = `=ROUND(IF(M${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/M${parseInt(i) + 1},L${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2)`;//P
                                                data[16] = `=ROUND(IF(N${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/N${parseInt(i) + 1},L${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2)`;//Q
                                                data[17] = `=ROUND(IF(O${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/O${parseInt(i) + 1},L${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2)`;//R
                                                data[18] = ""; // Order based on S
                                                data[19] = ""; // Rounding option T
                                                data[20] = userQty; // User Qty U
                                                data[21] = `=IF(S${parseInt(i) + 1}==3,

                                                            IF(T${parseInt(i) + 1}==1,
                                                                    CEILING(L${parseInt(i) + 1},1),
                                                                    FLOOR(L${parseInt(i) + 1},1)
                                                            )
                                                    ,
                                                    IF(S${parseInt(i) + 1}==4,
                                                            IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                    IF(T${parseInt(i) + 1}==1,
                                                                            CEILING(U${parseInt(i) + 1}/M${parseInt(i) + 1},1)*M${parseInt(i) + 1},
                                                                            FLOOR(U${parseInt(i) + 1}/M${parseInt(i) + 1},1)*M${parseInt(i) + 1}
                                                                    ),
                                                                    IF(T${parseInt(i) + 1}==1,
                                                                            CEILING(ROUND(IF(M${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/M${parseInt(i) + 1},L${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2),1)*M${parseInt(i) + 1},
                                                                            FLOOR(ROUND(IF(M${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/M${parseInt(i) + 1},L${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2),1)*M${parseInt(i) + 1}
                                                                    )
                                                            ),
                                                            IF(S${parseInt(i) + 1}==5,
                                                            IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                    IF(T${parseInt(i) + 1}==1,
                                                                            CEILING(U${parseInt(i) + 1}/N${parseInt(i) + 1},1)*N${parseInt(i) + 1},
                                                                            FLOOR(U${parseInt(i) + 1}/N${parseInt(i) + 1},1)*N${parseInt(i) + 1}
                                                                    ),
                                                                    IF(T${parseInt(i) + 1}==1,
                                                                            CEILING(ROUND(IF(N${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/N${parseInt(i) + 1},L${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2),1)*N${parseInt(i) + 1},
                                                                            FLOOR(ROUND(IF(N${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/N${parseInt(i) + 1},L${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2),1)*N${parseInt(i) + 1}
                                                                    )
                                                            ),
                                                            IF(S${parseInt(i) + 1}==1,
                                                                    IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                            IF(T${parseInt(i) + 1}==1,
                                                                            CEILING(U${parseInt(i) + 1}/O${parseInt(i) + 1},1)*O${parseInt(i) + 1},
                                                                            FLOOR(U${parseInt(i) + 1}/O${parseInt(i) + 1},1)*O${parseInt(i) + 1}
                                                                    ),
                                                                            IF(T${parseInt(i) + 1}==1,
                                                                                    CEILING(ROUND(IF(O${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/O${parseInt(i) + 1},L${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2),1)*O${parseInt(i) + 1},
                                                                                    FLOOR(ROUND(IF(O${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/O${parseInt(i) + 1},L${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2),1)*O${parseInt(i) + 1}
                                                                            )
                                                                    ),
                                                                    IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                            IF(T${parseInt(i) + 1}==1,
                                                                                    CEILING(U${parseInt(i) + 1},1),
                                                                                    FLOOR(U${parseInt(i) + 1},1)
                                                                            ),
                                                                            IF(T${parseInt(i) + 1}==1,
                                                                                    CEILING(K${parseInt(i) + 1},1),
                                                                                    FLOOR(K${parseInt(i) + 1},1)
                                                                            )
                                                                    )
                                                            )
                                                    )
                                                    )
                                             )`;  // V
                                                data[22] = `=ROUND(IF(M${parseInt(i) + 1}!=0,(V${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2)`; //W
                                                data[23] = `=ROUND(IF(N${parseInt(i) + 1}!=0,(V${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2)`; //X
                                                data[24] = `=ROUND(IF(O${parseInt(i) + 1}!=0,(V${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2)`; //Y
                                                data[25] = shipmentList[i].rate;//Manual price Z
                                                data[26] = shipmentList[i].procurementUnit.id; //AA
                                                data[27] = shipmentList[i].supplier.id; //AB
                                                data[28] = `=ROUND(${pricePerUnit}/G${parseInt(i) + 1},2)`; //AC
                                                data[29] = `=ROUND(IF(AND(NOT(ISBLANK(Z${parseInt(i) + 1})),(Z${parseInt(i) + 1} != 0)),Z${parseInt(i) + 1},AC${parseInt(i) + 1})*V${parseInt(i) + 1},2)`; //Amount AD
                                                data[30] = shipmentMode;//Shipment method AE
                                                data[31] = shipmentList[i].freightCost;// Freight Cost AF
                                                data[32] = `=ROUND(IF(AE${parseInt(i) + 1}==1,(AD${parseInt(i) + 1}*AK${parseInt(i) + 1})/100,(AD${parseInt(i) + 1}*AJ${parseInt(i) + 1})/100),2)`;// Default frieght cost AG
                                                data[33] = `=ROUND(AD${parseInt(i) + 1}+IF(AND(NOT(ISBLANK(AF${parseInt(i) + 1})),(AF${parseInt(i) + 1}!= 0)),AF${parseInt(i) + 1},AG${parseInt(i) + 1}),2)`; // Final Amount AE
                                                data[34] = shipmentList[i].notes;//Notes AI
                                                data[35] = airFreightPerc; //AJ
                                                data[36] = seaFreightPerc; //AK
                                                var index;
                                                if (shipmentList[i].shipmentId != 0) {
                                                    index = shipmentListUnFiltered.findIndex(c => c.shipmentId == shipmentList[i].shipmentId);
                                                } else {
                                                    index = shipmentList[i].index;
                                                }
                                                data[37] = index; // AL
                                                data[38] = shipmentList[i].shipmentStatus.id; //AM
                                                data[39] = supplyPlanType; //AN
                                                data[40] = shipmentList[i].accountFlag; //AO
                                                data[41] = shipmentList[i].emergencyOrder; //AP
                                                data[42] = shipmentList[i].active; //AQ
                                                data[43] = shipmentList[i].batchInfoList; //AR
                                                data[44] = totalShipmentQty; //AS
                                                data[45] = shipmentList[i].erpFlag; //AT
                                                shipmentsArr.push(data);
                                            }
                                            var options = {
                                                data: shipmentsArr,
                                                columns: [
                                                    { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), null] }, title: i18n.t('static.supplyPlan.expectedDeliveryDate'), width: 100 },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList, filter: this.shipmentStatusDropdownFilter, width: 100 },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.orderNoAndPrimeLineNo'), width: 150 },
                                                    { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList, width: 150 },
                                                    { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList, width: 120 },
                                                    { type: 'dropdown', readOnly: true, title: i18n.t('static.dashboard.currency'), source: currencyList, width: 120 },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.currency.conversionrateusd'), width: 80 },
                                                    { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: fundingSourceList, width: 120 },
                                                    { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: budgetList, filter: this.budgetDropdownFilter, width: 120 },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.planningunit.planningunit'), width: 150 },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.suggestedOrderQty'), mask: '#,##', width: 80 },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.moq'), mask: '#,##', width: 80 },
                                                    { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro1'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro2'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.procurementUnit.unitsPerContainer'), width: 0 },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro1'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro2'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfContainers'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.orderBasedOn'), source: [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.palletEuro1') }, { id: 5, name: i18n.t('static.supplyPlan.palletEuro2') }], width: 120, filter: this.filterOrderBasedOn },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.roundingOption'), source: [{ id: 1, name: i18n.t('static.supplyPlan.roundUp') }, { id: 2, name: i18n.t('static.supplyPlan.roundDown') }], width: 120 },
                                                    { type: 'numeric', title: i18n.t('static.supplyPlan.userQty'), width: 80, mask: '#,##' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty'), width: 80, mask: '#,##' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedPalletsEuro1'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedPalletsEuro2'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedContainers'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', title: i18n.t("static.supplyPlan.userPrice"), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'dropdown', title: i18n.t('static.procurementUnit.procurementUnit'), source: procurementUnitList, filter: this.procurementUnitDropdownFilter, width: 120 },
                                                    { type: 'dropdown', title: i18n.t('static.procurementUnit.supplier'), source: supplierList, width: 120, readOnly: true },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.amountInUSD'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], width: 100 },
                                                    { type: 'numeric', title: i18n.t('static.supplyPlan.userFreight'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.defaultFreight'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.totalAmount'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'text', title: i18n.t('static.program.notes'), width: 200 },
                                                    { type: 'hidden', title: i18n.t('static.realmcountry.airFreightPercentage'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.realmcountry.seaFreightPercentage'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentStatus'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.supplyPlanType'), width: 0 },
                                                    { type: 'checkbox', title: i18n.t('static.common.accountFlag'), width: 60 },
                                                    { type: 'checkbox', title: i18n.t('static.supplyPlan.emergencyOrder'), width: 60 },
                                                    { type: 'checkbox', title: i18n.t('static.common.active'), width: 60 },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.totalQtyBatchInfo'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.erpFlag'), width: 0 },
                                                ],
                                                pagination: false,
                                                search: false,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                allowInsertRow: false,
                                                allowManualInsertRow: false,
                                                copyCompatibility: true,
                                                editable: tableEditableBasedOnSupplyPlan,
                                                onchange: this.shipmentChanged,
                                                text: {
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loadedShipments,
                                                updateTable: function (el, cell, x, y, source, value, id) {
                                                    var elInstance = el.jexcel;
                                                    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
                                                        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
                                                        'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG',
                                                        'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ']
                                                    var rowData = elInstance.getRowData(y);
                                                    var unitsPerPalletEuro1ForUpdate = rowData[12];
                                                    var unitsPerPalletEuro2ForUpdate = rowData[13];
                                                    var unitsPerContainerForUpdate = rowData[14];
                                                    var shipmentStatus = rowData[38];
                                                    var erpFlag = rowData[45];
                                                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || erpFlag == true) {
                                                        for (var i = 0; i < colArr.length; i++) {
                                                            var cell = elInstance.getCell(`${colArr[i]}${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                        }
                                                    } else {
                                                        if (unitsPerPalletEuro1ForUpdate == 0 || unitsPerContainerForUpdate == 0) {
                                                            var cell = elInstance.getCell(`S${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`T${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`U${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                        } else {
                                                            var cell = elInstance.getCell(`S${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`T${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`U${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                        }
                                                    }
                                                }.bind(this)
                                            };
                                            myVar = jexcel(document.getElementById("shipmentsDetailsTable"), options);
                                            this.el = myVar;
                                            // submitted shipments
                                            this.setState({
                                                shipmentsEl: myVar,
                                                shipmentBudgetTableEl: elVar,
                                                shipmentChangedFlag: 0,
                                                budgetChangedFlag: 0
                                            })
                                        }.bind(this)
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    loadedShipments = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }

    loadedBudget = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
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

    actionCanceled(supplyPlanType) {
        var inputs = document.getElementsByClassName("submitBtn");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        this.setState({
            message: i18n.t('static.message.cancelled'),
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
            noFundsBudgetError: ''

        },
            () => {
                this.hideSecondComponent();
            })
        this.toggleLarge(supplyPlanType);
    }
    hideSecondComponent = () => {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    formSubmit = (monthCount) => {
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
        console.log('regionListFiltered', regionListFiltered)
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

        var consumptionDataForAllMonths = [];
        var amcTotalData = [];

        var consumptionTotalMonthWise = [];
        var filteredArray = [];
        var minStockArray = [];
        var maxStockArray = [];
        var minStockMoS = [];
        var maxStockMoS = [];

        var inventoryTotalData = [];
        var expectedBalTotalData = [];
        var suggestedShipmentsTotalData = [];
        var inventoryTotalMonthWise = [];
        var filteredArrayInventory = [];
        var openingBalanceArray = [];
        var closingBalanceArray = [];
        var jsonArrForGraph = [];
        var monthsOfStockArray = [];
        var unmetDemand = [];
        var unallocatedConsumption = [];
        var unallocatedAdjustments = [];

        var programJson = this.state.program
        console.log("ProgramJson", programJson);
        var monthsInPastForAMC = programJson.monthsInPastForAmc;
        var monthsInFutureForAMC = programJson.monthsInFutureForAmc;
        var shelfLife = this.state.planningUnits.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].shelfLife;
        this.setState({
            shelfLife: shelfLife,
            versionId: programJson.currentVersion.versionId
        })
        var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
        console.log('consumptionList', consumptionList)
        var lastActualConsumptionDateArr = [];
        for (var i = 0; i < regionListFiltered.length; i++) {
            var consumptionListForlastActualConsumptionDate = consumptionList.filter(c => (c.actualFlag.toString() == "true") && c.region.id == regionListFiltered[i].id);
            console.log('consumptionListForlastActualConsumptionDate', consumptionListForlastActualConsumptionDate)
            var lastActualConsumptionDate = "";
            for (var lcd = 0; lcd < consumptionListForlastActualConsumptionDate.length; lcd++) {
                if (lcd == 0) {
                    lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                }
                if (lastActualConsumptionDate < consumptionListForlastActualConsumptionDate[lcd].consumptionDate) {
                    lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                }
            }
            lastActualConsumptionDateArr.push({ lastActualConsumptionDate: lastActualConsumptionDate, region: regionListFiltered[i].id })
        }
        // if (regionId != -1) {
        //     consumptionList = consumptionList.filter(c => c.region.id == regionId)
        // }

        for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var consumptionQty = 0;
            var consumptionUnaccountedQty = 0;
            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                var c = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate) && c.region.id == regionListFiltered[reg].id);
                console.log(c)
                var filteredJson = { consumptionQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                for (var j = 0; j < c.length; j++) {
                    var count = 0;
                    for (var k = 0; k < c.length; k++) {
                        if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                            count++;
                        } else {

                        }
                    }
                    if (count == 0) {
                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                        // if (this.state.batchNoRequired) {
                        consumptionUnaccountedQty += parseInt((c[j].consumptionQty));
                        // }
                        filteredJson = { month: m[i], region: c[j].region, consumptionQty: c[j].consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                    } else {
                        if (c[j].actualFlag.toString() == 'true') {
                            consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                            // if (this.state.batchNoRequired) {
                            if (c[j].batchInfoList.length == 0) {
                                consumptionUnaccountedQty += parseInt((c[j].consumptionQty));
                            }
                            // }
                            filteredJson = { month: m[i], region: c[j].region, consumptionQty: c[j].consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                        }
                    }
                }
                // Consumption details
                console.log('filteredJson', filteredJson, ' consumptionQty', consumptionQty, ' consumptionUnaccountedQty', consumptionUnaccountedQty)
                filteredArray.push(filteredJson);
            }
            var consumptionWithoutRegion = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate));
            if (consumptionWithoutRegion.length == 0) {
                consumptionTotalData.push("");
                unallocatedConsumption.push("");
            } else {
                consumptionTotalData.push(consumptionQty);
                unallocatedConsumption.push(consumptionUnaccountedQty);
            }
        }
        console.log('consumptionTotalData', consumptionTotalData)
        // Calculations for AMC
        var amcBeforeArray = [];
        var amcAfterArray = [];
        for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            for (var c = 0; c < PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN; c++) {
                var month1MonthsBefore = moment(m[i].startDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                var currentMonth1Before = moment(m[i].endDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate >= month1MonthsBefore && con.consumptionDate <= currentMonth1Before);
                if (consumptionListForAMC.length > 0) {
                    var consumptionQty = 0;
                    for (var j = 0; j < consumptionListForAMC.length; j++) {
                        var count = 0;
                        for (var k = 0; k < consumptionListForAMC.length; k++) {
                            if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                count++;
                            } else {

                            }
                        }

                        if (count == 0) {
                            consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                        } else {
                            if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                            }
                        }
                    }
                    amcBeforeArray.push({ consumptionQty: consumptionQty, month: m[i].month });
                    var amcArrayForMonth = amcBeforeArray.filter(c => c.month == m[i].month);
                    if (amcArrayForMonth.length == monthsInPastForAMC) {
                        c = PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN;
                    }
                }

            }

            for (var c = 0; c < PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN; c++) {
                var month1MonthsAfter = moment(m[i].startDate).add(c, 'months').format("YYYY-MM-DD");
                var currentMonth1After = moment(m[i].endDate).add(c, 'months').format("YYYY-MM-DD");
                var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate >= month1MonthsAfter && con.consumptionDate <= currentMonth1After);
                if (consumptionListForAMC.length > 0) {
                    var consumptionQty = 0;
                    for (var j = 0; j < consumptionListForAMC.length; j++) {
                        var count = 0;
                        for (var k = 0; k < consumptionListForAMC.length; k++) {
                            if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                count++;
                            } else {

                            }
                        }

                        if (count == 0) {
                            consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                        } else {
                            if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                            }
                        }
                    }
                    amcAfterArray.push({ consumptionQty: consumptionQty, month: m[i].month });
                    var amcArrayForMonth = amcAfterArray.filter(c => c.month == m[i].month);
                    if (amcArrayForMonth.length == monthsInFutureForAMC) {
                        c = PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN;
                    }
                }

            }
            var amcArray = amcBeforeArray.concat(amcAfterArray);
            var amcArrayFilteredForMonth = amcArray.filter(c => m[i].month == c.month);
            var countAMC = amcArrayFilteredForMonth.length;
            var sumOfConsumptions = 0;
            for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
            }
            if (countAMC != 0) {
                var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);
                amcTotalData.push(amcCalcualted);

                // Calculations for Min stock
                var maxForMonths = 0;
                if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                    maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                } else {
                    maxForMonths = minMonthsOfStock
                }
                var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));
                minStockArray.push(minStock);
                minStockMoS.push(parseInt(maxForMonths));


                // Calculations for Max Stock
                var minForMonths = 0;
                if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                    minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                } else {
                    minForMonths = (maxForMonths + reorderFrequencyInMonths);
                }
                var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                maxStockArray.push(maxStock);
                maxStockMoS.push(parseInt(minForMonths));
            } else {
                amcTotalData.push("");
                minStockArray.push("");
                minStockMoS.push("");
                maxStockMoS.push("");
                maxStockArray.push("");
            }
        }

        // Region wise calculations for consumption
        for (var i = 0; i < regionListFiltered.length; i++) {
            var regionCount = 0;
            var f = filteredArray.length
            for (var j = 0; j < f; j++) {
                if (filteredArray[j].region.id == 0) {
                    filteredArray[j].region.id = regionListFiltered[i].id;
                }
                if (regionListFiltered[i].id == filteredArray[j].region.id) {
                    regionCount++;
                }
            }
            if (regionCount == 0) {
                for (var k = 0; k < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; k++) {
                    filteredArray.push({ consumptionQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                }
            }
        }
        for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var consumptionListFilteredForMonth = filteredArray.filter(c => c.consumptionQty == '' || c.month.month == m[i].month);
            var monthWiseCount = 0;
            for (var cL = 0; cL < consumptionListFilteredForMonth.length; cL++) {
                if (consumptionListFilteredForMonth[cL].consumptionQty != '') {
                    monthWiseCount += parseInt(consumptionListFilteredForMonth[cL].consumptionQty);
                }
            }
            consumptionTotalMonthWise.push(monthWiseCount);
        }

        // Inventory part
        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
        if (regionId != -1) {
            inventoryList = inventoryList.filter(c => c.region.id == regionId)
        }
        for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var adjustmentQty = 0;
            var adjustmentUnallocatedQty = 0;
            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                var adjustmentQtyForRegion = 0;
                var c = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                var filteredJsonInventory = { adjustmentQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                for (var j = 0; j < c.length; j++) {
                    adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                    if (c[j].batchInfoList.length == 0 && c[j].adjustmentQty < 0) {
                        adjustmentUnallocatedQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                    }
                    adjustmentQtyForRegion += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                    filteredJsonInventory = { month: m[i], region: c[j].region, adjustmentQty: adjustmentQtyForRegion, inventoryId: c[j].inventoryId, inventoryDate: c[j].inventoryDate };
                }
                filteredArrayInventory.push(filteredJsonInventory);
            }
            var c1 = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region == null);
            var fInventory = { adjustmentQty: '', region: { id: -1 }, month: m[i] };
            var nationalAdjustment = 0;
            for (var j = 0; j < c1.length; j++) {
                adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                if (c1[j].batchInfoList.length == 0 && c1[j].adjustmentQty < 0) {
                    adjustmentUnallocatedQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                }
                nationalAdjustment += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                fInventory = { month: m[i], region: { id: -1 }, adjustmentQty: nationalAdjustment, inventoryId: c1[j].inventoryId, inventoryDate: c1[j].inventoryDate };
            }
            filteredArrayInventory.push(fInventory);

            var adjustmentsTotalData = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate));
            if (adjustmentsTotalData.length == 0) {
                inventoryTotalData.push("");
                unallocatedAdjustments.push("");
            } else {
                inventoryTotalData.push(adjustmentQty);
                unallocatedAdjustments.push(adjustmentUnallocatedQty);
            }
        }
        console.log('inventoryTotalData', inventoryTotalData)
        // Region wise calculations for inventory
        for (var i = 0; i < regionListFiltered.length; i++) {
            var regionCount = 0;
            var f = filteredArrayInventory.length
            for (var j = 0; j < f; j++) {
                if (filteredArrayInventory[j].region.id == 0) {
                    filteredArrayInventory[j].region.id = regionListFiltered[i].id;
                }
                if (regionListFiltered[i].id == filteredArrayInventory[j].region.id) {
                    regionCount++;
                }
            }
            if (regionCount == 0) {
                for (var k = 0; k < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; k++) {
                    filteredArrayInventory.push({ adjustmentQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                }
            }
        }
        for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var inventoryListFilteredForMonth = filteredArrayInventory.filter(c => c.adjustmentQty == '' || c.month.month == m[i].month);
            var monthWiseCount = 0;
            for (var cL = 0; cL < inventoryListFilteredForMonth.length; cL++) {
                if (inventoryListFilteredForMonth[cL].adjustmentQty != '') {
                    monthWiseCount += parseInt(inventoryListFilteredForMonth[cL].adjustmentQty);
                }
            }
            inventoryTotalMonthWise.push(monthWiseCount);
        }



        // Shipments updated part
        var db1;
        getDatabase();
        var regionList = [];
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
            var papuOs = papuTransaction.objectStore('procurementAgent');
            var papuRequest = papuOs.getAll();
            papuRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            papuRequest.onsuccess = function (event) {
                var papuResult = [];
                papuResult = papuRequest.result;

                var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                var shipmentStatusRequest = shipmentStatusOs.getAll();
                shipmentStatusRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                shipmentStatusRequest.onsuccess = function (event) {
                    var shipmentStatusResult = [];
                    shipmentStatusResult = shipmentStatusRequest.result;
                    console.log('shipmentStatusResult', shipmentStatusResult)
                    // Shipments part
                    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                    for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate))
                        var shipmentTotalQty = 0;

                        var manualShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == false);
                        var manualTotalQty = 0;

                        var deliveredShipmentsQty = 0;
                        var shippedShipmentsQty = 0;
                        var orderedShipmentsQty = 0;
                        var plannedShipmentsQty = 0;

                        var deliveredShipmentsDetailsArr = [];
                        var shippedShipmentsDetailsArr = [];
                        var orderedShipmentsDetailsArr = [];
                        var plannedShipmentsDetailsArr = [];

                        var erpShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == true);
                        var erpTotalQty = 0;

                        var deliveredErpShipmentsQty = 0;
                        var shippedErpShipmentsQty = 0;
                        var orderedErpShipmentsQty = 0;
                        var plannedErpShipmentsQty = 0;

                        var deliveredErpShipmentsDetailsArr = [];
                        var shippedErpShipmentsDetailsArr = [];
                        var orderedErpShipmentsDetailsArr = [];
                        var plannedErpShipmentsDetailsArr = [];
                        var paColor = "";

                        for (var j = 0; j < shipmentArr.length; j++) {
                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                        }
                        shipmentsTotalData.push(shipmentTotalQty);

                        for (var j = 0; j < manualShipmentArr.length; j++) {
                            manualTotalQty += parseInt((manualShipmentArr[j].shipmentQty));
                            if (manualShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                deliveredShipmentsDetailsArr.push(shipmentDetail);
                                deliveredShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                            } else if (manualShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                shippedShipmentsDetailsArr.push(shipmentDetail);
                                shippedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                            } else if (manualShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                orderedShipmentsDetailsArr.push(shipmentDetail);
                                orderedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                            } else if (manualShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == DRAFT_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                plannedShipmentsDetailsArr.push(shipmentDetail);
                                plannedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                            }
                        }

                        manualShipmentsTotalData.push(manualTotalQty);

                        if ((manualShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (deliveredShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            deliveredShipmentsTotalData.push({ qty: deliveredShipmentsQty, month: m[i], shipmentDetail: deliveredShipmentsDetailsArr, noOfShipments: deliveredShipmentsDetailsArr.length, colour: colour })
                        } else {
                            deliveredShipmentsTotalData.push("");
                        }

                        if ((manualShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (shippedShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            shippedShipmentsTotalData.push({ qty: shippedShipmentsQty, month: m[i], shipmentDetail: shippedShipmentsDetailsArr, noOfShipments: shippedShipmentsDetailsArr.length, colour: colour })
                        } else {
                            shippedShipmentsTotalData.push("");
                        }

                        if ((manualShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (orderedShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            orderedShipmentsTotalData.push({ qty: orderedShipmentsQty, month: m[i], shipmentDetail: orderedShipmentsDetailsArr, noOfShipments: orderedShipmentsDetailsArr.length, colour: colour })
                        } else {
                            orderedShipmentsTotalData.push("");
                        }

                        if ((manualShipmentArr.filter(c => c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (plannedShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            plannedShipmentsTotalData.push({ qty: plannedShipmentsQty, month: m[i], shipmentDetail: plannedShipmentsDetailsArr, noOfShipments: plannedShipmentsDetailsArr.length, colour: colour })
                        } else {
                            plannedShipmentsTotalData.push("");
                        }
                        console.log('plannedShipmentsTotalData', plannedShipmentsTotalData)
                        for (var j = 0; j < erpShipmentArr.length; j++) {
                            erpTotalQty += parseInt((erpShipmentArr[j].shipmentQty));
                            if (erpShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                deliveredErpShipmentsDetailsArr.push(shipmentDetail);
                                deliveredErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                            } else if (erpShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                shippedErpShipmentsDetailsArr.push(shipmentDetail);
                                shippedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                            } else if (erpShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                orderedErpShipmentsDetailsArr.push(shipmentDetail);
                                orderedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                            } else if (erpShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == DRAFT_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                    var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                    paColor = procurementAgent.colorHtmlCode;
                                } else {
                                    paColor = "#efefef"
                                }
                                plannedErpShipmentsDetailsArr.push(shipmentDetail);
                                plannedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                            }
                        }

                        erpShipmentsTotalData.push(erpTotalQty);

                        if ((erpShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (deliveredErpShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            deliveredErpShipmentsTotalData.push({ qty: deliveredErpShipmentsQty, month: m[i], shipmentDetail: deliveredErpShipmentsDetailsArr, noOfShipments: deliveredErpShipmentsDetailsArr.length, colour: colour })
                        } else {
                            deliveredErpShipmentsTotalData.push("");
                        }

                        if ((erpShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (shippedErpShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            shippedErpShipmentsTotalData.push({ qty: shippedErpShipmentsQty, month: m[i], shipmentDetail: shippedErpShipmentsDetailsArr, noOfShipments: shippedErpShipmentsDetailsArr.length, colour: colour })
                        } else {
                            shippedErpShipmentsTotalData.push("");
                        }

                        if ((erpShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (orderedErpShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            orderedErpShipmentsTotalData.push({ qty: orderedErpShipmentsQty, month: m[i], shipmentDetail: orderedErpShipmentsDetailsArr, noOfShipments: orderedErpShipmentsDetailsArr.length, colour: colour })
                        } else {
                            orderedErpShipmentsTotalData.push("");
                        }

                        if ((erpShipmentArr.filter(c => c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                            var colour = paColor;
                            if (plannedErpShipmentsDetailsArr.length > 1) {
                                colour = "#d9ead3";
                            }
                            plannedErpShipmentsTotalData.push({ qty: plannedErpShipmentsQty, month: m[i], shipmentDetail: plannedErpShipmentsDetailsArr, noOfShipments: plannedErpShipmentsDetailsArr.length, colour: colour })
                        } else {
                            plannedErpShipmentsTotalData.push("");
                        }
                    }
                    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                    console.log('batchInfoForPlanningUnit', batchInfoForPlanningUnit)

                    var myArray = batchInfoForPlanningUnit.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
                    for (var ma = 0; ma < myArray.length; ma++) {
                        var shipmentList = programJson.shipmentList;
                        var shipmentBatchArray = [];
                        for (var ship = 0; ship < shipmentList.length; ship++) {
                            var batchInfoList = shipmentList[ship].batchInfoList;
                            for (var bi = 0; bi < batchInfoList.length; bi++) {
                                shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                            }
                        }
                        var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == myArray[ma].batchNo)[0];
                        var totalStockForBatchNumber = stockForBatchNumber.qty;
                        var consumptionList = programJson.consumptionList;
                        var consumptionBatchArray = [];

                        for (var con = 0; con < consumptionList.length; con++) {
                            var batchInfoList = consumptionList[con].batchInfoList;
                            for (var bi = 0; bi < batchInfoList.length; bi++) {
                                consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                            }
                        }
                        var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                        if (consumptionForBatchNumber == undefined) {
                            consumptionForBatchNumber = [];
                        }
                        var consumptionQty = 0;
                        for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                            consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                        }
                        var inventoryList = programJson.inventoryList;
                        var inventoryBatchArray = [];
                        for (var inv = 0; inv < inventoryList.length; inv++) {
                            var batchInfoList = inventoryList[inv].batchInfoList;
                            for (var bi = 0; bi < batchInfoList.length; bi++) {
                                inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                            }
                        }
                        var inventoryForBatchNumber = [];
                        if (inventoryBatchArray.length > 0) {
                            inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                        }
                        if (inventoryForBatchNumber == undefined) {
                            inventoryForBatchNumber = [];
                        }
                        var adjustmentQty = 0;
                        for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                            adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                        }
                        var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                        myArray[ma].remainingQty = remainingBatchQty;
                    }
                    console.log("MyArray", myArray);

                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                    var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                    var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                    var curDate = moment(this.state.monthsArray[TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN - 1].startDate).subtract(1, 'months').format("YYYY-MM-DD");
                    for (var i = 0; createdDate < curDate; i++) {
                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                        var consumptionQty = 0;
                        var unallocatedConsumptionQty = 0;
                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].id);
                            for (var j = 0; j < c.length; j++) {
                                var count = 0;
                                for (var k = 0; k < c.length; k++) {
                                    if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                        count++;
                                    } else {

                                    }
                                }
                                if (count == 0) {
                                    consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                    unallocatedConsumptionQty = unallocatedConsumptionQty + parseInt((c[j].consumptionQty));
                                } else {
                                    if (c[j].actualFlag.toString() == 'true') {
                                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                        var qty = 0;
                                        if (c[j].batchInfoList.length > 0) {
                                            for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                            }
                                        }
                                        var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                        unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                                    }
                                }
                            }
                        }

                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                        console.log("--------------------------------------------------------------");
                        console.log("Start date", startDate);
                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                            console.log("Unallocated consumption", unallocatedConsumptionQty);
                            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
                            if (parseInt(batchDetailsForParticularPeriod[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
                                myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
                                unallocatedConsumptionQty = 0
                            } else {
                                var rq = batchDetailsForParticularPeriod[ua].remainingQty;
                                myArray[index].remainingQty = 0;
                                unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                            }
                        }
                        var adjustmentQty = 0;
                        var unallocatedAdjustmentQty = 0;
                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                            console.log('c====>', c)
                            for (var j = 0; j < c.length; j++) {
                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                var qty1 = 0;
                                if (c[j].batchInfoList.length > 0) {
                                    for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                        qty1 += parseFloat(parseInt((c[j].batchInfoList)[a].adjustmentQty) * c[j].multiplier);
                                    }
                                }
                                var remainingQty = parseFloat((c[j].adjustmentQty * c[j].multiplier)) - parseFloat(qty1);
                                unallocatedAdjustmentQty = parseFloat(remainingQty);
                                if (unallocatedAdjustmentQty < 0) {
                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                        console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                        var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                        if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                            myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                            unallocatedAdjustmentQty = 0
                                        } else {
                                            var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
                                            myArray[index].remainingQty = 0;
                                            unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                        }
                                    }
                                } else {
                                    if (batchDetailsForParticularPeriod.length > 0) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                        console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                        batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                        unallocatedAdjustmentQty = 0;
                                    }
                                }

                            }
                        }
                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                        for (var j = 0; j < c1.length; j++) {
                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                            if (unallocatedAdjustmentQty < 0) {
                                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                    console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                    console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                    var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                    if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                        myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                        unallocatedAdjustmentQty = 0
                                    } else {
                                        var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
                                        myArray[index].remainingQty = 0;
                                        unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                    }
                                }
                            } else {
                                if (batchDetailsForParticularPeriod.length > 0) {
                                    console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                    console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                    unallocatedAdjustmentQty = 0;
                                }
                            }
                        }

                    }

                    console.log("My array after accounting all the calcuklations", myArray);
                    var expiredStockArr = myArray;

                    // Calculation of opening and closing balance
                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                    var createdDate = moment('2018-12-01').format("YYYY-MM-DD");
                    var curDate = moment(this.state.monthsArray[0].startDate).subtract(1, 'months').format("YYYY-MM-DD");
                    var openingBalance = 0;
                    for (var i = 0; createdDate < curDate; i++) {
                        createdDate = moment(createdDate).add(1, 'months').format("YYYY-MM-DD");
                        console.log("Created date", createdDate);
                        console.log("i", i)
                        var consumptionQty = 0;
                        var expiredStockQty = 0;
                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                        console.log("startDate", startDate);
                        console.log("endDate", endDate);
                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].id);
                            console.log("c----------->", c)
                            for (var j = 0; j < c.length; j++) {
                                var count = 0;
                                for (var k = 0; k < c.length; k++) {
                                    if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                        count++;
                                    } else {

                                    }
                                }
                                if (count == 0) {
                                    consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                } else {
                                    if (c[j].actualFlag.toString() == 'true') {
                                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                    }
                                }
                            }
                        }
                        console.log("Consumption Qty", consumptionQty, " Start date", startDate);

                        // Inventory part
                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                        var adjustmentQty = 0;
                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                            for (var j = 0; j < c.length; j++) {
                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            }
                        }
                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                        for (var j = 0; j < c1.length; j++) {
                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                        }
                        console.log("Adjustment Qty", adjustmentQty, " Start date", startDate);

                        // Shipments part
                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                        var shipmentTotalQty = 0;
                        for (var j = 0; j < shipmentArr.length; j++) {
                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                        }
                        console.log("Shipment Qty", shipmentTotalQty, " Start date", startDate);
                        var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(endDate).format("YYYY-MM-DD"))));
                        expiredStockQty = 0;
                        for (var j = 0; j < expiredStock.length; j++) {
                            expiredStockQty += parseInt((expiredStock[j].remainingQty));
                        }

                        var closingBalance = parseInt(openingBalance) + parseInt(shipmentTotalQty) + parseFloat(adjustmentQty) - parseInt(consumptionQty) - parseInt(expiredStockQty);
                        if (closingBalance < 0) {
                            closingBalance = 0;
                        }
                        openingBalance = closingBalance;
                    }
                    console.log("Opening balance", openingBalance);
                    openingBalanceArray.push(openingBalance);
                    for (var i = 1; i <= TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                        var consumptionQtyForCB = 0;
                        if (consumptionTotalData[i - 1] != "") {
                            consumptionQtyForCB = consumptionTotalData[i - 1];
                        }
                        var inventoryQtyForCB = 0;
                        if (inventoryTotalData[i - 1] != "") {
                            inventoryQtyForCB = inventoryTotalData[i - 1];
                        }
                        var shipmentsQtyForCB = 0;
                        if (shipmentsTotalData[i - 1] != "") {
                            shipmentsQtyForCB = shipmentsTotalData[i - 1];
                        }
                        console.log("M[i].startDate", m[i - 1].startDate);
                        var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(m[i - 1].startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(m[i - 1].endDate).format("YYYY-MM-DD"))));
                        console.log('expiredStock', expiredStock)
                        var expiredStockQty = 0;
                        for (var j = 0; j < expiredStock.length; j++) {
                            expiredStockQty += parseInt((expiredStock[j].remainingQty));
                        }
                        totalExpiredStockArr.push(expiredStockQty);
                        // Suggested shipments part
                        var s = i - 1;
                        var month = m[s].startDate;
                        var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                        var compare = (month >= currentMonth);
                        var stockInHand = openingBalanceArray[s] - consumptionQtyForCB + inventoryQtyForCB + shipmentsQtyForCB;
                        if (compare && parseInt(stockInHand) <= parseInt(minStockArray[s])) {
                            var suggestedOrd = parseInt(maxStockArray[s] - minStockArray[s]);
                            if (suggestedOrd == 0) {
                                var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                    parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                    parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                var isEmergencyOrder = 0;
                                if (expectedDeliveryDate >= currentMonth) {
                                    isEmergencyOrder = 0;
                                } else {
                                    isEmergencyOrder = 1;
                                }
                                suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                            } else {
                                var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                    parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                    parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                var isEmergencyOrder = 0;
                                if (expectedDeliveryDate >= currentMonth) {
                                    isEmergencyOrder = 0;
                                } else {
                                    isEmergencyOrder = 1;
                                }
                                suggestedShipmentsTotalData.push({ "suggestedOrderQty": suggestedOrd, "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                            }
                        } else {
                            var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                            var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                            var isEmergencyOrder = 0;
                            if (expectedDeliveryDate >= currentMonth) {
                                isEmergencyOrder = 0;
                            } else {
                                isEmergencyOrder = 1;
                            }
                            suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                        }

                        var suggestedShipmentQtyForCB = 0;
                        if (suggestedShipmentsTotalData[i - 1].suggestedOrderQty != "") {
                            suggestedShipmentQtyForCB = suggestedShipmentsTotalData[i - 1].suggestedOrderQty;
                        }
                        var closingBalance = openingBalanceArray[i - 1] - consumptionQtyForCB + inventoryQtyForCB + shipmentsQtyForCB - parseInt(expiredStockQty);
                        console.log('expiredStockQty', expiredStockQty)
                        if (closingBalance >= 0) {
                            unmetDemand.push("");
                            closingBalance = closingBalance;

                        } else {
                            unmetDemand.push(closingBalance);
                            closingBalance = 0;
                        }
                        closingBalanceArray.push(closingBalance);
                        if (i != TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN) {
                            openingBalanceArray.push(closingBalance);
                        }
                    }

                    // Calculations for monthsOfStock
                    for (var s = 0; s < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; s++) {
                        if (closingBalanceArray[s] != 0 && amcTotalData[s] != 0 && closingBalanceArray[s] != "" && amcTotalData[s] != "") {
                            var mos = parseFloat(closingBalanceArray[s] / amcTotalData[s]).toFixed(2);
                            monthsOfStockArray.push(mos);
                        } else {
                            monthsOfStockArray.push("");
                        }
                    }

                    // // Logic for expired stock count
                    // for (var es = 0; es < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; es++) {
                    //     var expiredBatchNumbers = programJson.batchInfoList.filter(c => c.expiryDate <= m[es].endDate && c.expiryDate >= m[es].startDate && c.planningUnitId == document.getElementById("planningUnitId").value);
                    //     var expiredStock = 0;
                    //     for (var ebn = 0; ebn < expiredBatchNumbers.length; ebn++) {
                    //         var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.active == true);
                    //         var shipmentBatchArray = [];
                    //         for (var ship = 0; ship < shipmentList.length; ship++) {
                    //             var batchInfoList = shipmentList[ship].batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                    //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                    //                 shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                    //             }
                    //         }
                    //         var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo)[0];
                    //         var totalStockForBatchNumber = stockForBatchNumber.qty;
                    //         console.log("Total stock batch number", totalStockForBatchNumber, "Batch number", expiredBatchNumbers[ebn].batchNo);

                    //         var consumptionList = programJson.consumptionList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.active == true);
                    //         var consumptionBatchArray = [];
                    //         for (var con = 0; con < consumptionList.length; con++) {
                    //             var batchInfoList = consumptionList[con].batchInfoList;
                    //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                    //                 consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                    //             }
                    //         }
                    //         var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo && c.planningUnitId == document.getElementById("planningUnitId").value);
                    //         var consumptionQty = 0;
                    //         for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                    //             consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                    //         }
                    //         console.log("Total consumptions batch number", consumptionQty, "Batch number", expiredBatchNumbers[ebn].batchNo);
                    //         var inventoryList = programJson.inventoryList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.active == true);;
                    //         var inventoryBatchArray = [];
                    //         for (var inv = 0; inv < inventoryList.length; inv++) {
                    //             var batchInfoList = inventoryList[inv].batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                    //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                    //                 inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                    //             }
                    //         }
                    //         var inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo && c.planningUnitId == document.getElementById("planningUnitId").value);
                    //         var adjustmentQty = 0;
                    //         for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                    //             adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                    //         }

                    //         console.log("Total adjustments batch number", adjustmentQty, "Batch number", expiredBatchNumbers[ebn].batchNo);
                    //         var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                    //         expiredStock += parseInt(remainingBatchQty);
                    //         console.log("Expired stock", expiredStock, "Batch number", expiredBatchNumbers[ebn].batchNo)
                    //     }
                    //     console.log("Expired stock qty", expiredStock, "Month---->", m[es].month);
                    //     console.log("unallocatedConsumption", unallocatedConsumption)
                    //     if (expiredStock > 0) {
                    //         for (var unAlloCon = 0; unAlloCon < es; unAlloCon++) {
                    //             var remainingUnAllocated = unallocatedConsumption[unAlloCon] - expiredStock;
                    //             var remainingExpiredStock = expiredStock - unallocatedConsumption[unAlloCon];

                    //             if (remainingExpiredStock > 0) {
                    //                 expiredStock = expiredStock - unallocatedConsumption[unAlloCon];
                    //             } else {
                    //                 expiredStock = 0;
                    //             }
                    //             if (remainingUnAllocated > 0) {
                    //                 unallocatedConsumption[unAlloCon] = remainingUnAllocated;
                    //             }
                    //         }

                    //     }
                    //     console.log("final Expired stock qty", expiredStock, "Month---->", m[es].month);
                    // }

                    var plannedShipmentArrForGraph = [];
                    var orderedShipmentArrForGraph = [];
                    var shippedShipmentArrForGraph = [];
                    var deliveredShipmentArrForGraph = [];

                    var plannedErpShipmentArrForGraph = [];
                    var orderedErpShipmentArrForGraph = [];
                    var shippedErpShipmentArrForGraph = [];
                    var deliveredErpShipmentArrForGraph = [];
                    for (var jsonForGraph = 0; jsonForGraph < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; jsonForGraph++) {
                        if (plannedShipmentsTotalData[jsonForGraph] != "") {
                            plannedShipmentArrForGraph.push(plannedShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            plannedShipmentArrForGraph.push(0)
                        }

                        if (orderedShipmentsTotalData[jsonForGraph] != "") {
                            orderedShipmentArrForGraph.push(orderedShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            orderedShipmentArrForGraph.push(0)
                        }

                        if (shippedShipmentsTotalData[jsonForGraph] != "") {
                            shippedShipmentArrForGraph.push(shippedShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            shippedShipmentArrForGraph.push(0)
                        }

                        if (deliveredShipmentsTotalData[jsonForGraph] != "") {
                            deliveredShipmentArrForGraph.push(deliveredShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            deliveredShipmentArrForGraph.push(0)
                        }

                        if (plannedErpShipmentsTotalData[jsonForGraph] != "") {
                            plannedErpShipmentArrForGraph.push(plannedErpShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            plannedErpShipmentArrForGraph.push(0)
                        }

                        if (orderedErpShipmentsTotalData[jsonForGraph] != "") {
                            orderedErpShipmentArrForGraph.push(orderedErpShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            orderedErpShipmentArrForGraph.push(0)
                        }

                        if (shippedErpShipmentsTotalData[jsonForGraph] != "") {
                            shippedErpShipmentArrForGraph.push(shippedErpShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            shippedErpShipmentArrForGraph.push(0)
                        }

                        if (deliveredErpShipmentsTotalData[jsonForGraph] != "") {
                            deliveredErpShipmentArrForGraph.push(deliveredErpShipmentsTotalData[jsonForGraph].qty)
                        } else {
                            deliveredErpShipmentArrForGraph.push(0)
                        }
                    }

                    // Building json for graph
                    for (var jsonForGraph = 0; jsonForGraph < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; jsonForGraph++) {
                        var json = {
                            month: m[jsonForGraph].month,
                            consumption: consumptionTotalData[jsonForGraph],
                            stock: closingBalanceArray[jsonForGraph],
                            planned: plannedShipmentArrForGraph[jsonForGraph] + plannedErpShipmentArrForGraph[jsonForGraph],
                            delivered: deliveredShipmentArrForGraph[jsonForGraph] + deliveredErpShipmentArrForGraph[jsonForGraph],
                            shipped: shippedShipmentArrForGraph[jsonForGraph] + shippedErpShipmentArrForGraph[jsonForGraph],
                            ordered: orderedShipmentArrForGraph[jsonForGraph] + orderedErpShipmentArrForGraph[jsonForGraph],
                            mos: monthsOfStockArray[jsonForGraph]
                        }
                        jsonArrForGraph.push(json);
                    }
                    this.setState({
                        suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                        inventoryTotalData: inventoryTotalData,
                        inventoryFilteredArray: filteredArrayInventory,
                        regionListFiltered: regionListFiltered,
                        inventoryTotalMonthWise: inventoryTotalMonthWise,
                        openingBalanceArray: openingBalanceArray,
                        closingBalanceArray: closingBalanceArray,
                        consumptionTotalData: consumptionTotalData,
                        shipmentsTotalData: shipmentsTotalData,
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
                        consumptionFilteredArray: filteredArray,
                        consumptionTotalMonthWise: consumptionTotalMonthWise,
                        amcTotalData: amcTotalData,
                        minStockArray: minStockArray,
                        maxStockArray: maxStockArray,
                        minStockMoS: minStockMoS,
                        maxStockMoS: maxStockMoS,
                        monthsOfStockArray: monthsOfStockArray,
                        planningUnitName: planningUnitName,
                        jsonArrForGraph: jsonArrForGraph,
                        lastActualConsumptionDate: lastActualConsumptionDate,
                        lastActualConsumptionDateArr: lastActualConsumptionDateArr,
                        unmetDemand: unmetDemand,
                        expiredStockArr: totalExpiredStockArr
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }



    dataChange(event) {
        let { program } = this.state
        if (event.target.name === "versionStatusId") {
            program.currentVersion.versionStatus.id = event.target.value
        }

        this.setState(
            {
                program
            }
        )

    };


    getPlanningUnit = () => {
        let programId = this.props.match.params.programId;

        AuthenticationService.setupAxiosInterceptors();

        ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
            console.log('**' + JSON.stringify(response.data))
            this.setState({
                planningUnits: response.data, message: ''
            })
        })
            .catch(
                error => {
                    this.setState({
                        planningUnits: [],
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
    }

    getDatasource=()=> {

        this.setState({
            display: 'none'
        })
        var db1;
        var storeOS;
        getDatabase();
        var dataSourceListAll = [];
        var openRequest = indexedDB.open('fasp', 1);
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
                                if (dataSourceResult[k].program.id ==  this.props.match.params.programId || dataSourceResult[k].program.id == 0 && dataSourceResult[k].active == true) {
                                    if (dataSourceResult[k].realm.id == this.state.program.realmCountry.realm.realmId) {
                                        dataSourceListAll.push(dataSourceResult[k]);

                                    }
                                }
                            }
                            console.log('getDatasource',dataSourceListAll)
                            this.setState({
                                dataSourceListAll: dataSourceListAll,
                               })
                        }.bind(this);
                    }.bind(this);
             
    }



    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramData({ "programId": this.props.match.params.programId, "versionId": this.props.match.params.versionId })
            .then(response => {
                console.log(response.data)
                let { program } = this.state
                program = response.data
                var regionList=[]
                for (var i = 0; i < program.regionList.length; i++) {
                    var regionJson = {
                        name: getLabelText(program.regionList[i].label, this.state.lang),
                        id: program.regionList[i].regionId
                    }
                    regionList[i] = regionJson

                }
                this.setState({
                    program,
                    regionList: regionList
                }, () => {
                    this.getPlanningUnit()
                    this.getDatasource()
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
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.response
                            })
                            break
                    }
                }
            )

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getVersionStatusList().then(response => {
            console.log('**' + JSON.stringify(response.data))
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
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );



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
        this.setState({ program: program });
    }

    touchAll(setTouched, errors) {
        setTouched({
            versionStatusId: true
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

    render() {
        const { statuses } = this.state;
        let statusList = statuses.length > 0
            && statuses.map((item, i) => {
                return (
                    <option key={i} value={item.id} disabled={item.id == 1 ? "disabled" : ""} >

                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnit.id}>
                        {getLabelText(item.planningUnit.label, this.state.lang)}
                    </option>
                )
            }, this);
        let bar = {}
        if (this.state.jsonArrForGraph.length > 0)
            bar = {

                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: [
                    {
                        label: i18n.t('static.supplyPlan.planned'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#85C1E9',
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
                        backgroundColor: '#3498DB',
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
                        backgroundColor: '#2874A6',
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
                        backgroundColor: '#1B4F72',
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
                        borderColor: 'rgba(179,181,158,1)',
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
                        label: i18n.t('static.dashboard.consumption'),
                        type: 'line',
                        stack: 3,
                        yAxisID: 'A',
                        backgroundColor: 'transparent',
                        borderColor: 'rgba(255.102.102.1)',
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
                        borderColor: '#f4862a',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.mos))
                    }
                ]

            };

        return (
            <div className="animated fadeIn">
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>

                <Col sm={12} sm={12} style={{ flexBasis: 'auto' }}>
                    <Card>
                        <CardHeader>
                            <i className="icon-note"></i><strong>{i18n.t('static.report.updatestatus')}</strong>{' '}
                        </CardHeader>
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


                                                    </div>
                                                </Col>
                                            </Form>

                                        )} />

                        {/* </CardBody> */}
                        <div className="" id="supplyPlanTableId" style={{ display: this.state.display }}>

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
                                                <th style={{ padding: '10px 0 !important' }}>{item.month}</th>
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
                                        <td align="left"><b>- {i18n.t('static.dashboard.consumption')}</b></td>
                                        {
                                            this.state.consumptionTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
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
                                                        return (<td align="right" bgcolor='red' className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                    }
                                                } else {
                                                    var compare = item1.month >= moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                    if (compare) {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, ``, '', '', `${item1.isEmergencyOrder}`)}>{item1.suggestedOrderQty}</td>)
                                                    } else {
                                                        return (<td>{item1.suggestedOrderQty}</td>)
                                                    }
                                                }
                                            })
                                        }
                                    </tr>

                                    <tr className="totalShipments">
                                        <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionManualShipments()}>
                                            {this.state.showManualShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                        </td>
                                        <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.manualEntryShipments')}</td>
                                        {
                                            this.state.manualShipmentsTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>

                                    <tr className="manualShipments">
                                        <td className="BorderNoneSupplyPlan"></td>
                                        <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>

                                        {
                                            this.state.deliveredShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td bgcolor={item1.colour} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                    return (<td align="right" bgcolor={item1.colour} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                    return (<td bgcolor={item1.colour} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                    return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                    return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                    return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                    return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                    return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            this.state.expiredStockArr.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
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
</CardBody>
                        {/* Consumption modal */}
                        <Modal isOpen={this.state.consumption}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.dashboard.consumptiondetails')}</strong>
                                {/* <ul className="legend legend-supplypln">
                                <li><span className="purplelegend"></span> <span className="legendText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                                <li><span className="blacklegend"></span> <span className="legendText">{i18n.t('static.supplyPlan.actualConsumption')}</span></li>
                            </ul> */}
                                <ul className="legendcommitversion">
                                    <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                                    <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>

                                </ul>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h6>
                                <div className="col-md-12">
                                    <span className="supplyplan-larrow" onClick={this.leftClickedConsumption}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                    <span className="supplyplan-rarrow" onClick={this.rightClickedConsumption}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                                </div>
                                <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {
                                                this.state.monthsArray.map(item => (
                                                    <th>{item.month}</th>
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
                                                        this.state.consumptionFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                            if (item1.consumptionQty.toString() != '') {
                                                                if (item1.actualFlag.toString() == 'true') {
                                                                    return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                                } else {
                                                                    return (<td align="right" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                                }
                                                            } else {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, ``, `${item1.month.month}`)}></td>)
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
                                                this.state.consumptionTotalMonthWise.map(item => (
                                                    <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item} /></th>
                                                ))
                                            }
                                        </tr>
                                    </tfoot>
                                </Table>
                                <div className="table-responsive">
                                    <div id="consumptionDetailsTable" />
                                </div>
                                <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                                <div className="table-responsive">
                                    <div id="consumptionBatchInfoTable"></div>
                                </div>

                                <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                    {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveConsumptionBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveConsumption}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </ModalFooter>
                        </Modal>
                        {/* Consumption modal */}
                        {/* Adjustments modal */}
                        <Modal isOpen={this.state.adjustments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">{i18n.t('static.supplyPlan.adjustmentsDetails')}</ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h6>
                                <div className="col-md-12">
                                    <span className="supplyplan-larrow" onClick={this.leftClickedAdjustments}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                    <span className="supplyplan-rarrow" onClick={this.rightClickedAdjustments}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                                </div>
                                <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {
                                                this.state.monthsArray.map(item => (
                                                    <th>{item.month}</th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.regionListFiltered.map(item => (
                                                <tr>
                                                    <td style={{ textAlign: 'left' }}>{item.name}</td>
                                                    {
                                                        this.state.inventoryFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                            if (item1.adjustmentQty.toString() != '') {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>)
                                                            } else {
                                                                var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.region.id == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                                var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                                if (currentMonthDate > lastActualConsumptionDate) {
                                                                    return (<td align="right"></td>)
                                                                } else {
                                                                    return (<td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`)}></td>)
                                                                }
                                                            }
                                                        })
                                                    }
                                                </tr>
                                            )
                                            )

                                        }
                                        <tr>
                                            <td style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.qatAdjustment')}</td>
                                            {
                                                this.state.inventoryFilteredArray.filter(c => c.region.id == -1).map(item1 => {
                                                    if (item1.adjustmentQty.toString() != '') {
                                                        return (<td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>)
                                                    } else {
                                                        return (<td align="right"></td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.total')}</th>
                                            {
                                                this.state.inventoryTotalMonthWise.map(item => (
                                                    <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item} /></th>
                                                ))
                                            }
                                        </tr>
                                    </tfoot>
                                </Table>
                                <div className="table-responsive">
                                    <div id="adjustmentsTable" className="table-responsive" />
                                </div>
                                <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                                <div className="table-responsive">
                                    <div id="inventoryBatchInfoTable"></div>
                                </div>

                                <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                    {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </ModalFooter>
                        </Modal>
                        {/* adjustments modal */}

                        {/* Suggested shipments modal */}
                        <Modal isOpen={this.state.suggestedShipments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('SuggestedShipments')} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.supplyPlan.suggestedShipmentDetails')}</strong>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.suggestedShipmentDuplicateError || this.state.suggestedShipmentError}</h6>
                                <div className="table-responsive">
                                    <div id="suggestedShipmentsDetailsTable" />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {this.state.suggestedShipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveSuggestedShipments}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('SuggestedShipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </ModalFooter>
                        </Modal>
                        {/* Suggested shipments modal */}
                        {/* Shipments modal */}
                        <Modal isOpen={this.state.shipments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('shipments')} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.supplyPlan.shipmentsDetails')}</strong>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.shipmentDuplicateError || this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentBudgetError || this.state.shipmentError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentsDetailsTable" />
                                </div>
                                <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentBatchInfoTable"></div>
                                </div>

                                <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                    {this.state.shipmentBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.saveShipments('shipments')}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('shipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </ModalFooter>
                        </Modal>
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                programId: this.props.match.params.programId,
                                versionId: this.props.match.params.versionId,
                                statusId: this.state.program.versionStatusId
                            }}
                            validate={validate(validationSchema)}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                ProgramService.updateProgramStatus(this.state.program)
                                    .then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/report/supplyPlanVersionAndReview/` + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            })
                                        }

                                    })
                                    .catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({ message: error.message });
                                            } else {
                                                switch (error.response ? error.response.status : "") {
                                                    case 500:
                                                    case 401:
                                                    case 404:
                                                    case 406:
                                                    case 412:
                                                        this.setState({ message: error.response.data.messageCode });
                                                        break;
                                                    default:
                                                        this.setState({ message: 'static.unkownError' });
                                                        break;
                                                }
                                            }
                                        }
                                    );


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
                                            <CardBody>
                                                <Col md="12 pl-0">
                                                    <div>

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

                                                            <Label htmlFor="select">{i18n.t('static.program.notes')}<span className="red Reqasterisk">*</span></Label>

                                                            <Input
                                                                value={this.state.program.currentVersion.notes}
                                                                bsSize="sm"
                                                                valid={!errors.versionNotes}
                                                                invalid={touched.versionNotes && !!errors.versionNotes}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                type="textarea" name="versionNotes" id="versionNotes"
                                                                disabled />
                                                            <FormFeedback>{errors.programNotes}</FormFeedback>

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
                                                                required
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {statusList}
                                                            </Input>
                                                            <FormFeedback className="red">{errors.versionStatusId}</FormFeedback>
                                                        </FormGroup>
                                                    </div>
                                                </Col>
                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-left mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="warning" className="float-left mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> Reset</Button>
                                                    <Button type="submit" size="md" color="success" className="float-left mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>

                                                    &nbsp;
                                             </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                    </Card>
                </Col>

            </div>
        );

    }
    cancelClicked = () => {
        this.props.history.push(`/report/supplyPlanVersionAndReview/` + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked = () => {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramData({ "programId": this.props.match.params.programId, "versionId": this.props.match.params.versionId })
            .then(response => {
                console.log(response.data)
                let { program } = this.state
                program.label = response.data.label
                this.setState({
                    program
                })
            })


    }
}
export default EditSupplyPlanStatus