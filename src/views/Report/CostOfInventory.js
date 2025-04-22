import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CSVExport, Search } from 'react-bootstrap-table2-toolkit';
import Picker from 'react-month-picker';
import { Card, CardBody, Form, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import { addDoubleQuoteToRowContent, formatter, makeText, roundARU, roundN2 } from '../../CommonComponent/JavascriptCommonFunctions';
const { ExportCSVButton } = CSVExport;
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
/**
 * Component for Cost of Inventory Report.
 */
export default class CostOfInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            CostOfInventoryInput: {
                programId: '',
                planningUnitIds: [],
                regionIds: [],
                versionId: 0,
                dt: moment(new Date()).endOf('month').format('YYYY-MM-DD'),
                includePlanningShipments: true
            },
            programs: [],
            regions: [],
            planningUnitList: [],
            costOfInventory: [],
            versions: [],
            message: '',
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: ''
        }
        this.formSubmit = this.formSubmit.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms = () => {
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
                        let costOfInventoryInput = this.state.CostOfInventoryInput;
                        costOfInventoryInput.programId = localStorage.getItem("sesProgramIdReport");
                        this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
                        this.filterVersion();
                        this.formSubmit()
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
     * Filters versions based on the selected program ID and updates the state accordingly.
     * Sets the selected program ID in local storage.
     * Fetches version list for the selected program and updates the state with the fetched versions.
     * Handles error cases including network errors, session expiry, access denial, and other status codes.
     */
    filterVersion = () => {
        let programId = this.state.programId;
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        costOfInventoryInput.versionId = 0
        if (programId != 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            if (program.length == 1) {
                if (localStorage.getItem("sessionType") === 'Online') {
                    DropdownService.getVersionListForSPProgram(programId)
                        .then(response => {
                            this.setState({
                                versions: []
                            }, () => {
                                this.setState({
                                    costOfInventoryInput,
                                    versions: response.data
                                }, () => { this.consolidatedVersionList(programId) });
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
    /**
     * Retrieves data from IndexedDB and combines it with fetched versions to create a consolidated version list.
     * Filters out duplicate versions and reverses the list.
     * Sets the version list in the state and triggers fetching of planning units.
     * Handles cases where a version is selected from local storage or the default version is selected.
     * @param {number} programId - The ID of the selected program
     */
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
                        version.cutOffDate = JSON.parse(programData).cutOffDate != undefined && JSON.parse(programData).cutOffDate != null && JSON.parse(programData).cutOffDate != "" ? JSON.parse(programData).cutOffDate : ""
                        verList.push(version)
                    }
                }
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                });
                versionList.reverse();
                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
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
    /**
     * Exports the data to a CSV file.
     * @param {array} columns - The columns to be exported.
     */
    exportCSV = (columns) => {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')) + '"')
        csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.month') + ' : ' + makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.costOfInventory.map(ele => A.push(addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.stock!="" && ele.stock!=null?Number(ele.stock).toFixed(3):""), (ele.calculated ? i18n.t('static.program.no') : i18n.t('static.program.yes')), ele.catalogPrice, ele.cost])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.costOfInventory') + ".csv"
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
                doc.text(i18n.t('static.dashboard.costOfInventory'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.month') + ' : ' + makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 150, {
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
        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.costOfInventory.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label), (ele.stock!="" && ele.stock!=null?formatter(Number(ele.stock).toFixed(3), 0):""), (ele.calculated ? i18n.t('static.program.no') : i18n.t('static.program.yes')), formatter(ele.catalogPrice, 0), formatter(ele.cost, 0)]);
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.costOfInventory') + ".pdf")
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis2 = (value) => {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        var dt = new Date(`${value.year}`, `${value.month}`, 1)
        costOfInventoryInput.dt = moment(dt).endOf('month').format('YYYY-MM-DD')
        this.setState({ singleValue2: value, costOfInventoryInput }, () => {
            this.formSubmit();
        })
    }
    /**
     * Handles the change in data input fields.
     * Updates the corresponding values in the CostOfInventoryInput state and submits the form.
     * @param {Object} event - The event object triggered by the change.
     */
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
    /**
     * Calls the get programs function on page load
     */
    componentDidMount() {
        this.getPrograms()
    }
    /**
     * Sets the selected program ID selected by the user.
     * @param {object} event - The event object containing information about the program selection.
     */
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
            this.formSubmit();
        })
    }
    /**
     * Sets the version ID and updates the tracer category list.
     * @param {Object} event - The event object containing the version ID value.
     */
    setVersionId(event) {
        this.setState({
            versionId: event.target.value
        }, () => {
            let costOfInventoryInput = this.state.CostOfInventoryInput;
            costOfInventoryInput.versionId = this.state.versionId;
            this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
            this.formSubmit()
        })
    }
    /**
     * Builds the jexcel table based on the cost of inventory list.
     */
    buildJExcel() {
        let costOfInventory = this.state.costOfInventory;
        let costOfInventoryArray = [];
        let count = 0;
        for (var j = 0; j < costOfInventory.length; j++) {
            data = [];
            data[0] = getLabelText(costOfInventory[j].planningUnit.label, this.state.lang)
            data[1] = costOfInventory[j].stock
            data[2] = (costOfInventory[j].calculated ? i18n.t('static.program.no') : i18n.t('static.program.yes'))
            data[3] = costOfInventory[j].catalogPrice;
            data[4] = costOfInventory[j].cost;
            costOfInventoryArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = costOfInventoryArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.stock'),
                    type: 'numeric', mask: (localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false") ? '#,##.000' : '#,##', decimal: '.',
                },
                {
                    title: i18n.t('static.report.actualInv'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.report.costUsd'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
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
            license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
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
    formSubmit() {
        var programId = this.state.CostOfInventoryInput.programId;
        var versionId = this.state.CostOfInventoryInput.versionId
        if (programId != 0 && versionId != 0 && versionId != "") {
            localStorage.setItem("sesVersionIdReport", versionId);
            var cutOffDateFromProgram = this.state.versions.filter(c => c.versionId == this.state.versionId)[0].cutOffDate;
            var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
            var singleValue2 = this.state.singleValue2;
            if (moment(this.state.singleValue2.year + "-" + (this.state.singleValue2.month <= 9 ? "0" + this.state.singleValue2.month : this.state.singleValue2.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                var cutOffEndDate = moment(cutOffDate).add(18, 'months').startOf('month').format("YYYY-MM-DD");
                singleValue2 = { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: { year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) } };
                // localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
            }
            this.setState({
                minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
                singleValue2: singleValue2
            })
            if (versionId.toString().includes('Local')) {
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
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                        var proList = []
                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        planningunitRequest.onerror = function (event) {
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
                            proList.map(planningUnit => {
                                var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnit.planningUnit.id);
                                var programJson = {}
                                if (planningUnitDataIndex != -1) {
                                    var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnit.planningUnit.id))[0];
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
                                var dtstr = this.state.singleValue2.year + "-" + String(this.state.singleValue2.month).padStart(2, '0') + "-01"
                                var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnit.planningUnit.id && c.transDate == dtstr)
                                if (list.length > 0) {
                                    var json = {
                                        planningUnit: planningUnit.planningUnit,
                                        stock: document.getElementById("includePlanningShipments").value.toString() == 'true' ? list[0].closingBalance : list[0].closingBalanceWps,
                                        catalogPrice: planningUnit.catalogPrice,
                                        cost: roundN2(document.getElementById("includePlanningShipments").value.toString() == 'true' ? list[0].closingBalance * planningUnit.catalogPrice : list[0].closingBalanceWps * planningUnit.catalogPrice),
                                        calculated: list[0].regionCount > list[0].regionCountForStock ? 1 : 0
                                    }
                                    data.push(json)
                                } else {
                                    var json = {
                                        planningUnit: planningUnit.planningUnit,
                                        stock: 0,
                                        catalogPrice: planningUnit.catalogPrice,
                                        cost: 0,
                                        calculated: 0
                                    }
                                    data.push(json)
                                }
                            })
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
                var inputjson = {
                    "programId": programId,
                    "versionId": versionId,
                    "dt": moment(new Date(this.state.singleValue2.year, (this.state.singleValue2.month - 1), 1)).startOf('month').format('YYYY-MM-DD'),
                    "includePlannedShipments": document.getElementById("includePlanningShipments").value.toString() == "true" ? 1 : 0
                }
                ReportService.costOfInventory(inputjson).then(response => {
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
            this.setState({ costOfInventory: [], message: i18n.t('static.common.selectProgram') }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        } else {
            this.setState({ costOfInventory: [], message: i18n.t('static.program.validversion') }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        }
    }
    /**
     * Renders the Cost of Inventory report table.
     * @returns {JSX.Element} - Cost of Inventory report table.
     */
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
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))}) {item.cutOffDate != undefined && item.cutOffDate != null && item.cutOffDate != '' ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(item.cutOffDate).format('MMM YYYY') + ")" : ""}
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
                text: i18n.t('static.report.qatPID'),
            },
            {
                text: i18n.t('static.planningunit.planningunit'),
            },
            {
                text: i18n.t('static.report.stock'),
            }, {
                text: i18n.t('static.report.actualInv'),
            }, {
                text: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
            },
            {
                text: i18n.t('static.report.costUsd'),
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
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.togglecostOfInventory() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                            <a className="card-header-action">
                                {this.state.costOfInventory.length > 0 && <div className="card-header-actions">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-1 pt-lg-1 ">
                        <div ref={ref}>
                            <Form >
                                <div className=" pl-0">
                                    <div className="row ">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls edit">
                                                <Picker
                                                    ref="pickAMonth2"
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={singleValue2}
                                                    lang={pickerLang.months}
                                                    theme="dark"
                                                    key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(singleValue2)}
                                                    onDismiss={this.handleAMonthDissmis2}
                                                >
                                                    <MonthBox value={makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
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
                                                        onChange={(e) => { this.dataChange(e); this.formSubmit() }}
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
                        <div className="consumptionDataEntryTable">
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
                    </CardBody>
                </Card>
            </div >
        );
    }
}
