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
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import { Prompt } from 'react-router';
// Localized entity name
const entityname = i18n.t('static.dashboard.procurementAgentForecastingUnit')
/**
 * Component for mapping procurement agent and forecasting unit.
 */
export default class MapProcurementAgentForecastingUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        this.state = {
            forecastingUnitId: '',
            forecastingUnitName: '',
            skuCode: '',
            rows: rows,
            procurementAgentList: [],
            forecastingUnitList: [],
            rowErrorMessage: '',
            procurementAgentForecastingUnitId: 0,
            isNew: true,
            procurementAgentId: this.props.match.params.procurementAgentId,
            updateRowStatus: 0,
            lang: localStorage.getItem('lang'),
            loading: true,
            changed: false
        }
        this.options = props.options;
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicateForecastingUnit = this.checkDuplicateForecastingUnit.bind(this);
        this.checkDuplicateSKUCode = this.checkDuplicateSKUCode.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    /**
     * Function to filter products based on active flag
     */
    filterProduct = function (instance, cell, c, r, source) {
        return this.state.products.filter(c => c.active.toString() == "true");
    }.bind(this);
    /**
     * Reterives procurement agent and forecasting unit list and build jexcel table on component mount
     */
    componentDidMount() {
        ProcurementAgentService.getProcurementAgentForecastingUnitList(this.state.procurementAgentId)
            .then(response => {
                if (response.status == 200) {
                    let myResponse = response.data;
                    if (myResponse.length > 0) {
                        this.setState({ rows: myResponse });
                    }
                    ProcurementAgentService.getProcurementAgentListAll()
                        .then(response => {
                            if (response.status == "200") {
                                this.setState({
                                    procurementAgentList: response.data
                                });
                                ForecastingUnitService.getForecastingUnitListAll()
                                    .then(response => {
                                        if (response.status == 200) {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                forecastingUnitList: listArray
                                            },
                                                () => {
                                                    const { procurementAgentList } = this.state;
                                                    const { forecastingUnitList } = this.state;
                                                    let programs = [];
                                                    let products = [];
                                                    let tempForecastingUnitArrayList = [];
                                                    if (procurementAgentList.length > 0) {
                                                        for (var i = 0; i < procurementAgentList.length; i++) {
                                                            var paJson = {
                                                                name: getLabelText(procurementAgentList[i].label, this.state.lang),
                                                                id: parseInt(procurementAgentList[i].procurementAgentId)
                                                            }
                                                            programs[i] = paJson
                                                        }
                                                    }
                                                    if (forecastingUnitList.length > 0) {
                                                        for (var i = 0; i < forecastingUnitList.length; i++) {
                                                            tempForecastingUnitArrayList[i] = forecastingUnitList[i].forecastingUnitId;
                                                            var puJson = {
                                                                name: getLabelText(forecastingUnitList[i].label, this.state.lang) + " | " + forecastingUnitList[i].forecastingUnitId,
                                                                id: parseInt(forecastingUnitList[i].forecastingUnitId),
                                                                active: forecastingUnitList[i].active
                                                            }
                                                            products[i] = puJson;
                                                        }
                                                    }
                                                    this.setState({
                                                        tempForecastingUnitArrayList: tempForecastingUnitArrayList,
                                                        products: products
                                                    })
                                                    var papuList = this.state.rows;
                                                    var data = [];
                                                    var papuDataArr = []
                                                    var count = 0;
                                                    if (papuList.length != 0) {
                                                        for (var j = 0; j < papuList.length; j++) {
                                                            data = [];
                                                            data[0] = parseInt(papuList[j].procurementAgent.id);
                                                            data[1] = parseInt(papuList[j].forecastingUnit.id);
                                                            data[2] = papuList[j].skuCode;
                                                            data[3] = papuList[j].active;
                                                            data[4] = papuList[j].procurementAgentForecastingUnitId;
                                                            data[5] = 0;
                                                            papuDataArr[count] = data;
                                                            count++;
                                                        }
                                                    }
                                                    if (papuDataArr.length == 0) {
                                                        data = [];
                                                        data[0] = this.props.match.params.procurementAgentId;
                                                        data[1] = "";
                                                        data[2] = "";
                                                        data[3] = true;
                                                        data[4] = 0;
                                                        data[5] = 1;
                                                        papuDataArr[0] = data;
                                                    }
                                                    this.el = jexcel(document.getElementById("paputableDiv"), '');
                                                    jexcel.destroy(document.getElementById("paputableDiv"), true);
                                                    var data = papuDataArr;
                                                    var options = {
                                                        data: data,
                                                        columnDrag: false,
                                                        columns: [
                                                            {
                                                                title: i18n.t('static.procurementagent.procurementagent'),
                                                                type: 'dropdown',
                                                                source: programs,
                                                                readOnly: true,
                                                                width: 300
                                                            },
                                                            {
                                                                title: i18n.t('static.ManageTree.ForecastingUnit'),
                                                                type: 'autocomplete',
                                                                source: products,
                                                                filter: this.filterProduct,
                                                                width: 300
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                                                                type: 'text',
                                                                width: 300
                                                            },
                                                            {
                                                                title: i18n.t('static.checkbox.active'),
                                                                type: 'checkbox',
                                                                width: 80
                                                            },
                                                            {
                                                                title: 'procurementAgentId',
                                                                type: 'hidden'
                                                            },
                                                            {
                                                                title: 'isChange',
                                                                type: 'hidden'
                                                            }
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
                                                                            data[3] = true;
                                                                            data[4] = 0;
                                                                            data[5] = 1;
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
                                                                            data[3] = true;
                                                                            data[4] = 0;
                                                                            data[5] = 1;
                                                                            obj.insertRow(data, parseInt(y));
                                                                        }.bind(this)
                                                                    });
                                                                }
                                                                if (obj.options.allowDeleteRow == true) {
                                                                    if (obj.getRowData(y)[4] == 0) {
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
                                                });
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
     * Callback function called when editing of a cell in the jexcel table ends.
     * @param {object} instance - The jexcel instance.
     * @param {object} cell - The cell object.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {any} value - The new value of the cell.
     */
    oneditionend = function (instance, cell, x, y, value) {
        // var elInstance = instance;
        // var rowData = elInstance.getRowData(y);
        // if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
        //     elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        // } else if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
        //     elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        // } else if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
        //     elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        // } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
        //     elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        // } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
        //     elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        // } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
        //     elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        // } else if (x == 9 && !isNaN(rowData[9]) && rowData[9].toString().indexOf('.') != -1) {
        //     elInstance.setValueFromCoords(9, y, parseFloat(rowData[9]), true);
        // }
        // elInstance.setValueFromCoords(12, y, 1, true);
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var data = [];
        data[0] = this.props.match.params.procurementAgentId;
        data[1] = "";
        data[2] = "";
        data[3] = true;
        data[4] = 0;
        data[5] = 1;
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
        this.setState({
            changed: true
        })
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`L${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(0, data[i].y, this.props.match.params.procurementAgentId, true);
                    (instance).setValueFromCoords(4, data[i].y, 0, true);
                    (instance).setValueFromCoords(5, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    /**
     * Function to handle form submission and save data on server.
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        var duplicateValidation = this.checkDuplicateForecastingUnit();
        var duplicateValidationSKUCode = this.checkDuplicateSKUCode();
        if (validation == true && duplicateValidation == true && duplicateValidationSKUCode == true) {
            var tableJson = this.el.getJson(null, false);
            if (tableJson.filter(c => c[5] == 1).length > 0) {
                this.setState({
                    loading: false
                })
                let changedpapuList = [];
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    // if (parseInt(map1.get("5")) === 1) {
                    let json = {
                        forecastingUnit: {
                            id: parseInt(map1.get("1")),
                        },
                        procurementAgent: {
                            id: parseInt(map1.get("0")),
                        },
                        skuCode: map1.get("2"),
                        active: map1.get("3"),
                        procurementAgentForecastingUnitId: parseInt(map1.get("4"))
                    }
                    changedpapuList.push(json);
                    // }
                }
                ProcurementAgentService.addprocurementAgentForecastingUnitMapping(changedpapuList)
                    .then(response => {
                        this.setState({
                            changed: false
                        })
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
                this.setState({
                    message: i18n.t("static.pafu.noNewChangesFound"),
                    color: "red"
                }, () => {
                    hideSecondComponent()
                })
            }
        } else {
        }
    }
    /**
     * Function to check for duplicate forecasting units.
     * @returns Returns true if there are no duplicates, false otherwise.
     */
    checkDuplicateForecastingUnit = function () {
        var tableJson = this.el.getJson(null, false);
        var tempJson = [];
        tableJson.map((item, idx) => {
            var tmpIndex=tempJson.findIndex(c => c[1] == item[1]);
            if (tmpIndex>=0) {
                var col = ("B").concat(parseInt(idx) + 1);
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.planningUnit.duplicateForecastingUnit'));
                var col = ("B").concat(parseInt(tmpIndex) + 1);
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.planningUnit.duplicateForecastingUnit'));
            }
            tempJson.push(item);
        })
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => parseInt(v[Object.keys(v)[1]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.planningUnit.duplicateForecastingUnit'),
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
     * Function to check for duplicate sku code.
     * @returns Returns true if there are no duplicates, false otherwise.
     */
    checkDuplicateSKUCode = function () {
        var tableJson = this.el.getJson(null, false);
        var tempJson = [];
        tableJson.map((item, idx) => {
            var tmpIndex=tempJson.findIndex(c => c[2] == item[2]);
            if (tmpIndex>=0) {
                var col = ("C").concat(parseInt(idx) + 1);
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.realmCountryPlanningUnit.duplicateSKU'));
                var col = ("C").concat(parseInt(tmpIndex) + 1);
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.realmCountryPlanningUnit.duplicateSKU'));
            }
            tempJson.push(item);
        })
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => (v[Object.keys(v)[2]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.realmCountryPlanningUnit.duplicateSKU'),
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
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
            changed: true
        })
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
            var reg = /^[a-zA-Z0-9\b]+$/;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.skucodevalid'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x != 5) {
            this.el.setValueFromCoords(5, y, 1, true);
        }
    }.bind(this);
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(5, y);
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
                var reg = /^[a-zA-Z0-9\b]+$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.skucodevalid'));
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
     * Renders the Procurement agent forecasting unit mapping list.
     * @returns {JSX.Element} - Procurement agent forecasting unit mapping list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.changed == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div>
                    <Card>
                        <CardBody className="p-0">
                            <Col xs="12" sm="12">
                                <div className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div id="paputableDiv" className='TableWidth100'>
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
                                {this.state.changed && <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div >
        );
    }
    /**
     * Redirects to the list procurement agent screen when cancel button is clicked.
     */
    cancelClicked() {
        var cont = false;
        if (this.state.changed == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({
                changed: false
            })
            this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
        }
    }
}
