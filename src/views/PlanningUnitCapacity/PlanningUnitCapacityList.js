// import React, { Component } from 'react';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory from 'react-bootstrap-table2-filter';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
// import getLabelText from '../../CommonComponent/getLabelText';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import PlanningUnitService from '../../api/PlanningUnitService';
// import PlanningUnitCapacityService from '../../api/PlanningUnitCapacityService';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import { DATE_FORMAT_CAP } from '../../Constants.js';
// import moment from 'moment';


// const entityname = i18n.t('static.dashboad.planningunitcapacity');
// export default class PlanningUnitCapacityList extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             planningUnits: [],
//             planningUnitCapacityList: [],
//             message: '',
//             selSource: []

//         }
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//     }

//     filterData() {
//         let planningUnitId = document.getElementById("planningUnitId").value;
//         console.log("planningUnitId---" + planningUnitId);
//         AuthenticationService.setupAxiosInterceptors();
//         if (planningUnitId != 0) {
//             const planningUnitCapacityList = this.state.selSource.filter(c => c.planningUnit.id == planningUnitId)
//             this.setState({
//                 planningUnitCapacityList
//             });
//         } else {
//             this.setState({
//                 planningUnitCapacityList: this.state.selSource
//             });
//         }

//     }


//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         PlanningUnitService.getAllPlanningUnitList().then(response => {
//             this.setState({
//                 planningUnits: response.data
//             })
//         })
//         PlanningUnitCapacityService.getPlanningUnitCapacityList().then(response => {
//             console.log("response.data---", response.data);
//             this.setState({
//                 planningUnitCapacityList: response.data,
//                 selSource: response.data
//             })
//         })
//     }



//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     render() {
//         const { planningUnits } = this.state;
//         let planningUnitList = planningUnits.length > 0
//             && planningUnits.map((item, i) => {
//                 return (
//                     <option key={i} value={item.planningUnitId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const columns = [{
//             dataField: 'planningUnit.label',
//             text: i18n.t('static.dashboard.planningunit'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         },
//         {
//             dataField: 'supplier.label',
//             text: i18n.t('static.dashboard.supplier'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'startDate',
//             text: i18n.t('static.common.startdate'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (
//                     (row.startDate ? moment(row.startDate).format(`${DATE_FORMAT_CAP}`) : null)
//                 );
//             }
//         }, {
//             dataField: 'stopDate',
//             text: i18n.t('static.common.stopdate'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (
//                     (row.stopDate ? moment(row.stopDate).format(`${DATE_FORMAT_CAP}`) : null)
//                     // (row.lastLoginDate ? moment(row.lastLoginDate).format('DD-MMM-YY hh:mm A') : null)
//                 );
//             }
//         }, {
//             dataField: 'capacity',
//             text: i18n.t('static.planningunit.capacity'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
//         },
//         {
//             dataField: 'active',
//             text: i18n.t('static.common.status'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (
//                     (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//                 );
//             }
//         }];
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
//                 text: 'All', value: this.state.selSource.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.capacitylist')}</strong> */}
//                         <div className="card-header-actions">

//                         </div>

//                     </div>
//                     <CardBody className="pb-lg-2">
//                         <Col md="3 pl-0">
//                             <FormGroup className="Selectdiv">
//                                 <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.planningunit')}</Label>
//                                 <div className="controls SelectGo">
//                                     <InputGroup>
//                                         <Input
//                                             type="select"
//                                             name="planningUnitId"
//                                             id="planningUnitId"
//                                             bsSize="sm"
//                                             onChange={this.filterData}
//                                         >
//                                             <option value="0">{i18n.t('static.common.all')}</option>
//                                             {planningUnitList}
//                                         </Input>
//                                         {/* <InputGroupAddon addonType="append">
//                                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                         </InputGroupAddon> */}
//                                     </InputGroup>
//                                 </div>
//                             </FormGroup>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="planningUnitCapacityId"
//                             data={this.state.planningUnitCapacityList}
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
//                                                      this.editPlanningUnitCapacity(row);
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
//             </div>
//         );
//     }

