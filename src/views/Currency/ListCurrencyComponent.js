import React, { Compoent, Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import CurrencyService from '../../api/CurrencyService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'

const entityname = i18n.t('static.currency.currencyMaster');
export default class CurrencyListComponent extends Component {


    constructor(props) {
        super(props);
        // this.table = data.rows;
        // this.options = {
        //     sortIndicator: true,
        //     hideSizePerPage: true,
        //     paginationSize: 3,
        //     hidePageListOnlyOnePage: true,
        //     clearSearch: true,
        //     alwaysShowAllBtns: false,
        //     withFirstAndLast: false,
        //     onRowClick: function (row) {
        //             this.editCurrency(row);
        //     }.bind(this)

        // }
        this.state = {
            currencyList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            selCurrency: []
        }
        this.editCurrency = this.editCurrency.bind(this);
        this.addNewCurrency = this.addNewCurrency.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        CurrencyService.getCurrencyList().then(response => {
            if (response.status == 200) {
                this.setState({
                    currencyList: response.data,
                    selCurrency: response.data
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

    editCurrency(currency) {
        this.props.history.push({
            pathname: `/currency/editCurrency/${currency.currencyId}`,
            // state: { currency: currency }
        });

    }

    addNewCurrency() {

        if (navigator.onLine) {
            this.props.history.push(`/currency/addCurrency`)
        } else {
            alert("You must be Online.")
        }

    }

    // showCurrencyLabel(cell, row) {
    //     return cell.label_en;
    // }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
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
                dataField: 'label',
                text: i18n.t('static.currency.currency'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'currencyCode',
                text: i18n.t('static.currency.currencycode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'currencySymbol',
                text: i18n.t('static.currency.currencysymbol'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'conversionRateToUsd',
                text: i18n.t('static.currency.conversionrateusd'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            // {
            //     dataField: 'active',
            //     text: i18n.t('static.common.status'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: (cellContent, row) => {
            //         return (
            //             (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
            //         );
            //     }
            // }
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
                text: 'All', value: this.state.selCurrency.length
            }]
        }

        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.currencylist')}</strong>{' '}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewCurrency}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {/* <BootstrapTable data={this.state.currencyList} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="currencyCode" dataSort dataAlign="center">{i18n.t('static.currency.currencycode')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="currencySymbol" dataSort dataAlign="center">{i18n.t('static.currency.currencysymbol')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showCurrencyLabel} dataAlign="center">{i18n.t('static.currency.currency')}</TableHeaderColumn>
                            <TableHeaderColumn dataField="conversionRateToUsd" dataSort dataAlign="center">{i18n.t('static.currency.conversionrateusd')}</TableHeaderColumn>
                        </BootstrapTable> */}
                        <ToolkitProvider
                            keyField="currencyId"
                            data={this.state.selCurrency}
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
                                                    this.editCurrency(row);
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