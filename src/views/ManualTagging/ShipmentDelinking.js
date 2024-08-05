// import React, { Component } from 'react';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import CountryService from '../../api/CountryService.js';
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import getLabelText from '../../CommonComponent/getLabelText';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import { DATE_FORMAT_CAP } from '../../Constants.js';
// import moment from 'moment';

// import i18n from '../../i18n';
// import { boolean } from 'yup';
// import ProgramService from '../../api/ProgramService.js';
// import ManualTaggingService from '../../api/ManualTaggingService.js';
// import PlanningUnitService from '../../api/PlanningUnitService.js';



// const entityname = i18n.t('static.dashboard.delinking');
// export default class ShipmentDelinking extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             message: '',
//             outputList: [],
//             loading: true,
//             programs: [],
//             planningUnits: [],
//             shipmentId: ''
//         }
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//         this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
//         this.delinkShipment = this.delinkShipment.bind(this);
//         this.getProgramList = this.getProgramList.bind(this);
//     }
//     delinkShipment(event, row) {
//         event.stopPropagation();
//         // console.log("shipment id row---"+row.shipmentId);
//         ManualTaggingService.delinkShipment(row.shipmentId)
//             .then(response => {
//                 // console.log("link response===", response);
//                 this.setState({
//                     message : i18n.t('static.shipment.delinkingsuccess')
//                 })
//                 this.filterData();
//             })
//     }
//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//             document.getElementById('div1').style.display = 'none';
//         }, 8000);
//     }
//     componentWillUnmount() {
//         clearTimeout(this.timeout);
//     }

//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     filterData() {
//         var programId = document.getElementById("programId").value;
//         var planningUnitId = document.getElementById("planningUnitId").value;
//         ManualTaggingService.getShipmentListForDelinking(programId, planningUnitId)
//             .then(response => {
//                 // console.log("manual tagging response===", response);
//                 this.setState({
//                     outputList: response.data
//                 })
//             })
//     }

//     getProgramList() {
//         ProgramService.getProgramList()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         programs: response.data
//                     })
//                 }
//                 else {

//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })
//     }
//     componentDidMount() {
//         this.hideFirstComponent();
//         this.getProgramList();
//     }

//     getPlanningUnitList() {
//         var programId = document.getElementById("programId").value;
//         ProgramService.getProgramPlaningUnitListByProgramId(programId)
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         planningUnits: response.data
//                     })
//                 }
//                 else {

//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })
//     }

//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     toggleLarge() {
//         this.setState({
//             artmisList: [],
//             manualTag: !this.state.manualTag,
//         })
//     }

//     addCommas(cell, row) {
//         // console.log("row---------->", row);
//         cell += '';
//         var x = cell.split('.');
//         var x1 = x[0];
//         var x2 = x.length > 1 ? '.' + x[1] : '';
//         var rgx = /(\d+)(\d{3})/;
//         while (rgx.test(x1)) {
//             x1 = x1.replace(rgx, '$1' + ',' + '$2');
//         }
//         return x1 + x2;
//     }

//     formatDate(cell, row) {
//         if (cell != null && cell != "") {
//             var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
//             return modifiedDate;
//         } else {
//             return "";
//         }
//     }

//     render() {
//         const { programs } = this.state;
//         let programList = programs.length > 0 && programs.map((item, i) => {
//             return (
//                 <option key={i} value={item.programId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);

