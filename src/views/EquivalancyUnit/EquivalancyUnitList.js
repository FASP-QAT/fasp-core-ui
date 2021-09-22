import React, { Component } from "react";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form,
    Modal, ModalBody, ModalFooter, ModalHeader, InputGroup
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import RegionService from "../../api/RegionService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import moment from 'moment';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import TracerCategoryService from '../../api/TracerCategoryService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js';
import { SECRET_KEY, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from "../../Constants";
// import { Modal } from "bootstrap";

const entityname = i18n.t('static.equivalancyUnit.equivalancyUnit')


class EquivalancyUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            equivalancyUnitMappingList: [],
            message: '',
            selSource: [],

            typeList: [{ id: 1, name: 'Realm' }, { id: 2, name: 'DataSet' }],
            tracerCategoryList: [],
            tracerCategoryList1: [],
            forecastingUnitList: [],
            equivalancyUnitList: [],
            roleArray: [],
            isModalOpen: false,
            equivalancyUnitAllList: [],
            eqUnitTableEl: "",
            table1Instance: "",
            table2Instance: "",
            selSource: [],

            loading1: true,
            loading2: true
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

        this.getEquivalancyUnitMappingData = this.getEquivalancyUnitMappingData.bind(this);

        //jumper
        this.getTracerCategory = this.getTracerCategory.bind(this);
        this.getForecastingUnit = this.getForecastingUnit.bind(this);
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

    loaded1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');

    }

    oneditionend1 = function (instance, cell, x, y, value) {
        // var elInstance = instance.jexcel;'
        var elInstance = this.state.table2Instance;
        var rowData = elInstance.getRowData(y);

        elInstance.setValueFromCoords(7, y, 1, true);

    }

    onPaste1(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(7, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(8, data[i].y, 1, true);
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

        //Active
        if (x != 7) {
            elInstance.setValueFromCoords(7, y, 1, true);
        }
    }.bind(this);

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
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
                data[1] = getLabelText(papuList[j].label, this.state.lang)
                data[2] = getLabelText(papuList[j].realm.label, this.state.lang)
                data[3] = papuList[j].notes
                data[4] = papuList[j].active
                data[5] = papuList[j].lastModifiedBy.username;
                data[6] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[7] = 0
                data[8] = 0
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
            this.state.table2Instance.destroy();
        }
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100],
            columns: [

                {
                    title: 'equivalancyUnitId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.equivalancyUnit.equivalancyUnits'),
                    type: 'text',
                    // readOnly: true
                    textEditor: true,
                },
                {
                    title: i18n.t('static.equivalancyUnit.type'),
                    type: 'text',
                    readOnly: true
                    // textEditor: true,
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
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
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);
                    var addRowId = rowData[8];
                    console.log("addRowId------>", addRowId);
                    if (addRowId == 1) {//active grade out
                        var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }
                }
            },
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            // pagination: false,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed1,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste1,
            oneditionend: this.oneditionend1,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded1,
            license: JEXCEL_PRO_KEY,
            editable: true,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {

                } else {

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
                            color: "red",
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
                                    color: "red",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "red",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "red",
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
            // loading: false
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

                data = [];
                data[0] = papuList[j].equivalencyUnitMappingId
                data[1] = papuList[j].tracerCategory.id
                data[2] = papuList[j].forecastingUnit.id
                data[3] = papuList[j].equivalencyUnit.equivalencyUnitId
                data[4] = papuList[j].convertToFu
                data[5] = papuList[j].notes
                data[6] = (papuList[j].program == null ? -1 : papuList[j].program.id) //Type
                data[7] = papuList[j].active
                data[8] = papuList[j].lastModifiedBy.username;
                data[9] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[10] = 0;
                data[11] = papuList[j].forecastingUnit.id
                data[12] = (papuList[j].program == null ? -1 : papuList[j].program.id) //Type
                data[13] = 0;
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
            this.state.table1Instance.destroy();
        }

        if (this.state.table2Instance != "" && this.state.table2Instance != undefined) {
            this.state.table2Instance.destroy();
        }
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100],
            columns: [

                {
                    title: 'equivalancyUnitMappingId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'autocomplete',
                    source: this.state.tracerCategoryList,

                },
                {
                    title: i18n.t('static.product.unit1'),
                    type: 'autocomplete',
                    source: this.state.forecastingUnitList,
                    filter: this.filterForecastingUnitBasedOnTracerCategory
                },
                {
                    title: i18n.t('static.equivalancyUnit.equivalancyUnit'),
                    type: 'autocomplete',
                    source: this.state.equivalancyUnitList,
                },
                {
                    title: i18n.t('static.equivalancyUnit.conversionToFu'),
                    type: 'text',
                    // readOnly: true
                    textEditor: true,
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                    // readOnly: true
                    textEditor: true,
                },
                {
                    title: i18n.t('static.equivalancyUnit.type'),
                    type: 'autocomplete',
                    source: this.state.typeList,
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
                }

            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);
                    // var productCategoryId = rowData[0];
                    var forecastingUnitId = rowData[11];
                    var typeId = rowData[12];
                    console.log("updateTable------>", rowData[11]);
                    if (forecastingUnitId == 0) {
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');

                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');

                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');

                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');

                        // var cell2 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        // cell2.classList.remove('readonly');


                    } else {
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        // var cell2 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        // cell2.classList.add('readonly');


                    }


                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    console.log("decryptedUser=====>", decryptedUser);

                    var roleList = decryptedUser.roleList;
                    var roleArray = []
                    for (var r = 0; r < roleList.length; r++) {
                        roleArray.push(roleList[r].roleId)
                    }



                    if ((roleArray.includes('ROLE_REALM_ADMIN') && typeId != -1 && typeId != 0) || (roleArray.includes('ROLE_DATASET_ADMIN') && typeId == -1 && typeId != 0)) {
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
                    }
                    // if (this.state.roleArray.includes('ROLE_DATASET_ADMIN') && typeId == -1) {
                    //     var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');

                    //     var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');

                    //     var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');

                    //     var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');

                    //     var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');

                    //     var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');

                    //     var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');
                    // }



                    var addRowId = rowData[13];
                    console.log("addRowId------>", addRowId);
                    if (addRowId == 1) {//active grade out
                        var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }


                }
            },
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
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
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            editable: true,
            // editable: (( AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE') ) ? true : false),
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {

                } else {

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

        var table1Instance = jexcel(document.getElementById("paputableDiv"), options);
        this.el = table1Instance;
        this.setState({
            table1Instance: table1Instance,
            loading: false
        })
    }

    filterForecastingUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[1];
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

    getEquivalancyUnitMappingData() {
        this.hideSecondComponent();
        EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data);

                this.setState({
                    equivalancyUnitMappingList: response.data,
                    selSource: response.data,
                },
                    () => {
                        this.buildJexcel()
                    })

            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false, color: "red",
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
                            color: "red",
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
                                    color: "red",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "red",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "red",
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
                            this.getForecastingUnit();
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
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].forecastingUnitId),
                            active: listArray[i].active,
                            tracerCategoryId: listArray[i].tracerCategory.id
                        }
                        tempList[i] = paJson
                    }
                }

                this.setState({
                    forecastingUnitList: tempList,
                    // loading: false
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
                    if (roleArray.includes('ROLE_REALM_ADMIN')) {
                        tempProgramList.unshift({
                            name: 'All',
                            id: -1,
                            active: true,
                        });
                    }

                    this.setState({
                        typeList: tempProgramList,
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
                            color: "red",
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
                                    color: "red",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "red",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "red",
                                });
                                break;
                        }
                    }
                }
            );
    }

    componentDidMount() {
        // this.getEquivalancyUnitMappingData();
        // console.log("USER------->", localStorage.getItem('curUser'));

        this.getTracerCategory();
    }

    oneditionend = function (instance, cell, x, y, value) {
        // var elInstance = instance.jexcel;
        var elInstance = this.state.table1Instance;
        var rowData = elInstance.getRowData(y);

        if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        }

        elInstance.setValueFromCoords(10, y, 1, true);

    }

    addRow1 = function () {
        var elInstance = this.state.table2Instance;
        var json = elInstance.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = true;
        data[5] = "";
        data[6] = "";
        data[7] = 1;
        data[8] = 1;

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
        data[7] = true;
        data[8] = "";
        data[9] = "";
        data[10] = 1;
        data[11] = 0;
        data[12] = 0;
        data[13] = 1;

        elInstance.insertRow(
            data, 0, 1
        );
    };

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(7, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(10, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(11, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(12, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(13, data[i].y, 1, true);
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
                console.log("7 map---" + map1.get("7"))
                if (parseInt(map1.get("7")) === 1) {
                    let json = {

                        equivalencyUnitId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("1"),
                        },
                        active: map1.get("4"),


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
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), loading: false, color: 'green'
                        },
                            () => {
                                this.modelOpenClose();
                                this.hideSecondComponent();
                                // this.getUsagePeriodData();
                                this.getTracerCategory();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "red", loading: false
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
                                color: "red",
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
                                        color: "red",
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
                                        color: "red",
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
                                        color: "red",
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

    formSubmit = function () {

        var validation = this.checkValidation();
        var elInstance = this.state.table1Instance;
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = elInstance.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("10 map---" + map1.get("10"))
                if (parseInt(map1.get("10")) === 1) {
                    let json = {
                        equivalencyUnitMappingId: parseInt(map1.get("0")),
                        tracerCategory: { id: parseInt(map1.get("1")) },
                        forecastingUnit: { id: parseInt(map1.get("2")) },
                        equivalencyUnit: { equivalencyUnitId: parseInt(map1.get("3")) },
                        convertToFu: map1.get("4").toString().replace(/,/g, ""),
                        notes: map1.get("5"),
                        program: (parseInt(map1.get("6")) == -1 ? null : { id: parseInt(map1.get("6")) }),
                        active: map1.get("7"),
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
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), loading: false, color: 'green'
                        },
                            () => {
                                this.hideSecondComponent();
                                // this.getEquivalancyUnitMappingData();
                                this.getTracerCategory();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "red", loading: false
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
                                color: "red", loading: false
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
                                        message: i18n.t('static.region.duplicateGLN'),
                                        color: "red", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        color: "red", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        color: "red", loading: false
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
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        // tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        var elInstance = this.state.table1Instance;
        console.log("LOG---------->1", elInstance);
        //Tracer Category
        if (x == 1) {
            console.log("LOG---------->2", value);
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("B").concat(parseInt(y) + 1);
            elInstance.setValueFromCoords(2, y, '', true);
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
                    elInstance.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        //Equivalancy Unit
        if (x == 3) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
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

        //conversion To FU 14,4
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = elInstance.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = /^\d{1,14}(\.\d{1,4})?$/;
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                } else {
                    if (isNaN(Number.parseInt(value)) || value <= 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.program.validvaluetext'));
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                }

            }
        }

        //Type
        if (x == 6) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("G").concat(parseInt(y) + 1);
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
        if (x != 10) {
            elInstance.setValueFromCoords(10, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    checkValidation1 = function () {
        var valid = true;
        var elInstance = this.state.table2Instance;
        var json = elInstance.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = elInstance.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {
                //UsagePeriod
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y);
                console.log("value-----", value);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(budgetRegx.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.spacetext'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
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
            var value = elInstance.getValueFromCoords(10, y);
            if (parseInt(value) == 1) {

                //TracerCategory
                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }


                //ForecastingUnit
                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }


                //Equivalancy Unit
                var col = ("D").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(3, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }


                //conversion to FU decimal 14,4
                var col = ("E").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(4, y);
                var reg = /^\d{1,14}(\.\d{1,4})?$/;
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                            elInstance.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    }
                }


                //Type
                var col = ("G").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(6, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
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

        if (typeId != 0 && tracerCategoryId != 0) {
            const selSource = this.state.equivalancyUnitMappingList.filter(c => (typeId == 2 ? c.program != null : c.program == null) && c.tracerCategory.id == tracerCategoryId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (typeId != 0) {
            const selSource = this.state.equivalancyUnitMappingList.filter(c => (typeId == 2 ? c.program != null : c.program == null))

            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (tracerCategoryId != 0) {
            const selSource = this.state.equivalancyUnitMappingList.filter(c => c.tracerCategory.id == tracerCategoryId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else {
            this.setState({
                selSource: this.state.equivalancyUnitMappingList
            },
                () => { this.buildJexcel() });
        }
    }


    render() {

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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }}>{i18n.t('static.common.customWarningEquivalencyUnit')}</h5>
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>

                    <div className="Card-header-addicon problemListMarginTop">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a className="card-header-action">
                                     {/* <a href='javascript:;' onClick={this.modelOpenClose} ><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a> */}
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.modelOpenClose()}> {i18n.t('static.equivalancyUnit.equivalancyUnit')}</Button>
                                </a>
                            </div>
                        </div>
                    </div>

                    <CardBody className="pl-2 pr-2">

                        <Col md="6 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
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
                                                <option value="1">{i18n.t('static.dashboard.realmheader')}</option>
                                                <option value="2">{i18n.t('static.forecastProgram.forecastProgram')}</option>
                                                {/* {dataSourceTypeList} */}
                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
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

                        <FormGroup>
                            {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                            <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                            &nbsp;
                        </FormGroup>

                    </CardFooter>
                </Card>


                <Modal isOpen={this.state.isModalOpen}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader>
                        <strong>{i18n.t('static.equivalancyUnit.equivalancyUnit')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3"></h6>
                        <div className="table-responsive">
                            <div id="eqUnitInfoTable" className="AddListbatchtrHeight">
                            </div>
                        </div>
                        <br />
                    </ModalBody>
                    <ModalFooter>
                        <div className="mr-0">
                            <Button type="submit" size="md" color="success" className="float-right" onClick={this.formSubmit1} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" id="eqUnitAddRow" type="button" onClick={() => this.addRow1()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                        </div>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.modelOpenClose()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>

            </div>
        )
    }
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default EquivalancyUnit

