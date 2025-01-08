import React, { Component } from "react";
import {
    Card, CardBody, 
    FormGroup,
    CardFooter, Button, Col} from 'reactstrap';
import { Date } from 'core-js';
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import SupplierService from "../../api/SupplierService";
import PlanningUnitService from "../../api/PlanningUnitService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import moment from "moment";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_DECIMAL_NO_REGEX, JEXCEL_DATE_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, API_URL } from "../../Constants";
// Initial values for form fields
let initialValues = {
    startDate: '',
    stopDate: '',
    supplier: [],
    capacity: ''
}
// Localized entity name
const entityname = i18n.t('static.dashboad.planningunitcapacity')
/**
 * Component for adding planning unit volume/capacity details.
 */
class PlanningUnitCapacity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            lang: localStorage.getItem('lang'),
            planningUnitCapacity: {},
            planningUnitCapacityId: '',
            suppliers: [],
            supplier: {
                supplierId: '',
                label: {
                    label_en: ''
                }
            }, supplierName: '',
            capacity: '',
            startDate: '',
            stopDate: '',
            rows: [],
            planningUnit: {
                planningUnitId: '',
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0
        }
        this.currentDate = this.currentDate.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addRow = this.addRow.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Calculate & return current date.
     * @returns {Date} - Current Date.
     */
    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        return date;
    }
    /**
     * Handles the add/edit of Planning Unit Volumes on submit.
     */
    submitForm() {
        var validation = this.checkValidation();
        if (validation) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var rd = this.el.getRowData(i);
                var map1 = new Map(Object.entries(rd));
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        planningUnitCapacityId: parseInt(map1.get("6")),
                        planningUnit: {
                            id: this.props.match.params.planningUnitId
                        }
                        ,
                        supplier: {
                            id: parseInt(map1.get("1")),
                        }
                        ,
                        startDate: moment(map1.get("2")).format("YYYY-MM-DD"),
                        stopDate: moment(map1.get("3")).format("YYYY-MM-DD"),
                        capacity: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map1.get("5"),
                    }
                    changedpapuList.push(json);
                }
            }
            PlanningUnitService.editPlanningUnitCapacity(changedpapuList)
                .then(response => {
                    if (response.status == 200) {
                        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        },
                            () => {
                                this.hideSecondComponent();
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
     * Filters the supplier/manufacturer list while searching.
     * @param {*} instance - This is the instance of the jExcel spreadsheet
     * @param {*} cell - This is the current cell object being filtered
     * @param {*} c - The column index.
     * @param {*} r - The row index
     * @param {*} source - The source data for the dropdown list (Supplier list) associated with the current cell.
     * @returns {Array} - Filtered array of supplier.
     */
    filterSupplier = function (instance, cell, c, r, source) {
        return this.state.supplierList.filter(c => c.active.toString() == "true");
    }.bind(this);
    /**
     * Builds the jexcel component to display planning unit volume list.
     */
    buildJExcel() {
        const { suppliers } = this.state;
        let supplierList = [];
        if (suppliers.length > 0) {
            for (var i = 0; i < suppliers.length; i++) {
                var paJson = {
                    name: getLabelText(suppliers[i].label, this.state.lang),
                    id: parseInt(suppliers[i].supplierId),
                    active: suppliers[i].active
                }
                supplierList[i] = paJson
            }
        }
        this.setState({
            supplierList: supplierList
        })
        var papuList = this.state.rows;
        var data = [];
        var papuDataArr = []
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
                data[1] = parseInt(papuList[j].supplier.id);
                data[2] = papuList[j].startDate;
                data[3] = papuList[j].stopDate;
                data[4] = papuList[j].capacity;
                data[5] = papuList[j].active;
                data[6] = papuList[j].planningUnitCapacityId;
                data[7] = 0;
                papuDataArr[count] = data;
                count++;
            }
        }
        if (papuDataArr.length == 0) {
            data = [];
            data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
            data[1] = "";
            data[2] = "";
            data[3] = "";
            data[4] = "";
            data[5] = true;
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
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.supplier'),
                    type: 'autocomplete',
                    source: supplierList,
                    filter: this.filterSupplier
                },
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT
                    }
                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT
                    }
                },
                {
                    title: i18n.t('static.planningunit.capacity'),
                    type: 'numeric',
                    mask: '#,##.00',
                    textEditor: true,
                    disabledMaskOnEdition: true
                },
                {
                    title: i18n.t('static.common.status'),
                    type: 'checkbox'
                },
                {
                    title: 'planningUnitId',
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
            editbale: true,
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
            copyCompatibility: true,
            onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            onload: this.loaded,
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    var rowData = elInstance.getRowData(y);
                    if(rowData[6]==0){
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }else{
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }
                }
            },
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
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
                                data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                data[5] = true;
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
                                data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                data[5] = true;
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
        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false
        })
    }
    /**
     * This function is called when cell value is edited & mark change in row.
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Column Number
     * @param {*} y - Row Number
     * @param {*} value - Cell Value
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        }
        this.el.setValueFromCoords(7, y, 1, true);
    }
    /**
     * This function is called when user pastes some data into the sheet
     * @param {*} instance - This is the sheet where the data is being placed
     * @param {*} data - This is the data that is being pasted
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(6, data[i].y, 0, true);
                    (instance).setValueFromCoords(7, data[i].y, 1, true);
                    (instance).setValueFromCoords(0, data[i].y, getLabelText(this.state.planningUnit.label, this.state.lang), true);
                    z = data[i].y;
                }
            }
        }
    }
    /**
     * Fetches Planning Unit, Planning Unit Capacity and all Supplier List from the server and builds the jexcel component on component mount.
     */
    componentDidMount() {
        //Fetch planning unit by id
        PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
            if (response.status == 200) {
                this.setState({
                    planningUnit: response.data,
                })
                //Fetch planning unit capacity for id
                PlanningUnitService.getPlanningUnitCapacityForId(this.props.match.params.planningUnitId).then(response => {
                    if (response.status == 200) {
                        this.setState({
                            planningUnitCapacity: response.data,
                            rows: response.data
                        })
                        //Fetch all supplier list
                        SupplierService.getSupplierListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        suppliers: listArray
                                    },
                                        () => {
                                            this.buildJExcel();
                                        })
                                } else {
                                    this.setState({
                                        message: response.data.messageCode, loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
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
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                this.hideSecondComponent();
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
            else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
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
     * Adds new row to the jexcel spreadsheet
     */
    addRow = function () {
        var data = [];
        data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = true;
        data[6] = 0;
        data[7] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };
    /**
     * Validate cell values on change.
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Column Number
     * @param {*} y - Row Number
     * @param {*} value - Cell Value
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
            var reg = /^[0-9\b]+$/;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 2 || x == 3) {
            if (moment(this.el.getValueFromCoords(2, y)).isSameOrBefore(moment(this.el.getValueFromCoords(3, y)))) {
                var col1 = ("C").concat(parseInt(y) + 1);
                var col2 = ("D").concat(parseInt(y) + 1);
                this.el.setStyle(col1, "background-color", "transparent");
                this.el.setComments(col1, "");
                this.el.setStyle(col2, "background-color", "transparent");
                this.el.setComments(col2, "");
            } else {
                var col1 = ("C").concat(parseInt(y) + 1);
                var col2 = ("D").concat(parseInt(y) + 1);
                this.el.setStyle(col1, "background-color", "transparent");
                this.el.setStyle(col1, "background-color", "yellow");
                this.el.setComments(col1, i18n.t('static.common.startdateCompare'));
                this.el.setStyle(col2, "background-color", "transparent");
                this.el.setStyle(col2, "background-color", "yellow");
                this.el.setComments(col2, i18n.t('static.common.startdateCompare'));
            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_NO_REGEX;
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
     * Updates change in cell value
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Column Number
     * @param {*} y - Row Number
     * @param {*} value - Cell Value
     */
    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(7, y, 1, true);
    }.bind(this);  

    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Row Number
     * @param {*} y - Column Number
     * @param {*} value - Cell Value 
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
    }
    /**
     * This function is called before saving/editing the planning unit volumes to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("H").concat(parseInt(y) + 1);
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
                if (value == "Invalid date" || value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                if (value == "Invalid date" || value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col1 = ("C").concat(parseInt(y) + 1);
                var col2 = ("D").concat(parseInt(y) + 1);
                if (moment(this.el.getValueFromCoords(2, y)).isSameOrBefore(moment(this.el.getValueFromCoords(3, y)))) {
                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setComments(col1, "");
                    this.el.setStyle(col2, "background-color", "transparent");
                    this.el.setComments(col2, "");
                } else {
                    this.el.setStyle(col1, "background-color", "transparent");
                    this.el.setStyle(col1, "background-color", "yellow");
                    this.el.setComments(col1, i18n.t('static.common.startdateCompare'));
                    this.el.setStyle(col2, "background-color", "transparent");
                    this.el.setStyle(col2, "background-color", "yellow");
                    this.el.setComments(col2, i18n.t('static.common.startdateCompare'));
                    valid = false;
                }
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX;
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
     * Renders the Planning Unit Volume/Capacity list.
     * @returns {JSX.Element} - the Planning Unit Volume list.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardBody className="p-0">
                        <Col xs="12" sm="12">
                            <div className="table-responsive consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                <div id="paputableDiv" >
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
                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> {i18n.t('static.common.addRow')}</Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
            </div >
        );
    }
    /**
     * Redirects to the list planning unit when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
export default PlanningUnitCapacity