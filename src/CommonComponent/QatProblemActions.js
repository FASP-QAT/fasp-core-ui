import { getDatabase } from "../CommonComponent/IndexedDbFunctions";

import AuthenticationService from '../views/Common/AuthenticationService';
import i18n from '../i18n';
import {
    SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN,
    MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS,
    PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS,
    APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS,
    ON_HOLD_SHIPMENT_STATUS,
    INDEXED_DB_VERSION, INDEXED_DB_NAME

} from '../Constants.js'
import CryptoJS from 'crypto-js';
import moment, { months } from 'moment';

import React, { Component } from "react";
import openProblem from '../CommonComponent/openProblem.js';
import incomplianceProblem from '../CommonComponent/incomplianceProblem.js';

export default class QatProblemActions extends Component {

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

    qatProblemActions(programId) {
        // alert(programId);
        // //console.log("program id===>",programId);
        var problemActionList = [];
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            var realmId = AuthenticationService.getRealmId();
            // //console.log("QPA 1====>", realmId);
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
                    this.props.updateState(false);
                }

            };
            getRequest.onsuccess = function (event) {
                // //console.log("get request===>",getRequest.result);
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);

                let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                let username = decryptedUser.username;

                var latestVersionProgramList = [];

                // for (var i = 0; i < getRequest.result.length; i++) {
                // //console.log("QPA 2=====>  in for");
                // if (getRequest.result[i].userId == userId) {
                var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                // //console.log("QPA 2====>", programJson);
                programList.push(programJson);
                programRequestList.push(getRequest.result);
                versionIDs.push(getRequest.result.version);

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
                    // }
                    // }
                    // for (var d = 0; d < programList.length; d++) {
                    //     var index = latestVersionProgramList.findIndex(c => c.programId == programList[d].programId);
                    //     if (index == -1) {
                    //         latestVersionProgramList.push(programList[d]);
                    //     } else {
                    //         var versionId = latestVersionProgramList[index].currentVersion.versionId;
                    //         if (versionId < programList[d].currentVersion.versionId) {
                    //             latestVersionProgramList[index] = programList[d];
                    //         }
                    //     }

                    // }
                    // programList = latestVersionProgramList;
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningUnitList = []
                    planningunitRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                        // this.props.updateState(false);
                        if (this.props.updateState != undefined) {
                            this.props.updateState(false);
                        }
                    }.bind(this);
                    planningunitRequest.onsuccess = function (e) {

                        var problemTransaction = db1.transaction(['problem'], 'readwrite');
                        var problemOs = problemTransaction.objectStore('problem');
                        var problemRequest = problemOs.getAll();
                        var problemList = []
                        problemRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                            // this.props.updateState(false);
                            if (this.props.updateState != undefined) {
                                this.props.updateState(false);
                            }
                        }.bind(this);
                        problemRequest.onsuccess = function (e) {
                            // problemList = problemRequest.result;
                            // if (realmId == -1) {
                            //     problemList = problemList;
                            // } else {
                            //     problemList = problemList.filter(c => c.realm.id == realmId);
                            // }
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
                                // this.props.updateState(false);
                                if (this.props.updateState != undefined) {
                                    this.props.updateState(false);
                                }
                            }.bind(this);
                            puRequest.onsuccess = function (e) {
                                var planningUnitListAll = puRequest.result;
                                if (programList.length == 0) {

                                    // this.props.updateState(false);
                                    if (this.props.updateState != undefined) {
                                        this.props.updateState(false);
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

                                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                                    var planningunitRequest = planningunitOs.getAll();
                                    var planningList = []
                                    planningunitRequest.onerror = function (event) {
                                        this.setState({
                                            supplyPlanError: i18n.t('static.program.errortext'),
                                            loading: false,
                                            color: "#BA0C2F",
                                        })
                                        this.hideFirstComponent()
                                    }.bind(this);
                                    planningunitRequest.onsuccess = function (e) {

                                        var programPlanningUnitList = planningunitRequest.result;

                                        for (var pp = 0; pp < programList.length; pp++) {
                                            var versionID = versionIDs[pp];
                                            var problemActionIndex = 0;
                                            problemActionList = programList[pp].problemReportList;
                                            problemActionIndex = programList[pp].problemReportList.length;
                                            var regionList = programList[pp].regionList;
                                            problemList = problemRequest.result.filter(c => c.realm.id == programList[pp].realmCountry.realm.realmId && c.active == true);
                                            planningUnitList = planningUnitResult.filter(c => c.program.id == programList[pp].programId);
                                            // for (var r = 0; r < regionList.length; r++) {
                                            for (var p = 0; p < planningUnitList.length; p++) {
                                                var checkPlanningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitList[p].planningUnit.id)[0];
                                                var checkProgramPlanningUnitObj = planningUnitList[p];

                                                if (checkPlanningUnitObj.active == true && checkProgramPlanningUnitObj.active == true) {
                                                    var shipmentListForMonths = programList[pp].shipmentList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.active.toString() == "true" && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag.toString() == "true");
                                                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                    // console.log("realm.minMosMaxGaurdrail", realm.minMosMaxGaurdrail);
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

                                                    for (var prob = 0; prob < problemList.length; prob++) {

                                                        if (problemList[prob].problem.problemId == 1) {

                                                            for (var r = 0; r < regionList.length; r++) {
                                                                var consumptionList = programList[pp].consumptionList;
                                                                consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                var numberOfMonths = parseInt(problemList[prob].data1);
                                                                // for (var m = 1; m <= numberOfMonths; m++) {
                                                                var myStartDate = moment(Date.now()).subtract(numberOfMonths, 'months').startOf('month').format("YYYY-MM-DD");
                                                                // var myEndDate = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                var myEndDate = moment(Date.now()).endOf('month').format("YYYY-MM-DD");
                                                                var filteredConsumptionList = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDate && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDate && c.actualFlag.toString() == "true" && c.active == true);

                                                                // index1 logic----------------
                                                                var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 1 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                problemActionListForIndex1.map(probObj => {
                                                                    // if (probObj != undefined) {
                                                                    var myStartDate1 = moment(probObj.dt).subtract(numberOfMonths, 'months').startOf('month').format("YYYY-MM-DD");
                                                                    // var myEndDate1 = moment(problemActionList[prob].dt).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    var myEndDate1 = moment(probObj.dt).endOf('month').format("YYYY-MM-DD");
                                                                    var filteredConsumptionList1 = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDate1 && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDate1 && c.actualFlag.toString() == "true" && c.active == true);
                                                                    var index1 = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 1
                                                                        // && c.versionId == versionID
                                                                    );

                                                                    if (filteredConsumptionList1.length > 0 && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                        incomplianceProblem(index1, username, userId, problemActionList);
                                                                    } else {
                                                                        // auto open logic for index -1 =====************=========
                                                                        if (filteredConsumptionList1.length == 0 && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                            openProblem(index1, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                    // }

                                                                });
                                                                // index1 logic----------------

                                                                var index = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                        && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 1
                                                                    // && c.versionId == versionID
                                                                );
                                                                if (filteredConsumptionList.length == 0) {
                                                                    // //console.log("index====>", index);
                                                                    if (index == -1) {
                                                                        var json = {
                                                                            problemReportId: 0,
                                                                            program: {
                                                                                id: programList[pp].programId,
                                                                                label: programList[pp].label,
                                                                                code: programList[pp].programCode
                                                                            },
                                                                            versionId: versionID,
                                                                            realmProblem: problemList[prob],

                                                                            dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                            region: {
                                                                                id: regionList[r].regionId,
                                                                                label: regionList[r].label
                                                                            },
                                                                            planningUnit: {
                                                                                id: planningUnitList[p].planningUnit.id,
                                                                                label: planningUnitList[p].planningUnit.label,

                                                                            },
                                                                            shipmentId: '',
                                                                            data5: '',
                                                                            planningUnitActive: true,
                                                                            newAdded: false,

                                                                            problemActionIndex: problemActionIndex,

                                                                            problemCategory: {
                                                                                id: 1,
                                                                                label: { label_en: 'Data Quality' }
                                                                            },
                                                                            problemStatus: {
                                                                                id: 1,
                                                                                label: { label_en: 'Open' }
                                                                            },
                                                                            problemType: {
                                                                                id: 1,
                                                                                label: {
                                                                                    label_en: 'Automatic'
                                                                                }
                                                                            },
                                                                            reviewed: false,
                                                                            reviewNotes: '',
                                                                            reviewedDate: '',
                                                                            createdBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            // createdDate: '2019-11-05 11:00:00',
                                                                            lastModifiedBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            problemTransList: [
                                                                                {
                                                                                    problemReportTransId: '',
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            active: true,
                                                                                            labelId: 461,
                                                                                            label_en: "Open",
                                                                                            label_sp: null,
                                                                                            label_fr: null,
                                                                                            label_pr: null
                                                                                        }
                                                                                    },
                                                                                    notes: "",
                                                                                    reviewed: false,
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                }
                                                                            ]
                                                                        }
                                                                        problemActionList.push(json);
                                                                        problemActionIndex++;
                                                                    } else {
                                                                        // auto open logic for index 1************========= problemActionList[index].isFound = 1;
                                                                        if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                            openProblem(index, username, userId, problemActionList);
                                                                        }
                                                                    }

                                                                } else {
                                                                    if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                        //console.log("****** in logic to make isfound 0 consumption**********",problemActionList[index]====problemActionList[index].isFound = 0);
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // }
                                                            }
                                                            // 1 consumption end =================
                                                        }


                                                        if (problemList[prob].problem.problemId == 2) {

                                                            for (var r = 0; r < regionList.length; r++) {
                                                                //2 inventory  ====================
                                                                var inventoryList = programList[pp].inventoryList;
                                                                inventoryList = inventoryList.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                var numberOfMonthsInventory = parseInt(problemList[prob].data1);
                                                                // for (var mi = 1; mi <= numberOfMonthsInventory; mi++) {
                                                                var myStartDateInventory = moment(Date.now()).subtract(numberOfMonthsInventory, 'months').startOf('month').format("YYYY-MM-DD");
                                                                // var myEndDateInventory = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                var myEndDateInventory = moment(Date.now()).endOf('month').format("YYYY-MM-DD");
                                                                var filterInventoryList = inventoryList.filter(c => moment(c.inventoryDate).format('YYYY-MM-DD') >= myStartDateInventory && moment(c.inventoryDate).format('YYYY-MM-DD') <= myEndDateInventory && c.active == true);
                                                                var index = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                        && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 2
                                                                    // && c.versionId == versionID
                                                                );

                                                                // index1 logic----------------
                                                                var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 2 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                problemActionListForIndex1.map(probObj => {
                                                                    // if (probObj != undefined) {
                                                                    var myStartDateInventory1 = moment(probObj.dt).subtract(numberOfMonthsInventory, 'months').startOf('month').format("YYYY-MM-DD");
                                                                    // var myEndDateInventory1 = moment(probObj.dt).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    var myEndDateInventory1 = moment(probObj.dt).endOf('month').format("YYYY-MM-DD");
                                                                    var filterInventoryList1 = inventoryList.filter(c => moment(c.inventoryDate).format('YYYY-MM-DD') >= myStartDateInventory1 && moment(c.inventoryDate).format('YYYY-MM-DD') <= myEndDateInventory1 && c.active == true);
                                                                    var index1 = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 2
                                                                        // && c.versionId == versionID
                                                                    );

                                                                    if (filterInventoryList1.length > 0 && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                        incomplianceProblem(index1, username, userId, problemActionList);
                                                                    } else {
                                                                        if (filterInventoryList1.length == 0 && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                            openProblem(index1, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                    // }
                                                                });
                                                                // index1 logic----------------

                                                                if (filterInventoryList.length == 0) {
                                                                    if (index == -1) {
                                                                        var json = {
                                                                            problemReportId: 0,
                                                                            program: {
                                                                                id: programList[pp].programId,
                                                                                label: programList[pp].label,
                                                                                code: programList[pp].programCode
                                                                            },
                                                                            versionId: versionID,
                                                                            realmProblem: problemList[prob],

                                                                            dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                            region: {
                                                                                id: regionList[r].regionId,
                                                                                label: regionList[r].label
                                                                            },
                                                                            planningUnit: {
                                                                                id: planningUnitList[p].planningUnit.id,
                                                                                label: planningUnitList[p].planningUnit.label,

                                                                            },
                                                                            shipmentId: '',
                                                                            data5: '',
                                                                            planningUnitActive: true,
                                                                            newAdded: false,

                                                                            problemActionIndex: problemActionIndex,

                                                                            problemCategory: {
                                                                                id: 1,
                                                                                label: { label_en: 'Data Quality' }
                                                                            },
                                                                            problemStatus: {
                                                                                id: 1,
                                                                                label: { label_en: 'Open' }
                                                                            },
                                                                            problemType: {
                                                                                id: 1,
                                                                                label: {
                                                                                    label_en: 'Automatic'
                                                                                }
                                                                            },
                                                                            reviewed: false,
                                                                            reviewNotes: '',
                                                                            reviewedDate: '',
                                                                            createdBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            lastModifiedBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            problemTransList: [
                                                                                {
                                                                                    problemReportTransId: '',
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            active: true,
                                                                                            labelId: 461,
                                                                                            label_en: "Open",
                                                                                            label_sp: null,
                                                                                            label_fr: null,
                                                                                            label_pr: null
                                                                                        }
                                                                                    },
                                                                                    notes: "",
                                                                                    reviewed: false,
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                }
                                                                            ]

                                                                        }

                                                                        problemActionList.push(json);
                                                                        problemActionIndex++;
                                                                    } else {
                                                                        // problemActionList[index].isFound = 1 ==== auto open logic for problem;
                                                                        if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                            openProblem(index, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                } else {
                                                                    if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                        // problemActionList[index].isFound = 0;
                                                                        //console.log("****** in logic to make isfound 0 inventory**********", problemActionList[index]);
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }
                                                            // }
                                                            // 2 inventory end=================

                                                        }

                                                        if (problemList[prob].problem.problemId == 3) {
                                                            // 3 shipment which have received date in past but status is not yet received
                                                            var shipmentList = programList[pp].shipmentList;
                                                            // //console.log("shipmentList=======>", shipmentList);
                                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                                            var filteredShipmentList = shipmentList.filter(c => moment(c.expectedDeliveryDate).add(parseInt(problemList[prob].data1), 'days').format('YYYY-MM-DD') < moment(myDateShipment).format('YYYY-MM-DD') && c.shipmentStatus.id != 7 && c.active == true && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0 && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                                            if (filteredShipmentList.length > 0) {

                                                                var shipmentIdsFromShipmnetList = [];

                                                                for (var s = 0; s < filteredShipmentList.length; s++) {
                                                                    if (filteredShipmentList[s].shipmentId != 0) {
                                                                        shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                    } else {
                                                                        shipmentIdsFromShipmnetList.push(filteredShipmentList[s].index);
                                                                    }

                                                                    var indexShipment = 0;
                                                                    var newAddShipment = false;
                                                                    if (filteredShipmentList[s].shipmentId > 0) {
                                                                        indexShipment = problemActionList.findIndex(
                                                                            c => c.program.id == programList[pp].programId
                                                                                && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                && c.realmProblem.problem.problemId == 3
                                                                            // && c.versionId == versionID
                                                                        );
                                                                    } else {
                                                                        indexShipment = problemActionList.findIndex(
                                                                            c => c.program.id == programList[pp].programId
                                                                                && c.index == filteredShipmentList[s].index
                                                                                && c.realmProblem.problem.problemId == 3
                                                                            // && c.versionId == versionID
                                                                        );
                                                                        newAddShipment = true;
                                                                    }

                                                                    if (indexShipment == -1) {
                                                                        var index = 0;
                                                                        if (filteredShipmentList[s].shipmentId == 0) {
                                                                            index = filteredShipmentList[s].index;
                                                                        }
                                                                        var json = {
                                                                            problemReportId: 0,
                                                                            program: {
                                                                                id: programList[pp].programId,
                                                                                label: programList[pp].label,
                                                                                code: programList[pp].programCode
                                                                            },
                                                                            versionId: versionID,
                                                                            realmProblem: problemList[prob],

                                                                            dt: '',
                                                                            region: {
                                                                                id: 0
                                                                            },
                                                                            planningUnit: {
                                                                                id: filteredShipmentList[s].planningUnit.id,
                                                                                label: filteredShipmentList[s].planningUnit.label,

                                                                            },
                                                                            shipmentId: filteredShipmentList[s].shipmentId,
                                                                            data5: '',
                                                                            planningUnitActive: true,
                                                                            newAdded: newAddShipment,

                                                                            problemActionIndex: problemActionIndex,

                                                                            index: index,
                                                                            problemCategory: {
                                                                                id: 2,
                                                                                label: { label_en: 'Procurement Schedule' }
                                                                            },
                                                                            problemStatus: {
                                                                                id: 1,
                                                                                label: { label_en: 'Open' }
                                                                            },
                                                                            problemType: {
                                                                                id: 1,
                                                                                label: {
                                                                                    label_en: 'Automatic'
                                                                                }
                                                                            },
                                                                            reviewed: false,
                                                                            reviewNotes: '',
                                                                            reviewedDate: '',
                                                                            createdBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            lastModifiedBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            problemTransList: [
                                                                                {
                                                                                    problemReportTransId: '',
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            active: true,
                                                                                            labelId: 461,
                                                                                            label_en: "Open",
                                                                                            label_sp: null,
                                                                                            label_fr: null,
                                                                                            label_pr: null
                                                                                        }
                                                                                    },
                                                                                    notes: "",
                                                                                    reviewed: false,
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                }
                                                                            ]

                                                                        }
                                                                        problemActionList.push(json);
                                                                        problemActionIndex++;
                                                                    } else {
                                                                        // make shipmet problem status eual to open========
                                                                        if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                            openProblem(indexShipment, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                }
                                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                                    // problemActionList[d].program.id == programList[pp].programId
                                                                    if (problemActionList[kb].realmProblem.problem.problemId == 3 && problemActionList[kb].program.id == programList[pp].programId && (problemActionList[kb].problemStatus.id == 1 || problemActionList[kb].problemStatus.id == 3) && problemActionList[kb].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[kb].shipmentId != 0) {
                                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                                        if (kbShipmentId == 0) {
                                                                            kbShipmentId = problemActionList[kb].index;
                                                                        }
                                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                                            // make status open 
                                                                            if (problemActionList[kb].problemStatus.id == 4) {
                                                                                openProblem(kb, username, userId, problemActionList);
                                                                            }
                                                                        } else {
                                                                            // make shipmentStatus resolved=============
                                                                            //console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                                            incomplianceProblem(kb, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                }


                                                            } else {
                                                                for (var d = 0; d < problemActionList.length; d++) {
                                                                    if (problemActionList[d].realmProblem.problem.problemId == 3 && problemActionList[d].program.id == programList[pp].programId && (problemActionList[d].problemStatus.id == 1 || problemActionList[d].problemStatus.id == 3) && problemActionList[d].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[d].shipmentId != 0) {
                                                                        var index = d;
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }

                                                        }

                                                        if (problemList[prob].problem.problemId == 8) {

                                                            for (var r = 0; r < regionList.length; r++) {
                                                                // 4 no forecasted consumption for future 18 months
                                                                var consumptionList = programList[pp].consumptionList;
                                                                consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                var numberOfMonthsInFunture = problemList[prob].data1;
                                                                // for (var m = 1; m <= numberOfMonthsInFunture; m++) {
                                                                var myStartDateFuture = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                var myEndDateFuture = moment(Date.now()).add(numberOfMonthsInFunture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                var filteredConsumptionListTwo = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDateFuture && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDateFuture && c.actualFlag.toString() == "false" && c.active == true);
                                                                var index = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                        && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 8
                                                                    // && c.versionId == versionID
                                                                );

                                                                // index1 logic----------------
                                                                var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 8 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                problemActionListForIndex1.map(probObj => {
                                                                    // if (problemActionList[prob] != undefined) {
                                                                    var myStartDateFuture1 = moment(probObj.dt).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                    var myEndDateFuture1 = moment(probObj.dt).add(numberOfMonthsInFunture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    var filteredConsumptionListTwo1 = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDateFuture1 && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDateFuture1 && c.actualFlag.toString() == "false" && c.active == true);

                                                                    var monthsWithForecastedConsumption1 = [];
                                                                    for (var fcm1 = 0; fcm1 < filteredConsumptionListTwo1.length; fcm1++) {
                                                                        monthsWithForecastedConsumption1.push(moment(filteredConsumptionListTwo1[fcm1].consumptionDate).format("MMM-YY"));
                                                                    }
                                                                    // console.log("monthsWithForecastedConsumption+++",monthsWithForecastedConsumption1);
                                                                    var eighteenmonthsArray1 = [];
                                                                    for (var ema1 = 1; ema1 <= numberOfMonthsInFunture; ema1++) {
                                                                        eighteenmonthsArray1.push(moment(Date.now()).add(ema1, 'months').format("MMM-YY"));
                                                                    }
                                                                    // console.log("eighteenmonthsArray+++",eighteenmonthsArray1);
                                                                    var monthWithNoForecastedConsumption1 = eighteenmonthsArray1.filter(function (obj) { return monthsWithForecastedConsumption1.indexOf(obj) == -1; });
                                                                    // console.log("monthWithNoForecastedConsumption+++",monthWithNoForecastedConsumption1);


                                                                    var index1 = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 8
                                                                        // && c.versionId == versionID
                                                                    );

                                                                    if (filteredConsumptionListTwo1.length == 18 && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                        incomplianceProblem(index1, username, userId, problemActionList);

                                                                    } else {
                                                                        if (filteredConsumptionListTwo1.length != 18 && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                            openProblem(index1, username, userId, problemActionList);
                                                                        }

                                                                        problemActionList[index1].data5 = monthWithNoForecastedConsumption1.toString();
                                                                    }
                                                                    // }
                                                                });
                                                                // index1 logic end----------------

                                                                var monthsWithForecastedConsumption = [];
                                                                for (var fcm = 0; fcm < filteredConsumptionListTwo.length; fcm++) {
                                                                    monthsWithForecastedConsumption.push(moment(filteredConsumptionListTwo[fcm].consumptionDate).format("MMM-YY"));
                                                                }
                                                                // console.log("monthsWithForecastedConsumption+++",monthsWithForecastedConsumption);
                                                                var eighteenmonthsArray = [];
                                                                for (var ema = 1; ema <= numberOfMonthsInFunture; ema++) {
                                                                    eighteenmonthsArray.push(moment(Date.now()).add(ema, 'months').format("MMM-YY"));
                                                                }
                                                                // console.log("eighteenmonthsArray+++",eighteenmonthsArray);
                                                                var monthWithNoForecastedConsumption = eighteenmonthsArray.filter(function (obj) { return monthsWithForecastedConsumption.indexOf(obj) == -1; });
                                                                // console.log("monthWithNoForecastedConsumption+++",monthWithNoForecastedConsumption);


                                                                if (filteredConsumptionListTwo.length < 18) {
                                                                    if (index == -1) {
                                                                        var json = {
                                                                            problemReportId: 0,
                                                                            program: {
                                                                                id: programList[pp].programId,
                                                                                label: programList[pp].label,
                                                                                code: programList[pp].programCode
                                                                            },
                                                                            versionId: versionID,
                                                                            realmProblem: problemList[prob],

                                                                            dt: moment(Date.now()).format("YYYY-MM-DD"),
                                                                            region: {
                                                                                id: regionList[r].regionId,
                                                                                label: regionList[r].label
                                                                            },
                                                                            planningUnit: {
                                                                                id: planningUnitList[p].planningUnit.id,
                                                                                label: planningUnitList[p].planningUnit.label,

                                                                            },
                                                                            shipmentId: '',
                                                                            data5: monthWithNoForecastedConsumption.toString(),
                                                                            planningUnitActive: true,
                                                                            newAdded: false,
                                                                            problemActionIndex: problemActionIndex,
                                                                            problemCategory: {
                                                                                id: 3,
                                                                                label: { label_en: 'Supply Planning' }
                                                                            },
                                                                            problemStatus: {
                                                                                id: 1,
                                                                                label: { label_en: 'Open' }
                                                                            },
                                                                            problemType: {
                                                                                id: 1,
                                                                                label: {
                                                                                    label_en: 'Automatic'
                                                                                }
                                                                            },
                                                                            reviewed: false,
                                                                            reviewNotes: '',
                                                                            reviewedDate: '',
                                                                            createdBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            lastModifiedBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            problemTransList: [
                                                                                {
                                                                                    problemReportTransId: '',
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            active: true,
                                                                                            labelId: 461,
                                                                                            label_en: "Open",
                                                                                            label_sp: null,
                                                                                            label_fr: null,
                                                                                            label_pr: null
                                                                                        }
                                                                                    },
                                                                                    notes: "",
                                                                                    reviewed: false,
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                }
                                                                            ]
                                                                        }

                                                                        problemActionList.push(json);
                                                                        problemActionIndex++;
                                                                    } else {
                                                                        // problemActionList[index].isFound = 1===== auto open logic;
                                                                        if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                            openProblem(index, username, userId, problemActionList);
                                                                        }
                                                                        problemActionList[index].data5 = monthWithNoForecastedConsumption.toString();
                                                                    }

                                                                } else {
                                                                    if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                        // problemActionList[index].isFound = 0;
                                                                        // //console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                        incomplianceProblem(index, username, userId, problemActionList);

                                                                    }
                                                                }
                                                            }
                                                            // }
                                                        }
                                                        if (problemList[prob].problem.problemId == 4) {
                                                            // submited shipments logic======================
                                                            var shipmentList = programList[pp].shipmentList;
                                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                                            var filteredShipmentList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) && c.active == true && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0 && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                                            // //console.log("submited status list===>", filteredShipmentList);
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
                                                                        var addLeadTimes = programPlanningUnitList.filter(c => c.planningUnit.id == filteredShipmentList[s].planningUnit.id)[0].localProcurementLeadTime;
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
                                                                    if ((moment(submittedDate).add(parseInt(problemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD"))) {
                                                                        if (filteredShipmentList[s].shipmentId != 0) {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                        } else {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].index);
                                                                        }

                                                                        var indexShipment = 0;
                                                                        var newAddShipment = false;
                                                                        if (filteredShipmentList[s].shipmentId > 0) {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                    && c.realmProblem.problem.problemId == 4
                                                                                // && c.versionId == versionID
                                                                            );
                                                                        } else {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.index == filteredShipmentList[s].index
                                                                                    && c.realmProblem.problem.problemId == 4
                                                                                // && c.versionId == versionID
                                                                            );
                                                                            newAddShipment = true;
                                                                        }

                                                                        if (indexShipment == -1) {
                                                                            var index = 0;
                                                                            if (filteredShipmentList[s].shipmentId == 0) {
                                                                                index = filteredShipmentList[s].index;
                                                                            }
                                                                            var json = {
                                                                                problemReportId: 0,
                                                                                program: {
                                                                                    id: programList[pp].programId,
                                                                                    label: programList[pp].label,
                                                                                    code: programList[pp].programCode
                                                                                },
                                                                                versionId: versionID,
                                                                                realmProblem: problemList[prob],

                                                                                dt: '',
                                                                                region: {
                                                                                    id: 0
                                                                                },
                                                                                planningUnit: {
                                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                                },
                                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                                data5: '',
                                                                                planningUnitActive: true,
                                                                                newAdded: newAddShipment,

                                                                                problemActionIndex: problemActionIndex,

                                                                                index: index,
                                                                                problemCategory: {
                                                                                    id: 2,
                                                                                    label: { label_en: 'Procurement Schedule' }
                                                                                },
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: { label_en: 'Open' }
                                                                                },
                                                                                problemType: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        label_en: 'Automatic'
                                                                                    }
                                                                                },
                                                                                reviewed: false,
                                                                                reviewNotes: '',
                                                                                reviewedDate: '',
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                lastModifiedBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                problemTransList: [
                                                                                    {
                                                                                        problemReportTransId: '',
                                                                                        problemStatus: {
                                                                                            id: 1,
                                                                                            label: {
                                                                                                active: true,
                                                                                                labelId: 461,
                                                                                                label_en: "Open",
                                                                                                label_sp: null,
                                                                                                label_fr: null,
                                                                                                label_pr: null
                                                                                            }
                                                                                        },
                                                                                        notes: "",
                                                                                        reviewed: false,
                                                                                        createdBy: {
                                                                                            userId: userId,
                                                                                            username: username
                                                                                        },
                                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                    }
                                                                                ]

                                                                            }
                                                                            problemActionList.push(json);
                                                                            problemActionIndex++;
                                                                        } else {
                                                                            // make shipmet problem status eual to open========
                                                                            if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                                openProblem(indexShipment, username, userId, problemActionList);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                                    if (problemActionList[kb].realmProblem.problem.problemId == 4 && (problemActionList[kb].problemStatus.id == 1 || problemActionList[kb].problemStatus.id == 3) && problemActionList[kb].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[kb].shipmentId != 0) {
                                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                                        if (kbShipmentId == 0) {
                                                                            kbShipmentId = problemActionList[kb].index;
                                                                        }
                                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                                            // make status open 
                                                                            if (problemActionList[kb].problemStatus.id == 4) {
                                                                                openProblem(kb, username, userId, problemActionList);
                                                                            }

                                                                        } else {
                                                                            // make shipmentStatus resolved=============
                                                                            ////console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                                            incomplianceProblem(kb, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                for (var d = 0; d < problemActionList.length; d++) {
                                                                    if (problemActionList[d].realmProblem.problem.problemId == 4 && problemActionList[d].program.id == programList[pp].programId && (problemActionList[d].problemStatus.id == 1 || problemActionList[d].problemStatus.id == 3) && problemActionList[d].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[d].shipmentId != 0) {
                                                                        var index = d;
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }


                                                        }
                                                        if (problemList[prob].problem.problemId == 5) {
                                                            // approved shipments logic======================
                                                            var shipmentList = programList[pp].shipmentList;
                                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                                            var filteredShipmentList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) && c.active == true && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0 && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                                            // //console.log("approved status list===>", filteredShipmentList);
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
                                                                        var addLeadTimes = programPlanningUnitList.filter(c => c.planningUnit.id == filteredShipmentList[s].planningUnit.id)[0].localProcurementLeadTime;
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
                                                                    //console.log("approvedDate=====>", approvedDate);

                                                                    if ((moment(approvedDate).add(parseInt(problemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD"))) {

                                                                        if (filteredShipmentList[s].shipmentId != 0) {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                        } else {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].index);
                                                                        }

                                                                        var indexShipment = 0;
                                                                        var newAddShipment = false;
                                                                        if (filteredShipmentList[s].shipmentId > 0) {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                    && c.realmProblem.problem.problemId == 5
                                                                                // && c.versionId == versionID
                                                                            );
                                                                        } else {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.index == filteredShipmentList[s].index
                                                                                    && c.realmProblem.problem.problemId == 5
                                                                                // && c.versionId == versionID
                                                                            );
                                                                            newAddShipment = true;
                                                                        }

                                                                        if (indexShipment == -1) {
                                                                            var index = 0;
                                                                            if (filteredShipmentList[s].shipmentId == 0) {
                                                                                index = filteredShipmentList[s].index;
                                                                            }
                                                                            var json = {
                                                                                problemReportId: 0,
                                                                                program: {
                                                                                    id: programList[pp].programId,
                                                                                    label: programList[pp].label,
                                                                                    code: programList[pp].programCode
                                                                                },
                                                                                versionId: versionID,
                                                                                realmProblem: problemList[prob],

                                                                                dt: '',
                                                                                region: {
                                                                                    id: 0
                                                                                },
                                                                                planningUnit: {
                                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                                },

                                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                                data5: '',
                                                                                planningUnitActive: true,
                                                                                newAdded: newAddShipment,

                                                                                problemActionIndex: problemActionIndex,

                                                                                index: index,
                                                                                problemCategory: {
                                                                                    id: 2,
                                                                                    label: { label_en: 'Procurement Schedule' }
                                                                                },
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: { label_en: 'Open' }
                                                                                },
                                                                                problemType: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        label_en: 'Automatic'
                                                                                    }
                                                                                },
                                                                                reviewed: false,
                                                                                reviewNotes: '',
                                                                                reviewedDate: '',
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                lastModifiedBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                problemTransList: [
                                                                                    {
                                                                                        problemReportTransId: '',
                                                                                        problemStatus: {
                                                                                            id: 1,
                                                                                            label: {
                                                                                                active: true,
                                                                                                labelId: 461,
                                                                                                label_en: "Open",
                                                                                                label_sp: null,
                                                                                                label_fr: null,
                                                                                                label_pr: null
                                                                                            }
                                                                                        },
                                                                                        notes: "",
                                                                                        reviewed: false,
                                                                                        createdBy: {
                                                                                            userId: userId,
                                                                                            username: username
                                                                                        },
                                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                    }
                                                                                ]

                                                                            }
                                                                            problemActionList.push(json);
                                                                            problemActionIndex++;
                                                                        } else {
                                                                            // make shipmet problem status eual to open========
                                                                            if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                                openProblem(indexShipment, username, userId, problemActionList);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                                    if (problemActionList[kb].realmProblem.problem.problemId == 5 && (problemActionList[kb].problemStatus.id == 1 || problemActionList[kb].problemStatus.id == 3) && problemActionList[kb].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[kb].shipmentId != 0) {
                                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                                        if (kbShipmentId == 0) {
                                                                            kbShipmentId = problemActionList[kb].index;
                                                                        }
                                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                                            // make status open 
                                                                            if (problemActionList[kb].problemStatus.id == 4) {
                                                                                openProblem(kb, username, userId, problemActionList);
                                                                            }
                                                                        } else {
                                                                            // make shipmentStatus resolved=============
                                                                            //console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                                            incomplianceProblem(kb, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                for (var d = 0; d < problemActionList.length; d++) {
                                                                    if (problemActionList[d].realmProblem.problem.problemId == 5 && problemActionList[d].program.id == programList[pp].programId && (problemActionList[d].problemStatus.id == 1 || problemActionList[d].problemStatus.id == 3) && problemActionList[d].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[d].shipmentId != 0) {
                                                                        var index = d;
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }


                                                        }
                                                        if (problemList[prob].problem.problemId == 6) {
                                                            // shipped shipments logic======================
                                                            var shipmentList = programList[pp].shipmentList;
                                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                                            var filteredShipmentList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS) && c.active == true && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0 && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                                            // //console.log("shipped status list===>", filteredShipmentList);

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
                                                                        var addLeadTimes = programPlanningUnitList.filter(c => c.planningUnit.id == filteredShipmentList[s].planningUnit.id)[0].localProcurementLeadTime;
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
                                                                    //   //console.log("shippedDate=====>", shippedDate);

                                                                    if ((moment(shippedDate).add(parseInt(problemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD"))) {

                                                                        if (filteredShipmentList[s].shipmentId != 0) {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                        } else {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].index);
                                                                        }

                                                                        var indexShipment = 0;
                                                                        var newAddShipment = false;
                                                                        if (filteredShipmentList[s].shipmentId > 0) {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                    && c.realmProblem.problem.problemId == 6
                                                                                // && c.versionId == versionID
                                                                            );
                                                                        } else {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.index == filteredShipmentList[s].index
                                                                                    && c.realmProblem.problem.problemId == 6
                                                                                // && c.versionId == versionID
                                                                            );
                                                                            newAddShipment = true;
                                                                        }

                                                                        if (indexShipment == -1) {
                                                                            var index = 0;
                                                                            if (filteredShipmentList[s].shipmentId == 0) {
                                                                                index = filteredShipmentList[s].index;
                                                                            }
                                                                            var json = {
                                                                                problemReportId: 0,
                                                                                program: {
                                                                                    id: programList[pp].programId,
                                                                                    label: programList[pp].label,
                                                                                    code: programList[pp].programCode
                                                                                },
                                                                                versionId: versionID,
                                                                                realmProblem: problemList[prob],

                                                                                dt: '',
                                                                                region: {
                                                                                    id: 0
                                                                                },
                                                                                planningUnit: {
                                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                                },
                                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                                data5: '',
                                                                                planningUnitActive: true,
                                                                                newAdded: newAddShipment,

                                                                                problemActionIndex: problemActionIndex,

                                                                                index: index,
                                                                                problemCategory: {
                                                                                    id: 2,
                                                                                    label: { label_en: 'Procurement Schedule' }
                                                                                },
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: { label_en: 'Open' }
                                                                                },
                                                                                problemType: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        label_en: 'Automatic'
                                                                                    }
                                                                                },
                                                                                reviewed: false,
                                                                                reviewNotes: '',
                                                                                reviewedDate: '',
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                lastModifiedBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                problemTransList: [
                                                                                    {
                                                                                        problemReportTransId: '',
                                                                                        problemStatus: {
                                                                                            id: 1,
                                                                                            label: {
                                                                                                active: true,
                                                                                                labelId: 461,
                                                                                                label_en: "Open",
                                                                                                label_sp: null,
                                                                                                label_fr: null,
                                                                                                label_pr: null
                                                                                            }
                                                                                        },
                                                                                        notes: "",
                                                                                        reviewed: false,
                                                                                        createdBy: {
                                                                                            userId: userId,
                                                                                            username: username
                                                                                        },
                                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                    }
                                                                                ]

                                                                            }
                                                                            problemActionList.push(json);
                                                                            problemActionIndex++;
                                                                        } else {
                                                                            // make shipmet problem status eual to open========
                                                                            if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                                openProblem(indexShipment, username, userId, problemActionList);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                                    if (problemActionList[kb].realmProblem.problem.problemId == 6 && (problemActionList[kb].problemStatus.id == 1 || problemActionList[kb].problemStatus.id == 3) && problemActionList[kb].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[kb].shipmentId != 0) {
                                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                                        if (kbShipmentId == 0) {
                                                                            kbShipmentId = problemActionList[kb].index;
                                                                        }
                                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                                            // make status open 
                                                                            if (problemActionList[kb].problemStatus.id == 4) {
                                                                                openProblem(kb, username, userId, problemActionList);
                                                                            }
                                                                        } else {
                                                                            // make shipmentStatus resolved=============
                                                                            ////console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                                            incomplianceProblem(kb, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                for (var d = 0; d < problemActionList.length; d++) {
                                                                    if (problemActionList[d].realmProblem.problem.problemId == 6 && problemActionList[d].program.id == programList[pp].programId && (problemActionList[d].problemStatus.id == 1 || problemActionList[d].problemStatus.id == 3) && problemActionList[d].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[d].shipmentId != 0) {
                                                                        var index = d;
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }


                                                        }
                                                        if (problemList[prob].problem.problemId == 7) {
                                                            // arrived shipments logic======================
                                                            var shipmentList = programList[pp].shipmentList;
                                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                                            var filteredShipmentList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS) && c.active == true && c.planningUnit.id == planningUnitList[p].planningUnit.id && c.shipmentId != 0 && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                                            //  //console.log("approved status list===>", filteredShipmentList);
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
                                                                        var addLeadTimes = programPlanningUnitList.filter(c => c.planningUnit.id == filteredShipmentList[s].planningUnit.id)[0].localProcurementLeadTime;
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
                                                                    // //console.log("arrivedDate=====>", arrivedDate);
                                                                    if ((moment(arrivedDate).format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD"))) {

                                                                        if (filteredShipmentList[s].shipmentId != 0) {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].shipmentId);
                                                                        } else {
                                                                            shipmentIdsFromShipmnetList.push(filteredShipmentList[s].index);
                                                                        }

                                                                        var indexShipment = 0;
                                                                        var newAddShipment = false;
                                                                        if (filteredShipmentList[s].shipmentId > 0) {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.shipmentId == filteredShipmentList[s].shipmentId
                                                                                    && c.realmProblem.problem.problemId == 7
                                                                                // && c.versionId == versionID
                                                                            );
                                                                        } else {
                                                                            indexShipment = problemActionList.findIndex(
                                                                                c => c.program.id == programList[pp].programId
                                                                                    && c.index == filteredShipmentList[s].index
                                                                                    && c.realmProblem.problem.problemId == 7
                                                                                // && c.versionId == versionID
                                                                            );
                                                                            newAddShipment = true;
                                                                        }

                                                                        if (indexShipment == -1) {
                                                                            var index = 0;
                                                                            if (filteredShipmentList[s].shipmentId == 0) {
                                                                                index = filteredShipmentList[s].index;
                                                                            }
                                                                            var json = {
                                                                                problemReportId: 0,
                                                                                program: {
                                                                                    id: programList[pp].programId,
                                                                                    label: programList[pp].label,
                                                                                    code: programList[pp].programCode
                                                                                },
                                                                                versionId: versionID,
                                                                                realmProblem: problemList[prob],

                                                                                dt: '',
                                                                                region: {
                                                                                    id: 0
                                                                                },
                                                                                planningUnit: {
                                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                                },
                                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                                data5: '',
                                                                                planningUnitActive: true,
                                                                                newAdded: newAddShipment,

                                                                                problemActionIndex: problemActionIndex,

                                                                                index: index,
                                                                                problemCategory: {
                                                                                    id: 2,
                                                                                    label: { label_en: 'Procurement Schedule' }
                                                                                },
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: { label_en: 'Open' }
                                                                                },
                                                                                problemType: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        label_en: 'Automatic'
                                                                                    }
                                                                                },
                                                                                reviewed: false,
                                                                                reviewNotes: '',
                                                                                reviewedDate: '',
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                lastModifiedBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                problemTransList: [
                                                                                    {
                                                                                        problemReportTransId: '',
                                                                                        problemStatus: {
                                                                                            id: 1,
                                                                                            label: {
                                                                                                active: true,
                                                                                                labelId: 461,
                                                                                                label_en: "Open",
                                                                                                label_sp: null,
                                                                                                label_fr: null,
                                                                                                label_pr: null
                                                                                            }
                                                                                        },
                                                                                        notes: "",
                                                                                        reviewed: false,
                                                                                        createdBy: {
                                                                                            userId: userId,
                                                                                            username: username
                                                                                        },
                                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                    }
                                                                                ]

                                                                            }
                                                                            problemActionList.push(json);
                                                                            problemActionIndex++;
                                                                        } else {
                                                                            // make shipmet problem status eual to open========
                                                                            if (indexShipment != -1 && problemActionList[indexShipment].problemStatus.id == 4) {
                                                                                openProblem(indexShipment, username, userId, problemActionList);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                                    if (problemActionList[kb].realmProblem.problem.problemId == 7 && (problemActionList[kb].problemStatus.id == 1 || problemActionList[kb].problemStatus.id == 3) && problemActionList[kb].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[kb].shipmentId != 0) {
                                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                                        if (kbShipmentId == 0) {
                                                                            kbShipmentId = problemActionList[kb].index;
                                                                        }
                                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                                            // make status open 
                                                                            if (problemActionList[kb].problemStatus.id == 4) {
                                                                                openProblem(kb, username, userId, problemActionList);
                                                                            }
                                                                        } else {
                                                                            // make shipmentStatus resolved=============
                                                                            ////console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                                            incomplianceProblem(kb, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                for (var d = 0; d < problemActionList.length; d++) {
                                                                    if (problemActionList[d].realmProblem.problem.problemId == 7 && problemActionList[d].program.id == programList[pp].programId && (problemActionList[d].problemStatus.id == 1 || problemActionList[d].problemStatus.id == 3) && problemActionList[d].planningUnit.id == planningUnitList[p].planningUnit.id && problemActionList[d].shipmentId != 0) {
                                                                        var index = d;
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        // Dynamic forecasting for ARV tracer category  tc for ARV 18,3*****************
                                                        if (problemList[prob].problem.problemId == 10) {

                                                            for (var r = 0; r < regionList.length; r++) {
                                                                // //console.log("planning unit====>********", planningUnitId);
                                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                                var tracerCategories = problemList[prob].data3;
                                                                var tracerArray = [];
                                                                if (tracerCategories != null && tracerCategories != "") {
                                                                    var tracerSplit = tracerCategories.split(',');
                                                                    for (var t = 0; t < tracerSplit.length; t++) {
                                                                        tracerArray.push(tracerSplit[t]);
                                                                    }
                                                                }
                                                                if (tracerArray.includes(planningUnitObj.forecastingUnit.tracerCategory.id)) {
                                                                    // if (planningUnitObj.forecastingUnit.tracerCategory.id == 17 || planningUnitObj.forecastingUnit.tracerCategory.id == 3) {
                                                                    var consumptionList = programList[pp].consumptionList;
                                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);

                                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate && c.active == true);
                                                                    var index = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 10
                                                                        // && c.versionId == versionID
                                                                    );

                                                                    // index1 logic----------------
                                                                    var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 10 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                    problemActionListForIndex1.map(probObj => {
                                                                        // if (problemActionList[prob] != undefined) {
                                                                        var consumptionList1 = programList[pp].consumptionList;
                                                                        consumptionList1 = consumptionList1.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                        var myStartDate1 = moment(probObj.dt).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                        var myEndDate1 = moment(probObj.dt).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                        consumptionList1 = consumptionList1.filter(c => c.consumptionDate >= myStartDate1 && c.consumptionDate <= myEndDate1 && c.active == true);
                                                                        var index1 = problemActionList.findIndex(
                                                                            c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                && c.program.id == programList[pp].programId
                                                                                && c.realmProblem.problem.problemId == 10
                                                                            // && c.versionId == versionID
                                                                        );

                                                                        if (consumptionList1.length > problemList[prob].data2) {
                                                                            var conQtyArray1 = [];
                                                                            for (var i = 0; i < consumptionList1.length; i++) {
                                                                                conQtyArray1.push(consumptionList1[i].consumptionQty);
                                                                            }
                                                                            // //console.log("consumptionArray====>", conQtyArray);
                                                                            // ======================
                                                                            var a1 = conQtyArray1;
                                                                            var check1 = false;
                                                                            var currArray1 = [];
                                                                            var spanLength1 = problemList[prob].data2 - 1;
                                                                            for (var i = 0; i < a1.length - spanLength1; i++) {
                                                                                var currArray1 = [];
                                                                                for (var j = 0; j < problemList[prob].data2; j++) {
                                                                                    currArray1.push(a1[i + j]);
                                                                                }
                                                                                const allEqual1 = arr1 => arr1.every(v => v === arr1[0]);
                                                                                if (allEqual1(currArray1)) {
                                                                                    check1 = true;
                                                                                    break;
                                                                                } else {
                                                                                    check1 = false;
                                                                                }
                                                                            }

                                                                            if (check1 != true && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                                incomplianceProblem(index1, username, userId, problemActionList);
                                                                            } else {
                                                                                // auto open problem logic==========>
                                                                                if (check1 == true && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                                    openProblem(index1, username, userId, problemActionList);
                                                                                }
                                                                            }
                                                                            // }

                                                                        }
                                                                    });
                                                                    // index1 logic----------------

                                                                    if (consumptionList.length > problemList[prob].data2) {
                                                                        var conQtyArray = [];
                                                                        for (var i = 0; i < consumptionList.length; i++) {
                                                                            conQtyArray.push(consumptionList[i].consumptionQty);
                                                                        }
                                                                        // //console.log("consumptionArray====>", conQtyArray);
                                                                        // ======================
                                                                        var a = conQtyArray;
                                                                        var check = false;
                                                                        var currArray = [];
                                                                        var spanLength = problemList[prob].data2 - 1;
                                                                        for (var i = 0; i < a.length - spanLength; i++) {
                                                                            var currArray = [];
                                                                            for (var j = 0; j < problemList[prob].data2; j++) {
                                                                                currArray.push(a[i + j]);
                                                                            }
                                                                            const allEqual = arr => arr.every(v => v === arr[0]);
                                                                            if (allEqual(currArray)) {
                                                                                check = true;
                                                                                break;
                                                                            } else {
                                                                                check = false;
                                                                            }
                                                                        }
                                                                        if (check == true) {
                                                                            // //console.log("flag problem=====>");
                                                                            if (index == -1) {
                                                                                var json = {
                                                                                    problemReportId: 0,
                                                                                    program: {
                                                                                        id: programList[pp].programId,
                                                                                        label: programList[pp].label,
                                                                                        code: programList[pp].programCode
                                                                                    },
                                                                                    versionId: versionID,
                                                                                    realmProblem: problemList[prob],

                                                                                    dt: moment(Date.now()).format("YYYY-MM-DD"),
                                                                                    region: {
                                                                                        id: regionList[r].regionId,
                                                                                        label: regionList[r].label
                                                                                    },
                                                                                    planningUnit: {
                                                                                        id: planningUnitList[p].planningUnit.id,
                                                                                        label: planningUnitList[p].planningUnit.label,

                                                                                    },

                                                                                    shipmentId: '',
                                                                                    data5: '',
                                                                                    planningUnitActive: true,
                                                                                    newAdded: false,
                                                                                    problemActionIndex: problemActionIndex,
                                                                                    problemCategory: {
                                                                                        id: 3,
                                                                                        label: { label_en: 'Supply Planning' }
                                                                                    },
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: { label_en: 'Open' }
                                                                                    },
                                                                                    problemType: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            label_en: 'Automatic'
                                                                                        }
                                                                                    },
                                                                                    reviewed: false,
                                                                                    reviewNotes: '',
                                                                                    reviewedDate: '',
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                    lastModifiedBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                    problemTransList: [
                                                                                        {
                                                                                            problemReportTransId: '',
                                                                                            problemStatus: {
                                                                                                id: 1,
                                                                                                label: {
                                                                                                    active: true,
                                                                                                    labelId: 461,
                                                                                                    label_en: "Open",
                                                                                                    label_sp: null,
                                                                                                    label_fr: null,
                                                                                                    label_pr: null
                                                                                                }
                                                                                            },
                                                                                            notes: "",
                                                                                            reviewed: false,
                                                                                            createdBy: {
                                                                                                userId: userId,
                                                                                                username: username
                                                                                            },
                                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                        }
                                                                                    ]
                                                                                }
                                                                                problemActionList.push(json);
                                                                                problemActionIndex++;
                                                                            } else {
                                                                                // auto open problem logic for index
                                                                                if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                                    openProblem(index, username, userId, problemActionList);
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            //console.log("dont flag problem=====>");
                                                                            if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                // //console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                                incomplianceProblem(index, username, userId, problemActionList);
                                                                            }
                                                                        }
                                                                        // ================================

                                                                    } else {

                                                                    }
                                                                    // var a = [10, 10, 10, 50, 50, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 100, 100, 100];
                                                                    // var check = false;
                                                                    // //console.log("length=====", a.length);
                                                                    // for (var i = 0; i < a.length - 3; i++) {
                                                                    //     //console.log("---------------");
                                                                    //     //console.log(a[i]);
                                                                    //     var one = a[i];
                                                                    //     //console.log(a[i + 1]);
                                                                    //     var two = a[i + 1];
                                                                    //     //console.log(a[i + 2]);
                                                                    //     var three = a[i + 2];
                                                                    //     //console.log(a[i + 3]);
                                                                    //     var four = a[i + 3];
                                                                    //     //console.log("---------------");
                                                                    //     if ((one == two) && (two == three) && (three == four) && (four == one)) {
                                                                    //         check = true;
                                                                    //         break;
                                                                    //     }
                                                                    // }

                                                                }// //console.log(check);
                                                            }
                                                        }
                                                        // Dynamic forecasting for  tracer category  tc for 23, MALARIA*****************
                                                        if (problemList[prob].problem.problemId == 14) {
                                                            for (var r = 0; r < regionList.length; r++) {
                                                                // //console.log("planning unit====>********", planningUnitId);
                                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                                // //console.log("planningUnitObj====>", planningUnitObj);
                                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                                var tracerCategories = problemList[prob].data3;
                                                                var tracerArray = [];
                                                                if (tracerCategories != null && tracerCategories != "") {
                                                                    var tracerSplit = tracerCategories.split(',');
                                                                    for (var t = 0; t < tracerSplit.length; t++) {
                                                                        tracerArray.push(tracerSplit[t]);
                                                                    }
                                                                }
                                                                if (tracerArray.includes(planningUnitObj.forecastingUnit.tracerCategory.id)) {
                                                                    // if (planningUnitObj.forecastingUnit.tracerCategory.id == 12) {
                                                                    var consumptionList = programList[pp].consumptionList;
                                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    // //console.log("startDate===>", myStartDate, "stopDate====>", myEndDate);
                                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate && c.active == true);
                                                                    var index = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 14
                                                                        // && c.versionId == versionID
                                                                    );

                                                                    // index1 logic----------------
                                                                    var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 14 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                    problemActionListForIndex1.map(probObj => {
                                                                        // if (problemActionList[prob] != undefined) {
                                                                        var consumptionList1 = programList[pp].consumptionList;
                                                                        consumptionList1 = consumptionList1.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                        var myStartDate1 = moment(probObj.dt).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                        var myEndDate1 = moment(probObj.dt).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                        consumptionList1 = consumptionList1.filter(c => c.consumptionDate >= myStartDate1 && c.consumptionDate <= myEndDate1 && c.active == true);
                                                                        var index1 = problemActionList.findIndex(
                                                                            c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                && c.program.id == programList[pp].programId
                                                                                && c.realmProblem.problem.problemId == 14
                                                                            // && c.versionId == versionID
                                                                        );

                                                                        if (consumptionList1.length > problemList[prob].data2) {
                                                                            var conQtyArray1 = [];
                                                                            for (var i = 0; i < consumptionList1.length; i++) {
                                                                                conQtyArray1.push(consumptionList1[i].consumptionQty);
                                                                            }
                                                                            // //console.log("consumptionArray====>", conQtyArray);
                                                                            // ======================
                                                                            var a1 = conQtyArray1;
                                                                            var check1 = false;
                                                                            var currArray1 = [];
                                                                            var spanLength1 = problemList[prob].data2 - 1;
                                                                            for (var i = 0; i < a1.length - spanLength1; i++) {
                                                                                var currArray1 = [];
                                                                                for (var j = 0; j < problemList[prob].data2; j++) {
                                                                                    currArray1.push(a1[i + j]);
                                                                                }
                                                                                const allEqual1 = arr1 => arr1.every(v => v === arr1[0]);
                                                                                if (allEqual1(currArray1)) {
                                                                                    check1 = true;
                                                                                    break;
                                                                                } else {
                                                                                    check1 = false;
                                                                                }
                                                                            }

                                                                            if (check1 != true && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                                incomplianceProblem(index1, username, userId, problemActionList);
                                                                            } else {
                                                                                // auto open logic for index1
                                                                                if (check1 == true && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                                    openProblem(index1, username, userId, problemActionList);
                                                                                }
                                                                            }
                                                                        }
                                                                        // }
                                                                    });
                                                                    if (consumptionList.length > problemList[prob].data2) {
                                                                        var conQtyArray = [];
                                                                        for (var i = 0; i < consumptionList.length; i++) {
                                                                            conQtyArray.push(consumptionList[i].consumptionQty);
                                                                        }
                                                                        // //console.log("consumptionArray====>", conQtyArray);
                                                                        // ======================
                                                                        var a = conQtyArray;
                                                                        var check = false;
                                                                        var currArray = [];
                                                                        var spanLength = problemList[prob].data2 - 1;
                                                                        for (var i = 0; i < a.length - spanLength; i++) {
                                                                            var currArray = [];
                                                                            for (var j = 0; j < problemList[prob].data2; j++) {
                                                                                currArray.push(a[i + j]);
                                                                            }
                                                                            const allEqual = arr => arr.every(v => v === arr[0]);
                                                                            if (allEqual(currArray)) {
                                                                                check = true;
                                                                                break;
                                                                            } else {
                                                                                check = false;
                                                                            }
                                                                        }
                                                                        if (check == true) {
                                                                            // //console.log("flag problem=====>");
                                                                            if (index == -1) {
                                                                                var json = {
                                                                                    problemReportId: 0,
                                                                                    program: {
                                                                                        id: programList[pp].programId,
                                                                                        label: programList[pp].label,
                                                                                        code: programList[pp].programCode
                                                                                    },
                                                                                    versionId: versionID,
                                                                                    realmProblem: problemList[prob],

                                                                                    dt: moment(Date.now()).format("YYYY-MM-DD"),
                                                                                    region: {
                                                                                        id: regionList[r].regionId,
                                                                                        label: regionList[r].label
                                                                                    },
                                                                                    planningUnit: {
                                                                                        id: planningUnitList[p].planningUnit.id,
                                                                                        label: planningUnitList[p].planningUnit.label,

                                                                                    },
                                                                                    shipmentId: '',
                                                                                    data5: '',
                                                                                    planningUnitActive: true,
                                                                                    newAdded: false,
                                                                                    problemActionIndex: problemActionIndex,
                                                                                    problemCategory: {
                                                                                        id: 3,
                                                                                        label: { label_en: 'Supply Planning' }
                                                                                    },
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: { label_en: 'Open' }
                                                                                    },
                                                                                    problemType: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            label_en: 'Automatic'
                                                                                        }
                                                                                    },
                                                                                    reviewed: false,
                                                                                    reviewNotes: '',
                                                                                    reviewedDate: '',
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                    lastModifiedBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                    problemTransList: [
                                                                                        {
                                                                                            problemReportTransId: '',
                                                                                            problemStatus: {
                                                                                                id: 1,
                                                                                                label: {
                                                                                                    active: true,
                                                                                                    labelId: 461,
                                                                                                    label_en: "Open",
                                                                                                    label_sp: null,
                                                                                                    label_fr: null,
                                                                                                    label_pr: null
                                                                                                }
                                                                                            },
                                                                                            notes: "",
                                                                                            reviewed: false,
                                                                                            createdBy: {
                                                                                                userId: userId,
                                                                                                username: username
                                                                                            },
                                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                        }
                                                                                    ]
                                                                                }
                                                                                problemActionList.push(json);
                                                                                problemActionIndex++;
                                                                            } else {
                                                                                // auto open logic for index
                                                                                if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                                    openProblem(index, username, userId, problemActionList);
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            // //console.log("dont flag problem=====>");
                                                                            if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                // //console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                                incomplianceProblem(index, username, userId, problemActionList);

                                                                            }
                                                                        }
                                                                        // ================================

                                                                    } else {

                                                                    }

                                                                }
                                                            }
                                                        }

                                                        // Dynamic forecasting for  tracer category  tc for 26, VMMC*****************
                                                        if (problemList[prob].problem.problemId == 15) {
                                                            for (var r = 0; r < regionList.length; r++) {
                                                                // //console.log("planning unit====>********", planningUnitId);
                                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                                // //console.log("planningUnitObj====>", planningUnitObj);
                                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                                var tracerCategories = problemList[prob].data3;
                                                                var tracerArray = [];
                                                                if (tracerCategories != null && tracerCategories != "") {
                                                                    var tracerSplit = tracerCategories.split(',');
                                                                    for (var t = 0; t < tracerSplit.length; t++) {
                                                                        tracerArray.push(tracerSplit[t]);
                                                                    }

                                                                }
                                                                if (tracerArray.includes(planningUnitObj.forecastingUnit.tracerCategory.id)) {
                                                                    // if (planningUnitObj.forecastingUnit.tracerCategory.id == 25) {
                                                                    var consumptionList = programList[pp].consumptionList;
                                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                    // //console.log("consumptionList===>", consumptionList);
                                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    // //console.log("startDate===>", myStartDate, "stopDate====>", myEndDate);
                                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate && c.active == true);
                                                                    var index = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 15
                                                                        // && c.versionId == versionID
                                                                    );
                                                                    // index1 logic----------------
                                                                    var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 15 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                    problemActionListForIndex1.map(probObj => {
                                                                        // if (problemActionList[prob] != undefined) {
                                                                        var consumptionList1 = programList[pp].consumptionList;
                                                                        consumptionList1 = consumptionList1.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                        var myStartDate1 = moment(problemActionList[prob].dt).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                                        var myEndDate1 = moment(problemActionList[prob].dt).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                                        consumptionList1 = consumptionList1.filter(c => c.consumptionDate >= myStartDate1 && c.consumptionDate <= myEndDate1 && c.active == true);
                                                                        var index1 = problemActionList.findIndex(
                                                                            c => moment(c.dt).format("YYYY-MM") == moment(problemActionList[prob].dt).format("YYYY-MM")
                                                                                && c.region.id == regionList[r].regionId
                                                                                && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                                && c.program.id == programList[pp].programId
                                                                                && c.realmProblem.problem.problemId == 15
                                                                            // && c.versionId == versionID
                                                                        );

                                                                        if (consumptionList1.length > problemList[prob].data2) {
                                                                            var conQtyArray1 = [];
                                                                            for (var i = 0; i < consumptionList1.length; i++) {
                                                                                conQtyArray1.push(consumptionList1[i].consumptionQty);
                                                                            }
                                                                            // //console.log("consumptionArray====>", conQtyArray);
                                                                            // ======================
                                                                            var a1 = conQtyArray1;
                                                                            var check1 = false;
                                                                            var currArray1 = [];
                                                                            var spanLength1 = problemList[prob].data2 - 1;
                                                                            for (var i = 0; i < a1.length - spanLength1; i++) {
                                                                                var currArray1 = [];
                                                                                for (var j = 0; j < problemList[prob].data2; j++) {
                                                                                    currArray1.push(a1[i + j]);
                                                                                }
                                                                                const allEqual1 = arr1 => arr1.every(v => v === arr1[0]);
                                                                                if (allEqual1(currArray1)) {
                                                                                    check1 = true;
                                                                                    break;
                                                                                } else {
                                                                                    check1 = false;
                                                                                }
                                                                            }

                                                                            if (check1 != true && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                                incomplianceProblem(index1, username, userId, problemActionList);
                                                                            } else {
                                                                                // auto open logic for index1
                                                                                if (check1 == true && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                                    openProblem(index1, username, userId, problemActionList);
                                                                                }
                                                                            }
                                                                        }
                                                                        // }
                                                                    });
                                                                    // index1 logic----------------
                                                                    if (consumptionList.length > problemList[prob].data2) {
                                                                        var conQtyArray = [];
                                                                        for (var i = 0; i < consumptionList.length; i++) {
                                                                            conQtyArray.push(consumptionList[i].consumptionQty);
                                                                        }
                                                                        // //console.log("consumptionArray====>", conQtyArray);
                                                                        // ======================
                                                                        var a = conQtyArray;
                                                                        var check = false;
                                                                        var currArray = [];
                                                                        var spanLength = problemList[prob].data2 - 1;
                                                                        // //console.log("length=====", a.length);
                                                                        // //console.log("spanLength=====", spanLength);
                                                                        for (var i = 0; i < a.length - spanLength; i++) {
                                                                            var currArray = [];
                                                                            for (var j = 0; j < problemList[prob].data2; j++) {
                                                                                currArray.push(a[i + j]);
                                                                            }
                                                                            const allEqual = arr => arr.every(v => v === arr[0]);
                                                                            if (allEqual(currArray)) {
                                                                                check = true;
                                                                                break;
                                                                            } else {
                                                                                check = false;
                                                                            }
                                                                        }
                                                                        if (check == true) {
                                                                            // //console.log("flag problem=====>");
                                                                            if (index == -1) {
                                                                                var json = {
                                                                                    problemReportId: 0,
                                                                                    program: {
                                                                                        id: programList[pp].programId,
                                                                                        label: programList[pp].label,
                                                                                        code: programList[pp].programCode
                                                                                    },
                                                                                    versionId: versionID,
                                                                                    realmProblem: problemList[prob],

                                                                                    dt: moment(Date.now()).format("YYYY-MM-DD"),
                                                                                    region: {
                                                                                        id: regionList[r].regionId,
                                                                                        label: regionList[r].label
                                                                                    },
                                                                                    planningUnit: {
                                                                                        id: planningUnitList[p].planningUnit.id,
                                                                                        label: planningUnitList[p].planningUnit.label,

                                                                                    },
                                                                                    shipmentId: '',
                                                                                    data5: '',
                                                                                    planningUnitActive: true,
                                                                                    newAdded: false,
                                                                                    problemActionIndex: problemActionIndex,
                                                                                    problemCategory: {
                                                                                        id: 3,
                                                                                        label: { label_en: 'Supply Planning' }
                                                                                    },
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: { label_en: 'Open' }
                                                                                    },
                                                                                    problemType: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            label_en: 'Automatic'
                                                                                        }
                                                                                    },
                                                                                    reviewed: false,
                                                                                    reviewNotes: '',
                                                                                    reviewedDate: '',
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                    lastModifiedBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                                    problemTransList: [
                                                                                        {
                                                                                            problemReportTransId: '',
                                                                                            problemStatus: {
                                                                                                id: 1,
                                                                                                label: {
                                                                                                    active: true,
                                                                                                    labelId: 461,
                                                                                                    label_en: "Open",
                                                                                                    label_sp: null,
                                                                                                    label_fr: null,
                                                                                                    label_pr: null
                                                                                                }
                                                                                            },
                                                                                            notes: "",
                                                                                            reviewed: false,
                                                                                            createdBy: {
                                                                                                userId: userId,
                                                                                                username: username
                                                                                            },
                                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                        }
                                                                                    ]
                                                                                }
                                                                                problemActionList.push(json);
                                                                                problemActionIndex++;
                                                                            } else {
                                                                                // auto open logic for index
                                                                                if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                                    openProblem(index, username, userId, problemActionList);
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            // //console.log("dont flag problem=====>");
                                                                            if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                                // //console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                                incomplianceProblem(index, username, userId, problemActionList);
                                                                            }
                                                                        }
                                                                        // ================================

                                                                    } else {

                                                                    }

                                                                }
                                                            }
                                                        }

                                                        // ***********************===================problem conditions  end here ====================
                                                        // //console.log("problemList[prob]problemList[prob]problemList[prob]=====>", problemList[prob]);
                                                        if (problemList[prob].problem.problemId == 11) {
                                                            // problem for mos is less then min having shipments within lead time 0-6 months ============
                                                            var mosArray = [];
                                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                            // problemList[prob].data1=0
                                                            // problemList[prob].data2=6
                                                            for (var mosCounter = problemList[prob].data1; mosCounter <= problemList[prob].data2; mosCounter++) {
                                                                var m = moment(Date.now()).add(mosCounter, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
                                                                var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");
                                                                var programId = programList[pp].programId;
                                                                // var regionId = -1;
                                                                var planningUnitId = planningUnitList[p].planningUnit.id;
                                                                var supplyPlanJson = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate).format("YYYY-MM-DD"));

                                                                var mos = "";
                                                                var maxForMonths = "";
                                                                var minForMonths = "";
                                                                var closingBalance = "";
                                                                var amcCalcualted = "";

                                                                if (supplyPlanJson.length > 0) {
                                                                    mos = supplyPlanJson[0].mos;
                                                                    maxForMonths = maxStockMoSQty;
                                                                    minForMonths = minStockMoSQty;
                                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                                }

                                                                mosArray.push(
                                                                    {
                                                                        mos: mos != "" ? parseFloat(mos).toFixed(1) : "",
                                                                        maxForMonths: maxForMonths,
                                                                        minForMonths: minForMonths,
                                                                        month: m,
                                                                        closingBalance: closingBalance,
                                                                        amcCalcualted: amcCalcualted
                                                                    });

                                                            }
                                                            // //console.log("planningUnitId====>", planningUnitId);
                                                            //console.log("mosArray============>$@##", mosArray);
                                                            // for loop on array mosArray
                                                            var monthWithMosLessThenMin = '';
                                                            for (var element = 0; element < mosArray.length; element++) {
                                                                // //console.log("mos element===>", mosArray[element]);
                                                                var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM') < moment(Date.now()).format('YYYY-MM') ? moment(Date.now()).startOf('month').format('YYYY-MM-DD') : moment(mosArray[element].month).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                var getEndDate = moment(mosArray[element].month).add(4, 'months').format('YYYY-MM-DD');
                                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate).format('YYYY-MM'));

                                                                if (mosArray[element].mos < mosArray[element].minForMonths && filteredShipmentListForMonths.length > 0) {
                                                                    monthWithMosLessThenMin = mosArray[element].month;
                                                                    break;
                                                                } else {
                                                                }
                                                            }
                                                            //console.log("monthWithMosLessThenMin======>", monthWithMosLessThenMin);
                                                            var index = problemActionList.findIndex(
                                                                c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                    // && c.region.id == regionList[r].regionId
                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                    && c.program.id == programList[pp].programId
                                                                    && c.realmProblem.problem.problemId == 11
                                                                // && c.versionId == versionID
                                                            );

                                                            // index1 logic-------------------------------------------

                                                            var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 11 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                            problemActionListForIndex1.map(probObj => {
                                                                // if (problemActionList[prob] != undefined) {
                                                                var mosArray1 = [];
                                                                // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                                // problemList[prob].data1=0
                                                                // problemList[prob].data2=6
                                                                for (var mosCounter1 = problemList[prob].data1; mosCounter1 <= problemList[prob].data2; mosCounter1++) {
                                                                    var m1 = moment(probObj.dt).add(mosCounter1, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                    var mStartDate1 = moment(m1).startOf('month').format("YYYY-MM-DD");
                                                                    var mEndDate1 = moment(m1).endOf('month').format("YYYY-MM-DD");
                                                                    var programId1 = programList[pp].programId;
                                                                    // var regionId = -1;
                                                                    var planningUnitId1 = planningUnitList[p].planningUnit.id;
                                                                    var supplyPlanJson1 = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId1 && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate1).format("YYYY-MM-DD"));

                                                                    var mos1 = "";
                                                                    var maxForMonths1 = "";
                                                                    var minForMonths1 = "";
                                                                    var closingBalance1 = "";
                                                                    var amcCalcualted1 = "";


                                                                    if (supplyPlanJson1.length > 0) {
                                                                        mos1 = supplyPlanJson1[0].mos;
                                                                        maxForMonths1 = maxStockMoSQty;
                                                                        minForMonths1 = minStockMoSQty;
                                                                        closingBalance1 = supplyPlanJson1[0].closingBalance;
                                                                        amcCalcualted1 = supplyPlanJson1[0].amc;
                                                                    }

                                                                    mosArray1.push(
                                                                        {
                                                                            mos1: parseFloat(mos1).toFixed(1),
                                                                            maxForMonths1: maxForMonths1,
                                                                            minForMonths1: minForMonths1,
                                                                            month1: m1,
                                                                            closingBalance1: closingBalance1,
                                                                            amcCalcualted1: amcCalcualted1
                                                                        });

                                                                }
                                                                // console.log("planningUnitId====>", planningUnitId);
                                                                //console.log("mosArray============>$@##", mosArray1);
                                                                // for loop on array mosArray
                                                                var monthWithMosLessThenMin1 = '';
                                                                for (var element = 0; element < mosArray1.length; element++) {
                                                                    // //console.log("mos element===>", mosArray[element]);
                                                                    var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM') < moment(probObj.dt).format('YYYY-MM') ? moment(probObj.dt).startOf('month').format('YYYY-MM-DD') : moment(mosArray1[element].month1).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                    var getEndDate1 = moment(mosArray1[element].month1).add(4, 'months').format('YYYY-MM-DD');
                                                                    var filteredShipmentListForMonths1 = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate1).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate1).format('YYYY-MM'));

                                                                    if (mosArray1[element].mos1 < mosArray1[element].minForMonths1 && filteredShipmentListForMonths1.length > 0) {
                                                                        monthWithMosLessThenMin1 = mosArray1[element].month1;
                                                                        break;
                                                                    } else {
                                                                    }
                                                                }
                                                                //console.log("monthWithMosLessThenMin======>", monthWithMosLessThenMin1);
                                                                var index1 = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                        // && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 11
                                                                    // && c.versionId == versionID
                                                                );


                                                                if (monthWithMosLessThenMin1 == '' && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                    incomplianceProblem(index1, username, userId, problemActionList);
                                                                } else {
                                                                    // auto open logic for index1
                                                                    if (monthWithMosLessThenMin1 != '' && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                        openProblem(index1, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // }
                                                            });

                                                            // index1 logic---------------------------------------------------------

                                                            if (monthWithMosLessThenMin != '') {
                                                                // if (filteredShipmentListForMonths.length > 0) {
                                                                if (index == -1) {
                                                                    var json = {
                                                                        problemReportId: 0,
                                                                        program: {
                                                                            id: programList[pp].programId,
                                                                            label: programList[pp].label,
                                                                            code: programList[pp].programCode
                                                                        },
                                                                        versionId: versionID,
                                                                        realmProblem: problemList[prob],

                                                                        dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                        region: {
                                                                            id: 0
                                                                        },
                                                                        planningUnit: {
                                                                            id: planningUnitList[p].planningUnit.id,
                                                                            label: planningUnitList[p].planningUnit.label,

                                                                        },
                                                                        shipmentId: '',
                                                                        data5: '',
                                                                        planningUnitActive: true,
                                                                        newAdded: false,
                                                                        problemActionIndex: problemActionIndex,

                                                                        problemCategory: {
                                                                            id: 3,
                                                                            label: { label_en: 'Supply Planning' }
                                                                        },
                                                                        problemStatus: {
                                                                            id: 1,
                                                                            label: { label_en: 'Open' }
                                                                        },
                                                                        problemType: {
                                                                            id: 1,
                                                                            label: {
                                                                                label_en: 'Automatic'
                                                                            }
                                                                        },
                                                                        reviewed: false,
                                                                        reviewNotes: '',
                                                                        reviewedDate: '',
                                                                        createdBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        lastModifiedBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        problemTransList: [
                                                                            {
                                                                                problemReportTransId: '',
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        active: true,
                                                                                        labelId: 461,
                                                                                        label_en: "Open",
                                                                                        label_sp: null,
                                                                                        label_fr: null,
                                                                                        label_pr: null
                                                                                    }
                                                                                },
                                                                                notes: "",
                                                                                reviewed: false,
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                            }
                                                                        ]
                                                                    }
                                                                    problemActionList.push(json);
                                                                    problemActionIndex++;
                                                                } else {
                                                                    //auto open for index=======>
                                                                    if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                        openProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // } else {
                                                                //console.log("dont falg problem mos is not less then min ");
                                                                // }
                                                            } else {
                                                                //console.log("no months with MOS less then min ===#########");
                                                                //console.log("index*************>", index);
                                                                //console.log("versionId************", versionID);
                                                                // if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].versionId == versionID) {
                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId) {
                                                                    incomplianceProblem(index, username, userId, problemActionList);
                                                                }
                                                            }
                                                        }

                                                        if (problemList[prob].problem.problemId == 16) {
                                                            // Inventory is above max with shipment(s) in the next 1-6 months. Critical = High============
                                                            //console.log("in problem id======>16", problemList[prob].data1, "====", problemList[prob].data2);
                                                            var mosArray = [];
                                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                            // problemList[prob].data1=0
                                                            // problemList[prob].data2=6
                                                            for (var mosCounter = problemList[prob].data1; mosCounter <= problemList[prob].data2; mosCounter++) {
                                                                var m = moment(Date.now()).add(mosCounter, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
                                                                var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");

                                                                var programId = programList[pp].programId;
                                                                // var regionId = -1;
                                                                var planningUnitId = planningUnitList[p].planningUnit.id;
                                                                var supplyPlanJson = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate).format("YYYY-MM-DD"));

                                                                var mos = "";
                                                                var maxForMonths = "";
                                                                var minForMonths = "";
                                                                var closingBalance = "";
                                                                var amcCalcualted = "";

                                                                if (supplyPlanJson.length > 0) {
                                                                    mos = supplyPlanJson[0].mos;
                                                                    maxForMonths = maxStockMoSQty;
                                                                    minForMonths = minStockMoSQty;
                                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                                }

                                                                mosArray.push(
                                                                    {
                                                                        mos: mos != "" ? parseFloat(mos).toFixed(1) : "",
                                                                        maxForMonths: maxForMonths,
                                                                        minForMonths: minForMonths,
                                                                        month: m,
                                                                        closingBalance: closingBalance,
                                                                        amcCalcualted: amcCalcualted
                                                                    });

                                                            }
                                                            // //console.log("planningUnitId====>", planningUnitId);
                                                            // //console.log("mosArray============>$@##", mosArray);
                                                            // for loop on array mosArray
                                                            // var monthWithMosLessThenMin = '';
                                                            var monthWithMosGreaterThenMax = '';
                                                            for (var element = 0; element < mosArray.length; element++) {

                                                                var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM') < moment(Date.now()).format('YYYY-MM') ? moment(Date.now()).startOf('month').format('YYYY-MM-DD') : moment(mosArray[element].month).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                // var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosGreaterThenMax).subtract(3, 'months').format('YYYY-MM-DD');
                                                                var getEndDate = moment(mosArray[element].month).add(4, 'months').format('YYYY-MM-DD');
                                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate).format('YYYY-MM'));

                                                                if (mosArray[element].mos > mosArray[element].maxForMonths && filteredShipmentListForMonths.length > 0) {
                                                                    monthWithMosGreaterThenMax = mosArray[element].month;
                                                                    break;
                                                                } else {
                                                                }
                                                            }
                                                            var index = problemActionList.findIndex(
                                                                c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                    // && c.region.id == regionList[r].regionId
                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                    && c.program.id == programList[pp].programId
                                                                    && c.realmProblem.problem.problemId == 16
                                                                // && c.versionId == versionID
                                                            );


                                                            // index1 logic----------------
                                                            var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 16 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                            problemActionListForIndex1.map(probObj => {
                                                                // if (problemActionList[prob] != undefined) {
                                                                var mosArray1 = [];
                                                                // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                                // problemList[prob].data1=0
                                                                // problemList[prob].data2=6
                                                                for (var mosCounter1 = problemList[prob].data1; mosCounter1 <= problemList[prob].data2; mosCounter1++) {
                                                                    var m1 = moment(Date.now()).add(mosCounter1, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                    var mStartDate1 = moment(m1).startOf('month').format("YYYY-MM-DD");
                                                                    var mEndDate1 = moment(m1).endOf('month').format("YYYY-MM-DD");
                                                                    var programId1 = programList[pp].programId;
                                                                    // var regionId = -1;
                                                                    var planningUnitId1 = planningUnitList[p].planningUnit.id;
                                                                    var supplyPlanJson1 = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId1 && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate1).format("YYYY-MM-DD"));

                                                                    var mos1 = "";
                                                                    var maxForMonths1 = "";
                                                                    var minForMonths1 = "";
                                                                    var closingBalance1 = "";
                                                                    var amcCalcualted1 = "";

                                                                    if (supplyPlanJson1.length > 0) {
                                                                        mos1 = supplyPlanJson1[0].mos;
                                                                        maxForMonths1 = maxStockMoSQty;
                                                                        minForMonths1 = minStockMoSQty;
                                                                        closingBalance1 = supplyPlanJson1[0].closingBalance;
                                                                        amcCalcualted1 = supplyPlanJson1[0].amc;
                                                                    }

                                                                    mosArray1.push(
                                                                        {
                                                                            mos1: parseFloat(mos1).toFixed(1),
                                                                            maxForMonths1: maxForMonths1,
                                                                            minForMonths1: minForMonths1,
                                                                            month1: m1,
                                                                            closingBalance1: closingBalance1,
                                                                            amcCalcualted1: amcCalcualted1
                                                                        });

                                                                }
                                                                // //console.log("planningUnitId====>", planningUnitId);
                                                                // //console.log("mosArray============>$@##", mosArray);
                                                                // for loop on array mosArray
                                                                // var monthWithMosLessThenMin = '';
                                                                var monthWithMosGreaterThenMax1 = '';
                                                                for (var element = 0; element < mosArray1.length; element++) {
                                                                    var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM') < moment(probObj.dt).format('YYYY-MM') ? moment(probObj.dt).startOf('month').format('YYYY-MM-DD') : moment(mosArray1[element].month1).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                    // var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosGreaterThenMax1).subtract(3, 'months').format('YYYY-MM-DD');
                                                                    var getEndDate1 = moment(mosArray1[element].month1).add(4, 'months').format('YYYY-MM-DD');
                                                                    var filteredShipmentListForMonths1 = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate1).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate1).format('YYYY-MM'));

                                                                    if (mosArray1[element].mos1 > mosArray1[element].maxForMonths1 && filteredShipmentListForMonths1.length > 0) {
                                                                        monthWithMosGreaterThenMax1 = mosArray1[element].month1;
                                                                        break;
                                                                    } else {
                                                                    }
                                                                }
                                                                var index1 = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                        // && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 16
                                                                    // && c.versionId == versionID
                                                                );

                                                                if (monthWithMosGreaterThenMax1 == '' && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                    incomplianceProblem(index1, username, userId, problemActionList);
                                                                } else {
                                                                    // auto open logic for index1
                                                                    if (monthWithMosGreaterThenMax1 != '' && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                        openProblem(index1, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // }
                                                            });
                                                            // index1 logic----------------


                                                            if (monthWithMosGreaterThenMax != '') {
                                                                //console.log("min mos month from array ======>", monthWithMosGreaterThenMax);
                                                                //console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);
                                                                //if (filteredShipmentListForMonths.length > 0) {
                                                                //console.log("flag a problem mos is greater then max and have shipment withing lead times");
                                                                if (index == -1) {
                                                                    var json = {
                                                                        problemReportId: 0,
                                                                        program: {
                                                                            id: programList[pp].programId,
                                                                            label: programList[pp].label,
                                                                            code: programList[pp].programCode
                                                                        },
                                                                        versionId: versionID,
                                                                        realmProblem: problemList[prob],

                                                                        dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                        region: {
                                                                            id: 0
                                                                        },
                                                                        planningUnit: {
                                                                            id: planningUnitList[p].planningUnit.id,
                                                                            label: planningUnitList[p].planningUnit.label,

                                                                        },
                                                                        shipmentId: '',
                                                                        data5: '',
                                                                        planningUnitActive: true,
                                                                        newAdded: false,
                                                                        problemActionIndex: problemActionIndex,
                                                                        problemCategory: {
                                                                            id: 3,
                                                                            label: { label_en: 'Supply Planning' }
                                                                        },
                                                                        problemStatus: {
                                                                            id: 1,
                                                                            label: { label_en: 'Open' }
                                                                        },
                                                                        problemType: {
                                                                            id: 1,
                                                                            label: {
                                                                                label_en: 'Automatic'
                                                                            }
                                                                        },
                                                                        reviewed: false,
                                                                        reviewNotes: '',
                                                                        reviewedDate: '',
                                                                        createdBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        lastModifiedBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        problemTransList: [
                                                                            {
                                                                                problemReportTransId: '',
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        active: true,
                                                                                        labelId: 461,
                                                                                        label_en: "Open",
                                                                                        label_sp: null,
                                                                                        label_fr: null,
                                                                                        label_pr: null
                                                                                    }
                                                                                },
                                                                                notes: "",
                                                                                reviewed: false,
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                            }
                                                                        ]
                                                                    }
                                                                    problemActionList.push(json);
                                                                    problemActionIndex++;
                                                                } else {
                                                                    // auto open logic for index=======>
                                                                    if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                        openProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // } else {
                                                                //     //console.log("dont falg problem mos is not greater then max ####### ");
                                                                // }
                                                            } else {
                                                                // //console.log("no months with MOS greater then max ===#########");
                                                                // if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].versionId == versionID) {
                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId) {
                                                                    incomplianceProblem(index, username, userId, problemActionList);
                                                                }
                                                            }
                                                        }

                                                        if (problemList[prob].problem.problemId == 17) {
                                                            // problem for mos less then min and no shipment in coming  6 months 
                                                            //console.log("in problem id======>17", problemList[prob].data1, "====", problemList[prob].data2);
                                                            var mosArray = [];
                                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                            // problemList[prob].data1=0
                                                            // problemList[prob].data2=6
                                                            for (var mosCounter = problemList[prob].data1; mosCounter <= problemList[prob].data2; mosCounter++) {
                                                                // //console.log("mosCounter====>", mosCounter);
                                                                var m = moment(Date.now()).add(mosCounter, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
                                                                var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");

                                                                // }
                                                                var programId = programList[pp].programId;
                                                                // var regionId = -1;
                                                                var planningUnitId = planningUnitList[p].planningUnit.id;
                                                                var supplyPlanJson = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate).format("YYYY-MM-DD"));

                                                                var mos = "";
                                                                var maxForMonths = "";
                                                                var minForMonths = "";
                                                                var closingBalance = "";
                                                                var amcCalcualted = "";


                                                                if (supplyPlanJson.length > 0) {
                                                                    mos = supplyPlanJson[0].mos;
                                                                    maxForMonths = maxStockMoSQty;
                                                                    minForMonths = minStockMoSQty;
                                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                                }
                                                                mosArray.push(
                                                                    {
                                                                        mos: mos != "" ? parseFloat(mos).toFixed(1) : "",
                                                                        maxForMonths: maxForMonths,
                                                                        minForMonths: minForMonths,
                                                                        month: m,
                                                                        closingBalance: closingBalance,
                                                                        amcCalcualted: amcCalcualted
                                                                    });

                                                            }
                                                            // console.log("+++planningUnitId====>", planningUnitId);
                                                            // console.log("######mosArray==========>", mosArray);
                                                            // for loop on array mosArray
                                                            var monthWithMosLessThenMin = '';
                                                            for (var element = 0; element < mosArray.length; element++) {
                                                                var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM') < moment(Date.now()).format('YYYY-MM') ? moment(Date.now()).startOf('month').format('YYYY-MM-DD') : moment(mosArray[element].month).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                // var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD');
                                                                var getEndDate = moment(mosArray[element].month).add(4, 'months').format('YYYY-MM-DD');
                                                                // console.log("######getStartDate",getStartDate);
                                                                // console.log("######getEndDate",getEndDate);
                                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate).format('YYYY-MM'));
                                                                // console.log("######filteredShipmentListForMonths",filteredShipmentListForMonths);
                                                                if (mosArray[element].mos < mosArray[element].minForMonths && filteredShipmentListForMonths.length == 0) {
                                                                    monthWithMosLessThenMin = mosArray[element].month;
                                                                    break;
                                                                } else {
                                                                }
                                                            }
                                                            // console.log("+++monthWithMosLessThenMin====>", monthWithMosLessThenMin);
                                                            var index = problemActionList.findIndex(
                                                                c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                    // && c.region.id == regionList[r].regionId
                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                    && c.program.id == programList[pp].programId
                                                                    && c.realmProblem.problem.problemId == 17
                                                                // && c.versionId == versionID
                                                            );

                                                            // index1 logic----------------
                                                            var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 17 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                            problemActionListForIndex1.map(probObj => {
                                                                // if (problemActionList[prob] != undefined) {

                                                                var mosArray1 = [];
                                                                // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                                // problemList[prob].data1=0
                                                                // problemList[prob].data2=6
                                                                for (var mosCounter1 = problemList[prob].data1; mosCounter1 <= problemList[prob].data2; mosCounter1++) {
                                                                    // //console.log("mosCounter====>", mosCounter);
                                                                    var m1 = moment(probObj.dt).add(mosCounter1, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                    var mStartDate1 = moment(m1).startOf('month').format("YYYY-MM-DD");
                                                                    var mEndDate1 = moment(m1).endOf('month').format("YYYY-MM-DD");

                                                                    // }
                                                                    var programId1 = programList[pp].programId;
                                                                    // var regionId = -1;
                                                                    var planningUnitId1 = planningUnitList[p].planningUnit.id;
                                                                    var supplyPlanJson1 = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId1 && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate1).format("YYYY-MM-DD"));

                                                                    var mos1 = "";
                                                                    var maxForMonths1 = "";
                                                                    var minForMonths1 = "";
                                                                    var closingBalance1 = "";
                                                                    var amcCalcualted1 = "";
                                                                    if (supplyPlanJson1.length > 0) {
                                                                        mos1 = supplyPlanJson1[0].mos;
                                                                        maxForMonths1 = maxStockMoSQty;
                                                                        minForMonths1 = minStockMoSQty;
                                                                        closingBalance1 = supplyPlanJson1[0].closingBalance;
                                                                        amcCalcualted1 = supplyPlanJson1[0].amc;
                                                                    }
                                                                    mosArray1.push(
                                                                        {
                                                                            mos1: parseFloat(mos1).toFixed(1),
                                                                            maxForMonths1: maxForMonths1,
                                                                            minForMonths1: minForMonths1,
                                                                            month1: m1,
                                                                            closingBalance1: closingBalance1,
                                                                            amcCalcualted1: amcCalcualted1
                                                                        });

                                                                }
                                                                // //console.log("planningUnitId====>", planningUnitId);
                                                                // //console.log("mosArray============>$@##", mosArray);
                                                                // for loop on array mosArray
                                                                var monthWithMosLessThenMin1 = '';
                                                                for (var element = 0; element < mosArray1.length; element++) {
                                                                    // //console.log("mos element===>", mosArray[element]);
                                                                    var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM') < moment(probObj.dt).format('YYYY-MM') ? moment(probObj.dt).startOf('month').format('YYYY-MM-DD') : moment(mosArray1[element].month1).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                    // var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin1).subtract(3, 'months').format('YYYY-MM-DD');
                                                                    var getEndDate1 = moment(mosArray1[element].month1).add(4, 'months').format('YYYY-MM-DD');
                                                                    var filteredShipmentListForMonths1 = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate1).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate1).format('YYYY-MM'));

                                                                    if (mosArray1[element].mos1 < mosArray1[element].minForMonths1 && filteredShipmentListForMonths1.length == 0) {
                                                                        monthWithMosLessThenMin1 = mosArray1[element].month1;
                                                                        break;
                                                                    } else {
                                                                    }
                                                                }
                                                                var index1 = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                        // && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 17
                                                                    // && c.versionId == versionID
                                                                );

                                                                if (monthWithMosLessThenMin1 == '' && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                    incomplianceProblem(index1, username, userId, problemActionList);
                                                                } else {
                                                                    // auto open logic for index1=======>
                                                                    if (monthWithMosLessThenMin1 != '' && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                        openProblem(index1, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // }

                                                            });
                                                            // index1 logic----------------

                                                            if (monthWithMosLessThenMin != '') {
                                                                // if (filteredShipmentListForMonths.length == 0) {
                                                                if (index == -1) {
                                                                    var json = {
                                                                        problemReportId: 0,
                                                                        program: {
                                                                            id: programList[pp].programId,
                                                                            label: programList[pp].label,
                                                                            code: programList[pp].programCode
                                                                        },
                                                                        versionId: versionID,
                                                                        realmProblem: problemList[prob],

                                                                        dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                        region: {
                                                                            id: 0,
                                                                            // label: regionList[r].label
                                                                        },
                                                                        planningUnit: {
                                                                            id: planningUnitList[p].planningUnit.id,
                                                                            label: planningUnitList[p].planningUnit.label,

                                                                        },
                                                                        shipmentId: '',
                                                                        data5: '',
                                                                        planningUnitActive: true,
                                                                        newAdded: false,
                                                                        problemActionIndex: problemActionIndex,
                                                                        problemCategory: {
                                                                            id: 3,
                                                                            label: { label_en: 'Supply Planning' }
                                                                        },
                                                                        problemStatus: {
                                                                            id: 1,
                                                                            label: { label_en: 'Open' }
                                                                        },
                                                                        problemType: {
                                                                            id: 1,
                                                                            label: {
                                                                                label_en: 'Automatic'
                                                                            }
                                                                        },
                                                                        reviewed: false,
                                                                        reviewNotes: '',
                                                                        reviewedDate: '',
                                                                        createdBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        lastModifiedBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        problemTransList: [
                                                                            {
                                                                                problemReportTransId: '',
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        active: true,
                                                                                        labelId: 461,
                                                                                        label_en: "Open",
                                                                                        label_sp: null,
                                                                                        label_fr: null,
                                                                                        label_pr: null
                                                                                    }
                                                                                },
                                                                                notes: "",
                                                                                reviewed: false,
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                            }
                                                                        ]
                                                                    }
                                                                    problemActionList.push(json);
                                                                    problemActionIndex++;
                                                                } else {
                                                                    // auto open logic for index
                                                                    if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                        openProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // } 
                                                                // else {
                                                                //     //console.log("dont falg problem mos is  less then min but have shipment in lead times ");
                                                                // }
                                                            } else {
                                                                console.log("+++no months with MOS less then min or have shipmnet coming withing lead time===#########");
                                                                // if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].versionId == versionID) {
                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId) {
                                                                    console.log("+++change status to incompliance");
                                                                    incomplianceProblem(index, username, userId, problemActionList);
                                                                }
                                                            }

                                                        }
                                                        if (problemList[prob].problem.problemId == 18) {
                                                            // problem for mos is less then min having shipments within lead time 7-18 months ============
                                                            // //console.log("in problem id======>18", problemList[prob].data1, "====", problemList[prob].data2);
                                                            var mosArray = [];
                                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                            // problemList[prob].data1=0
                                                            // problemList[prob].data2=6
                                                            for (var mosCounter18 = parseInt(problemList[prob].data1); mosCounter18 <= parseInt(problemList[prob].data2); mosCounter18++) {
                                                                // //console.log("mosCounter18====>", mosCounter18);
                                                                var m = moment(Date.now()).add(mosCounter18, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
                                                                var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");

                                                                // }
                                                                var programId = programList[pp].programId;
                                                                // var regionId = -1;
                                                                var planningUnitId = planningUnitList[p].planningUnit.id;
                                                                var supplyPlanJson = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate).format("YYYY-MM-DD"));
                                                                var mos = "";
                                                                var maxForMonths = "";
                                                                var minForMonths = "";
                                                                var closingBalance = "";
                                                                var amcCalcualted = "";


                                                                if (supplyPlanJson.length > 0) {
                                                                    mos = supplyPlanJson[0].mos;
                                                                    maxForMonths = maxStockMoSQty;
                                                                    minForMonths = minStockMoSQty;
                                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                                }

                                                                mosArray.push(
                                                                    {
                                                                        mos: mos != "" ? parseFloat(mos).toFixed(1) : "",
                                                                        maxForMonths: maxForMonths,
                                                                        minForMonths: minForMonths,
                                                                        month: m,
                                                                        closingBalance: closingBalance,
                                                                        amcCalcualted: amcCalcualted
                                                                    });

                                                            }
                                                            // //console.log("planningUnitId====>", planningUnitId);
                                                            // //console.log("mosArray============>$@##", mosArray);
                                                            // for loop on array mosArray
                                                            var monthWithMosLessThenMin = '';
                                                            for (var element = 0; element < mosArray.length; element++) {

                                                                var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM') < moment(Date.now()).format('YYYY-MM') ? moment(Date.now()).startOf('month').format('YYYY-MM-DD') : moment(mosArray[element].month).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                // var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD');
                                                                var getEndDate = moment(mosArray[element].month).add(4, 'months').format('YYYY-MM-DD');
                                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate).format('YYYY-MM'));

                                                                if (mosArray[element].mos < mosArray[element].minForMonths && filteredShipmentListForMonths.length > 0) {
                                                                    monthWithMosLessThenMin = mosArray[element].month;
                                                                    break;
                                                                } else {
                                                                }
                                                            }
                                                            var index = problemActionList.findIndex(
                                                                c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                    // && c.region.id == regionList[r].regionId
                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                    && c.program.id == programList[pp].programId
                                                                    && c.realmProblem.problem.problemId == 18
                                                                // && c.versionId == versionID
                                                            );


                                                            // index1 logic----------------
                                                            var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 18 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                            problemActionListForIndex1.map(probObj => {
                                                                // if (problemActionList[prob] != undefined) {
                                                                var mosArray1 = [];
                                                                // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                                // problemList[prob].data1=0
                                                                // problemList[prob].data2=6
                                                                for (var mosCounter181 = parseInt(problemList[prob].data1); mosCounter181 <= parseInt(problemList[prob].data2); mosCounter181++) {
                                                                    // //console.log("mosCounter18====>", mosCounter18);
                                                                    var m1 = moment(Date.now()).add(mosCounter181, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                    var mStartDate1 = moment(m1).startOf('month').format("YYYY-MM-DD");
                                                                    var mEndDate1 = moment(m1).endOf('month').format("YYYY-MM-DD");
                                                                    // }
                                                                    var programId1 = programList[pp].programId;
                                                                    // var regionId = -1;
                                                                    var planningUnitId1 = planningUnitList[p].planningUnit.id;
                                                                    var supplyPlanJson1 = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId1 && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate1).format("YYYY-MM-DD"));
                                                                    var mos1 = "";
                                                                    var maxForMonths1 = "";
                                                                    var minForMonths1 = "";
                                                                    var closingBalance1 = "";
                                                                    var amcCalcualted1 = "";
                                                                    if (supplyPlanJson1.length > 0) {
                                                                        mos1 = supplyPlanJson1[0].mos;
                                                                        maxForMonths1 = maxStockMoSQty;
                                                                        minForMonths1 = minStockMoSQty;
                                                                        closingBalance1 = supplyPlanJson1[0].closingBalance;
                                                                        amcCalcualted1 = supplyPlanJson1[0].amc;
                                                                    }

                                                                    mosArray1.push(
                                                                        {
                                                                            mos1: parseFloat(mos1).toFixed(1),
                                                                            maxForMonths1: maxForMonths1,
                                                                            minForMonths1: minForMonths1,
                                                                            month1: m1,
                                                                            closingBalance1: closingBalance1,
                                                                            amcCalcualted1: amcCalcualted1
                                                                        });

                                                                }
                                                                //console.log("planningUnitId====>", planningUnitId);
                                                                //console.log("mosArray============>$@##", mosArray);
                                                                // for loop on array mosArray
                                                                var monthWithMosLessThenMin1 = '';
                                                                for (var element = 0; element < mosArray1.length; element++) {
                                                                    //console.log("mos element===>", mosArray[element]);
                                                                    var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM') < moment(probObj.dt).format('YYYY-MM') ? moment(probObj.dt).startOf('month').format('YYYY-MM-DD') : moment(mosArray1[element].month1).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                    // var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin1).subtract(3, 'months').format('YYYY-MM-DD');
                                                                    var getEndDate1 = moment(mosArray1[element].month1).add(4, 'months').format('YYYY-MM-DD');
                                                                    var filteredShipmentListForMonths1 = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') >= moment(getStartDate1).format('YYYY-MM-DD') && moment(c.expectedDeliveryDate).format('YYYY-MM-DD') <= moment(getEndDate1).format('YYYY-MM-DD'));

                                                                    if (mosArray1[element].mos1 < mosArray1[element].minForMonths1 && filteredShipmentListForMonths1.length > 0) {
                                                                        monthWithMosLessThenMin1 = mosArray1[element].month1;
                                                                        break;
                                                                    } else {
                                                                    }
                                                                }
                                                                var index1 = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                        // && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 18
                                                                    // && c.versionId == versionID
                                                                );

                                                                if (monthWithMosLessThenMin1 == '' && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                    incomplianceProblem(index1, username, userId, problemActionList);
                                                                } else {
                                                                    // auto open logic for index1 ======>
                                                                    if (monthWithMosLessThenMin1 != '' && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                        openProblem(index1, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // }
                                                            });

                                                            if (monthWithMosLessThenMin != '') {
                                                                // //console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);
                                                                // if (filteredShipmentListForMonths.length > 0) {
                                                                // //console.log("flag a problem mos is less then min and have shipment withing lead times");
                                                                if (index == -1) {
                                                                    var json = {
                                                                        problemReportId: 0,
                                                                        program: {
                                                                            id: programList[pp].programId,
                                                                            label: programList[pp].label,
                                                                            code: programList[pp].programCode
                                                                        },
                                                                        versionId: versionID,
                                                                        realmProblem: problemList[prob],

                                                                        dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                        region: {
                                                                            id: 0
                                                                        },
                                                                        planningUnit: {
                                                                            id: planningUnitList[p].planningUnit.id,
                                                                            label: planningUnitList[p].planningUnit.label,

                                                                        },
                                                                        shipmentId: '',
                                                                        data5: '',
                                                                        planningUnitActive: true,
                                                                        newAdded: false,
                                                                        problemActionIndex: problemActionIndex,
                                                                        problemCategory: {
                                                                            id: 3,
                                                                            label: { label_en: 'Supply Planning' }
                                                                        },
                                                                        problemStatus: {
                                                                            id: 1,
                                                                            label: { label_en: 'Open' }
                                                                        },
                                                                        problemType: {
                                                                            id: 1,
                                                                            label: {
                                                                                label_en: 'Automatic'
                                                                            }
                                                                        },
                                                                        reviewed: false,
                                                                        reviewNotes: '',
                                                                        reviewedDate: '',
                                                                        createdBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        lastModifiedBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        problemTransList: [
                                                                            {
                                                                                problemReportTransId: '',
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        active: true,
                                                                                        labelId: 461,
                                                                                        label_en: "Open",
                                                                                        label_sp: null,
                                                                                        label_fr: null,
                                                                                        label_pr: null
                                                                                    }
                                                                                },
                                                                                notes: "",
                                                                                reviewed: false,
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                            }
                                                                        ]
                                                                    }
                                                                    problemActionList.push(json);
                                                                    problemActionIndex++;
                                                                } else {
                                                                    // auto open logic for index =======>
                                                                    if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                        openProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // } else {
                                                                //     //console.log("dont falg problem mos is not less then min ");
                                                                // }
                                                            } else {
                                                                //console.log("no months with MOS less then min ===#########");
                                                                // if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].versionId == versionID) {
                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId) {
                                                                    //console.log("//////at this point resolve the problem.");
                                                                    incomplianceProblem(index, username, userId, problemActionList);
                                                                }
                                                            }

                                                        }
                                                        if (problemList[prob].problem.problemId == 19) {
                                                            // Inventory is above max with shipment(s) in the next 7-18 months. Critical = High============
                                                            // console.log("in problem id======>19", problemList[prob].data1, "====", problemList[prob].data2);
                                                            var mosArray = [];
                                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                            // problemList[prob].data1=0
                                                            // problemList[prob].data2=6
                                                            for (var mosCounter = parseInt(problemList[prob].data1); mosCounter <= parseInt(problemList[prob].data2); mosCounter++) {
                                                                // console.log("mosCounter====>", mosCounter);
                                                                var m = moment(Date.now()).add(mosCounter, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
                                                                var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");

                                                                // }
                                                                var programId = programList[pp].programId;
                                                                // var regionId = -1;
                                                                var planningUnitId = planningUnitList[p].planningUnit.id;
                                                                var supplyPlanJson = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate).format("YYYY-MM-DD"));
                                                                var mos = "";
                                                                var maxForMonths = "";
                                                                var minForMonths = "";
                                                                var closingBalance = "";
                                                                var amcCalcualted = "";


                                                                if (supplyPlanJson.length > 0) {
                                                                    mos = supplyPlanJson[0].mos;
                                                                    maxForMonths = maxStockMoSQty;
                                                                    minForMonths = minStockMoSQty;
                                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                                }
                                                                mosArray.push(
                                                                    {
                                                                        mos: mos != "" ? parseFloat(mos).toFixed(1) : "",
                                                                        maxForMonths: maxForMonths,
                                                                        minForMonths: minForMonths,
                                                                        month: m,
                                                                        closingBalance: closingBalance,
                                                                        amcCalcualted: amcCalcualted
                                                                    });

                                                            }
                                                            // console.log("D------------------->planningUnitId====>", planningUnitId);
                                                            // console.log("D------------------->mosArray============>$@##", mosArray);
                                                            // for loop on array mosArray
                                                            // var monthWithMosLessThenMin = '';
                                                            var monthWithMosGreaterThenMax = '';
                                                            for (var element = 0; element < mosArray.length; element++) {

                                                                var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM') < moment(Date.now()).format('YYYY-MM') ? moment(Date.now()).startOf('month').format('YYYY-MM-DD') : moment(mosArray[element].month).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                // var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosGreaterThenMax).subtract(3, 'months').format('YYYY-MM-DD');
                                                                var getEndDate = moment(mosArray[element].month).add(4, 'months').format('YYYY-MM-DD');
                                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate).format('YYYY-MM'));

                                                                if (mosArray[element].mos > mosArray[element].maxForMonths && filteredShipmentListForMonths.length > 0) {
                                                                    monthWithMosGreaterThenMax = mosArray[element].month;
                                                                    break;
                                                                } else {
                                                                }
                                                            }
                                                            var index = problemActionList.findIndex(
                                                                c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                    // && c.region.id == regionList[r].regionId
                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                    && c.program.id == programList[pp].programId
                                                                    && c.realmProblem.problem.problemId == 19
                                                                // && c.versionId == versionID
                                                            );

                                                            // index1 logic----------------
                                                            var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 19 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                            problemActionListForIndex1.map(probObj => {
                                                                // if (problemActionList[prob] != undefined) {
                                                                var mosArray1 = [];
                                                                // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                                // problemList[prob].data1=0
                                                                // problemList[prob].data2=6
                                                                for (var mosCounter1 = parseInt(problemList[prob].data1); mosCounter1 <= parseInt(problemList[prob].data2); mosCounter1++) {
                                                                    // //console.log("mosCounter====>", mosCounter);
                                                                    var m1 = moment(problemActionList[prob].dt).add(mosCounter1, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                    var mStartDate1 = moment(m1).startOf('month').format("YYYY-MM-DD");
                                                                    var mEndDate1 = moment(m1).endOf('month').format("YYYY-MM-DD");

                                                                    // }
                                                                    var programId = programList[pp].programId;
                                                                    // var regionId = -1;
                                                                    var planningUnitId1 = planningUnitList[p].planningUnit.id;
                                                                    var supplyPlanJson1 = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId1 && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate1).format("YYYY-MM-DD"));
                                                                    var mos1 = "";
                                                                    var maxForMonths1 = "";
                                                                    var minForMonths1 = "";
                                                                    var closingBalance1 = "";
                                                                    var amcCalcualted1 = "";


                                                                    if (supplyPlanJson1.length > 0) {
                                                                        mos1 = supplyPlanJson1[0].mos;
                                                                        maxForMonths1 = maxStockMoSQty;
                                                                        minForMonths1 = maxStockMoSQty;
                                                                        closingBalance1 = supplyPlanJson1[0].closingBalance;
                                                                        amcCalcualted1 = supplyPlanJson1[0].amc;
                                                                    }
                                                                    mosArray1.push(
                                                                        {
                                                                            mos1: parseFloat(mos1).toFixed(1),
                                                                            maxForMonths1: maxForMonths1,
                                                                            minForMonths1: minForMonths1,
                                                                            month1: m1,
                                                                            closingBalance1: closingBalance1,
                                                                            amcCalcualted1: amcCalcualted1
                                                                        });

                                                                }
                                                                // //console.log("planningUnitId====>", planningUnitId);
                                                                // //console.log("mosArray============>$@##", mosArray);
                                                                // for loop on array mosArray
                                                                // var monthWithMosLessThenMin = '';
                                                                var monthWithMosGreaterThenMax1 = '';
                                                                for (var element = 0; element < mosArray1.length; element++) {
                                                                    // //console.log("mos element===>", mosArray[element]);
                                                                    var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM') < moment(probObj.dt).format('YYYY-MM') ? moment(probObj.dt).startOf('month').format('YYYY-MM-DD') : moment(mosArray1[element].month1).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                    // var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosGreaterThenMax1).subtract(3, 'months').format('YYYY-MM-DD');
                                                                    var getEndDate1 = moment(mosArray1[element].month1).add(4, 'months').format('YYYY-MM-DD');
                                                                    var filteredShipmentListForMonths1 = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate1).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate1).format('YYYY-MM'));
                                                                    if (mosArray1[element].mos1 > mosArray1[element].maxForMonths1 && filteredShipmentListForMonths1.length > 0) {
                                                                        monthWithMosGreaterThenMax1 = mosArray1[element].month1;
                                                                        break;
                                                                    } else {
                                                                    }
                                                                }
                                                                var index1 = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                        // && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 19
                                                                    // && c.versionId == versionID
                                                                );

                                                                if (monthWithMosGreaterThenMax1 == '' && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                    incomplianceProblem(index1, username, userId, problemActionList);
                                                                } else {
                                                                    // auto open logic for index1
                                                                    if (monthWithMosGreaterThenMax1 != '' && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                        openProblem(index1, username, userId, problemActionList);
                                                                    }
                                                                }

                                                                // }
                                                            });
                                                            // index1 logic----------------
                                                            // console.log("D------------------->monthWithMosGreaterThenMax", monthWithMosGreaterThenMax)
                                                            if (monthWithMosGreaterThenMax != '') {

                                                                // console.log("D------------------->filteredShipmentListForMonths=====>", filteredShipmentListForMonths);
                                                                // if (filteredShipmentListForMonths.length > 0) {
                                                                // console.log("D------------------->flag a problem mos is greater then max and have shipment withing lead times");
                                                                if (index == -1) {
                                                                    var json = {
                                                                        problemReportId: 0,
                                                                        program: {
                                                                            id: programList[pp].programId,
                                                                            label: programList[pp].label,
                                                                            code: programList[pp].programCode
                                                                        },
                                                                        versionId: versionID,
                                                                        realmProblem: problemList[prob],

                                                                        dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                        region: {
                                                                            id: 0
                                                                        },
                                                                        planningUnit: {
                                                                            id: planningUnitList[p].planningUnit.id,
                                                                            label: planningUnitList[p].planningUnit.label,

                                                                        },
                                                                        shipmentId: '',
                                                                        data5: '',
                                                                        planningUnitActive: true,
                                                                        newAdded: false,
                                                                        problemActionIndex: problemActionIndex,
                                                                        problemCategory: {
                                                                            id: 3,
                                                                            label: { label_en: 'Supply Planning' }
                                                                        },
                                                                        problemStatus: {
                                                                            id: 1,
                                                                            label: { label_en: 'Open' }
                                                                        },
                                                                        problemType: {
                                                                            id: 1,
                                                                            label: {
                                                                                label_en: 'Automatic'
                                                                            }
                                                                        },
                                                                        reviewed: false,
                                                                        reviewNotes: '',
                                                                        reviewedDate: '',
                                                                        createdBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        lastModifiedBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        problemTransList: [
                                                                            {
                                                                                problemReportTransId: '',
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        active: true,
                                                                                        labelId: 461,
                                                                                        label_en: "Open",
                                                                                        label_sp: null,
                                                                                        label_fr: null,
                                                                                        label_pr: null
                                                                                    }
                                                                                },
                                                                                notes: "",
                                                                                reviewed: false,
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                            }
                                                                        ]
                                                                    }
                                                                    problemActionList.push(json);
                                                                    problemActionIndex++;
                                                                } else {
                                                                    // auto open logic for index
                                                                    if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                        openProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // } else {
                                                                //     //console.log("dont falg problem mos is not greater then max ####### ");
                                                                // }
                                                            } else {
                                                                //console.log("no months with MOS greater then max ===#########");
                                                                // if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].versionId == versionID) {
                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId) {
                                                                    //console.log("//////at this point resolve the problem. ###########");
                                                                    incomplianceProblem(index, username, userId, problemActionList);
                                                                }
                                                            }

                                                        }
                                                        if (problemList[prob].problem.problemId == 20) {
                                                            // problem for mos less then min and no shipment in future 7 to 18 months 
                                                            // //console.log("in problem id======>20", problemList[prob].data1, "====", problemList[prob].data2);
                                                            var mosArray = [];
                                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                            // problemList[prob].data1=0
                                                            // problemList[prob].data2=6
                                                            for (var mosCounter = parseInt(problemList[prob].data1); mosCounter <= parseInt(problemList[prob].data2); mosCounter++) {
                                                                //console.log("mosCounter====>", mosCounter);
                                                                var m = moment(Date.now()).add(mosCounter, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
                                                                var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");

                                                                // }
                                                                var programId = programList[pp].programId;
                                                                // var regionId = -1;
                                                                var planningUnitId = planningUnitList[p].planningUnit.id;
                                                                var supplyPlanJson = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate).format("YYYY-MM-DD"));
                                                                var mos = "";
                                                                var maxForMonths = "";
                                                                var minForMonths = "";
                                                                var closingBalance = "";
                                                                var amcCalcualted = "";

                                                                if (supplyPlanJson.length > 0) {
                                                                    mos = supplyPlanJson[0].mos;
                                                                    maxForMonths = maxStockMoSQty;
                                                                    minForMonths = minStockMoSQty;
                                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                                }

                                                                mosArray.push(
                                                                    {
                                                                        mos: mos != "" ? parseFloat(mos).toFixed(1) : "",
                                                                        maxForMonths: maxForMonths,
                                                                        minForMonths: minForMonths,
                                                                        month: m,
                                                                        closingBalance: closingBalance,
                                                                        amcCalcualted: amcCalcualted
                                                                    });

                                                            }
                                                            //console.log("planningUnitId====>", planningUnitId);
                                                            //console.log("mosArray============>$@##", mosArray);
                                                            // for loop on array mosArray
                                                            var monthWithMosLessThenMin = '';
                                                            for (var element = 0; element < mosArray.length; element++) {
                                                                //console.log("mos element===>", mosArray[element]);
                                                                var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM') < moment(Date.now()).format('YYYY-MM') ? moment(Date.now()).startOf('month').format('YYYY-MM-DD') : moment(mosArray[element].month).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                // var getStartDate = moment(mosArray[element].month).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD');
                                                                var getEndDate = moment(mosArray[element].month).add(4, 'months').format('YYYY-MM-DD');
                                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate).format('YYYY-MM'));

                                                                if (mosArray[element].mos < mosArray[element].minForMonths && filteredShipmentListForMonths.length == 0) {
                                                                    monthWithMosLessThenMin = mosArray[element].month;
                                                                    break;
                                                                } else {
                                                                }
                                                            }
                                                            var index = problemActionList.findIndex(
                                                                c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                    // && c.region.id == regionList[r].regionId
                                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                    && c.program.id == programList[pp].programId
                                                                    && c.realmProblem.problem.problemId == 20
                                                                // && c.versionId == versionID
                                                            );

                                                            // index1 logic----------------
                                                            var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 20 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                            problemActionListForIndex1.map(probObj => {
                                                                // if (problemActionList[prob] != undefined) {
                                                                var mosArray1 = [];
                                                                // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                                                // problemList[prob].data1=0
                                                                // problemList[prob].data2=6
                                                                for (var mosCounter1 = parseInt(problemList[prob].data1); mosCounter1 <= parseInt(problemList[prob].data2); mosCounter1++) {
                                                                    //console.log("mosCounter====>", mosCounter);
                                                                    var m1 = moment(problemActionList[prob].dt).add(mosCounter1, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                                    var mStartDate1 = moment(m1).startOf('month').format("YYYY-MM-DD");
                                                                    var mEndDate1 = moment(m1).endOf('month').format("YYYY-MM-DD");
                                                                    // }
                                                                    var programId1 = programList[pp].programId;
                                                                    // var regionId = -1;
                                                                    var planningUnitId1 = planningUnitList[p].planningUnit.id;
                                                                    var supplyPlanJson1 = programList[pp].supplyPlan.filter(c => c.planningUnitId == planningUnitId1 && moment(c.transDate).format("YYYY-MM-DD") == moment(mStartDate1).format("YYYY-MM-DD"));

                                                                    var mos1 = "";
                                                                    var maxForMonths1 = "";
                                                                    var minForMonths1 = "";
                                                                    var closingBalance1 = "";
                                                                    var amcCalcualted1 = "";

                                                                    if (supplyPlanJson1.length > 0) {
                                                                        mos1 = supplyPlanJson1[0].mos;
                                                                        maxForMonths1 = maxStockMoSQty;
                                                                        minForMonths1 = minStockMoSQty;
                                                                        closingBalance1 = supplyPlanJson1[0].closingBalance;
                                                                        amcCalcualted1 = supplyPlanJson1[0].amc;
                                                                    }

                                                                    mosArray1.push(
                                                                        {
                                                                            mos1: parseFloat(mos1).toFixed(1),
                                                                            maxForMonths1: maxForMonths1,
                                                                            minForMonths1: minForMonths1,
                                                                            month1: m1,
                                                                            closingBalance1: closingBalance1,
                                                                            amcCalcualted1: amcCalcualted1
                                                                        });

                                                                }
                                                                //console.log("planningUnitId====>", planningUnitId);
                                                                //console.log("mosArray============>$@##", mosArray);
                                                                // for loop on array mosArray
                                                                var monthWithMosLessThenMin1 = '';
                                                                for (var element = 0; element < mosArray1.length; element++) {
                                                                    // //console.log("mos element===>", mosArray[element]);
                                                                    var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM') < moment(probObj.dt).format('YYYY-MM') ? moment(probObj.dt).startOf('month').format('YYYY-MM-DD') : moment(mosArray1[element].month1).subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
                                                                    // var getStartDate1 = moment(mosArray1[element].month1).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin1).subtract(3, 'months').format('YYYY-MM-DD');
                                                                    var getEndDate1 = moment(mosArray1[element].month1).add(4, 'months').format('YYYY-MM-DD');
                                                                    var filteredShipmentListForMonths1 = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM') >= moment(getStartDate1).format('YYYY-MM') && moment(c.expectedDeliveryDate).format('YYYY-MM') <= moment(getEndDate1).format('YYYY-MM'));

                                                                    if (mosArray1[element].mos1 < mosArray1[element].minForMonths1 && filteredShipmentListForMonths1.length == 0) {
                                                                        monthWithMosLessThenMin1 = mosArray1[element].month1;
                                                                        break;
                                                                    } else {
                                                                    }
                                                                }
                                                                var index1 = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                        // && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 20
                                                                    // && c.versionId == versionID
                                                                );

                                                                if (monthWithMosLessThenMin1 == '' && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                    incomplianceProblem(index1, username, userId, problemActionList);

                                                                } else {
                                                                    // auto open logic for index1
                                                                    if (monthWithMosLessThenMin1 != '' && index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                        openProblem(index1, username, userId, problemActionList);
                                                                    }
                                                                }

                                                                // }
                                                            });
                                                            // index1 logic----------------

                                                            if (monthWithMosLessThenMin != '') {
                                                                // if (filteredShipmentListForMonths.length == 0) {
                                                                //console.log("flag a problem mos is less then min and dont have shipment withing lead times");
                                                                if (index == -1) {
                                                                    var json = {
                                                                        problemReportId: 0,
                                                                        program: {
                                                                            id: programList[pp].programId,
                                                                            label: programList[pp].label,
                                                                            code: programList[pp].programCode
                                                                        },
                                                                        versionId: versionID,
                                                                        realmProblem: problemList[prob],

                                                                        dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                        region: {
                                                                            id: 0,
                                                                            // label: regionList[r].label
                                                                        },
                                                                        planningUnit: {
                                                                            id: planningUnitList[p].planningUnit.id,
                                                                            label: planningUnitList[p].planningUnit.label,

                                                                        },
                                                                        shipmentId: '',
                                                                        data5: '',
                                                                        planningUnitActive: true,
                                                                        newAdded: false,
                                                                        problemActionIndex: problemActionIndex,
                                                                        problemCategory: {
                                                                            id: 3,
                                                                            label: { label_en: 'Supply Planning' }
                                                                        },
                                                                        problemStatus: {
                                                                            id: 1,
                                                                            label: { label_en: 'Open' }
                                                                        },
                                                                        problemType: {
                                                                            id: 1,
                                                                            label: {
                                                                                label_en: 'Automatic'
                                                                            }
                                                                        },
                                                                        reviewed: false,
                                                                        reviewNotes: '',
                                                                        reviewedDate: '',
                                                                        createdBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        lastModifiedBy: {
                                                                            userId: userId,
                                                                            username: username
                                                                        },
                                                                        lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                        problemTransList: [
                                                                            {
                                                                                problemReportTransId: '',
                                                                                problemStatus: {
                                                                                    id: 1,
                                                                                    label: {
                                                                                        active: true,
                                                                                        labelId: 461,
                                                                                        label_en: "Open",
                                                                                        label_sp: null,
                                                                                        label_fr: null,
                                                                                        label_pr: null
                                                                                    }
                                                                                },
                                                                                notes: "",
                                                                                reviewed: false,
                                                                                createdBy: {
                                                                                    userId: userId,
                                                                                    username: username
                                                                                },
                                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                            }
                                                                        ]
                                                                    }
                                                                    problemActionList.push(json);
                                                                    problemActionIndex++;
                                                                } else {
                                                                    // auto open logic for index
                                                                    if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                        openProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                                // } else {
                                                                //     //console.log("dont falg problem mos is  less then min but have shipment in lead times ");
                                                                // }
                                                            } else {
                                                                //console.log("no months with MOS less then min or have shipmnet coming withing lead time===#########");
                                                                // if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].versionId == versionID) {
                                                                if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3) && problemActionList[index].program.id == programList[pp].programId) {
                                                                    //console.log("//////at this point resolve the problem.");
                                                                    incomplianceProblem(index, username, userId, problemActionList);
                                                                }
                                                            }

                                                        }
                                                        if (problemList[prob].problem.problemId == 21) {
                                                            for (var r = 0; r < regionList.length; r++) {
                                                                var consumptionList = programList[pp].consumptionList;
                                                                consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);

                                                                var tMinusOneDate = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                var tMinusTwoDate = moment(Date.now()).subtract(2, 'months').endOf('month').format("YYYY-MM-DD");
                                                                var tMinusThreeDate = moment(Date.now()).subtract(3, 'months').endOf('month').format("YYYY-MM-DD");

                                                                var consumptionListFortMinusOneDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusOneDate).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                var consumptionListFortMinusTwoDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusTwoDate).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                var consumptionListFortMinusThreeDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusThreeDate).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);

                                                                var index = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                        && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 21
                                                                    // && c.versionId == versionID
                                                                );
                                                                // index1 logic----------------
                                                                var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 21 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                problemActionListForIndex1.map(probObj => {

                                                                    // if (problemActionList[prob] != undefined) {

                                                                    var consumptionList1 = programList[pp].consumptionList;
                                                                    consumptionList1 = consumptionList1.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);

                                                                    var tMinusOneDate1 = moment(probObj.dt).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    var tMinusTwoDate1 = moment(probObj.dt).subtract(2, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    var tMinusThreeDate1 = moment(probObj.dt).subtract(3, 'months').endOf('month').format("YYYY-MM-DD");

                                                                    var consumptionListFortMinusOneDate1 = consumptionList1.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusOneDate1).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                    var consumptionListFortMinusTwoDate1 = consumptionList1.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusTwoDate1).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                    var consumptionListFortMinusThreeDate1 = consumptionList1.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusThreeDate1).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);

                                                                    var index1 = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 21
                                                                        // && c.versionId == versionID
                                                                    );

                                                                    if (consumptionListFortMinusOneDate1.length > 0 && consumptionListFortMinusThreeDate1.length > 0 && consumptionListFortMinusTwoDate1.length == 0) {
                                                                        // auto open logic for index1
                                                                        if (index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                            openProblem(index1, username, userId, problemActionList);
                                                                        }
                                                                    } else {
                                                                        if (consumptionListFortMinusTwoDate1.length > 0 && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                            incomplianceProblem(index1, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                    // }
                                                                });

                                                                if (consumptionListFortMinusOneDate.length > 0 && consumptionListFortMinusThreeDate.length > 0 && consumptionListFortMinusTwoDate.length == 0) {
                                                                    // //console.log("rais prob--------");
                                                                    if (index == -1) {
                                                                        var json = {
                                                                            problemReportId: 0,
                                                                            program: {
                                                                                id: programList[pp].programId,
                                                                                label: programList[pp].label,
                                                                                code: programList[pp].programCode
                                                                            },
                                                                            versionId: versionID,
                                                                            realmProblem: problemList[prob],

                                                                            dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                            region: {
                                                                                id: regionList[r].regionId,
                                                                                label: regionList[r].label
                                                                            },
                                                                            planningUnit: {
                                                                                id: planningUnitList[p].planningUnit.id,
                                                                                label: planningUnitList[p].planningUnit.label,

                                                                            },
                                                                            shipmentId: '',
                                                                            data5: '',
                                                                            planningUnitActive: true,
                                                                            newAdded: false,
                                                                            problemActionIndex: problemActionIndex,
                                                                            problemCategory: {
                                                                                id: 1,
                                                                                label: { label_en: 'Data Quality' }
                                                                            },
                                                                            problemStatus: {
                                                                                id: 1,
                                                                                label: { label_en: 'Open' }
                                                                            },
                                                                            problemType: {
                                                                                id: 1,
                                                                                label: {
                                                                                    label_en: 'Automatic'
                                                                                }
                                                                            },
                                                                            reviewed: false,
                                                                            reviewNotes: '',
                                                                            reviewedDate: '',
                                                                            createdBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            lastModifiedBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            problemTransList: [
                                                                                {
                                                                                    problemReportTransId: '',
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            active: true,
                                                                                            labelId: 461,
                                                                                            label_en: "Open",
                                                                                            label_sp: null,
                                                                                            label_fr: null,
                                                                                            label_pr: null
                                                                                        }
                                                                                    },
                                                                                    notes: "",
                                                                                    reviewed: false,
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                }
                                                                            ]
                                                                        }
                                                                        problemActionList.push(json);
                                                                        problemActionIndex++;
                                                                    } else {
                                                                        // problemActionList[index].isFound = 1 auot open logic for index;
                                                                        if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                            openProblem(index, username, userId, problemActionList);
                                                                        }
                                                                    }

                                                                } else {
                                                                    // //console.log("dont rais prob--------");
                                                                    if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                        //console.log("resolve the problem problem id 21");
                                                                        // problemActionList[index].isFound = 0;
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        // new problem for missing gaps============================
                                                        if (problemList[prob].problem.problemId == 22) {
                                                            for (var r = 0; r < regionList.length; r++) {
                                                                var consumptionList = programList[pp].consumptionList;
                                                                consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                                var tDate = moment(Date.now()).endOf('month').format("YYYY-MM-DD");
                                                                var tMinusOneDate = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                var tMinusTwoDate = moment(Date.now()).subtract(2, 'months').endOf('month').format("YYYY-MM-DD");
                                                                // var tMinusThreeDate = moment(Date.now()).subtract(3, 'months').endOf('month').format("YYYY-MM-DD");
                                                                var consumptionListFortDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tDate).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                var consumptionListFortMinusOneDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusOneDate).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                var consumptionListFortMinusTwoDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusTwoDate).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                // var consumptionListFortMinusThreeDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusThreeDate).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                var index = problemActionList.findIndex(
                                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                                        && c.region.id == regionList[r].regionId
                                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                        && c.program.id == programList[pp].programId
                                                                        && c.realmProblem.problem.problemId == 22
                                                                    // && c.versionId == versionID
                                                                );
                                                                // index1 logic----------------
                                                                var problemActionListForIndex1 = problemActionList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id && c.realmProblem.problem.problemId == 22 && moment(c.dt).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"));
                                                                problemActionListForIndex1.map(probObj => {
                                                                    // if (problemActionList[prob] != undefined) {

                                                                    var consumptionList1 = programList[pp].consumptionList;
                                                                    consumptionList1 = consumptionList1.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);

                                                                    var tDate1 = moment(probObj.dt).endOf('month').format("YYYY-MM-DD");
                                                                    var tMinusOneDate1 = moment(probObj.dt).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    var tMinusTwoDate1 = moment(probObj.dt).subtract(2, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    // var tMinusThreeDate1 = moment(probObj.dt).subtract(3, 'months').endOf('month').format("YYYY-MM-DD");
                                                                    var consumptionListFortDate1 = consumptionList1.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tDate1).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                    var consumptionListFortMinusOneDate1 = consumptionList1.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusOneDate1).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                    var consumptionListFortMinusTwoDate1 = consumptionList1.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusTwoDate1).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);
                                                                    // var consumptionListFortMinusThreeDate1 = consumptionList1.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusThreeDate1).format('YYYY-MM') && c.actualFlag.toString() == "true" && c.active == true);

                                                                    var index1 = problemActionList.findIndex(
                                                                        c => moment(c.dt).format("YYYY-MM") == moment(probObj.dt).format("YYYY-MM")
                                                                            && c.region.id == regionList[r].regionId
                                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                                            && c.program.id == programList[pp].programId
                                                                            && c.realmProblem.problem.problemId == 22
                                                                        // && c.versionId == versionID
                                                                    );

                                                                    if (consumptionListFortDate1.length > 0 && consumptionListFortMinusTwoDate1.length > 0 && consumptionListFortMinusOneDate1.length == 0) {
                                                                        // auto open logic for index1
                                                                        if (index1 != -1 && problemActionList[index1].problemStatus.id == 4) {
                                                                            openProblem(index1, username, userId, problemActionList);
                                                                        }
                                                                    } else {
                                                                        if (consumptionListFortMinusOneDate1.length > 0 && index1 != -1 && (problemActionList[index1].problemStatus.id == 1 || problemActionList[index1].problemStatus.id == 3)) {
                                                                            incomplianceProblem(index1, username, userId, problemActionList);
                                                                        }
                                                                    }
                                                                    // }
                                                                });

                                                                if (consumptionListFortDate.length > 0 && consumptionListFortMinusTwoDate.length > 0 && consumptionListFortMinusOneDate.length == 0) {
                                                                    if (index == -1) {
                                                                        var json = {
                                                                            problemReportId: 0,
                                                                            program: {
                                                                                id: programList[pp].programId,
                                                                                label: programList[pp].label,
                                                                                code: programList[pp].programCode
                                                                            },
                                                                            versionId: versionID,
                                                                            realmProblem: problemList[prob],

                                                                            dt: moment(Date.now()).format('YYYY-MM-DD'),
                                                                            region: {
                                                                                id: regionList[r].regionId,
                                                                                label: regionList[r].label
                                                                            },
                                                                            planningUnit: {
                                                                                id: planningUnitList[p].planningUnit.id,
                                                                                label: planningUnitList[p].planningUnit.label,

                                                                            },
                                                                            shipmentId: '',
                                                                            data5: '',
                                                                            planningUnitActive: true,
                                                                            newAdded: false,
                                                                            problemActionIndex: problemActionIndex,
                                                                            problemCategory: {
                                                                                id: 1,
                                                                                label: { label_en: 'Data Quality' }
                                                                            },
                                                                            problemStatus: {
                                                                                id: 1,
                                                                                label: { label_en: 'Open' }
                                                                            },
                                                                            problemType: {
                                                                                id: 1,
                                                                                label: {
                                                                                    label_en: 'Automatic'
                                                                                }
                                                                            },
                                                                            reviewed: false,
                                                                            reviewNotes: '',
                                                                            reviewedDate: '',
                                                                            createdBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            lastModifiedBy: {
                                                                                userId: userId,
                                                                                username: username
                                                                            },
                                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                                                            problemTransList: [
                                                                                {
                                                                                    problemReportTransId: '',
                                                                                    problemStatus: {
                                                                                        id: 1,
                                                                                        label: {
                                                                                            active: true,
                                                                                            labelId: 461,
                                                                                            label_en: "Open",
                                                                                            label_sp: null,
                                                                                            label_fr: null,
                                                                                            label_pr: null
                                                                                        }
                                                                                    },
                                                                                    notes: "",
                                                                                    reviewed: false,
                                                                                    createdBy: {
                                                                                        userId: userId,
                                                                                        username: username
                                                                                    },
                                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                                }
                                                                            ]
                                                                        }
                                                                        problemActionList.push(json);
                                                                        problemActionIndex++;
                                                                    } else {
                                                                        // problemActionList[index].isFound = 1 auot open logic for index;
                                                                        if (index != -1 && problemActionList[index].problemStatus.id == 4) {
                                                                            openProblem(index, username, userId, problemActionList);
                                                                        }
                                                                    }

                                                                } else {

                                                                    if (index != -1 && (problemActionList[index].problemStatus.id == 1 || problemActionList[index].problemStatus.id == 3)) {
                                                                        // console.log("resolve the problem problem id 21");
                                                                        // problemActionList[index].isFound = 0;
                                                                        incomplianceProblem(index, username, userId, problemActionList);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    // console.log("in else====>");
                                                    for (var pal = 0; pal < problemActionList.length; pal++) {
                                                        if (problemActionList[pal].planningUnit.id == planningUnitList[p].planningUnit.id) {
                                                            problemActionList[pal].planningUnitActive = false;
                                                        }
                                                    }

                                                }
                                            }
                                            // }

                                            var problemTransaction = db1.transaction([objectStoreFromProps], 'readwrite');
                                            var problemOs = problemTransaction.objectStore(objectStoreFromProps);
                                            var paList = problemActionList.filter(c => c.program.id == programList[pp].programId)

                                            programList[pp].problemReportList = paList;
                                            programRequestList[pp].programData = (CryptoJS.AES.encrypt(JSON.stringify(programList[pp]), SECRET_KEY)).toString();
                                            // //console.log("programRequestList[pp]=====", programRequestList[pp]);
                                            var putRequest = problemOs.put(programRequestList[pp]);
                                            putRequest.onerror = function (event) {
                                                this.setState({
                                                    message: i18n.t('static.program.errortext'),
                                                    color: '#BA0C2F'
                                                })
                                                // this.props.updateState(false);
                                                if (this.props.updateState != undefined) {
                                                    this.props.updateState(false);
                                                }
                                            }.bind(this);
                                            putRequest.onsuccess = function (event) {
                                                // this.setState({executionStatus:1});
                                                // return executionStatus;
                                                //console.log("time taken in sec===>", performance.now());
                                                // this.props.updateState(false);
                                                // this.props.fetchData(false);
                                                if (this.props.updateState != undefined) {
                                                    this.props.updateState(false);
                                                    this.props.fetchData();
                                                }

                                            }.bind(this);
                                            //console.log("problemList for each program=====>", problemActionList);
                                        }
                                    }.bind(this);
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this)
            }.bind(this)
        }.bind(this)


    }
}