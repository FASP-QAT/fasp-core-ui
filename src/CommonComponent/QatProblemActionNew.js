import CryptoJS from 'crypto-js';
import moment from 'moment';
import React, { Component } from "react";
import { getDatabase } from "../CommonComponent/IndexedDbFunctions";
import createDataQualityProblems from '../CommonComponent/createDataQualityProblems.js';
import createProcurementScheduleProblems from '../CommonComponent/createProcurementScheduleProblems.js';
import createSupplyPlanningProblems from '../CommonComponent/createSupplyPlanningProblems.js';
import incomplianceProblem from '../CommonComponent/incomplianceProblem.js';
import openProblem from '../CommonComponent/openProblem.js';
import {
    ACTUAL_CONSUMPTION_MODIFIED,
    ADJUSTMENT_MODIFIED,
    CANCELLED_SHIPMENT_STATUS,
    FORECASTED_CONSUMPTION_MODIFIED,
    INDEXED_DB_NAME,
    INDEXED_DB_VERSION,
    INVENTORY_MODIFIED,
    ON_HOLD_SHIPMENT_STATUS,
    PLANNED_SHIPMENT_STATUS,
    SECRET_KEY,
    SHIPMENT_MODIFIED
} from '../Constants.js';
import i18n from '../i18n';
import AuthenticationService from '../views/Common/AuthenticationService';
import createMinMaxProblems from "./createMinMaxProblems";
import { roundAMC } from './JavascriptCommonFunctions.js';
/**
 * This component is used to build the problem list based on the data
 */
