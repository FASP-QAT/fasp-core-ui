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
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import PlanningUnitService from "../../api/PlanningUnitService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.dashboard.procurementAgentPlanningUnit')
/**
 * Component for mapping procurement agent and planning unit.
 */
export default class AddProcurementAgentPlanningUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        this.state = {
            planningUnitId: '',
            planningUnitName: '',
            skuCode: '',
            catalogPrice: '',
            moq: 0,
            unitsPerPalletEuro1: 0,
            unitsPerPalletEuro2: 0,
            unitsPerContainer: 0,
            volume: 0,
            weight: 0,
            rows: rows,
            procurementAgentList: [],
            planningUnitList: [],
            rowErrorMessage: '',
            procurementAgentPlanningUnitId: 0,
            isNew: true,
            procurementAgentId: this.props.match.params.procurementAgentId,
            updateRowStatus: 0,
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.options = props.options;
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicatePlanningUnit = this.checkDuplicatePlanningUnit.bind(this);
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
     * Reterives procurement agent and planning unit list and build jexcel table on component mount
     */
    componentDidMount() {
        ProcurementAgentService.getProcurementAgentPlaningUnitList(this.state.procurementAgentId)
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
                                PlanningUnitService.getAllPlanningUnitList()
                                    .then(response => {
                                        if (response.status == 200) {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                planningUnitList: listArray
                                            },
                                                () => {
                                                    const { procurementAgentList } = this.state;
                                                    const { planningUnitList } = this.state;
                                                    let programs = [];
                                                    let products = [];
                                                    let tempPlanningUnitArrayList = [];
                                                    if (procurementAgentList.length > 0) {
                                                        for (var i = 0; i < procurementAgentList.length; i++) {
                                                            var paJson = {
                                                                name: getLabelText(procurementAgentList[i].label, this.state.lang),
                                                                id: parseInt(procurementAgentList[i].procurementAgentId)
                                                            }
                                                            programs[i] = paJson
                                                        }
                                                    }
                                                    if (planningUnitList.length > 0) {
                                                        for (var i = 0; i < planningUnitList.length; i++) {
                                                            tempPlanningUnitArrayList[i] = planningUnitList[i].planningUnitId;
                                                            var puJson = {
                                                                name: getLabelText(planningUnitList[i].label, this.state.lang) + " | " + planningUnitList[i].planningUnitId,
                                                                id: parseInt(planningUnitList[i].planningUnitId),
                                                                active: planningUnitList[i].active
                                                            }
                                                            products[i] = puJson;
                                                        }
                                                    }
                                                    this.setState({
                                                        tempPlanningUnitArrayList: tempPlanningUnitArrayList,
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
                                                            data[1] = parseInt(papuList[j].planningUnit.id);
                                                            data[2] = papuList[j].skuCode;
                                                            data[3] = papuList[j].catalogPrice;
                                                            data[4] = papuList[j].moq;
                                                            data[5] = papuList[j].unitsPerPalletEuro1;
                                                            data[6] = papuList[j].unitsPerPalletEuro2;
                                                            data[7] = papuList[j].unitsPerContainer;
                                                            data[8] = papuList[j].volume;
                                                            data[9] = papuList[j].weight;
                                                            data[10] = papuList[j].active;
                                                            data[11] = papuList[j].procurementAgentPlanningUnitId;
                                                            data[12] = 0;
                                                            papuDataArr[count] = data;
                                                            count++;
                                                        }
                                                    }
                                                    if (papuDataArr.length == 0) {
                                                        data = [];
                                                        data[0] = this.props.match.params.procurementAgentId;
                                                        data[1] = "";
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = "";
                                                        data[5] = "";
                                                        data[6] = "";
                                                        data[7] = "";
                                                        data[8] = "";
                                                        data[9] = "";
                                                        data[10] = true;
                                                        data[11] = 0;
                                                        data[12] = 1;
                                                        papuDataArr[0] = data;
                                                    }
                                                    this.el = jexcel(document.getElementById("paputableDiv"), '');
                                                    jexcel.destroy(document.getElementById("paputableDiv"), true);
                                                    var data = papuDataArr;
                                                    var options = {
                                                        data: data,
                                                        columnDrag: false,
                                                        colWidths: [200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                        columns: [
                                                            {
                                                                title: i18n.t('static.procurementagent.procurementagent'),
                                                                type: 'dropdown',
                                                                source: programs,
                                                                readOnly: true
                                                            },
                                                            {
                                                                title: i18n.t('static.dashboard.product'),
                                                                type: 'autocomplete',
                                                                source: products,
                                                                filter: this.filterProduct
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                                                                type: 'text',
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                                                type: 'numeric',
                                                                textEditor: true,
                                                                decimal: '.',
                                                                mask: '#,##.00',
                                                                disabledMaskOnEdition: true
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgent.MOQ'),
                                                                type: 'numeric',
                                                                textEditor: true,
                                                                mask: '#,##',
                                                                disabledMaskOnEdition: true
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgent.UnitPerPalletEuro1'),
                                                                type: 'numeric',
                                                                mask: '#,##',
                                                                textEditor: true,
                                                                disabledMaskOnEdition: true
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgent.UnitPerPalletEuro2'),
                                                                type: 'numeric',
                                                                textEditor: true,
                                                                mask: '#,##',
                                                                disabledMaskOnEdition: true
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgent.UnitPerContainer'),
                                                                type: 'numeric',
                                                                mask: '#,##',
                                                                textEditor: true,
                                                                disabledMaskOnEdition: true
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgentPlanningUnit.volume'),
                                                                type: 'numeric',
                                                                decimal: '.',
                                                                textEditor: true,
                                                                mask: '#,##.000000',
                                                                disabledMaskOnEdition: true
                                                            },
                                                            {
                                                                title: i18n.t('static.procurementAgentPlanningUnit.weight'),
                                                                type: 'numeric',
                                                                textEditor: true,
                                                                decimal: '.',
                                                                mask: '#,##.000000',
                                                                disabledMaskOnEdition: true
                                                            },
                                                            {
                                                                title: i18n.t('static.checkbox.active'),
                                                                type: 'checkbox'
                                                            },
                                                            {
                                                                title: 'procurementAgentId',
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
                                                                            data[3] = "";
                                                                            data[4] = "";
                                                                            data[5] = "";
                                                                            data[6] = "";
                                                                            data[7] = "";
                                                                            data[8] = "";
                                                                            data[9] = "";
                                                                            data[10] = true;
                                                                            data[11] = 0;
                                                                            data[12] = 1;
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
                                                                            data[6] = "";
                                                                            data[7] = "";
                                                                            data[8] = "";
                                                                            data[9] = "";
                                                                            data[10] = true;
                                                                            data[11] = 0;
                                                                            data[12] = 1;
                                                                            obj.insertRow(data, parseInt(y));
                                                                        }.bind(this)
                                                                    });
                                                                }
                                                                if (obj.options.allowDeleteRow == true) {
                                                                    if (obj.getRowData(y)[11] == 0) {
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
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        } else if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        } else if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        } else if (x == 9 && !isNaN(rowData[9]) && rowData[9].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(9, y, parseFloat(rowData[9]), true);
        }
        elInstance.setValueFromCoords(12, y, 1, true);
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var data = [];
        data[0] = this.props.match.params.procurementAgentId;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = "";
        data[10] = true;
        data[11] = 0;
        data[12] = 1;
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
                var index = (instance).getValue(`L${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(0, data[i].y, this.props.match.params.procurementAgentId, true);
                    (instance).setValueFromCoords(11, data[i].y, 0, true);
                    (instance).setValueFromCoords(12, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    /**
     * Function to handle form submission and save data on server.
     */
    formSubmit = function () {
        var duplicateValidation = this.checkDuplicatePlanningUnit();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            this.setState({
                loading: false
            })
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("12")) === 1) {
                    let json = {
                        planningUnit: {
                            id: parseInt(map1.get("1")),
                        },
                        procurementAgent: {
                            id: parseInt(map1.get("0")),
                        },
                        skuCode: map1.get("2"),
                        catalogPrice: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        moq: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        unitsPerPalletEuro1: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        unitsPerPalletEuro2: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        unitsPerContainer: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        volume: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        weight: this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map1.get("10"),
                        procurementAgentPlanningUnitId: parseInt(map1.get("11"))
                    }
                    changedpapuList.push(json);
                }
            }
            ProcurementAgentService.addprocurementAgentPlanningUnitMapping(changedpapuList)
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
     * Function to check for duplicate planning units.
     * @returns Returns true if there are no duplicates, false otherwise.
     */
    checkDuplicatePlanningUnit = function () {
        var tableJson = this.el.getJson(null, false);
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => parseInt(v[Object.keys(v)[1]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.planningUnit.duplicatePlanningUnit'),
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
        this.setState({
            changedFlag: 1
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
        if (x != 12) {
            this.el.setValueFromCoords(12, y, 1, true);
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
            var value = this.el.getValueFromCoords(12, y);
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
     * Renders the Procurement agent planning unit mapping list.
     * @returns {JSX.Element} - Procurement agent planning unit mapping list.
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
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> {i18n.t('static.common.addRow')}</Button>
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
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
