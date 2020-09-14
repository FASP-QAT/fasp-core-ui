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
        // console.log("program id===>",programId);
        var problemActionList = [];
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            var realmId = AuthenticationService.getRealmId();
            // console.log("QPA 1====>", realmId);
            var programList = [];
            var programRequestList = [];
            var versionIDs = [];

            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.get(programId.toString());
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                });
                this.props.updateState(false);
            };
            getRequest.onsuccess = function (event) {
                // console.log("get request===>",getRequest.result);
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);

                let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                let username = decryptedUser.username;

                var latestVersionProgramList = [];

                // for (var i = 0; i < getRequest.result.length; i++) {
                // console.log("QPA 2=====>  in for");
                // if (getRequest.result[i].userId == userId) {
                var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                // console.log("QPA 2====>", programJson);
                programList.push(programJson);
                programRequestList.push(getRequest.result);
                versionIDs.push(getRequest.result.version);
                // }

                // }
                // console.log("program list=====>",programList)

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
                // console.log("QPA 3====>", programList);
                var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                var planningunitRequest = planningunitOs.getAll();
                var planningUnitList = []
                planningunitRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                    this.props.updateState(false);
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
                        this.props.updateState(false);
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
                            this.props.updateState(false);
                        }.bind(this);
                        puRequest.onsuccess = function (e) {
                            console.log("+++++++++++++", puRequest.result);
                            var planningUnitListAll = puRequest.result;
                            if (programList.length == 0) {
                                this.props.updateState(false);
                            }
                            for (var pp = 0; pp < programList.length; pp++) {
                                console.log("=====>in for====>", programList[pp]);
                                var versionID = versionIDs[pp];
                                var problemActionIndex = 0;
                                problemActionList = programList[pp].problemReportList;
                                problemActionIndex = programList[pp].problemReportList.length;
                                var regionList = programList[pp].regionList;
                                problemList = problemRequest.result.filter(c => c.realm.id == programList[pp].realmCountry.realm.realmId);
                                planningUnitList = planningUnitResult.filter(c => c.program.id == programList[pp].programId);
                                // for (var r = 0; r < regionList.length; r++) {
                                for (var p = 0; p < planningUnitList.length; p++) {

                                    for (var prob = 0; prob < problemList.length; prob++) {

                                        if (problemList[prob].problem.problemId == 1) {

                                            for (var r = 0; r < regionList.length; r++) {
                                                var consumptionList = programList[pp].consumptionList;
                                                consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                var numberOfMonths = parseInt(problemList[prob].data1);
                                                // for (var m = 1; m <= numberOfMonths; m++) {
                                                var myStartDate = moment(Date.now()).subtract(numberOfMonths, 'months').startOf('month').format("YYYY-MM-DD");
                                                var myEndDate = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                var filteredConsumptionList = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDate && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDate && c.actualFlag.toString() == "true");
                                                var index = problemActionList.findIndex(
                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                        && c.region.id == regionList[r].regionId
                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                        && c.program.id == programList[pp].programId
                                                        && c.realmProblem.problem.problemId == 1
                                                        && c.versionId == versionID);
                                                if (filteredConsumptionList.length == 0) {
                                                    // console.log("index====>", index);
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,

                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                        // problemActionList[index].isFound = 1;
                                                    }

                                                } else {
                                                    if (index != -1 && problemActionList[index].problemStatus.id == 1) {
                                                        // console.log("****** in logic to make isfound 0 consumption**********",problemActionList[index]);
                                                        // problemActionList[index].isFound = 0;
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
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
                                                var myEndDateInventory = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");

                                                var filterInventoryList = inventoryList.filter(c => moment(c.inventoryDate).format('YYYY-MM-DD') >= myStartDateInventory && moment(c.inventoryDate).format('YYYY-MM-DD') <= myEndDateInventory);
                                                var index = problemActionList.findIndex(
                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                        && c.region.id == regionList[r].regionId
                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                        && c.program.id == programList[pp].programId
                                                        && c.realmProblem.problem.problemId == 2
                                                        && c.versionId == versionID);

                                                if (filterInventoryList.length == 0) {
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,

                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Second test",
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
                                                        // problemActionList[index].isFound = 1;
                                                    }
                                                } else {
                                                    if (index != -1 && problemActionList[index].problemStatus.id == 1) {
                                                        // problemActionList[index].isFound = 0;
                                                        //console.log("****** in logic to make isfound 0 inventory**********", problemActionList[index]);
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
                                                    }
                                                }
                                            }
                                            // }
                                            // 2 inventory end=================

                                        }

                                        if (problemList[prob].problem.problemId == 3) {
                                            // 3 shipment which have delivered date in past but status is not yet delivered
                                            var shipmentList = programList[pp].shipmentList;
                                            // console.log("shipmentList=======>", shipmentList);
                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                            var filteredShipmentList = shipmentList.filter(c => moment(c.expectedDeliveryDate).add(parseInt(problemList[prob].data1), 'days').format('YYYY-MM-DD') < moment(myDateShipment).format('YYYY-MM-DD') && c.shipmentStatus.id != 7);
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
                                                                && c.versionId == versionID);
                                                    } else {
                                                        indexShipment = problemActionList.findIndex(
                                                            c => c.program.id == programList[pp].programId
                                                                && c.index == filteredShipmentList[s].index
                                                                && c.realmProblem.problem.problemId == 3
                                                                && c.versionId == versionID);
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
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: newAddShipment,

                                                            problemActionIndex: problemActionIndex,

                                                            index: index,
                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Second test",
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
                                                    }
                                                }
                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                    // problemActionList[d].program.id == programList[pp].programId
                                                    if (problemActionList[kb].realmProblem.problem.problemId == 3 && problemActionList[kb].program.id == programList[pp].programId && problemActionList[kb].problemStatus.id == 1) {
                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                        if (kbShipmentId == 0) {
                                                            kbShipmentId = problemActionList[kb].index;
                                                        }
                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                            // make status open 
                                                        } else {
                                                            // make shipmentStatus resolved=============
                                                            //console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                            var filterObj = problemActionList[kb];
                                                            var transList = filterObj.problemTransList;
                                                            let tempProblemTransObj = {
                                                                problemReportTransId: '',
                                                                problemStatus: {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                },
                                                                notes: 'Resolved one',
                                                                createdBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                            }
                                                            transList.push(tempProblemTransObj);
                                                            filterObj.problemTransList = transList;

                                                            var problemStatusObject = {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            }
                                                            filterObj.problemStatus = problemStatusObject;
                                                        }
                                                    }
                                                }


                                            } else {
                                                for (var d = 0; d < problemActionList.length; d++) {
                                                    if (problemActionList[d].realmProblem.problem.problemId == 3 && problemActionList[d].program.id == programList[pp].programId && problemActionList[d].problemStatus.id == 1) {
                                                        var index = d;
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved two',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
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
                                                var filteredConsumptionListTwo = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') >= myStartDateFuture && moment(c.consumptionDate).format('YYYY-MM-DD') <= myEndDateFuture && c.actualFlag.toString() == "false");
                                                var index = problemActionList.findIndex(
                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                        && c.region.id == regionList[r].regionId
                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                        && c.program.id == programList[pp].programId
                                                        && c.realmProblem.problem.problemId == 8
                                                        && c.versionId == versionID);

                                                if (filteredConsumptionListTwo.length != 18) {
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,
                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Second test",
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
                                                        // problemActionList[index].isFound = 1;

                                                    }

                                                } else {
                                                    if (index != -1 && problemActionList[index].problemStatus.id == 1) {
                                                        // problemActionList[index].isFound = 0;
                                                        // console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;

                                                    }
                                                }
                                            }
                                            // }
                                        }
                                        if (problemList[prob].problem.problemId == 4) {
                                            // submited shipments logic======================
                                            var shipmentList = programList[pp].shipmentList;
                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                            var filteredShipmentList = shipmentList.filter(c => (moment(c.submittedDate).add(parseInt(problemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)));
                                            // console.log("submited status list===>", filteredShipmentList);
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
                                                                && c.realmProblem.problem.problemId == 4
                                                                && c.versionId == versionID);
                                                    } else {
                                                        indexShipment = problemActionList.findIndex(
                                                            c => c.program.id == programList[pp].programId
                                                                && c.index == filteredShipmentList[s].index
                                                                && c.realmProblem.problem.problemId == 4
                                                                && c.versionId == versionID);
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
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: newAddShipment,

                                                            problemActionIndex: problemActionIndex,

                                                            index: index,
                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Second test",
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
                                                    }

                                                }
                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                    if (problemActionList[kb].realmProblem.problem.problemId == 4 && problemActionList[kb].problemStatus.id == 1) {
                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                        if (kbShipmentId == 0) {
                                                            kbShipmentId = problemActionList[kb].index;
                                                        }
                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                            // make status open 
                                                        } else {
                                                            // make shipmentStatus resolved=============
                                                            //console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                            var filterObj = problemActionList[kb];
                                                            var transList = filterObj.problemTransList;
                                                            let tempProblemTransObj = {
                                                                problemReportTransId: '',
                                                                problemStatus: {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                },
                                                                notes: 'Resolved',
                                                                createdBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                            }
                                                            transList.push(tempProblemTransObj);
                                                            filterObj.problemTransList = transList;

                                                            var problemStatusObject = {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            }
                                                            filterObj.problemStatus = problemStatusObject;
                                                        }
                                                    }
                                                }
                                            } else {
                                                for (var d = 0; d < problemActionList.length; d++) {
                                                    if (problemActionList[d].realmProblem.problem.problemId == 4 && problemActionList[d].program.id == programList[pp].programId && problemActionList[d].problemStatus.id == 1) {
                                                        var index = d;
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
                                                    }
                                                }
                                            }


                                        }
                                        if (problemList[prob].problem.problemId == 5) {
                                            // approved shipments logic======================
                                            var shipmentList = programList[pp].shipmentList;
                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                            var filteredShipmentList = shipmentList.filter(c => (moment(c.approvedDate).add(parseInt(problemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)));
                                            // console.log("approved status list===>", filteredShipmentList);
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
                                                                && c.realmProblem.problem.problemId == 5
                                                                && c.versionId == versionID);
                                                    } else {
                                                        indexShipment = problemActionList.findIndex(
                                                            c => c.program.id == programList[pp].programId
                                                                && c.index == filteredShipmentList[s].index
                                                                && c.realmProblem.problem.problemId == 5
                                                                && c.versionId == versionID);
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
                                                                programCode: programList[pp].programCode
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
                                                            newAdded:newAddShipment,

                                                            problemActionIndex: problemActionIndex,

                                                            index: index,
                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Second test",
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
                                                    }

                                                }
                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                    if (problemActionList[kb].realmProblem.problem.problemId == 5 && problemActionList[kb].problemStatus.id == 1) {
                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                        if (kbShipmentId == 0) {
                                                            kbShipmentId = problemActionList[kb].index;
                                                        }
                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                            // make status open 
                                                        } else {
                                                            // make shipmentStatus resolved=============
                                                            //console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                            var filterObj = problemActionList[kb];
                                                            var transList = filterObj.problemTransList;
                                                            let tempProblemTransObj = {
                                                                problemReportTransId: '',
                                                                problemStatus: {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                },
                                                                notes: 'Resolved',
                                                                createdBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                            }
                                                            transList.push(tempProblemTransObj);
                                                            filterObj.problemTransList = transList;

                                                            var problemStatusObject = {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            }
                                                            filterObj.problemStatus = problemStatusObject;
                                                        }
                                                    }
                                                }
                                            } else {
                                                for (var d = 0; d < problemActionList.length; d++) {
                                                    if (problemActionList[d].realmProblem.problem.problemId == 5 && problemActionList[d].program.id == programList[pp].programId && problemActionList[d].problemStatus.id == 1) {
                                                        var index = d;
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
                                                    }
                                                }
                                            }


                                        }
                                        if (problemList[prob].problem.problemId == 6) {
                                            // shipped shipments logic======================
                                            var shipmentList = programList[pp].shipmentList;
                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                            var filteredShipmentList = shipmentList.filter(c => (moment(c.shippedDate).add(parseInt(problemList[prob].data1), 'days').format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)));
                                            // console.log("shipped status list===>", filteredShipmentList);

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
                                                                && c.realmProblem.problem.problemId == 6
                                                                && c.versionId == versionID);
                                                    } else {
                                                        indexShipment = problemActionList.findIndex(
                                                            c => c.program.id == programList[pp].programId
                                                                && c.index == filteredShipmentList[s].index
                                                                && c.realmProblem.problem.problemId == 6
                                                                && c.versionId == versionID);
                                                                newAddShipment=true;
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
                                                                programCode: programList[pp].programCode
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
                                                            newAdded:newAddShipment,

                                                            problemActionIndex: problemActionIndex,

                                                            index: index,
                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Second test",
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
                                                    }

                                                }
                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                    if (problemActionList[kb].realmProblem.problem.problemId == 6 && problemActionList[kb].problemStatus.id == 1) {
                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                        if (kbShipmentId == 0) {
                                                            kbShipmentId = problemActionList[kb].index;
                                                        }
                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                            // make status open 
                                                        } else {
                                                            // make shipmentStatus resolved=============
                                                            //console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                            var filterObj = problemActionList[kb];
                                                            var transList = filterObj.problemTransList;
                                                            let tempProblemTransObj = {
                                                                problemReportTransId: '',
                                                                problemStatus: {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                },
                                                                notes: 'Resolved',
                                                                createdBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                            }
                                                            transList.push(tempProblemTransObj);
                                                            filterObj.problemTransList = transList;

                                                            var problemStatusObject = {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            }
                                                            filterObj.problemStatus = problemStatusObject;
                                                        }
                                                    }
                                                }
                                            } else {
                                                for (var d = 0; d < problemActionList.length; d++) {
                                                    if (problemActionList[d].realmProblem.problem.problemId == 6 && problemActionList[d].program.id == programList[pp].programId && problemActionList[d].problemStatus.id == 1) {
                                                        var index = d;
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
                                                    }
                                                }
                                            }


                                        }
                                        if (problemList[prob].problem.problemId == 7) {
                                            // arrived shipments logic======================
                                            var shipmentList = programList[pp].shipmentList;
                                            var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                            var filteredShipmentList = shipmentList.filter(c => (moment(c.arrivedDate).format("YYYY-MM-DD") <= moment(myDateShipment).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS)));
                                            // console.log("approved status list===>", filteredShipmentList);

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
                                                                && c.realmProblem.problem.problemId == 7
                                                                && c.versionId == versionID);
                                                    } else {
                                                        indexShipment = problemActionList.findIndex(
                                                            c => c.program.id == programList[pp].programId
                                                                && c.index == filteredShipmentList[s].index
                                                                && c.realmProblem.problem.problemId == 7
                                                                && c.versionId == versionID);
                                                                newAddShipment=true;
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
                                                                programCode: programList[pp].programCode
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
                                                            newAdded:newAddShipment,

                                                            problemActionIndex: problemActionIndex,

                                                            index: index,
                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Second test",
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
                                                    }

                                                }
                                                for (var kb = 0; kb < problemActionList.length; kb++) {
                                                    if (problemActionList[kb].realmProblem.problem.problemId == 7 && problemActionList[kb].problemStatus.id == 1) {
                                                        var kbShipmentId = problemActionList[kb].shipmentId;
                                                        if (kbShipmentId == 0) {
                                                            kbShipmentId = problemActionList[kb].index;
                                                        }
                                                        if (shipmentIdsFromShipmnetList.includes(kbShipmentId)) {
                                                            // make status open 
                                                        } else {
                                                            // make shipmentStatus resolved=============
                                                            //console.log("****** in logic to make status resolved  in shipmnet**********", problemActionList[index]);
                                                            var filterObj = problemActionList[kb];
                                                            var transList = filterObj.problemTransList;
                                                            let tempProblemTransObj = {
                                                                problemReportTransId: '',
                                                                problemStatus: {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                },
                                                                notes: 'Resolved',
                                                                createdBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                            }
                                                            transList.push(tempProblemTransObj);
                                                            filterObj.problemTransList = transList;

                                                            var problemStatusObject = {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            }
                                                            filterObj.problemStatus = problemStatusObject;
                                                        }
                                                    }
                                                }
                                            } else {
                                                for (var d = 0; d < problemActionList.length; d++) {
                                                    if (problemActionList[d].realmProblem.problem.problemId == 7 && problemActionList[d].program.id == programList[pp].programId && problemActionList[d].problemStatus.id == 1) {
                                                        var index = d;
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
                                                    }
                                                }
                                            }
                                        }

                                        // Dynamic forecasting for ARV tracer category  tc for ARV 17,3*****************
                                        if (problemList[prob].problem.problemId == 10) {

                                            for (var r = 0; r < regionList.length; r++) {
                                                // console.log("planning unit====>********", planningUnitId);
                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                if (planningUnitObj.forecastingUnit.tracerCategory.id == 17 || planningUnitObj.forecastingUnit.tracerCategory.id == 3) {
                                                    var consumptionList = programList[pp].consumptionList;
                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate);
                                                    var index = problemActionList.findIndex(
                                                        c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                            && c.region.id == regionList[r].regionId
                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                            && c.program.id == programList[pp].programId
                                                            && c.realmProblem.problem.problemId == 10
                                                            && c.versionId == versionID);

                                                    if (consumptionList.length > problemList[prob].data2) {
                                                        var conQtyArray = [];
                                                        for (var i = 0; i < consumptionList.length; i++) {
                                                            conQtyArray.push(consumptionList[i].consumptionQty);
                                                        }
                                                        // console.log("consumptionArray====>", conQtyArray);
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
                                                            // console.log("flag problem=====>");
                                                            if (index == -1) {
                                                                var json = {
                                                                    problemReportId: 0,
                                                                    program: {
                                                                        id: programList[pp].programId,
                                                                        label: programList[pp].label,
                                                                        programCode: programList[pp].programCode
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
                                                                    newAdded: false,
                                                                    problemActionIndex: problemActionIndex,
                                                                    problemStatus: {
                                                                        id: 1,
                                                                        label: { label_en: 'Open' }
                                                                    },
                                                                    problemType: {
                                                                        id: 1,
                                                                        label: {
                                                                            label_en: 'Automatic'
                                                                        }
                                                                    }, createdBy: {
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
                                                                            notes: "Second test",
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

                                                            }
                                                        }
                                                        else {
                                                            console.log("dont flag problem=====>");
                                                            if (index != -1 && problemActionList[index].problemStatus.id == 1) {
                                                                // console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                var filterObj = problemActionList[index];
                                                                var transList = filterObj.problemTransList;
                                                                let tempProblemTransObj = {
                                                                    problemReportTransId: '',
                                                                    problemStatus: {
                                                                        id: 2,
                                                                        label: {
                                                                            active: true,
                                                                            labelId: 462,
                                                                            label_en: "Resolved",
                                                                            label_sp: null,
                                                                            label_fr: null,
                                                                            label_pr: null
                                                                        }
                                                                    },
                                                                    notes: 'Resolved',
                                                                    createdBy: {
                                                                        userId: userId,
                                                                        username: username
                                                                    },
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                }
                                                                transList.push(tempProblemTransObj);
                                                                filterObj.problemTransList = transList;

                                                                var problemStatusObject = {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                }
                                                                filterObj.problemStatus = problemStatusObject;

                                                            }
                                                        }
                                                        // ================================

                                                    } else {

                                                    }
                                                    // var a = [10, 10, 10, 50, 50, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 100, 100, 100];
                                                    // var check = false;
                                                    // console.log("length=====", a.length);
                                                    // for (var i = 0; i < a.length - 3; i++) {
                                                    //     console.log("---------------");
                                                    //     console.log(a[i]);
                                                    //     var one = a[i];
                                                    //     console.log(a[i + 1]);
                                                    //     var two = a[i + 1];
                                                    //     console.log(a[i + 2]);
                                                    //     var three = a[i + 2];
                                                    //     console.log(a[i + 3]);
                                                    //     var four = a[i + 3];
                                                    //     console.log("---------------");
                                                    //     if ((one == two) && (two == three) && (three == four) && (four == one)) {
                                                    //         check = true;
                                                    //         break;
                                                    //     }
                                                    // }

                                                }// console.log(check);
                                            }
                                        }
                                        // Dynamic forecasting for  tracer category  tc for 12, MALARIA*****************
                                        if (problemList[prob].problem.problemId == 14) {
                                            for (var r = 0; r < regionList.length; r++) {
                                                // console.log("planning unit====>********", planningUnitId);
                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                // console.log("planningUnitObj====>", planningUnitObj);
                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                if (planningUnitObj.forecastingUnit.tracerCategory.id == 12) {
                                                    var consumptionList = programList[pp].consumptionList;
                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                    // console.log("startDate===>", myStartDate, "stopDate====>", myEndDate);
                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate);
                                                    var index = problemActionList.findIndex(
                                                        c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                            && c.region.id == regionList[r].regionId
                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                            && c.program.id == programList[pp].programId
                                                            && c.realmProblem.problem.problemId == 10
                                                            && c.versionId == versionID);

                                                    if (consumptionList.length > problemList[prob].data2) {
                                                        var conQtyArray = [];
                                                        for (var i = 0; i < consumptionList.length; i++) {
                                                            conQtyArray.push(consumptionList[i].consumptionQty);
                                                        }
                                                        // console.log("consumptionArray====>", conQtyArray);
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
                                                            // console.log("flag problem=====>");
                                                            if (index == -1) {
                                                                var json = {
                                                                    problemReportId: 0,
                                                                    program: {
                                                                        id: programList[pp].programId,
                                                                        label: programList[pp].label,
                                                                        programCode: programList[pp].programCode
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
                                                                    newAdded: false,
                                                                    problemActionIndex: problemActionIndex,
                                                                    problemStatus: {
                                                                        id: 1,
                                                                        label: { label_en: 'Open' }
                                                                    },
                                                                    problemType: {
                                                                        id: 1,
                                                                        label: {
                                                                            label_en: 'Automatic'
                                                                        }
                                                                    }, createdBy: {
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
                                                                            notes: "Second test",
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

                                                            }
                                                        }
                                                        else {
                                                            // console.log("dont flag problem=====>");
                                                            if (index != -1 && problemActionList[index].problemStatus.id == 1) {
                                                                // console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                var filterObj = problemActionList[index];
                                                                var transList = filterObj.problemTransList;
                                                                let tempProblemTransObj = {
                                                                    problemReportTransId: '',
                                                                    problemStatus: {
                                                                        id: 2,
                                                                        label: {
                                                                            active: true,
                                                                            labelId: 462,
                                                                            label_en: "Resolved",
                                                                            label_sp: null,
                                                                            label_fr: null,
                                                                            label_pr: null
                                                                        }
                                                                    },
                                                                    notes: 'Resolved',
                                                                    createdBy: {
                                                                        userId: userId,
                                                                        username: username
                                                                    },
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                }
                                                                transList.push(tempProblemTransObj);
                                                                filterObj.problemTransList = transList;

                                                                var problemStatusObject = {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                }
                                                                filterObj.problemStatus = problemStatusObject;

                                                            }
                                                        }
                                                        // ================================

                                                    } else {

                                                    }

                                                }
                                            }
                                        }

                                        // Dynamic forecasting for  tracer category  tc for 25, VMMC*****************
                                        if (problemList[prob].problem.problemId == 15) {
                                            for (var r = 0; r < regionList.length; r++) {
                                                // console.log("planning unit====>********", planningUnitId);
                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                // console.log("planningUnitObj====>", planningUnitObj);
                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                if (planningUnitObj.forecastingUnit.tracerCategory.id == 25) {
                                                    var consumptionList = programList[pp].consumptionList;
                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                    // console.log("consumptionList===>", consumptionList);
                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                    // console.log("startDate===>", myStartDate, "stopDate====>", myEndDate);
                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate);
                                                    var index = problemActionList.findIndex(
                                                        c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                            && c.region.id == regionList[r].regionId
                                                            && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                            && c.program.id == programList[pp].programId
                                                            && c.realmProblem.problem.problemId == 10
                                                            && c.versionId == versionID);

                                                    if (consumptionList.length > problemList[prob].data2) {
                                                        var conQtyArray = [];
                                                        for (var i = 0; i < consumptionList.length; i++) {
                                                            conQtyArray.push(consumptionList[i].consumptionQty);
                                                        }
                                                        // console.log("consumptionArray====>", conQtyArray);
                                                        // ======================
                                                        var a = conQtyArray;
                                                        var check = false;
                                                        var currArray = [];
                                                        var spanLength = problemList[prob].data2 - 1;
                                                        // console.log("length=====", a.length);
                                                        // console.log("spanLength=====", spanLength);
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
                                                            // console.log("flag problem=====>");
                                                            if (index == -1) {
                                                                var json = {
                                                                    problemReportId: 0,
                                                                    program: {
                                                                        id: programList[pp].programId,
                                                                        label: programList[pp].label,
                                                                        programCode: programList[pp].programCode
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
                                                                    newAdded: false,
                                                                    problemActionIndex: problemActionIndex,
                                                                    problemStatus: {
                                                                        id: 1,
                                                                        label: { label_en: 'Open' }
                                                                    },
                                                                    problemType: {
                                                                        id: 1,
                                                                        label: {
                                                                            label_en: 'Automatic'
                                                                        }
                                                                    }, createdBy: {
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
                                                                            notes: "Second test",
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

                                                            }
                                                        }
                                                        else {
                                                            // console.log("dont flag problem=====>");
                                                            if (index != -1 && problemActionList[index].problemStatus.id == 1) {
                                                                // console.log("****** in logic to make isfound 0 future 18 consumption**********", problemActionList[index]);
                                                                var filterObj = problemActionList[index];
                                                                var transList = filterObj.problemTransList;
                                                                let tempProblemTransObj = {
                                                                    problemReportTransId: '',
                                                                    problemStatus: {
                                                                        id: 2,
                                                                        label: {
                                                                            active: true,
                                                                            labelId: 462,
                                                                            label_en: "Resolved",
                                                                            label_sp: null,
                                                                            label_fr: null,
                                                                            label_pr: null
                                                                        }
                                                                    },
                                                                    notes: 'Resolved',
                                                                    createdBy: {
                                                                        userId: userId,
                                                                        username: username
                                                                    },
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                                }
                                                                transList.push(tempProblemTransObj);
                                                                filterObj.problemTransList = transList;

                                                                var problemStatusObject = {
                                                                    id: 2,
                                                                    label: {
                                                                        active: true,
                                                                        labelId: 462,
                                                                        label_en: "Resolved",
                                                                        label_sp: null,
                                                                        label_fr: null,
                                                                        label_pr: null
                                                                    }
                                                                }
                                                                filterObj.problemStatus = problemStatusObject;

                                                            }
                                                        }
                                                        // ================================

                                                    } else {

                                                    }

                                                }
                                            }
                                        }

                                        // ***********************===================problem conditions  end here ====================
                                        // console.log("problemList[prob]problemList[prob]problemList[prob]=====>", problemList[prob]);
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
                                                    maxForMonths = supplyPlanJson[0].maxStockMoS;
                                                    minForMonths = supplyPlanJson[0].minStockMoS;
                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                }

                                                mosArray.push(
                                                    {
                                                        mos: mos,
                                                        maxForMonths: maxForMonths,
                                                        minForMonths: minForMonths,
                                                        month: m,
                                                        closingBalance: closingBalance,
                                                        amcCalcualted: amcCalcualted
                                                    });

                                            }
                                            // console.log("planningUnitId====>", planningUnitId);
                                            // console.log("mosArray============>$@##", mosArray);
                                            // for loop on array mosArray
                                            var monthWithMosLessThenMin = '';
                                            for (var element = 0; element < mosArray.length; element++) {
                                                // console.log("mos element===>", mosArray[element]);
                                                if (mosArray[element].mos < mosArray[element].minForMonths) {
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
                                                    && c.realmProblem.problem.problemId == 11
                                                    && c.versionId == versionID);

                                            if (monthWithMosLessThenMin != '') {
                                                // console.log("min mos month from array ======>", monthWithMosLessThenMin);
                                                var getStartDate = moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD');
                                                var getEndDate = moment(monthWithMosLessThenMin).add(4, 'months').format('YYYY-MM-DD');
                                                // console.log("startDate=====>", getStartDate, "endDate=====>", getEndDate);

                                                var shipmentListForMonths = programList[pp].shipmentList;
                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') >= moment(getStartDate).format('YYYY-MM-DD') && moment(c.expectedDeliveryDate).format('YYYY-MM-DD') <= moment(getEndDate).format('YYYY-MM-DD'));
                                                // console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);


                                                if (filteredShipmentListForMonths.length > 0) {
                                                    // console.log("flag a problem mos is less then min and have shipment withing lead times");
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                    }
                                                } else {
                                                    console.log("dont falg problem mos is not less then min ");
                                                }
                                            } else {
                                                // console.log("no months with MOS less then min ===#########");
                                                if (index != -1 && problemActionList[index].problemStatus.id == 1 && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].version == versionID) {
                                                    // console.log("//////at this point resolve the problem.");
                                                    var filterObj = problemActionList[index];
                                                    var transList = filterObj.problemTransList;
                                                    let tempProblemTransObj = {
                                                        problemReportTransId: '',
                                                        problemStatus: {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        },
                                                        notes: 'Resolved',
                                                        createdBy: {
                                                            userId: userId,
                                                            username: username
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                    }
                                                    transList.push(tempProblemTransObj);
                                                    filterObj.problemTransList = transList;

                                                    var problemStatusObject = {
                                                        id: 2,
                                                        label: {
                                                            active: true,
                                                            labelId: 462,
                                                            label_en: "Resolved",
                                                            label_sp: null,
                                                            label_fr: null,
                                                            label_pr: null
                                                        }
                                                    }
                                                    filterObj.problemStatus = problemStatusObject;
                                                }
                                            }
                                        }

                                        if (problemList[prob].problem.problemId == 16) {
                                            // Inventory is above max with shipment(s) in the next 1-6 months. Critical = High============
                                            // console.log("in problem id======>16", problemList[prob].data1, "====", problemList[prob].data2);
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
                                                    maxForMonths = supplyPlanJson[0].maxStockMoS;
                                                    minForMonths = supplyPlanJson[0].minStockMoS;
                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                }

                                                mosArray.push(
                                                    {
                                                        mos: mos,
                                                        maxForMonths: maxForMonths,
                                                        minForMonths: minForMonths,
                                                        month: m,
                                                        closingBalance: closingBalance,
                                                        amcCalcualted: amcCalcualted
                                                    });

                                            }
                                            // console.log("planningUnitId====>", planningUnitId);
                                            // console.log("mosArray============>$@##", mosArray);
                                            // for loop on array mosArray
                                            // var monthWithMosLessThenMin = '';
                                            var monthWithMosGreaterThenMax = '';
                                            for (var element = 0; element < mosArray.length; element++) {
                                                // console.log("mos element===>", mosArray[element]);
                                                if (mosArray[element].mos > mosArray[element].maxForMonths) {
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
                                                    && c.versionId == versionID);

                                            if (monthWithMosGreaterThenMax != '') {
                                                // console.log("min mos month from array ======>", monthWithMosGreaterThenMax);
                                                var getStartDate = moment(monthWithMosGreaterThenMax).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosGreaterThenMax).subtract(3, 'months').format('YYYY-MM-DD');
                                                var getEndDate = moment(monthWithMosGreaterThenMax).add(4, 'months').format('YYYY-MM-DD');
                                                // console.log("startDate=====>", getStartDate, "endDate=====>", getEndDate);
                                                var shipmentListForMonths = programList[pp].shipmentList;
                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') >= moment(getStartDate).format('YYYY-MM-DD') && moment(c.expectedDeliveryDate).format('YYYY-MM-DD') <= moment(getEndDate).format('YYYY-MM-DD'));
                                                // console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);
                                                if (filteredShipmentListForMonths.length > 0) {
                                                    console.log("flag a problem mos is greater then max and have shipment withing lead times");
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                    }
                                                } else {
                                                    console.log("dont falg problem mos is not greater then max ####### ");
                                                }
                                            } else {
                                                // console.log("no months with MOS greater then max ===#########");
                                                if (index != -1 && problemActionList[index].problemStatus.id == 1 && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].version == versionID) {
                                                    // console.log("//////at this point resolve the problem. ###########");
                                                    var filterObj = problemActionList[index];
                                                    var transList = filterObj.problemTransList;
                                                    let tempProblemTransObj = {
                                                        problemReportTransId: '',
                                                        problemStatus: {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        },
                                                        notes: 'Resolved',
                                                        createdBy: {
                                                            userId: userId,
                                                            username: username
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                    }
                                                    transList.push(tempProblemTransObj);
                                                    filterObj.problemTransList = transList;

                                                    var problemStatusObject = {
                                                        id: 2,
                                                        label: {
                                                            active: true,
                                                            labelId: 462,
                                                            label_en: "Resolved",
                                                            label_sp: null,
                                                            label_fr: null,
                                                            label_pr: null
                                                        }
                                                    }
                                                    filterObj.problemStatus = problemStatusObject;
                                                }
                                            }
                                        }

                                        if (problemList[prob].problem.problemId == 17) {

                                            // problem for mos less then min and no shipment in coming  6 months 
                                            // console.log("in problem id======>17", problemList[prob].data1, "====", problemList[prob].data2);

                                            var mosArray = [];
                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                            // problemList[prob].data1=0
                                            // problemList[prob].data2=6
                                            for (var mosCounter = problemList[prob].data1; mosCounter <= problemList[prob].data2; mosCounter++) {
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
                                                    maxForMonths = supplyPlanJson[0].maxStockMoS;
                                                    minForMonths = supplyPlanJson[0].minStockMoS;
                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                }



                                                mosArray.push(
                                                    {
                                                        mos: mos,
                                                        maxForMonths: maxForMonths,
                                                        minForMonths: minForMonths,
                                                        month: m,
                                                        closingBalance: closingBalance,
                                                        amcCalcualted: amcCalcualted
                                                    });

                                            }
                                            // console.log("planningUnitId====>", planningUnitId);
                                            // console.log("mosArray============>$@##", mosArray);
                                            // for loop on array mosArray
                                            var monthWithMosLessThenMin = '';
                                            for (var element = 0; element < mosArray.length; element++) {
                                                // console.log("mos element===>", mosArray[element]);
                                                if (mosArray[element].mos < mosArray[element].minForMonths) {
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
                                                    && c.realmProblem.problem.problemId == 17
                                                    && c.versionId == versionID);

                                            if (monthWithMosLessThenMin != '') {
                                                // console.log("min mos month from array ======>", monthWithMosLessThenMin);
                                                var getStartDate = moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD');
                                                var getEndDate = moment(monthWithMosLessThenMin).add(4, 'months').format('YYYY-MM-DD');
                                                // console.log("startDate=====>", getStartDate, "endDate=====>", getEndDate);

                                                var shipmentListForMonths = programList[pp].shipmentList;
                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') >= moment(getStartDate).format('YYYY-MM-DD') && moment(c.expectedDeliveryDate).format('YYYY-MM-DD') <= moment(getEndDate).format('YYYY-MM-DD'));
                                                // console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);


                                                if (filteredShipmentListForMonths.length == 0) {
                                                    // console.log("flag a problem mos is less then min and dont have shipment withing lead times");
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                    }
                                                } else {
                                                    console.log("dont falg problem mos is  less then min but have shipment in lead times ");
                                                }
                                            } else {
                                                console.log("no months with MOS less then min or have shipmnet coming withing lead time===#########");
                                                if (index != -1 && problemActionList[index].problemStatus.id == 1 && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].version == versionID) {
                                                    // console.log("//////at this point resolve the problem.");
                                                    var filterObj = problemActionList[index];
                                                    var transList = filterObj.problemTransList;
                                                    let tempProblemTransObj = {
                                                        problemReportTransId: '',
                                                        problemStatus: {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        },
                                                        notes: 'Resolved',
                                                        createdBy: {
                                                            userId: userId,
                                                            username: username
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                    }
                                                    transList.push(tempProblemTransObj);
                                                    filterObj.problemTransList = transList;

                                                    var problemStatusObject = {
                                                        id: 2,
                                                        label: {
                                                            active: true,
                                                            labelId: 462,
                                                            label_en: "Resolved",
                                                            label_sp: null,
                                                            label_fr: null,
                                                            label_pr: null
                                                        }
                                                    }
                                                    filterObj.problemStatus = problemStatusObject;
                                                }
                                            }

                                        }
                                        if (problemList[prob].problem.problemId == 18) {

                                            // problem for mos is less then min having shipments within lead time 7-18 months ============
                                            // console.log("in problem id======>18", problemList[prob].data1, "====", problemList[prob].data2);
                                            var mosArray = [];
                                            // problemList[prob].data1 AND problemList[prob].data2 is the range  i:e t to t+6 months
                                            // problemList[prob].data1=0
                                            // problemList[prob].data2=6
                                            for (var mosCounter18 = parseInt(problemList[prob].data1); mosCounter18 <= parseInt(problemList[prob].data2); mosCounter18++) {
                                                // console.log("mosCounter18====>", mosCounter18);
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
                                                    maxForMonths = supplyPlanJson[0].maxStockMoS;
                                                    minForMonths = supplyPlanJson[0].minStockMoS;
                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                }

                                                mosArray.push(
                                                    {
                                                        mos: mos,
                                                        maxForMonths: maxForMonths,
                                                        minForMonths: minForMonths,
                                                        month: m,
                                                        closingBalance: closingBalance,
                                                        amcCalcualted: amcCalcualted
                                                    });

                                            }
                                            // console.log("planningUnitId====>", planningUnitId);
                                            // console.log("mosArray============>$@##", mosArray);
                                            // for loop on array mosArray
                                            var monthWithMosLessThenMin = '';
                                            for (var element = 0; element < mosArray.length; element++) {
                                                // console.log("mos element===>", mosArray[element]);
                                                if (mosArray[element].mos < mosArray[element].minForMonths) {
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
                                                    && c.versionId == versionID);

                                            if (monthWithMosLessThenMin != '') {
                                                // console.log("min mos month from array ======>", monthWithMosLessThenMin);
                                                var getStartDate = moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD');
                                                var getEndDate = moment(monthWithMosLessThenMin).add(4, 'months').format('YYYY-MM-DD');
                                                // console.log("startDate=====>", getStartDate, "endDate=====>", getEndDate);

                                                var shipmentListForMonths = programList[pp].shipmentList;
                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') >= moment(getStartDate).format('YYYY-MM-DD') && moment(c.expectedDeliveryDate).format('YYYY-MM-DD') <= moment(getEndDate).format('YYYY-MM-DD'));
                                                // console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);


                                                if (filteredShipmentListForMonths.length > 0) {
                                                    // console.log("flag a problem mos is less then min and have shipment withing lead times");
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                    }
                                                } else {
                                                    console.log("dont falg problem mos is not less then min ");
                                                }
                                            } else {
                                                // console.log("no months with MOS less then min ===#########");
                                                if (index != -1 && problemActionList[index].problemStatus.id == 1 && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].version == versionID) {
                                                    // console.log("//////at this point resolve the problem.");
                                                    var filterObj = problemActionList[index];
                                                    var transList = filterObj.problemTransList;
                                                    let tempProblemTransObj = {
                                                        problemReportTransId: '',
                                                        problemStatus: {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        },
                                                        notes: 'Resolved',
                                                        createdBy: {
                                                            userId: userId,
                                                            username: username
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                    }
                                                    transList.push(tempProblemTransObj);
                                                    filterObj.problemTransList = transList;

                                                    var problemStatusObject = {
                                                        id: 2,
                                                        label: {
                                                            active: true,
                                                            labelId: 462,
                                                            label_en: "Resolved",
                                                            label_sp: null,
                                                            label_fr: null,
                                                            label_pr: null
                                                        }
                                                    }
                                                    filterObj.problemStatus = problemStatusObject;
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
                                                    maxForMonths = supplyPlanJson[0].maxStockMoS;
                                                    minForMonths = supplyPlanJson[0].minStockMoS;
                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                }


                                                mosArray.push(
                                                    {
                                                        mos: mos,
                                                        maxForMonths: maxForMonths,
                                                        minForMonths: minForMonths,
                                                        month: m,
                                                        closingBalance: closingBalance,
                                                        amcCalcualted: amcCalcualted
                                                    });

                                            }
                                            // console.log("planningUnitId====>", planningUnitId);
                                            // console.log("mosArray============>$@##", mosArray);
                                            // for loop on array mosArray
                                            // var monthWithMosLessThenMin = '';
                                            var monthWithMosGreaterThenMax = '';
                                            for (var element = 0; element < mosArray.length; element++) {
                                                // console.log("mos element===>", mosArray[element]);
                                                if (mosArray[element].mos > mosArray[element].maxForMonths) {
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
                                                    && c.versionId == versionID);

                                            if (monthWithMosGreaterThenMax != '') {
                                                // console.log("min mos month from array ======>", monthWithMosGreaterThenMax);
                                                var getStartDate = moment(monthWithMosGreaterThenMax).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosGreaterThenMax).subtract(3, 'months').format('YYYY-MM-DD');
                                                var getEndDate = moment(monthWithMosGreaterThenMax).add(4, 'months').format('YYYY-MM-DD');
                                                // console.log("startDate=====>", getStartDate, "endDate=====>", getEndDate);
                                                var shipmentListForMonths = programList[pp].shipmentList;
                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') >= moment(getStartDate).format('YYYY-MM-DD') && moment(c.expectedDeliveryDate).format('YYYY-MM-DD') <= moment(getEndDate).format('YYYY-MM-DD'));
                                                // console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);
                                                if (filteredShipmentListForMonths.length > 0) {
                                                    // console.log("flag a problem mos is greater then max and have shipment withing lead times");
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                    }
                                                } else {
                                                    console.log("dont falg problem mos is not greater then max ####### ");
                                                }
                                            } else {
                                                // console.log("no months with MOS greater then max ===#########");
                                                if (index != -1 && problemActionList[index].problemStatus.id == 1 && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].version == versionID) {
                                                    // console.log("//////at this point resolve the problem. ###########");
                                                    var filterObj = problemActionList[index];
                                                    var transList = filterObj.problemTransList;
                                                    let tempProblemTransObj = {
                                                        problemReportTransId: '',
                                                        problemStatus: {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        },
                                                        notes: 'Resolved',
                                                        createdBy: {
                                                            userId: userId,
                                                            username: username
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                    }
                                                    transList.push(tempProblemTransObj);
                                                    filterObj.problemTransList = transList;

                                                    var problemStatusObject = {
                                                        id: 2,
                                                        label: {
                                                            active: true,
                                                            labelId: 462,
                                                            label_en: "Resolved",
                                                            label_sp: null,
                                                            label_fr: null,
                                                            label_pr: null
                                                        }
                                                    }
                                                    filterObj.problemStatus = problemStatusObject;
                                                }
                                            }

                                        }
                                        if (problemList[prob].problem.problemId == 20) {

                                            // problem for mos less then min and no shipment in future 7 to 18 months 
                                            // console.log("in problem id======>20", problemList[prob].data1, "====", problemList[prob].data2);

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
                                                    maxForMonths = supplyPlanJson[0].maxStockMoS;
                                                    minForMonths = supplyPlanJson[0].minStockMoS;
                                                    closingBalance = supplyPlanJson[0].closingBalance;
                                                    amcCalcualted = supplyPlanJson[0].amc;
                                                }

                                                mosArray.push(
                                                    {
                                                        mos: mos,
                                                        maxForMonths: maxForMonths,
                                                        minForMonths: minForMonths,
                                                        month: m,
                                                        closingBalance: closingBalance,
                                                        amcCalcualted: amcCalcualted
                                                    });

                                            }
                                            // console.log("planningUnitId====>", planningUnitId);
                                            // console.log("mosArray============>$@##", mosArray);
                                            // for loop on array mosArray
                                            var monthWithMosLessThenMin = '';
                                            for (var element = 0; element < mosArray.length; element++) {
                                                // console.log("mos element===>", mosArray[element]);
                                                if (mosArray[element].mos < mosArray[element].minForMonths) {
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
                                                    && c.versionId == versionID);

                                            if (monthWithMosLessThenMin != '') {
                                                // console.log("min mos month from array ======>", monthWithMosLessThenMin);
                                                var getStartDate = moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD') < moment(Date.now()).format('YYYY-MM-DD') ? moment(Date.now()).format('YYYY-MM-DD') : moment(monthWithMosLessThenMin).subtract(3, 'months').format('YYYY-MM-DD');
                                                var getEndDate = moment(monthWithMosLessThenMin).add(4, 'months').format('YYYY-MM-DD');
                                                // console.log("startDate=====>", getStartDate, "endDate=====>", getEndDate);

                                                var shipmentListForMonths = programList[pp].shipmentList;
                                                var filteredShipmentListForMonths = shipmentListForMonths.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') >= moment(getStartDate).format('YYYY-MM-DD') && moment(c.expectedDeliveryDate).format('YYYY-MM-DD') <= moment(getEndDate).format('YYYY-MM-DD'));
                                                // console.log("filteredShipmentListForMonths=====>", filteredShipmentListForMonths);


                                                if (filteredShipmentListForMonths.length == 0) {
                                                    // console.log("flag a problem mos is less then min and dont have shipment withing lead times");
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                    }
                                                } else {
                                                    console.log("dont falg problem mos is  less then min but have shipment in lead times ");
                                                }
                                            } else {
                                                // console.log("no months with MOS less then min or have shipmnet coming withing lead time===#########");
                                                if (index != -1 && problemActionList[index].problemStatus.id == 1 && problemActionList[index].program.id == programList[pp].programId && problemActionList[index].version == versionID) {
                                                    // console.log("//////at this point resolve the problem.");
                                                    var filterObj = problemActionList[index];
                                                    var transList = filterObj.problemTransList;
                                                    let tempProblemTransObj = {
                                                        problemReportTransId: '',
                                                        problemStatus: {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        },
                                                        notes: 'Resolved',
                                                        createdBy: {
                                                            userId: userId,
                                                            username: username
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                    }
                                                    transList.push(tempProblemTransObj);
                                                    filterObj.problemTransList = transList;

                                                    var problemStatusObject = {
                                                        id: 2,
                                                        label: {
                                                            active: true,
                                                            labelId: 462,
                                                            label_en: "Resolved",
                                                            label_sp: null,
                                                            label_fr: null,
                                                            label_pr: null
                                                        }
                                                    }
                                                    filterObj.problemStatus = problemStatusObject;
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
                                                // console.log("tMinusOneDate--->",tMinusOneDate);
                                                // console.log("tMinusOneDate--->",tMinusTwoDate);
                                                // console.log("tMinusOneDate--->",tMinusThreeDate);

                                                var consumptionListFortMinusOneDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusOneDate).format('YYYY-MM') && c.actualFlag.toString() == "true");
                                                var consumptionListFortMinusTwoDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusTwoDate).format('YYYY-MM') && c.actualFlag.toString() == "true");
                                                var consumptionListFortMinusThreeDate = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM') == moment(tMinusThreeDate).format('YYYY-MM') && c.actualFlag.toString() == "true");

                                                // console.log("consumptionListFortMinusOneDate--->",consumptionListFortMinusOneDate.length);
                                                // console.log("consumptionListFortMinusTwoDate--->",consumptionListFortMinusTwoDate.length);
                                                // console.log("consumptionListFortMinusThreeDate--->",consumptionListFortMinusThreeDate.length);

                                                var index = problemActionList.findIndex(
                                                    c => moment(c.dt).format("YYYY-MM") == moment(Date.now()).format("YYYY-MM")
                                                        && c.region.id == regionList[r].regionId
                                                        && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                        && c.program.id == programList[pp].programId
                                                        && c.realmProblem.problem.problemId == 21
                                                        && c.versionId == versionID);

                                                if (consumptionListFortMinusOneDate.length > 0 && consumptionListFortMinusThreeDate.length > 0 && consumptionListFortMinusTwoDate.length == 0) {
                                                    // console.log("rais prob--------");
                                                    if (index == -1) {
                                                        var json = {
                                                            problemReportId: 0,
                                                            program: {
                                                                id: programList[pp].programId,
                                                                label: programList[pp].label,
                                                                programCode: programList[pp].programCode
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
                                                            newAdded: false,
                                                            problemActionIndex: problemActionIndex,

                                                            problemStatus: {
                                                                id: 1,
                                                                label: { label_en: 'Open' }
                                                            },
                                                            problemType: {
                                                                id: 1,
                                                                label: {
                                                                    label_en: 'Automatic'
                                                                }
                                                            }, createdBy: {
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
                                                                    notes: "Open",
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
                                                        // problemActionList[index].isFound = 1;
                                                    }

                                                } else {
                                                    // console.log("dont rais prob--------");
                                                    if (index != -1 && problemActionList[index].problemStatus.id == 1) {
                                                        // console.log("resolve the problem problem id 21");
                                                        // problemActionList[index].isFound = 0;
                                                        var filterObj = problemActionList[index];
                                                        var transList = filterObj.problemTransList;
                                                        let tempProblemTransObj = {
                                                            problemReportTransId: '',
                                                            problemStatus: {
                                                                id: 2,
                                                                label: {
                                                                    active: true,
                                                                    labelId: 462,
                                                                    label_en: "Resolved",
                                                                    label_sp: null,
                                                                    label_fr: null,
                                                                    label_pr: null
                                                                }
                                                            },
                                                            notes: 'Resolved',
                                                            createdBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                                        }
                                                        transList.push(tempProblemTransObj);
                                                        filterObj.problemTransList = transList;

                                                        var problemStatusObject = {
                                                            id: 2,
                                                            label: {
                                                                active: true,
                                                                labelId: 462,
                                                                label_en: "Resolved",
                                                                label_sp: null,
                                                                label_fr: null,
                                                                label_pr: null
                                                            }
                                                        }
                                                        filterObj.problemStatus = problemStatusObject;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                // }

                                var problemTransaction = db1.transaction(['programData'], 'readwrite');
                                var problemOs = problemTransaction.objectStore('programData');
                                var paList = problemActionList.filter(c => c.program.id == programList[pp].programId)

                                programList[pp].problemReportList = paList;
                                programRequestList[pp].programData = (CryptoJS.AES.encrypt(JSON.stringify(programList[pp]), SECRET_KEY)).toString();
                                // console.log("programRequestList[pp]=====", programRequestList[pp]);
                                var putRequest = problemOs.put(programRequestList[pp]);
                                putRequest.onerror = function (event) {
                                    this.setState({
                                        message: i18n.t('static.program.errortext'),
                                        color: 'red'
                                    })
                                    this.props.updateState(false);
                                }.bind(this);
                                putRequest.onsuccess = function (event) {
                                    // this.setState({executionStatus:1});
                                    // return executionStatus;
                                    console.log("time taken in sec===>", performance.now());
                                    this.props.updateState(false);
                                    this.props.fetchData(false);

                                }.bind(this);

                                console.log("problemList for each program=====>", problemActionList);

                            }


                        }.bind(this);
                    }.bind(this);
                }.bind(this);
            }.bind(this);

        }.bind(this)


    }
}