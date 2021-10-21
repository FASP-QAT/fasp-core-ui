import { getDatabase } from "../CommonComponent/IndexedDbFunctions";

import AuthenticationService from '../views/Common/AuthenticationService';
import i18n from '../i18n';
import {
    SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN,
    MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS,
    PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS,
    APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS,
    ON_HOLD_SHIPMENT_STATUS,
    INDEXED_DB_VERSION, INDEXED_DB_NAME, ACTUAL_CONSUMPTION_MONTHS_IN_PAST_FOR_QPL, FORECASTED_CONSUMPTION_MODIFIED, ACTUAL_CONSUMPTION_MODIFIED, INVENTORY_MODIFIED, ADJUSTMENT_MODIFIED, SHIPMENT_MODIFIED

} from '../Constants.js'
import CryptoJS from 'crypto-js';
import moment, { months } from 'moment';

import React, { Component } from "react";
import openProblem from '../CommonComponent/openProblem.js';
import incomplianceProblem from '../CommonComponent/incomplianceProblem.js';
import createDataQualityProblems from '../CommonComponent/createDataQualityProblems.js';
import createProcurementScheduleProblems from '../CommonComponent/createProcurementScheduleProblems.js';
import createSupplyPlanningProblems from '../CommonComponent/createSupplyPlanningProblems.js';
import getProblemCriticality from '../CommonComponent/getProblemCriticality.js';
import { dbInitial } from "../views/ApplicationDashboard/ApplicationDashboard";
import createMinMaxProblems from "./createMinMaxProblems";


export default class QatProblemActionNew extends Component {

    constructor(props) {
        super(props);
        this.state = {
            executionStatus: 0
        }
        this.qatProblemActions = this.qatProblemActions.bind(this);
    }

    componentDidMount() {
        // this.qatProblemActions();

    }
    render() {
        return (
            <></>
        );
    }

