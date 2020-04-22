
import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import i18n from '../../i18n'

import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
const entityname = i18n.t('static.dashboard.realmcountry');
class ListRealmCountryComponent extends Component {
    constructor(props) {
        super(props);
        this.options = {
            sortIndicator: true,
            hideSizePerPage: false,
            paginationSize: 3,
            hidePageListOnlyOnePage: true,
            clearSearch: true,
            alwaysShowAllBtns: false,
            withFirstAndLast: false,
            onRowClick: function (row) {
                this.editProcurementAgent(row);
            }.bind(this)

        }
        this.state = {
            realms: [],
            realmCountryList: [],
            message: '',
            selRealmCountry: []
        }
        this.editProcurementAgent = this.editProcurementAgent.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewRealmCountry = this.addNewRealmCountry.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
    
    }
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    addNewRealmCountry() {
        this.props.history.push("/realmCountry/addRealmCountry");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
            this.setState({
                selRealmCountry
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            });
        }
    }
    editProcurementAgent(procurementAgent) {
        this.props.history.push({
            pathname: "/procurementAgent/editProcurementAgent",
            state: { procurementAgent }
        });
    }
    PlanningUnitCountry(event, row) {
        event.stopPropagation();
        console.log(JSON.stringify(row))
        this.props.history.push({
            pathname: `/realmCountry/realmCountryPlanningUnit/${row.realmCountryId}`,
            state: { realmCountry: row }
           

        })
    }
    RealmCountryRegion(event, row) {
        event.stopPropagation();
        console.log(JSON.stringify(row))
        this.props.history.push({
            pathname: `/realmCountry/realmCountryRegion/${row.realmCountryId}`,
            state: { realmCountry: row }
           

        })
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realms: response.data
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );


            RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                this.setState({
                    realmCountryList: response.data,
                    selRealmCountry: response.data
                })}else{
                    this.setState({ message: response.data.messageCode })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    showCountryLabel(cell, row) {
        return cell.label.label_en;
    }
    showCurrencyLabel(cell, row) {
        return cell.label.label_en;
    }

    showPalletUnitLabel(cell, row) {
        return cell.label.label_en;
    }

    showRealmLabel(cell, row) {
        return cell.label.label_en;
    }

    showStatus(cell, row) {
        if (cell) {
            return "Active";
        } else {
            return "Disabled";
        }
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

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [{
            dataField: 'realm.label',
            text: i18n.t('static.realm.realm'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        },{
            dataField: 'country.label',
            text: i18n.t('static.dashboard.country'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        },{
            dataField: 'defaultCurrency.label',
            text: i18n.t('static.dashboard.currency'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        },{
            dataField: 'palletUnit.label',
            text: i18n.t('static.dashboard.unit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'airFreightPercentage',
            text: i18n.t('static.realmcountry.airFreightPercentage'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'seaFreightPercentage',
            text: i18n.t('static.realmcountry.seaFreightPercentage'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'shippedToArrivedAirLeadTime',
            text: i18n.t('static.realmcountry.shippedToArrivedAirLeadTime'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'shippedToArrivedSeaLeadTime',
            text: i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'arrivedToDeliveredLeadTime',
            text: i18n.t('static.realmcountry.arrivedToDeliveredLeadTime'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
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
        },
         {
            dataField: 'realmCountryId',
            text: i18n.t('static.common.action'),
            align: 'center',
            headerAlign: 'center',
            formatter: (cellContent, row) => {
                return (<div><Button type="button" size="sm" color="success" onClick={(event) => this.PlanningUnitCountry(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.planningunit.planningunitupdate')}</Button><br/><br/>
                <Button type="button" size="sm" color="success" onClick={(event) => this.RealmCountryRegion(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.realmcountry.regionupdate')}</Button>
               </div> )
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
                text: 'All', value: this.state.selRealmCountry.length
            }]
        }
        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>

                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.realmcountrylist')}</strong>{' '}
                        <div className="card-header-actions">
                            
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Col md="3 pl-0">
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
                                            <option value="0">{i18n.t('static.common.all')}</option>
                                            {realmList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <ToolkitProvider
                            keyField="realmCountryId"
                            data={this.state.selRealmCountry}
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
                                          /*  rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editSupplier(row);
                                                }
                                            }}*/
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
    }}
export default ListRealmCountryComponent;
