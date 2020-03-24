
import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'

import ManufacturerService from "../../api/ManufacturerService";
import AuthenticationService from '../Common/AuthenticationService.js';

class ManufacturerListComponent extends Component {
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
                this.editManufacturer(row);
            }.bind(this)

        }
        this.state = {
            manufacturerList: [],
            message: ''
        }
        this.editManufacturer = this.editManufacturer.bind(this);
        this.addManufacturer = this.addManufacturer.bind(this);
    }
    editManufacturer(manufacturer) {
        this.props.history.push({
            pathname: "/manufacturer/editManufacturer",
            state: { manufacturer }
        });
    }
    addManufacturer(manufacturer) {
        this.props.history.push({
            pathname: "/manufacturer/addManufacturer"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ManufacturerService.getManufacturerListAll()
            .then(response => {
                this.setState({
                    manufacturerList: response.data.data
                })
            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.response.data.message
                            })
                            break
                    }
                }
            );
        
    }

    showManufacturerLabel(cell, row) {
        return cell.label_en;
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
        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.manufacturer.manufacturerlist')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Manufacturer" onClick={this.addManufacturer}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.manufacturerList} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField='manufacturerId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showManufacturerLabel} dataAlign="center">{i18n.t('static.manufacturer.manufacturer')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataAlign="center" dataSort>{i18n.t('static.manufacturer.realm')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>{i18n.t('static.common.status')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ManufacturerListComponent;
