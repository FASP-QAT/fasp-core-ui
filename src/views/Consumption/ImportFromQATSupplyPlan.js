import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
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
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import Pdf from "react-to-pdf"
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import 'chartjs-plugin-annotation';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import MultiSelect from "react-multi-select-component";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import jexcel from 'jexcel-pro';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

class ImportFromQATSupplyPlan extends Component {
    constructor(props) {
        super(props);

        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            lang: localStorage.getItem('lang'),
            message: '',
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: false,
            selSource: []


        };
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.filterData = this.filterData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);

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
        tempList.push({ id: 1, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 1 Each', v2: 1, v3: 1 });
        tempList.push({ id: 2, v1: 'Female Condom (Nitrile) Lubricated, 17 cm, 1 Each', v2: 2, v3: 1 });
        tempList.push({ id: 3, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces', v2: 3, v3: 1 });
        tempList.push({ id: 4, v1: 'Male Condom (Latex) Lubricated, Prudence Plus, 53 mm, 3000 Pieces', v2: 1, v3: 1 });
        tempList.push({ id: 5, v1: 'Standard Days Method Color-Coded Plastic Beads, 1 Each', v2: 2, v3: 1 });
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
                data[3] = papuList[j].v3

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

        this.el = jexcel(document.getElementById("paputableDiv"), '');
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
                    readOnly: true,
                    textEditor: true,
                },
                {
                    title: 'Forecast Planning Unit',
                    // readOnly: true,
                    type: 'dropdown',
                    // source: this.state.forecastMethodTypeList,
                    source: [
                        { id: 1, name: 'Do not import' },
                        { id: 2, name: 'Copper TCu380A Intrauterine Device, 1 Each' },
                        { id: 3, name: 'Female Condom (Nitrile) Lubricated, 17 cm, 1000 Each' },
                        { id: 4, name: 'Levonorgestrel 30 mcg 35 Tablets/Cycle, 1 Cycle' },
                    ]
                },
                {
                    title: 'Multiplier',
                    type: 'text',
                    readOnly: true,
                    textEditor: true,
                },


            ],
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
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

        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    render() {
        const { rangeValue } = this.state
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <CardBody className="pt-lg-2 pb-lg-5">

                        <div className="pl-0">
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
                                                <option value="1">Angola Condoms</option>
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
                        </div>
                        <div className="" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div id="paputableDiv" className="jexcelremoveReadonlybackground">
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
                    <CardFooter>
                        <FormGroup>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>Import</Button>
                        </FormGroup>
                    </CardFooter>
                </Card>
            </div>
        );
    }
}
export default ImportFromQATSupplyPlan;



