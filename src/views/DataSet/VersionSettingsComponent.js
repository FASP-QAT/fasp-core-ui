import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from "react";
import Picker from 'react-month-picker';
import { MultiSelect } from 'react-multi-select-component';
import { Prompt } from 'react-router';
import { Button, Card, CardBody, CardFooter, Col, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import showguidanceEn from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsEn.html';
import showguidanceFr from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsFr.html';
import showguidancePr from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsPr.html';
import showguidanceSp from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsSp.html';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT_SM, JEXCEL_DECIMAL_NO_REGEX, JEXCEL_INTEGER_REGEX, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_DATASET, SECRET_KEY } from "../../Constants";
import DatasetService from '../../api/DatasetService';
import DropdownService from '../../api/DropdownService';
import ProgramService from '../../api/ProgramService';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { consumptionExtrapolationNotesClicked, exportPDF, missingMonthsClicked, nodeWithPercentageChildrenClicked } from '../DataSet/DataCheckComponent.js';
import { buildJxl, buildJxl1, dataCheck } from "./DataCheckComponent";
import { filterOptions, hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
// Localized entity name
const entityname = i18n.t('static.versionSettings.versionSettings');
/**
 * Component for version setting details.
 */
class VersionSettingsComponent extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            noOfDays: [{ id: "0", name: i18n.t('static.versionSettings.calendardays') }, { id: 15, name: '15' },
            { id: 16, name: '16' },
            { id: 17, name: '17' },
            { id: 18, name: '18' },
            { id: 19, name: '19' },
            { id: 20, name: '20' },
            { id: 21, name: '21' },
            { id: 22, name: '22' },
            { id: 23, name: '23' },
            { id: 24, name: '24' },
            { id: 25, name: '25' },
            { id: 26, name: '26' },
            { id: 27, name: '27' },
            { id: 28, name: '28' },
            { id: 29, name: '29' },
            { id: 30, name: '30' },
            { id: 31, name: '31' }
            ],
            isChanged: false,
            uniquePrograms: [],
            programValues: [],
            programLabels: [],
            datasetList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true,
            versionTypeList: [],
            versionSettingsList: [],
            versionSettingsListForOther: [],
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            showValidation: false,
            treeScenarioList: [],
            childrenWithoutHundred: [],
            nodeWithPercentageChildren: [],
            consumptionListlessTwelve: [],
            missingMonthList: [],
            treeNodeList: [],
            treeScenarioNotes: [],
            missingBranchesList: [],
            noForecastSelectedList: [],
            datasetPlanningUnit: [],
            notSelectedPlanningUnitList: [],
            treeScenarioListNotHaving100PerChild: [],
            isChanged1: false,
            includeOnlySelectedForecasts: true,
            datasetPlanningUnitNotes: [],
            dataList: [],
            consumptionExtrapolationList: [],
            consumptionExtrapolationNotes: ''
        }
        this.getOnLineDatasetsVersion = this.getOnLineDatasetsVersion.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getVersionTypeList = this.getVersionTypeList.bind(this);
        this.getDatasetById = this.getDatasetById.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.updateState = this.updateState.bind(this);
        this.onchangepage = this.onchangepage.bind(this)
    }
    /**
     * Updates the state with the provided parameter name and value, then invokes the buildActualJxl method.
     * @param {String} parameterName The name of the parameter to update in the state.
     * @param {any} value The new value to set for the parameter.
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        }, () => {
            if (parameterName == "treeScenarioList") {
                buildJxl1(this)
            }
            if (parameterName == "treeScenarioListNotHaving100PerChild") {
                buildJxl(this)
            }
        })
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.getOnLineDatasetsVersion()
        })
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    /**
     * Redirects to application dashboard on cancel button clicked
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(12, y);
            if (parseInt(value) == 1) {
                var col = ("H").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(7, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var startDate = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var stopDate = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var col = ("J").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(9, y);
                var diff = moment(stopDate).diff(moment(startDate), 'months');
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                }
                else if (diff <= 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, 'Please enter valid date');
                    valid = false;
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("N").concat(parseInt(y) + 1);
                var reg = JEXCEL_INTEGER_REGEX;
                var value = this.el.getValueFromCoords(13, y);
                if (value === "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("I").concat(parseInt(y) + 1);
                var reg = /^[0-9]*[1-9][0-9]*$/;
                var value = this.el.getValueFromCoords(8, y);
                if (value === "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.onlyPositiveIntegerGreaterThan0AreAllowed'));
                    valid = false;
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("O").concat(parseInt(y) + 1);
                var value = this.el.getValue(`O${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                var col = ("P").concat(parseInt(y) + 1);
                var value = this.el.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                var col = ("Q").concat(parseInt(y) + 1);
                var value = this.el.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                var col = ("E").concat(parseInt(y) + 1);
                value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var regex = /^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/;
                if (value != "") {
                    if (value.length > 1000) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidStringLength'));
                        valid = false;
                    } else if (!regex.test(value)) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.validData'));
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
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            var reg = /^[0-9]*[1-9][0-9]*$/;
            var value = this.el.getValueFromCoords(8, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else if (!(reg.test(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.common.onlyPositiveIntegerGreaterThan0AreAllowed'));
            }
            else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        var startDate = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        var stopDate = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        if (x == 9) {
            var col = ("J").concat(parseInt(y) + 1);
            var diff = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else if (diff <= 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, 'Please enter valid date');
            }
            else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x != 12) {
            this.el.setValueFromCoords(12, y, 1, true);
            this.setState({
                isChanged: true
            })
        }
        if (x == 8 && this.el.getValueFromCoords(17, y) == 0) {
            let startDate = this.el.getValueFromCoords(7, y);
            let month = this.el.getValueFromCoords(8, y);
            if (startDate != null && month != null && month != "" && startDate != "") {
                let newStartDate = new Date(startDate);
                newStartDate.setMonth(newStartDate.getMonth() + (month - 1));
                this.el.setValueFromCoords(17, y, 1, true);
                this.el.setValueFromCoords(9, y, newStartDate.getFullYear() + '-' + (newStartDate.getMonth() + 1) + "-01 00:00:00", true);
            }
            this.el.setValueFromCoords(17, y, 0, true);
        }
        if ((x == 9 || x == 7) && this.el.getValueFromCoords(17, y) == 0) {
            let startDate = this.el.getValueFromCoords(7, y);
            let endDate = this.el.getValueFromCoords(9, y);
            if (startDate != null & endDate != null && startDate != "" && endDate != "" && startDate != "") {
                let d1 = new Date(startDate);
                let d2 = new Date(endDate)
                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months += d2.getMonth() - d1.getMonth();
                months = months + 1;
                this.el.setValueFromCoords(17, y, 1, true);
                this.el.setValueFromCoords(8, y, months, true);
            }
            this.el.setValueFromCoords(17, y, 0, true);
        }
        if (x == 14) {
            var col = ("O").concat(parseInt(y) + 1);
            value = this.el.getValue(`O${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_NO_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 15) {
            var col = ("P").concat(parseInt(y) + 1);
            value = this.el.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_NO_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 16) {
            var col = ("Q").concat(parseInt(y) + 1);
            value = this.el.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_NO_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var regex = /^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/;
            if (value != "") {
                if (value.length > 1000) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidStringLength'));
                } else if (!regex.test(value)) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.validData'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (!this.state.isChanged1) {
            this.setState({
                isChanged1: true,
            });
        }
    }.bind(this);
    /**
     * Handles form submission and save version setting details in indexed db
     */
    formSubmit() {
        var validation = this.checkValidation();
        if (validation == true) {
            var cont = false;
            var cf = window.confirm(i18n.t("static.versionSettings.confirmUpdate"));
            if (cf == true) {
                cont = true;
            } else {
            }
            if (cont) {
                this.setState({
                    loading: true
                })
                var tableJson = this.el.getJson(null, false);
                var programs = [];
                var count = 0;
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    if (parseInt(map1.get("12")) === 1) {
                        var notes = map1.get("4");
                        var startDate = map1.get("7");
                        var stopDate = map1.get("9");
                        var id = map1.get("11");
                        var noOfDaysInMonth = Number(map1.get("13"));
                        var program = (this.state.datasetList.filter(x => x.id == id)[0]);
                        var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        programData.currentVersion.forecastStartDate = moment(startDate).startOf('month').format("YYYY-MM-DD");
                        programData.currentVersion.forecastStopDate = moment(stopDate).startOf('month').format("YYYY-MM-DD");
                        programData.currentVersion.daysInMonth = noOfDaysInMonth;
                        programData.currentVersion.notes = notes;
                        programData.currentVersion.freightPerc = this.el.getValue(`O${parseInt(i) + 1}`, true).toString().replaceAll("%", "");
                        programData.currentVersion.forecastThresholdHighPerc = this.el.getValue(`P${parseInt(i) + 1}`, true).toString().replaceAll("%", "");
                        programData.currentVersion.forecastThresholdLowPerc = this.el.getValue(`Q${parseInt(i) + 1}`, true).toString().replaceAll("%", "");
                        programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                        program.programData = programData;
                        programs.push(program);
                        count++;
                    }
                }
                if (count > 0) {
                    var db1;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                        hideFirstComponent()
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['datasetData'], 'readwrite');
                        var programTransaction = transaction.objectStore('datasetData');
                        programs.forEach(program => {
                            var programRequest = programTransaction.put(program);
                        })
                        transaction.oncomplete = function (event) {
                            db1 = e.target.result;
                            var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                            var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                            programs.forEach(program => {
                                var datasetDetailsRequest = datasetDetailsTransaction.get(program.id);
                                datasetDetailsRequest.onsuccess = function (e) {
                                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                                    datasetDetailsRequestJson.changed = 1;
                                    var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                                    datasetDetailsRequest1.onsuccess = function (event) {
                                    }
                                }
                            })
                            this.setState({
                                loading: false,
                                message: i18n.t('static.mt.dataUpdateSuccess'),
                                color: "green",
                                isChanged: false
                            }, () => {
                                hideSecondComponent();
                            });
                        }.bind(this);
                        transaction.onerror = function (event) {
                            this.setState({
                                loading: false,
                                color: "red",
                            }, () => {
                                hideSecondComponent();
                            });
                        }.bind(this);
                    }.bind(this);
                }
            }
        }
    }
    /**
     * Retrieves dataset information by dataset IDs.
     * Filters the dataset list to include only datasets with matching program IDs.
     * Updates the component state with the filtered dataset list and dataset IDs.
     * Invokes the method to fetch online datasets' versions.
     * @param {array} datasetIds - An array containing the dataset IDs to filter by.
     */
    getDatasetById(datasetIds) {
        var versionSettingsListOffLine = [];
        var versionSettingsList = [];
        this.state.datasetList.map(dataset => {
            if (datasetIds.includes(dataset.programId)) {
                versionSettingsList.push(dataset);
            }
        })
        versionSettingsListOffLine = versionSettingsList.filter(c => c.id)
        this.setState({
            versionSettingsList: versionSettingsListOffLine,
            datasetIds
        }, () => {
            this.getOnLineDatasetsVersion()
        });
    }
    /**
     * Reterives version type list
     */
    getVersionTypeList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['versionType'], 'readwrite');
            var program = transaction.objectStore('versionType');
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                myResult = myResult.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    versionTypeList: myResult
                });
                for (var i = 0; i < myResult.length; i++) {
                }
            }.bind(this);
        }.bind(this);
    }
    /**
     * Reterives forecast program list from indexed db
     */
    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                var proList = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var list = [];
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        proList.push(myResult[i])
                        list.push({ label: myResult[i].programCode, value: myResult[i].programId })
                    }
                }
                var proList = proList.concat(this.state.datasetList);
                proList = proList.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                if (localStorage.getItem("sesForecastProgramIds") != '' && localStorage.getItem("sesForecastProgramIds") != undefined) {
                    this.setState({
                        datasetList: proList,
                        uniquePrograms: proList.filter((v, i, a) => a.findIndex(t => (t.programId === v.programId)) === i),
                        loading: false,
                        programValues: JSON.parse(localStorage.getItem("sesForecastProgramIds")),
                    }, () => {
                        var programIds = this.state.programValues.map(x => x.value).join(", ");
                        programIds = Array.from(new Set(programIds.split(','))).toString();
                        this.getDatasetById(programIds);
                    })
                } else {
                    this.setState({
                        datasetList: proList,
                        uniquePrograms: proList.filter((v, i, a) => a.findIndex(t => (t.programId === v.programId)) === i),
                        loading: false
                    }, () => {
                        this.handleChangeProgram(list);
                    });
                }
            }.bind(this);
        }.bind(this);
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Callback function called when editing of a cell in the jexcel table ends.
     * @param {object} instance - The jexcel instance.
     * @param {object} cell - The cell object.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {any} value - The new value of the cell.
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        elInstance.setValueFromCoords(12, y, 1, true);
    }
    /**
     * Function to filter stop date based on start date
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterStopDate = function (o, cell, x, y, value, config) {
        var previousColumnValue = o.getValueFromCoords(x - 2, y);
        config.options.validRange = [previousColumnValue, null];
        return config;
    }
    /**
     * Reterives online versions
     */
    getOnLineDatasetsVersion() {
        var programIds = this.state.programValues.map(x => x.value).join(",");
        var programIdsarr = Array.from(new Set(programIds.split(',')));
        var versionTypeId = document.getElementById('versionTypeId').value;
        if (versionTypeId == '') {
            versionTypeId = -1
        }
        var rangeValue = this.state.rangeValue;
        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        var dataList1 = [];
        var inputjson = {
            programIds: programIdsarr,
            versionTypeId: versionTypeId,
            startDate: startDate,
            stopDate: stopDate
        }
        this.setState({
            loading: true
        })
        ProgramService.getDatasetVersions(inputjson).then(response => {
            if (response.status == 200) {
                var responseData = response.data;
                for (var i = 0; i < responseData.length; i++) {
                    var data = [];
                    data[0] = responseData[i].program.id
                    data[1] = responseData[i].program.code
                    data[2] = responseData[i].versionId
                    data[3] = getLabelText(responseData[i].versionType.label, this.state.lang);
                    data[4] = responseData[i].notes
                    data[5] = responseData[i].createdDate
                    data[6] = responseData[i].createdBy.username
                    data[7] = responseData[i].forecastStartDate
                    if (responseData[i].forecastStartDate != null && responseData[i].forecastStopDate != null) {
                        let d1 = new Date(responseData[i].forecastStartDate);
                        let d2 = new Date(responseData[i].forecastStopDate)
                        var months;
                        months = (d2.getFullYear() - d1.getFullYear()) * 12;
                        months += d2.getMonth() - d1.getMonth();
                        data[8] = months + 1
                    } else {
                        data[8] = 0
                    }
                    data[9] = responseData[i].forecastStopDate
                    data[10] = 0
                    data[11] = responseData[i].versionId
                    data[12] = 0
                    data[13] = responseData[i].daysInMonth
                    data[14] = responseData[i].freightPerc
                    data[15] = responseData[i].forecastThresholdHighPerc
                    data[16] = responseData[i].forecastThresholdLowPerc
                    data[17] = 0;
                    data[18] = {};
                    dataList1.push(data);
                }
                this.setState({
                    dataList: dataList1,
                    loading: false
                },
                    () => {
                        this.buildJExcel();
                    })
            }
        }).catch(
            error => {
                this.setState({
                    dataList: [],
                    loading: false
                },
                    () => {
                        this.buildJExcel();
                    })
            }
        );
    }
    /**
     * This function is called when page is changed to make some cells readonly based on multiple condition
     * @param {*} el This is the DOM Element where sheet is created
     * @param {*} pageNo This the page number which is clicked
     * @param {*} oldPageNo This is the last page number that user had selected
     */
    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var y = start; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            if (rowData[10] == 1) {
                var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("O").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("P").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("Q").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("O").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("P").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("Q").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJExcel() {
        let versionSettingsListUnSorted = this.state.versionSettingsList;
        let versionSettingsList = versionSettingsListUnSorted.sort(
            function (a, b) {
                if (a.programCode === b.programCode) {
                    return b.version - a.version;
                }
                return a.programCode > b.programCode ? 1 : -1;
            });
        let versionSettingsArray = [];
        let count = 0;
        var versionTypeId = document.getElementById('versionTypeId').value;
        for (var j = 0; j < versionSettingsList.length; j++) {
            if (versionSettingsList[j].programData) {
                var bytes = CryptoJS.AES.decrypt(versionSettingsList[j].programData, SECRET_KEY);
                var pd = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                data = [];
                data[0] = versionSettingsList[j].programId
                data[1] = versionSettingsList[j].programCode
                data[2] = versionSettingsList[j].version + "(Local)"
                data[3] = ''
                data[4] = pd.currentVersion.notes
                data[5] = ''
                data[6] = ''
                if (pd.currentVersion.forecastStartDate != null && pd.currentVersion.forecastStartDate != "") {
                    var parts1 = pd.currentVersion.forecastStartDate.split('-');
                    data[7] = parts1[0] + "-" + parts1[1] + "-01 00:00:00"
                } else {
                    data[7] = pd.currentVersion.forecastStartDate
                }
                if (pd.currentVersion.forecastStartDate != null && pd.currentVersion.forecastStopDate != null) {
                    let d1 = new Date(pd.currentVersion.forecastStartDate);
                    let d2 = new Date(pd.currentVersion.forecastStopDate)
                    var months;
                    months = (d2.getFullYear() - d1.getFullYear()) * 12;
                    months += d2.getMonth() - d1.getMonth();
                    data[8] = months + 1
                } else {
                    data[8] = 0
                }
                if (pd.currentVersion.forecastStopDate != null && pd.currentVersion.forecastStopDate != "") {
                    var parts2 = pd.currentVersion.forecastStopDate.split('-');
                    data[9] = parts2[0] + "-" + parts2[1] + "-01 00:00:00"
                } else {
                    data[9] = pd.currentVersion.forecastStopDate
                }
                data[10] = 1
                data[11] = versionSettingsList[j].id
                data[12] = 0
                data[13] = pd.currentVersion.daysInMonth != null ? pd.currentVersion.daysInMonth : '0'
                data[14] = (pd.currentVersion.freightPerc == null ? '' : pd.currentVersion.freightPerc)
                data[15] = (pd.currentVersion.forecastThresholdHighPerc == null ? '' : pd.currentVersion.forecastThresholdHighPerc)
                data[16] = (pd.currentVersion.forecastThresholdLowPerc == null ? '' : pd.currentVersion.forecastThresholdLowPerc)
                data[17] = 0;
                data[18] = pd;
                if (versionTypeId == "") {
                    versionSettingsArray[count] = data;
                    count++;
                }
            }
        }
        var dataLists = this.state.dataList;
        for (var i = 0; i < this.state.dataList.length; i++) {
            count = (versionSettingsArray.length);
            versionSettingsArray[count] = dataLists[i];
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = versionSettingsArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 120, 60, 80, 100, 100, 110, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'programId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.version'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.versiontype'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.programDiscription'),
                    type: 'text',
                    maxlength: 1000
                },
                {
                    title: i18n.t('static.program.dateCommitted'),
                    readOnly: true,
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT_SM
                    }
                },
                {
                    title: i18n.t('static.program.commitedbyUser'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.forecastStart'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    }
                },
                {
                    title: i18n.t('static.versionSettings.ForecastPeriodInMonth'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.program.forecastEnd'),
                    type: 'calendar',
                    filterOptions: this.filterStopDate,
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    }
                },
                {
                    title: 'isLocal',
                    type: 'hidden',
                },
                {
                    title: 'versionId',
                    type: 'hidden',
                },
                {
                    title: 'isChanged',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.program.noOfDaysInMonth'),
                    type: 'dropdown',
                    source: this.state.noOfDays,
                },
                {
                    title: i18n.t('static.versionSettings.freight%'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                },
                {
                    title: i18n.t('static.versionSettings.forecastThresholdHigh'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                },
                {
                    title: i18n.t('static.versionSettings.ForecastThresholdLow'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                },
                {
                    title: 'localCalling',
                    type: 'hidden',
                },
                {
                    title: 'datasetData',
                    type: 'hidden',
                },
            ],
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            allowDeleteRow: false,
            onchange: this.changed,
            onchangepage: this.onchangepage,
            oneditionend: this.oneditionend,
            editable: ((AuthenticationService.checkUserACL(this.state.programValues.map(c => c.value.toString()), 'ROLE_BF_EDIT_VERSION_SETTINGS')) ? true : false),
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    var rowData = obj.getRowData(y);
                    if (rowData[10] == 1) {
                        items.push({
                            title: i18n.t('static.commitTree.showValidation'),
                            onclick: function () {
                                this.setState({
                                    programName: rowData[1] + "~v" + rowData[2],
                                    programCode: rowData[1],
                                    version: rowData[2],
                                    pageName: i18n.t('static.versionSettings.versionSettings'),
                                    programNameOriginal: getLabelText(rowData[18].label, this.state.lang),
                                    programId: rowData[11],
                                    forecastStartDate: rowData[7],
                                    forecastStopDate: rowData[9]
                                })
                                this.openModalPopup(rowData[18]);
                            }.bind(this)
                        });
                    } else {
                        var programId = this.state.programId;
                        items.push({
                            title: i18n.t('static.commitTree.showValidation'),
                            onclick: function () {
                                DatasetService.getDatasetData(rowData[0], rowData[2]).then(response => {
                                    if (response.status == 200) {
                                        var responseData = response.data;
                                        this.setState({
                                            programName: rowData[1] + "~v" + rowData[2],
                                            programCode: rowData[1],
                                            version: rowData[2],
                                            pageName: i18n.t('static.versionSettings.versionSettings'),
                                            programNameOriginal: getLabelText(responseData.label, this.state.lang),
                                            programId: rowData[0],
                                            forecastStartDate: rowData[7],
                                            forecastStopDate: rowData[9]
                                        })
                                        this.openModalPopup(responseData);
                                    }
                                }).catch(
                                );
                            }.bind(this)
                        });
                    }
                }
                return items;
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }
    /**
     * Toggle data check popup
     * @param {*} programData Forecast program details
     */
    openModalPopup(programData) {
        this.setState({
            showValidation: !this.state.showValidation,
            programData: programData != undefined ? programData : {}
        }, () => {
            if (this.state.showValidation) {
                this.setState({
                }, () => {
                    dataCheck(this, programData, "versionSettings")
                })
            }
        })
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('InfoTr');
        tr.children[14].classList.add('InfoTrAsteriskTheadtrTd');
        tr.children[15].classList.add('InfoTr');
        tr.children[16].classList.add('InfoTr');
        tr.children[17].classList.add('InfoTr');
        tr.children[8].classList.add('AsteriskTheadtrTd');
        tr.children[10].classList.add('AsteriskTheadtrTd');
        tr.children[3].title = i18n.t('static.tooltip.version');
        tr.children[14].title = i18n.t('static.tooltip.HashOfDaysInMonth');
        tr.children[15].title = i18n.t('static.tooltip.FreightPercent');
        tr.children[16].title = i18n.t('static.tooltip.ForecastThresholdHigh');
        tr.children[17].title = i18n.t('static.tooltip.ForecastThresholdLow');
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength;
        if ((document.getElementsByClassName("jss_pagination_dropdown")[0] != undefined)) {
            jsonLength = 1 * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        }
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        for (var y = 0; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            if (rowData[10] == 1) {
                var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("O").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("P").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("Q").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("O").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("P").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("Q").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    /**
     * Reterives forecast program dropdown
     */
    componentDidMount() {
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getFCProgramBasedOnRealmId(realmId)
            .then(response => {
                if (response.status == 200) {
                    var responseData = response.data;
                    var datasetList = [];
                    for (var rd = 0; rd < responseData.length; rd++) {
                        var json = {
                            programId: responseData[rd].id,
                            name: getLabelText(responseData[rd].label, this.state.lang),
                            programCode: responseData[rd].code,
                            isOnline: 1
                        }
                        datasetList.push(json);
                    }
                    this.setState({
                        datasetList: datasetList,
                        loading: false
                    }, () => {
                        this.getVersionTypeList();
                        this.getDatasetList();
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    }, () => {
                        hideSecondComponent();
                    })
                }
            }).catch(
                error => {
                    this.getVersionTypeList();
                    this.getDatasetList();
                }
            );
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.isChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram(programIds) {
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            var programIds = this.state.programValues.map(x => x.value).join(", ");
            localStorage.setItem("sesForecastProgramIds", JSON.stringify(this.state.programValues));
            programIds = Array.from(new Set(programIds.split(','))).toString();
            this.getDatasetById(programIds);
        })
    }
    /**
     * Toggles the checked state of a tree scenario based on the provided tree and scenario IDs.
     * Updates the state with the modified tree scenario list.
     * @param {string} treeId - The ID of the tree.
     * @param {string} scenarioId - The ID of the scenario.
     */
    plusMinusClicked(treeId, scenarioId) {
        var index = this.state.treeScenarioList.findIndex(c => c.treeId == treeId && c.scenarioId == scenarioId);
        var treeScenarioList = this.state.treeScenarioList;
        treeScenarioList[index].checked = !treeScenarioList[index].checked;
        this.setState({
            treeScenarioList: treeScenarioList
        })
    }
    /**
     * Updates the state to include or exclude only selected forecasts based on the checkbox's checked status.
     * Invokes the `dataCheck` function after updating the state.
     * @param {Object} e - The event object representing the checkbox's change event.
     */
    setIncludeOnlySelectedForecasts(e) {
        this.setState({
            includeOnlySelectedForecasts: e.target.checked
        }, () => {
            dataCheck(this, this.state.programData, "versionSettings")
        })
    }
    /**
     * Toggles the visibility of guidance information by updating the state.
     */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    /**
     * Renders the version setting screen.
     * @returns {JSX.Element} - Version setting screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { uniquePrograms } = this.state;
        let programMultiList = uniquePrograms.length > 0
            && uniquePrograms.map((item, i) => {
                return ({ label: item.programCode, value: item.programId })
            }, this);
        programMultiList = Array.from(programMultiList);
        const { versionTypeList } = this.state;
        let versionTypes = versionTypeList.length > 0
            && versionTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const { noForecastSelectedList } = this.state;
        let noForecastSelected = noForecastSelectedList.filter(c => c.regionList.length > 0).length > 0 ?
            noForecastSelectedList.map((item, i) => {
                return (
                    item.regionList.map(item1 => {
                        return (
                            <li key={i}>
                                <a href={"/#/report/compareAndSelectScenario/" + this.state.programId + "/" + item.planningUnit.planningUnit.id + "/" + item1.id} target="_blank"> <div className="hoverDiv"><span>{getLabelText(item.planningUnit.planningUnit.label, this.state.lang) + " - " + item1.label}</span></div></a>
                            </li>
                        )
                    }, this)
                )
            }, this) : <span>{i18n.t('static.forecastValidation.noMissingSelectedForecastFound')}</span>;
        const { missingMonthList } = this.state;
        let missingMonths = missingMonthList.length > 0 ? missingMonthList.map((item, i) => {
            return (
                <li key={i}>
                    <a href={"/#/dataentry/consumptionDataEntryAndAdjustment/" + item.planningUnitId} target="_blank"><div className="hoverDiv" ><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div></a>{"" + item.monthsArray}
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingGaps')}</span>;
        const { consumptionListlessTwelve } = this.state;
        let consumption = consumptionListlessTwelve.length > 0 ? consumptionListlessTwelve.map((item, i) => {
            return (
                <li key={i}>
                    <a href={"/#/dataentry/consumptionDataEntryAndAdjustment/" + item.planningUnitId} target="_blank"><div className="hoverDiv"><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div></a><span>{item.noOfMonths + " month(s)"}</span>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMonthsHaveLessData')}</span>;
        const { notSelectedPlanningUnitList } = this.state;
        let pu = (notSelectedPlanningUnitList.length > 0 && notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).length > 0) ? notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).map((item, i) => {
            return (
                <li key={i}>
                    <div>{getLabelText(item.planningUnit.label, this.state.lang) + " - " + item.regionsArray}</div>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingPlanningUnitsFound')}</span>;
        const { missingBranchesList } = this.state;
        let missingBranches = missingBranchesList.length > 0 ? missingBranchesList.map((item, i) => {
            return (
                <ul>
                    <li key={i}>
                        <a href={`/#/dataSet/buildTree/tree/${item.treeId}/${this.state.programId}`} target="_blank"><div className="hoverDiv"><span>{getLabelText(item.treeLabel, this.state.lang)}</span></div></a>
                        {item.flatList.length > 0 && item.flatList.map((item1, j) => {
                            return (
                                <ul>
                                    <li key={j}>
                                        <div><span>{getLabelText(item1.payload.label, this.state.lang) == "" ? i18n.t('static.forecastValidation.editMe') : getLabelText(item1.payload.label, this.state.lang)}</span></div>
                                    </li>
                                </ul>
                            )
                        }, this)}
                    </li>
                </ul>
            )
        }, this) : <ul><span>{i18n.t('static.forecastValidation.noBranchesMissingPU')}</span></ul>;
        let jxlTable = this.state.treeScenarioList.length > 0 && this.state.treeScenarioListNotHaving100PerChild.length > 0 ? this.state.treeScenarioList.map((item1, count) => {
            if (this.state.treeScenarioListNotHaving100PerChild.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId).length > 0) {
                var nodeWithPercentageChildren = this.state.nodeWithPercentageChildren.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId);
                if (nodeWithPercentageChildren.length > 0) {
                    return (<><a href={`/#/dataSet/buildTree/tree/${item1.treeId}/${this.state.programId}/${item1.scenarioId}`} target="_blank"><span className="hoverDiv"><span>{getLabelText(item1.treeLabel, this.state.lang) + " / " + getLabelText(item1.scenarioLabel, this.state.lang)}</span></span></a><span className="hoverDiv" onClick={() => this.plusMinusClicked(item1.treeId, item1.scenarioId)}>{item1.checked ? <i className="fa fa-minus treeValidation" ></i> : <i className="fa fa-plus  treeValidation" ></i>}</span><div className="table-responsive">
                        <div id={"tableDiv" + count} className="jexcelremoveReadonlybackground consumptionDataEntryTable" name='jxlTableData' style={{ display: item1.checked ? "block" : "none" }} />
                    </div><br /></>)
                }
            }
        }, this) : <ul><span>{i18n.t('static.forecastValidation.noNodesHaveChildrenLessThanPerc')}</span><br /></ul>
        const { consumptionExtrapolationList } = this.state;
        let consumptionExtrapolationNotes = (consumptionExtrapolationList.length > 0) ? consumptionExtrapolationList.map((item, i) => {
            var flag = true;
            if (item.notes != undefined && item.notes != null && item.notes != '') {
                if (consumptionExtrapolationList.length == (i + 1)) {
                    flag = false;
                    return (
                        <tr key={i} className="hoverTd" onClick={() => consumptionExtrapolationNotesClicked(item.planningUnit.id, this)}>
                            <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                            <td>{item.notes}</td>
                        </tr>
                    )
                }
                if (flag) {
                    if (consumptionExtrapolationList[i].planningUnit.id != consumptionExtrapolationList[i + 1].planningUnit.id) {
                        return (
                            <tr key={i} className="hoverTd" onClick={() => consumptionExtrapolationNotesClicked(item.planningUnit.id, this)}>
                                <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                                <td>{item.notes}</td>
                            </tr>
                        )
                    }
                }
            }
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noConsumptionExtrapolationNotesFound')}</span>;
        const { datasetPlanningUnitNotes } = this.state;
        let consumtionNotes = (datasetPlanningUnitNotes.length > 0 && datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").length > 0) ? datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => missingMonthsClicked(item.planningUnit.id, this)}>
                    <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                    <td>{item.consumptionNotes}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noConsumptionNotesFound')}</span>;
        const { treeScenarioNotes } = this.state;
        let scenarioNotes = treeScenarioNotes.length > 0 ? treeScenarioNotes.map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId, this)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td>{item.treeNotes}</td>
                    <td>{item.scenarioNotes}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noTreeScenarioNotesFound')}</span>;
        const { treeNodeList } = this.state;
        let treeNodes = treeNodeList.length > 0 && treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).length > 0 ? treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId, this)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.node, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td><b>{(item.notes != "" && item.notes != null) ? i18n.t('static.commitTree.main') + ": " : ""}</b> {(item.notes != "" && item.notes != null) ? item.notes : ""}
                        {(item.notes != "" && item.notes != null && item.madelingNotes != "" && item.madelingNotes != null) ? <br /> : ""}<b>{(item.madelingNotes != "" && item.madelingNotes != null) ? i18n.t('static.commitTree.modeling') + ": " : ""}</b> {(item.madelingNotes != "" && item.madelingNotes != null) ? item.madelingNotes : ""}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noTreeNodesNotesFound')}</span>;
        return (
            <div className="animated">
                <Prompt
                    when={this.state.isChanged == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            {localStorage.getItem('sessionType') === 'Online' && <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>}
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            {localStorage.getItem('sessionType') === 'Online' && <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/dataSet/listDataSet" className="supplyplanformulas">{i18n.t('static.dataset.manageProgramInfo')}</a></span>}
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.updatePlanningUnit.updatePlanningUnit')}</a></span><br />
                        </div>
                    </div>
                    <div className="card-header-actions">
                        <div className="card-header-action pr-lg-4">
                            <a style={{ float: 'right' }}>
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-2">
                        <Col md="9 pl-0">
                            <div className="d-md-flex">
                                <FormGroup className="mt-md-2 mb-md-0 ZindexFeild">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
                                    <div className="controls SelectGoVesionSetting">
                                        <MultiSelect
                                            name="datasetId"
                                            id="datasetId"
                                            bsSize="sm"
                                            value={this.state.programValues}
                                            onChange={(e) => { this.handleChangeProgram(e) }}
                                            options={programMultiList && programMultiList.length > 0 ? programMultiList : []}
                                            labelledBy={i18n.t('static.common.pleaseSelect')}
                                            filterOptions={filterOptions}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ZindexFeild">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                                    <div className="controls SelectGoVesionSetting">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="versionTypeId"
                                                id="versionTypeId"
                                                bsSize="sm"
                                                onChange={(e) => { this.getOnLineDatasetsVersion() }}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {versionTypes}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="mt-md-2 mb-md-0 col-md-4 ZindexFeild">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.versionSettings.committedDate')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls edit">
                                        <Picker
                                            ref="pickRange"
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            value={rangeValue}
                                            lang={pickerLang}
                                            onDismiss={this.handleRangeDissmis}
                                        >
                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                        </Picker>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div className="VersionSettingMarginTop consumptionDataEntryTable">
                            <div id="tableDiv" className={"RemoveStriped"} style={{ display: this.state.loading ? "none" : "block" }}>
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
                    </CardBody>
                    <CardFooter className="CardFooterVesionsettingMarginTop">
                        {(AuthenticationService.checkUserACL(this.state.programValues.map(c => c.value.toString()), 'ROLE_BF_EDIT_VERSION_SETTINGS')) &&
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.isChanged && <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                            </FormGroup>
                        }
                    </CardFooter>
                </Card>
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody className="ModalBodyPadding">
                            <div dangerouslySetInnerHTML={{
                                __html: localStorage.getItem('lang') == 'en' ?
                                    showguidanceEn :
                                    localStorage.getItem('lang') == 'fr' ?
                                        showguidanceFr :
                                        localStorage.getItem('lang') == 'sp' ?
                                            showguidanceSp :
                                            showguidancePr
                            }} />
                        </ModalBody>
                    </div>
                </Modal>
                <Modal isOpen={this.state.showValidation}
                    className={'modal-lg ' + this.props.className} id='divcontents'>
                    <ModalHeader toggle={() => this.openModalPopup()} className="modalHeaderSupplyPlan">
                        <div>
                            <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => exportPDF(this)} />
                            <h3><strong>{i18n.t('static.commitTree.forecastValidation')}</strong></h3>
                        </div>
                        <div className={"check inline pl-lg-3"}>
                            <div className="">
                                <Input
                                    style={{ width: '16px', height: '16px', marginTop: '3px' }}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="includeOnlySelectedForecasts"
                                    name="includeOnlySelectedForecasts"
                                    checked={this.state.includeOnlySelectedForecasts}
                                    onClick={(e) => { this.setIncludeOnlySelectedForecasts(e); }}
                                />
                                <Label
                                    className="form-check-label pl-lg-1"
                                    check htmlFor="inline-radio2" style={{ fontSize: '16px' }}>
                                    <b>{i18n.t('static.validation.includeOnlySelectedForecast')}</b>
                                </Label>
                            </div>
                        </div>
                    </ModalHeader>
                    <div>
                        <ModalBody className="VersionSettingMode">
                            <span><b>{this.state.programName}</b></span><br />
                            <span><b>{i18n.t('static.common.forecastPeriod')}: </b> {moment(this.state.forecastStartDate).format('MMM-YYYY')} to {moment(this.state.forecastStopDate).format('MMM-YYYY')} </span>
                            <br />
                            <br />
                            <span><b>1. {i18n.t('static.commitTree.noForecastSelected')}: </b>
                                <a href="/#/report/compareAndSelectScenario" target="_blank">{i18n.t('static.commitTree.compare&Select')}</a>,
                                {(this.state.version != undefined && this.state.version.toString().includes('Local')) ?
                                    (<a href={this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined ? "/#/forecastReport/forecastSummary/" + this.state.programId.toString().split("_")[0] + "/" + (this.state.programId.toString().split("_")[1]).toString().substring(1) : "/#/forecastReport/forecastSummary/"} target="_blank">{i18n.t('static.commitTree.forecastSummary')}</a>)
                                    : (<a href="/#/forecastReport/forecastSummary/" target="_blank">{i18n.t('static.commitTree.forecastSummary')}</a>)}
                            </span><br />
                            <ul>{noForecastSelected}</ul>
                            <span><b>2. {i18n.t('static.commitTree.consumptionForecast')}: </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
                            <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')}:</span><br />
                            <ul>{missingMonths}</ul>
                            <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')}:</span><br />
                            <ul>{consumption}</ul>
                            <span><b>3. {i18n.t('static.commitTree.treeForecast')}: </b>(<a href={"/#/dataSet/buildTree/tree/0/" + this.state.programId} target="_blank">{i18n.t('static.common.managetree')}</a>)</span><br />
                            <span>a. {this.state.includeOnlySelectedForecasts ? i18n.t('static.commitTree.puThatDoesNotAppearOnSelectedForecastTree') : i18n.t('static.commitTree.puThatDoesNotAppearOnAnyTree')}: </span><br />
                            <ul>{pu}</ul>
                            <span>b. {i18n.t('static.commitTree.branchesMissingPlanningUnit')}:</span><br />
                            {missingBranches}
                            <span>c. {i18n.t('static.commitTree.NodesWithChildrenThatDoNotAddUpTo100Prcnt')}:</span><br />
                            {jxlTable}
                            <span><b>4. {i18n.t('static.program.notes')}:</b></span><br />
                            <span>a. {i18n.t('static.forecastMethod.historicalData')}:</span>
                            <div className="">
                                {(datasetPlanningUnitNotes.length > 0 && datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").length > 0) ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table" bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th style={{ width: '30%' }}><b>{i18n.t('static.dashboard.planningunitheader')}</b></th>
                                                <th style={{ width: '80%' }}><b>{i18n.t('static.program.notes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{consumtionNotes}</tbody>
                                    </Table>
                                </div> : <span>{consumtionNotes}</span>}
                            </div><br />
                            <span>b. {i18n.t('static.forecastValidation.consumptionExtrapolationNotes')}:</span>
                            <div className="mt-2">
                                {(consumptionExtrapolationList.length > 0) ?
                                    <div className="table-wrap table-responsive fixTableHead">
                                        <Table className="table-bordered text-center overflowhide main-table" bordered size="sm" >
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '30%' }}><b>{i18n.t('static.dashboard.planningunitheader')}</b></th>
                                                    <th style={{ width: '80%' }}><b>{i18n.t('static.program.notes')}</b></th>
                                                </tr>
                                            </thead>
                                            <tbody>{consumptionExtrapolationNotes}</tbody>
                                        </Table>
                                    </div> : <span>{consumptionExtrapolationNotes}</span>}
                            </div><br />
                            <span>c. {i18n.t('static.commitTree.treeScenarios')}:</span>
                            <div className="table-scroll">
                                {treeScenarioNotes.length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table" bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th style={{ width: '15%' }}><b>{i18n.t('static.forecastMethod.tree')}</b></th>
                                                <th style={{ width: '15%' }}><b>{i18n.t('static.whatIf.scenario')}</b></th>
                                                <th style={{ width: '35%' }}><b>{i18n.t('static.dataValidation.treeNotes')}</b></th>
                                                <th style={{ width: '35%' }}><b>{i18n.t('static.dataValidation.scenarioNotes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{scenarioNotes}</tbody>
                                    </Table>
                                </div> : <span>{scenarioNotes}</span>}
                            </div><br />
                            <span>d. {i18n.t('static.commitTree.treeNodes')}:</span>
                            <div className="">
                                {treeNodeList.length > 0 && treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table" bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>{i18n.t('static.forecastMethod.tree')}</b></th>
                                                <th><b>{i18n.t('static.common.node')}</b></th>
                                                <th><b>{i18n.t('static.whatIf.scenario')}</b></th>
                                                <th><b>{i18n.t('static.program.notes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{treeNodes}</tbody>
                                    </Table>
                                </div> : <span>{treeNodes}</span>}
                            </div>
                        </ModalBody>
                        <div className="col-md-12 pb-lg-5 pt-lg-3">
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.openModalPopup() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </div>
                    </div>
                </Modal >
            </div>
        )
    }
}
export default VersionSettingsComponent;