//         const { planningUnits } = this.state;
//         let planningUnitList = planningUnits.length > 0 && planningUnits.map((item, i) => {
//             return (
//                 <option key={i} value={item.planningUnit.id}>
//                     {getLabelText(item.planningUnit.label, this.state.lang)}
//                 </option>
//             )
//         }, this);

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const columns = [
//             {
//                 dataField: 'shipmentId',
//                 text: 'Shipment Id',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'shipmentTransId',
//                 hidden: true,
//             },
//             {
//                 dataField: 'expectedDeliveryDate',
//                 text: 'Expected Delivery Date',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatDate
//             },
//             {
//                 dataField: 'shipmentStatus.label',
//                 text: 'Shipment Status',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             }, {
//                 dataField: 'procurementAgent.code',
//                 text: 'Planning Unit',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 // formatter: this.formatLabel
//             },
//             {
//                 dataField: 'budget.label',
//                 text: 'Budget',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'shipmentQty',
//                 text: 'Shipment Quantity',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.addCommas
//             },
//             {
//                 dataField: 'fundingSource.code',
//                 text: 'Funding Source',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 // dataField: 'shipmentId',
//                 text: "Delink",
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cellContent, row) => {
//                     return (<Button type="button" size="sm" color="success" title="Delink Shipment" onClick={(event) => this.delinkShipment(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.common.dlink')}</Button>
//                     )
//                 }
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
//                 text: 'All', value: this.state.outputList.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
//                 <Card >
//                     <CardBody className="">
//                         <Col md="10 pl-0">
//                             <div className="d-md-flex">
//                                 <FormGroup className="col-md-4 pl-0">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="programId"
//                                                 id="programId"
//                                                 bsSize="sm"
//                                                 onChange={this.getPlanningUnitList}
//                                             >
//                                                 <option value="">{i18n.t('static.common.select')}</option>
//                                                 {programList}
//                                             </Input>
//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                                 <FormGroup className="col-md-4">
//                                     <Label htmlFor="appendedInputButton">Planning Unit</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="planningUnitId"
//                                                 id="planningUnitId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="">{i18n.t('static.common.select')}</option>
//                                                 {planningUnitList}

//                                             </Input>
//                                             {/* <InputGroupAddon addonType="append">
//                                                                         <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
//                                                                     </InputGroupAddon> */}
//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                             </div>
//                         </Col>

//                         <ToolkitProvider
//                             keyField="countryId"
//                             data={this.state.outputList}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left ShipmentdelinkingSearchposition">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}

//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>

//                     </CardBody>
//                 </Card>
//                 {/* <div style={{ display: this.state.loading ? "block" : "none" }}>
//                     <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                         <div class="align-items-center">
//                             <div ><h4> <strong>Loading...</strong></h4></div>

//                             <div class="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div> */}
//             </div>
//         );
//     }

// }


import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import CountryService from '../../api/CountryService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { API_URL, DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import moment from 'moment';

import i18n from '../../i18n';
import { boolean } from 'yup';
import ProgramService from '../../api/ProgramService.js';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css


const entityname = i18n.t('static.dashboard.delinking');
export default class ShipmentDelinking extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            outputList: [],
            loading: true,
            programs: [],
            planningUnits: [],
            shipmentId: '',
            haslink: false,
            notes: false,
            shipmentId: '',
            active: true,
            programId: ''
        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.delinkShipment = this.delinkShipment.bind(this);
        this.getProgramList = this.getProgramList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.programChange = this.programChange.bind(this);
    }

    programChange(event) {
        this.setState({
            programId: event.target.value
        });
    }
    dataChange(val) {
        // console.log("val---------------------------%%%%%%%%%%%%%", val)
        if (val === "no") {
            this.toggleLarge();
        }

        this.setState({
            notes: val === "no" ? false : true
        },
            () => { });
    }
    delinkShipment() {
        let notes = document.getElementById("notesTxt").value;
        let programId = document.getElementById("programId").value;
        if (notes != "") {
            this.setState({ loading: true })
            ManualTaggingService.delinkShipment(this.state.shipmentId, notes, programId)
                .then(response => {
                    // console.log("link response===", response);
                    this.setState({
                        message: i18n.t('static.shipment.delinkingsuccess'),
                        color: 'green',
                        haslink: true,
                        loading: false

                    }, () => {
                        this.hideSecondComponent();
                        document.getElementById('div2').style.display = 'block';
                        this.filterData();
                    });

                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
            this.toggleLarge();
        } else {
            this.setState({
                enterNotes: i18n.t('static.common.notesvalidation')
            })
        }
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    buildJExcel() {
        let outputList = this.state.outputList;
        // // console.log("outputList---->", outputList);
        let outputArray = [];
        let count = 0;

        for (var j = 0; j < outputList.length; j++) {
            data = [];
            data[0] = outputList[j].shipmentId
            data[1] = outputList[j].shipmentTransId;
            data[2] = this.formatDate(outputList[j].expectedDeliveryDate);
            data[3] = getLabelText(outputList[j].shipmentStatus.label, this.state.lang);
            data[4] = outputList[j].procurementAgent.code;
            data[5] = outputList[j].fundingSource.code;
            data[6] = getLabelText(outputList[j].budget.label, this.state.lang);
            data[7] = this.addCommas(outputList[j].shipmentQty);

            outputArray[count] = data;
            count++;
        }
        // if (outputList.length == 0) {
        //     data = [];
        //     outputArray[0] = data;
        // }
        // // console.log("outputArray---->", outputArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);

        var json = [];
        var data = outputArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [20, 25, 20, 20, 40, 40, 40, 25],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.commit.qatshipmentId'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.commit.shipmentTransId'),
                    type: 'hidden',
                    // readOnly: true
                    // title: 'A',
                    // type: 'text',
                    // visible: false
                },
                {
                    title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.mtshipmentStatus'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.procurementagentcode'),
                    type: 'text',
                    // readOnly: true
                },

                {
                    title: i18n.t('static.fundingsource.fundingsourceCode'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.budget'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.shipmentQty'),
                    type: 'text',
                    // readOnly: true
                }

            ],
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            editable: false,

            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            // contextMenu: function (obj, x, y, e) {
            //     var items = [];
            //     if (y != null) {
            //         if (obj.options.allowInsertRow == true) {
            //             items.push({
            //                 title: i18n.t('static.common.dlink'),
            //                 onclick: function () {
            //                     this.setState({ loading: true })
            //                     ManualTaggingService.delinkShipment(`${this.el.getValueFromCoords(0, y)}`)
            //                         .then(response => {
            //                             // console.log("link response===", response);
            //                             this.setState({
            //                                 message: i18n.t('static.shipment.delinkingsuccess'),
            //                                 color: 'green',
            //                                 haslink: true,
            //                                 loading: false

            //                             }, () => {
            //                                 this.hideSecondComponent();
            //                                 document.getElementById('div2').style.display = 'block';
            //                                 this.filterData();
            //                             });

            //                         }).catch(
            //                             error => {
            //                                 if (error.message === "Network Error") {
            //                                     this.setState({
            //                                         message: 'static.unkownError',
            //                                         loading: false
            //                                     });
            //                                 } else {
            //                                     switch (error.response ? error.response.status : "") {

            //                                         case 401:
            //                                             this.props.history.push(`/login/static.message.sessionExpired`)
            //                                             break;
            //                                         case 403:
            //                                             this.props.history.push(`/accessDenied`)
            //                                             break;
            //                                         case 500:
            //                                         case 404:
            //                                         case 406:
            //                                             this.setState({
            //                                                 message: error.response.data.messageCode,
            //                                                 loading: false
            //                                             });
            //                                             break;
            //                                         case 412:
            //                                             this.setState({
            //                                                 message: error.response.data.messageCode,
            //                                                 loading: false
            //                                             });
            //                                             break;
            //                                         default:
            //                                             this.setState({
            //                                                 message: 'static.unkownError',
            //                                                 loading: false
            //                                             });
            //                                             break;
            //                                     }
            //                                 }
            //                             }
            //                         );

            //                 }.bind(this)
            //             });
            //         }
            //     }

            //     return items;
            // }.bind(this)
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {

            if ((x == 0 && value != 0) || (y == 0)) {
                // console.log("HEADER SELECTION--------------------------");
            } else {
                this.setState({
                    shipmentId: `${this.el.getValueFromCoords(0, x)}`
                })
                this.toggleLarge();
                // confirmAlert({
                //     message: i18n.t('static.mt.confirmDelink'),
                //     buttons: [
                //         {
                //             label: i18n.t('static.program.yes'),
                //             onClick: () => {
                //                 var userName = prompt('Please Enter your Name')

                //             }
                //         },
                //         {
                //             label: i18n.t('static.program.no')
                //         }
                //     ]
                // });
                // var outputListAfterSearch = [];
                // let row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, x)))[0];
                // outputListAfterSearch.push(row);

                // this.setState({
                //     shipmentId: this.el.getValueFromCoords(0, x),
                //     outputListAfterSearch
                // })
                // this.toggleLarge();
            }
        }
    }.bind(this);

    filterData() {
        document.getElementById('div2').style.display = 'block';
        var programId = document.getElementById("programId").value;
        var planningUnitId = document.getElementById("planningUnitId").value;
        if (programId != -1 && planningUnitId != 0) {
            this.setState({ loading: true })
            // console.log("HASLINKED------->", this.state.haslink);
            if (this.state.haslink) {
                this.setState({ haslink: false })
            } else {
                this.setState({ message: '' })
            }
            ManualTaggingService.getShipmentListForDelinking(programId, planningUnitId)
                .then(response => {
                    // console.log("manual tagging response===", response);
                    this.setState({
                        outputList: response.data,
                        // message: ''
                    }, () => {
                        this.buildJExcel();
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else if (programId == -1) {
            // console.log("2-programId------>", programId);
            this.setState({
                outputList: [],
                message: i18n.t('static.program.validselectprogramtext'),
                color: '#BA0C2F'
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                // this.el.destroy();
                jexcel.destroy(document.getElementById("tableDiv"), true);

            });
        } else if (planningUnitId == 0) {
            // console.log("3-programId------>", programId);
            this.setState({
                outputList: [],
                message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                color: '#BA0C2F'
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                // this.el.destroy();
                jexcel.destroy(document.getElementById("tableDiv"), true);

            });
        }


    }

    toggleLarge = () => {
        this.setState({
            manualTag: !this.state.manualTag,
            enterNotes: "",
            notes: false
        })
    }

    getProgramList() {
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    if (response.data.length == 1) {
                        this.setState({
                            programs: response.data,
                            loading: false,
                            programId: response.data[0].programId
                        }, () => {
                            this.getPlanningUnitList();
                        })
                    } else {
                        this.setState({
                            programs: listArray, loading: false
                        })
                    }

                }
                else {

                    this.setState({
                        message: response.data.messageCode, loading: false, color: '#BA0C2F'
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }
    componentDidMount() {
        this.hideFirstComponent();
        this.getProgramList();
    }

    getPlanningUnitList() {
        var programId = document.getElementById("programId").value;
        if (programId > 0) {
            ProgramService.getProgramPlaningUnitListByProgramId(programId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray
                        })
                    }
                    else {

                        this.setState({
                            message: response.data.messageCode, color: '#BA0C2F'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
        this.filterData();

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    toggleLarge() {
        this.setState({
            artmisList: [],
            manualTag: !this.state.manualTag,
        })
    }

    addCommas(cell, row) {
        // console.log("row---------->", row);
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0 && planningUnits.map((item, i) => {
            return (
                <option key={i} value={item.planningUnit.id}>
                    {getLabelText(item.planningUnit.label, this.state.lang)}
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
                dataField: 'shipmentId',
                text: i18n.t('static.commit.shipmentId'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'shipmentTransId',
                hidden: true,
            },
            {
                dataField: 'expectedDeliveryDate',
                text: i18n.t('static.shipment.edd'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'shipmentStatus.label',
                text: i18n.t('static.supplyPlan.shipmentStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            }, {
                dataField: 'procurementAgent.code',
                text: i18n.t('static.common.product'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            {
                dataField: 'budget.label',
                text: i18n.t('static.budgetHead.budget'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'shipmentQty',
                text: i18n.t('static.supplyPlan.shipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'fundingSource.code',
                text: i18n.t('static.fundingSourceHead.fundingSource'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                // dataField: 'shipmentId',
                text: "Delink",
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (<Button type="button" size="sm" color="success" title={i18n.t('static.common.dlink')} onClick={(event) => this.delinkShipment(event, row)
                    } > <i className="fa fa-check"></i>{i18n.t('static.common.dlink')}</Button >
                    )
                }
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
                text: 'All', value: this.state.outputList.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pb-lg-5">
                        <Col md="10 pl-0">
                            <div className="d-md-flex">
                                <FormGroup className="col-md-4 pl-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                // onChange={this.getPlanningUnitList}
                                                onChange={(e) => { this.programChange(e); this.getPlanningUnitList(e); }}
                                            >
                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-4">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {planningUnitList}

                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                                        <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                                                    </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div className="ReportSearchMarginTop">
                            <div id="tableDiv" className="jexcelremoveReadonlybackground">
                            </div>
                        </div>

                        {/* Consumption modal */}
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-sm ' + this.props.className}>
                            <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.dashboard.delinking')}</strong>
                            </ModalHeader>
                            <ModalBody>
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h4>{i18n.t('static.mt.confirmDelink')}</h4>
                                        </div>
                                        <div className="col-md-12 float-right">
                                            <Button className="float-right mr-1" color="secondary Gobtn btn-sm" onClick={() => { this.dataChange("no") }}>{i18n.t('static.program.no')}</Button>
                                            <Button className="float-right mr-1" color="secondary Gobtn btn-sm" onClick={() => { this.dataChange("yes") }}>{i18n.t('static.program.yes')}</Button>
                                        </div>
                                    </div>
                                    {this.state.notes &&
                                        <FormGroup className="col-md-12">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="textarea"
                                                        name="notesTxt"
                                                        id="notesTxt"
                                                        bsSize="sm"
                                                        autocomplete="off"
                                                    // maxLength={600}
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>

                                    }
                                    <h5 style={{ color: '#BA0C2F', marginLeft: '16px', marginTop: '-12px' }}>{i18n.t(this.state.enterNotes)}</h5>

                                </Col>

                            </ModalBody>
                            <ModalFooter>

                                {this.state.notes &&
                                    <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.delinkShipment}> <i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                }
                            </ModalFooter>
                        </Modal>
                        {/* Consumption modal */}
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}