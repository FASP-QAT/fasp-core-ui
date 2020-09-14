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
//         console.log("shipment id row---"+row.shipmentId);
//         ManualTaggingService.delinkShipment(row.shipmentId)
//             .then(response => {
//                 console.log("link response===", response);
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
//                 console.log("manual tagging response===", response);
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
//         console.log("row---------->", row);
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
import { DATE_FORMAT_CAP } from '../../Constants.js';
import moment from 'moment';

import i18n from '../../i18n';
import { boolean } from 'yup';
import ProgramService from '../../api/ProgramService.js';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";



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
            haslink: false
        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.delinkShipment = this.delinkShipment.bind(this);
        this.getProgramList = this.getProgramList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    delinkShipment(event, row) {
        event.stopPropagation();
        console.log("shipment id row---" + row.shipmentId);
        ManualTaggingService.delinkShipment(row.shipmentId)
            .then(response => {
                console.log("link response===", response);
                this.setState({
                    message: i18n.t('static.shipment.delinkingsuccess'),
                    color: 'green',
                    haslink: true
                },
                    () => {
                        console.log(this.state.message, "success 1")
                        this.hideSecondComponent();
                        document.getElementById('div2').style.display = 'block';
                        this.filterData();
                    })
            })
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    buildJExcel() {
        let outputList = this.state.outputList;
        // console.log("outputList---->", outputList);
        let outputArray = [];
        let count = 0;

        for (var j = 0; j < outputList.length; j++) {
            data = [];
            data[0] = outputList[j].shipmentId
            data[1] = outputList[j].shipmentTransId;
            data[2] = this.formatDate(outputList[j].expectedDeliveryDate);
            data[3] = getLabelText(outputList[j].shipmentStatus.label, this.state.lang);
            data[4] = outputList[j].procurementAgent.code;
            data[5] = getLabelText(outputList[j].budget.label, this.state.lang);
            data[6] = this.addCommas(outputList[j].shipmentQty);
            data[7] = outputList[j].fundingSource.code;

            outputArray[count] = data;
            count++;
        }
        // if (outputList.length == 0) {
        //     data = [];
        //     outputArray[0] = data;
        // }
        // console.log("outputArray---->", outputArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = outputArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.commit.shipmentId'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.commit.shipmentTransId'),
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.expectedDeliveryDate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.shipmentStatus'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.procurementagentcode'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.budget'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.shipmentQty'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.fundingsource.fundingsourceCode'),
                    type: 'text',
                    readOnly: true
                },

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: 10,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,


            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: [10, 25, 50],
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.dlink'),
                            onclick: function () {
                                this.setState({ loading: true })
                                ManualTaggingService.delinkShipment(`${this.el.getValueFromCoords(0, y)}`)
                                    .then(response => {
                                        console.log("link response===", response);
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

                                    })

                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this)
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

    filterData() {
        document.getElementById('div2').style.display = 'block';
        var programId = document.getElementById("programId").value;
        var planningUnitId = document.getElementById("planningUnitId").value;
        if (programId != -1 && planningUnitId != 0) {
            this.setState({ loading: true })
            console.log("HASLINKED------->", this.state.haslink);
            if (this.state.haslink) {
                this.setState({ haslink: false })
            } else {
                this.setState({ message: '' })
            }
            ManualTaggingService.getShipmentListForDelinking(programId, planningUnitId)
                .then(response => {
                    console.log("manual tagging response===", response);
                    this.setState({
                        outputList: response.data,
                        // message: ''
                    }, () => {
                        this.buildJExcel();
                    });
                })
        } else if (programId == -1) {
            console.log("2-programId------>", programId);
            this.setState({
                outputList: [],
                message: i18n.t('static.program.validselectprogramtext'),
                color: 'red'
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
        } else if (planningUnitId == 0) {
            console.log("3-programId------>", programId);
            this.setState({
                outputList: [],
                message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                color: 'red'
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
        }


    }

    getProgramList() {
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programs: response.data, loading: false
                    })
                }
                else {

                    this.setState({
                        message: response.data.messageCode, loading: false, color: 'red'
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })
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
                        this.setState({
                            planningUnits: response.data
                        })
                    }
                    else {

                        this.setState({
                            message: response.data.messageCode, color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                })
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
        console.log("row---------->", row);
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
                text: 'Shipment Id',
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
                text: 'Expected Delivery Date',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'shipmentStatus.label',
                text: 'Shipment Status',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            }, {
                dataField: 'procurementAgent.code',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            {
                dataField: 'budget.label',
                text: 'Budget',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'shipmentQty',
                text: 'Shipment Quantity',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'fundingSource.code',
                text: 'Funding Source',
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
                    return (<Button type="button" size="sm" color="success" title="Delink Shipment" onClick={(event) => this.delinkShipment(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.common.dlink')}</Button>
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="">
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
                                                onChange={this.getPlanningUnitList}
                                            >
                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-4">
                                    <Label htmlFor="appendedInputButton">Planning Unit</Label>
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
                        <div id="tableDiv" className="jexcelremoveReadonlybackground">
                        </div>


                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}