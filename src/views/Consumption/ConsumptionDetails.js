import React from "react";
import ReactDOM from 'react-dom';
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody
} from 'reactstrap';
import { Prompt } from 'react-router'
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DELIVERED_SHIPMENT_STATUS, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, API_URL, polling } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ConsumptionInSupplyPlanComponent from "../SupplyPlan/ConsumptionInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import moment from "moment"
import { Online } from "react-detect-offline";
import { isSiteOnline } from "../../CommonComponent/JavascriptCommonFunctions.js";
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

const entityname = i18n.t('static.dashboard.consumptiondetails');

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
            realmCountryPlanningUnitList: []
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
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.pickRange = React.createRef();
    }

    exportCSV() {

        //Create workbook and worksheet
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(i18n.t('static.supplyplan.consumptionDataEntry'));

        //Add Header Row

        worksheet.columns = [
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
            // console.log('ROW--------->' + colNumber + ' = ' + cell.value);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' },
                bgColor: { argb: 'FF0000FF' },
                // font: { bold: true }
            }
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });


        let dataSourceVar = [];
        let datasourceList = this.state.dataSourceList.filter(c => (c.dataSourceTypeId == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || c.dataSourceTypeId == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE) && c.active.toString() == "true");

        for (let i = 0; i < datasourceList.length; i++) {
            dataSourceVar.push(datasourceList[i].name);
        }

        worksheet.dataValidations.add('D2:D100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${dataSourceVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        //region
        let regionVar = [];
        let regionList = this.state.regionList;
        for (let i = 0; i < regionList.length; i++) {
            regionVar.push(regionList[i].name);
        }

        worksheet.dataValidations.add('B2:B100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${regionVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        let consumptionTypeDropdown = [i18n.t('static.consumption.actual'), i18n.t('static.consumption.forcast')];
        worksheet.dataValidations.add('C2:C100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${consumptionTypeDropdown.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        //alternateReportingUnit
        // let alternateReportingUnitVar = [];
        // let alternateReportingUnitList = this.state.realmCountryPlanningUnitList.filter(c => c.active.toString() == "true").sort(function (a, b) {
        //     a = a.name.toLowerCase();
        //     b = b.name.toLowerCase();
        //     return a < b ? -1 : a > b ? 1 : 0;
        // });
        // for (let i = 0; i < alternateReportingUnitList.length; i++) {
        //     alternateReportingUnitVar.push(alternateReportingUnitList[i].name);
        // }
        // worksheet.dataValidations.add('E2:E100', {
        //     type: 'list',
        //     allowBlank: false,
        //     formulae: [`"${alternateReportingUnitVar.join(",")}"`],
        //     showErrorMessage: true,
        //     // errorStyle: 'error',
        //     // error: 'Invalid value',
        // });


        // let activeDropdown = [i18n.t('static.dataEntry.True'), i18n.t('static.dataEntry.False')];
        let activeDropdown = ["True", "False"];
        worksheet.dataValidations.add('K2:K100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${activeDropdown.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        //Validations

        // worksheet.dataValidations.add('A2:A100', {
        //     type: 'date',
        //     // operator: 'greaterThan',
        //     showErrorMessage: true,
        //     formulae: [new Date('3021-01-01')],
        //     allowBlank: false,
        //     prompt: 'Format (YYYY-MM-DD)',
        //     // errorStyle: 'error',
        //     // errorTitle: 'Invalid Value',
        //     // error: 'Invalid Value'
        // });

        for (let i = 0; i < 100; i++) {
            worksheet.getCell('A' + (+i + 2)).note = i18n.t('static.dataEntry.dateValidation');
        }

        worksheet.dataValidations.add('F2:F100', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1],
            // errorStyle: 'error',
            // errorTitle: 'Invalid Value',
            // error: 'Invalid Value'
        });

        worksheet.dataValidations.add('I2:I100', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1],
            // errorStyle: 'error',
            // errorTitle: 'Invalid Value',
            // error: 'Invalid Value'
        });


        for (let i = 0; i < 100; i++) {
            worksheet.getCell('G' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('H' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
        }

        //Protection

        // worksheet.getColumn('G2').protection = {
        //     locked: false,
        //     hidden: true,
        // };
        // worksheet.getCell('G3').protection = {
        //     locked: false,
        //     hidden: true,
        // };

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
        worksheet.getColumn('I').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('J').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('K').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        // Generate Excel File with given name

        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, i18n.t('static.supplyplan.consumptionDataEntry') + '.xlsx');
        })

    }

    show() {
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
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

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 8000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

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

    componentDidMount = function () {
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
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
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
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programData);
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
                    }), loading: false
                })
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
                // var programIdd = this.props.match.params.programId || localStorage.getItem("sesProgramId");
                var programIdd = '';
                if (this.props.match.params.programId != '' && this.props.match.params.programId != undefined) {
                    programIdd = this.props.match.params.programId;
                } else if (proList.length == 1) {
                    programIdd = proList[0].value;
                } else if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                    programIdd = localStorage.getItem("sesProgramId");
                }
                if (programIdd != '' && programIdd != undefined) {
                    var programSelect = { value: programIdd, label: proList.filter(c => c.value == programIdd)[0].label };
                    this.setState({
                        programSelect: programSelect,
                        programId: programIdd
                    })
                    this.getPlanningUnitList(programSelect);
                }
            }.bind(this);
        }.bind(this)
    };

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
            document.getElementById("planningUnitId").value = 0;
            document.getElementById("planningUnit").value = "";
            document.getElementById("consumptionTableDiv").style.display = "none";
            if (document.getElementById("addRowButtonId") != null) {
                document.getElementById("addRowButtonId").style.display = "none";
            }
            this.setState({
                programSelect: value,
                programId: value != "" && value != undefined ? value.value : 0,
                planningUnit: "",
            })
            if (programId != 0) {
                localStorage.setItem("sesProgramId", programId);
                var db1;
                var storeOS;
                var regionList = [];
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
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('programData');
                    var programRequest = programDataOs.get(value != "" && value != undefined ? value.value : 0);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
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
                        var planningList = []
                        planningunitRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            var programId = (value != "" && value != undefined ? value.value : 0).split("_")[0];
                            myResult = planningunitRequest.result.filter(c => c.program.id == programId);
                            var proList = []
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    var productJson = {
                                        label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                        value: myResult[i].planningUnit.id
                                    }
                                    proList.push(productJson)
                                }
                            }
                            this.setState({
                                planningUnitList: proList.sort(function (a, b) {
                                    a = a.label.toLowerCase();
                                    b = b.label.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                planningUnitListAll: myResult,
                                generalProgramJson:programJson,
                                regionList: regionList.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), loading: false
                            })

                            // var planningUnitIdProp = this.props.match.params.planningUnitId || localStorage.getItem("sesPlanningUnitId");
                            var planningUnitIdProp = '';
                            if (this.props.match.params.planningUnitId != '' && this.props.match.params.planningUnitId != undefined) {
                                planningUnitIdProp = this.props.match.params.planningUnitId;
                            } else if (localStorage.getItem("sesPlanningUnitId") != '' && localStorage.getItem("sesPlanningUnitId") != undefined) {
                                planningUnitIdProp = localStorage.getItem("sesPlanningUnitId");
                            } else if (proList.length == 1) {
                                planningUnitIdProp = proList[0].value;
                            }
                            if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                var planningUnit = { value: planningUnitIdProp, label: proList.filter(c => c.value == planningUnitIdProp)[0].label };
                                this.setState({
                                    planningUnit: planningUnit,
                                    planningUnitId: planningUnitIdProp
                                })
                                this.formSubmit(planningUnit, this.state.rangeValue);
                            }
                        }.bind(this);
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({
                    planningUnitList: [],
                    loading: false
                })
            }
        }
    }

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
            this.setState({ programId: programId, planningUnitId: value != "" && value != undefined ? value.value : 0, planningUnit: value });
            var planningUnitId = value != "" && value != undefined ? value.value : 0;
            var programId = document.getElementById("programId").value;
            var regionId = document.getElementById("regionId").value;
            var consumptionType = document.getElementById("consumptionType").value;
            var showActive = document.getElementById("showActive").value;
            if (planningUnitId != 0) {
                localStorage.setItem("sesPlanningUnitId", planningUnitId);
                document.getElementById("consumptionTableDiv").style.display = "block";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "block";
                    var roleList = AuthenticationService.getLoggedInUserRole();
                    if (roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') {
                        document.getElementById("addRowButtonId").style.display = "none";
                    }
                }
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
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var programTransaction = transaction.objectStore('programData');
                    var programRequest = programTransaction.get(programId);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    programRequest.onsuccess = function (event) {
                        var planningUnitDataList=programRequest.result.programData.planningUnitDataList;
                        var planningUnitData=planningUnitDataList.filter(c=>c.planningUnitId==planningUnitId)[0];
                        var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var batchInfoList = programJson.batchInfoList;
                        var batchList = [];
                        var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);

                        for (var sl = 0; sl < shipmentList.length; sl++) {
                            var bdl = shipmentList[sl].batchInfoList;
                            for (var bd = 0; bd < bdl.length; bd++) {
                                var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                if (index == -1) {
                                    var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == planningUnitId && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                    if (batchDetailsToPush.length > 0) {
                                        batchList.push(batchDetailsToPush[0]);
                                    }
                                }
                            }
                        }

                        var consumptionListUnFiltered = (programJson.consumptionList);
                        var consumptionList = (programJson.consumptionList).filter(c =>
                            c.planningUnit.id == planningUnitId &&
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
                        this.setState({
                            batchInfoList: batchList,
                            programJson: programJson,
                            consumptionListUnFiltered: consumptionListUnFiltered,
                            consumptionList: consumptionList,
                            showConsumption: 1,
                            consumptionMonth: "",
                            consumptionStartDate: "",
                            consumptionRegion: "",
                            startDate: startDate,
                            stopDate: stopDate
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

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }

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
                color: "red",
                consumptionBatchInfoChangedFlag: 0
            }, () => {
                this.hideFirstComponent();
                this.toggleLarge();
            })
        }
    }

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
                                        {/* <a href={`${API_URL}/file/consumptionDataEntryTemplate`}><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a> */}
                                        {this.state.programId != 0 && this.state.planningUnitId != 0 &&
                                            <a href='javascript:;' onClick={this.exportCSV} ><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a>
                                        }
                                        {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportCSV()} />} */}
                                        {/* <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link> */}
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
                                                            //theme="light"
                                                            onChange={this.handleRangeChange}
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
                                                <FormGroup className="col-md-3 ">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label>
                                                    <div className="controls ">
                                                        <Select
                                                            name="planningUnit"
                                                            id="planningUnit"
                                                            bsSize="sm"
                                                            options={this.state.planningUnitList}
                                                            value={this.state.planningUnit}
                                                            onChange={(e) => { this.formSubmit(e, this.state.rangeValue); }}
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
                                                {/* {this.state.consumptionChangedFlag == 1 && <FormGroup check inline>
                                                        <Input className="form-check-input removeMarginLeftCheckbox" type="checkbox" id="showErrors" name="showErrors" value="true" onClick={this.refs.consumptionChild.showOnlyErrors} />
                                                        <Label className="form-check-label" check htmlFor="inline-checkbox1">{i18n.t("static.dataEntry.showOnlyErrors")}</Label>
                                                    </FormGroup>} */}
                                                <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                            </div>
                                        </div>
                                    </Form>
                                )} />

                        <div className="shipmentconsumptionSearchMarginTop" style={{ display: this.state.loading ? "none" : "block" }}>
                            <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="consumptionDataEntry" useLocalData={1} />
                            <div className="table-responsive consumptionDataEntryTable" id="consumptionTableDiv">
                                <div id="consumptionTable" />
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
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dataEntry.batchDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                        <div className="table-responsive">
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
                {/* Consumption modal */}


            </div>
        );
    }

    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
}
