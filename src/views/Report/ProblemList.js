import { DATE_FORMAT_CAP, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants';
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
import AuthenticationService from '../Common/AuthenticationService.js';
import "jspdf-autotable";
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { qatProblemActions } from '../../CommonComponent/QatProblemActions';
import getProblemDesc from '../../CommonComponent/getProblemDesc';
import getSuggestion from '../../CommonComponent/getSuggestion';
const entityname = i18n.t('static.report.problem');

export default class ConsumptionDetails extends React.Component {

    constructor(props) {
        super(props);
        // this.options = props.options;
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
            planningUnitId: '',
            lang: localStorage.getItem('lang')
        }

        // this.getConsumptionData = this.getConsumptionData.bind(this);


        this.fetchData = this.fetchData.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addMannualProblem = this.addMannualProblem.bind(this);
        this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
        this.buttonFormatter = this.buttonFormatter.bind(this);
        this.addMapping = this.addMapping.bind(this);
        this.getNote = this.getNote.bind(this);

    }

    componentDidMount = function () {
        qatProblemActions();
        let problemStatusId = document.getElementById('problemStatusId').value;
        console.log("problemStatusId ---------> ", problemStatusId);
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

    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        // console.log('in rowClassNameFormat')
        // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
        if (row.realmProblem.criticality.id == 3) {
            return row.realmProblem.criticality.id == 3 && row.problemStatus.id == 1 ? 'background-red' : '';
        } else if (row.realmProblem.criticality.id == 2) {
            return row.realmProblem.criticality.id == 2 && row.problemStatus.id == 1 ? 'background-orange' : '';
        } else {
            return row.realmProblem.criticality.id == 1 && row.problemStatus.id == 1 ? 'background-yellow' : '';
        }
    }

    fetchData() {
        this.setState({
            data: [],
            message: ''
        });
        let programId = document.getElementById('programId').value;
        let problemStatusId = document.getElementById('problemStatusId').value;
        let problemTypeId = document.getElementById('problemTypeId').value;

        // console.log("programId ---------> ", programId);
        // console.log("problemStatusId ---------> ", problemStatusId);
        this.setState({ programId: programId });
        if (parseInt(programId) != 0 && problemStatusId != 0 && problemTypeId != 0) {

            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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

                    // console.log("problemReportList---->", problemReportList);
                    // console.log("problemStatusId ---********------> ", problemStatusId);

                    if (problemStatusId != -1) {

                        var problemReportFilterList = problemReportList.filter(c => c.problemStatus.id == problemStatusId && c.problemType.id == problemTypeId);
                        this.setState({
                            data: problemReportFilterList,
                            message: ''
                        },
                            () => {

                            });
                    } else {
                        var problemReportFilterList = problemReportList.filter(c => c.problemType.id == problemTypeId);
                        this.setState({
                            data: problemReportFilterList,
                            message: ''
                        },
                            () => {

                            });
                    }
                    // console.log("problemReportFilterList---->", problemReportFilterList);



                }.bind(this)
            }.bind(this)
        }
        else if (problemStatusId == 0) {
            this.setState({ message: i18n.t('static.report.selectProblemStatus'), data: [] });
        }
        else if (problemTypeId == 0) {
            this.setState({ message: i18n.t('static.report.selectProblemType'), data: [] });
        }
    }

    editProblem(problem, index) {
        let problemStatusId = document.getElementById('problemStatusId').value;
        let problemTypeId = document.getElementById('problemTypeId').value;
        this.props.history.push({
            pathname: `/report/editProblem/${problem.problemReportId}/ ${this.state.programId}/${problem.problemActionIndex}/${problemStatusId}/${problemTypeId}`,
            // state: { language }
        });

    }

    addMannualProblem() {
        console.log("-------------------addNewProblem--------------------");
        this.props.history.push("/report/addProblem");
        // this.props.history.push("/role/addRole");
    }

    buttonFormatter(cell, row) {
        if (row.problemStatus.id == 2) {
            return <span></span>
        } else {
            return <Button type="button" size="sm" onClick={(event) => this.addMapping(event, cell, row)} color="info"><i className="fa fa-pencil"></i></Button>;
        }

    }

    addMapping(event, cell, row) {

        var planningunitId = row.planningUnit.id;
        var programId = document.getElementById('programId').value;
        var versionId = row.versionId
        event.stopPropagation();
        if (row.realmProblem.problem.problemId != 2) {
            this.props.history.push({
                // pathname: `/programProduct/addProgramProduct/${cell}`,
                // pathname: `/report/addProblem`,
                pathname: `${cell}/${programId}/${versionId}/${planningunitId}`,
            });
        } else {
            this.props.history.push({
                pathname: `${cell}`,
            });
        }


    }

    getNote(row, lang) {
        var transList = row.problemTransList;
        var listLength = row.problemTransList.length;
        return transList[listLength - 1].notes;
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
                dataField: 'program.programCode',
                text: i18n.t('static.program.programCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                // formatter: (cell, row) => {
                //     return getLabelText(cell, this.state.lang);
                // }
            },
            {
                dataField: 'versionId',
                text: i18n.t('static.program.versionId'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '60px' },
            },
            {
                dataField: 'region.label',
                text: i18n.t('static.region.region'),
                hidden: true,
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        return getLabelText(cell, this.state.lang);
                    }
                }

            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.planningunit.planningunit'),
                sort: true,
                hidden: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'dt',
                text: i18n.t('static.report.month'),
                sort: true,
                hidden: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        var modifiedDate = moment(cell).format('MMM-YY');
                        return modifiedDate;
                    }
                }
            },
            {
                dataField: 'createdDate',
                text: i18n.t('static.report.createdDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
                formatter: (cell, row) => {
                    if (cell != null && cell != "") {
                        var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
                        return modifiedDate;
                    }
                }
            },
            {
                dataField: 'realmProblem.problem.label',
                text: i18n.t('static.report.problemDescription'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '230px' },
                formatter: (cell, row) => {
                    return getProblemDesc(row, this.state.lang);
                }
            },
            {
                dataField: 'realmProblem.problem.actionLabel',
                text: i18n.t('static.report.suggession'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '250px' },
                formatter: (cell, row) => {
                    // return getLabelText(cell, this.state.lang);
                    return getSuggestion(row, this.state.lang);
                }
            },
            {
                dataField: 'problemStatus.label',
                text: i18n.t('static.report.problemStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '90px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            // {
            //     dataField: 'realmProblem.criticality.label',
            //     text: i18n.t('static.report.Criticality'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     style: { width: '100px' },
            //     formatter: (cell, row) => {
            //         return getLabelText(cell, this.state.lang);
            //     }
            // },
            // {
            //     dataField: 'problemType.label',
            //     text: i18n.t('static.report.problemType'),
            //     sort: true,
            //     align: 'center',
            //     style: { width: '100px' },
            //     headerAlign: 'center',
            //     style: { width: '100px' },
            //     formatter: (cell, row) => {
            //         return getLabelText(cell, this.state.lang);
            //     }
            // },
            {
                dataField: 'problemTransList',
                text: i18n.t('static.program.notes'),
                sort: true,
                align: 'center',
                style: { width: '100px' },
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return this.getNote(row, this.state.lang);
                }
            },
            {
                dataField: 'realmProblem.problem.actionUrl',
                text: i18n.t('static.common.action'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '50px' },
                formatter: this.buttonFormatter
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
                text: 'All', value: this.state.data.length
            }]
        }

        return (

            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addMannualProblem}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </div>
                    <CardBody className=" pb-lg-2 pt-lg-0">
                        <Col md="9 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm" 
                                                value={this.state.programId}
                                                name="programId" id="programId"
                                                onChange={this.fetchData}
                                            >
                                                {/* <option value="0">Please select</option> */}
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programs}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.problemStatus')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                name="problemStatusId" id="problemStatusId"
                                                onChange={this.fetchData}
                                            // value={1}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                {problemStatus}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.problemType')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                // value={this.state.hqStatusId}
                                                name="problemTypeId" id="problemTypeId"
                                                onChange={this.fetchData}
                                            >
                                                {/* <option value="0">Please select</option> */}
                                                <option value="1">Automatic</option>
                                                <option value="2">Manual</option>
                                                <option value="3">Automatic / Manual</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        <ToolkitProvider
                            keyField="problemActionIndex"
                            data={this.state.data}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (

                                    <div className="TableCust listBudgetAlignThtd">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover rowClasses={this.rowClassNameFormat} striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editProblem(row, rowIndex);
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

