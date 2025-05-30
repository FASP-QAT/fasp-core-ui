import CryptoJS from 'crypto-js';
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from "moment";
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import Picker from 'react-month-picker';
import { Prompt } from 'react-router';
import { checkValidation, changed, jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    FormGroup, Input, InputGroup,
    Label,
    Popover, PopoverBody
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import {
    API_URL,
    INDEXED_DB_NAME, INDEXED_DB_VERSION,
    JEXCEL_DECIMAL_CATELOG_PRICE,
    JEXCEL_INTEGER_REGEX,
    JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY,
    REPORT_DATEPICKER_END_MONTH,
    REPORT_DATEPICKER_START_MONTH,
    SECRET_KEY
} from '../../Constants.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import TracerCategoryService from '../../api/TracerCategoryService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import csvicon from '../../assets/img/csv.png';
import { addDoubleQuoteToRowContent, decryptFCData, encryptFCData } from '../../CommonComponent/JavascriptCommonFunctions.js';
const ref = React.createRef();
//Array of months
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
//Array of months
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]
/**
 * Sorts array
 * @param {*} sourceArray - Source array to be sorted
 * @returns {Array} - Sorted array
 */
const sortArray = (sourceArray) => {
    const sortByName = (a, b) => a.label.label_en.localeCompare(b.label.label_en, 'en', { numeric: true });
    return sourceArray.sort(sortByName);
};
/**
 * Component for adding/listing planning unit details.
 */
