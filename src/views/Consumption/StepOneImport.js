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
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, INTEGER_NO_REGEX } from '../../Constants.js';
import CryptoJS from 'crypto-js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import TracerCategoryService from "../../api/TracerCategoryService";
import moment from "moment";
import { Prompt } from 'react-router';

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
            // loading: false,
            selSource: [],
            programs: [],
            programId: '',
            versions: [],
            versionId: '',
            datasetList: [],
            datasetList1: [],
            forecastProgramId: '',
            programPlanningUnitList: [],
            tracerCategoryList: [],
            planningUnitList: [],
            planningUnitListJexcel: [],
            stepOneData: [],
            forecastPlanignUnitListForNotDuplicate: [],
            selectedForecastProgram: '',
            getDatasetFilterList: [],
            selSource1: [],
            isChanged1: false
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
        this.hideSecondComponent = this.hideSecondComponent.bind(this);

    }

    hideSecondComponent() {
        // alert("HI");
        setTimeout(function () {
            document.getElementById('div12').style.display = 'none';
        }, 8000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    getPlanningUnitList() {
        PlanningUnitService.getPlanningUnitByRealmId(AuthenticationService.getRealmId()).then(response => {
            console.log("RESP----->", response.data);
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
                        name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].planningUnitId),
                        id: parseInt(listArray[i].planningUnitId),
                        multiplier: listArray[i].multiplier,
                        active: listArray[i].active,
                        forecastingUnit: listArray[i].forecastingUnit
                    }
                    tempList[i] = paJson
                }
            }

            tempList.unshift({
                name: i18n.t('static.quantimed.doNotImport'),
                id: -1,
                multiplier: 1,
                active: true,
                forecastingUnit: []
            });
            // console.log("planningUnitListJexcel----->0", tempList);


            this.setState({
                planningUnitList: response.data,
                planningUnitListJexcel: tempList
            }, () => {
                // console.log("planningUnitListJexcel----->1", tempList);

                // for (let i = 0; i < tempList.length; i++) {
                //     if (tempList[i].id === -1) {
                //         console.log("planningUnitListJexcel----->111", i + '---    ' + tempList[i].id);
                //     }
                // }
                // tempList.splice(0, 1);
                // tempList.splice(0, 1);
                // console.log("planningUnitListJexcel----->3", tempList);
                this.props.updateStepOneData("planningUnitListJexcel", tempList);
                this.props.updateStepOneData("planningUnitList", response.data);
                this.props.updateStepOneData("loading", false);
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
        if (x == 7) {
            let ForecastPlanningUnitId = this.el.getValueFromCoords(7, y);
            if (ForecastPlanningUnitId != -1 && ForecastPlanningUnitId != null && ForecastPlanningUnitId != '') {
                var selectedPlanningUnitObj = this.state.planningUnitList.filter(c => c.planningUnitId == ForecastPlanningUnitId)[0];
                this.el.setValueFromCoords(6, y, ForecastPlanningUnitId, true);
                this.el.setValueFromCoords(8, y, selectedPlanningUnitObj.multiplier, true);
                this.el.setValueFromCoords(9, y, (this.el.getValueFromCoords(3, y) / selectedPlanningUnitObj.multiplier).toFixed(6), true);
                this.el.setValueFromCoords(10, y, 0, true);
                this.el.setValueFromCoords(11, y, selectedPlanningUnitObj.forecastingUnit.tracerCategory.id, true);
                // let match = this.state.forecastPlanignUnitListForNotDuplicate.filter(c => c.supplyPlanPlanningUnitId == this.el.getValueFromCoords(0, y))
                // if (match.length > 0) {
                //     let index = originalConsumptionList.findIndex(c => c.supplyPlanPlanningUnitId == this.el.getValueFromCoords(0, y))
                //     let tempObj = match[0].forecastPlanningUnitId = forecastPlanningUnitId;
                //     let forecastPlanignUnitListForNotDuplicate = this.state.forecastPlanignUnitListForNotDuplicate;
                //     forecastPlanignUnitListForNotDuplicate[index] = tempObj;
                //     this.setState({
                //         forecastPlanignUnitListForNotDuplicate: forecastPlanignUnitListForNotDuplicate
                //     })
                // } else {
                //     let forecastPlanignUnitListForNotDuplicate = [];
                //     forecastPlanignUnitListForNotDuplicate.push({
                //         supplyPlanPlanningUnitId: this.el.getValueFromCoords(0, y),
                //         forecastPlanningUnitId: forecastPlanningUnitId
                //     });
                //     this.setState({
                //         forecastPlanignUnitListForNotDuplicate: forecastPlanignUnitListForNotDuplicate
                //     })
                // }

                let forecastPlanignUnitListForNotDuplicate = this.state.forecastPlanignUnitListForNotDuplicate;
                forecastPlanignUnitListForNotDuplicate.push({
                    supplyPlanPlanningUnitId: this.el.getValueFromCoords(1, y),
                    forecastPlanningUnitId: this.el.getValueFromCoords(7, y)
                })

                const ids = forecastPlanignUnitListForNotDuplicate.map(o => o.supplyPlanPlanningUnitId)
                const filtered = forecastPlanignUnitListForNotDuplicate.filter(({ supplyPlanPlanningUnitId }, index) => !ids.includes(supplyPlanPlanningUnitId, index + 1))
                this.setState({
                    forecastPlanignUnitListForNotDuplicate: filtered
                })


            } else {
                let SupplyPlanningUnitId = this.el.getValueFromCoords(1, y);
                console.log("MYVALUE----------->1", SupplyPlanningUnitId);

                let forecastPlanignUnitListForNotDuplicate = this.state.forecastPlanignUnitListForNotDuplicate;
                console.log("MYVALUE----------->2", forecastPlanignUnitListForNotDuplicate);
                let index = forecastPlanignUnitListForNotDuplicate.filter(c => c.supplyPlanPlanningUnitId == SupplyPlanningUnitId);
                console.log("MYVALUE----------->3", index);
                if (index.length > 0) {
                    console.log("MYVALUE----------->41", forecastPlanignUnitListForNotDuplicate.filter(c => c.supplyPlanPlanningUnitId != SupplyPlanningUnitId));

                    this.setState({
                        forecastPlanignUnitListForNotDuplicate: forecastPlanignUnitListForNotDuplicate.filter(c => c.supplyPlanPlanningUnitId != SupplyPlanningUnitId)
                    })
                } else {
                    console.log("MYVALUE----------->42", forecastPlanignUnitListForNotDuplicate);
                }



                // let forecastPlanignUnitListForNotDuplicate = this.state.forecastPlanignUnitListForNotDuplicate;
                // let tempForecastPlanignUnitListForNotDuplicate = forecastPlanignUnitListForNotDuplicate;
                // console.log("MYVALUE----------->2", forecastPlanignUnitListForNotDuplicate);
                // for (var i = 0; i < forecastPlanignUnitListForNotDuplicate.length; i++) {

                //     const index = tempForecastPlanignUnitListForNotDuplicate.findIndex(c => c.supplyPlanPlanningUnitId == forecastPlanignUnitListForNotDuplicate[i].forecastPlanningUnitId);
                //     console.log("MYVALUE----------->3", index);
                //     if (index > 0) {
                //         const result = mylist.splice(index, 1);
                //     }

                // }


                this.el.setValueFromCoords(6, y, '', true);
                this.el.setValueFromCoords(8, y, '', true);
                this.el.setValueFromCoords(9, y, '', true);
                this.el.setValueFromCoords(10, y, 0, true);
            }

            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("H").concat(parseInt(y) + 1);
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
        if (x == 9) {
            let ForecastPlanningUnitId = this.el.getValueFromCoords(7, y);
            var col = ("J").concat(parseInt(y) + 1);
            value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        this.setState({
            isChanged1: true,
        });


    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

    }

    loaded = function (instance, cell, x, y, value) {
        // jExcelLoadedFunctionWithoutPagination(instance);
        jExcelLoadedFunction(instance);
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
        // console.log("IF------------>2", localStorage.getItem("sesRecordCount"));



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
            var datasetList1 = [];

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
                    let dupForecastingUnitObj = programJson1.planningUnitList.map(ele => ele.planningUnit.forecastingUnit);
                    const ids = dupForecastingUnitObj.map(o => o.id)
                    const filtered = dupForecastingUnitObj.filter(({ id }, index) => !ids.includes(id, index + 1))
                    // console.log("programJson1-------->2", filtered);

                    let dupPlanningUnitObjwithNull = programJson1.planningUnitList.map(ele => ele.planningUnit);
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
                        actualConsumptionList: programJson1.actualConsumptionList,
                        filteredForecastingUnit: filtered,
                        filteredPlanningUnit: filteredPU,
                        regionList: programJson1.regionList,
                        label: programJson1.label,
                        realmCountry: programJson1.realmCountry,
                    });
                    datasetList1.push(filteredGetRequestList[i])
                    // }
                }
                console.log("DATASET-------->", datasetList);
                datasetList = datasetList.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                this.setState({
                    datasetList: datasetList,
                    datasetList1: datasetList1
                }, () => {
                    this.getTracerCategoryList();
                })
                this.props.updateStepOneData("datasetList", datasetList);
                this.props.updateStepOneData("datasetList1", datasetList1);

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

            let selectedSupplyPlanProgram = this.state.programs.filter(c => c.programId == programId)[0];
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];

            if (selectedSupplyPlanProgram.realmCountry.realmCountryId == selectedForecastProgram.realmCountry.realmCountryId) {

                this.props.updateStepOneData("loading", true);
                this.props.updateStepOneData("programId", programId);
                this.props.updateStepOneData("versionId", versionId);
                this.props.updateStepOneData("forecastProgramId", forecastProgramId);
                this.props.updateStepOneData("startDate", startDate);
                this.props.updateStepOneData("stopDate", stopDate);


                document.getElementById("stepOneBtn").disabled = false;


                let healthAreaList = selectedForecastProgram.healthAreaList;
                let tracerCategory = [];

                for (var i = 0; i < healthAreaList.length; i++) {
                    let a = this.state.tracerCategoryList.filter(c => c.healthArea.id == healthAreaList[i].id);
                    a = a.map(ele => ele.tracerCategoryId);
                    tracerCategory = tracerCategory.concat(a);
                }
                console.log("tracerCategory--------->1", healthAreaList);
                console.log("tracerCategory--------->2", tracerCategory);

                ProgramService.getPlanningUnitByProgramTracerCategory(programId, tracerCategory)
                    .then(response => {
                        if (response.status == 200) {
                            console.log("planningUnit------>", response.data);
                            this.setState({
                                programPlanningUnitList: response.data,
                                selSource: response.data,
                                message: ''
                            }, () => {
                                if (response.data.length == 0) {
                                    document.getElementById("stepOneBtn").disabled = true;
                                }
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
                this.setState({
                    message: i18n.t('static.importFromQATSupplyPlan.belongsSameCountry'),
                    color: 'red'
                },
                    () => {
                        // this.hideSecondComponent();
                    })
            }

        } else if (programId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.selectSupplyPlanProgram'),
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            this.el.destroy();
            document.getElementById("stepOneBtn").disabled = true;
        } else if (versionId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.pleaseSelectSupplyPlanVersion'),
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            this.el.destroy();
            document.getElementById("stepOneBtn").disabled = true;
        } else if (forecastProgramId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.pleaseSelectForecastProgram'),
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            this.el.destroy();
            document.getElementById("stepOneBtn").disabled = true;
        } else {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: ''
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            this.el.destroy();
            document.getElementById("stepOneBtn").disabled = true;
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
        let forecastPlanignUnitListForNotDuplicate = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                let planningUnitObj = this.state.planningUnitList.filter(c => c.planningUnitId == papuList[j].planningUnit.id)[0];
                console.log("TracerCategory--------->", getLabelText(papuList[j].planningUnit.label, this.state.lang) + ' | ' + papuList[j].planningUnit.id + ' ------ ' + planningUnitObj.forecastingUnit.tracerCategory.label.label_en);
                data = [];
                data[0] = getLabelText(planningUnitObj.forecastingUnit.tracerCategory.label, this.state.lang)
                data[1] = papuList[j].planningUnit.id
                data[2] = getLabelText(papuList[j].planningUnit.label, this.state.lang) + ' | ' + papuList[j].planningUnit.id
                data[3] = papuList[j].multiplier
                data[4] = papuList[j].forecastingUnit.id
                data[5] = planningUnitObj.forecastingUnit.tracerCategory.id

                // let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == document.getElementById("forecastProgramId").value && c.versionId == this.state.forecastProgramVersionId)[0];
                // let filteredForecastingUnit = selectedForecastProgram.filteredForecastingUnit;
                // let match = filteredForecastingUnit.filter(c => c.id == papuList[j].forecastingUnit.id);

                let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == document.getElementById("forecastProgramId").value)[0];
                let filteredPlanningUnit = selectedForecastProgram.filteredPlanningUnit;
                // console.log("filteredPlanningUnit---------->", filteredPlanningUnit);
                let match = filteredPlanningUnit.filter(c => c.id == papuList[j].planningUnit.id);

                if (match.length > 0) {
                    data[6] = papuList[j].planningUnit.id
                    data[7] = getLabelText(papuList[j].planningUnit.label, this.state.lang) + ' | ' + papuList[j].planningUnit.id
                    data[8] = papuList[j].multiplier
                    data[9] = 1
                    data[10] = 1
                    data[11] = planningUnitObj.forecastingUnit.tracerCategory.id

                    forecastPlanignUnitListForNotDuplicate.push({
                        supplyPlanPlanningUnitId: papuList[j].planningUnit.id,
                        forecastPlanningUnitId: papuList[j].planningUnit.id
                    });
                } else {
                    data[6] = ''
                    data[7] = ''
                    data[8] = ''
                    data[9] = ''
                    data[10] = ''
                    data[11] = ''
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

        var papuList1 = this.state.selSource1;
        var data;
        if (papuList1 != "") {
            data = papuList1
        } else {
            data = papuDataArr
        }
        // var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [50, 50, 100, 100, 100, 100, 50, 100, 50],
            columns: [
                {
                    title: 'Tracer Category',
                    type: 'text',
                    readOnly: true//0 A
                },
                {
                    title: 'Supply Plan Planning Unit Id',
                    type: 'hidden',
                    readOnly: true//1 B
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'),
                    type: 'text',
                    readOnly: true,//2 C
                },
                {
                    title: 'multiplier',
                    type: 'hidden',
                    readOnly: true//3 D
                },
                {
                    title: 'forecastingUnitId',
                    type: 'hidden',
                    readOnly: true//4 E
                },
                {
                    title: 'tracerCategoryId',
                    type: 'hidden',
                    readOnly: true//5 F
                },
                {
                    title: 'Forecast Planning Unit Id',
                    type: 'hidden',
                    readOnly: true//6 G
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'),
                    // readOnly: true,
                    type: 'autocomplete',
                    source: this.state.planningUnitListJexcel,
                    // source: [
                    //     { id: 1, name: 'Do not import' },
                    //     { id: 2, name: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]' },
                    //     { id: 3, name: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 1 Each [4181]' },

                    // ]
                    filter: this.filterPlanningUnitBasedOnTracerCategory//7 H
                },
                {
                    title: 'ForecastMultiplier',
                    type: 'hidden',
                    readOnly: true//8 I
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.conversionFactor'),
                    type: 'numeric',
                    decimal: '.',
                    // readOnly: true,
                    textEditor: true,//9 J
                },
                {
                    title: 'Match',
                    type: 'hidden',
                    readOnly: true//10 K
                },
                {
                    title: 'Match tracer category',
                    type: 'hidden',
                    readOnly: true//11 L
                }


            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    //left align
                    elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);


                    var match = rowData[10];
                    // console.log("addRowId------>", addRowId);
                    if (match == 1) {// grade out
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }

                    var doNotImport = rowData[7];
                    if (doNotImport == -1) {// grade out
                        // var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        // cell1.classList.add('readonly');
                        // var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        // cell1.classList.add('readonly');

                        elInstance.setStyle(`H${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`H${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`H${parseInt(y) + 1}`, 'color', textColor);

                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                    } else {
                        // var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        // cell1.classList.remove('readonly');
                        // var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                        // cell1.classList.remove('readonly');
                        // elInstance.setStyle(`G${parseInt(y) + 1}`, 'background-color', 'transparent');

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
            // selectionCopy: false,
            // pagination: localStorage.getItem("sesRecordCount"),
            pagination: 5000000,
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
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
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            // contextMenu: false
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("mapPlanningUnit"), options);
        this.setState({
            loading: false,
            forecastPlanignUnitListForNotDuplicate: forecastPlanignUnitListForNotDuplicate
        })
        this.props.updateStepOneData("loading", false);
    }

    filterPlanningUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[5];

        var mylist = this.state.planningUnitListJexcel;
        console.log("mylist--------->100", mylist);
        let filteredPlanningUnit = this.state.selectedForecastProgram.filteredPlanningUnit;

        let mylistTemp = [];
        mylistTemp.push(mylist[0]);
        for (var i = 0; i < filteredPlanningUnit.length; i++) {
            mylistTemp.push(mylist.filter(c => c.id == filteredPlanningUnit[i].id)[0]);
        }
        console.log("mylist--------->101", filteredPlanningUnit);
        console.log("mylist--------->102", mylistTemp);

        mylist = mylistTemp;

        console.log("mylist--------->1021", mylist);

        if (value > 0) {
            mylist = mylist.filter(c => (c.id == -1 ? c : c.forecastingUnit.tracerCategory.id == value && c.active.toString() == "true"));
        }

        console.log("mylist--------->103", mylist);

        // let forecastPlanignUnitListForNotDuplicate = this.state.forecastPlanignUnitListForNotDuplicate;
        // console.log("mylist--------->104", forecastPlanignUnitListForNotDuplicate);
        // for (var i = 0; i < forecastPlanignUnitListForNotDuplicate.length; i++) {

        //     const index = mylist.findIndex(c => c.id == forecastPlanignUnitListForNotDuplicate[i].forecastPlanningUnitId);
        //     console.log("mylist--------->1041", index);
        //     if (index > 0) {
        //         const result = mylist.splice(index, 1);
        //     }

        // }


        // console.log("mylist--------->105", mylist);

        return mylist;

    }.bind(this)

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            this.filterVersion();
            this.filterForcastUnit();
            this.filterData();
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
                    versions: (program[0].versionList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })).reverse()
                }, () => { });
            });

        } else {

            this.setState({
                versions: [],

            }, () => { })

        }
    }

    filterForcastUnit = () => {
        // let programId = document.getElementById("programId").value;
        // let countryId = this.state.realmCountry.country.countryId;
        let programId = this.state.programId;

        if (programId != 0) {

            const countryId = this.state.programs.filter(c => c.programId == programId)[0].realmCountry.country.countryId;
            // console.log("countryId", countryId)
            // console.log("datasetlist==>", this.state.datasetList);
            this.state.getDatasetFilterList = this.state.datasetList
            var datasetlist = this.state.getDatasetFilterList.filter(c => c.realmCountry.country.countryId == countryId);
            // console.log("datasetlist=based on country==>", datasetlist)
            this.setState({
                data: [],
            }, () => {
                this.setState({
                    getDatasetFilterList: (datasetlist.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })).reverse()
                }, () => { });
            });

        } else {

            this.setState({
                getDatasetFilterList: [],

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
            forecastProgramVersionId: forecastProgramVersionId,
            selectedForecastProgram: selectedForecastProgram
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
            var value = this.el.getValueFromCoords(7, y);
            var tracerCategoryId = this.el.getValueFromCoords(5, y);
            var selectedPUTracerCategoryId = this.el.getValueFromCoords(11, y);
            console.log("tracerCategoryId==>", tracerCategoryId)
            console.log("selectedPUTracerCategoryId==>", selectedPUTracerCategoryId)
            if (value != -1) {

                //ForecastPlanningUnit
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("H").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(7, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else if (tracerCategoryId != selectedPUTracerCategoryId) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.tracerCategoryInvalidSelection'));
                    valid = false;
                } else if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                    valid = false;
                } else {
                    for (var i = (json.length - 1); i >= 0; i--) {
                        var map = new Map(Object.entries(json[i]));

                        var planningUnitValue = map.get("7");
                        if (planningUnitValue == value && y != i && i > y) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                            i = -1;
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }

                //multiplier
                var col = ("J").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(9, y);
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
                console.log("map1---->", map1)
                let json = {

                    supplyPlanPlanningUnitId: parseInt(map1.get("1")),
                    forecastPlanningUnitId: parseInt(map1.get("7")),
                    multiplier: map1.get("9").toString().replace(/,/g, ""),


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
                selSource1: tableJson

            }, () => {
                this.props.finishedStepOne();
            })
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            this.props.updateStepOneData("stepOneData", changedpapuList);
            this.props.updateStepOneData("selSource1", tableJson);

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


        const { getDatasetFilterList } = this.state;
        let datasets = getDatasetFilterList.length > 0
            && getDatasetFilterList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode + '~' + item.versionId}
                    </option>
                )
            }, this);

        return (
            <>
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div12">{this.state.message}</h5>

                <div style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div className="row ">
                        <FormGroup className="col-md-4">
                            {/* <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label> */}
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.supplyPlanProgram')}</Label>
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

                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.supplyPlanVersion')}</Label>
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

                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.forecastProgram')}</Label>
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
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.Range')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                            <div className="controls  Regioncalender">

                                <Picker
                                    ref="pickRange"
                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                    value={rangeValue}
                                    lang={pickerLang}
                                    //theme="light"
                                    key={JSON.stringify(rangeValue)}
                                    onChange={this.handleRangeChange}
                                    onDismiss={this.handleRangeDissmis}
                                >
                                    <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                </Picker>

                            </div>
                        </FormGroup>

                    </div>

                </div>

                <div className="table-responsive" style={{ display: this.props.items.loading ? "none" : "block" }} >

                    <div id="mapPlanningUnit" style={{ marginTop: '-15px;' }}>
                    </div>
                </div>
                <div style={{ display: this.props.items.loading ? "block" : "none" }}>
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