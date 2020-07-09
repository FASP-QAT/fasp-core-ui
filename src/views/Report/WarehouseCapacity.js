// import React, { Component } from 'react';
// import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import i18n from '../../i18n'
// import RegionService from "../../api/RegionService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// import RealmCountryService from "../../api/RealmCountryService.js";

// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// import pdfIcon from '../../assets/img/pdf.png';
// import csvicon from '../../assets/img/csv.png'



// const entityname = i18n.t('static.region.region');

// class RegionListComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
//             lang: localStorage.getItem('lang'),
//             loading: true
//         }
//         this.editRegion = this.editRegion.bind(this);
//         this.addRegion = this.addRegion.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//     }
//     filterData() {
//         let countryId = document.getElementById("realmCountryId").value;
//         if (countryId != 0) {
//             const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
//             this.setState({
//                 selRegion: selRegion
//             });
//         } else {
//             this.setState({
//                 selRegion: this.state.regionList
//             });
//         }
//     }
//     editRegion(region) {
//         this.props.history.push({
//             pathname: `/region/editRegion/${region.regionId}`,
//             // state: { region }
//         });
//     }
//     addRegion(region) {
//         this.props.history.push({
//             pathname: "/region/addRegion"
//         });
//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         RegionService.getRegionList()
//             .then(response => {
//                 console.log("RESP---", response.data);

//                 if (response.status == 200) {
//                     this.setState({
//                         regionList: response.data,
//                         selRegion: [{
//                             "active": true,
//                             "regionId": 1,
//                             "label": {
//                                 "active": false,
//                                 "labelId": 41,
//                                 "label_en": "National level",
//                                 "label_sp": "",
//                                 "label_fr": "",
//                                 "label_pr": ""
//                             },
//                             "realmCountry": {
//                                 "active": false,
//                                 "realmCountryId": 1,
//                                 "country": {
//                                     "active": false,
//                                     "countryId": 2,
//                                     "countryCode": "KEN",
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 306,
//                                         "label_en": "Kenya",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "currency": null
//                                 },
//                                 "realm": {
//                                     "active": false,
//                                     "realmId": 1,
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 4,
//                                         "label_en": "USAID",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "realmCode": "UAID",
//                                     "defaultRealm": false
//                                 },
//                                 "defaultCurrency": null
//                             },
//                             "gln": '1298769856365',
//                             "capacityCbm": '40,000',
//                             "regionIdString": "1",
//                             "programName": "HIV/AIDS - Kenya - Ministry Of Health   \n HIV/AIDS - Malawi - National ",
//                         },
//                         {
//                             "active": true,
//                             "regionId": 2,
//                             "label": {
//                                 "active": false,
//                                 "labelId": 42,
//                                 "label_en": "North",
//                                 "label_sp": "",
//                                 "label_fr": "",
//                                 "label_pr": ""
//                             },
//                             "realmCountry": {
//                                 "active": false,
//                                 "realmCountryId": 2,
//                                 "country": {
//                                     "active": false,
//                                     "countryId": 3,
//                                     "countryCode": "MWI",
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 343,
//                                         "label_en": "Malawi",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "currency": null
//                                 },
//                                 "realm": {
//                                     "active": false,
//                                     "realmId": 1,
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 4,
//                                         "label_en": "USAID",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "realmCode": "UAID",
//                                     "defaultRealm": false
//                                 },
//                                 "defaultCurrency": null
//                             },
//                             "gln": '6758432123456',
//                             "capacityCbm": '18,000',
//                             "regionIdString": "2",
//                             "programName": "HIV/AIDS - Kenya - Ministry Of Health \n Malaria - Kenya - National",
//                         },
//                         {
//                             "active": true,
//                             "regionId": 3,
//                             "label": {
//                                 "active": false,
//                                 "labelId": 43,
//                                 "label_en": "South",
//                                 "label_sp": "",
//                                 "label_fr": "",
//                                 "label_pr": ""
//                             },
//                             "realmCountry": {
//                                 "active": false,
//                                 "realmCountryId": 2,
//                                 "country": {
//                                     "active": false,
//                                     "countryId": 3,
//                                     "countryCode": "MWI",
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 343,
//                                         "label_en": "Malawi",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "currency": null
//                                 },
//                                 "realm": {
//                                     "active": false,
//                                     "realmId": 1,
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 4,
//                                         "label_en": "USAID",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "realmCode": "UAID",
//                                     "defaultRealm": false
//                                 },
//                                 "defaultCurrency": null
//                             },
//                             "gln": '5678903456789',
//                             "capacityCbm": '13,500',
//                             "regionIdString": "3",
//                             "programName": "HIV/AIDS - Kenya - Ministry Of Health \n Malaria - Kenya - National",
//                         }

