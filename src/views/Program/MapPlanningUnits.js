import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_INTEGER_REGEX, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, SECRET_KEY } from '../../Constants.js';
import CryptoJS from 'crypto-js';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import PlanningUnitService from '../../api/PlanningUnitService';
/**
 * Component for mapping program and planning unit.
 */
export default class MapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: '',
            loading: true,
            productCategoryList: [],
            lang: localStorage.getItem('lang'),
            tempSortOrder: '',
            sortOrderLoading: true,
            dropdownList: []
        }
        this.changed = this.changed.bind(this);
        this.myFunction = this.myFunction.bind(this);
        this.getRealmId = this.getRealmId.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.addRow = this.addRow.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var data = [];
        data[0] = "-1";
        data[1] = "";
        data[2] = "";
        data[3] = 1;
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = MONTHS_IN_FUTURE_FOR_AMC;
        data[8] = MONTHS_IN_PAST_FOR_AMC;
        data[9] = "";
        data[10] = "";
        data[11] = "";
        data[12] = 50;
        data[13] = "";
        data[14] = "";
        data[15] = "";
        data[16] = "";
        data[17] = "";
        data[18] = 0;//new row
        this.el.insertRow(
            data, 0, 1
        );
        var json = this.el.getJson(null, false)
        this.el.getCell(("B").concat(parseInt(0) + 1)).classList.add('typing-' + this.state.lang);
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var reg = /^[0-9\b]+$/;
        var regDec = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("A").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(0, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getRowData(parseInt(y))[1];
            if (value === "") {
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
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (value === "") {
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
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (json[y][3] == 1 && value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (json[y][3] == 2 && value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
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
            value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (json[y][3] == 2 && value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var col = ("H").concat(parseInt(y) + 1);
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (value === "") {
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
            var col = ("I").concat(parseInt(y) + 1);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (value === "") {
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
            var col = ("J").concat(parseInt(y) + 1);
            value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_LEAD_TIME
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
            value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (value === "") {
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
            var col = ("M").concat(parseInt(y) + 1);
            value = this.el.getValue(`M${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            if (value === "") {
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
            var col = ("N").concat(parseInt(y) + 1);
            value = this.el.getValue(`N${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText();
        var rowData = this.el.getRowData(y);
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
        if (x == 1) {
            this.el.getCell(("B").concat(parseInt(y) + 1)).classList.remove('typing-' + this.state.lang);
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var jsonLength = parseInt(json.length) - 1;
                for (var i = jsonLength; i >= 0; i--) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = -1;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
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
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("F").concat(parseInt(y) + 1);
                if (rowData[3] == 1 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("G").concat(parseInt(y) + 1);
                if (rowData[3] == 2 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("K").concat(parseInt(y) + 1);
                if (rowData[3] == 2 && value == "") {
                    this.el.setValueFromCoords(10, y, 0, true);
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
            if (rowData[3] == 2) {
                this.el.setValueFromCoords(5, y, "", true);
                this.el.setValueFromCoords(6, y, rowData[16], true);
                this.el.setValueFromCoords(10, y, rowData[17] != "" ? rowData[17] : 0, true);
            } else {
                this.el.setValueFromCoords(6, y, "", true);
                this.el.setValueFromCoords(10, y, "", true);
                this.el.setValueFromCoords(5, y, rowData[15], true);
            }
        }
        if (x == 4) {
            var reg = JEXCEL_INTEGER_REGEX;
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        if (x == 5) {
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (rowData[3] == 1 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(15, y, value, true);
            }
        }
        if (x == 6) {
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (rowData[3] == 2 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(16, y, value, true);
            }
        }
        if (x == 10) {
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("K").concat(parseInt(y) + 1);
            value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (rowData[3] == 2 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(17, y, value, true);
            }
        }
        if (x == 7) {
            var reg = JEXCEL_INTEGER_REGEX
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
            var reg = JEXCEL_INTEGER_REGEX
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
        if (x == 9) {
            var reg = JEXCEL_DECIMAL_LEAD_TIME
            var col = ("J").concat(parseInt(y) + 1);
            value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("L").concat(parseInt(y) + 1);
            value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        if (x == 12) {
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("M").concat(parseInt(y) + 1);
            value = this.el.getValue(`M${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        if (x == 13) {
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            var col = ("N").concat(parseInt(y) + 1);
            value = this.el.getValue(`N${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
     * Function to filter planning unit based on product category
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    dropdownFilter = function (o, cell, c, r, source, config) {
        var mylist = [];
        return mylist;
    }
    /**
     * Reterives product category list
     */
    getRealmId() {
        var list = [];
        var productCategoryList = [];
        var realmId = this.props.items.program.realm.realmId;
        ProductCategoryServcie.getProductCategoryListByRealmId(this.props.items.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
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
                    productCategoryList.sort((a, b) => {
                        var itemLabelA = a.name.toUpperCase();
                        var itemLabelB = b.name.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({ productCategoryList: listArray });
                    // PlanningUnitService.getActivePlanningUnitList()
                    //     .then(response => {
                    //         if (response.status == 200) {
                    //             var listArray = response.data;
                    //             listArray.sort((a, b) => {
                    //                 var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                    //                 var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                    //                 return itemLabelA > itemLabelB ? 1 : -1;
                    //             });
                    //             this.setState({
                    //                 planningUnitList: listArray
                    //             });
                    //             for (var k = 0; k < (response.data).length; k++) {
                    //                 var planningUnitJson = {
                    //                     name: response.data[k].label.label_en + ' | ' + response.data[k].planningUnitId,
                    //                     id: response.data[k].planningUnitId
                    //                 }
                    //                 list.push(planningUnitJson);
                    //             }
                    //             list.sort((a, b) => {
                    //                 var itemLabelA = a.name.toUpperCase(); 
                    //                 var itemLabelB = b.name.toUpperCase(); 
                    //                 return itemLabelA > itemLabelB ? 1 : -1;
                    //             });
                    // let dropdownList = [];
                    var productDataArr = []
                    data = [];
                    data[0] = "-1";
                    data[1] = "";
                    data[2] = "";
                    data[3] = 1;
                    data[4] = "";
                    data[5] = "";
                    data[6] = "";
                    data[7] = MONTHS_IN_FUTURE_FOR_AMC;
                    data[8] = MONTHS_IN_PAST_FOR_AMC;
                    data[9] = "";
                    data[10] = "";
                    data[11] = "";
                    data[12] = 50;
                    data[13] = "";
                    data[14] = "";
                    data[15] = "";
                    data[16] = "";
                    data[17] = "";
                    data[18] = 0;//new row
                    productDataArr[0] = data;                    
                    this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                    jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
                    var data = productDataArr;
                    var options = {
                        data: data,
                        columnDrag: false,
                        colWidths: [250, 250, 90, 90, 90, 90, 90, 90, 90],
                        columns: [
                            {
                                title: i18n.t('static.product.productcategory'),
                                type: 'dropdown',
                                source: productCategoryList
                            },
                            {
                                title: i18n.t('static.planningunit.planningunit'),
                                type: 'dropdown',
                                source: this.state.dropdownList,
                                options: {
                                    url: `${API_URL}/api/dropdown/planningUnit/autocomplete/filter/productCategory/searchText/language/sortOrder`,
                                    autocomplete: true,
                                    remoteSearch: true,
                                    onbeforesearch: function (instance, request) {
                                        if (this.state.sortOrderLoading == false && instance.search.length > 2) {
                                            request.method = 'GET';
                                            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                            let jwtToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                            request.beforeSend = (httpRequest) => {
                                                httpRequest.setRequestHeader('Authorization', 'Bearer ' + jwtToken);
                                            }
                                            const searchText = instance.search;
                                            const language = this.state.lang;
                                            const sortOrder = this.state.tempSortOrder;
                                            request.url = request.url.replace("searchText/language/sortOrder", `${searchText}/${language}/${sortOrder}`);
                                            return request;
                                        }
                                    }.bind(this),
                                },
                                filter: this.dropdownFilter,
                                width: '150',
                            },
                            {
                                title: i18n.t('static.conversion.ConversionFactorFUPU'),
                                type: 'text',
                                readOnly:true,
                                tooltip: i18n.t("static.tooltip.conversionFactorPU"),
                            },
                            {
                                title: i18n.t('static.programPU.planBasedOn'),
                                type: 'dropdown',
                                source: [{ id: 1, name: i18n.t('static.report.mos') }, { id: 2, name: i18n.t('static.report.qty') }],
                                tooltip: i18n.t("static.programPU.planByTooltip")
                            },
                            {
                                title: i18n.t('static.report.reorderFrequencyInMonths'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.reorderFrequencyTooltip"),
                                width: 120
                            },
                            {
                                title: i18n.t('static.supplyPlan.minMonthsOfStock'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.minMonthsOfStockTooltip")
                            },
                            {
                                title: i18n.t('static.product.minQuantity'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.minQtyTooltip")
                            },
                            {
                                title: i18n.t('static.program.monthfutureamc'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.monthsInFutureTooltip")
                            },
                            {
                                title: i18n.t('static.program.monthpastamc'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.monthsInPastTooltip")
                            },
                            {
                                title: i18n.t('static.report.procurmentAgentLeadTimeReport'),
                                type: 'numeric',
                                textEditor: true,
                                decimal: '.',
                                mask: '#,##.00',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.localProcurementAgentTooltip"),
                                width: 130
                            },
                            {
                                title: i18n.t('static.product.distributionLeadTime'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.distributionLeadTimeTooltip")
                            },
                            {
                                title: i18n.t('static.supplyPlan.shelfLife'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.shelfLifeTooltip"),
                                width: 120
                            },
                            {
                                title: i18n.t('static.pu.forecastErrorThresholdPercentage'),
                                type: 'numeric',
                                textEditor: true,
                                mask: '#,##',
                                disabledMaskOnEdition: true,
                                width: 140,
                                required: true,
                                number: true,
                                regex: {
                                    ex: JEXCEL_INTEGER_REGEX,
                                    text: i18n.t('static.message.invalidnumber')
                                },
                                tooltip:i18n.t("static.programPlanningUnit.forecastErrorTooltip")
                            },
                            {
                                title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                type: 'numeric',
                                textEditor: true,
                                decimal: '.',
                                mask: '#,##.00',
                                disabledMaskOnEdition: true,
                                tooltip: i18n.t("static.programPU.catalogPriceTooltip"),
                                width: 120
                            },
                            {
                                title: 'Notes',
                                type: 'text',
                                width: 200,
                                tooltip: i18n.t("static.pu.puNotesTooltip")
                            },
                            {
                                title: 'Min Mos',
                                type: 'hidden'
                            },
                            {
                                title: 'Min Qty',
                                type: 'hidden'
                            },
                            {
                                title: 'Lead Distribution Time',
                                type: 'hidden'
                            },
                            {
                                title: 'New Row Added Index',
                                type: 'hidden'
                            }
                        ],
                        updateTable: function (el, cell, x, y, source, value, id) {
                            var elInstance = el;
                            var rowData = elInstance.getRowData(y);
                            if (rowData[3] == 1) {
                                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                                cell1.classList.add('readonly');
                                var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                                cell1.classList.add('readonly');
                                var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                                cell1.classList.remove('readonly');
                            } else {
                                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                                cell1.classList.remove('readonly');
                                var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                                cell1.classList.remove('readonly');
                                var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                                cell1.classList.add('readonly');
                            }
                        },
                        oneditionstart: function (instance, cell, x, y, value) {
                            this.setState({ sortOrderLoading: true })
                            let tempId = data[y][0]
                            let sortOrder;
                            if (tempId == -1 || tempId == 0) {
                                sortOrder = "00"
                            } else {
                                sortOrder = this.state.productCategoryList.filter(item => item.payload.productCategoryId == tempId)[0].sortOrder
                            }
                            this.setState({ tempSortOrder: sortOrder }, () => {
                                this.setState({ sortOrderLoading: false })
                            })
                        }.bind(this),
                        pagination: false,
                        search: true,
                        columnSorting: true,
                        wordWrap: true,
                        parseFormulas: true,
                        filters: true,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: true,
                        onchange: this.changed,
                        copyCompatibility: true,
                        allowManualInsertRow: false,
                        editable: true,
                        onpaste: this.onPaste,
                        onload: this.loaded,
                        oneditionend: this.oneditionend,
                        license: JEXCEL_PRO_KEY,
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            if (y == null) {
                                if (obj.options.allowInsertColumn == true) {
                                    items.push({
                                        title: obj.options.text.insertANewColumnBefore,
                                        onclick: function () {
                                            obj.insertColumn(1, parseInt(x), 1);
                                        }
                                    });
                                }
                                if (obj.options.allowInsertColumn == true) {
                                    items.push({
                                        title: obj.options.text.insertANewColumnAfter,
                                        onclick: function () {
                                            obj.insertColumn(1, parseInt(x), 0);
                                        }
                                    });
                                }
                                if (obj.options.columnSorting == true) {
                                    items.push({ type: 'line' });
                                    items.push({
                                        title: obj.options.text.orderAscending,
                                        onclick: function () {
                                            obj.orderBy(x, 0);
                                        }
                                    });
                                    items.push({
                                        title: obj.options.text.orderDescending,
                                        onclick: function () {
                                            obj.orderBy(x, 1);
                                        }
                                    });
                                }
                            } else {
                                if (obj.options.allowInsertRow == true) {
                                    items.push({
                                        title: i18n.t('static.common.insertNewRowBefore'),
                                        onclick: function () {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = "";
                                            data[2] = "";
                                            data[3] = 1;
                                            data[4] = "";
                                            data[5] = "";
                                            data[6] = "";
                                            data[7] = "";
                                            data[8] = "";
                                            data[9] = "";
                                            data[10] = "";
                                            data[11] = "";
                                            data[12] = 50;
                                            data[13] = "";
                                            data[14] = "";
                                            data[15] = "";
                                            data[16] = "";
                                            data[17] = "";
                                            data[18] = 0;//new row
                                            obj.insertRow(data, parseInt(y), 1);
                                            obj.getCell(("B").concat(parseInt(y) + 1)).classList.add('typing-' + this.state.lang);
                                        }.bind(this)
                                    });
                                }
                                if (obj.options.allowInsertRow == true) {
                                    items.push({
                                        title: i18n.t('static.common.insertNewRowAfter'),
                                        onclick: function () {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = "";
                                            data[2] = "";
                                            data[3] = 1;
                                            data[4] = "";
                                            data[5] = "";
                                            data[6] = "";
                                            data[7] = "";
                                            data[8] = "";
                                            data[9] = "";
                                            data[10] = "";
                                            data[11] = "";
                                            data[12] = 50;
                                            data[13] = "";
                                            data[14] = "";
                                            data[15] = "";
                                            data[16] = "";
                                            data[17] = "";
                                            data[18] = 0;//new row
                                            obj.insertRow(data, parseInt(y));
                                            obj.getCell(("B").concat(parseInt(y) + 2)).classList.add('typing-' + this.state.lang);
                                        }.bind(this)
                                    });
                                }
                                if (obj.options.allowDeleteRow == true) {
                                    items.push({
                                        title: i18n.t("static.common.deleterow"),
                                        onclick: function () {
                                            obj.deleteRow(parseInt(y));
                                        }
                                    });
                                }
                                if (x) {
                                    if (obj.options.allowComments == true) {
                                        items.push({ type: 'line' });
                                    }
                                }
                            }
                            items.push({ type: 'line' });
                            return items;
                        }.bind(this)
                    };
                    var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                    this.el = elVar;
                    this.el.getCell(("B").concat(parseInt(0) + 1)).classList.add('typing-' + this.state.lang);
                    this.setState({ mapPlanningUnitEl: elVar, loading: false });
                    // } else {
                    // list = [];
                    // }
                    // }).catch(
                    //     error => {
                    //         if (error.message === "Network Error") {
                    //             this.setState({
                    //                 message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                    //                 loading: false
                    //             });
                    //         } else {
                    //             switch (error.response ? error.response.status : "") {
                    //                 case 401:
                    //                     this.props.history.push(`/login/static.message.sessionExpired`)
                    //                     break;
                    //                 case 409:
                                //     this.setState({
                                //         message: i18n.t('static.common.accessDenied'),
                                //         loading: false,
                                //         color: "#BA0C2F",
                                //     });
                                //     break;
				                // case 403:
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
                } else {
                    productCategoryList = []
                    this.setState({
                        message: response.data.messageCode, loading: false
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
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        } else if (x == 9 && !isNaN(rowData[9]) && rowData[9].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(9, y, parseFloat(rowData[9]), true);
        } else if (x == 11 && !isNaN(rowData[11]) && rowData[11].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(11, y, parseFloat(rowData[11]), true);
        } else if (x == 13 && !isNaN(rowData[13]) && rowData[13].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(13, y, parseFloat(rowData[13]), true);
        }else if(x == 1){
            PlanningUnitService.getPlanningUnitById(rowData[1]).then(response => {
                if (response.status == 200) {
                    elInstance.setValueFromCoords(2, y, (response.data.multiplier).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), true);
                }
            })
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[9].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[10].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[14].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[12].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[13].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[15].classList.add('InfoTr');
        tr.children[4].classList.add('InfoTrAsteriskTheadtrTdImage');
        var cell1 = instance.worksheets[0].getCell(`G1`)
        cell1.classList.add('readonly');
        var cell1 = instance.worksheets[0].getCell(`K1`)
        cell1.classList.add('readonly');
        jExcelLoadedFunctionWithoutPagination(instance);
    }
    /**
     * Function to handle paste events in the jexcel table.
     * @param {Object} instance - The jexcel instance.
     * @param {Array} data - The data being pasted.
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {            
            if (data[i].x == 0) {
                // var index = (instance).getValue(`Q${parseInt(data[i].y) + 1}`, true);
                // if (index == 0) {
                    (instance).setValueFromCoords(0, data[i].y, data[i].value, true);
                // }
            }
            if (data[i].x == 1) {
                var index = (instance).getValue(`S${parseInt(data[i].y) + 1}`, true);
                if (index == 0) {
                    let temp = data[i].value.split(" | ");
                    let temp_obj = {
                        id: parseInt(temp[1]),
                        name: data[i].value
                    };
                    let temp_list = this.state.dropdownList;
                    let index = temp_list.findIndex(c => c.id == temp_obj.id);

                    if(index == -1) {
                        //if new planning unit push to list
                        temp_list.push(temp_obj);
                    } 

                    // temp_list[data[i].y] = temp_obj;
                    this.setState(
                        {
                            dropdownList: temp_list
                        }, () => {
                            (instance).setValueFromCoords(1, data[i].y, data[i].value, true);
                        }
                    )
                }
            }
        }
    }
    /**
     * Builds planning unit data
     * @returns Planning Unit List JSON for saving the data on server
     */
    myFunction() {
        var json = this.el.getJson(null, false);
        var planningUnitArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var planningUnitJson = {
                program: {
                    id: 0
                },
                planningUnit: {
                    id: map.get("1"),
                },
                reorderFrequencyInMonths: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                minMonthsOfStock: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                monthsInFutureForAmc: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                monthsInPastForAmc: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                localProcurementLeadTime: this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                shelfLife: this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                catalogPrice: this.el.getValue(`N${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                active: true,
                programPlanningUnitId: 0,
                minQty: this.el.getValue(`Q${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                distributionLeadTime: this.el.getValue(`R${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                planBasedOn: map.get("3"),
                forecastErrorThreshold : this.el.getValue(`M${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                notes : map.get("14")
            }
            planningUnitArray.push(planningUnitJson);
        }
        return planningUnitArray;
    }
    /**
     * Renders the mapping of program planning unit list.
     * @returns {JSX.Element} - Mapping of program planning unit list.
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
                <div className="" style={{ display: this.state.loading ? "none" : "block" }} >
                    <div id="mapPlanningUnit" className="RowheightForjexceladdRow consumptionDataEntryTable">
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
            </>
        );
    }
}