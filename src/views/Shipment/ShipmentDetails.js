import React from "react";
import {
    Card, CardBody,
    Label, FormGroup,
    CardFooter, Button, Col, Form, Modal, ModalHeader, ModalFooter, ModalBody, Input
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DELIVERED_SHIPMENT_STATUS, CANCELLED_SHIPMENT_STATUS, API_URL, polling } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ShipmentsInSupplyPlanComponent from "../SupplyPlan/ShipmentsInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import moment from "moment"
import { Online } from "react-detect-offline";
import { Prompt } from 'react-router'
import { isSiteOnline } from "../../CommonComponent/JavascriptCommonFunctions.js";
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

const entityname = i18n.t('static.dashboard.shipmentdetails');

export default class ShipmentDetails extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        var startDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD")
        this.state = {
            loading: true,
            message: '',
            lang: localStorage.getItem("lang"),
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            productCategoryId: '',
            shipmentsEl: '',
            timeout: 0,
            showShipments: 0,
            shipmentChangedFlag: 0,
            shipmentModalTitle: "",
            shipmentType: localStorage.getItem("sesShipmentType") != "" ? JSON.parse(localStorage.getItem("sesShipmentType")) : [{ value: 1, label: i18n.t('static.shipment.manualShipments') }, { value: 2, label: i18n.t('static.shipment.erpShipment') }],
            shipmentTypeIds: localStorage.getItem("sesShipmentType") != "" ? [...new Set(JSON.parse(localStorage.getItem("sesShipmentType")).map(ele => ele.value))] : [1, 2],
            rangeValue: localStorage.getItem("sesRangeValue") != "" ? JSON.parse(localStorage.getItem("sesRangeValue")) : { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            programId: "",
            planningUnitId: "",
            currencyList: [],
            dataSourceList: [],
            fundingSourceList: [],
            procurementAgentList: [],
            budgetList: [],
            shipmentStatusList: [],
            showBatchSaveButton: false,
            programQPLDetails: []
        }
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.updateState = this.updateState.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.hideFourthComponent = this.hideFourthComponent.bind(this);
        this.hideFifthComponent = this.hideFifthComponent.bind(this);
        this.updateDataType = this.updateDataType.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
        this.openBatchPopUp = this.openBatchPopUp.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
    }


    exportCSV() {

        //Create workbook and worksheet
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(i18n.t('static.supplyplan.shipmentDataEntry'));

        //Add Header Row

        worksheet.columns = [
            { header: i18n.t('static.common.active'), key: 'string', width: 25 },
            { header: i18n.t('static.report.id'), key: 'name', width: 25 },
            { header: i18n.t('static.dataEntry.planningUnitId'), key: 'name', width: 25 },
            { header: i18n.t('static.shipmentDataEntry.shipmentStatus'), key: 'name', width: 25 },
            { header: i18n.t('static.common.receivedate'), key: 'string', width: 25, style: { numFmt: 'YYYY-MM-DD' } },
            { header: i18n.t('static.supplyPlan.shipmentMode'), key: 'name', width: 40 },
            { header: i18n.t('static.procurementagent.procurementagent'), key: 'name', width: 40 },
            { header: i18n.t('static.shipmentDataEntry.localProcurement'), key: 'name', width: 32 },
            { header: i18n.t('static.shipmentDataentry.procurementAgentOrderNo'), key: 'name', width: 32 },
            { header: i18n.t('static.shipmentDataentry.procurementAgentPrimeLineNo'), key: 'name', width: 12 },
            { header: i18n.t('static.supplyPlan.adjustesOrderQty'), key: 'name', width: 12 },
            { header: i18n.t('static.supplyPlan.emergencyOrder'), key: 'name', width: 25 },
            { header: i18n.t('static.subfundingsource.fundingsource'), key: 'string', width: 25 },

            { header: i18n.t('static.dashboard.budget'), key: 'string', width: 25 },
            { header: i18n.t('static.dashboard.currency'), key: 'string', width: 25 },
            { header: i18n.t('static.supplyPlan.pricePerPlanningUnit'), key: 'string', width: 25 },
            { header: i18n.t('static.shipment.productcost'), key: 'string', width: 25 },
            { header: i18n.t('static.shipment.freightcost'), key: 'string', width: 25 },
            { header: i18n.t('static.shipment.totalCost'), key: 'string', width: 25 },

            { header: i18n.t('static.datasource.datasource'), key: 'string', width: 25 },
            { header: i18n.t('static.program.notes'), key: 'string', width: 25 },


        ];

        //Header Color
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


        // let activeDropdown = [i18n.t('static.dataEntry.True'), i18n.t('static.dataEntry.False')];
        let activeDropdown = ["True", "False"];
        worksheet.dataValidations.add('A2:A100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${activeDropdown.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        // worksheet.dataValidations.add('E2:E100', {
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
            worksheet.getCell('E' + (+i + 2)).note = i18n.t('static.dataEntry.dateValidation');
        }

        let shipmentModeDropdown = [i18n.t('static.supplyPlan.sea'), i18n.t('static.supplyPlan.air')];
        worksheet.dataValidations.add('F2:F100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${shipmentModeDropdown.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        // let isLocalProcurementAgentDropdown = [i18n.t('static.dataEntry.True'), i18n.t('static.dataEntry.False')];
        let isLocalProcurementAgentDropdown = ["True", "False"];
        worksheet.dataValidations.add('H2:H100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${isLocalProcurementAgentDropdown.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        // let emergencyShipmentDropdown = [i18n.t('static.dataEntry.True'), i18n.t('static.dataEntry.False')];
        let emergencyShipmentDropdown = ["True", "False"];
        worksheet.dataValidations.add('L2:L100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${emergencyShipmentDropdown.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        let dataSourceVar = [];
        let datasourceList = this.state.dataSourceList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });

        for (let i = 0; i < datasourceList.length; i++) {
            dataSourceVar.push(datasourceList[i].name);
        }

        worksheet.dataValidations.add('T2:T100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${dataSourceVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });

        //currency

        let currencyVar = [];
        let currencyList = this.state.currencyList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < currencyList.length; i++) {
            currencyVar.push(currencyList[i].name);
        }

        worksheet.dataValidations.add('O2:O100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${currencyVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });


        let fundingSourceVar = [];
        let fundingSourceList = this.state.fundingSourceList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < fundingSourceList.length; i++) {
            fundingSourceVar.push(fundingSourceList[i].name);
        }

        worksheet.dataValidations.add('M2:M100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${fundingSourceVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });


        let procurementAgentVar = [];
        let procurementAgentList = this.state.procurementAgentList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < procurementAgentList.length; i++) {
            procurementAgentVar.push(procurementAgentList[i].name);
        }

        worksheet.dataValidations.add('G2:G100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${procurementAgentVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });


        let budgetVar = [];
        let budgetList = this.state.budgetList.slice(1).filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < budgetList.length; i++) {
            budgetVar.push(budgetList[i].name);
        }

        worksheet.dataValidations.add('N2:N100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${budgetVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });


        let shipmentStatusVar = [];
        let shipmentStatusList = this.state.shipmentStatusList.filter(c => c.active.toString() == "true");
        for (let i = 0; i < shipmentStatusList.length; i++) {
            shipmentStatusVar.push(shipmentStatusList[i].name);
        }

        worksheet.dataValidations.add('D2:D100', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${shipmentStatusVar.join(",")}"`],
            showErrorMessage: true,
            // errorStyle: 'error',
            // error: 'Invalid value',
        });



        //Validations

        worksheet.dataValidations.add('K2:K100', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1],
            // errorStyle: 'error',
            // errorTitle: 'Invalid Value',
            // error: 'Invalid Value'
        });

        worksheet.dataValidations.add('P2:P100', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1],
            // errorStyle: 'error',
            // errorTitle: 'Invalid Value',
            // error: 'Invalid Value'
        });

        worksheet.dataValidations.add('R2:R100', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1],
            // errorStyle: 'error',
            // errorTitle: 'Invalid Value',
            // error: 'Invalid Value'
        });

        //Locked gray color fill

        for (let i = 0; i < 100; i++) {
            worksheet.getCell('B' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('C' + (+i + 2)).fill = {
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
            worksheet.getCell('Q' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('S' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
        }

        //Protection

        worksheet.protect();
        worksheet.getColumn('A').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
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
        worksheet.getColumn('H').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('I').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('K').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('L').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        worksheet.getColumn('M').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        worksheet.getColumn('N').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        worksheet.getColumn('O').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        worksheet.getColumn('P').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        worksheet.getColumn('R').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        worksheet.getColumn('T').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        worksheet.getColumn('U').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });

        // Generate Excel File with given name

        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, i18n.t('static.supplyplan.shipmentDataEntry') + '.xlsx');
        })

    }


    show() {
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ rangeValue: value, shipmentChangedFlag: 0 })
            localStorage.setItem("sesRangeValue", JSON.stringify(value));
            this.formSubmit(this.state.planningUnit, value);
        }
    }

    updateDataType(value) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            var shipmentTypeIds = value.map(ele => ele.value)
            this.setState({
                shipmentType: value,
                shipmentChangedFlag: 0,
                shipmentTypeIds: shipmentTypeIds
            }, () => {
                localStorage.setItem("sesShipmentType", JSON.stringify(value));
                document.getElementById("shipmentsDetailsTableDiv").style.display = "none";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
                if (this.state.planningUnit != 0 && (value != "" && value != undefined ? value.value : 0) != 0) {
                    this.formSubmit(this.state.planningUnit, this.state.rangeValue);
                }
            })
        }
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }

    hideFourthComponent() {
        document.getElementById('div4').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div4').style.display = 'none';
        }, 30000);
    }

    hideFifthComponent() {
        document.getElementById('div5').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div5').style.display = 'none';
        }, 30000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

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
                    }),
                    loading: false,
                    programQPLDetails: getRequest.result
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

    getPlanningUnitList(value) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            document.getElementById("planningUnitId").value = 0;
            document.getElementById("planningUnit").value = "";
            document.getElementById("shipmentsDetailsTableDiv").style.display = "none";
            if (document.getElementById("addRowButtonId") != null) {
                document.getElementById("addRowButtonId").style.display = "none";
            }
            this.setState({
                programSelect: value,
                programId: value != "" && value != undefined ? value != "" && value != undefined ? value.value : 0 : 0,
                planningUnit: "",
                planningUnitId: "",
                loading: true,
                shipmentChangedFlag: 0
            })
            var programId = value != "" && value != undefined ? value.value : 0;
            if (programId != 0) {
                localStorage.setItem("sesProgramId", programId);
                var db1;
                var storeOS;
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
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
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
                            loading: false
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
            } else {
                this.setState({
                    loading: false,
                    planningUnitList: []
                })
            }
        }
    }

    formSubmit(value, rangeValue) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
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
            this.setState({ loading: true, shipmentChangedFlag: 0 })
            var programId = document.getElementById('programId').value;
            this.setState({ programId: programId, planningUnitId: value != "" && value != undefined ? value.value : 0, planningUnit: value });
            var planningUnitId = value != "" && value != undefined ? value.value : 0;
            var programId = document.getElementById("programId").value;
            if (planningUnitId != 0) {
                localStorage.setItem("sesPlanningUnitId", planningUnitId);
                document.getElementById("shipmentsDetailsTableDiv").style.display = "block";
                if (document.getElementById("addRowButtonId") != null) {
                    if ((this.state.shipmentTypeIds).includes(1)) {
                        document.getElementById("addRowButtonId").style.display = "block";
                        var roleList = AuthenticationService.getLoggedInUserRole();
                        if ((roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') || this.state.programQPLDetails.filter(c => c.id == this.state.programId)[0].readonly) {
                            document.getElementById("addRowButtonId").style.display = "none";
                        }
                    } else {
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
                        var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitId);
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

                        var generalProgramDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                        var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                        var generalProgramJson = JSON.parse(generalProgramData);

                        var programPlanningUnit = ((this.state.planningUnitListAll).filter(p => p.planningUnit.id == planningUnitId))[0];
                        var shipmentListUnFiltered = programJson.shipmentList;
                        this.setState({
                            shipmentListUnFiltered: shipmentListUnFiltered
                        })
                        var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == (value != "" && value != undefined ? value.value : 0) && c.active.toString() == "true");
                        if (this.state.shipmentTypeIds.length == 1 && (this.state.shipmentTypeIds).includes(1)) {
                            shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "false");
                        } else if (this.state.shipmentTypeIds.length == 1 && (this.state.shipmentTypeIds).includes(2)) {
                            shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "true");
                        }
                        shipmentList = shipmentList.filter(c => c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? moment(c.receivedDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.receivedDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD") : moment(c.expectedDeliveryDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.expectedDeliveryDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"))
                        this.setState({
                            shelfLife: programPlanningUnit.shelfLife,
                            catalogPrice: programPlanningUnit.catalogPrice,
                            programJson: programJson,
                            generalProgramJson: generalProgramJson,
                            shipmentListUnFiltered: shipmentListUnFiltered,
                            shipmentList: shipmentList,
                            showShipments: 1,
                            programPlanningUnitForPrice: programPlanningUnit
                        })
                        this.refs.shipmentChild.showShipmentData();
                    }.bind(this)
                }.bind(this)
            } else {
                document.getElementById("shipmentsDetailsTableDiv").style.display = "none";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
                this.setState({ loading: false });
            }
        }
    }

    cancelClicked() {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
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
                shipmentChangedFlag: 0,
                shipmentBatchInfoChangedFlag: 0,
                shipmentQtyChangedFlag: 0,
                shipmentDatesChangedFlag: 0
            }, () => {
                let id = AuthenticationService.displayDashboardBasedOnRole();
                this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
            })
        }
    }

    toggleLarge(method) {
        var cont = false;
        if (method != "submit" && (this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1)) {
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
                shipmentBatchInfoChangedFlag: 0,
                shipmentDatesChangedFlag: 0,
                shipmentQtyChangedFlag: 0,
                shipmentBatchInfoDuplicateError: '',
                shipmentValidationBatchError: '',
                qtyCalculatorValidationError: "",
                shipmentDatesError: "",

            })
            this.setState({
                batchInfo: !this.state.batchInfo,
            });
        }
    }

    openBatchPopUp() {
        this.setState({
            batchInfo: true,
        });
    }

    actionCanceled() {
        var cont = false;
        if (this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1) {
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
                color: '#BA0C2F',
                shipmentQtyChangedFlag: 0,
                shipmentBatchInfoChangedFlag: 0,
                shipmentDatesChangedFlag: 0
            }, () => {
                this.hideFirstComponent()
                this.toggleLarge();
            })
        }
    }

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })

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
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <h5 className="red" id="div2">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError}</h5>
                <Card>
                    {checkOnline === 'Online' &&
                        <div className="Card-header-addicon problemListMarginTop">
                            <div className="card-header-actions">
                                <div className="card-header-action">
                                    <a className="card-header-action">
                                        {this.state.programId != 0 && this.state.planningUnitId != 0 &&
                                            <a href='javascript:;' onClick={this.exportCSV} ><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a>
                                        }
                                        {/* <a href={`${API_URL}/file/shipmentDataEntryTemplate`}><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a> */}
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
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.shipmentType')}</Label>
                                                    <div className="controls ">
                                                        <Select
                                                            name="shipmentType"
                                                            id="shipmentType"
                                                            bsSize="sm"
                                                            multi
                                                            options={[{ value: 1, label: i18n.t('static.shipment.manualShipments') }, { value: 2, label: i18n.t('static.shipment.erpShipment') }]}
                                                            value={this.state.shipmentType}
                                                            onChange={(e) => { this.updateDataType(e); }}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                {/* {this.state.shipmentChangedFlag == 1 && <FormGroup check inline>
                                                        <Input className="form-check-input removeMarginLeftCheckbox" type="checkbox" id="showErrors" name="showErrors" value="true" onClick={this.refs.shipmentChild.showOnlyErrors} />
                                                        <Label className="form-check-label" check htmlFor="inline-checkbox1">{i18n.t("static.dataEntry.showOnlyErrors")}</Label>
                                                    </FormGroup>} */}
                                                <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                            </div>
                                        </div>
                                    </Form>
                                )} />
                        {(this.state.programQPLDetails.filter(c => c.id == this.state.programId)).length > 0 && (this.state.programQPLDetails.filter(c => c.id == this.state.programId))[0].readonly == 1 && <h5 style={{ color: 'red' }}>{i18n.t('static.dataentry.readonly')}</h5>}
                        <div className="col-md-10 pb-3">
                            <ul className="legendcommitversion">
                                <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                                <li><span className=" greylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.doNotIncludeInProjectedShipment')} </span></li>
                            </ul>
                        </div>

                        <div className="shipmentconsumptionSearchMarginTop" >
                            <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} updateState={this.updateState} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} hideFourthComponent={this.hideFourthComponent} hideFifthComponent={this.hideFifthComponent} shipmentPage="shipmentDataEntry" useLocalData={1} openBatchPopUp={this.openBatchPopUp} />
                            <div className="shipmentDataEntryTable" id="shipmentsDetailsTableDiv">
                                <div id="shipmentsDetailsTable" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }}/>
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
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipments()}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}&nbsp;
                            {this.refs.shipmentChild != undefined && <Button id="addRowButtonId" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.shipmentChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>

                <Modal isOpen={this.state.batchInfo}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                        <strong>{this.state.shipmentModalTitle}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3">{this.state.qtyCalculatorValidationError}</h6>
                        <div className="table-responsive RemoveStriped">
                            <div id="qtyCalculatorTable"></div>
                        </div>

                        <div className="table-responsive RemoveStriped">
                            <div id="qtyCalculatorTable1"></div>
                        </div>
                        <h6 className="red" id="div4">{this.state.shipmentDatesError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentDatesTable"></div>
                        </div>
                        <h6 className="red" id="div5">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight"></div>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }} className="mr-0">
                            <Button id="shipmentDetailsPopCancelButton" size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.showBatchSaveButton && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            {this.refs.shipmentChild != undefined && <Button color="info" id="addShipmentBatchRowId" size="md" className="float-right mr-1" type="button" onClick={this.refs.shipmentChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                        </div>
                        <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }} className="mr-0">
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                        </div>
                        <div id="showSaveQtyButtonDiv" style={{ display: 'none' }} className="mr-0">
                            <Button size="md" color="danger" className="submitBtn float-right mr-2" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                        </div>
                    </ModalFooter>
                </Modal>
                {/* Shipments modal */}

            </div>
        );
    }

    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
}