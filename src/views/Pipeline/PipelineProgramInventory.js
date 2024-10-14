import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, INVENTORY_DATA_SOURCE_TYPE, JEXCEL_INTEGER_REGEX_LONG, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PRO_KEY } from '../../Constants';
import { JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY, JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import DataSourceService from '../../api/DataSourceService.js';
import PipelineService from '../../api/PipelineService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import RealmCountryService from '../../api/RealmCountryService';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Component for pipeline program import inventory details
 */
export default class PipelineProgramInventory extends Component {
    constructor(props) {
        super(props);
        this.saveInventory = this.saveInventory.bind(this);
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.state = {
            loading: true
        }
        this.startLoading = this.startLoading.bind(this);
        this.stopLoading = this.stopLoading.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    /**
     * Sets loading to true
     */
    startLoading() {
        this.setState({ loading: true });
    }
    /**
     * Sets loading to false
     */
    stopLoading() {
        this.setState({ loading: false });
    }
    /**
     * Function to filter realm country planning unit based on planning unit
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    dropdownFilter = function (instance, cell, c, r, source) {
        var realmCountryId = document.getElementById("realmCountryId").value;
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[c - 7];
        var puList = (this.state.realmCountryPlanningUnitList).filter(c => c.planningUnit.id == value && c.realmCountry.id == realmCountryId);
        for (var k = 0; k < puList.length; k++) {
            var realmCountryPlanningUnitJson = {
                name: puList[k].label.label_en,
                id: puList[k].realmCountryPlanningUnitId
            }
            mylist.push(realmCountryPlanningUnitJson);
        }
        return mylist;
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValue(`B${parseInt(y) + 1}`, true);
            if (value == "" || value == undefined) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValue(`C${parseInt(y) + 1}`, true);
            if (value == "" || value == undefined) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValue(`D${parseInt(y) + 1}`, true);
            if (value == "" || value == undefined) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var reg = JEXCEL_INTEGER_REGEX_LONG;
            var col = ("G").concat(parseInt(y) + 1);
            var col1 = ("H").concat(parseInt(y) + 1);
            var value = (this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            var value1 = (this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            if (value == "" && value1 == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(Number(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setComments(col1, "");
                }
            }
            var reg = JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY;
            var col = ("H").concat(parseInt(y) + 1);
            var col1 = ("G").concat(parseInt(y) + 1);
            var value = (this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            var value1 = (this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            if (value == "" && value1 == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(Number(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setComments(col1, "");
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
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList;
                var filteredList = realmCountryPlanningUnitList.filter(c => c.realmCountryPlanningUnitId == value);
                var multiplier = filteredList[0].multiplier;
                this.el.setValueFromCoords(4, y, multiplier);
            }
        }
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 6) {
            var reg = JEXCEL_INTEGER_REGEX_LONG;
            var col = ("G").concat(parseInt(y) + 1);
            var col1 = ("H").concat(parseInt(y) + 1);
            value = (this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            var value1 = (this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            if (value == "" && value1 == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setComments(col1, "");
                }
            }
        }
        if (x == 7) {
            var reg = JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY;
            var col = ("H").concat(parseInt(y) + 1);
            var col1 = ("G").concat(parseInt(y) + 1);
            value = (this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            var value1 = (this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "")).trim();
            if (value == "" && value1 == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setComments(col1, "");
                }
            }
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     */
    loaded() {
        var list = this.state.inventoryList;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var col = ("B").concat(parseInt(y) + 1);
            var value = map.get("1");
            if (value != "" && !isNaN(parseInt(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].dataSourceId).concat(i18n.t('static.message.notExist')));
            }
            var col = ("C").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[2]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].regionId).concat(i18n.t('static.message.notExist')));
            }
            var col = ("D").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[3]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].realmCountryPlanningUnitId).concat(i18n.t('static.message.notExist')));
            }
        }
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    saveInventory() {
        var json = this.el.getJson(null, false);
        this.setState({ loading: true });
        var json = this.el.getJson(null, false);
        var list = this.state.inventoryList;
        var inventoryArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var dataSourceId = map.get("1");
            if (dataSourceId != "" && !isNaN(parseInt(dataSourceId))) {
                dataSourceId = map.get("1");
            } else {
                dataSourceId = list[i].dataSourceId;
            }
            var inventoryJson = {
                planningUnitId: map.get("0"),
                dataSourceId: dataSourceId,
                regionId: map.get("2"),
                inventoryDate: map.get("5"),
                inventory: (this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                manualAdjustment: (this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                notes: map.get("8"),
                realmCountryPlanningUnitId: map.get("3"),
                multiplier: map.get("4")
            }
            inventoryArray.push(inventoryJson);
        }
        return inventoryArray;
    }
    /**
     * Reterives region, realm country planning unit, data source, planning unit, inventory list and builds jexcel table to display consumption data
     */
    componentDidMount() {
        var realmCounryId = document.getElementById("realmCountryId").value;
        RealmCountryService.getRealmCountryPlanningUnitAllByrealmCountryId(realmCounryId).then(response => {
            var realmCountryPlanningUnitList = [];
            this.setState({ realmCountryPlanningUnitList: response.data });
            for (var i = 0; i < response.data.length; i++) {
                var rcpJson = {
                    id: ((response.data)[i]).realmCountryPlanningUnitId,
                    name: ((response.data)[i]).label.label_en
                }
                realmCountryPlanningUnitList.push(rcpJson);
            }
            PipelineService.getQatTempProgramregion(this.props.pipelineId).then(response => {
                var regionList = [];
                for (var i = 0; i < response.data.length; i++) {
                    var regionJson = {
                        id: ((response.data)[i]).regionId,
                        name: ((response.data)[i]).label.label_en
                    }
                    regionList.push(regionJson);
                }
                DataSourceService.getAllDataSourceList().then(response => {
                    var dataSourceList = [];
                    var dataSourceFilterList = response.data.filter(c => c.dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE);
                    for (var j = 0; j < dataSourceFilterList.length; j++) {
                        var dataSourceJson = {
                            id: ((dataSourceFilterList)[j]).dataSourceId,
                            name: ((dataSourceFilterList)[j]).label.label_en
                        }
                        dataSourceList.push(dataSourceJson);
                    }
                    PlanningUnitService.getActivePlanningUnitList()
                        .then(response => {
                            var planningUnitListQat = []
                            for (var k = 0; k < (response.data).length; k++) {
                                var planningUnitJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].planningUnitId
                                }
                                planningUnitListQat.push(planningUnitJson);
                            }
                            PipelineService.getPipelineProgramInventory(this.props.pipelineId).then(response => {
                                var data = [];
                                var inventoryDataArr = [];
                                var inventoryList = response.data;
                                this.setState({ inventoryList: response.data });
                                for (var j = 0; j < inventoryList.length; j++) {
                                    data = [];
                                    data[0] = inventoryList[j].planningUnitId;
                                    data[1] = inventoryList[j].dataSourceId;
                                    if (regionList.length == 1) {
                                        data[2] = regionList[0].id;
                                    } else {
                                        data[2] = inventoryList[j].regionId;
                                    };
                                    data[3] = inventoryList[j].realmCountryPlanningUnitId;
                                    data[4] = inventoryList[j].multiplier
                                    data[5] = inventoryList[j].inventoryDate;
                                    data[6] = inventoryList[j].inventory;
                                    data[7] = inventoryList[j].manualAdjustment;
                                    if (inventoryList[j].notes === null || inventoryList[j].notes === ' NULL') {
                                        data[8] = '';
                                    } else {
                                        data[8] = inventoryList[j].notes;
                                    }
                                    inventoryDataArr.push(data);
                                }
                                this.el = jexcel(document.getElementById("inventorytableDiv"), '');
                                jexcel.destroy(document.getElementById("inventorytableDiv"), true);
                                var json = [];
                                var data = inventoryDataArr;
                                var options = {
                                    data: data,
                                    columnDrag: false,
                                    colWidths: [190, 130, 100, 120, 100, 150, 100, 130, 100],
                                    columns: [
                                        {
                                            title: i18n.t('static.dashboard.product'),
                                            type: 'dropdown',
                                            source: planningUnitListQat,
                                            readOnly: true
                                        },
                                        {
                                            title: i18n.t('static.inventory.dataSource'),
                                            type: 'dropdown',
                                            source: dataSourceList
                                        },
                                        {
                                            title: i18n.t('static.inventory.region'),
                                            type: 'dropdown',
                                            source: regionList
                                        },
                                        {
                                            title: i18n.t('static.planningunit.countrysku'),
                                            type: 'dropdown',
                                            source: realmCountryPlanningUnitList,
                                        },
                                        {
                                            title: i18n.t('static.unit.multiplier'),
                                            type: 'numeric',
                                            mask: '#,##.000000',
                                            decimal: '.',
                                            readOnly: true
                                        },
                                        {
                                            title: i18n.t('static.inventory.inventoryDate'),
                                            type: 'calendar',
                                            format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                                        },
                                        {
                                            title: i18n.t('static.inventory.inventory'),
                                            type: 'numeric',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true,
                                            textEditor: true,
                                            decimal: '.'
                                        },
                                        {
                                            title: i18n.t('static.inventory.manualAdjustment'),
                                            type: 'numeric',
                                            mask: '[-]#,##.00',
                                            disabledMaskOnEdition: true,
                                            decimal: '.',
                                            textEditor: true,
                                        },
                                        {
                                            title: 'Note',
                                            type: 'text'
                                        }
                                    ],
                                    pagination: localStorage.getItem("sesRecordCount"),
                                    filters: true,
                                    contextMenu: function (obj, x, y, e) {
                                        return false;
                                    }.bind(this),
                                    search: true,
                                    columnSorting: true,
                                    wordWrap: true,
                                    allowInsertColumn: false,
                                    allowManualInsertColumn: false,
                                    allowDeleteRow: false,
                                    onchange: this.changed,
                                    copyCompatibility: true,
                                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                                    position: 'top',
                                    editable: true,
                                    onload: this.loadedJexcelCommonFunction,
                                    oneditionend: this.oneditionend,
                                    license: JEXCEL_PRO_KEY,
                                };
                                this.el = jexcel(document.getElementById("inventorytableDiv"), options);
                                this.loaded();
                                this.setState({
                                    loading: false
                                })
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {
                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
                                                break;
                                            case 409:
                                                this.setState({
                                                    message: i18n.t('static.common.accessDenied'),
                                                    loading: false,
                                                    color: "#BA0C2F",
                                                });
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
                        }).catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                        loading: false
                                    });
                                } else {
                                    switch (error.response ? error.response.status : "") {
                                        case 401:
                                            this.props.history.push(`/login/static.message.sessionExpired`)
                                            break;
                                        case 409:
                                            this.setState({
                                                message: i18n.t('static.common.accessDenied'),
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
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
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 409:
                            this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                            });
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
        var rowData = elInstance.getRowData(y);
        if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedJexcelCommonFunction = function (instance, cell) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }
    /**
     * Renders the pipeline program import inventory details screen.
     * @returns {JSX.Element} - Pipeline program import inventory details screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <div className="table-responsive consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                    <div id="inventorytableDiv">
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
            </>
        );
    }
}
