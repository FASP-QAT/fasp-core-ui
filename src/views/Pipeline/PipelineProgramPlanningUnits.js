import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_INTEGER_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PIPELINE_CONVERSION_FACTOR, JEXCEL_PRO_KEY } from '../../Constants.js';
import PipelineService from '../../api/PipelineService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Component for pipeline program import planning unit details
 */
export default class PipelineProgramPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: '',
            loading: true,
            productCategoryList: []
        }
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.savePlanningUnits = this.savePlanningUnits.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
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
     * Function to filter planning unit based on product category
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    dropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (this.state.mapPlanningUnitEl.getJson(null, false)[r])[c - 1];
        var puList = []
        if (value != -1) {
            var pc = this.state.productCategoryList.filter(c => c.payload.productCategoryId == value)[0]
            var pcList = this.state.productCategoryList.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            puList = (this.state.activePlanningUnitList).filter(c => pcIdArray.includes(c.forecastingUnit.productCategory.id) && c.active.toString() == "true");
        } else {
            puList = this.state.activePlanningUnitList
        }
        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en,
                id: puList[k].planningUnitId
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     */
    loaded() {
        var list = this.state.planningUnitList;
        var json = this.el.getJson(null, false);
        var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[3]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].pipelineProductName).concat(i18n.t('static.message.notExist')));
            }
            var col = ("K").concat(parseInt(y) + 1);
            var value = (this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            var col = ("M").concat(parseInt(y) + 1);
            var value = this.el.getValue(`M${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value))) {
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
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
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
            var json = this.el.getJson(null, false);
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("3");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = json.length;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        if (x == 4) {
            var reg = JEXCEL_PIPELINE_CONVERSION_FACTOR;
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (value == 0 || isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 5) {
            var reg = /^[0-9\b]+$/;
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 6) {
            var reg = /^[0-9\b]+$/;
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
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
            var reg = /^[0-9\b]+$/;
            var col = ("H").concat(parseInt(y) + 1);
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 8) {
            var reg = /^[0-9\b]+$/;
            var col = ("I").concat(parseInt(y) + 1);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 10) {
            var reg = JEXCEL_DECIMAL_LEAD_TIME;
            var col = ("K").concat(parseInt(y) + 1);
            value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 11) {
            var reg = JEXCEL_INTEGER_REGEX;
            var col = ("L").concat(parseInt(y) + 1);
            value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value)) || value > 31 || value == 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    if (value > 31) {
                        this.el.setComments(col, i18n.t('static.pipeline.shelfLifeValidation'));
                    } else {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 12) {
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            var col = ("M").concat(parseInt(y) + 1);
            value = this.el.getValue(`M${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value))) {
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
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var reg = /^[0-9\b]+$/;
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValue(`D${parseInt(y) + 1}`, true);
            var currentPlanningUnit = this.el.getRowData(y)[1];
            if (value == "" || value == undefined) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("3");
                    if (planningUnitValue == currentPlanningUnit && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = json.length;
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_PIPELINE_CONVERSION_FACTOR;
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (value == 0 || isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var reg = /^[0-9\b]+$/;
            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var reg = /^[0-9\b]+$/;
            var col = ("G").concat(parseInt(y) + 1);
            var value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var reg = /^[0-9\b]+$/;
            var col = ("H").concat(parseInt(y) + 1);
            var value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var reg = /^[0-9\b]+$/;
            var col = ("I").concat(parseInt(y) + 1);
            var value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var col = ("K").concat(parseInt(y) + 1);
            var value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_LEAD_TIME;
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var col = ("L").concat(parseInt(y) + 1);
            var value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX;
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value)) || value > 31 || value == 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    if (value > 31) {
                        this.el.setComments(col, i18n.t('static.pipeline.shelfLifeValidation'));
                    } else {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    }
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var col = ("M").concat(parseInt(y) + 1);
            var value = this.el.getValue(`M${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    savePlanningUnits() {
        var list = this.state.planningUnitList;
        var json = this.el.getJson(null, false);
        var planningUnitArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var planningUnitId = map.get("3");
            if (planningUnitId != "" && !isNaN(parseInt(planningUnitId))) {
                planningUnitId = map.get("3");
            } else {
                planningUnitId = list[i].planningUnitId;
            }
            var planningUnitJson = {
                active: map.get("13"),
                program: {
                    id: 0
                },
                planningUnitId: planningUnitId,
                multiplier: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                reorderFrequencyInMonths: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                minMonthsOfStock: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                monthsInFutureForAmc: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                monthsInPastForAmc: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                programPlanningUnitId: map.get("9"),
                localProcurmentLeadTime: this.el.getValue(`K${parseInt(i) + 1}`, true).toString().replaceAll(",", "") == '' ? null : this.el.getValue(`K${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                shelfLife: this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                catalogPrice: this.el.getValue(`M${parseInt(i) + 1}`, true).toString().replaceAll(",", "") == '' ? null : this.el.getValue(`M${parseInt(i) + 1}`, true).toString().replaceAll(",", "")
            }
            planningUnitArray.push(planningUnitJson);
        }
        return planningUnitArray;
    }
    /**
     * Reterives product category list on component mount
     */
    componentDidMount() {
        var productCategoryList = [];
        ProductCategoryServcie.getProductCategoryListByRealmId(1)
            .then(response => {
                for (var k = 0; k < (response.data).length; k++) {
                    var spaceCount = response.data[k].sortOrder.split(".").length;
                    var indendent = "";
                    for (var p = 1; p <= spaceCount - 1; p++) {
                        if (p == 1) {
                            indendent = indendent.concat("|_");
                        } else {
                            indendent = indendent.concat("_");
                        }
                    }
                    var productCategoryJson = {};
                    if (response.data[k].payload.productCategoryId == 0) {
                        productCategoryJson = {
                            name: (response.data[k].payload.label.label_en),
                            id: -1
                        }
                    } else {
                        productCategoryJson = {
                            name: (response.data[k].payload.label.label_en),
                            id: response.data[k].payload.productCategoryId
                        }
                    }
                    productCategoryList.push(productCategoryJson);
                }
                this.setState({ productCategoryList: response.data });
                var planningUnitListQat = [];
                PlanningUnitService.getActivePlanningUnitList()
                    .then(response => {
                        if (response.status == 200) {
                            this.setState({ activePlanningUnitList: response.data });
                            for (var k = 0; k < (response.data).length; k++) {
                                var planningUnitJson = {
                                    name: response.data[k].label.label_en + ' ~ ' + response.data[k].planningUnitId,
                                    id: response.data[k].planningUnitId
                                }
                                planningUnitListQat.push(planningUnitJson);
                            }
                            this.setState({ planningUnitListQat: planningUnitListQat });
                            PipelineService.getQatTempPlanningUnitList(this.props.pipelineId)
                                .then(response => {
                                    if (response.status == 200) {
                                        if (response.data.length > 0) {
                                            var planningUnitList = response.data;
                                            var data = [];
                                            var productDataArr = []
                                            this.setState({ planningUnitList: planningUnitList });
                                            if (planningUnitList.length != 0) {
                                                for (var j = 0; j < planningUnitList.length; j++) {
                                                    data = [];
                                                    data[0] = planningUnitList[j].pipelineProductCategoryName;
                                                    data[1] = planningUnitList[j].pipelineProductName;
                                                    if (planningUnitList[j].productCategoryId == 0) {
                                                        data[2] = -1;
                                                    } else {
                                                        data[2] = planningUnitList[j].productCategoryId;
                                                    }
                                                    data[3] = planningUnitList[j].planningUnitId;
                                                    data[4] = planningUnitList[j].multiplier
                                                    data[5] = planningUnitList[j].reorderFrequencyInMonths;
                                                    data[6] = planningUnitList[j].minMonthsOfStock;
                                                    if (planningUnitList[j].monthsInFutureForAmc == 0) {
                                                        data[7] = this.props.items.program.monthsInFutureForAmc;
                                                    } else {
                                                        data[7] = planningUnitList[j].monthsInFutureForAmc;
                                                    }
                                                    if (planningUnitList[j].monthsInPastForAmc == 0) {
                                                        data[8] = this.props.items.program.monthsInPastForAmc;
                                                    } else {
                                                        data[8] = planningUnitList[j].monthsInPastForAmc;
                                                    }
                                                    data[9] = planningUnitList[j].programPlanningUnitId
                                                    data[10] = planningUnitList[j].localProcurmentLeadTime == -1 ? '' : planningUnitList[j].localProcurmentLeadTime
                                                    if (planningUnitList[j].shelfLife == 0) {
                                                        data[11] = this.props.items.program.shelfLife;
                                                    } else {
                                                        data[11] = planningUnitList[j].shelfLife
                                                    }
                                                    data[12] = planningUnitList[j].catalogPrice == -1 ? '' : planningUnitList[j].catalogPrice
                                                    data[13] = planningUnitList[j].active
                                                    productDataArr.push(data);
                                                }
                                            } else {
                                            }
                                            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
                                            var json = [];
                                            var data = productDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: false,
                                                colWidths: [160, 190, 190, 190, 80, 80, 80, 80, 80, 80, 120, 120, 80, 80],
                                                columns: [
                                                    {
                                                        title: i18n.t('static.pipeline.pplnproductcategory'),
                                                        type: 'text',
                                                        readOnly: true
                                                    }, {
                                                        title: i18n.t('static.pipeline.pplnproduct'),
                                                        type: 'text',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.product.productcategory'),
                                                        type: 'dropdown',
                                                        source: productCategoryList,
                                                    },
                                                    {
                                                        title: i18n.t('static.planningunit.planningunit'),
                                                        type: 'autocomplete',
                                                        source: planningUnitListQat,
                                                        filter: this.dropdownFilter
                                                    },
                                                    {
                                                        title: i18n.t('static.pipeline.productToPlanningUnit'),
                                                        type: 'numeric', mask: '#,##.000000', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.program.reorderFrequencyInMonths'),
                                                        type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.supplyPlan.minStockMos'),
                                                        type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.report.mosfuture'),
                                                        type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.report.mospast'),
                                                        type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.report.id'),
                                                        type: 'hidden'
                                                        // title: 'A',
                                                        // type: 'text',
                                                        // visible: false
                                                    },
                                                    {
                                                        title: i18n.t('static.pipeline.localprocurementleadtime'),
                                                        type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.report.shelfLife'),
                                                        type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                                        type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.'
                                                    },
                                                    {
                                                        title: i18n.t('static.common.status'),
                                                        type: 'dropdown',
                                                        source: [{ id: true, name: i18n.t('static.common.active') }, { id: false, name: i18n.t('static.dataentry.inactive') }]
                                                    }
                                                ],
                                                editable: false,
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                filters: true,
                                                contextMenu: function (obj, x, y, e) {
                                                    return false;
                                                }.bind(this),
                                                search: true,
                                                columnSorting: true,
                                                wordWrap: true,
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onchange: this.changed,
                                                copyCompatibility: true,
                                                allowInsertRow: false,
                                                onload: this.loadedJexcelCommonFunction,
                                                oneditionend: this.oneditionend,
                                                license: JEXCEL_PRO_KEY, allowRenameColumn: false,
                                            };
                                            var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                            this.el = elVar;
                                            this.loaded();
                                            this.setState({
                                                mapPlanningUnitEl: elVar,
                                                loading: false
                                            })
                                        }
                                    } else {
                                        this.setState({ message: response.data.messageCode, loading: false })
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
                        } else {
                            this.setState({ message: response.data.messageCode, loading: false })
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
        } else if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        } else if (x == 10 && !isNaN(rowData[10]) && rowData[10].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(10, y, parseFloat(rowData[10]), true);
        } else if (x == 11 && !isNaN(rowData[11]) && rowData[11].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(11, y, parseFloat(rowData[11]), true);
        } else if (x == 12 && !isNaN(rowData[12]) && rowData[12].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(12, y, parseFloat(rowData[12]), true);
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedJexcelCommonFunction = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }
    /**
     * Renders the pipeline program import planning unit details screen.
     * @returns {JSX.Element} - Pipeline program import planning unit details screen.
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
                <div className="table-responsive consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }} >
                    <div id="mapPlanningUnit">
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
