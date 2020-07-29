import React from "react";
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
// import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";
import * as JsStoreFunctions from "../../CommonComponent/JsStoreFunctions.js";
import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import pdfIcon from '../../assets/img/pdf.png';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
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
    { problemId: 5, type: 'Stock adjustments lack explanatory notes' },
    { problemId: 6, type: 'Shipments with receive dates in the past have a status that is not received' },
    { problemId: 7, type: 'PSM shipments lack an RO#' },
    { problemId: 8, type: 'ARTMIS & supply plan alignment (checking for quantities, product SKU, receive date)' },
    { problemId: 9, type: 'Supply Plan is not planned for 18 months into the future (forecasted consumption and shipments)' },
    { problemId: 10, type: 'Shipments are showing a status of planned within the lead time (usually 6 months)' },
];

const actionList = [
    { actionId: 1, problemId: 1, action: 'Add consumption data for planning unit' },
    { actionId: 2, problemId: 2, action: 'Add inventory data for planning unit' },
    { actionId: 3, problemId: 3, action: 'check why inventory is negative' },
    { actionId: 4, problemId: 4, action: 'check actual and forecasted consumption record' },
    { actionId: 5, problemId: 5, action: 'Add notes' },
    { actionId: 6, problemId: 6, action: 'Add recived date for shipments' },
    { actionId: 7, problemId: 7, action: 'Add RO' },
    { actionId: 8, problemId: 8, action: 'Check quantities,SKU,received date' },
    { actionId: 9, problemId: 9, action: 'Add consumption for planning unit for future 18 months' },
    { actionId: 10, problemId: 10, action: 'check shipment status' },
];

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
            problemStatusList: [],
            data: [],
            message: '',
            planningUnitId: ''
        }

        // this.getConsumptionData = this.getConsumptionData.bind(this);


        this.fetchData = this.fetchData.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);

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


                var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                var problemStatusRequest = problemStatusOs.getAll();

                problemStatusRequest.onerror = function (event) {
                    // Handle errors!
                };
                problemStatusRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = problemStatusRequest.result;
                    var proList = []
                    for (var i = 0; i < myResult.length; i++) {
                        var Json = {
                            name: getLabelText(myResult[i].label, lan),
                            id: myResult[i].id
                        }
                        proList[i] = Json
                    }
                    this.setState({
                        problemStatusList: proList
                    })


                }.bind(this);
            }.bind(this);
        }.bind(this);

    };


    fetchData() {
        let programId = document.getElementById('programId').value;
        let problemStatusId = document.getElementById('problemStatusId').value;
        let problemTypeId = document.getElementById('problemTypeId').value;

        console.log("programId ---------> ", programId)
        this.setState({ programId: programId });
        if (parseInt(programId) != 0 && problemStatusId != 0 && problemTypeId != 0) {

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

                    // var sel = document.getElementById("planningUnitId");
                    // var planningUnitText = sel.options[sel.selectedIndex].text;

                    // var selP = document.getElementById("programId");
                    // var programText = selP.options[sel.selectedIndex].text;

                    var problemReportList = (programJson.problemReportList);

                    console.log("problemReportList---->", problemReportList);

                    const problemReportFilterList = problemReportList.filter(c => c.problemStatus.id == problemStatusId && c.problemType.id == problemTypeId);

                    this.setState({
                        data: problemReportFilterList,
                    },
                        () => {

                        });


                }.bind(this)
            }.bind(this)
        } else if (problemStatusId == 0) {
            this.setState({ message: i18n.t('static.report.selectProblemStatus'), data: [] });
        } else if (problemTypeId == 0) {
            this.setState({ message: i18n.t('static.report.selectProblemType'), data: [] });
        }
    }

    editProblem(problem) {

        this.props.history.push({
            pathname: `/report/editProblem/${problem.problemReportId}/ ${this.state.programId}`,
            // state: { language }
        });

    }

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const lan = 'en';
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { problemStatusList } = this.state;
        let problemStatus = problemStatusList.length > 0
            && problemStatusList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const columns = [
            {
                dataField: 'program.code',
                text: i18n.t('static.program.programCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
            },
            {
                dataField: 'versionId',
                text: i18n.t('static.program.versionId'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
            },
            {
                dataField: 'createdDate',
                text: i18n.t('static.report.createdDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return new moment(cell).format('MMM YYYY');
                }
            },
            {
                dataField: 'realmProblem.problem.label',
                text: i18n.t('static.report.problemDescription'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'realmProblem.criticality.label',
                text: i18n.t('static.report.Criticality'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'problemStatus.label',
                text: i18n.t('static.report.problemStatus'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'problemType.label',
                text: i18n.t('static.report.problemType'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'realmProblem.problem.actionUrl',
                text: i18n.t('static.common.action'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
            },


        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.data.length
            }]
        }

        return (

            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.state.message)}</h5>
                <Card>

                    <div className="Card-header-reporticon">
                        {/* <strong>QAT PROBLEM PLUS ACTION REPORT</strong> */}
                        {
                            // this.state.matricsList.length > 0 &&
                            
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
                                                                    onChange={this.fetchData}
                                                                >
                                                                    <option value="0">Please select</option>
                                                                    {programs}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>

                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">Problem Status</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    name="problemStatusId" id="problemStatusId"
                                                                    onChange={this.fetchData}
                                                                >
                                                                    <option value="0">Please select</option>
                                                                    {problemStatus}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">Problem Type</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    // value={this.state.hqStatusId}
                                                                    name="problemTypeId" id="problemTypeId"
                                                                    onChange={this.fetchData}
                                                                >
                                                                    <option value="0">Please select</option>
                                                                    <option value="1">Automatic</option>
                                                                    <option value="2">Manual</option>
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                </div>
                                            </Col>
                                        </Form>
                                    )} />

                        <ToolkitProvider
                            keyField="problemReportId"
                            data={this.state.data}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (

                                    <div className="TableCust">
                                        <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editProblem(row);
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                    </CardBody>
                    {/* <CardFooter>
                        <FormGroup>
                            <Button color="danger" size="md" className="float-right mr-1 px-4" type="button" name="regionPrevious" id="regionPrevious" onClick={this.cancelClicked} > <i className="fa fa-angle-double-left "></i> Cancel</Button>
                            &nbsp;
                            {this.state.planningUnitId > 0 && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRow}> <i className="fa fa-plus"></i> Add Row</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter> */}
                </Card>


            </div >
        );
    }

    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/`);
    }
}

