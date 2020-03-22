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