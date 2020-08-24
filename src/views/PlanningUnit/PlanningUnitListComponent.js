// import React, { Component } from 'react';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory from 'react-bootstrap-table2-filter';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
// import ForecastingUnitService from '../../api/ForecastingUnitService';
// import PlanningUnitService from '../../api/PlanningUnitService';
// import getLabelText from '../../CommonComponent/getLabelText';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import RealmService from '../../api/RealmService';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


// const entityname = i18n.t('static.planningunit.planningunit');
// export default class PlanningUnitListComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             forecastingUnits: [],
//             planningUnitList: [],
//             message: '',
//             selSource: [],
//             realmId: '',
//             realms: [],
//             loading: true

//         }
//         this.editPlanningUnit = this.editPlanningUnit.bind(this);
//         this.addNewPlanningUnit = this.addNewPlanningUnit.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.filterDataForRealm = this.filterDataForRealm.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
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
//         let forecastingUnitId = document.getElementById("forecastingUnitId").value;
//         if (forecastingUnitId != 0) {
//             const selSource = this.state.planningUnitList.filter(c => c.forecastingUnit.forecastingUnitId == forecastingUnitId)
//             this.setState({
//                 selSource
//             });
//         } else {
//             this.setState({
//                 selSource: this.state.planningUnitList
//             });
//         }
//     }
//     filterDataForRealm() {
//         let realmId = document.getElementById("realmId").value;
//         if (realmId != 0) {
//             PlanningUnitService.getPlanningUnitByRealmId(realmId).then(response => {
//                 console.log(response.data)
//                 this.setState({
//                     planningUnitList: response.data,
//                     selSource: response.data
//                 })
//             })
//         }

//     }

//     PlanningUnitCapacity(event, row) {
//         event.stopPropagation();
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT_CAPACITY')) {
//             // console.log(JSON.stringify(row))
//             this.props.history.push({
//                 pathname: `/planningUnitCapacity/planningUnitCapacity/${row.planningUnitId}`,
//                 state: { planningUnit: row }


//             })
//         }
//     }
//     componentDidMount() {
//         this.hideFirstComponent();
//         AuthenticationService.setupAxiosInterceptors();
//         ForecastingUnitService.getForecastingUnitList().then(response => {
//             // console.log(response.data)
//             if (response.status == 200) {
//                 this.setState({
//                     forecastingUnits: response.data, loading: false

//                 })
//             }
//             else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//         })


//         RealmService.getRealmListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realms: response.data,
//                         realmId: response.data[0].realmId,
//                         loading: false
//                     })

//                     PlanningUnitService.getPlanningUnitByRealmId(this.state.realmId).then(response => {
//                         console.log("RESP-----", response.data)
//                         this.setState({
//                             planningUnitList: response.data,
//                             selSource: response.data
//                         })
//                     })

//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })
//     }

//     editPlanningUnit(planningUnit) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT')) {
//             console.log('**' + JSON.stringify(planningUnit))
//             this.props.history.push({
//                 pathname: `/planningUnit/editPlanningUnit/${planningUnit.planningUnitId}`,
//                 // state: { planningUnit: planningUnit }
//             });
//         }
//     }

//     addNewPlanningUnit() {

//         if (navigator.onLine) {
//             this.props.history.push(`/planningUnit/addPlanningUnit`)
//         } else {
//             alert(i18n.t('static.common.online'))
//         }

//     }

