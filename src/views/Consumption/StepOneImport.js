import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import ProgramService from '../../api/ProgramService';
import PlanningUnitService from '../../api/PlanningUnitService';
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, INTEGER_NO_REGEX } from '../../Constants.js';
import CryptoJS from 'crypto-js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import TracerCategoryService from "../../api/TracerCategoryService";
import moment from "moment";

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

export default class StepOneImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);

        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            mapPlanningUnitEl: '',
            lang: localStorage.getItem('lang'),
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },

            //
            // rangeValue: { from: { year: 2020, month: 1 }, to: { year: 2024, month: 12 } },
            // minDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth() + 1 },
            // maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() + 1 },
            loading: false,
            selSource: [],
            programs: [],
            programId: '',
            versions: [],
            versionId: '',
            datasetList: [],
            forecastProgramId: '',
            programPlanningUnitList: [],
            tracerCategoryList: [],
            planningUnitList: [],
            planningUnitListJexcel: [],
            stepOneData: []

        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.filterData = this.filterData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setForecastProgramId = this.setForecastProgramId.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.formSubmit = this.formSubmit.bind(this);

    }

    getPlanningUnitList() {
        PlanningUnitService.getPlanningUnitByRealmId(AuthenticationService.getRealmId()).then(response => {
            console.log("RESP----->", response.data);
            var listArray = response.data;
            let tempList = [];
            if (listArray.length > 0) {
                for (var i = 0; i < listArray.length; i++) {
                    var paJson = {
                        name: getLabelText(listArray[i].label, this.state.lang),
                        id: parseInt(listArray[i].planningUnitId),
                        multiplier: listArray[i].multiplier,
                        active: listArray[i].active,
                        forecastingUnit: listArray[i].forecastingUnit
                    }
                    tempList[i] = paJson
                }
            }

            tempList.unshift({
                name: 'Do not import',
                id: -1,
                multiplier: 1,
                active: true,
                forecastingUnit: []
            });

            this.setState({
                planningUnitList: response.data,
                planningUnitListJexcel: tempList
            }, () => {
                tempList.splice(0, 1);
                this.props.updateStepOneData("planningUnitListJexcel", tempList);
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

    getTracerCategoryList() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                console.log("response.data----", response.data);
                this.setState({
                    tracerCategoryList: response.data,
                },
                    () => {
                        this.getPlanningUnitList();
                    })
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

    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText && this.props.removeMessageText();
        if (x == 6) {
            let ForecastPlanningUnitId = this.el.getValueFromCoords(6, y);
            if (ForecastPlanningUnitId != -1 && ForecastPlanningUnitId != null && ForecastPlanningUnitId != '') {
                var selectedPlanningUnitObj = this.state.planningUnitList.filter(c => c.planningUnitId == ForecastPlanningUnitId)[0];
                this.el.setValueFromCoords(5, y, ForecastPlanningUnitId, true);
                this.el.setValueFromCoords(7, y, selectedPlanningUnitObj.multiplier, true);
                this.el.setValueFromCoords(8, y, (this.el.getValueFromCoords(2, y) / selectedPlanningUnitObj.multiplier).toFixed(6), true);
                this.el.setValueFromCoords(9, y, 0, true);
            } else {
                this.el.setValueFromCoords(5, y, '', true);
                this.el.setValueFromCoords(7, y, '', true);
                this.el.setValueFromCoords(8, y, '', true);
                this.el.setValueFromCoords(9, y, 0, true);
            }

            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("G").concat(parseInt(y) + 1);
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


        //#Multiplier
        if (x == 8) {
            let ForecastPlanningUnitId = this.el.getValueFromCoords(6, y);
            var col = ("I").concat(parseInt(y) + 1);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = /^\d{1,6}(\.\d{1,6})?$/;
            if (ForecastPlanningUnitId != -1) {
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

        }



    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionWithoutPagination(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        // tr.children[2].classList.add('AsteriskTheadtrTd');
        // tr.children[3].classList.add('AsteriskTheadtrTd');
    }

    componentDidMount() {
        // alert("HI123");
        // this.props.updateStepOneData("program", 2001);
        document.getElementById("stepOneBtn").disabled = true;
        this.getPrograms();
        // this.getDatasetList();
        // this.getTracerCategoryList();
        // this.getPlanningUnitList();

        // var d1 = new Date('2020-02-01');
        // var d2 = new Date('2020-01-01');

        // if (d1.getTime() == d2.getTime()) {
        //     console.log("IF------------>1");
        // } else {
        //     console.log("IF------------>2");
        // }

        let arrList = [];
        let Json1 = {
            id: 1,
            cList: [
                { cid: 1, cName: 'abc' },
                { cid: 2, cName: 'pqr' },
                { cid: 3, cName: 'xyz' }
            ]
        }
        let Json2 = {
            id: 2,
            cList: [
                { cid: 11, cName: 'abc11' },
                { cid: 22, cName: 'pqr22' },
                { cid: 33, cName: 'xyz33' }
            ]
        }
        arrList.push(Json1);
        arrList.push(Json2);

        let tempList = arrList.filter(c => c.cList.cid == 3);
        console.log("tempList---->", tempList);

    }

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

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                // console.log("DATASET----------->", myResult);
                // this.setState({
                //     datasetList: myResult
                // });


                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                for (var i = 0; i < filteredGetRequestList.length; i++) {

                    var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                    var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson1 = JSON.parse(programData);
                    console.log("programJson1-------->1", programJson1);
                    let dupForecastingUnitObj = programJson1.consumptionList.map(ele => ele.consumptionUnit.forecastingUnit);
                    const ids = dupForecastingUnitObj.map(o => o.id)
                    const filtered = dupForecastingUnitObj.filter(({ id }, index) => !ids.includes(id, index + 1))
                    // console.log("programJson1-------->2", filtered);

                    let dupPlanningUnitObjwithNull = programJson1.consumptionList.map(ele => ele.consumptionUnit.planningUnit);
                    let dupPlanningUnitObj = dupPlanningUnitObjwithNull.filter(c => c != null);
                    const idsPU = dupPlanningUnitObj.map(o => o.id)
                    const filteredPU = dupPlanningUnitObj.filter(({ id }, index) => !idsPU.includes(id, index + 1))

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
                        filteredForecastingUnit: filtered,
                        filteredPlanningUnit: filteredPU,
                        regionList: programJson1.regionList
                    });
                    // }
                }
                console.log("DATASET-------->", datasetList);
                this.setState({
                    datasetList: datasetList
                }, () => {
                    this.getTracerCategoryList();
                })
                this.props.updateStepOneData("datasetList", datasetList);

            }.bind(this);
        }.bind(this);
    }


    getPrograms() {
        ProgramService.getProgramList()
            .then(response => {
                this.setState({
                    programs: response.data,
                    loading: false
                }, () => {
                    this.getDatasetList();
                })
                this.props.updateStepOneData("programs", response.data);
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

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.filterData(value);
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    filterData() {
        // let tempList = [];
        // tempList.push({ id: 1, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 2, v3: 0.694444 });
        // tempList.push({ id: 2, v1: 'Male Condom (Latex) Lubricated, No Logo Red Strawberry, 53 mm, 3000 Pieces [4177]', v2: 3, v3: 3000 });
        // tempList.push({ id: 3, v1: 'Male Condom (Latex) Lubricated, Hot Pink No Logo, 53 mm, 1 Each', v2: 1, v3: 0 });


        // this.setState({
        //     selSource: tempList,
        //     loading: true
        // },
        //     () => {
        //         this.buildJexcel();
        //     })

        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let forecastProgramId = document.getElementById("forecastProgramId").value;

        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        // console.log("startDate---->1", startDate);
        // console.log("startDate---->2", stopDate);
        if (versionId != 0 && programId > 0 && forecastProgramId > 0) {
            this.props.updateStepOneData("programId", programId);
            this.props.updateStepOneData("versionId", versionId);
            this.props.updateStepOneData("forecastProgramId", forecastProgramId);
            this.props.updateStepOneData("startDate", startDate);
            this.props.updateStepOneData("stopDate", stopDate);


            document.getElementById("stepOneBtn").disabled = false;

            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];
            let healthAreaList = selectedForecastProgram.healthAreaList;
            let tracerCategory = [];

            for (var i = 0; i < healthAreaList.length; i++) {
                let a = this.state.tracerCategoryList.filter(c => c.healthArea.id == healthAreaList[i].id);
                a = a.map(ele => ele.tracerCategoryId);
                tracerCategory = tracerCategory.concat(a);
            }
            console.log("tracerCategory--------->", tracerCategory);

            ProgramService.getPlanningUnitByProgramTracerCategory(programId, tracerCategory)
                .then(response => {
                    if (response.status == 200) {
                        console.log("planningUnit------>", response.data);
                        this.setState({
                            programPlanningUnitList: response.data,
                            selSource: response.data,
                        }, () => {
                            this.buildJexcel();
                        })
                    } else {
                        this.setState({
                            programPlanningUnitList: []
                        });
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false, color: 'red'
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
                                        loading: false, color: 'red'
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false, color: 'red'
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false, color: 'red'
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
            document.getElementById("stepOneBtn").disabled = false;
        }

    }

    getProgramPlanningUnit() {
        ProgramService.getProgramPlaningUnitListByProgramId(this.state.programId)
            .then(response => {
                if (response.status == 200) {
                    console.log("planningUnit------>", response.data);
                    this.setState({
                        programPlanningUnitList: response.data
                    });
                } else {
                    this.setState({
                        programPlanningUnitList: []
                    });
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false, color: 'red'
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
                                    loading: false, color: 'red'
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false, color: 'red'
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false, color: 'red'
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

                let planningUnitObj = this.state.planningUnitList.filter(c => c.planningUnitId == papuList[j].planningUnit.id)[0];

                data = [];
                data[0] = papuList[j].planningUnit.id
                data[1] = getLabelText(papuList[j].planningUnit.label, this.state.lang)
                data[2] = papuList[j].multiplier
                data[3] = papuList[j].forecastingUnit.id
                data[4] = planningUnitObj.forecastingUnit.tracerCategory.id

                let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == document.getElementById("forecastProgramId").value && c.versionId == this.state.forecastProgramVersionId)[0];
                let filteredForecastingUnit = selectedForecastProgram.filteredForecastingUnit;
                let match = filteredForecastingUnit.filter(c => c.id == papuList[j].forecastingUnit.id);

                // let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == document.getElementById("forecastProgramId").value)[0];
                // let filteredPlanningUnit = selectedForecastProgram.filteredPlanningUnit;
                // let match = filteredPlanningUnit.filter(c => c.id == papuList[j].planningUnit.id);

                if (match.length > 0) {
                    data[5] = papuList[j].planningUnit.id
                    data[6] = getLabelText(papuList[j].planningUnit.label, this.state.lang)
                    data[7] = papuList[j].multiplier
                    data[8] = 1
                    data[9] = 1
                } else {
                    data[5] = ''
                    data[6] = ''
                    data[7] = ''
                    data[8] = ''
                    data[9] = ''
                }

                papuDataArr[count] = data;
                count++;
            }
        }

        // if (papuDataArr.length == 0) {
        //     data = [];
        //     data[0] = 0;
        //     data[1] = "";
        //     data[2] = true
        //     data[3] = "";
        //     data[4] = "";
        //     data[5] = 1;
        //     data[6] = 1;
        //     papuDataArr[0] = data;
        // }

        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapRegion"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapImport"), '');
        this.el.destroy();

        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100],
            columns: [

                {
                    title: 'planningUnitId',
                    type: 'hidden',
                    readOnly: true//0 A
                },
                {
                    title: 'Supply Plan Planning Unit',
                    type: 'text',
                    readOnly: true,
                    textEditor: true,//1 B
                },
                {
                    title: 'multiplier',
                    type: 'hidden',
                    readOnly: true//2 C
                },
                {
                    title: 'forecastingUnitId',
                    type: 'hidden',
                    readOnly: true//3 D
                },
                {
                    title: 'tracerCategoryId',
                    type: 'hidden',
                    readOnly: true//4 E
                },




                {
                    title: 'ForecastPlanningUnitId',
                    type: 'hidden',
                    readOnly: true//5 F
                },
                {
                    title: 'Forecast Planning Unit',
                    // readOnly: true,
                    type: 'dropdown',
                    source: this.state.planningUnitListJexcel,
                    // source: [
                    //     { id: 1, name: 'Do not import' },
                    //     { id: 2, name: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]' },
                    //     { id: 3, name: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 1 Each [4181]' },

                    // ]
                    filter: this.filterPlanningUnitBasedOnTracerCategory//6 G
                },
                {
                    title: 'ForecastMultiplier',
                    type: 'hidden',
                    readOnly: true//7 H
                },
                {
                    title: 'Multiplier',
                    type: 'numeric',
                    decimal: '.',
                    // readOnly: true,
                    textEditor: true,//8 I
                },
                {
                    title: 'Match',
                    type: 'hidden',
                    readOnly: true//9 J
                },


            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);


                    var match = rowData[9];
                    // console.log("addRowId------>", addRowId);
                    if (match == 1) {// grade out
                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }

                    var doNotImport = rowData[6];
                    if (doNotImport == -1) {// grade out
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                    } else {
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                        // var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        // cell1.classList.remove('readonly');
                    }


                    // if (id == 3) {// grade out
                    //     elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', 'transparent');
                    //     elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', '#f48282');
                    //     let textColor = contrast('#f48282');
                    //     elInstance.setStyle(`C${parseInt(y) + 1}`, 'color', textColor);
                    // } else {
                    //     elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', 'transparent');
                    // }

                }

            }.bind(this),
            pagination: false,
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            // position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            // allowDeleteRow: true,
            onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            // oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: false
        };

        this.el = jexcel(document.getElementById("mapPlanningUnit"), options);
        this.setState({
            loading: false
        })
    }

    filterPlanningUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[4];

        var mylist = this.state.planningUnitListJexcel;

        if (value > 0) {
            mylist = mylist.filter(c => (c.id == -1 ? c : c.forecastingUnit.tracerCategory.id == value && c.active.toString() == "true"));
        }

        console.log("mylist--------->3", mylist);

        return mylist;

    }.bind(this)

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            this.filterVersion();
        })

    }

    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)

            this.setState({
                versions: [],
            }, () => {
                this.setState({
                    versions: program[0].versionList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                }, () => { });
            });

        } else {

            this.setState({
                versions: [],

            }, () => { })

        }
    }

    setVersionId(event) {

        this.setState({
            versionId: event.target.value
        }, () => {
            this.filterData();
        })

    }

    setForecastProgramId(event) {
        var sel = document.getElementById("forecastProgramId");
        var tempId = sel.options[sel.selectedIndex].text;
        let forecastProgramVersionId = tempId.split('~')[1];
        // console.log("forecastProgramVersionId-------->", forecastProgramVersionId);

        let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == event.target.value && c.versionId == forecastProgramVersionId)[0]
        let startDateSplit = selectedForecastProgram.forecastStartDate.split('-');
        let stopDateSplit = selectedForecastProgram.forecastStopDate.split('-');

        let forecastStopDate = new Date(selectedForecastProgram.forecastStartDate);
        forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);

        this.setState({
            forecastProgramId: event.target.value,
            rangeValue: { from: { year: startDateSplit[1] - 3, month: new Date(selectedForecastProgram.forecastStartDate).getMonth() + 1 }, to: { year: forecastStopDate.getFullYear(), month: forecastStopDate.getMonth() + 1 } },
            forecastProgramVersionId: forecastProgramVersionId
        }, () => {
            this.props.updateStepOneData("forecastProgramVersionId", forecastProgramVersionId);
            this.filterData();
        })
    }

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(6, y);
            if (value != -1) {

                //ForecastPlanningUnit
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("G").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(6, y);
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

                //multiplier
                var col = ("I").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(8, y);
                var reg = /^\d{1,6}(\.\d{1,6})?$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.usagePeriod.conversionFactorTestString'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }

            }

        }
        return valid;
    }


    formSubmit = function () {

        var validation = this.checkValidation();
        console.log("validation------->", validation)
        if (validation == true) {
            // this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));

                let json = {

                    supplyPlanPlanningUnitId: parseInt(map1.get("0")),
                    forecastPlanningUnitId: parseInt(map1.get("6")),
                    multiplier: map1.get("8").toString().replace(/,/g, ""),


                    // capacityCbm: map1.get("2").replace(",", ""),
                    // capacityCbm: map1.get("2").replace(/,/g, ""),
                    // capacityCbm: this.el.getValueFromCoords(2, i).toString().replace(/,/g, ""),
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
            this.setState({
                stepOneData: changedpapuList,

            }, () => {
                this.props.finishedStepOne();
            })
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            this.props.updateStepOneData("stepOneData", changedpapuList);

        } else {
            console.log("Something went wrong");
        }
    }

    render() {
        const { rangeValue } = this.state

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {/* {item.versionId} */}
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);


        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode + '~' + item.versionId}
                    </option>
                )
            }, this);

        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>

                <div className="row ">
                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label> */}
                        <Label htmlFor="appendedInputButton">Supply Plan Program</Label>
                        <div className="controls ">
                            <InputGroup>
                                <Input
                                    type="select"
                                    name="programId"
                                    id="programId"
                                    bsSize="sm"
                                    onChange={(e) => { this.setProgramId(e); }}
                                    value={this.state.programId}
                                >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    {programList}

                                </Input>

                            </InputGroup>
                        </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label> */}
                        <Label htmlFor="appendedInputButton">Supply Plan Version</Label>
                        <div className="controls">
                            <InputGroup>
                                <Input
                                    type="select"
                                    name="versionId"
                                    id="versionId"
                                    bsSize="sm"
                                    onChange={(e) => { this.setVersionId(e); }}
                                    value={this.state.versionId}
                                >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    {versionList}
                                </Input>

                            </InputGroup>
                        </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label> */}
                        <Label htmlFor="appendedInputButton">Forecast Program</Label>
                        <div className="controls ">
                            <InputGroup>
                                <Input
                                    type="select"
                                    name="forecastProgramId"
                                    id="forecastProgramId"
                                    bsSize="sm"
                                    onChange={(e) => { this.setForecastProgramId(e); }}
                                    value={this.state.forecastProgramId}
                                >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    {datasets}
                                </Input>

                            </InputGroup>
                        </div>
                    </FormGroup>


                </div>
                <div className="row">
                    <FormGroup className="col-md-3">
                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label> */}
                        <Label htmlFor="appendedInputButton">Range</Label>
                        <div className="controls  Regioncalender">

                            <Picker
                                ref="pickRange"
                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                value={rangeValue}
                                lang={pickerLang}
                                //theme="light"
                                onChange={this.handleRangeChange}
                                onDismiss={this.handleRangeDissmis}
                            >
                                <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                            </Picker>

                        </div>
                    </FormGroup>
                </div>

                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }} >

                    <div id="mapPlanningUnit" className="table-responsive">
                    </div>
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
                <FormGroup>
                    <Button color="info" size="md" className="float-right mr-1" id="stepOneBtn" type="submit" onClick={() => this.formSubmit()} >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                </FormGroup>
            </>
        );
    }

}