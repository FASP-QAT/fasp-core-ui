import CryptoJS from 'crypto-js';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Formik } from 'formik';
import moment from "moment";
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import { Prompt } from 'react-router';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button, Card, CardBody, CardFooter,
    Form, FormGroup,
    Label, Modal, ModalBody, ModalFooter, ModalHeader, Input
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { filterOptions } from '../../CommonComponent/JavascriptCommonFunctions';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { DELIVERED_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import InventoryInSupplyPlanComponent from "../SupplyPlan/InventoryInSupplyPlanForDataEntry";
const entityname = i18n.t('static.inventory.inventorydetils')
/**
 * This component is used to allow the users to do the data entry for the inventory or adjustment records
 */
export default class AddInventory extends Component {
    constructor(props) {
        super(props);
        var startDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD")
        this.state = {
            loading: true,
            programList: [],
            programId: '',
            changedFlag: 0,
            message: '',
            lang: localStorage.getItem('lang'),
            timeout: 0,
            inventoryType: 1,
            showInventory: 0,
            inventoryChangedFlag: 0,
            inventoryDataType: { value: 1, label: i18n.t('static.inventory.inventory') },
            rangeValue: localStorage.getItem("sesRangeValue") != "" ? JSON.parse(localStorage.getItem("sesRangeValue")) : { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            planningUnitId: '',
            regionList: [],
            dataSourceList: [],
            realmCountryPlanningUnitList: [],
            programQPLDetails: [],
            planningUnitListForJexcel: [],
            planningUnitListForJexcelAll: [],
            planningUnit: [],
            puData: [],
            inventoryListForSelectedPlanningUnits: [],
            inventoryListForSelectedPlanningUnitsUnfiltered: [],
            planningUnitList: [],
            addNewBatch: false
        }
        this.options = props.options;
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.updateState = this.updateState.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
        this.exportCSV = this.exportCSV.bind(this);
    }
    /**
     * This function is used to export the inventory or adjustment data entry template so that user can copy paste the bulk data
     */
    exportCSV() {
        let workbook = new Workbook();
        let worksheet = (this.state.inventoryDataType.value == 1 ? workbook.addWorksheet(i18n.t('static.supplyplan.inventoryDataEntry')) : workbook.addWorksheet(i18n.t('static.supplyplan.adjustmentDataEntryTemplate')));
        worksheet.columns = [
            { header: i18n.t('static.dataEntry.planningUnitId'), key: 'name', width: 25 },
            { header: i18n.t('static.inventory.inventoryDate'), key: 'string', width: 25, style: { numFmt: 'YYYY-MM-DD' } },
            { header: i18n.t('static.region.region'), key: 'name', width: 25 },
            { header: i18n.t('static.inventory.dataSource'), key: 'name', width: 40 },
            { header: i18n.t('static.supplyPlan.alternatePlanningUnit'), key: 'name', width: 40 },
            { header: i18n.t('static.supplyPlan.inventoryType'), key: 'name', width: 32 },
            { header: i18n.t('static.supplyPlan.quantityCountryProduct'), key: 'name', width: 32 },
            { header: i18n.t('static.supplyPlan.quantityCountryProduct'), key: 'name', width: 12 },
            { header: i18n.t('static.unit.multiplierFromARUTOPU'), key: 'name', width: 12 },
            { header: i18n.t('static.supplyPlan.quantityQATProduct'), key: 'name', width: 25 },
            { header: i18n.t('static.supplyPlan.quantityQATProduct'), key: 'name', width: 25 },
            { header: i18n.t('static.common.note'), key: 'string', width: 25 },
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
        for (let i = 0; i < 1000; i++) {
            worksheet.getCell('B' + (+i + 2)).note = i18n.t('static.dataEntry.dateValidation');
        }
        let dataSourceVar = [];
        let datasourceList = this.state.dataSourceList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < datasourceList.length; i++) {
            dataSourceVar.push(datasourceList[i].name);
        }
        worksheet.dataValidations.add('D2:D1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${dataSourceVar.join(",")}"`],
            showErrorMessage: true,
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
            showErrorMessage: true,
        });
        let activeDropdown = ["True", "False"];
        worksheet.dataValidations.add('M2:M1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${activeDropdown.join(",")}"`],
            showErrorMessage: true,
        });
        if (this.state.inventoryDataType.value == 1) {
            worksheet.dataValidations.add('H2:H1000', {
                type: 'whole',
                operator: 'greaterThan',
                showErrorMessage: true,
                formulae: [-1],
            });
        } else {
            worksheet.dataValidations.add('G2:G1000', {
                type: 'whole',
                operator: 'greaterThan',
                showErrorMessage: true,
                formulae: [-100000000],
            });
        }
        for (let i = 0; i < 1000; i++) {
            worksheet.getCell('F' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            if (this.state.inventoryDataType.value == 1) {
                worksheet.getCell('G' + (+i + 2)).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'cccccc' },
                    bgColor: { argb: '96C8FB' }
                }
            } else {
                worksheet.getCell('H' + (+i + 2)).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'cccccc' },
                    bgColor: { argb: '96C8FB' }
                }
            }
            worksheet.getCell('I' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('J' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('K' + (+i + 2)).fill = {
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
        if (this.state.inventoryDataType.value == 1) {
            worksheet.getColumn('H').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
                cell.protection = { locked: false };
            });
        } else {
            worksheet.getColumn('G').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
                cell.protection = { locked: false };
            });
        }
        worksheet.getColumn('L').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('M').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, (this.state.inventoryDataType.value == 1 ? i18n.t('static.supplyplan.inventoryDataEntry') : i18n.t('static.supplyplan.adjustmentDataEntryTemplate')) + '.xlsx');
        })
    }
    /**
     * This function is used to update the inventory or adjustment date range filter value
     * @param {*} value This is the value that user has selected
     */
    handleRangeDissmis(value) {
        var cont = false;
        if (this.state.inventoryChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ rangeValue: value, inventoryChangedFlag: 0 })
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
        if (this.state.inventoryChangedFlag == 1 || this.state.inventoryBatchInfoChangedFlag == 1) {
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
        if (method != "submit" && this.state.inventoryBatchInfoChangedFlag == 1) {
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
                inventoryBatchInfoChangedFlag: 0,
                inventoryBatchInfoDuplicateError: '',
                inventoryBatchInfoNoStockError: '',
                inventoryBatchError: ""
            })
            this.setState({
                inventoryBatchInfo: !this.state.inventoryBatchInfo,
            });
        }
    }
    /**
     * This function is used to fetch list all the offline programs that the user have downloaded
     */
    componentDidMount() {
        document.getElementById("adjustmentsTableDiv").closest('.card').classList.add("removeCardwrap");
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
                        var cutOffDate = myResult[i].cutOffDate != undefined && myResult[i].cutOffDate != null && myResult[i].cutOffDate != "" ? myResult[i].cutOffDate : ""
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version + (cutOffDate != "" ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(cutOffDate).format('MMM YYYY') + ")" : ""),
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
    }
    /**
     * This function is used to fetch list all the planning units based on the programs that the user has selected
     * @param {*} value This is value of the program that is selected either by user or is autoselected
     */
    getPlanningUnitList(value) {
        var cont = false;
        if (this.state.inventoryChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            document.getElementById("adjustmentsTableDiv").style.display = "none";
            if (document.getElementById("addRowButtonId") != null) {
                document.getElementById("addRowButtonId").style.display = "none";
            }
            this.setState({
                programSelect: value,
                programId: value != "" && value != undefined ? value.value : 0,
                loading: true,
                planningUnit: [],
                inventoryChangedFlag: 0
            })
            var programId = value != "" && value != undefined ? value.value : 0;
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
                            var cutOffDate = programJson.cutOffDate != undefined && programJson.cutOffDate != null && programJson.cutOffDate != "" ? programJson.cutOffDate : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
                            var rangeValue = this.state.rangeValue;
                            if (moment(this.state.rangeValue.from.year + "-" + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                                var cutOffEndDate = moment(cutOffDate).add(18, 'months').startOf('month').format("YYYY-MM-DD");
                                rangeValue = { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: { year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) } };
                                localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
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
                                }),
                                loading: false,
                                minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
                                rangeValue: rangeValue,
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
                    loading: false,
                    planningUnitList: [],
                    planningUnitListForJexcel: [],
                    planningUnitListForJexcelAll: [],
                    puData: [],
                })
            }
        }
    }
    /**
     * This function is used fetch all the inventory or adjustment records based on the filters and build all the necessary data
     * @param {*} value This is the value of planning unit
     * @param {*} rangeValue This is the value of date range that is selected
     */
    formSubmit(value, rangeValue) {
        var cont = false;
        if (this.state.inventoryChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            this.setState({ loading: true, inventoryChangedFlag: 0 })
            var programId = document.getElementById('programId').value;
            this.setState({ programId: programId, planningUnit: value });
            var puList = value;
            var programId = document.getElementById("programId").value;
            if (puList.length > 0) {
                localStorage.setItem("sesPlanningUnitIdMulti", JSON.stringify(value));
                document.getElementById("adjustmentsTableDiv").style.display = "block";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "block";
                    // var roleList = AuthenticationService.getLoggedInUserRole();
                    if (AuthenticationService.checkUserACLBasedOnRoleId([programId.toString().split("_")[0].toString()], 'ROLE_GUEST_USER') || this.state.programQPLDetails.filter(c => c.id == this.state.programId)[0].readonly) {
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
                        var inventoryListForSelectedPlanningUnits = [];
                        var inventoryListForSelectedPlanningUnitsUnfiltered = [];
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
                            var batchList = []
                            var batchInfoList = programJson.batchInfoList;
                            var batchList = [];
                            var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == puList[pu].value && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);
                            var consumptionBatchList = programJson.consumptionList.filter(c => c.planningUnit.id == puList[pu].value).flatMap(consumption => consumption.batchInfoList);
                            var inventoryBatchList = programJson.inventoryList.filter(c => c.planningUnit.id == puList[pu].value).flatMap(inventory => inventory.batchInfoList);
                            var shipmentBatchList = shipmentList.flatMap(shipment => shipment.batchInfoList);
                            for (var sl = 0; sl < shipmentList.length; sl++) {
                                var bdl = shipmentList[sl].batchInfoList;
                                for (var bd = 0; bd < bdl.length; bd++) {
                                    var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                    if (index == -1) {
                                        var shipmentBatchListFiltered = shipmentBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                        var consumptionBatchListFiltered = consumptionBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                        var inventoryBatchListFiltered = inventoryBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                        var shipmentTotal = 0;
                                        var consumptionTotal = 0;
                                        var inventoryTotal = 0;
                                        shipmentBatchListFiltered.map(item => {
                                            shipmentTotal += Number(item.shipmentQty);
                                        })
                                        consumptionBatchListFiltered.map(item => {
                                            consumptionTotal += Number(item.consumptionQty);
                                        })
                                        inventoryBatchListFiltered.map(item => {
                                            inventoryTotal += Number(item.adjustmentQty)
                                        })
                                        var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == puList[pu].value && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                        if (batchDetailsToPush.length > 0) {
                                            batchDetailsToPush[0].qtyAvailable = Number(shipmentTotal) + Number(inventoryTotal) - Number(consumptionTotal);
                                            batchList.push(batchDetailsToPush[0]);
                                        }
                                    }
                                }
                            }
                            var inventoryList = programJson.inventoryList.filter(c => c.planningUnit.id == puList[pu].value && c.active.toString() == "true" && c.addNewBatch && c.addNewBatch.toString() == "true");
                            console.log("inventory List Test@123",inventoryList);
                            for (var il = 0; il < inventoryList.length; il++) {
                                var bdl = inventoryList[il].batchInfoList;
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
                            console.log("Batch Info List Test@123",batchInfoList);
                            var inventoryListUnFiltered = (programJson.inventoryList);
                            inventoryListForSelectedPlanningUnitsUnfiltered = inventoryListForSelectedPlanningUnitsUnfiltered.concat(inventoryListUnFiltered);
                            var inventoryList = (programJson.inventoryList).filter(c =>
                                c.planningUnit.id == puList[pu].value &&
                                c.region != null && c.region.id != 0);
                            if (this.state.inventoryType == 1) {
                                inventoryList = inventoryList.filter(c => c.actualQty !== "" && c.actualQty != undefined && c.actualQty != null);
                            } else {
                                inventoryList = inventoryList.filter(c => c.adjustmentQty !== "" && c.adjustmentQty != undefined && c.adjustmentQty != null);
                            }
                            inventoryList = inventoryList.filter(c => moment(c.inventoryDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.inventoryDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"))
                            inventoryListForSelectedPlanningUnits = inventoryListForSelectedPlanningUnits.concat(inventoryList);
                            puData.push({
                                id: puList[pu].value,
                                programJson: programJson,
                                inventoryListUnFiltered: inventoryListUnFiltered,
                                inventoryList: inventoryList,
                                batchInfoList: batchList,
                            })
                        }
                        this.setState({
                            puData: puData,
                            inventoryListForSelectedPlanningUnits: inventoryListForSelectedPlanningUnits,
                            inventoryListForSelectedPlanningUnitsUnfiltered: inventoryListForSelectedPlanningUnitsUnfiltered,
                            planningUnitListForJexcel: planningUnitListForJexcelUpdated,
                            showInventory: 1,
                            inventoryType: this.state.inventoryType,
                            inventoryMonth: "",
                            inventoryEndDate: "",
                            inventoryRegion: ""
                        })
                        this.refs.inventoryChild.showInventoryData();
                    }.bind(this)
                }.bind(this)
            } else {
                document.getElementById("adjustmentsTableDiv").style.display = "none";
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
     * This function is used to the value of data type
     * @param {*} value This is the value of data type that user has selected
     */
    updateDataType(value) {
        var cont = false;
        if (this.state.inventoryChangedFlag == 1) {
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
                inventoryType: value != "" && value != undefined ? value.value : 0,
                inventoryDataType: value,
                inventoryChangedFlag: 0
            })
            document.getElementById("adjustmentsTableDiv").style.display = "none";
            if (document.getElementById("addRowButtonId") != null) {
                document.getElementById("addRowButtonId").style.display = "none";
            }
            if (this.state.planningUnit != 0 && (value != "" && value != undefined ? value.value : 0) != 0) {
                this.formSubmit(this.state.planningUnit, this.state.rangeValue);
            }
        }
    }
    /**
     * This is used to display the content
     * @returns The inventory or adjustments data in tabular format
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
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.inventoryChangedFlag == 1 || this.state.inventoryBatchInfoChangedFlag == 1}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <h5 className="red" id="div2">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h5>
                <Card>
                    {checkOnline === 'Online' && this.state.inventoryDataType != null &&
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
                    <CardBody className="pb-lg-2 pt-lg-0" >
                        <Formik
                            render={
                                ({
                                }) => (
                                    <Form name='simpleForm'>
                                        <div className="pl-0">
                                            <div className="row">
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            ref={this.pickRange}
                                                            value={rangeValue}
                                                            lang={pickerLang}
                                                            key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
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
                                                            placeholder={i18n.t('static.common.select')}
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
                                                            filterOptions={filterOptions}
                                                            overrideStrings={{
                                                                allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                                selectSomeItems: i18n.t('static.common.select')
                                                            }}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3 ">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.inventoryType')}</Label>
                                                    <div className="controls ">
                                                        <Select
                                                            name="inventoryDataType"
                                                            id="inventoryDataType"
                                                            bsSize="sm"
                                                            options={[{ value: 2, label: i18n.t('static.inventoryType.adjustment') }, { value: 1, label: i18n.t('static.inventory.inventory') }]}
                                                            value={this.state.inventoryDataType}
                                                            onChange={(e) => { this.updateDataType(e); }}
                                                        />
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
                        <div >
                            <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} inventoryPage="inventoryDataEntry" useLocalData={1} />
                            <div className="inventoryDataEntryTable" id="adjustmentsTableDiv">
                                <div id="adjustmentsTable" style={{ display: this.state.loading ? "none" : "block" }} />
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
                    <CardFooter>
                        <FormGroup>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.inventoryChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.inventoryChild.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}&nbsp;
                                {this.refs.inventoryChild != undefined && <Button id="addRowButtonId" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.inventoryChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                                &nbsp;
                            </FormGroup>
                        </FormGroup>
                    </CardFooter>
                </Card>
                <Modal isOpen={this.state.inventoryBatchInfo}
                    className={'modal-lg modalWidth ' + this.props.className}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dataEntry.batchDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                        <div className="">
                            <div id="inventoryBatchInfoTable" className="AddListbatchtrHeight"></div>
                            <div id="inventoryAddBatchInfoTable" className="AddListbatchtrHeight"></div>
                        </div>
                        {!this.state.addNewBatch && <><br /><span>{i18n.t("static.dataEntry.missingBatchNote")}</span></>}
                    </ModalBody>
                    <ModalFooter className="d-flex justify-content-between align-items-center">
                        <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            <FormGroup className='MarginTopCheckBox mb-0'>
                                <div className="d-flex align-items-center">
                                    <Input
                                        className="form-check-input mr-6"
                                        style={{ marginLeft: "-10px" }}
                                        type="checkbox"
                                        id="addNewBatch"
                                        name="addNewBatch"
                                        checked={this.state.addNewBatch}
                                        onClick={(e) => { this.refs.inventoryChild.changeAddNewBatch(e); }}
                                    />
                                    <Label
                                        className="form-check-label ml-2"
                                        check htmlFor="addNewBatch" style={{ fontSize: '12px', marginTop: '3px' }}>
                                        {i18n.t('static.supplyPlan.addNewBatch')}
                                    </Label>
                                </div>
                            </FormGroup>
                        </div>

                        <div className="d-flex">
                            {this.state.inventoryBatchInfoChangedFlag == 1 && (
                                <Button
                                    type="submit"
                                    size="md"
                                    color="success"
                                    className="mr-2"
                                    onClick={() => this.refs.inventoryChild.saveInventoryBatchInfo()}
                                >
                                    <i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}
                                </Button>
                            )}
                            {this.refs.inventoryChild != undefined && (
                                <Button
                                    color="info"
                                    size="md"
                                    className="mr-2"
                                    id="inventoryBatchAddRow"
                                    type="button"
                                    onClick={this.refs.inventoryChild.addBatchRowInJexcel}
                                >
                                    <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}
                                </Button>
                            )}
                            <Button
                                size="md"
                                color="danger"
                                className="submitBtn"
                                onClick={() => this.actionCanceled()}
                            >
                                <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}
                            </Button>
                        </div>
                    </ModalFooter>
                </Modal>
            </div >
        );
    }
    /**
     * This function is called when cancel button is clicked
     */
    cancelClicked() {
        var cont = false;
        if (this.state.inventoryChangedFlag == 1) {
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
                inventoryChangedFlag: 0,
                inventoryBatchInfoChangedFlag: 0
            }, () => {
                let id = AuthenticationService.displayDashboardBasedOnRole();
                var entityname = this.state.inventoryType == 1 ? i18n.t("static.inventoryDetailHead.inventoryDetail") : i18n.t("static.inventory.adjustmentdetails");
                this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
            })
        }
    }
    /**
     * This function is called when cancel button for batch modal popup is clicked
     */
    actionCanceled() {
        var cont = false;
        if (this.state.inventoryBatchInfoChangedFlag == 1) {
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
                inventoryBatchInfoChangedFlag: 0
            }, () => {
                this.hideFirstComponent();
                this.toggleLarge();
            })
        }
    }
    /**
     * This function is called when inventory or adjustment date picker is clicked
     * @param {*} e 
     */
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
}
