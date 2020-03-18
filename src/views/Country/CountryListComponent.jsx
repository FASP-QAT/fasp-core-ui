import React, { Component } from 'react';
import AuthenticationService from '../common/AuthenticationService.js';
import CountryService from '../../api/CountryService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
export default class CountryListComponent extends Component {

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
                this.editCountry(row);
            }.bind(this)

        }

        this.state = {
            countryList: []
        }
        this.addNewCountry = this.addNewCountry.bind(this);
        this.editCountry = this.editCountry.bind(this);
    }

    addNewCountry() {
        if (navigator.onLine) {
            this.props.history.push(`/country/addCountry`)
        } else {
            alert("You must be Online.")
        }

    }
    editCountry(country) {
        console.log(country);
        this.props.history.push({
            pathname: "/country/editCountry",
            state: { country: country }
        });

    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        CountryService.getCountryListAll().then(response => {
            this.setState({
                countryList: response.data
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

    showCountryLabel(cell, row) {
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
    //                                 <h3 className="panel-title">Country List</h3>
    //                                 <button className="btn btn-info pull-right" onClick={this.addNewCountry}><i class="fa fa-plus" ></i></button>
    //                             </div>
    //                             <div className="panel-body text-left">
    //                                 <div className="col-md-12">



    //                                     <div className="table-responsive">
    //                                         <table className="table datatable">
    //                                             <thead>
    //                                                 <tr>
    //                                                     <th>Country name (English)</th>
    //                                                     <th>Country name (French)</th>
    //                                                     <th>Country name (Spanish)</th>
    //                                                     <th>Country name (portuguese)</th>
    //                                                     <th>Active</th>

    //                                                 </tr>
    //                                             </thead>
    //                                             <tbody>
    //                                                 {
    //                                                     this.state.countryList.map(country =>

    //                                                         <tr key={country.countryId} onClick={() => this.editCountry(country)}>
    //                                                             <td>{country.label.label_en}</td>
    //                                                             <td>{country.label.label_fr}</td>
    //                                                             <td>{country.label.label_sp}</td>
    //                                                             <td>{country.label.label_pr}</td>
    //                                                             <td>
    //                                                                 {country.active.toString() == "true" ? "Active" : "Disabled"}
    //                                                             </td>
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
                        <i className="icon-menu"></i>{i18n.t('static.country.countrylist')}
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.countryList} version="4" striped hover pagination search headerStyle={{ background: '#D1EEEE' }} options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="label" dataSort dataFormat={this.showCountryLabel} dataAlign="center">{i18n.t('static.country.country')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="countryCode" dataSort dataAlign="center">{i18n.t('static.country.countrycode')}</TableHeaderColumn>
                            {/* <TableHeaderColumn filterFormatted dataField="language" dataSort dataFormat={this.showLanguage} dataAlign="center">Language</TableHeaderColumn> */}
                            {/* <TableHeaderColumn filterFormatted dataField="currencyId" dataSort dataAlign="center">Currency</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="active" dataSort dataAlign="center">{i18n.t('static.common.status')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }

}