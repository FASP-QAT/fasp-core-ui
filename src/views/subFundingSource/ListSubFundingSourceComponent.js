
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';


import FundingSourceService from "../../api/FundingSourceService";
import SubFundingSourceService from "../../api/SubFundingSourceService";
import AuthenticationService from '../common/AuthenticationService.js';

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
            console.log("selSubFundingSource---", selSubFundingSource);
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
                    fundingSources: response.data.data
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

        SubFundingSourceService.getSubFundingSourceListAll()
            .then(response => {
                this.setState({
                    subFundingSourceList: response.data.data,
                    selSubFundingSource: response.data.data
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
                <h5>{this.props.match.params.message}</h5>
                <h5>{this.state.message}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>Sub Funding Source List</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                            <a href="javascript:void();" title="Add Sub Funding Source" onClick={this.addNewSubFundingSource}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Col md="3">
                            <FormGroup>
                                <Label htmlFor="appendedInputButton">Funding Source</Label>
                                <div className="controls">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="fundingSourceId"
                                            id="fundingSourceId"
                                            bsSize="lg"
                                        >
                                            <option value="0">Please select</option>
                                            {fundingSourceList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" onClick={this.filterData}>Go</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <BootstrapTable data={this.state.selSubFundingSource} version="4" hover pagination search headerStyle={{ background: '#D1EEEE' }} options={this.options}>
                            <TableHeaderColumn isKey dataField='subFundingSourceId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showSubFundingSourceLabel} dataAlign="center">Sub Funding Source</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="fundingSource" dataFormat={this.showFundingSourceLabel} dataAlign="center" dataSort>Funding Source</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListSubFundingSourceComponent;