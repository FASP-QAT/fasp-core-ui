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
import { SECRET_KEY, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProcurementAgentService from "../../api/ProcurementAgentService";

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import MultiSelect from 'react-multi-select-component';


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
            outPutList: []
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
    }

    exportCSV(columns) {
        var csvRow = [];
        csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'));
        csvRow.push("");
        // csvRow.push(i18n.t('static.planningunit.planningunit') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'));
        // csvRow.push("");
        // csvRow.push(i18n.t('static.report.procurementAgentName') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'));
        // csvRow.push("");
        
        // console.log("this.state.planningUnitLabels===>",this.state.planningUnitLabels);
        // console.log("this.state.procurementAgentLabels===>",this.state.procurementAgentLabels);

        this.state.planningUnitLabels.map(ele =>
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push('');

        this.state.procurementAgentLabels.map(ele =>
            csvRow.push((i18n.t('static.report.procurementAgentName')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push('');


        // csvRow.push('')
        // csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        // csvRow.push('')
        // var re;
        // var A = [[("Program Name").replaceAll(' ', '%20'), ("Freight Cost Sea (%)").replaceAll(' ', '%20'), ("Freight Cost Air (%)").replaceAll(' ', '%20'), ("Plan to Draft LT (Months)").replaceAll(' ', '%20'), ("Draft to Submitted LT (Months)").replaceAll(' ', '%20'), ("Submitted to Approved LT (Months)").replaceAll(' ', '%20'), ("Approved to Shipped LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Sea LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Air LT (Months)").replaceAll(' ', '%20'), ("Arrived to Delivered LT (Months)").replaceAll(' ', '%20'), ("Total LT By Sea (Months)").replaceAll(' ', '%20'), ("Total LT By Air (Months)").replaceAll(' ', '%20')]]
        // re = this.state.procurementAgents
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        var A = [headers];

        console.log("output list--->",this.state.outPutList);
        this.state.outPutList.map(
            ele => A.push([
                (getLabelText(ele.country.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                (getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                (getLabelText(ele.procurementAgent.label, this.state.lang) ==null ? '' : getLabelText(ele.procurementAgent.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                ele.plannedSubmittedLeadTime,
                // ele.draftToSubmittedLeadTime,
                ele.submittedToApprovedLeadTime,
                ele.approvedToShippedLeadTime,
                ele.shippedToArrivedBySeaLeadTime,
                ele.shippedToArrivedByAirLeadTime,
                ele.arrivedToDeliveredLeadTime,
                ele.totalSeaLeadTime,
                ele.totalAirLeadTime,
                ele.localProcurementAgentLeadTime

                // (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'),
                // ele.stockAdjustemntQty,
                // ele.lastModifiedBy.username,
                // new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes
            ]));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = "Procurement Agent Lead Times Report.csv"
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
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
                doc.text("Procurement Agent Lead Times Report", doc.internal.pageSize.width / 2, 60, {
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
                    var planningText = doc.splitTextToSize(i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.toString(), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 110, planningText)
                   
                    planningText = doc.splitTextToSize(i18n.t('static.report.procurementAgentName') + ' : ' + this.state.procurementAgentLabels.toString(), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 130, planningText)
                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const title = "Procurement Agent Lead Times Report";
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

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.outPutList.map(ele => [
            getLabelText(ele.country.label, this.state.lang),
            getLabelText(ele.program.label, this.state.lang),
            getLabelText(ele.planningUnit.label, this.state.lang),
            getLabelText(ele.procurementAgent.label, this.state.lang),
            ele.plannedSubmittedLeadTime,
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
        let startY=150+(this.state.planningUnitLabels.length*3)+(this.state.procurementAgentLabels.length*3)
      
        let content = {
            margin: { top: 110 ,bottom:75},
            startY: startY,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 55, halign: 'center' },
            // columnStyles: {
            //     0: { cellWidth: 170 },
            //     1: { cellWidth: 171.89 },
            //     6: { cellWidth: 100 }
            // }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("Procurement Agent Lead Times Report.pdf")
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
            AuthenticationService.setupAxiosInterceptors();

            ReportService.getProcurementAgentExportData(programIds)
                .then(response => {
                    console.log(JSON.stringify(response.data));
                    this.setState({
                        procurementAgents: response.data,
                        message: ''
                    })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else if (programIds.length == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), procurementAgents: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), procurementAgents: [] });

        }
    }


    getPrograms() {
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

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        // let versionId = document.getElementById("versionId").value;
        if (programId > 0) {
            this.setState({
                planningUnits: []
            }, () => {
                // if (versionId.includes('Local')) {
                if (!navigator.onLine) {
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
                                if (myResult[i].program.id == programId) {

                                    proList[i] = myResult[i]
                                }
                            }
                            this.setState({
                                planningUnits: proList, message: ''
                            }, () => {
                                this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)


                }
                else {
                    AuthenticationService.setupAxiosInterceptors();

                    //let productCategoryId = document.getElementById("productCategoryId").value;
                    ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
                        console.log('**' + JSON.stringify(response.data))
                        this.setState({
                            planningUnits: response.data, message: ''
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
            });
        } else {
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [] });
        }
    }

    getProcurementAgent = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            ProcurementAgentService.getProcurementAgentListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        procurementAgents: response.data
                    }, () => { this.consolidatedProcurementAgentList() })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: []
                        }, () => { this.consolidatedProcurementAgentList() })
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
                    procurementAgents: proList
                })

            }.bind(this);

        }.bind(this);
    }

    fetchData = () => {
        // let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        // let plannedShipments = document.getElementById("shipmentStatusId").value;
        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
        let procurementAgentIds = this.state.procurementAgenttValues.length == this.state.procurementAgents.length ? [] : this.state.procurementAgenttValues.map(ele => (ele.value).toString());
        // let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        // let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();


        if (programId > 0 && this.state.planningUnitValues.length>0 &&this.state.procurementAgenttValues.length>0) {
            if (navigator.onLine) {
                var json = {
                    programId: parseInt(document.getElementById("programId").value),
                    planningUnitIds: planningUnitIds,
                    procurementAgentIds: procurementAgentIds
                }
                console.log("json---", json);
                // alert("in");
                AuthenticationService.setupAxiosInterceptors();
                ReportService.programLeadTimes(json)
                    .then(response => {
                        console.log("-----response", JSON.stringify(response.data));
                        var outPutList = response.data;
                        // var responseData = response.data;
                        this.setState({
                            outPutList: outPutList,
                            message:''
                        })
                    }).catch(
                        error => {
                            this.setState({
                                outPutList: []
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

            } else {
                planningUnitIds =  this.state.planningUnitValues.map(ele => (ele.value).toString());
               procurementAgentIds =  this.state.procurementAgenttValues.map(ele => (ele.value).toString());
               
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['program'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('program');
                    var programRequest = programDataOs.get(parseInt(document.getElementById("programId").value));
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
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
                                message: i18n.t('static.program.errortext')
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
                                    message: i18n.t('static.program.errortext')
                                })
                            }.bind(this);

                            papuRequest.onsuccess = function (e) {
                                var result2 = papuRequest.result;
                                console.log("3------>", result2);

                                if (procurementAgentIds.length > 0) {
                                    var procurementAgentFilteredList = []
                                    for (var i = 0; i < procurementAgentIds.length; i++) {
                                        var l = result2.filter(c => c.procurementAgent.id == procurementAgentIds[i]);
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
                                        message: i18n.t('static.program.errortext')
                                    })
                                }.bind(this);

                                paRequest.onsuccess = function (e) {
                                    var result3 = paRequest.result;
                                    console.log("4------>", result3);

                                    var outPutList = [];
                                    for (var i = 0; i < result1.length; i++) {
                                        var filteredList = result2.filter(c => c.planningUnit.id == result1[i].planningUnit.id);
                                        var localProcurementAgentLeadTime = result1[i].localProcurementLeadTime;
                                        var program = result1[i].program;
                                        for (var j = 0; j < filteredList.length; j++) {
                                            var submittedToApprovedLeadTime = (result3.filter(c => c.procurementAgentId == filteredList[j].procurementAgent.id)[0]).submittedToApprovedLeadTime;
                                            var approvedToShippedLeadTime = (result3.filter(c => c.procurementAgentId == filteredList[j].procurementAgent.id)[0]).approvedToShippedLeadTime;
                                            // var draftToSubmittedLeadTime = (result3.filter(c => c.procurementAgentId == filteredList[j].procurementAgent.id)[0]).draftToSubmittedLeadTime;

                                            var json = {
                                                planningUnit: filteredList[j].planningUnit,
                                                procurementAgent: filteredList[j].procurementAgent,
                                                localProcurementAgentLeadTime: localProcurementAgentLeadTime,
                                                approvedToShippedLeadTime: approvedToShippedLeadTime,
                                                program: program,
                                                country: result.realmCountry.country,
                                                plannedSubmittedLeadTime: result.plannedToSubmittedLeadTime,
                                                // draftToSubmittedLeadTime: draftToSubmittedLeadTime,
                                                shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                                shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                                arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                                submittedToApprovedLeadTime: submittedToApprovedLeadTime,
                                               
                                                totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(submittedToApprovedLeadTime),
                                                totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(approvedToShippedLeadTime) + parseFloat(submittedToApprovedLeadTime),
                                            }
                                            var noProcurmentAgentJson = {
                                                planningUnit: filteredList[j].planningUnit,
                                                procurementAgent: {
                                                    label: {
                                                        label_en: '',
                                                        label_fr: '',
                                                        label_sp: '',
                                                        label_pr: ''
                                                    }
                                                },
                                                localProcurementAgentLeadTime: localProcurementAgentLeadTime,
                                                approvedToShippedLeadTime: result.approvedToShippedLeadTime,
                                                program: program,
                                                country: result.realmCountry.country,
                                                plannedSubmittedLeadTime: result.plannedToSubmittedLeadTime,
                                                // draftToSubmittedLeadTime: result.draftToSubmittedLeadTime,
                                                shippedToArrivedBySeaLeadTime: result.shippedToArrivedBySeaLeadTime,
                                                shippedToArrivedByAirLeadTime: result.shippedToArrivedByAirLeadTime,
                                                arrivedToDeliveredLeadTime: result.arrivedToDeliveredLeadTime,
                                                submittedToApprovedLeadTime: result.submittedToApprovedLeadTime,
                                                totalAirLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedByAirLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                                totalSeaLeadTime: parseFloat(result.plannedToSubmittedLeadTime) + parseFloat(result.shippedToArrivedBySeaLeadTime) + parseFloat(result.arrivedToDeliveredLeadTime) + parseFloat(result.approvedToShippedLeadTime) + parseFloat(result.submittedToApprovedLeadTime),
                                            }
                                            outPutList.push(noProcurmentAgentJson);
                                            outPutList.push(json);
                                        }
                                    }
                                    console.log("outPutList------>", outPutList);
                                    this.setState({ outPutList: outPutList ,message:''});
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }

        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [] });
        }else if (this.state.planningUnitValues.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), outPutList: [] });
        }
        else {
            this.setState({ message: i18n.t('static.procurementAgent.selectProcurementAgent'), outPutList: [] });

        }
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.getPrograms();
        this.getProcurementAgent();
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
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
                return ({ label: getLabelText(item.label, this.state.lang), value: item.procurementAgentId })

            }, this);

        const columns = [
            {
                dataField: 'country.label',
                text: i18n.t('static.report.country'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '150px' }, 
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'program.label',
                text: i18n.t('static.program.program'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '200px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
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
                dataField: 'procurementAgent.label',
                text: i18n.t('static.report.procurementAgentName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '300px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
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
                text: i18n.t('static.program.submittoapproveleadtime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },

            },

            {
                dataField: 'approvedToShippedLeadTime',
                text:i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },

            },
            {
                dataField: 'shippedToArrivedBySeaLeadTime',
                text: i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },

            },
            {
                dataField: 'shippedToArrivedByAirLeadTime',
                text: i18n.t('static.realmcountry.shippedToArrivedAirLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },

            },
            {
                dataField: 'arrivedToDeliveredLeadTime',
                text: i18n.t('static.realmcountry.arrivedToDeliveredLeadTime'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },

            },
            {
                dataField: 'totalSeaLeadTime',
                text:i18n.t('static.report.totalSeaLeadTime'),
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
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
                    <CardBody className="pt-lg-0">
                        {/* <div ref={ref}> */}
                        <br />
                        <Form >
                            <Col md="12 pl-0">
                                <div className="d-md-flex Selectdiv2">
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
                                    <FormGroup className="">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="programId"
                                                    id="programId"
                                                    bsSize="sm"
                                                    // onChange={this.filterVersion}
                                                    onChange={(e) => { this.getPlanningUnit(); }}
                                                >
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {programs.length > 0
                                                        && programs.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.programId}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label> */}
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')} <span className="reportsmalldropdown-box-icon  fa fa-sort-desc ml-1"></span></Label>

                                        <div className="controls SelectGo">
                                                <MultiSelect
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="md"
                                                    value={this.state.planningUnitValues}
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                />
                                            
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.procurementAgentName')}</Label> */}
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.procurementAgentName')} <span className="reportdown-box-icon fa fa-sort-desc ml-0"></span></Label>

                                        <div className="controls SelectGo">
                                                <MultiSelect
                                                    name="procurementAgentId"
                                                    id="procurementAgentId"
                                                    bsSize="md"
                                                    value={this.state.procurementAgenttValues}
                                                    onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                                    options={procurementAgentList && procurementAgentList.length > 0 ? procurementAgentList : []}
                                                />
                                        </div>
                                    </FormGroup>
                                </div>
                            </Col>
                        </Form>
                        {/* <br /><br /><br /> */}
                        <ToolkitProvider
                            keyField="id"
                            data={this.state.outPutList}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (

                                    <div className="TableCust">
                                        <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(tabelOptions)}
                                            /* rowEvents={{
                                                 onClick: (e, row, rowIndex) => {
                                                     this.editRegion(row);
                                                 }
                                             }}*/
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>

                        {/* </div> */}

                    </CardBody>
                </Card>

            </div>
        );
    }
}
export default SupplierLeadTimes
