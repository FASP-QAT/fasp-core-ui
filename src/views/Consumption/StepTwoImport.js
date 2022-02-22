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
            programRegionList: [],
            forecastProgramRegionList: []

        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.formSubmit = this.formSubmit.bind(this);

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

                let json = {

                    supplyPlanRegionId: parseInt(map1.get("0")),
                    isRegionInForecastProgram: parseInt(map1.get("2")),
                    importRegion: parseInt(map1.get("3")),


                    // capacityCbm: map1.get("2").replace(",", ""),
                    // capacityCbm: map1.get("2").replace(/,/g, ""),
                    // capacityCbm: this.el.getValueFromCoords(2, i).toString().replace(/,/g, ""),
                    // capacityCbm: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                    // gln: (map1.get("3") === '' ? null : map1.get("3")),
                    // active: map1.get("4"),
                    // realmCountry: {
                    //     realmCountryId: parseInt(map1.get("5"))
                    // },
                    // regionId: parseInt(map1.get("6"))
                }
                changedpapuList.push(json);

            }
            this.setState({
                stepTwoData: changedpapuList,

            }, () => {
                this.props.finishedStepTwo();
            })
            this.props.updateStepOneData("stepTwoData", changedpapuList);
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);

        } else {
            console.log("Something went wrong");
        }
    }


    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {

            //ForecastPlanningUnit
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            console.log("value-----", value);
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
        // let tempList = [];
        // tempList.push({ id: 1, v1: 'North', v2: 1 });
        // tempList.push({ id: 2, v1: 'South', v2: 2 });

        // this.setState({
        //     selSource: tempList,
        //     loading: true
        // },
        //     () => {
        //         this.buildJexcel();
        //     })

        let programId = this.props.items.programId
        let forecastProgramId = this.props.items.forecastProgramId
        let programs = this.props.items.programs
        let datasetList = this.props.items.datasetList
        let forecastProgramVersionId = this.props.items.forecastProgramVersionId

        let selectedProgramObj = programs.filter(c => c.programId == programId)[0];
        let selectedForecastProgramObj = datasetList.filter(c => c.programId == forecastProgramId && c.versionId == forecastProgramVersionId)[0];

        this.setState({
            programRegionList: selectedProgramObj.regionList,
            forecastProgramRegionList: selectedForecastProgramObj.regionList,
            selSource: selectedProgramObj.regionList,
        },
            () => {
                this.buildJexcel();
            })
        console.log("region--------->1", selectedProgramObj.regionList);
        console.log("region--------->2", selectedForecastProgramObj.regionList);

    }

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].regionId
                data[1] = getLabelText(papuList[j].label, this.state.lang)

                let match = this.state.forecastProgramRegionList.filter(c => c.regionId == papuList[j].regionId);

                if (match.length > 0) {
                    data[2] = 1
                    data[3] = ''
                } else {
                    data[2] = 0
                    data[3] = 3
                }

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
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanRegion'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true,
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.isRegionInForecastProgram'),
                    readOnly: true,
                    type: 'dropdown',
                    source: [
                        { id: 0, name: 'No' },
                        { id: 1, name: 'Yes' },
                    ]
                },
                {
                    title: i18n.t('static.quantimed.importData'),
                    type: 'dropdown',
                    source: [
                        { id: 1, name: i18n.t('static.importFromQATSupplyPlan.Import') },
                        { id: 2, name: i18n.t('static.quantimed.doNotImport') },
                        { id: 3, name: i18n.t('static.importFromQATSupplyPlan.noRegionToImportInto') },
                    ],
                    filter: this.filterImport
                },


            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    //left align
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);

                    var importRegion = rowData[3];
                    if (importRegion == 2) {// fill color
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'color', textColor);
                    } else {
                        // elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', 'transparent');
                    }

                    var isRegionInForecast = rowData[2];
                    if (isRegionInForecast == false) {// grade out

                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                    }

                }

            }.bind(this),
            // pagination: localStorage.getItem("sesRecordCount"),
            pagination: 5000000,
            // pagination: false,
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

        this.el = jexcel(document.getElementById("mapRegion"), options);
        this.setState({
            loading: false
        })
        this.props.updateStepOneData("loading", false);
    }

    filterImport = function (instance, cell, c, r, source) {
        var mylist = [
            { id: 1, name: i18n.t('static.importFromQATSupplyPlan.Import') },
            { id: 2, name: i18n.t('static.quantimed.doNotImport') },
        ];

        return mylist;
    }.bind(this)

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