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
    REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH,
    JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_CATELOG_PRICE
} from '../../Constants.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js';
import csvicon from '../../assets/img/csv.png'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import TracerCategoryService from '../../api/TracerCategoryService';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import "../../../node_modules/jsuites/dist/jsuites.css";
import { Prompt } from 'react-router';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import {
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    Col,
    Row,
    CardFooter,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form, Modal, ModalHeader, ModalFooter, ModalBody, Popover, PopoverBody, PopoverHeader, Button
} from 'reactstrap';
import NumberFormat from 'react-number-format';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import { falseDependencies } from 'mathjs';

const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]

const sortArray = (sourceArray) => {
    // const sortByName = (a, b) => getLabelText(a.label, this.state.lang).localeCompare(getLabelText(b.label, this.state.lang), 'en', { numeric: true });
    const sortByName = (a, b) => a.label.label_en.localeCompare(b.label.label_en, 'en', { numeric: true });
    return sourceArray.sort(sortByName);
};

const sortArrayByName = (sourceArray) => {

    // const sortByName = (a, b) => getLabelText(a.label, this.state.lang).localeCompare(getLabelText(b.label, this.state.lang), 'en', { numeric: true });
    const sortByName1 = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
    return sourceArray.sort(sortByName1);
};

export default class PlanningUnitSetting extends Component {
    constructor(props) {
        super(props);

        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            popoverOpenProgramSetting: false,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            selsource: [],
            loading: true,
            datasetId: '',
            datasetList: [],
            datasetList1: [],
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: '',
            allowAdd: false,
            allTracerCategoryList: [],
            allPlanningUnitList: [],
            originalPlanningUnitList: [],
            allProcurementAgentList: [],
            selectedForecastProgram: '',
            filterProcurementAgent: '',
            responsePa: [],
            forecastProgramId: '',
            forecastProgramVersionId: '',
            isChanged1: false,
            productCategoryList: [],
            productCategoryListNew: [],
            planningUnitList: [],

        }
        this.toggleProgramSetting = this.toggleProgramSetting.bind(this);
        this.changed = this.changed.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.tracerCategoryList = this.tracerCategoryList.bind(this);
        this.planningUnitList = this.planningUnitList.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.getPlanningUnitByTracerCategoryId = this.getPlanningUnitByTracerCategoryId.bind(this);
        this.getProcurementAgentPlanningUnitByPlanningUnitIds = this.getProcurementAgentPlanningUnitByPlanningUnitIds.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.disablePUNode = this.disablePUNode.bind(this);
        this.disablePUConsumptionData = this.disablePUConsumptionData.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.productCategoryList = this.productCategoryList.bind(this);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }


    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(10, y);
            if (parseInt(value) == 1) {

                //tracer category
                var col = ("A").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(0, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //planning unit
                var col = ("B").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(1, y);
                var value = this.el.getRowData(parseInt(y))[1];
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    for (var i = (json.length - 1); i >= 0; i--) {
                        var map = new Map(Object.entries(json[i]));
                        var planningUnitValue = map.get("1");
                        if (planningUnitValue == value && y != i && i > y) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                            i = -1;
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }

                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value == '' || value == null) {
                    value = this.el.getValueFromCoords(4, y);
                }
                // var value = this.el.getValueFromCoords(4, y);
                var reg = JEXCEL_INTEGER_REGEX;
                console.log("value------------->E", value);
                if (value == "") {
                    // this.el.setStyle(col, "background-color", "transparent");
                    // this.el.setStyle(col, "background-color", "yellow");
                    // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    // valid = false;
                } else {
                    if (isNaN(parseInt(value))) {//string value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                        valid = false;
                    } else if (!Number.isInteger(Number(value))) {//decimal value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
                        valid = false;
                    } else if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                var col = ("F").concat(parseInt(y) + 1);
                var value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value == '' || value == null) {
                    value = this.el.getValueFromCoords(5, y);
                }
                // var value = this.el.getValueFromCoords(5, y);
                var reg = JEXCEL_INTEGER_REGEX;
                if (value == "") {
                    // this.el.setStyle(col, "background-color", "transparent");
                    // this.el.setStyle(col, "background-color", "yellow");
                    // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    // valid = false;
                } else {
                    // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    //     this.el.setStyle(col, "background-color", "transparent");
                    //     this.el.setStyle(col, "background-color", "yellow");
                    //     this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    //     valid = false;
                    // } else {
                    //     this.el.setStyle(col, "background-color", "transparent");
                    //     this.el.setComments(col, "");
                    // }

                    if (isNaN(parseInt(value))) {//string value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                        valid = false;
                    } else if (!Number.isInteger(Number(value))) {//decimal value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
                        valid = false;
                    } else if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                var col = ("G").concat(parseInt(y) + 1);
                var value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value == '' || value == null) {
                    value = this.el.getValueFromCoords(6, y);
                }
                // var value = this.el.getValueFromCoords(6, y);
                var reg = JEXCEL_INTEGER_REGEX;
                if (value == "") {
                    // this.el.setStyle(col, "background-color", "transparent");
                    // this.el.setStyle(col, "background-color", "yellow");
                    // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    // valid = false;
                } else {
                    if (isNaN(parseInt(value))) {//string value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                        valid = false;
                    } else if (!Number.isInteger(Number(value))) {//decimal value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
                        valid = false;
                    } else if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                        valid = false;
                    } else if (parseInt(value) > 99) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.max99MonthAllowed'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //procurement agent
                var col = ("H").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(7, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                var col = ("I").concat(parseInt(y) + 1);
                var value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                console.log("Anchal--------->1", value);
                if (value == "") {
                    console.log("Anchal--------->2", value);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    console.log("Anchal--------->3", value);
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                    if (isNaN(parseInt(value))) {//string value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                        valid = false;
                    } else if (Number(value) < 0) {//negative value check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.negativeValueNotAllowed'));
                        valid = false;
                    } else if (!(reg.test(value))) {//regex check
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.max10Digit4AfterDecimal'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }

                }




            }
        }
        return valid;
    }

    // changed = function (instance, cell, x, y, value) {
    //     console.log("changed----------------> ", x, '---- ',this.el.getValueFromCoords(11, y));

    //     var rowData = this.el.getRowData(y);
    //     //planning unit category
    //     if (x == 0) {
    //         console.log("changed 2");
    //         var col = ("A").concat(parseInt(y) + 1);
    //         // alert("value--->",value);
    //         console.log("value--->", rowData[0]);
    //         console.log("rowData===>", this.el.getRowData(y));
    //         if (rowData[0] == "") {
    //             console.log("============in if when category is changed ");
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setStyle(col, "background-color", "yellow");
    //             this.el.setComments(col, i18n.t('static.label.fieldRequired'));
    //             this.el.setValueFromCoords(10, y, 1, true);
    //         } else {
    //             console.log("============in else when category is changed ");
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setComments(col, "");
    //             this.el.setValueFromCoords(10, y, 1, true);
    //         }
    //         var columnName = jexcel.getColumnNameFromId([parseInt(x) + 1, y]);
    //         instance.jexcel.setValue(columnName, '');

    //         columnName = jexcel.getColumnNameFromId([parseInt(x) + 7, y]);
    //         instance.jexcel.setValue(columnName, '');

    //         columnName = jexcel.getColumnNameFromId([parseInt(x) + 8, y]);
    //         instance.jexcel.setValue(columnName, '');
    //     }


    //     //planning unit
    //     if (x == 1) {
    //         var json = this.el.getJson(null, false);
    //         var col = ("B").concat(parseInt(y) + 1);
    //         if (value == "") {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setStyle(col, "background-color", "yellow");
    //             this.el.setComments(col, i18n.t('static.label.fieldRequired'));
    //         } else {
    //             console.log("json.length", json.length);
    //             var jsonLength = parseInt(json.length) - 1;
    //             console.log("jsonLength", jsonLength);
    //             for (var i = jsonLength; i >= 0; i--) {
    //                 console.log("i=---------->", i, "y----------->", y);
    //                 var map = new Map(Object.entries(json[i]));
    //                 var planningUnitValue = map.get("1");
    //                 console.log("Planning Unit value in change", map.get("1"));
    //                 console.log("Value----->", value);
    //                 if (planningUnitValue == value && y != i) {
    //                     this.el.setStyle(col, "background-color", "transparent");
    //                     this.el.setStyle(col, "background-color", "yellow");
    //                     this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
    //                     this.el.setValueFromCoords(10, y, 1, true);
    //                     i = -1;
    //                 } else {
    //                     this.el.setStyle(col, "background-color", "transparent");
    //                     this.el.setComments(col, "");
    //                     this.el.setValueFromCoords(10, y, 1, true);
    //                 }
    //             }
    //         }

    //         var columnName = jexcel.getColumnNameFromId([parseInt(x) + 6, y]);//7
    //         instance.jexcel.setValue(columnName, '');

    //         columnName = jexcel.getColumnNameFromId([parseInt(x) + 7, y]);//8
    //         instance.jexcel.setValue(columnName, '');
    //     }




    //     //stock
    //     if (x == 4) {
    //         var col = ("E").concat(parseInt(y) + 1);
    //         value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
    //         console.log("Stock------------------->1", value);
    //         if (value == '' || value == null) {
    //             value = this.el.getValueFromCoords(4, y);
    //         }
    //         // var reg = /^[0-9\b]+$/;
    //         console.log("Stock------------------->2", value);

    //         var reg = JEXCEL_INTEGER_REGEX;
    //         if (value != "") {
    //             if (isNaN(parseInt(value))) {//string value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'String value not allowed')
    //             } else if (!Number.isInteger(Number(value))) {//decimal value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Decimal value not allowed')
    //             } else if (!(reg.test(value))) {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Please enter 10 digit whole number')
    //             } else {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setComments(col, "");
    //             }
    //         } else {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setComments(col, "");
    //         }
    //         this.el.setValueFromCoords(10, y, 1, true);

    //     }

    //     //existing shipments
    //     if (x == 5) {
    //         var col = ("F").concat(parseInt(y) + 1);
    //         value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
    //         if (value == '' || value == null) {
    //             value = this.el.getValueFromCoords(5, y);
    //         }
    //         // var reg = /^[0-9\b]+$/;
    //         var reg = JEXCEL_INTEGER_REGEX;
    //         if (value != "") {

    //             if (isNaN(parseInt(value))) {//string value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'String value not allowed')
    //             } else if (!Number.isInteger(Number(value))) {//decimal value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Decimal value not allowed')
    //             } else if (!(reg.test(value))) {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Please enter 10 digit whole number')
    //             } else {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setComments(col, "");
    //             }
    //         } else {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setComments(col, "");
    //         }
    //         this.el.setValueFromCoords(10, y, 1, true);
    //     }

    //     //desired months of stock
    //     if (x == 6) {
    //         var col = ("G").concat(parseInt(y) + 1);
    //         value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
    //         if (value == '' || value == null) {
    //             value = this.el.getValueFromCoords(6, y);
    //         }
    //         // var reg = /^[0-9\b]+$/;
    //         var reg = JEXCEL_INTEGER_REGEX;
    //         if (value != "") {
    //             if (isNaN(parseInt(value))) {//string value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'String value not allowed')
    //             } else if (!Number.isInteger(Number(value))) {//decimal value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Decimal value not allowed')
    //             } else if (!(reg.test(value))) {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Please enter 10 digit whole number')
    //             } else if (parseInt(value) > 99) {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Maximum 99 months are allowed');
    //             } else {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setComments(col, "");
    //             }
    //         } else {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setComments(col, "");
    //         }
    //         this.el.setValueFromCoords(10, y, 1, true);
    //     }


    //     //procurement Agent
    //     if (x == 7) {
    //         var col = ("H").concat(parseInt(y) + 1);
    //         this.el.setValueFromCoords(10, y, 1, true);
    //         if (value == "") {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setStyle(col, "background-color", "yellow");
    //             this.el.setComments(col, i18n.t('static.label.fieldRequired'));
    //         } else {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setComments(col, "");
    //         }
    //         this.el.setValueFromCoords(10, y, 1, true);

    //         //setPrice
    //         if (value != -1 && value !== null && value !== '') {
    //             let planningUnitId = this.el.getValueFromCoords(1, y);
    //             // let planningUnitId = this.el.getValueFromCoords(7, y);
    //             let procurementAgentPlanningUnitList = this.state.responsePa;
    //             let tempPaList = procurementAgentPlanningUnitList[planningUnitId];
    //             console.log("mylist--------->1111", procurementAgentPlanningUnitList);
    //             console.log("mylist--------->1112", planningUnitId);

    //             let obj = tempPaList.filter(c => c.procurementAgent.id == value)[0];
    //             console.log("mylist--------->1113", obj);
    //             if (typeof obj != 'undefined') {
    //                 this.el.setValueFromCoords(8, y, obj.catalogPrice, true);
    //             } else {
    //                 this.el.setValueFromCoords(8, y, '', true);
    //             }

    //         } else {
    //             this.el.setValueFromCoords(8, y, '', true);
    //         }
    //     }


    //     //unit price
    //     if (x == 8) {
    //         var col = ("I").concat(parseInt(y) + 1);
    //         this.el.setValueFromCoords(10, y, 1, true);
    //         value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
    //         if (value == '' || value == null) {
    //             value = this.el.getValueFromCoords(8, y);
    //         }

    //         var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
    //         if (value == "") {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setStyle(col, "background-color", "yellow");
    //             this.el.setComments(col, i18n.t('static.label.fieldRequired'));
    //         } else {

    //             if (isNaN(parseInt(value))) {//string value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'String value not allowed')
    //             } else if (Number(value) < 0) {//negative value check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Negative value not allowed')
    //             } else if (!(reg.test(value))) {//regex check
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, 'Max 10 digit number and 4 digits after decimal are allowed.')
    //             } else {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setComments(col, "");
    //             }
    //         }
    //         this.el.setValueFromCoords(10, y, 1, true);
    //     }

    //     if (x != 10) {
    //         this.el.setValueFromCoords(10, y, 1, true);
    //     }

    // }


    oneditionend = function (instance, cell, x, y, value) {
        console.log("oneditionend---------Start");
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);
        var reg = /^0[0-9].*$/; //any no start with 0;

        if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            // console.log("RESP---------", parseFloat(rowData[8]));
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        }
        if (x == 8 && reg.test(value)) {
            elInstance.setValueFromCoords(8, y, Number(rowData[8]), true);
        }
        elInstance.setValueFromCoords(10, y, 1, true);

        console.log("oneditionend---------End");
    }


    onPaste(instance, data) {
        var z = -1;
        console.log("-----------------onPaste---------------------0", data);
        for (var i = 0; i < data.length; i++) {
            console.log("-----------------onPaste---------------------1", data[i]);
            if (z != data[i].y) {
                console.log("-----------------onPaste---------------------2");
                var index = (instance.jexcel).getValue(`N${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    console.log("-----------------onPaste---------------------3");
                    // (instance.jexcel).setValueFromCoords(8, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(2, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(3, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(9, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(10, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(11, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(12, data[i].y, {}, true);
                    (instance.jexcel).setValueFromCoords(13, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(14, data[i].y, true, true);
                    // (instance.jexcel).setValueFromCoords(15, data[i].y, "", true);
                    (instance.jexcel).setValueFromCoords(16, data[i].y, true, true);
                    z = data[i].y;
                }
            }
        }
    }


    changed = function (instance, cell, x, y, value) {
        console.log("changed--------->31 ", x, value);

        //Planning Unit
        // if (x == 1 && value != null && value != '') {
        //     let planningUnitArray = [];
        //     var tableJson = this.el.getJson(null, false);
        //     for (var i = 0; i < tableJson.length; i++) {
        //         var map1 = new Map(Object.entries(tableJson[i]));
        //         planningUnitArray.push(map1.get("1"));
        //     }
        //     console.log("mylist--------->31", planningUnitArray);
        //     // this.getProcurementAgentPlanningUnitByPlanningUnitIds(planningUnitArray);
        // }

        if (x == 7) {
            if (value != -1 && value !== null && value !== '') {
                let planningUnitId = this.el.getValueFromCoords(1, y);
                // let planningUnitId = this.el.getValueFromCoords(7, y);

                // let procurementAgentPlanningUnitList = this.state.responsePa;
                // let tempPaList = procurementAgentPlanningUnitList[planningUnitId];
                // console.log("mylist--------->1111", procurementAgentPlanningUnitList);

                let procurementAgentPlanningUnitList = this.state.originalPlanningUnitList;
                let tempPaList = procurementAgentPlanningUnitList.filter(c => c.id == planningUnitId)[0];


                console.log("mylist--------->1112", planningUnitId);

                // let obj = tempPaList.filter(c => c.procurementAgent.id == value)[0];
                let obj = tempPaList.procurementAgentPriceList.filter(c => c.id == value)[0];
                console.log("mylist--------->1113", obj);
                if (typeof obj != 'undefined') {
                    this.el.setValueFromCoords(8, y, obj.price, true);
                } else {
                    // this.el.setValueFromCoords(8, y, '', true);
                    let q = '';
                    q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
                }

            } else {
                // this.el.setValueFromCoords(8, y, '', true);
                let q = '';
                q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
            }

        }

        if (x == 0) {
            let q = '';
            q = (this.el.getValueFromCoords(1, y) != '' ? this.el.setValueFromCoords(1, y, '', true) : '');
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');

            // this.el.setValueFromCoords(1, y, '', true);
            // this.el.setValueFromCoords(7, y, '', true);
            // this.el.setValueFromCoords(8, y, '', true);
        }
        if (x == 1) {
            let q = '';
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');

            // this.el.setValueFromCoords(7, y, '', true);
            // this.el.setValueFromCoords(8, y, '', true);
        }

        //productCategory
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //planning unit
        if (x == 1) {
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                console.log("json.length", json.length);
                var jsonLength = parseInt(json.length) - 1;
                console.log("jsonLength", jsonLength);
                for (var i = jsonLength; i >= 0; i--) {
                    console.log("i=---------->", i, "y----------->", y);
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    console.log("Planning Unit value in change", map.get("1"));
                    console.log("Value----->", value);
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        // this.el.setValueFromCoords(10, y, 1, true);
                        i = -1;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        // this.el.setValueFromCoords(10, y, 1, true);
                    }
                }
            }
        }

        //stock
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            console.log("Stock------------------->1", value);
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(4, y);
            }
            // var reg = /^[0-9\b]+$/;
            console.log("Stock------------------->2", value);

            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'))
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'))
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

            }

        }

        //existing shipments
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(5, y);
            }
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {

                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'))
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'))
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setStyle(col, "background-color", "yellow");
                // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }

        //desired months of stock
        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(6, y);
            }
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'))
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'))
                } else if (parseInt(value) > 99) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.max99MonthAllowed'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setStyle(col, "background-color", "yellow");
                // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }


        //procurement Agent
        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            this.el.setValueFromCoords(10, y, 1, true);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }


        //unit price
        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            this.el.setValueFromCoords(10, y, 1, true);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(8, y);
            }
            // value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {

                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (Number(value) < 0) {//negative value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.negativeValueNotAllowed'))
                } else if (!(reg.test(value))) {//regex check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.max10Digit4AfterDecimal'))
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }

        this.setState({
            isChanged1: true,
        });

        if (x == 11) {
            console.log("Value@@@@@@@@@@@@@", value)
            //left align
            this.el.setStyle(`A${parseInt(y) + 1}`, 'text-align', 'left');
            this.el.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

            if (value == 1 || value == "") {
                var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
            }
        }

    }

    getPlanningUnitByTracerCategoryId(tracerCategoryId) {
        TracerCategoryService.getPlanningUnitByTracerCategoryId(tracerCategoryId)
            .then(response => {
                if (response.status == 200) {
                    return response.data;
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }

    getProcurementAgentPlanningUnitByPlanningUnitIds(planningUnitList) {
        PlanningUnitService.getProcurementAgentPlanningUnitByPlanningUnitIds(planningUnitList)
            .then(response => {
                if (response.status == 200) {
                    // console.log("planningUnitId------->2", response.data);
                    // var mylist = [];
                    // mylist[0] = {
                    //     name: 'Custom',
                    //     id: -1,
                    //     price: 0
                    // }

                    // let procurementAgentPlanningUnit = response.data;
                    // let loopvar = procurementAgentPlanningUnit[planningUnitList[0]]

                    // for (var i = 0; i < loopvar.length; i++) {
                    //     let obj = {
                    //         name: loopvar[i].procurementAgent.code,
                    //         id: loopvar[i].procurementAgent.id,
                    //         price: loopvar[i].catalogPrice,
                    //     }
                    //     mylist.push(obj);
                    // }
                    // console.log("planningUnitId------->3", mylist);
                    this.setState({
                        responsePa: response.data,
                    },
                        () => {
                            console.log("RESPO-------->", this.state.responsePa);
                            this.buildJExcel();
                        })


                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }

    tracerCategoryList() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log("List------->tr-original", response.data)
                    var listArray = response.data;

                    if (listArray.length > 0) {
                        sortArray(listArray);
                    }
                    // listArray.sort((a, b) => {
                    //     var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    //     var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    //     return itemLabelA > itemLabelB ? 1 : -1;
                    // });

                    let tempList = [];

                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].tracerCategoryId),
                                active: listArray[i].active,
                                healthArea: listArray[i].healthArea
                            }
                            tempList[i] = paJson
                        }
                    }

                    tempList.unshift({
                        name: 'All',
                        id: -1,
                        active: true,
                        healthArea: {}
                    });

                    this.setState({
                        allTracerCategoryList: tempList,
                        // tracerCategoryList1: response.data
                        // loading: false
                    },
                        () => {
                            console.log("List------->tr", this.state.allTracerCategoryList)
                            this.procurementAgentList();
                        })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }

    planningUnitList() {
        PlanningUnitService.getPlanningUnitByRealmId(AuthenticationService.getRealmId()).then(response => {
            console.log("RESP----->", response.data);

            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });

            let tempList = [];
            if (listArray.length > 0) {
                for (var i = 0; i < listArray.length; i++) {
                    var paJson = {
                        name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].planningUnitId),
                        id: parseInt(listArray[i].planningUnitId),
                        active: listArray[i].active,
                        forecastingUnit: listArray[i].forecastingUnit,
                        label: listArray[i].label
                    }
                    tempList[i] = paJson
                }
            }
            this.setState({
                allPlanningUnitList: tempList,
                originalPlanningUnitList: response.data
            }, () => {
                console.log("List------->pu", this.state.allPlanningUnitList)
                this.tracerCategoryList();
            });

        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {

                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 403:
                            this.props.history.push(`/accessDenied`)
                            break;
                        case 500:
                        case 404:
                        case 406:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                            break;
                    }
                }
            }
        );
    }

    procurementAgentList() {
        // ProcurementAgentService.getProcurementAgentListAll()
        //     .then(response => {
        //         if (response.status == 200) {

        //             var listArray = response.data;
        //             listArray.sort((a, b) => {
        //                 var itemLabelA = (a.procurementAgentCode).toUpperCase(); // ignore upper and lowercase
        //                 var itemLabelB = (b.procurementAgentCode).toUpperCase(); // ignore upper and lowercase                   
        //                 return itemLabelA > itemLabelB ? 1 : -1;
        //             });

        //             let tempList = [];

        //             if (listArray.length > 0) {
        //                 for (var i = 0; i < listArray.length; i++) {
        //                     var paJson = {
        //                         // name: getLabelText(listArray[i].label, this.state.lang),
        //                         name: listArray[i].procurementAgentCode,
        //                         id: parseInt(listArray[i].procurementAgentId),
        //                         active: listArray[i].active,
        //                         code: listArray[i].procurementAgentCode,
        //                         label: listArray[i].label
        //                     }
        //                     tempList[i] = paJson
        //                 }
        //             }

        //             tempList.unshift({
        //                 name: 'CUSTOM',
        //                 id: -1,
        //                 active: true,
        //                 code: 'CUSTOM',
        //                 label: {}
        //             });


        //             this.setState({
        //                 allProcurementAgentList: tempList,
        //                 // loading: false
        //             },
        //                 () => {
        //                     console.log("List------->pa", this.state.allProcurementAgentList);
        //                     // if (this.state.datasetList.length == 1) {
        //                     //     this.setProgramId();
        //                     // }
        //                     this.setProgramId();
        //                     // this.buildJExcel();
        //                 })
        //         } else {
        //             this.setState({
        //                 message: response.data.messageCode, loading: false
        //             },
        //                 () => {
        //                     this.hideSecondComponent();
        //                 })
        //         }

        //     })
        //     .catch(
        //         error => {
        //             if (error.message === "Network Error") {
        //                 this.setState({
        //                     message: 'static.unkownError',
        //                     loading: false
        //                 });
        //             } else {
        //                 switch (error.response ? error.response.status : "") {

        //                     case 401:
        //                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                         break;
        //                     case 403:
        //                         this.props.history.push(`/accessDenied`)
        //                         break;
        //                     case 500:
        //                     case 404:
        //                     case 406:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     case 412:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     default:
        //                         this.setState({
        //                             message: 'static.unkownError',
        //                             loading: false
        //                         });
        //                         break;
        //                 }
        //             }
        //         }
        //     );


        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
            var procurementAgentRequest = procurementAgentOs.getAll();
            var planningList = []
            procurementAgentRequest.onerror = function (event) {
                // Handle errors!
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            };
            procurementAgentRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = procurementAgentRequest.result;

                console.log("myResult----------->", myResult);


                var listArray = myResult;
                listArray.sort((a, b) => {
                    var itemLabelA = (a.procurementAgentCode).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = (b.procurementAgentCode).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                let tempList = [];

                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            // name: getLabelText(listArray[i].label, this.state.lang),
                            name: listArray[i].procurementAgentCode,
                            id: parseInt(listArray[i].procurementAgentId),
                            active: listArray[i].active,
                            code: listArray[i].procurementAgentCode,
                            label: listArray[i].label
                        }
                        tempList[i] = paJson
                    }
                }

                tempList.unshift({
                    name: 'CUSTOM',
                    id: -1,
                    active: true,
                    code: 'CUSTOM',
                    label: {}
                });


                this.setState({
                    allProcurementAgentList: tempList,
                    // loading: false
                },
                    () => {
                        console.log("List------->pa", this.state.allProcurementAgentList);
                        // if (this.state.datasetList.length == 1) {
                        //     this.setProgramId();
                        // }
                        // this.setProgramId();
                        this.productCategoryList();
                        // this.buildJExcel();
                    })

            }.bind(this);
        }.bind(this)
    }


    componentDidMount() {
        this.getDatasetList();
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
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
            var datasetList1 = [];

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
                        treeList: programJson1.treeList
                    });
                    datasetList1.push(filteredGetRequestList[i])
                    // }
                }
                console.log("DATASET-------->", datasetList);
                datasetList = datasetList.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                if (localStorage.getItem("sesForecastProgramIdReport") != '' && localStorage.getItem("sesForecastProgramIdReport") != undefined && localStorage.getItem("sesForecastVersionIdReport") != '' && localStorage.getItem("sesForecastVersionIdReport") != undefined && !localStorage.getItem("sesForecastVersionIdReport").includes('Local')) {

                    this.setState({
                        datasetList: datasetList,
                        datasetList1: datasetList1,
                        forecastProgramId: localStorage.getItem("sesForecastProgramIdReport"),
                        forecastProgramVersionId: localStorage.getItem("sesForecastVersionIdReport"),
                        datasetId: (datasetList.filter(c => c.programId == localStorage.getItem("sesForecastProgramIdReport") && c.programVersion == localStorage.getItem("sesForecastVersionIdReport")).length > 0 ? datasetList.filter(c => c.programId == localStorage.getItem("sesForecastProgramIdReport") && c.programVersion == localStorage.getItem("sesForecastVersionIdReport"))[0].id : ''),
                    }, () => {
                        // this.planningUnitList();
                        // this.tracerCategoryList();
                        this.procurementAgentList();
                    })
                } else {
                    this.setState({
                        datasetList: datasetList,
                        datasetList1: datasetList1,
                        forecastProgramId: (datasetList.length == 1 ? datasetList[0].programId : ''),
                        forecastProgramVersionId: (datasetList.length == 1 ? datasetList[0].programVersion : ''),
                        datasetId: (datasetList.length == 1 ? datasetList[0].id : ''),
                    }, () => {
                        // this.planningUnitList();
                        // this.tracerCategoryList();
                        this.procurementAgentList();
                    })
                }



            }.bind(this);
        }.bind(this);
    }

    setProgramId(event) {

        console.log("PID----------------->", document.getElementById("forecastProgramId").value);
        var pID = document.getElementById("forecastProgramId").value;
        if (pID != 0) {
            this.setState({
                loading: true
            })

            let programSplit = pID.split('_');

            let programId = programSplit[0];
            let versionId = programSplit[1];
            versionId = versionId.replace(/[^\d]/g, '');
            console.log("programSplit-------->1", versionId);
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0]

            // let programHealthAreaList = selectedForecastProgram.healthAreaList;
            // let tracerCategoryArray = [];
            // for (var i = 0; i < programHealthAreaList.length; i++) {
            //     let tracerCategoryObj = this.state.allTracerCategoryList.filter(c => c.healthArea.id == programHealthAreaList[i].id)
            //     tracerCategoryArray = tracerCategoryArray.concat(tracerCategoryObj);
            // }

            // let tracerCategoryArray1 = tracerCategoryArray.map(ele => (ele.id).toString());
            // let tracerCategoryArray2 = selectedForecastProgram.planningUnitList.map(ele => (ele.planningUnit.forecastingUnit.tracerCategory.id).toString());
            // let tracerCategoryArray3 = tracerCategoryArray1.concat(tracerCategoryArray2);
            // tracerCategoryArray3 = [... new Set(tracerCategoryArray3)];

            // console.log("tracerCategoryArray----------->3", tracerCategoryArray3);

            // PlanningUnitService.getPlanningUnitByRealmId(AuthenticationService.getRealmId())
            // PlanningUnitService.getActivePlanningUnitList()
            PlanningUnitService.getPlanningUnitForProductCategoryAndProgram(-1, programId)
                .then(response => {
                    console.log("RESP----->pu", response.data);

                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                // name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].planningUnitId),
                                // id: parseInt(listArray[i].planningUnitId),
                                // active: listArray[i].active,
                                // forecastingUnit: listArray[i].forecastingUnit,
                                // label: listArray[i].label

                                name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].id),
                                id: parseInt(listArray[i].id),
                                // active: listArray[i].active,
                                // forecastingUnit: listArray[i].forecastingUnit,
                                label: listArray[i].label
                            }
                            tempList[i] = paJson
                        }
                    }
                    this.setState({
                        allPlanningUnitList: tempList,
                        originalPlanningUnitList: response.data,
                        planningUnitList: response.data,
                    }, () => {
                        console.log("List------->pu123", this.state.allPlanningUnitList.filter(c => c.id == 915));

                        let forecastStartDate = selectedForecastProgram.forecastStartDate;
                        let forecastStopDate = selectedForecastProgram.forecastStopDate;

                        let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
                        beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);

                        localStorage.setItem("sesForecastProgramIdReport", parseInt(programId));
                        localStorage.setItem("sesForecastVersionIdReport", parseInt(versionId));

                        this.setState(
                            {
                                // rangeValue: { from: { year: startDateSplit[1] - 3, month: new Date(selectedForecastProgram.forecastStartDate).getMonth() + 1 }, to: { year: forecastStopDate.getFullYear(), month: forecastStopDate.getMonth() + 1 } },
                                rangeValue: { from: { year: new Date(forecastStartDate).getFullYear(), month: new Date(forecastStartDate).getMonth() + 1 }, to: { year: new Date(forecastStopDate).getFullYear(), month: new Date(forecastStopDate).getMonth() + 1 } },
                                // startDateDisplay: (forecastStartDate == '' ? '' : months[new Date(forecastStartDate).getMonth()] + ' ' + new Date(forecastStartDate).getFullYear()),
                                startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate).startOf('month').format("YYYY"))),
                                // endDateDisplay: (forecastStopDate == '' ? '' : months[new Date(forecastStopDate).getMonth()] + ' ' + new Date(forecastStopDate).getFullYear()),
                                endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate).startOf('month').format("YYYY"))),
                                beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
                                forecastProgramId: parseInt(programId),
                                forecastProgramVersionId: parseInt(versionId),
                                datasetId: selectedForecastProgram.id,

                            }, () => {
                                // console.log("d----------->0", d1);
                                // console.log("d----------->00", (d1.getMonth()));
                                // console.log("d----------->1", this.state.startDateDisplay);
                                // console.log("d----------->2", this.state.endDateDisplay);
                                // console.log("d----------->3", this.state.beforeEndDateDisplay);
                                // this.productCategoryList();
                                this.filterData();
                            })
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );






        } else {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
            var dt1 = new Date();
            dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
            this.setState(
                {
                    rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
                    // startDateDisplay: months[new Date(dt).getMonth() + 1] + ' ' + new Date(dt).getFullYear(),
                    // endDateDisplay: months[new Date(dt1).getMonth() + 1] + ' ' + new Date(dt1).getFullYear(),
                    startDateDisplay: '',
                    endDateDisplay: '',
                    forecastProgramId: 0,
                    forecastProgramVersionId: 0,
                    datasetId: '',
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                    this.filterData();
                })
        }

    }

    productCategoryList() {

        // ProductCategoryServcie.getProductCategoryListByRealmId(AuthenticationService.getRealmId()).then(response => {
        //     console.log("RESP----->1ProductCategoryServcie", response.data);
        //     var productCategoryListNew = [];

        //     // var listArray = response.data;
        //     // listArray.sort((a, b) => {
        //     //     var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
        //     //     var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
        //     //     return itemLabelA > itemLabelB ? 1 : -1;
        //     // });

        //     if (response.status == 200) {
        //         console.log("productCategory response----->", response.data);
        //         for (var k = 0; k < (response.data).length; k++) {
        //             var spaceCount = response.data[k].sortOrder.split(".").length;
        //             console.log("spaceCOunt--->", spaceCount);
        //             var indendent = "";
        //             for (var p = 1; p <= spaceCount - 1; p++) {
        //                 if (p == 1) {
        //                     indendent = indendent.concat("|_");
        //                 } else {
        //                     indendent = indendent.concat("_");
        //                 }
        //             }
        //             console.log("ind", indendent);
        //             console.log("indendent.concat(response.data[k].payload.label.label_en)-->", indendent.concat(response.data[k].payload.label.label_en));

        //             var productCategoryJson = {};
        //             if (response.data[k].payload.productCategoryId == 0) {
        //                 productCategoryJson = {
        //                     name: (response.data[k].payload.label.label_en),
        //                     id: -1
        //                 }
        //             } else {
        //                 productCategoryJson = {
        //                     name: (response.data[k].payload.label.label_en),
        //                     id: response.data[k].payload.productCategoryId
        //                 }
        //             }

        //             productCategoryListNew.push(productCategoryJson);

        //         }
        //         console.log("constant product category list====>", productCategoryListNew);
        //         this.setState({
        //             productCategoryList: response.data,
        //             productCategoryListNew: productCategoryListNew
        //         }, () => {
        //             this.filterData();
        //         });

        //     }

        // }).catch(
        //     error => {
        //         if (error.message === "Network Error") {
        //             this.setState({
        //                 message: 'static.unkownError',
        //                 loading: false
        //             });
        //         } else {
        //             switch (error.response ? error.response.status : "") {

        //                 case 401:
        //                     this.props.history.push(`/login/static.message.sessionExpired`)
        //                     break;
        //                 case 403:
        //                     this.props.history.push(`/accessDenied`)
        //                     break;
        //                 case 500:
        //                 case 404:
        //                 case 406:
        //                     this.setState({
        //                         message: error.response.data.messageCode,
        //                         loading: false
        //                     });
        //                     break;
        //                 case 412:
        //                     this.setState({
        //                         message: error.response.data.messageCode,
        //                         loading: false
        //                     });
        //                     break;
        //                 default:
        //                     this.setState({
        //                         message: 'static.unkownError',
        //                         loading: false
        //                     });
        //                     break;
        //             }
        //         }
        //     }
        // );



        //check
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
            var productCategoryOs = productCategoryTransaction.objectStore('productCategory');
            var productCategoryRequest = productCategoryOs.getAll();
            var planningList = []
            productCategoryRequest.onerror = function (event) {
                // Handle errors!
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            };
            productCategoryRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = productCategoryRequest.result;

                console.log("myResult----------->123", myResult);

                myResult = myResult.filter(c => c.payload.active == true || c.payload.realm.id == 0);

                var productCategoryListNew = [];

                // var listArray = myResult;
                // listArray.sort((a, b) => {
                //     var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                //     var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                //     return itemLabelA > itemLabelB ? 1 : -1;
                // });

                console.log("productCategory response----->", myResult);
                for (var k = 0; k < (myResult).length; k++) {
                    var spaceCount = myResult[k].sortOrder.split(".").length;
                    console.log("spaceCOunt--->", spaceCount);
                    var indendent = "";
                    for (var p = 1; p <= spaceCount - 1; p++) {
                        if (p == 1) {
                            indendent = indendent.concat("|_");
                        } else {
                            indendent = indendent.concat("_");
                        }
                    }
                    console.log("ind", indendent);
                    console.log("indendent.concat(response.data[k].payload.label.label_en)-->", indendent.concat(myResult[k].payload.label.label_en));

                    var productCategoryJson = {};
                    if (myResult[k].payload.productCategoryId == 0) {
                        productCategoryJson = {
                            name: (myResult[k].payload.label.label_en),
                            id: -1
                        }
                    } else {
                        productCategoryJson = {
                            name: (myResult[k].payload.label.label_en),
                            id: myResult[k].payload.productCategoryId
                        }
                    }

                    productCategoryListNew.push(productCategoryJson);

                }
                console.log("constant product category list====>0", productCategoryListNew);

                const ids = productCategoryListNew.map(o => o.id)
                let filteredEQUnit = productCategoryListNew.filter(({ id }, index) => !ids.includes(id, index + 1))

                console.log("constant product category list====>1", filteredEQUnit);


                filteredEQUnit.sort((a, b) => {
                    var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                this.setState({
                    productCategoryList: myResult,
                    productCategoryListNew: filteredEQUnit
                }, () => {
                    // this.filterData();
                    this.setProgramId();
                });



            }.bind(this);
        }.bind(this)
    }

    filterData() {

        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        var forecastProgramId = this.state.forecastProgramId;
        console.log("forecastProgramId--------->", forecastProgramId);

        if (forecastProgramId > 0) {

            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == this.state.forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];
            console.log("selectedForecastProgram---------->", selectedForecastProgram);
            let planningUnitList = selectedForecastProgram.planningUnitList;
            planningUnitList.sort((a, b) => {
                var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState(
                {
                    selsource: planningUnitList,
                    loading: true,
                    selectedForecastProgram: selectedForecastProgram,
                }, () => {
                    // this.buildJExcel();
                    // let planningUnitIds = this.state.selsource.map(ele => ele.planningUnit.id);
                    // let planningUnitIds = this.state.allPlanningUnitList.map(ele => ele.id);
                    // console.log("selectedForecastProgram---------->11", planningUnitIds);
                    // this.getProcurementAgentPlanningUnitByPlanningUnitIds(planningUnitIds);
                    this.buildJExcel();

                })
        } else {
            this.setState(
                {
                    allowAdd: false,
                    loading: false
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
        console.log("outPutList---->", outPutList);
        console.log("RESP----->2ProductCategoryServcie", outPutList);
        let outPutListArray = [];
        let count = 0;
        let indexVar = 1;

        for (var j = 0; j < outPutList.length; j++) {
            data = [];

            data[0] = outPutList[j].planningUnit.forecastingUnit.productCategory.id
            data[1] = outPutList[j].planningUnit.id
            data[2] = outPutList[j].consuptionForecast
            data[3] = outPutList[j].treeForecast;
            data[4] = outPutList[j].stock;
            data[5] = outPutList[j].existingShipments;
            data[6] = outPutList[j].monthsOfStock;
            data[7] = (outPutList[j].procurementAgent == null || outPutList[j].procurementAgent == undefined ? -1 : outPutList[j].procurementAgent.id);
            data[8] = outPutList[j].price;
            data[9] = outPutList[j].programPlanningUnitId;
            data[10] = 0;
            data[11] = 0;
            data[12] = outPutList[j].selectedForecastMap;
            data[13] = indexVar;
            data[14] = outPutList[j].treeForecast;
            data[15] = outPutList[j].consumptionNotes;
            data[16] = outPutList[j].active;
            data[17] = outPutList[j].active;


            outPutListArray[count] = data;
            count++;
            indexVar = indexVar + 1;
        }
        if (outPutList.length == 0) {
            data = [];
            data[0] = -1;
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
            data[11] = 1;
            data[12] = {};
            data[13] = 0;
            data[14] = true;
            data[15] = "";
            data[16] = true;
            data[17] = true;
            outPutListArray[0] = data;
        }
        // console.log("outPutListArray---->", outPutListArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = outPutListArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 150, 60, 60, 60, 60, 60, 100, 60, 60, 60, 60, 60, 60, 60, 100, 60, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                // {
                //     title: i18n.t('static.tracercategory.tracercategory'),
                //     type: 'autocomplete',
                //     source: this.state.allTracerCategoryList,
                //     filter: this.filterTracerCategoryByHealthArea
                //     // readOnly: true// 0A
                // },
                {
                    title: i18n.t('static.productCategory.productCategory'),
                    type: 'autocomplete',
                    source: this.state.productCategoryListNew,
                    // readOnly: true// 0A
                },
                {
                    title: i18n.t('static.dashboard.planningunitheader'),
                    type: 'autocomplete',
                    source: this.state.allPlanningUnitList,
                    // filter: this.filterPlanningUnitListByTracerCategoryId,
                    filter: this.filterPlanningUnitListByProductCategoryId,
                    width: '170',
                    // readOnly: true //1B
                },
                {
                    title: i18n.t('static.commitTree.consumptionForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                    // readOnly: true //2C
                },
                {
                    title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                    // readOnly: true //3D
                },
                {
                    title: i18n.t('static.planningUnitSetting.stockEndOf') + this.state.beforeEndDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true
                    // readOnly: true //4E
                },
                {
                    title: i18n.t('static.planningUnitSetting.existingShipments') + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true
                    // readOnly: true //5F
                },
                {
                    title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock') + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##',
                    disabledMaskOnEdition: true,
                    width: '150'
                    // readOnly: true //6G
                },
                {
                    title: i18n.t('static.forecastReport.priceType'),
                    type: 'autocomplete',
                    source: this.state.allProcurementAgentList,
                    width: '180'
                    // filter: this.filterProcurementAgentByPlanningUnit
                    // readOnly: true //7H
                },
                {
                    title: i18n.t('static.forecastReport.unitPrice'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    width: '120',
                    disabledMaskOnEdition: true
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
                {
                    title: 'isNewRowAdded',
                    type: 'hidden',
                    // readOnly: true //11L
                },
                {
                    title: 'selected forecast map',
                    type: 'hidden',
                    // readOnly: true //12M
                },
                {
                    title: 'indexVar',
                    type: 'hidden',
                    // readOnly: true //13N
                },
                {
                    title: 'treeForecast',
                    type: 'hidden',
                    // readOnly: true //14O
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    // width: 400 //15P
                },
                {
                    title: 'Active',
                    type: 'checkbox',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                    // readOnly: true //16Q
                },
                {
                    title: 'active',
                    type: 'hidden',
                    // readOnly: true //17R
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                // var elInstance = el.jexcel;

                // //left align
                // elInstance.setStyle(`A${parseInt(y) + 1}`, 'text-align', 'left');
                // elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

                // var rowData = elInstance.getRowData(y);
                // var programPlanningUnitId = rowData[11];
                // if (programPlanningUnitId == 1) {
                //     var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                //     var cellA = elInstance.getCell(`A${parseInt(y) + 1}`)
                //     cell.classList.remove('readonly');
                //     cellA.classList.remove('readonly');
                // } else {
                //     var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                //     var cellA = elInstance.getCell(`A${parseInt(y) + 1}`)
                //     cell.classList.add('readonly');
                //     cellA.classList.add('readonly');
                // }

                // var procurementAgentId = rowData[7];
                // if (procurementAgentId == -1) {
                //     var cell = elInstance.getCell(`I${parseInt(y) + 1}`)
                //     cell.classList.remove('readonly');
                // } else {
                //     var cell = elInstance.getCell(`I${parseInt(y) + 1}`)
                //     cell.classList.add('readonly');
                // }

            },
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            // selectionCopy: false,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            allowDeleteRow: true,
            // onselection: this.selected,
            onchange: this.changed,
            onpaste: this.onPaste,
            onchangepage: this.onchangepage,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {
                    // alert("Hi");
                } else {

                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.addRow'),
                            onclick: function () {
                                this.addRow();
                            }.bind(this)
                        });
                    }
                    // alert("Hi1");
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // alert("Hi2");
                        // region id
                        if (obj.getRowData(y)[11] == 1) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                            // Line
                            // items.push({ type: 'line' });
                        }
                    }
                }

                return items;
            }.bind(this),
            oneditionend: this.oneditionend,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            editable: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? true : false),
            // contextMenu: function (obj, x, y, e) {
            //     return [];
            // }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false, allowAdd: true
        })
    }

    // filterProcurementAgentByPlanningUnit = function (instance, cell, c, r, source) {

    //     var mylist = [];
    //     let procurementAgentPlanningUnitList = this.state.responsePa;
    //     var planningUnitId = (instance.jexcel.getJson(null, false)[r])[1];
    //     console.log("ID------->", planningUnitId);

    //     if (planningUnitId !== '') {

    //         let tempPaList = procurementAgentPlanningUnitList[planningUnitId];
    //         let paList = tempPaList.map(template => {
    //             return {
    //                 name: template.procurementAgent.code,
    //                 id: template.procurementAgent.id,
    //                 price: template.catalogPrice
    //             };
    //         });

    //         paList.unshift({
    //             id: -1,
    //             name: 'CUSTOM',
    //             price: 0
    //         })

    //         // console.log("planningUnitId------->33", paList);

    //         return paList;
    //     } else {
    //         return [];
    //     }
    // }.bind(this)


    filterPlanningUnitListByTracerCategoryId = function (instance, cell, c, r, source) {
        var mylist = [];
        var tracerCategoryId = (instance.jexcel.getJson(null, false)[r])[0];
        // let planningUnitId = this.getPlanningUnitByTracerCategoryId(tracerCategoryId);
        // let allPlanningUnitList = this.state.allPlanningUnitList;

        // for (var i = 0; i < planningUnitId.length; i++) {
        //     let list = allPlanningUnitList.filter(c => c.id == planningUnitId[i].id)[0];
        //     mylist.push(list);
        // }
        if (tracerCategoryId == -1) {
            mylist = this.state.allPlanningUnitList
        } else {
            mylist = this.state.allPlanningUnitList.filter(c => c.forecastingUnit.tracerCategory.id == tracerCategoryId);
        }

        console.log("mylist--------->32", mylist);

        // var tableJson = this.el.getJson(null, false);
        // let tempList = [];
        // for (var i = 0; i < tableJson.length; i++) {
        //     var map1 = new Map(Object.entries(tableJson[i]));
        //     tempList.push(parseInt(map1.get("1")));
        // }

        // for (var i = 0; i < tempList.length; i++) {
        //     mylist = mylist.filter(c => c.id != tempList[i]);
        // }

        return mylist;

    }.bind(this)

    filterPlanningUnitListByProductCategoryId = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[0];
        console.log("mylist--------->3.2", value);

        // if (productCategoryId == -1) {
        //     mylist = this.state.allPlanningUnitList
        // } else {
        //     mylist = this.state.allPlanningUnitList.filter(c => c.forecastingUnit.tracerCategory.id == productCategoryId);
        // }
        // console.log("mylist--------->32", mylist);
        // return mylist;

        var puList = [];
        console.log("in if=====>0", this.state.productCategoryList);
        if (value != -1) {
            console.log("in if=====>1");
            var pc = this.state.productCategoryList.filter(c => c.payload.productCategoryId == value)[0]
            var pcList = this.state.productCategoryList.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            console.log("in if=====>1.1", pcIdArray);
            console.log("in if=====>1.2", this.state.planningUnitList);
            console.log("in if=====>1.3", this.state.planningUnitList.filter(c => c.productCategory.id == 21));
            puList = (this.state.planningUnitList).filter(c => pcIdArray.includes(c.productCategory.id));
            console.log("in if=====>1.4", puList);
        } else {
            console.log("in else=====>2");
            puList = this.state.planningUnitList;
        }

        console.log("in else=====>3", puList);

        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en + ' | ' + puList[k].id,
                id: puList[k].id
            }
            mylist.push(planningUnitJson);
        }
        console.log("in else=====>4");
        return mylist;

    }.bind(this)

    filterTracerCategoryByHealthArea = function (instance, cell, c, r, source) {
        var mylist = [];
        let selectedForecastProgramHealthAreaList = this.state.selectedForecastProgram.healthAreaList;
        for (var i = 0; i < selectedForecastProgramHealthAreaList.length; i++) {
            // let list = this.state.allTracerCategoryList.filter(c => c.healthArea.id == selectedForecastProgramHealthAreaList[i].id);
            let list = [];
            if (i == 0) {
                list = this.state.allTracerCategoryList.filter(c => (c.id == -1 ? c : c.healthArea.id == selectedForecastProgramHealthAreaList[i].id));
            } else {
                list = this.state.allTracerCategoryList.filter(c => c.id != -1 && c.healthArea.id == selectedForecastProgramHealthAreaList[i].id);
            }

            // mylist.push(list);
            if (list.length != 0) {
                mylist = mylist.concat(list);
            }

        }
        console.log("mylist--------->31", mylist);
        if (mylist.length > 0) {
            sortArrayByName(mylist);
            let mylistObj = mylist.filter(c => c.id == -1)[0];
            mylist = mylist.filter(c => c.id != -1);
            mylist.unshift(mylistObj);
        }

        console.log("mylist--------->35", mylist);
        return mylist;

    }.bind(this)

    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el.jexcel;
        var json = elInstance.getJson(null, false);

        var colArr = ['A', 'B'];

        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;

        for (var j = start; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            var programPlanningUnitId = rowData[11];

            //left align
            elInstance.setStyle(`A${parseInt(j) + 1}`, 'text-align', 'left');
            elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');

            if (programPlanningUnitId == 1) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }
        }

    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[8].classList.add('InfoTrAsteriskTheadtrTd');
        tr.children[9].classList.add('AsteriskTheadtrTd');

        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');


        tr.children[5].title = i18n.t('static.tooltip.Stock');
        tr.children[6].title = i18n.t('static.tooltip.ExistingShipments');
        tr.children[7].title = i18n.t('static.tooltip.DesiredMonthsofStock');
        tr.children[8].title = i18n.t('static.tooltip.PriceType');


        var elInstance = instance.jexcel;
        var json = elInstance.getJson();
        var colArr = ['A', 'B'];

        var jsonLength;

        if ((document.getElementsByClassName("jexcel_pagination_dropdown")[0] != undefined)) {
            jsonLength = 1 * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        }

        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }

        for (var j = 0; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            var programPlanningUnitId = rowData[11];

            //left align
            elInstance.setStyle(`A${parseInt(j) + 1}`, 'text-align', 'left');
            elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');

            if (programPlanningUnitId == 1) {
                // for (var i = 0; i < colArr.length; i++) {
                //     var cell = elInstance.getCell((colArr[i]).concat(parseInt(y) + 1))
                //     cell.classList.remove('readonly');
                // }
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }


        }
    }

    formSubmit = function () {
        var validation = this.checkValidation();
        console.log("validation------------>", validation);
        if (validation == true) {
            this.setState({
                loading: true
            })
            var tableJson = this.el.getJson(null, false);
            var programs = [];
            var count = 0;
            var planningUnitList = [];
            let indexVar = 0;

            console.log("Final-------------->00", this.state.datasetList);
            console.log("Final-------------->01", this.state.forecastProgramId);
            console.log("Final-------------->02", this.state.forecastProgramVersionId);

            var program = (this.state.datasetList1.filter(x => x.programId == this.state.forecastProgramId && x.version == this.state.forecastProgramVersionId)[0]);
            var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            console.log("Final-------------->2", programData.planningUnitList);

            let originalPlanningUnitList = programData.planningUnitList;

            let listOfDisablePuNode = [];
            let listOfDisablePuNodeActiveInactive = [];


            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));

                // let planningUnitObj = this.state.allPlanningUnitList.filter(c => c.id == parseInt(map1.get("1")))[0];
                let planningUnitObj = this.state.originalPlanningUnitList.filter(c => c.id == parseInt(map1.get("1")))[0];
                let procurementAgentObj = "";
                if (parseInt(map1.get("7")) === -1) {
                    procurementAgentObj = null
                } else {
                    procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("7")))[0];
                }

                if (parseInt(map1.get("11")) == 1) {//new row added
                    let tempJson = {
                        "programPlanningUnitId": parseInt(map1.get("9")),
                        "planningUnit": {
                            "id": parseInt(map1.get("1")),
                            "label": planningUnitObj.label,
                            "unit": planningUnitObj.unit,
                            "multiplier": planningUnitObj.multiplier,
                            "forecastingUnit": {
                                "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                "label": planningUnitObj.forecastingUnit.label,
                                "unit": planningUnitObj.forecastingUnit.unit,
                                "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                            },
                            "idString": "" + parseInt(map1.get("1"))
                        },
                        "consuptionForecast": map1.get("2"),
                        "treeForecast": map1.get("3"),
                        // "stock": (map1.get("4")).replaceAll(",", "").replace(/[^\d]/g, ''),
                        // "stock": parseInt((map1.get("4")).toString().replaceAll(",", "")),
                        "stock": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        // "existingShipments": (map1.get("5")).replaceAll(",", "").replace(/[^\d]/g, ''),
                        // "monthsOfStock": (map1.get("6")).replaceAll(",", "").replace(/[^\d]/g, ''),
                        // "existingShipments": parseInt((map1.get("5")).toString().replaceAll(",", "")),
                        "existingShipments": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        // "monthsOfStock": parseInt((map1.get("6")).toString().replaceAll(",", "")),
                        "monthsOfStock": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        "procurementAgent": (procurementAgentObj == null ? null : {
                            "id": parseInt(map1.get("7")),
                            "label": procurementAgentObj.label,
                            "code": procurementAgentObj.code,
                            "idString": "" + parseInt(map1.get("7"))
                        }),
                        "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        "higherThenConsumptionThreshold": null,
                        "lowerThenConsumptionThreshold": null,
                        "consumptionNotes": map1.get("15"),
                        "consumptionDataType": 2,
                        "otherUnit": null,
                        "selectedForecastMap": map1.get("12"),
                        "createdBy": null,
                        "createdDate": null,
                        "active": map1.get("16"),
                    }
                    planningUnitList.push(tempJson);
                } else {

                    let planningUnitobj1 = originalPlanningUnitList[indexVar];
                    let tempJson = {
                        "programPlanningUnitId": parseInt(map1.get("9")),
                        "planningUnit": {
                            "id": parseInt(map1.get("1")),
                            "label": planningUnitObj.label,
                            "unit": planningUnitObj.unit,
                            "multiplier": planningUnitObj.multiplier,
                            "forecastingUnit": {
                                "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                "label": planningUnitObj.forecastingUnit.label,
                                "unit": planningUnitObj.forecastingUnit.unit,
                                "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                            },
                            "idString": "" + parseInt(map1.get("1"))
                        },
                        "consuptionForecast": map1.get("2"),
                        "treeForecast": map1.get("3"),
                        // "stock": (map1.get("4")).replaceAll(",", "").replace(/[^\d]/g, ''),
                        // "existingShipments": (map1.get("5")).replaceAll(",", "").replace(/[^\d]/g, ''),
                        // "monthsOfStock": (map1.get("6")).replaceAll(",", "").replace(/[^\d]/g, ''),
                        // "stock": parseInt((map1.get("4")).toString().replaceAll(",", "")),
                        "stock": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        // "existingShipments": parseInt((map1.get("5")).toString().replaceAll(",", "")),
                        // "monthsOfStock": parseInt((map1.get("6")).toString().replaceAll(",", "")),
                        "existingShipments": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        "monthsOfStock": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        "procurementAgent": (procurementAgentObj == null ? null : {
                            "id": parseInt(map1.get("7")),
                            "label": procurementAgentObj.label,
                            "code": procurementAgentObj.code,
                            "idString": "" + parseInt(map1.get("7"))
                        }),
                        "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        "higherThenConsumptionThreshold": planningUnitobj1.higherThenConsumptionThreshold,
                        "lowerThenConsumptionThreshold": planningUnitobj1.lowerThenConsumptionThreshold,
                        // "consumptionNotes": planningUnitobj1.consumptionNotes,
                        "consumptionNotes": map1.get("15"),
                        "consumptionDataType": planningUnitobj1.consumptionDataType,
                        "otherUnit": planningUnitobj1.otherUnit,
                        "selectedForecastMap": map1.get("12"),
                        "createdBy": planningUnitobj1.createdBy,
                        "createdDate": planningUnitobj1.createdDate,
                        "active": map1.get("16"),
                    }
                    planningUnitList.push(tempJson);


                    indexVar = indexVar + 1;
                }


                // let tempJson = {
                //     "programPlanningUnitId": parseInt(map1.get("9")),
                //     "planningUnit": {
                //         "id": parseInt(map1.get("1")),
                //         "label": planningUnitObj.label,
                //         "forecastingUnit": {
                //             "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                //             "label": planningUnitObj.forecastingUnit.label,
                //             "tracerCategory": {
                //                 "id": planningUnitObj.forecastingUnit.tracerCategory.id,
                //                 "label": planningUnitObj.forecastingUnit.tracerCategory.label,
                //                 "idString": planningUnitObj.forecastingUnit.tracerCategory.idString
                //             },
                //             "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                //         },
                //         "idString": "" + parseInt(map1.get("1"))
                //     },
                //     "consuptionForecast": map1.get("2"),
                //     "treeForecast": map1.get("3"),
                //     "stock": map1.get("4"),
                //     "existingShipments": map1.get("5"),
                //     "monthsOfStock": map1.get("6"),
                //     "procurementAgent": (procurementAgentObj == null ? null : {
                //         "id": parseInt(map1.get("7")),
                //         "label": procurementAgentObj.label,
                //         "code": procurementAgentObj.code,
                //         "idString": "" + parseInt(map1.get("7"))
                //     }),
                //     "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                //     "selectedForecastMap":map1.get("12")
                // }

                //logic for null PU Node
                if (map1.get("3") == false && map1.get("14") == true) {
                    listOfDisablePuNode.push(parseInt(map1.get("1")));
                }

                if (map1.get("16") == false && map1.get("17") == true) {
                    listOfDisablePuNode.push(parseInt(map1.get("1")));
                }



            }

            console.log("Final-------------->1", planningUnitList);

            programData.planningUnitList = planningUnitList;


            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            program.programData = programData;

            programs.push(program);

            console.log("programs to update---1", programs);

            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                programs.forEach(program => {
                    var programRequest = programTransaction.put(program);
                    console.log("---hurrey---");
                })
                transaction.oncomplete = function (event) {
                    // this.props.updateStepOneData("message", i18n.t('static.mt.dataUpdateSuccess'));
                    // this.props.updateStepOneData("color", "green");
                    // this.setState({
                    //     message: i18n.t('static.mt.dataUpdateSuccess'),
                    //     color: "green",
                    // }, () => {
                    //     this.props.hideSecondComponent();
                    //     this.props.finishedStepThree();
                    //     // this.buildJExcel();
                    // });

                    this.setState({
                        // loading: false,
                        message: i18n.t('static.mt.dataUpdateSuccess'),
                        color: "green",
                        isChanged1: false,
                        // allowAdd: false
                    }, () => {
                        listOfDisablePuNode = [...new Set(listOfDisablePuNode)];
                        if (listOfDisablePuNode.length > 0) {
                            this.disablePUNode(listOfDisablePuNode);
                            this.disablePUConsumptionData(listOfDisablePuNode);
                        }


                        this.hideSecondComponent();
                        // this.filterData();
                        // this.setProgramId();
                        this.getDatasetList();
                    });
                    console.log("Data update success1");
                    // alert("success");


                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        // message: 'Error occured.',
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                    console.log("Data update errr");
                }.bind(this);
            }.bind(this);



        }
    }

    disablePUConsumptionData(listOfDisablePuNode) {
        console.log("Test---------------->12", listOfDisablePuNode);

        // var program = (this.state.datasetList1.filter(x => x.programId == this.state.forecastProgramId && x.version == this.state.forecastProgramVersionId)[0]);
        let datasetList1 = this.state.datasetList1;
        for (var i = 0; i < datasetList1.length; i++) {
            var programs = [];
            var program = datasetList1[i];

            var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));

            let actualConsumptionList = programData.actualConsumptionList;

            for (var j = 0; j < listOfDisablePuNode.length; j++) {
                for (var k = 0; k < actualConsumptionList.length; k++) {
                    if (parseInt(listOfDisablePuNode[j]) == actualConsumptionList[k].planningUnit.id) {
                        actualConsumptionList[k].amount = 0;
                    }
                }
            }
            console.log("Test---------------->7", actualConsumptionList);

            programData.actualConsumptionList = actualConsumptionList;

            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            program.programData = programData;

            programs.push(program);

            console.log("programs to update---", programs);

            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                programs.forEach(program => {
                    var programRequest = programTransaction.put(program);
                    console.log("---hurrey---");
                })
                transaction.oncomplete = function (event) {
                    console.log("Data update success");
                    // alert("success");
                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        // message: 'Error occured.',
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                    console.log("Data update errr");
                }.bind(this);
            }.bind(this);
        }
    }

    disablePUNode(listOfDisablePuNode) {
        console.log("Test---------------->1", listOfDisablePuNode);
        // var program = (this.state.datasetList1.filter(x => x.programId == this.state.forecastProgramId && x.version == this.state.forecastProgramVersionId)[0]);
        let datasetList1 = this.state.datasetList1;
        for (var i = 0; i < datasetList1.length; i++) {
            var programs = [];
            var program = datasetList1[i];

            var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));

            let treeListForSelectedProgram = programData.treeList;

            console.log("Test---------------->1.1", treeListForSelectedProgram);

            for (var j = 0; j < listOfDisablePuNode.length; j++) {
                for (var k = 0; k < treeListForSelectedProgram.length; k++) {
                    let flatlist = treeListForSelectedProgram[k].tree.flatList;
                    let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                    console.log("Test---------------->2", listContainNodeType5);
                    for (var l = 0; l < listContainNodeType5.length; l++) {
                        let nodeDataMap = listContainNodeType5[l].payload.nodeDataMap;
                        let nodeDataMapKeys = Object.keys(listContainNodeType5[l].payload.nodeDataMap);
                        console.log("Test---------------->3", listContainNodeType5[l].id + '-------' + nodeDataMap + ' ----- ' + nodeDataMapKeys);
                        for (var m = 0; m < nodeDataMapKeys.length; m++) {
                            let insideArrayOfNodeDataMap = nodeDataMap[nodeDataMapKeys[m]];
                            console.log("Test---------------->4", insideArrayOfNodeDataMap);
                            for (var n = 0; n < insideArrayOfNodeDataMap.length; n++) {
                                if (insideArrayOfNodeDataMap[n].puNode != null) {
                                    if (insideArrayOfNodeDataMap[n].puNode.planningUnit.id == parseInt(listOfDisablePuNode[j])) {
                                        console.log("Test---------------->5", insideArrayOfNodeDataMap[n]);
                                        console.log("Test---------------->6", insideArrayOfNodeDataMap[n].puNode.planningUnit.id);
                                        insideArrayOfNodeDataMap[n].puNode.planningUnit.id = null;
                                    }
                                }

                            }
                        }
                    }
                }
            }
            console.log("Test---------------->7", treeListForSelectedProgram);

            programData.treeList = treeListForSelectedProgram;

            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            program.programData = programData;

            programs.push(program);

            console.log("programs to update---", programs);

            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                programs.forEach(program => {
                    var programRequest = programTransaction.put(program);
                    console.log("---hurrey---");
                })
                transaction.oncomplete = function (event) {
                    // this.props.updateStepOneData("message", i18n.t('static.mt.dataUpdateSuccess'));
                    // this.props.updateStepOneData("color", "green");
                    // this.setState({
                    //     message: i18n.t('static.mt.dataUpdateSuccess'),
                    //     color: "green",
                    // }, () => {
                    //     this.props.hideSecondComponent();
                    //     this.props.finishedStepThree();
                    //     // this.buildJExcel();
                    // });

                    this.setState({
                        // loading: false,
                        // message: i18n.t('static.mt.dataUpdateSuccess'),
                        // color: "green",
                        // allowAdd: false
                    }, () => {
                        // this.hideSecondComponent();
                        // this.filterData();
                        // this.setProgramId();
                        // this.getDatasetList();
                    });
                    console.log("Data update success");
                    // alert("success");


                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        // message: 'Error occured.',
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                    console.log("Data update errr");
                }.bind(this);
            }.bind(this);
        }

    }

    addRow = function () {

        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = -1;
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
        data[11] = 1;
        data[12] = {};
        data[13] = 0;
        data[14] = true;
        data[15] = "";
        data[16] = true;
        data[17] = true;

        this.el.insertRow(
            data
        );
    };

    toggleProgramSetting() {
        this.setState({
            popoverOpenProgramSetting: !this.state.popoverOpenProgramSetting,
        });
    }



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
                    <option key={i} value={item.id}>
                        {item.programCode + '~v' + item.versionId}
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
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h5 className="red">{i18n.t(this.state.message)}</h5> */}
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/dataset/versionSettings" className="supplyplanformulas">{i18n.t('static.UpdateversionSettings.UpdateversionSettings')}</a></span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/dataSet/buildTree/tree/0/" + this.state.datasetId : "/#/dataSet/buildTree"} className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> {i18n.t('static.tree.or')} <a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" className='supplyplanformulas'>{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a></span>
                        </div>
                    </div>

                    <CardBody className="pb-lg-3 pt-lg-0">
                        <div className="" >
                            <div ref={ref}>

                                <Col md="12 pl-0">
                                    <div className="row">
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenProgramSetting} target="Popover2" trigger="hover" toggle={this.toggleProgramSetting}>
                                                {/* <PopoverBody>{i18n.t('static.tooltip.planningProgramSetting')} </PopoverBody> */}
                                                <PopoverBody>If you dont see the desired program(s), please load them first.</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleProgramSetting} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="forecastProgramId"
                                                        id="forecastProgramId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setProgramId(e); }}
                                                        value={this.state.datasetId}
                                                        disabled={this.state.loading}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {datasets}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="forecastPeriod"
                                                        id="forecastPeriod"
                                                        bsSize="sm"
                                                        disabled={true}
                                                        value={this.state.startDateDisplay + ' ~ ' + this.state.endDateDisplay}
                                                    >
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" style={{ display: 'none' }}>
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
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
                                                    {/* <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} /> */}
                                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>

                                        </FormGroup>


                                    </div>
                                </Col>


                            </div>
                        </div>

                        <div className="UpdatePlanningSettingTable consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS') &&
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.isChanged1 &&
                                        <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    }
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                    &nbsp;
                                </FormGroup>
                            }
                        </CardFooter>
                    }

                </Card>
            </div>
        );
    }
}