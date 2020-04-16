import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, CardHeader, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import UnitService from '../../api/UnitService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import DimensionService from '../../api/DimensionService.js';
import getLabelText from '../../CommonComponent/getLabelText.js';

// import { HashRouter, Route, Switch } from 'react-router-dom';
const entityname = i18n.t('static.unit.unit');
export default class UnitListComponent extends Component {

    constructor(props) {
        super(props);
        /* this.table = data.rows;
         this.options = {
             sortIndicator: true,
             hideSizePerPage: true,
             paginationSize: 3,
             hidePageListOnlyOnePage: true,
             clearSearch: true,
             alwaysShowAllBtns: false,
             withFirstAndLast: false,
             onRowClick: function (row) {
                 // console.log("row--------------", row);
                 this.editUnit(row);
             }.bind(this)
 
         }*/

        this.state = {
            unitList: [],
            message: '',
            selSource: [],
            dimensions: [],
            lang: localStorage.getItem('lang')
        }
        this.editUnit = this.editUnit.bind(this);
        this.addUnit = this.addUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);

    }

    editUnit(unit) {
        this.props.history.push({
            pathname: `/unit/editUnit/${unit.unitId}`,
            // state: { unit }
        });
    }

    addUnit() {
        if (navigator.onLine) {
            this.props.history.push(`/unit/addUnit`)
        } else {
            alert(i18n.t('static.common.online'))
        }
    }

    filterData() {
        let dimensionId = document.getElementById("dimensionId").value;
        if (dimensionId != 0) {
            const selSource = this.state.unitList.filter(c => c.dimension.id == dimensionId)
            this.setState({
                selSource
            });
        } else {
            this.setState({
                selSource: this.state.unitList
            });
        }
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        DimensionService.getDimensionListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        dimensions: response.data
                    })
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );

        UnitService.getUnitListAll()
            .then(response => {
                console.log(response)

                this.setState({
                    unitList: response.data,
                    selSource: response.data
                })

            })
            .catch(
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

    }

    formatLabel(cell, row) {
        console.log("----------jjjjjjj",cell);
        return getLabelText(cell, this.state.lang);
    }
    render() {
        const { dimensions } = this.state;
        let dimensionList = dimensions.length > 0
            && dimensions.map((item, i) => {
                return (
                    <option key={i} value={item.dimensionId}>
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
            dataField: 'label',
            text: i18n.t('static.unit.unit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'unitCode',
            text: i18n.t('static.unit.unitCode'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'dimension.label',
            text: i18n.t('static.dimension.dimension'),
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
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addUnit}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>   
                        <Col md="3 pl-0">
                        <FormGroup>
                            <Label htmlFor="appendedInputButton">{i18n.t('static.dimension.dimension')}</Label>
                            <div className="controls SelectGo">
                                <InputGroup>
                                    <Input
                                        type="select"
                                        name="dimensionId"
                                        id="dimensionId"
                                        bsSize="sm"
                                    >
                                        <option value="0">{i18n.t('static.common.all')}</option>
                                        {dimensionList}
                                    </Input>
                                    <InputGroupAddon addonType="append">
                                        <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        </FormGroup>
                    </Col>

                        <ToolkitProvider
                            keyField="unitId"
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
                                        <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editUnit(row);
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