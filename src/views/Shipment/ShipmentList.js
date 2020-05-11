import React, { Component } from 'react';
import LanguageService from '../../api/LanguageService.js'
import { NavLink } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Col, Row, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationService from '../Common/AuthenticationService.js';
import data from '../Tables/DataTable/_data';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

// import { HashRouter, Route, Switch } from 'react-router-dom';
const entityname = i18n.t('static.shipment.shipment');
export default class LanguageListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            langaugeList: [],
            message: '',
            selSource: []
        }
        this.editLanguage = this.editLanguage.bind(this);

    }

    editLanguage(language) {
        this.props.history.push({
            pathname: `/language/editLanguage/${language.languageId}`,
            // state: { language }
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageList()
            .then(response => {
                console.log(response.data)
                if (response.status == 200) {
                    this.setState({ langaugeList: response.data, selSource: response.data })
                }
            })

    }


    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [{
            dataField: 'languageName',
            text: i18n.t('static.language.language'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'languageCode',
            text: i18n.t('static.language.languageCode'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '}
                    </CardHeader>
                    <CardBody className="pb-lg-0">

                        <Col md="9 pl-0">
                            <div className="d-md-flex Selectdiv2">
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
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {/* {realmList} */}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.dataSource.program')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {/* {programList} */}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.datasourcetype.datasourcetype')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="dataSourceTypeId"
                                                id="dataSourceTypeId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {/* {dataSourceTypeList} */}
                                            </Input>
                                            <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        <ToolkitProvider
                            keyField="languageId"
                            data={this.state.selSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                            
                        >
                            {
                                props => (

                                    <div className="TableCust" style={{ display: "none" }}>
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editLanguage(row);
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