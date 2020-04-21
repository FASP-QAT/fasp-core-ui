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


export default class AddInventory extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            planningUnitList: []
        }
        this.options = props.options;
        this.addRow = this.addRow.bind(this);
    }
    componentDidMount() {
        var db1;
        var openRequest = indexedDB.open('fasp', 1);
        var dataSourceList = []
        var regionList = []
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
            var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
            var dataSourceRequest = dataSourceOs.getAll();
            dataSourceRequest.onsuccess = function (event) {
                var dataSourceResult = [];
                dataSourceResult = dataSourceRequest.result;
                for (var k = 0; k < dataSourceResult.length; k++) {
                    var dataSourceJson = {
                        name: dataSourceResult[k].label.label_en,
                        id: dataSourceResult[k].dataSourceId
                    }
                    dataSourceList[k] = dataSourceJson
                }
            }
            var regionTransaction = db1.transaction(['region'], 'readwrite');
            var regionOs = regionTransaction.objectStore('region');
            var regionRequest = regionOs.getAll();
            regionRequest.onsuccess = function (event) {
                var regionResult = [];
                regionResult = regionRequest.result;
                for (var k = 0; k < regionResult.length; k++) {
                    var regionJson = {
                        name: regionResult[k].label.label_en,
                        id: regionResult[k].regionId
                    }
                    regionList[k] = regionJson
                }
            }
        }
        this.el = jexcel(document.getElementById("inventorytableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = [[], [], [], [], [], [], [], [], [], []];
        // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
        // json[0] = data;
        var options = {
            data: data,
            // colHeaders: [
            //     "Month",
            //     "Region",
            //     "Data source",
            //     "Country SKU",
            //     "SKU Code",
            //     "Conversion units",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Notes",
            //     "Create date",
            //     "Created By",
            //     "Last Modified date",
            //     "Last Modified by"
            // ],
            nestedHeaders: [
                [
                    {
                        title: '',
                        colspan: '5',
                    },
                    {
                        title: 'Expected Stock',
                        colspan: '2'
                    },
                    {
                        title: 'Manual Adjustment',
                        colspan: '2'
                    }, {
                        title: 'Actual Stock count',
                        colspan: '2'
                    },
                    {
                        title: 'Final Adjustment',
                        colspan: '2'
                    },
                    {
                        title: '',
                        colspan: '1',
                    }
                ],
            ],
            columnDrag: true,
            colWidths: [110, 110, 100, 100, 100, 180, 180, 180, 180, 180, 180, 180, 180, 100],
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
                    title: 'Country SKU',
                    type: 'text'
                },
                {
                    title: 'SKU Code',
                    type: 'text'
                },
                {
                    title: 'Conversion units',
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
                {
                    title: 'Quantity',
                    type: 'text'
                },
                {
                    title: 'Planning Unit Qty',
                    type: 'text'
                },
                {
                    title: 'Notes',
                    type: 'text'
                }
                // { title: 'Create date', type: 'text', readOnly: true },
                // { title: 'Created By', type: 'text', readOnly: true },
                // { title: 'Last Modified date', type: 'text', readOnly: true },
                // { title: 'Last Modified by', type: 'text', readOnly: true }
            ],
            pagination: false,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false
        };

        this.el = jexcel(document.getElementById("inventorytableDiv"), options);
    }
    addRow = function () {
        this.el.insertRow();
    };
    render() {
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
                                                                value={this.state.programId}
                                                                name="programId" id="programId"
                                                            // onChange={(e) => { this.getPlanningUnitList(e) }}
                                                            >
                                                                <option value="0">Please select</option>
                                                                {/* {programs} */}
                                                            </Input><br />
                                                        </Col>
                                                        <Col md="3">
                                                            <br />
                                                            <Label htmlFor="select">Planning Unit</Label><br />
                                                            <Input type="select"
                                                                bsSize="sm"
                                                                value={this.state.planningUnitId}
                                                                name="planningUnitId" id="planningUnitId"
                                                            // onChange={(e) => { this.getProductList(e) }}
                                                            >
                                                                <option value="0">Please select</option>
                                                                {/* {categories} */}
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
                            <input type='button' value='Add new row' onClick={() => this.addRow()}></input>
                        </CardFooter>
                    </Card>
                </Col>

            </div>
        );
    }

}



