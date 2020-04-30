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
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


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

        }
        this.editPlanningUnit = this.editPlanningUnit.bind(this);
        this.addNewPlanningUnit = this.addNewPlanningUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.filterDataForRealm = this.filterDataForRealm.bind(this);
    }

    filterData() {
        let forecastingUnitId = document.getElementById("forecastingUnitId").value;
        if (forecastingUnitId != 0) {
            const selSource = this.state.planningUnitList.filter(c => c.forecastingUnit.forecastingUnitId == forecastingUnitId)
            this.setState({
                selSource
            });
        } else {
            this.setState({
                selSource: this.state.planningUnitList
            });
        }
    }
    filterDataForRealm() {
        let realmId = document.getElementById("realmId").value;
        PlanningUnitService.getPlanningUnitByRealmId(realmId).then(response => {
            console.log(response.data)
            this.setState({
                planningUnitList: response.data,
                selSource: response.data
            })
        })

    }

    PlanningUnitCapacity(event, row) {
        event.stopPropagation();
        // console.log(JSON.stringify(row))
        this.props.history.push({
            pathname: `/planningUnitCapacity/planningUnitCapacity/${row.planningUnitId}`,
            state: { planningUnit: row }


        })
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ForecastingUnitService.getForecastingUnitList().then(response => {
            // console.log(response.data)
            this.setState({
                forecastingUnits: response.data,

            })
        })


        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realms: response.data,
                        realmId: response.data[0].realmId
                    })

                    PlanningUnitService.getPlanningUnitByRealmId(this.state.realmId).then(response => {
                        console.log(response.data)
                        this.setState({
                            planningUnitList: response.data,
                            selSource: response.data
                        })
                    })

                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })
    }

    editPlanningUnit(planningUnit) {
        console.log('**' + JSON.stringify(planningUnit))
        this.props.history.push({
            pathname: `/planningUnit/editPlanningUnit/${planningUnit.planningUnitId}`,
            // state: { planningUnit: planningUnit }
        });

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
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.common.listEntity', { entityname })}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewPlanningUnit}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody>
                        <Col md="9 pl-0">
                            <div className="d-md-flex">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmId"
                                                id="realmId"
                                                bsSize="sm"
                                            >
                                                {/* <option value="0">{i18n.t('static.common.all')}</option> */}
                                                {realmList}
                                            </Input>
                                            <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterDataForRealm}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                &nbsp;
                            <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.forecastingunit.forecastingunit')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="forecastingUnitId"
                                                id="forecastingUnitId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {forecastingUnitList}
                                            </Input>
                                            <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <ToolkitProvider
                            keyField="planningUnitId"
                            data={this.state.selSource}
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
                                                    this.editPlanningUnit(row);
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>

                    </CardBody>
                </Card>
            </div>
        );
    }

}
