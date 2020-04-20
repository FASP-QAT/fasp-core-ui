import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, CardHeader, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
import ForecastingUnitService from '../../api/ForecastingUnitService';
//import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
//import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import ProductService from '../../api/ProductService';
import TracerCategoryService from '../../api/TracerCategoryService';


const entityname = i18n.t('static.forecastingunit.forecastingunit');
export default class ForecastingUnitListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            realms: [],
            productCategories: [],
            tracerCategories: [],
            forecastingUnitList: [],
            message: '',
            selSource: [],
            lang: localStorage.getItem('lang'),
        }

        this.editForecastingUnit = this.editForecastingUnit.bind(this);
        this.addNewForecastingUnit = this.addNewForecastingUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.getProductCategories=this.getProductCategories.bind(this)
    }


    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    filterData() {
        let realmId = document.getElementById("realmId").value;
        let productCategoryId = document.getElementById("productCategoryId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;
        //alert(realmId+" "+productCategoryId+" "+tracerCategoryId)
        if (realmId != 0 && productCategoryId != 0 && tracerCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.tracerCategory.id == tracerCategoryId && c.productCategory.id == productCategoryId)
            this.setState({
                selSource
            });
        } else if (realmId != 0 && productCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.productCategory.id == productCategoryId)
            this.setState({
                selSource
            });
        } else if (realmId != 0 && tracerCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.tracerCategory.id == tracerCategoryId)

            this.setState({
                selSource
            });
        } else if (productCategoryId != 0 && tracerCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId && c.productCategory.id == productCategoryId)
            this.setState({
                selSource
            });
        } else if (realmId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId)
            this.setState({
                selSource
            });
        } else if (productCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.productCategory.id == productCategoryId)
            this.setState({
                selSource
            });
        } else if (tracerCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId)
            this.setState({
                selSource
            });
        } else {
            this.setState({
                selSource: this.state.forecastingUnitList
            });
        }
    }
    getProductCategories(){
        AuthenticationService.setupAxiosInterceptors();
        let realmId = document.getElementById("realmId").value;
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                this.setState({
                    productCategories: response.data
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
                                this.setState({ message:i18n.t( error.response.data.messageCode,{entityname:i18n.t('static.dashboard.productcategory')}) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realms: response.data
                    })
                    this.getProductCategories();
                } else {
                    this.setState({ message: response.data.messageCode })
                }
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
                                break;
                        }
                    }
                }
            );
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                this.setState({
                    tracerCategories: response.data
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
         


        ForecastingUnitService.getForecastingUnitListAll().then(response => {
            console.log("response------->" + response);
            this.setState({
                forecastingUnitList: response.data,
                selSource: response.data
            })
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

    editForecastingUnit(forecastingUnit) {
        this.props.history.push({
            pathname: `/forecastingUnit/editForecastingUnit/${forecastingUnit.forecastingUnitId}`,
            // state: { forecastingUnit: forecastingUnit }
        });

    }

    addNewForecastingUnit() {

        if (navigator.onLine) {
            this.props.history.push(`/forecastingUnit/addForecastingUnit`)
        } else {
            alert(i18n.t('static.common.online'))
        }
    }
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { tracerCategories } = this.state;
        let tracercategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.tracerCategoryId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                return (
                    <option key={i} value={item.productCategoryId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [{
            dataField: 'realm.label',
            text: i18n.t('static.realm.realm'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'productCategory.label',
            text: i18n.t('static.productcategory.productcategory'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'tracerCategory.label',
            text: i18n.t('static.tracercategory.tracercategory'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'genericLabel',
            text: i18n.t('static.product.productgenericname'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'label',
            text: i18n.t('static.forecastingunit.forecastingunit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
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
                text: 'All', value: this.state.selSource.length
            }]
        }
        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.common.listEntity', { entityname })}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewForecastingUnit}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody>
                        <Form >
                            <Col md="9 pl-0">
                                <div className="d-md-flex">
                                    <FormGroup>
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="realmId"
                                                    id="realmId"
                                                    bsSize="sm"
                                                >
                                                    {realmList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {productCategoryList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="tracerCategoryId"
                                                    id="tracerCategoryId"
                                                    bsSize="sm"
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {tracercategoryList}
                                                </Input>
                                                <InputGroupAddon addonType="append">
                                                    <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </div>
                            </Col>
                        </Form>
                        <ToolkitProvider
                            keyField="forecastingUnitId"
                            data={this.state.selSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editForecastingUnit(row);
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