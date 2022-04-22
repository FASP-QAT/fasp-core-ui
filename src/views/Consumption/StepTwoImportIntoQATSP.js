import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import {
    Button,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Picker from 'react-month-picker';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import MonthBox from '../../CommonComponent/MonthBox.js'
import getLabelText from '../../CommonComponent/getLabelText';
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import moment from "moment";
import CryptoJS from 'crypto-js';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

export default class StepTwoImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lang: localStorage.getItem('lang'),
            // loading: false,
            selSource: [],
            supplyPlanRegionList: [],
            forecastRegionList: [],
            supplyPlanRegionListJExcel: [],
            selSource2: [],


        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.filterData = this.filterData.bind(this);

    }

    formSubmit = function () {

        var validation = this.checkValidation();
        console.log("validation------->", validation)
        if (validation == true) {
            // this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("3")) != -1) {

                    let json = {

                        forecastRegionId: parseInt(map1.get("0")),
                        forecastPercentage: parseInt(map1.get("2")),
                        supplyPlanRegionId: parseInt(map1.get("3")),
                        supplyPlanRegionName: this.state.supplyPlanRegionListJExcel.filter(c => c.id == parseInt(map1.get("3")))[0].name
                    }
                    changedpapuList.push(json);
                }
            }
            this.setState({
                stepTwoData: changedpapuList,
                selSource2: tableJson

            }, () => {
                this.props.finishedStepTwo();
            })
            this.props.updateStepOneData("stepTwoData", changedpapuList);
            this.props.updateStepOneData("selSource2", tableJson);

            console.log("FINAL SUBMIT changedpapuList---stepTwoData", changedpapuList);

        } else {
            console.log("Something went wrong");
        }

        // this.props.finishedStepTwo();
    }


    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {

            //ForecastPlanningUnit
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            // console.log("value-----", value);    
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }


        }
        return valid;
    }


    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText && this.props.removeMessageText();
        if (x == 3) {
            let supplyPlanRegionId = this.el.getValueFromCoords(3, y);
            if (supplyPlanRegionId != -1 && supplyPlanRegionId != null && supplyPlanRegionId != '') {
            } else {
                this.el.setValueFromCoords(2, y, '', true);
            }

            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }


        //#Percentage
        if (x == 2) {
            let supplyPlanRegionId = this.el.getValueFromCoords(3, y);
            var col = ("C").concat(parseInt(y) + 1);
            value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = /^\d{1,6}(\.\d{1,6})?$/;
            if (supplyPlanRegionId != -1) {
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

        }
        if (!this.state.isChanged1) {
            this.setState({
                isChanged1: true,
            });
        }
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

    }

    loaded = function (instance, cell, x, y, value) {
        // jExcelLoadedFunctionWithoutPagination(instance);
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[3].classList.add('AsteriskTheadtrTd');
    }

    componentDidMount() {
    }

    filterData() {
        let regionList = this.props.items.regionList
        let programRegionList = []
        let forecastProgramRegionList = []
        for (var j = 0; j < regionList.length; j++) {
            forecastProgramRegionList = regionList[j].forecastRegionList
            programRegionList = regionList[j].supplyPlanRegionList
        }
        let tempList = [];
        if (programRegionList.length > 0) {
            for (var i = 0; i < programRegionList.length; i++) {
                var paJson = {
                    name: getLabelText(programRegionList[i].label, this.state.lang),
                    id: parseInt(programRegionList[i].id),
                }
                tempList[i] = paJson
            }
        }

        tempList = tempList.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        })

        tempList.unshift({
            name: i18n.t('static.quantimed.doNotImport'),
            id: -1,
            multiplier: 1,
            active: true,
            forecastingUnit: []
        });

        this.setState({
            programRegionList: programRegionList,
            forecastProgramRegionList: forecastProgramRegionList,
            supplyPlanRegionListJExcel: tempList
        },
            () => {
                this.buildJexcel();
            })
    }

    buildJexcel() {
        var papuList = this.state.forecastProgramRegionList;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].regionId
                data[1] = getLabelText(papuList[j].label, this.state.lang)
                data[2] = 100


                let match = null;
                match = this.state.programRegionList.filter(c => c.id == papuList[j].regionId)[0];
                if (match != null) {
                    data[3] = getLabelText(match.label, this.state.lang)
                } else {
                    data[3] = ""
                }

                papuDataArr[count] = data;
                count++;
            }
        }

        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapRegion"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapImport"), '');
        this.el.destroy();

        var json = [];
        var papuList11 = this.state.selSource2;
        var data;
        if (papuList11 != "") {
            data = papuList11
        } else {
            data = papuDataArr
        }
        // var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100],
            columns: [
                {
                    title: "Forecast Region(s) id",
                    type: 'hidden',
                    readOnly: true,//0 A
                },
                {
                    title: "Forecast Region(s)",
                    type: 'text',
                    readOnly: true,
                    textEditor: true,//1 B
                },
                {
                    title: "% of Forecast",
                    type: 'text',
                    // readOnly: true,
                    textEditor: true,//2 C
                },
                {
                    title: "Supply Plan Region",
                    type: 'autocomplete',
                    source: this.state.supplyPlanRegionListJExcel,//3 D
                }


            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    //left align
                    var rowData = elInstance.getRowData(y);

                    var doNotImport = rowData[3];
                    if (doNotImport == -1) {// grade out
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'color', textColor);

                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                    } else {
                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');

                    }
                }

            }.bind(this),
            // selectionCopy: false,
            // pagination: localStorage.getItem("sesRecordCount"),
            pagination: 5000000,
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
            onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            // oneditionend: this.oneditionend,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            // contextMenu: false
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("mapRegion"), options);
        this.setState({
            loading: false
        })
        this.props.updateStepOneData("loading", false);
    }

    render() {
        const { rangeValue } = this.state
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>

                <div className="table-responsive" style={{ display: this.props.items.loading ? "none" : "block" }} >

                    <div id="mapRegion">
                    </div>
                </div>
                <div style={{ display: this.props.items.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
                <FormGroup>
                    <Button color="info" size="md" className="float-right mr-1" type="submit" onClick={() => this.formSubmit()}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                    &nbsp;
                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                    &nbsp;
                </FormGroup>
            </>
        );
    }

}