//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     render() {
//         const { realms } = this.state;
//         let realmList = realms.length > 0
//             && realms.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { forecastingUnits } = this.state;
//         let forecastingUnitList = forecastingUnits.length > 0
//             && forecastingUnits.map((item, i) => {
//                 return (
//                     <option key={i} value={item.forecastingUnitId}>
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
//             dataField: 'label',
//             text: i18n.t('static.planningunit.planningunit'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'forecastingUnit.label',
//             text: i18n.t('static.forecastingunit.forecastingunit'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'unit.label',
//             text: i18n.t('static.unit.unit'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'multiplier',
//             text: i18n.t('static.unit.multiplier'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             //formatter: this.formatLabel
//         }, {
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
//         }, {
//             dataField: 'planningUnitId',
//             text: i18n.t('static.common.action'),
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (<Button type="button" size="sm" color="success" onClick={(event) => this.PlanningUnitCapacity(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.planningunit.capacityupdate')}</Button>
//                 )
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
//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewPlanningUnit}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>

//                     </div>
//                     <CardBody className="pb-lg-0">
//                         <Col md="9 pl-0">
//                             <div className="d-md-flex Selectdiv2">
//                                 <FormGroup>
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmId"
//                                                 id="realmId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterDataForRealm}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmList}
//                                             </Input>
//                                             {/* <InputGroupAddon addonType="append">
//                                                 <Button color="secondary Gobtn btn-sm" onClick={this.filterDataForRealm}>{i18n.t('static.common.go')}</Button>
//                                             </InputGroupAddon> */}
//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                                 &nbsp;
//                             <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.forecastingunit.forecastingunit')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="forecastingUnitId"
//                                                 id="forecastingUnitId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {forecastingUnitList}
//                                             </Input>
//                                             {/* <InputGroupAddon addonType="append">
//                                                 <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                             </InputGroupAddon> */}
//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                             </div>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="planningUnitId"
//                             data={this.state.selSource}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust PlanningUnitlistAlignThtd">
//                                         <div >
//                                             <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                                 <SearchBar {...props.searchProps} />
//                                                 <ClearSearchButton {...props.searchProps} />
//                                             </div>
//                                             <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                                 pagination={paginationFactory(options)}
//                                                 rowEvents={{
//                                                     onClick: (e, row, rowIndex) => {
//                                                         this.editPlanningUnit(row);
//                                                     }
//                                                 }}
//                                                 {...props.baseProps}
//                                             />
//                                         </div>
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

import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import PlanningUnitService from '../../api/PlanningUnitService';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'


const entityname = i18n.t('static.planningunit.planningunit');
export default class PlanningUnitListComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            forecastingUnits: [],
            planningUnitList: [],
            message: '',
            selSource: [],
            realmId: '',
            realms: [],
            loading: true

        }
        this.editPlanningUnit = this.editPlanningUnit.bind(this);
        this.addNewPlanningUnit = this.addNewPlanningUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.filterDataForRealm = this.filterDataForRealm.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
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

    filterData() {
        let forecastingUnitId = document.getElementById("forecastingUnitId").value;
        if (forecastingUnitId != 0) {
            const selSource = this.state.planningUnitList.filter(c => c.forecastingUnit.forecastingUnitId == forecastingUnitId)
            this.setState({
                selSource
            }, () => {
                this.buildJExcel();
            });
        } else {
            this.setState({
                selSource: this.state.planningUnitList
            }, () => {
                this.buildJExcel();
            });
        }
    }
    filterDataForRealm() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            PlanningUnitService.getPlanningUnitByRealmId(realmId).then(response => {
                console.log(response.data)
                this.setState({
                    planningUnitList: response.data,
                    selSource: response.data
                }, () => {
                    this.buildJExcel();
                });
            })
        }

    }

    PlanningUnitCapacity(event, row) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT_CAPACITY')) {
            // console.log(JSON.stringify(row))
            this.props.history.push({
                pathname: `/planningUnitCapacity/planningUnitCapacity/${row.planningUnitId}`,
                state: { planningUnit: row }


            })
        }
    }

    buildJExcel() {
        let planningUnitList = this.state.selSource;
        // console.log("planningUnitList---->", planningUnitList);
        let planningUnitArray = [];
        let count = 0;

        for (var j = 0; j < planningUnitList.length; j++) {
            data = [];
            data[0] = planningUnitList[j].planningUnitId
            data[1] = getLabelText(planningUnitList[j].label, this.state.lang)
            data[2] = getLabelText(planningUnitList[j].forecastingUnit.label, this.state.lang)
            data[3] = getLabelText(planningUnitList[j].unit.label, this.state.lang)
            data[4] = planningUnitList[j].multiplier;
            data[5] = planningUnitList[j].active;


            planningUnitArray[count] = data;
            count++;
        }
        // if (planningUnitList.length == 0) {
        //     data = [];
        //     planningUnitArray[0] = data;
        // }
        // console.log("planningUnitArray---->", planningUnitArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = planningUnitArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'planningUnitId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.forecastingunit.forecastingunit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.unit.unit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.unit.multiplier'),
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
                            title: i18n.t('static.planningunit.capacityupdate'),
                            onclick: function () {
                                // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT_CAPACITY')) {
                                    this.props.history.push({
                                        pathname: `/planningUnitCapacity/planningUnitCapacity/${this.el.getValueFromCoords(0, y)}`,
                                    })
                                }

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
            languageEl: languageEl
        })
    }

    selected = function (instance, cell, x, y, value) {

        if (x == 0 && value != 0) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (this.state.selSource.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT')) {
                    this.props.history.push({
                        pathname: `/planningUnit/editPlanningUnit/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
            }
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }


    componentDidMount() {
        this.hideFirstComponent();
        AuthenticationService.setupAxiosInterceptors();
        ForecastingUnitService.getForecastingUnitList().then(response => {
            // console.log(response.data)
            if (response.status == 200) {
                this.setState({
                    forecastingUnits: response.data, loading: false

                })
            }
            else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

        })


        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realms: response.data,
                        realmId: response.data[0].realmId,
                        loading: false
                    })

                    PlanningUnitService.getPlanningUnitByRealmId(this.state.realmId).then(response => {
                        console.log("RESP-----", response.data)
                        this.setState({
                            planningUnitList: response.data,
                            selSource: response.data
                        }, () => {
                            this.buildJExcel();
                        });
                    })

                } else {
                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })
    }

    editPlanningUnit(planningUnit) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT')) {
            console.log('**' + JSON.stringify(planningUnit))
            this.props.history.push({
                pathname: `/planningUnit/editPlanningUnit/${planningUnit.planningUnitId}`,
                // state: { planningUnit: planningUnit }
            });
        }
    }

    addNewPlanningUnit() {

        if (navigator.onLine) {
            this.props.history.push(`/planningUnit/addPlanningUnit`)
        } else {
            alert(i18n.t('static.common.online'))
        }

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { forecastingUnits } = this.state;
        let forecastingUnitList = forecastingUnits.length > 0
            && forecastingUnits.map((item, i) => {
                return (
                    <option key={i} value={item.forecastingUnitId}>
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

        const columns = [{
            dataField: 'label',
            text: i18n.t('static.planningunit.planningunit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'forecastingUnit.label',
            text: i18n.t('static.forecastingunit.forecastingunit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'unit.label',
            text: i18n.t('static.unit.unit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'multiplier',
            text: i18n.t('static.unit.multiplier'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            //formatter: this.formatLabel
        }, {
            dataField: 'active',
            text: i18n.t('static.common.status'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: (cellContent, row) => {
                return (
                    (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
                );
            }
        }, {
            dataField: 'planningUnitId',
            text: i18n.t('static.common.action'),
            align: 'center',
            headerAlign: 'center',
            formatter: (cellContent, row) => {
                return (<Button type="button" size="sm" color="success" onClick={(event) => this.PlanningUnitCapacity(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.planningunit.capacityupdate')}</Button>
                )
            }
        }];
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PLANNING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewPlanningUnit}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-5">
                        <Col md="9 pl-0">
                            <div className="d-md-flex  Selectdiv2 ">
                                <FormGroup className="mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmId"
                                                id="realmId"
                                                bsSize="sm"
                                                onChange={this.filterDataForRealm}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmList}
                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterDataForRealm}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                &nbsp;
                            <FormGroup className=" tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.forecastingunit.forecastingunit')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="forecastingUnitId"
                                                id="forecastingUnitId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {forecastingUnitList}
                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className="jexcelremoveReadonlybackground">
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
