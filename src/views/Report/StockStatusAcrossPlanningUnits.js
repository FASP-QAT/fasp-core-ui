import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import Picker from 'react-month-picker';
import { MultiSelect } from 'react-multi-select-component';
import { Card, CardBody, Form, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
const ref = React.createRef();
export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
export const DEFAULT_MAX_MONTHS_OF_STOCK = 18
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const legendcolor = [{ text: i18n.t('static.report.stockout'), color: "#BA0C2F", value: 0 },
{ text: i18n.t('static.report.lowstock'), color: "#f48521", value: 1 },
{ text: i18n.t('static.report.okaystock'), color: "#118b70", value: 2 },
{ text: i18n.t('static.report.overstock'), color: "#edb944", value: 3 },
{ text: i18n.t('static.supplyPlanFormula.na'), color: "#cfcdc9", value: 4 }
];
class StockStatusAcrossPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            programs: [],
            versions: [],
            planningUnits: [],
            data: [],
            selData: [],
            lang: localStorage.getItem('lang'),
            tracerCategories: [],
            tracerCategoryValues: [],
            tracerCategoryLabels: [],
            planningUnitList: [],
            loading: true,
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            programId: '',
            versionId: '',
            jexcelData: []
        }
        this.buildJExcel = this.buildJExcel.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
    }
    getTracerCategoryList() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        if (programId > 0 && versionId != 0) {
            localStorage.setItem("sesVersionIdReport", versionId);
            if (versionId.includes('Local')) {
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
                    planningunitRequest.onerror = function (event) {
                    };
                    planningunitRequest.onsuccess = function (e) {
                        var myResult = [];
                        myResult = planningunitRequest.result.filter(c => c.active == true);
                        var programId = (document.getElementById("programId").value).split("_")[0];
                        var proList = []
                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId) {
                                proList.push(myResult[i].planningUnit)
                            }
                        }
                        this.setState({ programPlanningUnitList: myResult })
                        var planningunitTransaction1 = db1.transaction(['planningUnit'], 'readwrite');
                        var planningunitOs1 = planningunitTransaction1.objectStore('planningUnit');
                        var planningunitRequest1 = planningunitOs1.getAll();
                        planningunitRequest1.onerror = function (event) {
                        };
                        planningunitRequest1.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest1.result;
                            var flList = []
                            for (var i = 0; i < myResult.length; i++) {
                                for (var j = 0; j < proList.length; j++) {
                                    if (myResult[i].planningUnitId == proList[j].id) {
                                        flList.push(myResult[i].forecastingUnit)
                                        planningList.push(myResult[i])
                                    }
                                }
                            }
                            var tcList = [];
                            flList.filter(function (item) {
                                var i = tcList.findIndex(x => x.id == item.tracerCategory.id);
                                if (i <= -1 && item.tracerCategory.id != 0) {
                                    tcList.push({ id: item.tracerCategory.id, label: item.tracerCategory.label });
                                }
                                return null;
                            });
                            var lang = this.state.lang;
                            this.setState({
                                tracerCategories: tcList.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                planningUnitList: planningList
                            }, () => { this.fetchData() })
                        }.bind(this);
                    }.bind(this);
                }.bind(this)
            }
            else {
                DropdownService.getTracerCategoryForMultipleProgramsDropdownList([programId]).then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            tracerCategories: listArray
                        }, () => { this.fetchData() })
                    }
                }).catch(
                    error => {
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
            }
        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                productCategories: [],
                tracerCategories: []
            })
        }
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV = (columns) => {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.common.month') + ' : ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        this.state.tracerCategoryLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory')).replaceAll(' ', '%20') + ' : ' + (ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });
        var A = [this.addDoubleQuoteToRowContent(headers)]
        this.state.jexcelData.map(ele => A.push(this.addDoubleQuoteToRowContent([ele[9], (ele[0].replaceAll(',', ' ')).replaceAll(' ', '%20'), ele[1] == 1 ? i18n.t('static.report.mos') : i18n.t('static.report.qty'), ele[2].replaceAll(' ', '%20'), ele[3], ele[4], ele[5], ele[6], ele[7], ele[8] != null && ele[8] != '' ? new moment(ele[8]).format('MMM-yy') : ''])));
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
                doc.text(i18n.t('static.dashboard.stockstatusacrossplanningunit'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.common.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    var planningText = doc.splitTextToSize((i18n.t('static.tracercategory.tracercategory') + ' : ' + this.state.tracerCategoryLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 170, planningText)
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.jexcelData.map(ele => [ele[9], ele[0], ele[1] == 1 ? i18n.t('static.report.mos') : i18n.t('static.report.qty'), ele[2], this.formatter(ele[3]), ele[4] != i18n.t("static.supplyPlanFormula.na") && ele[4] != "-" ? this.roundN(ele[4]) : ele[4], isNaN(ele[5]) || ele[5] == undefined ? '' : this.formatterDouble(ele[5]), isNaN(ele[6]) || ele[6] == undefined ? '' : this.formatterDouble(ele[6]), isNaN(ele[7]) || ele[7] == null ? '' : this.formatterAMC(ele[7]), ele[8] != null && ele[8] != '' ? new moment(ele[8]).format('MMM-yy') : '']);
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 70 },
            columnStyles: {
                1: { cellWidth: 161.89 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".pdf")
    }
    getPrograms = () => {
        if (localStorage.getItem("sessionType") === 'Online') {
            let realmId = AuthenticationService.getRealmId();
            DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
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
            this.consolidatedProgramList()
            this.setState({ loading: false })
        }
    }
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
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
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
                        this.filterVersion()
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
    filterVersion = () => {
        let programId = this.state.programId;
        if (programId != 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            if (program.length == 1) {
                if (localStorage.getItem("sessionType") === 'Online') {
                    DropdownService.getVersionListForProgram(PROGRAM_TYPE_SUPPLY_PLAN, programId)
                        .then(response => {
                            this.setState({
                                versions: []
                            }, () => {
                                this.setState({
                                    versions: response.data
                                }, () => {
                                    this.consolidatedVersionList(programId)
                                });
                            });
                        }).catch(
                            error => {
                                this.setState({
                                    programs: [], loading: false
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion
                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)
                    }
                }
                var versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })
                versionList.reverse();
                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
                    if (versionVar != '' && versionVar != undefined) {
                        this.setState({
                            versions: versionList,
                            versionId: localStorage.getItem("sesVersionIdReport")
                        }, () => {
                            this.getTracerCategoryList();
                        })
                    } else {
                        this.setState({
                            versions: versionList,
                            versionId: versionList[0].versionId
                        }, () => {
                            this.getTracerCategoryList();
                        })
                    }
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: versionList[0].versionId
                    }, () => {
                        this.getTracerCategoryList();
                    })
                }
            }.bind(this);
        }.bind(this)
    }
    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 1)) / Math.pow(10, 1)).toFixed(1);
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
    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
    }
    handleAMonthDissmis2 = (value) => {
        this.setState({ singleValue2: value, }, () => {
            this.fetchData();
        })
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
            this.filterVersion()
        })
    }
    setVersionId(event) {
        this.setState({
            versionId: event.target.value
        }, () => {
            this.getTracerCategoryList()
        })
    }
    roundAMC(amc) {
        if (amc != null) {
            if (Number(amc).toFixed(0) >= 100) {
                return Number(amc).toFixed(0);
            } else if (Number(amc).toFixed(1) >= 10) {
                return Number(amc).toFixed(1);
            } else if (Number(amc).toFixed(2) >= 1) {
                return Number(amc).toFixed(2);
            } else {
                return Number(amc).toFixed(3);
            }
        } else {
            return null;
        }
    }
    formatterAMC(value) {
        if (value != null) {
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
        else {
            return ''
        }
    }
    buildJExcel() {
        let dataStockStatus = this.state.data;
        let dataArray = [];
        let count = 0;
        for (var j = 0; j < dataStockStatus.length; j++) {
            let data1 = '';
            if (dataStockStatus[j].planBasedOn == 1) {
                if (dataStockStatus[j].mos == null) {
                    data1 = i18n.t('static.supplyPlanFormula.na')
                }
                else if (this.roundN(dataStockStatus[j].mos) == 0) {
                    data1 = i18n.t('static.report.stockout')
                } else {
                    if (this.roundN(dataStockStatus[j].mos) < dataStockStatus[j].minMos) {
                        data1 = i18n.t('static.report.lowstock')
                    } else if (this.roundN(dataStockStatus[j].mos) > dataStockStatus[j].maxMos) {
                        data1 = i18n.t('static.report.overstock')
                    } else {
                        data1 = i18n.t('static.report.okaystock')
                    }
                }
            } else {
                if (dataStockStatus[j].stock == null) {
                    data1 = i18n.t('static.supplyPlanFormula.na')
                }
                else if (this.roundN(dataStockStatus[j].stock) == 0) {
                    data1 = i18n.t('static.report.stockout')
                } else {
                    if (this.roundN(dataStockStatus[j].stock) < dataStockStatus[j].minMos) {
                        data1 = i18n.t('static.report.lowstock')
                    } else if (this.roundN(dataStockStatus[j].stock) > dataStockStatus[j].maxMos) {
                        data1 = i18n.t('static.report.overstock')
                    } else {
                        data1 = i18n.t('static.report.okaystock')
                    }
                }
            }
            data = [];
            data[0] = getLabelText(dataStockStatus[j].planningUnit.label, this.state.lang)
            data[1] = dataStockStatus[j].planBasedOn;
            data[2] = data1;
            data[3] = (dataStockStatus[j].stock);
            data[4] = dataStockStatus[j].planBasedOn == 1 ? dataStockStatus[j].mos != null ? this.roundN(dataStockStatus[j].mos) : i18n.t("static.supplyPlanFormula.na") : "-";
            data[5] = (dataStockStatus[j].minMos);
            data[6] = (dataStockStatus[j].maxMos);
            data[7] = this.roundAMC(dataStockStatus[j].amc);
            data[8] = (dataStockStatus[j].lastStockCount ? moment(dataStockStatus[j].lastStockCount).format('YYYY-MM-DD') : null);
            data[9] = dataStockStatus[j].planningUnit.id
            dataArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [150, 100, 80, 80, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.programPU.planBasedOn'),
                    type: 'dropdown',
                    source: [{ id: 1, name: i18n.t('static.report.mos') }, { id: 2, name: i18n.t('static.report.qty') }],
                },
                {
                    title: i18n.t('static.report.withinstock'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.stock'),
                    type: 'numeric', mask: '#,##',
                },
                {
                    title: i18n.t('static.report.mos'),
                    type: 'text'
                },
                {
                    title: i18n.t('static.report.minMosOrQty'),
                    type: 'numeric', mask: '#,##.0', decimal: '.',
                },
                {
                    title: i18n.t('static.report.maxMosOrQty'),
                    type: 'numeric', mask: '#,##.0', decimal: '.',
                },
                {
                    title: i18n.t('static.report.amc'),
                    type: 'numeric', mask: '#,##.000', decimal: '.',
                },
                {
                    title: i18n.t('static.supplyPlan.lastinventorydt'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' },
                    width: 120
                },
                {
                    title: i18n.t('static.report.amc'),
                    type: 'hidden'
                },
            ],
            editable: false,
            updateTable: function (el, cell, x, y, source, value, id) {
            }.bind(this),
            onload: this.loaded,
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
            languageEl: languageEl, loading: false, jexcelData: data
        })
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson();
        var colArrB = ['C', 'D', 'E'];
        for (var j = 0; j < json.length; j++) {
            var rowData = elInstance.getRowData(j);
            var mos = rowData[1] == 1 ? parseFloat(rowData[4]) : rowData[3];
            var minMos = parseFloat(rowData[5]);
            var maxMos = parseFloat(rowData[6]);
            if (mos == 0) {
                for (var i = 0; i < colArrB.length; i++) {
                    var cell = elInstance.getCell(`${colArrB[i]}${parseInt(j) + 1}`);
                    cell.classList.add('legendColor0');
                }
            } else if (rowData[4] == i18n.t("static.supplyPlanFormula.na")) {
                for (var i = 0; i < colArrB.length; i++) {
                    var cell = elInstance.getCell(`${colArrB[i]}${parseInt(j) + 1}`);
                    cell.classList.add('legendColor4');
                }
            } else if (mos < minMos) {
                for (var i = 0; i < colArrB.length; i++) {
                    var cell = elInstance.getCell(`${colArrB[i]}${parseInt(j) + 1}`);
                    cell.classList.add('legendColor1');
                }
            } else if (mos > maxMos) {
                for (var i = 0; i < colArrB.length; i++) {
                    var cell = elInstance.getCell(`${colArrB[i]}${parseInt(j) + 1}`);
                    cell.classList.add('legendColor3');
                }
            } else {
                for (var i = 0; i < colArrB.length; i++) {
                    var cell = elInstance.getCell(`${colArrB[i]}${parseInt(j) + 1}`);
                    cell.classList.add('legendColor2');
                }
            }
            if (rowData[1] == 2) {
                var cell = elInstance.getCell(`E${parseInt(j) + 1}`);
                cell.classList.add('legendColor4');
            }
        }
    }
    filterDataAsperstatus = () => {
        let stockStatusId = document.getElementById("stockStatusId").value;
        var filteredData = []
        if (stockStatusId != -1) {
            this.state.selData.map(ele => {
                var min = ele.minMos
                var max = ele.maxMos
                if (stockStatusId == 0) {
                    if ((ele.mos != null && this.roundN(ele.mos) == 0)) {
                        filteredData.push(ele)
                    }
                } else if (stockStatusId == 1) {
                    if ((ele.mos != null && this.roundN(ele.mos) != 0 && this.roundN(ele.mos) < min)) {
                        filteredData.push(ele)
                    }
                } else if (stockStatusId == 3) {
                    if (this.roundN(ele.mos) > max) {
                        filteredData.push(ele)
                    }
                } else if (stockStatusId == 2) {
                    if (this.roundN(ele.mos) < max && this.roundN(ele.mos) > min) {
                        filteredData.push(ele)
                    }
                } else if (stockStatusId == 4) {
                    if (ele.mos == null) {
                        filteredData.push(ele)
                    }
                }
            });
        } else {
            filteredData = this.state.selData
        }
        this.setState({
            data: filteredData
        }, () => { this.buildJExcel(); })
    }
    handleTracerCategoryChange = (tracerCategoryIds) => {
        tracerCategoryIds = tracerCategoryIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            tracerCategoryValues: tracerCategoryIds.map(ele => ele),
            tracerCategoryLabels: tracerCategoryIds.map(ele => ele.label)
        }, () => {
            this.fetchData()
        })
    }
    fetchData = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month - 1, 1));
        let endDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month - 1, new Date(this.state.singleValue2.year, this.state.singleValue2.month, 0).getDate()));
        let includePlanningShipments = document.getElementById("includePlanningShipments").value
        let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());
        if (programId != 0 && versionId != 0 && this.state.tracerCategoryValues.length > 0) {
            if (versionId.includes('Local')) {
                this.setState({ loading: true })
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        loading: false
                    })
                }.bind(this);
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
                    programRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (event) {
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                        var realmTransaction = db1.transaction(['realm'], 'readwrite');
                        var realmOs = realmTransaction.objectStore('realm');
                        var realmRequest = realmOs.get(programJson.realmCountry.realm.realmId);
                        realmRequest.onerror = function (event) {
                            this.setState({
                                loading: false,
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        realmRequest.onsuccess = function (event) {
                            var maxForMonths = 0;
                            var realm = realmRequest.result;
                            this.state.planningUnitList.map(planningUnit => {
                                var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnit.planningUnitId);
                                var programJson = {}
                                if (planningUnitDataIndex != -1) {
                                    var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnit.planningUnitId))[0];
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
                                this.state.tracerCategoryValues.map(tc => {
                                    if (tc.value == planningUnit.forecastingUnit.tracerCategory.id) {
                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnitId);
                                        let moments = (inventoryList.filter(c => moment(c.inventoryDate).isBefore(endDate) || moment(c.inventoryDate).isSame(endDate))).map(d => moment(d.inventoryDate))
                                        var maxDate = moments.length > 0 ? moment.max(moments) : ''
                                        var dtstr = startDate.startOf('month').format('YYYY-MM-DD')
                                        var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnit.planningUnitId && c.transDate == dtstr)
                                        var pu = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == planningUnit.planningUnitId)[0];
                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                        var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > pu.minMonthsOfStock) {
                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                        } else {
                                            maxForMonths = pu.minMonthsOfStock
                                        }
                                        var minStockMoS = parseInt(maxForMonths);
                                        var minForMonths = 0;
                                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + pu.reorderFrequencyInMonths)) {
                                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                        } else {
                                            minForMonths = (maxForMonths + pu.reorderFrequencyInMonths);
                                        }
                                        var maxStockMoS = parseInt(minForMonths);
                                        if (maxStockMoS < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                                            maxStockMoS = DEFAULT_MIN_MAX_MONTHS_OF_STOCK;
                                        }
                                        if (list.length > 0) {
                                            var json = {
                                                planningUnit: { id: planningUnit.planningUnitId, label: planningUnit.label },
                                                lastStockCount: maxDate == '' ? '' : maxDate.format('MMM-DD-YYYY'),
                                                mos: includePlanningShipments.toString() == 'true' ? list[0].mos != null ? this.roundN(list[0].mos) : null : (list[0].amc > 0) ? (list[0].closingBalanceWps / list[0].amc) : null,
                                                minMos: pu.planBasedOn == 1 ? minStockMoS : list[0].minStock,
                                                maxMos: pu.planBasedOn == 1 ? maxStockMoS : list[0].maxStock,
                                                stock: includePlanningShipments.toString() == 'true' ? list[0].closingBalance : list[0].closingBalanceWps,
                                                amc: list[0].amc,
                                                planBasedOn: pu.planBasedOn
                                            }
                                            data.push(json)
                                        } else {
                                            var json = {
                                                planningUnit: { id: planningUnit.planningUnitId, label: planningUnit.label },
                                                lastStockCount: maxDate == '' ? '' : maxDate.format('MMM-DD-YYYY'),
                                                mos: null,
                                                minMos: pu.planBasedOn == 1 ? minStockMoS : pu.minStock,
                                                maxMos: pu.planBasedOn == 1 ? maxStockMoS : "",
                                                stock: 0,
                                                amc: 0,
                                                planBasedOn: pu.planBasedOn
                                            }
                                            data.push(json)
                                        }
                                    }
                                })
                            })
                            this.setState({
                                selData: data,
                                message: ''
                            }, () => {
                                this.filterDataAsperstatus();
                            });
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({ loading: true });
                var inputjson = {
                    "programId": programId,
                    "versionId": versionId,
                    "dt": startDate.startOf('month').format('YYYY-MM-DD'),
                    "includePlannedShipments": includePlanningShipments.toString() == "true" ? 1 : 0,
                    "tracerCategoryIds": tracercategory
                }
                ReportService.stockStatusForProgram(inputjson)
                    .then(response => {
                        this.setState({
                            selData: response.data, message: ''
                        }, () => {
                            this.filterDataAsperstatus()
                        });
                    }).catch(
                        error => {
                            this.setState({
                                selData: [], loading: false, jexcelData: []
                            }, () => {
                                this.el = jexcel(document.getElementById("tableDiv"), '');
                                jexcel.destroy(document.getElementById("tableDiv"), true);
                            });
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
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [], selData: [], jexcelData: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [], selData: [], jexcelData: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        } else {
            this.setState({ message: i18n.t('static.tracercategory.tracercategoryText'), data: [], selData: [], jexcelData: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        }
    }
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { singleValue2 } = this.state
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {(item.programCode)}
                    </option>
                )
            }, this);
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                    </option>
                )
            }, this);
        const { tracerCategories } = this.state;
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const columns = [
            {
                text: i18n.t('static.report.qatPID'),
            },
            {
                text: i18n.t('static.dashboard.product'),
            },
            {
                text: i18n.t('static.programPU.planBasedOn'),
            },
            {
                text: i18n.t('static.report.withinstock'),
            },
            {
                text: i18n.t('static.report.stock'),
            },
            {
                text: i18n.t('static.report.mos'),
            }
            ,
            {
                text: i18n.t('static.report.minMosOrQty'),
            }
            ,
            {
                text: i18n.t('static.report.maxMosOrQty'),
            },
            {
                text: i18n.t('static.report.amc'),
            },
            {
                text: i18n.t('static.supplyPlan.lastinventorydt'),
            }
        ];
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon pb-2">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleStockStatusAcrossPlaningUnit() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                            <a className="card-header-action">
                                {this.state.data.length > 0 && <div className="card-header-actions">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0 ">
                        <div className="" >
                            <div ref={ref}>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.setProgramId(e); }}
                                                            value={this.state.programId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.versionFinal*')}</Label>
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="includePlanningShipments"
                                                            id="includePlanningShipments"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.fetchData() }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">
                                                    <MultiSelect
                                                        name="tracerCategoryId"
                                                        id="tracerCategoryId"
                                                        bsSize="sm"
                                                        value={this.state.tracerCategoryValues}
                                                        onChange={(e) => { this.handleTracerCategoryChange(e) }}
                                                        disabled={this.state.loading}
                                                        options=
                                                        {tracerCategories.length > 0 ?
                                                            tracerCategories.map((item, i) => {
                                                                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
                                                            }, this) : []} />
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.withinstock')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="stockStatusId"
                                                            id="stockStatusId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.filterDataAsperstatus() }}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.all')}</option>
                                                            {legendcolor.length > 0
                                                                && legendcolor.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.value}>
                                                                            {item.text}
                                                                        </option>
                                                                    )
                                                                }, this)
                                                            }
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-10 mt-2 " style={{ display: this.state.display }}>
                                                <ul className="legendcommitversion list-group">
                                                    {
                                                        legendcolor.map(item1 => (
                                                            <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                                                        ))
                                                    }
                                                </ul>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                        <div className="ReportSearchMarginTop consumptionDataEntryTable" >
                            <div id="tableDiv" className="jexcelremoveReadonlybackground TableWidth100" style={{ display: this.state.loading ? "none" : "block" }}>
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
            </div >
        );
    }
}
export default StockStatusAcrossPlanningUnits;
