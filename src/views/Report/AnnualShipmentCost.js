import React, { Component } from 'react';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import Picker from 'react-month-picker'
import i18n from '../../i18n'
import MonthBox from '../../CommonComponent/MonthBox.js'
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService';
import ShipmentStatusService from '../../api/ShipmentStatusService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import FundingSourceService from '../../api/FundingSourceService';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { SECRET_KEY, DATE_FORMAT_CAP, INDEXED_DB_VERSION, INDEXED_DB_NAME, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js';
import CryptoJS from 'crypto-js';
import {
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    Col,
    Row,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import ReportService from '../../api/ReportService';

import MultiSelect from 'react-multi-select-component';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
class AnnualShipmentCost extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            matricsList: [],
            dropdownOpen: false,
            radioSelected: 2,
            productCategories: [],
            planningUnits: [],
            categories: [],
            countries: [],
            procurementAgents: [],
            shipmentStatuses: [],
            fundingSources: [],
            show: false,
            programs: [],
            versions: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            statusValues: [],
            statusLabels: [],
            procurementAgentValues: [],
            procurementAgentLabels: [],
            fundingSourceValues: [],
            fundingSourceLabels: [],
            lang: localStorage.getItem('lang'),
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            outPutList: [],
            message: '',
            programId: '',
            versionId: '',
            loading: false
        };
        this.fetchData = this.fetchData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this)
        this.getPrograms = this.getPrograms.bind(this);
        this.getProcurementAgentList = this.getProcurementAgentList.bind(this);
        this.getFundingSourceList = this.getFundingSourceList.bind(this);
        this.getShipmentStatusList = this.getShipmentStatusList.bind(this);
        this.filterVersion = this.filterVersion.bind(this);
        //this.pickRange = React.createRef()
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);

    }
    roundN = num => {
        if (num != '') {
            return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
        } else {
            return ''
        }
    }
    fetchData() {
        let procurementAgentIds = this.state.procurementAgentValues.length == this.state.procurementAgents.length ? [] : this.state.procurementAgentValues.map(ele => (ele.value).toString());
        let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
        let shipmentStatusIds = this.state.statusValues.length == this.state.shipmentStatuses.length ? [] : this.state.statusValues.map(ele => (ele.value).toString());
        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());

        this.setState({
            outPutList: []
        }, () => {
            let json = {
                "programId": document.getElementById("programId").value,
                "versionId": document.getElementById("versionId").value,
                "procurementAgentIds": procurementAgentIds,
                "planningUnitIds": planningUnitIds,//document.getElementById("planningUnitId").value,
                "fundingSourceIds": fundingSourceIds,
                "shipmentStatusIds": shipmentStatusIds,
                "startDate": this.state.rangeValue.from.year + '-' + ("00" + this.state.rangeValue.from.month).substr(-2) + '-01',
                "stopDate": this.state.rangeValue.to.year + '-' + ("00" + this.state.rangeValue.to.month).substr(-2) + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
                "reportBasedOn": document.getElementById("view").value,

            }

            let versionId = document.getElementById("versionId").value;
            let programId = document.getElementById("programId").value;
            //let planningUnitId = document.getElementById("planningUnitId").value;
            let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
            let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
            let reportbaseValue = document.getElementById("view").value;
            console.log('****', startDate, endDate)
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && this.state.procurementAgentValues.length > 0 && this.state.fundingSourceValues.length > 0 && this.state.statusValues.length > 0) {
                if (versionId.includes('Local')) {
                    var db1;
                    var storeOS;
                    getDatabase();
                    var regionList = [];
                    this.setState({ loading: true })
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
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
                        console.log("1----", program)
                        var programRequest = programDataOs.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (e) {
                            // this.setState({ loading: true })
                            console.log("2----", programRequest)
                            // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);

                            // var programJson = JSON.parse(programData);
                            // console.log("3----", programJson);

                            var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                            var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var papuOs = papuTransaction.objectStore('procurementAgent');
                            var papuRequest = papuOs.getAll();
                            papuRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext'),
                                    loading: false
                                })
                            }.bind(this);
                            papuRequest.onsuccess = function (event) {
                                var papuResult = [];
                                papuResult = papuRequest.result;

                                var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                var fsOs = fsTransaction.objectStore('fundingSource');
                                var fsRequest = fsOs.getAll();

                                fsRequest.onerror = function (event) {
                                    this.setState({
                                        supplyPlanError: i18n.t('static.program.errortext'),
                                        loading: false
                                    })
                                }.bind(this);

                                fsRequest.onsuccess = function (event) {
                                    var fsResult = [];
                                    fsResult = fsRequest.result;
                                    var outPutList = [];
                                    this.state.planningUnitValues.map(p => {
                                        console.log("P+++++++++++", p);
                                        var planningUnitId = p.value;
                                        var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
                                        var programJson = {}
                                        if (planningUnitDataIndex != -1) {
                                            var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitId))[0];
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
                                        var shipmentList = [];
                                        shipmentList = programJson.shipmentList;
                                        shipmentList = shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true"));
                                        var planningUnitLabel = p.label;
                                        var list = shipmentList.filter(c => c.planningUnit.id == planningUnitId)

                                        if (reportbaseValue == 1) {
                                            list = list.filter(c => (c.plannedDate >= startDate && c.plannedDate <= endDate));
                                        } else {
                                            list = list.filter(c => c.receivedDate == null || c.receivedDate == "" ? (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) : (c.receivedDate >= startDate && c.receivedDate <= endDate));
                                        }
                                        console.log(list)
                                        // var procurementAgentId = document.getElementById("procurementAgentId").value;
                                        // var fundingSourceId = document.getElementById("fundingSourceId").value;
                                        // var shipmentStatusId = document.getElementById("shipmentStatusId").value;

                                        // if (procurementAgentId != -1) {
                                        var procurementAgentfilteredList = []
                                        this.state.procurementAgentValues.map(procurementAgent => {
                                            procurementAgentfilteredList = [...procurementAgentfilteredList, ...list.filter(c => c.procurementAgent.id == procurementAgent.value)];
                                        })
                                        console.log('procurementAgentfilteredList', procurementAgentfilteredList)
                                        // }
                                        var fundingSourcefilteredList = []
                                        // if (fundingSourceId != -1) {
                                        this.state.fundingSourceValues.map(fundingsource => {
                                            fundingSourcefilteredList = [...fundingSourcefilteredList, ...procurementAgentfilteredList.filter(c => c.fundingSource.id == fundingsource.value)];
                                        })
                                        console.log('fundingSourcefilteredList', fundingSourcefilteredList)
                                        // if (shipmentStatusId != -1) {
                                        var list1 = []
                                        this.state.statusValues.map(status => {
                                            list1 = [...list1, ...fundingSourcefilteredList.filter(c => c.shipmentStatus.id == status.value)];
                                        })
                                        console.log('list1', list1)
                                        var availableProcure = [...new Set(list1.map(ele => ele.procurementAgent.id))];
                                        var availableFunding = [...new Set(list1.map(ele => ele.fundingSource.id))];
                                        console.log(availableProcure)
                                        console.log(availableFunding)
                                        var list1 = list
                                        availableProcure.map(p => {
                                            availableFunding.map(f => {
                                                console.log(p, '======', f)
                                                list = list1.filter(c => c.procurementAgent.id == p && c.fundingSource.id == f)
                                                console.log(list)
                                                if (list.length > 0) {
                                                    var fundingSource = this.state.fundingSources.filter(c => c.fundingSourceId == f)[0]
                                                    var procurementAgent = this.state.procurementAgents.filter(c => c.procurementAgentId == p)[0]
                                                    console.log(fundingSource)
                                                    console.log(procurementAgent)
                                                    var json = {
                                                        'FUNDING_SOURCE_ID': fundingSource.fundingSourceId,
                                                        'PROCUREMENT_AGENT_ID': procurementAgent.procurementAgentId,
                                                        'fundingsource': fundingSource.fundingSourceCode,
                                                        'procurementAgent': procurementAgent.procurementAgentCode,
                                                        'PLANNING_UNIT_ID': planningUnitId,
                                                        'planningUnit': planningUnitLabel

                                                    };
                                                    var monthstartfrom = this.state.rangeValue.from.month
                                                    for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                                                        var dtstr = from + "-" + String(monthstartfrom).padStart(2, '0') + "-01"
                                                        var m = from == to ? this.state.rangeValue.to.month : 12
                                                        var enddtStr = from + "-" + String(m).padStart(2, '0') + '-' + new Date(from, m, 0).getDate()
                                                        console.log(dtstr, ' ', enddtStr)
                                                        var list2 = []
                                                        if (reportbaseValue == 1) {
                                                            list2 = list.filter(c => (c.plannedDate >= dtstr && c.plannedDate <= enddtStr));
                                                        } else {
                                                            list2 = list.filter(c => c.receivedDate == null || c.receivedDate == "" ? (c.expectedDeliveryDate >= dtstr && c.expectedDeliveryDate <= enddtStr) : (c.receivedDate >= dtstr && c.receivedDate <= enddtStr));
                                                        }
                                                        console.log(list2)
                                                        var cost = 0;
                                                        for (var k = 0; k < list2.length; k++) {
                                                            cost += Number(list2[k].productCost * list2[k].currency.conversionRateToUsd) + Number(list2[k].freightCost * list2[k].currency.conversionRateToUsd);
                                                        }
                                                        json[from] = this.roundN(cost)
                                                        console.log(json)
                                                        monthstartfrom = 1;

                                                    }
                                                    outPutList.push(json);
                                                }
                                            })
                                        })
                                    })

                                    outPutList = outPutList.sort(function (a, b) {
                                        return parseInt(a.PROCUREMENT_AGENT_ID) - parseInt(b.PROCUREMENT_AGENT_ID);
                                    })
                                    this.setState({ outPutList: outPutList, message: '', loading: false });


                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                } else {
                    this.setState({ loading: true })
                    // alert("in else online version");
                    console.log("json---", json);
                    // AuthenticationService.setupAxiosInterceptors();
                    ReportService.getAnnualShipmentCost(json)
                        .then(response => {
                            console.log("-----response", JSON.stringify(response.data));
                            var outPutList = [];
                            var responseData = response.data;
                            for (var i = 0; i < responseData.length; i++) {
                                var shipmentAmt = responseData[i].shipmentAmt;
                                var json = {
                                    'FUNDING_SOURCE_ID': responseData[i].fundingSource.id,
                                    'PROCUREMENT_AGENT_ID': responseData[i].procurementAgent.id,
                                    'fundingsource': responseData[i].fundingSource.code,
                                    'procurementAgent': responseData[i].procurementAgent.code,
                                    'PLANNING_UNIT_ID': responseData[i].planningUnit.id,
                                    'planningUnit': getLabelText(responseData[i].planningUnit.label, this.state.lang)
                                }
                                for (var key in shipmentAmt) {
                                    var keyName = key.split("-")[1];
                                    var keyValue = shipmentAmt[key];
                                    console.log("keyName--", keyName);
                                    console.log("keyValue--", keyValue);
                                    json[keyName] = Number(keyValue).toFixed(2);
                                }
                                outPutList.push(json);
                            }
                            console.log("json final---", json);
                            this.setState({
                                outPutList: outPutList, message: '', loading: false
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    outPutList: [],
                                    loading: false
                                })
                                if (error.message === "Network Error") {
                                    this.setState({ message: error.message, loading: false });
                                } else {
                                    switch (error.response ? error.response.status : "") {
                                        case 500:
                                        case 401:
                                        case 404:
                                        case 406:
                                        case 412:
                                            this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
                                            break;
                                        default:
                                            this.setState({ message: 'static.unkownError', loading: false });
                                            break;
                                    }
                                }
                            }
                        );
                }
            } else if (programId == 0) {
                this.setState({ message: i18n.t('static.common.selectProgram'), data: [], outPutList: [] });

            } else if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [], outPutList: [] });

            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [], outPutList: [] });

            } else if (this.state.procurementAgentValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementAgent.selectProcurementAgent'), data: [], outPutList: [] })
            } else if (this.state.fundingSourceValues.length == 0) {
                this.setState({ message: i18n.t('static.fundingSource.selectFundingSource'), data: [], outPutList: [] })
            }
            else {
                this.setState({ message: i18n.t('static.report.validShipmentStatusText'), data: [], outPutList: [] });

            }
        })
    }

    getPrograms() {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
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
    show() {

    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    initalisedoc = () => {
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

            doc.setFont('helvetica', 'bold')

            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(18)
                doc.setPage(i)

                doc.addImage(LOGO, 'png', 0, 10, 180, 50, '', 'FAST');

                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.annualshipmentcost'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(7)
                    var splittext = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width / 8, 80, splittext)
                    var y = 80 + splittext.length * 10
                    splittext = doc.splitTextToSize(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width / 8, y, splittext)
                    y = y + splittext.length * 10
                    splittext = doc.splitTextToSize(i18n.t('static.common.reportbase') + ' : ' + document.getElementById("view").selectedOptions[0].text, doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width / 8, y, splittext)
                    splittext = doc.splitTextToSize(i18n.t('static.common.runDate') + moment(new Date()).format(`${DATE_FORMAT_CAP}`) + ' ' + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width * 3 / 4, 80, splittext)
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.common.productFreight'), doc.internal.pageSize.width / 2, 90, {
                        align: 'center'
                    })
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 2, 100, {
                        align: 'center'
                    })
                    // doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                    //     align: 'left'
                    // })
                    var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 130, fundingSourceText)

                    var procurementAgentText = doc.splitTextToSize((i18n.t('static.procurementagent.procurementagent') + ' : ' + this.state.procurementAgentLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 140 + (fundingSourceText.length * 10), procurementAgentText)

                    // doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 120 + (fundingSourceText.length * 10) + (procurementAgentText.length * 10), {
                    //     align: 'left'
                    // })
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 150 + (fundingSourceText.length * 10) + (procurementAgentText.length * 10), planningText)

                    var statustext = doc.splitTextToSize((i18n.t('static.common.status') + ' : ' + this.state.statusLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 160 + (fundingSourceText.length * 10) + (procurementAgentText.length * 10) + (planningText.length * 10), statustext)


                }
            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        var ystart = 200 + doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10
        ystart = ystart + 10;
        doc.setFontSize(9);
        doc.setTextColor("#002f6c");
        doc.setFont('helvetica', 'bold')
        doc.text(i18n.t('static.procurementagent.procurementagent'), 50, ystart, {
            align: 'left'
        })
        ystart = ystart + 10
        doc.text(i18n.t(i18n.t('static.fundingsource.fundingsource')), 60, ystart, {
            align: 'left'
        })
        ystart = ystart + 10
        doc.setFont('helvetica', 'normal')
        doc.text(i18n.t('static.planningunit.planningunit'), 70, ystart, {
            align: 'left'
        })
        doc.setFont('helvetica', 'bold')
        ystart = ystart + 10
        doc.line(50, ystart, doc.internal.pageSize.width - 50, ystart);
        var year = [];
        for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
            year.push(from);
        }
        // ystart=ystart+10
        // var year = ['2019', '2020']//[...new Set(this.state.matricsList.map(ele=>(ele.YEAR)))]//;
        var data = this.state.outPutList;
        // var data = [{ 2019: 17534, 2020: 0, PROCUREMENT_AGENT_ID: 1, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "USAID", procurementAgent: "PSM", planningUnit: "Ceftriaxone 1 gm Powder Vial, 50" },
        // { 2019: 15234, 2020: 0, PROCUREMENT_AGENT_ID: 1, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "PEPFAR", procurementAgent: "PSM", planningUnit: "Ceftriaxone 1 gm Powder Vial, 50" },
        // { 2019: 0, 2020: 17234, PROCUREMENT_AGENT_ID: 2, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "USAID", procurementAgent: "GF", planningUnit: "Ceftriaxone 1 gm Powder Vial, 50" }]
        //this.state.matricsList;//[['GHSC-PSM \n PEPFAR \nplanning unit 1', 200000, 300000], ['PPM \nGF \n planning unit 1', 15826, 2778993]]
        var index = doc.internal.pageSize.width / (year.length + 3);
        var initalvalue = index + 10
        for (var i = 0; i < year.length; i++) {
            initalvalue = initalvalue + index
            doc.text(year[i].toString(), initalvalue, ystart - 20, {
                align: 'left',
            })
        }
        initalvalue += index
        doc.text('Total', initalvalue, ystart - 20, {
            align: 'left'
        })
        initalvalue = 10
        var yindex = ystart + 20
        var totalAmount = []
        var GrandTotalAmount = []
        console.log('data', data)
        for (var j = 0; j < data.length; j++) {
            if (yindex > doc.internal.pageSize.height - 50) { doc.addPage(); yindex = 90 } else { yindex = yindex }
            var record = data[j]

            var keys = Object.entries(record).map(([key, value]) => (key)
            )

            var values = Object.entries(record).map(([key, value]) => (value)
            )

            var splittext = doc.splitTextToSize(record.procurementAgent, index);
            for (var i = 0; i < splittext.length; i++) {
                yindex = yindex + 10;

                doc.setFont('helvetica', 'bold')

                if (yindex > doc.internal.pageSize.height - 110) {
                    doc.addPage();
                    yindex = 80;

                }
                doc.text(50, yindex, splittext[i]);

            }
            splittext = doc.splitTextToSize(record.fundingsource, index);
            for (var i = 0; i < splittext.length; i++) {
                yindex = yindex + 10;

                doc.setFont('helvetica', 'bold')

                if (yindex > doc.internal.pageSize.height - 110) {
                    doc.addPage();
                    yindex = 80;

                }
                doc.text(60, yindex, splittext[i]);

            }
            // splittext = doc.splitTextToSize(record.planningUnit + '\n', index);
            splittext = doc.splitTextToSize(record.planningUnit, index);

            //doc.text(doc.internal.pageSize.width / 8, yindex, splittext)
            //  yindex = yindex + 10;
            for (var i = 0; i < splittext.length; i++) {
                yindex = yindex + 10;

                doc.setFont('helvetica', 'normal')

                if (yindex > doc.internal.pageSize.height - 110) {
                    doc.addPage();
                    yindex = 80;

                }
                doc.text(70, yindex, splittext[i]);

            }
            initalvalue = initalvalue + index
            var total = 0
            for (var x = 0; x < year.length; x++) {
                for (var n = 0; n < keys.length; n++) {
                    if (year[x] == keys[n]) {
                        console.log(values[n])
                        total = Number(total) + Number(values[n])
                        initalvalue = initalvalue + index
                        totalAmount[x] = totalAmount[x] == null ? Number(values[n]) : Number(totalAmount[x]) + Number(values[n])
                        GrandTotalAmount[x] = GrandTotalAmount[x] == null ? Number(values[n]) : Number(GrandTotalAmount[x]) + Number(values[n])
                        doc.setFont('helvetica', 'normal')
                        if (yindex - 40 > doc.internal.pageSize.height - 110) {
                            doc.addPage();
                            // yindex = 80;
                            doc.text(this.formatter(values[n]).toString(), initalvalue, 80, {
                                align: 'left'
                            })

                        } else {
                            // doc.text(this.formatter(values[n]).toString(), initalvalue, yindex - 20, {
                            //     align: 'left'
                            // })
                            doc.text(this.formatter(values[n]).toString(), initalvalue, yindex - 0, {
                                align: 'left'
                            })
                        }

                    }
                }
            }
            console.log(total)
            doc.setFont('helvetica', 'bold')
            if (yindex - 40 > doc.internal.pageSize.height - 110) {
                doc.addPage();
                yindex = 80;
                doc.text(this.formatter(this.roundN(total)).toString(), initalvalue + index, 80, {
                    align: 'left',

                });

            } else {
                // doc.text(this.formatter(this.roundN(total)).toString(), initalvalue + index, yindex - 20, {
                //     align: 'left',

                // });
                doc.text(this.formatter(this.roundN(total)).toString(), initalvalue + index, yindex - 0, {
                    align: 'left',

                });
            }

            totalAmount[year.length] = totalAmount[x] == null ? total : totalAmount[year.length] + total
            GrandTotalAmount[year.length] = GrandTotalAmount[year.length] == null ? total : GrandTotalAmount[year.length] + total
            if (j < data.length - 1) {

                if (data[j].PROCUREMENT_AGENT_ID != data[j + 1].PROCUREMENT_AGENT_ID || data[j].FUNDING_SOURCE_ID != data[j + 1].FUNDING_SOURCE_ID) {
                    console.log("in this if=======");
                    yindex = yindex + 40
                    if (yindex > doc.internal.pageSize.height - 100) {
                        doc.addPage();
                        yindex = 80;

                    }
                    initalvalue = 10
                    doc.setLineDash([2, 2], 0);
                    doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
                    yindex += 20
                    initalvalue = initalvalue + index
                    doc.text("Total", doc.internal.pageSize.width / 8, yindex, {
                        align: 'left'
                    });
                    var Gtotal = 0
                    for (var l = 0; l < totalAmount.length; l++) {
                        initalvalue += index;
                        Gtotal = Number(Gtotal) + Number(totalAmount[l])
                        doc.text(this.formatter(this.roundN(totalAmount[l])).toString(), initalvalue, yindex, {
                            align: 'left'
                        })
                        totalAmount[l] = 0;
                    }
                } else {

                }
            } if (j == data.length - 1) {
                console.log("in this second if=======");
                yindex = yindex + 80
                if (yindex > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    yindex = 80;

                }
                initalvalue = 10
                doc.setLineDash([2, 2], 0);
                doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
                yindex += 20
                initalvalue = initalvalue + index
                doc.text("Total", doc.internal.pageSize.width / 8, yindex, {
                    align: 'left'
                });
                var Gtotal = 0
                for (var l = 0; l < totalAmount.length; l++) {
                    initalvalue += index;
                    Gtotal = Number(Gtotal) + Number(totalAmount[l])
                    doc.text(this.formatter(this.roundN(totalAmount[l])).toString(), initalvalue, yindex, {
                        align: 'left'
                    })
                }
            }
            yindex = yindex + 40
            if (yindex > doc.internal.pageSize.height - 100) {
                doc.addPage();
                yindex = 80;

            }
            initalvalue = 10

        }
        initalvalue = 10
        initalvalue += index;
        doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
        yindex += 20
        doc.setFontSize(9);
        doc.text(i18n.t('static.common.grandTotal'), doc.internal.pageSize.width / 8, yindex, {
            align: 'left'
        });
        var Gtotal = 0
        for (var l = 0; l < GrandTotalAmount.length; l++) {
            initalvalue += index;
            Gtotal = Gtotal + GrandTotalAmount[l]
            doc.text(this.formatter(this.roundN(GrandTotalAmount[l])).toString(), initalvalue, yindex, {
                align: 'left'
            })
        }
        doc.text(this.formatter(this.roundN(Gtotal)).toString(), initalvalue + index, yindex, {
            align: 'left'
        });
        doc.setFontSize(8);


        addHeaders(doc)
        addFooters(doc)
        doc.autoTable({ pagesplit: true })
        return doc;
    }
    exportPDF = () => {
        var doc = this.initalisedoc()
        doc.save(i18n.t('static.report.annualshipmentcost').concat('.pdf'));

    }
    previewPDF = () => {
        var doc = this.initalisedoc()
        var string = doc.output('datauristring');
        var embed = "<embed width='100%' height='100%' src='" + string + "'/>"
        document.getElementById("pdf").innerHTML = embed
    }



    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    roundN = num => {
        return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }



    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        if (programId != 0) {

            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],

                        planningUnits: [],
                        outPutList: [],
                        planningUnitValues: []

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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
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
                            this.getPlanningUnit();
                        })
                    } else {
                        this.setState({
                            versions: versionList,
                            versionId: versionList[0].versionId
                        }, () => {
                            this.getPlanningUnit();
                        })
                    }
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: versionList[0].versionId
                    }, () => {
                        this.getPlanningUnit();
                    })
                }

            }.bind(this);



        }.bind(this)


    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: []
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] });
            } else {
                localStorage.setItem("sesVersionIdReport", versionId);
                if (versionId.includes('Local')) {
                    const lan = 'en';
                    var db1;
                    var storeOS;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
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
                                if (myResult[i].program.id == programId && myResult[i].active == true) {

                                    proList[i] = myResult[i]
                                }
                            }
                            var lang = this.state.lang;
                            this.setState({
                                planningUnits: proList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), message: ''
                            }, () => {
                                this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)


                }
                else {
                    // AuthenticationService.setupAxiosInterceptors();

                    //let productCategoryId = document.getElementById("productCategoryId").value;
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        console.log('**' + JSON.stringify(response.data))
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray, message: ''
                        }, () => {
                            this.fetchData();
                        })
                    })
                        .catch(
                            error => {
                                this.setState({
                                    planningUnits: [],
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
                                            this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                                            break;
                                        default:
                                            this.setState({ message: 'static.unkownError' });
                                            break;
                                    }
                                }
                            }
                        );
                }
            }
        });

    }

    getProductCategories() {
        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    productCategories: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        productCategories: []
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
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getFundingSourceList() {
        const { fundingSources } = this.state
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.fundingSourceCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.fundingSourceCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        fundingSources: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            countrys: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.fundingsource.fundingsource') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db3;
            var fSourceResult = [];
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db3 = e.target.result;
                var fSourceTransaction = db3.transaction(['fundingSource'], 'readwrite');
                var fSourceOs = fSourceTransaction.objectStore('fundingSource');
                var fSourceRequest = fSourceOs.getAll();
                fSourceRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                fSourceRequest.onsuccess = function (event) {

                    fSourceResult = fSourceRequest.result;
                    console.log("funding source list offline--->", fSourceResult);
                    this.setState({
                        fundingSources: fSourceResult.sort(function (a, b) {
                            a = a.fundingSourceCode.toLowerCase();
                            b = b.fundingSourceCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    });

                }.bind(this)

            }.bind(this)


        }

    }
    getProcurementAgentList() {
        const { procurementAgents } = this.state
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();

            ProcurementAgentService.getProcurementAgentListAll()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.procurementAgentCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.procurementAgentCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        procurementAgents: listArray
                    })
                }).catch(
                    error => {
                        this.setState({
                            countrys: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.procurementagent.procurementagent') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db1;
            var papuResult = [];
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgent');
                var papuRequest = papuOs.getAll();
                papuRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                papuRequest.onsuccess = function (event) {

                    papuResult = papuRequest.result;
                    console.log("procurement agent list offline--->", papuResult);
                    this.setState({
                        procurementAgents: papuResult.sort(function (a, b) {
                            a = a.procurementAgentCode.toLowerCase();
                            b = b.procurementAgentCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    });
                }.bind(this)

            }.bind(this)

        }
    }
    getShipmentStatusList() {
        const { shipmentStatuses } = this.state
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ShipmentStatusService.getShipmentStatusListActive()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        shipmentStatuses: listArray
                    })
                }).catch(
                    error => {
                        this.setState({
                            countrys: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.common.status') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db2;
            var sStatusResult = [];
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db2 = e.target.result;
                var sStatusTransaction = db2.transaction(['shipmentStatus'], 'readwrite');
                var sStatusOs = sStatusTransaction.objectStore('shipmentStatus');
                var sStatusRequest = sStatusOs.getAll();
                sStatusRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                sStatusRequest.onsuccess = function (event) {
                    sStatusResult = sStatusRequest.result;
                    console.log("shipment status list offline--->", sStatusResult);
                    this.setState({ shipmentStatuses: sStatusResult });
                }.bind(this)

            }.bind(this)


        }
    }

    handlePlanningUnitChange = (planningUnitIds) => {
        planningUnitIds = planningUnitIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }
    handleProcurementAgentChange = (procurementAgentIds) => {
        procurementAgentIds = procurementAgentIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgentValues: procurementAgentIds.map(ele => ele),
            procurementAgentLabels: procurementAgentIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }

    handleFundingSourceChange = (fundingSourceIds) => {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }

    handleStatusChange = (statusIds) => {
        statusIds = statusIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            statusValues: statusIds.map(ele => ele),
            statusLabels: statusIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }


    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.getPrograms();
        this.getProcurementAgentList()
        this.getFundingSourceList()
        this.getShipmentStatusList()
        // this.getProductCategories()
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            this.filterVersion();
        })

    }

    setVersionId(event) {
        // this.setState({
        //     versionId: event.target.value
        // }, () => {
        //     if (this.state.outPutList.length != 0) {
        //         localStorage.setItem("sesVersionIdReport", this.state.versionId);
        //         this.fetchData();
        //     } else {
        //         this.getPlanningUnit();
        //     }
        // })
        if (this.state.versionId != '' || this.state.versionId != undefined) {
            this.setState({
                versionId: event.target.value
            }, () => {
                localStorage.setItem("sesVersionIdReport", this.state.versionId);
                this.fetchData();
            })
        } else {
            this.setState({
                versionId: event.target.value
            }, () => {
                this.getPlanningUnit();
            })
        }

    }

    render() {
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {/* {getLabelText(item.label, this.state.lang)} */}
                        {(item.programCode)}
                    </option>
                )
            }, this)
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        // const { planningUnits } = this.state
        // let planningUnitList = planningUnits.length > 0
        //     && planningUnits.map((item, i) => {
        //         return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

        //     }, this);

        const { procurementAgents } = this.state;
        // console.log(JSON.stringify(countrys))
        let procurementAgentList = procurementAgents.length > 0 && procurementAgents.map((item, i) => {
            return (
                <option key={i} value={item.procurementAgentId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        const { fundingSources } = this.state;
        let fundingSourceList = fundingSources.length > 0 && fundingSources.map((item, i) => {
            return (
                <option key={i} value={item.fundingSourceId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        const { shipmentStatuses } = this.state;
        let shipmentStatusList = shipmentStatuses.length > 0 && shipmentStatuses.map((item, i) => {
            return (
                <option key={i} value={item.shipmentStatusId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        // const { productCategories } = this.state;
        // let productCategoryList = productCategories.length > 0
        //     && productCategories.map((item, i) => {
        //         return (
        //             <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
        //                 {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
        //             </option>
        //         )
        //     }, this);

        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }



        return (
            <div className="animated fadeIn" >
                {/* <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6> */}
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h5>{i18n.t(this.props.match.params.message)}</h5> */}
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.annualshipmentcost')}</strong> */}
                        <div className="card-header-actions">

                            <a className="card-header-action">

                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0 ">
                        <div className="" >
                            <div ref={ref}>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.reportbase')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="view"
                                                            id="view"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="1">{i18n.t('static.supplyPlan.submittedDate')}</option>
                                                            <option value="2">{i18n.t('static.common.receivedate')}</option>

                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">

                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
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
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            // onChange={this.getProductCategories}
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setProgramId(e); }}
                                                            value={this.state.programId}

                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            {/* <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="productCategoryId"
                                                        id="productCategoryId"
                                                        bsSize="sm"
                                                        onChange={this.getPlanningUnit}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {productCategoryList}
                                                    </Input>

                                                </InputGroup>
                                            </div>

                                        </FormGroup> */}

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label>
                                                <div className="controls ">
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">

                                                    <MultiSelect
                                                        name="planningUnitId"
                                                        id="planningUnitId"
                                                        bsSize="md"
                                                        value={this.state.planningUnitValues}
                                                        onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                        disabled={this.state.loading}
                                                    />     </div></FormGroup>
                                            {/* <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {planningUnitList}
                                                        </Input>
                                                        {/* <InputGroupAddon addonType="append">
                                    <Button color="secondary Gobtn btn-sm" onClick={this.fetchData}>{i18n.t('static.common.go')}</Button>
                                  </InputGroupAddon> 
                                                    </InputGroup>
                                                </div>
                                            </FormGroup> */}


                                            <FormGroup className="col-md-3" >
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">
                                                    <MultiSelect
                                                        name="procurementAgentId"
                                                        id="planningUnitId"
                                                        bsSize="procurementAgentId"
                                                        value={this.state.procurementAgentValues}
                                                        onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                                        options={procurementAgents.length > 0
                                                            && procurementAgents.map((item, i) => {
                                                                return ({ label: item.procurementAgentCode, value: item.procurementAgentId })
                                                            }, this)}
                                                        disabled={this.state.loading}
                                                    />

                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3" id="fundingSourceDiv">
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
                                                        disabled={this.state.loading}
                                                    />

                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">
                                                    <MultiSelect
                                                        name="shipmentStatusId"
                                                        id="shipmentStatusId"
                                                        bsSize="md"
                                                        value={this.state.statusValues}
                                                        onChange={(e) => { this.handleStatusChange(e) }}
                                                        options={shipmentStatuses.length > 0
                                                            && shipmentStatuses.map((item, i) => {
                                                                return (
                                                                    { label: getLabelText(item.label, this.state.lang), value: item.shipmentStatusId }
                                                                )
                                                            }, this)}
                                                        disabled={this.state.loading}
                                                    /></div>

                                            </FormGroup>


                                        </div>
                                    </div>
                                </Form>
                                <Col md="12 pl-0">

                                    <div className="row" style={{ display: this.state.loading ? "none" : "block" }}>
                                        <div className="col-md-12 p-0" id="div_id">
                                            {this.state.outPutList.length > 0 &&
                                                // {true &&
                                                <div className="col-md-12">
                                                    <button className="mr-1 float-right btn btn-info btn-md showdatabtn mt-1 mb-3" onClick={this.previewPDF}>{i18n.t('static.common.preview')}</button>

                                                    <p style={{ width: '100%', height: '700px', overflow: 'hidden' }} id='pdf'></p>   </div>}

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
                                </Col>



                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default AnnualShipmentCost;