    qatProblemActions(programId, key, buildFullQPL) {
        // console.log("program id in QPL***", programId);
        // console.log("new logic start+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
        // console.log("programId.toString()+++", programId.toString());
        var problemActionList = [];
        var db1;
        var storeOS;
        // console.log("bfor get database+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
        getDatabase();
        // console.log("opening db start+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            // console.log("opening db end+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
            var realmId = AuthenticationService.getRealmId();
            // console.log("afetr taking realmId+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
            var programList = [];
            var programRequestList = [];
            var versionIDs = [];
            db1 = e.target.result;
            var objectStoreFromProps = this.props.objectStore;
            var transaction = db1.transaction([objectStoreFromProps], 'readwrite');
            var program = transaction.objectStore(objectStoreFromProps);
            var getRequest = program.get(programId.toString());
            // console.log("bfor getRequest+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
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
                    // console.log("start time bfr user decryption+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    let username = decryptedUser.username;
                    // console.log("end time after user decryption+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                    // console.log("program decryption start+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                    var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData.generalData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var planningUnitDataList = getRequest.result.programData.planningUnitDataList;

                    // console.log("programJson+++", programJson);
                    // console.log("program decryption end+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                    programList.push({ generalData: programJson, planningUnitDataList: planningUnitDataList });
                    programRequestList.push(getRequest.result);
                    versionIDs.push(getRequest.result.version);
                    // console.log("start time bfor taking list of programPlanningUnit+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
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
                        // console.log("end  time after taking list of programPlanningUnit+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
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
                            // console.log("start time bfor taking list of planning unit+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
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
                                // console.log("end time after taking list of planning unit+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
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

                                        //  code for making problem status dynamic in problem object
                                        var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                                        var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                                        var problemStatusGetRequest = problemStatusOs.getAll();
                                        //  code for making problem status dynamic in problem object
                                        problemStatusGetRequest.onerror = function (event) {
                                            this.setState({
                                                supplyPlanError: i18n.t('static.program.errortext'),
                                                loading: false,
                                                color: "#BA0C2F"
                                            })
                                            this.hideFirstComponent()
                                        }.bind(this);
                                        problemStatusGetRequest.onsuccess = function (event) {
                                            //  code for making problem status dynamic in problem object
                                            var problemStatusList = [];
                                            problemStatusList = problemStatusGetRequest.result;
                                            var openProblemStatusObj = problemStatusList.filter(c => c.id == 1)[0];
                                            var incomplianceProblemStatusObj = problemStatusList.filter(c => c.id == 4)[0];
                                            console.log("openObj+++", openProblemStatusObj);
                                            console.log("incomplianceObj+++", incomplianceProblemStatusObj);
                                            //  code for making problem status dynamic in problem object

                                            var maxForMonths = 0;
                                            // console.log("time taken for setup+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                                            for (var pp = 0; pp < programList.length; pp++) {
                                                try {
                                                    // var shipmentList = programList[pp].shipmentList;
                                                    // console.log("program===>", programList[pp]);
                                                    var actionList = [];
                                                    var qplLastModifiedDate = programList[pp].generalData.qplLastModifiedDate;
                                                    var actionPlanningUnitIds = [];
                                                    var versionID = versionIDs[pp];
                                                    var problemActionIndex = 0;
                                                    problemActionList = programList[pp].generalData.problemReportList;
                                                    problemActionIndex = programList[pp].generalData.problemReportList.length;
                                                    actionList = programList[pp].generalData.actionList;
                                                    console.log("actionList+++", actionList);

                                                    // ******* update logic for active inactive planning units===========================================================
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
                                                    // ******* ===========================================================
                                                    actionList.map(actionObj => {
                                                        actionPlanningUnitIds.push(parseInt(actionObj.planningUnitId));
                                                    });

                                                    console.log("actionPlanningUnitIds+++", actionPlanningUnitIds);

                                                    //******New logic for QAT-638 to disable the problems if the region is removed or added form the program
                                                    var regionIdArray = [];
                                                    var regionList = programList[pp].generalData.regionList;
                                                    regionList.map(rm => {
                                                        regionIdArray.push(parseInt(rm.regionId));
                                                    });
                                                    console.log("regionIdArray+++", regionIdArray);
                                                    var problemReportIdForRegion = [];
                                                    problemActionList.filter(c =>
                                                        c.region != null && !regionIdArray.includes(parseInt(c.region.id)) && c.region.id != null && c.region.id != "" && c.problemReportId != 0 && c.region.id != 0).
                                                        map(m => {
                                                            problemReportIdForRegion.push(parseInt(m.problemReportId));
                                                        });
                                                    console.log("problem reportId to mark region acive false+++", problemReportIdForRegion);
                                                    for (var pal = 0; pal < problemActionList.length; pal++) {
                                                        if (problemReportIdForRegion.includes(parseInt(problemActionList[pal].problemReportId))) {
                                                            problemActionList[pal].regionActive = false;
                                                        } else {
                                                            problemActionList[pal].regionActive = true;
                                                        }
                                                    }
                                                    //******New logic for QAT-638 to disable the problems if the region is removed or added form the program

                                                    problemList = problemRequest.result.filter(c =>
                                                        c.realm.id == programList[pp].generalData.realmCountry.realm.realmId
                                                        && c.active.toString() == "true");
                                                    planningUnitList = planningUnitResult.filter(c =>
                                                        c.program.id == programList[pp].generalData.programId
                                                    );

                                                    // console.log("qplLastModifiedDate+++", moment(qplLastModifiedDate).format("YYYY-MM"));
                                                    if (!buildFullQPL && moment(qplLastModifiedDate).format("YYYY-MM") >= moment(curDate).format("YYYY-MM") && moment(qplLastModifiedDate).format("YYYY-MM-DD") >= moment(curDate).format("YYYY-MM-DD")) {
                                                        planningUnitList = planningUnitList.filter(c =>
                                                            actionPlanningUnitIds.includes(c.planningUnit.id)
                                                            || moment(c.createdDate).format("YYYY-MM-DD") >= moment(qplLastModifiedDate).format("YYYY-MM-DD")
                                                        );
                                                    }

                                                    // console.log("new filtered panning unit list+++", planningUnitList);
                                                    var curDate = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'));
                                                    var curMonth = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM'));
                                                    for (var p = 0; p < planningUnitList.length; p++) {
                                                        // console.log("in for+++");
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

                                                            // Calculations for Max Stock
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
                                                            console.log("actionTypeIds+++", actionTypeIds);
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
                                                            console.log("typeProblemList+++", typeProblemList);
                                                            for (var prob = 0; prob < typeProblemList.length; prob++) {
                                                                // for (var prob = 0; prob < problemList.length; prob++) {
                                                                // console.log("in problemlist for+++");
                                                                switch (typeProblemList[prob].problem.problemId) {
                                                                    case 1:
                                                                        // CASE 1 START (missing recent actual consumption in last three month including current month.)
                                                                        for (var r = 0; r < regionList.length; r++) {

                                                                            var consumptionList = programJsonForPlanningUnit.consumptionList;
                                                                            var numberOfMonths = parseInt(typeProblemList[prob].data1);
                                                                            var numberOfMonthsData2 = parseInt(typeProblemList[prob].data2);
                                                                            var myStartDate = moment(curDate).subtract(numberOfMonths, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var myEndDate = moment(curDate).endOf('month').format("YYYY-MM-DD");
                                                                            var startDateForSixMonthRange = moment(curDate).subtract(numberOfMonthsData2, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var endDateForSixMonthRange = moment(curDate).subtract(numberOfMonths + 1, 'months').startOf('month').format("YYYY-MM-DD")
                                                                            // console.log("startDateForSixMonthRange+++", startDateForSixMonthRange, "endDateForSixMonthRange+++", endDateForSixMonthRange);
                                                                            var filteredConsumptionList = consumptionList.filter(c =>
                                                                                moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDate
                                                                                && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDate
                                                                                && c.actualFlag.toString() == "true"
                                                                                && c.active.toString() == "true"
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                            // perivous 6 months with atlies one actual consumption entry check    
                                                                            var filteredConsumptionListForSixMonthRange = consumptionList.filter(c =>
                                                                                moment(c.consumptionDate).format('YYYY-MM-DD') >= startDateForSixMonthRange
                                                                                && moment(c.consumptionDate).format('YYYY-MM-DD') <= endDateForSixMonthRange
                                                                                && c.actualFlag.toString() == "true"
                                                                                && c.active.toString() == "true"
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                            // console.log("filteredConsumptionListForSixMonthRange+++", filteredConsumptionListForSixMonthRange);
                                                                            var index = problemActionList.findIndex(
                                                                                c =>
                                                                                    // moment(c.dt).format("YYYY-MM") == curMonth &&
                                                                                    c.region != null &&
                                                                                    c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == 1
                                                                            );
                                                                            // if (filteredConsumptionList.length == 0 && filteredConsumptionListForSixMonthRange.length > 0) {
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
                                                                                // console.log("cause json+++",causeJson);
                                                                                if (index == -1) {
                                                                                    // crete problem
                                                                                    createDataQualityProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], causeJson, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    // auto open logic for index problemstatus 4 means we are checking for status incompliance
                                                                                    // we do not need check for index != -1
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(causeJson);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj, openProblemStatusObj);
                                                                                    }
                                                                                }

                                                                            } else {
                                                                                // problem status 1 or 3 means Open or Addressed.
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                    // auto incompliance logic for index 
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }
                                                                        // CASE 1 END =================
                                                                        break;
                                                                    case 2:
                                                                        // CASE 2 START (missing recent  inventory inputs for last three month including current month.) actual qty inputs are checked
                                                                        for (var r = 0; r < regionList.length; r++) {
                                                                            var inventoryList = programJsonForPlanningUnit.inventoryList;
                                                                            var numberOfMonthsInventory = parseInt(typeProblemList[prob].data1);
                                                                            var numberOfMonthsInventoryData2 = parseInt(typeProblemList[prob].data2);
                                                                            var myStartDateInventory = moment(curDate).subtract(numberOfMonthsInventory, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var myEndDateInventory = moment(curDate).endOf('month').format("YYYY-MM-DD");
                                                                            var startDateForSixMonthRange = moment(curDate).subtract(numberOfMonthsInventoryData2, 'months').startOf('month').format("YYYY-MM-DD");
                                                                            var endDateForSixMonthRange = moment(curDate).subtract(numberOfMonthsInventory + 1, 'months').startOf('month').format("YYYY-MM-DD")
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
                                                                                    // moment(c.dt).format("YYYY-MM") == curMonth &&
                                                                                    c.region != null &&
                                                                                    c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == 2

                                                                            );
                                                                            // if (filterInventoryList.length == 0 && filterInventoryListForSixMonthRange.length > 0) {
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
                                                                        // Case 2 END=================
                                                                        break;
                                                                    case 3:
                                                                        // Case 3 start
                                                                        // var shipmentList = programList[pp].shipmentList;
                                                                        var myDateShipment = curDate;
                                                                        var filteredShipmentList = shipmentListForMonths.filter(c =>
                                                                            moment(c.expectedDeliveryDate).add(parseInt(typeProblemList[prob].data1), 'days').format('YYYY-MM-DD') < moment(myDateShipment).format('YYYY-MM-DD')
                                                                            && c.shipmentStatus.id != 7
                                                                            && c.shipmentId != 0
                                                                        );
                                                                        if (filteredShipmentList.length > 0) {
                                                                            var shipmentIdsFromShipmnetList = [];

                                                                            for (var s = 0; s < filteredShipmentList.length; s++) {
                                                                                // var shipmentDetailsJson = [];
                                                                                var shipmentDetailsJson = {}
                                                                                shipmentDetailsJson["procurementAgentCode"] = filteredShipmentList[s].procurementAgent.code;
                                                                                shipmentDetailsJson["orderNo"] = filteredShipmentList[s].orderNo;
                                                                                shipmentDetailsJson["shipmentQuantity"] = filteredShipmentList[s].shipmentQty;
                                                                                shipmentDetailsJson["shipmentDate"] = filteredShipmentList[s].receivedDate == null || filteredShipmentList[s].receivedDate == "" ? filteredShipmentList[s].expectedDeliveryDate : filteredShipmentList[s].receivedDate;
                                                                                // shipmentDetailsJson.push(itemShipment);
                                                                                console.log("shipmentDetailsJson+++", shipmentDetailsJson)

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
                                                                                        // problemActionList[indexShipment].data5 = JSON.stringify(shipmentDetailsJson);
                                                                                        openProblem(indexShipment, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }
                                                                            }
                                                                            //new for loop logic=======================================
                                                                            var problemActionListForShipments = problemActionList.filter(c => c.realmProblem.problem.problemId == 3 && c.program.id == programList[pp].generalData.programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0)
                                                                            for (var fsl = 0; fsl < problemActionListForShipments.length; fsl++) {
                                                                                var fslShipmentId = problemActionListForShipments[fsl].shipmentId
                                                                                // console.log("fslShipmentId===>", fslShipmentId);
                                                                                if (!shipmentIdsFromShipmnetList.includes(fslShipmentId)) {
                                                                                    var notIncludedShipmentIndex = problemActionList.findIndex(c =>
                                                                                        c.realmProblem.problem.problemId == 3
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                        && (c.problemStatus.id == 1 || c.problemStatus.id == 3)
                                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                        && c.shipmentId != 0 &&
                                                                                        c.shipmentId == fslShipmentId);
                                                                                    // console.log("the index+++", notIncludedShipmentIndex);
                                                                                    incomplianceProblem(notIncludedShipmentIndex, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                            //new for loop logic=======================================
                                                                        } else {
                                                                            //new for loop logic=======================================
                                                                            var problemActionListForShipmentsIncompliance = problemActionList.filter(c => c.realmProblem.problem.problemId == 3 && c.program.id == programList[pp].programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0);
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
                                                                            //new for loop logic=======================================
                                                                        }
                                                                        break;
                                                                    case 4:
                                                                        // submited shipments logic======================
                                                                        // var shipmentList = programList[pp].shipmentList;
                                                                        var myDateShipment = curDate;
                                                                        var filteredShipmentList = shipmentListForMonths.filter(c =>
                                                                            (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)
                                                                            && c.shipmentId != 0
                                                                        );
                                                                        // console.log("submited status list===>", filteredShipmentList);
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
                                                                                    var addLeadTimes = programPlanningUnitList.filter(c =>
                                                                                        c.planningUnit.id == filteredShipmentList[s].planningUnit.id
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                    )[0].localProcurementLeadTime;
                                                                                    var leadTimesPerStatus = addLeadTimes / 5;
                                                                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                    shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                    approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                    submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                    // plannedDate = moment(submittedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                                } else {
                                                                                    var ppUnit = papuResult;
                                                                                    var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                                                                                    if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                                                                        submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                                                                                    }
                                                                                    var approvedToShippedLeadTime = "";
                                                                                    approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                                                                                    if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                                                                        approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                                                                                    }

                                                                                    var shippedToArrivedLeadTime = ""
                                                                                    if (filteredShipmentList[s].shipmentMode == "Air") {
                                                                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                                                                                    } else {
                                                                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                                                                                    }

                                                                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                    shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                    approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                    submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                    // plannedDate = moment(submittedDate).subtract(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                                }
                                                                                //  //console.log("submittedDate=====>", submittedDate);
                                                                                // var shipmentDetailsJson = [];
                                                                                var shipmentDetailsJson = {}
                                                                                shipmentDetailsJson["procurementAgentCode"] = filteredShipmentList[s].procurementAgent.code;
                                                                                shipmentDetailsJson["orderNo"] = filteredShipmentList[s].orderNo;
                                                                                shipmentDetailsJson["shipmentQuantity"] = filteredShipmentList[s].shipmentQty;
                                                                                // shipmentDetailsJson["shipmentDate"] = submittedDate;
                                                                                shipmentDetailsJson["shipmentDate"] = filteredShipmentList[s].receivedDate == null || filteredShipmentList[s].receivedDate == "" ? filteredShipmentList[s].expectedDeliveryDate : filteredShipmentList[s].receivedDate;
                                                                                shipmentDetailsJson["submittedDate"] = submittedDate;
                                                                                // shipmentDetailsJson.push(itemShipment);
                                                                                console.log("shipmentDetailsJson+++", shipmentDetailsJson)

                                                                                if ((moment(submittedDate).add(parseInt(typeProblemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD"))) {
                                                                                    shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                                    var indexShipment = 0;
                                                                                    var newAddShipment = false;
                                                                                    indexShipment = problemActionList.findIndex(
                                                                                        c => c.program.id == programList[pp].generalData.programId
                                                                                            && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                            && c.realmProblem.problem.problemId == 4
                                                                                        // && c.versionId == versionID
                                                                                    );
                                                                                    if (indexShipment == -1) {
                                                                                        var index = 0;
                                                                                        createProcurementScheduleProblems(programList[pp].generalData, versionID, typeProblemList[prob], planningUnitList[p], filteredShipmentList[s].shipmentId, newAddShipment, problemActionIndex, userId, username, problemActionList, shipmentDetailsJson, openProblemStatusObj);
                                                                                        problemActionIndex++;
                                                                                    } else {
                                                                                        // make shipmet problem status eual to open========
                                                                                        problemActionList[indexShipment].data5 = JSON.stringify(shipmentDetailsJson);
                                                                                        if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                                            // problemActionList[indexShipment].data5 = JSON.stringify(shipmentDetailsJson);
                                                                                            openProblem(indexShipment, username, userId, problemActionList, openProblemStatusObj);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            //new for loop logic=======================================
                                                                            var problemActionListForShipments = problemActionList.filter(c => c.realmProblem.problem.problemId == 4 && c.program.id == programList[pp].generalData.programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0)
                                                                            // console.log("shipmentIdsFromShipmnetList",shipmentIdsFromShipmnetList);s
                                                                            for (var fsl = 0; fsl < problemActionListForShipments.length; fsl++) {
                                                                                var fslShipmentId = problemActionListForShipments[fsl].shipmentId
                                                                                // console.log("fslShipmentId===>", fslShipmentId);
                                                                                if (!shipmentIdsFromShipmnetList.includes(fslShipmentId)) {
                                                                                    var notIncludedShipmentIndex = problemActionList.findIndex(c =>
                                                                                        c.realmProblem.problem.problemId == 4
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                        && (c.problemStatus.id == 1 || c.problemStatus.id == 3)
                                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                        && c.shipmentId != 0 &&
                                                                                        c.shipmentId == fslShipmentId);
                                                                                    // console.log("the index+++", notIncludedShipmentIndex);
                                                                                    incomplianceProblem(notIncludedShipmentIndex, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                            //new for loop logic=======================================
                                                                        } else {
                                                                            var problemActionListForShipmentsIncompliance = problemActionList.filter(c => c.realmProblem.problem.problemId == 4 && c.program.id == programList[pp].generalData.programId && (c.problemStatus.id == 1 || c.problemStatus.id == 3) && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0);
                                                                            for (var d = 0; d < problemActionListForShipmentsIncompliance.length; d++) {
                                                                                var fslShipmentIdInCompliance = problemActionListForShipmentsIncompliance[d].shipmentId;
                                                                                // console.log("fslShipmentIdInCompliance===>", fslShipmentIdInCompliance);
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
                                                                    // case 5:
                                                                    //     // console.log("in case 5+++");
                                                                    //     break;
                                                                    // case 6:
                                                                    //     // console.log("in case 6+++");
                                                                    //     break;
                                                                    // case 7:
                                                                    //     // console.log("in case 7+++");
                                                                    //     break;
                                                                    case 8:
                                                                        for (var r = 0; r < regionList.length; r++) {
                                                                            //  no forecasted consumption for future 18 months
                                                                            var consumptionList = programJsonForPlanningUnit.consumptionList;
                                                                            // consumptionList = consumptionList.filter(c =>
                                                                            //     c.region.id == regionList[r].regionId
                                                                            //     && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                            var numberOfMonthsInFunture = parseInt(typeProblemList[prob].data1);
                                                                            // for (var m = 1; m <= numberOfMonthsInFunture; m++) {
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
                                                                                    // moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM") &&
                                                                                    c.region != null &&
                                                                                    c.region.id == regionList[r].regionId
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                    && c.program.id == programList[pp].generalData.programId
                                                                                    && c.realmProblem.problem.problemId == 8
                                                                                // && c.versionId == versionID
                                                                            );
                                                                            // console.log("planningUnit+++",planningUnitList[p].planningUnit.id);
                                                                            // console.log("index+++",index);
                                                                            var monthsWithForecastedConsumption = [];
                                                                            for (var fcm = 0; fcm < filteredConsumptionListTwo.length; fcm++) {
                                                                                monthsWithForecastedConsumption.push(moment(filteredConsumptionListTwo[fcm].consumptionDate).format("MMM-YY"));
                                                                            }
                                                                            var eighteenmonthsArray = [];
                                                                            for (var ema = 1; ema <= numberOfMonthsInFunture; ema++) {
                                                                                eighteenmonthsArray.push(moment(curDate).add(ema, 'months').format("MMM-YY"));
                                                                            }
                                                                            var monthWithNoForecastedConsumption = eighteenmonthsArray.filter(function (obj) { return monthsWithForecastedConsumption.indexOf(obj) == -1; });
                                                                            // console.log("monthWithNoForecastedConsumption+++", monthWithNoForecastedConsumption);
                                                                            if (filteredConsumptionListTwo.length < 18) {
                                                                                if (index == -1) {
                                                                                    // console.log("in create logic+++");
                                                                                    createSupplyPlanningProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], monthWithNoForecastedConsumption, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    // problemActionList[index].isFound = 1===== auto open logic;
                                                                                    // update cause ***********
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(monthWithNoForecastedConsumption);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }

                                                                                }

                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                    // problemActionList[index].isFound = 0;
                                                                                    // //console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                                    incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                }
                                                                            }
                                                                        }
                                                                        break;
                                                                    // case 9:
                                                                    //     // console.log("in case 9+++");
                                                                    //     break;
                                                                    case 10:
                                                                    case 14:
                                                                    case 15:
                                                                        // Dynamic forecasting is not used for commidity group ARV,VMMC,MALARIA
                                                                        // console.log("planningUnit+++", planningUnitList[p].planningUnit.id);
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
                                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                                var index = problemActionList.findIndex(
                                                                                    c =>// moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM") &&
                                                                                        c.region != null &&
                                                                                        c.region.id == regionList[r].regionId
                                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                        && c.program.id == programList[pp].generalData.programId
                                                                                        && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                                    // && c.versionId == versionID
                                                                                );
                                                                                // console.log("consumptionList.length+++", consumptionList.length)
                                                                                if (consumptionList.length > parseInt(typeProblemList[prob].data2)) {
                                                                                    var conQtyArray = [];
                                                                                    for (var i = 0; i < consumptionList.length; i++) {
                                                                                        var item = {}
                                                                                        item["consumptionQty"] = consumptionList[i].consumptionQty;
                                                                                        item["month"] = consumptionList[i].consumptionDate;
                                                                                        conQtyArray.push(item);
                                                                                        // conQtyArray.push(consumptionList[i].consumptionQty);
                                                                                    }
                                                                                    // console.log("consumptionArray====>", conQtyArray);
                                                                                    var a = conQtyArray;
                                                                                    var check = false;
                                                                                    var currArray = [];
                                                                                    var curMonthArray = [];
                                                                                    var spanLength = parseInt(typeProblemList[prob].data2) - 1;
                                                                                    var cause = [];
                                                                                    // var criticalityArray = [];
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
                                                                                            // break;
                                                                                        } else {
                                                                                            check = false;
                                                                                        }
                                                                                    }
                                                                                    // console.log("cause+++", cause);
                                                                                    // console.log("check+++", check);
                                                                                    // if (check == true) {
                                                                                    if (cause.length > 0) {
                                                                                        // console.log("flag problem=====>", index);
                                                                                        if (index == -1) {
                                                                                            createSupplyPlanningProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], cause, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                            problemActionIndex++;
                                                                                        } else {
                                                                                            // auto open problem logic for index
                                                                                            problemActionList[index].dt = curDate;
                                                                                            problemActionList[index].data5 = JSON.stringify(cause);
                                                                                            if (problemActionList[index].problemStatus.id == 4) {
                                                                                                openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        //console.log("dont flag problem=====>");
                                                                                        if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                            // //console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                                            incomplianceProblem(index, username, userId, problemActionList, incomplianceProblemStatusObj);
                                                                                        }
                                                                                    }
                                                                                    // ================================
                                                                                } else {

                                                                                }
                                                                            }
                                                                        }
                                                                        break;
                                                                    // case 11:
                                                                    // case 18:
                                                                    // break;
                                                                    // case 12:
                                                                    //     // console.log("in case 12+++");
                                                                    //     break;
                                                                    // case 13:
                                                                    //     // console.log("in case 13+++");
                                                                    //     break;
                                                                    // case 14:
                                                                    //     // console.log("in case 14+++");
                                                                    //     break;
                                                                    // case 15:
                                                                    //     // console.log("in case 15+++");
                                                                    //     break;
                                                                    // case 16:
                                                                    // case 19:
                                                                    // break;
                                                                    // case 17:
                                                                    // case 20:
                                                                    // problem for month with mos less then min in 1-6/7-18 months without shipments.
                                                                    // var region = {};
                                                                    // region["regionId"] = 0;
                                                                    // region["label"] = {};
                                                                    // var monthWithMosLessThenMin = '';
                                                                    // for (var mosCounter = parseInt(typeProblemList[prob].data1); mosCounter <= parseInt(typeProblemList[prob].data2); mosCounter++) {
                                                                    //     var m = moment(curDate).add(mosCounter, 'months');
                                                                    //     var supplyPlanJson = programList[pp].supplyPlan.filter(c =>
                                                                    //         c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                    //         && moment(c.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"));
                                                                    //     var mos = "";
                                                                    //     // var maxForMonths = "";
                                                                    //     var minForMonths = "";
                                                                    //     // var closingBalance = "";
                                                                    //     // var amcCalcualted = "";

                                                                    //     if (supplyPlanJson.length > 0) {
                                                                    //         mos = parseFloat(supplyPlanJson[0].mos).toFixed(1);
                                                                    //         // maxForMonths = maxStockMoSQty;
                                                                    //         minForMonths = minStockMoSQty;
                                                                    //         // closingBalance = supplyPlanJson[0].closingBalance;
                                                                    //         // amcCalcualted = supplyPlanJson[0].amc;
                                                                    //         if (mos < minForMonths) {
                                                                    //             var getStartDate = moment(m).subtract(3, 'months').format('YYYY-MM') < moment(curDate).format('YYYY-MM') ? moment(curDate).startOf('month').format('YYYY-MM-DD') : moment(m).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                    //             var getEndDate = moment(m).add(4, 'months').format('YYYY-MM-DD');
                                                                    //             var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate).format('YYYY-MM'));
                                                                    //             if (filteredShipmentListForMonths.length == 0) {
                                                                    //                 monthWithMosLessThenMin = moment(m).format('YYYY-MM');
                                                                    //                 break;
                                                                    //             }
                                                                    //         }
                                                                    //     }
                                                                    // }
                                                                    // var index = problemActionList.findIndex(
                                                                    //     c =>
                                                                    //         // moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM") &&
                                                                    //         // && c.region.id == regionList[r].regionId
                                                                    //         c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                    //         && c.program.id == programList[pp].programId
                                                                    //         && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                    //     // && c.versionId == versionID
                                                                    // );

                                                                    // if (monthWithMosLessThenMin != '') {
                                                                    //     if (index == -1) {
                                                                    //         createSupplyPlanningProblems(programList[pp], versionID, typeProblemList[prob], region, planningUnitList[p], monthWithMosLessThenMin, problemActionIndex, userId, username, problemActionList);
                                                                    //         problemActionIndex++;
                                                                    //     } else {
                                                                    //         //auto open for index=======>
                                                                    //         // update curDate i.e dt and also update the cuse i.e data5
                                                                    //         problemActionList[index].dt = curDate;
                                                                    //         problemActionList[index].data5 = monthWithMosLessThenMin;
                                                                    //         if (problemActionList[index].problemStatus.id == 4) {
                                                                    //             openProblem(index, username, userId, problemActionList);
                                                                    //         }
                                                                    //     }

                                                                    // } else {
                                                                    //     if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId) {
                                                                    //         incomplianceProblem(index, username, userId, problemActionList);
                                                                    //     }
                                                                    // }
                                                                    // break;

                                                                    // case 18:
                                                                    //     // console.log("in case 18+++");
                                                                    //     break;
                                                                    // case 21:
                                                                    //     console.log("in case 21+++");
                                                                    //     break;
                                                                    // case 22:
                                                                    //     console.log("in case 22+++");
                                                                    //     break;
                                                                    case 23:
                                                                        // console.log("planning unit***", planningUnitList[p].planningUnit.id);
                                                                        // console.log("problem***",typeProblemList[prob].problem.problemId);
                                                                        // console.log("data1***",typeProblemList[prob].data1,"data2***",typeProblemList[prob].data2);
                                                                        // problem for mos is less then min having shipments within lead time 1-6/7-18 months months ============
                                                                        // var mosArray = [];
                                                                        // typeProblemList[prob].data1 AND typeProblemList[prob].data2 is the range  i:e t+1 to t+6 months
                                                                        // typeProblemList[prob].data1=1
                                                                        // typeProblemList[prob].data2=6
                                                                        var region = {};
                                                                        region["regionId"] = 0;
                                                                        region["label"] = {};
                                                                        var monthWithMosLessThenMinWithing6months = [];
                                                                        var monthWithMosAboveThenMinWithing6months = [];
                                                                        var filteredShipmentListWithin6Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('YYYY-MM'));

                                                                        var monthWithMosLessThenMinWithing7to18months = [];
                                                                        var monthWithMosAboveThenMaxWithing7to18months = [];
                                                                        var filteredShipmentListWithin7to18Months = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('YYYY-MM'));

                                                                        // var toleranceAndCutoffValues = typeProblemList[prob].data3;
                                                                        // var toleranceAndCutoffArray = [];
                                                                        // if (toleranceAndCutoffValues != null && toleranceAndCutoffValues != "") {
                                                                        //     var toleranceAndCutoffSplit = toleranceAndCutoffValues.split(',');
                                                                        //     for (var t = 0; t < toleranceAndCutoffSplit.length; t++) {
                                                                        //         toleranceAndCutoffArray.push(parseInt(toleranceAndCutoffSplit[t]));
                                                                        //     }
                                                                        // }

                                                                        var toleranceNoOfMonthsBelowMin = realm.minQplTolerance;//2
                                                                        var toleranceCutoffMinMoS = realm.minQplToleranceCutOff;//5
                                                                        var toleranceNoOfMonthsOverMax = realm.maxQplTolerance;//2

                                                                        // console.log("toleranceNoOfMonthsBelowMin+++",toleranceNoOfMonthsBelowMin,"toleranceCutoffMinMoS+++",toleranceCutoffMinMoS,"toleranceNoOfMonthsOverMax+++",toleranceNoOfMonthsOverMax);

                                                                        for (var mosCounter = 1; mosCounter <= parseInt(typeProblemList[prob].data1); mosCounter++) {
                                                                            var m = moment(curDate).add(mosCounter, 'months');
                                                                            var supplyPlanJson = programJsonForPlanningUnit.supplyPlan.filter(c =>
                                                                                c.planningUnitId == planningUnitList[p].planningUnit.id
                                                                                && moment(c.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"));
                                                                            var mos = "";
                                                                            var maxForMonths = "";
                                                                            var minForMonths = "";
                                                                            // var closingBalance = "";
                                                                            // var amcCalcualted = "";
                                                                            if (supplyPlanJson.length > 0 && supplyPlanJson[0].mos != null) {
                                                                                mos = parseFloat(supplyPlanJson[0].mos).toFixed(1);
                                                                                maxForMonths = maxStockMoSQty;
                                                                                minForMonths = minStockMoSQty;
                                                                                // closingBalance = supplyPlanJson[0].closingBalance;
                                                                                // amcCalcualted = supplyPlanJson[0].amc;

                                                                                // *****new  logic of buffer for monts with mos less then min 1-6 months
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
                                                                                // *****new  logic of buffer for monts with mos less then min 1-6 months


                                                                                // if (mos < minForMonths && mos != 0) {
                                                                                //     monthWithMosLessThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                // } else if (mos > maxForMonths && mos != 0) {
                                                                                //     monthWithMosAboveThenMinWithing6months.push(moment(m).format('YYYY-MM'));
                                                                                // }
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
                                                                            // var closingBalance = "";
                                                                            // var amcCalcualted = "";
                                                                            if (supplyPlanJson7to18.length > 0 && supplyPlanJson7to18[0].mos != null) {
                                                                                mos7to18 = parseFloat(supplyPlanJson7to18[0].mos).toFixed(1);
                                                                                maxForMonths7to18 = maxStockMoSQty;
                                                                                minForMonths7to18 = minStockMoSQty;
                                                                                // closingBalance = supplyPlanJson[0].closingBalance;
                                                                                // amcCalcualted = supplyPlanJson[0].amc;

                                                                                // *****new  logic of buffer for monts with mos less then min 7-18 months
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
                                                                                // *****new  logic of buffer for monts with mos less then min 7-18 months


                                                                                // if (mos7to18 < minForMonths7to18 && mos7to18 != 0) {
                                                                                //     monthWithMosLessThenMinWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                // } else if (mos7to18 > maxForMonths7to18 && mos7to18 != 0) {
                                                                                //     monthWithMosAboveThenMaxWithing7to18months.push(moment(m7to18).format('YYYY-MM'));
                                                                                // }
                                                                            }
                                                                        }

                                                                        // console.log("1-6 months values mos less then min array+++", monthWithMosLessThenMinWithing6months.length);
                                                                        // console.log("1-6 months values mos above then max array+++", monthWithMosAboveThenMinWithing6months.length);
                                                                        // console.log("7-18 months values mos less then min array+++", monthWithMosLessThenMinWithing7to18months.length);
                                                                        // console.log("7-18 months values mos above then max array+++", monthWithMosAboveThenMaxWithing7to18months.length);
                                                                        // console.log("shipments in 1-6 months+++", filteredShipmentListWithin6Months.length);
                                                                        // console.log("shipments in 7-18 months+++", filteredShipmentListWithin7to18Months.length);
                                                                        // console.log("date range 1-6 months+++", moment(curDate).add(1, "months").format('MMM-YY') + " to " + moment(curDate).add(6, "months").format('MMM-YY'))
                                                                        // console.log("date range 7-18 months+++", moment(curDate).add(7, "months").format('MMM-YY') + " to " + moment(curDate).add(18, "months").format('MMM-YY'))

                                                                        var cause = {};
                                                                        cause["monthWithMosLessThenMinWithing6months"] = monthWithMosLessThenMinWithing6months.length;
                                                                        cause["monthWithMosAboveThenMaxWithing6months"] = monthWithMosAboveThenMinWithing6months.length;
                                                                        cause["monthWithMosLessThenMinWithing7to18months"] = monthWithMosLessThenMinWithing7to18months.length;
                                                                        cause["monthWithMosAboveThenMaxWithing7to18months"] = monthWithMosAboveThenMaxWithing7to18months.length;
                                                                        cause["shipmentListWithin6Months"] = filteredShipmentListWithin6Months.length;
                                                                        cause["shipmentListWithin7to18Months"] = filteredShipmentListWithin7to18Months.length;
                                                                        cause["range1to6months"] = moment(curDate).add(1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('MMM-YY');
                                                                        cause["range7to18months"] = moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('MMM-YY');
                                                                        // console.log("cause+++", cause);

                                                                        var index = problemActionList.findIndex(
                                                                            c =>
                                                                                c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                && c.program.id == programList[pp].generalData.programId
                                                                                && c.realmProblem.problem.problemId == typeProblemList[prob].problem.problemId
                                                                        );

                                                                        if (monthWithMosLessThenMinWithing6months.length > 0 || monthWithMosAboveThenMinWithing6months.length > 0 || monthWithMosLessThenMinWithing7to18months.length > 0 || monthWithMosAboveThenMaxWithing7to18months.length > 0) {
                                                                            // if (monthWithMosLessThenMinWithing6months.length > 0) {
                                                                            //     criticalityArray.push(3);
                                                                            // } if (monthWithMosAboveThenMinWithing6months.length > 0) {
                                                                            //     criticalityArray.push(1);
                                                                            // } if (monthWithMosLessThenMinWithing7to18months.length > 0) {
                                                                            //     criticalityArray.push(3);
                                                                            // } if (monthWithMosAboveThenMaxWithing7to18months.length > 0) {
                                                                            //     criticalityArray.push(2);
                                                                            // }
                                                                            // var problemCriticality = Math.max(...criticalityArray);
                                                                            // console.log("problemCriticality+++", problemCriticality);
                                                                            // console.log("cId+++", getProblemCriticality(problemCriticality));

                                                                            if (index == -1) {
                                                                                createMinMaxProblems(programList[pp].generalData, versionID, typeProblemList[prob], region, planningUnitList[p], cause, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                problemActionIndex++;
                                                                            } else {
                                                                                //auto open for index=======>
                                                                                // update curDate i.e dt and also update the cuse i.e data5
                                                                                problemActionList[index].dt = curDate;
                                                                                problemActionList[index].data5 = JSON.stringify(cause);
                                                                                // problemActionList[index].realmProblem.criticality = getProblemCriticality(problemCriticality);
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
                                                                    case 24:
                                                                        // console.log("planning unit***", planningUnitList[p].planningUnit.id);
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
                                                                                mos = parseFloat(supplyPlanJson[0].mos).toFixed(1);
                                                                                // mos = Number(supplyPlanJson[0].closingBalance);
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
                                                                                mos7to18 = parseFloat(supplyPlanJson7to18[0].mos).toFixed(1);
                                                                                // mos7to18 = Number(supplyPlanJson7to18[0].closingBalance);
                                                                                if (mos7to18 == 0) {
                                                                                    stockoutsWithing7to18months.push(moment(m7to18).format('MMM-YY'));
                                                                                }
                                                                            }
                                                                        }
                                                                        // console.log("stockoutmonths 1-6+++", stockoutsWithing6months.length);
                                                                        // console.log("stockoutmonths 7-18+++", stockoutsWithing7to18months.length);
                                                                        // console.log("date range 1-6 months+++", moment(curDate).add(1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('MMM-YY'));
                                                                        // console.log("date range 7-18 months+++", moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('MMM-YY'));
                                                                        // console.log("shipments in 1-6 months+++", filteredShipmentListWithin6Months.length);
                                                                        // console.log("shipments in 7-18 months+++", filteredShipmentListWithin7to18Months.length);
                                                                        var cause = {};
                                                                        cause["stockoutsWithing6months"] = stockoutsWithing6months.length > 0 ? stockoutsWithing6months.toString() : "No months";
                                                                        cause["stockoutsWithing7to18months"] = stockoutsWithing7to18months.length > 0 ? stockoutsWithing7to18months.toString() : "No months";
                                                                        cause["shipmentListWithin6Months"] = filteredShipmentListWithin6Months.length;
                                                                        cause["shipmentListWithin7to18Months"] = filteredShipmentListWithin7to18Months.length;
                                                                        cause["range1to6months"] = moment(curDate).add(1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data1), "months").format('MMM-YY');
                                                                        cause["range7to18months"] = moment(curDate).add(parseInt(typeProblemList[prob].data1) + 1, "months").format('MMM-YY') + " to " + moment(curDate).add(parseInt(typeProblemList[prob].data2), "months").format('MMM-YY');
                                                                        // console.log("cause+++", cause);

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
                                                                                //auto open for index=======>
                                                                                // update curDate i.e dt and also update the cuse i.e data5
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
                                                                            // console.log("monthsWithActualConsumption>>>", monthsWithActualConsumption);
                                                                            var pastSixMonthsArray = [];
                                                                            for (var ema = 1; ema <= numberOfMonths; ema++) {
                                                                                pastSixMonthsArray.push(moment(curDate).subtract(ema, 'months').format("YYYY-MM"));
                                                                            }
                                                                            // console.log("pastSixMonthsArray>>>", pastSixMonthsArray);
                                                                            var monthWithNoActualConsumption = pastSixMonthsArray.filter(function (obj) { return monthsWithActualConsumption.indexOf(obj) == -1; });
                                                                            // console.log("monthWithNoActualConsumption>>>", monthWithNoActualConsumption);
                                                                            var actualCauseMonths = [];
                                                                            // jan21 and dec20
                                                                            //start aug2020 stop is feb21
                                                                            // console.log("filteredConsumptionList>>>", filteredConsumptionList);
                                                                            for (var nac = 0; nac < monthWithNoActualConsumption.length; nac++) {
                                                                                // console.log("monthWithNoActualConsumption[]>>>", moment(monthWithNoActualConsumption[nac]).format('YYYY-MM'));
                                                                                // console.log("moment(myStartDate).format('MMM-YY')>>>", moment(myStartDate).format('YYYY-MM'));

                                                                                var checkListBack = filteredConsumptionList.filter(c =>
                                                                                    moment(c.consumptionDate).format('YYYY-MM') < moment(monthWithNoActualConsumption[nac]).format('YYYY-MM')
                                                                                    && moment(c.consumptionDate).format('YYYY-MM') >= moment(myStartDate).format('YYYY-MM')
                                                                                );
                                                                                var checkListForward = filteredConsumptionList.filter(c =>
                                                                                    moment(c.consumptionDate).format('YYYY-MM') > moment(monthWithNoActualConsumption[nac]).format('YYYY-MM')
                                                                                    && moment(c.consumptionDate).format('YYYY-MM') <= moment(myEndDate).format('YYYY-MM')
                                                                                );
                                                                                // console.log("checkListBack>>>", checkListBack, "checkListForward>>>", checkListForward);
                                                                                if (checkListBack.length > 0 && checkListForward.length > 0) {
                                                                                    actualCauseMonths.push(moment(monthWithNoActualConsumption[nac]).format('MMM-YY'));
                                                                                }

                                                                            }
                                                                            // console.log("actual cause months***", actualCauseMonths);
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
                                                                                    // console.log("in create logic+++");
                                                                                    createSupplyPlanningProblems(programList[pp].generalData, versionID, typeProblemList[prob], regionList[r], planningUnitList[p], actualCauseMonths, problemActionIndex, userId, username, problemActionList, openProblemStatusObj);
                                                                                    problemActionIndex++;
                                                                                } else {
                                                                                    // problemActionList[index].isFound = 1===== auto open logic;
                                                                                    // update cause ***********
                                                                                    problemActionList[index].dt = curDate;
                                                                                    problemActionList[index].data5 = JSON.stringify(actualCauseMonths);
                                                                                    if (problemActionList[index].problemStatus.id == 4) {
                                                                                        openProblem(index, username, userId, problemActionList, openProblemStatusObj);
                                                                                    }
                                                                                }

                                                                            } else {
                                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                    // problemActionList[index].isFound = 0;
                                                                                    // //console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
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
                                                            // console.log("logic for the planning unit that got inactive====>");
                                                            for (var pal = 0; pal < problemActionList.length; pal++) {
                                                                if (problemActionList[pal].planningUnit.id == planningUnitList[p].planningUnit.id) {
                                                                    problemActionList[pal].planningUnitActive = false;
                                                                }
                                                            }

                                                        }
                                                    }
                                                    // console.log("time taken by complete logic to execute+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                                                    // console.log("start time to set planning unit list the program data boject+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                                                    var problemTransaction = db1.transaction([objectStoreFromProps], 'readwrite');
                                                    console.log("*****palash");
                                                    console.log("problemTransaction+++", problemTransaction);
                                                    var problemOs = problemTransaction.objectStore(objectStoreFromProps);
                                                    //previously we use to use this bcz we use to calculate for all program now we do it for one program at a time so we can remove filter from below line.
                                                    console.log("time taken to get object store+++", problemOs);
                                                    console.log("problemActionList***", problemActionList);
                                                    var paList = problemActionList.filter(c => c.program.id == programList[pp].generalData.programId)
                                                    programList[pp].generalData.problemReportList = paList;
                                                    console.log("paList***", paList);

                                                    // after the logic for QPL is run accordign to the type and planning unit list we are clearing the action list and update the date on which QPL is calcukated
                                                    programList[pp].generalData.actionList = [];
                                                    programList[pp].generalData.qplLastModifiedDate = curDate;

                                                    var openCount = (paList.filter(c => c.problemStatus.id == 1 && c.planningUnitActive != false && c.regionActive != false)).length;
                                                    var addressedCount = (paList.filter(c => c.problemStatus.id == 3 && c.planningUnitActive != false && c.regionActive != false)).length;
                                                    console.log("openCount***", openCount, "addressedCount***", addressedCount);
                                                    var programQPLDetailsJson = {
                                                        id: programRequestList[pp].id,
                                                        openCount: openCount,
                                                        addressedCount: addressedCount,
                                                        programCode: programList[pp].generalData.programCode,
                                                        version: programRequestList[pp].version,
                                                        userId: programRequestList[pp].userId,
                                                        programId: programList[pp].generalData.programId,
                                                        programModified: programQPLDetailsGetRequest.result.programModified,
                                                        readonly: programQPLDetailsGetRequest.result.readonly
                                                    }
                                                    console.log("open+++", openCount, "addressed+++", addressedCount);
                                                    console.log("@@@ProgramQPLDetailsJson", programQPLDetailsJson);
                                                    // programRequestList[pp].openCount=openCount;
                                                    // programRequestList[pp].addressedCount=addressedCount;
                                                    // console.log("time taken to set problemAction list in current program json+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                                                    programRequestList[pp].programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(programList[pp].generalData), SECRET_KEY)).toString();
                                                    console.log("time taken to set complete encrypted program object with problem action list+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
                                                } catch (err) {
                                                    console.log("In error@@@*******", err)
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
                                                    console.log("programQPLDetailsJson***", programQPLDetailsJson);
                                                    var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                                    programQPLDetailsRequest.onsuccess = function (event) {
                                                        if (this.props.updateState != undefined) {
                                                            this.props.updateState(key, false);
                                                            // this.props.fetchData();
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
                                                console.log("problemList for program***", problemActionList);
                                                // console.log("new logic ends+++", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"));
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