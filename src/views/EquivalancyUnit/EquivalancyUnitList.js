import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from "react";
import { Prompt } from 'react-router';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import showguidanceforEquivalencyUnitEn from '../../../src/ShowGuidanceFiles/EquivalencyUnitEn.html';
import showguidanceforEquivalencyUnitFr from '../../../src/ShowGuidanceFiles/EquivalencyUnitFr.html';
import showguidanceforEquivalencyUnitPr from '../../../src/ShowGuidanceFiles/EquivalencyUnitPr.html';
import showguidanceforEquivalencyUnitSp from '../../../src/ShowGuidanceFiles/EquivalencyUnitSp.html';
import { checkValidation, changed, jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY } from "../../Constants";
import DropdownService from '../../api/DropdownService';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import ForecastingUnitService from '../../api/ForecastingUnitService';
import ProgramService from '../../api/ProgramService';
import TracerCategoryService from '../../api/TracerCategoryService';
import UnitService from '../../api/UnitService.js';
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.equivalancyUnit.equivalancyUnits')
/**
 * Component for list of equivalency unit details.
 */
class EquivalancyUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            equivalancyUnitMappingList: [],
            message: '',
            selSource: [],
            typeList: [],
            typeList1: [],
            tracerCategoryList: [],
            tracerCategoryList1: [],
            forecastingUnitList: [],
            equivalancyUnitList: [],
            roleArray: [],
            isModalOpen: false,
            equivalancyUnitAllList: [],
            technicalAreaList: [],
            eqUnitTableEl: "",
            table1Instance: "",
            table2Instance: "",
            selSource: [],
            unitList: [],
            roleArray: [],
            loading: true,
            loading1: true,
            loading2: true,
            isChanged: false,
            isChanged1: false,
            countVar: 0,
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.filterData = this.filterData.bind(this);
        this.getHealthArea = this.getHealthArea.bind(this);
        this.checkAndMarkDuplicate = this.checkAndMarkDuplicate.bind(this);
        this.getEquivalancyUnitMappingData = this.getEquivalancyUnitMappingData.bind(this);
        this.getTracerCategory = this.getTracerCategory.bind(this);
        this.getForecastingUnitByTracerCategoriesId = this.getForecastingUnitByTracerCategoriesId.bind(this);
        this.getUnit = this.getUnit.bind(this);
        this.getType = this.getType.bind(this);
        this.getEquivalancyUnit = this.getEquivalancyUnit.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.getEquivalancyUnitAll = this.getEquivalancyUnitAll.bind(this);
        this.buildJexcel1 = this.buildJexcel1.bind(this);
        this.changed = this.changed.bind(this);
        this.oneditionend1 = this.oneditionend1.bind(this);
        this.addRow1 = this.addRow1.bind(this);
        this.formSubmit1 = this.formSubmit1.bind(this);
        this.checkValidation1 = this.checkValidation1.bind(this);
        this.onchangepage = this.onchangepage.bind(this)
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Row Number
     * @param {*} y - Column Number
     * @param {*} value - Cell Value 
     */
    loaded1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }
    /**
     * This function is called when cell value is edited & mark change in row.
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Column Number
     * @param {*} y - Row Number
     * @param {*} value - Cell Value
     */
    oneditionend1 = function (instance, cell, x, y, value) {
        var elInstance = this.state.table2Instance;
        var rowData = elInstance.getRowData(y);
        elInstance.setValueFromCoords(9, y, 1, true);
    }
    /**
     * Validate cell values on change.
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Column Number
     * @param {*} y - Row Number
     * @param {*} value - Cell Value
     */
    changed1 = function (instance, cell, x, y, value) {
        var elInstance = this.state.table2Instance;
        var rowData = elInstance.getRowData(y);
        if (x == 2) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.validSpace.string'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        if (x == 1) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        if (x != 9) {
            elInstance.setValueFromCoords(9, y, 1, true);
        }
        this.setState({ isChanged1: true })
    }.bind(this);
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
     * Hides the message in div3 after 30 seconds i.e inside Manage Equivalency Unit popup.
     */
    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when page is changed to make some cells readonly based on multiple condition
     * @param {*} el This is the DOM Element where sheet is created
     * @param {*} pageNo This the page number which is clicked
     * @param {*} oldPageNo This is the last page number that user had selected
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
        for (var y = start; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
            var typeId = rowData[14];
            let checkReadOnly = 0;
            if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN') && typeId == -1 && typeId != 0)) {
                checkReadOnly = checkReadOnly + 1;
                var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            }
            var addRowId = rowData[15];
            if (addRowId == 1) {
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            } else if (checkReadOnly == 0) {
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
            }
            if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')
                && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) {
                var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            }
        }
    }
    /**
     * Builds the jexcel component to display Equivalency Unit list on popup.
     */
    buildJexcel1() {
        var papuList = this.state.equivalancyUnitAllList;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = papuList[j].equivalencyUnitId
                data[1] = papuList[j].healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
                data[2] = getLabelText(papuList[j].label, this.state.lang)
                data[3] = getLabelText(papuList[j].realm.label, this.state.lang)
                data[4] = papuList[j].program != null ? papuList[j].program.id : -1;
                data[5] = papuList[j].notes
                data[6] = papuList[j].active
                data[7] = papuList[j].lastModifiedBy.username;
                data[8] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[9] = 0
                data[10] = 0
                papuDataArr[count] = data;
                count++;
            }
        }
        if (this.state.table2Instance != "" && this.state.table2Instance != undefined) {
            jexcel.destroy(document.getElementById("eqUnitInfoTable"), true);
        }
        var data = papuDataArr;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100, 100, 100, 70],
            columns: [
                {
                    title: 'equivalancyUnitId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.program.healtharea'),
                    type: 'autocomplete',
                    source: this.state.technicalAreaList,
                    filter: this.filterHealthArea,
                    multiple: true,
                },
                {
                    title: i18n.t('static.equivalancyUnit.equivalancyUnits'),
                    type: 'text',
                    textEditor: true,
                },
                {
                    title: i18n.t('static.healtharea.realm'),
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    title: i18n.t('static.dataSource.program'),
                    type: 'autocomplete',
                    source: this.state.typeList1,
                    filter: this.filterDataset1
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                    textEditor: true,
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox',
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
                },
                {
                    title: 'isChange',
                    type: 'hidden'
                },
                {
                    title: 'addNewRow',
                    type: 'hidden'
                }
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);
                    var addRowId = rowData[10];
                    if (addRowId == 1) {
                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                        var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    } else {
                        let checkReadOnly = 0;
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN') && rowData[4] == -1 && rowData[4] != 0) {
                            checkReadOnly = checkReadOnly + 1;
                            var cell1 = elInstance.getCell(`A${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                        }
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) {
                            var cell1 = elInstance.getCell(`A${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                        }
                    }
                }
            }.bind(this),
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
            onchange: this.changed1,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            oneditionend: this.oneditionend1,
            onload: this.loaded1,
            license: JEXCEL_PRO_KEY,
            editable: true,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (obj.options.allowInsertRow == true) {
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')
                        || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) {
                            items.push({
                                title: i18n.t('static.common.addRow'),
                                onclick: function () {
                                    this.addRow1();
                                }.bind(this)
                            });
                        }
                    }
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[0] == 0) {
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
            }.bind(this)
        };
        var table2Instance = jexcel(document.getElementById("eqUnitInfoTable"), options);
        this.el = table2Instance;
        this.setState({
            table2Instance: table2Instance,
            loading: false
        },
            () => {
            })
    }
    /**
     * This function is used to filter the health area list
     */
    filterHealthArea = function (instance, cell, c, r, source) {
        var mylist = this.state.technicalAreaList.filter(c => c.id != '' && c.id != null);
        return mylist.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)
    /**
     * Reterives Equivalency unit list from server
     */
    getEquivalancyUnitAll() {
        EquivalancyUnitService.getEquivalancyUnitList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    equivalancyUnitAllList: listArray,
                },
                    () => {
                        this.buildJexcel1();
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Toggles the modal open/close state and retrieves equivalency unit data if the modal is opened.
     */
    modelOpenClose() {
        if (!this.state.isModalOpen) {
            this.getEquivalancyUnitAll();
        }
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            isChanged1: false
        },
            () => {
            })
    }
    /**
     * Builds the jexcel component to display equivalency unit list.
     */
    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = papuList[j].equivalencyUnitMappingId
                data[1] = papuList[j].equivalencyUnit.equivalencyUnitId
                data[2] = papuList[j].equivalencyUnit.healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
                data[3] = papuList[j].tracerCategory.id
                data[4] = papuList[j].forecastingUnit.id
                data[5] = papuList[j].unit.id
                data[6] = papuList[j].convertToEu
                data[7] = papuList[j].notes
                data[8] = (papuList[j].program == null ? -1 : papuList[j].program.id)
                data[9] = papuList[j].active
                data[10] = papuList[j].lastModifiedBy.username;
                data[11] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[12] = 0;
                data[13] = papuList[j].forecastingUnit.id
                data[14] = (papuList[j].program == null ? -1 : papuList[j].program.id)
                data[15] = 0;
                data[16] = count;
                papuDataArr[count] = data;
                count++;
            }
        }
        if (this.state.table1Instance != "" && this.state.table1Instance != undefined) {
            jexcel.destroy(document.getElementById("paputableDiv"), true);
        }
        var data = papuDataArr;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100, 100, 100, 100, 50],
            columns: [
                {
                    title: 'equivalancyUnitMappingId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.equivalancyUnit.equivalancyUnitName'),
                    type: 'autocomplete',
                    source: this.state.equivalancyUnitList,
                    filter: this.filterEquivalancyUnit,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t("static.message.spacetext")
                    }
                },
                {
                    title: i18n.t('static.program.healtharea'),
                    type: 'autocomplete',
                    multiple: true,
                    readOnly: true,
                    source: this.state.technicalAreaList,
                    filter: this.filterTechnicalAreaList
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'autocomplete',
                    source: this.state.tracerCategoryList,
                    filter: this.filterTracerCategoryList,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t("static.message.spacetext")
                    }
                },
                {
                    title: i18n.t('static.product.unit1'),
                    type: 'autocomplete',
                    source: this.state.forecastingUnitList,
                    filter: this.filterForecastingUnitBasedOnTracerCategory,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t("static.message.spacetext")
                    }
                },
                {
                    title: i18n.t('static.dashboard.unit'),
                    type: 'autocomplete',
                    readOnly: true,
                    source: this.state.unitList,
                },
                {
                    title: i18n.t('static.equivalencyUnit.conversionToEU'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    disabledMaskOnEdition: true,
                    required: true,
                    number: true,
                    regex: {
                        ex: /^\d{1,14}(\.\d{1,4})?$/,
                        text: i18n.t("static.usagePeriod.conversionTOFUTest")
                    }
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                    width: 150,
                    textEditor: true,
                },
                {
                    title: i18n.t('static.dataSource.program'),
                    type: 'autocomplete',
                    source: this.state.typeList,
                    filter: this.filterDataset,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t("static.message.spacetext")
                    }
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox'
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
                },
                {
                    title: 'isChange',
                    type: 'hidden'
                },
                {
                    title: 'forecastingUnitId',
                    type: 'hidden'
                },
                {
                    title: 'typeId',
                    type: 'hidden'
                },
                {
                    title: 'addNewRow',
                    type: 'hidden'
                },
                {
                    title: 'countVar',
                    type: 'hidden'
                }
            ],
            onchangepage: this.onchangepage,
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
            allowManualInsertRow: false,
            parseFormulas: true,
            oneditionend: this.oneditionend,
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (obj.options.allowInsertRow == true) {
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')
                        || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) {
                            items.push({
                                title: i18n.t('static.common.addRow'),
                                onclick: function () {
                                    this.addRow();
                                }.bind(this)
                            });
                        }
                    }
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                    this.setState({ countVar: this.state.countVar - 1 })
                                }
                            });
                        }
                    }
                }
                return items;
            }.bind(this)
        };
        var table1Instance = jexcel(document.getElementById("paputableDiv"), options);
        this.el = table1Instance;
        this.setState({
            table1Instance: table1Instance,
            loading: false,
            countVar: count
        })
    }
    /**
     * This function is used to filter the forecasting unit list based on tracer category
     */
    filterForecastingUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (this.state.table1Instance.getJson(null, false)[r])[3];
        if (value > 0) {
            mylist = this.state.forecastingUnitList.filter(c => c.tracerCategoryId == value && c.active.toString() == "true");
        }
        return mylist.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)
    /**
     * This function is used to filter the equivalency unit list based on active
     */
    filterEquivalancyUnit = function (instance, cell, c, r, source) {
        let mylist = this.state.equivalancyUnitList.filter(c => c.active.toString() == "true");
        return mylist;
    }.bind(this)
    /**
     * This function is used to filter the technical area(Health Area) list based on equivalency unit
     */
    filterTechnicalAreaList = function (instance, cell, c, r, source) {
        var selectedEquivalencyUnitId = (this.state.table1Instance.getJson(null, false)[r])[1];
        let selectedEqObj = this.state.equivalancyUnitList.filter(c => c.id == selectedEquivalencyUnitId)[0];
        let mylist = [];
        let selectedHealthAreaList = selectedEqObj.healthAreaList;
        for (let k = 0; k < selectedHealthAreaList.length; k++) {
            mylist.push(this.state.technicalAreaList.filter(c => c.id == selectedHealthAreaList[k].id)[0]);
        }
        return mylist;
    }.bind(this)
    /**
     * This function is used to filter the tracer category list based on health area
     */
    filterTracerCategoryList = function (instance, cell, c, r, source) {
        var selectedHealthAreaId = (this.state.table1Instance.getJson(null, false)[r])[2].toString().split(';');
        let mylist = [];
        for (let k = 0; k < selectedHealthAreaId.length; k++) {
            let temp = this.state.tracerCategoryList.filter(c => c.healthArea.id == selectedHealthAreaId[k]);
            for (let j = 0; j < temp.length; j++) {
                mylist.push(temp[j]);
            }
        }
        return mylist;
    }.bind(this)
    /**
     * This function is used to filter the forecast program list based on the business function
     */
    filterDataset1 = function (instance, cell, c, r, source) {
        var mylist = this.state.typeList1;
        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')) {
            mylist = mylist.filter(c => c.id != -1);
        }
        return mylist;
    }.bind(this)
    /**
     * This function is used to filter the forecast program list based on the business function
     */
    filterDataset = function (instance, cell, c, r, source) {
        let mylist = this.state.typeList;
        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')) {
            mylist = mylist.filter(c => c.id != -1);
        }
        var eq = this.state.table1Instance.getRowData(r)[1];
        if (eq != "") {
            var eqObject = this.state.equivalancyUnitList.filter(c => c.id == eq)[0];
            if (eqObject.program == null || eqObject.program.id == 0) {
                mylist = mylist;
            } else {
                mylist = mylist.filter(c => c.id == eqObject.program.id);
            }
        }
        return mylist;
    }.bind(this)
    /**
     * Reterives equivalency unit mapping list from server
     */
    getEquivalancyUnitMappingData() {
        this.hideSecondComponent();
        EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
            if (response.status == 200) {
                let listArray = response.data;
                listArray.sort((a, b) => {
                    if (a.equivalencyUnit.label.label_en === b.equivalencyUnit.label.label_en) {
                        return a.forecastingUnit.label.label_en < b.forecastingUnit.label.label_en ? -1 : 1
                    } else {
                        return a.equivalencyUnit.label.label_en < b.equivalencyUnit.label.label_en ? -1 : 1
                    }
                })
                this.setState({
                    equivalancyUnitMappingList: listArray,
                    selSource: listArray,
                },
                    () => {
                        this.getForecastingUnitByTracerCategoriesId();
                    })
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false, color: "#BA0C2F",
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Reterives forecasting unit list based on tracer category Ids from server
     */
    getForecastingUnitByTracerCategoriesId() {
        let healthAreaList = [];
        let equivalancyUnitList = this.state.equivalancyUnitList;
        for (var i = 0; i < equivalancyUnitList.length; i++) {
            let localHealthAreaList = equivalancyUnitList[i].healthAreaList;
            localHealthAreaList = localHealthAreaList.map(ele => ele.id)
            healthAreaList = healthAreaList.concat(localHealthAreaList);
        }
        let tracerCategoryIdList = [];
        let tracerCategoryList = this.state.tracerCategoryList;
        for (var i = 0; i < healthAreaList.length; i++) {
            tracerCategoryIdList = tracerCategoryIdList.concat(tracerCategoryList.filter(c => c.healthArea.id == healthAreaList[i]));
        }
        tracerCategoryIdList = tracerCategoryIdList.map(ele => (ele.id).toString());
        let tracerCategoryListOfMappingData = this.state.equivalancyUnitMappingList.map(ele => (ele.tracerCategory.id).toString());
        let newTracerCategoryIdList = tracerCategoryIdList.concat(tracerCategoryListOfMappingData);
        newTracerCategoryIdList = [... new Set(newTracerCategoryIdList)];
        ForecastingUnitService.getForecastingUnitByTracerCategoriesId(newTracerCategoryIdList).then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].forecastingUnitId),
                            id: parseInt(listArray[i].forecastingUnitId),
                            active: listArray[i].active,
                            tracerCategoryId: listArray[i].tracerCategory.id,
                            unit: listArray[i].unit
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    forecastingUnitList: tempList,
                },
                    () => {
                        this.filterData();
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
     * Reterives tracer category list from server
     */
    getTracerCategory() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
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
                    this.setState({
                        tracerCategoryList: tempList,
                        tracerCategoryList1: response.data
                    },
                        () => {
                            this.getUnit();
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
     * Reterives unit list from server
     */
    getUnit() {
        UnitService.getUnitListAll().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].unitId),
                            active: listArray[i].active,
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    unitList: tempList,
                },
                    () => {
                        this.getEquivalancyUnit();
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
     * Reterives forecast program list from server
     */
    getType() {
        ProgramService.getDataSetList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.programCode.toUpperCase();
                        var itemLabelB = b.programCode.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let tempProgramList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: listArray[i].programCode,
                                id: listArray[i].programId,
                                active: listArray[i].active,
                            }
                            tempProgramList[i] = paJson
                        }
                    }
                    let tempProgramList1 = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson1 = {
                                name: listArray[i].programCode,
                                id: listArray[i].programId,
                                active: listArray[i].active,
                            }
                            tempProgramList1[i] = paJson1
                        }
                    }
                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    var roleList = decryptedUser.roleList;
                    var roleArray = []
                    for (var r = 0; r < roleList.length; r++) {
                        roleArray.push(roleList[r].roleId)
                    }
                    tempProgramList.unshift({
                        name: i18n.t('static.common.realmLevel'),
                        id: -1,
                        active: true,
                    });
                    tempProgramList1.unshift({
                        name: i18n.t('static.common.all'),
                        id: -1,
                        active: true,
                    });
                    this.setState({
                        typeList: tempProgramList,
                        typeList1: tempProgramList1,
                        roleArray: roleArray
                    }, () => {
                        this.getEquivalancyUnitMappingData();
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
                    this.setState({
                        programs: [], loading: false
                    }, () => { })
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
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
     * Reterives equivalency unit list from server
     */
    getEquivalancyUnit() {
        EquivalancyUnitService.getEquivalancyUnitList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].equivalencyUnitId),
                            active: listArray[i].active,
                            healthAreaList: listArray[i].healthAreaList,
                            realm: listArray[i].realm,
                            program: listArray[i].program
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    equivalancyUnitList: tempList,
                },
                    () => {
                        this.getType();
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.isChanged == true || this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * Calls getHealthArea function on component mount
     */
    componentDidMount() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        var roleList = decryptedUser.roleList;
        var roleArray = []
        for (var r = 0; r < roleList.length; r++) {
            roleArray.push(roleList[r].roleId)
        }
        this.setState({
            roleArray: roleArray
        },
            () => {
                this.getHealthArea();
            })
    }
    /**
     * Reterives health area list from server
     */
    getHealthArea() {
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getHealthAreaDropdownList(realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].id),
                                active: listArray[i].active,
                            }
                            tempList[i] = paJson
                        }
                    }
                    this.setState({
                        technicalAreaList: tempList
                    },
                        () => {
                            this.getTracerCategory();
                        })
                }
                else {
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
     * This function is used when the editing for a particular cell is completed to format the cell or to update the value
     * @param {*} instance This is the sheet where the data is being updated
     * @param {*} cell This is the value of the cell whose value is being updated
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = this.state.table1Instance;
        var rowData = elInstance.getRowData(y);
        if (x == 6 && !isNaN(rowData[6]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        }
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow1 = function () {
        var elInstance = this.state.table2Instance;
        var json = elInstance.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = true;
        data[7] = "";
        data[8] = "";
        data[9] = 1;
        data[10] = 1;
        elInstance.insertRow(
            data, 0, 1
        );
    };
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var elInstance = this.state.table1Instance;
        var json = elInstance.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = true;
        data[10] = "";
        data[11] = "";
        data[12] = 1;
        data[13] = 0;
        data[14] = 0;
        data[15] = 1;
        data[16] = this.state.countVar + 1;
        this.setState({ countVar: this.state.countVar + 1 })
        elInstance.insertRow(
            data, 0, 1
        );
    };
    /**
     * Function to handle form submission and save the data on server.
     */
    formSubmit1 = function () {
        var validation = this.checkValidation1();
        var elInstance = this.state.table2Instance
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = elInstance.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("9")) === 1) {
                    let healthAreaSplit = elInstance.getValueFromCoords(1, i).split(';');
                    let healthAreaTempList = []
                    for (let k = 0; k < healthAreaSplit.length; k++) {
                        if (!isNaN(parseInt(healthAreaSplit[k]))) {
                            healthAreaTempList.push({ id: healthAreaSplit[k] });
                        }
                    }
                    let json = {
                        equivalencyUnitId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("2"),
                        },
                        healthAreaList: healthAreaTempList,
                        active: map1.get("6"),
                        program: (parseInt(map1.get("4")) == -1 ? null : { id: parseInt(map1.get("4")) }),
                        notes: map1.get("5")
                    }
                    changedpapuList.push(json);
                }
            }
            EquivalancyUnitService.addUpdateEquivalancyUnit(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), loading: true, color: 'green', isChanged1: false
                        },
                            () => {
                                this.modelOpenClose();
                                this.hideSecondComponent();
                                this.getEquivalancyUnit();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "#BA0C2F", loading: false
                        },
                            () => {
                                this.modelOpenClose();
                                this.hideSecondComponent();
                            })
                    }
                })
                .catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false,
                                color: "#BA0C2F",
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
                                        color: "#BA0C2F",
                                        loading: false
                                    },
                                        () => {
                                            this.modelOpenClose();
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "#BA0C2F",
                                    },
                                        () => {
                                            this.modelOpenClose();
                                            this.hideSecondComponent();
                                        })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "#BA0C2F",
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
     * Function to check duplicates
     * @returns Returns true if there are no duplicates, false otherwise.
     */
    checkAndMarkDuplicate() {
        var elInstance = this.state.table1Instance;
        var tableJson = elInstance.getJson(null, false);
        let array = tableJson.map(m => {
            return {
                equivalencyUnitId: parseInt(m[1]),
                forecastingUnitId: parseInt(m[4]),
                programId: parseInt(m[8]),
                countVar: m[16],
                isChanged: m[12]
            }
        });
        let duplicates = array
            .map((el, i) => {
                return array.find((element, index) => {
                    if (i !== index && element.equivalencyUnitId === el.equivalencyUnitId && element.forecastingUnitId === el.forecastingUnitId && element.programId === el.programId) {
                        return el
                    }
                })
            })
            .filter(x => x);
        if (duplicates.length > 0) {
            for (var k = 0; k < duplicates.length; k++) {
                for (var y = 0; y < tableJson.length; y++) {
                    var value = elInstance.getValueFromCoords(16, y);
                    if (duplicates[k].countVar == parseInt(value)) {
                        var col = ("B").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "yellow");
                        var col = ("E").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "yellow");
                        var col = ("I").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "yellow");
                        y = tableJson.length;
                    }
                }
            }
            this.setState({
                message: i18n.t('static.equivalencyUnit.duplicateEUFUP'),
                color: "#BA0C2F", loading: false
            },
                () => {
                    this.hideSecondComponent();
                })
            return true;
        } else {
            return false;
        }
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        var elInstance = this.state.table1Instance;
        let duplicateValidationFlag = this.checkAndMarkDuplicate();
        if (validation == true && duplicateValidationFlag == false) {
            this.setState({ loading: true })
            var tableJson = elInstance.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                let equivalencyUnitObj = this.state.equivalancyUnitList.filter(c => c.id == parseInt(map1.get("1")))[0];
                if (parseInt(map1.get("12")) === 1) {
                    let json = {
                        equivalencyUnitMappingId: parseInt(map1.get("0")),
                        tracerCategory: { id: parseInt(map1.get("3")) },
                        forecastingUnit: { id: parseInt(map1.get("4")) },
                        equivalencyUnit: { equivalencyUnitId: parseInt(map1.get("1")), realm: equivalencyUnitObj.realm },
                        convertToEu: map1.get("6").toString().replace(/,/g, ""),
                        notes: map1.get("7"),
                        program: (parseInt(map1.get("8")) == -1 ? null : { id: parseInt(map1.get("8")) }),
                        active: map1.get("9"),
                    }
                    changedpapuList.push(json);
                }
            }
            EquivalancyUnitService.addUpdateEquivalancyUnitMapping(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green', isChanged: false
                        },
                            () => {
                                this.hideSecondComponent();
                                this.getEquivalancyUnit();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "#BA0C2F", loading: false
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                })
                .catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                color: "#BA0C2F", loading: false
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
                                        message: i18n.t('static.equivalencyUnit.duplicateEUFUP'),
                                        color: "#BA0C2F", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        color: "#BA0C2F", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        color: "#BA0C2F", loading: false
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
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[9].classList.add('AsteriskTheadtrTd');
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
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
        for (var y = 0; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
            var typeId = rowData[14];
            let checkReadOnly = 0;
            if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN') && typeId == -1 && typeId != 0)) {
                checkReadOnly = checkReadOnly + 1;
                var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            }
            var addRowId = rowData[15];
            if (addRowId == 1) {
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            } else if (checkReadOnly == 0) {
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
            }
            if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')
                && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) {
                var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
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
        var elInstance = this.state.table1Instance;
        changed(elInstance, cell, x, y, value)

        //Equivalancy Unit
        if (x == 1) {
            let selectedEquivalencyUnitId = this.el.getValueFromCoords(1, y);
            if (selectedEquivalencyUnitId != null && selectedEquivalencyUnitId != '' && selectedEquivalencyUnitId != undefined) {
                let selectedEqObj = this.state.equivalancyUnitList.filter(c => c.id == selectedEquivalencyUnitId)[0];
                let healthAreaList = selectedEqObj.healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
                elInstance.setValueFromCoords(2, y, healthAreaList, true);
            } else {
                elInstance.setValueFromCoords(2, y, '', true);
            }

            elInstance.setValueFromCoords(3, y, '', true);
            elInstance.setValueFromCoords(4, y, '', true);
            elInstance.setValueFromCoords(5, y, '', true);
        }

        //Tracer Category
        else if (x == 3) {
            elInstance.setValueFromCoords(4, y, '', true);
            elInstance.setValueFromCoords(5, y, '', true);
        }

        //Forecasting Unit
        else if (x == 4) {
            let obj = this.state.forecastingUnitList.filter(c => c.id == parseInt(value))[0];
            if (obj != undefined && obj != null) {
                this.el.setValueFromCoords(5, y, obj.unit.id, true);
            }
        }

        //Active
        if (x != 12) {
            elInstance.setValueFromCoords(12, y, 1, true);
        }
        this.setState({
            isChanged: true,
        }, () => { });
    }.bind(this);
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation1 = function () {
        var valid = true;
        var elInstance = this.state.table2Instance;
        var json = elInstance.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = elInstance.getValueFromCoords(9, y);
            if (parseInt(value) == 1) {
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                    this.setState({
                        message: i18n.t('static.supplyPlan.validationFailed'),
                        color: 'red'
                    },
                        () => {
                            this.hideThirdComponent();
                        })
                } else {
                    if (!(budgetRegx.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.validSpace.string'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideThirdComponent();
                            })
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                    this.setState({
                        message: i18n.t('static.supplyPlan.validationFailed'),
                        color: 'red'
                    },
                        () => {
                            this.hideThirdComponent();
                        })
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                    this.setState({
                        message: i18n.t('static.supplyPlan.validationFailed'),
                        color: 'red'
                    },
                        () => {
                            this.hideThirdComponent();
                        })
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var elInstance = this.state.table1Instance;
        var json = elInstance.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = elInstance.getValueFromCoords(12, y);
            if (parseInt(value) == 1) {
                valid = checkValidation(elInstance);
                if(!valid){
                    this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }
        }
        return valid;
    }
    /**
     * Used to filter the equivalency unit list based on the different filters
     */
    filterData() {
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;
        let typeId = document.getElementById("typeId").value;
        let statusId = document.getElementById("statusId").value;
        if (typeId != 0 && tracerCategoryId != 0) {
            let selSource = this.state.equivalancyUnitMappingList.filter(c => (typeId == 2 ? c.program != null : c.program == null) && c.tracerCategory.id == tracerCategoryId)
            if (statusId == 1) {
                selSource = selSource.filter(c => c.active == true);
            } else if (statusId == 2) {
                selSource = selSource.filter(c => c.active == false);
            }
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (typeId != 0) {
            let selSource = this.state.equivalancyUnitMappingList.filter(c => (typeId == 2 ? c.program != null : c.program == null))
            if (statusId == 1) {
                selSource = selSource.filter(c => c.active == true);
            } else if (statusId == 2) {
                selSource = selSource.filter(c => c.active == false);
            }
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (tracerCategoryId != 0) {
            let selSource = this.state.equivalancyUnitMappingList.filter(c => c.tracerCategory.id == tracerCategoryId)
            if (statusId == 1) {
                selSource = selSource.filter(c => c.active == true);
            } else if (statusId == 2) {
                selSource = selSource.filter(c => c.active == false);
            }
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else {
            let selSource = this.state.equivalancyUnitMappingList;
            if (statusId == 1) {
                selSource = selSource.filter(c => c.active == true);
            } else if (statusId == 2) {
                selSource = selSource.filter(c => c.active == false);
            }
            this.setState({
                selSource: selSource
            },
                () => { this.buildJexcel() });
        }
    }
    /**
     * Toggles the showGuidance state between true and false.
     */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    /**
     * Renders the equivalency unit list.
     * @returns {JSX.Element} - Equivalency unit list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { tracerCategoryList1 } = this.state;
        let tracerCategoryTempList = tracerCategoryList1.length > 0
            && tracerCategoryList1.map((item, i) => {
                return (
                    <option key={i} value={item.tracerCategoryId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.isChanged == true || this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>
                    <div className="row pl-lg-3 pr-lg-3">
                        <div className="col-md-8">
                            <h5>{i18n.t('static.common.customWarningEquivalencyUnit')}</h5>
                        </div>
                        <div className="col-md-4">
                            <span className="pr-lg-2 pt-lg-1 float-right" style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                        </div>
                    </div>
                    <div className="Card-header-addicon problemListMarginTop">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a className="card-header-action">
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.modelOpenClose()} disabled={this.state.loading ? true : false}>{i18n.t('static.equivalancyUnit.equivalancyUnitManage')}</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                    <CardBody className="pl-lg-3 pr-lg-3 pt-lg-0">
                        <Col md="6 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="tab-ml-0 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryId"
                                                id="tracerCategoryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {tracerCategoryTempList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.equivalancyUnit.type')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="typeId"
                                                id="typeId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                <option value="1">{i18n.t('static.common.realmLevel')}</option>
                                                <option value="2">{i18n.t('static.common.datasetLevel')}</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="statusId"
                                                id="statusId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                <option value="1" selected>{i18n.t('static.common.active')}</option>
                                                <option value="2">{i18n.t('static.common.disabled')}</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div className="consumptionDataEntryTable" id="paputableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
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
                    <CardFooter>
                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')
                            || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) &&
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.isChanged && <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        }
                    </CardFooter>
                    <Modal isOpen={this.state.showGuidance}
                        className={'modal-lg ' + this.props.className} >
                        <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                            <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                        </ModalHeader>
                        <div>
                            <ModalBody>
                                <div dangerouslySetInnerHTML={{
                                    __html: localStorage.getItem('lang') == 'en' ?
                                        showguidanceforEquivalencyUnitEn :
                                        localStorage.getItem('lang') == 'fr' ?
                                            showguidanceforEquivalencyUnitFr :
                                            localStorage.getItem('lang') == 'sp' ?
                                                showguidanceforEquivalencyUnitSp :
                                                showguidanceforEquivalencyUnitPr
                                }} />
                            </ModalBody>
                        </div>
                    </Modal>
                    <Modal isOpen={this.state.isModalOpen}
                        className={'modal-lg modalWidth ' + this.props.className}>
                        <ModalHeader>
                            <strong>{i18n.t('static.equivalancyUnit.equivalancyUnits')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <span><h5 style={{ color: this.state.color, display: "none" }} id="div3">{this.state.message}</h5></span>
                            <div>
                                <div id="eqUnitInfoTable" className="AddListbatchtrHeight RemoveStriped consumptionDataEntryTable TableWidth100">
                                </div>
                            </div>
                            <br />
                        </ModalBody>
                        <ModalFooter>
                            {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_ALL')
                                || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_EQIVALENCY_UNIT_OWN')) &&
                                <div className="mr-0">
                                    {this.state.isChanged1 && <Button type="submit" size="md" color="success" className="float-right" onClick={this.formSubmit1} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                    <Button color="info" size="md" className="float-right mr-1" id="eqUnitAddRow" type="button" onClick={() => this.addRow1()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                </div>
                            }
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.modelOpenClose()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                </Card>
            </div>
        )
    }
    /**
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }
}
export default EquivalancyUnit
