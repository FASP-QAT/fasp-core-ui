import moment from 'moment';
import i18n from '../../src/i18n';
import { MAX_DATE_RESTRICTION_IN_DATA_ENTRY, MIN_DATE_RESTRICTION_IN_DATA_ENTRY } from '../Constants';
/**
 * This function is used to format the jexcel table
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunction(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.worksheets[0];
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jss_pagination')[number];
    pagignation.classList.add('row');
    // console.log("pagignation", pagignation.firstChild.innerHTML)
    // pagignation.firstChild.innerHTML = i18n.t('static.common.result', { from:1, size:20 });
    var searchContainer = document.getElementsByClassName('jss_search_container')[number];
    var searchDiv = (document.getElementsByClassName('jss_search_container')[number]).childNodes[1];
    try {
        searchDiv.removeChild(((document.getElementsByClassName('jss_search_container')[number]).childNodes[1]).childNodes[0]);
    } catch (error) { }
    document.getElementsByClassName("jss_search")[number].placeholder = i18n.t('static.jexcel.search');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');
    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jss_search")[number].value = "";
        elInstance.search('')
    };
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);
    var jexcel_pagination = document.getElementsByClassName('jss_pagination')[number];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jss_pagination_dropdown')[number];
    pageSelect.options[3].innerHTML = "All";
    pageSelect.addEventListener("change", () => paginationChange(number));
    var jexcel_filterFirstdiv = document.getElementsByClassName('jss_search_container')[number];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);
    var jexcel_filterFirstdiv1 = document.getElementsByClassName('jss_table_container')[0];
    jexcel_filterFirstdiv1.firstChild.nextSibling.classList.remove('jss_scrollX')
}
/**
 * This function is used to format the jexcel table for erp linking screens
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunctionForErp(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.worksheets[0];
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jss_pagination')[2];
    pagignation.classList.add('row');
    var searchContainer = document.getElementsByClassName('jss_search_container')[2];
    var searchDiv = (document.getElementsByClassName('jss_search_container')[2]).childNodes[1];
    try {
        searchDiv.removeChild(((document.getElementsByClassName('jss_search_container')[2]).childNodes[1]).childNodes[0]);
    } catch (error) { }
    document.getElementsByClassName("jss_search")[number].placeholder = i18n.t('static.jexcel.search');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');
    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jss_search")[2].value = "";
        elInstance.search('')
    };
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);
    var jexcel_pagination = document.getElementsByClassName('jss_pagination')[2];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jss_pagination_dropdown')[1];
    pageSelect.options[3].innerHTML = "All";
    pageSelect.addEventListener("change", () => paginationChange(2));
    var jexcel_filterFirstdiv = document.getElementsByClassName('jss_search_container')[2];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);
    var jexcel_filterFirstdiv1 = document.getElementsByClassName('jss_table_container')[0];
    jexcel_filterFirstdiv1.firstChild.nextSibling.classList.remove('jss_scrollX')
}
/**
 * This function is used to format the jexcel table when search option is not there
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunctionWithoutSearch(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jexcel_pagination')[number];
    pagignation.classList.add('row');
    var jexcel_pagination = document.getElementsByClassName('jexcel_pagination')[number];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jexcel_pagination_dropdown')[number];
    pageSelect.options[3].innerHTML = "All";
    pageSelect.addEventListener("change", () => paginationChange(number));
    var jexcel_filterFirstdiv = document.getElementsByClassName('jexcel_filter')[number];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);
}
/**
 * This function is called when pagination dropdown to show show number of records in one page is changed for jspreadsheet
 * @param {*} number This is the value that is selected by the user from the dropdown
 */
export function paginationChange(number) {
    var recordCount = document.getElementsByClassName('jss_pagination_dropdown')[number].value;
    localStorage.setItem("sesRecordCount", recordCount)
}
/**
 * This function is called when pagination dropdown to show show number of records in one page is changed for jexcel
 * @param {*} number This is the value that is selected by the user from the dropdown
 */
