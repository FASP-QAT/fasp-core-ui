import React, { Compoent, Component } from 'react';
import AuthenticationService from '../common/AuthenticationService.js';
import CurrencyService from '../../api/CurrencyService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';


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
                // console.log("row--------------", row);
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
            this.props.history.push(`/addCurrency`)
        } else {
            alert("You must be Online.")
        }

    }

    showCurrencyLabel(cell, row) {
        return cell.label_en;
    }

    // render() {

    //     return (

    //         <div className="page-content-wrap">


    //             <div className="row">

    //                 <ul class="breadcrumb text-left"><li><a href="#">Home</a></li><li><a href="#">Admin</a></li><li><a href="#">Country</a></li><li><a href="#">Country list</a></li></ul>
    //                 <div className="help-block">{this.props.match.params.message}</div>

    //                 <div className="col-md-12">

    //                     <div className=" mt-2 ">


    //                         <div className="panel panel-default">


    //                             <div className="panel-heading">
    //                                 <h3 className="panel-title">Currency List</h3>
    //                                 <button className="btn btn-info pull-right" onClick={this.addNewCurrency}><i class="fa fa-plus" ></i></button>
    //                             </div>
    //                             <div className="panel-body text-left">
    //                                 <div className="col-md-12">



    //                                     <div className="table-responsive">
    //                                         <table className="table datatable">
    //                                             <thead>
    //                                                 <tr>
    //                                                     <th>Currency Code</th>
    //                                                     <th>Currency Symbol</th>
    //                                                     <th>Currency Name</th>
    //                                                     <th>Conversion Rate To Usd</th>

    //                                                 </tr>
    //                                             </thead>
    //                                             <tbody>
    //                                                 {
    //                                                     this.state.currencyList.map(currency =>
    //                                                         <tr key={currency.currencyId} onClick={() => this.editCurrency(currency)}>
    //                                                             <td>{currency.currencyCode}</td>
    //                                                             <td>{currency.currencySymbol}</td>
    //                                                             <td>{currency.label.label_en}</td>
    //                                                             <td>{currency.label.label_fr}</td>
    //                                                             <td>{currency.label.label_sp}</td>
    //                                                             <td>{currency.label.label_pr}</td>
    //                                                             <td>{currency.conversionRateToUsd}</td>

    //                                                         </tr>
    //                                                     )

    //                                                 }

    //                                             </tbody>
    //                                         </table>
    //                                     </div>

    //                                 </div>

    //                             </div>



    //                         </div>


    //                     </div>


    //                 </div>


    //             </div>


    //         </div>
    //     );
    // }

    render() {

        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>Country List
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.currencyList} version="4" striped hover pagination search headerStyle={{ background: '#D1EEEE' }} options={this.options}>
                        <TableHeaderColumn isKey filterFormatted dataField="currencyCode" dataSort dataAlign="center">Currency Code</TableHeaderColumn>
                        <TableHeaderColumn  filterFormatted dataField="currencySymbol" dataSort dataAlign="center">Currency Symbol</TableHeaderColumn>
                        <TableHeaderColumn  filterFormatted dataField="label" dataSort dataFormat={this.showCurrencyLabel} dataAlign="center">Currency Name (English)</TableHeaderColumn>
                        <TableHeaderColumn dataField="conversionRateToUsd" dataSort dataAlign="center">Conversion Rate To Usd</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }

}