//                         ],
//                         loading: false
//                     })
//                 } else {
//                     this.setState({ message: response.data.messageCode })
//                 }
//             })

//         RealmCountryService.getRealmCountryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountryList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     })
//                 }
//             })
//     }

//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     render() {

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const { realmCountryList } = this.state;
//         let realmCountries = realmCountryList.length > 0
//             && realmCountryList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmCountryId}>
//                         {getLabelText(item.country.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const columns = [
//             {
//                 dataField: 'realmCountry.country.label',
//                 text: i18n.t('static.region.country'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel,
//                 style: { width: '80px' },
//             },
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.region.region'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel,
//                 style: { width: '80px' },
//             },
//             {
//                 dataField: 'programName',
//                 text: i18n.t('static.program.program'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '80px' },
//             },
//             {
//                 dataField: 'gln',
//                 text: i18n.t('static.region.gln'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '10px' },
//             },
//             {
//                 dataField: 'capacityCbm',
//                 text: 'Capacity (CBM)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '10px' },
//             }

//         ];
//         const options = {
//             hidePageListOnlyOnePage: true,
//             firstPageText: i18n.t('static.common.first'),
//             prePageText: i18n.t('static.common.back'),
//             nextPageText: i18n.t('static.common.next'),
//             lastPageText: i18n.t('static.common.last'),
//             nextPageTitle: i18n.t('static.common.firstPage'),
//             prePageTitle: i18n.t('static.common.prevPage'),
//             firstPageTitle: i18n.t('static.common.nextPage'),
//             lastPageTitle: i18n.t('static.common.lastPage'),
//             showTotal: true,
//             paginationTotalRenderer: customTotal,
//             disablePageTitle: true,
//             sizePerPageList: [{
//                 text: '10', value: 10
//             }, {
//                 text: '30', value: 30
//             }
//                 ,
//             {
//                 text: '50', value: 50
//             },
//             {
//                 text: 'All', value: this.state.selRegion.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>Warehouse Capacity Report</strong>{' '}
//                         <div className="card-header-actions">
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
//                         </div>
//                     </CardHeader>
//                     <CardBody className="pb-lg-0">

//                         {/* <Form >
//                             <Col md="12 pl-0">
//                                 <div className="row">
//                                     <FormGroup className="col-md-3">
//                                         <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>
//                                         </InputGroup>
//                                     </FormGroup>

//                                     <FormGroup className="col-md-3">
//                                         <Label htmlFor="countrysId">Program</Label>
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>
//                                         </InputGroup>
//                                     </FormGroup>

//                                 </div>
//                             </Col>
//                         </Form> */}

//                         <Col md="6 pl-0">
//                             <div className="d-md-flex Selectdiv2">
//                                 <FormGroup>
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Program</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {/* <option value="1" selected>HIV/AIDS - Malawi - Ministry Of Health</option> */}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 {/* <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Version</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 <option value="1" selected>6</option>
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup> */}
//                             </div>
//                         </Col>


//                         <ToolkitProvider
//                             keyField="regionId"
//                             data={this.state.selRegion}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (

//                                     <div className="TableCust">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             /* rowEvents={{
//                                                  onClick: (e, row, rowIndex) => {
//                                                      this.editRegion(row);
//                                                  }
//                                              }}*/
//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>
//                     </CardBody>
//                 </Card>
//                 <div style={{ display: this.state.loading ? "block" : "none" }}>
//                     <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                         <div class="align-items-center">
//                             <div ><h4> <strong>Loading...</strong></h4></div>

//                             <div class="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }
// export default RegionListComponent;



import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import i18n from '../../i18n'
import Pdf from "react-to-pdf"
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import { Online, Offline } from "react-detect-offline";
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ReportService from '../../api/ReportService';
import RealmCountryService from '../../api/RealmCountryService';

