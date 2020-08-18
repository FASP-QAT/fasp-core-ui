import React from "react";
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
// import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";
import * as JsStoreFunctions from "../../CommonComponent/JsStoreFunctions.js";
import { qatProblemActions } from '../../CommonComponent/QatProblemActions';
import { DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js';
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

import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';



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
        // this.fetchData = this.fetchData.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.editProblem = this.editProblem.bind(this);
        // this.addRow = this.addRow.bind(this);
        // this.changed = this.changed.bind(this);
    }

    componentDidMount = function () {
        problemActionlist = qatProblemActions();
        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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

        // problemActionlist = qatProblemActions();
    };

    editProblem() {
        this.props.history.push({
            pathname: `/problem/editProblem`,

        });
    }

    getPlanningUnitList(event) {
        // console.log("-------------in planning list-------------")
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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

        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);
        const columns = [
            {
                dataField: 'program.label',
                text: 'Program',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }
                // formatter: (cellContent, row) => {
                //   return (
                //     (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
                //   );
                // }
            },
            {
                dataField: 'region.label',
                text: 'Region',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }
            },
            {
                dataField: 'planningUnit.label',
                text: 'Planning Unit ',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }
            },
            {
                dataField: 'problemId',
                text: 'Problem Id',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'month',
                text: 'Month',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
                        return modifiedDate;
                    }
                }
            },
            {
                dataField: 'isFound',
                text: 'Is Found',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            {
                dataField: 'actionName.label',
                text: 'Action',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }
            },
            {
                dataField: 'criticality.label',
                text: 'Criticality',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }
            },
            {
                dataField: 'problemStatus.label',
                text: 'HQ Review Status',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }
            },
            {
                dataField: 'note',
                text: 'HQ Note',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
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
                text: 'All', value: problemActionlist.length
            }]
        }


        return (

            <div className="animated fadeIn">

                <h5>{i18n.t(this.state.message)}</h5>
                <Card>

                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}{' '}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {/* {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_BUDGET') &&  */}
                                <a href="javascript:void();" title='Add Problem' ><i className="fa fa-plus-square"></i></a>
                                {/* } */}
                            </div>
                        </div>
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

                        <ToolkitProvider
                            keyField="programId"
                            data={problemActionlist}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
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
                    <CardFooter>
                        <FormGroup>
                            <Button color="danger" size="md" className="float-right mr-1 px-4" type="button" name="regionPrevious" id="regionPrevious" onClick={this.cancelClicked} > <i className="fa fa-angle-double-left "></i> Cancel</Button>
                            &nbsp;
                            {/* {this.state.planningUnitId > 0 && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRow}> <i className="fa fa-plus"></i> Add Row</Button>}
                            &nbsp; */}
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

