import React, { Component } from 'react';
import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService.js";

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import moment from 'moment';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import ReportService from '../../api/ReportService';
const ref = React.createRef();
export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
export const DEFAULT_MAX_MONTHS_OF_STOCK = 18

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}



class StockStatusAcrossPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            programs: [],
            versions: [],
            planningUnits: [],
            data: [],
            lang: localStorage.getItem('lang'),
            loading: false,
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },

        }
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }



    exportCSV = (columns) => {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.month') + ' , ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.report.version') + ' , ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [headers]
        this.state.data.map(ele => A.push([(getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.mos < ele.minMos ? i18n.t('static.report.low') : (ele.mos > ele.maxMos ? i18n.t('static.report.excess') : i18n.t('static.report.ok'))).replaceAll(' ', '%20'), this.roundN(ele.mos), ele.minMos, ele.maxMos, ele.stock, this.round(ele.amc), (ele.lastStockCount).replaceAll(' ', '%20')]));

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".csv"
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
                doc.text(i18n.t('static.dashboard.stockstatusacrossplanningunit'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
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

        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.data.map(ele => [getLabelText(ele.planningUnit.label), (ele.mos < ele.minMos ? i18n.t('static.report.low') : (ele.mos > ele.maxMos ? i18n.t('static.report.excess') : i18n.t('static.report.ok'))), this.formatterDouble(ele.mos), this.formatterDouble(ele.minMos), this.formatterDouble(ele.maxMos), this.formatter(ele.stock), this.formatter(ele.amc), ele.lastStockCount]);

        let content = {
            margin: { top: 80 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 75 },
            columnStyles: {
                0: { cellWidth: 236.89 },
              }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".pdf")
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

    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }
    round = num => {
        return parseFloat(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0)).toFixed(0);
    }

    formatLabel = (cell, row) => {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

    formatterDate = (cell, row) => {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return moment(cell).format('MMM-DD-YYYY');
        }
    }
    formatter = value => {

        var cell1 = this.round(value)
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
    style = (cell, row) => {
        if (cell < row.minMOS) {
            return { align: 'center', color: 'red' }
        }
    }

    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        this.setState({ singleValue2: value, }, () => {
            this.fetchData();
        })

    }

    componentDidMount() {
        this.getPrograms()
    }





    fetchData = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month -1, 1));
        let endDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month - 1, new Date(this.state.singleValue2.year, this.state.singleValue2.month, 0).getDate()));