export default class PlanningUnitSetting extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            popoverOpenProgramSetting: false,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            selsource: [],
            loading: true,
            datasetId: '',
            datasetList: [],
            datasetList1: [],
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: '',
            allowAdd: false,
            allTracerCategoryList: [],
            allPlanningUnitList: [],
            originalPlanningUnitList: [],
            allProcurementAgentList: [],
            selectedForecastProgram: '',
            filterProcurementAgent: '',
            responsePa: [],
            forecastProgramId: '',
            forecastProgramVersionId: '',
            isChanged1: false,
            productCategoryList: [],
            productCategoryListNew: [],
            planningUnitList: [],
            lang: localStorage.getItem('lang'),
            isPlanningUnitLoaded: false,
            tempSortOrder: '',
            sortOrderLoading: true,
            tempPlanningUnitList: [],
            dropdownList: [],
            active: 1
        }
        this.toggleProgramSetting = this.toggleProgramSetting.bind(this);
        this.changed = this.changed.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.tracerCategoryList = this.tracerCategoryList.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.disablePUNode = this.disablePUNode.bind(this);
        this.disablePUConsumptionData = this.disablePUConsumptionData.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.productCategoryList = this.productCategoryList.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
    }
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Redirects to the dashboard when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }
    /**
     * This function is called before saving/editing the planning unit details to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false).concat(this.state.outPutListArray2);
        valid = checkValidation(this.el)
        for (var y = 0; y < json.length; y++) {
            //planning unit
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getRowData(parseInt(y))[1];
            for (var i = (json.length - 1); i >= 0; i--) {
                var map = new Map(Object.entries(json[i]));
                var planningUnitValue = map.get("1");
                if (planningUnitValue == value && y != i && i > y) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                    i = -1;
                    valid = false;
                }
            }
            if (!valid) {
                this.setState({
                    message: i18n.t('static.supplyPlan.validationFailed'),
                    color: 'red'
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
        }
        return valid;
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
        this.setState({
            tempPlanningUnitList: elInstance.getConfig().columns[1].source
        }, () => {
        })
        var rowData = elInstance.getRowData(y);
        var reg = /^0[0-9].*$/;
        if (x == 9 && !isNaN(rowData[9]) && rowData[9].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(9, y, parseFloat(rowData[9]), true);
        }
        if (x == 9 && reg.test(value)) {
            elInstance.setValueFromCoords(9, y, Number(rowData[9]), true);
        }
        elInstance.setValueFromCoords(11, y, 1, true);
        if (x == 1) {
            PlanningUnitService.getPlanningUnitById(rowData[1]).then(response => {
                if (response.status == 200) {
                    elInstance.setValueFromCoords(2, y, (response.data.multiplier).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), true);
                }
            })
        }
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
                var index = (instance).getValue(`O${parseInt(data[i].y) + 1}`, true);
                if (index == 0 || index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(10, data[i].y, true, true);
                    (instance).setValueFromCoords(11, data[i].y, 1, true);
                    (instance).setValueFromCoords(12, data[i].y, 1, true);
                    (instance).setValueFromCoords(13, data[i].y, {}, true);
                    (instance).setValueFromCoords(14, data[i].y, 0, true);
                    (instance).setValueFromCoords(15, data[i].y, true, true);
                    (instance).setValueFromCoords(17, data[i].y, true, true);
                    z = data[i].y;
                }
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(3, data[i].y, true, true);
                    (instance).setValueFromCoords(4, data[i].y, true, true);
                }
            }
            if (data[i].x == 0) {
                var index = (instance).getValue(`O${parseInt(data[i].y) + 1}`, true);
                if(index==0){
                    // let pCatList = this.state.productCategoryListNew;

                    let inputText = data[i].value;

                    // Replace non-breaking spaces with regular spaces
                    let cleanedText = inputText.replace(/\u00A0/g, " ");

                    // Replace zero-width spaces (if any)
                    cleanedText = cleanedText.replace(/\u200B/g, "");

                    // Remove any line breaks (if any)
                    cleanedText = cleanedText.replace(/(\r\n|\n|\r)/gm, "");

                    // let index = pCatList.findIndex(c => c.name == cleanedText);
                    
                    (instance).setValueFromCoords(0, data[i].y, cleanedText, true);
                }
            }
            if (data[i].x == 1) {
                var index = (instance).getValue(`O${parseInt(data[i].y) + 1}`, true);
                if(index==0){

                //=====code to clear formatting in text=====

                let inputText = data[i].value;

                // Replace non-breaking spaces with regular spaces
                let cleanedText = inputText.replace(/\u00A0/g, " ");

                // Replace zero-width spaces (if any)
                cleanedText = cleanedText.replace(/\u200B/g, "");

                // Remove any line breaks (if any)
                cleanedText = cleanedText.replace(/(\r\n|\n|\r)/gm, "");

                //=====end of code to clear formatting=====

                // let temp = data[i].value.split(" | ");
                let temp = cleanedText.split(" | ");
                let temp_obj = {
                    id: parseInt(temp[1]),
                    name: cleanedText
                };
                let temp_list = this.state.dropdownList;
                // temp_list[data[i].y] = temp_obj;

                    let index = temp_list.findIndex(c => c.id == temp_obj.id);
                    if (index == -1) {
                        //if new planning unit push to list
                        temp_list.push(temp_obj);
                    }
                    // else {
                    //     continue loop1;
                    // }                

                this.setState(
                    {
                        dropdownList: temp_list
                    }, () => {
                        // (instance).setValueFromCoords(1, data[i].y, '', true);//temp added
                        (instance).setValueFromCoords(1, data[i].y, cleanedText, true);
                    }
                )
                }
            }
        }
    }
    /**
     * Validate cell values on change.
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Column Number
     * @param {*} y - Row Number
     * @param {*} value - Cell Value
     */
    changed = function (instance, cell, x, y, value) {
        changed(instance, cell, x, y, value)

        if (x == 8) {
            if (value != -1 && value !== null && value !== '') {
                let planningUnitId = this.el.getValueFromCoords(1, y);
                let procurementAgentPlanningUnitList = this.state.originalPlanningUnitList;
                let tempPaList = procurementAgentPlanningUnitList.filter(c => c.planningUnitId == planningUnitId)[0];
                if (localStorage.getItem('sessionType') === 'Online') {
                    PlanningUnitService.getPlanningUnitWithPricesByIds([planningUnitId])
                        .then(response => {
                            if (response.status == 200) {
                                if (response.data.length > 0) {
                                    let obj = response.data[0].procurementAgentPriceList.filter(c => c.id == value)[0];
                                    if (typeof obj != 'undefined') {
                                        this.el.setValueFromCoords(9, y, obj.price, true);
                                    } else {
                                        let q = '';
                                        q = (this.el.getValueFromCoords(9, y) != '' ? this.el.setValueFromCoords(9, y, '', true) : '');
                                    }
                                }
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
                    this.el.setValueFromCoords(9, y, '', true);
                }
            } else {
            }
        }
        if (x == 0) {
            let q = '';
            q = (this.el.getValueFromCoords(1, y) != '' ? this.el.setValueFromCoords(1, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
            q = (this.el.getValueFromCoords(9, y) != '' ? this.el.setValueFromCoords(9, y, '', true) : '');
        }
        if (x == 1) {
            let q = '';
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
            q = (this.el.getValueFromCoords(9, y) != '' ? this.el.setValueFromCoords(9, y, '', true) : '');
            this.el.getCell(("B").concat(parseInt(y) + 1)).classList.remove('typing-' + this.state.lang);
        }

        //planning unit
        if (x == 1) {
            var json = this.el.getJson(null, false).concat(this.state.outPutListArray2);
            var col = ("B").concat(parseInt(y) + 1);

            var jsonLength = parseInt(json.length) - 1;
            for (var i = jsonLength; i >= 0; i--) {
                var map = new Map(Object.entries(json[i]));
                var planningUnitValue = map.get("1");
                if (planningUnitValue == value && y != i) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                    // this.el.setValueFromCoords(11, y, 1, true);
                    i = -1;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    // this.el.setValueFromCoords(11, y, 1, true);
                }
            }
        }


        //procurement Agent
        if (x == 8) {
        }
        if (this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "") > 0 && this.el.getValue(`I${parseInt(y) + 1}`, true) == "") {
            this.el.setValueFromCoords(8, y, -1, true);
        }

        this.setState({
            isChanged1: true,
        });
        if (x == 12) {
            this.el.setStyle(`A${parseInt(y) + 1}`, 'text-align', 'left');
            this.el.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
            if (value == 1 || value == "") {
                var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
            }
        }
        if (x == 17) {
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
            if (this.el.getValueFromCoords(17, y).toString() == "true") {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = this.el.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.remove('shipmentEntryDoNotInclude');
                }
            } else {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = this.el.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('shipmentEntryDoNotInclude');
                }
            }
        }
    }
    /**
     * Fetch tracer category list
     */
    tracerCategoryList() {
        //Fetch all tracer category list
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    if (listArray.length > 0) {
                        sortArray(listArray);
                    }
                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].tracerCategoryId),
                                active: listArray[i].active,
                                healthArea: listArray[i].healthArea
                            }
                            tempList[i] = paJson
                        }
                    }
                    tempList.unshift({
                        name: 'All',
                        id: -1,
                        active: true,
                        healthArea: {}
                    });
                    this.setState({
                        allTracerCategoryList: tempList,
                    },
                        () => {
                            this.procurementAgentList();
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
    }
    /**
     * Fetch procurement agent list & sort it.
     */
    procurementAgentList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
            var procurementAgentRequest = procurementAgentOs.getAll();
            var planningList = []
            procurementAgentRequest.onerror = function (event) {
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            };
            procurementAgentRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = procurementAgentRequest.result;
                var listArray = myResult;
                listArray.sort((a, b) => {
                    var itemLabelA = (a.procurementAgentCode).toUpperCase();
                    var itemLabelB = (b.procurementAgentCode).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: listArray[i].procurementAgentCode,
                            id: parseInt(listArray[i].procurementAgentId),
                            active: listArray[i].active,
                            code: listArray[i].procurementAgentCode,
                            label: listArray[i].label
                        }
                        tempList[i] = paJson
                    }
                }
                tempList.unshift({
                    name: 'CUSTOM',
                    id: -1,
                    active: true,
                    code: 'CUSTOM',
                    label: {}
                });
                this.setState({
                    allProcurementAgentList: tempList,
                },
                    () => {
                        //Fetch product category list
                        this.productCategoryList();
                    })
            }.bind(this);
        }.bind(this)
    }
    /**
     * Fetches Database List from the server on component mount.
     */
    componentDidMount() {
        this.getDatasetList();
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * Sets the `onbeforeunload` event handler of the window object after the component updates 
     */
    componentDidUpdate = () => {
        if (this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * Fetch database list
     */
    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();
            var datasetList = [];
            var datasetList1 = [];
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                for (var i = 0; i < filteredGetRequestList.length; i++) {
                    var programJson1 = decryptFCData(filteredGetRequestList[i].programData);
                    datasetList.push({
                        programCode: filteredGetRequestList[i].programCode,
                        programVersion: filteredGetRequestList[i].version,
                        programId: filteredGetRequestList[i].programId,
                        versionId: filteredGetRequestList[i].version,
                        id: filteredGetRequestList[i].id,
                        loading: false,
                        forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                        forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                        healthAreaList: programJson1.healthAreaList,
                        consumptionList: programJson1.consumptionList,
                        regionList: programJson1.regionList,
                        label: programJson1.label,
                        realmCountry: programJson1.realmCountry,
                        planningUnitList: programJson1.planningUnitList,
                        treeList: programJson1.treeList
                    });
                    datasetList1.push(filteredGetRequestList[i])
                }
                datasetList = datasetList.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                if (localStorage.getItem("sesForecastProgramIdReport") != '' && localStorage.getItem("sesForecastProgramIdReport") != undefined && localStorage.getItem("sesForecastVersionIdReport") != '' && localStorage.getItem("sesForecastVersionIdReport") != undefined && !localStorage.getItem("sesForecastVersionIdReport").includes('Local')) {
                    this.setState({
                        datasetList: datasetList,
                        datasetList1: datasetList1,
                        forecastProgramId: localStorage.getItem("sesForecastProgramIdReport"),
                        forecastProgramVersionId: localStorage.getItem("sesForecastVersionIdReport"),
                        datasetId: (datasetList.filter(c => c.programId == localStorage.getItem("sesForecastProgramIdReport") && c.programVersion == localStorage.getItem("sesForecastVersionIdReport")).length > 0 ? datasetList.filter(c => c.programId == localStorage.getItem("sesForecastProgramIdReport") && c.programVersion == localStorage.getItem("sesForecastVersionIdReport"))[0].id : ''),
                    }, () => {
                        this.procurementAgentList();
                    })
                } else {
                    this.setState({
                        datasetList: datasetList,
                        datasetList1: datasetList1,
                        forecastProgramId: (datasetList.length == 1 ? datasetList[0].programId : ''),
                        forecastProgramVersionId: (datasetList.length == 1 ? datasetList[0].programVersion : ''),
                        datasetId: (datasetList.length == 1 ? datasetList[0].id : ''),
                    }, () => {
                        this.procurementAgentList();
                    })
                }
            }.bind(this);
        }.bind(this);
    }
    /**
     * Handles change in forecastProgramId.
     * @param {Event} event - The change event.
     */
    setProgramId(event) {
        var pID = document.getElementById("forecastProgramId").value;
        if (pID != 0) {
            this.setState({
                dropdownList: [],
                loading: true
            })
            let programSplit = pID.split('_');
            let programId = programSplit[0];
            let versionId = programSplit[1];
            versionId = versionId.replace(/[^\d]/g, '');
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0]
            var myResult1 = selectedForecastProgram.planningUnitList;
            if (myResult1.length > 0) {
                var original = myResult1.map(o => o.planningUnit);
                var listArray = myResult1;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].planningUnit.label, this.state.lang) + ' | ' + parseInt(listArray[i].planningUnit.id),
                            id: parseInt(listArray[i].planningUnit.id),
                            label: listArray[i].planningUnit.label
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    loading: false,
                    allPlanningUnitList: tempList,
                    originalPlanningUnitList: original,
                    planningUnitList: myResult1,
                }, () => {
                    let forecastStartDate = selectedForecastProgram.forecastStartDate;
                    let forecastStopDate = selectedForecastProgram.forecastStopDate;
                    let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
                    beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
                    localStorage.setItem("sesForecastProgramIdReport", parseInt(programId));
                    localStorage.setItem("sesForecastVersionIdReport", parseInt(versionId));
                    this.setState({
                        rangeValue: { from: { year: new Date(forecastStartDate).getFullYear(), month: new Date(forecastStartDate).getMonth() + 1 }, to: { year: new Date(forecastStopDate).getFullYear(), month: new Date(forecastStopDate).getMonth() + 1 } },
                        startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                        endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                        beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
                        forecastProgramId: parseInt(programId),
                        forecastProgramVersionId: parseInt(versionId),
                        datasetId: selectedForecastProgram.id,
                    }, () => {
                        this.filterData();
                    })
                });
            } else {
                this.getPlanningUnitList(0);
            }
        } else {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
            var dt1 = new Date();
            dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
            this.setState(
                {
                    rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
                    startDateDisplay: '',
                    endDateDisplay: '',
                    forecastProgramId: 0,
                    forecastProgramVersionId: 0,
                    datasetId: '',
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                    this.filterData();
                })
        }
    }
    /**
     * Fetch product category list & filter it.
     */
    productCategoryList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
            var productCategoryOs = productCategoryTransaction.objectStore('productCategory');
            var productCategoryRequest = productCategoryOs.getAll();
            var planningList = []
            productCategoryRequest.onerror = function (event) {
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            };
            productCategoryRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = productCategoryRequest.result;
                myResult = myResult.filter(c => c.payload.active == true || c.payload.realm.id == 0);
                var productCategoryListNew = [];
                for (var k = 0; k < (myResult).length; k++) {
                    var spaceCount = myResult[k].sortOrder.split(".").length;
                    var indendent = "";
                    for (var p = 1; p <= spaceCount - 1; p++) {
                        if (p == 1) {
                            indendent = indendent.concat("|_");
                        } else {
                            indendent = indendent.concat("_");
                        }
                    }
                    var productCategoryJson = {};
                    if (myResult[k].payload.productCategoryId == 0) {
                        productCategoryJson = {
                            name: (myResult[k].payload.label.label_en),
                            id: -1
                        }
                    } else {
                        productCategoryJson = {
                            name: (myResult[k].payload.label.label_en),
                            id: myResult[k].payload.productCategoryId
                        }
                    }
                    productCategoryListNew.push(productCategoryJson);
                }
                const ids = productCategoryListNew.map(o => o.id)
                let filteredEQUnit = productCategoryListNew.filter(({ id }, index) => !ids.includes(id, index + 1))
                filteredEQUnit.sort((a, b) => {
                    var itemLabelA = a.name.toUpperCase();
                    var itemLabelB = b.name.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    productCategoryList: myResult,
                    productCategoryListNew: filteredEQUnit
                }, () => {
                    this.setProgramId();
                });
            }.bind(this);
        }.bind(this)
    }
    setStatus(event) {
        this.setState({
            active: event.target.value
        }, () => {
            this.filterData();
        })
    }
    /**
     * Filters the Planning Unit list according to the programId & builds the jexcel.
     */
    filterData(addRowInJexcel) {
        var forecastProgramId = this.state.forecastProgramId;
        if (forecastProgramId > 0) {
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == this.state.forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];
            let planningUnitList = selectedForecastProgram.planningUnitList;
            // if(this.state.active!=-1){
            //     if(this.state.active==1){
            //         planningUnitList=planningUnitList.filter(c=>c.active.toString()=="true");
            //     }else{
            //         planningUnitList=planningUnitList.filter(c=>c.active.toString()=="false");
            //     }
            // }
            planningUnitList.sort((a, b) => {
                var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState(
                {
                    selsource: planningUnitList,
                    loading: true,
                    selectedForecastProgram: selectedForecastProgram,
                }, () => {
                    this.buildJExcel(addRowInJexcel);
                })
        } else {
            this.setState(
                {
                    allowAdd: false,
                    loading: false
                }, () => {
                })
        }
    }
    /**
     * Handles change in daterange
     * @param {*} value 
     * @param {*} text 
     * @param {*} listIndex 
     */
    handleRangeChange(value, text, listIndex) {
    }
    /**
     * Handles closing of daterange picker
     * @param {*} value 
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.filterData();
        })
    }
    /**
     * Handles click on daterange picker
     * @param {*} e 
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    //Formats the daterange
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    /**
     * Builds the jexcel component to display the Planning Unit list.
     */
    buildJExcel(addRowInJexcel) {
        let outPutList = this.state.selsource;
        let outPutListArray = [];
        let outPutListArray2 = [];
        let count = 0;
        let indexVar = 1;
        let dropdownList = this.state.dropdownList;
        for (var j = 0; j < outPutList.length; j++) {
            data = [];

            let index = dropdownList.findIndex(c => c.id == outPutList[j].planningUnit.id);

            if(index == -1) {
                //if new planning unit push to list
                dropdownList.push({
                    id: outPutList[j].planningUnit.id,
                    name: outPutList[j].planningUnit.label.label_en + " | " + outPutList[j].planningUnit.id
                });
            }

            // dropdownList[j] = {
            //     id: outPutList[j].planningUnit.id,
            //     name: outPutList[j].planningUnit.label.label_en + " | " + outPutList[j].planningUnit.id
            // };
            data[0] = outPutList[j].planningUnit.forecastingUnit.productCategory.id
            data[1] = outPutList[j].planningUnit.id;
            data[2] = (outPutList[j].planningUnit.multiplier).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
            data[3] = outPutList[j].consuptionForecast
            data[4] = outPutList[j].treeForecast;
            data[5] = outPutList[j].stock;
            data[6] = outPutList[j].existingShipments;
            data[7] = outPutList[j].monthsOfStock;
            data[8] = (outPutList[j].price === "" || outPutList[j].price == null || outPutList[j].price == undefined) ? "" : (outPutList[j].procurementAgent == null || outPutList[j].procurementAgent == undefined ? -1 : outPutList[j].procurementAgent.id);
            data[9] = outPutList[j].price;
            data[10] = outPutList[j].programPlanningUnitId;
            data[11] = 0;
            data[12] = 0;
            data[13] = outPutList[j].selectedForecastMap;
            data[14] = indexVar;
            data[15] = outPutList[j].treeForecast;
            data[16] = outPutList[j].planningUnitNotes;
            data[17] = outPutList[j].active;
            data[18] = outPutList[j].active;
            if ((this.state.active == 0 && outPutList[j].active.toString() == "false") || (this.state.active == 1 && outPutList[j].active.toString() == "true") || (this.state.active == -1)) {
                outPutListArray.push(data);
            } else {
                outPutListArray2.push(data);
            }
            count++;
            indexVar = indexVar + 1;
        }
        if (outPutList.length == 0) {
            data = [];
            data[0] = -1;
            data[1] = "";
            data[2] = "";
            data[3] = true;
            data[4] = true;
            data[5] = "";
            data[6] = "";
            data[7] = "";
            data[8] = "";
            data[9] = "";
            data[10] = 0;
            data[11] = 1;
            data[12] = 1;
            data[13] = {};
            data[14] = 0;
            data[15] = true;
            data[16] = "";
            data[17] = true;
            data[18] = true;
            outPutListArray[0] = data;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = outPutListArray;
        this.setState({ dropdownList: dropdownList })
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 150, 60, 60, 60, 60, 60, 100, 60, 60, 60, 60, 60, 60, 60, 100, 60, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.productCategory.productCategory'),
                    type: 'autocomplete',
                    source: this.state.productCategoryListNew,
                    width: 150,
                    required: true
                    // readOnly: true// 0A
                },
                {
                    title: i18n.t('static.dashboard.planningunitheader'),
                    type: 'dropdown',
                    source: dropdownList,
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
                    filter: this.filterPlanningUnitList,
                    width: '150',
                    required: true
                    // readOnly: true //1B
                },
                {
                    title: i18n.t('static.conversion.ConversionFactorFUPU'),
                    type: 'text',
                    readOnly: true,
                },
                {
                    title: i18n.t('static.commitTree.consumptionForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: i18n.t('static.planningUnitSetting.stockEndOf') + ' ' + this.state.beforeEndDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number: true,
                    decimal: false,
                    regex: {
                        ex: JEXCEL_INTEGER_REGEX,
                        text: i18n.t('static.planningUnitSetting.10digitWholeNumber')
                    }
                    // readOnly: true //4E
                },
                {
                    title: i18n.t('static.planningUnitSetting.existingShipments') + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number: true,
                    decimal: false,
                    regex: {
                        ex: JEXCEL_INTEGER_REGEX,
                        text: i18n.t('static.planningUnitSetting.10digitWholeNumber')
                    }
                    // readOnly: true //5F
                },
                {
                    title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock') + ' ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    disabledMaskOnEdition: true,
                    width: '150',
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number: true,
                    decimal: false,
                    maxValue: {
                        value: 99,
                        text: i18n.t('static.planningUnitSetting.max99MonthAllowed')
                    },
                    regex: {
                        ex: JEXCEL_INTEGER_REGEX,
                        text: i18n.t('static.planningUnitSetting.10digitWholeNumber')
                    }
                    // readOnly: true //6G
                },
                {
                    title: i18n.t('static.forecastReport.priceType'),
                    type: 'autocomplete',
                    source: this.state.allProcurementAgentList,
                    width: '120',
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: i18n.t('static.forecastReport.unitPrice'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    width: '120',
                    disabledMaskOnEdition: true,
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number: true,
                    minValue: {
                        value: 0,
                        text: i18n.t('static.planningUnitSetting.negativeValueNotAllowed')
                    },
                    regex: {
                        ex: JEXCEL_DECIMAL_CATELOG_PRICE,
                        text: i18n.t('static.planningUnitSetting.max10Digit4AfterDecimal')
                    }
                    // readOnly: true //8I
                },
                {
                    title: 'programPlanningUnitId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'isChange',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'isNewRowAdded',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'selected forecast map',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'indexVar',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'treeForecast',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: 'Active',
                    type: 'checkbox',
                    readOnly: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: 'active',
                    type: 'hidden',
                    readOnly: true
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            allowDeleteRow: true,
            onchange: this.changed,
            onpaste: this.onPaste,
            onchangepage: this.onchangepage,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (localStorage.getItem("sessionType") === 'Online') {
                        if (obj.options.allowInsertRow == true && this.state.forecastProgramId != "" && AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) {
                            items.push({
                                title: i18n.t('static.common.addRow'),
                                onclick: function () {
                                    this.getPlanningUnitList(1);
                                }.bind(this)
                            });
                        }
                    }
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[12] == 1) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                        }
                    }
                }
                return items;
            }.bind(this),
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
            oneditionend: this.oneditionend,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
            editable: (this.state.forecastProgramId != "" && (AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? true : false),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false, allowAdd: true, tempPlanningUnitList: dropdownList, outPutListArray2: outPutListArray2
        }, () => {
            if (addRowInJexcel) {
                this.addRow();
            }
        })
    }
    /**
     * Resets the Planning Unit list
     * @param {*} instance - This is the instance of the jExcel spreadsheet
     * @param {*} cell - This is the current cell object being filtered
     * @param {*} c - The column index.
     * @param {*} r - The row index
     * @param {*} source - The source data for the dropdown list associated with the current cell.
     * @returns {Array} - Empty Array.
     */
    filterPlanningUnitList = function (instance, cell, c, r, source) {
        var mylist = [];
        return mylist;
    }.bind(this)
    /**
     * Handles page change
     * @param {*} el - The reference to the jExcel spreadsheet element.
     * @param {*} pageNo - The page number that the user has navigated to.
     * @param {*} oldPageNo - The page number that the user was previously on before navigating to the new page.
     */
    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var j = start; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            var programPlanningUnitId = rowData[12];
            elInstance.setStyle(`A${parseInt(j) + 1}`, 'text-align', 'left');
            elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');
            if (programPlanningUnitId == 1) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
            if (elInstance.getValueFromCoords(17, j).toString() == "true") {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                    cell.classList.remove('shipmentEntryDoNotInclude');
                }
            } else {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                    cell.classList.add('shipmentEntryDoNotInclude');
                }
            }
        }
    }
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
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('InfoTr');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');
        tr.children[6].title = i18n.t('static.tooltip.Stock');
        tr.children[7].title = i18n.t('static.tooltip.ExistingShipments');
        tr.children[8].title = i18n.t('static.tooltip.DesiredMonthsofStock');
        tr.children[9].title = i18n.t('static.tooltip.PriceType');
        tr.children[3].title = i18n.t('static.tooltip.conversionFactorPU');
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson();
        var jsonLength;
        if ((document.getElementsByClassName("jss_pagination_dropdown")[0] != undefined)) {
            jsonLength = 1 * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        }
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        for (var j = 0; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            var programPlanningUnitId = rowData[12];
            elInstance.setStyle(`A${parseInt(j) + 1}`, 'text-align', 'left');
            elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');
            if (programPlanningUnitId == 1) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }

            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
            if (elInstance.getValueFromCoords(17, j).toString() == "true") {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                    cell.classList.remove('shipmentEntryDoNotInclude');
                }
            } else {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                    cell.classList.add('shipmentEntryDoNotInclude');
                }
            }
        }
    }
    /**
     * Handles the add/edit of Planning Unit on submit.
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({
                loading: true,
                isPlanningUnitLoaded: false
            })
            var tableJson = this.el.getJson(null, false);
            var programs = [];
            var planningUnitList = [];
            let indexVar = 0;
            var program = (this.state.datasetList1.filter(x => x.programId == this.state.forecastProgramId && x.version == this.state.forecastProgramVersionId)[0]);
            var programData = decryptFCData(program.programData);
            let originalPlanningUnitList = programData.planningUnitList;
            let listOfDisablePuNode = [];
            let planningUnitIds = [];
            for (let i = 0; i < tableJson.length; i++) {
                planningUnitIds.push(parseInt(tableJson[i][1]));
            }
            if (localStorage.getItem("sessionType") === 'Online') {
                PlanningUnitService.getPlanningUnitByIds(planningUnitIds).then(response => {
                    this.setState({
                        allPlanningUnitList: response.data,
                        originalPlanningUnitList: response.data,
                        planningUnitList: response.data,
                    }, () => {
                        for (var i = 0; i < tableJson.length; i++) {
                            var map1 = new Map(Object.entries(tableJson[i]));
                            let planningUnitObj = this.state.originalPlanningUnitList.filter(c => c.planningUnitId == parseInt(map1.get("1")))[0];
                            let procurementAgentObj = "";
                            if (parseInt(map1.get("8")) === -1) {
                                procurementAgentObj = null
                            } else {
                                procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("8")))[0];
                            }
                            if (parseInt(map1.get("12")) == 1) {
                                let tempJson = {
                                    "programPlanningUnitId": parseInt(map1.get("10")),
                                    "planningUnit": {
                                        "id": parseInt(map1.get("1")),
                                        "label": planningUnitObj.label,
                                        "unit": planningUnitObj.unit,
                                        "multiplier": planningUnitObj.multiplier,
                                        "forecastingUnit": {
                                            "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                            "label": planningUnitObj.forecastingUnit.label,
                                            "unit": planningUnitObj.forecastingUnit.unit,
                                            "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                            "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                            "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                                        },
                                        "idString": "" + parseInt(map1.get("1"))
                                    },
                                    "consuptionForecast": map1.get("3"),
                                    "treeForecast": map1.get("4"),
                                    "stock": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "existingShipments": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "monthsOfStock": this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "procurementAgent": (procurementAgentObj == null ? null : {
                                        "id": parseInt(map1.get("8")),
                                        "label": procurementAgentObj.label,
                                        "code": procurementAgentObj.code,
                                        "idString": "" + parseInt(map1.get("8"))
                                    }),
                                    "price": this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "higherThenConsumptionThreshold": null,
                                    "lowerThenConsumptionThreshold": null,
                                    "planningUnitNotes": map1.get("16"),
                                    "consumptionDataType": 1,
                                    "otherUnit": null,
                                    "selectedForecastMap": map1.get("13"),
                                    "createdBy": null,
                                    "createdDate": null,
                                    "active": map1.get("17"),
                                }
                                planningUnitList.push(tempJson);
                            } else {
                                let planningUnitobj1 = originalPlanningUnitList[indexVar];
                                let tempJson = {
                                    "programPlanningUnitId": parseInt(map1.get("10")),
                                    "planningUnit": {
                                        "id": parseInt(map1.get("1")),
                                        "label": planningUnitObj.label,
                                        "unit": planningUnitObj.unit,
                                        "multiplier": planningUnitObj.multiplier,
                                        "forecastingUnit": {
                                            "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                            "label": planningUnitObj.forecastingUnit.label,
                                            "unit": planningUnitObj.forecastingUnit.unit,
                                            "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                            "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                            "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                                        },
                                        "idString": "" + parseInt(map1.get("1"))
                                    },
                                    "consuptionForecast": map1.get("3"),
                                    "treeForecast": map1.get("4"),
                                    "stock": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "existingShipments": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "monthsOfStock": this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "procurementAgent": (procurementAgentObj == null ? null : {
                                        "id": parseInt(map1.get("8")),
                                        "label": procurementAgentObj.label,
                                        "code": procurementAgentObj.code,
                                        "idString": "" + parseInt(map1.get("8"))
                                    }),
                                    "price": this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "higherThenConsumptionThreshold": planningUnitobj1.higherThenConsumptionThreshold,
                                    "lowerThenConsumptionThreshold": planningUnitobj1.lowerThenConsumptionThreshold,
                                    "planningUnitNotes": map1.get("16"),
                                    "consumptionDataType": planningUnitobj1.consumptionDataType,
                                    "otherUnit": planningUnitobj1.otherUnit,
                                    "selectedForecastMap": map1.get("13"),
                                    "createdBy": planningUnitobj1.createdBy,
                                    "createdDate": planningUnitobj1.createdDate,
                                    "active": map1.get("17"),
                                }
                                planningUnitList.push(tempJson);
                                indexVar = indexVar + 1;
                            }
                            if (map1.get("4") == false && map1.get("15") == true) {
                                listOfDisablePuNode.push(parseInt(map1.get("1")));
                            }
                            if (map1.get("17") == false && map1.get("18") == true) {
                                listOfDisablePuNode.push(parseInt(map1.get("1")));
                            }
                        }
                        programData.planningUnitList = planningUnitList.concat(this.state.active != -1 ? originalPlanningUnitList.filter(c => this.state.active == 1 ? c.active.toString() == "false" : c.active.toString() == "true") : []);
                        programData = encryptFCData(programData);
                        program.programData = programData;
                        programs.push(program);
                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['datasetData'], 'readwrite');
                            var programTransaction = transaction.objectStore('datasetData');
                            programs.forEach(program => {
                                var programRequest = programTransaction.put(program);
                            })
                            transaction.oncomplete = function (event) {
                                db1 = e.target.result;
                                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                                var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                                datasetDetailsRequest.onsuccess = function (e) {
                                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                                    datasetDetailsRequestJson.changed = 1;
                                    var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                                    datasetDetailsRequest1.onsuccess = function (event) {
                                    }
                                }
                                this.setState({
                                    dropdownList: [],
                                    message: i18n.t('static.mt.dataUpdateSuccess'),
                                    color: "green",
                                    isChanged1: false,
                                }, () => {
                                    listOfDisablePuNode = [...new Set(listOfDisablePuNode)];
                                    if (listOfDisablePuNode.length > 0) {
                                        this.disablePUNode(listOfDisablePuNode);
                                        this.disablePUConsumptionData(listOfDisablePuNode);
                                    }
                                    this.getDatasetList();
                                    this.hideSecondComponent();
                                });
                            }.bind(this);
                            transaction.onerror = function (event) {
                                this.setState({
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    this.hideSecondComponent();
                                });
                            }.bind(this);
                        }.bind(this);
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    let planningUnitObj = originalPlanningUnitList.filter(c => c.planningUnit.Id == parseInt(map1.get("1")))[0];
                    let procurementAgentObj = "";
                    if (parseInt(map1.get("8")) === -1) {
                        procurementAgentObj = null
                    } else {
                        procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("8")))[0];
                    }
                    if (parseInt(map1.get("12")) == 1) {
                        let tempJson = {
                            "programPlanningUnitId": parseInt(map1.get("10")),
                            "planningUnit": {
                                "id": parseInt(map1.get("1")),
                                "label": planningUnitObj.label,
                                "unit": planningUnitObj.unit,
                                "multiplier": planningUnitObj.multiplier,
                                "forecastingUnit": {
                                    "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                    "label": planningUnitObj.forecastingUnit.label,
                                    "unit": planningUnitObj.forecastingUnit.unit,
                                    "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                    "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                    "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                                },
                                "idString": "" + parseInt(map1.get("1"))
                            },
                            "consuptionForecast": map1.get("3"),
                            "treeForecast": map1.get("4"),
                            "stock": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "existingShipments": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "monthsOfStock": this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "procurementAgent": (procurementAgentObj == null ? null : {
                                "id": parseInt(map1.get("8")),
                                "label": procurementAgentObj.label,
                                "code": procurementAgentObj.code,
                                "idString": "" + parseInt(map1.get("8"))
                            }),
                            "price": this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "higherThenConsumptionThreshold": null,
                            "lowerThenConsumptionThreshold": null,
                            "planningUnitNotes": map1.get("16"),
                            "consumptionDataType": 1,
                            "otherUnit": null,
                            "selectedForecastMap": map1.get("13"),
                            "createdBy": null,
                            "createdDate": null,
                            "active": map1.get("17"),
                        }
                        planningUnitList.push(tempJson);
                    } else {
                        let planningUnitobj1 = originalPlanningUnitList[indexVar];
                        let tempJson = {
                            "programPlanningUnitId": parseInt(map1.get("10")),
                            "planningUnit": planningUnitobj1.planningUnit,
                            "consuptionForecast": map1.get("3"),
                            "treeForecast": map1.get("4"),
                            "stock": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "existingShipments": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "monthsOfStock": this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "procurementAgent": (procurementAgentObj == null ? null : {
                                "id": parseInt(map1.get("8")),
                                "label": procurementAgentObj.label,
                                "code": procurementAgentObj.code,
                                "idString": "" + parseInt(map1.get("8"))
                            }),
                            "price": this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "higherThenConsumptionThreshold": planningUnitobj1.higherThenConsumptionThreshold,
                            "lowerThenConsumptionThreshold": planningUnitobj1.lowerThenConsumptionThreshold,
                            "planningUnitNotes": map1.get("16"),
                            "consumptionDataType": planningUnitobj1.consumptionDataType,
                            "otherUnit": planningUnitobj1.otherUnit,
                            "selectedForecastMap": map1.get("13"),
                            "createdBy": planningUnitobj1.createdBy,
                            "createdDate": planningUnitobj1.createdDate,
                            "active": map1.get("17"),
                        }
                        planningUnitList.push(tempJson);
                        indexVar = indexVar + 1;
                    }
                    if (map1.get("4") == false && map1.get("15") == true) {
                        listOfDisablePuNode.push(parseInt(map1.get("1")));
                    }
                    if (map1.get("17") == false && map1.get("18") == true) {
                        listOfDisablePuNode.push(parseInt(map1.get("1")));
                    }
                }
                programData.planningUnitList = planningUnitList.concat(this.state.active != -1 ? originalPlanningUnitList.filter(c => this.state.active == 1 ? c.active.toString() == "false" : c.active.toString() == "true") : []);
                programData = encryptFCData(programData);
                program.programData = programData;
                programs.push(program);
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var programTransaction = transaction.objectStore('datasetData');
                    programs.forEach(program => {
                        var programRequest = programTransaction.put(program);
                    })
                    transaction.oncomplete = function (event) {
                        db1 = e.target.result;
                        var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                        var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                        var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                        datasetDetailsRequest.onsuccess = function (e) {
                            var datasetDetailsRequestJson = datasetDetailsRequest.result;
                            datasetDetailsRequestJson.changed = 1;
                            var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                            datasetDetailsRequest1.onsuccess = function (event) {
                            }
                        }
                        this.setState({
                            message: i18n.t('static.mt.dataUpdateSuccess'),
                            color: "green",
                            isChanged1: false,
                        }, () => {
                            listOfDisablePuNode = [...new Set(listOfDisablePuNode)];
                            if (listOfDisablePuNode.length > 0) {
                                this.disablePUNode(listOfDisablePuNode);
                                this.disablePUConsumptionData(listOfDisablePuNode);
                            }
                            this.getDatasetList();
                            this.hideSecondComponent();
                        });
                    }.bind(this);
                    transaction.onerror = function (event) {
                        this.setState({
                            loading: false,
                            color: "red",
                        }, () => {
                            this.hideSecondComponent();
                        });
                    }.bind(this);
                }.bind(this);
            }
        }
    }
    /**
     * Disable planning unit consumption data
     * @param {*} listOfDisablePuNode - list of disable planning unit node
     */
    disablePUConsumptionData(listOfDisablePuNode) {
        let datasetList1 = this.state.datasetList1;
        for (var i = 0; i < datasetList1.length; i++) {
            var programs = [];
            var program = datasetList1[i];
            var programData = decryptFCData(program.programData);
            let actualConsumptionList = programData.actualConsumptionList;
            for (var j = 0; j < listOfDisablePuNode.length; j++) {
                for (var k = 0; k < actualConsumptionList.length; k++) {
                    if (parseInt(listOfDisablePuNode[j]) == actualConsumptionList[k].planningUnit.id) {
                        actualConsumptionList[k].amount = 0;
                    }
                }
            }
            programData.actualConsumptionList = actualConsumptionList;
            programData = encryptFCData(programData);
            program.programData = programData;
            programs.push(program);
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                programs.forEach(program => {
                    var programRequest = programTransaction.put(program);
                })
                transaction.oncomplete = function (event) {
                    db1 = e.target.result;
                    var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                    var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                    var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                    datasetDetailsRequest.onsuccess = function (e) {
                        var datasetDetailsRequestJson = datasetDetailsRequest.result;
                        datasetDetailsRequestJson.changed = 1;
                        var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                        datasetDetailsRequest1.onsuccess = function (event) {
                        }
                    }
                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                }.bind(this);
            }.bind(this);
        }
    }
    /**
     * Disables planning unit node
     * @param {*} listOfDisablePuNode - list to disable planning unit node
     */
    disablePUNode(listOfDisablePuNode) {
        let datasetList1 = this.state.datasetList1;
        for (var i = 0; i < datasetList1.length; i++) {
            var programs = [];
            var program = datasetList1[i];
            var programData = decryptFCData(program.programData);
            let treeListForSelectedProgram = programData.treeList;
            for (var j = 0; j < listOfDisablePuNode.length; j++) {
                for (var k = 0; k < treeListForSelectedProgram.length; k++) {
                    let flatlist = treeListForSelectedProgram[k].tree.flatList;
                    let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                    for (var l = 0; l < listContainNodeType5.length; l++) {
                        let nodeDataMap = listContainNodeType5[l].payload.nodeDataMap;
                        let nodeDataMapKeys = Object.keys(listContainNodeType5[l].payload.nodeDataMap);
                        for (var m = 0; m < nodeDataMapKeys.length; m++) {
                            let insideArrayOfNodeDataMap = nodeDataMap[nodeDataMapKeys[m]];
                            if (insideArrayOfNodeDataMap[0].puNode.planningUnit.id == parseInt(listOfDisablePuNode[j])) {
                                var sameParentList = flatlist.filter(c => c.parent == listContainNodeType5[l].parent);
                                for (let l = 0; l < sameParentList.length; l++) {
                                    var nodeDataModelingList = sameParentList[l].payload.nodeDataMap[nodeDataMapKeys[m]][0].nodeDataModelingList;
                                    var result = nodeDataModelingList.filter(c => c.transferNodeDataId == nodeDataMap[nodeDataMapKeys[m]][0].nodeDataId);
                                    if (result.length > 0) {
                                        for (let r = 0; r < result.length; r++) {
                                            var findNodeDataIdIndex = nodeDataModelingList.findIndex(n => n.transferNodeDataId == result[r].transferNodeDataId);
                                            nodeDataModelingList.splice(findNodeDataIdIndex, 1);
                                        }
                                    }
                                }
                                var findNodeIndex = flatlist.findIndex(n => n.id == listContainNodeType5[l].id);
                                if (findNodeIndex != -1) {
                                    treeListForSelectedProgram[k].generateMom = 1;
                                    flatlist.splice(findNodeIndex, 1);
                                }
                            }
                        }
                    }
                }
            }
            programData.treeList = treeListForSelectedProgram;
            programData = encryptFCData(programData);
            program.programData = programData;
            programs.push(program);
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                programs.forEach(program => {
                    programTransaction.put(program);
                })
                transaction.oncomplete = function (event) {
                    db1 = e.target.result;
                    var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                    var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                    var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                    datasetDetailsRequest.onsuccess = function (e) {
                        var datasetDetailsRequestJson = datasetDetailsRequest.result;
                        datasetDetailsRequestJson.changed = 1;
                        var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                        datasetDetailsRequest1.onsuccess = function (event) {
                        }
                    }
                    this.setState({
                    }, () => {
                    });
                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                }.bind(this);
            }.bind(this);
        }
    }
    /**
     * Fetch Planning Unit list. Also adds new row to jexcel spreadsheet
     * @param {*} callBy - Determines whether to add new row or not
     */
    getPlanningUnitList(callBy) {
        if (callBy == 0) {
            var pID = document.getElementById("forecastProgramId").value;
            if (pID != 0) {
                this.setState({
                    loading: true,
                    isPlanningUnitLoaded: true
                })
                let programSplit = pID.split('_');
                let programId = programSplit[0];
                let versionId = programSplit[1];
                versionId = versionId.replace(/[^\d]/g, '');
                let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0]
                let planningUnitIds = this.state.tempPlanningUnitList.map(e => parseInt(e.id))
                PlanningUnitService.getPlanningUnitByIds(planningUnitIds).then(response => {
                    this.setState({
                        allPlanningUnitList: response.data,
                        originalPlanningUnitList: response.data,
                        planningUnitList: response.data,
                    }, () => {
                        let forecastStartDate = selectedForecastProgram.forecastStartDate;
                        let forecastStopDate = selectedForecastProgram.forecastStopDate;
                        let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
                        beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
                        localStorage.setItem("sesForecastProgramIdReport", parseInt(programId));
                        localStorage.setItem("sesForecastVersionIdReport", parseInt(versionId));
                        this.setState(
                            {
                                rangeValue: { from: { year: new Date(forecastStartDate).getFullYear(), month: new Date(forecastStartDate).getMonth() + 1 }, to: { year: new Date(forecastStopDate).getFullYear(), month: new Date(forecastStopDate).getMonth() + 1 } },
                                startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                                endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                                beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
                                forecastProgramId: parseInt(programId),
                                forecastProgramVersionId: parseInt(versionId),
                                datasetId: selectedForecastProgram.id,
                                loading: false
                            }, () => {
                                this.filterData(callBy);
                            })
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
        } else if (callBy == 1) {
            this.addRow()
        }
    }
    /**
     * Add's new row to the jexcel shpreadsheet
     */
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = -1;
        data[1] = "";
        data[2] = "";
        data[3] = true;
        data[4] = true;
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = "";
        data[10] = 0;
        data[11] = 1;
        data[12] = 1;
        data[13] = {};
        data[14] = 0;
        data[15] = true;
        data[16] = "";
        data[17] = true;
        data[18] = true;
        this.el.insertRow(
            data, 0, 1
        );
        this.el.getCell(("B").concat(parseInt(0) + 1)).classList.add('typing-' + this.state.lang);
    };
    /**
     * Toggles program info popover
     */
    toggleProgramSetting() {
        this.setState({
            popoverOpenProgramSetting: !this.state.popoverOpenProgramSetting,
        });
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("forecastProgramId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + (this.state.startDateDisplay + ' ~ ' + this.state.endDateDisplay)) + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var planningUnitList;
        // if (response.data.length > 0) {
        var A = [];
        let tableHeadTemp = [];
        tableHeadTemp.push(i18n.t('static.productCategory.productCategory').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.dashboard.planningunitheader').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.conversion.ConversionFactorFUPU').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.commitTree.consumptionForecast') + ' ?').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.TreeForecast.TreeForecast') + ' ?').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.planningUnitSetting.stockEndOf') + ' ' + this.state.beforeEndDateDisplay + ')').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.planningUnitSetting.existingShipments') + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.planningUnitSetting.desiredMonthsOfStock') + ' ' + this.state.endDateDisplay + ')').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.forecastReport.priceType').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.forecastReport.unitPrice').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.program.notes').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.common.active').replaceAll(' ', '%20'));
        A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
        this.state.languageEl.getJson(null, true).map(ele => A.push(addDoubleQuoteToRowContent([ele[0].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''), ele[1].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''), ele[2].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''), ele[3].toString() == "true" ? i18n.t("static.program.yes") : i18n.t("static.realm.no"), ele[4].toString() == "true" ? i18n.t("static.program.yes") : i18n.t("static.realm.no"), ele[5].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[6].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[7].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[8].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[9].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[16].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[17].toString() == "true" ? i18n.t('static.common.active') : i18n.t('static.common.disabled')])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        // }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = (document.getElementById("forecastProgramId").selectedOptions[0].text).replaceAll(' ', '%20') + "-" + i18n.t('static.updatePlanningUnit.updatePlanningUnit') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Renders the Planning Unit list.
     * @returns {JSX.Element} - the Planning Unit list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.programCode + '~v' + item.versionId}
                    </option>
                )
            }, this);
        const { rangeValue } = this.state
        //Formats the daterange
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        return (
            <div className="animated fadeIn" >
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/dataset/versionSettings" className="supplyplanformulas">{i18n.t('static.UpdateversionSettings.UpdateversionSettings')}</a></span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/dataSet/buildTree/tree/0/" + this.state.datasetId : "/#/dataSet/buildTree"} className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> {localStorage.getItem("sessionType") === 'Online' && <>{i18n.t('static.tree.or')} <a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" className='supplyplanformulas'>{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a></>}</span>
                        </div>
                    </div>
                    <CardBody className="pb-lg-3 pt-lg-0">
                        <div className="" >
                            <div ref={ref}>
                                <Col md="12 pl-0">
                                    {this.state.datasetId != "" && this.state.datasetId != null && this.state.datasetId != undefined && this.state.datasetId != 0 && <img className='float-right mr-1' style={{ height: '25px', width: '25px', cursor: 'Pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                                    <div className="row">
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenProgramSetting} target="Popover2" trigger="hover" toggle={this.toggleProgramSetting}>
                                                <PopoverBody>{i18n.t('static.common.loadProgramFirst')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleProgramSetting} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="forecastProgramId"
                                                        id="forecastProgramId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setProgramId(e); }}
                                                        value={this.state.datasetId}
                                                        disabled={this.state.loading}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {datasets}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="forecastPeriod"
                                                        id="forecastPeriod"
                                                        bsSize="sm"
                                                        disabled={true}
                                                        value={this.state.startDateDisplay + ' ~ ' + this.state.endDateDisplay}
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" style={{ display: 'none' }}>
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                            <div className="controls edit">
                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={rangeValue}
                                                    lang={pickerLang}
                                                    onChange={this.handleRangeChange}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="active"
                                                        id="active"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setStatus(e) }}
                                                        value={this.state.active}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.all')}</option>
                                                        <option value="1">{i18n.t('static.common.active')}</option>
                                                        <option value="0">{i18n.t('static.common.disabled')}</option>
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Col>
                            </div>
                        </div>
                        {!localStorage.getItem("sessionType") === 'Online' && <Col md="12" className="pl-lg-0">
                            <div>
                                <p>{i18n.t("static.planningUnitSetting.offlineMsg")}</p>
                            </div>
                        </Col>}
                        {this.state.forecastProgramId != "" && !AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS') &&
                            <p>
                                {i18n.t('static.versionSettings.note')}:
                                <i>
                                    {i18n.t("static.PUSettingList.notes")}
                                </i>
                            </p>
                        }
                        <div className="UpdatePlanningSettingTable consumptionDataEntryTable FreezePlaningUnitColumn1 FreezePlaningUnitColumn1New" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div id="tableDiv" className='TableWidth100'>
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
                    </CardBody>
                    {
                        this.state.allowAdd &&
                        <CardFooter>
                            {this.state.forecastProgramId != "" && AuthenticationService.checkUserACL([this.state.forecastProgramId.toString()], 'ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS') &&
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.isChanged1 &&
                                        <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    }
                                    {localStorage.getItem("sessionType") === 'Online' && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.getPlanningUnitList(1)}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                                    &nbsp;
                                </FormGroup>
                            }
                        </CardFooter>
                    }
                </Card>
            </div>
        );
    }
}