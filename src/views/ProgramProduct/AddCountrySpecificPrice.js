import jexcel from 'jspreadsheet';
import React, { Component } from "react";
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    FormGroup
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.countrySpecificPrices.countrySpecificPrices')
/**
 * Component used for taking country specific price
 */
class CountrySpecificPrices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            programs: [],
            procurementAgents: [],
            procurementAgent: {
                id: '',
                label: {
                    label_en: ''
                }
            },
            planningUnit: {
                id: '',
                label: {
                    label_en: ''
                }
            },
            programPlanningUnit: '',
            rows: [],
            isNew: true,
            updateRowStatus: 0,
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    /**
     * Function to filter active programs
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterProgram = function (instance, cell, c, r, source) {
        return this.state.procurementAgentArr.filter(c => c.active.toString() == "true");
    }.bind(this);
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    componentDidMount() {
        ProcurementAgentService.getCountrySpecificPricesList(this.props.match.params.programPlanningUnitId).then(response => {
            if (response.status == 200) {
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                ProgramService.getProgramPlaningUnitListByProgramId(this.props.match.params.programId).then(response => {
                    if (response.status == 200) {
                        let programPlanningUnit = response.data.filter(c => c.programPlanningUnitId == this.props.match.params.programPlanningUnitId)[0];
                        this.setState({
                            programPlanningUnit: programPlanningUnit,
                        })
                        ProcurementAgentService.getProcurementAgentListAll().then(response => {
                            if (response.status == 200) {
                                this.setState({
                                    procurementAgents: response.data,
                                })
                                const { procurementAgents } = this.state;
                                let procurementAgentArr = [];
                                if (procurementAgents.length > 0) {
                                    for (var i = 0; i < procurementAgents.length; i++) {
                                        var paJson = {
                                            name: getLabelText(procurementAgents[i].label, this.state.lang),
                                            id: parseInt(procurementAgents[i].procurementAgentId),
                                            active: procurementAgents[i].active,
                                            code: procurementAgents[i].procurementAgentCode,
                                        }
                                        procurementAgentArr[i] = paJson
                                    }
                                }
                                procurementAgentArr.sort(function (a, b) {
                                    var itemLabelA = a.name.toUpperCase(); 
                                    var itemLabelB = b.name.toUpperCase(); 
                                    if (itemLabelA < itemLabelB) {
                                        return -1;
                                    }
                                    if (itemLabelA > itemLabelB) {
                                        return 1;
                                    }
                                    return 0;
                                });
                                this.setState({
                                    procurementAgentArr: procurementAgentArr,
                                })
                                var papuList = this.state.rows;
                                var data = [];
                                var papuDataArr = [];
                                var count = 0;
                                if (papuList.length != 0) {
                                    for (var j = 0; j < papuList.length; j++) {
                                        data = [];
                                        data[0] = this.state.programPlanningUnit.program.label.label_en;
                                        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                        data[2] = parseInt(papuList[j].procurementAgent.id);
                                        data[3] = papuList[j].price;
                                        data[4] = papuList[j].active;
                                        data[5] = papuList[j].programPlanningUnitId;
                                        data[6] = papuList[j].programPlanningUnitProcurementAgentId;
                                        data[7] = 0;
                                        papuDataArr[count] = data;
                                        count++;
                                    }
                                }
                                if (papuDataArr.length == 0) {
                                    data = [];
                                    data[0] = this.state.programPlanningUnit.program.label.label_en;
                                    data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                    data[2] = "";
                                    data[3] = "";
                                    data[4] = true;
                                    data[5] = this.props.match.params.programPlanningUnitId;
                                    data[6] = 0;
                                    data[7] = 1;
                                    papuDataArr[0] = data;
                                }
                                this.el = jexcel(document.getElementById("paputableDiv"), '');
                                jexcel.destroy(document.getElementById("paputableDiv"), true);
                                var json = [];
                                var data = papuDataArr;
                                var options = {
                                    data: data,
                                    columnDrag: false,
                                    colWidths: [100, 100, 100, 100],
                                    columns: [
                                        {
                                            title: i18n.t('static.program.programMaster'),
                                            type: 'text',
                                            readOnly: true
                                        },
                                        {
                                            title: i18n.t('static.product.product'),
                                            type: 'text',
                                            readOnly: true
                                        },
                                        {
                                            title: i18n.t('static.report.procurementAgentName'),
                                            type: 'autocomplete',
                                            source: procurementAgentArr,
                                            filter: this.filterProgram
                                        },
                                        {
                                            title: i18n.t('static.price.prices'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        {
                                            title: i18n.t('static.checkbox.active'),
                                            type: 'checkbox'
                                        },
                                        {
                                            title: 'programPlanningUnitId',
                                            type: 'hidden'
                                            // title: 'A',
                                            // type: 'text',
                                            // visible: false
                                        },
                                        {
                                            title: 'programPlanningUnitProcurementAgentId',
                                            type: 'hidden'
                                            // title: 'A',
                                            // type: 'text',
                                            // visible: false
                                        },
                                        {
                                            title: 'isChange',
                                            type: 'hidden'
                                            // title: 'A',
                                            // type: 'text',
                                            // visible: false
                                        },
                                    ],
                                    editable: true,
                                    pagination: localStorage.getItem("sesRecordCount"),
                                    filters: true,
                                    search: true,
                                    columnSorting: true,
                                    wordWrap: true,
                                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                                    parseFormulas: true,
                                    position: 'top',
                                    allowInsertColumn: false,
                                    allowManualInsertColumn: false,
                                    allowDeleteRow: true,
                                    onchange: this.changed,
                                    oneditionend: this.oneditionend,
                                    copyCompatibility: true,
                                    onpaste: this.onPaste,
                                    allowManualInsertRow: false,
                                    license: JEXCEL_PRO_KEY,
                                    onload: this.loaded,
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
                                                        data[0] = this.state.programPlanningUnit.program.label.label_en;
                                                        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = true;
                                                        data[5] = this.props.match.params.programPlanningUnitId;
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
                                                        data[0] = this.state.programPlanningUnit.program.label.label_en;
                                                        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = true;
                                                        data[5] = this.props.match.params.programPlanningUnitId;
                                                        data[6] = 0;
                                                        data[7] = 1;
                                                        obj.insertRow(data, parseInt(y));
                                                    }.bind(this)
                                                });
                                            }
                                            if (obj.options.allowDeleteRow == true) {
                                                if (obj.getRowData(y)[7] == 0) {
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
                                this.el = jexcel(document.getElementById("paputableDiv"), options);
                                this.setState({
                                    loading: false
                                })
                            } else {
                                this.setState({
                                    message: response.data.messageCode
                                },
                                    () => {
                                        hideSecondComponent();
                                    })
                            }
                        })
                            .catch(
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
                })
                    .catch(
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
        })
            .catch(
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
        if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        }
        elInstance.setValueFromCoords(7, y, 1, true);
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var data = [];
        data[0] = this.state.programPlanningUnit.program.label.label_en;
        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
        data[2] = "";
        data[3] = "";
        data[4] = true;
        data[5] = this.props.match.params.programPlanningUnitId;
        data[6] = 0;
        data[7] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };
    /**
     * Function to handle paste events in the jexcel table.
     * @param {Object} instance - The jexcel instance.
     * @param {Array} data - The data being pasted.
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`F${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(0, data[i].y, this.state.programPlanningUnit.program.label.label_en, true);
                    (instance).setValueFromCoords(1, data[i].y, this.state.programPlanningUnit.planningUnit.label.label_en, true);
                    (instance).setValueFromCoords(6, data[i].y, 0, true);
                    (instance).setValueFromCoords(7, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        program: {
                            id: this.props.match.params.programId
                        },
                        planningUnit: {
                            id: this.props.match.params.planningUnitId
                        },
                        procurementAgent: {
                            id: parseInt(map1.get("2"))
                        },
                        price: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        programPlanningUnitId: parseInt(map1.get("5")),
                        programPlanningUnitProcurementAgentId: parseInt(map1.get("6")),
                        active: map1.get("4"),
                    }
                    changedpapuList.push(json);
                }
            }
            ProcurementAgentService.savePlanningUnitProgramPriceForProcurementAgent(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        let programId = this.props.match.params.programId;
                        this.props.history.push(`/programProduct/addProgramProduct/${programId}/` + 'green/' + 'Procurement Agent Prices added successfully')
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        },
                            () => {
                                hideSecondComponent();
                            })
                    }
                })
                .catch(
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
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: i18n.t('static.message.procurementAgentAlreadExists'),
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
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
            var col = ("D").concat(parseInt(y) + 1);
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
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
        if (x != 7) {
            this.el.setValueFromCoords(7, y, 1, true);
        }
    }.bind(this);
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {
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
            }
        }
        return valid;
    }
    /**
     * Renders the country specific price list.
     * @returns {JSX.Element} - Country specific price list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div>
                    <Card>
                        <CardBody className="p-0">
                            <Col xs="12" sm="12">
                                <div id="paputableDiv" className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> {i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }
    /**
     * Redirects to the add program planning unit screen when cancel button is clicked.
     */
    cancelClicked() {
        let programId = this.props.match.params.programId;
        this.props.history.push(`/programProduct/addProgramProduct/${programId}/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
export default CountrySpecificPrices