export default class QatProblemActionNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            executionStatus: 0
        }
        this.qatProblemActions = this.qatProblemActions.bind(this);
    }
    componentDidMount() {
    }
    render() {
        return (
            <></>
        );
    }
    /**
     * This function has all the logic for building different types of QPL problems
     * @param {*} programId This is program Id for which QPL has to be build
     * @param {*} key Key is the state parameter that should be updated once problem list is build
     * @param {*} buildFullQPL This is a boolean parameter which indicates if full problem list should be rebuild or not
     */
    qatProblemActions(programId, key, buildFullQPL) {
        var problemActionList = [];
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            var realmId = AuthenticationService.getRealmId();
            var programList = [];
            var programRequestList = [];
            var versionIDs = [];
            db1 = e.target.result;
            var objectStoreFromProps = this.props.objectStore;
            var transaction = db1.transaction([objectStoreFromProps], 'readwrite');
            var program = transaction.objectStore(objectStoreFromProps);
            var getRequest = program.get(programId.toString());
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                });
                if (this.props.updateState != undefined) {
                    this.props.updateState(key, false);
                }
            };
            getRequest.onsuccess = function (event) {
                var programQPLDetailsTransaction1 = db1.transaction(['programQPLDetails'], 'readwrite');
                var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('programQPLDetails');
                var programQPLDetailsGetRequest = programQPLDetailsOs1.get(programId.toString());
                programQPLDetailsGetRequest.onsuccess = function (event) {
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    let username = decryptedUser.username;
                    var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData.generalData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var planningUnitDataList = getRequest.result.programData.planningUnitDataList;
                    programList.push({ generalData: programJson, planningUnitDataList: planningUnitDataList });
                    programRequestList.push(getRequest.result);
                    versionIDs.push(getRequest.result.version);
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningUnitList = []
                    planningunitRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                        if (this.props.updateState != undefined) {
                            this.props.updateState(key, false);
                        }
                    }.bind(this);
                    planningunitRequest.onsuccess = function (e) {
                        var programPlanningUnitList = planningunitRequest.result;
                        var problemTransaction = db1.transaction(['problem'], 'readwrite');
                        var problemOs = problemTransaction.objectStore('problem');
                        var problemRequest = problemOs.getAll();
                        var problemList = []
                        problemRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                            if (this.props.updateState != undefined) {
                                this.props.updateState(key, false);
                            }
                        }.bind(this);
                        problemRequest.onsuccess = function (e) {
                            var planningUnitResult = [];
                            planningUnitResult = planningunitRequest.result;
                            var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
                            var puOs = puTransaction.objectStore('planningUnit');
                            var puRequest = puOs.getAll();
                            var puList = []
                            puRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext')
                                })
                                if (this.props.updateState != undefined) {
                                    this.props.updateState(key, false);
                                }
                            }.bind(this);
                            puRequest.onsuccess = function (e) {
                                var planningUnitListAll = puRequest.result;
                                if (programList.length == 0) {
                                    if (this.props.updateState != undefined) {
                                        this.props.updateState(key, false);
                                    }
                                }
                                var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                var papuOs = papuTransaction.objectStore('procurementAgent');
                                var papuRequest = papuOs.getAll();
                                papuRequest.onerror = function (event) {
                                    this.setState({
                                        supplyPlanError: i18n.t('static.program.errortext'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    })
                                    this.hideFirstComponent()
                                }.bind(this);
                                papuRequest.onsuccess = function (event) {
                                    var papuResult = [];
                                    papuResult = papuRequest.result;
                                    var procurementAgentListForProblemActionreport = papuResult;
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
                                        var realm = realmRequest.result;
                                        var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                                        var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                                        var problemStatusGetRequest = problemStatusOs.getAll();
                                        problemStatusGetRequest.onerror = function (event) {
                                            this.setState({
                                                supplyPlanError: i18n.t('static.program.errortext'),
                                                loading: false,
                                                color: "#BA0C2F"
                                            })
                                            this.hideFirstComponent()
                                        }.bind(this);
                                        problemStatusGetRequest.onsuccess = function (event) {
                                            var problemStatusList = [];
                                            problemStatusList = problemStatusGetRequest.result;
                                            var openProblemStatusObj = problemStatusList.filter(c => c.id == 1)[0];
                                            var incomplianceProblemStatusObj = problemStatusList.filter(c => c.id == 4)[0];
                                            var maxForMonths = 0;
                                            for (var pp = 0; pp < programList.length; pp++) {
                                                try {
                                                    var actionList = [];
                                                    var qplLastModifiedDate = programList[pp].generalData.qplLastModifiedDate;
                                                    var actionPlanningUnitIds = [];
                                                    var versionID = versionIDs[pp];
                                                    var problemActionIndex = 0;
                                                    problemActionList = programList[pp].generalData.problemReportList;
                                                    problemActionIndex = programList[pp].generalData.problemReportList.length;
                                                    actionList = programList[pp].generalData.actionList;
                                                    planningUnitListAll.filter(
                                                        c => c.active == false)
                                                        .map(m => {
                                                            actionPlanningUnitIds.push(parseInt(m.planningUnitId));
                                                        });
                                                    programPlanningUnitList.filter(
                                                        c => c.active == false && c.program.id == programList[pp].generalData.programId).map(m => {
                                                            actionPlanningUnitIds.push(parseInt(m.planningUnit.id));
                                                        });
                                                    programList[pp].generalData.problemReportList.filter(
                                                        c => c.planningUnitActive == false).map(m => {
                                                            actionPlanningUnitIds.push(parseInt(m.planningUnit.id));
                                                        });
                                                    actionList.map(actionObj => {
                                                        actionPlanningUnitIds.push(parseInt(actionObj.planningUnitId));
                                                    });
                                                    var regionIdArray = [];
                                                    var regionList = programList[pp].generalData.regionList;
                                                    regionList.map(rm => {
                                                        regionIdArray.push(parseInt(rm.regionId));
                                                    });
                                                    var problemReportIdForRegion = [];
                                                    problemActionList.filter(c =>
                                                        c.region != null && !regionIdArray.includes(parseInt(c.region.id)) && c.region.id != null && c.region.id != "" && c.problemReportId != 0 && c.region.id != 0).
                                                        map(m => {
                                                            problemReportIdForRegion.push(parseInt(m.problemReportId));
                                                        });
                                                    for (var pal = 0; pal < problemActionList.length; pal++) {
                                                        if (problemReportIdForRegion.includes(parseInt(problemActionList[pal].problemReportId))) {
                                                            problemActionList[pal].regionActive = false;
                                                        } else {
                                                            problemActionList[pal].regionActive = true;
                                                        }
                                                    }
                                                    problemList = problemRequest.result.filter(c =>
                                                        c.realm.id == programList[pp].generalData.realmCountry.realm.realmId
                                                        && c.active.toString() == "true");
                                                    planningUnitList = planningUnitResult.filter(c =>
                                                        c.program.id == programList[pp].generalData.programId
                                                    );
                                                    if (!buildFullQPL && moment(qplLastModifiedDate).format("YYYY-MM") >= moment(curDate).format("YYYY-MM") && moment(qplLastModifiedDate).format("YYYY-MM-DD") >= moment(curDate).format("YYYY-MM-DD")) {
                                                        planningUnitList = planningUnitList.filter(c =>
                                                            actionPlanningUnitIds.includes(c.planningUnit.id)
                                                            || moment(c.createdDate).format("YYYY-MM-DD") >= moment(qplLastModifiedDate).format("YYYY-MM-DD")
                                                        );
                                                    }
                                                    var curDate = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'));
                                                    var curMonth = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM'));
                                                    for (var p = 0; p < planningUnitList.length; p++) {
                                                        var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitList[p].planningUnit.id);
                                                        var programJsonForPlanningUnit = {}
                                                        if (planningUnitDataIndex != -1) {
                                                            var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitList[p].planningUnit.id))[0];
                                                            var programDataForPlanningUnitBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                                            var programDataForPlanningUnit = programDataForPlanningUnitBytes.toString(CryptoJS.enc.Utf8);
                                                            programJsonForPlanningUnit = JSON.parse(programDataForPlanningUnit);
                                                        } else {
                                                            programJsonForPlanningUnit = {
                                                                consumptionList: [],
                                                                inventoryList: [],
                                                                shipmentList: [],
                                                                batchInfoList: [],
                                                                supplyPlan: []
                                                            }
                                                        }
                                                        var checkPlanningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitList[p].planningUnit.id)[0];
                                                        var checkProgramPlanningUnitObj = planningUnitList[p];
                                                        if (checkPlanningUnitObj.active == true && checkProgramPlanningUnitObj.active == true) {
                                                            for (var pal = 0; pal < problemActionList.length; pal++) {
                                                                if (problemActionList[pal].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[pal].planningUnitActive == false) {
                                                                    problemActionList[pal].planningUnitActive = true;
                                                                }
                                                            }
                                                            var shipmentListForMonths = programJsonForPlanningUnit.shipmentList.filter(c =>
                                                                c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                && c.active.toString() == "true"
                                                                && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS
                                                                && c.accountFlag.toString() == "true");
                                                            var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                            var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                                                            if (DEFAULT_MIN_MONTHS_OF_STOCK > planningUnitList[p].minMonthsOfStock) {
                                                                maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                                            } else {
                                                                maxForMonths = planningUnitList[p].minMonthsOfStock
                                                            }
                                                            var minStockMoSQty = parseInt(maxForMonths);
                                                            var minForMonths = 0;
                                                            var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                                            if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + planningUnitList[p].reorderFrequencyInMonths)) {
                                                                minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                                            } else {
                                                                minForMonths = (maxForMonths + planningUnitList[p].reorderFrequencyInMonths);
                                                            }
                                                            var maxStockMoSQty = parseInt(minForMonths);
                                                            if (maxStockMoSQty < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                                                                maxStockMoSQty = DEFAULT_MIN_MAX_MONTHS_OF_STOCK;
                                                            }
                                                            var actionTypeIds = [];
                                                            var filteredActionListForType = actionList.filter(c => c.planningUnitId == planningUnitList[p].planningUnit.id);
                                                            filteredActionListForType.map(actionForTypeObj => {
                                                                actionTypeIds.push(parseInt(actionForTypeObj.type));
                                                            });
                                                            var typeProblemList = problemList;
                                                            if (!buildFullQPL && moment(qplLastModifiedDate).format("YYYY-MM") >= moment(curDate).format("YYYY-MM") && !(moment(planningUnitList[p].createdDate).format("YYYY-MM-DD") >= moment(qplLastModifiedDate).format("YYYY-MM-DD"))) {
                                                                typeProblemList = problemList.filter(
                                                                    c =>
                                                                        (actionTypeIds.includes(FORECASTED_CONSUMPTION_MODIFIED) && c.problem.forecastedConsumptionTrigger) ||
                                                                        (actionTypeIds.includes(ACTUAL_CONSUMPTION_MODIFIED) && c.problem.actualConsumptionTrigger) ||
                                                                        (actionTypeIds.includes(INVENTORY_MODIFIED) && c.problem.inventoryTrigger) ||
                                                                        (actionTypeIds.includes(ADJUSTMENT_MODIFIED) && c.problem.adjustmentTrigger) ||
                                                                        (actionTypeIds.includes(SHIPMENT_MODIFIED) && c.problem.shipmentTrigger) ||
                                                                        (moment(qplLastModifiedDate).format("YYYY-MM-DD") < moment(curDate).format("YYYY-MM-DD") && c.problem.shipmentTrigger)
                                                                );
                                                            }
                                                            var shipmentQplPassed=true;
                                                            for (var prob = 0; prob < typeProblemList.length; prob++) {
                                                                switch (typeProblemList[prob].problem.problemId) {
                                                                    case 1:
                                                                        for (var r = 0; r < regionList.length; r++) {
                                                                            var consumptionList = programJsonForPlanningUnit.consumptionList;
                                                                            var numberOfMonths = parseInt(typeProblemList[prob].data1);
                                                                            var numberOfMonthsData2 = parseInt(typeProblemList[prob].data2);
                                                                            var myStartDate = moment(curDate).subtract(numberOfMonths, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var myEndDate = moment(curDate).endOf('month').format("YYYY-MM-DD");
                                                                            var startDateForSixMonthRange = moment(curDate).subtract(numberOfMonthsData2, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var endDateForSixMonthRange = moment(curDate).subtract(numberOfMonths + 1, 'months').endOf('month').format("YYYY-MM-DD")
                                                                            var filteredConsumptionList = consumptionList.filter(c =>
                                                                                moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDate
                                                                                && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDate
                                                                                && c.actualFlag.toString() == "true"
                                                                                && c.active.toString() == "true"
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                            var filteredConsumptionListForSixMonthRange = consumptionList.filter(c =>
                                                                                moment(c.consumptionDate).format('YYYY-MM-DD') >= startDateForSixMonthRange
                                                                                && moment(c.consumptionDate).format('YYYY-MM-DD') <= endDateForSixMonthRange
                                                                                && c.actualFlag.toString() == "true"
                                                                                && c.active.toString() == "true"
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.region != null &&
                                                                                    c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == 1
                                                                            );
                                                                            if (filteredConsumptionList.length == 0) {
                                                                                var causeJson = [];
                                                                                var actualConsumptionMonth = {};
                                                                                actualConsumptionMonth["actualConsumptionMonth"] = filteredConsumptionListForSixMonthRange.length > 0 ? moment(filteredConsumptionListForSixMonthRange[filteredConsumptionListForSixMonthRange.length - 1].consumptionDate).format("MMM-YY") : "";
                                                                                causeJson.push(actualConsumptionMonth);
                                                                                for (var m = numberOfMonths; m > 0; m--) {
                                                                                    var curMonthInLoop = moment(curDate).subtract(m, 'months').startOf('month').format("MMM-YY");
                                                                                    var item = {}
                                                                                    item["noActualConsumptionMonth"] = curMonthInLoop;
                                                                                    causeJson.push(item);
                                                                                }
                                                                                if (index == -1) {
                                                                                    createDataQualityProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], causeJson, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(causeJson);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 2:
                                                                        for (var r = 0; r < regionList.length; r++) {
                                                                            var inventoryList = programJsonForPlanningUnit.inventoryList;
                                                                            var numberOfMonthsInventory = parseInt(typeProblemList[prob].data1);
                                                                            var numberOfMonthsInventoryData2 = parseInt(typeProblemList[prob].data2);
                                                                            var myStartDateInventory = moment(curDate).subtract(numberOfMonthsInventory, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var myEndDateInventory = moment(curDate).endOf('month').format("YYYY-MM-DD");
                                                                            var startDateForSixMonthRange = moment(curDate).subtract(numberOfMonthsInventoryData2, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var endDateForSixMonthRange = moment(curDate).subtract(numberOfMonthsInventory + 1, 'months').endOf('month').format("YYYY-MM-DD")
                                                                            var filterInventoryList = inventoryList.filter(c => moment(c.inventoryDate).format('YYYY-MM-DD') >= myStartDateInventory
                                                                                && moment(c.inventoryDate).format('YYYY-MM-DD') <= myEndDateInventory
                                                                                && c.active.toString() == "true"
                                                                                && c.region != null
                                                                                && c.region.id != 0
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                && c.actualQty != undefined
                                                                                && c.actualQty != null
                                                                                && c.actualQty !== ""
                                                                            );
                                                                            var filterInventoryListForSixMonthRange = inventoryList.filter(c => moment(c.inventoryDate).format('YYYY-MM-DD') >= startDateForSixMonthRange
                                                                                && moment(c.inventoryDate).format('YYYY-MM-DD') <= endDateForSixMonthRange
                                                                                && c.active.toString() == "true"
                                                                                && c.region != null
                                                                                && c.region.id != 0
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                && c.actualQty != undefined
                                                                                && c.actualQty != null
                                                                                && c.actualQty !== ""
                                                                            );
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.region != null &&
                                                                                    c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == 2
                                                                            );
                                                                            if (filterInventoryList.length == 0) {
                                                                                var causeJson = [];
                                                                                var inventoryMonth = {};
                                                                                inventoryMonth["inventoryMonth"] = filterInventoryListForSixMonthRange.length > 0 ? moment(filterInventoryListForSixMonthRange[filterInventoryListForSixMonthRange.length - 1].inventoryDate).format("MMM-YY") : "";
                                                                                causeJson.push(inventoryMonth);
                                                                                for (var m = numberOfMonthsInventory; m > 0; m--) {
                                                                                    var curMonthInLoop = moment(curDate).subtract(m, 'months').startOf('month').format("MMM-YY");
                                                                                    var item = {}
                                                                                    item["noInventoryMonth"] = curMonthInLoop;
                                                                                    causeJson.push(item);
                                                                                }
                                                                                if (index == -1) {
                                                                                    createDataQualityProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], causeJson, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(causeJson);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 3:
                                                                        var myDateShipment = curDate;
                                                                        var filteredShipmentList = shipmentListForMonths.filter(c =>
                                                                            moment(c.expectedDeliveryDate).add(parseInt(typeProblemList[prob].data1), 'days').format('YYYY-MM-DD') < moment(myDateShipment).format('YYYY-MM-DD')
                                                                            && c.shipmentStatus.id != 7
                                                                            && c.shipmentId != 0
                                                                        );
                                                                        shipmentQplPassed=shipmentListForMonths.filter(c =>
                                                                            moment(c.expectedDeliveryDate).format('YYYY-MM-DD') < moment(myDateShipment).format('YYYY-MM-DD')
                                                                            && c.shipmentStatus.id != 7
                                                                            && c.shipmentId != 0
                                                                        ).length>0?false:shipmentQplPassed;
                                                                        if (filteredShipmentList.length > 0) {
                                                                            var shipmentIdsFromShipmnetList = [];
                                                                            for (var s = 0; s < filteredShipmentList.length; s++) {
                                                                                var shipmentDetailsJson = {}
                                                                                shipmentDetailsJson["procurementAgentCode"] = filteredShipmentList[s].procurementAgent.code;
                                                                                shipmentDetailsJson["orderNo"] = filteredShipmentList[s].orderNo;
                                                                                shipmentDetailsJson["shipmentQuantity"] = filteredShipmentList[s].shipmentQty;
                                                                                shipmentDetailsJson["shipmentDate"] = filteredShipmentList[s].receivedDate == null || filteredShipmentList[s].receivedDate == "" ? filteredShipmentList[s].expectedDeliveryDate : filteredShipmentList[s].receivedDate;
                                                                                shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                                var indexShipment = 0;
                                                                                var newAddShipment = false;
                                                                                indexShipment = problemActionList.findIndex(
                                                                                    c => c.program.id == programList[pp].generalData.programId
                                                                                        && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                        && c.realmProblem.problem.problemId == 3
                                                                                );
                                                                                if (indexShipment == -1) {
                                                                                    var index = 0;
                                                                                    createProcurementScheduleProblems(programList[pp].generalData, versionID, typeProblemList[prob], planningUnitList[p], filteredShipmentList[s].shipmentId, newAddShipment, problemActionIndex, userId, username, problemActionList, shipmentDetailsJson, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    problemActionList[indexShipment].data5 = JSON.stringify(shipmentDetailsJson);
                                                                                    if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                                        openProblem(indexShipment, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            }
                                                                            var problemActionListForShipments = problemActionList.filter(c => c.realmProblem.problem.problemId == 3 && c.program.id == programList[pp].generalData.programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0)
                                                                            for (var fsl = 0; fsl < problemActionListForShipments.length; fsl++) {
                                                                                var fslShipmentId = problemActionListForShipments[fsl].shipmentId
                                                                                if (!shipmentIdsFromShipmnetList.includes(fslShipmentId)) {
                                                                                    var notIncludedShipmentIndex = problemActionList.findIndex(c =>
                                                                                        c.realmProblem.problem.problemId == 3
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                        && (c.problemStatus.id == 1 || c.problemStatus.id == 3)
                                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                        && c.shipmentId != 0 &&
                                                                                        c.shipmentId == fslShipmentId);
                                                                                    incomplianceProblem(notIncludedShipmentIndex, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var problemActionListForShipmentsIncompliance = problemActionList.filter(c => c.realmProblem.problem.problemId == 3 && c.program.id == programList[pp].generalData.programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0);
                                                                            for (var d = 0; d < problemActionListForShipmentsIncompliance.length; d++) {
                                                                                var fslShipmentIdInCompliance = problemActionListForShipmentsIncompliance[d].shipmentId;
                                                                                var notIncludedShipmentIndexIncompliance = problemActionList.findIndex(c =>
                                                                                    c.realmProblem.problem.problemId == 3
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && (c.problemStatus.id == 1 || c.problemStatus.id == 3)
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.shipmentId != 0 &&
                                                                                    c.shipmentId == fslShipmentIdInCompliance);
                                                                                incomplianceProblem(notIncludedShipmentIndexIncompliance, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 4:
                                                                        var myDateShipment = curDate;
                                                                        var filteredShipmentList = shipmentListForMonths.filter(c =>
                                                                            (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)
                                                                            && c.shipmentId != 0
                                                                        );
                                                                        if (filteredShipmentList.length > 0) {
                                                                            var shipmentIdsFromShipmnetList = [];
                                                                            for (var s = 0; s < filteredShipmentList.length; s++) {
                                                                                var papuResult = procurementAgentListForProblemActionreport.filter(c => c.procurementAgentId == filteredShipmentList[s].procurementAgent.id)[0];
                                                                                var submittedDate = filteredShipmentList[s].submittedDate;
                                                                                var approvedDate = filteredShipmentList[s].approvedDate;
                                                                                var shippedDate = filteredShipmentList[s].shippedDate;
                                                                                var arrivedDate = filteredShipmentList[s].arrivedDate;
                                                                                var expectedDeliveryDate = filteredShipmentList[s].expectedDeliveryDate;
                                                                                if (filteredShipmentList[s].localProcurement) {
                                                                                    var ppu=programPlanningUnitList.filter(c =>
                                                                                        c.planningUnit.id == filteredShipmentList[s].planningUnit.id
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                    );
                                                                                    var programPriceList=ppu[0].programPlanningUnitProcurementAgentPrices.filter(c => c.program.id == programList[pp].generalData.programId && c.procurementAgent.id == filteredShipmentList[s].procurementAgent.id && c.active)
                                                                                    var addLeadTimes = ppu[0].localProcurementLeadTime;
                                                                                    if(programPriceList.length>0){
                                                                                        var programPAPU=programPriceList.filter(c=>c.planningUnit.id == filteredShipmentList[s].planningUnit.id);
                                                                                        if(programPAPU.length>0 && programPAPU[0].localProcurementLeadTime!==null){
                                                                                            addLeadTimes=programPAPU[0].localProcurementLeadTime;
                                                                                        }else{
                                                                                            var programPA=programPriceList.filter(c=>c.planningUnit.id == -1);
                                                                                            if(programPA.length>0 && programPA[0].localProcurementLeadTime!==null){
                                                                                                addLeadTimes=programPA[0].localProcurementLeadTime;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    var leadTimesPerStatus = addLeadTimes / 5;
                                                                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                    shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                    approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                    submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                } else {
                                                                                    var ppu=programPlanningUnitList.filter(c =>
                                                                                        c.planningUnit.id == filteredShipmentList[s].planningUnit.id
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                    );
                                                                                    var programPriceList=ppu[0].programPlanningUnitProcurementAgentPrices.filter(c => c.program.id == programList[pp].generalData.programId && c.procurementAgent.id == filteredShipmentList[s].procurementAgent.id && c.active)
                                                                                    var ppUnit = papuResult;
                                                                                    var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                                                                                    if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                                                                        submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                                                                                    }
                                                                                    if(programPriceList.length>0){
                                                                                        var programPAPU=programPriceList.filter(c=>c.planningUnit.id == filteredShipmentList[s].planningUnit.id);
                                                                                        if(programPAPU.length>0 && programPAPU[0].submittedToApprovedLeadTime!==null){
                                                                                            submittedToApprovedLeadTime=programPAPU[0].submittedToApprovedLeadTime;
                                                                                        }else{
                                                                                            var programPA=programPriceList.filter(c=>c.planningUnit.id == -1);
                                                                                            if(programPA.length>0 && programPA[0].submittedToApprovedLeadTime!==null){
                                                                                                submittedToApprovedLeadTime=programPA[0].submittedToApprovedLeadTime;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    var approvedToShippedLeadTime = "";
                                                                                    approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                                                                                    if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                                                                        approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                                                                                    }
                                                                                    if(programPriceList.length>0){
                                                                                        var programPAPU=programPriceList.filter(c=>c.planningUnit.id == filteredShipmentList[s].planningUnit.id);
                                                                                        if(programPAPU.length>0 && programPAPU[0].approvedToShippedLeadTime!==null){
                                                                                            approvedToShippedLeadTime=programPAPU[0].approvedToShippedLeadTime;
                                                                                        }else{
                                                                                            var programPA=programPriceList.filter(c=>c.planningUnit.id == -1);
                                                                                            if(programPA.length>0 && programPA[0].approvedToShippedLeadTime!==null){
                                                                                                approvedToShippedLeadTime=programPA[0].approvedToShippedLeadTime;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    var shippedToArrivedLeadTime = ""
                                                                                    if (filteredShipmentList[s].shipmentMode == "Air") {
                                                                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                                                                                        if(programPriceList.length>0){
                                                                                            var programPAPU=programPriceList.filter(c=>c.planningUnit.id == filteredShipmentList[s].planningUnit.id);
                                                                                            if(programPAPU.length>0 && programPAPU[0].shippedToArrivedByAirLeadTime!==null){
                                                                                                shippedToArrivedLeadTime=programPAPU[0].shippedToArrivedByAirLeadTime;
                                                                                            }else{
                                                                                                var programPA=programPriceList.filter(c=>c.planningUnit.id == -1);
                                                                                                if(programPA.length>0 && programPA[0].shippedToArrivedByAirLeadTime!==null){
                                                                                                    shippedToArrivedLeadTime=programPA[0].shippedToArrivedByAirLeadTime;
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    } else if (filteredShipmentList[s].shipmentMode == "Road") {
                                                                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByRoadLeadTime);
                                                                                        if(programPriceList.length>0){
                                                                                            var programPAPU=programPriceList.filter(c=>c.planningUnit.id == filteredShipmentList[s].planningUnit.id);
                                                                                            if(programPAPU.length>0 && programPAPU[0].shippedToArrivedByRoadLeadTime!==null){
                                                                                                shippedToArrivedLeadTime=programPAPU[0].shippedToArrivedByRoadLeadTime;
                                                                                            }else{
                                                                                                var programPA=programPriceList.filter(c=>c.planningUnit.id == -1);
                                                                                                if(programPA.length>0 && programPA[0].shippedToArrivedByRoadLeadTime!==null){
                                                                                                    shippedToArrivedLeadTime=programPA[0].shippedToArrivedByRoadLeadTime;
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    } else {
                                                                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                                                                                        if(programPriceList.length>0){
                                                                                            var programPAPU=programPriceList.filter(c=>c.planningUnit.id == filteredShipmentList[s].planningUnit.id);
                                                                                            if(programPAPU.length>0 && programPAPU[0].shippedToArrivedBySeaLeadTime!==null){
                                                                                                shippedToArrivedLeadTime=programPAPU[0].shippedToArrivedBySeaLeadTime;
                                                                                            }else{
                                                                                                var programPA=programPriceList.filter(c=>c.planningUnit.id == -1);
                                                                                                if(programPA.length>0 && programPA[0].shippedToArrivedBySeaLeadTime!==null){
                                                                                                    shippedToArrivedLeadTime=programPA[0].shippedToArrivedBySeaLeadTime;
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    var arrivedToDeliveredLeadTime=programJson.arrivedToDeliveredLeadTime;
                                                                                    if(programPriceList.length>0){
                                                                                        var programPAPU=programPriceList.filter(c=>c.planningUnit.id == filteredShipmentList[s].planningUnit.id);
                                                                                        if(programPAPU.length>0 && programPAPU[0].arrivedToDeliveredLeadTime!==null){
                                                                                            arrivedToDeliveredLeadTime=programPAPU[0].arrivedToDeliveredLeadTime;
                                                                                        }else{
                                                                                            var programPA=programPriceList.filter(c=>c.planningUnit.id == -1);
                                                                                            if(programPA.length>0 && programPA[0].arrivedToDeliveredLeadTime!==null){
                                                                                                arrivedToDeliveredLeadTime=programPA[0].arrivedToDeliveredLeadTime;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                    shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                    approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                    submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                }
                                                                                var shipmentDetailsJson = {}
                                                                                shipmentDetailsJson["procurementAgentCode"] = filteredShipmentList[s].procurementAgent.code;
                                                                                shipmentDetailsJson["orderNo"] = filteredShipmentList[s].orderNo;
                                                                                shipmentDetailsJson["shipmentQuantity"] = filteredShipmentList[s].shipmentQty;
                                                                                shipmentDetailsJson["shipmentDate"] = filteredShipmentList[s].receivedDate == null || filteredShipmentList[s].receivedDate == "" ? filteredShipmentList[s].expectedDeliveryDate : filteredShipmentList[s].receivedDate;
                                                                                shipmentDetailsJson["submittedDate"] = submittedDate;
                                                                                if ((moment(submittedDate).format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD"))) {
                                                                                    shipmentQplPassed=false;
                                                                                }
                                                                                if ((moment(submittedDate).add(parseInt(typeProblemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD"))) {
                                                                                    shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                                    var indexShipment = 0;
                                                                                    var newAddShipment = false;
                                                                                    indexShipment = problemActionList.findIndex(
                                                                                        c => c.program.id == programList[pp].generalData.programId
                                                                                            && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                            && c.realmProblem.problem.problemId == 4
                                                                                    );
                                                                                    if (indexShipment == -1) {
                                                                                        var index = 0;
                                                                                        createProcurementScheduleProblems(programList[pp].generalData, versionID, typeProblemList[prob], planningUnitList[p], filteredShipmentList[s].shipmentId, newAddShipment, problemActionIndex, userId, username, problemActionList, shipmentDetailsJson, openProblemStatusObj);
                                                                                        problemActionIndex++;
                                                                                    } else {
                                                                                        problemActionList[indexShipment].data5 = JSON.stringify(shipmentDetailsJson);
                                                                                        if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                                            openProblem(indexShipment, username, userId, problemActionList, openProblemStatusObj);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            var problemActionListForShipments = problemActionList.filter(c => c.realmProblem.problem.problemId == 4 && c.program.id == programList[pp].generalData.programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0)
                                                                            for (var fsl = 0; fsl < problemActionListForShipments.length; fsl++) {
                                                                                var fslShipmentId = problemActionListForShipments[fsl].shipmentId
                                                                                if (!shipmentIdsFromShipmnetList.includes(fslShipmentId)) {
                                                                                    var notIncludedShipmentIndex = problemActionList.findIndex(c =>
                                                                                        c.realmProblem.problem.problemId == 4
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                        && (c.problemStatus.id == 1 || c.problemStatus.id == 3)
                                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                        && c.shipmentId != 0 &&
                                                                                        c.shipmentId == fslShipmentId);
                                                                                    incomplianceProblem(notIncludedShipmentIndex, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var problemActionListForShipmentsIncompliance = problemActionList.filter(c => c.realmProblem.problem.problemId == 4 && c.program.id == programList[pp].generalData.programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0);
                                                                            for (var d = 0; d < problemActionListForShipmentsIncompliance.length; d++) {
                                                                                var fslShipmentIdInCompliance = problemActionListForShipmentsIncompliance[d].shipmentId;
                                                                                var notIncludedShipmentIndexIncompliance = problemActionList.findIndex(c =>
                                                                                    c.realmProblem.problem.problemId == 4
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && (c.problemStatus.id == 1 || c.problemStatus.id == 3)
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.shipmentId != 0 &&
                                                                                    c.shipmentId == fslShipmentIdInCompliance);
                                                                                incomplianceProblem(notIncludedShipmentIndexIncompliance, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 8:
                                                                        for (var r = 0; r < regionList.length; r++) {
                                                                            var consumptionList = programJsonForPlanningUnit.consumptionList;
                                                                            var numberOfMonthsInFunture = parseInt(typeProblemList[prob].data1);
                                                                            var myStartDateFuture = moment(curDate).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var myEndDateFuture = moment(curDate).add(numberOfMonthsInFunture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                            var filteredConsumptionListTwo = consumptionList.filter(c =>
                                                                                moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDateFuture
                                                                                && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDateFuture
                                                                                && c.actualFlag.toString() == "false"
                                                                                && c.active.toString() == "true"
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            );
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.region != null &&
                                                                                    c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == 8
                                                                            );
                                                                            var monthsWithForecastedConsumption = [];
                                                                            for (var fcm = 0; fcm < filteredConsumptionListTwo.length; fcm++) {
                                                                                monthsWithForecastedConsumption.push(moment(filteredConsumptionListTwo[fcm].consumptionDate).format("MMM-YY"));
                                                                            }
                                                                            var eighteenmonthsArray = [];
                                                                            for (var ema = 1; ema <= numberOfMonthsInFunture; ema++) {
                                                                                eighteenmonthsArray.push(moment(curDate).add(ema, 'months').format("MMM-YY"));
                                                                            }
                                                                            var monthWithNoForecastedConsumption = eighteenmonthsArray.filter(function (obj) { return monthsWithForecastedConsumption.indexOf(obj) == -1; });
                                                                            if (filteredConsumptionListTwo.length < 18) {
                                                                                if (index == -1) {
                                                                                    createSupplyPlanningProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], monthWithNoForecastedConsumption, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(monthWithNoForecastedConsumption);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 10:
                                                                    case 14:
                                                                    case 15:
                                                                        for (var r = 0; r < regionList.length; r++) {
                                                                            var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitList[p].planningUnit.id)[0];
                                                                            var numberOfMonthsInFuture = parseInt(typeProblemList[prob].data1);
                                                                            var tracerCategories = typeProblemList[prob].data3;
                                                                            var tracerArray = [];
                                                                            if (tracerCategories != null && tracerCategories != "") {
                                                                                var tracerSplit = tracerCategories.split(',');
                                                                                for (var t = 0; t < tracerSplit.length; t++) {
                                                                                    tracerArray.push(parseInt(tracerSplit[t]));
                                                                                }
                                                                            }
                                                                            if (tracerArray.includes(planningUnitObj.forecastingUnit.tracerCategory.id)) {
                                                                                var consumptionList = programJsonForPlanningUnit.consumptionList;
                                                                                var myStartDate = moment(curDate).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                                var myEndDate = moment(curDate).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                                consumptionList = consumptionList.filter(c =>
                                                                                    c.consumptionDate >= myStartDate
                                                                                    && c.consumptionDate <= myEndDate
                                                                                    && c.active.toString() == "true"
                                                                                    && c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.consumptionQty!=0);
                                                                                var index = problemActionList.findIndex(
                                                                                    c =>
                                                                                        c.region != null &&
                                                                                        c.region.id == regionList[r].regionId
                                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                        && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                                );
                                                                                if (consumptionList.length > parseInt(typeProblemList[prob].data2)) {
                                                                                    var conQtyArray = [];
                                                                                    for (var i = 0; i < consumptionList.length; i++) {
                                                                                        var item = {}
                                                                                        item["consumptionQty"] = consumptionList[i].consumptionQty;
                                                                                        item["month"] = consumptionList[i].consumptionDate;
                                                                                        conQtyArray.push(item);
                                                                                    }
                                                                                    var a = conQtyArray;
                                                                                    var check = false;
                                                                                    var currArray = [];
                                                                                    var curMonthArray = [];
                                                                                    var spanLength = parseInt(typeProblemList[prob].data2) - 1;
                                                                                    var cause = [];
                                                                                    for (var i = 0; i < a.length - spanLength; i++) {
                                                                                        var causeItem = {};
                                                                                        var currArray = [];
                                                                                        var curMonthArray = [];
                                                                                        for (var j = 0; j < parseInt(typeProblemList[prob].data2); j++) {
                                                                                            currArray.push(a[i + j].consumptionQty);
                                                                                            curMonthArray.push(moment(a[i + j].month).format("MMM-YY"));
                                                                                        }
                                                                                        const allEqual = arr => arr.every(v => v === arr[0]);
                                                                                        if (allEqual(currArray)) {
                                                                                            causeItem["consumptionValue"] = currArray[0];
                                                                                            causeItem["monthRange"] = curMonthArray;
                                                                                            cause.push(causeItem);
                                                                                            check = true;
                                                                                            i = i + 3;
                                                                                        } else {
                                                                                            check = false;
                                                                                        }
                                                                                    }
                                                                                    if (cause.length > 0) {
                                                                                        if (index == -1) {
                                                                                            createSupplyPlanningProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], cause, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                            problemActionIndex++;
                                                                                        } else {
                                                                                            problemActionList[index].dt = curDate;
                                                                                            problemActionList[index].data5 = JSON.stringify(cause);
                                                                                            if (problemActionList[index].problemStatus.id == 4) {
                                                                                                openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                            incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                        }
                                                                                    }
                                                                                } else {
                                                                                }
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 23:
                                                                        if (planningUnitList[p].planBasedOn == 1) {
                                                                            var region = {};
                                                                            region["regionId"] = 0;
                                                                            region["label"] = {};
                                                                            var monthWithMosLessThenMinWithing6months = [];
                                                                            var monthWithMosAboveThenMinWithing6months = [];
                                                                            var filteredShipmentListWithin6Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('YYYY-MM'));
                                                                            var monthWithMosLessThenMinWithing7to18months = [];
                                                                            var monthWithMosAboveThenMaxWithing7to18months = [];
                                                                            var filteredShipmentListWithin7to18Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('YYYY-MM'));
                                                                            var toleranceNoOfMonthsBelowMin = realm.minQplTolerance;
                                                                            var toleranceCutoffMinMoS = realm.minQplToleranceCutOff;
                                                                            var toleranceNoOfMonthsOverMax = realm.maxQplTolerance;
                                                                            for (var mosCounter = 1; mosCounter <= parseInt(typeProblemList[prob].data1); mosCounter++) {
                                                                                var m = moment(curDate).add(mosCounter, 'months');
                                                                                var supplyPlanJson = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                    c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                    && moment(c.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"));
                                                                                var mos = "";
                                                                                var maxForMonths = "";
                                                                                var minForMonths = "";
                                                                                if (supplyPlanJson.length > 0 && supplyPlanJson[0].mos != null) {
                                                                                    mos = Number(supplyPlanJson[0].mos);
                                                                                    maxForMonths = maxStockMoSQty;
                                                                                    minForMonths = minStockMoSQty;
                                                                                    if (minForMonths <= parseInt(toleranceCutoffMinMoS)) {
                                                                                        if (mos < minForMonths && mos != 0) {
                                                                                            monthWithMosLessThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                        }
                                                                                    } else {
                                                                                        if (mos < (minForMonths - parseInt(toleranceNoOfMonthsBelowMin)) && mos != 0) {
                                                                                            monthWithMosLessThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                        }
                                                                                    }
                                                                                    if (mos > (maxForMonths + parseInt(toleranceNoOfMonthsOverMax)) && mos != 0) {
                                                                                        monthWithMosAboveThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                    }
                                                                                }
                                                                            }
                                                                            for (var mosCounter7to18 = parseInt(typeProblemList[prob].data1) + 1; mosCounter7to18 <= parseInt(typeProblemList[prob].data2); mosCounter7to18++) {
                                                                                var m7to18 = moment(curDate).add(mosCounter7to18, 'months');
                                                                                var supplyPlanJson7to18 = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                    c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                    && moment(c.transDate).format("YYYY-MM") == moment(m7to18).format("YYYY-MM"));
                                                                                var mos7to18 = "";
                                                                                var maxForMonths7to18 = "";
                                                                                var minForMonths7to18 = "";
                                                                                if (supplyPlanJson7to18.length > 0 && supplyPlanJson7to18[0].mos != null) {
                                                                                    mos7to18 = Number(supplyPlanJson7to18[0].mos);
                                                                                    maxForMonths7to18 = maxStockMoSQty;
                                                                                    minForMonths7to18 = minStockMoSQty;
                                                                                    if (minForMonths7to18 <= parseInt(toleranceCutoffMinMoS)) {
                                                                                        if (mos7to18 < minForMonths7to18 && mos7to18 != 0) {
                                                                                            monthWithMosLessThenMinWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                        }
                                                                                    } else {
                                                                                        if (mos7to18 < (minForMonths7to18 - parseInt(toleranceNoOfMonthsBelowMin)) && mos7to18 != 0) {
                                                                                            monthWithMosLessThenMinWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                        }
                                                                                    }
                                                                                    if (mos7to18 > (maxForMonths7to18 + parseInt(toleranceNoOfMonthsOverMax)) && mos7to18 != 0) {
                                                                                        monthWithMosAboveThenMaxWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                    }
                                                                                }
                                                                            }
                                                                            var cause = {};
                                                                            cause["monthWithMosLessThenMinWithing6months"] = monthWithMosLessThenMinWithing6months.length;
                                                                            cause["monthWithMosAboveThenMaxWithing6months"] = monthWithMosAboveThenMinWithing6months.length;
                                                                            cause["monthWithMosLessThenMinWithing7to18months"] = monthWithMosLessThenMinWithing7to18months.length;
                                                                            cause["monthWithMosAboveThenMaxWithing7to18months"] = monthWithMosAboveThenMaxWithing7to18months.length;
                                                                            cause["shipmentListWithin6Months"] = filteredShipmentListWithin6Months.length;
                                                                            cause["shipmentListWithin7to18Months"] = filteredShipmentListWithin7to18Months.length;
                                                                            cause["range1to6months"] = moment(curDate).add(1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('MMM-YY');
                                                                            cause["range7to18months"] = moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('MMM-YY');
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                            );
                                                                            if (monthWithMosLessThenMinWithing6months.length > 0 || monthWithMosAboveThenMinWithing6months.length > 0 || monthWithMosLessThenMinWithing7to18months.length > 0 || monthWithMosAboveThenMaxWithing7to18months.length > 0) {
                                                                                if (index == -1) {
                                                                                    createMinMaxProblems(programList[pp].generalData, versionID, typeProblemList[prob], region, planningUnitList[p], cause, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(cause);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].generalData.programId) {
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }else{
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                            );
                                                                            if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].generalData.programId) {
                                                                                incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 24:
                                                                        var region = {};
                                                                        region["regionId"] = 0;
                                                                        region["label"] = {};
                                                                        var stockoutsWithing6months = [];
                                                                        var filteredShipmentListWithin6Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('YYYY-MM'));
                                                                        var stockoutsWithing7to18months = [];
                                                                        var filteredShipmentListWithin7to18Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('YYYY-MM'));
                                                                        for (var mosCounter = 1; mosCounter <= parseInt(typeProblemList[prob].data1); mosCounter++) {
                                                                            var m = moment(curDate).add(mosCounter, 'months');
                                                                            var supplyPlanJson = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                && moment(c.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"));
                                                                            var mos = "";
                                                                            if (supplyPlanJson.length > 0 && supplyPlanJson[0].mos != null) {
                                                                                mos = Number(supplyPlanJson[0].mos);
                                                                                if (mos == 0) {
                                                                                    stockoutsWithing6months.push(moment(m).format('MMM-YY'));
                                                                                }
                                                                            }
                                                                        }
                                                                        for (var mosCounter7to18 = parseInt(typeProblemList[prob].data1) + 1; mosCounter7to18 <= parseInt(typeProblemList[prob].data2); mosCounter7to18++) {
                                                                            var m7to18 = moment(curDate).add(mosCounter7to18, 'months');
                                                                            var supplyPlanJson7to18 = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                && moment(c.transDate).format("YYYY-MM") == moment(m7to18).format("YYYY-MM"));
                                                                            var mos7to18 = "";
                                                                            if (supplyPlanJson7to18.length > 0 && supplyPlanJson7to18[0].mos != null) {
                                                                                mos7to18 = Number(supplyPlanJson7to18[0].mos);
                                                                                if (mos7to18 == 0) {
                                                                                    stockoutsWithing7to18months.push(moment(m7to18).format('MMM-YY'));
                                                                                }
                                                                            }
                                                                        }
                                                                        var cause = {};
                                                                        cause["stockoutsWithing6months"] = stockoutsWithing6months.length > 0 ? stockoutsWithing6months.toString() : "No months";
                                                                        cause["stockoutsWithing7to18months"] = stockoutsWithing7to18months.length > 0 ? stockoutsWithing7to18months.toString() : "No months";
                                                                        cause["shipmentListWithin6Months"] = filteredShipmentListWithin6Months.length;
                                                                        cause["shipmentListWithin7to18Months"] = filteredShipmentListWithin7to18Months.length;
                                                                        cause["range1to6months"] = moment(curDate).add(1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('MMM-YY');
                                                                        cause["range7to18months"] = moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('MMM-YY');
                                                                        var index = problemActionList.findIndex(
                                                                            c =>
                                                                                c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                && c.program.id == programList[pp].generalData.programId
                                                                                && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                        );
                                                                        if (stockoutsWithing6months.length > 0 || stockoutsWithing7to18months.length > 0) {
                                                                            if (index == -1) {
                                                                                createMinMaxProblems(programList[pp].generalData, versionID, typeProblemList[prob], region, planningUnitList[p], cause, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                problemActionIndex++;
                                                                            } else {
                                                                                problemActionList[index].dt = curDate;
                                                                                problemActionList[index].data5 = JSON.stringify(cause);
                                                                                if (problemActionList[index].problemStatus.id == 4) {
                                                                                    openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                }
                                                                            }
                                                                        } else {
                                                                            if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].generalData.programId) {
                                                                                incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 29:
                                                                        if (planningUnitList[p].planBasedOn == 2) {
                                                                            var region = {};
                                                                            region["regionId"] = 0;
                                                                            region["label"] = {};
                                                                            var monthWithMosLessThenMinWithing6months = [];
                                                                            var monthWithMosAboveThenMinWithing6months = [];
                                                                            var filteredShipmentListWithin6Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('YYYY-MM'));
                                                                            var monthWithMosLessThenMinWithing7to18months = [];
                                                                            var monthWithMosAboveThenMaxWithing7to18months = [];
                                                                            var filteredShipmentListWithin7to18Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('YYYY-MM'));
                                                                            var toleranceNoOfMonthsBelowMin = 0;
                                                                            var toleranceCutoffMinMoS = 0;
                                                                            var toleranceNoOfMonthsOverMax = 0;
                                                                            for (var mosCounter = 1; mosCounter <= parseInt(typeProblemList[prob].data1); mosCounter++) {
                                                                                var m = moment(curDate).add(mosCounter, 'months');
                                                                                var supplyPlanJson = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                    c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                    && moment(c.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"));
                                                                                var mos = "";
                                                                                var maxForMonths = "";
                                                                                var minForMonths = "";
                                                                                if (supplyPlanJson.length > 0 && supplyPlanJson[0].closingBalance != 0) {
                                                                                    mos = Number(supplyPlanJson[0].closingBalance);
                                                                                    maxForMonths = Number(supplyPlanJson[0].maxStock);
                                                                                    minForMonths = Number(supplyPlanJson[0].minStock);
                                                                                    if (minForMonths <= parseInt(toleranceCutoffMinMoS)) {
                                                                                        if (mos < minForMonths && mos != 0) {
                                                                                            monthWithMosLessThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                        }
                                                                                    } else {
                                                                                        if (mos < (minForMonths - parseInt(toleranceNoOfMonthsBelowMin)) && mos != 0) {
                                                                                            monthWithMosLessThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                        }
                                                                                    }
                                                                                    if (mos > (maxForMonths + parseInt(toleranceNoOfMonthsOverMax)) && mos != 0) {
                                                                                        var count = 0;
                                                                                        for (var dlt = 0; dlt <= (planningUnitList[p].distributionLeadTime); dlt++) {
                                                                                            var mosDlt = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                                c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                                && moment(c.transDate).format("YYYY-MM") == moment(m).add(dlt, 'months').format("YYYY-MM"));
                                                                                            if (mosDlt.length > 0 && mosDlt[0].closingBalance > mosDlt[0].maxStock && mosDlt[0].closingBalance != 0) {
                                                                                                count = count + 1;
                                                                                            }
                                                                                        }
                                                                                        if (count == (planningUnitList[p].distributionLeadTime) + 1) {
                                                                                            monthWithMosAboveThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            for (var mosCounter7to18 = parseInt(typeProblemList[prob].data1) + 1; mosCounter7to18 <= parseInt(typeProblemList[prob].data2); mosCounter7to18++) {
                                                                                var m7to18 = moment(curDate).add(mosCounter7to18, 'months');
                                                                                var supplyPlanJson7to18 = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                    c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                    && moment(c.transDate).format("YYYY-MM") == moment(m7to18).format("YYYY-MM"));
                                                                                var mos7to18 = "";
                                                                                var maxForMonths7to18 = "";
                                                                                var minForMonths7to18 = "";
                                                                                if (supplyPlanJson7to18.length > 0 && supplyPlanJson7to18[0].closingBalance != null) {
                                                                                    mos7to18 = Number(supplyPlanJson7to18[0].closingBalance);
                                                                                    maxForMonths7to18 = Number(supplyPlanJson7to18[0].maxStock);
                                                                                    minForMonths7to18 = Number(supplyPlanJson7to18[0].minStock);
                                                                                    if (minForMonths7to18 <= parseInt(toleranceCutoffMinMoS)) {
                                                                                        if (mos7to18 < minForMonths7to18 && mos7to18 != 0) {
                                                                                            monthWithMosLessThenMinWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                        }
                                                                                    } else {
                                                                                        if (mos7to18 < (minForMonths7to18 - parseInt(toleranceNoOfMonthsBelowMin)) && mos7to18 != 0) {
                                                                                            monthWithMosLessThenMinWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                        }
                                                                                    }
                                                                                    if (mos7to18 > (maxForMonths7to18 + parseInt(toleranceNoOfMonthsOverMax)) && mos7to18 != 0) {
                                                                                        var count7to18 = 0;
                                                                                        for (var dlt7to18 = 0; dlt7to18 <= (planningUnitList[p].distributionLeadTime); dlt7to18++) {
                                                                                            var mosDlt7to18 = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                                c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                                && moment(c.transDate).format("YYYY-MM") == moment(m7to18).add(dlt7to18, 'months').format("YYYY-MM"));
                                                                                            if (mosDlt7to18.length > 0 && mosDlt7to18[0].closingBalance > mosDlt7to18[0].maxStock && mosDlt7to18[0].closingBalance != 0) {
                                                                                                count7to18 = count7to18 + 1;
                                                                                            }
                                                                                        }
                                                                                        if (count7to18 == (planningUnitList[p].distributionLeadTime) + 1) {
                                                                                            monthWithMosAboveThenMaxWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            var cause = {};
                                                                            cause["monthWithMosLessThenMinWithing6months"] = monthWithMosLessThenMinWithing6months.length;
                                                                            cause["monthWithMosAboveThenMaxWithing6months"] = monthWithMosAboveThenMinWithing6months.length;
                                                                            cause["monthWithMosLessThenMinWithing7to18months"] = monthWithMosLessThenMinWithing7to18months.length;
                                                                            cause["monthWithMosAboveThenMaxWithing7to18months"] = monthWithMosAboveThenMaxWithing7to18months.length;
                                                                            cause["shipmentListWithin6Months"] = filteredShipmentListWithin6Months.length;
                                                                            cause["shipmentListWithin7to18Months"] = filteredShipmentListWithin7to18Months.length;
                                                                            cause["range1to6months"] = moment(curDate).add(1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('MMM-YY');
                                                                            cause["range7to18months"] = moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('MMM-YY');
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                            );
                                                                            if (monthWithMosLessThenMinWithing6months.length > 0 || monthWithMosAboveThenMinWithing6months.length > 0 || monthWithMosLessThenMinWithing7to18months.length > 0 || monthWithMosAboveThenMaxWithing7to18months.length > 0) {
                                                                                if (index == -1) {
                                                                                    createMinMaxProblems(programList[pp].generalData, versionID, typeProblemList[prob], region, planningUnitList[p], cause, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(cause);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].generalData.programId) {
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }else{
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                            );
                                                                            if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].generalData.programId) {
                                                                                incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                            }
                                                                        }
                                                                        break;
                                                                    case 25:
                                                                        for (var r = 0; r < regionList.length; r++) {
                                                                            var numberOfMonths = parseInt(typeProblemList[prob].data1);
                                                                            var myStartDate = moment(curDate).subtract(numberOfMonths, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var myEndDate = moment(curDate).endOf('month').format("YYYY-MM-DD");
                                                                            var filteredConsumptionList = consumptionList.filter(c =>
                                                                                moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDate
                                                                                && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDate
                                                                                && c.actualFlag.toString() == "true"
                                                                                && c.active.toString() == "true"
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                            var monthsWithActualConsumption = [];
                                                                            for (var fcm = 0; fcm < filteredConsumptionList.length; fcm++) {
                                                                                monthsWithActualConsumption.push(moment(filteredConsumptionList[fcm].consumptionDate).format("YYYY-MM"));
                                                                            }
                                                                            var pastSixMonthsArray = [];
                                                                            for (var ema = 1; ema <= numberOfMonths; ema++) {
                                                                                pastSixMonthsArray.push(moment(curDate).subtract(ema, 'months').format("YYYY-MM"));
                                                                            }
                                                                            var monthWithNoActualConsumption = pastSixMonthsArray.filter(function (obj) { return monthsWithActualConsumption.indexOf(obj) == -1; });
                                                                            var actualCauseMonths = [];
                                                                            for (var nac = 0; nac < monthWithNoActualConsumption.length; nac++) {
                                                                                var checkListBack = filteredConsumptionList.filter(c =>
                                                                                    moment(c.consumptionDate).format('YYYY-MM') < moment(monthWithNoActualConsumption[nac]).format('YYYY-MM')
                                                                                    && moment(c.consumptionDate).format('YYYY-MM') >= moment(myStartDate).format('YYYY-MM')
                                                                                );
                                                                                var checkListForward = filteredConsumptionList.filter(c =>
                                                                                    moment(c.consumptionDate).format('YYYY-MM') > moment(monthWithNoActualConsumption[nac]).format('YYYY-MM')
                                                                                    && moment(c.consumptionDate).format('YYYY-MM') <= moment(myEndDate).format('YYYY-MM')
                                                                                );
                                                                                if (checkListBack.length > 0 && checkListForward.length > 0) {
                                                                                    actualCauseMonths.push(moment(monthWithNoActualConsumption[nac]).format('MMM-YY'));
                                                                                }
                                                                            }
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    c.region != null &&
                                                                                    c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                            );
                                                                            if (actualCauseMonths.length > 0) {
                                                                                if (index == -1) {
                                                                                    createSupplyPlanningProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], actualCauseMonths, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(actualCauseMonths);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }
                                                                        break;
                                                                    default:
                                                                        break;
                                                                }
                                                            }
                                                            
                                                        } else {
                                                            for (var pal = 0; pal < problemActionList.length; pal++) {
                                                                if (problemActionList[pal].planningUnit.id == planningUnitList[p].planningUnit.id) {
                                                                    problemActionList[pal].planningUnitActive = false;
                                                                }
                                                            }
                                                        }
                                                        if(programList[pp].generalData.dashboardData!=undefined){
                                                        if(programList[pp].generalData.dashboardData.bottomPuData==undefined || programList[pp].generalData.dashboardData.bottomPuData==""){
                                                            programList[pp].generalData.dashboardData.bottomPuData=[]
                                                        }
                                                        var paListForDashboard=problemActionList.filter(c => c.program.id == programList[pp].generalData.programId && c.planningUnit.id==planningUnitList[p].planningUnit.id && c.problemStatus.id==1);
                                                        programList[pp].generalData.dashboardData.bottomPuData[planningUnitList[p].planningUnit.id].forecastConsumptionQplPassed=paListForDashboard.filter(c=> c.realmProblem.problem.problemId==8).length>0?false:true;
                                                        programList[pp].generalData.dashboardData.bottomPuData[planningUnitList[p].planningUnit.id].actualConsumptionQplPassed=paListForDashboard.filter(c=> c.realmProblem.problem.problemId==1 || c.realmProblem.problem.problemId==23).length>0?false:true;
                                                        programList[pp].generalData.dashboardData.bottomPuData[planningUnitList[p].planningUnit.id].inventoryQplPassed=paListForDashboard.filter(c=> c.realmProblem.problem.problemId==2).length>0?false:true;
                                                        programList[pp].generalData.dashboardData.bottomPuData[planningUnitList[p].planningUnit.id].shipmentQplPassed=shipmentQplPassed;
                                                    }
                                                    }
                                                    var problemTransaction = db1.transaction([objectStoreFromProps], 'readwrite');
                                                    var problemOs = problemTransaction.objectStore(objectStoreFromProps);
                                                    var paList = problemActionList.filter(c => c.program.id == programList[pp].generalData.programId)
                                                    programList[pp].generalData.problemReportList = paList;
                                                    programList[pp].generalData.actionList = [];
                                                    programList[pp].generalData.qplLastModifiedDate = curDate;
                                                    programList[pp].generalData.lastModifiedDate=moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                    var openCount = (paList.filter(c => c.problemStatus.id == 1 && c.planningUnitActive != false && c.regionActive != false)).length;
                                                    var addressedCount = (paList.filter(c => c.problemStatus.id == 3 && c.planningUnitActive != false && c.regionActive != false)).length;
                                                    var programQPLDetailsJson = {
                                                        id: programRequestList[pp].id,
                                                        openCount: openCount,
                                                        addressedCount: addressedCount,
                                                        programCode: programList[pp].generalData.programCode,
                                                        version: programRequestList[pp].version,
                                                        userId: programRequestList[pp].userId,
                                                        programId: programList[pp].generalData.programId,
                                                        programModified: programQPLDetailsGetRequest.result.programModified,
                                                        readonly: programQPLDetailsGetRequest.result.readonly,
                                                        cutOffDate:programQPLDetailsGetRequest.result.cutOffDate
                                                    }
                                                    programRequestList[pp].programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(programList[pp].generalData), SECRET_KEY)).toString();
                                                } catch (err) {
                                                    if (this.props.fetchData != undefined) {
                                                        if (this.props.page == "syncMasterData") {
                                                            this.props.fetchData(1, programId);
                                                        } else {
                                                            this.props.fetchData();
                                                        }
                                                    }
                                                }
                                                var putRequest = problemOs.put(programRequestList[pp]);
                                                putRequest.onerror = function (event) {
                                                    this.setState({
                                                        message: i18n.t('static.program.errortext'),
                                                        color: '#BA0C2F'
                                                    })
                                                    if (this.props.updateState != undefined) {
                                                        this.props.updateState(key, false);
                                                    }
                                                }.bind(this);
                                                putRequest.onsuccess = function (event) {
                                                    var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                                                    var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                                                    var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                                    programQPLDetailsRequest.onsuccess = function (event) {
                                                        if (this.props.updateState != undefined) {
                                                            this.props.updateState(key, false);
                                                        }
                                                        if (this.props.fetchData != undefined) {
                                                            if (this.props.page == "syncMasterData") {
                                                                this.props.fetchData(1, programId);
                                                            } else {
                                                                this.props.fetchData();
                                                            }
                                                        }
                                                    }.bind(this);
                                                }.bind(this);
                                            }
                                        }.bind(this);
                                    }.bind(this);
                                }.bind(this);
                            }.bind(this);
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
}