export function paginationChange1(number) {
    var recordCount = document.getElementsByClassName('jexcel_pagination_dropdown')[number].value;
    localStorage.setItem("sesRecordCount", recordCount)
}
/**
 * This function is used to format the jexcel table for pipeline screens
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunctionPipeline(instance, number) {
    var obj = {};
    obj.options = {};
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jexcel_pagination')[number];
    pagignation.classList.add('row');
    var searchContainer = document.getElementsByClassName('jexcel_filter')[number];
    var searchDiv = (document.getElementsByClassName('jexcel_filter')[number]).childNodes[1];
    try {
        searchDiv.removeChild(((document.getElementsByClassName('jexcel_filter')[number]).childNodes[1]).childNodes[0]);
    } catch (error) { }
    document.getElementsByClassName("jexcel_search")[number].placeholder = i18n.t('static.jexcel.search');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');
    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jexcel_search")[number].value = "";
        elInstance.search('')
    };
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);
    var jexcel_pagination = document.getElementsByClassName('jexcel_pagination')[number];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jexcel_pagination_dropdown')[number];
    pageSelect.options[3].innerHTML = "All";
    pageSelect.addEventListener("change", () => paginationChange(number));
    var jexcel_filterFirstdiv = document.getElementsByClassName('jexcel_filter')[number];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);
}
/**
 * This function is used to format the jexcel table without pagination option
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunctionWithoutPagination(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.worksheets[0];
    elInstance.hideIndex(0);
    var searchContainer = document.getElementsByClassName('jss_search_container')[number];
    var searchDiv = (document.getElementsByClassName('jss_search_container')[number]).childNodes[1];
    try {
        searchDiv.removeChild(((document.getElementsByClassName('jss_search_container')[number]).childNodes[1]).childNodes[0]);
    } catch (error) { }
    document.getElementsByClassName("jss_search")[number].placeholder = i18n.t('static.jexcel.search');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.onclick = function () {
        document.getElementsByClassName("jss_search")[number].value = "";
        elInstance.search('')
    };
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');
    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);
}
/**
 * This function is used to format the jexcel table where only the index column should not be visible
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunctionOnlyHideRow(instance) {
    var elInstance = instance.worksheets[0];
    elInstance.hideIndex(0);
}
/**
 * This function is used to format the jexcel table for qunatimed screens
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunctionQuantimed(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.worksheets[0];
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jss_pagination')[number];
    pagignation.classList.add('row');
    var searchContainer = document.getElementsByClassName('jss_search_container')[number];
    var searchDiv = (document.getElementsByClassName('jss_search_container')[number]).childNodes[1];
    try {
        searchDiv.removeChild(((document.getElementsByClassName('jss_search_container')[number]).childNodes[1]).childNodes[0]);
    } catch (error) { }
    document.getElementsByClassName("jss_search")[number].placeholder = i18n.t('static.jexcel.search');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');
    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jss_search")[number].value = "";
        elInstance.search('')
    };
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);
    var jexcel_pagination = document.getElementsByClassName('jss_pagination')[number];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jss_pagination_dropdown')[0];
    pageSelect.options[3].innerHTML = "All";
    pageSelect.addEventListener("change", () => paginationChange(0));
    var jexcel_filterFirstdiv = document.getElementsByClassName('jss_search_container')[number];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);
}
/**
 * This function is used for adding the validation to the cell
 * @param {*} type This is the type of the cell
 * @param {*} colName This is the name of the column
 * @param {*} rowNo This is the row number
 * @param {*} value This is the value of the cell
 * @param {*} elInstance This is the instance of the jexcel
 * @param {*} reg This is regular expression that needs to be validated
 * @param {*} greaterThan0 This is boolean parameter to only validate numbers greater than 0 if true
 * @param {*} equalTo0 This is boolean parameter to also validate if number is equal to 0 if true
 * @param {*} colNo This is the column number
 * @returns This function returns true if validation is correct else returns false
 */
