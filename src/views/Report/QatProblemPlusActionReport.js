import React from "react";
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
// import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";
import * as JsStoreFunctions from "../../CommonComponent/JsStoreFunctions.js";
import { qatProblemActions } from '../../CommonComponent/QatProblemActions';
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
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';


const problemList = [
    { problemId: 1, type: 'No recent inputs of actual consumption (in the last 3 months)' },
    { problemId: 2, type: 'No recent inputs of inventory (in the last 3 months)' },
    { problemId: 3, type: 'Negative ending stock balances' },
    { problemId: 4, type: 'Actual consumption record replaces forecasted consumption record' },
    // { problemId: 5, type: 'Stock adjustments lack explanatory notes' },
    // { problemId: 6, type: 'Shipments with receive dates in the past have a status that is not received' },
    // { problemId: 7, type: 'PSM shipments lack an RO#' },
    // { problemId: 8, type: 'ARTMIS & supply plan alignment (checking for quantities, product SKU, receive date)' },
    // { problemId: 9, type: 'Supply Plan is not planned for 18 months into the future (forecasted consumption and shipments)' },
    // { problemId: 10, type: 'Shipments are showing a status of planned within the lead time (usually 6 months)' },
];

const actionList = [
    { actionId: 1, problemId: 1, action: 'Add consumption data for planning unit' },
    { actionId: 2, problemId: 2, action: 'Add inventory data for planning unit' },
    { actionId: 3, problemId: 3, action: 'check why inventory is negative' },
    { actionId: 4, problemId: 4, action: 'check actual and forecasted consumption record' },
    // { actionId: 5, problemId: 5, action: 'Add notes' },
    // { actionId: 6, problemId: 6, action: 'Add recived date for shipments' },
    // { actionId: 7, problemId: 7, action: 'Add RO' },
    // { actionId: 8, problemId: 8, action: 'Check quantities,SKU,received date' },
    // { actionId: 9, problemId: 9, action: 'Add consumption for planning unit for future 18 months' },
    // { actionId: 10, problemId: 10, action: 'check shipment status' },
];
let problemActionlist = [];
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
            planningUnitId: ''
        }

        // this.getConsumptionData = this.getConsumptionData.bind(this);

        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.fetchData = this.fetchData.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.changed = this.changed.bind(this);
    }

    componentDidMount = function () {

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

        problemActionlist = qatProblemActions();
    };

    addRow = function () {

        var sel = document.getElementById("planningUnitId");
        var planningUnitText = sel.options[sel.selectedIndex].text;

        var selP = document.getElementById("programId");
        var programText = selP.options[sel.selectedIndex].text;

        // this.el.insertRow();
        // var json = this.el.getJson();
        var data = [];
        data[0] = "";
        data[1] = programText;
        data[2] = planningUnitText;
        data[3] = moment(Date.now()).format('YYYY-MM-DD');
        data[4] = "0";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = 1;
        this.el.insertRow(
            data
        );
    }

    changed = function (instance, cell, x, y, value) {
        // this.props.removeMessageText && this.props.removeMessageText();
        if (x == 0) {
            console.log("in if changed=======");
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            // var columnName = jexcel.getColumnNameFromId([x + 6, y]);
            // console.log("columnName====",columnName);
            var actionId = actionList.filter(c => c.problemId == value);
            console.log("actionId====", actionId);
            this.el.setValueFromCoords(6, y, actionId[0].actionId, true);
        }
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


    fetchData() {
        let programId = document.getElementById('programId').value;
        let planningUnitId = document.getElementById('planningUnitId').value;
        let priorityId = document.getElementById('priorityId').value;
        let hqStatusId = document.getElementById('hqStatusId').value;
        console.log("IMP ---------> ", programId)
        this.setState({ programId: programId, planningUnitId: planningUnitId });
        if (parseInt(programId) != 0 && planningUnitId != 0) {

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

                    var selP = document.getElementById("programId");
                    var programText = selP.options[sel.selectedIndex].text;

                    var list = [];
                    for (var k = 0; k < problemList.length; k++) {
                        var problemJson = {
                            name: problemList[k].type,
                            id: problemList[k].problemId
                        }
                        list.push(problemJson);
                    }
                    console.log("list====>", list);

                    var list2 = [];
                    for (var j = 0; j < actionList.length; j++) {
                        var actionJson = {
                            name: actionList[j].action,
                            id: actionList[j].actionId
                        }
                        list2.push(actionJson);
                    }
                    console.log("list2====>", list2);

                    // var programProblemActionList = []
                    // programProblemActionList = qatProblemActions();
                    console.log("problemactionList===>*****", problemActionlist);
                    
                    var data = [];
                    var dataArray = []
                    if (problemActionlist.length != 0) {
                        for (var j = 0; j < problemActionlist.length; j++) {
                            data = [];

                            data[0] = problemActionlist[j].problemType.id;
                            data[1] = problemActionlist[j].program.label.label_en;
                            data[2] = problemActionlist[j].planningUnit.label.label_en;

                            data[3] = '';
                            data[4] = '';

                            data[5] = problemActionlist[j].criticality.id;
                            data[6] = problemActionlist[j].actionName.label.label_en;

                            data[7] = problemActionlist[j].note;
                            data[8] = problemActionlist[j].problemStatus.id;

                            // data[9] = programProblemActionList[j].localProcurmentLeadTime
                            // data[10] = programProblemActionList[j].shelfLife
                            // data[11] = programProblemActionList[j].catalogPrice
                            dataArray.push(data);

                        }
                    } else {
                        console.log("product list length is 0.");
                    }

                    // data[0] = 1;
                    // data[1] = programText;
                    // data[2] = planningUnitText;
                    // data[3] = '2020-07-23';
                    // data[4] = '60';
                    // data[5] = 'High';

                    // data[6] = 1;
                    // data[7] = 'Text Area';
                    // data[8] = 1;


                    // dataArray = data;
                    console.log("data Array====>", dataArray);
                    this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                    this.el.destroy();
                    var json = [];
                    var data = dataArray;
                    var options = {
                        data: data,
                        columnDrag: true,
                        colWidths: [200, 100, 100, 100, 100, 100, 200, 100, 100],
                        columns: [
                            {
                                title: 'Problem Type',
                                type: 'dropdown',
                                source: [{ 'id': '1', 'name': 'Automatic' }, { 'id': '2', 'name': 'Mannual' }],
                                // readOnly: true
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
                                type: 'calendar',
                                options: {
                                    format: 'YYYY-MM-DD'
                                },
                                // readOnly: true
                            },
                            {
                                title: 'Number of days the action has been outstanding​',
                                type: 'text',
                                readOnly: true
                            },
                            {
                                title: 'Criticality',
                                type: 'dropdown',
                                source: [{ 'id': '1', 'name': 'Low' }, { 'id': '2', 'name': 'Medium' }, { 'id': '3', 'name': 'High' }],
                            },
                            {
                                title: 'Action',
                                type: 'text',
                                // source: list2,
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
                        position: 'top',
                        text: {
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        },
                        onload: this.loaded,
                    };
                    this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                }.bind(this)
            }.bind(this)
        }
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
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

                <h5>{i18n.t(this.state.message)}</h5>
                <Card>

                    <div className="Card-header-reporticon">
                        {/* <strong>QAT PROBLEM PLUS ACTION REPORT</strong> */}
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
                    </div>
                    <CardBody className=" pt-lg-0">
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>

                                            <Col md="12 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">Program</Label>
                                                        <div className="controls ">
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
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input
                                                                    type="select"
                                                                    name="planningUnitId"
                                                                    id="planningUnitId"
                                                                    bsSize="sm"
                                                                    value={this.state.planningUnitId}
                                                                    onChange={this.fetchData}
                                                                >
                                                                    <option value="0">Please Select</option>
                                                                    {planningUnits}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">Priority</Label>
                                                        <div className="controls ">
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
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">HQ Status</Label>
                                                        <div className="controls ">
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

                        <Col xs="12" sm="12">
                            <div className="table-responsive">
                                <div id="shipmenttableDiv">

                                </div>
                            </div>
                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button color="danger" size="md" className="float-right mr-1 px-4" type="button" name="regionPrevious" id="regionPrevious" onClick={this.cancelClicked} > <i className="fa fa-angle-double-left "></i> Cancel</Button>
                            &nbsp;
                            {this.state.planningUnitId > 0 && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRow}> <i className="fa fa-plus"></i> Add Row</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>


            </div >
        );
    }


    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/`);
    }
}

