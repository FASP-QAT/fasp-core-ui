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
            planningUnitList: []
        }
        this.getProductList = this.getProductList.bind(this);
        // this.getConsumptionData = this.getConsumptionData.bind(this);
        this.saveData = this.saveData.bind(this)
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    componentDidMount = function () {
        console.log("In component did mount", new Date())
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
        }.bind(this)


    };

    formSubmit() {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId });

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);

        var dataSourceList = []
        var regionList = []
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);

            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                var dataSourceRequest = dataSourceOs.getAll();
                dataSourceRequest.onsuccess = function (event) {
                    var dataSourceResult = [];
                    dataSourceResult = dataSourceRequest.result;
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                var dataSourceJson = {
                                    name: dataSourceResult[k].label.label_en,
                                    id: dataSourceResult[k].dataSourceId
                                }
                                dataSourceList[k] = dataSourceJson
                            }
                        }
                    }


                    var regionTransaction = db1.transaction(['region'], 'readwrite');
                    var regionOs = regionTransaction.objectStore('region');
                    var regionRequest = regionOs.getAll();
                    regionRequest.onsuccess = function (event) {
                        var regionResult = [];
                        regionResult = regionRequest.result;
                        for (var k = 0; k < regionResult.length; k++) {
                            if (regionResult[k].realmCountry.realmCountryId == programJson.realmCountry.realmCountryId) {
                                var regionJson = {
                                    name: regionResult[k].label.label_en,
                                    id: regionResult[k].regionId
                                }
                                regionList[k] = regionJson
                            }
                        }

                        // Get inventory data from program
                        var plannigUnitId = document.getElementById("planningUnitId").value;
                        var shipmentList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId);

                        this.setState({
                            shipmentList: shipmentList
                        });

                        var data = [];
                        var shipmentDataArr = []
                        if (shipmentList.length == 0) {
                            data = [];
                            shipmentDataArr[0] = data;
                        }
                        for (var j = 0; j < shipmentList.length; j++) {
                            data = [];
                            data[0] = shipmentList[j].dataSource.id;
                            data[1] = shipmentList[j].region.id;
                            data[2] = shipmentList[j].consumptionQty;
                            data[3] = shipmentList[j].dayOfStockOut;
                            data[4] = shipmentList[j].startDate;
                            data[5] = shipmentList[j].stopDate;
                            data[6] = shipmentList[j].actualFlag;
                            data[7] = shipmentList[j].active;


                            shipmentDataArr[j] = data;
                        }








                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                        this.el.destroy();
                        var json = [];
                        var data = shipmentDataArr;
                        // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                        // json[0] = data;
                        var options = {
                            data: data,
                            columnDrag: true,
                            colWidths: [100, 100, 100, 100, 100, 100, 100, 100],
                            columns: [
                                // { title: 'Month', type: 'text', readOnly: true },
                                {
                                    title: 'Qat ',
                                    type: 'text',
                                    source: dataSourceList
                                },
                                {
                                    title: 'Region',
                                    type: 'text',
                                    source: regionList
                                },
                                {
                                    title: 'Consumption Quantity',
                                    type: 'text'
                                },
                                {
                                    title: 'Days of Stock out',
                                    type: 'text'
                                },
                                {
                                    title: 'StartDate',
                                    type: 'calendar'
                                },
                                {
                                    title: 'StopDate',
                                    type: 'calendar'
                                },
                                {
                                    title: 'Actual Flag',
                                    type: 'dropdown',
                                    source: [{ id: true, name: 'Actual' }, { id: false, name: 'Forecast' }]
                                },
                                {
                                    title: 'Active',
                                    type: 'checkbox'
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


    addRow = function () {
        // document.getElementById("saveButtonDiv").style.display = "block";
        this.el.insertRow();
    };

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
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programId = (document.getElementById("programId").value);

                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {
                    // console.log("(programRequest.result)----", (programRequest.result))
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var plannigUnitId = document.getElementById("planningUnitId").value;

                    var consumptionDataList = (programJson.consumptionList).filter(c => c.planningUnit.id == plannigUnitId);
                    var consumptionDataListNotFiltered = programJson.consumptionList;

                    // console.log("000000000000000   ", consumptionDataList)
                    var count = 0;
                    for (var i = 0; i < consumptionDataListNotFiltered.length; i++) {
                        if (consumptionDataList[count] != undefined) {
                            if (consumptionDataList[count].consumptionId == consumptionDataListNotFiltered[i].consumptionId) {

                                var map = new Map(Object.entries(tableJson[count]))
                                consumptionDataListNotFiltered[i].dataSource.id = map.get("0");
                                consumptionDataListNotFiltered[i].region.id = map.get("1");
                                consumptionDataListNotFiltered[i].consumptionQty = map.get("2");
                                consumptionDataListNotFiltered[i].dayOfStockOut = parseInt(map.get("3"));
                                consumptionDataListNotFiltered[i].startDate = map.get("4");
                                consumptionDataListNotFiltered[i].stopDate = map.get("5");
                                consumptionDataListNotFiltered[i].actualFlag = map.get("6");
                                consumptionDataListNotFiltered[i].active = map.get("7");

                                if (consumptionDataList.length >= count) {
                                    count++;
                                }
                            }

                        }

                    }
                    for (var i = consumptionDataList.length; i < tableJson.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]))
                        var json = {
                            consumptionId: 0,
                            dataSource: {
                                id: map.get("0")
                            },
                            region: {
                                id: map.get("1")
                            },
                            consumptionQty: parseInt(map.get("2")),
                            dayOfStockOut: parseInt(map.get("3")),
                            startDate: map.get("4"),
                            stopDate: map.get("5"),
                            actualFlag: map.get("6"),
                            active: map.get("7"),

                            planningUnit: {
                                id: plannigUnitId
                            }
                        }
                        // consumptionDataList[i] = json;
                        consumptionDataListNotFiltered.push(json);
                    }
                    console.log("1111111111111111111   ", consumptionDataList)
                    programJson.consumptionList = consumptionDataListNotFiltered;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        // $("#saveButtonDiv").hide();
                        this.setState({
                            message: `Consumption Data Saved`,
                            changedFlag: 0
                        })
                        this.props.history.push(`/dashboard/` + "Consumption Data Added Successfully")
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
        return (

            <div className="animated fadeIn">
                <Col xs="12" sm="12">
                    <Card>

                        <CardHeader>
                            <strong>Consumption details</strong>
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
                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.addRow()} ><i className="fa fa-check"></i>Add Row</Button>

                                &nbsp;
</FormGroup>
                        </CardFooter>
                    </Card>
                </Col>

            </div >
        );
    }

    getProductList(event) {
        console.log("in product list")
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var productTransaction = db1.transaction(['product'], 'readwrite');
            var productOs = productTransaction.objectStore('product');
            var productRequest = productOs.getAll();
            var proList = []
            productRequest.onerror = function (event) {
                // Handle errors!
            };
            productRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = productRequest.result;
                console.log("myResult", myResult);
                // console.log(event.target.value);
                var categoryId = document.getElementById("categoryId").value;
                console.log(categoryId)
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].productCategory.productCategoryId == categoryId) {
                        var productJson = {
                            name: getLabelText(myResult[i].label, lan),
                            id: myResult[i].productId
                        }
                        proList[i] = productJson
                    }
                }
                this.setState({
                    productList: proList
                })
            }.bind(this);
        }.bind(this)
    }


    getPlanningUnitList(event) {
        console.log("-------------in planning list-------------")
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
                console.log("myResult", myResult);
                var programId = (document.getElementById("programId").value).split("_")[0];
                console.log('programId----->>>', programId)
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

        this.setState({
            changedFlag: 1
        })
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                if (isNaN(Number.parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, "In valid number.");
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                if (isNaN(Number.parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, "In valid number.");
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }


            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, "In valid Date.");
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, "In valid Date.");
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

    }.bind(this)

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("A").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(0, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value === "" || isNaN(Number.parseInt(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                valid = false;
                if (isNaN(Number.parseInt(value))) {
                    this.el.setComments(col, "in valid number.");
                } else {
                    this.el.setComments(col, "This field is required.");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value === "" || isNaN(Number.parseInt(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                if (isNaN(Number.parseInt(value))) {
                    this.el.setComments(col, "in valid number.");
                } else {
                    this.el.setComments(col, "This field is required.");
                }
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(4, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
                valid = false;
            } else {
                // if (isNaN(Date.parse(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, "In valid Date.");
                //     valid = false;
                // } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // }
            }

            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(5, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
                valid = false;
            } else {
                // if (isNaN(Date.parse(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, "In valid Date.");
                //     valid = false;
                // } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // }
            }

            var col = ("G").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(6, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

        }
        return valid;
    }
    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.message.cancelled'))
    }
}

