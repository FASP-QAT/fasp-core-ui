import React, { Component } from "react";
import { Card, CardBody, CardFooter, FormGroup, Input, InputGroup, Label, Col, Button, ModalHeader, ModalBody, Table, Modal } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_INTEGER_REGEX, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY, JEXCEL_DECIMAL_NO_REGEX,PROGRAM_TYPE_DATASET } from "../../Constants";
import { MultiSelect } from 'react-multi-select-component';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { buildJxl, buildJxl1, dataCheck } from "./DataCheckComponent";
import { Prompt } from 'react-router';
import { exportPDF, noForecastSelectedClicked, missingMonthsClicked, missingBranchesClicked, nodeWithPercentageChildrenClicked } from '../DataSet/DataCheckComponent.js';
import pdfIcon from '../../assets/img/pdf.png';
import ProgramService from '../../api/ProgramService';
import DatasetService from '../../api/DatasetService';
import showguidanceEn from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsEn.html'
import showguidanceFr from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsFr.html'
import showguidanceSp from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsSp.html'
import showguidancePr from '../../../src/ShowGuidanceFiles/UpdateVersionSettingsPr.html'
import DropdownService from '../../api/DropdownService';
import { resolve } from "path";
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const entityname = i18n.t('static.versionSettings.versionSettings');
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
            dataList: []
        }
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getOnLineDatasetsVersion = this.getOnLineDatasetsVersion.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getVersionTypeList = this.getVersionTypeList.bind(this);
        this.getDatasetById = this.getDatasetById.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.updateState = this.updateState.bind(this);
        this.onchangepage=this.onchangepage.bind(this)
    }

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

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleRangeChange(value, text, listIndex) {

    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.getOnLineDatasetsVersion()
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(12, y);
            if (parseInt(value) == 1) {
                //Start date
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
                //End date
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
                // No of days in month

                var col = ("N").concat(parseInt(y) + 1);
                var reg = JEXCEL_INTEGER_REGEX;
                var value = this.el.getValueFromCoords(13, y);
                // console.log("Value@@@", value)
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
                // console.log("Value@@@", value)
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
                    // this.el.setStyle(col, "background-color", "transparent");
                    // this.el.setStyle(col, "background-color", "yellow");
                    // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    // valid = false;
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
                    // this.el.setStyle(col, "background-color", "transparent");
                    // this.el.setStyle(col, "background-color", "yellow");
                    // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    // valid = false;
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
                    // this.el.setStyle(col, "background-color", "transparent");
                    // this.el.setStyle(col, "background-color", "yellow");
                    // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    // valid = false;
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

                // Version notes

                var col = ("E").concat(parseInt(y) + 1);
                value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var regex=/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/;
                if (value != "") {
                    if (value.length > 1000) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidStringLength'));
                        valid = false;
                    } else if(!regex.test(value)){
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

    changed = function (instance, cell, x, y, value) {

        //Start date
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
            // console.log("Value@@@", value)
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
        //End date
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

        //No of days
        // if (x == 12) {
        //     var col = ("M").concat(parseInt(y) + 1);
        //     var reg = JEXCEL_INTEGER_REGEX;
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
        //     }
        //     else if (!(reg.test(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
        //     }
        //     else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }
        // }


        if (x != 12) {
            this.el.setValueFromCoords(12, y, 1, true);
            this.setState({
                isChanged: true
            })
        }


        if (x == 8 && this.el.getValueFromCoords(17, y) == 0) {//forecastPeriodInMonth
            let startDate = this.el.getValueFromCoords(7, y);
            let month = this.el.getValueFromCoords(8, y);
            // console.log("startDate--------->", startDate);
            if (startDate != null && month != null && month != "" && startDate != "") {
                let newStartDate = new Date(startDate);
                newStartDate.setMonth(newStartDate.getMonth() + (month - 1));
                // console.log("startDate--------->1", new Date(newStartDate));
                this.el.setValueFromCoords(17, y, 1, true);
                this.el.setValueFromCoords(9, y, newStartDate.getFullYear() + '-' + (newStartDate.getMonth() + 1) + "-01 00:00:00", true);

            }
            this.el.setValueFromCoords(17, y, 0, true);
        }


        if ((x == 9 || x == 7) && this.el.getValueFromCoords(17, y) == 0) {//endDate
            // console.log("startDate--------->1111111");
            let startDate = this.el.getValueFromCoords(7, y);
            let endDate = this.el.getValueFromCoords(9, y);

            if (startDate != null & endDate != null && startDate != "" && endDate != "" && startDate != "") {
                let d1 = new Date(startDate);
                let d2 = new Date(endDate)
                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months += d2.getMonth() - d1.getMonth();
                // months = months - 1;
                months = months + 1;
                this.el.setValueFromCoords(17, y, 1, true);
                this.el.setValueFromCoords(8, y, months, true);
            }
            this.el.setValueFromCoords(17, y, 0, true);
        }


        //unit per pallet euro1
        if (x == 14) {
            var col = ("O").concat(parseInt(y) + 1);
            value = this.el.getValue(`O${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
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

        //unit per pallet euro1
        if (x == 15) {
            var col = ("P").concat(parseInt(y) + 1);
            value = this.el.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
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

        //unit per pallet euro1
        if (x == 16) {
            var col = ("Q").concat(parseInt(y) + 1);
            value = this.el.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
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

        // Version notes
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var regex=/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/;
            if (value != "") {
                if (value.length > 1000) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidStringLength'));
                } else if(!regex.test(value)){
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.validData'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if(!this.state.isChanged1){
            this.setState({
                isChanged1: true,
            });
        }   



    }.bind(this);
    // -----end of changed function

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
                //    console.log("12 map---" + map1.get("12"))
                   if (parseInt(map1.get("12")) === 1) {
                    //    console.log("map1.get(11)---", map1.get("11"));
                    //    console.log("map1.get(13)---", map1.get("13"));
                    //    console.log("map1.get(7)---", map1.get("7"));
                    //    console.log("map1.get(9)---", map1.get("9"));
                       var notes = map1.get("4");
                       var startDate = map1.get("7");
                       var stopDate = map1.get("9");
                       var id = map1.get("11");
                       var noOfDaysInMonth = Number(map1.get("13"));
                    //    console.log("start date ---", startDate);
                    //    console.log("stop date ---", stopDate);
                    //    console.log("noOfDaysInMonth ---", noOfDaysInMonth);
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
                       // var db1;
                       // getDatabase();
                       // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                       // openRequest.onerror = function (event) {
                       //     this.setState({
                       //         message: i18n.t('static.program.errortext'),
                       //         color: 'red'
                       //     })
                       //     this.hideFirstComponent()
                       // }.bind(this);
                       // openRequest.onsuccess = function (e) {
                       //     db1 = e.target.result;
                       //     var transaction = db1.transaction(['datasetData'], 'readwrite');
                       //     var programTransaction = transaction.objectStore('datasetData');
                       //     var programRequest = programTransaction.put(program);
                       //     programRequest.onerror = function (e) {
   
                       //     }.bind(this);
                       //     programRequest.onsuccess = function (e) {
   
                       //     }.bind(this);
                       // }.bind(this);
                       programs.push(program);
                       count++;
                   }
               }
            //    console.log("programs to update---", programs);
               if (count > 0) {
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
                        //    console.log("---hurrey---");
                       })
                       transaction.oncomplete = function (event) {
                        //    console.log("in side datasetDetails")
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
                                    }}                         
                            // console.log("---hurrey---");
                             })
                        
                           

                           
                           this.setState({
                               loading: false,
                               message: i18n.t('static.mt.dataUpdateSuccess'),
                               color: "green",
                               isChanged: false
                           }, () => {
                               this.hideSecondComponent();
                               // this.getOnLineDatasetsVersion();
                           });
                        //    console.log("Data update success");
                       }.bind(this);
                       transaction.onerror = function (event) {
                           this.setState({
                               loading: false,
                               // message: 'Error occured.',
                               color: "red",
                           }, () => {
                               this.hideSecondComponent();
                           });
                        //    console.log("Data update errr");
                       }.bind(this);
                   }.bind(this);
               }
           }
        }
    }

    getDatasetById(datasetIds) {
        var versionSettingsListOffLine = [];
        var versionSettingsList = [];
        this.state.datasetList.map(dataset => {
            if (datasetIds.includes(dataset.programId)) {
                versionSettingsList.push(dataset);
            }
        })
        versionSettingsListOffLine = versionSettingsList.filter(c => c.id)
        // console.log("versionSettingsListOffLine!!!!", versionSettingsListOffLine)
        // console.log("versionSettingsList!!!!", versionSettingsList)
        this.setState({
            versionSettingsList: versionSettingsListOffLine,
            datasetIds
        }, () => {
            this.getOnLineDatasetsVersion()
        });

    }

    // getDatasetById(datasetIds) {
    //     var versionSettingsList = [];
    //     var versionSettingsListForOther = []
    //     // this.state.datasetList.map(dataset => {
    //     //     if (datasetIds.includes(dataset.programId)) {
    //     //         versionSettingsList.push(dataset);
    //     //     }
    //     // })
    //     console.log("uniquePrograms!!!!", this.state.uniquePrograms)

    //     this.state.uniquePrograms.map(dataset => {
    //         console.log("datasetIds--->", datasetIds)
    //         console.log("datasetIds--->dataset.programId", dataset.programId)
    //         if (datasetIds.includes(dataset.programId)) {
    //             versionSettingsListForOther.push(dataset);
    //         }
    //     })
    //     console.log("versionSettingsListForOther!!!!", versionSettingsListForOther)
    //     // this.setState({ versionSettingsList, versionSettingsListForOther }, () => { this.getOnLineDatasetsVersion() });
    //     this.setState({ versionSettingsListForOther, datasetIds }, () => { this.getOnLineDatasetsVersion() });

    // }
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
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                // console.log("myResult version type---", myResult)
                myResult = myResult.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    versionTypeList: myResult
                });
                for (var i = 0; i < myResult.length; i++) {
                    // console.log("version type--->", myResult[i])

                }

            }.bind(this);
        }.bind(this);
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

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                var proList = [];
                myResult = getRequest.result;
                // console.log("myResult--->", myResult)
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var list = [];
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var obj = myResult[i];
                        // var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        // obj.programData = programData;
                        proList.push(myResult[i])
                        list.push({ label: myResult[i].programCode, value: myResult[i].programId })
                    }
                }
                var proList = proList.concat(this.state.datasetList);
                // console.log("proList---", proList);

                proList = proList.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });

                if (localStorage.getItem("sesForecastProgramIds") != '' && localStorage.getItem("sesForecastProgramIds") != undefined) {
                    // console.log("program---->>>", JSON.parse(localStorage.getItem("sesForecastProgramIds")));
                    this.setState({
                        datasetList: proList,
                        uniquePrograms: proList.filter((v, i, a) => a.findIndex(t => (t.programId === v.programId)) === i),
                        loading: false,
                        programValues: JSON.parse(localStorage.getItem("sesForecastProgramIds")),
                        // programValues: [{ label: "TZA-CON/ARV-MOH", value: 2551 }]


                    }, () => {
                        // console.log("uniquePrograms", this.state.uniquePrograms)
                        // console.log("programValues", this.state.programValues)
                        // console.log("programValues.map(x => x.value).join(", ")", this.state.programValues.map(x => x.value).join(", "))
                        var programIds = this.state.programValues.map(x => x.value).join(", ");
                        // console.log("programIds", programIds)

                        programIds = Array.from(new Set(programIds.split(','))).toString();
                        this.getDatasetById(programIds);
                        // this.filterData()
                        //   this.filterTracerCategory(programIds);

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
    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        elInstance.setValueFromCoords(12, y, 1, true);
    }

    filterStopDate = function (o, cell, x, y, value, config) {
        var previousColumnValue = o.getValueFromCoords(x - 2, y);
        // console.log("@@@",o.options.columns[9])
        config.options.validRange = [previousColumnValue, null];
        return config;
    }

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
        // console.log("Input Json", inputjson)
        ProgramService.getDatasetVersions(inputjson).then(response => {
            if (response.status == 200) {
                var responseData = response.data;
                // console.log("responseData------->", responseData);
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
                    // console.log("data---------->", data)
                    dataList1.push(data);
                }
                // console.log("dataList1---------->", dataList1)
                this.setState({
                    dataList: dataList1
                },
                    () => {
                        this.buildJExcel();
                    })
            }
        }).catch(
            error => {
                this.setState({
                    dataList: []
                },
                    () => {
                        this.buildJExcel();
                    })
            }
        );

        // }
    }

    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var y = start; y < jsonLength; y++) {
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
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

    buildJExcel() {
        // console.log("buildJExcel dataList--->", this.state.dataList)
        let versionSettingsListUnSorted = this.state.versionSettingsList;
        let versionSettingsList = versionSettingsListUnSorted.sort(
            function (a, b) {
                if (a.programCode === b.programCode) {
                    // Price is only important when cities are the same
                    return b.version - a.version;
                }
                return a.programCode > b.programCode ? 1 : -1;
            });
        let versionSettingsArray = [];
        let count = 0;
        var versionTypeId = document.getElementById('versionTypeId').value;
        // console.log("versionSettingsList-->", versionSettingsList)
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
                // 1-Local 0-Live
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

        // for (var j = 0; j < versionSettingsListForOther.length; j++) {
        //     if (versionSettingsListForOther[j].programData) {
        //         var databytes = CryptoJS.AES.decrypt(versionSettingsListForOther[j].programData, SECRET_KEY);
        //         var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
        //         var rangeValue = this.state.rangeValue;
        //         let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        //         let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        //         var versionList = programData.versionList.filter(c => moment(c.createdDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.createdDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"));
        //         for (var k = versionList.length - 1; k >= 0; k--) {

        //             data = [];
        //             data[0] = versionSettingsListForOther[j].programId
        //             data[1] = versionSettingsListForOther[j].programCode
        //             data[2] = versionList[k].versionId
        //             data[3] = getLabelText(versionList[k].versionType.label, this.state.lang);
        //             data[4] = versionList[k].notes
        //             data[5] = versionList[k].createdDate
        //             data[6] = versionList[k].createdBy.username
        //             data[7] = versionList[k].forecastStartDate
        //             if (versionList[k].forecastStartDate != null && versionList[k].forecastStopDate != null) {
        //                 let d1 = new Date(versionList[k].forecastStartDate);
        //                 let d2 = new Date(versionList[k].forecastStopDate)
        //                 var months;
        //                 months = (d2.getFullYear() - d1.getFullYear()) * 12;
        //                 months += d2.getMonth() - d1.getMonth();
        //                 data[8] = months + 1
        //             } else {
        //                 data[8] = 0
        //             }
        //             data[9] = versionList[k].forecastStopDate
        //             data[10] = 0
        //             data[11] = versionList[k].versionId
        //             data[12] = 0
        //             data[13] = versionList[k].daysInMonth


        //             data[14] = versionList[k].freightPerc
        //             data[15] = versionList[k].forecastThresholdHighPerc
        //             data[16] = versionList[k].forecastThresholdLowPerc
        //             data[17] = 0;
        //             data[18] = {};

        //             if (versionTypeId != "") {
        //                 if (versionList[k].versionType.id == versionTypeId) {
        //                     versionSettingsArray[count] = data;
        //                     count++;
        //                 }
        //             } else {
        //                 versionSettingsArray[count] = data;
        //                 count++;
        //             }
        //         }
        //     }
        // }
        var dataLists = this.state.dataList;
        // console.log("dataLists", dataLists)
        // console.log("dataLists length", dataLists.length)
        for (var i = 0; i < this.state.dataList.length; i++) {
            // console.log("dataList----1009--->3");

            count = (versionSettingsArray.length);
            versionSettingsArray[count] = dataLists[i];
            count++;
        }

        // console.log("versionSettingsArray------->1", versionSettingsArray);

        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = versionSettingsArray;
        // console.log("versionSettingsArray------->2", data);
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 120, 60, 80, 100, 100, 110, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'programId',
                    type: 'hidden',//0 A
                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'text',
                    readOnly: true// 1 B
                },
                {
                    title: i18n.t('static.report.version'),
                    type: 'text',
                    readOnly: true//2 C
                },
                {
                    title: i18n.t('static.report.versiontype'),
                    type: 'text',
                    readOnly: true//3 D
                },
                {
                    title: i18n.t('static.program.programDiscription'),
                    type: 'text',
                    maxlength: 1000//4 E
                },
                {
                    title: i18n.t('static.program.dateCommitted'),
                    readOnly: true,
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT_SM
                    }// 5 F


                },
                {
                    title: i18n.t('static.program.commitedbyUser'),
                    type: 'text',
                    readOnly: true//6 G
                },
                {
                    title: i18n.t('static.program.forecastStart'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    } // 7 H
                },
                {
                    title: i18n.t('static.versionSettings.ForecastPeriodInMonth'),
                    type: 'text',
                    // readOnly: true//8 I
                },
                {
                    title: i18n.t('static.program.forecastEnd'),
                    type: 'calendar',
                    filterOptions: this.filterStopDate,
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    }// 9 J
                },
                {
                    title: 'isLocal',
                    type: 'hidden',//10 K
                },
                {
                    title: 'versionId',
                    type: 'hidden',//11 L
                },
                {
                    title: 'isChanged',
                    type: 'hidden',//12 M
                },
                {
                    title: i18n.t('static.program.noOfDaysInMonth'),
                    type: 'dropdown',
                    source: this.state.noOfDays,
                    // width: '150',
                },//13 N


                {
                    title: i18n.t('static.versionSettings.freight%'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                    // readOnly: true
                },//14 O
                {
                    title: i18n.t('static.versionSettings.forecastThresholdHigh'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                    // readOnly: true
                },//15 P
                {
                    title: i18n.t('static.versionSettings.ForecastThresholdLow'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                    // readOnly: true
                },//16 Q
                {
                    title: 'localCalling',
                    type: 'hidden',//17 R
                },
                {
                    title: 'datasetData',
                    type: 'hidden',//18 S
                },

            ],
            // text: {
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            allowDeleteRow: false,
            onselection: this.selected,
            onchange: this.changed,
            onchangepage: this.onchangepage,
            oneditionend: this.oneditionend,
            // oncreateeditor: this.oncreateeditor,
            editable: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_VERSION_SETTINGS')) ? true : false),
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info
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
                                    programId: rowData[11]
                                })
                                this.openModalPopup(rowData[18]);
                            }.bind(this)
                        });
                    } else {
                        var programId = this.state.programId;
                        // console.log("programId------->", programId);
                        items.push({
                            title: i18n.t('static.commitTree.showValidation'),
                            onclick: function () {
                                DatasetService.getDatasetData(rowData[0], rowData[2]).then(response => {
                                    if (response.status == 200) {
                                        var responseData = response.data;
                                        // console.log("getDatasetData responseData------->", responseData);
                                        // console.log("rowData-->", rowData)
                                        this.setState({
                                            programName: rowData[1] + "~v" + rowData[2],
                                            programCode: rowData[1],
                                            version: rowData[2],
                                            pageName: i18n.t('static.versionSettings.versionSettings'),
                                            programNameOriginal: getLabelText(responseData.label, this.state.lang),
                                            programId: rowData[0]
                                        })
                                        this.openModalPopup(responseData);
                                    }
                                }).catch(
                                );
                            }.bind(this)
                        });

                    }

                    // -------------------------------------
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

    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {

            if ((x == 0 && value != 0) || (y == 0)) {
                // console.log("HEADER SELECTION--------------------------");
            } else {
            }
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('InfoTr');
        tr.children[14].classList.add('InfoTrAsteriskTheadtrTd');
        tr.children[15].classList.add('InfoTr');
        tr.children[16].classList.add('InfoTr');
        tr.children[17].classList.add('InfoTr');

        tr.children[8].classList.add('AsteriskTheadtrTd');
        tr.children[10].classList.add('AsteriskTheadtrTd');
        // tr.children[16].classList.add('AsteriskTheadtrTd');
        // tr.children[15].classList.add('AsteriskTheadtrTd');
        // tr.children[14].classList.add('AsteriskTheadtrTd');
        // tr.children[17].classList.add('AsteriskTheadtrTd');

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
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
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
    oncreateeditor = function (el, cell, x, y) {
        if (x == 4) {
            var config = el.options.columns[x].maxlength;
            cell.children[0].setAttribute('maxlength', config);
        }
    }

    componentDidMount() {
        // ProgramService.getDataSetList()
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_DATASET)
        .then(response => {
            if (response.status == 200) {
                var responseData = response.data;
                // console.log("getDataSetList**********responseData------->", responseData);
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
                    this.hideSecondComponent();
                })
            }
        }).catch(
            error => {
                this.getVersionTypeList();
                this.getDatasetList();
            }
        );
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    handleChangeProgram(programIds) {
        // programIds = programIds.sort(function (a, b) {
        //     return parseInt(a.value) - parseInt(b.value);
        // })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            var programIds = this.state.programValues.map(x => x.value).join(", ");
            // console.log("program------------->>>", programIds);
            localStorage.setItem("sesForecastProgramIds", JSON.stringify(this.state.programValues));
            programIds = Array.from(new Set(programIds.split(','))).toString();
            this.getDatasetById(programIds);
            // this.filterData()
            //   this.filterTracerCategory(programIds);

        })

    }

    plusMinusClicked(treeId, scenarioId) {
        var index = this.state.treeScenarioList.findIndex(c => c.treeId == treeId && c.scenarioId == scenarioId);
        var treeScenarioList = this.state.treeScenarioList;
        treeScenarioList[index].checked = !treeScenarioList[index].checked;
        this.setState({
            treeScenarioList: treeScenarioList
        })

    }

    setIncludeOnlySelectedForecasts(e) {
        this.setState({
            includeOnlySelectedForecasts: e.target.checked
        }, () => {
            dataCheck(this, this.state.programData, "versionSettings")
        })
    }
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }

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
        const checkOnline = localStorage.getItem('sessionType');

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        //No forecast selected
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

        //Consumption : missing months
        const { missingMonthList } = this.state;
        let missingMonths = missingMonthList.length > 0 ? missingMonthList.map((item, i) => {
            return (
                <li key={i}>
                    <a href={"/#/dataentry/consumptionDataEntryAndAdjustment/" + item.planningUnitId} target="_blank"><div className="hoverDiv" ><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div></a>{"" + item.monthsArray}
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingGaps')}</span>;

        //Consumption : planning unit less 12 month
        const { consumptionListlessTwelve } = this.state;
        let consumption = consumptionListlessTwelve.length > 0 ? consumptionListlessTwelve.map((item, i) => {
            return (
                <li key={i}>
                    <a href={"/#/dataentry/consumptionDataEntryAndAdjustment/" + item.planningUnitId} target="_blank"><div className="hoverDiv"><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div></a><span>{item.noOfMonths + " month(s)"}</span>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMonthsHaveLessData')}</span>;

        // Tree Forecast : planing unit missing on tree
        const { notSelectedPlanningUnitList } = this.state;
        let pu = (notSelectedPlanningUnitList.length > 0 && notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).length > 0) ? notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).map((item, i) => {
            return (
                <li key={i}>
                    <div>{getLabelText(item.planningUnit.label, this.state.lang) + " - " + item.regionsArray}</div>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingPlanningUnitsFound')}</span>;

        // Tree Forecast : branches missing PU
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

        //Nodes less than 100%
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

        //Consumption Notes
        const { datasetPlanningUnitNotes } = this.state;
        let consumtionNotes = (datasetPlanningUnitNotes.length > 0 && datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").length > 0) ? datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => missingMonthsClicked(item.planningUnit.id, this)}>
                    <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                    <td>{item.consumptionNotes}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noConsumptionNotesFound')}</span>;

        //Tree scenario Notes
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

        //Tree Nodes Notes
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
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/dataSet/listDataSet" className="supplyplanformulas">{i18n.t('static.dataset.manageProgramInfo')}</a></span>
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
                                        {/* <InMultiputGroup> */}
                                        <MultiSelect
                                            name="datasetId"
                                            id="datasetId"
                                            bsSize="sm"
                                            value={this.state.programValues}
                                            onChange={(e) => { this.handleChangeProgram(e) }}
                                            options={programMultiList && programMultiList.length > 0 ? programMultiList : []}
                                            labelledBy={i18n.t('static.common.pleaseSelect')}
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
                                            //theme="light"
                                            onChange={this.handleRangeChange}
                                            onDismiss={this.handleRangeDissmis}
                                        >
                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                        </Picker>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        {/* <div id="loader" className="center"></div> */}

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
                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_VERSION_SETTINGS')) &&
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
                        <div dangerouslySetInnerHTML={ {__html:localStorage.getItem('lang') == 'en' ?
                showguidanceEn :
                localStorage.getItem('lang') == 'fr' ?
                showguidanceFr :
                  localStorage.getItem('lang') == 'sp' ?
                  showguidanceSp :
                  showguidancePr
              } } />
                            {/* <div>
                                <h3 className='ShowGuidanceHeading'>{i18n.t('static.UpdateversionSettings.UpdateversionSettings')}</h3>
                            </div>
                            <p>
                                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.purpose')}</span> {i18n.t('static.VersionSetting.enableUsersTo')}</p>
                            </p>
                            <p>
                                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.useThisScreen')}:</span></p>
                                <p style={{ fontSize: '13px' }}>
                                    <b>{i18n.t('static.versionSettings.note')}:</b>{i18n.t('static.versionSettings.forecastProgramMustBeLoaded')}
                                </p>
                            </p>
                            <p style={{ fontSize: '13px' }}>
                                {i18n.t('static.versionSettings.OnthisScreen')}:<br></br>
                                <ol type="1">
                                    <li>{i18n.t('static.versionSettings.Updatethefollowingprogram')}:
                                        <ol type="a">
                                            <li><b>{i18n.t('static.versionSettings.Forecastperiod')}</b> {i18n.t('static.versionSettings.StartEndDate')}</li>
                                            <li><b>{i18n.t('static.versionSettings.Freightpercentage')}</b> -{i18n.t('static.versionSettings.usedInThe')} <a href="/#/forecastReport/forecastSummary" target="_blank" style={{ textDecoration: 'underline' }}> {i18n.t('static.ForecastSummary.ForecastSummary')}</a> {i18n.t('static.versionSettings.ScreenForEstimating')}</li>
                                            <li><b>{i18n.t('static.versionSettings.Forecastthreshold')} </b> -{i18n.t('static.versionSettings.usedInThe')} <a href="/#/report/compareAndSelectScenario" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.compareAndSelect')}</a> {i18n.t('static.versionSettings.QATComparesAvailable')}  <span style={{ color: '#BA0C2F' }}>{i18n.t('static.versionSettings.RedText')}</span> {i18n.t('static.versionSettings.OutsideThresholdPercentages')} </li>
                                            <li><b>{i18n.t('static.versionSettings.VersionNotes')}</b> - {i18n.t('static.versionSettings.AlsoVisibleEditable')}</li>
                                        </ol>
                                    </li>
                                    <li>{i18n.t('static.versionSettings.HistoricalLifecycle')}
                                        <ol type="a">
                                            <li>{i18n.t('static.versionSettings.ViewAllVersion')} </li>
                                            <li>{i18n.t('static.versionSettings.ForecastValidationScreen')} <a href="/#/forecastReport/forecastOutput" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.monthlyForecast')}</a>, <a href="/#/forecastReport/forecastSummary" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.commitTree.forecastSummary')}</a> or <a href="/#/report/compareVersion" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.Versioncomarition')}</a> {i18n.t('static.dashboard.ViewForecastOutputs')} </li>
                                        </ol>
                                    </li>
                                </ol>
                            </p> */}
                        </ModalBody>
                    </div>
                </Modal>
                <Modal isOpen={this.state.showValidation}
                    className={'modal-lg ' + this.props.className} id='divcontents'>
                    {/* <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <h3 style={{textAlign:'left'}}><strong>{i18n.t('static.commitTree.forecastValidation')}</strong><i className="fa fa-print pull-right iconClass cursor" onClick={() => this.print()}></i></h3>
                    </ModalHeader> */}
                    <ModalHeader toggle={() => this.openModalPopup()} className="modalHeaderSupplyPlan">
                        <div>
                            <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => exportPDF(this)} />
                            {/* <i className="fa fa-print pull-right iconClassCommit cursor" onClick={() => this.print()}></i> */}
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
                                    {/* <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> */}
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
                                {/* (<a href="/#/report/compareAndSelectScenario" target="_blank">{i18n.t('static.commitTree.compare&Select')}</a>, <a href={this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined ? "/#/forecastReport/forecastSummary/" + this.state.programId.toString().split("_")[0] + "/" + (this.state.programId.toString().split("_")[1]).toString().substring(1) : "/#/forecastReport/forecastSummary/"} target="_blank">{i18n.t('static.commitTree.forecastSummary')}</a>)</span><br />   */}
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
                            <span>a. {this.state.includeOnlySelectedForecasts?i18n.t('static.commitTree.puThatDoesNotAppearOnSelectedForecastTree'):i18n.t('static.commitTree.puThatDoesNotAppearOnAnyTree')}: </span><br />
                            <ul>{pu}</ul>

                            <span>b. {i18n.t('static.commitTree.branchesMissingPlanningUnit')}:</span><br />
                            {missingBranches}

                            <span>c. {i18n.t('static.commitTree.NodesWithChildrenThatDoNotAddUpTo100Prcnt')}:</span><br />
                            {jxlTable}


                            <span><b>4. {i18n.t('static.program.notes')}:</b></span><br />

                            <span>a. {i18n.t('static.forecastMethod.historicalData')}:</span>
                            <div className="">
                                {(datasetPlanningUnitNotes.length > 0 && datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").length > 0) ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table table-striped1" bordered size="sm" >
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
                            <span>b. {i18n.t('static.commitTree.treeScenarios')}:</span>
                            <div className="table-scroll">
                                {treeScenarioNotes.length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table table-striped1" bordered size="sm" >
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
                            <span>c. {i18n.t('static.commitTree.treeNodes')}:</span>
                            {/* <div className="table-scroll"> */}
                            <div className="">
                                {treeNodeList.length > 0 && treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table table-striped1" bordered size="sm" >
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
                            {/* <div className="col-md-12 pb-lg-5 pt-lg-3">
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.openModalPopup() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>{i18n.t('static.report.ok')}</Button>
                            </div> */}
                        </ModalBody>
                        <div className="col-md-12 pb-lg-5 pt-lg-3">
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.openModalPopup() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>{i18n.t('static.report.ok')}</Button> */}
                        </div>
                    </div>
                </Modal >
            </div>
        )
    }
}
export default VersionSettingsComponent;