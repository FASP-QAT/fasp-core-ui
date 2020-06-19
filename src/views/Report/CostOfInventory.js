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
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import pdfIcon from '../../assets/img/pdf.png';
import moment from 'moment'

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
            costOfInventory: [],
            versionList:[],
            message:''
        }
        this.getDependentList = this.getDependentList.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        // this.filterRegionList = this.filterRegionList.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.exportCSV=this.exportCSV.bind(this);

    }
filterVersion=()=>{
    let programId = document.getElementById("programId").value;
    console.log(programId)
    if (programId != 0 ) {
         const program = this.state.programList.filter(c => c.programId == programId)
        if(program.length==1){
            console.log(program[0].versionList)
         this.setState({
            versionList:program[0].versionList
        });
    }else{
        this.setState({
            versionList:[]
        });
    }}
}

exportCSV=(columns)=> {

    var csvRow = [];

    csvRow.push((i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')))
    csvRow.push((i18n.t('static.report.version') + ' , ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.common.startdate') + ' , ' + new moment(this.state.CostOfInventoryInput.dt).format("DD-MMM-yyy")).replaceAll(' ', '%20'))
    csvRow.push('')
    csvRow.push('')
    csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
    csvRow.push('')
    var re;

    const headers = [];
    columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

    var A = [headers]
   this.state.costOfInventory.map(ele => A.push([(getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.batchNo, ele.expiryDate.replaceAll(' ', '%20'),  ele.stock, ele.cost]));
   
    for (var i = 0; i < A.length; i++) {
        csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = "Cost Of Inventory Report.csv"
    document.body.appendChild(a)
    a.click()
}
exportPDF = (columns) => {
    const addFooters = doc => {

        const pageCount = doc.internal.getNumberOfPages()

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        for (var i = 1; i <= pageCount; i++) {
            doc.setPage(i)

            doc.setPage(i)
            doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                align: 'center'
            })
            doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                align: 'center'
            })


        }
    }
    const addHeaders = doc => {

        const pageCount = doc.internal.getNumberOfPages()
        doc.setFont('helvetica', 'bold')
        for (var i = 1; i <= pageCount; i++) {
            doc.setFontSize(12)
            doc.setPage(i)
            doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
            doc.setTextColor("#002f6c");
            doc.text("Cost Of Inventory ", doc.internal.pageSize.width / 2, 60, {
                align: 'center'
            })
            if (i == 1) {
                doc.setFontSize(8)
                doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                    align: 'left'
                  })
                  doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 100, {
                    align: 'left'
                  })
                  doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                    align: 'left'
                  })
                  doc.text(i18n.t('static.common.startdate') + ' : ' + new moment(this.state.CostOfInventoryInput.dt).format("DD-MMM-yyy"), doc.internal.pageSize.width / 8, 120, {
                    align: 'left'
                  })
            }

        }
    }
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);

    doc.setFontSize(8);

   // var canvas = document.getElementById("cool-canvas");
    //creates image

    // var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    // var aspectwidth1 = (width - h1);

    // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

    const headers = columns.map((item, idx) =>  (item.text));
    const data =this.state.costOfInventory.map(ele =>[getLabelText(ele.planningUnit.label), ele.batchNo, ele.expiryDate,  ele.stock, ele.cost]);
   
    let content = {
        margin: { top: 80 },
        startY: 150,
        head: [headers],
        body: data,
        styles: { lineWidth: 1, fontSize: 8 }
    };
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save("Cost Of Inventory Report.pdf")
}



    dataChange(event) {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        if (event.target.name == "programId") {
            costOfInventoryInput.programId = event.target.value;

        }
        if (event.target.name == "includePlanningShipments") {
            costOfInventoryInput.includePlanningShipments = event.target.value;

        }
        if (event.target.name == "versionId") {
            costOfInventoryInput.versionId = event.target.value;

        }
        this.setState({ costOfInventoryInput }, () => {this.formSubmit() })
    }
    dataChangeDate(date) {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        costOfInventoryInput.dt = date;
        this.setState({ costOfInventoryInput: costOfInventoryInput },()=>{this.formSubmit()});
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramList().then(response => {
             console.log("for program", response.data);
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
        if(this.state.CostOfInventoryInput.programId!=0 && this.state.CostOfInventoryInput.versionId!=-1) {
        AuthenticationService.setupAxiosInterceptors();
        ReportService.costOfInventory(this.state.CostOfInventoryInput).then(response => {
            console.log("costOfInentory=====>", response.data);
            this.setState({ costOfInventory: response.data ,message:''});
        });
    }else if(this.state.CostOfInventoryInput.programId==0){
        this.setState({ costOfInventory: [] , message: i18n.t('static.common.selectProgram')});
    }else{
        this.setState({ costOfInventory: [] , message: i18n.t('static.program.validversion')});  
    }
    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
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

            const { versionList } = this.state;
            let versions = versionList.length > 0
                && versionList.map((item, i) => {
                    return (
                        <option key={i} value={item.versionId}>
                            {item.versionId}
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
                dataField: 'batchNo',
                text: 'Batch No',
                sort: true,
                align: 'center',
                headerAlign: 'center'
                
            },
            {
                dataField: 'expiryDate',
                text: 'Expiry Date',
                sort: true,
                align: 'center',
                headerAlign: 'center'
                
            },
            {
                dataField: 'stock',
                text: 'Stock',
                sort: true,
                align: 'center',
                headerAlign: 'center'
                
            },
            {
                dataField: 'cost',
                text: 'Cost',
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
                text: 'All', value: this.state.costOfInventory.length
            }]
        }
        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>
                
                        <div className="card-header-actions">
                      <a className="card-header-action">
                      {this.state.costOfInventory.length > 0 && <div className="card-header-actions">
                <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                <img style={{ height: '25px', width: '25px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
              </div>}
                      </a>
                    </div> 
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
                                                            onChange={(e) => { this.dataChange(e);this.filterVersion(); this.formSubmit() }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programs}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Version</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {versions}
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
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
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
                     {this.state.costOfInventory.length>0 &&   <ToolkitProvider
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
                        </ToolkitProvider>}


                    </CardBody>
                </Card>

            </div >

        );
    }

}