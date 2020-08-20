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
// import { date } from "yup";
// import { components } from "react-select";
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
        this.qatProblemActions();

    }
    render() {
        return (
            <></>
        );
    }

    qatProblemActions() {
        var problemActionList = [];
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
        openRequest.onsuccess = function (e) {
            var realmId = AuthenticationService.getRealmId();
            // console.log("QPA 1====>", realmId);
            var programList = [];
            var programRequestList = [];
            var versionIDs = [];

            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            };
            getRequest.onsuccess = function (event) {

                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);

                let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                let username = decryptedUser.username;

                var latestVersionProgramList = [];

                for (var i = 0; i < getRequest.result.length; i++) {
                    // console.log("QPA 2=====>  in for");
                    if (getRequest.result[i].userId == userId) {
                        var programDataBytes = CryptoJS.AES.decrypt(getRequest.result[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        // console.log("QPA 2====>", programJson);
                        programList.push(programJson);
                        programRequestList.push(getRequest.result[i]);
                        versionIDs.push(getRequest.result[i].version);
                    }

                }


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
                        }.bind(this);
                        puRequest.onsuccess = function (e) {
                            // console.log("+++++++++++++", puRequest.result);
                            var planningUnitListAll = puRequest.result;


                            // console.log("QPA 5====>", planningUnitResult);
                            if(programList.length==0){
                                // alert("in if");
                                this.props.updateState(false);
                            }
                            for (var pp = 0; pp < programList.length; pp++) {
                                var versionID = versionIDs[pp];
                                // console.log("programList[PP]===", programList[pp], "version of program==>", versionID);
                                var problemActionIndex = 0;
                                problemActionList = programList[pp].problemReportList;
                                problemActionIndex = programList[pp].problemReportList.length;
                                var regionList = programList[pp].regionList;
                                // console.log("QPA 6====>", regionList)
                                problemList = problemRequest.result.filter(c => c.realm.id == programList[pp].realmCountry.realm.realmId);
                                planningUnitList = planningUnitResult.filter(c => c.program.id == programList[pp].programId);
                                // console.log("QPA 7====>", planningUnitList);
                                for (var r = 0; r < regionList.length; r++) {
                                    // console.log("QAP===>8");
                                    for (var p = 0; p < planningUnitList.length; p++) {
                                        for (var prob = 0; prob < problemList.length; prob++) {
                                            // problem conditions start from here ====================
                                            if (problemList[prob].problem.problemId == 1) {
                                                var consumptionList = programList[pp].consumptionList;
                                                consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                // console.log("QAP 9====>", consumptionList);
                                                var numberOfMonths = parseInt(problemList[prob].data1);
                                                // for (var m = 1; m <= numberOfMonths; m++) {
                                                var myStartDate = moment(Date.now()).subtract(numberOfMonths, 'months').startOf('month').format("YYYY-MM-DD");
                                                var myEndDate = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
                                                // console.log("startDate====>", myStartDate, "=====>stopDate", myEndDate);
                                                // console.log("QAP 10====>", myDate);
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                            lastModifiedBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                                                }
                                                            ]
                                                        }
                                                        // json.realmProblem.problem.label.label_en = 'Missing recent actual consumption inputs (within the last' + " " + numberOfMonths + " " + 'months)';
                                                        // json.realmProblem.problem.actionLabel.label_en = 'Please provide Actual consumption for the planning Unit';
                                                        // + " " + planningUnitList[p].planningUnit.label.label_en + " " + 'in' + " " + regionList[r].label.label_en + " " + 'region for the month of ' + " " + moment(myDate).format("MMM-YY");
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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

                                                // console.log("QAP 11====>", problemActionList);
                                                // 1 consumption end =================
                                            }


                                            if (problemList[prob].problem.problemId == 2) {
                                                //2 inventory  ====================
                                                var inventoryList = programList[pp].inventoryList;
                                                inventoryList = inventoryList.filter(c => c.region != null && c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                //console.log("QAP 12====>", inventoryList);
                                                var numberOfMonthsInventory = parseInt(problemList[prob].data1);
                                                // for (var mi = 1; mi <= numberOfMonthsInventory; mi++) {
                                                var myStartDateInventory = moment(Date.now()).subtract(numberOfMonthsInventory, 'months').startOf('month').format("YYYY-MM-DD");
                                                var myEndDateInventory = moment(Date.now()).subtract(1, 'months').endOf('month').format("YYYY-MM-DD");

                                                // console.log("QAP 13====>", myDateInventory);
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                            lastModifiedBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                // console.log("QAP 14====>", problemActionList);
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
                                                                region: '',
                                                                planningUnit: {
                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                },
                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                                                    }
                                                                ]

                                                            }
                                                            // json.realmProblem.problem.label.label_en = 'Shipments have receive dates more than ' + " " + parseInt(problemList[prob].data1) + " " + 'days in the past';
                                                            // json.realmProblem.problem.actionLabel.label_en = 'Please update the Shipment status for Shipments that should have been Received by now';
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                // 4 no forecasted consumption for future 18 months
                                                var consumptionList = programList[pp].consumptionList;
                                                consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                // console.log("QAP 9====>", consumptionList);
                                                var numberOfMonthsInFunture = problemList[prob].data1;
                                                // for (var m = 1; m <= numberOfMonthsInFunture; m++) {
                                                var myStartDateFuture = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                var myEndDateFuture = moment(Date.now()).add(numberOfMonthsInFunture, 'months').endOf('month').format("YYYY-MM-DD");
                                                // console.log("date====>", myDateFuture);
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                            lastModifiedBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                                                }
                                                            ]
                                                        }
                                                        // Please provide Forecasted consumption for <%PLANNING_UNIT%> in <%REGION%> region for the month of <%DT%>
                                                        // json.realmProblem.problem.label.label_en = 'No Forecasted consumption for' + " " + numberOfMonthsInFunture + " " + 'months in to the future';
                                                        // json.realmProblem.problem.actionLabel.label_en = 'Please provide Forecasted consumption for planning unit.' ;

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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                region: '',
                                                                planningUnit: {
                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                },
                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                region: '',
                                                                planningUnit: {
                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                },
                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                region: '',
                                                                planningUnit: {
                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                },
                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                region: '',
                                                                planningUnit: {
                                                                    id: filteredShipmentList[s].planningUnit.id,
                                                                    label: filteredShipmentList[s].planningUnit.label,

                                                                },
                                                                shipmentId: filteredShipmentList[s].shipmentId,
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                // console.log("planning unit====>********", planningUnitId);
                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                // console.log("planningUnitObj====>", planningUnitObj);
                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                if (planningUnitObj.forecastingUnit.tracerCategory.id == 17 || planningUnitObj.forecastingUnit.tracerCategory.id == 3) {
                                                    var consumptionList = programList[pp].consumptionList;
                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                    // console.log("consumptionList===>", consumptionList);
                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                    // console.log("startDate===>", myStartDate, "stopDate====>", myEndDate);
                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate);
                                                    // console.log("filtered consumption list===>", consumptionList);
                                                    // console.log("problemList[prob].data2===>", problemList[prob].data2);
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
                                                            // console.log("currArray=====>", currArray);
                                                            const allEqual = arr => arr.every(v => v === arr[0]);
                                                            // console.log("allEqual===>", allEqual(currArray));
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                    lastModifiedBy: {
                                                                        userId: userId,
                                                                        username: username
                                                                    },
                                                                    lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                    // console.log(check);
                                                }
                                            }
                                            // Dynamic forecasting for  tracer category  tc for 12, MALARIA*****************
                                            if (problemList[prob].problem.problemId == 14) {
                                                // console.log("planning unit====>********", planningUnitId);
                                                var planningUnitObj = planningUnitListAll.filter(c => c.planningUnitId == planningUnitId)[0];
                                                // console.log("planningUnitObj====>", planningUnitObj);
                                                var numberOfMonthsInFuture = problemList[prob].data1;
                                                if (planningUnitObj.forecastingUnit.tracerCategory.id == 12) {
                                                    var consumptionList = programList[pp].consumptionList;
                                                    consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                                    // console.log("consumptionList===>", consumptionList);
                                                    var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("YYYY-MM-DD");
                                                    var myEndDate = moment(Date.now()).add(numberOfMonthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                                                    // console.log("startDate===>", myStartDate, "stopDate====>", myEndDate);
                                                    consumptionList = consumptionList.filter(c => c.consumptionDate >= myStartDate && c.consumptionDate <= myEndDate);
                                                    // console.log("filtered consumption list===>", consumptionList);
                                                    // console.log("problemList[prob].data2===>", problemList[prob].data2);
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
                                                            // console.log("currArray=====>", currArray);
                                                            const allEqual = arr => arr.every(v => v === arr[0]);
                                                            // console.log("allEqual===>", allEqual(currArray));
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                    lastModifiedBy: {
                                                                        userId: userId,
                                                                        username: username
                                                                    },
                                                                    lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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

                                            // Dynamic forecasting for  tracer category  tc for 25, VMMC*****************
                                            if (problemList[prob].problem.problemId == 15) {
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
                                                    // console.log("filtered consumption list===>", consumptionList);
                                                    // console.log("problemList[prob].data2===>", problemList[prob].data2);
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
                                                            // console.log("currArray=====>", currArray);
                                                            const allEqual = arr => arr.every(v => v === arr[0]);
                                                            // console.log("allEqual===>", allEqual(currArray));
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                    lastModifiedBy: {
                                                                        userId: userId,
                                                                        username: username
                                                                    },
                                                                    lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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

                                            // ***********************===================problem conditions  end here ====================
                                            // console.log("problemList[prob]problemList[prob]problemList[prob]=====>", problemList[prob]);
                                            if (problemList[prob].problem.problemId == 11) {

                                                // problem for mos is less then min having shipments within lead time 0-6 months ============

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
                                                    var regionId = -1;
                                                    var planningUnitId = planningUnitList[p].planningUnit.id;

                                                    var programPlanningUnit = planningUnitList[p];
                                                    var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
                                                    var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

                                                    var regionListFiltered = regionList;
                                                    // console.log("regionList----->", regionList);

                                                    var programJson = programList[pp];
                                                    // console.log("************ProgramJson***********", programJson);
                                                    var shelfLife = programPlanningUnit.shelfLife;
                                                    var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
                                                    var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

                                                    var consumptionQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = consumptionList.filter(c => (c.consumptionDate >= mStartDate && c.consumptionDate <= mEndDate) && c.region.id == regionListFiltered[reg].regionId);
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

                                                    var consumptionQtyForEB = consumptionQty;
                                                    // Calculations for AMC
                                                    var amcBeforeArray = [];
                                                    var amcAfterArray = [];
                                                    for (var c = 0; c < monthsInPastForAMC; c++) {
                                                        var month1MonthsBefore = moment(mStartDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1Before = moment(mEndDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
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
                                                            amcBeforeArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcBeforeArray;
                                                            if (amcArrayForMonth.length == monthsInPastForAMC) {
                                                                c = monthsInPastForAMC;
                                                            }
                                                        }

                                                    }

                                                    for (var c = 0; c < monthsInFutureForAMC; c++) {
                                                        var month1MonthsAfter = moment(mStartDate).add(c, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1After = moment(mEndDate).add(c, 'months').format("YYYY-MM-DD");
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
                                                            amcAfterArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcAfterArray;
                                                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                                                                c = monthsInFutureForAMC;
                                                            }
                                                        }

                                                    }
                                                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                                                    var amcArrayFilteredForMonth = amcArray;
                                                    var countAMC = amcArrayFilteredForMonth.length;
                                                    var sumOfConsumptions = 0;
                                                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                                    }
                                                    if (countAMC != 0) {
                                                        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);

                                                        // Calculations for Min stock
                                                        var maxForMonths = 0;
                                                        var realm = programJson.realmCountry.realm;
                                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                                        } else {
                                                            maxForMonths = minMonthsOfStock
                                                        }
                                                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));


                                                        // Calculations for Max Stock
                                                        var minForMonths = 0;
                                                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                                                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                                        } else {
                                                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                                                        }
                                                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                                                    } else {
                                                    }


                                                    // Inventory part
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                    if (regionId != -1) {
                                                        inventoryList = inventoryList.filter(c => c.region.id == regionId)
                                                    }
                                                    var adjustmentQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                        for (var j = 0; j < c.length; j++) {
                                                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                        }
                                                    }
                                                    var c1 = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region == null);
                                                    for (var j = 0; j < c1.length; j++) {
                                                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                    }

                                                    // Shipments updated part

                                                    // Shipments part
                                                    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= mStartDate && c.expectedDeliveryDate <= mEndDate))
                                                    var shipmentTotalQty = 0;
                                                    for (var j = 0; j < shipmentArr.length; j++) {
                                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                    }

                                                    // Calculations for exipred stock
                                                    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
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
                                                        // console.log("stockForBatchNumber===>", stockForBatchNumber);
                                                        var totalStockForBatchNumber = 0;
                                                        if (stockForBatchNumber != undefined) {
                                                            totalStockForBatchNumber = stockForBatchNumber.qty;
                                                        } else {

                                                        }

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
                                                    // console.log("MyArray", myArray);

                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(6, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).format("YYYY-MM-DD");
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var unallocatedConsumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    var qty = 0;
                                                                    if (c[j].batchInfoList.length > 0) {
                                                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                                            qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                                        }
                                                                    }
                                                                    var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
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

                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
                                                        // console.log("--------------------------------------------------------------");
                                                        // console.log("Start date", startDate);
                                                        var adjustmentQty = 0;
                                                        var unallocatedAdjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                if (unallocatedAdjustmentQty > 0) {
                                                                    if (batchDetailsForParticularPeriod.length > 0) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            if (unallocatedAdjustmentQty > 0) {
                                                                if (batchDetailsForParticularPeriod.length > 0) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                                                    unallocatedAdjustmentQty = 0;
                                                                }
                                                            }
                                                        }
                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                                            // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                                            // console.log("Unallocated consumption", unallocatedConsumptionQty);
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
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                                }

                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            if (unallocatedAdjustmentQty < 0) {
                                                                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            }
                                                        }

                                                    }

                                                    // console.log("My array after accounting all the calcuklations", myArray);
                                                    var expiredStockArr = myArray;

                                                    // Calculation of opening and closing balance
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(5, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).subtract(1, 'months').format("YYYY-MM-DD");
                                                    var openingBalance = 0;
                                                    var expiredStockQty = 0;
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                        // console.log("main consumption====>", consumptionQty);
                                                        // Inventory part
                                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                        var adjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                            for (var j = 0; j < c.length; j++) {
                                                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                        }
                                                        var adjustmentQtyForEB = adjustmentQty;

                                                        // Shipments part
                                                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                                        var shipmentTotalQty = 0;
                                                        for (var j = 0; j < shipmentArr.length; j++) {
                                                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                        }

                                                        var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(endDate).format("YYYY-MM-DD"))));
                                                        expiredStockQty = 0;
                                                        for (var j = 0; j < expiredStock.length; j++) {
                                                            expiredStockQty += parseInt((expiredStock[j].remainingQty));
                                                        }
                                                        // console.log("created date 0===>", createdDate);
                                                        // console.log("planning Unit====>", planningUnitId);
                                                        // console.log("$$$$$$ 1====>", openingBalance);
                                                        // console.log("$$$$$$ 2====>", shipmentTotalQty);
                                                        // console.log("$$$$$$ 3====>", adjustmentQty);
                                                        // console.log("$$$$$$ 4====>", consumptionQty);
                                                        // console.log("$$$$$$ 5====>", expiredStockQty)
                                                        var closingBalance = parseInt(openingBalance) + parseInt(shipmentTotalQty) + parseFloat(adjustmentQty) - parseInt(consumptionQty) - parseInt(expiredStockQty);
                                                        if (closingBalance < 0) {
                                                            closingBalance = 0;
                                                        }
                                                        // console.log("closing balance===>", closingBalance);
                                                        // console.log("amc cAlculated===>", amcCalcualted);
                                                        openingBalance = closingBalance;
                                                    }
                                                    // console.log("Total exipred stock", totalExpiredStockArr);
                                                    // Calculations for monthsOfStock
                                                    // console.log("closing balance===>", closingBalance, "AMC====>", amcCalcualted);
                                                    if (closingBalance != 0 && amcCalcualted != 0 && closingBalance != "" && amcCalcualted != "") {
                                                        var mos = parseFloat(closingBalance / amcCalcualted).toFixed(2);
                                                    } else {
                                                        var mos = "";
                                                    }
                                                    // console.log("mos----------->", mos);
                                                    // console.log("minStock mos", maxForMonths);
                                                    // console.log("maxStock mos", minForMonths);

                                                    mosArray.push(
                                                        {
                                                            mos: mos,
                                                            maxForMonths: minForMonths,
                                                            minForMonths: maxForMonths,
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
                                                                    id: regionList[r].regionId,
                                                                    label: regionList[r].label
                                                                },
                                                                planningUnit: {
                                                                    id: planningUnitList[p].planningUnit.id,
                                                                    label: planningUnitList[p].planningUnit.label,

                                                                },
                                                                shipmentId: '',
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                    // console.log("mosCounter====>", mosCounter);
                                                    var m = moment(Date.now()).add(mosCounter, 'months').utcOffset('-0500').format("YYYY-MM-DD");
                                                    var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
                                                    var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");

                                                    // }
                                                    var programId = programList[pp].programId;
                                                    var regionId = -1;
                                                    var planningUnitId = planningUnitList[p].planningUnit.id;

                                                    var programPlanningUnit = planningUnitList[p];
                                                    var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
                                                    var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

                                                    var regionListFiltered = regionList;
                                                    // console.log("regionList----->", regionList);

                                                    var programJson = programList[pp];
                                                    // console.log("************ProgramJson***********", programJson);
                                                    var shelfLife = programPlanningUnit.shelfLife;
                                                    var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
                                                    var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

                                                    var consumptionQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = consumptionList.filter(c => (c.consumptionDate >= mStartDate && c.consumptionDate <= mEndDate) && c.region.id == regionListFiltered[reg].regionId);
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

                                                    var consumptionQtyForEB = consumptionQty;
                                                    // Calculations for AMC
                                                    var amcBeforeArray = [];
                                                    var amcAfterArray = [];
                                                    for (var c = 0; c < monthsInPastForAMC; c++) {
                                                        var month1MonthsBefore = moment(mStartDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1Before = moment(mEndDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
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
                                                            amcBeforeArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcBeforeArray;
                                                            if (amcArrayForMonth.length == monthsInPastForAMC) {
                                                                c = monthsInPastForAMC;
                                                            }
                                                        }

                                                    }

                                                    for (var c = 0; c < monthsInFutureForAMC; c++) {
                                                        var month1MonthsAfter = moment(mStartDate).add(c, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1After = moment(mEndDate).add(c, 'months').format("YYYY-MM-DD");
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
                                                            amcAfterArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcAfterArray;
                                                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                                                                c = monthsInFutureForAMC;
                                                            }
                                                        }

                                                    }
                                                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                                                    var amcArrayFilteredForMonth = amcArray;
                                                    var countAMC = amcArrayFilteredForMonth.length;
                                                    var sumOfConsumptions = 0;
                                                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                                    }
                                                    if (countAMC != 0) {
                                                        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);

                                                        // Calculations for Min stock
                                                        var maxForMonths = 0;
                                                        var realm = programJson.realmCountry.realm;
                                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                                        } else {
                                                            maxForMonths = minMonthsOfStock
                                                        }
                                                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));


                                                        // Calculations for Max Stock
                                                        var minForMonths = 0;
                                                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                                                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                                        } else {
                                                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                                                        }
                                                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                                                    } else {
                                                    }


                                                    // Inventory part
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                    if (regionId != -1) {
                                                        inventoryList = inventoryList.filter(c => c.region.id == regionId)
                                                    }
                                                    var adjustmentQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                        for (var j = 0; j < c.length; j++) {
                                                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                        }
                                                    }
                                                    var c1 = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region == null);
                                                    for (var j = 0; j < c1.length; j++) {
                                                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                    }

                                                    // Shipments updated part

                                                    // Shipments part
                                                    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= mStartDate && c.expectedDeliveryDate <= mEndDate))
                                                    var shipmentTotalQty = 0;
                                                    for (var j = 0; j < shipmentArr.length; j++) {
                                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                    }

                                                    // Calculations for exipred stock
                                                    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
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
                                                        // var totalStockForBatchNumber = stockForBatchNumber.qty;

                                                        var totalStockForBatchNumber = 0;
                                                        if (stockForBatchNumber != undefined) {
                                                            totalStockForBatchNumber = stockForBatchNumber.qty;
                                                        } else {

                                                        }

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
                                                    // console.log("MyArray", myArray);

                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(6, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).format("YYYY-MM-DD");
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var unallocatedConsumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    var qty = 0;
                                                                    if (c[j].batchInfoList.length > 0) {
                                                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                                            qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                                        }
                                                                    }
                                                                    var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
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

                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
                                                        // console.log("--------------------------------------------------------------");
                                                        // console.log("Start date", startDate);
                                                        var adjustmentQty = 0;
                                                        var unallocatedAdjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                if (unallocatedAdjustmentQty > 0) {
                                                                    if (batchDetailsForParticularPeriod.length > 0) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            if (unallocatedAdjustmentQty > 0) {
                                                                if (batchDetailsForParticularPeriod.length > 0) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                                                    unallocatedAdjustmentQty = 0;
                                                                }
                                                            }
                                                        }
                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                                            // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                                            // console.log("Unallocated consumption", unallocatedConsumptionQty);
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
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                                }

                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            if (unallocatedAdjustmentQty < 0) {
                                                                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            }
                                                        }

                                                    }

                                                    // console.log("My array after accounting all the calcuklations", myArray);
                                                    var expiredStockArr = myArray;

                                                    // Calculation of opening and closing balance
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(5, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).subtract(1, 'months').format("YYYY-MM-DD");
                                                    var openingBalance = 0;
                                                    var expiredStockQty = 0;
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                        // console.log("main consumption====>", consumptionQty);
                                                        // Inventory part
                                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                        var adjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                            for (var j = 0; j < c.length; j++) {
                                                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                        }
                                                        var adjustmentQtyForEB = adjustmentQty;

                                                        // Shipments part
                                                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                                        var shipmentTotalQty = 0;
                                                        for (var j = 0; j < shipmentArr.length; j++) {
                                                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                        }

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

                                                    // Calculations for monthsOfStock
                                                    // console.log("closing balance===>", closingBalance, "AMC====>", amcCalcualted);
                                                    if (closingBalance != 0 && amcCalcualted != 0 && closingBalance != "" && amcCalcualted != "") {
                                                        var mos = parseFloat(closingBalance / amcCalcualted).toFixed(2);
                                                    } else {
                                                        var mos = "";
                                                    }
                                                    // console.log("mos----------->", mos);
                                                    // console.log("minStock mos", maxForMonths);
                                                    // console.log("maxStock mos", minForMonths);
                                                    mosArray.push(
                                                        {
                                                            mos: mos,
                                                            maxForMonths: minForMonths,
                                                            minForMonths: maxForMonths,
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
                                                                    id: regionList[r].regionId,
                                                                    label: regionList[r].label
                                                                },
                                                                planningUnit: {
                                                                    id: planningUnitList[p].planningUnit.id,
                                                                    label: planningUnitList[p].planningUnit.label,

                                                                },
                                                                shipmentId: '',
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                    var regionId = -1;
                                                    var planningUnitId = planningUnitList[p].planningUnit.id;

                                                    var programPlanningUnit = planningUnitList[p];
                                                    var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
                                                    var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

                                                    var regionListFiltered = regionList;
                                                    // console.log("regionList----->", regionList);

                                                    var programJson = programList[pp];
                                                    // console.log("************ProgramJson***********", programJson);
                                                    var shelfLife = programPlanningUnit.shelfLife;
                                                    var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
                                                    var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

                                                    var consumptionQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = consumptionList.filter(c => (c.consumptionDate >= mStartDate && c.consumptionDate <= mEndDate) && c.region.id == regionListFiltered[reg].regionId);
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

                                                    var consumptionQtyForEB = consumptionQty;
                                                    // Calculations for AMC
                                                    var amcBeforeArray = [];
                                                    var amcAfterArray = [];
                                                    for (var c = 0; c < monthsInPastForAMC; c++) {
                                                        var month1MonthsBefore = moment(mStartDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1Before = moment(mEndDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
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
                                                            amcBeforeArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcBeforeArray;
                                                            if (amcArrayForMonth.length == monthsInPastForAMC) {
                                                                c = monthsInPastForAMC;
                                                            }
                                                        }

                                                    }

                                                    for (var c = 0; c < monthsInFutureForAMC; c++) {
                                                        var month1MonthsAfter = moment(mStartDate).add(c, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1After = moment(mEndDate).add(c, 'months').format("YYYY-MM-DD");
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
                                                            amcAfterArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcAfterArray;
                                                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                                                                c = monthsInFutureForAMC;
                                                            }
                                                        }

                                                    }
                                                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                                                    var amcArrayFilteredForMonth = amcArray;
                                                    var countAMC = amcArrayFilteredForMonth.length;
                                                    var sumOfConsumptions = 0;
                                                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                                    }
                                                    if (countAMC != 0) {
                                                        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);

                                                        // Calculations for Min stock
                                                        var maxForMonths = 0;
                                                        var realm = programJson.realmCountry.realm;
                                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                                        } else {
                                                            maxForMonths = minMonthsOfStock
                                                        }
                                                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));


                                                        // Calculations for Max Stock
                                                        var minForMonths = 0;
                                                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                                                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                                        } else {
                                                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                                                        }
                                                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                                                    } else {
                                                    }


                                                    // Inventory part
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                    if (regionId != -1) {
                                                        inventoryList = inventoryList.filter(c => c.region.id == regionId)
                                                    }
                                                    var adjustmentQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                        for (var j = 0; j < c.length; j++) {
                                                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                        }
                                                    }
                                                    var c1 = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region == null);
                                                    for (var j = 0; j < c1.length; j++) {
                                                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                    }

                                                    // Shipments updated part

                                                    // Shipments part
                                                    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= mStartDate && c.expectedDeliveryDate <= mEndDate))
                                                    var shipmentTotalQty = 0;
                                                    for (var j = 0; j < shipmentArr.length; j++) {
                                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                    }

                                                    // Calculations for exipred stock
                                                    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
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
                                                        // var totalStockForBatchNumber = stockForBatchNumber.qty;

                                                        var totalStockForBatchNumber = 0;
                                                        if (stockForBatchNumber != undefined) {
                                                            totalStockForBatchNumber = stockForBatchNumber.qty;
                                                        } else {

                                                        }

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
                                                    // console.log("MyArray", myArray);

                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(6, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).format("YYYY-MM-DD");
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var unallocatedConsumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    var qty = 0;
                                                                    if (c[j].batchInfoList.length > 0) {
                                                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                                            qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                                        }
                                                                    }
                                                                    var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
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

                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
                                                        // console.log("--------------------------------------------------------------");
                                                        // console.log("Start date", startDate);
                                                        var adjustmentQty = 0;
                                                        var unallocatedAdjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                if (unallocatedAdjustmentQty > 0) {
                                                                    if (batchDetailsForParticularPeriod.length > 0) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            if (unallocatedAdjustmentQty > 0) {
                                                                if (batchDetailsForParticularPeriod.length > 0) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                                                    unallocatedAdjustmentQty = 0;
                                                                }
                                                            }
                                                        }
                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                                            // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                                            // console.log("Unallocated consumption", unallocatedConsumptionQty);
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
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                                }

                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            if (unallocatedAdjustmentQty < 0) {
                                                                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            }
                                                        }

                                                    }

                                                    // console.log("My array after accounting all the calcuklations", myArray);
                                                    var expiredStockArr = myArray;

                                                    // Calculation of opening and closing balance
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(5, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).subtract(1, 'months').format("YYYY-MM-DD");
                                                    var openingBalance = 0;
                                                    var expiredStockQty = 0;
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                        // console.log("main consumption====>", consumptionQty);
                                                        // Inventory part
                                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                        var adjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                            for (var j = 0; j < c.length; j++) {
                                                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                        }
                                                        var adjustmentQtyForEB = adjustmentQty;

                                                        // Shipments part
                                                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                                        var shipmentTotalQty = 0;
                                                        for (var j = 0; j < shipmentArr.length; j++) {
                                                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                        }

                                                        var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(endDate).format("YYYY-MM-DD"))));
                                                        expiredStockQty = 0;
                                                        for (var j = 0; j < expiredStock.length; j++) {
                                                            expiredStockQty += parseInt((expiredStock[j].remainingQty));
                                                        }
                                                        // console.log("created date 0===>", createdDate);
                                                        // console.log("planning Unit====>", planningUnitId);
                                                        // console.log("$$$$$$ 1====>", openingBalance);
                                                        // console.log("$$$$$$ 2====>", shipmentTotalQty);
                                                        // console.log("$$$$$$ 3====>", adjustmentQty);
                                                        // console.log("$$$$$$ 4====>", consumptionQty);
                                                        // console.log("$$$$$$ 5====>", expiredStockQty)
                                                        var closingBalance = parseInt(openingBalance) + parseInt(shipmentTotalQty) + parseFloat(adjustmentQty) - parseInt(consumptionQty) - parseInt(expiredStockQty);
                                                        if (closingBalance < 0) {
                                                            closingBalance = 0;
                                                        }
                                                        // console.log("closing balance===>", closingBalance);
                                                        // console.log("amc cAlculated===>", amcCalcualted);
                                                        openingBalance = closingBalance;
                                                    }
                                                    // console.log("Total exipred stock", totalExpiredStockArr);
                                                    // Calculations for monthsOfStock
                                                    // console.log("closing balance===>", closingBalance, "AMC====>", amcCalcualted);
                                                    if (closingBalance != 0 && amcCalcualted != 0 && closingBalance != "" && amcCalcualted != "") {
                                                        var mos = parseFloat(closingBalance / amcCalcualted).toFixed(2);
                                                    } else {
                                                        var mos = "";
                                                    }
                                                    // console.log("mos----------->", mos);
                                                    // console.log("minStock mos", maxForMonths);
                                                    // console.log("maxStock mos", minForMonths);

                                                    mosArray.push(
                                                        {
                                                            mos: mos,
                                                            maxForMonths: minForMonths,
                                                            minForMonths: maxForMonths,
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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                    var regionId = -1;
                                                    var planningUnitId = planningUnitList[p].planningUnit.id;

                                                    var programPlanningUnit = planningUnitList[p];
                                                    var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
                                                    var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

                                                    var regionListFiltered = regionList;
                                                    // console.log("regionList----->", regionList);

                                                    var programJson = programList[pp];
                                                    // console.log("************ProgramJson***********", programJson);
                                                    var shelfLife = programPlanningUnit.shelfLife;
                                                    var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
                                                    var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

                                                    var consumptionQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = consumptionList.filter(c => (c.consumptionDate >= mStartDate && c.consumptionDate <= mEndDate) && c.region.id == regionListFiltered[reg].regionId);
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

                                                    var consumptionQtyForEB = consumptionQty;
                                                    // Calculations for AMC
                                                    var amcBeforeArray = [];
                                                    var amcAfterArray = [];
                                                    for (var c = 0; c < monthsInPastForAMC; c++) {
                                                        var month1MonthsBefore = moment(mStartDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1Before = moment(mEndDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
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
                                                            amcBeforeArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcBeforeArray;
                                                            if (amcArrayForMonth.length == monthsInPastForAMC) {
                                                                c = monthsInPastForAMC;
                                                            }
                                                        }

                                                    }

                                                    for (var c = 0; c < monthsInFutureForAMC; c++) {
                                                        var month1MonthsAfter = moment(mStartDate).add(c, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1After = moment(mEndDate).add(c, 'months').format("YYYY-MM-DD");
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
                                                            amcAfterArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcAfterArray;
                                                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                                                                c = monthsInFutureForAMC;
                                                            }
                                                        }

                                                    }
                                                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                                                    var amcArrayFilteredForMonth = amcArray;
                                                    var countAMC = amcArrayFilteredForMonth.length;
                                                    var sumOfConsumptions = 0;
                                                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                                    }
                                                    if (countAMC != 0) {
                                                        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);

                                                        // Calculations for Min stock
                                                        var maxForMonths = 0;
                                                        var realm = programJson.realmCountry.realm;
                                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                                        } else {
                                                            maxForMonths = minMonthsOfStock
                                                        }
                                                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));


                                                        // Calculations for Max Stock
                                                        var minForMonths = 0;
                                                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                                                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                                        } else {
                                                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                                                        }
                                                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                                                    } else {
                                                    }


                                                    // Inventory part
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                    if (regionId != -1) {
                                                        inventoryList = inventoryList.filter(c => c.region.id == regionId)
                                                    }
                                                    var adjustmentQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                        for (var j = 0; j < c.length; j++) {
                                                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                        }
                                                    }
                                                    var c1 = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region == null);
                                                    for (var j = 0; j < c1.length; j++) {
                                                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                    }

                                                    // Shipments updated part

                                                    // Shipments part
                                                    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= mStartDate && c.expectedDeliveryDate <= mEndDate))
                                                    var shipmentTotalQty = 0;
                                                    for (var j = 0; j < shipmentArr.length; j++) {
                                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                    }

                                                    // Calculations for exipred stock
                                                    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
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
                                                        // console.log("stockForBatchNumber===>", stockForBatchNumber);
                                                        var totalStockForBatchNumber = 0;
                                                        if (stockForBatchNumber != undefined) {
                                                            totalStockForBatchNumber = stockForBatchNumber.qty;
                                                        } else {

                                                        }

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
                                                    // console.log("MyArray", myArray);

                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(6, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).format("YYYY-MM-DD");
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var unallocatedConsumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    var qty = 0;
                                                                    if (c[j].batchInfoList.length > 0) {
                                                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                                            qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                                        }
                                                                    }
                                                                    var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
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

                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
                                                        // console.log("--------------------------------------------------------------");
                                                        // console.log("Start date", startDate);
                                                        var adjustmentQty = 0;
                                                        var unallocatedAdjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                if (unallocatedAdjustmentQty > 0) {
                                                                    if (batchDetailsForParticularPeriod.length > 0) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            if (unallocatedAdjustmentQty > 0) {
                                                                if (batchDetailsForParticularPeriod.length > 0) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                                                    unallocatedAdjustmentQty = 0;
                                                                }
                                                            }
                                                        }
                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                                            // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                                            // console.log("Unallocated consumption", unallocatedConsumptionQty);
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
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                                }

                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            if (unallocatedAdjustmentQty < 0) {
                                                                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            }
                                                        }

                                                    }

                                                    // console.log("My array after accounting all the calcuklations", myArray);
                                                    var expiredStockArr = myArray;

                                                    // Calculation of opening and closing balance
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(5, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).subtract(1, 'months').format("YYYY-MM-DD");
                                                    var openingBalance = 0;
                                                    var expiredStockQty = 0;
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                        // console.log("main consumption====>", consumptionQty);
                                                        // Inventory part
                                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                        var adjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                            for (var j = 0; j < c.length; j++) {
                                                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                        }
                                                        var adjustmentQtyForEB = adjustmentQty;

                                                        // Shipments part
                                                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                                        var shipmentTotalQty = 0;
                                                        for (var j = 0; j < shipmentArr.length; j++) {
                                                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                        }

                                                        var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(endDate).format("YYYY-MM-DD"))));
                                                        expiredStockQty = 0;
                                                        for (var j = 0; j < expiredStock.length; j++) {
                                                            expiredStockQty += parseInt((expiredStock[j].remainingQty));
                                                        }
                                                        // console.log("created date 0===>", createdDate);
                                                        // console.log("planning Unit====>", planningUnitId);
                                                        // console.log("$$$$$$ 1====>", openingBalance);
                                                        // console.log("$$$$$$ 2====>", shipmentTotalQty);
                                                        // console.log("$$$$$$ 3====>", adjustmentQty);
                                                        // console.log("$$$$$$ 4====>", consumptionQty);
                                                        // console.log("$$$$$$ 5====>", expiredStockQty)
                                                        var closingBalance = parseInt(openingBalance) + parseInt(shipmentTotalQty) + parseFloat(adjustmentQty) - parseInt(consumptionQty) - parseInt(expiredStockQty);
                                                        if (closingBalance < 0) {
                                                            closingBalance = 0;
                                                        }
                                                        // console.log("closing balance===>", closingBalance);
                                                        // console.log("amc cAlculated===>", amcCalcualted);
                                                        openingBalance = closingBalance;
                                                    }
                                                    // console.log("Total exipred stock", totalExpiredStockArr);
                                                    // Calculations for monthsOfStock
                                                    // console.log("closing balance===>", closingBalance, "AMC====>", amcCalcualted);
                                                    if (closingBalance != 0 && amcCalcualted != 0 && closingBalance != "" && amcCalcualted != "") {
                                                        var mos = parseFloat(closingBalance / amcCalcualted).toFixed(2);
                                                    } else {
                                                        var mos = "";
                                                    }
                                                    // console.log("mos----------->", mos);
                                                    // console.log("minStock mos", maxForMonths);
                                                    // console.log("maxStock mos", minForMonths);

                                                    mosArray.push(
                                                        {
                                                            mos: mos,
                                                            maxForMonths: minForMonths,
                                                            minForMonths: maxForMonths,
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
                                                                    id: regionList[r].regionId,
                                                                    label: regionList[r].label
                                                                },
                                                                planningUnit: {
                                                                    id: planningUnitList[p].planningUnit.id,
                                                                    label: planningUnitList[p].planningUnit.label,

                                                                },
                                                                shipmentId: '',
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                    var regionId = -1;
                                                    var planningUnitId = planningUnitList[p].planningUnit.id;

                                                    var programPlanningUnit = planningUnitList[p];
                                                    var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
                                                    var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

                                                    var regionListFiltered = regionList;
                                                    // console.log("regionList----->", regionList);

                                                    var programJson = programList[pp];
                                                    // console.log("************ProgramJson***********", programJson);
                                                    var shelfLife = programPlanningUnit.shelfLife;
                                                    var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
                                                    var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

                                                    var consumptionQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = consumptionList.filter(c => (c.consumptionDate >= mStartDate && c.consumptionDate <= mEndDate) && c.region.id == regionListFiltered[reg].regionId);
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

                                                    var consumptionQtyForEB = consumptionQty;
                                                    // Calculations for AMC
                                                    var amcBeforeArray = [];
                                                    var amcAfterArray = [];
                                                    for (var c = 0; c < monthsInPastForAMC; c++) {
                                                        var month1MonthsBefore = moment(mStartDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1Before = moment(mEndDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
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
                                                            amcBeforeArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcBeforeArray;
                                                            if (amcArrayForMonth.length == monthsInPastForAMC) {
                                                                c = monthsInPastForAMC;
                                                            }
                                                        }

                                                    }

                                                    for (var c = 0; c < monthsInFutureForAMC; c++) {
                                                        var month1MonthsAfter = moment(mStartDate).add(c, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1After = moment(mEndDate).add(c, 'months').format("YYYY-MM-DD");
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
                                                            amcAfterArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcAfterArray;
                                                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                                                                c = monthsInFutureForAMC;
                                                            }
                                                        }

                                                    }
                                                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                                                    var amcArrayFilteredForMonth = amcArray;
                                                    var countAMC = amcArrayFilteredForMonth.length;
                                                    var sumOfConsumptions = 0;
                                                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                                    }
                                                    if (countAMC != 0) {
                                                        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);

                                                        // Calculations for Min stock
                                                        var maxForMonths = 0;
                                                        var realm = programJson.realmCountry.realm;
                                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                                        } else {
                                                            maxForMonths = minMonthsOfStock
                                                        }
                                                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));


                                                        // Calculations for Max Stock
                                                        var minForMonths = 0;
                                                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                                                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                                        } else {
                                                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                                                        }
                                                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                                                    } else {
                                                    }


                                                    // Inventory part
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                    if (regionId != -1) {
                                                        inventoryList = inventoryList.filter(c => c.region.id == regionId)
                                                    }
                                                    var adjustmentQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                        for (var j = 0; j < c.length; j++) {
                                                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                        }
                                                    }
                                                    var c1 = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region == null);
                                                    for (var j = 0; j < c1.length; j++) {
                                                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                    }

                                                    // Shipments updated part

                                                    // Shipments part
                                                    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= mStartDate && c.expectedDeliveryDate <= mEndDate))
                                                    var shipmentTotalQty = 0;
                                                    for (var j = 0; j < shipmentArr.length; j++) {
                                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                    }

                                                    // Calculations for exipred stock
                                                    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
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
                                                        // var totalStockForBatchNumber = stockForBatchNumber.qty;

                                                        var totalStockForBatchNumber = 0;
                                                        if (stockForBatchNumber != undefined) {
                                                            totalStockForBatchNumber = stockForBatchNumber.qty;
                                                        } else {

                                                        }

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
                                                    // console.log("MyArray", myArray);

                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(6, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).format("YYYY-MM-DD");
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var unallocatedConsumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    var qty = 0;
                                                                    if (c[j].batchInfoList.length > 0) {
                                                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                                            qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                                        }
                                                                    }
                                                                    var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
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

                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
                                                        // console.log("--------------------------------------------------------------");
                                                        // console.log("Start date", startDate);
                                                        var adjustmentQty = 0;
                                                        var unallocatedAdjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                if (unallocatedAdjustmentQty > 0) {
                                                                    if (batchDetailsForParticularPeriod.length > 0) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            if (unallocatedAdjustmentQty > 0) {
                                                                if (batchDetailsForParticularPeriod.length > 0) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                                                    unallocatedAdjustmentQty = 0;
                                                                }
                                                            }
                                                        }
                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                                            // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                                            // console.log("Unallocated consumption", unallocatedConsumptionQty);
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
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                                }

                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            if (unallocatedAdjustmentQty < 0) {
                                                                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            }
                                                        }

                                                    }

                                                    // console.log("My array after accounting all the calcuklations", myArray);
                                                    var expiredStockArr = myArray;

                                                    // Calculation of opening and closing balance
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(5, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).subtract(1, 'months').format("YYYY-MM-DD");
                                                    var openingBalance = 0;
                                                    var expiredStockQty = 0;
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                        // console.log("main consumption====>", consumptionQty);
                                                        // Inventory part
                                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                        var adjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                            for (var j = 0; j < c.length; j++) {
                                                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                        }
                                                        var adjustmentQtyForEB = adjustmentQty;

                                                        // Shipments part
                                                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                                        var shipmentTotalQty = 0;
                                                        for (var j = 0; j < shipmentArr.length; j++) {
                                                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                        }

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

                                                    // Calculations for monthsOfStock
                                                    // console.log("closing balance===>", closingBalance, "AMC====>", amcCalcualted);
                                                    if (closingBalance != 0 && amcCalcualted != 0 && closingBalance != "" && amcCalcualted != "") {
                                                        var mos = parseFloat(closingBalance / amcCalcualted).toFixed(2);
                                                    } else {
                                                        var mos = "";
                                                    }
                                                    // console.log("mos----------->", mos);
                                                    // console.log("minStock mos", maxForMonths);
                                                    // console.log("maxStock mos", minForMonths);
                                                    mosArray.push(
                                                        {
                                                            mos: mos,
                                                            maxForMonths: minForMonths,
                                                            minForMonths: maxForMonths,
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
                                                                    id: regionList[r].regionId,
                                                                    label: regionList[r].label
                                                                },
                                                                planningUnit: {
                                                                    id: planningUnitList[p].planningUnit.id,
                                                                    label: planningUnitList[p].planningUnit.label,

                                                                },
                                                                shipmentId: '',
                                                                data5: '',

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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                    var regionId = -1;
                                                    var planningUnitId = planningUnitList[p].planningUnit.id;

                                                    var programPlanningUnit = planningUnitList[p];
                                                    var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
                                                    var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

                                                    var regionListFiltered = regionList;
                                                    // console.log("regionList----->", regionList);

                                                    var programJson = programList[pp];
                                                    // console.log("************ProgramJson***********", programJson);
                                                    var shelfLife = programPlanningUnit.shelfLife;
                                                    var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
                                                    var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

                                                    var consumptionQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = consumptionList.filter(c => (c.consumptionDate >= mStartDate && c.consumptionDate <= mEndDate) && c.region.id == regionListFiltered[reg].regionId);
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

                                                    var consumptionQtyForEB = consumptionQty;
                                                    // Calculations for AMC
                                                    var amcBeforeArray = [];
                                                    var amcAfterArray = [];
                                                    for (var c = 0; c < monthsInPastForAMC; c++) {
                                                        var month1MonthsBefore = moment(mStartDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1Before = moment(mEndDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
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
                                                            amcBeforeArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcBeforeArray;
                                                            if (amcArrayForMonth.length == monthsInPastForAMC) {
                                                                c = monthsInPastForAMC;
                                                            }
                                                        }

                                                    }

                                                    for (var c = 0; c < monthsInFutureForAMC; c++) {
                                                        var month1MonthsAfter = moment(mStartDate).add(c, 'months').format("YYYY-MM-DD");
                                                        var currentMonth1After = moment(mEndDate).add(c, 'months').format("YYYY-MM-DD");
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
                                                            amcAfterArray.push({ consumptionQty: consumptionQty });
                                                            var amcArrayForMonth = amcAfterArray;
                                                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                                                                c = monthsInFutureForAMC;
                                                            }
                                                        }

                                                    }
                                                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                                                    var amcArrayFilteredForMonth = amcArray;
                                                    var countAMC = amcArrayFilteredForMonth.length;
                                                    var sumOfConsumptions = 0;
                                                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                                    }
                                                    if (countAMC != 0) {
                                                        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);

                                                        // Calculations for Min stock
                                                        var maxForMonths = 0;
                                                        var realm = programJson.realmCountry.realm;
                                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                                        } else {
                                                            maxForMonths = minMonthsOfStock
                                                        }
                                                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));


                                                        // Calculations for Max Stock
                                                        var minForMonths = 0;
                                                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                                                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                                        } else {
                                                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                                                        }
                                                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                                                    } else {
                                                    }


                                                    // Inventory part
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                    if (regionId != -1) {
                                                        inventoryList = inventoryList.filter(c => c.region.id == regionId)
                                                    }
                                                    var adjustmentQty = 0;
                                                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                        var c = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                        for (var j = 0; j < c.length; j++) {
                                                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                        }
                                                    }
                                                    var c1 = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region == null);
                                                    for (var j = 0; j < c1.length; j++) {
                                                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                    }

                                                    // Shipments updated part

                                                    // Shipments part
                                                    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= mStartDate && c.expectedDeliveryDate <= mEndDate))
                                                    var shipmentTotalQty = 0;
                                                    for (var j = 0; j < shipmentArr.length; j++) {
                                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                    }

                                                    // Calculations for exipred stock
                                                    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
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
                                                        // var totalStockForBatchNumber = stockForBatchNumber.qty;

                                                        var totalStockForBatchNumber = 0;
                                                        if (stockForBatchNumber != undefined) {
                                                            totalStockForBatchNumber = stockForBatchNumber.qty;
                                                        } else {

                                                        }

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
                                                    // console.log("MyArray", myArray);

                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(6, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).format("YYYY-MM-DD");
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var unallocatedConsumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    var qty = 0;
                                                                    if (c[j].batchInfoList.length > 0) {
                                                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                                            qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                                        }
                                                                    }
                                                                    var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
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

                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
                                                        // console.log("--------------------------------------------------------------");
                                                        // console.log("Start date", startDate);
                                                        var adjustmentQty = 0;
                                                        var unallocatedAdjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                if (unallocatedAdjustmentQty > 0) {
                                                                    if (batchDetailsForParticularPeriod.length > 0) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            if (unallocatedAdjustmentQty > 0) {
                                                                if (batchDetailsForParticularPeriod.length > 0) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                                                    unallocatedAdjustmentQty = 0;
                                                                }
                                                            }
                                                        }
                                                        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                                            // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                                            // console.log("Unallocated consumption", unallocatedConsumptionQty);
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
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
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
                                                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                                }

                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                            if (unallocatedAdjustmentQty < 0) {
                                                                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                                                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
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
                                                            }
                                                        }

                                                    }

                                                    // console.log("My array after accounting all the calcuklations", myArray);
                                                    var expiredStockArr = myArray;

                                                    // Calculation of opening and closing balance
                                                    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                                    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
                                                    // var curDate = moment(mEndDate).add(5, 'months').format("YYYY-MM-DD");
                                                    var curDate = moment(mEndDate).subtract(1, 'months').format("YYYY-MM-DD");
                                                    var openingBalance = 0;
                                                    var expiredStockQty = 0;
                                                    for (var i = 0; createdDate < curDate; i++) {
                                                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                                        var consumptionQty = 0;
                                                        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                                        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
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
                                                        // console.log("main consumption====>", consumptionQty);
                                                        // Inventory part
                                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                                                        var adjustmentQty = 0;
                                                        for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                                            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
                                                            for (var j = 0; j < c.length; j++) {
                                                                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                                            }
                                                        }
                                                        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                                                        for (var j = 0; j < c1.length; j++) {
                                                            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                                        }
                                                        var adjustmentQtyForEB = adjustmentQty;

                                                        // Shipments part
                                                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                                        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                                        var shipmentTotalQty = 0;
                                                        for (var j = 0; j < shipmentArr.length; j++) {
                                                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                                        }

                                                        var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(endDate).format("YYYY-MM-DD"))));
                                                        expiredStockQty = 0;
                                                        for (var j = 0; j < expiredStock.length; j++) {
                                                            expiredStockQty += parseInt((expiredStock[j].remainingQty));
                                                        }
                                                        // console.log("created date 0===>", createdDate);
                                                        // console.log("planning Unit====>", planningUnitId);
                                                        // console.log("$$$$$$ 1====>", openingBalance);
                                                        // console.log("$$$$$$ 2====>", shipmentTotalQty);
                                                        // console.log("$$$$$$ 3====>", adjustmentQty);
                                                        // console.log("$$$$$$ 4====>", consumptionQty);
                                                        // console.log("$$$$$$ 5====>", expiredStockQty)
                                                        var closingBalance = parseInt(openingBalance) + parseInt(shipmentTotalQty) + parseFloat(adjustmentQty) - parseInt(consumptionQty) - parseInt(expiredStockQty);
                                                        if (closingBalance < 0) {
                                                            closingBalance = 0;
                                                        }
                                                        // console.log("closing balance===>", closingBalance);
                                                        // console.log("amc cAlculated===>", amcCalcualted);
                                                        openingBalance = closingBalance;
                                                    }
                                                    // console.log("Total exipred stock", totalExpiredStockArr);
                                                    // Calculations for monthsOfStock
                                                    // console.log("closing balance===>", closingBalance, "AMC====>", amcCalcualted);
                                                    if (closingBalance != 0 && amcCalcualted != 0 && closingBalance != "" && amcCalcualted != "") {
                                                        var mos = parseFloat(closingBalance / amcCalcualted).toFixed(2);
                                                    } else {
                                                        var mos = "";
                                                    }
                                                    // console.log("mos----------->", mos);
                                                    // console.log("minStock mos", maxForMonths);
                                                    // console.log("maxStock mos", minForMonths);

                                                    mosArray.push(
                                                        {
                                                            mos: mos,
                                                            maxForMonths: minForMonths,
                                                            minForMonths: maxForMonths,
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
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                                lastModifiedBy: {
                                                                    userId: userId,
                                                                    username: username
                                                                },
                                                                lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                            lastModifiedBy: {
                                                                userId: userId,
                                                                username: username
                                                            },
                                                            lastModifiedDate: moment(Date.now()).format("YYYY-MM-DD"),
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
                                                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                                            createdDate: moment(Date.now()).format("YYYY-MM-DD")
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
                                }.bind(this);
                                putRequest.onsuccess = function (event) {
                                    // this.setState({executionStatus:1});
                                    // return executionStatus;
                                    this.props.updateState(false);

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