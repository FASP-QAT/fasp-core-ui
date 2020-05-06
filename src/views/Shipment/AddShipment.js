import React from "react";
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
// import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";
import * as JsStoreFunctions from "../../CommonComponent/JsStoreFunctions.js";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, InputGroupAddon
    , FormFeedback, Row
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';

export default class ConsumptionDetails extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            shipmentStatusList: [],
            message: '',
        }

        // this.getConsumptionData = this.getConsumptionData.bind(this);
        this.saveData = this.saveData.bind(this)
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    componentDidMount = function () {
        document.getElementById("addButton").style.display = "none";

        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programJson = {
                            name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList[i] = programJson
                    }
                }
                this.setState({
                    programList: proList
                })

            }.bind(this);

            // For Shipment Status
            var shipStatusList = [];
            shipStatusList[0] = { id: 1, name: "Suggested" };
            shipStatusList[1] = { id: 2, name: "Planned" };
            shipStatusList[2] = { id: 3, name: "Cancelled" };
            shipStatusList[3] = { id: 4, name: "Submitted" };
            shipStatusList[4] = { id: 5, name: "Approved" };
            shipStatusList[5] = { id: 6, name: "Shipped" };
            shipStatusList[6] = { id: 7, name: "Arrived" };
            shipStatusList[7] = { id: 8, name: "Delivered" };

            this.setState({
                shipmentStatusList: shipStatusList
            })

        }.bind(this)


    };

    formSubmit() {
        var programId = document.getElementById("programId").value;
        var shipmentStatusId = document.getElementById('shipmentId').value;
        this.setState({ programId: programId });
        this.setState({ shipmentStatusId: shipmentStatusId });

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);

        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);

            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var sel = document.getElementById("planningUnitId");
                var planningUnitText = sel.options[sel.selectedIndex].text;


                if (shipmentStatusId != 0) {

                    // var dataSourceResult = [];
                    // dataSourceResult = dataSourceRequest.result;
                    // for (var k = 0; k < dataSourceResult.length; k++) {
                    //     if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                    //         if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                    //             var dataSourceJson = {
                    //                 name: dataSourceResult[k].label.label_en,
                    //                 id: dataSourceResult[k].dataSourceId
                    //             }
                    //             dataSourceList[k] = dataSourceJson
                    //         }
                    //     }
                    // }
                    programId = (document.getElementById("programId").value).split("_")[0];

                    var programTransaction1 = db1.transaction(['program'], 'readwrite');
                    var programOs1 = programTransaction1.objectStore('program');
                    var programRequest1 = programOs1.getAll();
                    if (shipmentStatusId == 1) {

                        document.getElementById("addButton").style.display = "block";

                        programRequest1.onsuccess = function (event) {
                            var expectedDeliveryInDays = 0;
                            var programResult = [];
                            programResult = programRequest1.result;

                            for (var k = 0; k < programResult.length; k++) {
                                if (programResult[k].programId == programId) {
                                    expectedDeliveryInDays = parseInt(programResult[k].plannedToDraftLeadTime) + parseInt(programResult[k].draftToSubmittedLeadTime) + parseInt(programResult[k].submittedToApprovedLeadTime) + parseInt(programResult[k].approvedToShippedLeadTime) + parseInt(programResult[k].deliveredToReceivedLeadTime);
                                }
                            }

                            var expectedDeliveryDate = this.addDays(new Date(), expectedDeliveryInDays);

                            // Get inventory data from program
                            var plannigUnitId = document.getElementById("planningUnitId").value;
                            // var shipmentList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId);
                            var shipmentList = '';
                            this.setState({
                                shipmentList: shipmentList
                            });

                            var data = [];
                            var shipmentDataArr = []
                            if (shipmentList.length == 0) {
                                data = [];
                                shipmentDataArr[0] = data;
                            }
                            // for (var j = 0; j < shipmentList.length; j++) {
                            //     data = [];
                            //     data[0] = shipmentList[j].dataSource.id;
                            //     data[1] = shipmentList[j].region.id;
                            //     data[2] = shipmentList[j].consumptionQty;
                            //     data[3] = shipmentList[j].dayOfStockOut;
                            //     data[4] = shipmentList[j].startDate;
                            //     data[5] = shipmentList[j].stopDate;
                            //     data[6] = shipmentList[j].actualFlag;

                            //     shipmentDataArr[j] = data;
                            // }

                            data = [];
                            data[0] = '';
                            data[1] = expectedDeliveryDate;
                            data[2] = '01-SUGGESTED';
                            data[3] = planningUnitText;
                            data[4] = '44,773';
                            data[5] = '';
                            data[6] = '';

                            shipmentDataArr[0] = data;

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = shipmentDataArr;
                            // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                            // json[0] = data;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [150, 150, 150, 150, 150, 150, 150],
                                columns: [
                                    // { title: 'Month', type: 'text', readOnly: true },
                                    {
                                        title: 'Qat Order No',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Expected Delivery date',
                                        // type: 'calendar',
                                        type: 'text',
                                        readOnly: true

                                    },
                                    {
                                        title: 'Shipment Status',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Planning Unit',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Suggested Order Qty',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Order Qty',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Notes',
                                        type: 'text'
                                    }

                                ],
                                pagination: 10,
                                search: true,
                                columnSorting: true,
                                tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                onchange: this.changed,
                                oneditionend: this.onedit,
                                copyCompatibility: true,
                                paginationOptions: [10, 25, 50, 100],
                                position: 'top'
                            };

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), options);
                        }.bind(this)
                    }
                    if (shipmentStatusId == 2) {

                        document.getElementById("addButton").style.display = "none";
                        programRequest1.onsuccess = function (event) {

                            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
                            var procurementAgentRequest = procurementAgentOs.getAll();

                            procurementAgentRequest.onsuccess = function (event) {
                                var procurementAgentResult = [];
                                procurementAgentResult = procurementAgentRequest.result;
                                for (var k = 0; k < procurementAgentResult.length; k++) {
                                    var procurementAgentJson = {
                                        name: procurementAgentResult[k].label.label_en,
                                        id: procurementAgentResult[k].procurementAgentId
                                    }
                                    procurementAgentList[k] = procurementAgentJson
                                }


                                var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                var fundingSourceOs = fundingSourceTransaction.objectStore('fundingSource');
                                var fundingSourceRequest = fundingSourceOs.getAll();

                                fundingSourceRequest.onsuccess = function (event) {
                                    var fundingSourceResult = [];
                                    fundingSourceResult = fundingSourceRequest.result;
                                    for (var k = 0; k < fundingSourceResult.length; k++) {
                                        var fundingSourceJson = {
                                            name: fundingSourceResult[k].label.label_en,
                                            id: fundingSourceResult[k].fundingSourceId
                                        }
                                        fundingSourceList[k] = fundingSourceJson
                                    }


                                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                    var budgetOs = budgetTransaction.objectStore('budget');
                                    var budgetRequest = budgetOs.getAll();

                                    budgetRequest.onsuccess = function (event) {
                                        var budgetResult = [];
                                        budgetResult = budgetRequest.result;
                                        for (var k = 0; k < budgetResult.length; k++) {
                                            var budgetJson = {
                                                name: budgetResult[k].label.label_en,
                                                id: budgetResult[k].budgetId
                                            }
                                            budgetList[k] = budgetJson
                                        }

                                        console.log("fundingSourceList-----",fundingSourceList)
                                        console.log("budgetList---------",budgetList);
                                        console.log("procurementAgentList",procurementAgentList);









                                        // var shipmentList = (programJson.shipmentList);
                                        var shipmentList = '';

                                        this.setState({
                                            shipmentList: shipmentList
                                        });

                                        var data = [];
                                        var shipmentDataArr = []
                                        if (shipmentList.length == 0) {
                                            data = [];
                                            shipmentDataArr[0] = data;
                                        }

                                        // for (var j = 0; j < shipmentList.length; j++) {
                                        //     if (shipmentList[j].shipmentId == 0 && shipmentList[j].shipmentStatusId == 1) {
                                        //         data = [];
                                        //         data[0] = shipmentList[j].dataSource.id;
                                        //         data[1] = shipmentList[j].region.id;
                                        //         data[2] = shipmentList[j].consumptionQty;
                                        //         data[3] = shipmentList[j].dayOfStockOut;
                                        //         data[4] = shipmentList[j].startDate;
                                        //         data[5] = shipmentList[j].stopDate;
                                        //         data[6] = shipmentList[j].actualFlag;
                                        //     }

                                        //     shipmentDataArr[j] = data;
                                        // }

                                        data = [];
                                        data[0] = 0;
                                        data[1] = '10-09-2020';
                                        data[2] = '01-SUGGESTED';
                                        data[3] = '';
                                        data[4] = '';
                                        data[5] = '';
                                        data[6] = planningUnitText;
                                        data[7] = '44,773';
                                        data[8] = '45,000'; //moq
                                        data[9] = '30.00';
                                        data[10] = '1.50';
                                        data[11] = '';
                                        data[12] = '';
                                        data[13] = '';
                                        data[14] = '60,000 ';
                                        data[15] = '40.00';
                                        data[16] = '2.00';
                                        data[17] = '$8.73';
                                        data[18] = '$7.83';
                                        data[19] = '$469,800.00';
                                        data[20] = '';

                                        shipmentDataArr[0] = data;

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                        this.el.destroy();
                                        var json = [];
                                        var data = shipmentDataArr;
                                        // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                        // json[0] = data;
                                        var options = {
                                            data: data,
                                            columnDrag: true,
                                            colWidths: [100, 100, 100, 100, 100, 100, 100,100, 100, 100, 100, 100, 100, 100,100, 100, 100, 100, 100, 100, 100],
                                            columns: [
                                                // { title: 'Month', type: 'text', readOnly: true },
                                                {
                                                    title: 'Qat Order No',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Expected Delivery date',
                                                    // type: 'calendar',
                                                    type: 'text',
                                                    readOnly: true

                                                },
                                                {
                                                    title: 'Shipment Status',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Procurement Agent',
                                                    type: 'dropdown',
                                                    source: procurementAgentList,
                                                },
                                                {
                                                    title: 'Funding Source',
                                                    type: 'dropdown',
                                                    source: fundingSourceList,
                                                },
                                                {
                                                    title: 'Budget',
                                                    type: 'dropdown',
                                                    source: budgetList,
                                                },
                                                {
                                                    title: 'Planning Unit',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Suggested Order Qty',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'MoQ',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'No of Pallets',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'No of Containers',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Order based on',
                                                    type: 'dropdown',
                                                    source:[{id:1,name:'Container'},{id:2,name:'Suggested Order Qty'},{id:3,name:'MoQ'},{id:4,name:'Pallet'}]
                                                    
                                                },
                                                {
                                                    title: 'Rounding option',
                                                    type: 'dropdown',
                                                    source:[{id:1,name:'Round Up'},{id:2,name:'Round Down'}]
                                                },
                                                {
                                                    title: 'User Qty',
                                                    type: 'text',
                                                },
                                                {
                                                    title: 'Adjusted Order Qty',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Pallets',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Containers',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Manual Price per Planning Unit',
                                                    type: 'text',
                                                },
                                                {
                                                    title: 'Price per Planning Unit',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Amt',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Notes',
                                                    type: 'text'
                                                }

                                            ],
                                            pagination: 10,
                                            search: true,
                                            columnSorting: true,
                                            tableOverflow: true,
                                            wordWrap: true,
                                            allowInsertColumn: false,
                                            allowManualInsertColumn: false,
                                            allowDeleteRow: false,
                                            onchange: this.changed,
                                            oneditionend: this.onedit,
                                            copyCompatibility: true,
                                            paginationOptions: [10, 25, 50, 100],
                                            position: 'top'
                                        };

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);


                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }
                } else {
                    document.getElementById("addButton").style.display = "none";
                    this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                    this.el.destroy();

                    this.setState({
                        message: 'Please Select Shipment Status'
                    })
                }
            }.bind(this)
        }.bind(this)
    }


    addRow = function () {
        // document.getElementById("saveButtonDiv").style.display = "block";

        var programId = document.getElementById("programId").value;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            programId = (document.getElementById("programId").value).split("_")[0];
            var programTransaction1 = db1.transaction(['program'], 'readwrite');
            var programOs1 = programTransaction1.objectStore('program');
            var programRequest1 = programOs1.getAll();

            programRequest1.onsuccess = function (event) {

                var expectedDeliveryInDays = 0;
                var programResult = [];
                programResult = programRequest1.result;

                for (var k = 0; k < programResult.length; k++) {
                    if (programResult[k].programId == programId) {
                        expectedDeliveryInDays = parseInt(programResult[k].plannedToDraftLeadTime) + parseInt(programResult[k].draftToSubmittedLeadTime) + parseInt(programResult[k].submittedToApprovedLeadTime) + parseInt(programResult[k].approvedToShippedLeadTime) + parseInt(programResult[k].deliveredToReceivedLeadTime);
                    }
                }

                var expectedDeliveryDate = this.addDays(new Date(), expectedDeliveryInDays);
                var sel = document.getElementById("planningUnitId");
                var planningUnitText = sel.options[sel.selectedIndex].text;

                var data = [];
                data[0] = '';
                data[1] = expectedDeliveryDate;
                data[2] = '01-SUGGESTED';
                data[3] = planningUnitText;
                data[4] = '';
                data[5] = '';
                data[6] = '';
                this.el.insertRow(
                    data
                );




            }.bind(this)
        }.bind(this)


    };

    addDays = function (theDate, days) {
        var someDate = new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
        var dd = someDate.getDate();
        var mm = someDate.getMonth() + 1;
        var y = someDate.getFullYear();
        var someFormattedDate = dd + '-' + mm + '-' + y;
        return someFormattedDate;
    }.bind(this)

    saveData = function () {

        var validation = this.checkValidation();
        if (validation == true) {
            this.setState(
                {
                    changedFlag: 0
                }
            );
            console.log("all good...", this.el.getJson());
            var tableJson = this.el.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['shipment'], 'readwrite');
                var shipmentTransaction1 = transaction.objectStore('shipment');

                // var programId = (document.getElementById("programId").value);

                var shipmentRequest1 = shipmentTransaction1.get();
                shipmentRequest1.onsuccess = function (event) {

                    var shipmentDataToStore = [];
                    var shipmentJson = {
                        shipmentList: []
                    };

                    var shipmentDataBytes = CryptoJS.AES.decrypt((shipmentRequest1.result).shipment, SECRET_KEY);
                    var shipmentData = shipmentDataBytes.toString(CryptoJS.enc.Utf8);
                    // var programJson = JSON.parse(programData);
                    // var plannigUnitId = document.getElementById("planningUnitId").value;

                    // var consumptionDataList = (programJson.consumptionList).filter(c => c.planningUnit.id == plannigUnitId);
                    // var consumptionDataListNotFiltered = programJson.consumptionList;


                    // var count = 0;
                    // for (var i = 0; i < consumptionDataListNotFiltered.length; i++) {
                    //     if (consumptionDataList[count] != undefined) {
                    //         if (consumptionDataList[count].consumptionId == consumptionDataListNotFiltered[i].consumptionId) {

                    //             var map = new Map(Object.entries(tableJson[count]))
                    //             consumptionDataListNotFiltered[i].dataSource.id = map.get("0");
                    //             consumptionDataListNotFiltered[i].region.id = map.get("1");
                    //             consumptionDataListNotFiltered[i].consumptionQty = map.get("2");
                    //             consumptionDataListNotFiltered[i].dayOfStockOut = parseInt(map.get("3"));
                    //             consumptionDataListNotFiltered[i].startDate = map.get("4");
                    //             consumptionDataListNotFiltered[i].stopDate = map.get("5");
                    //             consumptionDataListNotFiltered[i].actualFlag = map.get("6");
                    //             consumptionDataListNotFiltered[i].active = map.get("7");

                    //             if (consumptionDataList.length >= count) {
                    //                 count++;
                    //             }
                    //         }

                    //     }

                    // }

                    for (var i = 0; i < tableJson.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]))
                        var json = {
                            shipmentId: '',
                            expectedDeliveryDate: map.get("1"),
                            shipmentStatus: {
                                id: 1
                            },
                            program: {
                                id: (document.getElementById("programId").value).split("_")[0]
                            },
                            planningUnit: {
                                id: document.getElementById("planningUnitId")
                            },
                            notes: map.get("6")

                        }

                        shipmentDataToStore.push(json);
                    }
                    console.log("1111111111111111111   ", shipmentDataToStore)
                    shipmentJson.shipmentList = shipmentDataToStore;
                    // programJson.consumptionList = consumptionDataListNotFiltered;
                    shipmentRequest1.result.shipment = (CryptoJS.AES.encrypt(JSON.stringify(shipmentJson), SECRET_KEY)).toString();
                    var putRequest = shipmentTransaction1.put(shipmentRequest1.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        // $("#saveButtonDiv").hide();
                        this.setState({
                            message: `Shipment Data Saved`,
                            changedFlag: 0
                        })
                        this.props.history.push(`/dashboard/` + "Shipment Data Added Successfully")
                    }.bind(this)
                }.bind(this)
            }.bind(this)


        } else {
            console.log("some thing get wrong...");
        }

    }.bind(this);

    render() {
        const lan = 'en';
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { shipmentStatusList } = this.state;
        let shipmentStatus = shipmentStatusList.length > 0
            && shipmentStatusList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);


        return (

            <div className="animated fadeIn">
                <Col xs="12" sm="12">
                    <h5>{i18n.t(this.state.message)}</h5>
                    <Card>

                        <CardHeader>
                            <strong>Shipment details</strong>
                        </CardHeader>
                        <CardBody>
                            <Formik
                                render={
                                    ({
                                    }) => (
                                            <Form name='simpleForm'>

                                                <Col md="9 pl-0">
                                                    <div className="d-md-flex">
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="appendedInputButton">Program</Label>
                                                            <div className="controls SelectGo">
                                                                <InputGroup>
                                                                    <Input type="select"
                                                                        bsSize="sm"
                                                                        value={this.state.programId}
                                                                        name="programId" id="programId"
                                                                        onChange={this.getPlanningUnitList}
                                                                    >
                                                                        <option value="0">Please select</option>
                                                                        {programs}
                                                                    </Input>
                                                                </InputGroup>
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                                            <div className="controls SelectGo">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="select"
                                                                        name="planningUnitId"
                                                                        id="planningUnitId"
                                                                        bsSize="sm"
                                                                        value={this.state.planningUnitId}
                                                                    >
                                                                        <option value="0">Please Select</option>
                                                                        {planningUnits}
                                                                    </Input>
                                                                </InputGroup>
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="appendedInputButton">Shipment Status</Label>
                                                            <div className="controls SelectGo">
                                                                <InputGroup>
                                                                    <Input type="select"
                                                                        bsSize="sm"
                                                                        value={this.state.shipmentId}
                                                                        name="shipmentId" id="shipmentId"
                                                                    // onChange={this.displayInsertRowButton}
                                                                    >
                                                                        <option value="0">Please select</option>
                                                                        {shipmentStatus}
                                                                    </Input>
                                                                    <InputGroupAddon addonType="append">
                                                                        <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                                                    </InputGroupAddon>
                                                                </InputGroup>
                                                            </div>
                                                        </FormGroup>
                                                    </div>
                                                </Col>
                                            </Form>
                                        )} />

                            <Col xs="12" sm="12">
                                <div className="table-responsive">
                                    <div id="shipmenttableDiv">
                                    </div>
                                </div>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveData()} ><i className="fa fa-check"></i>Save Data</Button>
                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.addRow()} id="addButton"><i className="fa fa-check"></i>Add Row</Button>

                                &nbsp;
