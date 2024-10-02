import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { MultiSelect } from 'react-multi-select-component';
import {
    Card, CardBody,
    FormGroup,
    Input,
    InputGroup, Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, filterOptions } from '../../CommonComponent/JavascriptCommonFunctions';
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions';
/**
 * Component for Supplier Lead Times Report.
 */
class SupplierLeadTimes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
            procurementAgents: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: '',
            planningUnits: [],
            versions: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            procurementAgenttValues: [],
            procurementAgentLabels: [],
            outPutList: [],
            loading: true,
            programId: ''
        };
        this.getPrograms = this.getPrograms.bind(this);
        this.consolidatedProgramList = this.consolidatedProgramList.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.getProcurementAgent = this.getProcurementAgent.bind(this);
        this.consolidatedProcurementAgentList = this.consolidatedProcurementAgentList.bind(this);
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this);
        this.handleProcurementAgentChange = this.handleProcurementAgentChange.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.setprogramId = this.setprogramId.bind(this);
    }
    /**
     * Builds the jexcel table based on the output list of lead time data.
     */
    buildJexcel() {
        let outPutList = this.state.outPutList;
        let outPutArray = [];
        let count = 0;
        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            data[0] = getLabelText(outPutList[j].planningUnit.label, this.state.lang)
            data[1] = outPutList[j].procurementAgent.code
            data[2] = outPutList[j].plannedToSubmittedLeadTime
            data[3] = outPutList[j].submittedToApprovedLeadTime
            data[4] = outPutList[j].approvedToShippedLeadTime
            data[5] = outPutList[j].shippedToArrivedByRoadLeadTime
            data[6] = outPutList[j].shippedToArrivedBySeaLeadTime
            data[7] = outPutList[j].shippedToArrivedByAirLeadTime
            data[8] = outPutList[j].arrivedToDeliveredLeadTime
            data[9] = outPutList[j].totalRoadLeadTime
            data[10] = outPutList[j].totalSeaLeadTime
            data[11] = outPutList[j].totalAirLeadTime
            data[12] = outPutList[j].localProcurementAgentLeadTime
            outPutArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = outPutArray;
        var options = {
            data: data,
            columnDrag: false,
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.procurementAgentName'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.plannedToSubmitLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentapprovetosubmittime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.shippedToArrivedRoadLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.shippedToArrivedSeaLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.shippedToArrivedAirLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.shipment.arrivedToreceivedLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.totalRoadLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.totalSeaLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.totalAirLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.localProcurementAgentLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
            ],
            nestedHeaders: [
                [{
                    title: '',
                    rowspan: '1',
                }, {
                    title: '',
                    rowspan: '1',
                },
                {
                    title: i18n.t('static.dashboard.months'),
                    colspan: '9',
                },
                ],
            ],
            editable: false,
            onload: loadedForNonEditableTables,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }
    /**
     * Exports the data to a CSV file.
     * @param {array} columns - The columns to be exported.
     */
    exportCSV(columns) {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"');
        csvRow.push("");
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('');
        this.state.procurementAgentLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.report.procurementAgentName') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('');
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        var A = [addDoubleQuoteToRowContent(headers)];
        this.state.outPutList.map(
            ele => A.push(addDoubleQuoteToRowContent([
                ele.planningUnit.id,
                getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(' ', '%20'),
                (ele.procurementAgent.code == null ? '' : ele.procurementAgent.code.replaceAll(',', ' ')).replaceAll(' ', '%20'),
                ele.plannedToSubmittedLeadTime == undefined || ele.plannedToSubmittedLeadTime == null ? '' : ele.plannedToSubmittedLeadTime,
                ele.submittedToApprovedLeadTime == null ? '' : ele.submittedToApprovedLeadTime,
                ele.approvedToShippedLeadTime == null ? '' : ele.approvedToShippedLeadTime,
                ele.shippedToArrivedByRoadLeadTime == null ? '' : ele.shippedToArrivedByRoadLeadTime,
                ele.shippedToArrivedBySeaLeadTime == null ? '' : ele.shippedToArrivedBySeaLeadTime,
                ele.shippedToArrivedByAirLeadTime == null ? '' : ele.shippedToArrivedByAirLeadTime,
                ele.arrivedToDeliveredLeadTime == null ? '' : ele.arrivedToDeliveredLeadTime,
                ele.totalRoadLeadTime == undefined || ele.totalRoadLeadTime == null ? '' : ele.totalRoadLeadTime,
                ele.totalSeaLeadTime == undefined || ele.totalSeaLeadTime == null ? '' : ele.totalSeaLeadTime,
                ele.totalAirLeadTime == undefined || ele.totalAirLeadTime == null ? '' : ele.totalAirLeadTime,
                ele.localProcurementAgentLeadTime == null ? '' : ele.localProcurementAgentLeadTime
            ])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.supplierLeadTimes').concat('.csv')
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Exports the data to a PDF file.
     * @param {array} columns - The columns to be exported.
     */
    exportPDF = (columns) => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6)
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
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.supplierLeadTimes'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal')
        doc.setTextColor("#002f6c");
        var y = 110;
        var planningText = doc.splitTextToSize(i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.toString(), doc.internal.pageSize.width * 3 / 4);
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.report.procurementAgentName') + ' : ' + this.state.procurementAgentLabels.toString(), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        doc.setFontSize(8);
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        let startY = y
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        doc.setTextColor("#fff");
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.outPutList.map(ele => [
            ele.planningUnit.id,
            getLabelText(ele.planningUnit.label, this.state.lang),
            ele.procurementAgent.code,
            ele.plannedToSubmittedLeadTime,
            ele.submittedToApprovedLeadTime,
            ele.approvedToShippedLeadTime,
            ele.shippedToArrivedByRoadLeadTime,
            ele.shippedToArrivedBySeaLeadTime,
            ele.shippedToArrivedByAirLeadTime,
            ele.arrivedToDeliveredLeadTime,
            ele.totalRoadLeadTime,
            ele.totalSeaLeadTime,
            ele.totalAirLeadTime,
            ele.localProcurementAgentLeadTime
        ]);
        let content = {
            margin: { top: 110, bottom: 95 },
            startY: startYtable,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 47, halign: 'center' },
            columnStyles: {
                1: { cellWidth: 138.89 }
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.supplierLeadTimes').concat('.pdf'));
    }
    /**
     * Handles the change event for planning units.
     * @param {array} planningUnitIds - The selected planning unit IDs.
     */
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
    /**
     * Handles the change event for procurement agents.
     * @param {array} procurementAgentIds - The selected procurement agent IDs.
     */
    handleProcurementAgentChange = (procurementAgentIds) => {
        procurementAgentIds = procurementAgentIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgenttValues: procurementAgentIds.map(ele => ele),
            procurementAgentLabels: procurementAgentIds.map(ele => ele.label)
        }, () => {
            this.fetchData()
        })
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms() {
        if (localStorage.getItem("sessionType") === 'Online') {
            let realmId = AuthenticationService.getRealmId();
            DropdownService.getSPProgramBasedOnRealmId(realmId)
                .then(response => {
                    var proList = []
                    for (var i = 0; i < response.data.length; i++) {
                        var programJson = {
                            programId: response.data[i].id,
                            label: response.data[i].label,
                            programCode: response.data[i].code
                        }
                        proList[i] = programJson
                    }
                    this.setState({
                        programs: proList, loading: false
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        } else {
            this.setState({ loading: false })
            this.consolidatedProgramList()
        }
    }
    /**
     * Consolidates the list of programs obtained from Server and local program.
     */
    consolidatedProgramList = () => {
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].programId == programData.programId) {
                                f = 1;
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                    }
                }
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = a.programCode.toLowerCase();
                            b = b.programCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.getPlanningUnit();
                        this.getProcurementAgent();
                    })
                } else {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = a.programCode.toLowerCase();
                            b = b.programCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    })
                }
            }.bind(this);
        }.bind(this);
    }
    /**
     * Retrieves the list of planning units for a selected program.
     */
    getPlanningUnit = () => {
        let programId = this.state.programId;
        if (programId > 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            this.setState({
                planningUnits: [],
                planningUnitValues: [],
                procurementAgents: [],
                procurementAgenttValues: []
            }, () => {
                if (!(localStorage.getItem("sessionType") === 'Online')) {
                    var db1;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        planningunitRequest.onerror = function (event) {
                        };
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            var programId = (document.getElementById("programId").value).split("_")[0];
                            var proList = []
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    proList[i] = myResult[i].planningUnit
                                }
                            }
                            var lang = this.state.lang;
                            this.setState({
                                planningUnits: proList.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), message: ''
                            }, () => {
                                this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)
                }
                else {
                    var programJson = {
                        tracerCategoryIds: [],
                        programIds: [programId]
                    }
                    DropdownService.getProgramPlanningUnitDropdownList(programJson).then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray,
                            message: ''
                        }, () => {
                            this.fetchData();
                        })
                    }).catch(
                        error => {
                            this.setState({
                                planningUnits: [],
                            })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
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
            });
        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'), outPutList: [], planningUnits: [],
                planningUnitValues: []
            },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                })
        }
    }
    /**
     * Retrieves the list of procurement agents for a selected program.
     */
    getProcurementAgent = () => {
        let programId = document.getElementById("programId").value;
        if (localStorage.getItem("sessionType") === 'Online') {
            var programJson = [programId]
            DropdownService.getProcurementAgentDropdownListForFilterMultiplePrograms(programJson)
                .then(response => {
                    var procurementAgent = response.data
                    var listArrays = [];
                    for (var i = 0; i < procurementAgent.length; i++) {
                        for (var j = 0; j < procurementAgent[i].length; j++) {
                            listArrays.push(procurementAgent[i]);
                        }
                    }
                    this.setState({
                        procurementAgents: listArrays, loading: false
                    }, () => { this.consolidatedProcurementAgentList() })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: [], loading: false
                        }, () => { this.consolidatedProcurementAgentList() })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        } else {
            this.setState({ loading: false })
            this.consolidatedProcurementAgentList()
        }
    }
    /**
     * Consolidates the list of procurement agents obtained from server and local.
     */
    consolidatedProcurementAgentList = () => {
        const { procurementAgents } = this.state
        var proList = procurementAgents;
        let programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procuremntAgent = transaction.objectStore('procurementAgent');
            var getRequest = procuremntAgent.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                for (var i = 0; i < myResult.length; i++) {
                    var f = 0
                    for (var k = 0; k < this.state.procurementAgents.length; k++) {
                        if (this.state.procurementAgents[k].id == myResult[i].procurementAgentId) {
                            f = 1;
                        }
                    }
                    var programData = myResult[i];
                    if (f == 0) {
                        proList.push(programData)
                    }
                }
                var listArray = proList;
                var listArrays = [];
                for (var i = 0; i < listArray.length; i++) {
                    for (var j = 0; j < listArray[i].programList.length; j++) {
                        if (listArray[i].programList[j].id == programId) {
                            var arr = {
                                id: listArray[i].procurementAgentId,
                                label: listArray[i].label,
                                code: listArray[i].procurementAgentCode
                            }
                            listArrays.push(arr);
                        }
                    }
                }
                this.setState({
                    procurementAgents: listArrays.sort(function (a, b) {
                        a = a.code.toLowerCase();
                        b = b.code.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                })
            }.bind(this);
        }.bind(this);
    }
    /**
     * Fetches data based on selected programs, planning units, and procurement agents.
     */
    fetchData = () => {
        let programId = document.getElementById("programId").value;
        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
        let procurementAgentIds = this.state.procurementAgenttValues.map(ele => (ele.value).toString());
        if (programId > 0 && this.state.planningUnitValues.length > 0 && this.state.procurementAgenttValues.length > 0) {
            if (localStorage.getItem("sessionType") === 'Online') {
                this.setState({ loading: true })
                var json = {
                    programId: parseInt(document.getElementById("programId").value),
                    planningUnitIds: planningUnitIds,
                    procurementAgentIds: procurementAgentIds
                }
                ReportService.programLeadTimes(json)
                    .then(response => {
                        var outPutList = response.data;
                        this.setState({
                            outPutList: outPutList,
                            message: ''
                        }, () => { this.buildJexcel() })
                    }).catch(
                        error => {
                            this.setState({
                                outPutList: [], loading: false
                            },
                                () => {
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    jexcel.destroy(document.getElementById("tableDiv"), true);
                                })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
            } else {
                planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString());
                procurementAgentIds = this.state.procurementAgenttValues.map(ele => (ele.value).toString());
                this.setState({ loading: true })
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['program'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('program');
                    var programRequest = programDataOs.get(parseInt(document.getElementById("programId").value));
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var result = programRequest.result;
                        var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var ppuOs = ppuTransaction.objectStore('programPlanningUnit');
                        var ppuRequest = ppuOs.getAll();
                        ppuRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        ppuRequest.onsuccess = function (e) {
                            var result1 = (ppuRequest.result).filter(c => c.program.id == parseInt(programId));
                            if (planningUnitIds.length > 0) {
                                var planningUnitfilteredList = [];
                                for (var i = 0; i < planningUnitIds.length; i++) {
                                    var l = result1.filter(c => c.planningUnit.id == planningUnitIds[i]);
                                    for (var j = 0; j < l.length; j++) {
                                        planningUnitfilteredList.push(l[j]);
                                    }
                                }
                                result1 = planningUnitfilteredList;
                            }
                            var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                            var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                            var papuRequest = papuOs.getAll();
                            papuRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext'),
                                    loading: false
                                })
                            }.bind(this);
                            papuRequest.onsuccess = function (e) {
                                var result2;
                                if (procurementAgentIds.length > 0) {
                                    var procurementAgentFilteredList = []
                                    for (var i = 0; i < procurementAgentIds.length; i++) {
                                        var l = (papuRequest.result).filter(c => c.procurementAgent.id == parseInt(procurementAgentIds[i]));
                                        for (var j = 0; j < l.length; j++) {
                                            procurementAgentFilteredList.push(l[j]);
                                        }
                                    }
                                    result2 = procurementAgentFilteredList;
                                }
                                var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                var paOs = paTransaction.objectStore('procurementAgent');
                                var paRequest = paOs.getAll();
                                paRequest.onerror = function (event) {
                                    this.setState({
                                        message: i18n.t('static.program.errortext'),
                                        loading: false
                                    })
                                }.bind(this);
                                paRequest.onsuccess = function (e) {
                                    var result3 = paRequest.result;
                                    var outPutList = [];
                                    for (var i = 0; i < result1.length; i++) {
                                        var localProcurementAgentLeadTime = result1[i].localProcurementLeadTime;
                                        var program = result1[i].program;
                                        for (var k = 0; k < procurementAgentIds.length; k++) {
                                            var submittedToApprovedLeadTime = (result3.filter(c => c.procurementAgentId == procurementAgentIds[k])[0]).submittedToApprovedLeadTime;
                                            var approvedToShippedLeadTime = (result3.filter(c => c.procurementAgentId == procurementAgentIds[k])[0]).approvedToShippedLeadTime;
                                            var json = {
                                                planningUnit: result1[i].planningUnit,
                                                procurementAgent: {
                                                    code: (result3.filter(c => c.procurementAgentId == procurementAgentIds[k])[0]).procurementAgentCode
                                                },
                                                localProcurementAgentLeadTime: '',
                                                approvedToShippedLeadTime: approvedToShippedLeadTime,
                                                program: program,
                                                country: result.realmCountry.country,
                                                plannedToSubmittedLeadTime: result.plannedToSubmittedLeadTime,
                                                shippedToArrivedByRoadLeadTime: result.shippedToArrivedByRoadLeadTime,
                                                shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                                shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                                arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                                submittedToApprovedLeadTime: submittedToApprovedLeadTime,
                                                totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(submittedToApprovedLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime),
                                                totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(submittedToApprovedLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime),
                                                totalRoadLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(submittedToApprovedLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(result.shippedToArrivedByRoadLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime),
                                            }
                                            outPutList.push(json);
                                        }
                                        var noProcurmentAgentJson = {
                                            planningUnit: result1[i].planningUnit,
                                            procurementAgent: {
                                                label: {
                                                    label_en: '',
                                                    label_fr: '',
                                                    label_sp: '',
                                                    label_pr: ''
                                                },
                                                code: 'Not Selected'
                                            },
                                            localProcurementAgentLeadTime: '',
                                            approvedToShippedLeadTime: result.approvedToShippedLeadTime,
                                            program: program,
                                            country: result.realmCountry.country,
                                            plannedToSubmittedLeadTime: result.plannedToSubmittedLeadTime,
                                            shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                            shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                            shippedToArrivedByRoadLeadTime: result.shippedToArrivedByRoadLeadTime,
                                            arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                            submittedToApprovedLeadTime: result.submittedToApprovedLeadTime,
                                            totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                            totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                            totalRoadLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedByRoadLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                        }
                                        var localProcurmentAgentJson = {
                                            planningUnit: result1[i].planningUnit,
                                            procurementAgent: {
                                                label: {
                                                    label_en: '',
                                                    label_fr: '',
                                                    label_sp: '',
                                                    label_pr: ''
                                                },
                                                code: 'Local'
                                            },
                                            localProcurementAgentLeadTime: localProcurementAgentLeadTime,
                                            approvedToShippedLeadTime: '',
                                            program: '',
                                            country: '',
                                            plannedToSubmittedLeadTime: '',
                                            shippedToArrivedBySeaLeadTime: '',
                                            shippedToArrivedByRoadLeadTime: '',
                                            shippedToArrivedByAirLeadTime: '',
                                            arrivedToDeliveredLeadTime: '',
                                            submittedToApprovedLeadTime: '',
                                            totalAirLeadTime: '',
                                            totalSeaLeadTime: '',
                                            totalRoadLeadTime: '',
                                        }
                                        outPutList.push(noProcurmentAgentJson);
                                        outPutList.push(localProcurmentAgentJson);
                                    }
                                    this.setState({ outPutList: outPutList, message: '', loading: false }, () => { this.buildJexcel() })
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [] },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                })
        } else if (this.state.planningUnitValues.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), outPutList: [] },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                })
        }
        else {
            if (this.state.procurementAgents.length == 0) {
                this.setState({ message: i18n.t('static.procurementAgent.procurementAgentNotMappedWithProgram'), outPutList: [] },
                    () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    })
            } else {
                this.setState({ message: i18n.t('static.procurementAgent.selectProcurementAgent'), outPutList: [] },
                    () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    })
            }
        }
    }
    /**
     * Calls the get programs function on page load
     */
    componentDidMount() {
        this.getPrograms();
    }
    /**
     * Sets the selected program ID and triggers fetching of planning units and procurement agents.
     * @param {object} event - The event object containing information about the program selection.
     */
    setprogramId(event) {
        this.setState({
            programId: event.target.value
        }, () => {
            this.getPlanningUnit();
            this.getProcurementAgent();
        })
    }
    /**
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    /**
     * Renders the Suppliers Lead Time report table.
     * @returns {JSX.Element} - Suppliers Lead Time report table.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const { programs } = this.state;
        const { versions } = this.state;
        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
            }, this);
        const { procurementAgents } = this.state
        let procurementAgentList = procurementAgents.length > 0
            && procurementAgents.map((item, i) => {
                return ({ label: item.code, value: item.id })
            }, this);
        const columns = [
            {
                dataField: 'planningUnit.id',
                text: i18n.t('static.report.qatPID'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' }
            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.planningunit.planningunit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '200px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'procurementAgent.procurementAgentCode',
                text: i18n.t('static.report.procurementAgentName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '300px' },
            },
            {
                dataField: 'plannedSubmittedLeadTime',
                text: i18n.t('static.report.plannedToSubmitLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'submittedToApprovedLeadTime',
                text: i18n.t('static.procurementagent.procurementagentapprovetosubmittime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'approvedToShippedLeadTime',
                text: i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'shippedToArrivedByRoadLeadTime',
                text: i18n.t('static.report.shippedToArrivedRoadLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'shippedToArrivedBySeaLeadTime',
                text: i18n.t('static.report.shippedToArrivedSeaLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'shippedToArrivedByAirLeadTime',
                text: i18n.t('static.report.shippedToArrivedAirLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'arrivedToDeliveredLeadTime',
                text: i18n.t('static.shipment.arrivedToreceivedLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'totalRoadLeadTime',
                text: i18n.t('static.report.totalRoadLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'totalSeaLeadTime',
                text: i18n.t('static.report.totalSeaLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'totalAirLeadTime',
                text: i18n.t('static.report.totalAirLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'localProcurementAgentLeadTime',
                text: i18n.t('static.report.localProcurementAgentLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
        ];
        const tabelOptions = {
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
                text: 'All', value: this.state.outPutList.length
            }]
        }
        return (
            <div className="animated" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />}
                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pt-lg-0 ">
                        <div className="pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3 px-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={(e) => { this.setprogramId(e); }}
                                                value={this.state.programId}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programs.length > 0
                                                    && programs.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.programId}>
                                                                {(item.programCode)}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')} </Label>
                                    <div className="controls">
                                        <MultiSelect
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="md"
                                            filterOptions={filterOptions}
                                            value={this.state.planningUnitValues}
                                            onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                            options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                            disabled={this.state.loading}
                                        />
                                    </div>
                                </FormGroup>
                                {procurementAgentList.length > 0 && <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.procurementAgentName')} </Label>
                                    <div className="controls">
                                        <MultiSelect
                                            name="procurementAgentId"
                                            id="procurementAgentId"
                                            bsSize="md"
                                            filterOptions={filterOptions}
                                            value={this.state.procurementAgenttValues}
                                            onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                            options={procurementAgentList && procurementAgentList.length > 0 ? procurementAgentList : []}
                                            disabled={this.state.loading}
                                        />
                                    </div>
                                </FormGroup>}
                            </div>
                        </div>
                        <div className="ReportSearchMarginTop SupplierLeadTable">
                            <div id="tableDiv" className="mt-5 jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                </Card>
            </div>
        );
    }
}
export default SupplierLeadTimes
