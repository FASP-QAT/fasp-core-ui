
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import i18n from '../../i18n'


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
            const selProcurementAgent = this.state.procurementAgentList.filter(c => c.realm.realmId == realmId)
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
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                console.log("Error code unkown");
                                break;
                        }
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
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                console.log("Error code unkown");
                                break;
                        }
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
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5>{i18n.t(this.state.message)}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.procurementagent.procurementagentlist')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Procurement Agent" onClick={this.addNewProcurementAgent}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Col md="3">
                            <FormGroup>
                                <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.realm')}</Label>
                                <div className="controls">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="realmId"
                                            id="realmId"
                                            bsSize="lg"
                                        >
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <BootstrapTable data={this.state.selProcurementAgent} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField='procurementAgentId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn dataField="procurementAgentCode" dataSort dataFormat={this.showSubFundingSourceLabel} dataAlign="center">{i18n.t('static.procurementagent.procurementagentcode')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showProcurementAgentLabel} dataAlign="center">{i18n.t('static.procurementagent.procurementagentname')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataAlign="center" dataSort>{i18n.t('static.procurementagent.realm')}</TableHeaderColumn>
                            <TableHeaderColumn dataField="submittedToApprovedLeadTime" dataSort dataAlign="center">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetime')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>{i18n.t('static.common.status')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListProcurementAgentComponent;
