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
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
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
            procurementUnitList: [],
            supplierList: [],
            message: '',
        }

        // this.getConsumptionData = this.getConsumptionData.bind(this);

        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.filterData = this.filterData.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    componentDidMount = function () {
        document.getElementById("shipmentFilters").style.display = "none";
        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = [];
            var shipStatusList = []
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

    filterData() {
        let programId = document.getElementById('programId').value;
        let planningUnitId = document.getElementById('planningUnitId').value;
        let priorityId = document.getElementById('priorityId').value;
        let hqStatusId = document.getElementById('hqStatusId').value;
        console.log("IMP ---------> ", programId)

        this.setState({ programId: programId });



        if (parseInt(programId) != 0) {
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

                    data = [];
                    data[0] = 'abc';
                    data[1] = 'a';
                    data[2] = planningUnitText;
                    data[3] = '30-03-2020';
                    data[4] = '60';
                    data[5] = 'High';
                    data[6] = 'Button. Which will be clickable and redirect on respective page';
                    data[7] = 'Text Area';
                    data[8] = 1;

                    var dataArray = [];
                    dataArray[0] = data

                    this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                    this.el.destroy();
                    var json = [];
                    var data = dataArray;
                    var options = {
                        data: data,
                        columnDrag: true,
                        colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100],
                        columns: [
                            {
                                title: 'Problem Type',
                                type: 'text',
                                readOnly: true
                            },
                            {
                                title: 'Program',
                                type: 'text',
                                readOnly: true
                            },
                            {
                                title: 'Planning Unit',
                                type: 'text',
                                readOnly: true
                            },
                            {
                                title: 'Problem Raised On',
                                type: 'text',
                                options: {
                                    format: 'YYYY-DD-MM'
                                },
                                readOnly: true
                            },
                            {
                                title: 'Number of days the action has been outstanding​',
                                type: 'text',
                                readOnly: true
                            },
                            {
                                title: 'Priority',
                                type: 'text',
                                readOnly: true
                            },
                            {
                                title: 'Action',
                                type: 'text',
                                readOnly: true
                            },
                            {
                                title: 'Country Updates',
                                type: 'text',
                            },
                            {
                                title: 'Post HQ Review Status',
                                type: 'dropdown',
                                source: [{ id: 1, name: 'Open' }, { id: 2, name: 'Closed' }]
                            },
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
                    document.getElementById("shipmentFilters").style.display = "block";
                    this.el = jexcel(document.getElementById("shipmenttableDiv"), options);




                }.bind(this)
            }.bind(this)
        }
    }

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
                    <h5>{i18n.t(this.state.message)}</h5>
                    <Card>

                        <CardHeader>
                            <strong>QAT PROBLEM+ACTION REPORT</strong>
                            {
                                // this.state.matricsList.length > 0 &&
                                <div className="card-header-actions">
                                    <a className="card-header-action">
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" />

                                        {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
 
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                                    </a>
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} />
                                </div>
                            }
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
                                                                        onChange={this.filterData}
                                                                    >
                                                                        <option value="0">Please Select</option>
                                                                        {planningUnits}
                                                                    </Input>
                                                                </InputGroup>
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="appendedInputButton">Priority</Label>
                                                            <div className="controls SelectGo">
                                                                <InputGroup>
                                                                    <Input type="select"
                                                                        bsSize="sm"
                                                                        value={this.state.priorityId}
                                                                        name="priorityId" id="priorityId"
                                                                        onChange={this.filterData}
                                                                    >
                                                                        <option value="0">Please select</option>
                                                                        <option value="1">High</option>
                                                                        <option value="2">Midium</option>
                                                                        <option value="3">Low</option>
                                                                    </Input>
                                                                </InputGroup>
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="appendedInputButton">HQ Status</Label>
                                                            <div className="controls SelectGo">
                                                                <InputGroup>
                                                                    <Input type="select"
                                                                        bsSize="sm"
                                                                        value={this.state.hqStatusId}
                                                                        name="hqStatusId" id="hqStatusId"
                                                                        onChange={this.filterData}
                                                                    >
                                                                        <option value="0">Please select</option>
                                                                        <option value="1">Open</option>
                                                                        <option value="2">Closed</option>
                                                                    </Input>
                                                                </InputGroup>
                                                            </div>
                                                        </FormGroup>
                                                    </div>
                                                </Col>
                                            </Form>
                                        )} />

                            <br></br>
                            <br></br>
                            <Col md="9 pl-0" id="shipmentFilters" style={{ display: 'none' }}>
                                <div className="d-md-flex" >
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
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">Please Select</option>
                                                    {planningUnits}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">Priority</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input type="select"
                                                    bsSize="sm"
                                                    value={this.state.priorityId}
                                                    name="priorityId" id="priorityId"
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">Please select</option>
                                                    <option value="1">High</option>
                                                    <option value="2">Midium</option>
                                                    <option value="3">Low</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>

                                </div>
                            </Col>
                            <Col xs="12" sm="12">
                                <div className="table-responsive">
                                    <div id="shipmenttableDiv">

                                    </div>
                                </div>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
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

    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.message.cancelled'))
    }
}

