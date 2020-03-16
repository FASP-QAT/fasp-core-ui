
import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';


import RegionService from "../../api/RegionService";
import AuthenticationService from '../common/AuthenticationService.js';

class RegionListComponent extends Component {
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
                this.editRegion(row);
            }.bind(this)

        }
        this.state = {
            regionList: [],
            message: ''
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
    }
    editRegion(region) {
        this.props.history.push({
            pathname: "/region/editRegion",
            state: { region }
        });
    }
    addRegion(region) {
        this.props.history.push({
            pathname: "/region/addRegion"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RegionService.getRegionList()
            .then(response => {
                console.log(response);
                this.setState({
                    regionList: response.data.data
                })
            }).catch(
                error => {
                    console.log("Could not set the Region list error occurred");
                    console.log(error);
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

    showRegionLabel(cell, row) {
        return cell.label_en;
    }

    showRealmCountryLabel(cell, row) {
        return cell.country.label.label_en;
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
                        <i className="icon-menu"></i><strong>Region List</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Region" onClick={this.addRegion}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.regionList} version="4" hover pagination search headerStyle={ { background: '#D1EEEE' } }  options={this.options}>
                            <TableHeaderColumn isKey dataField='regionId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showRegionLabel} dataAlign="center">Region</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realmCountry" dataFormat={this.showRealmCountryLabel} dataAlign="center" dataSort>Country</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default RegionListComponent;