import React, { Component } from "react";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form,
    Modal, ModalBody, ModalFooter, ModalHeader, InputGroup
} from 'reactstrap';
import { FastField, Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import RegionService from "../../api/RegionService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import UnitService from '../../api/UnitService.js';
import moment from 'moment';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import TracerCategoryService from '../../api/TracerCategoryService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import HealthAreaService from '../../api/HealthAreaService';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js';
import { Prompt } from 'react-router';
import { SECRET_KEY, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from "../../Constants";
// import { Modal } from "bootstrap";

const entityname = i18n.t('static.equivalancyUnit.equivalancyUnits')


class EquivalancyUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            equivalancyUnitMappingList: [],
            message: '',
            selSource: [],

            typeList: [],
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
        }

        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.filterData = this.filterData.bind(this);
        this.getHealthArea = this.getHealthArea.bind(this);
        this.checkAndMarkDuplicate = this.checkAndMarkDuplicate.bind(this);

        this.getEquivalancyUnitMappingData = this.getEquivalancyUnitMappingData.bind(this);

        //jumper
        this.getTracerCategory = this.getTracerCategory.bind(this);
        this.getForecastingUnit = this.getForecastingUnit.bind(this);
        this.getForecastingUnitByTracerCategoriesId = this.getForecastingUnitByTracerCategoriesId.bind(this);
        this.getUnit = this.getUnit.bind(this);
        this.getType = this.getType.bind(this);
        this.getEquivalancyUnit = this.getEquivalancyUnit.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.getEquivalancyUnitAll = this.getEquivalancyUnitAll.bind(this);
        this.buildJexcel1 = this.buildJexcel1.bind(this);

        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend1 = this.oneditionend1.bind(this);
        this.addRow1 = this.addRow1.bind(this);
        this.formSubmit1 = this.formSubmit1.bind(this);
        this.checkValidation1 = this.checkValidation1.bind(this);

    }

    // loaded1 = function (instance, cell, x, y, value) {
    //     jExcelLoadedFunction(instance, 0);
    // }

    loaded1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        jExcelLoadedFunctionOnlyHideRow(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');

    }

    oneditionend1 = function (instance, cell, x, y, value) {
        // var elInstance = instance.jexcel;'
        var elInstance = this.state.table2Instance;
        var rowData = elInstance.getRowData(y);

        elInstance.setValueFromCoords(8, y, 1, true);

    }

    onPaste1(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.worksheets[0]).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance.worksheets[0]).setValueFromCoords(0, data[i].y, 0, true);
                    (instance.worksheets[0]).setValueFromCoords(8, data[i].y, 1, true);
                    (instance.worksheets[0]).setValueFromCoords(9, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    changed1 = function (instance, cell, x, y, value) {
        var elInstance = this.state.table2Instance;
        var rowData = elInstance.getRowData(y);
        console.log("LOG---------->2", elInstance);

        //Equivalancy Unit
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

        //HealthArea
        if (x == 1) {
            console.log("LOG---------->2", value);
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

        //Active
        if (x != 8) {
            elInstance.setValueFromCoords(8, y, 1, true);
        }
        this.setState({ isChanged1: true })
    }.bind(this);

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }

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
                // data[2] = papuList[j].healthArea.id

                data[3] = getLabelText(papuList[j].realm.label, this.state.lang)
                data[4] = ''
                data[5] = papuList[j].active
                data[6] = papuList[j].lastModifiedBy.username;
                data[7] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[8] = 0
                data[9] = 0
                papuDataArr[count] = data;
                count++;
            }
        }

        // if (papuDataArr.length == 0) {
        //     data = [];
        //     data[0] = 0;
        //     data[1] = "";
        //     data[2] = "";
        //     data[3] = "";
        //     data[4] = true;
        //     data[5] = "";
        //     data[6] = "";
        //     data[7] = 1;

        //     papuDataArr[0] = data;
        // }

        // if (this.state.eqUnitTableEl != "" && this.state.eqUnitTableEl != undefined) {
        //     this.state.eqUnitTableEl.destroy();
        // }
        if (this.state.table2Instance != "" && this.state.table2Instance != undefined) {
            // this.state.table2Instance.destroy();
            jexcel.destroy(document.getElementById("eqUnitInfoTable"), true);

        }
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 70],
            columns: [

                {
                    title: 'equivalancyUnitId',
                    type: 'hidden',
                    // readOnly: true
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
                    // readOnly: true
                    textEditor: true,
                },

                {
                    title: i18n.t('static.healtharea.realm'),
                    type: 'hidden',
                    // readOnly: true
                    // textEditor: true,
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'hidden',
                    // readOnly: true
                    textEditor: true,
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox',
                    // readOnly: true
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
                    //left align
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

                    var rowData = elInstance.getRowData(y);
                    var addRowId = rowData[9];
                    console.log("addRowId------>", addRowId);
                    if (addRowId == 1) {//active grade out
                        var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');

                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }
                }
            },

            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            // pagination: false,
            columnSorting: true,
            // tableOverflow: true,
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
            // onpaste: this.onPaste1,
            oneditionend: this.oneditionend1,
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded1,
            license: JEXCEL_PRO_KEY,
            editable: true,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {

                } else {

                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.addRow'),
                            onclick: function () {
                                this.addRow1();
                            }.bind(this)
                        });
                    }

                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                            // Line
                            // items.push({ type: 'line' });
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
                console.log("eqUnitTableEl---------->", this.state.eqUnitTableEl);
            })
    }

    filterHealthArea = function (instance, cell, c, r, source) {
        console.log("myList--------->0", this.state.technicalAreaList);

        var mylist = this.state.technicalAreaList.filter(c => c.id != '' && c.id != null);
        mylist = mylist.filter(c => c.active.toString() == "true");

        console.log("myList--------->1", this.state.technicalAreaList);
        // console.log("myList--------->2", mylist);
        // console.log("myList--------->3", this.state.forecastingUnitList);
        return mylist.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)

    getEquivalancyUnitAll() {
        EquivalancyUnitService.getEquivalancyUnitList().then(response => {
            if (response.status == 200) {
                console.log("EQ1------->ALL", response.data);
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                this.setState({
                    equivalancyUnitAllList: listArray,
                    // loading: false
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
                            message: 'static.unkownError',
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

    modelOpenClose() {
        if (!this.state.isModalOpen) { //didM
            this.getEquivalancyUnitAll();
        }
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            isChanged1: false
            // loading: true
        },
            () => {

            })
    }

    buildJexcel() {
        var papuList = this.state.selSource;

        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                // console.log("papuList-------->2", papuList[j].equivalencyUnit.healthAreaList.map(a => a.id));
                // console.log("papuList-------->3", papuList[j].equivalencyUnit.healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';'));

                data = [];
                data[0] = papuList[j].equivalencyUnitMappingId
                data[1] = papuList[j].equivalencyUnit.equivalencyUnitId
                // data[2] = papuList[j].equivalencyUnit.healthArea.id
                data[2] = papuList[j].equivalencyUnit.healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
                data[3] = papuList[j].tracerCategory.id
                data[4] = papuList[j].forecastingUnit.id

                data[5] = papuList[j].unit.id
                data[6] = papuList[j].convertToEu
                data[7] = papuList[j].notes
                data[8] = (papuList[j].program == null ? -1 : papuList[j].program.id) //Type
                data[9] = papuList[j].active
                data[10] = papuList[j].lastModifiedBy.username;
                data[11] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[12] = 0;
                data[13] = papuList[j].forecastingUnit.id
                data[14] = (papuList[j].program == null ? -1 : papuList[j].program.id) //Type
                data[15] = 0;
                data[16] = count;
                papuDataArr[count] = data;
                count++;
            }
        }

        // if (papuDataArr.length == 0) {
        //     data = [];
        //     data[0] = 0;
        //     data[1] = "";
        //     data[2] = "";
        //     data[3] = "";
        //     data[4] = "";
        //     data[5] = "";
        //     data[6] = "";
        //     data[7] = true;
        //     data[8] = "";
        //     data[9] = "";
        //     data[10] = 1;
        //     data[11] = 0;
        //     data[12] = 0;
        //     papuDataArr[0] = data;
        // }

        if (this.state.table1Instance != "" && this.state.table1Instance != undefined) {
            // this.state.table1Instance.destroy();
            jexcel.destroy(document.getElementById("paputableDiv"), true);
        }

        // if (this.state.table2Instance != "" && this.state.table2Instance != undefined) {
        //     // this.state.table2Instance.destroy();
        //     jexcel.destroy(document.getElementById("eqUnitInfoTable"), true);

        // }
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 50],
            columns: [

                {
                    title: 'equivalancyUnitMappingId',
                    type: 'hidden',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.equivalancyUnit.equivalancyUnitName'),
                    type: 'autocomplete',
                    source: this.state.equivalancyUnitList,
                    filter: this.filterEquivalancyUnit
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
                    filter: this.filterTracerCategoryList

                },
                {
                    title: i18n.t('static.product.unit1'),
                    type: 'autocomplete',
                    source: this.state.forecastingUnitList,
                    filter: this.filterForecastingUnitBasedOnTracerCategory
                },

                {
                    title: i18n.t('static.dashboard.unit'),
                    type: 'autocomplete',
                    readOnly: true,
                    source: this.state.unitList, //12
                },

                {
                    title: i18n.t('static.equivalencyUnit.conversionToEU'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##',
                    disabledMaskOnEdition: true
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                    width: 150,
                    // readOnly: true
                    textEditor: true,
                },
                {
                    // title: i18n.t('static.dataSet.dataSet'),
                    title: i18n.t('static.dataSource.program'),
                    type: 'autocomplete',
                    source: this.state.typeList,
                    filter: this.filterDataset
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox',
                    // readOnly: (( AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE')  || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE'))? false : true)
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
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    var rowData = elInstance.getRowData(y);

                    //left align
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

                    var typeId = rowData[14];
                    // console.log("updateTable------>", rowData[11]);                    

                    let roleArray = this.state.roleArray;
                    let checkReadOnly = 0;
                    if ((roleArray.includes('ROLE_DATASET_ADMIN') && typeId == -1 && typeId != 0)) {
                        checkReadOnly = checkReadOnly + 1;

                        // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        // cell1.classList.add('readonly');

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
                    // console.log("addRowId------>", addRowId);
                    if (addRowId == 1) {//active grade out
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else if (checkReadOnly == 0) {
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }




                    if (!roleArray.includes('ROLE_REALM_ADMIN') && !roleArray.includes('ROLE_DATASET_ADMIN')) {
                        // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        // cell1.classList.add('readonly');

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
            }.bind(this),
            // updateTable: function (el, cell, x, y, source, value, id) {
            //     if (y != null) {
            //         var elInstance = el.jexcel;
            //         var rowData = elInstance.getRowData(y);
            //         // var productCategoryId = rowData[0];
            //         var forecastingUnitId = rowData[13];
            //         var typeId = rowData[14];
            //         // console.log("updateTable------>", rowData[11]);
            //         if (forecastingUnitId == 0) {
            //             // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
            //             // cell1.classList.remove('readonly');

            //             var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');

            //             var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');

            //             var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');

            //             // var cell2 = elInstance.getCell(`C${parseInt(y) + 1}`)
            //             // cell2.classList.remove('readonly');


            //         } else {
            //             // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
            //             // cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             // var cell2 = elInstance.getCell(`C${parseInt(y) + 1}`)
            //             // cell2.classList.add('readonly');


            //         }

            //         let roleArray = this.state.roleArray;
            //         let checkReadOnly = 0;
            //         if ((roleArray.includes('ROLE_REALM_ADMIN') && typeId != -1 && typeId != 0) || (roleArray.includes('ROLE_DATASET_ADMIN') && typeId == -1 && typeId != 0)) {
            //             checkReadOnly = checkReadOnly + 1;

            //             // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
            //             // cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');
            //         }

            //         var addRowId = rowData[15];
            //         // console.log("addRowId------>", addRowId);
            //         if (addRowId == 1) {//active grade out
            //             var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');
            //         } else if (checkReadOnly == 0) {
            //             var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');
            //         }




            //         if (!roleArray.includes('ROLE_REALM_ADMIN') && !roleArray.includes('ROLE_DATASET_ADMIN')) {
            //             // var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
            //             // cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');
            //         }


            //     }
            // }.bind(this),
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            editable: true,
            // editable: (( AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE') ) ? true : false),
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {

                } else {

                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.addRow'),
                            onclick: function () {
                                this.addRow();
                            }.bind(this)
                        });
                    }

                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                    this.setState({ countVar: this.state.countVar - 1 })
                                }
                            });
                            // Line
                            // items.push({ type: 'line' });
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

    filterForecastingUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        // var value = (instance.jexcel.getJson(null, false)[r])[3];
        var value = (this.state.table1Instance.getJson(null, false)[r])[3];

        if (value > 0) {
            mylist = this.state.forecastingUnitList.filter(c => c.tracerCategoryId == value && c.active.toString() == "true");
        }
        // console.log("myList--------->1", value);
        // console.log("myList--------->2", mylist);
        // console.log("myList--------->3", this.state.forecastingUnitList);
        return mylist.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)

    filterEquivalancyUnit = function (instance, cell, c, r, source) {

        let mylist = this.state.equivalancyUnitList.filter(c => c.active.toString() == "true");
        return mylist;
    }.bind(this)


    filterTechnicalAreaList = function (instance, cell, c, r, source) {
        // var selectedEquivalencyUnitId = (instance.jexcel.getJson(null, false)[r])[1];
        var selectedEquivalencyUnitId = (this.state.table1Instance.getJson(null, false)[r])[1];

        let selectedEqObj = this.state.equivalancyUnitList.filter(c => c.id == selectedEquivalencyUnitId)[0];
        // console.log("selectedEqObj-------->", selectedEqObj);
        let mylist = [];
        let selectedHealthAreaList = selectedEqObj.healthAreaList;
        for (let k = 0; k < selectedHealthAreaList.length; k++) {
            mylist.push(this.state.technicalAreaList.filter(c => c.id == selectedHealthAreaList[k].id)[0]);
        }
        // console.log("selectedEqObj-------->", mylist);
        // let mylist = this.state.technicalAreaList.filter(c => c.id == selectedEqObj.healthArea.id);
        return mylist;
    }.bind(this)

    filterTracerCategoryList = function (instance, cell, c, r, source) {
        // var selectedHealthAreaId = (instance.jexcel.getJson(null, false)[r])[2];
        // let mylist = this.state.tracerCategoryList.filter(c => c.healthArea.id == selectedHealthAreaId);
        // return mylist;

        // var selectedHealthAreaId = (instance.worksheets[0].getJson(null, false)[r])[2].toString().split(';');
        var selectedHealthAreaId = (this.state.table1Instance.getJson(null, false)[r])[2].toString().split(';');

        let mylist = [];
        // console.log("mylist-------->0", (instance.jexcel.getJson(null, false)[r])[2]);
        // console.log("mylist-------->1", selectedHealthAreaId);
        for (let k = 0; k < selectedHealthAreaId.length; k++) {
            let temp = this.state.tracerCategoryList.filter(c => c.healthArea.id == selectedHealthAreaId[k]);
            for (let j = 0; j < temp.length; j++) {
                mylist.push(temp[j]);
            }
        }
        // console.log("mylist-------->2", mylist);
        return mylist;
    }.bind(this)

    filterDataset = function (instance, cell, c, r, source) {
        // var mylist = [];
        // var mylist = (instance.jexcel.getJson(null, false)[r])[5];
        // if (value > 0) {
        //     mylist = this.state.forecastingUnitList.filter(c => c.tracerCategoryId == value && c.active.toString() == "true");
        // }
        // console.log("myList--------->1", value);
        // console.log("myList--------->2", mylist);
        // console.log("myList--------->3", this.state.forecastingUnitList);
        var mylist = this.state.typeList;
        if (!this.state.roleArray.includes('ROLE_REALM_ADMIN')) {
            mylist.splice(0, 1);
        }
        return mylist;
        // return mylist.sort(function (a, b) {
        //     a = a.name.toLowerCase();
        //     b = b.name.toLowerCase();
        //     return a < b ? -1 : a > b ? 1 : 0;
        // });
    }.bind(this)

    getEquivalancyUnitMappingData() {
        this.hideSecondComponent();
        EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data);
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
                        // this.buildJexcel()
                        this.getForecastingUnitByTracerCategoriesId();
                        // this.filterData();
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
                            message: 'static.unkownError',
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

        console.log("response------->123", tracerCategoryIdList);
        console.log("response------->124", tracerCategoryListOfMappingData);
        console.log("response------->125", newTracerCategoryIdList);

        ForecastingUnitService.getForecastingUnitByTracerCategoriesId(newTracerCategoryIdList).then(response => {
            console.log("response------->126", response.data);
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                    // loading: false
                },
                    () => {
                        // this.getEquivalancyUnit();
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
                        message: 'static.unkownError',
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

    getTracerCategory() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log("TracerCategory------->", response.data)
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                        // loading: false
                    },
                        () => {
                            console.log("TracerCategory------->", this.state.tracerCategoryList)
                            // this.getForecastingUnit();
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
                            message: 'static.unkownError',
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

    getForecastingUnit() {
        ForecastingUnitService.getForecastingUnitListAll().then(response => {
            console.log("response------->" + response.data);
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                    // loading: false
                },
                    () => {
                        // this.getEquivalancyUnit();
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
                        message: 'static.unkownError',
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

    getUnit() {
        UnitService.getUnitListAll().then(response => {
            console.log("response------->" + response.data);
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                // listArray = listArray.filter(c => c.active == true);

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
                    // loading: false
                },
                    () => {
                        // this.getDataSet();
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
                        message: 'static.unkownError',
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

    getType() {
        ProgramService.getDataSetList()
            .then(response => {
                console.log("PROGRAM---------->", response.data)
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.programCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.programCode.toUpperCase(); // ignore upper and lowercase                   
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

                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    // console.log("decryptedUser=====>", decryptedUser);

                    var roleList = decryptedUser.roleList;
                    var roleArray = []
                    for (var r = 0; r < roleList.length; r++) {
                        roleArray.push(roleList[r].roleId)
                    }

                    tempProgramList.unshift({
                        // name: 'All',
                        name: i18n.t('static.common.realmLevel'),
                        id: -1,
                        active: true,
                    });


                    this.setState({
                        typeList: tempProgramList,
                        roleArray: roleArray
                        // loading: false
                    }, () => {
                        // console.log("PROGRAM---------->111", this.state.typeList) 
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
                            message: 'static.unkownError',
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

    getEquivalancyUnit() {
        EquivalancyUnitService.getEquivalancyUnitList().then(response => {
            if (response.status == 200) {
                console.log("EQ1------->", response.data);
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                            realm: listArray[i].realm
                        }
                        tempList[i] = paJson
                    }
                }

                this.setState({
                    equivalancyUnitList: tempList,
                    // loading: false
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
                            message: 'static.unkownError',
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

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged == true || this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    componentDidMount() {
        // this.getEquivalancyUnitMappingData();
        // console.log("USER------->", localStorage.getItem('curUser'));
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        // console.log("decryptedUser=====>", decryptedUser);

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

        // this.getTracerCategory();
    }

    getHealthArea() {
        HealthAreaService.getHealthAreaList()
            .then(response => {
                if (response.status == 200) {
                    console.log("response---", response.data);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].healthAreaId),
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
                            message: 'static.unkownError',
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

    oneditionend = function (instance, cell, x, y, value) {
        // var elInstance = instance.jexcel;
        var elInstance = this.state.table1Instance;
        var rowData = elInstance.getRowData(y);

        if (x == 6 && !isNaN(rowData[6]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        }

        elInstance.setValueFromCoords(12, y, 1, true);

    }

    addRow1 = function () {
        var elInstance = this.state.table2Instance;
        var json = elInstance.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = true;
        data[6] = "";
        data[7] = "";
        data[8] = 1;
        data[9] = 1;

        elInstance.insertRow(
            data, 0, 1
        );
    };

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

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.worksheets[0]).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance.worksheets[0]).setValueFromCoords(0, data[i].y, 0, true);
                    (instance.worksheets[0]).setValueFromCoords(8, data[i].y, true, true);
                    (instance.worksheets[0]).setValueFromCoords(11, data[i].y, 1, true);
                    (instance.worksheets[0]).setValueFromCoords(12, data[i].y, 0, true);
                    (instance.worksheets[0]).setValueFromCoords(13, data[i].y, 0, true);
                    (instance.worksheets[0]).setValueFromCoords(14, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    formSubmit1 = function () {

        var validation = this.checkValidation1();
        var elInstance = this.state.table2Instance
        console.log("validation------->", validation)
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = elInstance.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("8 map---" + map1.get("8"))
                if (parseInt(map1.get("8")) === 1) {
                    let healthAreaSplit = elInstance.getValueFromCoords(1, i).split(';');
                    console.log("healthAreaSplit--------->1", healthAreaSplit);
                    let healthAreaTempList = []
                    for (let k = 0; k < healthAreaSplit.length; k++) {
                        // healthAreaTempList.push({ id: healthAreaSplit[k] });
                        if (!isNaN(parseInt(healthAreaSplit[k]))) {
                            healthAreaTempList.push({ id: healthAreaSplit[k] });
                        }
                    }
                    console.log("healthAreaSplit--------->2", healthAreaTempList);
                    let json = {

                        equivalencyUnitId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("2"),
                        },
                        // healthArea: { id: parseInt(map1.get("2")) },
                        healthAreaList: healthAreaTempList,
                        active: map1.get("5"),


                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            EquivalancyUnitService.addUpdateEquivalancyUnit(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        // window.location.reload();
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), loading: true, color: 'green', isChanged1: false
                        },
                            () => {
                                this.modelOpenClose();
                                this.hideSecondComponent();
                                // this.getUsagePeriodData();
                                // this.getTracerCategory();
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
                                message: 'static.unkownError',
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
                                        // message: i18n.t('static.region.duplicateGLN'),
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
            console.log("Something went wrong");
        }
    }

    checkAndMarkDuplicate() {
        var elInstance = this.state.table1Instance;
        var tableJson = elInstance.getJson(null, false);

        console.log("tableJson------->", tableJson);

        let array = tableJson.map(m => {
            return {
                equivalencyUnitId: parseInt(m[1]),
                forecastingUnitId: parseInt(m[4]),
                programId: parseInt(m[8]),
                countVar: m[16],
                isChanged: m[12]
            }
        });

        console.log("tableJson------->1.1", array);

        let duplicates = array
            .map((el, i) => {
                return array.find((element, index) => {
                    if (i !== index && element.equivalencyUnitId === el.equivalencyUnitId && element.forecastingUnitId === el.forecastingUnitId && element.programId === el.programId) {
                        return el
                    }
                })
            })
            .filter(x => x);

        console.log("tableJson------->1", duplicates);

        // duplicates = duplicates.filter(c => c.isChanged == 1);

        if (duplicates.length > 0) {
            for (var k = 0; k < duplicates.length; k++) {
                for (var y = 0; y < tableJson.length; y++) {
                    var value = elInstance.getValueFromCoords(16, y);
                    // console.log("tableJson------->3", value);
                    if (duplicates[k].countVar == parseInt(value)) {
                        console.log("tableJson------->4", y);
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

    formSubmit = function () {

        var validation = this.checkValidation();
        var elInstance = this.state.table1Instance;
        let duplicateValidationFlag = this.checkAndMarkDuplicate();
        console.log("duplicateValidationFlag------->1", duplicateValidationFlag);
        if (validation == true && duplicateValidationFlag == false) {

            this.setState({ loading: true })
            var tableJson = elInstance.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("12 map---" + map1.get("12"))
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
                        // capacityCbm: map1.get("2").replace(",", ""),
                        // capacityCbm: map1.get("2").replace(/,/g, ""),
                        // capacityCbm: this.el.getValueFromCoords(2, i).replace(/,/g, ""),
                        // capacityCbm: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        // gln: (map1.get("3") === '' ? null : map1.get("3")),
                        // active: map1.get("4"),
                        // realmCountry: {
                        //     realmCountryId: parseInt(map1.get("5"))
                        // },
                        // regionId: parseInt(map1.get("6"))
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            EquivalancyUnitService.addUpdateEquivalancyUnitMapping(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        // this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green', isChanged: false
                        },
                            () => {
                                this.hideSecondComponent();
                                // this.getEquivalancyUnitMappingData();
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
                                message: 'static.unkownError',
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
                                        // message: error.response.data.messageCode,
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
            console.log("Something went wrong");
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[9].classList.add('AsteriskTheadtrTd');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        var elInstance = this.state.table1Instance;
        // console.log("LOG---------->1", elInstance);

        //Equivalancy Unit
        if (x == 1) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("B").concat(parseInt(y) + 1);

            // let selectedEquivalencyUnitId = this.el.getValueFromCoords(1, y);
            // if (selectedEquivalencyUnitId != null && selectedEquivalencyUnitId != '' && selectedEquivalencyUnitId != undefined) {
            //     let selectedEqObj = this.state.equivalancyUnitList.filter(c => c.id == selectedEquivalencyUnitId)[0];
            //     let healthAreaId = this.state.technicalAreaList.filter(c => c.id == selectedEqObj.healthArea.id)[0].id;
            //     elInstance.setValueFromCoords(2, y, healthAreaId, true);//calculate
            // } else {
            //     elInstance.setValueFromCoords(2, y, '', true);
            // }


            let selectedEquivalencyUnitId = this.el.getValueFromCoords(1, y);
            if (selectedEquivalencyUnitId != null && selectedEquivalencyUnitId != '' && selectedEquivalencyUnitId != undefined) {
                let selectedEqObj = this.state.equivalancyUnitList.filter(c => c.id == selectedEquivalencyUnitId)[0];
                console.log("selectedEqObj--------->", selectedEqObj);
                let healthAreaList = selectedEqObj.healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
                elInstance.setValueFromCoords(2, y, healthAreaList, true);//calculate
            } else {
                elInstance.setValueFromCoords(2, y, '', true);
            }

            // elInstance.setValueFromCoords(2, y, '', true);
            elInstance.setValueFromCoords(3, y, '', true);
            elInstance.setValueFromCoords(4, y, '', true);
            elInstance.setValueFromCoords(5, y, '', true);
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


        //HealthArea
        // if (x == 2) {
        //     // console.log("LOG---------->2", value);
        //     var budgetRegx = /^\S+(?: \S+)*$/;
        //     var col = ("C").concat(parseInt(y) + 1);
        //     elInstance.setValueFromCoords(3, y, '', true);
        //     elInstance.setValueFromCoords(4, y, '', true);
        //     elInstance.setValueFromCoords(5, y, '', true);
        //     if (value == "") {
        //         elInstance.setStyle(col, "background-color", "transparent");
        //         elInstance.setStyle(col, "background-color", "yellow");
        //         elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
        //     } else {
        //         if (!(budgetRegx.test(value))) {
        //             elInstance.setStyle(col, "background-color", "transparent");
        //             elInstance.setStyle(col, "background-color", "yellow");
        //             elInstance.setComments(col, i18n.t('static.message.spacetext'));
        //         } else {
        //             elInstance.setStyle(col, "background-color", "transparent");
        //             elInstance.setComments(col, "");
        //         }
        //     }
        // }


        //Tracer Category
        if (x == 3) {
            // console.log("LOG---------->3", value);
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            elInstance.setValueFromCoords(4, y, '', true);
            elInstance.setValueFromCoords(5, y, '', true);
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

        //Forecasting Unit
        if (x == 4) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("E").concat(parseInt(y) + 1);
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

                    let obj = this.state.forecastingUnitList.filter(c => c.id == parseInt(value))[0];
                    console.log("-----------XXXXXXXXXXXXXXXXXX", obj);
                    if (obj != undefined && obj != null) {
                        this.el.setValueFromCoords(5, y, obj.unit.id, true);
                    }
                }
            }

        }

        //conversion To FU 14,4
        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            value = elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = elInstance.getValueFromCoords(6, y);
            }
            var reg = /^\d{1,14}(\.\d{1,4})?$/;
            if (value != "") {
                if (isNaN(parseInt(value))) {//string value check
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, 'String value not allowed')
                }
                // else if (!Number.isInteger(Number(value))) {//decimal value check
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setStyle(col, "background-color", "yellow");
                //     elInstance.setComments(col, 'Decimal value not allowed')
                // } 
                else if (!(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));

            }
            //// var reg = DECIMAL_NO_REGEX;
            // var reg = /^\d{1,14}(\.\d{1,4})?$/;
            // if (value == "") {
            //     elInstance.setStyle(col, "background-color", "transparent");
            //     elInstance.setStyle(col, "background-color", "yellow");
            //     elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            // } else {
            //     // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
            //     if (!(reg.test(value))) {
            //         elInstance.setStyle(col, "background-color", "transparent");
            //         elInstance.setStyle(col, "background-color", "yellow");
            //         elInstance.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
            //     } else {
            //         if (isNaN(Number.parseInt(value)) || value <= 0) {
            //             elInstance.setStyle(col, "background-color", "transparent");
            //             elInstance.setStyle(col, "background-color", "yellow");
            //             elInstance.setComments(col, i18n.t('static.program.validvaluetext'));
            //         } else {
            //             elInstance.setStyle(col, "background-color", "transparent");
            //             elInstance.setComments(col, "");
            //         }

            //     }

            // }
        }

        //Type
        if (x == 8) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("I").concat(parseInt(y) + 1);
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

        //Active
        if (x != 12) {
            elInstance.setValueFromCoords(12, y, 1, true);
        }

        this.setState({
            isChanged: true,

        }, () => { });



    }.bind(this);
    // -----end of changed function

    checkValidation1 = function () {
        var valid = true;
        var elInstance = this.state.table2Instance;
        var json = elInstance.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = elInstance.getValueFromCoords(8, y);
            if (parseInt(value) == 1) {
                //Equivalency unit
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                console.log("value-----", value);
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


                //HealthAreaId
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


            }
        }
        return valid;
    }

    checkValidation = function () {
        var valid = true;
        var elInstance = this.state.table1Instance;
        var json = elInstance.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = elInstance.getValueFromCoords(12, y);
            if (parseInt(value) == 1) {

                //Equivalancy Unit
                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y);
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
                            this.hideSecondComponent();
                        })
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                //HealthArea
                // var col = ("C").concat(parseInt(y) + 1);
                // var value = elInstance.getValueFromCoords(2, y);
                // if (value == "") {
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setStyle(col, "background-color", "yellow");
                //     elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                //     valid = false;
                // } else {
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setComments(col, "");
                // }

                //TracerCategory
                var col = ("D").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(3, y);
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
                            this.hideSecondComponent();
                        })
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }


                //ForecastingUnit
                var col = ("E").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(4, y);
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
                            this.hideSecondComponent();
                        })
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }


                //conversion to FU decimal 14,4
                // var col = ("G").concat(parseInt(y) + 1);
                // var value = elInstance.getValueFromCoords(6, y);
                // var reg = /^\d{1,14}(\.\d{1,4})?$/;
                // if (value == "") {
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setStyle(col, "background-color", "yellow");
                //     elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                //     valid = false;
                //     this.setState({
                //         message: i18n.t('static.supplyPlan.validationFailed'),
                //         color: 'red'
                //     },
                //         () => {
                //             this.hideSecondComponent();
                //         })
                // } else {
                //     if (!(reg.test(value))) {
                //         elInstance.setStyle(col, "background-color", "transparent");
                //         elInstance.setStyle(col, "background-color", "yellow");
                //         elInstance.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                //         valid = false;
                //         this.setState({
                //             message: i18n.t('static.supplyPlan.validationFailed'),
                //             color: 'red'
                //         },
                //             () => {
                //                 this.hideSecondComponent();
                //             })
                //     } else {
                //         if (isNaN(Number.parseInt(value)) || value <= 0) {
                //             elInstance.setStyle(col, "background-color", "transparent");
                //             elInstance.setStyle(col, "background-color", "yellow");
                //             elInstance.setComments(col, i18n.t('static.program.validvaluetext'));
                //             valid = false;
                //             this.setState({
                //                 message: i18n.t('static.supplyPlan.validationFailed'),
                //                 color: 'red'
                //             },
                //                 () => {
                //                     this.hideSecondComponent();
                //                 })
                //         } else {
                //             elInstance.setStyle(col, "background-color", "transparent");
                //             elInstance.setComments(col, "");
                //         }
                //     }
                // }

                var col = ("G").concat(parseInt(y) + 1);
                var value = elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value == '' || value == null) {
                    value = elInstance.getValueFromCoords(6, y);
                }
                // var value = elInstance.getValueFromCoords(5, y);
                var reg = /^\d{1,14}(\.\d{1,4})?$/;
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
                            this.hideSecondComponent();
                        })
                } else {
                    if (isNaN(parseInt(value))) {//string value check
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, 'String value not allowed');
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                    // else if (!Number.isInteger(Number(value))) {//decimal value check
                    //     this.el.setStyle(col, "background-color", "transparent");
                    //     this.el.setStyle(col, "background-color", "yellow");
                    //     this.el.setComments(col, 'Decimal value not allowed');
                    //     valid = false;
                    // }
                    else if (!(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }


                //Type
                var col = ("I").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(8, y);
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
                            this.hideSecondComponent();
                        })
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }



            }
        }
        return valid;
    }

    filterData() {
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;
        let typeId = document.getElementById("typeId").value;
        let statusId = document.getElementById("statusId").value;

        if (typeId != 0 && tracerCategoryId != 0) {
            console.log("statusId------->11");
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
            console.log("statusId------->111");
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
            console.log("statusId------->1111");
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
            console.log("statusId------->1111", statusId);
            let selSource = this.state.equivalancyUnitMappingList;
            if (statusId == 1) {
                console.log("statusId------->IF");
                selSource = selSource.filter(c => c.active == true);
            } else if (statusId == 2) {
                console.log("statusId------->ELSE");
                selSource = selSource.filter(c => c.active == false);
            }
            this.setState({
                selSource: selSource
            },
                () => { this.buildJexcel() });
        }
    }

    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }


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
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>
                    <div className="row pl-lg-3 pr-lg-3">
                        <div className="col-md-8">
                            {/* <h5 className="red">{i18n.t('static.common.customWarningEquivalencyUnit')}</h5> */}
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
                                    {/* <a href='javascript:;' onClick={this.modelOpenClose} ><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a> */}
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
                                                {/* {dataSourceTypeList} */}
                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon> */}
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
                        {(this.state.roleArray.includes('ROLE_REALM_ADMIN') || this.state.roleArray.includes('ROLE_DATASET_ADMIN')) &&
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
                                <div>
                                    <h3 className='ShowGuidanceHeading'>{i18n.t('static.equivalancyUnit.equivalancyUnits')}</h3>
                                </div>
                                <p>
                                    <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.purpose')} :</span> {i18n.t('static.equivalancyUnit.EnableUser')}
                                    </p>
                                </p>
                                <p style={{ fontSize: '13px' }}>
                                    <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.useThisScreen')}:</span><br></br>
                                        <b>{i18n.t('static.equivalancyUnit.MappingEquivalency')}</b><br></br>
                                        {i18n.t('static.equivalancyUnit.ManageMappings')} {i18n.t('static.equivalancyUnit.ProgramAdmins')}
                                    </p>
                                </p>
                                <p>
                                    {i18n.t('static.equivalancyUnit.ForecastingMedicines')}
                                    <table className="table table-bordered ">
                                        <thead>
                                            <tr>
                                                <th>Equivalency Unit</th>
                                                <th>Forecasting Unit</th>
                                                <th>Conversion to EU</th>
                                                <th style={{ width: '150px' }}>Average Treatment required to cure QATitis</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1 Treatment for QATitis </td>
                                                <td>1 tablet of FASPicillin</td>
                                                <td>14</td>
                                                <td>1 tablet a day for 2 weeks</td>
                                            </tr>
                                            <tr>
                                                <td>1 Treatment for QATitis </td>
                                                <td>5mL tube of FASPasone (cream)</td>
                                                <td>1</td>
                                                <td>0.5mL/day applied on the forehead over 10 days (1 tube total)</td>
                                            </tr>
                                            <tr>
                                                <td>1 Treatment for QATitis </td>
                                                <td>2mL vial of FASPicaine (injection)</td>
                                                <td>0.5</td>
                                                <td>One injection of 1mL (Two people can share one vial)</td>
                                            </tr>
                                            <tr>
                                                <td>1 Treatment for QATitis </td>
                                                <td>1 bar of white chocolate</td>
                                                <td>2</td>
                                                <td rowspan="3">2 bars of chocolate. The type of chocolate does not matter, as all chocolate contains the natural form of FASPicillin.  </td>
                                            </tr>
                                            <tr>
                                                <td>1 Treatment for QATitis  </td>
                                                <td>1 bar of dark chocolate</td>
                                                <td>2</td>

                                            </tr>
                                            <tr>
                                                <td>1 Treatment for QATitis </td>
                                                <td>1 bar of milk chocolate</td>
                                                <td>2</td>

                                            </tr>
                                        </tbody>
                                    </table>
                                </p>
                                <p style={{ fontSize: '13px' }}>
                                    <b>{i18n.t('static.equivalancyUnit.CreatingManaging')}  </b><br></br>
                                    {i18n.t('static.equivalancyUnit.ExistingEquivalency')}
                                </p>
                                <p>
                                    <b>{i18n.t('static.equivalancyUnit.EquivalencyUsed')}</b>
                                    <ul>
                                        <li>{i18n.t('static.equivalancyUnit.InThe')} '<a href="/#/report/compareAndSelectScenario" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.compareAndSelect')}</a>' {i18n.t('static.equivalancyUnit.ForecastsInEUs')} {i18n.t('static.equivalancyUnit.DisplayTheirForecast')} </li>
                                        <li>{i18n.t('static.equivalancyUnit.InThe')} '<a href="/#/forecastReport/forecastOutput" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.monthlyForecast')}</a>' {i18n.t('static.equivalancyUnit.SelectedForecasts')} {i18n.t('static.equivalancyUnit.UserForecasted')}</li>
                                    </ul>
                                </p>
                                <p>
                                    <table className="table table-bordered ">
                                        <thead>
                                            <tr>
                                                <th>Forecast</th>
                                                <th>Equivalent in "Treatments for QATitis"</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>10,000 bars of dark chocolate </td>
                                                <td style={{ textAlign: 'center' }}>5,000</td>
                                            </tr>
                                            <tr>
                                                <td>10,000 bars of white chocolate </td>
                                                <td style={{ textAlign: 'center' }}>5,000</td>
                                            </tr>
                                            <tr>
                                                <td>14,000 tablets of FASPicillin </td>
                                                <td style={{ textAlign: 'center' }}>1,000</td>
                                            </tr>
                                            <tr>
                                                <td style={{ textAlign: 'right', borderLeft: '1px solid #fff', borderBottom: '1px solid #fff' }}><b>Total</b></td>
                                                <td style={{ textAlign: 'center' }}><b>7,000</b></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </p>

                            </ModalBody>
                        </div>
                    </Modal>

                    <Modal isOpen={this.state.isModalOpen}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader>
                            <strong>{i18n.t('static.equivalancyUnit.equivalancyUnits')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <span><h5 style={{ color: this.state.color }} id="div3">{this.state.message}</h5></span>
                            {/* <h6 className="red" id="div3"></h6> */}
                            <div>
                                <div id="eqUnitInfoTable" className="AddListbatchtrHeight RemoveStriped consumptionDataEntryTable">
                                </div>
                            </div>
                            <br />
                        </ModalBody>

                        <ModalFooter>
                            {(this.state.roleArray.includes('ROLE_REALM_ADMIN') || this.state.roleArray.includes('ROLE_DATASET_ADMIN')) &&
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
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }

}

export default EquivalancyUnit

