
import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import i18n from '../../i18n'

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
                    fundingSourceList: response.data
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
                                console.log("Error code unkown");
                                break;
                        }
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
                        <i className="icon-menu"></i><strong>{i18n.t('static.fundingsource.fundingsourcelisttext')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Funding source" onClick={this.addFundingSource}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.fundingSourceList} version="4" striped hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField='fundingSourceId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showFundingSourceLabel} dataAlign="center">{i18n.t('static.fundingsource.fundingsource')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataAlign="center" dataSort>{i18n.t('static.fundingsource.realm')}</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>{i18n.t('static.common.status')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
                <div>
                    <h6>{this.state.message}</h6>
                    <h6>{this.props.match.params.messageCode}</h6>
                </div>
            </div>
        );
    }
}
export default FundingSourceListComponent;