let includePlanningShipments= document.getElementById("includePlanningShipments").value
        if (programId != 0 && versionId != 0) {
            if (versionId.includes('Local')) {


                var db1;
                getDatabase();
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;

                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var programTransaction = transaction.objectStore('programData');
                    var version = (versionId.split('(')[0]).trim()
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var program = `${programId}_v${version}_uId_${userId}`
                    var data = [];
                    var programRequest = programTransaction.get(program);

                    programRequest.onsuccess = function (event) {
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);

                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        var planningList = []
                        planningunitRequest.onerror = function (event) {
                            // Handle errors!
                        };
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            var programId = (document.getElementById("programId").value).split("_")[0];
                            var proList = []
                            console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId) {

                                    proList[i] = myResult[i]
                                }
                            }
                            proList.map(planningUnit => {
                                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnit.planningUnit.id && c.active == true);
                                var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnit.id);
                                var shipmentList = [];
                                console.log(includePlanningShipments)
                                 if (document.getElementById("includePlanningShipments").value.toString() == 'true') {
                                shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnit.id && c.shipmentStatus.id != 8 && c.accountFlag == true);
                                 } else {
                               shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnit.id && c.shipmentStatus.id != 8 && c.shipmentStatus.id != 1 && c.shipmentStatus.id != 2 && c.shipmentStatus.id != 9 );

                                 }
                                // calculate openingBalance
                                let moments = inventoryList.map(d => moment(d.inventoryDate))
                                let invmin=moment.min(moments)
                                let shipmin = moment.min(shipmentList.map(d => moment(d.expectedDeliveryDate)))
                                let conmin =  moment.min(consumptionList.map(d => moment(d.consumptionDate)))
                                var maxDate = moment.max(moments)
                                var minDate = invmin.isBefore(shipmin)&&invmin.isBefore(conmin)?invmin:shipmin.isBefore(invmin)&& shipmin.isBefore(conmin)?shipmin:conmin

                                var openingBalance = 0;
                                var totalConsumption = 0;
                                var totalAdjustments = 0;
                                var totalShipments = 0;
                                console.log('startDate', startDate)
                                console.log('programJson', programJson)
                                var consumptionRemainingList = consumptionList.filter(c => moment(c.consumptionDate).isBefore(minDate));
                                console.log('consumptionRemainingList', consumptionRemainingList)
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

                                var adjustmentsRemainingList = inventoryList.filter(c => moment(c.inventoryDate).isBefore(minDate));
                                for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                                    totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                                }

                                var shipmentsRemainingList = shipmentList.filter(c => moment(c.expectedDeliveryDate).isBefore(minDate) && c.accountFlag == true);
                                console.log('shipmentsRemainingList', shipmentsRemainingList)
                                for (var j = 0; j < shipmentsRemainingList.length; j++) {
                                    totalShipments += parseInt((shipmentsRemainingList[j].shipmentQty));
                                }
                                openingBalance = totalAdjustments - totalConsumption + totalShipments;
                                var endingBalance = 0
                                for (i = 1; ; i++) {
                                    var dtstr = minDate.startOf('month').format('YYYY-MM-DD')
                                    var enddtStr = minDate.endOf('month').format('YYYY-MM-DD')
                                    console.log(dtstr, ' ', enddtStr)
                                    var dt = dtstr
                                    console.log(openingBalance)
                                    console.log(inventoryList)
                                    var invlist = inventoryList.filter(c => c.inventoryDate === enddtStr)
                                    var adjustment = 0;
                                    invlist.map(ele => adjustment = adjustment + (ele.adjustmentQty * ele.multiplier));
                                    console.log(consumptionList)
                                    var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                                    var consumption = 0;
                                    console.log(programJson.regionList)

                                    var actualFlag = false
                                    for (var i = 0; i < programJson.regionList.length; i++) {

                                        var list = conlist.filter(c => c.region.id == programJson.regionList[i].regionId)
                                        console.log(list)
                                        if (list.length > 1) {
                                            for (var l = 0; l < list.length; l++) {
                                                if (list[l].actualFlag.toString() == 'true') {
                                                    actualFlag = true;
                                                    consumption = consumption + list[l].consumptionQty
                                                }
                                            }
                                        } else {
                                            consumption = list.length == 0 ? consumption : consumption = consumption + parseInt(list[0].consumptionQty)
                                        }
                                    }


                                    console.log(shipmentList)
                                    var shiplist = shipmentList.filter(c => c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr)
                                    var shipment = 0;
                                    shiplist.map(ele => shipment = shipment + ele.shipmentQty);

                                    console.log('openingBalance', openingBalance, 'adjustment', adjustment, ' shipment', shipment, ' consumption', consumption)
                                    var endingBalance = openingBalance + adjustment + shipment - consumption
                                    console.log('endingBalance', endingBalance)

                                    endingBalance = endingBalance < 0 ? 0 : endingBalance
                                    openingBalance = endingBalance
                                    minDate=minDate.add(1,'month')
                                    
                                   if(minDate.startOf('month').isAfter(startDate)){
                                       break;
                                   }
                                }
                                var amcBeforeArray = [];
                                var amcAfterArray = [];


                                for (var c = 0; c < programJson.monthsInPastForAmc; c++) {

                                    var month1MonthsBefore = moment(dt).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                    var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate == month1MonthsBefore);
                                    if (consumptionListForAMC.length > 0) {
                                        var consumptionQty = 0;
                                        for (var j = 0; j < consumptionListForAMC.length; j++) {
                                            var count = 0;
                                            for (var k = 0; k < consumptionListForAMC.length; k++) {
                                                if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                                    count++;
                                                } else {

                                                }
                                            }

                                            if (count == 0) {
                                                consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                            } else {
                                                if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                                }
                                            }
                                        }
                                        amcBeforeArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                        var amcArrayForMonth = amcBeforeArray.filter(c => c.month == dtstr);
                                        /*if (amcArrayForMonth.length == programJson.monthsInPastForAmc) {
                                            c = 12;
                                        }*/
                                    }
                                }
                                for (var c = 0; c < programJson.monthsInFutureForAmc; c++) {
                                    var month1MonthsAfter = moment(dt).add(c, 'months').format("YYYY-MM-DD");
                                    var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate == month1MonthsAfter);
                                    if (consumptionListForAMC.length > 0) {
                                        var consumptionQty = 0;
                                        for (var j = 0; j < consumptionListForAMC.length; j++) {
                                            var count = 0;
                                            for (var k = 0; k < consumptionListForAMC.length; k++) {
                                                if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                                    count++;
                                                } else {

                                                }
                                            }

                                            if (count == 0) {
                                                consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                            } else {
                                                if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                                }
                                            }
                                        }
                                        amcAfterArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                        amcArrayForMonth = amcAfterArray.filter(c => c.month == dtstr);
                                       /* if (amcArrayForMonth.length == programJson.monthsInFutureForAmc) {
                                            c = 12;
                                        }*/
                                    }

                                }

                                var amcArray = amcBeforeArray.concat(amcAfterArray);
                                var amcArrayFilteredForMonth = amcArray.filter(c => dtstr == c.month);
                                console.log('amcArrayFilteredForMonth'+JSON.stringify(amcArrayFilteredForMonth))
                                var countAMC = amcArrayFilteredForMonth.length;
                                var sumOfConsumptions = 0;
                                for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                    sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                }


                                var amcCalcualted = Math.round((sumOfConsumptions) / countAMC);
                                console.log('amcCalcualted', amcCalcualted)
                                var mos = endingBalance < 0 ? 0 / amcCalcualted : endingBalance / amcCalcualted
                                console.log(planningUnit)
                                var maxForMonths = 0;
                                if (DEFAULT_MIN_MONTHS_OF_STOCK > planningUnit.minMonthsOfStock) {
                                    maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                } else {
                                    maxForMonths = planningUnit.minMonthsOfStock
                                }
                                var minMOS = maxForMonths;
                                var minForMonths = 0;
                                if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + planningUnit.reorderFrequencyInMonths)) {
                                    minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                } else {
                                    minForMonths = (maxForMonths + planningUnit.reorderFrequencyInMonths);
                                }
                                var maxMOS = minForMonths;

                                var json = {
                                    planningUnit: planningUnit.planningUnit,
                                    lastStockCount: maxDate.format('MMM-DD-YYYY'),
                                    mos: this.roundN(mos),//planningUnit.planningUnit.id==157?12:planningUnit.planningUnit.id==156?6:mos),
                                    minMos: minMOS,
                                    maxMos: maxMOS,
                                    stock: endingBalance,
                                    amc: amcCalcualted
                                }
                                data.push(json)



                            })
                            this.setState({
                                data: data,
                                message: ''
                            },()=>{console.log(this.state.data)})
                        }.bind(this)

                    }.bind(this)
                }.bind(this)















            } else {
                var inputjson = {
                    "programId": programId,
                    "versionId": versionId,
                    "dt": startDate.startOf('month').format('YYYY-MM-DD'),
                    "includePlannedShipments":includePlanningShipments?1:0

                }
              /*  this.setState({
                    data: [{
                        planningUnit: {
                            id: 157, label: {
                                active: false,
                                labelId: 9117,
                                label_en: "Abacavir 60 mg Tablet, 60 Tablets",
                                label_sp: null,
                                label_fr: null,
                                label_pr: null
                            }
                        },
                        transDate: moment(new Date()).format('MMM-DD-YYYY'),
                        mos: this.roundN(2),//planningUnit.planningUnit.id==157?12:planningUnit.planningUnit.id==156?6:mos),
                        min: 3,
                        max: 5,
                        stock: 44103,
                        amc: 23957
                    }]
                })*/
                  AuthenticationService.setupAxiosInterceptors();
                  ReportService.stockStatusForProgram(inputjson)
                    .then(response => {
                      console.log(JSON.stringify(response.data));
                      this.setState({
                        data: response.data,message:''
                      })
                    }).catch(
                      error => {
                        this.setState({
                            data: []
                        })
            
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
            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [] });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] });

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
                style: { align: 'center', width: '350px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'mos',
                text: i18n.t('static.report.withinstock'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell < row.minMos) {
                        return i18n.t('static.report.low')
                    } else if (cell > row.maxMos) {
                        return i18n.t('static.report.excess')
                    } else {
                        return i18n.t('static.report.ok')
                    }
                }
                ,
                style: function callback(cell, row, rowIndex, colIndex) {
                    if (cell < row.minMos) {
                        return { backgroundColor: '#f48282', align: 'center', width: '100px' };
                    } else if (cell > row.maxMos) {
                        return { backgroundColor: '#f3d679', align: 'center', width: '100px' };
                    } else {
                        return { backgroundColor: '#00c596', align: 'center', width: '100px' };
                    }
                }
            },
            {
                dataField: 'mos',
                text: i18n.t('static.report.mos'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatterDouble,
                style: function callback(cell, row, rowIndex, colIndex) {
                    if (cell < row.minMos) {
                        return { backgroundColor: '#f48282', align: 'center', width: '100px' };
                    } else if (cell > row.maxMos) {
                        return { backgroundColor: '#f3d679', align: 'center', width: '100px' };
                    } else {
                        return { backgroundColor: '#00c596', align: 'center', width: '100px' };
                    }
                }
            },
            {
                dataField: 'minMos',
                text: i18n.t('static.supplyPlan.minStockMos'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatterDouble


            },
            {
                dataField: 'maxMos',
                text: i18n.t('static.supplyPlan.maxStockMos'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatterDouble
            }
            ,
            {
                dataField: 'stock',
                text: i18n.t('static.report.stock'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatter
            }
            ,
            {
                dataField: 'amc',
                text: i18n.t('static.report.amc'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatter
            },
            {
                dataField: 'lastStockCount',
                text: i18n.t('static.supplyPlan.lastinventorydt'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatterDate

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
                text: 'All', value: this.state.data.length
            }]
        }
        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusacrossplanningunit')}</strong>

                        <div className="card-header-actions">

                            <a className="card-header-action">
                                {this.state.data.length > 0 && <div className="card-header-actions">
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

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Program</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.filterVersion(); this.fetchData() }}
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
                                                            onChange={(e) => { this.fetchData() }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
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
                                                            onChange={(e) => {  this.fetchData() }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                        </div>
                                    </Col>
                                </Form>
                            </div>
                        </div>
                        {this.state.data.length > 0 && <ToolkitProvider
                            keyField="planningUnitId"
                            data={this.state.data}
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

                                            {...props.baseProps}
                                        />
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

export default StockStatusAcrossPlanningUnits;