class warehouseCapacity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            countries: [],
            message: '',
            programLst: [],
            data: [],
            offlinePrograms: [],
            lang: localStorage.getItem('lang'),

        };
        this.getCountrylist = this.getCountrylist.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.formatLabel = this.formatLabel.bind(this);

    }

    componentDidMount() {

        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            this.getCountrylist();
            this.getPrograms();
        } else {
            this.getPrograms();
        }
    }
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    exportPDF = (columns) => {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
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

        //-------------------------------------
        // const unit = "pt";
        // const size = "A4"; // Use A1, A2, A3 or A4
        // const orientation = "landscape"; // portrait or landscape
        // const marginLeft = 10;
        // const doc = new jsPDF(orientation, unit, size);
        // doc.setFontSize(8);
        // doc.autoTable({
        //     html: '#mytable',
        //     bodyStyles: { minCellHeight: 15 },
        //     didDrawCell: function (data) {
        //         if (data.column.index === 5 && data.cell.section === 'body') {
        //             var td = data.cell.raw;
        //             var img = td.getElementsByTagName('img')[0];
        //             var dim = data.cell.height - data.cell.padding('vertical');
        //             var textPos = data.cell.textPos;
        //             doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
        //         }
        //     }
        // });
        //----------------------------------------

        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.warehouseCapacity'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')

                    if (navigator.onLine) {

                        doc.text(i18n.t('static.program.realmcountry') + ' : ' + document.getElementById("countryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                            align: 'left'
                        })

                        doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                            align: 'left'
                        })

                    } else {
                        doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programIdOffline").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                            align: 'left'
                        })
                    }

                }

            }
        }

        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(8);

        let content = {
            margin: { top: 40 },
            margin: { left: 100 },
            startY: 150,
            // head: [headers],
            // body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 80, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 100 },
                2: { cellWidth: 200 },
                3: { cellWidth: 100 },
                4: { cellWidth: 100 },
            },
            html: '#mytable',
            // bodyStyles: { minCellHeight: 15 },
            didDrawCell: function (data) {
                if (data.column.index === 5 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };

        doc.autoTable(content);
        // doc.autoTable({
        //     html: '#mytable',
        //     bodyStyles: { minCellHeight: 15 },
        //     didDrawCell: function (data) {
        //         if (data.column.index === 5 && data.cell.section === 'body') {
        //             var td = data.cell.raw;
        //             var img = td.getElementsByTagName('img')[0];
        //             var dim = data.cell.height - data.cell.padding('vertical');
        //             var textPos = data.cell.textPos;
        //             doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
        //         }
        //     }
        // });
        addHeaders(doc)
        addFooters(doc)

        doc.save(i18n.t('static.report.warehouseCapacity') + ".pdf")
    }

    getCountrylist() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryrealmIdById(realmId)
            .then(response => {
                this.setState({
                    countries: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        countries: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    filterProgram = () => {
        let countryId = document.getElementById("countryId").value;
        if (countryId != 0) {
            const programLst = this.state.programs.filter(c => c.realmCountry.realmCountryId == countryId)
            if (programLst.length > 0) {

                this.setState({
                    programLst: programLst
                }, () => {
                    // this.fetchData() 
                });
            } else {
                this.setState({
                    programLst: []
                });
            }
        }
    }

    getPrograms() {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            ProgramService.getProgramByRealmId(realmId)
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
                        })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            console.log('offline Program list')
            this.consolidatedProgramList()
        }
    }

    consolidatedProgramList = () => {
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
                    offlinePrograms: proList
                })

            }.bind(this);
        }.bind(this);
    }

    fetchData() {
        if (navigator.onLine) {
            let programId = document.getElementById("programId").value;
            let countryId = document.getElementById("countryId").value;

            AuthenticationService.setupAxiosInterceptors();
            let inputjson = {
                realmCountryId: countryId,
                programId: programId
            }
            ReportService.wareHouseCapacityExporttList(inputjson)
                .then(response => {
                    console.log("RESP-------->>", response.data)
                    this.setState({
                        data: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            data: []
                        })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            let programId = document.getElementById("programIdOffline").value;
            console.log("offline ProgramId---", programId);
            var db1;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;

                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programRequest = programTransaction.get(programId);

                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var regionList = (programJson.regionList);
                    let offlineData = [];

                    for (var i = 0; i < regionList.length; i++) {
                        let json = {
                            "realmCountry": regionList[i].realmCountry,
                            "programList": [
                                {
                                    "id": 3,
                                    "label": {
                                        "active": false,
                                        "labelId": 136,
                                        "label_en": "HIV/AIDS - Malawi - National",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "code": "MWI-FRH-MOH"
                                },
                                {
                                    "id": 4,
                                    "label": {
                                        "active": false,
                                        "labelId": 136,
                                        "label_en": "HIV/AIDS - Kenya - National",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "code": "MWI-FRH-MOH"
                                }
                            ],
                            "region": {
                                "id": 2,
                                "label": {
                                    "active": false,
                                    "labelId": 42,
                                    "label_en": "North",
                                    "label_sp": "",
                                    "label_fr": "",
                                    "label_pr": ""
                                }
                            },
                            "gln": null,
                            "capacityCbm": 18000
                        }
                        offlineData.push(json);
                    }


                    console.log("final wareHouseCapacity Report---", regionList);
                    this.setState({
                        data: regionList
                    });

                }.bind(this)

            }.bind(this)

        }

    }

    render() {
        const { programLst } = this.state;
        let programList = programLst.length > 0
            && programLst.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { offlinePrograms } = this.state;
        const { countries } = this.state;
        let countryList = countries.length > 0 && countries.map((item, i) => {
            return (
                <option key={i} value={item.realmCountryId}>
                    {getLabelText(item.country.label, this.state.lang)}
                </option>
            )

        }, this);

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.report.warehouseCapacity')}</strong>

                        <Online>
                            {
                                this.state.data.length > 0 &&
                                <div className="card-header-actions">
                                    <a className="card-header-action">
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                    </a>
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                </div>
                            }
                        </Online>
                        <Offline>
                            {
                                this.state.data.length > 0 &&
                                <div className="card-header-actions">
                                    <a className="card-header-action">
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                    </a>
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                </div>
                            }
                        </Offline>
                    </CardHeader>
                    <CardBody>
                        <div className="TableCust" >
                            <div>
                                <Form >
                                    <Col md="12 pl-0">
                                        <div className="row">
                                            <Online>
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="countryId">{i18n.t('static.program.realmcountry')}<span className="red Reqasterisk">*</span></Label>
                                                    <div className="controls edit">
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                bsSize="sm"
                                                                name="countryId"
                                                                id="countryId"
                                                                onChange={(e) => { this.filterProgram(); }}
                                                            >  <option value="0">{i18n.t('static.common.select')}</option>
                                                                {countryList}</Input>
                                                            {!!this.props.error &&
                                                                this.props.touched && (
                                                                    <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                                )}
                                                        </InputGroup>

                                                    </div>
                                                </FormGroup>
                                            </Online>
                                            <Online>

                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                    <div className="controls ">
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="programId"
                                                                id="programId"
                                                                bsSize="sm"
                                                                onChange={(e) => { this.fetchData(e) }}


                                                            >
                                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                                {programList}
                                                            </Input>

                                                        </InputGroup>
                                                    </div>
                                                </FormGroup>
                                            </Online>

                                            <Offline>
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                    <div className="controls ">
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="programIdOffline"
                                                                id="programIdOffline"
                                                                bsSize="sm"
                                                                onChange={(e) => { this.fetchData(e) }}


                                                            >
                                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                                {offlinePrograms.length > 0
                                                                    && offlinePrograms.map((item, i) => {
                                                                        return (
                                                                            <option key={i} value={item.id}>
                                                                                {item.name}
                                                                            </option>
                                                                        )
                                                                    }, this)}
                                                            </Input>

                                                        </InputGroup>
                                                    </div>
                                                </FormGroup>
                                            </Offline>

                                        </div>
                                    </Col>
                                </Form>

                                <Col md="12 pl-0">

                                    <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">

                                            <Table id="mytable" responsive className="table-striped table-hover table-bordered text-center mt-2">
                                                <thead>
                                                    <tr>
                                                        <th>{i18n.t('static.region.country')}</th>
                                                        <th>{i18n.t('static.region.region')}</th>
                                                        <th>{i18n.t('static.program.program')}</th>
                                                        <th>{i18n.t('static.region.gln')}</th>
                                                        <th>{i18n.t('static.region.capacitycbm')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.data.length > 0
                                                        &&
                                                        this.state.data.map((item, idx) =>
                                                            <tr id="addr0" key={idx} >
                                                                <td>{getLabelText(this.state.data[idx].realmCountry.label, this.state.lang)}</td>
                                                                <td>{getLabelText(this.state.data[idx].region.label, this.state.lang)}</td>
                                                                <td>
                                                                    {
                                                                        this.state.data[idx].programList.map((item, idx1) =>
                                                                            <>
                                                                                <span id="addr1" key={idx1}>{this.state.data[idx].programList[idx1].label.label_en}</span> <br />
                                                                            </>
                                                                        )
                                                                    }

                                                                </td>
                                                                <td>{this.state.data[idx].gln}</td>
                                                                <td>{this.state.data[idx].capacityCbm}</td>
                                                            </tr>
                                                        )}

                                                </tbody>

                                            </Table>
                                        </div>
                                    </div>

                                </Col>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div >
        );
    }
}

export default warehouseCapacity;