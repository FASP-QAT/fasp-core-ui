
import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';


import FundingSourceService from "../../api/FundingSourceService";
import AuthenticationService from '../common/AuthenticationService.js';

class FundingSourceListComponent extends Component {
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
                this.editFundingSource(row);
            }.bind(this)

        }
        this.state = {
            fundingSourceList: [],
            message: ''
        }
        this.editFundingSource = this.editFundingSource.bind(this);
        this.addFundingSource = this.addFundingSource.bind(this);
    }
    editFundingSource(fundingSource) {
        this.props.history.push({
            pathname: "/fundingSource/editFundingSource",
            state: { fundingSource }
        });
    }

    addFundingSource(fundingSource) {
        this.props.history.push({
            pathname: "/fundingSource/addFundingSource"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                this.setState({
                    fundingSourceList: response.data.data
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

    showFundingSourceLabel(cell, row) {
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
                        <i className="icon-menu"></i><strong>Funding Source List</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Funding source" onClick={this.addFundingSource}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.fundingSourceList} version="4" striped hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField='fundingSourceId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showFundingSourceLabel} dataAlign="center">Funding Source</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataAlign="center" dataSort>Realm</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default FundingSourceListComponent;