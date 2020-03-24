
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'

import FundingSourceService from "../../api/FundingSourceService";
import SubFundingSourceService from "../../api/SubFundingSourceService";
import AuthenticationService from '../Common/AuthenticationService.js';

class ListSubFundingSourceComponent extends Component {
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
                this.editSubFundingSource(row);
            }.bind(this)

        }
        this.state = {
            fundingSources: [],
            subFundingSourceList: [],
            message: '',
            selSubFundingSource: []
        }
        this.editSubFundingSource = this.editSubFundingSource.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewSubFundingSource = this.addNewSubFundingSource.bind(this);
    }
    addNewSubFundingSource() {
        this.props.history.push("/subFundingSource/addSubFundingSource");
    }
    filterData() {
        let fundingSourceId = document.getElementById("fundingSourceId").value;
        if (fundingSourceId != 0) {
            const selSubFundingSource = this.state.subFundingSourceList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
            this.setState({
                selSubFundingSource: selSubFundingSource
            });
        } else {
            this.setState({
                selSubFundingSource: this.state.subFundingSourceList
            });
        }
    }
    editSubFundingSource(subFundingSource) {
        this.props.history.push({
            pathname: "/subFundingSource/editSubFundingSource",
            state: { subFundingSource }
        });
    }

    addSubFundingSource(subFundingSource) {
        this.props.history.push({
            pathname: "/subFundingSource/addSubFundingSource"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                this.setState({
                    fundingSources: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

        SubFundingSourceService.getSubFundingSourceListAll()
            .then(response => {
                this.setState({
                    subFundingSourceList: response.data.data,
                    selSubFundingSource: response.data.data
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

    showSubFundingSourceLabel(cell, row) {
        return cell.label_en;
    }

    showFundingSourceLabel(cell, row) {
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
        const { fundingSources } = this.state;
        let fundingSourceList = fundingSources.length > 0
            && fundingSources.map((item, i) => {
                return (
                    <option key={i} value={item.fundingSourceId}>
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
                        <i className="icon-menu"></i><strong>{i18n.t('static.subfundingsource.subfundingsourcelisttext')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.subfundingsource.subfundingsourceaddtext')} onClick={this.addNewSubFundingSource}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Col md="3">
                            <FormGroup>
                                <Label htmlFor="appendedInputButton">{i18n.t('static.subfundingsource.fundingsource')}</Label>
                                <div className="controls">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="fundingSourceId"
                                            id="fundingSourceId"
                                            bsSize="lg"
                                        >
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {fundingSourceList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <BootstrapTable data={this.state.selSubFundingSource} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField='subFundingSourceId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="fundingSource" dataFormat={this.showFundingSourceLabel} dataAlign="center" dataSort><strong>{i18n.t('static.subfundingsource.fundingsource')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showSubFundingSourceLabel} dataAlign="center"><strong>{i18n.t('static.subfundingsource.subfundingsource')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort><strong>{i18n.t('static.common.status')}</strong></TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListSubFundingSourceComponent;
