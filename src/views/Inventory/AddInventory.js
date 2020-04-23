import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form
    , FormFeedback, Row
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js';
import { SECRET_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText'

export default class AddInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            programId: '',
            changedFlag: 0
        }
        this.options = props.options;
        // this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
    }
    componentDidMount() {
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
        }.bind(this);

    }
    // addRow = function () {
    //     this.el.insertRow();
    // };

    formSubmit() {
        if (this.state.changedFlag == 1) {
            alert("Click save to continue !")
        } else {
            var programId = document.getElementById('programId').value;
            this.setState({ programId: programId });
            var db1;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            var dataSourceList = []
            var regionList = []
            var countrySKUList = []
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

                        var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                        var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                        var countrySKURequest = countrySKUOs.getAll();
                        countrySKURequest.onsuccess = function (event) {
                            var countrySKUResult = [];
                            countrySKUResult = countrySKURequest.result;
                            for (var k = 0; k < countrySKUResult.length; k++) {
                                if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId) {
                                    var countrySKUJson = {
                                        name: countrySKUResult[k].label.label_en,
                                        id: countrySKUResult[k].realmCountryPlanningUnitId
                                    }
                                    countrySKUList[k] = countrySKUJson
                                }
                            }
                            console.log("countryasdas", countrySKUList);
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

                                var inventoryList = programJson.inventoryList;
                                this.setState({
                                    inventoryList: inventoryList
                                });

                                var data = [];
                                var inventoryDataArr = []
                                if (inventoryList.length == 0) {
                                    data = [];
                                    inventoryDataArr[0] = data;
                                }
                                for (var j = 0; j < inventoryList.length; j++) {
                                    data = [];
                                    data[0] = inventoryList[j].dataSource.id;
                                    data[1] = inventoryList[j].region.id;
                                    data[2] = inventoryList[j].inventoryDate;
                                    data[3] = inventoryList[j].realmCountryPlanningUnit.id;
                                    data[4] = inventoryList[j].multiplier;
                                    data[5] = inventoryList[j].adjustmentQty;
                                    // data[5] = inventoryList[j].multiplier * inventoryList[j].adjustmentQty;
                                    data[6] = `=E${j + 1} * F${j + 1} `
                                    data[7] = inventoryList[j].actualQty;
                                    data[8] = `=E${j + 1} * H${j + 1} `;
                                    data[9] = '';
                                    data[10] = '';
                                    data[11] = inventoryList[j].active;

                                    inventoryDataArr[j] = data;
                                }

                                this.el = jexcel(document.getElementById("inventorytableDiv"), '');
                                this.el.destroy();
                                var json = [];
                                var data = inventoryDataArr;
                                // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                // json[0] = data;
                                var options = {
                                    data: data,
                                    nestedHeaders: [
                                        [
                                            {
                                                title: '',
                                                colspan: '5',
                                            },
                                            // {
                                            //     title: 'Expected Stock',
                                            //     colspan: '2'
                                            // },
                                            {
                                                title: 'Manual Adjustment',
                                                colspan: '2'
                                            }, {
                                                title: 'Actual Stock count',
                                                colspan: '2'
                                            },
                                            // {
                                            //     title: 'Final Adjustment',
                                            //     colspan: '2'
                                            // },
                                            {
                                                title: '',
                                                colspan: '4',
                                            }
                                        ],
                                    ],
                                    columnDrag: true,
                                    colWidths: [110, 110, 100, 130, 100, 180, 180, 180, 180, 180, 180, 180, 180, 100],
                                    columns: [
                                        // { title: 'Month', type: 'text', readOnly: true },
                                        {
                                            title: 'Data source',
                                            type: 'dropdown',
                                            source: dataSourceList
                                        },
                                        {
                                            title: 'Region',
                                            type: 'dropdown',
                                            source: regionList
                                            // readOnly: true
                                        },
                                        {
                                            title: 'Inventory Date',
                                            type: 'calendar'
                                        },
                                        {
                                            title: 'Country SKU',
                                            type: 'dropdown',
                                            source: countrySKUList
                                        },
                                        // {
                                        //     title: 'SKU Code',
                                        //     type: 'text'
                                        // },
                                        {
                                            title: 'Conversion Units',
                                            type: 'text',
                                            readOnly: true
                                        },

                                        // {
                                        //     title: 'Quantity',
                                        //     type: 'text'
                                        // },
                                        // {
                                        //     title: 'Planning Unit Qty',
                                        //     type: 'text'
                                        // },
                                        {
                                            title: 'Quantity',
                                            type: 'text'
                                        },
                                        {
                                            title: 'Planning Unit Qty',
                                            type: 'text'
                                        },
                                        {
                                            title: 'Quantity',
                                            type: 'text'
                                        },
                                        {
                                            title: 'Planning Unit Qty',
                                            type: 'text'
                                        },
                                        // {
                                        //     title: 'Quantity',
                                        //     type: 'text'
                                        // },
                                        // {
                                        //     title: 'Planning Unit Qty',
                                        //     type: 'text'
                                        // },
                                        {
                                            title: 'Batch Number',
                                            type: 'text'
                                        },
                                        {
                                            title: 'Expire Date',
                                            type: 'calendar'
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
                                    onchange: this.changed
                                };

                                this.el = jexcel(document.getElementById("inventorytableDiv"), options);
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }
    }

    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        //     $("#saveButtonDiv").show();
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
        var skuData = {}
        var elInstance = this.el;
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onsuccess = function (e) {

                    db1 = e.target.result;
                    var skuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                    var skuObjectStore = skuTransaction.objectStore('realmCountryPlanningUnit');
                    var skuRequest = skuObjectStore.get(parseInt(value));
                    skuRequest.onsuccess = function (e) {
                        skuData = skuRequest.result;
                        elInstance.setValueFromCoords(4, y, skuData.multiplier, true)
                        // elInstance.setValueFromCoords(7, y, "", true)
                        // elInstance.setValueFromCoords(8, y, skuData.qtyOfPlanningUnits, true)
                        // elInstance.setValueFromCoords(9, y, skuData.planningUnit.qtyOfForecastingUnits, true)
                        // if (elInstance.getValueFromCoords(11, y) > 0) {
                        //     var qtyInTermsOfForecastUnit = parseFloat(logisticsUnitData.qtyOfPlanningUnits * logisticsUnitData.planningUnit.qtyOfForecastingUnits * elInstance.getValueFromCoords(11, y));
                        //     elInstance.setValueFromCoords(12, y, qtyInTermsOfForecastUnit, true)
                        // }
                    }

                }
            }
        }
    }.bind(this);

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
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, "This field is required.");
                valid = false;
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, "In valid Date.");
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }


            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
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

    saveData = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState(
                {
                    changedFlag: 0
                }
            );
            console.log("all good...");
            var tableJson = this.el.getJson();
            console.log(tableJson);
        } else {
            console.log("some thing get wrong...");
        }
    }.bind(this);


    render() {
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        return (

            <div className="animated fadeIn">
                <Col xs="12" sm="12">
                    <Card>
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <CardHeader>
                                                <strong>Inventory details</strong>
                                            </CardHeader>
                                            <CardBody>
                                                <Card className="card-accent-success">

                                                    <Row>
                                                        <Col md="1"></Col>
                                                        <Col md="3">
                                                            <br />
                                                            <Label htmlFor="select">Program</Label><br />
                                                            <Input type="select"
                                                                bsSize="sm"
                                                                // value={this.state.programId}
                                                                name="programId" id="programId"
                                                            // onChange={(e) => { this.getPlanningUnitList(e) }}
                                                            >
                                                                <option value="0">Please select</option>
                                                                {programs}
                                                            </Input><br />
                                                        </Col>


                                                        <Col md="1">
                                                            <br /><br />
                                                            <FormGroup>
                                                                <Button type="button" size="sm" color="primary" className="float-right btn btn-secondary Gobtn btn-sm mt-2" onClick={() => this.formSubmit()}> Go</Button>
                                                                &nbsp;
                                                            </FormGroup>

                                                        </Col>
                                                    </Row>

                                                </Card>
                                            </CardBody>
                                        </Form>
                                    )} />
                    </Card>
                </Col>
                <Col xs="12" sm="12">
                    <Card>
                        <CardHeader>
                            <strong>Inventory details</strong>
                        </CardHeader>
                        <CardBody>
                            <div id="inventorytableDiv" className="table-responsive">
                            </div>
                        </CardBody>
                        <CardFooter>
                            <input type='button' value='Save Data' onClick={() => this.saveData()}></input>
                        </CardFooter>
                    </Card>
                </Col>

            </div >
        );
    }

}



