import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import jsPDF from "jspdf";
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import DatePicker from 'react-datepicker';
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js';
import pdfIcon from '../../assets/img/pdf.png';
import moment from 'moment'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { Link } from "react-router-dom";
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
export const PSM_PROCUREMENT_AGENT_ID = 1
export const CANCELLED_SHIPMENT_STATUS = 8

const entityname = i18n.t('static.dashboard.inventoryTurns');
const { ExportCSVButton } = CSVExport;
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
export default class InventoryTurns extends Component {

    constructor(props) {
        super(props);
        this.state = {
            CostOfInventoryInput: {
                programId: '',
                planningUnitIds: [],
                regionIds: [],
                versionId: -1,
                dt: new Date(),
                includePlanningShipments: true
            },
            programs: [],
            planningUnitList: [],
            costOfInventory: [],
            versions: [],
            message: '',
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },

        }
        this.formSubmit = this.formSubmit.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.formatLabel = this.formatLabel.bind(this);

    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }

    getPrograms = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            ProgramService.getProgramByRealmId(realmId)
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );

        } else {
            console.log('offline')
            this.consolidatedProgramList()
        }

    }
    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].programId == programData.programId) {
                                f = 1;
                                console.log('already exist')
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                    }


                }

                this.setState({
                    programs: proList
                })

            }.bind(this);

        }.bind(this);


    }


    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (navigator.onLine) {
                    this.setState({
                        versions: []
                    }, () => {
                        this.setState({
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });


                } else {
                    this.setState({
                        versions: []
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {

                this.setState({
                    versions: []
                })

            }
        } else {
            this.setState({
                versions: []
            })
        }
    }
    consolidatedVersionList = (programId) => {
        const lan = 'en';
        const { versions } = this.state
        var verList = versions;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)

                    }


                }

                console.log(verList)
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })

            }.bind(this);



        }.bind(this)


    }

    dateformatter = value => {
        var dt = new Date(value)
        return moment(dt).format('DD-MMM-YY');
    }
    formatterDouble = value => {

        var cell1 = this.roundN(value)
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    formatter = value => {

        var cell1 = value
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    exportCSV = (columns) => {

        var csvRow = [];

        csvRow.push((i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.report.version') + ' , ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.report.month') + ' , ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [headers]
        this.state.costOfInventory.map(ele => A.push([(getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.totalConsumption, this.roundN(ele.avergeStock), ele.noOfMonths, this.roundN(ele.inventoryTurns)]));

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.inventoryTurns') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    exportPDF = (columns) => {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')

                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.inventoryTurns'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        // var canvas = document.getElementById("cool-canvas");
        //creates image

        // var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        // var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.costOfInventory.map(ele => [getLabelText(ele.planningUnit.label), this.formatter(ele.totalConsumption), this.formatter(ele.avergeStock), this.formatter(ele.noOfMonths), this.formatterDouble(ele.inventoryTurns)]);

        let content = {
            margin: { top: 80 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.inventoryTurns') + ".pdf")
    }

    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        var dt = new Date(`${value.year}-${value.month}-01`)
        costOfInventoryInput.dt = dt
        this.setState({ singleValue2: value, costOfInventoryInput }, () => {
            this.formSubmit();
        })

    }


    dataChange(event) {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        if (event.target.name == "programId") {
            costOfInventoryInput.programId = event.target.value;

        }
        if (event.target.name == "includePlanningShipments") {
            costOfInventoryInput.includePlanningShipments = event.target.value;

        }
        if (event.target.name == "versionId") {
            costOfInventoryInput.versionId = event.target.value;

        }
        this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
    }

    componentDidMount() {
        this.getPrograms()
    }

    getMonthArray = (currentDate) => {
        var month = [];
        var curDate = currentDate.subtract(0, 'months');
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        for (var i = 1; i < 12; i++) {
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        }
        this.setState({
            monthsArray: month
        })
        return month;
    }


    formSubmit() {
        var programId = this.state.CostOfInventoryInput.programId;
        var versionId = this.state.CostOfInventoryInput.versionId
        if (programId != 0 && versionId != -1) {
            if (versionId.includes('Local')) {
                var startDate = new moment(this.state.CostOfInventoryInput.dt).subtract(12, 'months');
                var endDate = new moment(this.state.CostOfInventoryInput.dt);
                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var version = (versionId.split('(')[0]).trim()
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var program = `${programId}_v${version}_uId_${userId}`
                    var programDataOs = programDataTransaction.objectStore('programData');
                    console.log(program)
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        console.log(programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var inventoryList = ((programJson.inventoryList).filter(c => c.active == true && moment(c.inventoryDate).isBetween(startDate, endDate, null, '[]')));
                        var planningUnitIds = new Set(inventoryList.map(ele => ele.planningUnit.id))
                        var data = []
                        var dates = new Set(inventoryList.map(ele => ele.inventoryDate))

                        planningUnitIds.map(planningUnitId => {
                            /*   var openingBalance = 0;
                               var totalConsumption = 0;
                               var totalAdjustments = 0;
                               var totalShipments = 0;
                               var consumptionRemainingList = (programJson.consumptionList).filter(c => moment(c.consumptionDate).isBetween(startDate, endDate, null, '[]') && c.active == true && c.planningUnit.id == planningUnitId);
                               for (var j = 0; j < consumptionRemainingList.length; j++) {
                                   var count = 0;
                                   for (var k = 0; k < consumptionRemainingList.length; k++) {
                                       if (consumptionRemainingList[j].consumptionDate == consumptionRemainingList[k].consumptionDate && consumptionRemainingList[j].region.id == consumptionRemainingList[k].region.id && j != k) {
                                           count++;
                                       } else {
   
                                       }
                                   }
                                   if (count == 0) {
                                       totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                                   } else {
                                       if (consumptionRemainingList[j].actualFlag.toString() == 'true') {
                                           totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                                       }
                                   }
                               }
                               var adjustmentsRemainingList = inventoryList.filter(c => c.planningUnit.id == planningUnitId)
                               for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                                   totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                               }
   
                               
   
                               var shipmentsRemainingList = (programJson.shipmentList).filter(c => moment(c.expectedDeliveryDate).isBetween(startDate, endDate, null, '[]') && c.active == true && c.planningUnit.id == planningUnitId);
                               for (var j = 0; j < shipmentsRemainingList.length; j++) {
                                   totalShipments += parseInt((shipmentsRemainingList[j].shipmentQty));
                               }
                               openingBalance = totalAdjustments - totalConsumption + totalShipments;
                             
                               var dates = new Set(adjustmentsRemainingList.map(ele => ele.inventoryDate))*/



                            var consumptionTotalData = [];
                            var shipmentsTotalData = [];
                            var manualShipmentsTotalData = [];
                            var erpShipmentsTotalData = [];
                            var regionListFiltered = [];
                            var regionId = -1;
                            var amcTotalData = [];

                            var consumptionTotalMonthWise = [];
                            var filteredArray = [];
                            var minStockArray = [];
                            var maxStockArray = [];
                            var minStockMoS = [];
                            var maxStockMoS = [];

                            var inventoryTotalData = [];
                            var suggestedShipmentsTotalData = [];
                            var inventoryTotalMonthWise = [];
                            var filteredArrayInventory = [];
                            var openingBalanceArray = [];
                            var closingBalanceArray = [];

                            var psmShipmentsTotalData = [];
                            var nonPsmShipmentsTotalData = [];
                            var artmisShipmentsTotalData = [];
                            var unmetDemand = [];
                            var unallocatedConsumption = [];
                            var unallocatedAdjustments = [];


                            var TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN = 12
                            var m = this.getMonthArray(startDate)
                            var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                            var consumptionListForlastActualConsumptionDate = consumptionList.filter(c => c.actualFlag == true);
                            var lastActualConsumptionDate = "";
                            for (var lcd = 0; lcd < consumptionListForlastActualConsumptionDate.length; lcd++) {
                                if (lcd == 0) {
                                    lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                                }
                                if (lastActualConsumptionDate < consumptionListForlastActualConsumptionDate[lcd].consumptionDate) {
                                    lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                                }
                            }


                            for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                                var consumptionQty = 0;
                                var consumptionUnaccountedQty = 0;
                                for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                    var c = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate) && c.region.id == regionListFiltered[reg].id);
                                    var filteredJson = { consumptionQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                                    for (var j = 0; j < c.length; j++) {
                                        var count = 0;
                                        for (var k = 0; k < c.length; k++) {
                                            if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                                count++;
                                            } else {

                                            }
                                        }
                                        if (count == 0) {
                                            consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                            // if (this.state.batchNoRequired) {
                                            consumptionUnaccountedQty += parseInt((c[j].consumptionQty));
                                            // }
                                            filteredJson = { month: m[i], region: c[j].region, consumptionQty: c[j].consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                                        } else {
                                            if (c[j].actualFlag.toString() == 'true') {
                                                consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                                // if (this.state.batchNoRequired) {
                                                if (c[j].batchInfoList.length == 0) {
                                                    consumptionUnaccountedQty += parseInt((c[j].consumptionQty));
                                                }
                                                // }
                                                filteredJson = { month: m[i], region: c[j].region, consumptionQty: c[j].consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                                            }
                                        }
                                    }
                                    // Consumption details

                                    filteredArray.push(filteredJson);
                                }
                                var consumptionWithoutRegion = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate));
                              console.log(consumptionWithoutRegion)
                                if (consumptionWithoutRegion.length == 0) {
                                    consumptionTotalData.push("");
                                    unallocatedConsumption.push("");
                                } else {
                                    consumptionTotalData.push(consumptionQty);
                                    unallocatedConsumption.push(consumptionUnaccountedQty);
                                }
                            }

                            console.log("Consumption total data", consumptionTotalData);

                            // Region wise calculations for consumption
                            for (var i = 0; i < regionListFiltered.length; i++) {
                                var regionCount = 0;
                                var f = filteredArray.length
                                for (var j = 0; j < f; j++) {
                                    if (filteredArray[j].region.id == 0) {
                                        filteredArray[j].region.id = regionListFiltered[i].id;
                                    }
                                    if (regionListFiltered[i].id == filteredArray[j].region.id) {
                                        regionCount++;
                                    }
                                }
                                if (regionCount == 0) {
                                    for (var k = 0; k < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; k++) {
                                        filteredArray.push({ consumptionQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                                    }
                                }
                            }
                            for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                                var consumptionListFilteredForMonth = filteredArray.filter(c => c.consumptionQty == '' || c.month.month == m[i].month);
                                var monthWiseCount = 0;
                                for (var cL = 0; cL < consumptionListFilteredForMonth.length; cL++) {
                                    if (consumptionListFilteredForMonth[cL].consumptionQty != '') {
                                        monthWiseCount += parseInt(consumptionListFilteredForMonth[cL].consumptionQty);
                                    }
                                }
                                consumptionTotalMonthWise.push(monthWiseCount);
                            }

                            // Inventory part
                            var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                            if (regionId != -1) {
                                inventoryList = inventoryList.filter(c => c.region.id == regionId)
                            }
                            for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                                var adjustmentQty = 0;
                                var adjustmentUnallocatedQty = 0;
                                for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                    var adjustmentQtyForRegion = 0;
                                    var c = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region.id == regionListFiltered[reg].id);
                                    var filteredJsonInventory = { adjustmentQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                                    for (var j = 0; j < c.length; j++) {
                                        adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                        if (c[j].batchInfoList.length == 0 && c[j].adjustmentQty < 0) {
                                            adjustmentUnallocatedQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                        }
                                        adjustmentQtyForRegion += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                        filteredJsonInventory = { month: m[i], region: c[j].region, adjustmentQty: adjustmentQtyForRegion, inventoryId: c[j].inventoryId, inventoryDate: c[j].inventoryDate };
                                    }
                                    filteredArrayInventory.push(filteredJsonInventory);
                                }
                                var adjustmentsTotalData = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate));
                                if (adjustmentsTotalData.length == 0) {
                                    inventoryTotalData.push("");
                                    unallocatedAdjustments.push("");
                                } else {
                                    inventoryTotalData.push(adjustmentQty);
                                    unallocatedAdjustments.push(adjustmentUnallocatedQty);
                                }
                            }

                            // Region wise calculations for inventory
                            for (var i = 0; i < regionListFiltered.length; i++) {
                                var regionCount = 0;
                                var f = filteredArrayInventory.length
                                for (var j = 0; j < f; j++) {
                                    if (filteredArrayInventory[j].region.id == 0) {
                                        filteredArrayInventory[j].region.id = regionListFiltered[i].id;
                                    }
                                    if (regionListFiltered[i].id == filteredArrayInventory[j].region.id) {
                                        regionCount++;
                                    }
                                }
                                if (regionCount == 0) {
                                    for (var k = 0; k < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; k++) {
                                        filteredArrayInventory.push({ adjustmentQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                                    }
                                }
                            }
                            for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                                var inventoryListFilteredForMonth = filteredArrayInventory.filter(c => c.adjustmentQty == '' || c.month.month == m[i].month);
                                var monthWiseCount = 0;
                                for (var cL = 0; cL < inventoryListFilteredForMonth.length; cL++) {
                                    if (inventoryListFilteredForMonth[cL].adjustmentQty != '') {
                                        monthWiseCount += parseInt(inventoryListFilteredForMonth[cL].adjustmentQty);
                                    }
                                }
                                inventoryTotalMonthWise.push(monthWiseCount);
                            }

                            // Shipments updated part

                            // Shipments part
                            var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                            for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                                var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate))
                                var shipmentTotalQty = 0;

                                var manualShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == false);
                                var manualTotalQty = 0;

                                var deliveredShipmentsQty = 0;
                                var shippedShipmentsQty = 0;
                                var orderedShipmentsQty = 0;
                                var plannedShipmentsQty = 0;

                                var erpShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == true);
                                var erpTotalQty = 0;

                                var deliveredErpShipmentsQty = 0;
                                var shippedErpShipmentsQty = 0;
                                var orderedErpShipmentsQty = 0;
                                var plannedErpShipmentsQty = 0;

                                for (var j = 0; j < shipmentArr.length; j++) {
                                    shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                }
                                shipmentsTotalData.push(shipmentTotalQty);

                                for (var j = 0; j < manualShipmentArr.length; j++) {
                                    manualTotalQty += parseInt((manualShipmentArr[j].shipmentQty));

                                }

                                manualShipmentsTotalData.push(manualTotalQty);


                                for (var j = 0; j < erpShipmentArr.length; j++) {
                                    erpTotalQty += parseInt((erpShipmentArr[j].shipmentQty));

                                }

                                erpShipmentsTotalData.push(erpTotalQty);


                            }

                            // Shipments part
                            var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                            for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                                var psm = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == false && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID)
                                var nonPsm = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.procurementAgent.id != PSM_PROCUREMENT_AGENT_ID)
                                var artmisShipments = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == true)
                                var psmQty = 0;
                                var psmToBeAccounted = 0;
                                var nonPsmQty = 0;
                                var nonPsmToBeAccounted = 0;
                                var artmisQty = 0;
                                var artmisToBeAccounted = 0;
                                var psmEmergencyOrder = 0;
                                var artmisEmergencyOrder = 0;
                                var nonPsmEmergencyOrder = 0;
                                for (var j = 0; j < psm.length; j++) {
                                    psmQty += parseInt((psm[j].shipmentQty));
                                    if (psm[j].accountFlag == 1) {
                                        psmToBeAccounted = 1;
                                    }
                                    if (psm[j].emergencyOrder == 1) {
                                        psmEmergencyOrder = 1;
                                    }
                                }
                                if (psm.length == 0) {
                                    psmShipmentsTotalData.push("");
                                } else {
                                    psmShipmentsTotalData.push({ qty: psmQty, accountFlag: psmToBeAccounted, index: i, month: m[i], isEmergencyOrder: psmEmergencyOrder });
                                }

                                for (var np = 0; np < nonPsm.length; np++) {
                                    nonPsmQty += parseInt((nonPsm[np].shipmentQty));
                                    if (nonPsm[np].accountFlag == 1) {
                                        nonPsmToBeAccounted = 1;
                                    }

                                    if (nonPsm[np].emergencyOrder == 1) {
                                        nonPsmEmergencyOrder = 1;
                                    }
                                }
                                if (nonPsm.length == 0) {
                                    nonPsmShipmentsTotalData.push("");
                                } else {
                                    nonPsmShipmentsTotalData.push({ qty: nonPsmQty, accountFlag: nonPsmToBeAccounted, index: i, month: m[i], isEmergencyOrder: nonPsmEmergencyOrder });
                                }

                                for (var a = 0; a < artmisShipments.length; a++) {
                                    artmisQty += parseInt((artmisShipments[a].shipmentQty));
                                    if (artmisShipments[a].accountFlag == 1) {
                                        artmisToBeAccounted = 1;
                                    }
                                    if (psm[a].emergencyOrder == 1) {
                                        artmisEmergencyOrder = 1;
                                    }
                                }
                                if (artmisShipments.length == 0) {
                                    artmisShipmentsTotalData.push("");
                                } else {
                                    artmisShipmentsTotalData.push({ qty: artmisQty, accountFlag: artmisToBeAccounted, index: i, month: m[i], isEmergencyOrder: artmisEmergencyOrder });
                                }
                            }

                            // Calculation of opening and closing balance
                            var openingBalance = 0;
                            var totalConsumption = 0;
                            var totalAdjustments = 0;
                            var totalShipments = 0;

                            var consumptionRemainingList = consumptionList.filter(c => c.consumptionDate < m[0].startDate);
                            for (var j = 0; j < consumptionRemainingList.length; j++) {
                                var count = 0;
                                for (var k = 0; k < consumptionRemainingList.length; k++) {
                                    if (consumptionRemainingList[j].consumptionDate == consumptionRemainingList[k].consumptionDate && consumptionRemainingList[j].region.id == consumptionRemainingList[k].region.id && j != k) {
                                        count++;
                                    } else {

                                    }
                                }
                                if (count == 0) {
                                    totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                                } else {
                                    if (consumptionRemainingList[j].actualFlag.toString() == 'true') {
                                        totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                                    }
                                }
                            }

                            var adjustmentsRemainingList = inventoryList.filter(c => c.inventoryDate < m[0].startDate);
                            for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                                totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                            }

                            var shipmentsRemainingList = shipmentList.filter(c => c.expectedDeliveryDate < m[0].startDate && c.accountFlag == true);
                            for (var j = 0; j < shipmentsRemainingList.length; j++) {
                                totalShipments += parseInt((shipmentsRemainingList[j].shipmentQty));
                            }
                            openingBalance = totalAdjustments - totalConsumption + totalShipments;
                            openingBalanceArray.push(openingBalance);
                            for (var i = 1; i <= TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {

                                var consumptionQtyForCB = 0;
                                if (consumptionTotalData[i - 1] != "") {
                                    consumptionQtyForCB = consumptionTotalData[i - 1];
                                }
                                var inventoryQtyForCB = 0;
                                if (inventoryTotalData[i - 1] != "") {
                                    inventoryQtyForCB = inventoryTotalData[i - 1];
                                }
                                var psmShipmentQtyForCB = 0;
                                if (psmShipmentsTotalData[i - 1] != "" && psmShipmentsTotalData[i - 1].accountFlag == true) {
                                    psmShipmentQtyForCB = psmShipmentsTotalData[i - 1].qty;
                                }

                                var nonPsmShipmentQtyForCB = 0;
                                if (nonPsmShipmentsTotalData[i - 1] != "" && nonPsmShipmentsTotalData[i - 1].accountFlag == true) {
                                    nonPsmShipmentQtyForCB = nonPsmShipmentsTotalData[i - 1].qty;
                                }

                                var artmisShipmentQtyForCB = 0;
                                if (artmisShipmentsTotalData[i - 1] != "" && artmisShipmentsTotalData[i - 1].accountFlag == true) {
                                    artmisShipmentQtyForCB = artmisShipmentsTotalData[i - 1].qty;
                                }

                                // Suggested shipments part
                                var s = i - 1;
                                var month = m[s].startDate;
                                var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                var compare = (month >= currentMonth);
                                var stockInHand = openingBalanceArray[s] - consumptionQtyForCB + inventoryQtyForCB + psmShipmentQtyForCB + nonPsmShipmentQtyForCB + artmisShipmentQtyForCB;
                                if (compare && parseInt(stockInHand) <= parseInt(minStockArray[s])) {
                                    var suggestedOrd = parseInt(maxStockArray[s] - minStockArray[s]);
                                    if (suggestedOrd == 0) {
                                        var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                            parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                            parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                        var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                        var isEmergencyOrder = 0;
                                        if (expectedDeliveryDate >= currentMonth) {
                                            isEmergencyOrder = 0;
                                        } else {
                                            isEmergencyOrder = 1;
                                        }
                                        suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                                    } else {
                                        var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                            parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                            parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                        var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                        var isEmergencyOrder = 0;
                                        if (expectedDeliveryDate >= currentMonth) {
                                            isEmergencyOrder = 0;
                                        } else {
                                            isEmergencyOrder = 1;
                                        }
                                        suggestedShipmentsTotalData.push({ "suggestedOrderQty": suggestedOrd, "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                                    }
                                } else {
                                    var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                        parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                        parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                                }

                                var suggestedShipmentQtyForCB = 0;
                                if (suggestedShipmentsTotalData[i - 1].suggestedOrderQty != "") {
                                    suggestedShipmentQtyForCB = suggestedShipmentsTotalData[i - 1].suggestedOrderQty;
                                }
                                var closingBalance = openingBalanceArray[i - 1] - consumptionQtyForCB + inventoryQtyForCB + psmShipmentQtyForCB + nonPsmShipmentQtyForCB + artmisShipmentQtyForCB + suggestedShipmentQtyForCB;
                                if (closingBalance >= 0) {
                                    unmetDemand.push("");
                                    closingBalance = closingBalance;

                                } else {
                                    unmetDemand.push(closingBalance);
                                    closingBalance = 0;
                                }
                                closingBalanceArray.push(closingBalance);


                            }



                            var totalClosingBalance = 0;
                            var totalmonthincalculation = 0
console.log(closingBalanceArray)

                            for (var i = 0; i < closingBalanceArray.length; i++) {
                                totalClosingBalance += closingBalanceArray[i]
                                if (closingBalanceArray[i] > 0) {
                                    totalmonthincalculation++;
                                }
                            }



































                            var avergeStock = totalClosingBalance / (totalmonthincalculation)



                            //   var avergeStock = openingBalance / (dates.size)
                            console.log(dates.size)
                            if (dates.size > 0) {
                                var json = {
                                    totalConsumption: totalConsumption,
                                    planningUnit: inventoryList[0].planningUnit,
                                    avergeStock: avergeStock,
                                    noOfMonths: dates.size,
                                    inventoryTurns: this.roundN(totalConsumption / avergeStock)

                                }
                                data.push(json)
                            } else {

                            }

                        })
                        console.log(data)
                        this.setState({
                            costOfInventory: data
                            , message: ''
                        })
                    }.bind(this)
                }.bind(this)
            } else {
                AuthenticationService.setupAxiosInterceptors();
                ReportService.inventoryTurns(this.state.CostOfInventoryInput).then(response => {
                    console.log("costOfInentory=====>", response.data);
                    this.setState({
                        costOfInventory: [{ "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "totalConsumption": 148417, "avergeStock": 23023, "noOfMonths": 7, "inventoryTurns": 6.4462 },
                        { "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "totalConsumption": 36571, "avergeStock": 13812, "noOfMonths": 7, "inventoryTurns": 2.6476 },
                        { "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "totalConsumption": 69755, "avergeStock": 22305, "noOfMonths": 7, "inventoryTurns": 3.1273 },
                        { "planningUnit": { "id": 157, "label": { "active": false, "labelId": 9103, "label_en": "Abacavir 60 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "totalConsumption": 143698, "avergeStock": 23453, "noOfMonths": 7, "inventoryTurns": 6.1269 }], message: ''
                    });
                });
            }
        } else if (this.state.CostOfInventoryInput.programId == 0) {
            this.setState({ costOfInventory: [], message: i18n.t('static.common.selectProgram') });
        } else {
            this.setState({ costOfInventory: [], message: i18n.t('static.program.validversion') });
        }
    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }


    render() {
        const { singleValue2 } = this.state

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
                        {item.versionId}
                    </option>
                )
            }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [

            {
                dataField: 'planningUnit.label',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' },
                formatter: this.formatLabel
            },
            {
                dataField: 'totalConsumption',
                text: i18n.t('static.report.totconsumption'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatter

            },
            {
                dataField: 'avergeStock',
                text: i18n.t('static.report.avergeStock'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatter
            },
            {
                dataField: 'noOfMonths',
                text: i18n.t('static.report.noofmonth'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' },
                formatter: this.formatter
            },
            {
                dataField: 'inventoryTurns',
                text: i18n.t('static.dashboard.inventoryTurns'),
                sort: true,
                align: 'center',
                style: { align: 'center' },
                headerAlign: 'center',
                formatter: this.formatterDouble
            }
        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.costOfInventory.length
            }]
        }
        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.inventoryTurns')}</strong>

                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link>
                            </a>
                            <a className="card-header-action">
                                {this.state.costOfInventory.length > 0 && <div className="card-header-actions">
                                    <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    <img style={{ height: '25px', width: '25px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>}
                            </a>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="TableCust" >
                            <div ref={ref}>

                                <Form >
                                    <Col md="12 pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Program</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.filterVersion(); this.formSubmit() }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Version</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {versionList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="includePlanningShipments"
                                                            id="includePlanningShipments"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">
                                                    <Picker
                                                        ref="pickAMonth2"
                                                        years={{ min: { year: 2010, month: 1 }, max: { year: 2021, month: 12 } }}
                                                        value={singleValue2}
                                                        lang={pickerLang.months}
                                                        theme="dark"
                                                        onChange={this.handleAMonthChange2}
                                                        onDismiss={this.handleAMonthDissmis2}
                                                    >
                                                        <MonthBox value={this.makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                                                    </Picker>
                                                </div>

                                            </FormGroup>
                                        </div>
                                    </Col>
                                </Form>
                            </div>
                        </div>
                        {this.state.costOfInventory.length > 0 && <ToolkitProvider
                            keyField="planningUnitId"
                            data={this.state.costOfInventory}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">

                                        </div>
                                        <BootstrapTable
                                            hover
                                            striped
                                            // tabIndexCell
                                            pagination={paginationFactory(options)}
                                            // rowEvents={{
                                            //     onClick: (e, row, rowIndex) => {
                                            //         // row.startDate = moment(row.startDate).format('YYYY-MM-DD');
                                            //         // row.stopDate = moment(row.stopDate).format('YYYY-MM-DD');
                                            //         // row.startDate = moment(row.startDate);
                                            //         // row.stopDate = moment(row.stopDate);
                                            //         // this.editBudget(row);
                                            //     }
                                            // }}
                                            {...props.baseProps}
                                        />
                                        {/* <h5>*Row is in red color indicates there is no money left or budget hits the end date</h5> */}
                                    </div>
                                )
                            }
                        </ToolkitProvider>}


                    </CardBody>
                </Card>

            </div >

        );
    }

}