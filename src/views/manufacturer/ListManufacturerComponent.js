
import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';


import ManufacturerService from "../../api/ManufacturerService";
import AuthenticationService from '../common/AuthenticationService.js';

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
    }
    editManufacturer(manufacturer) {
        this.props.history.push({
            pathname: "/manufacturer/editManufacturer",
            state: { manufacturer }
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
                        <i className="icon-menu"></i><strong>Manufacturer List</strong>{' '}
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.manufacturerList} version="4" hover pagination search headerStyle={ { background: '#D1EEEE' } }  options={this.options}>
                            <TableHeaderColumn isKey dataField='manufacturerId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showManufacturerLabel} dataAlign="center">Manufacturer</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataAlign="center" dataSort>Realm</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ManufacturerListComponent;