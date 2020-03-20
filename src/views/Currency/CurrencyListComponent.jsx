import React, { Compoent, Component } from 'react';
import AuthenticationService from '../common/AuthenticationService.js';
import CurrencyService from '../../api/CurrencyService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';


export default class CurrencyListComponent extends Component {


    constructor(props) {
        super(props);
        this.table = data.rows;
        this.options = {
            sortIndicator: true,
            hideSizePerPage: true,
            paginationSize: 3,
            hidePageListOnlyOnePage: true,
            clearSearch: true,
            alwaysShowAllBtns: false,
            withFirstAndLast: false,
            onRowClick: function (row) {
                    this.editCurrency(row);
            }.bind(this)

        }
        this.state = {
            currencyList: []
        }
        this.editCurrency = this.editCurrency.bind(this);
        this.addNewCurrency = this.addNewCurrency.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        CurrencyService.getCurrencyList().then(response => {
            this.setState({
                currencyList: response.data
            })
        })
            .catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.message
                            })
                            break
                    }
                }
            );


    }

    editCurrency(currency) {
        this.props.history.push({
            pathname: "/currency/editCurrency",
            state: { currency: currency }
        });

    }

    addNewCurrency() {

        if (navigator.onLine) {
            this.props.history.push(`/currency/addCurrency`)
        } else {
            alert("You must be Online.")
        }

    }

    showCurrencyLabel(cell, row) {
        return cell.label_en;
    }
    render() {

        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.currency.currencylist')}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Realm" onClick={this.addNewCurrency}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.currencyList} version="4" hover pagination search  options={this.options}>
                        <TableHeaderColumn isKey filterFormatted dataField="currencyCode" dataSort dataAlign="center">{i18n.t('static.currency.currencycode')}</TableHeaderColumn>
                        <TableHeaderColumn  filterFormatted dataField="currencySymbol" dataSort dataAlign="center">{i18n.t('static.currency.currencysymbol')}</TableHeaderColumn>
                        <TableHeaderColumn  filterFormatted dataField="label" dataSort dataFormat={this.showCurrencyLabel} dataAlign="center">{i18n.t('static.currency.currency')}</TableHeaderColumn>
                        <TableHeaderColumn dataField="conversionRateToUsd" dataSort dataAlign="center">{i18n.t('static.currency.conversionrateusd')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }

}