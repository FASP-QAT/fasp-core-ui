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
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
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
                versionId: 0,
                dt: new Date(),
                includePlanningShipments: true,
                programId: '',
                versionId: ''
            },
            programs: [],
            planningUnitList: [],
            costOfInventory: [],
            versions: [],
            message: '',
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true

        }
        this.formSubmit = this.formSubmit.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);

    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    roundN = num => {
        return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }
    round = num => {
        return Number(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0));
    }

    getPrograms = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data, message: '', loading: false
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
            //             this.setState({ loading: false, message: error.message });
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
                        let costOfInventoryInput = this.state.CostOfInventoryInput;
                        costOfInventoryInput.programId = localStorage.getItem("sesProgramIdReport");
                        this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
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


    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        costOfInventoryInput.versionId = 0
        if (programId != 0) {

            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        costOfInventoryInput,
                        versions: []
                    }, () => {
                        this.setState({
                            costOfInventoryInput,
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });


                } else {
                    this.setState({
                        costOfInventoryInput,
                        versions: []
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {

                this.setState({
                    costOfInventoryInput,
                    versions: []
                })

            }
        } else {
            this.setState({
                costOfInventoryInput,
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

                console.log(verList);
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                });
                versionList.reverse();

                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
                    // this.setState({
                    //     versions: versionList,
                    //     versionId: localStorage.getItem("sesVersionIdReport")
                    // }, () => {
                    //     let costOfInventoryInput = this.state.CostOfInventoryInput;
                    //     costOfInventoryInput.versionId = localStorage.getItem("sesVersionIdReport");
                    //     this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
                    // })

                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
                    if (versionVar.length != 0) {
                        this.setState({
                            versions: versionList,
                            versionId: localStorage.getItem("sesVersionIdReport")
                        }, () => {
                            let costOfInventoryInput = this.state.CostOfInventoryInput;
                            costOfInventoryInput.versionId = localStorage.getItem("sesVersionIdReport");
                            this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
                        })
                    } else {
                        this.setState({
                            versions: versionList,
                            versionId: versionList[0].versionId
                        }, () => {
                            let costOfInventoryInput = this.state.CostOfInventoryInput;
                            costOfInventoryInput.versionId = versionList[0].versionId;
                            this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
                        })
                    }
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: versionList[0].versionId
                    }, () => {
                        let costOfInventoryInput = this.state.CostOfInventoryInput;
                        costOfInventoryInput.versionId = versionList[0].versionId;
                        this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
                    })
                }


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
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV = (columns) => {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [this.addDoubleQuoteToRowContent(headers)]
        this.state.costOfInventory.map(ele => A.push(this.addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.totalConsumption, this.round(ele.avergeStock), ele.noOfMonths, this.roundN(ele.inventoryTurns)])));

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
                doc.text(i18n.t('static.dashboard.inventoryTurns'), doc.internal.pageSize.width / 2, 60, {
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
                    doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
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

        // var canvas = document.getElementById("cool-canvas");
        //creates image

        // var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        // var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.costOfInventory.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label), this.formatter(ele.totalConsumption), this.formatter(ele.avergeStock), this.formatter(ele.noOfMonths), this.formatterDouble(ele.inventoryTurns)]);

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 96 },
            columnStyles: {
                1: { cellWidth: 281.89 },
            }
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
        var dt = new Date(`${value.year}`, `${value.month - 1}`, 1)
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

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            let costOfInventoryInput = this.state.CostOfInventoryInput;
            costOfInventoryInput.programId = this.state.programId;
            this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
            this.filterVersion();
        })

    }

    setVersionId(event) {
        this.setState({
            versionId: event.target.value
        }, () => {
            let costOfInventoryInput = this.state.CostOfInventoryInput;
            costOfInventoryInput.versionId = this.state.versionId;
            this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
        })

    }


    getMonthArray = (currentDate) => {
        var month = [];
        var curDate = currentDate.subtract(0, 'months');
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        for (var i = 1; i < 12; i++) {
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        }

        return month;
    }

    buildJExcel() {
        let costOfInventory = this.state.costOfInventory;
        // console.log("costOfInventory---->", costOfInventory);
        let costOfInventoryArray = [];
        let count = 0;

        for (var j = 0; j < costOfInventory.length; j++) {
            data = [];
            data[0] = getLabelText(costOfInventory[j].planningUnit.label, this.state.lang);
            data[1] = (costOfInventory[j].totalConsumption);
            data[2] = (costOfInventory[j].avergeStock);
            data[3] = (costOfInventory[j].noOfMonths);
            data[4] = (costOfInventory[j].inventoryTurns);

            costOfInventoryArray[count] = data;
            count++;
        }
        if (costOfInventory.length == 0) {
            data = [];
            costOfInventoryArray[0] = data;
        }
        // console.log("costOfInventoryArray---->", costOfInventoryArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = costOfInventoryArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [

                {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.totconsumption'),
                    type: 'numeric', mask: '#,##',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.avergeStock'),
                    type: 'numeric', mask: '#,##',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.noofmonth'),
                    type: 'numeric', mask: '#,##',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.inventoryTurns'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
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
                return [];
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }


    formSubmit() {
        var programId = this.state.CostOfInventoryInput.programId;
        var versionId = this.state.CostOfInventoryInput.versionId
        if (programId != 0 && versionId != 0) {
            localStorage.setItem("sesVersionIdReport", versionId);
            if (versionId.includes('Local')) {
                var startDate = moment(new Date(this.state.singleValue2.year - 1, this.state.singleValue2.month, 1));
                var endDate = moment(this.state.CostOfInventoryInput.dt);
                var db1;
                var storeOS;
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
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        this.setState({ loading: true })
                        console.log(programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var proList = []
                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        planningunitRequest.onerror = function (event) {
                            // Handle errors!
                            this.setState({
                                loading: false
                            })
                        };
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;

                            for (var i = 0, j = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    proList[j++] = myResult[i]
                                }
                            }

                            var data = []

                            var TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN = 12
                            var m = this.getMonthArray(startDate)
                            console.log('proList', proList)
                            proList.map(planningUnit => {
                                var endingBalanceArray = [];
                                var monthcnt = 0;
                                var totalConsumption = 0;
                                var totalClosingBalance = 0;
                                var reportList = []
                                for (var n = 0; n < 12; n++) {
                                    var dtstr = m[n].startDate
                                    var enddtStr = m[n].endDate

                                    var dt = dtstr
                                    var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnit.planningUnit.id && c.transDate == dt)
                                    //console.log(dtstr, ' ', enddtStr,' list',list)
                                    reportList = [...reportList, ...list]
                                    if (list.length > 0) {
                                        if (document.getElementById("includePlanningShipments").value.toString() == 'true') {
                                            endingBalanceArray[n] = list[0].closingBalance
                                            totalConsumption = totalConsumption + Number(list[0].consumptionQty == null ? 0 : list[0].consumptionQty)
                                            totalClosingBalance = totalClosingBalance + Number(list[0].closingBalance)
                                            monthcnt++
                                            // if(list[0].consumptionQty>0|| list[0].closingBalance>0){
                                            //     monthcnt++

                                            // }
                                        } else {
                                            endingBalanceArray[n] = list[0].closingBalanceWps
                                            totalConsumption = totalConsumption + Number(list[0].consumptionQty == null ? 0 : list[0].consumptionQty)
                                            monthcnt++
                                            // totalClosingBalance=totalClosingBalance+list[0].closingBalanceWps
                                            // if(list[0].consumptionQty>0|| list[0].closingBalanceWps>0){
                                            //     monthcnt++

                                            // }
                                        }
                                    } else {
                                        endingBalanceArray[n] = ''
                                    }




                                }



                                // var totalmonthincalculation = 0
                                // console.log(endingBalanceArray)

                                // for (var i = 0; i < endingBalanceArray.length; i++) {
                                //     totalClosingBalance += endingBalanceArray[i]
                                //     if (endingBalanceArray[i] != '') {
                                //         totalmonthincalculation++;
                                //     }
                                // }

                                console.log(reportList)
                                var avergeStock = monthcnt > 0 ? totalClosingBalance / (monthcnt) : 0


                                var json = {
                                    totalConsumption: totalConsumption,
                                    planningUnit: planningUnit.planningUnit,
                                    avergeStock: avergeStock,
                                    noOfMonths: monthcnt,
                                    inventoryTurns: avergeStock > 0 ? this.roundN(totalConsumption / avergeStock) : 0

                                }
                                data.push(json)


                            })
                            console.log(data)
                            this.setState({
                                costOfInventory: data
                                , message: ''
                            }, () => {
                                this.buildJExcel();
                            });
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({ loading: true })
                var inputJson = {
                    "programId": this.state.CostOfInventoryInput.programId,
                    "versionId": this.state.CostOfInventoryInput.versionId,
                    "dt": moment(this.state.CostOfInventoryInput.dt).startOf('month').format('YYYY-MM-DD'),
                    "includePlannedShipments": this.state.CostOfInventoryInput.includePlanningShipments.toString() == "true" ? 1 : 0
                }
                // AuthenticationService.setupAxiosInterceptors();
                ReportService.inventoryTurns(inputJson).then(response => {
                    console.log("costOfInentory=====>", response.data);
                    this.setState({
                        costOfInventory: response.data, message: ''
                    }, () => {
                        this.buildJExcel();
                    });
                }).catch(
                    error => {
                        this.setState({
                            costOfInventory: [],
                            loading: false
                        }, () => {
                            this.el = jexcel(document.getElementById("tableDiv"), '');
                            this.el.destroy();
                        });
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
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
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
        } else if (this.state.CostOfInventoryInput.programId == 0) {
            this.setState({ loading: false, costOfInventory: [], message: i18n.t('static.common.selectProgram') }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
        } else {
            this.setState({ loading: false, costOfInventory: [], message: i18n.t('static.program.validversion') }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
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
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
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
                style: { align: 'center', width: '480px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'totalConsumption',
                text: i18n.t('static.report.totconsumption'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatter

            },
            {
                dataField: 'avergeStock',
                text: i18n.t('static.report.avergeStock'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatter
            },
            {
                dataField: 'noOfMonths',
                text: i18n.t('static.report.noofmonth'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatter
            },
            {
                dataField: 'inventoryTurns',
                text: i18n.t('static.dashboard.inventoryTurns'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.inventoryTurns')}</strong> */}

                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleInventoryTurns() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                            <a className="card-header-action">
                                {this.state.costOfInventory.length > 0 && <div className="card-header-actions">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pt-lg-0 pb-lg-2">
                        <div className="TableCust" >
                            <div ref={ref}>

                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3 pl-0">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">
                                                    <Picker
                                                        ref="pickAMonth2"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.programMaster')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            // onChange={(e) => { this.dataChange(e); this.filterVersion(); }}
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
                                                            // onChange={(e) => { this.dataChange(e) }}
                                                            onChange={(e) => { this.setVersionId(e) }}
                                                            value={this.state.versionId}
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
                                                            onChange={(e) => { this.dataChange(e); }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>



                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                        <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }}>
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

            </div >

        );
    }

}