</FormGroup>
                        </CardFooter>
                    </Card>
                </Col>

            </div >
        );
    }

    getPlanningUnitList(event) {
        // console.log("-------------in planning list-------------")
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                // console.log("myResult", myResult);
                var programId = (document.getElementById("programId").value).split("_")[0];
                // console.log('programId----->>>', programId)
                console.log(myResult);
                var proList = []
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].program.id == programId) {
                        var productJson = {
                            name: getLabelText(myResult[i].planningUnit.label, lan),
                            id: myResult[i].planningUnit.id
                        }
                        proList[i] = productJson
                    }
                }
                this.setState({
                    planningUnitList: proList
                })
            }.bind(this);
        }.bind(this)
    }


    changed = function (instance, cell, x, y, value) {

        // this.setState({
        //     changedFlag: 1
        // })
        // if (x == 0) {
        //     var col = ("A").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }
        // }
        // if (x == 1) {
        //     var col = ("B").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }
        // }
        // if (x == 2) {
        //     var col = ("C").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //     } else {
        //         if (isNaN(Number.parseInt(value))) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, "In valid number.");
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //         }

        //     }
        // }
        // if (x == 3) {
        //     var col = ("D").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //     } else {
        //         if (isNaN(Number.parseInt(value))) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, "In valid number.");
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //         }


        //     }
        // }

        // if (x == 4) {
        //     var col = ("E").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //     } else {
        //         if (isNaN(Date.parse(value))) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, "In valid Date.");
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //         }
        //     }
        // }
        // if (x == 5) {
        //     var col = ("F").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //     } else {
        //         if (isNaN(Date.parse(value))) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, "In valid Date.");
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //         }
        //     }
        // }

        // if (x == 6) {
        //     var col = ("G").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }
        // }

        // this.setState({
        //     changedFlag: 1
        // })

    }.bind(this)

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();

        // for (var y = 0; y < json.length; y++) {
        //     var col = ("A").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(0, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("B").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(1, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("C").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(2, y);
        //     if (value === "" || isNaN(Number.parseInt(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         valid = false;
        //         if (isNaN(Number.parseInt(value))) {
        //             this.el.setComments(col, "in valid number.");
        //         } else {
        //             this.el.setComments(col, "This field is required.");
        //         }
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("D").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(3, y);
        //     if (value === "" || isNaN(Number.parseInt(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         if (isNaN(Number.parseInt(value))) {
        //             this.el.setComments(col, "in valid number.");
        //         } else {
        //             this.el.setComments(col, "This field is required.");
        //         }
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("E").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(4, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         // if (isNaN(Date.parse(value))) {
        //         //     this.el.setStyle(col, "background-color", "transparent");
        //         //     this.el.setStyle(col, "background-color", "yellow");
        //         //     this.el.setComments(col, "In valid Date.");
        //         //     valid = false;
        //         // } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //         // }
        //     }

        //     var col = ("F").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(5, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         // if (isNaN(Date.parse(value))) {
        //         //     this.el.setStyle(col, "background-color", "transparent");
        //         //     this.el.setStyle(col, "background-color", "yellow");
        //         //     this.el.setComments(col, "In valid Date.");
        //         //     valid = false;
        //         // } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //         // }
        //     }

        //     var col = ("G").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(6, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        // }

        var shipmentStatusId = document.getElementById('shipmentId').value;
        if (shipmentStatusId == 1) {
            valid = true;
        } else {
            valid = false;
        }

        return valid;
    }
    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.message.cancelled'))
    }
}

