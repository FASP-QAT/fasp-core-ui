
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';


import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from '../common/AuthenticationService.js';

class ListRealmCountryComponent extends Component {
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
                this.editProcurementAgent(row);
            }.bind(this)

        }
        this.state = {
            realms: [],
            realmCountryList: [],
            message: '',
            selRealmCountry: []
        }
        this.editProcurementAgent = this.editProcurementAgent.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewRealmCountry = this.addNewRealmCountry.bind(this);

    }
    addNewRealmCountry() {
        this.props.history.push("/realmCountry/addRealmCountry");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
            console.log("selRealmCountry---", selRealmCountry);
            this.setState({
                selRealmCountry
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            });
        }
    }
    editProcurementAgent(procurementAgent) {
        this.props.history.push({
            pathname: "/procurementAgent/editProcurementAgent",
            state: { procurementAgent }
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                this.setState({
                    realms: response.data.data
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

            RealmCountryService.getRealmCountryListAll()
            .then(response => {
                this.setState({
                    realmCountryList: response.data.data,
                    selRealmCountry: response.data.data
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

    showCountryLabel(cell, row) {
        return cell.label.label_en;
    }
    showCurrencyLabel(cell, row) {
        return cell.label.label_en;
    }

    showPalletUnitLabel(cell, row) {
        return cell.label.label_en;
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
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        return (
            <div className="animated">
                <h5>{this.props.match.params.message}</h5>
                <h5>{this.state.message}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>Realm Country List</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Realm Country" onClick={this.addNewRealmCountry}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Col md="3">
                            <FormGroup>
                                <Label htmlFor="appendedInputButton">Realm</Label>
                                <div className="controls">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="realmId"
                                            id="realmId"
                                            bsSize="lg"
                                        >
                                            <option value="0">Please select</option>
                                            {realmList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" onClick={this.filterData}>Go</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <BootstrapTable data={this.state.selRealmCountry} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField='realmCountryId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="country" dataSort dataFormat={this.showCountryLabel} dataAlign="center">Country</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataAlign="center" dataSort>Realm</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="defaultCurrency" dataFormat={this.showCurrencyLabel} dataAlign="center" dataSort>Default Currency</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="palletUnit" dataFormat={this.showPalletUnitLabel} dataAlign="center" dataSort>Pallet Unit</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="airFreightPercentage" dataAlign="center" dataSort>Air Freight Percentage</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="seaFreightPercentage" dataAlign="center" dataSort>Sea Freight Percentage</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="shippedToArrivedAirLeadTime" dataAlign="center" dataSort>Shipped To Arrived Air Lead Time</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="shippedToArrivedSeaLeadTime" dataAlign="center" dataSort>Shipped To Arrived Sea Lead Time</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="arrivedToDeliveredLeadTime" dataAlign="center" dataSort>Arrived To Delivered Lead Time</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListRealmCountryComponent;
