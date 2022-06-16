import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { Component, lazy } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {
    Card, CardBody,
    // CardFooter,
    CardHeader, Col, Form, FormGroup, InputGroup, Label, Table, Input
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import getLabelText from '../../CommonComponent/getLabelText';
import { LOGO } from '../../CommonComponent/Logo.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Online } from 'react-detect-offline';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProcurementAgentService from "../../api/ProcurementAgentService";

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {MultiSelect} from 'react-multi-select-component';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';

// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();
const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

class SupplierLeadTimes extends Component {
    constructor(props) {
        super(props);

        this.toggledata = this.toggledata.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

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
        this.filterData = this.filterData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.handleChangeProgram = this.handleChangeProgram.bind(this);
        this.consolidatedProgramList = this.consolidatedProgramList.bind(this);
        this.filterVersion = this.filterVersion.bind(this);
        this.consolidatedVersionList = this.consolidatedVersionList.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.getProcurementAgent = this.getProcurementAgent.bind(this);
        this.consolidatedProcurementAgentList = this.consolidatedProcurementAgentList.bind(this);
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this);
        this.handleProcurementAgentChange = this.handleProcurementAgentChange.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.setprogramId = this.setprogramId.bind(this);
    }
    buildJexcel() {

        let outPutList = this.state.outPutList;
        console.log("outPutList---->", outPutList);
        let outPutArray = [];
        let count = 0;

        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            console.log("outPutList[j].totalSeaLeadTime-----------------", outPutList[j].totalSeaLeadTime);
            // data[0] = getLabelText(outPutList[j].program.label, this.state.lang)
            data[0] = getLabelText(outPutList[j].planningUnit.label, this.state.lang)
            data[1] = outPutList[j].procurementAgent.code
            data[2] = outPutList[j].plannedToSubmittedLeadTime
            data[3] = outPutList[j].submittedToApprovedLeadTime
            data[4] = outPutList[j].approvedToShippedLeadTime
            data[5] = outPutList[j].shippedToArrivedBySeaLeadTime

            data[6] = outPutList[j].shippedToArrivedByAirLeadTime
            data[7] = outPutList[j].arrivedToDeliveredLeadTime
            data[8] = outPutList[j].totalSeaLeadTime
            data[9] = outPutList[j].totalAirLeadTime
            data[10] = outPutList[j].localProcurementAgentLeadTime
            // data[13] = outPutList[j].
            outPutArray[count] = data;
            count++;
        }
        // if (outPutList.length == 0) {
        //     data = [];
        //     outPutArray[0] = data;
        // }
        // console.log("outPutArray---->", outPutArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = outPutArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [

                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.report.procurementAgentName'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.plannedToSubmitLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                // {
                //     title: 'Draft To Submitted Lead Time',
                //     type: 'text',
                //     readOnly: true
                // },
                {
                    title: i18n.t('static.procurementagent.procurementagentapprovetosubmittime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.shippedToArrivedSeaLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.shippedToArrivedAirLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.shipment.arrivedToreceivedLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.totalSeaLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.totalAirLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.localProcurementAgentLeadTime'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
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
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
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

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

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


        // csvRow.push('')
        // csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        // csvRow.push('')
        // var re;
        // var A = [[("Program Name").replaceAll(' ', '%20'), ("Freight Cost Sea (%)").replaceAll(' ', '%20'), ("Freight Cost Air (%)").replaceAll(' ', '%20'), ("Plan to Draft LT (Months)").replaceAll(' ', '%20'), ("Draft to Submitted LT (Months)").replaceAll(' ', '%20'), ("Submitted to Approved LT (Months)").replaceAll(' ', '%20'), ("Approved to Shipped LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Sea LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Air LT (Months)").replaceAll(' ', '%20'), ("Arrived to Delivered LT (Months)").replaceAll(' ', '%20'), ("Total LT By Sea (Months)").replaceAll(' ', '%20'), ("Total LT By Air (Months)").replaceAll(' ', '%20')]]
        // re = this.state.procurementAgents
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        var A = [this.addDoubleQuoteToRowContent(headers)];

        console.log("output list--->", this.state.outPutList);
        this.state.outPutList.map(
            ele => A.push(this.addDoubleQuoteToRowContent([
                //  (getLabelText(ele.country.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                //     (getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                ele.planningUnit.id,
                getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(' ', '%20'),
                (ele.procurementAgent.code == null ? '' : ele.procurementAgent.code.replaceAll(',', ' ')).replaceAll(' ', '%20'),
                ele.plannedToSubmittedLeadTime == undefined || ele.plannedToSubmittedLeadTime == null ? '' : ele.plannedToSubmittedLeadTime,
                // ele.draftToSubmittedLeadTime,
                ele.submittedToApprovedLeadTime == null ? '' : ele.submittedToApprovedLeadTime,
                ele.approvedToShippedLeadTime == null ? '' : ele.approvedToShippedLeadTime,
                ele.shippedToArrivedBySeaLeadTime == null ? '' : ele.shippedToArrivedBySeaLeadTime,
                ele.shippedToArrivedByAirLeadTime == null ? '' : ele.shippedToArrivedByAirLeadTime,
                ele.arrivedToDeliveredLeadTime == null ? '' : ele.arrivedToDeliveredLeadTime,
                ele.totalSeaLeadTime == undefined || ele.totalSeaLeadTime == null ? '' : ele.totalSeaLeadTime,
                ele.totalAirLeadTime == undefined || ele.totalAirLeadTime == null ? '' : ele.totalAirLeadTime,
                ele.localProcurementAgentLeadTime == null ? '' : ele.localProcurementAgentLeadTime

                // (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'),
                // ele.stockAdjustemntQty,
                // ele.lastModifiedBy.username,
                // new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes
            ])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.supplierLeadTimes').concat('.csv')
        // 'Procurement Agent Lead Times.csv'
        document.body.appendChild(a)
        a.click()
    }


    exportPDF = (columns) => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            // doc.setFont('helvetica', 'bold')
            // doc.setFontSize(6)
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

                    // doc.setFontSize(8)
                    // var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
                    // doc.text(doc.internal.pageSize.width / 8, 90, planningText);

                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
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
        doc.setFont('helvetica', 'normal')
        doc.setTextColor("#002f6c");
        var y = 110;
        var planningText = doc.splitTextToSize(i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.toString(), doc.internal.pageSize.width * 3 / 4);
        //doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
            console.log(y)
        }
        planningText = doc.splitTextToSize(i18n.t('static.report.procurementAgentName') + ' : ' + this.state.procurementAgentLabels.toString(), doc.internal.pageSize.width * 3 / 4);
        //doc.text(doc.internal.pageSize.width / 8, 130, planningText)
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
            console.log(y)
        }

        doc.setFontSize(8);
        const title = i18n.t('static.dashboard.supplierLeadTimes');
        // var canvas = document.getElementById("cool-canvas");
        //creates image
        // var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        // var aspectwidth1 = (width - h1);
        // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');
        // const headers = [["Program Name", "Freight Cost Sea (%)", "Freight Cost Air (%)", "Plan to Draft LT (Months)", "Draft to Submitted LT (Months)", "Submitted to Approved LT (Months)", "Approved to Shipped LT (Months)", "Shipped to Arrived by Sea LT (Months)", "Shipped to Arrived by Air LT (Months)", "Arrived to Delivered LT (Months)", "Total LT By Sea (Months)", "Total LT By Air (Months)"]]
        // const data = this.state.procurementAgents.map(elt => [getLabelText(elt.label), elt.seaFreightPerc, elt.airFreightPerc, elt.plannedToDraftLeadTime, elt.draftToSubmittedLeadTime, elt.submittedToApprovedLeadTime, elt.approvedToShippedLeadTime, elt.shippedToArrivedBySeaLeadTime, elt.shippedToArrivedByAirLeadTime, elt.arrivedToDeliveredLeadTime, (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedBySeaLeadTime + elt.arrivedToDeliveredLeadTime), (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedByAirLeadTime + elt.arrivedToDeliveredLeadTime)]);
        let startY = y
        console.log('startY', startY)
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        doc.setTextColor("#fff");


        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.outPutList.map(ele => [
            //  getLabelText(ele.country.label, this.state.lang),
            //   getLabelText(ele.program.label, this.state.lang),
            ele.planningUnit.id,
            getLabelText(ele.planningUnit.label, this.state.lang),
            ele.procurementAgent.code,
            ele.plannedToSubmittedLeadTime,
            // ele.draftToSubmittedLeadTime,
            ele.submittedToApprovedLeadTime,
            ele.approvedToShippedLeadTime,
            ele.shippedToArrivedBySeaLeadTime,
            ele.shippedToArrivedByAirLeadTime,
            ele.arrivedToDeliveredLeadTime,
            ele.totalSeaLeadTime,
            ele.totalAirLeadTime,
            ele.localProcurementAgentLeadTime
        ]);
        // let startY=150+(this.state.planningUnitLabels.length*3)+(this.state.procurementAgentLabels.length*3)

        let content = {
            margin: { top: 110, bottom: 95 },
            startY: startYtable,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 57, halign: 'center' },
            columnStyles: {
                // 0: { cellWidth: 170 },
                // 1: { cellWidth: 171.89 },
                1: { cellWidth: 138.89 }
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.supplierLeadTimes').concat('.pdf'));
    }


    handleChangeProgram(programIds) {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            // this.filterData(this.state.rangeValue)
        })

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
            procurementAgenttValues: procurementAgentIds.map(ele => ele),
            procurementAgentLabels: procurementAgentIds.map(ele => ele.label)
        }, () => {
            this.fetchData()
        })
    }

    filterData(rangeValue) {
        setTimeout('', 10000);
        let programIds = this.state.programValues;
        if (programIds.length > 0) {
            this.setState({ loading: true })
            // AuthenticationService.setupAxiosInterceptors();

            ReportService.getProcurementAgentExportData(programIds)
                .then(response => {
                    console.log(JSON.stringify(response.data));
                    this.setState({
                        procurementAgents: response.data,
                        message: '',
                        loading: false
                    })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: [],
                            loading: false
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
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
            //             procurementAgents: [],
            //             loading: false
            //         })

            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError', loading: false });
            //                     break;
            //             }
            //         }
            //     }
            // );
        } else if (programIds.length == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), procurementAgents: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), procurementAgents: [] });

        }
    }


    getPrograms() {
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
            //                     this.setState({ message: 'static.unkownError', loading: false });
            //                     break;
            //             }
            //         }
            //     }
            // );
        } else {
            console.log('offline')
            this.setState({ loading: false })
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
                        this.getPlanningUnit();
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
    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        // outPutList: []

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
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })

            }.bind(this);
        }.bind(this)
    }

    getPlanningUnit = () => {

        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        // alert(programId);
        // let versionId = document.getElementById("versionId").value;
        if (programId > 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            this.setState({
                planningUnits: [],
                planningUnitValues: [],
                // procurementAgents: [],
                // procurementAgenttValues:[]

            }, () => {
                // if (versionId.includes('Local')) {
                if (!isSiteOnline()) {
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
                    // this.setState({planningUnits:[]});
                    //let productCategoryId = document.getElementById("productCategoryId").value;
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        console.log('**' + JSON.stringify(response.data));
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                    // .catch(
                    //     error => {
                    //         this.setState({
                    //             planningUnits: [],
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
                    //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                    //                     break;
                    //                 default:
                    //                     this.setState({ message: 'static.unkownError' });
                    //                     break;
                    //             }
                    //         }
                    //     }
                    // );
                }
            });
        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'), outPutList: [], planningUnits: [],
                planningUnitValues: []
            },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })
        }
    }

    getProcurementAgent = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProcurementAgentService.getProcurementAgentListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    var procurementAgent = response.data
                    //  procurementAgent.push({ procurementAgentCode: 'No Procurement Agent', procurementAgentId: 0 })
                    this.setState({
                        procurementAgents: procurementAgent, loading: false
                    }, () => { this.consolidatedProcurementAgentList() })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: [], loading: false
                        }, () => { this.consolidatedProcurementAgentList() })
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
            //             procurementAgents: [], loading: false
            //         }, () => { this.consolidatedProcurementAgentList() })
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
            //                     this.setState({ message: 'static.unkownError', loading: false });
            //                     break;
            //             }
            //         }
            //     }
            // );

        } else {
            console.log('offline')
            this.setState({ loading: false })
            this.consolidatedProcurementAgentList()
        }

    }

    consolidatedProcurementAgentList = () => {
        const lan = 'en';
        const { procurementAgents } = this.state
        var proList = procurementAgents;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procuremntAgent = transaction.objectStore('procurementAgent');
            var getRequest = procuremntAgent.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                // console.log("ProcurementAgentMyResult------>>>>", myResult);
                for (var i = 0; i < myResult.length; i++) {

                    var f = 0
                    for (var k = 0; k < this.state.procurementAgents.length; k++) {
                        if (this.state.procurementAgents[k].procurementAgentId == myResult[i].procurementAgentId) {
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
                    procurementAgents: proList.sort(function (a, b) {
                        a = a.procurementAgentCode.toLowerCase();
                        b = b.procurementAgentCode.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                })

            }.bind(this);

        }.bind(this);
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    fetchData = () => {
        // let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        // let plannedShipments = document.getElementById("shipmentStatusId").value;
        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
        let procurementAgentIds = this.state.procurementAgenttValues.length == this.state.procurementAgents.length ? [] : this.state.procurementAgenttValues.map(ele => (ele.value).toString());
        // let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        // let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();


        if (programId > 0 && this.state.planningUnitValues.length > 0 && this.state.procurementAgenttValues.length > 0) {
            if (isSiteOnline()) {
                this.setState({ loading: true })
                var json = {
                    programId: parseInt(document.getElementById("programId").value),
                    planningUnitIds: planningUnitIds,
                    procurementAgentIds: procurementAgentIds
                }
                console.log("json---", json);
                // alert("in");
                // AuthenticationService.setupAxiosInterceptors();
                ReportService.programLeadTimes(json)
                    .then(response => {
                        console.log("-----response", JSON.stringify(response.data));
                        var outPutList = response.data;
                        // var responseData = response.data;
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
                                    this.el.destroy();
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
                //             outPutList: [], loading: false
                //         },
                //             () => {
                //                 this.el = jexcel(document.getElementById("tableDiv"), '');
                //                 this.el.destroy();
                //             })
                //         if (error.message === "Network Error") {
                //             this.setState({ message: error.message, loading: false });
                //         } else {
                //             switch (error.response ? error.response.status : "") {
                //                 case 500:
                //                 case 401:
                //                 case 404:
                //                 case 406:
                //                 case 412:
                //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
                //                     break;
                //                 default:
                //                     this.setState({ message: 'static.unkownError', loading: false });
                //                     break;
                //             }
                //         }
                //     }
                // );

            } else {
                planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString());
                procurementAgentIds = this.state.procurementAgenttValues.map(ele => (ele.value).toString());
                this.setState({ loading: true })

                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
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
                        console.log("1------>", result);

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
                                        // console.log("------status", l[j].shipmentStatus.id);
                                        planningUnitfilteredList.push(l[j]);
                                    }
                                }
                                result1 = planningUnitfilteredList;
                            }
                            console.log("2------>", result1);

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
                                console.log("procurementAgentIds------>", procurementAgentIds);

                                if (procurementAgentIds.length > 0) {
                                    var procurementAgentFilteredList = []
                                    for (var i = 0; i < procurementAgentIds.length; i++) {
                                        var l = (papuRequest.result).filter(c => c.procurementAgent.id == parseInt(procurementAgentIds[i]));
                                        console.log("l------------", l);
                                        for (var j = 0; j < l.length; j++) {
                                            procurementAgentFilteredList.push(l[j]);
                                        }
                                        console.log("procurementAgentFilteredList---", procurementAgentFilteredList)
                                    }
                                    result2 = procurementAgentFilteredList;
                                }
                                console.log("my result ===", (papuRequest.result).filter(c => c.procurementAgent.id == 2))
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
                                    console.log("result3------>", result3);
                                    // this.setState({ loading: true })
                                    var outPutList = [];
                                    console.log("result1---", result1);
                                    console.log("result2---", result2)
                                    for (var i = 0; i < result1.length; i++) {
                                        var filteredList = result2.filter(c => c.planningUnit.id == result1[i].planningUnit.id);
                                        var localProcurementAgentLeadTime = result1[i].localProcurementLeadTime;
                                        console.log("result1[i].localProcurementLeadTime---", result1[i].localProcurementLeadTime);
                                        console.log("filteredList----", filteredList);
                                        var program = result1[i].program;

                                        for (var k = 0; k < procurementAgentIds.length; k++) {
                                            var submittedToApprovedLeadTime = (result3.filter(c => c.procurementAgentId == procurementAgentIds[k])[0]).submittedToApprovedLeadTime;
                                            var approvedToShippedLeadTime = (result3.filter(c => c.procurementAgentId == procurementAgentIds[k])[0]).approvedToShippedLeadTime;
                                            // var draftToSubmittedLeadTime = (result3.filter(c => c.procurementAgentId == filteredList[j].procurementAgent.id)[0]).draftToSubmittedLeadTime;
                                            // console.log("filteredList[j]-------", filteredList[j])
                                            console.log("procurementAgent filtered---", (result3.filter(c => c.procurementAgentId == procurementAgentIds[k])[0]));
                                            // var json;
                                            // for(){
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
                                                // draftToSubmittedLeadTime: draftToSubmittedLeadTime,
                                                shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                                shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                                arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                                submittedToApprovedLeadTime: submittedToApprovedLeadTime,

                                                totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(submittedToApprovedLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime),
                                                totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(submittedToApprovedLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime),
                                            }
                                            // }

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
                                            // draftToSubmittedLeadTime: result.draftToSubmittedLeadTime,
                                            shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                            shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                            arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                            submittedToApprovedLeadTime: result.submittedToApprovedLeadTime,
                                            totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                            totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
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
                                            // draftToSubmittedLeadTime: result.draftToSubmittedLeadTime,
                                            shippedToArrivedBySeaLeadTime: '',
                                            shippedToArrivedByAirLeadTime: '',
                                            arrivedToDeliveredLeadTime: '',
                                            submittedToApprovedLeadTime: '',
                                            totalAirLeadTime: '',
                                            totalSeaLeadTime: '',
                                        }
                                        outPutList.push(noProcurmentAgentJson);
                                        outPutList.push(localProcurmentAgentJson);

                                        // for (var j = 0; j < filteredList.length; j++) {
                                        // var submittedToApprovedLeadTime = (result3.filter(c => c.procurementAgentId == filteredList[j].procurementAgent.id)[0]).submittedToApprovedLeadTime;
                                        //     var approvedToShippedLeadTime = (result3.filter(c => c.procurementAgentId == filteredList[j].procurementAgent.id)[0]).approvedToShippedLeadTime;
                                        //     // var draftToSubmittedLeadTime = (result3.filter(c => c.procurementAgentId == filteredList[j].procurementAgent.id)[0]).draftToSubmittedLeadTime;
                                        //     console.log("filteredList[j]-------", filteredList[j])
                                        //     console.log("filteredList[j].procurementAgent---", filteredList[j].procurementAgent);
                                        //     // var json;
                                        //     // for(){
                                        //     var json = {
                                        //         planningUnit: filteredList[j].planningUnit,
                                        //         procurementAgent: filteredList[j].procurementAgent,
                                        //         localProcurementAgentLeadTime: '',
                                        //         approvedToShippedLeadTime: approvedToShippedLeadTime,
                                        //         program: program,
                                        //         country: result.realmCountry.country,
                                        //         plannedToSubmittedLeadTime: result.plannedToSubmittedLeadTime,
                                        //         // draftToSubmittedLeadTime: draftToSubmittedLeadTime,
                                        //         shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                        //         shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                        //         arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                        //         submittedToApprovedLeadTime: submittedToApprovedLeadTime,

                                        //         totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(submittedToApprovedLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime),
                                        //         totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(submittedToApprovedLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime),
                                        //     }
                                        //     // }
                                        //     var noProcurmentAgentJson = {
                                        //         planningUnit: filteredList[j].planningUnit,
                                        //         procurementAgent: {
                                        //             label: {
                                        //                 label_en: '',
                                        //                 label_fr: '',
                                        //                 label_sp: '',
                                        //                 label_pr: ''
                                        //             },
                                        //             code: 'Not Selected'
                                        //         },
                                        //         localProcurementAgentLeadTime: '',
                                        //         approvedToShippedLeadTime: result.approvedToShippedLeadTime,
                                        //         program: program,
                                        //         country: result.realmCountry.country,
                                        //         plannedToSubmittedLeadTime: result.plannedToSubmittedLeadTime,
                                        //         // draftToSubmittedLeadTime: result.draftToSubmittedLeadTime,
                                        //         shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                        //         shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                        //         arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                        //         submittedToApprovedLeadTime: result.submittedToApprovedLeadTime,
                                        //         totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                        //         totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                        //     }
                                        //     var localProcurmentAgentJson = {
                                        //         planningUnit: filteredList[j].planningUnit,
                                        //         procurementAgent: {
                                        //             label: {
                                        //                 label_en: '',
                                        //                 label_fr: '',
                                        //                 label_sp: '',
                                        //                 label_pr: ''
                                        //             },
                                        //             code: 'Local'
                                        //         },
                                        //         localProcurementAgentLeadTime: localProcurementAgentLeadTime,
                                        //         approvedToShippedLeadTime: '',
                                        //         program: '',
                                        //         country: '',
                                        //         plannedToSubmittedLeadTime: '',
                                        //         // draftToSubmittedLeadTime: result.draftToSubmittedLeadTime,
                                        //         shippedToArrivedBySeaLeadTime: '',
                                        //         shippedToArrivedByAirLeadTime: '',
                                        //         arrivedToDeliveredLeadTime: '',
                                        //         submittedToApprovedLeadTime: '',
                                        //         totalAirLeadTime: '',
                                        //         totalSeaLeadTime: '',
                                        //     }
                                        //     outPutList.push(noProcurmentAgentJson);
                                        //     outPutList.push(localProcurmentAgentJson);
                                        //     outPutList.push(json);
                                        // }
                                    }
                                    console.log("outPutList------>", outPutList);
                                    this.setState({ outPutList: outPutList, message: '', loading: false }, () => { this.buildJexcel() })
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }

        } else if (programId == 0) {
            console.log("inside destroy");
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [] },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();

                })
        } else if (this.state.planningUnitValues.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), outPutList: [] },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })
        }
        else {
            this.setState({ message: i18n.t('static.procurementAgent.selectProcurementAgent'), outPutList: [] },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

        }
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.getPrograms();
        this.getProcurementAgent();
    }

    setprogramId(event) {
        this.setState({
            programId: event.target.value
        }, () => {
            this.getPlanningUnit();
        })

    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { programs } = this.state;
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);

        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        const { procurementAgents } = this.state
        let procurementAgentList = procurementAgents.length > 0
            && procurementAgents.map((item, i) => {
                return ({ label: item.procurementAgentCode, value: item.procurementAgentId })

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
                // formatter: (cell, row) => {
                //     return getLabelText(cell, this.state.lang);
                // }
            },
            {
                dataField: 'plannedSubmittedLeadTime',
                text: i18n.t('static.report.plannedToSubmitLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },

            },
            // {
            //     dataField: 'draftToSubmittedLeadTime',
            //     text: 'Draft To Submitted Lead Time',
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     style: { width: '80px' },

            // },

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
                dataField: 'totalSeaLeadTime',
                text: i18n.t('static.report.totalSeaLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },

            },
            // totalAirLeadTime: parseInt(result.plannedToDraftLeadTime) + parseInt(result.draftToSubmittedLeadTime) + parseInt(result.shippedToArrivedByAirLeadTime) + parseInt(result.arrivedToDeliveredLeadTime) + parseInt(result.approvedToShippedLeadTime) + parseInt(submittedToApprovedLeadTime),
            // totalSeaLeadTime: parseInt(result.plannedToDraftLeadTime) + parseInt(result.draftToSubmittedLeadTime) + parseInt(result.shippedToArrivedBySeaLeadTime) + parseInt(result.arrivedToDeliveredLeadTime) + parseInt(result.approvedToShippedLeadTime) + parseInt(submittedToApprovedLeadTime),
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
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.supplierLeadTimes')}</strong> */}
                        {/* <i className="icon-menu"></i><strong>Procurement Agent Lead Times</strong> */}
                        {/* {this.state.procurementAgents.length > 0 &&  */}
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />}
                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />}
                            </a>
                        </div>
                        {/* } */}
                    </div>
                    <CardBody className="pt-lg-0 pb-lg-5">
                        {/* <div ref={ref}> */}
                        {/* <Form> */}
                        <div className="pl-0">
                            <div className="row">
                                {/* <Online>
                                        <FormGroup className="tab-ml-1">
                                            <Label htmlFor="appendedInputButton">Country</Label>
                                            <div className="controls SelectGo">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="countryId"
                                                        id="countryId"
                                                        bsSize="sm"
                                                    // onChange={this.filterData}
                                                    >
                                                        <option value="0">Please Select </option>
                                                        <option value="0">Malawi </option>

                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </Online> */}
                                <FormGroup className="col-md-3 pl-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                // onChange={this.filterVersion}
                                                // onChange={(e) => { this.getPlanningUnit(); }}
                                                onChange={(e) => { this.setprogramId(e); }}
                                                value={this.state.programId}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programs.length > 0
                                                    && programs.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.programId}>
                                                                {/* {getLabelText(item.label, this.state.lang)} */}
                                                                {(item.programCode)}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    {/* <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label> */}
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')} </Label>

                                    <div className="controls">
                                        <MultiSelect
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="md"
                                            value={this.state.planningUnitValues}
                                            onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                            options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                            disabled={this.state.loading}
                                        />

                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.procurementAgentName')}</Label> */}
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.procurementAgentName')} </Label>

                                    <div className="controls">
                                        <MultiSelect
                                            name="procurementAgentId"
                                            id="procurementAgentId"
                                            bsSize="md"
                                            value={this.state.procurementAgenttValues}
                                            onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                            options={procurementAgentList && procurementAgentList.length > 0 ? procurementAgentList : []}
                                            disabled={this.state.loading}
                                        />
                                    </div>
                                </FormGroup>
                            </div>
                        </div>
                        {/* </Form> */}
                        <div className="ReportSearchMarginTop">
                            <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }}>
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


                        {/* </div> */}

                    </CardBody>
                </Card>

            </div>
        );
    }
}
export default SupplierLeadTimes
