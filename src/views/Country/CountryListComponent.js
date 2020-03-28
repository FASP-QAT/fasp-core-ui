import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import CountryService from '../../api/CountryService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'

import i18n from '../../i18n';
import { boolean } from 'yup';



const entityname = i18n.t('static.country.countryMaster');
export default class CountryListComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countryList: [],
            message: '',
            selCountry: []
        }
        this.addNewCountry = this.addNewCountry.bind(this);
        this.editCountry = this.editCountry.bind(this);
        this.filterData = this.filterData.bind(this);
    }
    filterData() {
        var selStatus = document.getElementById("active").value;
        if (selStatus != "") {
            if (selStatus == "true") {
                const selCountry = this.state.countryList.filter(c => c.active == true);
                this.setState({
                    selCountry: selCountry
                });
            } else if (selStatus == "false") {
                const selCountry = this.state.countryList.filter(c => c.active == false);
                this.setState({
                    selCountry: selCountry
                });
            }

        } else {
            this.setState({
                selCountry: this.state.countryList
            });
        }
    }


    addNewCountry() {
        if (navigator.onLine) {
            this.props.history.push(`/country/addCountry`)
        } else {
            alert("You must be Online.")
        }

    }
    editCountry(country) {
        console.log(country);
        this.props.history.push({
            pathname: "/country/editCountry",
            state: { country: country }
        });

    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        CountryService.getCountryListAll().then(response => {
            if (response.status == 200) {
                console.log("response--->", response.data);
                this.setState({
                    countryList: response.data,
                    selCountry: response.data
                })
            } else {
                this.setState({ message: response.data.messageCode })
            }
        })
            .catch(
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

    }

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [
            {
                dataField: 'label.label_en',
                text: i18n.t('static.country.countryMaster'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'countryCode',
                text: i18n.t('static.country.countrycode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'active',
                text: i18n.t('static.common.status'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (
                        (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
                    );
                }
            }];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
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
                text: 'All', value: this.state.selCountry.length
            }]
        }
        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        {/* <i className="icon-menu"></i>{i18n.t('static.country.countrylist')} */}
                        <i className="icon-menu"></i><strong>{i18n.t('static.country.countrylist')}</strong>{' '}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Realm Country" onClick={this.addNewCountry}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody>
                        <Col md="3">
                            <FormGroup>
                                <Label htmlFor="appendedInputButton">Status</Label>
                                <div className="controls">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="active"
                                            id="active"
                                            bsSize="lg"
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            <option value="true">{i18n.t('static.common.active')}</option>
                                            <option value="false">{i18n.t('static.common.disabled')}</option>

                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <ToolkitProvider
                            keyField="countryId"
                            data={this.state.selCountry}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div>
                                        <hr />
                                        <SearchBar {...props.searchProps} />
                                        <ClearSearchButton {...props.searchProps} />
                                        <BootstrapTable noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editCountry(row);
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