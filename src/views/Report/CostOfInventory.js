import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import DatePicker from 'react-datepicker';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import filterFactory from 'react-bootstrap-table2-filter';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import csvicon from '../../assets/img/csv.png';

const entityname = i18n.t('static.dashboard.costOfInventory');
const { ExportCSVButton } = CSVExport;
const ref = React.createRef();

export default class CostOfInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            CostOfInventoryInput: {
                programId: '',
                planningUnitIds: [],
                regionIds: [],
                versionId: -1,
                dt: '',
                includePlanningShipments: true
            },
            programList: [],
            regionList: [],
            planningUnitList: [],
            costOfInventory: []
        }
        this.getDependentList = this.getDependentList.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        // this.filterRegionList = this.filterRegionList.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.exportCSV=this.exportCSV.bind(this);

    }


    dataChange(event) {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        if (event.target.name == "programId") {
            costOfInventoryInput.programId = event.target.value;

        }
        if (event.target.name == "includePlanningShipments") {
            costOfInventoryInput.includePlanningShipments = event.target.value;

        }
        this.setState({ costOfInventoryInput }, () => { })
    }
    dataChangeDate(date) {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        costOfInventoryInput.dt = date;
        this.setState({ costOfInventoryInput: costOfInventoryInput });
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramList().then(response => {
            // console.log("for program", response.data);
            if (response.status == 200) {
                this.setState({ programList: response.data });
            } else {

            }

        });

        let costOfInventoryInput = this.state.CostOfInventoryInput;
        costOfInventoryInput.dt = new Date();
        // var CurrentDate=new Date();
        this.setState({ costOfInventoryInput });

    }

    getDependentList() {
        // AuthenticationService.setupAxiosInterceptors();
        // ProgramService.getProgramPlaningUnitListByProgramId(event.target.value).then(response => {
        //     if (response.status == 200) {
        //         console.log("for planning units", response.data);
        //         this.setState({ planningUnitList: response.data });
        //     } else {

        //     }

        // });

    }

    formSubmit() {
        console.log("in form submit", this.state.CostOfInventoryInput);
        AuthenticationService.setupAxiosInterceptors();
        ReportService.costOfInventory(this.state.CostOfInventoryInput).then(response => {
            console.log("costOfInentory=====>", response.data);
            this.setState({ costOfInventory: response.data });
        });

    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

    exportCSV(columns) {

        var csvRow = [];
        const headers = [];
        columns.map((item, idx) => { headers[idx] = item.text });


        var A = [headers]

        this.state.costOfInventory.map(elt => A.push([elt.planningUnit.label.label_en.replaceAll(',', ' '),elt.price,elt.qty]));


        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(','))
        }

        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = "CostOfInventory.csv"
        document.body.appendChild(a)
        a.click()
    }


    render() {

        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [

            {
                dataField: 'planningUnit.label',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'price',
                text: 'Price',
                sort: true,
                align: 'center',
                headerAlign: 'center'
                
            },
            {
                dataField: 'qty',
                text: 'Quantity',
                sort: true,
                align: 'center',
                headerAlign: 'center'
                
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
                text: 'All', value: this.state.costOfInventory.length
            }]
        }
        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>

                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>
                
                        {this.state.costOfInventory.length > 0 && <div className="card-header-actions">
                        <img style={{ height: '25px', width: '25px', cursor:'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />                  
                        </div>}
                        {/* <div className="card-header-actions">
                      <a className="card-header-action">
                        <Pdf targetRef={ref} filename="StockStatus.pdf">
                          {({ toPdf }) =>
                            <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => toPdf()} />
    
                          }
                        </Pdf>
                      </a>
                    </div> */}
                    </CardHeader>
                    <CardBody>
                        <div className="TableCust" >
                            <div ref={ref}>

                                <Form >
                                    <Col md="12 pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Program</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.all')}</option>
                                                            {programs}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Include Planning Shipments</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="includePlanningShipments"
                                                            id="includePlanningShipments"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="true">True</option>
                                                            <option value="false">false</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <DatePicker
                                                            id="startDate"
                                                            name="startDate"
                                                            bsSize="sm"
                                                            selected={this.state.CostOfInventoryInput.dt}
                                                            maxDate={new Date()}
                                                            selected={this.state.CostOfInventoryInput.dt}
                                                            onChange={(date) => { this.dataChangeDate(date); this.formSubmit() }}
                                                            // placeholderText="mm-dd-yyy"
                                                            className="form-control-sm form-control costinventryinput"
                                                            disabledKeyboardNavigation

                                                        />
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </Col>
                                </Form>
                            </div>
                        </div>
                        <ToolkitProvider
                            keyField="planningUnitId"
                            data={this.state.costOfInventory}
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
                                        <BootstrapTable 
                                            hover  
                                            striped  
                                            // tabIndexCell
                                            pagination={paginationFactory(options)}
                                            // rowEvents={{
                                            //     onClick: (e, row, rowIndex) => {
                                            //         // row.startDate = moment(row.startDate).format('YYYY-MM-DD');
                                            //         // row.stopDate = moment(row.stopDate).format('YYYY-MM-DD');
                                            //         // row.startDate = moment(row.startDate);
                                            //         // row.stopDate = moment(row.stopDate);
                                            //         // this.editBudget(row);
                                            //     }
                                            // }}
                                            {...props.baseProps}
                                        />
                                        {/* <h5>*Row is in red color indicates there is no money left or budget hits the end date</h5> */}
                                    </div>
                                )
                            }
                        </ToolkitProvider>


                    </CardBody>
                </Card>

            </div >

        );
    }

}