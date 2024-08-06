import CryptoJS from 'crypto-js';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Formik } from 'formik';
import moment from "moment";
import React from "react";
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import { Prompt } from 'react-router';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, ACTUAL_CONSUMPTION_TYPE, DELIVERED_SHIPMENT_STATUS, FORCASTED_CONSUMPTION_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ConsumptionInSupplyPlanComponent from "../SupplyPlan/ConsumptionInSupplyPlanForDataEntry";
const entityname = i18n.t('static.dashboard.consumptiondetails');
/**
 * This component is used to allow the users to do the data entry for the consumption records
 */
export default class ConsumptionDetails extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        var startDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD")
        this.state = {
            loading: true,
            programList: [],
            programId: '',
            changedFlag: 0,
            message: '',
            lang: localStorage.getItem("lang"),
            timeout: 0,
            showConsumption: 0,
            consumptionChangedFlag: 0,
            rangeValue: localStorage.getItem("sesRangeValue") != "" ? JSON.parse(localStorage.getItem("sesRangeValue")) : { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            regionList: [],
            showActive: "",
            regionId: "",
            consumptionType: "",
            dataSources: [],
            planningUnitId: '',
            realmCountryPlanningUnitList: [],
            programQPLDetails: [],
            planningUnitListForJexcel: [],
            planningUnitListForJexcelAll: [],
            planningUnit: [],
            puData: [],
            consumptionListForSelectedPlanningUnits: [],
            consumptionListForSelectedPlanningUnitsUnfiltered: [],
            planningUnitList: []
        }
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.updateState = this.updateState.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.pickRange = React.createRef();
    }
    /**
     * This function is used to export the consumption data entry template so that user can copy paste the bulk data
     */
    exportCSV() {
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(i18n.t('static.supplyplan.consumptionDataEntry'));
        worksheet.columns = [
            { header: i18n.t('static.dataEntry.planningUnitId'), key: 'name', width: 25 },//D
            { header: i18n.t('static.pipeline.consumptionDate'), key: 'string', width: 25, style: { numFmt: 'YYYY-MM-DD' } },
            { header: i18n.t('static.region.region'), key: 'name', width: 25 },
            { header: i18n.t('static.consumption.consumptionType'), key: 'name', width: 40 },
            { header: i18n.t('static.inventory.dataSource'), key: 'name', width: 40 },
            { header: i18n.t('static.supplyPlan.alternatePlanningUnit'), key: 'name', width: 32 },
            { header: i18n.t('static.supplyPlan.quantityCountryProduct'), key: 'name', width: 32 },
            { header: i18n.t('static.unit.multiplierFromARUTOPU'), key: 'name', width: 12 },
            { header: i18n.t('static.supplyPlan.quantityPU'), key: 'name', width: 12 },
            { header: i18n.t('static.consumption.daysofstockout'), key: 'name', width: 25 },
            { header: i18n.t('static.program.notes'), key: 'string', width: 25 },
            { header: i18n.t('static.inventory.active'), key: 'string', width: 25 },
        ];
        worksheet.getRow(1).eachCell({ includeEmpty: true }, function (cell, colNumber) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' },
                bgColor: { argb: 'FF0000FF' },
            }
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        let dataSourceVar = [];
        let datasourceList = this.state.dataSourceList.filter(c => (c.dataSourceTypeId == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || c.dataSourceTypeId == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE) && c.active.toString() == "true");
        for (let i = 0; i < datasourceList.length; i++) {
            dataSourceVar.push(datasourceList[i].name);
        }
        worksheet.dataValidations.add('E2:E1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${dataSourceVar.join(",")}"`],
            showErrorMessage: true
        });
        let regionVar = [];
        let regionList = this.state.regionList;
        for (let i = 0; i < regionList.length; i++) {
            regionVar.push(regionList[i].name);
        }
        worksheet.dataValidations.add('C2:C1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${regionVar.join(",")}"`],
            showErrorMessage: true
        });
        let consumptionTypeDropdown = [i18n.t('static.consumption.actual'), i18n.t('static.consumption.forcast')];
        worksheet.dataValidations.add('D2:D1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${consumptionTypeDropdown.join(",")}"`],
            showErrorMessage: true
        });
        let activeDropdown = ["True", "False"];
        worksheet.dataValidations.add('L2:L1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${activeDropdown.join(",")}"`],
            showErrorMessage: true
        });
        for (let i = 0; i < 1000; i++) {
            worksheet.getCell('B' + (+i + 2)).note = i18n.t('static.dataEntry.dateValidation');
        }
        worksheet.dataValidations.add('G2:G1000', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1]
        });
        worksheet.dataValidations.add('J2:J1000', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1]
        });
        for (let i = 0; i < 1000; i++) {
            worksheet.getCell('H' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('I' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
        }
        worksheet.protect();
        worksheet.getColumn('A').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('B').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('C').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('D').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('E').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('F').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('G').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('J').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('K').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('L').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, i18n.t('static.supplyplan.consumptionDataEntry') + '.xlsx');
        })
    }
    /**
     * This function is used to update the consumption date range filter value
     * @param {*} value This is the value that user has selected
     */
    handleRangeDissmis(value) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ rangeValue: value, consumptionChangedFlag: 0 })
            localStorage.setItem("sesRangeValue", JSON.stringify(value));
            this.formSubmit(this.state.planningUnit, value);
        }
    }
    /**
     * This function is used to hide the messages that are there in div1 after 30 seconds
     */
    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div3 after 30 seconds
     */
    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * This function is used to toggle the batch details model
     * @param {*} method This method value is used to check if unsaved changes alert should be displayed or not
     */
    toggleLarge(method) {
        var cont = false;
        if (method != "submit" && this.state.consumptionBatchInfoChangedFlag == 1) {
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
                consumptionBatchInfoChangedFlag: 0,
                consumptionBatchInfoDuplicateError: '',
                consumptionBatchInfoNoStockError: '',
                consumptionBatchError: ""
            })
            this.setState({
                consumptionBatchInfo: !this.state.consumptionBatchInfo,
            });
        }
    }
    /**
     * This function is used to fetch list all the offline programs that the user have downloaded
     */
    componentDidMount = function () {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F'
                })
                this.hideFirstComponent()
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    programList: proList.sort(function (a, b) {
                        a = a.label.toLowerCase();
                        b = b.label.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }), loading: false,
                    programQPLDetails: getRequest.result
                })
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
                var programIdd = '';
                if (this.props.match.params.programId != '' && this.props.match.params.programId != undefined) {
                    programIdd = this.props.match.params.programId;
                } else if (proList.length == 1) {
                    programIdd = proList[0].value;
                } else if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                    programIdd = localStorage.getItem("sesProgramId");
                }
                if (programIdd != '' && programIdd != undefined) {
                    var proListFiltered = proList.filter(c => c.value == programIdd);
                    if (proListFiltered.length > 0) {
                        var programSelect = { value: programIdd, label: proListFiltered[0].label };
                        this.setState({
                            programSelect: programSelect,
                            programId: programIdd
                        })
                        this.getPlanningUnitList(programSelect);
                    }
                }
            }.bind(this);
        }.bind(this)
    };
    /**
     * This function is used to fetch list all the planning units based on the programs that the user has selected
     * @param {*} value This is value of the program that is selected either by user or is autoselected
     */
    getPlanningUnitList(value) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1) {
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
                loading: true,
                consumptionChangedFlag: 0
            })
            var programId = value != "" && value != undefined ? value.value : 0;
            document.getElementById("consumptionTableDiv").style.display = "none";
            if (document.getElementById("addRowButtonId") != null) {
                document.getElementById("addRowButtonId").style.display = "none";
            }
            this.setState({
                programSelect: value,
                programId: value != "" && value != undefined ? value.value : 0,
                planningUnit: [],
            })
            if (programId != 0) {
                localStorage.setItem("sesProgramId", programId);
                var db1;
                var regionList = [];
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: '#BA0C2F'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('programData');
                    var programRequest = programDataOs.get(value != "" && value != undefined ? value.value : 0);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: '#BA0C2F'
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        for (var i = 0; i < programJson.regionList.length; i++) {
                            var regionJson = {
                                name: getLabelText(programJson.regionList[i].label, this.state.lang),
                                id: programJson.regionList[i].regionId,
                                label: programJson.regionList[i].label
                            }
                            regionList.push(regionJson)
                        }
                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        planningunitRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: '#BA0C2F'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            var programId = (value != "" && value != undefined ? value.value : 0).split("_")[0];
                            myResult = planningunitRequest.result.filter(c => c.program.id == programId);
                            var proList = []
                            var planningUnitListForJexcel = []
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    var productJson = {
                                        label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                        value: myResult[i].planningUnit.id
                                    }
                                    proList.push(productJson)
                                    var productJson1 = {
                                        name: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                        id: myResult[i].planningUnit.id
                                    }
                                    planningUnitListForJexcel.push(productJson1)
                                }
                            }
                            this.setState({
                                planningUnitList: proList.sort(function (a, b) {
                                    a = a.label.toLowerCase();
                                    b = b.label.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                planningUnitListForJexcelAll: planningUnitListForJexcel.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                planningUnitListAll: myResult,
                                generalProgramJson: programJson,
                                regionList: regionList.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), loading: false
                            })
                            var planningUnitIdProp = '';
                            if (this.props.match.params.planningUnitId != '' && this.props.match.params.planningUnitId != undefined) {
                                planningUnitIdProp = this.props.match.params.planningUnitId;
                                var proListFiltered = proList.filter(c => c.value == planningUnitIdProp);
                                if (planningUnitIdProp != '' && planningUnitIdProp != undefined && proListFiltered.length > 0) {
                                    var planningUnit = [{ value: planningUnitIdProp, label: proListFiltered[0].label }];
                                    this.setState({
                                        planningUnit: planningUnit,
                                    })
                                    this.formSubmit(planningUnit, this.state.rangeValue);
                                }
                            }
                            else if (localStorage.getItem("sesPlanningUnitIdMulti") != '' && localStorage.getItem("sesPlanningUnitIdMulti") != undefined) {
                                planningUnitIdProp = localStorage.getItem("sesPlanningUnitIdMulti");
                                if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                    var planningUnitIdSession = JSON.parse(planningUnitIdProp);
                                    var updatePlanningUnitList = [];
                                    for (var pu = 0; pu < planningUnitIdSession.length; pu++) {
                                        if (proList.filter(c => c.value == planningUnitIdSession[pu].value).length > 0) {
                                            updatePlanningUnitList.push(planningUnitIdSession[pu]);
                                        }
                                    }
                                    this.setState({
                                        planningUnit: updatePlanningUnitList,
                                    })
                                    this.formSubmit(updatePlanningUnitList, this.state.rangeValue);
                                }
                            }
                            else if (proList.length == 1) {
                                planningUnitIdProp = proList[0].value;
                                if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                    var planningUnit = [{ value: planningUnitIdProp, label: proList.filter(c => c.value == planningUnitIdProp)[0].label }];
                                    this.setState({
                                        planningUnit: planningUnit,
                                    })
                                    this.formSubmit(planningUnit, this.state.rangeValue);
                                }
                            }
                        }.bind(this);
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({
                    planningUnitList: [],
                    planningUnitListForJexcel: [],
                    planningUnitListForJexcelAll: [],
                    puData: [],
                    loading: false
                })
            }
        }
    }
    /**
     * This function is used fetch all the consumption records based on the filters and build all the necessary data
     * @param {*} value This is the value of planning unit
     * @param {*} rangeValue This is the value of date range that is selected
     */
    formSubmit(value, rangeValue) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ loading: true, consumptionChangedFlag: 0, regionId: document.getElementById("regionId").value, consumptionType: document.getElementById("consumptionType").value, showActive: document.getElementById("showActive").value })
            let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            var programId = document.getElementById('programId').value;
            this.setState({ programId: programId, planningUnit: value });
            var puList = value;
            var programId = document.getElementById("programId").value;
            var regionId = document.getElementById("regionId").value;
            var consumptionType = document.getElementById("consumptionType").value;
            var showActive = document.getElementById("showActive").value;
            if (puList.length > 0) {
                localStorage.setItem("sesPlanningUnitIdMulti", JSON.stringify(value));
                document.getElementById("consumptionTableDiv").style.display = "block";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "block";
                    var roleList = AuthenticationService.getLoggedInUserRole();
                    if ((roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') || (this.state.programQPLDetails.filter(c => c.id == this.state.programId))[0].readonly) {
                        document.getElementById("addRowButtonId").style.display = "none";
                    }
                }
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: '#BA0C2F'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var programTransaction = transaction.objectStore('programData');
                    var programRequest = programTransaction.get(programId);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: '#BA0C2F'
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    programRequest.onsuccess = function (event) {
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                        var puData = [];
                        var consumptionListForSelectedPlanningUnits = [];
                        var consumptionListForSelectedPlanningUnitsUnfiltered = [];
                        var planningUnitListForJexcel = this.state.planningUnitListForJexcelAll;
                        var planningUnitListForJexcelUpdated = [];
                        for (var pu = 0; pu < puList.length; pu++) {
                            planningUnitListForJexcelUpdated.push(planningUnitListForJexcel.filter(c => c.id == puList[pu].value)[0]);
                            var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == puList[pu].value);
                            var programJson = {};
                            if (planningUnitDataFilter.length > 0) {
                                var planningUnitData = planningUnitDataFilter[0]
                                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                programJson = JSON.parse(programData);
                            } else {
                                programJson = {
                                    consumptionList: [],
                                    inventoryList: [],
                                    shipmentList: [],
                                    batchInfoList: [],
                                    supplyPlan: []
                                }
                            }
                            var batchInfoList = programJson.batchInfoList;
                            var batchList = [];
                            var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == puList[pu].value && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);
                            for (var sl = 0; sl < shipmentList.length; sl++) {
                                var bdl = shipmentList[sl].batchInfoList;
                                for (var bd = 0; bd < bdl.length; bd++) {
                                    var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                    if (index == -1) {
                                        var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == puList[pu].value && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                        if (batchDetailsToPush.length > 0) {
                                            batchList.push(batchDetailsToPush[0]);
                                        }
                                    }
                                }
                            }
                            var consumptionListUnFiltered = (programJson.consumptionList);
                            consumptionListForSelectedPlanningUnitsUnfiltered = consumptionListForSelectedPlanningUnitsUnfiltered.concat(consumptionListUnFiltered);
                            var consumptionList = (programJson.consumptionList).filter(c =>
                                c.planningUnit.id == puList[pu].value &&
                                c.region != null && c.region.id != 0 &&
                                moment(c.consumptionDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.consumptionDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"));
                            if (regionId != "") {
                                consumptionList = consumptionList.filter(c => c.region.id == regionId);
                            }
                            if (consumptionType != "") {
                                if (consumptionType == 1) {
                                    consumptionList = consumptionList.filter(c => c.actualFlag.toString() == "true");
                                } else {
                                    consumptionList = consumptionList.filter(c => c.actualFlag.toString() == "false");
                                }
                            }
                            if (showActive == 1) {
                                consumptionList = consumptionList.filter(c => c.active.toString() == "true");
                            } else if (showActive == 2) {
                                consumptionList = consumptionList.filter(c => c.active.toString() == "false");
                            }
                            consumptionListForSelectedPlanningUnits = consumptionListForSelectedPlanningUnits.concat(consumptionList);
                            puData.push({
                                id: puList[pu].value,
                                programJson: programJson,
                                consumptionListUnFiltered: consumptionListUnFiltered,
                                consumptionList: consumptionList,
                                batchInfoList: batchList,
                            })
                        }
                        this.setState({
                            puData: puData,
                            consumptionListForSelectedPlanningUnits: consumptionListForSelectedPlanningUnits,
                            consumptionListForSelectedPlanningUnitsUnfiltered: consumptionListForSelectedPlanningUnitsUnfiltered,
                            planningUnitListForJexcel: planningUnitListForJexcelUpdated,
                            startDate: startDate,
                            stopDate: stopDate,
                            consumptionMonth: "",
                            consumptionStartDate: "",
                            consumptionRegion: "",
                            showConsumption: 1,
                        })
                        this.refs.consumptionChild.showConsumptionData();
                    }.bind(this)
                }.bind(this)
            } else {
                document.getElementById("consumptionTableDiv").style.display = "none";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
                this.setState({ loading: false });
            }
        }
    }
    /**
     * This function is used to update the state of this component from any other component
     * @param {*} parameterName This is the name of the key
     * @param {*} value This is the value for the key
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }
    /**
     * This function is called when cancel button is clicked
     */
    cancelClicked() {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1) {
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
                consumptionChangedFlag: 0,
                consumptionBatchInfoChangedFlag: 0
            }, () => {
                let id = AuthenticationService.displayDashboardBasedOnRole();
                this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
            })
        }
    }
    /**
     * This function is called when cancel button for batch modal popup is clicked
     */
    actionCanceled() {
        var cont = false;
        if (this.state.consumptionBatchInfoChangedFlag == 1) {
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
                message: i18n.t('static.actionCancelled'),
                color: "#BA0C2F",
                consumptionBatchInfoChangedFlag: 0
            }, () => {
                this.hideFirstComponent();
                this.toggleLarge();
            })
        }
    }
    /**
     * This is used to display the content
     * @returns The consumption data in tabular format
     */
    render() {
        const checkOnline = localStorage.getItem('sessionType');
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const { regionList } = this.state;
        let regions = regionList.length > 0 && regionList.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {item.name}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <h5 id="div2" className="red">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h5>
                <Card>
                    {checkOnline === 'Online' &&
                        <div className="Card-header-addicon problemListMarginTop">
                            <div className="card-header-actions">
                                <div className="card-header-action">
                                    <a className="card-header-action">
                                        {this.state.programId != 0 && this.state.planningUnit.length > 0 &&
                                            <a href='javascript:;' onClick={this.exportCSV} ><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a>
                                        }
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                    <CardBody className="pb-lg-5 pt-lg-0">
                        <Formik
                            render={
                                ({
                                }) => (
                                    <Form name='simpleForm'>
                                        <div className=" pl-0">
                                            <div className="row">
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            ref={this.pickRange}
                                                            value={rangeValue}
                                                            lang={pickerLang}
                                                            onDismiss={this.handleRangeDissmis}
                                                        >
                                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                    <div className="controls ">
                                                        <Select
                                                            name="programSelect"
                                                            id="programSelect"
                                                            bsSize="sm"
                                                            options={this.state.programList}
                                                            value={this.state.programSelect}
                                                            onChange={(e) => { this.getPlanningUnitList(e); }}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label>
                                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                    <div className="controls ">
                                                        <MultiSelect
                                                            name="planningUnit"
                                                            id="planningUnit"
                                                            options={this.state.planningUnitList.length > 0 ? this.state.planningUnitList : []}
                                                            value={this.state.planningUnit}
                                                            onChange={(e) => { this.formSubmit(e, this.state.rangeValue); }}
                                                            labelledBy={i18n.t('static.common.select')}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3 ">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.region.region')}</Label>
                                                    <div className="controls ">
                                                        <Input
                                                            type="select"
                                                            name="regionId"
                                                            id="regionId"
                                                            bsSize="sm"
                                                            value={this.state.regionId}
                                                            onChange={(e) => { this.formSubmit(this.state.planningUnit, this.state.rangeValue); }}
                                                        >
                                                            <option value="">{i18n.t('static.common.all')}</option>
                                                            {regions}
                                                        </Input>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3 ">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.consumption.consumptionType')}</Label>
                                                    <div className="controls ">
                                                        <Input
                                                            type="select"
                                                            name="consumptionType"
                                                            id="consumptionType"
                                                            value={this.state.consumptionType}
                                                            bsSize="sm"
                                                            onChange={(e) => { this.formSubmit(this.state.planningUnit, this.state.rangeValue); }}
                                                        >
                                                            <option value="">{i18n.t('static.common.all')}</option>
                                                            <option value={ACTUAL_CONSUMPTION_TYPE}>{i18n.t('static.consumption.actual')}</option>
                                                            <option value={FORCASTED_CONSUMPTION_TYPE}>{i18n.t('static.consumption.forcast')}</option>
                                                        </Input>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3 ">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.active')}</Label>
                                                    <div className="controls ">
                                                        <Input
                                                            type="select"
                                                            name="showActive"
                                                            id="showActive"
                                                            value={this.state.showActive}
                                                            bsSize="sm"
                                                            onChange={(e) => { this.formSubmit(this.state.planningUnit, this.state.rangeValue); }}
                                                        >
                                                            <option value="">{i18n.t('static.common.all')}</option>
                                                            <option value="1">{i18n.t('static.common.active')}</option>
                                                            <option value="2">{i18n.t('static.dataentry.inactive')}</option>
                                                        </Input>
                                                    </div>
                                                </FormGroup>
                                                <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                            </div>
                                        </div>
                                    </Form>
                                )} />
                        {(this.state.programQPLDetails.filter(c => c.id == this.state.programId)).length > 0 && (this.state.programQPLDetails.filter(c => c.id == this.state.programId))[0].readonly == 1 && <h5 style={{ color: 'red' }}>{i18n.t('static.dataentry.readonly')}</h5>}
                        <div className="col-md-10 pb-3">
                            <ul className="legendcommitversion">
                                <li><span className=" mediumGreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.inactiveData')} </span></li>
                                <li><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.common.readonlyData')} </span></li>
                            </ul>
                        </div>
                        <div className="consumptionSearchMarginTop" >
                            <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="consumptionDataEntry" useLocalData={1} />
                            <div className="consumptionDataEntryTable" id="consumptionTableDiv">
                                <div id="consumptionTable" style={{ display: this.state.loading ? "none" : "block" }} />
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
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.consumptionChild.saveConsumption}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                                {this.refs.consumptionChild != undefined && <Button color="info" id="addRowButtonId" size="md" className="float-right mr-1" type="button" onClick={this.refs.consumptionChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}&nbsp;
                            </FormGroup>
                        </FormGroup>
                    </CardFooter>
                </Card>
                <Modal isOpen={this.state.consumptionBatchInfo}
                    className={'modal-lg modalWidth ' + this.props.className}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dataEntry.batchDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                        <div className="">
                            <div id="consumptionBatchInfoTable" className="AddListbatchtrHeight"></div>
                        </div>
                        <br /><span>{i18n.t("static.dataEntry.missingBatchNote")}</span>
                    </ModalBody>
                    <ModalFooter>
                        <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }} className="mr-0">
                            {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right" onClick={this.refs.consumptionChild.saveConsumptionBatchInfo}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            {this.refs.consumptionChild != undefined && <Button id="consumptionBatchAddRow" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.consumptionChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                        </div>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
    /**
     * This function is called when consumption date picker is clicked
     * @param {*} e 
     */
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
}