import React, { Component } from 'react';
import RealmService from '../../api/RealmService'
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';

import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import i18n from '../../i18n';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'

const entityname = i18n.t('static.realm.realmMaster');
export default class ReactListComponent extends Component {


    constructor(props) {
        super(props);
        this.state = {
            realmList: [],
            message: '',
            selRealm: []
        }
        this.addNewRealm = this.addNewRealm.bind(this);
        this.editRealm = this.editRealm.bind(this);
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll().then(response => {
            if (response.status == 200) {
                this.setState({
                    realmList: response.data,
                    selRealm: response.data
                })
            } else {
                this.setState({ message: response.data.messageCode })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
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
    editRealm(realm) {
        this.props.history.push({
            pathname: "/realm/updateRealm/",
            state: { realm: realm }
        });

    }

    addNewRealm() {
        if (navigator.onLine) {
            this.props.history.push(`/realm/addRealm`)
        } else {
            alert("You must be Online.")
        }

    }

    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [
            {
                dataField: 'realmCode',
                text: i18n.t('static.realm.realmCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'label.label_en',
                text: i18n.t('static.realm.realmName'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'monthInPastForAmc',
                text: i18n.t('static.realm.monthInPastForAmc'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'monthInFutureForAmc',
                text: i18n.t('static.realm.monthInFutureForAmc'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'orderFrequency',
                text: i18n.t('static.realm.orderFrequency'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            // {
            //     dataField: 'defaultRealm',
            //     text: i18n.t('static.realm.default'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: (cellContent, row) => {
            //         return (
            //             (row.defaultRealm ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
            //         );
            //     }
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
                text: 'All', value: this.state.selRealm.length
            }]
        }
        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>Realm List

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Realm" onClick={this.addNewRealm}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <ToolkitProvider
                            keyField="realmId"
                            data={this.state.selRealm}
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
                                        <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editRealm(row);
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                        {/* <BootstrapTable data={this.state.realmList} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="realmCode" dataSort dataAlign="center">Realm Code</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showRealmLabel} dataAlign="center">Realm Name (English)</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="monthInPastForAmc" dataSort dataAlign="center">Month In Past For AMC</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="monthInFutureForAmc" dataSort dataAlign="center">Month In Future For AMC</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="orderFrequency" dataSort dataAlign="center">Order Frequency</TableHeaderColumn>
                            <TableHeaderColumn dataField="defaultRealm" dataSort dataFormat={this.showStatus} dataAlign="center">Default</TableHeaderColumn>
                        </BootstrapTable> */}
                    </CardBody>
                </Card>
            </div>
        );
    }
}

