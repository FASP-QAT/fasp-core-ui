import { getDatabase } from "../CommonComponent/IndexedDbFunctions";
import AuthenticationService from '../views/Common/AuthenticationService';
import i18n from '../i18n';

import { SECRET_KEY } from '../Constants.js';
import CryptoJS from 'crypto-js';
import moment, { months } from 'moment';
import { date } from "yup";

export function qatProblemActions() {
    var problemActionList = [];
    var db1;
    var storeOS;
    getDatabase();
    var openRequest = indexedDB.open('fasp', 1);
    openRequest.onsuccess = function (e) {
        var realmId = AuthenticationService.getRealmId();
        // console.log("QPA 1====>", realmId);
        var programList = [];
        var programRequestList = [];

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
            var latestVersionProgramList = [];
            for (var i = 0; i < getRequest.result.length; i++) {
                // console.log("QPA 2=====>  in for");
                var programDataBytes = CryptoJS.AES.decrypt(getRequest.result[i].programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                console.log("QPA 2====>", programJson);
                programList.push(programJson);
                programRequestList.push(getRequest.result[i]);
            }
            // if (realmId == -1) {
            //     programList = programList;
            // } else {
            //     programList = programList.filter(c => c.realmCountry.realm.realmId == realmId);
            // }

            for (var d = 0; d < programList.length; d++) {
                var index = latestVersionProgramList.findIndex(c => c.programId == programList[d].programId);
                if (index == -1) {
                    latestVersionProgramList.push(programList[d]);
                } else {
                    var versionId = latestVersionProgramList[index].currentVersion.versionId;
                    if (versionId < programList[d].currentVersion.versionId) {
                        latestVersionProgramList[index] = programList[d];
                    }
                }

            }
            programList = latestVersionProgramList;
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

                    problemList = problemRequest.result;
                    if (realmId == -1) {
                        problemList = problemList;
                    } else {
                        problemList = problemList.filter(c => c.realm.id == realmId);
                    }
                    console.log("realmId----", realmId);
                    console.log("+++++++++++++problemList", problemList);
                    // console.log("QPA 4====>", "hi-----")
                    var planningUnitResult = [];
                    planningUnitResult = planningunitRequest.result;
                    // console.log("QPA 5====>", planningUnitResult);
                    for (var pp = 0; pp < programList.length; pp++) {

                        problemActionList = programList[pp].problemReportList;
                        console.log("problemActionreport=======>", problemActionList);

                        var regionList = programList[pp].regionList;
                        // console.log("QPA 6====>", regionList)
                        planningUnitList = planningUnitResult.filter(c => c.program.id == programList[pp].programId);
                        // console.log("QPA 7====>", planningUnitList);
                        for (var r = 0; r < regionList.length; r++) {
                            // console.log("QAP===>8");
                            for (var p = 0; p < planningUnitList.length; p++) {
                                for (var prob = 0; prob < problemList.length; prob++) {
                                    // problem conditions start from here ====================
                                    if (problemList[prob].problemId == 1) {
                                        // // 1 consumption=================

                                        var consumptionList = programList[pp].consumptionList;
                                        consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                        // // console.log("QAP 9====>", consumptionList);
                                        var numberOfMonths = parseInt(problemList[prob].data1);
                                        for (var m = 1; m <= numberOfMonths; m++) {
                                            var myDate = moment(Date.now()).subtract(m, 'months').startOf('month').format("YYYY-MM-DD");
                                            // // console.log("QAP 10====>", myDate);

                                            var filteredConsumptionList = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') == myDate && c.actualFlag.toString() == "true");
                                            var index = problemActionList.findIndex(
                                                c => moment(c.dt).format("YYYY-MM") == moment(myDate).format("YYYY-MM")
                                                    && c.region.id == regionList[r].regionId
                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                    && c.program.id == programList[pp].programId
                                                    && c.realmProblem.problem.problemId == 1);

                                            if (filteredConsumptionList.length == 0) {
                                                if (index == -1) {
                                                    var json = {
                                                        problemReportId: 0,
                                                        program: {
                                                            id: programList[pp].programId,
                                                            label: programList[pp].label
                                                        },
                                                        versionId: programList[pp].currentVersion.versionId,
                                                        realmProblem: problemList[prob],

                                                        dt: myDate,
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
                                                            userId: 1,
                                                            username: "anchal"
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                        lastModifiedBy: {
                                                            userId: 1,
                                                            username: "anchal"
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
                                                                    userId: 1,
                                                                    username: "anchal"
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                                            }
                                                        ]
                                                    }
                                                    problemActionList.push(json);
                                                } else {
                                                    // problemActionList[index].isFound = 1;
                                                }

                                            } else {
                                                if (index != -1) {
                                                    // problemActionList[index].isFound = 0;
                                                }
                                            }
                                        }

                                        // console.log("QAP 11====>", problemActionList);
                                        // 1 consumption end =================
                                    }


                                    if (problemList[prob].problemId == 2) {
                                        //2 inventory  ====================
                                        var inventoryList = programList[pp].inventoryList;
                                        inventoryList = inventoryList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);

                                        // // console.log("QAP 12====>", inventoryList);
                                        var numberOfMonthsInventory = parseInt(problemList[prob].data1);

                                        for (var mi = 1; mi <= numberOfMonthsInventory; mi++) {
                                            var myDateInventory = moment(Date.now()).subtract(mi, 'months').startOf('month').format("YYYY-MM-DD");
                                            //     // console.log("QAP 13====>", myDateInventory);
                                            var filterInventoryList = inventoryList.filter(c => moment(c.inventoryDate).format('YYYY-MM-DD') == myDateInventory);
                                            var index = problemActionList.findIndex(
                                                c => moment(c.dt).format("YYYY-MM") == moment(myDateInventory).format("YYYY-MM")
                                                    && c.region.id == regionList[r].regionId
                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                    && c.program.id == programList[pp].programId
                                                    && c.realmProblem.problem.problemId == 2);

                                            if (filterInventoryList.length == 0) {
                                                if (index == -1) {
                                                    var json = {
                                                        problemReportId: 0,
                                                        program: {
                                                            id: programList[pp].programId,
                                                            label: programList[pp].label
                                                        },
                                                        versionId: programList[pp].currentVersion.versionId,
                                                        realmProblem: problemList[prob],

                                                        dt: myDateInventory,
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
                                                            userId: 1,
                                                            username: "anchal"
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                        lastModifiedBy: {
                                                            userId: 1,
                                                            username: "anchal"
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
                                                                    userId: 1,
                                                                    username: "anchal"
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                                            }
                                                        ]

                                                    }
                                                    problemActionList.push(json);
                                                } else {
                                                    // problemActionList[index].isFound = 1;
                                                }
                                            } else {
                                                if (index != -1) {
                                                    // problemActionList[index].isFound = 0;
                                                }
                                            }
                                        }
                                        // console.log("QAP 14====>", problemActionList);
                                        // 2 inventory end=================
                                    }

                                    if (problemList[prob].problemId == 3) {
                                        // 3 shipment which have delivered date in past but status is not yet delivered
                                        // var shipmentList = programList[pp].shipmentList;
                                        // shipmentList = shipmentList.filter(c => c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                        // console.log("shipment list ====>", shipmentList);
                                        // var myDateShipment = moment(Date.now()).format("YYYY-MM-DD");
                                        // console.log("shipment date =====>", myDateShipment);
                                        // var filteredShipmentList = shipmentList.filter(c => moment(c.expectedDeliveryDate).format('YYYY-MM-DD') < myDateShipment && c.shipmentStatus.id != 7);
                                        // console.log("filteredShipmentList ====>", filteredShipmentList);

                                        // var indexShipment = problemActionList.findIndex(
                                        //     c => c.month == myDateShipment
                                        //         && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                        //         && c.program.programId == programList[pp].programId
                                        //         && c.problemId == 3);

                                        // if (filteredShipmentList.length > 0) {
                                        //     if (indexShipment == -1) {
                                        //         var json = {
                                        //             program: programList[pp],
                                        //             versionId: programList[pp].currentVersion.versionId,
                                        //             region: '',
                                        //             planningUnit: planningUnitList[p].planningUnit,

                                        //             problemId: 3,
                                        //             month: myDateShipment,
                                        //             isFound: 1,
                                        //             problemStatus: {
                                        //                 id: 1,
                                        //                 label: { label_en: 'Open' }
                                        //             },
                                        //             note: '',

                                        //             actionName: {
                                        //                 label: {
                                        //                     label_en: 'Please check to make sure this shipment was received, and update either the receive date or the shipment status.'
                                        //                 }
                                        //             },
                                        //             actionUrl: '/shipment/shipmentDetails',

                                        //             criticality: {
                                        //                 id: '3',
                                        //                 color: 'ff3333',
                                        //                 label: {
                                        //                     label_en: 'High'
                                        //                 }
                                        //             },
                                        //             problemType: {
                                        //                 id: 1,
                                        //                 label: {
                                        //                     label_en: 'Automatic'
                                        //                 }
                                        //             }


                                        //         }
                                        //         problemActionList.push(json);
                                        //     } else {
                                        //         problemActionList[indexShipment].isFound = 1;
                                        //     }
                                        // } else {
                                        //     if (indexShipment != -1) {
                                        //         problemActionList[indexShipment].isFound = 0;
                                        //     }
                                        // }

                                        // console.log("QAP 15====>", problemActionList);
                                        // End  3 shipment which have delivered date in past but status is not yet delivered
                                    }

                                    if (problemList[prob].problemId == 8) {
                                        // 4 no forecasted consumption for future 18 months
                                        var consumptionList = programList[pp].consumptionList;
                                        consumptionList = consumptionList.filter(c => c.region.id == regionList[r].regionId && c.planningUnit.id == planningUnitList[p].planningUnit.id);
                                        // console.log("QAP 9====>", consumptionList);
                                        var numberOfMonthsInFunture = problemList[prob].data1;
                                        for (var m = 1; m <= numberOfMonthsInFunture; m++) {
                                            var myDateFuture = moment(Date.now()).add(m, 'months').startOf('month').format("YYYY-MM-DD");
                                            // console.log("date====>", myDateFuture);
                                            var filteredConsumptionListTwo = consumptionList.filter(c => moment(c.consumptionDate).format('YYYY-MM-DD') == myDateFuture && c.actualFlag.toString() == "false");
                                            var index = problemActionList.findIndex(
                                                c => moment(c.dt).format("YYYY-MM") == moment(myDateFuture).format("YYYY-MM")
                                                    && c.region.id == regionList[r].regionId
                                                    && c.planningUnit.id == planningUnitList[p].planningUnit.id
                                                    && c.program.id == programList[pp].programId
                                                    && c.realmProblem.problem.problemId == 8);

                                            if (filteredConsumptionListTwo.length == 0) {
                                                if (index == -1) {
                                                    var json = {
                                                        problemReportId: 0,
                                                        program: {
                                                            id: programList[pp].programId,
                                                            label: programList[pp].label
                                                        },
                                                        versionId: programList[pp].currentVersion.versionId,
                                                        realmProblem: problemList[prob],

                                                        dt: myDateFuture,
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
                                                            userId: 1,
                                                            username: "anchal"
                                                        },
                                                        createdDate: moment(Date.now()).format("YYYY-MM-DD"),
                                                        lastModifiedBy: {
                                                            userId: 1,
                                                            username: "anchal"
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
                                                                    userId: 1,
                                                                    username: "anchal"
                                                                },
                                                                createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                                            }
                                                        ]
                                                    }
                                                    problemActionList.push(json);
                                                } else {
                                                    // problemActionList[index].isFound = 1;
                                                }

                                            } else {
                                                if (index != -1) {
                                                    // problemActionList[index].isFound = 0;
                                                }
                                            }
                                        }
                                    }
                                    // end 4 no forecasted consumption for future 18 months
                                    // problem conditions  end here ====================
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
                        }.bind(this);
                    }
                    console.log("final problemList=====>", problemActionList);

                }.bind(this);
            }.bind(this);
        }.bind(this);
    }.bind(this)

    // return problemActionList;
}