import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import moment from "moment";

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

export default class StepOneImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);

        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            mapPlanningUnitEl: '',
            lang: localStorage.getItem('lang'),
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            rangeValue: { from: { year: 2020, month: 1 }, to: { year: 2024, month: 12 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: false,
            selSource: []

        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.filterData = this.filterData.bind(this);

    }



    checkValidation() {

    }


    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText && this.props.removeMessageText();
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionWithoutPagination(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        // tr.children[2].classList.add('AsteriskTheadtrTd');
        // tr.children[3].classList.add('AsteriskTheadtrTd');
    }

    componentDidMount() {


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

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    filterData() {
        let tempList = [];
        tempList.push({ id: 1, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 2, v3: 0.694444 });
        tempList.push({ id: 2, v1: 'Male Condom (Latex) Lubricated, No Logo Red Strawberry, 53 mm, 3000 Pieces [4177]', v2: 3, v3: 3000 });
        tempList.push({ id: 3, v1: 'Male Condom (Latex) Lubricated, Hot Pink No Logo, 53 mm, 1 Each', v2: 1, v3: 0 });


        this.setState({
            selSource: tempList,
            loading: true
        },
            () => {
                this.buildJexcel();
            })
    }

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].id
                // data[1] = getLabelText(papuList[j].label, this.state.lang)
                data[1] = papuList[j].v1
                data[2] = papuList[j].v2
                data[3] = papuList[j].v3 == 0 ? '' : papuList[j].v3

                papuDataArr[count] = data;
                count++;
            }
        }

        // if (papuDataArr.length == 0) {
        //     data = [];
        //     data[0] = 0;
        //     data[1] = "";
        //     data[2] = true
        //     data[3] = "";
        //     data[4] = "";
        //     data[5] = 1;
        //     data[6] = 1;
        //     papuDataArr[0] = data;
        // }

        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapRegion"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapImport"), '');
        this.el.destroy();

        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100],
            columns: [

                {
                    title: 'id',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'Supply Plan Planning Unit',
                    type: 'text',
                    // readOnly: true,
                    textEditor: true,
                },
                {
                    title: 'Forecast Planning Unit',
                    // readOnly: true,
                    type: 'dropdown',
                    // source: this.state.forecastMethodTypeList,
                    source: [
                        { id: 1, name: 'Do not import' },
                        { id: 2, name: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]' },
                        { id: 3, name: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 1 Each [4181]' },

                    ]
                },
                {
                    title: 'Multiplier',
                    type: 'numeric',
                    decimal: '.',
                    // readOnly: true,
                    textEditor: true,
                },


            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);


                    var id = rowData[0];
                    // console.log("addRowId------>", addRowId);
                    if (id == 1) {// grade out
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }

                    if (id == 3) {// grade out
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'color', textColor);
                    } else {                        
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', 'transparent');
                    }

                }

            }.bind(this),
            pagination: false,
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            // position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            // allowDeleteRow: true,
            // onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            // oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: false
        };

        this.el = jexcel(document.getElementById("mapPlanningUnit"), options);
        this.setState({
            loading: false
        })
    }

    render() {
        const { rangeValue } = this.state
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>

                <div className="row ">
                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label> */}
                        <Label htmlFor="appendedInputButton">Supply Plan Program</Label>
                        <div className="controls ">
                            <InputGroup>
                                <Input
                                    type="select"
                                    name="programId"
                                    id="programId"
                                    bsSize="sm"
                                // onChange={this.filterVersion}
                                // onChange={(e) => { this.setProgramId(e); }}
                                // value={this.state.programId}
                                >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    <option value="1">SWZ-PRH/CON-MOH</option>
                                    <option value="2">Benin Malaria</option>
                                    <option value="3">Burundi Lab</option>
                                    <option value="4">TZA - PRH/CON</option>

                                </Input>

                            </InputGroup>
                        </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label> */}
                        <Label htmlFor="appendedInputButton">Supply Plan Version</Label>
                        <div className="controls">
                            <InputGroup>
                                <Input
                                    type="select"
                                    name="versionId"
                                    id="versionId"
                                    bsSize="sm"
                                // onChange={(e) => { this.getPlanningUnit(); }}
                                // onChange={(e) => { this.setVersionId(e); }}
                                // value={this.state.versionId}
                                >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3*</option>
                                    <option value="4">4*</option>
                                </Input>

                            </InputGroup>
                        </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label> */}
                        <Label htmlFor="appendedInputButton">Forecast Program</Label>
                        <div className="controls ">
                            <InputGroup>
                                <Input
                                    type="select"
                                    name="isPlannedShipmentId"
                                    id="isPlannedShipmentId"
                                    bsSize="sm"
                                    onChange={this.filterData}
                                >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    <option value="1">Tanzania Condoms & ARV</option>
                                    <option value="2">TZA - PRH/CON</option>
                                </Input>

                            </InputGroup>
                        </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label> */}
                        <Label htmlFor="appendedInputButton">Range</Label>
                        <div className="controls  Regioncalender">

                            <Picker
                                ref="pickRange"
                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                value={rangeValue}
                                lang={pickerLang}
                                //theme="light"
                                onChange={this.handleRangeChange}
                                onDismiss={this.handleRangeDissmis}
                            >
                                <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                            </Picker>

                        </div>
                    </FormGroup>
                </div>


                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }} >

                    <div id="mapPlanningUnit" className="RowheightForjexceladdRow">
                    </div>
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
                <FormGroup>
                    <Button color="info" size="md" className="float-right mr-1" type="submit" onClick={() => this.props.finishedStepOne()} >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                </FormGroup>
            </>
        );
    }

}