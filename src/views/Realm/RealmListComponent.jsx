import React, { Component } from 'react';
import RealmService from '../../api/RealmService'
import AuthenticationService from '../common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';


export default class ReactListComponent extends Component {


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
                this.editRealm(row);
            }.bind(this)

        }
        this.state = {
            realmList: []
        }
        this.addNewRealm = this.addNewRealm.bind(this);
        this.editRealm = this.editRealm.bind(this);
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll().then(response => {
            this.setState({
                realmList: response.data.data
            })
            // console.log("REALM LIST",this.state.realmList)
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
    showRealmLabel(cell, row) {
        return cell.label_en;
    }

    // render() {
    //     return (
    //         <>
    //             <p>{this.props.match.params.message}</p>
    //             <div>
    //                 <button type="button" style={{ marginLeft: '-999px' }} onClick={this.addNewRealm}>Add Realm</button><br /><br />
    //             </div>

    //             <div className="realmList">

    //                 <h1>Realm List</h1>
    //                 <table border="1" align="center">
    //                     <thead>
    //                         <tr>
    //                             <th>Realm Code</th>
    //                             <th>Realm Name (English)</th>
    //                             <th>Month In Past For AMC</th>
    //                             <th>Month In Future For AMC</th>
    //                             <th>Order Frequency</th>
    //                             <th>Default</th>


    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {
    //                             this.state.realmList.map(realm =>

    //                                 <tr key={realm.realmId} onClick={() => this.editRealm(realm)}>
    //                                     <td>{realm.realmCode}</td>
    //                                     <td>{realm.label.label_en}</td>
    //                                     <td>{realm.label.label_fr}</td>
    //                                     <td>{realm.label.label_sp}</td>
    //                                     <td>{realm.label.label_pr}</td>
    //                                     <td>{realm.monthInPastForAmc}</td>
    //                                     <td>{realm.monthInFutureForAmc}</td>
    //                                     <td>{realm.orderFrequency}</td>
    //                                     <td>{realm.defaultRealm.toString() == "true" ? "Active" : "Disabled"}</td>
    //                                 </tr>
    //                             )

    //                         }
    //                     </tbody>
    //                 </table>
    //             </div>
    //         </>
    //     );

    // }

    render() {

        return (
            <div className="animated">
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
                        <BootstrapTable data={this.state.realmList} version="4"  hover pagination search  options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="realmCode" dataSort dataAlign="center">Realm Code</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showRealmLabel} dataAlign="center">Realm Name (English)</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="monthInPastForAmc" dataSort dataAlign="center">Month In Past For AMC</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="monthInFutureForAmc" dataSort dataAlign="center">Month In Future For AMC</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="orderFrequency" dataSort dataAlign="center">Order Frequency</TableHeaderColumn>
                            <TableHeaderColumn dataField="defaultRealm" dataSort dataAlign="center">Default</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

