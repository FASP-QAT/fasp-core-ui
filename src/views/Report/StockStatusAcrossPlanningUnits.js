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
import { SECRET_KEY, DATE_FORMAT_CAP, FIRST_DATA_ENTRY_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import moment from 'moment';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import ReportService from '../../api/ReportService';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { contrast, isSiteOnline } from "../../CommonComponent/JavascriptCommonFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import TracerCategoryService from '../../api/TracerCategoryService';

import MultiSelect from 'react-multi-select-component';
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
// const legendcolor = [{ text: i18n.t('static.report.overstock'), color: "#edb944", value: 3 },
// { text: i18n.t('static.report.stockout'), color: "#ed5626", value: 0 },
// { text: i18n.t('static.report.okaystock'), color: "#118b70", value: 2 },
// { text: i18n.t('static.report.lowstock'), color: "#f48521", value: 1 },];

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
            versionId: ''

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

                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId) {

                                proList.push(myResult[i].planningUnit)
                            }
                        }
                        console.log('proList', proList)
                        this.setState({ programPlanningUnitList: myResult })
                        var planningunitTransaction1 = db1.transaction(['planningUnit'], 'readwrite');
                        var planningunitOs1 = planningunitTransaction1.objectStore('planningUnit');
                        var planningunitRequest1 = planningunitOs1.getAll();
                        //  var pllist = []
                        planningunitRequest1.onerror = function (event) {
                            // Handle errors!
                        };
                        planningunitRequest1.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest1.result;
                            var flList = []
                            console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                for (var j = 0; j < proList.length; j++) {
                                    if (myResult[i].planningUnitId == proList[j].id) {
                                        console.log(myResult[i].planningUnitId, proList[j].id)

                                        flList.push(myResult[i].forecastingUnit)
                                        planningList.push(myResult[i])
                                    }
                                }
                            }
                            console.log('flList', flList)

                            var tcList = [];
                            flList.filter(function (item) {
                                var i = tcList.findIndex(x => x.tracerCategoryId == item.tracerCategory.id);
                                if (i <= -1 && item.tracerCategory.id != 0) {
                                    tcList.push({ tracerCategoryId: item.tracerCategory.id, label: item.tracerCategory.label });
                                }
                                return null;
                            });

                            console.log('tcList', tcList)
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


                let realmId = AuthenticationService.getRealmId();
                TracerCategoryService.getTracerCategoryByProgramId(realmId, programId).then(response => {

                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
        this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.mos == null ? i18n.t('static.supplyPlanFormula.na') : this.roundN(ele.mos) == 0 ? i18n.t('static.report.stockout') : (this.roundN(ele.mos) < ele.minMos ? i18n.t('static.report.lowstock') : (this.roundN(ele.mos) > ele.maxMos ? i18n.t('static.report.overstock') : i18n.t('static.report.okaystock')))).replaceAll(' ', '%20'), ele.mos != null ? isNaN(ele.mos) ? '' : this.roundN(ele.mos) : i18n.t("static.supplyPlanFormula.na"), isNaN(ele.minMos) || ele.minMos == undefined ? '' : ele.minMos, isNaN(ele.maxMos) || ele.maxMos == undefined ? '' : ele.maxMos, ele.stock, isNaN(ele.amc) || ele.amc == null ? '' : this.round(ele.amc), ele.lastStockCount != null && ele.lastStockCount != '' ? (new moment(ele.lastStockCount).format('MMM-yy')).replaceAll(' ', '%20') : ''])));

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
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.data.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label), (ele.mos == null ? i18n.t("static.supplyPlanFormula.na") : this.roundN(ele.mos) == 0 ? i18n.t('static.report.stockout') : (this.roundN(ele.mos) < ele.minMos ? i18n.t('static.report.lowstock') : (this.roundN(ele.mos) > ele.maxMos ? i18n.t('static.report.overstock') : i18n.t('static.report.okaystock')))), ele.mos != null ? isNaN(ele.mos) ? '' : this.formatterDouble(ele.mos) : i18n.t("static.supplyPlanFormula.na"), isNaN(ele.minMos) || ele.minMos == undefined ? '' : this.formatterDouble(ele.minMos), isNaN(ele.maxMos) || ele.maxMos == undefined ? '' : this.formatterDouble(ele.maxMos), this.formatter(ele.stock), isNaN(ele.amc) || ele.amc == null ? '' : this.formatter(ele.amc), ele.lastStockCount != null && ele.lastStockCount != '' ? new moment(ele.lastStockCount).format('MMM-yy') : '']);

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 75 },
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
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
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
                console.log("D---------------->", proList);
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
                        this.filterVersion()
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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)

                    }


                }

                console.log(verList);
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
    round = num => {
        if (num != null) {
            return Number(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0));
        } else {
            return null;
        }
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
            return moment(cell).format('MMM-yy');
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
            return { align: 'center', color: '#BA0C2F' }
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

    buildJExcel() {
        let dataStockStatus = this.state.data;
        // console.log("dataStockStatus---->", dataStockStatus);
        let dataArray = [];
        let count = 0;
        console.log("DataStockStatus+++", dataStockStatus);
        for (var j = 0; j < dataStockStatus.length; j++) {
            let data1 = '';
            if (dataStockStatus[j].mos == null) {
                data1 = i18n.t('static.supplyPlanFormula.na')
            }
            else if (this.roundN(dataStockStatus[j].mos) == 0) {
                data1 = i18n.t('static.report.stockout')
            } else
                if (this.roundN(dataStockStatus[j].mos) < dataStockStatus[j].minMos) {
                    data1 = i18n.t('static.report.lowstock')
                } else if (this.roundN(dataStockStatus[j].mos) > dataStockStatus[j].maxMos) {
                    data1 = i18n.t('static.report.overstock')
                } else {
                    data1 = i18n.t('static.report.okaystock')
                }

            data = [];
            data[0] = getLabelText(dataStockStatus[j].planningUnit.label, this.state.lang)
            data[1] = data1;
            data[2] = dataStockStatus[j].mos != null ? this.roundN(dataStockStatus[j].mos) : i18n.t("static.supplyPlanFormula.na");
            data[3] = (dataStockStatus[j].minMos);
            data[4] = (dataStockStatus[j].maxMos);
            data[5] = (dataStockStatus[j].stock);
            data[6] = this.round(dataStockStatus[j].amc);
            data[7] = (dataStockStatus[j].lastStockCount ? moment(dataStockStatus[j].lastStockCount).format('YYYY-MM-DD') : null);

            dataArray[count] = data;
            count++;
        }
        // if (dataStockStatus.length == 0) {
        //     data = [];
        //     dataArray[0] = data;
        // }
        // console.log("dataArray---->", dataArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = dataArray;
        console.log("Data+++", data);
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 100, 80, 80, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.withinstock'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.mos'),
                    type: 'text'
                },
                {
                    title: i18n.t('static.supplyPlan.minStockMos'),
                    type: 'numeric', mask: '#,##.0', decimal: '.',
                },
                {
                    title: i18n.t('static.supplyPlan.maxStockMos'),
                    type: 'numeric', mask: '#,##.0', decimal: '.',
                },
                {
                    title: i18n.t('static.report.stock'),
                    type: 'numeric', mask: '#,##',
                },
                {
                    title: i18n.t('static.report.amc'),
                    type: 'numeric', mask: '#,##',
                },
                {
                    title: i18n.t('static.supplyPlan.lastinventorydt'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' },
                    width: 120
                },
            ],
            editable: false,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },

            updateTable: function (el, cell, x, y, source, value, id) {

                // var elInstance = el.jexcel;
                // var colArrB = ['B', 'C'];
                // var colArrC = ['C'];
                // var colArrD = ['D'];
                // var colArrE = ['E'];
                // var rowData = elInstance.getRowData(y);

                // var mos = parseFloat(rowData[2]);
                // var minMos = parseFloat(rowData[3]);
                // var maxMos = parseFloat(rowData[4]);
                // //------------B--------------
                // if (mos < minMos) {
                //     console.log('1')
                //     for (var i = 0; i < colArrB.length; i++) {
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', legendcolor[1].color);
                //         let textColor = contrast(legendcolor[1].color);
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'color', textColor);
                //     }
                // } else if (mos > maxMos) {
                //     console.log('2')
                //     for (var i = 0; i < colArrB.length; i++) {
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', legendcolor[0].color);
                //         let textColor = contrast(legendcolor[0].color);
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'color', textColor);
                //     }
                // } else {
                //     console.log('3')
                //     for (var i = 0; i < colArrB.length; i++) {
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', legendcolor[2].color);
                //         let textColor = contrast(legendcolor[2].color);
                //         elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'color', textColor);
                //     }
                // }

                // //-------------C----------------
                // if (mos < minMos) {
                //     for (var i = 0; i < colArrC.length; i++) {
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
                //         let textColor = contrast('#f48282');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'color', textColor);
                //     }
                // } else if (mos > maxMos) {
                //     for (var i = 0; i < colArrC.length; i++) {
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', '#f3d679');
                //         let textColor = contrast('#f3d679');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'color', textColor);
                //     }
                // } else {
                //     elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //     elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', '#00c596');
                //     let textColor = contrast('#00c596');
                //     elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'color', textColor);
                // }

                // //-------------D----------------
                // if (mos < minMos) {
                //     for (var i = 0; i < colArrD.length; i++) {
                //         elInstance.setStyle(`${colArrD[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrD[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
                //     }
                // } else {
                //     elInstance.setStyle(`${colArrD[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                // }

                // //-------------E----------------
                // if (mos < minMos) {
                //     for (var i = 0; i < colArrE.length; i++) {
                //         elInstance.setStyle(`${colArrE[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrE[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
                //     }
                // } else {
                //     elInstance.setStyle(`${colArrE[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                // }



            }.bind(this),

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

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);

        var elInstance = instance.jexcel;
        var json = elInstance.getJson();
        var colArrB = ['B', 'C'];
        var colArrC = ['C'];
        var colArrD = ['D'];
        var colArrE = ['E'];

        for (var j = 0; j < json.length; j++) {

            var rowData = elInstance.getRowData(j);

            var mos = parseFloat(rowData[2]);
            var minMos = parseFloat(rowData[3]);
            var maxMos = parseFloat(rowData[4]);
            //------------B--------------
            if (mos == 0) {
                console.log('1')
                for (var i = 0; i < colArrB.length; i++) {
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', legendcolor[0].color);
                    let textColor = contrast(legendcolor[1].color);
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            } else if (rowData[2] == i18n.t("static.supplyPlanFormula.na")) {
                for (var i = 0; i < colArrB.length; i++) {
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', legendcolor[4].color);
                    let textColor = contrast(legendcolor[1].color);
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            } else if (mos < minMos) {
                console.log('1')
                for (var i = 0; i < colArrB.length; i++) {
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', legendcolor[1].color);
                    let textColor = contrast(legendcolor[1].color);
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            } else if (mos > maxMos) {
                console.log('2')
                for (var i = 0; i < colArrB.length; i++) {
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', legendcolor[3].color);
                    let textColor = contrast(legendcolor[0].color);
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            } else {
                console.log('3')
                for (var i = 0; i < colArrB.length; i++) {
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'background-color', legendcolor[2].color);
                    let textColor = contrast(legendcolor[2].color);
                    elInstance.setStyle(`${colArrB[i]}${parseInt(j) + 1}`, 'color', textColor);
                }
            }
        }
    }

    filterDataAsperstatus = () => {
        let stockStatusId = document.getElementById("stockStatusId").value;
        console.log(stockStatusId)
        var filteredData = []
        if (stockStatusId != -1) {

            this.state.selData.map(ele => {
                console.log(ele)
                var min = ele.minMos
                var max = ele.maxMos
                //  var reorderFrequency = ele.reorderFrequency
                if (stockStatusId == 0) {
                    if ((ele.mos != null && this.roundN(ele.mos) == 0)) {
                        console.log('in 0')
                        filteredData.push(ele)
                    }
                } else if (stockStatusId == 1) {
                    if ((ele.mos != null && this.roundN(ele.mos) != 0 && this.roundN(ele.mos) < min)) {
                        console.log('in 1')
                        filteredData.push(ele)
                    }
                } else if (stockStatusId == 3) {
                    if (this.roundN(ele.mos) > max) {
                        console.log('in 2')
                        filteredData.push(ele)
                    }
                } else if (stockStatusId == 2) {
                    if (this.roundN(ele.mos) < max && this.roundN(ele.mos) > min) {
                        console.log('in 3')
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
        console.log(filteredData)
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
        let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());//document.getElementById('tracerCategoryId').value
        console.log('this.state.tracerCategoryValues.length', this.state.tracerCategoryValues.length)
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
                        var planningUnitDataList=programRequest.result.programData.planningUnitDataList;

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
                                console.log(planningUnit)
                                this.state.tracerCategoryValues.map(tc => {
                                    if (tc.value == planningUnit.forecastingUnit.tracerCategory.id) {
                                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnitId);
                                        let moments = (inventoryList.filter(c => moment(c.inventoryDate).isBefore(endDate) || moment(c.inventoryDate).isSame(endDate))).map(d => moment(d.inventoryDate))
                                        var maxDate = moments.length > 0 ? moment.max(moments) : ''
                                        var dtstr = startDate.startOf('month').format('YYYY-MM-DD')
                                        var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnit.planningUnitId && c.transDate == dtstr)
                                        console.log("D-------------->programPlanningUnitList", this.state.programPlanningUnitList)
                                        var pu = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == planningUnit.planningUnitId)[0];
                                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                        var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                                        if (DEFAULT_MIN_MONTHS_OF_STOCK > pu.minMonthsOfStock) {
                                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                        } else {
                                            maxForMonths = pu.minMonthsOfStock
                                        }
                                        var minStockMoS = parseInt(maxForMonths);

                                        // Calculations for Max Stock
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
                                        console.log(planningUnit)
                                        if (list.length > 0) {
                                            var json = {
                                                planningUnit: { id: planningUnit.planningUnitId, label: planningUnit.label },
                                                lastStockCount: maxDate == '' ? '' : maxDate.format('MMM-DD-YYYY'),
                                                mos: includePlanningShipments.toString() == 'true' ? list[0].mos != null ? this.roundN(list[0].mos) : null : (list[0].amc > 0) ? (list[0].closingBalanceWps / list[0].amc) : null,//planningUnit.planningUnit.id==157?12:planningUnit.planningUnit.id==156?6:mos),
                                                minMos: minStockMoS,
                                                maxMos: maxStockMoS,
                                                stock: includePlanningShipments.toString() == 'true' ? list[0].closingBalance : list[0].closingBalanceWps,
                                                amc: list[0].amc
                                            }
                                            data.push(json)

                                        } else {
                                            var json = {
                                                planningUnit: { id: planningUnit.planningUnitId, label: planningUnit.label },
                                                lastStockCount: maxDate == '' ? '' : maxDate.format('MMM-DD-YYYY'),
                                                mos: null,
                                                minMos: minStockMoS,
                                                maxMos: maxStockMoS,
                                                stock: 0,
                                                amc: 0
                                            }
                                            data.push(json)
                                        }
                                    }
                                })
                            })
                            console.log(data)
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
                // AuthenticationService.setupAxiosInterceptors();
                ReportService.stockStatusForProgram(inputjson)
                    .then(response => {
                        console.log(JSON.stringify(response.data));
                        this.setState({
                            selData: response.data, message: ''
                        }, () => {
                            this.filterDataAsperstatus()

                        });
                    }).catch(
                        error => {
                            this.setState({
                                selData: [], loading: false
                            }, () => {
                                this.el = jexcel(document.getElementById("tableDiv"), '');
                                this.el.destroy();
                                // this.buildJExcel();
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
                // .catch(
                //     error => {
                //         this.setState({
                //             data: [], loading: false
                //         }, () => {
                //             this.el = jexcel(document.getElementById("tableDiv"), '');
                //             this.el.destroy();
                //             // this.buildJExcel();
                //         });

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
            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [], selData: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.buildJExcel();
            });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [], selData: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.buildJExcel();
            });

        } else {
            this.setState({ message: i18n.t('static.tracercategory.tracercategoryText'), data: [], selData: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.buildJExcel();
            });
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

        const { tracerCategories } = this.state;
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
                text: i18n.t('static.dashboard.product'),
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon pb-2">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusacrossplanningunit')}</strong> */}

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
                    <CardBody className="pb-lg-5 pt-lg-0 ">
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
                                                            // onChange={(e) => { this.filterVersion(); }}
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
                                                            // onChange={(e) => { this.getTracerCategoryList(); }}
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
                                                                return ({ label: getLabelText(item.label, this.state.lang), value: item.tracerCategoryId })

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
                        {/* {this.state.data.length > 0 && <ToolkitProvider
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
 */}
                        <div className="ReportSearchMarginTop" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground ">
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

