import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table-2';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { API_URL } from '../../Constants';
import FundingSourceService from "../../api/FundingSourceService";
class SubFundingSourceListComponent extends Component {
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
            message: ''
        }
        this.editSubFundingSource = this.editSubFundingSource.bind(this);
    }
    editSubFundingSource(subFundingSource) {
        this.props.history.push({
            pathname: "/subFundingSource/editSubFundingSource",
            state: { subFundingSource }
        });
    }
    componentDidMount() {
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
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        FundingSourceService.getSubFundingSourceListAll()
            .then(response => {
                this.setState({
                    subFundingSourceList: response.data.data
                })
            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>Sub Funding Source List
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.subFundingSourceList} version="4" hover pagination search headerStyle={{ background: '#D1EEEE' }} options={this.options}>
                            <TableHeaderColumn isKey dataField='subFundingSourceId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort={true} dataFormat={this.showSubFundingSourceLabel} dataAlign="center">Sub Funding Source</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="fundingSource" dataFormat={this.showFundingSourceLabel} dataAlign="center" dataSort>Funding Source</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort>Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default SubFundingSourceListComponent;