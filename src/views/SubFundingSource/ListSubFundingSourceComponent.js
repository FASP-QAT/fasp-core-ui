import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'

import i18n from '../../i18n'

import FundingSourceService from "../../api/FundingSourceService";
import SubFundingSourceService from "../../api/SubFundingSourceService";
import AuthenticationService from '../Common/AuthenticationService.js';

class ListSubFundingSourceComponent extends Component {
    constructor(props) {
        super(props);
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
                    subFundingSourceList: response.data,
                    selSubFundingSource: response.data
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

    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                Showing {from} to {to} of {size} Results
            </span>
        );

        const { fundingSources } = this.state;
        let fundingSourceList = fundingSources.length > 0
            && fundingSources.map((item, i) => {
                return (
                    <option key={i} value={item.fundingSourceId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        const columns = [{
            dataField: 'fundingSource.label.label_en',
            text: 'Funding Source',
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'label.label_en',
            text: 'Sub Funding Source',
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'active',
            text: 'Status',
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: (cellContent, row) => {
                return (
                    (row.active ? "Active" : "Disabled")
                );
            }
        }];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: 'First',
            prePageText: 'Back',
            nextPageText: 'Next',
            lastPageText: 'Last',
            nextPageTitle: 'First page',
            prePageTitle: 'Pre page',
            firstPageTitle: 'Next page',
            lastPageTitle: 'Last page',
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.selSubFundingSource.length
            }]
        }


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
                        <ToolkitProvider
                            keyField="subFundingSourceId"
                            data={this.state.selSubFundingSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div>
                                        <hr />
                                        <SearchBar
                                        searchPosition="right"
                                        {...props.searchProps} />
                                        <ClearSearchButton {...props.searchProps} />
                                        <BootstrapTable noDataIndication="Data not found" tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editSubFundingSource(row);
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListSubFundingSourceComponent;
