import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form
    , FormFeedback, Row, InputGroup, InputGroupAddon
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js';
import { SECRET_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';


export default class AddInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            programId: '',
            changedFlag: 0,
            countrySKUList: []

        }
        this.options = props.options;
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getCountrySKUList = this.getCountrySKUList.bind(this);
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
    addRow = function () {
        var json = this.el.getJson();
        var data = [];
        data[0] = "";
        data[1] = "";
        data[2] = "";
        data[3] = `=D${json.length}+E${json.length}`;
        data[4] = "0";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        this.el.insertRow(
            data
        );


    };

    getCountrySKUList() {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId });
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
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
                    this.setState({ countrySKUList: countrySKUList });
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
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
                            var countrySKUId = document.getElementById('countrySKU').value;
                            var inventoryList = (programJson.inventoryList).filter(i => i.realmCountryPlanningUnit.id == countrySKUId);
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
                                if (j == 0) {
                                    data = [];
                                    data[0] = inventoryList[j].dataSource.id;
                                    data[1] = inventoryList[j].region.id;
                                    data[2] = inventoryList[j].inventoryDate;
                                    data[3] = 0;
                                    data[4] = inventoryList[j].adjustmentQty;
                                    data[5] = inventoryList[j].actualQty;
                                    data[6] = inventoryList[j].batchNo;
                                    data[7] = inventoryList[j].expiryDate;
                                    data[8] = inventoryList[j].active;
                                    inventoryDataArr[j] = data;
                                } else {
                                    data = [];
                                    data[0] = inventoryList[j].dataSource.id;
                                    data[1] = inventoryList[j].region.id;
                                    data[2] = inventoryList[j].inventoryDate;
                                    data[3] = `=D${j}+E${j}`;
                                    data[4] = inventoryList[j].adjustmentQty;
                                    data[5] = inventoryList[j].actualQty;
                                    data[6] = inventoryList[j].batchNo;
                                    data[7] = inventoryList[j].expiryDate;
                                    data[8] = inventoryList[j].active;
                                    inventoryDataArr[j] = data;
                                }
                            }
                            this.el = jexcel(document.getElementById("inventorytableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = inventoryDataArr;
                            // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                            // json[0] = data;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [100, 100, 100, 130, 130, 130, 130, 130, 130],
                                columns: [

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
                                        title: 'Expected Stock',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Manual Adjustment',
                                        type: 'text'
                                    },
                                    {
                                        title: 'Actual Stock',
                                        type: 'text'
                                    },
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
                                onchange: this.changed,
                                oneditionend: this.onedit,
                                copyCompatibility: true
                                // parseFormulas: true
                            };

                            this.el = jexcel(document.getElementById("inventorytableDiv"), options);
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
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(4, y, 0, true)
            } else {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, "In valid number.");
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        if (x == 5) {
            if (this.el.getValueFromCoords(5, y) != "") {
                if (isNaN(parseInt(value))) {
                    var col = ("F").concat(parseInt(y) + 1);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, "In valid number.");
                } else {
                    var col = ("F").concat(parseInt(y) + 1);
                    var manualAdj = this.el.getValueFromCoords(5, y) - this.el.getValueFromCoords(3, y);
                    this.el.setValueFromCoords(4, y, parseInt(manualAdj), true);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 3) {
            if (this.el.getValueFromCoords(5, y) != "") {
                var col = ("F").concat(parseInt(y) + 1);
                var manualAdj = this.el.getValueFromCoords(5, y) - this.el.getValueFromCoords(3, y);
                this.el.setValueFromCoords(4, y, parseInt(manualAdj), true);
            }
        }

    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        if (x == 4) {
            this.el.setValueFromCoords(5, y, "", true);
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


            // var col = ("D").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(3, y);
            // if (value === "") {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setStyle(col, "background-color", "yellow");
            //     this.el.setComments(col, "This field is required.");
            //     valid = false;
            // } else {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setComments(col, "");
            // }
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

        const { countrySKUList } = this.state;
        let countrySKUs = countrySKUList.length > 0
            && countrySKUList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        return (

            <div className="animated fadeIn">
                <Col xs="12" sm="12">
                    <Card>

                        <CardHeader>
                            <strong>Inventory details</strong>
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
                                                                        // value={this.state.programId}
                                                                        name="programId" id="programId"
                                                                        onChange={this.getCountrySKUList}
                                                                    >
                                                                        <option value="0">Please select</option>
                                                                        {programs}
                                                                    </Input>
                                                                </InputGroup>
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="appendedInputButton">Country SKU</Label>
                                                            <div className="controls SelectGo">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="select"
                                                                        name="countrySKU"
                                                                        id="countrySKU"
                                                                        bsSize="sm"
                                                                    >
                                                                        <option value="0">Please Select</option>
                                                                        {countrySKUs}
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
                                <div id="inventorytableDiv" className="table-responsive">
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

    cancelClicked() {
        this.props.history.push(`/budget/listBudget/` + i18n.t('static.message.cancelled'))
    }

}



