import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BudgetServcie from '../../api/BudgetService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';
import { Bar, HorizontalBar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import ProgramService from '../../api/ProgramService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import FundingSourceService from '../../api/FundingSourceService';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

import MultiSelect from 'react-multi-select-component';

import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'

import CryptoJS from 'crypto-js'
import { SECRET_KEY, DATE_FORMAT_CAP, INDEXED_DB_VERSION, INDEXED_DB_NAME, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ReportService from '../../api/ReportService';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const entityname = i18n.t('static.dashboard.budget');
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const chartoptions =
{
    title: {
        display: true,
        text: i18n.t('static.dashboard.budget')
    },
    scales: {

        yAxes: [{
            id: 'A',
            position: 'left',
            scaleLabel: {
                display: true,
                fontSize: "12",
                fontColor: 'blue'
            },
            ticks: {
                beginAtZero: true,
                fontColor: 'blue'
            },

        }],
        xAxes: [{
            scaleLabel: {
                display: true,
                // labelString: i18n.t('static.supplyPlan.amountInUSD') + '' + i18n.t('static.report.inmillions'),
                labelString: i18n.t('static.supplyPlan.amountInUSD'),
                // + '' + i18n.t('static.report.inmillions'),
                fontColor: 'black',
                fontStyle: "normal",
                fontSize: "12"
            },
            ticks: {
                fontColor: 'black',
                callback: function (value) {
                    // var cell1 = value
                    // cell1 += '';
                    // var x = cell1.split('.');
                    // var x1 = x[0];
                    // var x2 = x.length > 1 ? '.' + x[1] : '';
                    // var rgx = /(\d+)(\d{3})/;
                    // while (rgx.test(x1)) {
                    //     x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    // }
                    // return x1 + x2;
                    if (value != null) {
                        return Math.floor(value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                    }


                }
            }
        }]
    },

    tooltips: {
        mode: 'index',
        intersect: false,
        enabled: false,
        custom: CustomTooltips,
        callbacks: {
            label: function (tooltipItem, data) {

                let label = data.labels[tooltipItem.index];
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                // var cell1 = value
                // cell1 += '';
                // var x = cell1.split('.');
                // var x1 = x[0];
                // var x2 = x.length > 1 ? '.' + x[1] : '';
                // var rgx = /(\d+)(\d{3})/;
                // while (rgx.test(x1)) {
                //     x1 = x1.replace(rgx, '$1' + ',' + '$2');
                // }
                // return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                return data.datasets[tooltipItem.datasetIndex].label + ' : ' + Math.floor(value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
            }
        }
    },
    hover: {
        mode: 'index',
        intersect: false
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}


class Budgets extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            budgetList: [],
            lang: localStorage.getItem('lang'),
            message: '',
            selBudget: [],
            programValues: [],
            programLabels: [],
            programs: [],
            versions: [],
            show: false,
            loading: true,
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            fundingSourceValues: [],
            fundingSourceLabels: [],
            fundingSources: [],
            programId: ''
        }


        this.formatDate = this.formatDate.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.addCommas = this.addCommas.bind(this);
        this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);

        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
    }
    show() {

    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.filterData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    getFundingSource = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        fundingSources: response.data, loading: false
                    }, () => { this.consolidatedFundingSourceList() })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: [], loading: false
                        }, () => { this.consolidatedFundingSourceList() })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message, loading: false });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError', loading: false });
                                    break;
                            }
                        }
                    }
                );

        } else {
            console.log('offline')
            this.consolidatedFundingSourceList()
            this.setState({ loading: false })
        }

    }

    consolidatedFundingSourceList = () => {
        const lan = 'en';
        const { fundingSources } = this.state
        var proList = fundingSources;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['fundingSource'], 'readwrite');
            var fundingSource = transaction.objectStore('fundingSource');
            var getRequest = fundingSource.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {

                    var f = 0
                    for (var k = 0; k < this.state.fundingSources.length; k++) {
                        if (this.state.fundingSources[k].fundingSourceId == myResult[i].fundingSourceId) {
                            f = 1;
                            console.log('already exist')
                        }
                    }
                    var programData = myResult[i];
                    if (f == 0) {
                        proList.push(programData)
                    }

                }

                this.setState({
                    fundingSources: proList.sort(function (a, b) {
                        a = a.fundingSourceCode.toLowerCase();
                        b = b.fundingSourceCode.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                })

            }.bind(this);

        }.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    handleFundingSourceChange = (fundingSourceIds) => {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label)
        }, () => {

            this.filterData()
        })
    }

    hideFirstComponent() {
        setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV = (columns) => {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        this.state.fundingSourceLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))

        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [this.addDoubleQuoteToRowContent(headers)]
        // this.state.selBudget.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.budget.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), "\'" + ((ele.budget.code.replaceAll(',', ' ')).replaceAll(' ', '%20')) + "\'", (ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.currency.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), this.roundN(ele.budgetAmt), this.roundN(ele.plannedBudgetAmt), this.roundN(ele.orderedBudgetAmt), this.roundN((ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt))), this.formatDate(ele.startDate), this.formatDate(ele.stopDate)])));
        this.state.selBudget.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.budget.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), "\'" + ((ele.budget.code.replaceAll(',', ' ')).replaceAll(' ', '%20')) + "\'", (ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.currency.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), Math.floor(ele.budgetAmt), Math.floor(ele.plannedBudgetAmt), Math.floor(ele.orderedBudgetAmt), Math.floor((ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt))), this.formatDate(ele.startDate), this.formatDate(ele.stopDate)])));

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.budgetheader') + ".csv"
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
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
                doc.text(i18n.t('static.dashboard.budgetheader'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 150, fundingSourceText)

                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);

        doc.addImage(canvasImg, 'png', 50, 200, 750, 260, 'CANVAS');

        const headers = columns.map((item, idx) => (item.text));
        // const data = this.state.selBudget.map(ele => [getLabelText(ele.budget.label), ele.budget.code, ele.fundingSource.code, getLabelText(ele.currency.label), this.formatter(this.roundN(ele.budgetAmt)), this.formatter(this.roundN(ele.plannedBudgetAmt)), this.formatter(this.roundN(ele.orderedBudgetAmt)), this.formatter(this.roundN(ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt))), this.formatDate(ele.startDate), this.formatDate(ele.stopDate)]);
        const data = this.state.selBudget.map(ele => [getLabelText(ele.budget.label), ele.budget.code, ele.fundingSource.code, getLabelText(ele.currency.label), this.formatterValue(ele.budgetAmt), this.formatterValue(ele.plannedBudgetAmt), this.formatterValue(ele.orderedBudgetAmt), this.formatterValue(ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt)), this.formatDate(ele.startDate), this.formatDate(ele.stopDate)]);

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: height,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 60 },
            columnStyles: {
                0: { cellWidth: 90 },
                2: { cellWidth: 73.5 },
                4: { cellWidth: 73.5 },
                5: { cellWidth: 90 },
                6: { cellWidth: 90 },
                7: { cellWidth: 90 },
            }

        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.budgetheader') + ".pdf")
    }



    filterData() {
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        let programId = document.getElementById('programId').value
        let versionId = document.getElementById('versionId').value
        let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());

        // console.log('programIds.length', programIds.length)
        if (programId.length != 0 && versionId != 0 && this.state.fundingSourceValues.length > 0) {
            localStorage.setItem("sesVersionIdReport", versionId);
            if (versionId.includes('Local')) {
                this.setState({ loading: true })

                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

                var procurementAgentList = [];
                var fundingSourceList = [];
                var budgetList = [];

                openRequest.onerror = function (event) {
                    this.setState({
                        loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;

                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                    var budgetOs = budgetTransaction.objectStore('budget');
                    var budgetRequest = budgetOs.getAll();

                    budgetRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    budgetRequest.onsuccess = function (event) {
                        var budgetResult = [];
                        budgetResult = budgetRequest.result;
                        console.log('B*******', budgetResult)
                        for (var k = 0, j = 0; k < budgetResult.length; k++) {
                            console.log("B** funding source ---", this.state.fundingSourceValues.filter(c => c.value == budgetResult[k].fundingSource.fundingSourceId));
                            console.log("B** moment ---", moment(budgetResult[k].startDate).isBetween(startDate, endDate, null, '[)'))
                            // if (budgetResult[k].program.id == programId && moment().range(startDate, endDate)  moment(budgetResult[k].startDate).isBetween(startDate, endDate) && (this.state.fundingSourceValues.filter(c=>c.value==budgetResult[k].fundingSource.fundingSourceId)).length>0 )
                            if (budgetResult[k].program.id == programId && ((budgetResult[k].startDate >= startDate && budgetResult[k].startDate <= endDate) || (budgetResult[k].stopDate >= startDate && budgetResult[k].stopDate <= endDate) || (startDate >= budgetResult[k].startDate && startDate <= budgetResult[k].stopDate)) && (this.state.fundingSourceValues.filter(c => c.value == budgetResult[k].fundingSource.fundingSourceId)).length > 0)
                                budgetList[j++] = budgetResult[k]
                        }
                        console.log("budgetList---", budgetList);
                        console.log("B** budget 1 ---", budgetList);
                        var transaction = db1.transaction(['programData'], 'readwrite');
                        var programTransaction = transaction.objectStore('programData');
                        var version = (versionId.split('(')[0]).trim()
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var program = `${programId}_v${version}_uId_${userId}`
                        var data = [];
                        var programRequest = programTransaction.get(program);

                        programRequest.onerror = function (event) {
                            this.setState({
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (event) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            console.log("B** program json ---", programJson);
                            for (var l = 0; l < budgetList.length; l++) {
                                var shipmentList = programJson.shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true"));
                                var shipmentList = shipmentList.filter(s => s.budget.id == budgetList[l].budgetId);
                                console.log("B** shipment list ---", shipmentList);
                                var plannedShipmentbudget = 0;
                                (shipmentList.filter(s => (s.shipmentStatus.id == 1 || s.shipmentStatus.id == 2 || s.shipmentStatus.id == 3 || s.shipmentStatus.id == 9))).map(ele => {
                                    console.log(ele)
                                    plannedShipmentbudget = plannedShipmentbudget + (Number(ele.productCost) + Number(ele.freightCost)) * Number(ele.currency.conversionRateToUsd)
                                });
                                console.log("B** planned shipment budget ---", plannedShipmentbudget);
                                var OrderedShipmentbudget = 0;
                                var shiplist = (shipmentList.filter(s => (s.shipmentStatus.id == 4 || s.shipmentStatus.id == 5 || s.shipmentStatus.id == 6 || s.shipmentStatus.id == 7)))
                                console.log("B** shiplist ---", shiplist);
                                shiplist.map(ele => {
                                    console.log(OrderedShipmentbudget, '+', ele.productCost + ele.freightCost)
                                    OrderedShipmentbudget = OrderedShipmentbudget + (Number(ele.productCost) + Number(ele.freightCost)) * Number(ele.currency.conversionRateToUsd)
                                });
                                console.log("B** order shipment budget ---", OrderedShipmentbudget);
                                console.log("B** budget list l ==>", budgetList[l]);
                                var json = {
                                    budget: { id: budgetList[l].budgetId, label: budgetList[l].label, code: budgetList[l].budgetCode },
                                    program: { id: budgetList[l].program.id, label: budgetList[l].program.label, code: programJson.programCode },
                                    fundingSource: { id: budgetList[l].fundingSource.fundingSourceId, label: budgetList[l].fundingSource.label, code: budgetList[l].fundingSource.fundingSourceCode },
                                    currency: budgetList[l].currency,
                                    // plannedBudgetAmt: (plannedShipmentbudget / budgetList[l].currency.conversionRateToUsd) / 1000000,
                                    // orderedBudgetAmt: (OrderedShipmentbudget / budgetList[l].currency.conversionRateToUsd) / 1000000,
                                    plannedBudgetAmt: (plannedShipmentbudget / budgetList[l].currency.conversionRateToUsd),
                                    orderedBudgetAmt: (OrderedShipmentbudget / budgetList[l].currency.conversionRateToUsd),
                                    startDate: budgetList[l].startDate,
                                    stopDate: budgetList[l].stopDate,
                                    budgetAmt: budgetList[l].budgetAmt

                                }

                                data.push(json)
                                console.log("B** json ---", json);
                            }
                            console.log("B** data ---", data);

                            data.sort(function (a, b) {
                                var keyA = new Date(a.startDate),
                                    keyB = new Date(b.startDate);
                                // Compare the 2 dates
                                if (keyA < keyB) return -1;
                                if (keyA > keyB) return 1;
                                return 0;
                            });
                            data.sort(function (a, b) {
                                var keyA1 = new Date(a.startDate),
                                    keyA11 = new Date(a.stopDate),
                                    keyB1 = new Date(b.startDate),
                                    keyB11 = new Date(b.stopDate);
                                // Compare the 2 dates
                                if (keyA1.getTime() === keyB1.getTime()) {
                                    if (keyA11 < keyB11) return -1;
                                    if (keyA11 > keyB11) return 1;
                                }
                                return 0;
                            });

                            console.log("data---->", data);
                            this.setState({
                                selBudget: data,
                                message: '',
                                loading: false
                            })



                        }.bind(this)


                    }.bind(this)
                }.bind(this)

            } else {
                this.setState({ loading: true })
                var inputjson = { "programId": programId, "versionId": versionId, "startDate": startDate, "stopDate": endDate, "fundingSourceIds": fundingSourceIds }
                // AuthenticationService.setupAxiosInterceptors();
                ReportService.budgetReport(inputjson)
                    .then(response => {
                        console.log("BudgetData--------", response.data);
                        this.setState({
                            selBudget: response.data, message: '', loading: false
                        })
                    }).catch(
                        error => {
                            this.setState({
                                selBudget: [], loading: false
                            })
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
                // .catch(
                //     error => {
                //         this.setState({
                //             selBudget: [], loading: false
                //         })

                //         if (error.message === "Network Error") {
                //             this.setState({ message: error.message });
                //         } else {
                //             switch (error.response ? error.response.status : "") {
                //                 case 500:
                //                 case 401:
                //                 case 404:
                //                 case 406:
                //                 case 412:
                //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                //                     break;
                //                 default:
                //                     this.setState({ loading: false, message: 'static.unkownError' });
                //                     break;
                //             }
                //         }
                //     }
                // );

            }
        } else if (programId == 0) {
            this.setState({ selBudget: [], message: i18n.t('static.common.selectProgram') });
        } else if (versionId == 0) {
            this.setState({ selBudget: [], message: i18n.t('static.program.validversion') });
        } else {
            this.setState({ selBudget: [], message: i18n.t('static.fundingSource.selectFundingSource') });
        }
    }
    formatDate(cell) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    getPrograms = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data, loading: false
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
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
            // .catch(
            //     error => {
            //         this.setState({
            //             programs: [], loading: false
            //         }, () => { this.consolidatedProgramList() })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
            //                     break;
            //                 default:
            //                     this.setState({ loading: false, message: 'static.unkownError' });
            //                     break;
            //             }
            //         }
            //     }
            // );

        } else {
            console.log('offline')
            this.consolidatedProgramList()
            this.setState({ loading: false })
        }

    }
    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                var lang = this.state.lang;

                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.filterVersion();
                        this.filterData()
                    })
                } else {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    })

                }

            }.bind(this);

        }.bind(this);


    }


    roundN = num => {
        return Number(Math.round(num * Math.pow(10, 4)) / Math.pow(10, 4)).toFixed(4);

    }
    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        document.getElementById("versionId").value = 0
        if (programId != 0) {

            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
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
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                });
                versionList.reverse();

                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {

                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
                    if (versionVar != '' && versionVar != undefined) {
                        this.setState({
                            versions: versionList,
                            versionId: localStorage.getItem("sesVersionIdReport")
                        }, () => {
                            this.filterData();
                        })
                    } else {
                        this.setState({
                            versions: versionList,
                            versionId: versionList[0].versionId
                        }, () => {
                            this.filterData();
                        })
                    }
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: versionList[0].versionId
                    }, () => {
                        this.filterData();
                    })
                }


            }.bind(this);



        }.bind(this)


    }


    componentDidMount() {
        this.getPrograms()
        this.getFundingSource();
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            this.filterVersion();
            this.filterData()
        })

    }

    setVersionId(event) {
        this.setState({
            versionId: event.target.value
        }, () => {
            this.filterData();
        })

    }
    // showSubFundingSourceLabel(cell, row) {
    //   return getLabelText(cell.label, this.state.lang);
    // }

    // showFundingSourceLabel(cell, row) {
    //   return getLabelText(cell.fundingSource.label, this.state.lang);
    // }

    // showStatus(cell, row) {
    //   if (cell) {
    //     return "Active";
    //   } else {
    //     return "Disabled";
    //   }
    // }
    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        // console.log('in rowClassNameFormat')
        // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
        return new Date(row.stopDate) < new Date() || (row.budgetAmt - row.usedUsdAmt) <= 0 ? 'background-red' : '';
    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

    addCommas(cell, row) {
        console.log("row---------->", row);
        //  var currencyCode = row.currency.currencyCode;
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        // return "(" + currencyCode + ")" + "  " + x1 + x2;
        // return currencyCode + "    " + x1 + x2;
        return x1 + x2
    }

    formatter = value => {
        if (value != null) {
            var cell1 = parseFloat(value).toFixed(2)
            cell1 += '';
            var x = cell1.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        } else {
            return ''
        }
    }

    formatterValue = value => {
        if (value != null) {
            return Math.floor(value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        }
    }

    handleChangeProgram = (programIds) => {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.filterData()
        })

    }


    render() {

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
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);
        console.log('budget list', this.state.selBudget)
        var budgets = this.state.selBudget.map((item, index) => (item.budget))
        const { fundingSources } = this.state;
        const { rangeValue } = this.state
        console.log('budgets', budgets)


        let data1 = []
        let data2 = []
        let data3 = []
        for (var i = 0; i < budgets.length; i++) {
            console.log(this.state.selBudget.filter(c => c.budget.id = budgets[i].id))
            // data1 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => this.roundN(ele.orderedBudgetAmt)))
            // data2 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => this.roundN(ele.plannedBudgetAmt)))
            // data3 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => this.roundN(ele.budgetAmt - (ele.orderedBudgetAmt + ele.plannedBudgetAmt))))

            data1 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => Math.floor(ele.orderedBudgetAmt)))
            data2 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => Math.floor(ele.plannedBudgetAmt)))
            data3 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => Math.floor(ele.budgetAmt - (ele.orderedBudgetAmt + ele.plannedBudgetAmt))))
        }

        const bar = {

            labels: budgets.map(ele => getLabelText(ele.label, this.state.lang)),
            datasets: [
                {
                    label: i18n.t('static.budget.allocatedShipmentOrdered'),
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#118b70',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data1
                },
                {
                    label: i18n.t('static.budget.allocatedShipmentPlanned'),
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#EDB944',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data2
                },

                {
                    label: i18n.t('static.report.remainingBudgetAmt'),
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#cfcdc9',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data3
                }
            ],




        }

        console.log('datasets', bar)
        const { SearchBar, ClearSearchButton } = Search;
        const { fundingSourceList } = this.state;

        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );



        const columns = [
            {
                dataField: 'budget.label',
                text: i18n.t('static.budget.budget'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'budget.code',
                text: i18n.t('static.budget.budgetCode'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
            },
            /*{
                dataField: 'program.label',
                text: i18n.t('static.budget.program'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'program.code',
                headerAlign: 'center',
                text: i18n.t('static.program.programCode'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
            },*/
            {
                dataField: 'fundingSource.code',
                text: i18n.t('static.budget.fundingsource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' }
                // formatter: this.formatLabel

            },
            {
                dataField: 'currency.label',
                text: i18n.t('static.dashboard.currency'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatLabel

            },
            {
                dataField: 'budgetAmt',
                text: i18n.t('static.budget.budgetamount'),
                // + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                // formatter: this.roundN
                // formatter: this.formatter
                formatter: this.formatterValue,
            },
            {
                dataField: 'plannedBudgetAmt',
                text: i18n.t('static.report.plannedBudgetAmt'),
                // + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                // formatter: this.roundN,
                // formatter: this.formatter,
                formatter: this.formatterValue,
                headerTitle: (cell, row, rowIndex, colIndex) => i18n.t('static.report.plannedbudgetStatus')
            }
            ,
            {
                dataField: 'orderedBudgetAmt',
                text: i18n.t('static.report.orderedBudgetAmt'),
                // + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                // formatter: this.roundN,
                // formatter: this.formatter,
                formatter: this.formatterValue,
                headerTitle: (cell, row, rowIndex, colIndex) => i18n.t('static.report.OrderedbudgetStatus')
            },
            {
                dataField: 'orderedBudgetAmt',
                text: i18n.t('static.report.remainingBudgetAmt'),
                // + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                // formatter: (cell, row) => {
                //     return this.roundN(row.budgetAmt - (row.plannedBudgetAmt + row.orderedBudgetAmt), row)
                // }
                // formatter: (cell, row) => {
                //     return (row.budgetAmt - (row.plannedBudgetAmt + row.orderedBudgetAmt)).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                // }
                formatter: (cell, row) => {
                    return Math.floor((row.budgetAmt - (row.plannedBudgetAmt + row.orderedBudgetAmt))).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                }
            },

            {
                dataField: 'startDate',
                text: i18n.t('static.common.startdate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatDate
            },
            {
                dataField: 'stopDate',
                text: i18n.t('static.common.stopdate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatDate
            }];
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
                text: 'All', value: this.state.selBudget.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}{' '}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a className="card-header-action">
                                    {this.state.selBudget.length > 0 && <div className="card-header-actions">
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                    </div>}
                                </a>
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">

                        <Col md="11 pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
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

                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                // onChange={(e) => { this.filterVersion(); this.filterData() }}
                                                onChange={(e) => { this.setProgramId(e) }}
                                                value={this.state.programId}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="versionId"
                                                id="versionId"
                                                bsSize="sm"
                                                // onChange={(e) => { this.filterData() }}
                                                onChange={(e) => { this.setVersionId(e) }}
                                                value={this.state.versionId}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {versionList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3" >
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls">
                                        <MultiSelect
                                            name="fundingSourceId"
                                            id="fundingSourceId"
                                            bsSize="md"
                                            value={this.state.fundingSourceValues}
                                            onChange={(e) => { this.handleFundingSourceChange(e) }}
                                            options={fundingSources.length > 0
                                                && fundingSources.map((item, i) => {
                                                    return (
                                                        { label: item.fundingSourceCode, value: item.fundingSourceId }
                                                    )
                                                }, this)}
                                        />

                                    </div>
                                </FormGroup>


                            </div>
                        </Col>
                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            <Col md="12 pl-0">
                                <div className="row">
                                    {
                                        this.state.selBudget.length > 0
                                        &&
                                        <div className="col-md-12 p-0">
                                            <div className="col-md-12">
                                                <div className="chart-wrapper chart-graph-report">
                                                    <HorizontalBar id="cool-canvas" data={bar} options={chartoptions} />

                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                    {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                </button>

                                            </div>
                                        </div>}


                                </div>



                                {this.state.show && this.state.selBudget.length > 0 &&
                                    <ToolkitProvider
                                        keyField="budgetId"
                                        data={this.state.selBudget}
                                        columns={columns}
                                        search={{ searchFormatted: true }}
                                        hover
                                        filter={filterFactory()}
                                    >
                                        {
                                            props => (
                                                <div>
                                                    <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                        {/*<SearchBar {...props.searchProps} />
                                                        <ClearSearchButton {...props.searchProps} />*/}
                                                    </div>
                                                    <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                        // pagination={paginationFactory(options)}
                                                        rowEvents={{
                                                            onClick: (e, row, rowIndex) => {
                                                                console.log("***row", row);
                                                                window.open(window.location.origin + `/#/report/shipmentSummery/${row.budget.id}/${row.budget.code}`);
                                                            }
                                                        }}
                                                        {...props.baseProps}
                                                    />
                                                </div>
                                            )
                                        }
                                    </ToolkitProvider>}
                            </Col>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div className="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                    <div className="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div >
        )
    }
}


export default Budgets;