export function checkValidtion(type, colName, rowNo, value, elInstance, reg, greaterThan0, equalTo0, colNo) {
    if (type == "text") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        if (value == "" || value == undefined || value == "undefined") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            return true;
        }
    } else if (type == "number") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        value = value.toString().replaceAll("\,", "").trim();
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            if (isNaN(Number(value)) || !(reg.test(value)) || (greaterThan0 == 1 && (equalTo0 == 1 ? value < 0 : value <= 0)) || (greaterThan0 == 0 && (equalTo0 == 1 ? 1==0 : value == 0))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                return false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                return true;
            }
        }
    } else if (type == "date") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            return true;
        }
    } else if (type == "dateWithInvalid") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            if (moment(value).format("YYYY-MM") == "Invalid date") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                elInstance.setValueFromCoords(colNo, rowNo, "", true);
                return false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                return true;
            }
        }
    } else if (type == "dateWithInvalidDataEntry") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            if (moment(value).format("YYYY-MM") == "Invalid date") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                elInstance.setValueFromCoords(colNo, rowNo, "", true);
                return false;
            } else if (moment(value).format("YYYY-MM").toString().length != 7) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                elInstance.setValueFromCoords(colNo, rowNo, "", true);
                return false;
            } else if (moment(value).isBefore(moment(MIN_DATE_RESTRICTION_IN_DATA_ENTRY).startOf('month').format("YYYY-MM"))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                return false;
            } else if (moment(value).isAfter(moment(Date.now()).add(MAX_DATE_RESTRICTION_IN_DATA_ENTRY, 'years').endOf('month').format("YYYY-MM"))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                return false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                return true;
            }
        }
    } else if (type == "dateWithInvalidForShipment") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            if (moment(value).format("YYYY-MM") == "Invalid date") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                elInstance.setValueFromCoords(colNo, rowNo, "", true);
                return false;
            } else if (!(moment(value, 'YYYY-MM-DD', true).isValid() || moment(value, 'YYYY-MM-DD HH:mm:ss', true).isValid())) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                elInstance.setValueFromCoords(colNo, rowNo, "", true);
                return false;
            } else if (moment(value).format("YYYY-MM").toString().length != 7) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                elInstance.setValueFromCoords(colNo, rowNo, "", true);
                return false;
            } else if (moment(value).isBefore(moment(MIN_DATE_RESTRICTION_IN_DATA_ENTRY).startOf('month').format("YYYY-MM"))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                return false;
            } else if (moment(value).isAfter(moment(Date.now()).add(MAX_DATE_RESTRICTION_IN_DATA_ENTRY, 'years').endOf('month').format("YYYY-MM"))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                return false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                return true;
            }
        }
    } else if (type == "numberNotRequired") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        value = value.toString().replaceAll("\,", "");
        if (value != "") {
            if (isNaN(Number(value)) || !(reg.test(value)) || (greaterThan0 == 1 && (equalTo0 == 1 ? value < 0 : value <= 0))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                return false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                return true;
            }
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            return true;
        }
    }
}
/**
 * This function is used to change the cell color and comments when the text is valid
 * @param {*} colName This is the name of the column
 * @param {*} rowNo This is the row number
 * @param {*} elInstance This is the instance of jexcel
 */
export function positiveValidation(colName, rowNo, elInstance) {
    var col = (colName).concat(parseInt(rowNo) + 1);
    elInstance.setStyle(col, "background-color", "transparent");
    elInstance.setComments(col, "");
}
/**
 * This function is used to change the cell color and comments when the text is in valid
 * @param {*} colName This is the name of the column
 * @param {*} rowNo This is the row number
 * @param {*} rowNo This is the message that should be displayed if validation fails
 * @param {*} elInstance This is the instance of jexcel
 */
export function inValid(colName, rowNo, message, elInstance) {
    var col = (colName).concat(parseInt(rowNo) + 1);
    elInstance.setStyle(col, "background-color", "transparent");
    elInstance.setStyle(col, "background-color", "yellow");
    elInstance.setComments(col, message);
}
/**
 * This function is used to change the cell color to specified colour and comments when the text is in valid
 * @param {*} colName This is the name of the column
 * @param {*} rowNo This is the row number
 * @param {*} rowNo This is the message that should be displayed if validation fails
 * @param {*} elInstance This is the instance of jexcel
 * @param {*} color This is the name of the cell background colour
 */
