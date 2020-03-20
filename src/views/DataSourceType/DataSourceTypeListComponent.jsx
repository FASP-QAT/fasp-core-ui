import React, { Component } from 'react';
import DataSourceTypeService from '../../api/DataSourceTypeService'
import AuthenticationService from '../common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';

export default class DataSourceListComponent extends Component {

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
                this.editDataSourceType(row);
            }.bind(this)

        }
        this.state = {
            dataSourceList: []
        }

        this.editDataSourceType = this.editDataSourceType.bind(this);
        this.addNewDataSourceType = this.addNewDataSourceType.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        DataSourceTypeService.getDataSourceTypeList().then(response => {
            //console.log(response.data)
            this.setState({
                dataSourceList: response.data
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

    editDataSourceType(dataSourceType) {
        this.props.history.push({
            pathname: "/dataSourceType/editDataSourceType",
            state: { dataSourceType: dataSourceType }
        });

    }

    addNewDataSourceType() {

        if (navigator.onLine) {
            this.props.history.push(`/dataSourceType/addDataSourceType`)
        } else {
            alert("You must be Online.")
        }


    }

    showCountryLabel(cell, row) {
        return cell.label_en;
    }


    // render() {
    //     return (




    //         <div className="page-content-wrap">


    //             <div className="row">

    //                 <ul class="breadcrumb text-left"><li><a href="#">Home</a></li><li><a href="#">Admin</a></li><li><a href="#">Datasource type</a></li><li><a href="#">Datasource type list</a></li></ul>
    //                 <div className="help-block">{this.props.match.params.message}</div>

    //                 <div className="col-md-12">

    //                     <div className=" mt-2 ">


    //                         <div className="panel panel-default">


    //                             <div className="panel-heading">
    //                                 <h3 className="panel-title">Language list</h3>
    //                                 <button className="btn btn-info pull-right" onClick={this.addNewDataSourceType}><i class="fa fa-plus" ></i></button>
    //                             </div>
    //                             <div className="panel-body text-left">
    //                                 <div className="col-md-12">



    //                                     <div className="table-responsive">
    //                                         <table className="table datatable">
    //                                             <thead>
    //                                             <tr>
    //                 <th>Data source type name (English)</th>
    //                 <th>Data source type name (French)</th>
    //                 <th>Data source type name (Spanish)</th>
    //                 <th>Data source type name (portuguese)</th>
    //                 <th>Status</th>

    //             </tr>
    //                                             </thead>
    //                                             <tbody>
    //                                             {
    //                 this.state.dataSourceList.map(dataSourceType =>

    //                     <tr key={dataSourceType.dataSourceTypeId} onClick={() => this.editDataSourceType(dataSourceType)}>
    //                         <td>{dataSourceType.label.label_en}</td>
    //                         <td>{dataSourceType.label.label_fr}</td>
    //                         <td>{dataSourceType.label.label_sp}</td>
    //                         <td>{dataSourceType.label.label_pr}</td>
    //                         <td>{dataSourceType.active.toString() == "true" ? "Active" : "Disabled"}</td>
    //                     </tr>
    //                 )

    //             }

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
    showStatus(cell, row) {
        if (cell) {
            return "Active";
        } else {
            return "Disabled";
        }
    }

    render() {

        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.datasourcetype.datasourcetypelist')}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add datasource type" onClick={this.addNewDataSourceType}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.dataSourceList} version="4"  hover pagination search options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="label" dataSort dataFormat={this.showCountryLabel} dataAlign="center">{i18n.t('static.datasourcetype.datasourcetype')}</TableHeaderColumn>
                            <TableHeaderColumn dataField="active" dataSort dataFormat={this.showStatus} dataAlign="center">{i18n.t('static.common.status')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }

}