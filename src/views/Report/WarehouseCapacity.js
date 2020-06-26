import React, { Component } from 'react';
import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService.js";

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'



const entityname = i18n.t('static.region.region');

class WarehouseCapacityComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
    }
    filterData() {
        let countryId = document.getElementById("realmCountryId").value;
        if (countryId != 0) {
            const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
            this.setState({
                selRegion: selRegion
            });
        } else {
            this.setState({
                selRegion: this.state.regionList
            });
        }
    }
    editRegion(region) {
        this.props.history.push({
            pathname: `/region/editRegion/${region.regionId}`,
            // state: { region }
        });
    }
    addRegion(region) {
        this.props.history.push({
            pathname: "/region/addRegion"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RegionService.getRegionList()
            .then(response => {
                console.log("RESP---", response.data);

                if (response.status == 200) {
                    this.setState({
                        regionList: response.data,
                        selRegion: [{
                            "active": true,
                            "regionId": 1,
                            "label": {
                                "active": false,
                                "labelId": 41,
                                "label_en": "National level",
                                "label_sp": "",
                                "label_fr": "",
                                "label_pr": ""
                            },
                            "realmCountry": {
                                "active": false,
                                "realmCountryId": 1,
                                "country": {
                                    "active": false,
                                    "countryId": 2,
                                    "countryCode": "KEN",
                                    "label": {
                                        "active": false,
                                        "labelId": 306,
                                        "label_en": "Kenya",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "currency": null
                                },
                                "realm": {
                                    "active": false,
                                    "realmId": 1,
                                    "label": {
                                        "active": false,
                                        "labelId": 4,
                                        "label_en": "USAID",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "realmCode": "UAID",
                                    "defaultRealm": false
                                },
                                "defaultCurrency": null
                            },
                            "gln": '1298769856365',
                            "capacityCbm": '40,000',
                            "regionIdString": "1",
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                        },
                        {
                            "active": true,
                            "regionId": 2,
                            "label": {
                                "active": false,
                                "labelId": 42,
                                "label_en": "North",
                                "label_sp": "",
                                "label_fr": "",
                                "label_pr": ""
                            },
                            "realmCountry": {
                                "active": false,
                                "realmCountryId": 2,
                                "country": {
                                    "active": false,
                                    "countryId": 3,
                                    "countryCode": "MWI",
                                    "label": {
                                        "active": false,
                                        "labelId": 343,
                                        "label_en": "Malawi",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "currency": null
                                },
                                "realm": {
                                    "active": false,
                                    "realmId": 1,
                                    "label": {
                                        "active": false,
                                        "labelId": 4,
                                        "label_en": "USAID",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "realmCode": "UAID",
                                    "defaultRealm": false
                                },
                                "defaultCurrency": null
                            },
                            "gln": '6758432123456',
                            "capacityCbm": '18,000',
                            "regionIdString": "2",
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                        },
                        {
                            "active": true,
                            "regionId": 3,
                            "label": {
                                "active": false,
                                "labelId": 43,
                                "label_en": "South",
                                "label_sp": "",
                                "label_fr": "",
                                "label_pr": ""
                            },
                            "realmCountry": {
                                "active": false,
                                "realmCountryId": 2,
                                "country": {
                                    "active": false,
                                    "countryId": 3,
                                    "countryCode": "MWI",
                                    "label": {
                                        "active": false,
                                        "labelId": 343,
                                        "label_en": "Malawi",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "currency": null
                                },
                                "realm": {
                                    "active": false,
                                    "realmId": 1,
                                    "label": {
                                        "active": false,
                                        "labelId": 4,
                                        "label_en": "USAID",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "realmCode": "UAID",
                                    "defaultRealm": false
                                },
                                "defaultCurrency": null
                            },
                            "gln": '5678903456789',
                            "capacityCbm": '13,500',
                            "regionIdString": "3",
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                        }

                        ],
                        loading: false
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })

        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmCountryList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);

        const columns = [
            {
                dataField: 'realmCountry.country.label',
                text: i18n.t('static.region.country'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'programName',
                text: 'Program',
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'label',
                text: i18n.t('static.region.region'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'gln',
                text: i18n.t('static.region.gln'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'capacityCbm',
                text: 'Capacity (CBM)',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }

        ];
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
                text: 'All', value: this.state.selRegion.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>Warehouse Capacity Report</strong>{' '}
                        <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                    </CardHeader>
                    <CardBody className="pb-lg-0">

                        {/* <Form >
                            <Col md="12 pl-0">
                                <div className="row">
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmCountries}
                                            </Input>
                                        </InputGroup>
                                    </FormGroup>

                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="countrysId">Program</Label>
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmCountries}
                                            </Input>
                                        </InputGroup>
                                    </FormGroup>

                                </div>
                            </Col>
                        </Form> */}

                        <Col md="6 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmCountries}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Program</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmCountries}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>


                        <ToolkitProvider
                            keyField="regionId"
                            data={this.state.selRegion}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (

                                    <div className="TableCust listPrportFundingAlignThtd">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            /* rowEvents={{
                                                 onClick: (e, row, rowIndex) => {
                                                     this.editRegion(row);
                                                 }
                                             }}*/
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default WarehouseCapacityComponent;