export function inValidWithColor(colName, rowNo, message, elInstance, color) {
    var col = (colName).concat(parseInt(rowNo) + 1);
    elInstance.setStyle(col, "background-color", "transparent");
    elInstance.setStyle(col, "background-color", color);
    elInstance.setComments(col, message);
}
/**
 * This function is used to format the jexcel table for compare and select screen
 * @param {*} instance This is the instance of the jexcel table
 * @param {*} number This is the position number of jexcel table
 */
export function jExcelLoadedFunctionOldForCompareAndSelect(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.worksheets[0];
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jss_pagination')[number];
    pagignation.classList.add('row');
    var searchContainer = document.getElementsByClassName('jss_search_container')[number];
    var searchDiv = (document.getElementsByClassName('jss_search_container')[number]).childNodes[1];
    searchDiv.removeChild(((document.getElementsByClassName('jss_search_container')[number]).childNodes[1]).childNodes[0]);
    document.getElementsByClassName("jss_search")[number].placeholder = i18n.t('static.jexcel.search');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');
    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jss_search")[number].value = "";
        elInstance.search('')
    };
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);
    var jexcel_pagination = document.getElementsByClassName('jss_pagination')[number];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jss_pagination_dropdown')[number];
    pageSelect.options[3].innerHTML = "All";
    pageSelect.addEventListener("change", () => paginationChange(number));
    var jexcel_filterFirstdiv = document.getElementsByClassName('jss_search_container')[number];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);
    var jexcel_filterFirstdiv1 = document.getElementsByClassName('jss_table_container')[0];
    jexcel_filterFirstdiv1.firstChild.nextSibling.classList.remove('jss_scrollX')
}
/**
 * This is the common check validation function for checking jexcel validation on submit
 * @param {*} worksheets This is the instance of the jexcel
 * @returns Returns true if the cells are valid otherwise returns false
 */
export function checkValidation(worksheets) {
    var valid = true;
    var json = worksheets.getJson(null, false);
    var columns = worksheets.getConfig().columns;
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'];
    for (var y = 0; y < json.length; y++) {
        for (var c = 0; c < columns.length; c++) {
            var columnValid = true;
            var col = (colArr[c]).concat(parseInt(y) + 1);
            var value = json[y][c];
            if (columns[c].required === true) {
                if (value === "") {
                    worksheets.setStyle(col, "background-color", "transparent");
                    worksheets.setStyle(col, "background-color", "yellow");
                    worksheets.setComments(col, "This field is required");
                    valid = false;
                    columnValid = false;
                }
            }            
            if (columns[c].number === true && columnValid != false && value != "") {
                if (isNaN(parseInt(value))) {
                    worksheets.setStyle(col, "background-color", "transparent");
                    worksheets.setStyle(col, "background-color", "yellow");
                    worksheets.setComments(col, "Not a number");
                    valid = false;
                    columnValid = false;
                }
            }
            if (columns[c].decimal === false && columnValid != false && value != "") {
                if (!Number.isInteger(Number(value))) {
                    worksheets.setStyle(col, "background-color", "transparent");
                    worksheets.setStyle(col, "background-color", "yellow");
                    worksheets.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
                    valid = false;
                    columnValid = false;
                }
            }
            if (columns[c].maxValue && columnValid != false && value != "") {
                if (parseInt(value) > columns[c].maxValue.value) {
                    worksheets.setStyle(col, "background-color", "transparent");
                    worksheets.setStyle(col, "background-color", "yellow");
                    worksheets.setComments(col, columns[c].maxValue.text);
                    valid = false;
                    columnValid = false;
                }
            }
            if (columns[c].minValue && columnValid != false && value != "") {
                if (parseInt(value) < columns[c].minValue.value) {
                    worksheets.setStyle(col, "background-color", "transparent");
                    worksheets.setStyle(col, "background-color", "yellow");
                    worksheets.setComments(col, columns[c].minValue.text);
                    valid = false;
                    columnValid = false;
                }
            }
            if (columns[c].regex && columns[c].regex !== undefined && columnValid != false && value != "") {
                var reg = columns[c].regex.ex;
                if (value !== "" && value !== null && !reg.test(value)) {
                    worksheets.setStyle(col, "background-color", "transparent");
                    worksheets.setStyle(col, "background-color", "yellow");
                    worksheets.setComments(col, columns[c].regex.text);
                    valid = false;
                    columnValid = false;
                }
            }
            if (columnValid == true) {
                worksheets.setStyle(col, "background-color", "transparent");
                worksheets.setComments(col, "");
            }
        }
    }
    return valid;
}
/**
 * This is the common on change function when something in the jexcel table is changed to add the validations or fill some auto values for the cells
 * @param {*} worksheets This is the DOM Element where sheet is created
 * @param {*} cell This is the object of the DOM element
 * @param {*} x This is the value of the column number that is being updated
 * @param {*} y This is the value of the row number that is being updated
 * @param {*} value This is the updated value
 */
