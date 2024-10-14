import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import {
    Card, CardBody,
    Col,
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
import ProductService from '../../api/ProductService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent } from '../../CommonComponent/JavascriptCommonFunctions';
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions';
const ref = React.createRef();
/**
 * Component for Product Catalog Report.
 */
class ProductCatalog extends Component {
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
            planningUnitList: [],
            productCategoriesOffline: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            procurementAgenttValues: [],
            procurementAgentLabels: [],
            outPutList: [],
            productCategories: [],
            tracerCategories: [],
            loading: true
        };
        this.getPrograms = this.getPrograms.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
    }
    /**
     * Exports the data to a CSV file.
     * @param {array} columns - The columns to be exported.
     */
    exportCSV(columns) {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"');
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20').replaceAll('#', '%23')) });
        var A = [addDoubleQuoteToRowContent(headers)];
        this.state.outPutList.map(
            ele => A.push(addDoubleQuoteToRowContent([
                getLabelText(ele.productCategory.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.tracerCategory.label, this.state.lang) != null ? getLabelText(ele.tracerCategory.label, this.state.lang).replaceAll(' ', '%20') : '',
                getLabelText(ele.forecastingUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.fUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.genericName, this.state.lang) != null ? getLabelText(ele.genericName, this.state.lang).replaceAll(' ', '%20') : '',
                ele.forecastingtoPlanningUnitMultiplier,
                ele.planningUnit.id,
                getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.pUnit.label, this.state.lang).replaceAll(' ', '%20'),
                ele.minMonthsOfStock,
                ele.reorderFrequencyInMonths,
                ele.shelfLife,
                ele.catalogPrice,
                ele.active ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive')
            ])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.productcatalog') + '.csv';
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
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.productcatalog'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
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
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.outPutList.map(ele => [
            getLabelText(ele.productCategory.label, this.state.lang),
            getLabelText(ele.tracerCategory.label, this.state.lang),
            getLabelText(ele.forecastingUnit.label, this.state.lang),
            getLabelText(ele.fUnit.label, this.state.lang),
            getLabelText(ele.genericName, this.state.lang),
            ele.forecastingtoPlanningUnitMultiplier,
            ele.planningUnit.id,
            getLabelText(ele.planningUnit.label, this.state.lang),
            getLabelText(ele.pUnit.label, this.state.lang),
            ele.minMonthsOfStock,
            ele.reorderFrequencyInMonths,
            ele.shelfLife,
            ele.catalogPrice,
            ele.active ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive')
        ]);
        let content = {
            margin: { top: 90, bottom: 70 },
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 54.5, halign: 'center' },
            columnStyles: {
                13: { cellWidth: 53 }
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.productcatalog') + '.pdf')
    }
    /**
   * Retrieves tracer categories based on the selected program.
   * Fetches from local IndexedDB if version is local, or from server API.
   * Updates component state with fetched data and handles errors.
   */
    getTracerCategoryList() {
        var programId = document.getElementById('programId').value;
        if (programId > 0) {
            if (localStorage.getItem("sessionType") === 'Online') {
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
                        })
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
            } else {
                const lan = 'en';
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
                        myResult = planningunitRequest.result;
                        var proList = []
                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId) {
                                proList.push(myResult[i].planningUnit)
                            }
                        }
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
        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                productCategories: [],
                tracerCategories: []
            })
        }
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms() {
        let realmId = AuthenticationService.getRealmId();
        if (localStorage.getItem("sessionType") === 'Online') {
            DropdownService.getSPProgramBasedOnRealmId(realmId)
                .then(response => {
                    var listArray = response.data;
                    var proList = []
                    for (var i = 0; i < listArray.length; i++) {
                        var programJson = {
                            programId: listArray[i].id,
                            label: listArray[i].label,
                            programCode: listArray[i].code
                        }
                        proList[i] = programJson
                    }
                    proList.sort((a, b) => {
                        var itemLabelA = a.programCode.toUpperCase();
                        var itemLabelB = b.programCode.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                        this.setState({
                            programs: proList, loading: false,
                            programId: localStorage.getItem("sesProgramIdReport")
                        }, () => {
                            this.fetchData();
                            this.getProductCategories();
                            this.getTracerCategoryList();
                        })
                    } else {
                        this.setState({
                            programs: proList, loading: false
                        }, () => { })
                    }
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { })
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
    /**
     * Consolidates the list of programs obtained from Server and local programs.
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
                        this.fetchData();
                        this.getProductCategories();
                        this.getTracerCategoryList();
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
     * Retrieves the list of product categories based on the program ID and updates the state with the list.
     */
    getProductCategories() {
        let programId = document.getElementById("programId").value
        if (programId > 0) {
            let realmId = AuthenticationService.getRealmId();
            if (localStorage.getItem("sessionType") === 'Online') {
                ProductService.getProductCategoryListByProgram(realmId, programId)
                    .then(response => {
                        var list = response.data;
                        // list.sort((a, b) => {
                        //     var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase();
                        //     var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase();
                        //     return itemLabelA > itemLabelB ? 1 : -1;
                        // });
                        this.setState({
                            productCategories: list
                        })
                    }).catch(
                        error => {
                            this.setState({
                                productCategories: []
                            })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                });
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
            } else {
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
                    var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var ppuOs = ppuTransaction.objectStore('programPlanningUnit');
                    var ppuRequest = ppuOs.getAll();
                    ppuRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    ppuRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    ppuRequest.onsuccess = function (e) {
                        var result3 = ppuRequest.result;
                        result3 = result3.filter(c => c.program.id == programId);
                        var outPutList = [];
                        var json;
                        for (var i = 0; i < result3.length; i++) {
                            json = {
                                id: result3[i].productCategory.id,
                                label: getLabelText(result3[i].productCategory.label, this.state.lang)
                            }
                            outPutList = outPutList.concat(json);
                        }
                        const set = new Set(outPutList.map(item => JSON.stringify(item)));
                        const dedup = [...set].map(item => JSON.parse(item));
                        this.setState({
                            loading: false,
                            productCategoriesOffline: dedup.sort(function (a, b) {
                                a = a.label.toLowerCase();
                                b = b.label.toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                        })
                    }.bind(this);
                }.bind(this);
            }
        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                productCategories: [],
                tracerCategories: []
            })
        }
    }
    /**
     * Builds the jexcel table based on the output list.
     */
    buildJexcel() {
        let outPutList = this.state.outPutList;
        let outPutArray = [];
        let count = 0;
        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            data[0] = getLabelText(outPutList[j].productCategory.label, this.state.lang)
            data[1] = getLabelText(outPutList[j].tracerCategory.label, this.state.lang)
            data[2] = getLabelText(outPutList[j].forecastingUnit.label, this.state.lang)
            data[3] = getLabelText(outPutList[j].fUnit.label, this.state.lang)
            data[4] = getLabelText(outPutList[j].genericName, this.state.lang)
            data[5] = outPutList[j].forecastingtoPlanningUnitMultiplier
            data[6] = getLabelText(outPutList[j].planningUnit.label, this.state.lang)
            data[7] = getLabelText(outPutList[j].pUnit.label, this.state.lang)
            data[8] = outPutList[j].minMonthsOfStock
            data[9] = outPutList[j].reorderFrequencyInMonths
            data[10] = outPutList[j].shelfLife
            data[11] = outPutList[j].catalogPrice
            data[12] = outPutList[j].active;
            outPutArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = outPutArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [80, 80, 90, 60, 80, 80, 80, 0, 0, 90, 80, 80, 70],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.dashboard.productcategory'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.forecastingunit.forecastingunit'),
                    type: 'text',
                }, {
                    title: i18n.t('static.report.forcastingUOM'),
                    type: 'text',
                }, {
                    title: i18n.t('static.report.genericName'),
                    type: 'text',
                }, {
                    title: i18n.t('static.report.forecastingtoPlanningUnitMultiplier'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                }, {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                }, {
                    title: i18n.t('static.report.planningUOM'),
                    type: 'text',
                }, {
                    title: i18n.t('static.report.min'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                }, {
                    title: i18n.t('static.report.reorderFrequencyInMonths'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.shelfLife'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                }, {
                    title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.dataentry.inactive') }
                    ]
                },
            ],
            filters: true,
            license: JEXCEL_PRO_KEY,
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
     * Fetches data based on selected filters.
     */
    fetchData = () => {
        let programId = document.getElementById("programId").value;
        let productCategoryId = document.getElementById("productCategoryId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;
        let json = {
            "programId": parseInt(document.getElementById("programId").value),
            "productCategoryId": parseInt(document.getElementById("productCategoryId").value) == 0 ? -1 : parseInt(document.getElementById("productCategoryId").value),
            "tracerCategoryId": parseInt(document.getElementById("tracerCategoryId").value),
        }
        if (programId > 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            this.setState({
                programId: programId
            })
            if (localStorage.getItem("sessionType") === 'Online') {
                this.setState({ loading: true })
                ReportService.programProductCatalog(json)
                    .then(response => {
                        var outPutList = response.data;
                        this.setState({
                            outPutList: outPutList,
                            message: '',
                        },
                            () => { this.buildJexcel() })
                    }).catch(
                        error => {
                            this.setState({
                                outPutList: [],
                                loading: false
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
                                    case 409:
                                        this.setState({
                                            message: i18n.t('static.common.accessDenied'),
                                            loading: false,
                                            color: "#BA0C2F",
                                        });
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
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                        var fuOs = fuTransaction.objectStore('forecastingUnit');
                        var fuRequest = fuOs.getAll();
                        fuRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext')
                            })
                        }.bind(this);
                        fuRequest.onerror = function (event) {
                            this.setState({
                                loading: false
                            })
                        }.bind(this);
                        fuRequest.onsuccess = function (e) {
                            var result1 = fuRequest.result;
                            var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
                            var puOs = puTransaction.objectStore('planningUnit');
                            var puRequest = puOs.getAll();
                            puRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext')
                                })
                            }.bind(this);
                            puRequest.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            puRequest.onsuccess = function (e) {
                                var result2 = puRequest.result;
                                var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                var ppuOs = ppuTransaction.objectStore('programPlanningUnit');
                                var ppuRequest = ppuOs.getAll();
                                ppuRequest.onerror = function (event) {
                                    this.setState({
                                        message: i18n.t('static.program.errortext')
                                    })
                                }.bind(this);
                                ppuRequest.onerror = function (event) {
                                    this.setState({
                                        loading: false
                                    })
                                }.bind(this);
                                ppuRequest.onsuccess = function (e) {
                                    var result3 = ppuRequest.result;
                                    result3 = result3.filter(c => c.program.id == programId);
                                    var outPutList = [];
                                    for (var i = 0; i < result3.length; i++) {
                                        var filteredList = result2.filter(c => c.planningUnitId == result3[i].planningUnit.id);
                                        var program = result3[i].program;
                                        var planningUnit = result3[i].planningUnit;
                                        var minMonthOfStock = result3[i].minMonthsOfStock;
                                        var reorderFrequencyInMonths = result3[i].reorderFrequencyInMonths;
                                        var shelfLife = result3[i].shelfLife;
                                        var catalogPrice = result3[i].catalogPrice;
                                        var active = true;
                                        for (var j = 0; j < filteredList.length; j++) {
                                            var productCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).productCategory;
                                            var tracerCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).tracerCategory;
                                            var fUnit = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).unit;
                                            var genericLabel = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).genericLabel;
                                            var json = {
                                                program: program,
                                                productCategory: productCategory,
                                                tracerCategory: tracerCategory,
                                                forecastingUnit: filteredList[j].forecastingUnit,
                                                fUnit: fUnit,
                                                genericName: genericLabel,
                                                planningUnit: planningUnit,
                                                pUnit: filteredList[j].unit,
                                                forecastingtoPlanningUnitMultiplier: filteredList[j].multiplier,
                                                minMonthsOfStock: minMonthOfStock,
                                                reorderFrequencyInMonths: reorderFrequencyInMonths,
                                                shelfLife: shelfLife,
                                                catalogPrice: catalogPrice,
                                                active: active
                                            }
                                            outPutList.push(json);
                                        }
                                    }
                                    if (productCategoryId > 0) {
                                        var filteredPc = outPutList.filter(c => c.productCategory.id == productCategoryId);
                                        outPutList = filteredPc;
                                    } else {
                                        outPutList = outPutList;
                                    }
                                    if (tracerCategoryId > 0) {
                                        var filteredTc = outPutList.filter(c => c.tracerCategory.id == tracerCategoryId);
                                        outPutList = filteredTc;
                                    } else {
                                        outPutList = outPutList;
                                    }
                                    this.setState({ outPutList: outPutList, message: '' },
                                        () => { this.buildJexcel() });
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }
        } else {
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [], programId: '' },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
        }
    }
    /**
     * Calls the get programs function on page load
     */
    componentDidMount() {
        this.getPrograms();
    }
    /**
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    /**
     * Renders the Product Catalog table.
     * @returns {JSX.Element} - Product Catalog table.
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
        const { productCategories } = this.state;
        const { tracerCategories } = this.state;
        const { productCategoriesOffline } = this.state;
        const columns = [
            {
                dataField: 'productCategory.label',
                text: i18n.t('static.dashboard.productcategory'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'tracerCategory.label',
                text: i18n.t('static.tracercategory.tracercategory'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'forecastingUnit.label',
                text: i18n.t('static.forecastingunit.forecastingunit'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'fUnit.label',
                text: i18n.t('static.report.forcastingUOM'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'genericName',
                text: i18n.t('static.report.genericName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'forecastingtoPlanningUnitMultiplier',
                text: i18n.t('static.report.forecastingtoPlanningUnitMultiplier'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
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
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'pUnit.label',
                text: i18n.t('static.report.planningUOM'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'minMonthsOfStock',
                text: i18n.t('static.report.min'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'reorderFrequencyInMonths',
                text: i18n.t('static.report.reorderFrequencyInMonths'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'shelfLife',
                text: i18n.t('static.report.shelfLife'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'catalogPrice',
                text: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'active',
                text: i18n.t('static.common.status'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (
                        (row.active ? i18n.t('static.common.active') : i18n.t('static.dataentry.inactive'))
                    );
                }
            }
        ];

        const checkOnline = localStorage.getItem('sessionType');
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {this.state.outPutList.length > 0 && <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />
                        </div>}
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <br />
                        <Col md="12 pl-0">
                            <div className="d-md-flex  Selectdiv2 ">
                                <FormGroup className="mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                onChange={(e) => { this.fetchData(); this.getProductCategories(); this.getTracerCategoryList(); }}
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
                                {checkOnline === 'Online' &&
                                    <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                        <div className="controls SelectField">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    onChange={this.fetchData}
                                                >
                                                    {
                                                        (productCategories.length > 0 ? productCategories.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                                                    {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                                                </option>
                                                            )
                                                        }, this) :
                                                            <option value={-1}>
                                                                {i18n.t('static.common.allCategories')}
                                                            </option>
                                                        )
                                                    }
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }
                                {checkOnline === 'Offline' &&
                                    <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                        <div className="controls SelectField">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    onChange={this.fetchData}
                                                >
                                                    <option value="-1">{i18n.t('static.common.all')}</option>
                                                    {productCategoriesOffline.length > 0
                                                        && productCategoriesOffline.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.id}>
                                                                    {item.label}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryId"
                                                id="tracerCategoryId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                {tracerCategories.length > 0
                                                    && tracerCategories.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.id}>
                                                                {getLabelText(item.label, this.state.lang)}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable TableWidth100" style={{ display: this.state.loading ? "none" : "block" }}>
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
export default ProductCatalog
