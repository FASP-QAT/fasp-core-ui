
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';


import RealmService from "../../api/RealmService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationService from '../common/AuthenticationService.js';

class ListProcurementAgentComponent extends Component {
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
            procurementAgentList: [],
            message: '',
            selProcurementAgent: []
        }
        this.editProcurementAgent = this.editProcurementAgent.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewProcurementAgent = this.addNewProcurementAgent.bind(this);

    }
    addNewProcurementAgent() {
        this.props.history.push("/procurementAgent/addProcurementAgent");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selProcurementAgent = this.state.subFundingSourceList.filter(c => c.realm.realmId == realmId)
            console.log("selProcurementAgent---", selProcurementAgent);
            this.setState({
                selProcurementAgent
            });
        } else {
            this.setState({
                selProcurementAgent: this.state.procurementAgentList
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

        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                this.setState({
                    procurementAgentList: response.data.data,
                    selProcurementAgent: response.data.data
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

    showProcurementAgentLabel(cell, row) {
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
                        <i className="icon-menu"></i><strong>Procurement Agent List</strong>{' '}
                        <a href="javascript:void();" title="Add Procurement Agent" onClick={this.addNewProcurementAgent}><i className="fa fa-plus-square"></i></a>
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
                        <BootstrapTable data={this.state.selProcurementAgent} version="4" hover pagination search headerStyle={{ background: '#D1EEEE' }} options={this.options}>
                            <TableHeaderColumn isKey dataField='procurementAgentId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn dataField="procurementAgentCode" dataSort dataFormat={this.showSubFundingSourceLabel} dataAlign="center">Procurement Agent Code</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showProcurementAgentLabel} dataAlign="center">Procurement Agent Name</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataAlign="center" dataSort>Realm</TableHeaderColumn>
                            <TableHeaderColumn dataField="submittedToApprovedLeadTime" dataSort dataAlign="center">Submitted To Approved Lead Time</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListProcurementAgentComponent;