export function changed(worksheets, cell, x, y, value) {
    var columns = worksheets.getConfig().columns
    var isChangedColumnIndex = columns.findIndex(c => c.isChangedFlag == true);
    var columnInfo = columns[x];
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'];
    worksheets.setValueFromCoords(isChangedColumnIndex, y, 1, true);
    var col = (colArr[x]).concat(parseInt(y) + 1);
    var validFlag = true;
    if (columnInfo.required === true) {
        if (value === "") {
            worksheets.setStyle(col, "background-color", "transparent");
            worksheets.setStyle(col, "background-color", "yellow");
            worksheets.setComments(col, "This field is required");
            validFlag = false;
        }
    }
    if (columnInfo.number === true && value !== "" && validFlag != false) {
        if (isNaN(parseInt(value))) {
            worksheets.setStyle(col, "background-color", "transparent");
            worksheets.setStyle(col, "background-color", "yellow");
            worksheets.setComments(col, "Not a number");
            validFlag = false;
        }
    }
    if (columnInfo.decimal === false && validFlag != false) {
        if (!Number.isInteger(Number(value))) {
            worksheets.setStyle(col, "background-color", "transparent");
            worksheets.setStyle(col, "background-color", "yellow");
            worksheets.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
            validFlag = false;
        }
    }
    if (columnInfo.maxValue) {
        if (value > columnInfo.maxValue.value) {
            worksheets.setStyle(col, "background-color", "transparent");
            worksheets.setStyle(col, "background-color", "yellow");
            worksheets.setComments(col, columnInfo.maxValue.text);
            validFlag = false;
        }
    }
    if (columnInfo.minValue) {
        if (value < columnInfo.minValue.value) {
            worksheets.setStyle(col, "background-color", "transparent");
            worksheets.setStyle(col, "background-color", "yellow");
            worksheets.setComments(col, columnInfo.minValue.text);
            validFlag = false;
        }
    }
    if (columnInfo.regex && columnInfo.regex !== undefined && validFlag != false) {
        var reg = columnInfo.regex.ex;
        if (!reg.test(value)) {
            worksheets.setStyle(col, "background-color", "transparent");
            worksheets.setStyle(col, "background-color", "yellow");
            worksheets.setComments(col, columnInfo.regex.text);
            validFlag = false;
        }
    }
    if (validFlag) {
        worksheets.setStyle(col, "background-color", "transparent");
        worksheets.setComments(col, "");
    }
};
/**
 * This function is used to format the table like add asterisk or info to the table headers
 * @param {*} instance This is the DOM Element where sheet is created
 * @param {*} cell This is the object of the DOM element
 */
export function loadedForNonEditableTables(instance, cell) {
    jExcelLoadedFunction(instance);
}