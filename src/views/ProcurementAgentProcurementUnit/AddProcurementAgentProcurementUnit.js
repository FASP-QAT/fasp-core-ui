import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    FormGroup,
    Row
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import ProcurementUnitService from "../../api/ProcurementUnitService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.dashboard.procurementAgentProcurementUnit')
/**
 * Component for mapping procurement agent and procurement unit.
 */
export default class AddProcurementAgentProcurementUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        this.state = {
            procurementUnitId: '',
            procurementUnitName: '',
            skuCode: '',
            vendorPrice: '',
            approvedToShippedLeadTime: '',
            gtin: '',
            procurementAgentProcurementUnitId: 0,
            isNew: true,
            rows: rows,
            procurementAgentList: [],
            procurementUnitList: [],
            rowErrorMessage: '',
            lang: localStorage.getItem('lang'),
            procurementAgentId: this.props.match.params.procurementAgentId,
            updateRowStatus: 0,
            loading: true,
            isValidData: true
        }
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.changed = this.changed.bind(this);
        this.checkDuplicatePlanningUnit = this.checkDuplicatePlanningUnit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRowInJexcel = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = this.props.match.params.procurementAgentId;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = 0;
        data[7] = 1;
        this.el.insertRow(
            data
        );
    }
    /**
     * Function to handle paste events in the jexcel table.
     * @param {Object} instance - The jexcel instance.
     * @param {Array} data - The data being pasted.
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(0, data[i].y, this.props.match.params.procurementAgentId, true);
                    (instance).setValueFromCoords(6, data[i].y, 0, true);
                    (instance).setValueFromCoords(7, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    /**
     * Function to check for duplicate procurement units.
     * @returns Returns true if there are no duplicates, false otherwise.
     */
    checkDuplicatePlanningUnit = function () {
        var tableJson = this.el.getJson(null, false);
        let count = 0;
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => parseInt(v[Object.keys(v)[1]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.procurementUnit.duplicateProcurementUnit'),
                changedFlag: 0,
            },
                () => {
                    hideSecondComponent();
                })
            return false;
        } else {
            return true;
        }
    }
    /**
     * Function to handle form submission and save data on server.
     */
    submitForm() {
        var duplicateValidation = this.checkDuplicatePlanningUnit();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            this.setState({
                loading: false
            })
            var json = this.el.getJson(null, false);
            var procurementUnitArray = []
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (map.get("7") == 1) {
                    if (map.get("6") == "") {
                        var pId = 0;
                    } else {
                        var pId = map.get("6");
                    }
                    var procurementUnitJson = {
                        procurementAgentProcurementUnitId: pId,
                        procurementAgent: {
                            id: map.get("0")
                        },
                        procurementUnit: {
                            id: map.get("1"),
                        },
                        skuCode: map.get("2"),
                        vendorPrice: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        approvedToShippedLeadTime: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        gtin: map.get("5")
                    }
                    procurementUnitArray.push(procurementUnitJson);
                }
            }
            ProcurementAgentService.addprocurementAgentProcurementUnitMapping(procurementUnitArray)
                .then(response => {
                    if (response.status == "200") {
                        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                hideSecondComponent();
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
        } else {
        }
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                if (value == "") {
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
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_LEAD_TIME;
                if (value == "") {
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
        this.setState({
            changedFlag: 1
        })
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
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value != "") {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_LEAD_TIME;
            if (value != "") {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
            } else {
            }
        }
    }
    /**
     * Function to filter procurement unit list based on active flag
     */
    filterProcurmentUnitList = function (instance, cell, c, r, source) {
        return this.state.procurmentUnitListJexcel.filter(c => c.active.toString() == "true");
    }.bind(this);
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
        if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        } else if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        }
        this.el.setValueFromCoords(7, y, 1, true);
    }
    /**
     * Reterives procurement agent and procurement unit list and build jexcel table on component mount
     */
    componentDidMount() {
        var procurmentAgentListJexcel = [];
        var procurmentUnitListJexcel = [];
        ProcurementAgentService.getProcurementAgentProcurementUnitList(this.state.procurementAgentId)
            .then(response => {
                if (response.status == 200) {
                    let myResponse = response.data;
                    if (myResponse.length > 0) {
                        this.setState({ rows: myResponse });
                    }
                    ProcurementAgentService.getProcurementAgentListAll().then(response => {
                        if (response.status == "200") {
                            this.setState({
                                procurementAgentList: response.data
                            });
                            for (var k = 0; k < (response.data).length; k++) {
                                var procurementAgentJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].procurementAgentId
                                }
                                procurmentAgentListJexcel.push(procurementAgentJson);
                            }
                            ProcurementUnitService.getProcurementUnitList().then(response => {
                                if (response.status == 200) {
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    for (var k = 0; k < (listArray).length; k++) {
                                        var procurementUnitListJson = {
                                            name: response.data[k].label.label_en,
                                            id: response.data[k].procurementUnitId,
                                            active: response.data[k].active
                                        }
                                        procurmentUnitListJexcel.push(procurementUnitListJson);
                                    }
                                    this.setState({
                                        procurementUnitList: listArray,
                                        procurmentUnitListJexcel: procurmentUnitListJexcel
                                    });
                                    var procurmentAgentProcurmentUnitList = this.state.rows;
                                    var data = [];
                                    var productDataArr = []
                                    if (procurmentAgentProcurmentUnitList.length != 0) {
                                        for (var j = 0; j < procurmentAgentProcurmentUnitList.length; j++) {
                                            data = [];
                                            data[0] = procurmentAgentProcurmentUnitList[j].procurementAgent.id;
                                            data[1] = procurmentAgentProcurmentUnitList[j].procurementUnit.id;
                                            data[2] = procurmentAgentProcurmentUnitList[j].skuCode;
                                            data[3] = procurmentAgentProcurmentUnitList[j].vendorPrice;
                                            data[4] = procurmentAgentProcurmentUnitList[j].approvedToShippedLeadTime;
                                            data[5] = procurmentAgentProcurmentUnitList[j].gtin;
                                            data[6] = procurmentAgentProcurmentUnitList[j].procurementAgentProcurementUnitId;
                                            data[7] = 0;
                                            productDataArr.push(data);
                                        }
                                    } else {
                                    }
                                    this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                    jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
                                    var data = productDataArr;
                                    var options = {
                                        data: data,
                                        columnDrag: false,
                                        colWidths: [200, 290, 170, 170, 170, 170, 200, 50],
                                        columns: [
                                            {
                                                title: i18n.t('static.procurementagent.procurementagent'),
                                                type: 'dropdown',
                                                source: procurmentAgentListJexcel,
                                                readOnly: true
                                            },
                                            {
                                                title: i18n.t('static.procurementUnit.procurementUnit'),
                                                type: 'dropdown',
                                                source: procurmentUnitListJexcel,
                                                filter: this.filterProcurmentUnitList
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                                                type: 'text'
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.vendorPrice'),
                                                type: 'numeric',
                                                decimal: '.',
                                                mask: '#,##.00',
                                                textEditor: true,
                                                disabledMaskOnEdition: true
                                            },
                                            {
                                                title: i18n.t('static.program.approvetoshipleadtime'),
                                                type: 'numeric',
                                                decimal: '.',
                                                textEditor: true,
                                                mask: '#,##.00',
                                                disabledMaskOnEdition: true
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.gtin'),
                                                type: 'text'
                                            },
                                            {
                                                title: 'Procurment Agent Procurment Unit Id',
                                                type: 'hidden',
                                            },
                                            {
                                                title: 'Changed Flag',
                                                type: 'hidden'
                                            },
                                        ],
                                        editable: true,
                                        pagination: localStorage.getItem("sesRecordCount"),
                                        filters: true,
                                        search: true,
                                        columnSorting: true,
                                        wordWrap: true,
                                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                                        position: 'top',
                                        allowInsertColumn: false,
                                        allowManualInsertColumn: false,
                                        allowDeleteRow: true,
                                        onchange: this.changed,
                                        copyCompatibility: true,
                                        parseFormulas: true,
                                        onpaste: this.onPaste,
                                        oneditionend: this.oneditionend,
                                        onload: this.loaded,
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
                                                            data[0] = this.props.match.params.procurementAgentId;
                                                            data[1] = "";
                                                            data[2] = "";
                                                            data[3] = "";
                                                            data[4] = "";
                                                            data[5] = "";
                                                            data[6] = 0;
                                                            data[7] = 1;
                                                            obj.insertRow(data, parseInt(y), 1);
                                                        }.bind(this)
                                                    });
                                                }
                                                if (obj.options.allowInsertRow == true) {
                                                    items.push({
                                                        title: i18n.t('static.common.insertNewRowAfter'),
                                                        onclick: function () {
                                                            var data = [];
                                                            data[0] = this.props.match.params.procurementAgentId;
                                                            data[1] = "";
                                                            data[2] = "";
                                                            data[3] = "";
                                                            data[4] = "";
                                                            data[5] = "";
                                                            data[6] = 0;
                                                            data[7] = 1;
                                                            obj.insertRow(data, parseInt(y));
                                                        }.bind(this)
                                                    });
                                                }
                                                if (obj.options.allowDeleteRow == true) {
                                                    if (obj.getRowData(y)[6] == 0) {
                                                        items.push({
                                                            title: i18n.t("static.common.deleterow"),
                                                            onclick: function () {
                                                                obj.deleteRow(parseInt(y));
                                                            }
                                                        });
                                                    }
                                                }
                                                if (x) {
                                                }
                                            }
                                            items.push({ type: 'line' });
                                            return items;
                                        }.bind(this)
                                    };
                                    var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                    this.el = elVar;
                                    this.setState({ mapPlanningUnitEl: elVar, loading: false });
                                } else {
                                    this.setState({
                                        message: response.data.messageCode
                                    },
                                        () => {
                                            hideSecondComponent();
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
                        } else {
                            this.setState({
                                message: response.data.messageCode
                            },
                                () => {
                                    hideSecondComponent();
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
                } else {
                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            hideSecondComponent();
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }
    /**
     * Renders the Procurement agent procurement unit mapping list.
     * @returns {JSX.Element} - Procurement agent procurement unit mapping list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <div>
                    <Card  >
                        <CardBody className="p-0">
                            <Col xs="12" sm="12">
                                <h4 className="red">{this.props.message}</h4>
                                <div className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div id="mapPlanningUnit" className='TableWidth100'>
                                    </div>
                                </div>
                                <Row style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                            <div class="spinner-border blue ml-4" role="status">
                                            </div>
                                        </div>
                                    </div>
                                </Row>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRowInJexcel()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }
    /**
     * Redirects to the list procurement agent screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