// }





import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import PlanningUnitCapacityService from '../../api/PlanningUnitCapacityService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import moment from 'moment';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'


const entityname = i18n.t('static.dashboad.planningunitcapacity');
export default class PlanningUnitCapacityList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            planningUnits: [],
            planningUnitCapacityList: [],
            message: '',
            selSource: []

        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    buildJexcel() {

        // let supplierList = this.state.selSource;

        let planningUnitCapacityList = this.state.selSource;
        // console.log("planningUnitCapacityList---->", planningUnitCapacityList);
        let planningUnitCapacityArray = [];
        let count = 0;

        for (var j = 0; j < planningUnitCapacityList.length; j++) {
            data = [];
            data[0] = planningUnitCapacityList[j].planningUnitCapacityId
            data[1] = getLabelText(planningUnitCapacityList[j].planningUnit.label, this.state.lang)
            data[2] = getLabelText(planningUnitCapacityList[j].supplier.label, this.state.lang)
            data[3] = (planningUnitCapacityList[j].startDate ? moment(planningUnitCapacityList[j].startDate).format(`${DATE_FORMAT_CAP}`) : null)
            data[4] = (planningUnitCapacityList[j].stopDate ? moment(planningUnitCapacityList[j].stopDate).format(`${DATE_FORMAT_CAP}`) : null)
            data[5] = planningUnitCapacityList[j].capacity
            data[6] = planningUnitCapacityList[j].lastModifiedBy.username;
            data[7] = (planningUnitCapacityList[j].lastModifiedDate ? moment(planningUnitCapacityList[j].lastModifiedDate).format(`${DATE_FORMAT_CAP}`) : null)
            data[8] = planningUnitCapacityList[j].active;
            planningUnitCapacityArray[count] = data;
            count++;
        }
        // if (planningUnitCapacityList.length == 0) {
        //     data = [];
        //     planningUnitCapacityArray[0] = data;
        // }
        // console.log("planningUnitCapacityArray---->", planningUnitCapacityArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = planningUnitCapacityArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'planningUnitCapacityId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.supplier'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.planningunit.capacity'),
                    type: 'numeric',
                    mask: '#,##.00',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
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
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
            license: JEXCEL_PRO_KEY,
        };
        var planningUnitCapacityEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = planningUnitCapacityEl;
        this.setState({
            planningUnitCapacityEl: planningUnitCapacityEl, loading: false
        })


    }


    filterData() {
        let planningUnitId = document.getElementById("planningUnitId").value;
        console.log("planningUnitId---" + planningUnitId);
        // AuthenticationService.setupAxiosInterceptors();
        if (planningUnitId != 0) {
            const planningUnitCapacityList = this.state.selSource.filter(c => c.planningUnit.id == planningUnitId)
            this.setState({
                planningUnitCapacityList
            },
                () => { this.buildJexcel() })
        } else {
            this.setState({
                planningUnitCapacityList: this.state.selSource
            },
                () => { this.buildJexcel() })
        }

    }


    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getAllPlanningUnitList().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                planningUnits: listArray
            })
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
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
        PlanningUnitCapacityService.getPlanningUnitCapacityList().then(response => {
            console.log("response.data---", response.data);
            this.setState({
                planningUnitCapacityList: response.data,
                selSource: response.data
            },
                () => { this.buildJexcel() })
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
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

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    render() {
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
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
                text: 'All', value: this.state.selSource.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.capacitylist')}</strong> */}
                        <div className="card-header-actions">

                        </div>

                    </div>
                    <CardBody className="pb-lg-2">
                        <Col md="3 pl-0">
                            <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.planningunit')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="sm"
                                            onChange={this.filterData}
                                        >
                                            <option value="0">{i18n.t('static.common.all')}</option>
                                            {planningUnitList}
                                        </Input>
                                        {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        {/* <div id="loader" className="center"></div> */}
                        <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardBody>
                </Card>

            </div>
        );
    }

}