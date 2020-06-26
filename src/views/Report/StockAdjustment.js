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
import csvicon from '../../assets/img/csv.png';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}



const entityname = i18n.t('static.region.region');

class StockAdjustmentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            loading: true
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.filterData(value);
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
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
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,1 vial",
                            "month": "Feb 2020",
                            "stockAdjustment": "100",
                            "createdBy": "Josh",
                            "createdDate": "Feb-01-2020",
                            "notes": "bottle lost",
                        },
                        {
                            "active": true,
                            "regionId": 2,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,1 vial",
                            "month": "Mar 2020",
                            "stockAdjustment": "900",
                            "createdBy": "Josh",
                            "createdDate": "Mar-06-2020",
                            "notes": "lost",
                        },
                        {
                            "active": true,
                            "regionId": 3,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,1 vial",
                            "month": "Apr 2020",
                            "stockAdjustment": "200",
                            "createdBy": "Josh",
                            "createdDate": "Apr-05-2020",
                            "notes": "damage",
                        },
                        {
                            "active": true,
                            "regionId": 4,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,50 vial",
                            "month": "Mar 2020",
                            "stockAdjustment": "900",
                            "createdBy": "Alan",
                            "createdDate": "Mar-01-2020",
                            "notes": "lost",
                        },
                        {
                            "active": true,
                            "regionId": 5,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,50 vial",
                            "month": "Apr 2020",
                            "stockAdjustment": "1000",
                            "createdBy": "Alan",
                            "createdDate": "Apr-02-2020",
                            "notes": "expire",
                        },
                        {
                            "active": true,
                            "regionId": 6,
                            "programName": "HIV/AIDS - Malawi - National",
                            "planningUnit": "Abacavir 20 mg/mL Solution, 240 mL",
                            "month": "Apr 2020",
                            "stockAdjustment": "500",
                            "createdBy": "Olivia",
                            "createdDate": "Apr-04-2020",
                            "notes": "tablet lost",
                        },
                        {
                            "active": true,
                            "regionId": 7,
                            "programName": "HIV/AIDS - Malawi - National",
                            "planningUnit": "Abacavir 20 mg/mL Solution, 240 mL",
                            "month": "May 2020",
                            "stockAdjustment": "200",
                            "createdBy": "Olivia",
                            "createdDate": "May-02-2020",
                            "notes": "expire",
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

        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const columns = [
            {
                dataField: 'programName',
                text: 'Program',
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'planningUnit',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'month',
                text: 'Month',
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'stockAdjustment',
                text: 'Stock Adjustment',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'createdBy',
                text: 'Last Updated By',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'createdDate',
                text: 'Last Updated Date',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'notes',
                text: 'Notes',
                sort: true,
                align: 'left',
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
                        <i className="icon-menu"></i><strong>Stock Adjustment Report</strong>{' '}
                        <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                    </CardHeader>
                    <CardBody className="pb-lg-0">

                        <Col md="12 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="Region-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls SelectGo Regioncalender">
                                        <InputGroup>
                                            <Picker
                                                ref="pickRange"
                                                years={{ min: 2013 }}
                                                value={rangeValue}
                                                lang={pickerLang}
                                                //theme="light"
                                                onChange={this.handleRangeChange}
                                                onDismiss={this.handleRangeDissmis}
                                            >
                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                            </Picker>

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

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Planning Unit</Label>
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

                                    <div className="TableCust listRegionAlignThtd">
                                        <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
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
export default StockAdjustmentComponent;
