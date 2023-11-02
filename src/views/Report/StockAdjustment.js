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
import { Card, CardBody, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT_SM, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
class StockAdjustmentComponent extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            programs: [],
            versions: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            data: [],
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: ''
        }
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
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
                        this.filterVersion();
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
        this.fetchData();
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
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })
                versionList.reverse();
                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
                    if (versionVar.length != 0) {
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
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
            } else {
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
                            planningUnits: listArray, message: ''
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
            }
        });
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
    handleRangeChange(value, text, listIndex) {
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData()
        })
    }
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    formatter = (value) => {
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
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV(columns) {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.versionFinal*').replaceAll(' ', '%20') + '  :  ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        var A = [this.addDoubleQuoteToRowContent(headers)]
        this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.dataSource.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.planningUnit.id, (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format(DATE_FORMAT_CAP_FOUR_DIGITS)).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format(`${DATE_FORMAT_CAP_FOUR_DIGITS}`), ele.notes != null ? (ele.notes).replaceAll(' ', '%20') : ''])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.stockAdjustment') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
                doc.text(i18n.t('static.report.stockAdjustment'), doc.internal.pageSize.width / 2, 60, {
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
                    doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 150, planningText)
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(8);
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.data.map(ele => [getLabelText(ele.dataSource.label, this.state.lang), ele.planningUnit.id, getLabelText(ele.planningUnit.label, this.state.lang), new moment(ele.inventoryDate).format('MMM YYYY'), this.formatter(ele.stockAdjustemntQty), ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format(`${DATE_FORMAT_CAP}`), ele.notes]);
        let startY = 150 + (doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10)
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: startY,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 64, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 170 },
                2: { cellWidth: 171.89 },
                7: { cellWidth: 100 }
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.stockAdjustment') + ".pdf")
    }
    buildJExcel() {
        let stockAdjustmentList = this.state.data;
        let stockAdjustmentArray = [];
        let count = 0;
        for (var j = 0; j < stockAdjustmentList.length; j++) {
            data = [];
            data[0] = getLabelText(stockAdjustmentList[j].dataSource.label, this.state.lang)
            data[1] = getLabelText(stockAdjustmentList[j].planningUnit.label, this.state.lang)
            data[2] = stockAdjustmentList[j].inventoryDate
            data[3] = (stockAdjustmentList[j].stockAdjustemntQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");;
            data[4] = stockAdjustmentList[j].lastModifiedBy.username;
            data[5] = new moment(stockAdjustmentList[j].lastModifiedDate).format(`YYYY-MM-DD`);
            data[6] = stockAdjustmentList[j].notes;
            stockAdjustmentArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = stockAdjustmentArray;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 80, 60, 90, 90, 120],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.datasource.datasource'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.inventoryDate.inventoryReport'),
                    type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' },
                },
                {
                    title: i18n.t('static.report.stockAdjustment'),
                    type: 'numeric', mask: '[-]#,##',
                },
                {
                    title: i18n.t('static.report.lastmodifiedby'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.lastmodifieddate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                },
            ],
            editable: false,
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
            languageEl: languageEl,
            loading: false
        })
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    fetchData = () => {
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0) {
            if (versionId.includes('Local')) {
                startDate = this.state.rangeValue.from.year + '-' + String(this.state.rangeValue.from.month).padStart(2, '0') + '-01';
                endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
                planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString())
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                this.setState({ loading: true })
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
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                        var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                        var dataSourceRequest = dataSourceOs.getAll();
                        dataSourceRequest.onerror = function (event) {
                        }.bind(this);
                        dataSourceRequest.onsuccess = function (event) {
                            var dataSourceResult = [];
                            dataSourceResult = dataSourceRequest.result;
                            var puTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                            var puOs = puTransaction.objectStore('programPlanningUnit');
                            var puRequest = puOs.getAll();
                            puRequest.onerror = function (event) {
                            }.bind(this);
                            puRequest.onsuccess = function (e) {
                                var puResult = [];
                                puResult = puRequest.result;
                                var generalProgramDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                                var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                                var generalProgramJson = JSON.parse(generalProgramData);
                                var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                                var data = []
                                planningUnitIds.map(planningUnitId => {
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
                                    var inventoryList = ((programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && (c.adjustmentQty != 0 && c.adjustmentQty != null)));
                                    inventoryList.map(ele => {
                                        var dataSource = dataSourceResult.filter(c => c.dataSourceId == ele.dataSource.id);
                                        var planningUnit = puResult.filter(c => c.planningUnit.id == ele.planningUnit.id);
                                        var json = {
                                            program: programJson,
                                            inventoryDate: ele.inventoryDate,
                                            planningUnit: planningUnit.length > 0 ? planningUnit[0].planningUnit : ele.planningUnit,
                                            stockAdjustemntQty: ele.adjustmentQty,
                                            lastModifiedBy: generalProgramJson.currentVersion.lastModifiedBy,
                                            lastModifiedDate: generalProgramJson.currentVersion.lastModifiedDate,
                                            notes: ele.notes,
                                            dataSource: dataSource.length > 0 ? dataSource[0] : ele.dataSource
                                        }
                                        data.push(json)
                                    })
                                })
                                this.setState({
                                    data: data
                                    , message: ''
                                }, () => {
                                    this.buildJExcel();
                                });
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({ loading: true })
                var inputjson = {
                    programId: programId,
                    versionId: versionId,
                    startDate: startDate,
                    stopDate: endDate,
                    planningUnitIds: planningUnitIds
                }
                ReportService.stockAdjustmentList(inputjson)
                    .then(response => {
                        this.setState({
                            data: response.data,
                            message: ''
                        }, () => {
                            this.buildJExcel();
                        });
                    }).catch(
                        error => {
                            this.setState({
                                data: [],
                                loading: false
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
                                            message: i18n.t(error.response.data.messageCode),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode),
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
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        }
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
            this.filterVersion();
        })
    }
    setVersionId(event) {
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
        const { programs } = this.state
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                    </option>
                )
            }, this);
        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
            }, this);

        const { rangeValue } = this.state
        const columns = [
            {
                dataField: 'dataSource.label',
                text: i18n.t('static.datasource.datasource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            }, {
                dataField: 'planningUnit.id',
                text: i18n.t('static.report.qatPID'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' }
            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.report.planningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'inventoryDate',
                text: i18n.t('static.inventoryDate.inventoryReport'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return new moment(cell).format('MMM YYYY');
                }
            },
            {
                dataField: 'stockAdjustemntQty',
                text: i18n.t('static.report.stockAdjustment'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: this.formatter
            },
            {
                dataField: 'lastModifiedBy.username',
                text: i18n.t('static.report.lastmodifiedby'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center'
            },
            {
                dataField: 'lastModifiedDate',
                text: i18n.t('static.report.lastmodifieddate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return new moment(cell).format(`${DATE_FORMAT_CAP}`);
                }
            },
            {
                dataField: 'notes',
                text: i18n.t('static.program.notes'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
            }
        ];
        
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {this.state.data.length > 0 &&
                            <div className="card-header-actions">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                            </div>
                        }
                    </div>
                    <CardBody className="pt-1 pb-lg-0">
                        <div className="pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls  edit">
                                        <Picker
                                            ref="pickRange"
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            value={rangeValue}
                                            lang={pickerLang}
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
                                                onChange={(e) => { this.setProgramId(e); }}
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
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls ">
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
                            </div>
                        </div>
                        <div className='ProgramListSearchAlignment'>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                            </div>
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
        );
    }
}
export default StockAdjustmentComponent;