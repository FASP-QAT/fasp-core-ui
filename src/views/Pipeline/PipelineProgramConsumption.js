import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from 'moment';
import React, { Component } from 'react';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { checkValidtion, inValid, jExcelLoadedFunctionPipeline, positiveValidation } from '../../CommonComponent/JExcelCommonFunctions';
import { ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, API_URL, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, JEXCEL_INTEGER_REGEX_LONG, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PRO_KEY } from '../../Constants';
import { JEXCEL_INTEGER_REGEX, JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import DataSourceService from '../../api/DataSourceService.js';
import PipelineService from '../../api/PipelineService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import RealmCountryService from '../../api/RealmCountryService';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Component for pipeline program import consumption details
 */
export default class PipelineProgramConsumption extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            abc: true
        }
        this.startLoading = this.startLoading.bind(this);
        this.stopLoading = this.stopLoading.bind(this);
        this.loaded = this.loaded.bind(this);
        this.saveConsumption = this.saveConsumption.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    /**
     * Sets loading to true
     */
    startLoading() {
        this.setState({ abc: true, loading: true });
    }
    /**
     * Sets loading to false
     */
    stopLoading() {
        this.setState({ abc: false, loading: false });
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
            var value = (this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            if (value == "") {
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
                }
            }
            var value = (this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            var validation = checkValidtion("numberNotRequired", "H", y, value, this.el, JEXCEL_INTEGER_REGEX, 1, 1);
            if (validation == true) {
                if (parseInt(value) > 31) {
                    inValid("H", y, i18n.t('static.supplyPlan.daysOfStockMaxValue'), this.el);
                    valid = false;
                } else {
                    positiveValidation("H", y, this.el);
                }
            } else {
                valid = false;
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
            var json = this.el.getJson(null, false);
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
            value = (this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            if (value == "") {
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
                }
            }
        }
        if (x == 7) {
            value = (this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            var valid = checkValidtion("numberNotRequired", "H", y, value, this.el, JEXCEL_INTEGER_REGEX, 1, 1);
            if (valid == true) {
                if (parseInt(value) > 31) {
                    inValid("H", y, i18n.t('static.supplyPlan.daysOfStockMaxValue'), this.el);
                } else {
                    positiveValidation("H", y, this.el);
                }
            }
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     */
    loaded() {
        var list = this.state.consumptionList;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = (this.el.getRowData(y)[1]).toString();
            var col = ("B").concat(parseInt(y) + 1);
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].dataSourceId).concat(i18n.t('static.message.notExist')));
            }
            var map = new Map(Object.entries(json[y]));
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
            var value = (this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            var col = ("G").concat(parseInt(y) + 1);
            var reg = JEXCEL_INTEGER_REGEX_LONG;
            if (value == "") {
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
                }
            }
        }
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    saveConsumption() {
        var json = this.el.getJson(null, false);
        this.setState({ abc: true });
        var json = this.el.getJson(null, false);
        var list = this.state.consumptionList;
        var consumptionArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var dataSourceId = map.get("1");
            if (dataSourceId != "" && !isNaN(parseInt(dataSourceId))) {
                dataSourceId = map.get("1");
            } else {
                dataSourceId = list[map.get("1")].dataSourceId;
            }
            var consumptionJson = {
                regionId: map.get("2"),
                planningUnitId: map.get("0"),
                consumptionDate: map.get("5"),
                actualFlag: map.get("9"),
                consumptionQty: (this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                dayOfStockOut: (this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                dataSourceId: dataSourceId,
                notes: map.get("8"),
                realmCountryPlanningUnitId: map.get("3"),
                multiplier: map.get("4")
            }
            consumptionArray.push(consumptionJson);
        }
        return consumptionArray;
    }
    /**
     * Reterives region, realm country planning unit, data source, planning unit, consumptions list and builds jexcel table to display consumption data
     */
    componentDidMount() {
        PipelineService.getQatTempProgramregion(this.props.pipelineId).then(response => {
            var regionList = [];
            var dataSourceList = [];
            var planningUnitListQat = []
            for (var i = 0; i < response.data.length; i++) {
                var regionJson = {
                    id: ((response.data)[i]).regionId,
                    name: ((response.data)[i]).label.label_en
                }
                regionList.push(regionJson);
            }
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
                DataSourceService.getAllDataSourceList().then(response => {
                    var dataSourceFilterList = response.data.filter(c => c.dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || c.dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE);
                    for (var j = 0; j < dataSourceFilterList.length; j++) {
                        var dataSourceJson = {
                            id: ((dataSourceFilterList)[j]).dataSourceId,
                            name: ((dataSourceFilterList)[j]).label.label_en
                        }
                        dataSourceList.push(dataSourceJson);
                    }
                    PlanningUnitService.getActivePlanningUnitList()
                        .then(response => {
                            for (var k = 0; k < (response.data).length; k++) {
                                var planningUnitJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].planningUnitId
                                }
                                planningUnitListQat.push(planningUnitJson);
                            }
                            PipelineService.getQatTempConsumptionById(this.props.pipelineId).then(response => {
                                if (response.status == 200) {
                                    var consumptionDataArr = [];
                                    var consumptionList = response.data;
                                    this.setState({ consumptionList: consumptionList });
                                    for (var j = 0; j < consumptionList.length; j++) {
                                        for (var cm = 0; cm < consumptionList[j].consNumMonth; cm++) {
                                            var data = [];
                                            data[5] = moment(consumptionList[j].consumptionDate).add(cm, 'months').format("YYYY-MM-DD");
                                            if (regionList.length == 1) {
                                                data[2] = regionList[0].id;
                                            } else {
                                                data[2] = consumptionList[j].regionId;
                                            };
                                            data[6] = Math.round((cm == 0 || cm != consumptionList[j].consNumMonth - 1) ? Math.floor(consumptionList[j].consumptionQty / consumptionList[j].consNumMonth) : Math.floor(consumptionList[j].consumptionQty / consumptionList[j].consNumMonth) + (consumptionList[j].consumptionQty - ((Math.floor(consumptionList[j].consumptionQty / consumptionList[j].consNumMonth)) * consumptionList[j].consNumMonth)));
                                            data[7] = consumptionList[j].dayOfStockOut;
                                            data[1] = consumptionList[j].dataSourceId;
                                            data[3] = consumptionList[j].realmCountryPlanningUnitId;
                                            data[4] = consumptionList[j].multiplier
                                            if (consumptionList[j].notes === null || consumptionList[j].notes === ' NULL') {
                                                data[8] = '';
                                            } else {
                                                data[8] = consumptionList[j].notes;
                                            }
                                            data[9] = consumptionList[j].actualFlag;
                                            data[0] = consumptionList[j].planningUnitId;
                                            data[10] = j;
                                            consumptionDataArr.push(data);
                                        }
                                    }
                                    this.el = jexcel(document.getElementById("consumptiontableDiv"), '');
                                    jexcel.destroy(document.getElementById("consumptiontableDiv"), true);
                                    var data = consumptionDataArr;
                                    var options = {
                                        data: data,
                                        columnDrag: false,
                                        colWidths: [150, 150, 150, 150, 90, 90, 90, 90, 150, 90],
                                        columns: [
                                            {
                                                title: i18n.t('static.planningunit.planningunit'),
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
                                            }, {
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
                                                title: i18n.t('static.pipeline.consumptionDate'),
                                                type: 'calendar',
                                                options: {
                                                    format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                                                }
                                            },
                                            {
                                                title: i18n.t('static.consumption.consumptionqty'),
                                                type: 'numeric',
                                                mask: '#,##.00',
                                                disabledMaskOnEdition: true,
                                                decimal: '.',
                                                textEditor: true
                                            },
                                            {
                                                title: i18n.t('static.consumption.daysofstockout'),
                                                type: 'numeric',
                                                disabledMaskOnEdition: true,
                                                mask: '#,##.00',
                                                decimal: '.',
                                                textEditor: true
                                            },
                                            {
                                                title: i18n.t('static.program.notes'),
                                                type: 'text'
                                            },
                                            {
                                                title: i18n.t('static.consumption.consumptionType'),
                                                type: 'dropdown',
                                                source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }]
                                            },
                                            { title: 'Index', type: 'hidden' },
                                        ],
                                        pagination: localStorage.getItem("sesRecordCount"),
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
                                        allowInsertRow: false,
                                        copyCompatibility: true,
                                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                                        position: 'top',
                                        license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
                                        filters: true,
                                        editable: true,
                                        onload: this.loadedJexcelCommonFunctionTwo,
                                        oneditionend: this.oneditionend,
                                    };
                                    this.el = jexcel(document.getElementById("consumptiontableDiv"), options);
                                    this.loaded();
                                    this.setState({
                                        loading: false,
                                        abc: false
                                    })
                                }
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedJexcelCommonFunctionTwo = function (instance, cell) {
        jExcelLoadedFunctionPipeline(instance, 0);
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
     * Renders the pipeline program import consumption details screen.
     * @returns {JSX.Element} - Pipeline program import consumption details screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive consumptionDataEntryTable" style={{ display: this.state.abc ? "none" : "block" }}>
                    <div id="consumptiontableDiv">
                    </div>
                </div>
                <div style={{ display: this.state.abc ? "block" : "none" }}>
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
