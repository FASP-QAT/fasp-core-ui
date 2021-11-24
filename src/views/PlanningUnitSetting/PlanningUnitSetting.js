import React, { Component } from 'react';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import Picker from 'react-month-picker'
import i18n from '../../i18n'
import MonthBox from '../../CommonComponent/MonthBox.js'
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import {
    SECRET_KEY, DATE_FORMAT_CAP,
    MONTHS_IN_PAST_FOR_SUPPLY_PLAN,
    TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN,
    PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN, MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS, PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DEFAULT_MAX_MONTHS_OF_STOCK, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INVENTORY_DATA_SOURCE_TYPE, SHIPMENT_DATA_SOURCE_TYPE, QAT_DATA_SOURCE_ID, FIRST_DATA_ENTRY_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM, DATE_FORMAT_CAP_WITHOUT_DATE,
    REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH
} from '../../Constants.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js';
import csvicon from '../../assets/img/csv.png'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import {
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    Col,
    Row,
    CardFooter,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form, Modal, ModalHeader, ModalFooter, ModalBody, Button
} from 'reactstrap';
import NumberFormat from 'react-number-format';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';

const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]
export default class PlanningUnitSetting extends Component {
    constructor(props) {
        super(props);

        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            selsource: [],
            loading: false,
            datasetId: '',
            datasetList: [],
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: '',
            allowAdd: false,

        }
        this.getDatasetList = this.getDatasetList.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
    }

    componentDidMount() {
        this.getDatasetList();
    }

    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();
            var datasetList = [];

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;

                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                for (var i = 0; i < filteredGetRequestList.length; i++) {

                    var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                    var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson1 = JSON.parse(programData);
                    console.log("programJson1-------->1", programJson1);

                    datasetList.push({
                        programCode: filteredGetRequestList[i].programCode,
                        programVersion: filteredGetRequestList[i].version,
                        programId: filteredGetRequestList[i].programId,
                        versionId: filteredGetRequestList[i].version,
                        id: filteredGetRequestList[i].id,
                        loading: false,
                        forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                        forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                        healthAreaList: programJson1.healthAreaList,
                        consumptionList: programJson1.consumptionList,
                        regionList: programJson1.regionList,
                        label: programJson1.label,
                        realmCountry: programJson1.realmCountry,
                        planningUnitList: programJson1.planningUnitList,
                    });

                    // }
                }
                console.log("DATASET-------->", datasetList);
                this.setState({
                    datasetList: datasetList,
                }, () => {
                    // this.getTracerCategoryList();
                })


            }.bind(this);
        }.bind(this);
    }

    setProgramId(event) {
        if (event.target.value != 0) {
            var sel = document.getElementById("forecastProgramId");
            var tempId = sel.options[sel.selectedIndex].text;
            let forecastProgramVersionId = tempId.split('~')[1];
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == event.target.value && c.versionId == forecastProgramVersionId)[0]
            let startDateSplit = selectedForecastProgram.forecastStartDate.split('-');
            let stopDateSplit = selectedForecastProgram.forecastStopDate.split('-');

            let forecastStopDate = new Date(selectedForecastProgram.forecastStartDate);
            forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);

            let d1 = new Date(startDateSplit[1] - 3 + '-' + new Date(selectedForecastProgram.forecastStartDate).getMonth() + 1 + '01 00:00:00');
            d1.setMonth(d1.getMonth() - 1);

            this.setState(
                {
                    datasetId: event.target.value,
                    rangeValue: { from: { year: startDateSplit[1] - 3, month: new Date(selectedForecastProgram.forecastStartDate).getMonth() + 1 }, to: { year: forecastStopDate.getFullYear(), month: forecastStopDate.getMonth() + 1 } },
                    startDateDisplay: months[new Date(selectedForecastProgram.forecastStartDate).getMonth() + 1] + ' ' + startDateSplit[1] - 3,
                    endDateDisplay: months[forecastStopDate.getMonth() + 1] + ' ' + forecastStopDate.getFullYear(),
                    beforeEndDateDisplay: months[d1.getMonth() + 1] + ' ' + forecastStopDate.getFullYear(),
                }, () => {
                    console.log("d----------->1", this.state.startDateDisplay);
                    console.log("d----------->2", this.state.endDateDisplay);
                    console.log("d----------->3", this.state.beforeEndDateDisplay);

                    this.filterData();
                })
        } else {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
            var dt1 = new Date();
            dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
            this.setState(
                {
                    datasetId: 0,
                    rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                    this.filterData();
                })
        }

    }

    filterData() {

        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        var forecastProgramId = document.getElementById("forecastProgramId").value;
        console.log("forecastProgramId--------->", forecastProgramId);

        if (forecastProgramId > 0) {
            var sel = document.getElementById("forecastProgramId");
            var tempId = sel.options[sel.selectedIndex].text;
            let forecastProgramVersionId = tempId.split('~')[1];
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == forecastProgramVersionId)[0];
            console.log("selectedForecastProgram---------->", selectedForecastProgram);
            this.setState(
                {
                    selsource: selectedForecastProgram.planningUnitList,
                }, () => {
                    this.buildJExcel();
                })
        } else {
            this.setState(
                {
                    allowAdd: false
                }, () => {

                })
        }
    }

    handleRangeChange(value, text, listIndex) {

    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.filterData();
        })

    }
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    dateformatter = value => {
        var dt = new Date(value)
        return moment(dt).format('DD-MMM-YY');
    }
    formatter = value => {

        var cell1 = value
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }


    buildJExcel() {
        let outPutList = this.state.selsource;
        // console.log("outPutList---->", outPutList);
        let outPutListArray = [];
        let count = 0;

        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            data[0] = getLabelText(outPutList[j].planningUnit.forecastingUnit.productCategory.label, this.state.lang)
            data[1] = getLabelText(outPutList[j].planningUnit.label, this.state.lang)
            data[2] = outPutList[j].consuptionForecast
            data[3] = outPutList[j].treeForecast;
            data[4] = outPutList[j].stock;
            data[5] = outPutList[j].existingShipments;
            data[6] = outPutList[j].monthsOfStock;
            data[7] = (outPutList[j].procurementAgent == null || outPutList[j].procurementAgent == undefined ? 'Custom' : outPutList[j].procurementAgent.code);
            data[8] = outPutList[j].price;
            data[9] = outPutList[j].programPlanningUnitId;
            data[10] = 1;

            outPutListArray[count] = data;
            count++;
        }
        // if (costOfInventory.length == 0) {
        //     data = [];
        //     outPutListArray[0] = data;
        // }
        // console.log("outPutListArray---->", outPutListArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = outPutListArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 150, 60, 60, 60, 60, 60, 100, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Planning Unit Category',
                    type: 'text',
                    // readOnly: true// 0A
                },
                {
                    title: 'Planning Unit',
                    type: 'text',
                    // readOnly: true //1B
                },
                {
                    title: 'Consumption Forecast?',
                    type: 'checkbox',
                    // readOnly: true //2C
                },
                {
                    title: 'Tree Forecast?',
                    type: 'checkbox',
                    // readOnly: true //3D
                },
                {
                    title: 'Stock (end of Dec 2020)',
                    type: 'text',
                    // readOnly: true //4E
                },
                {
                    title: 'Existing Shipments (Jan 2021 - Dec 2023)',
                    type: 'text',
                    // readOnly: true //5F
                },
                {
                    title: 'Desired Months of Stock (end of Dec 2023)',
                    type: 'text',
                    // readOnly: true //6G
                },
                {
                    title: 'Price Type',
                    type: 'text',
                    // readOnly: true //7H
                },
                {
                    title: 'Unit Price',
                    type: 'text',
                    // readOnly: true //8I
                },
                {
                    title: 'programPlanningUnitId',
                    type: 'hidden',
                    // readOnly: true //9J
                },
                {
                    title: 'isChange',
                    type: 'hidden',
                    // readOnly: true //10K
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                var rowData = elInstance.getRowData(y);
                var programPlanningUnitId = rowData[9];
                if (programPlanningUnitId == 0) {
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    var cellA = elInstance.getCell(`A${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    cellA.classList.remove('readonly');
                } else {
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    var cellA = elInstance.getCell(`A${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    cellA.classList.add('readonly');
                }

            },
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,


            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false, allowAdd: true
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    formSubmit = function () {

    }

    addRow = function () {

        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = "";
        data[1] = "";
        data[2] = true;
        data[3] = true;
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = 0;
        data[10] = 1;

        this.el.insertRow(
            data, 0, 1
        );
    };

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );


        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode + '~' + item.versionId}
                    </option>
                )
            }, this);

        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }


        return (
            <div className="animated fadeIn" >

                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">

                    </div>

                    <CardBody className="pb-lg-3 pt-lg-0">
                        <div className="TableCust" >
                            <div ref={ref}>

                                <Col md="12 pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="forecastProgramId"
                                                        id="forecastProgramId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setProgramId(e); }}
                                                        value={this.state.datasetId}

                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {datasets}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">Range</Label>
                                            <div className="controls edit">

                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={rangeValue}
                                                    lang={pickerLang}
                                                    // disable={true}
                                                    //theme="light"
                                                    onChange={this.handleRangeChange}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>

                                        </FormGroup>


                                    </div>
                                </Col>


                            </div>
                        </div>

                        <div className="" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div id="tableDiv">
                            </div>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardBody>

                    {
                        this.state.allowAdd &&
                        <CardFooter>
                            {/* {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') && */}
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                            {/* } */}
                        </CardFooter>
                    }

                </Card>
            </div>
        );
    }
}