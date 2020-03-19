import React, { Compoent, Component } from 'react';
import DataSourceService from '../../api/DataSourceService';
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
                this.editDataSource(row);
            }.bind(this)

        }
        this.state = {
            dataSourceList: []

        }
        this.editDataSource = this.editDataSource.bind(this);
        this.addNewDataSource = this.addNewDataSource.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        DataSourceService.getDataSourceList().then(response => {
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

    editDataSource(dataSource) {
        this.props.history.push({
            pathname: "/dataSource/editDataSource",
            state: { dataSource: dataSource }
        });

    }

    addNewDataSource() {

        if (navigator.onLine) {
            this.props.history.push(`/dataSource/addDataSource`)
        } else {
            alert("You must be Online.")
        }

    }

    showDataSourceLabel(cell, row) {
        return cell.label_en;
    }

    showDataSourceTypeLabel(cell, row) {
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

        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.datasource.datasourcelist')}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Datasource" onClick={this.addNewDataSource}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.dataSourceList} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="label" dataSort dataFormat={this.showDataSourceLabel} dataAlign="center">{i18n.t('static.datasource.datasource')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="dataSourceType" dataSort dataFormat={this.showDataSourceTypeLabel} dataAlign="center">{i18n.t('static.datasource.datasourcetype')}</TableHeaderColumn>
                            <TableHeaderColumn dataField="active" dataSort dataFormat={this.showStatus} dataAlign="center">{i18n.t('static.common.status')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }

}