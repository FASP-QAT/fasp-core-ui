import React, { Component } from "react";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import RegionService from "../../api/RegionService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import moment from 'moment';
import UsageTemplateService from "../../api/UsageTemplateService";
import TracerCategoryService from '../../api/TracerCategoryService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import UsagePeriodService from '../../api/UsagePeriodService';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js';
import { SECRET_KEY, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from "../../Constants";

const entityname = i18n.t('static.modelingType.modelingType')


class usageTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usageTemplateList: [],
            message: '',
            selSource: [],
            loading: true,
            t1Instance: '',
            t2Instance: '',
            tracerCategoryList: [],
            forecastingUnitList: [],
            roleArray: [],
            typeList: [],
            usagePeriodList: []
        }
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.submitForm = this.submitForm.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        // this.Capitalize = this.Capitalize.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
        // this.CapitalizeFull = this.CapitalizeFull.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);


        //jumper
        this.getDataSet = this.getDataSet.bind(this);
        this.getTracerCategory = this.getTracerCategory.bind(this);
        this.getForecastingUnit = this.getForecastingUnit.bind(this);
        this.getUsagePeriod = this.getUsagePeriod.bind(this);
        this.getUsageTemplateData = this.getUsageTemplateData.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    getDataSet() {
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
                        this.getUsagePeriod();
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
                        // tracerCategoryList1: response.data
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
                        this.getDataSet();
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

    getUsagePeriod() {
        UsagePeriodService.getUsagePeriod().then(response => {
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
                            id: parseInt(listArray[i].usagePeriodId),
                            active: listArray[i].active,
                        }
                        tempList[i] = paJson
                    }
                }

                this.setState({
                    usagePeriodList: tempList,
                    // loading: false
                },
                    () => {
                        this.getUsageTemplateData();
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

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].usageTemplateId
                data[1] = (papuList[j].program == null ? -1 : papuList[j].program.id) //Type
                data[2] = papuList[j].tracerCategory.id
                data[3] = papuList[j].forecastingUnit.id
                data[4] = papuList[j].lagInMonths
                data[5] = papuList[j].usageType.id

                data[6] = "Every"
                data[7] = papuList[j].noOfPatients
                data[8] = "patient"

                data[9] = "requires"
                data[10] = papuList[j].noOfForecastingUnits
                data[11] = papuList[j].tracerCategory.label.label_en

                data[12] = ""//hidden

                data[13] = papuList[j].oneTimeUsage

                data[14] = papuList[j].usageFrequencyCount;
                data[15] = ""
                data[16] = papuList[j].usageFrequencyUsagePeriod.label.label_en;

                data[17] = ''//hidden

                data[18] = ""
                data[19] = papuList[j].repeatCount;
                data[20] = papuList[j].repeatUsagePeriod.label.label_en;

                data[21] = ''//hidden

                data[22] = ''//usage in words
                data[23] = 1;

                papuDataArr[count] = data;
                count++;
            }
        }

        if (papuDataArr.length == 0) {
            data = [];
            data[0] = 0;
            data[1] = "";
            data[2] = ""
            data[3] = "";
            data[4] = 0;
            data[5] = "";

            data[6] = "Every";
            data[7] = 0;
            data[8] = "patient"

            data[9] = "requires";
            data[10] = 0;
            data[11] = "";

            data[12] = "";

            data[13] = "";

            data[14] = ""
            data[15] = "";
            data[16] = "";

            data[17] = "";

            data[18] = "";
            data[19] = "";
            data[20] = ""

            data[21] = "";

            data[22] = "";
            data[23] = 1;
            papuDataArr[0] = data;
        }

        this.el = jexcel(document.getElementById("paputableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100,100, 100, 100, 100, 100,100, 100, 100, 100, 100,100, 100, 100, 100, 100,100, 100, 200],
            columns: [

                {
                    title: 'usageTemplateId',
                    type: 'hidden',
                    readOnly: true //0
                },
                {
                    title: i18n.t('static.forecastProgram.forecastProgram'),
                    type: 'autocomplete',
                    source: this.state.typeList, //1
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'autocomplete',
                    source: this.state.tracerCategoryList, //2

                },
                {
                    title: i18n.t('static.product.unit1'),
                    type: 'autocomplete',
                    source: this.state.forecastingUnitList,
                    filter: this.filterForecastingUnitBasedOnTracerCategory //3
                },
                {
                    title: i18n.t('static.usageTemplate.lagInMonth'),
                    type: 'number',
                    // readOnly: true
                    textEditor: true, //4
                },
                {
                    title: i18n.t('static.supplyPlan.type'),
                    type: 'dropdown',
                    source: [
                        { id: true, name: i18n.t('static.usageTemplate.continuous') },
                        { id: false, name: i18n.t('static.usageTemplate.discrete') }
                    ] //5
                },
                {
                    title: i18n.t('static.usageTemplate.people'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //6
                },
                {
                    title: i18n.t('static.usageTemplate.people'),
                    type: 'number',
                    // readOnly: true
                    textEditor: true, //7
                },
                {
                    title: i18n.t('static.usageTemplate.people'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //8
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //9
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'number',
                    // readOnly: true
                    textEditor: true, //10
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //11
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'text',//hidden black
                    // readOnly: true
                    textEditor: true, //12
                },
                {
                    title: i18n.t('static.usageTemplate.onTimeUsage?'),
                    type: 'checkbox',
                    readOnly: false
                    // readOnly: true //13
                },
                {
                    title: i18n.t('static.usageTemplate.usageFrequency'),
                    type: 'numeric',
                    // readOnly: true
                    textEditor: true,
                    decimal: '.', //14
                },
                {
                    title: i18n.t('static.usageTemplate.usageFrequency'),
                    type: 'text',
                    // readOnly: true
                    textEditor: true, //15
                },
                {
                    title: i18n.t('static.usageTemplate.usageFrequency'),
                    type: 'autocomplete',
                    source: this.state.usagePeriodList //16
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerMonth'),
                    type: 'text',//hidden black
                    // readOnly: true
                    textEditor: true, //17
                },
                {
                    // title: i18n.t('static.usageTemplate.fuPerPersonPerMonth'),//empty for
                    type: 'text',
                    // readOnly: true
                    textEditor: true, //18
                },
                {
                    title: i18n.t('static.usagePeriod.usagePeriod'),
                    type: 'number',
                    // readOnly: true
                    textEditor: true, //19
                },
                {
                    title: i18n.t('static.usagePeriod.usagePeriod'),
                    type: 'autocomplete',
                    source: this.state.usagePeriodList //20
                },
                {
                    title: i18n.t('static.usagePeriod.fuRequired'),
                    type: 'text',//hidden
                    // readOnly: true
                    textEditor: true, //21
                },
                {
                    title: i18n.t('static.usagePeriod.usageInWords'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //22
                },
                {
                    title: 'isChange',
                    type: 'hidden' //23
                },



            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);
                    var addRowId = rowData[6];
                    console.log("addRowId------>", addRowId);
                    // if (addRowId == 1) {//active grade out
                    //     var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');
                    // } else {
                    //     var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                    //     cell1.classList.remove('readonly');
                    // }


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

        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false
        })
    }

    filterForecastingUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[2];
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

    getUsageTemplateData() {
        this.hideSecondComponent();
        UsageTemplateService.getUsageTemplateListAll().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data)

                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                this.setState({
                    usageTemplateList: listArray,
                    selSource: listArray,
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

    componentDidMount() {
        this.getTracerCategory();
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        // if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
        //     // console.log("RESP---------", parseFloat(rowData[2]));
        //     elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        // }
        this.el.setValueFromCoords(23, y, 1, true);

    }
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = ""
        data[3] = "";
        data[4] = 0;
        data[5] = "";

        data[6] = "Every";
        data[7] = 0;
        data[8] = "patient"

        data[9] = "requires";
        data[10] = 0;
        data[11] = "";

        data[12] = "";

        data[13] = "";

        data[14] = ""
        data[15] = "";
        data[16] = "";

        data[17] = "";

        data[18] = "";
        data[19] = "";
        data[20] = ""

        data[21] = "";

        data[22] = "";
        data[23] = 1;

        this.el.insertRow(
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
                    (instance.jexcel).setValueFromCoords(2, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(5, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    formSubmit = function () {

        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("5 map---" + map1.get("5"))
                if (parseInt(map1.get("5")) === 1) {
                    let json = {
                        modelingTypeId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("1"),
                        },
                        active: map1.get("2"),
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
            UsageTemplateService.addUpdateModelingType(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        // this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green'
                        },
                            () => {
                                this.hideSecondComponent();
                                this.getUsageTemplateData();
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
        // tr.children[3].classList.add('AsteriskTheadtrTd');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //Dataset
        if (x == 1) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //Tracer Category
        if (x == 2) {
            console.log("LOG---------->2", value);
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("C").concat(parseInt(y) + 1);
            this.el.setValueFromCoords(3, y, '', true);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }


        //Active
        if (x != 5) {
            this.el.setValueFromCoords(5, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(5, y);
            if (parseInt(value) == 1) {
                //Region
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(budgetRegx.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.spacetext'));
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


    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }}>{i18n.t('static.common.customWarningMessage')}</h5>
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>
                    <CardBody className="p-0">

                        <Col xs="12" sm="12">

                            <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block" }} className={(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE')) ? "RowClickable" : "jexcelremoveReadonlybackground"}>
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
                            {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                            <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>

            </div>
        )
    }
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default usageTemplate

