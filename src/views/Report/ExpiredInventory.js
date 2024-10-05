import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import Picker from 'react-month-picker';
import NumberFormat from 'react-number-format';
import {
    Button,
    Card,
    CardBody,
    Col,
    FormGroup, Input, InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Table
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import {
    API_URL,
    DATE_FORMAT_CAP,
    DATE_FORMAT_CAP_WITHOUT_DATE,
    INDEXED_DB_NAME, INDEXED_DB_VERSION,
    JEXCEL_DATE_FORMAT_SM,
    JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY,
    PROGRAM_TYPE_SUPPLY_PLAN,
    REPORT_DATEPICKER_END_MONTH,
    REPORT_DATEPICKER_START_MONTH,
    SECRET_KEY
} from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, dateFormatterCSV, formatter, makeText, roundARU } from '../../CommonComponent/JavascriptCommonFunctions';
import { loadedForNonEditableTables, dateformatterCSV } from '../../CommonComponent/JExcelCommonFunctions';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
/**
 * Component for Expired Inventory Report.
 */
export default class ExpiredInventory extends Component {
    constructor(props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            outPutList: [],
            programs: [],
            versions: [],
            planningUnits: [],
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: '',
            ledgerForBatch: [],
            expiredStockModal: false,
            lang: localStorage.getItem('lang')
        }
    }
    /**
     * Calls the get programs function on page load
     */
    componentDidMount() {
        this.getPrograms();
    }
    /**
     * Sets the selected program ID selected by the user.
     * @param {object} event - The event object containing information about the program selection.
     */
    setProgramId(event) {
        this.setState(
            {
                programId: event.target.value,
                versionId: ''
            }, () => {
                localStorage.setItem("sesVersionIdReport", '');
                this.filterVersion();
            })
    }
    /**
     * Sets the version ID and updates the tracer category list.
     * @param {Object} event - The event object containing the version ID value.
     */
    setVersionId(event) {
        this.setState(
            {
                versionId: event.target.value
            }, () => {
                this.getPlanningUnit();
            })
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
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
    /**
     * Filters versions based on the selected program ID and updates the state accordingly.
     * Sets the selected program ID in local storage.
     * Fetches version list for the selected program and updates the state with the fetched versions.
     * Handles error cases including network errors, session expiry, access denial, and other status codes.
     */
    filterVersion = () => {
        let programId = this.state.programId;
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
                versions: [],
                message: i18n.t('static.common.selectProgram'),
                outPutList: []
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
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
    /**
     * Retrieves the list of planning units for a selected program and version.
     */
    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: []
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), stockStatusList: [], outPutList: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
            } else {
                localStorage.setItem("sesVersionIdReport", versionId);
                var cutOffDateFromProgram = this.state.versions.filter(c => c.versionId == this.state.versionId)[0].cutOffDate;
                var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
                var rangeValue = this.state.rangeValue;
                if (moment(this.state.rangeValue.from.year + "-" + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                    var cutOffEndDate = moment(cutOffDate).add(18, 'months').startOf('month').format("YYYY-MM-DD");
                    rangeValue = { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: { year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) } };
                    // localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
                }
                this.setState({
                    minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
                    rangeValue: rangeValue
                })
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
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        this.setState({
                            planningUnits: response.data, message: ''
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
    /**
     * Formats a date value into the format 'DD-MMM-YY' (e.g., '20 Jan 22').
     * @param {Date|string} value - The date value to be formatted. It can be a Date object or a string representing a date.
     * @returns {string} - The formatted date string in the 'DD-MMM-YY' format.
     */
    dateformatter = value => {
        var dt = new Date(value)
        return moment(dt).format('DD-MMM-YY');
    }
    /**
     * Fetches data based on selected filters.
     */
    fetchData() {
        let json = {
            "programId": document.getElementById("programId").value,
            "versionId": document.getElementById("versionId").value,
            "startDate": this.state.rangeValue.from.year + '-' + ("00" + this.state.rangeValue.from.month).substr(-2) + '-01',
            "stopDate": this.state.rangeValue.to.year + '-' + ("00" + this.state.rangeValue.to.month).substr(-2) + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
            "includePlannedShipment": document.getElementById("includePlanningShipments").value.toString() == 'true' ? 1 : 0,
            "includePlannedShipments": document.getElementById("includePlanningShipments").value.toString() == 'true' ? 1 : 0
        }
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        if (programId > 0 && versionId != 0) {
            if (versionId.includes('Local')) {
                startDate = this.state.rangeValue.from.year + '-' + String(this.state.rangeValue.from.month).padStart(2, '0') + '-01';
                endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
                this.setState({ loading: true })
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'), loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var version = (versionId.split('(')[0]).trim()
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var program = `${programId}_v${version}_uId_${userId}`
                    var programDataOs = programDataTransaction.objectStore('programData');
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'), loading: false
                        })
                    }.bind(this);
                    var program1 = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                    var getRequest1 = program1.getAll();
                    var programPlanningUnitList = [];
                    getRequest1.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: '#BA0C2F',
                            loading: false
                        })
                    }.bind(this);
                    getRequest1.onsuccess = function (event) {
                        programPlanningUnitList = getRequest1.result;
                    }
                    programRequest.onsuccess = function (e) {
                        this.setState({
                            localProgramId: programRequest.result.id
                        })
                        var generalProgramDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                        var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                        var generalProgramJson = JSON.parse(generalProgramData);
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                        var supplyPlan = [];
                        var shipmentList = [];
                        for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                            var planningUnitData = planningUnitDataList[pu];
                            var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            var spList = programJson.supplyPlan;
                            supplyPlan = supplyPlan.concat(spList);
                            var smList = programJson.shipmentList;
                            shipmentList = shipmentList.concat(smList);
                        }
                        this.setState({
                            supplyPlanDataForAllTransDate: supplyPlan
                        })
                        var list = (supplyPlan).filter(c => (c.expiredStock > 0 && (c.transDate >= startDate && c.transDate <= endDate)));
                        var data = []
                        list.map(ele => {
                            var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == ele.planningUnitId))[0]
                            if (pu != null) {
                                var list1 = [];
                                if (document.getElementById("includePlanningShipments").value.toString() == 'true') {
                                    list1 = ele.batchDetails.filter(c => (c.expiredQty > 0) && (c.expiryDate >= startDate && c.expiryDate <= endDate))
                                } else {
                                    list1 = ele.batchDetails.filter(c => (c.expiredQtyWps > 0) && (c.expiryDate >= startDate && c.expiryDate <= endDate))
                                }
                                list1.map(ele1 => {
                                    var cost = programPlanningUnitList.filter(c => c.planningUnit.id == pu.planningUnit.id)[0].catalogPrice;
                                    const temp1 = shipmentList.filter((c) => {
                                        if (c.batchInfoList.length > 0) {
                                            const batchIds = c.batchInfoList.map((p) => p.batch.batchNo);
                                            const expiries = c.batchInfoList.map((p) => moment(p.batch.expiryDate).format("YYYY-MM"));
                                            return c.planningUnit.id === pu.planningUnit.id &&
                                                batchIds.includes(ele1.batchNo) &&
                                                expiries.includes(moment(ele1.expiryDate).format("YYYY-MM"));
                                        }
                                    });
                                    if (temp1.length > 0) {
                                        cost = temp1[0].rate;
                                    }
                                    let expiredQuantity = document.getElementById("includePlanningShipments").value.toString() == 'true' ? ele1.expiredQty : ele1.expiredQtyWps;
                                    var json = {
                                        planningUnit: pu.planningUnit,
                                        shelfLife: pu.shelfLife,
                                        batchInfo: ele1,
                                        expiredQty: document.getElementById("includePlanningShipments").value.toString() == 'true' ? ele1.expiredQty : ele1.expiredQtyWps,
                                        program: { id: generalProgramJson.programId, label: generalProgramJson.label, code: generalProgramJson.programCode },
                                        cost: cost
                                    }
                                    data.push(json)
                                })
                            }
                        })
                        this.setState({
                            outPutList: data
                        }, () => {
                            this.buildJExcel();
                        });
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({ loading: true })
                ReportService.getExpiredStock(json)
                    .then(response => {
                        var data = []
                        data = response.data.map(ele => ({
                            ...ele, ...{
                                shelfLife: (this.state.planningUnits.filter(c => c.planningUnit.id == ele.planningUnit.id))[0].shelfLife
                            }
                        }))
                        this.setState({
                            outPutList: data
                        }, () => {
                            this.buildJExcel();
                        });
                    }).catch(
                        error => {
                            this.setState({
                                outPutList: []
                            }, () => {
                                this.buildJExcel();
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
            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        } else if (versionId == 0) {
            this.setState({
                outPutList: []
                , message: i18n.t('static.program.validversion')
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            });
        }
    }
    /**
     * This function is used to display the ledger of a particular batch No for local versions
     * @param {*} batchNo This is the value of the batch number for which the ledger needs to be displayed
     * @param {*} createdDate This is the value of the created date for which the ledger needs to be displayed
     * @param {*} expiryDate  This is the value of the expire date for which the ledger needs to be displayed
     */
    showBatchLedgerClickedLocal(batchNo, createdDate, expiryDate) {
        this.setState({ loading: true })
        var supplyPlanForAllDate = this.state.supplyPlanDataForAllTransDate.filter(c => moment(c.transDate).format("YYYY-MM") >= moment(createdDate).format("YYYY-MM") && moment(c.transDate).format("YYYY-MM") <= moment(expiryDate).format("YYYY-MM"));
        var allBatchLedger = [];
        supplyPlanForAllDate.map(c =>
            c.batchDetails.map(bd => {
                var batchInfo = bd;
                batchInfo.transDate = c.transDate;
                allBatchLedger.push(batchInfo);
            }));
        var ledgerForBatch = allBatchLedger.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
        this.setState({
            ledgerForBatch: ledgerForBatch,
            loading: false
        })
    }
    /**
     * This function is used to display the ledger of a particular batch No for server versions
     * @param {*} batchNo The batch number for which the ledger needs to be displayed
     * @param {*} createdDate The created date for which the ledger needs to be displayed
     * @param {*} expiryDate The expire date for which the ledger needs to be displayed
     */
    showBatchLedgerClickedServer(batchId) {
        this.setState({ loading: true })
        var outPutList = this.state.outPutList.filter(c => c.batchInfo.batchId == batchId);
        var ledgerForBatch = [];
        if (outPutList.length > 0) {
            ledgerForBatch = outPutList[0].batchHistory;
        }
        this.setState({
            ledgerForBatch: ledgerForBatch,
            loading: false
        })
    }
    /**
     * Exports the data to a CSV file.
     * @param {array} columns - The columns to be exported.
     */
    exportCSV = (columns) => {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')) + '"')
        csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.outPutList.map(ele => A.push(addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), formatter(roundARU(ele.expiredQty, 1), 0), ele.batchInfo.batchNo, ele.batchInfo.autoGenerated == true ? i18n.t('static.program.yes') : i18n.t('static.program.no'), (dateFormatterCSV(ele.batchInfo.createdDate)).replaceAll(' ', '%20'), formatter(ele.shelfLife, 0), (dateformatterCSV(ele.batchInfo.expiryDate)).replaceAll(' ', '%20'), (formatter(Math.round(ele.cost * roundARU(ele.expiredQty, 1)), 0)).replaceAll(' ', '%20')])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.expiredInventory') + ".csv"
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
                doc.text(i18n.t('static.report.expiredInventory'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
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
        const data = this.state.outPutList.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label), formatter(roundARU(ele.expiredQty, 1), 0), ele.batchInfo.batchNo, ele.batchInfo.autoGenerated == true ? i18n.t('static.program.yes') : i18n.t('static.program.no'), this.dateformatter(ele.batchInfo.createdDate), ele.shelfLife, this.dateformatter(ele.batchInfo.expiryDate), (formatter(Math.round(ele.cost * roundARU(ele.expiredQty, 1)), 0))]);
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
        doc.save(i18n.t('static.report.expiredInventory') + ".pdf")
    }
    /**
     * Builds the jexcel table based on the output list.
     */
    buildJExcel() {
        let outPutList = this.state.outPutList;
        let outPutListArray = [];
        let count = 0;
        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            data[0] = getLabelText(outPutList[j].planningUnit.label, this.state.lang)
            data[1] = roundARU(outPutList[j].expiredQty, 1)
            data[2] = outPutList[j].batchInfo.batchNo
            data[3] = outPutList[j].batchInfo.autoGenerated == true ? i18n.t('static.program.yes') : i18n.t('static.program.no')
            data[4] = (outPutList[j].batchInfo.createdDate ? moment(outPutList[j].batchInfo.createdDate).format(`YYYY-MM-DD`) : null)
            data[5] = moment(outPutList[j].batchInfo.expiryDate).startOf('month').diff(moment(outPutList[j].batchInfo.createdDate).startOf('month'), 'months', true)
            data[6] = (outPutList[j].batchInfo.expiryDate ? moment(outPutList[j].batchInfo.expiryDate).format(`YYYY-MM-DD`) : null)
            data[7] = outPutList[j].batchInfo.batchId;
            data[8] = outPutList[j].planningUnit.id;
            data[9] = outPutList[j].cost * roundARU(outPutList[j].expiredQty, 1);
            outPutListArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = outPutListArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [150, 60, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.expiredQty'),
                    type: 'numeric', mask: (localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false") ? '#,##.000' : '#,##', decimal: '.',
                },
                {
                    title: i18n.t('static.inventory.batchNumber'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.autogenerated'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.batchstartdt'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                },
                {
                    title: i18n.t('static.report.shelfLife'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.supplyPlan.expiryDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                },
                {
                    type: 'hidden'
                    // title: 'A',
                    // type: 'text',
                    // visible: false
                },
                {
                    type: 'hidden'
                },
                {
                    title: i18n.t('static.shipment.totalCost'),
                    type: 'numeric', mask: '#,##',
                }
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
     * Redirects to the supply planning screen on row click.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            var elInstance = instance;
            var rowData = elInstance.getRowData(x);
            if (y == 1) {
                this.toggleLarge(rowData[2], rowData[4], rowData[6], rowData[7]);
            }
            if (y == 2) {
                let versionId = document.getElementById("versionId").value;
                if (versionId.includes('Local')) {
                    localStorage.setItem("batchNo", rowData[2]);
                    localStorage.setItem("expiryDate", rowData[6]);
                    window.open(window.location.origin + `/#/supplyPlan/${this.state.localProgramId}/${rowData[8]}/${rowData[2]}/${rowData[6]}`);
                }
            }
        }
    }.bind(this);
    /**
     * Toggle the batch ledger
     * @param {*} batchNo The batch number for which the ledger needs to be displayed
     * @param {*} createdDate The created date for which the ledger needs to be displayed 
     * @param {*} expiryDate The expire date for which the ledger needs to be displayed 
     * @param {*} batchId The batch Id for which the ledger needs to be displayed 
     */
    toggleLarge(batchNo, createdDate, expiryDate, batchId) {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal
        })
        let versionId = document.getElementById("versionId").value;
        if (versionId.includes('Local')) {
            this.showBatchLedgerClickedLocal(batchNo, createdDate, expiryDate);
        } else {
            this.showBatchLedgerClickedServer(batchId)
        }
    }
    /**
     * Toggles the expired stock modal on cancel clicked.
     */
    actionCanceledExpiredStock() {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal
        })
    }
    /**
     * Renders the Expired Inventory report table.
     * @returns {JSX.Element} - Expired Inventory report table.
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
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))}) {item.cutOffDate != undefined && item.cutOffDate != null && item.cutOffDate != '' ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(item.cutOffDate).format('MMM YYYY') + ")" : ""}
                    </option>
                )
            }, this);
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {(item.programCode)}
                    </option>
                )
            }, this)
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
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
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'expiredQty',
                text: i18n.t('static.report.expiredQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    var decimalFixedValue = cell;
                    decimalFixedValue += '';
                    var x = decimalFixedValue.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }
            },
            {
                dataField: 'batchInfo.batchNo',
                text: i18n.t('static.inventory.batchNumber'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            }, {
                dataField: 'batchInfo.autoGenerated',
                text: i18n.t('static.report.autogenerated'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            }, {
                dataField: 'batchInfo.createdDate',
                text: i18n.t('static.report.batchstartdt'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cellContent, row) => {
                    return (
                        (row.batchInfo.createdDate ? moment(row.batchInfo.createdDate).format(`${DATE_FORMAT_CAP}`) : null)
                    );
                }
            },
            {
                dataField: 'batchInfo.shelfLife',
                text: i18n.t('static.report.shelfLife'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cellContent, row) => {
                    return (
                        (moment(new Date(row.batchInfo.expiryDate)).diff(new Date(row.batchInfo.createdDate), 'months', true))
                    );
                }
            },
            {
                dataField: 'batchInfo.expiryDate',
                text: i18n.t('static.supplyPlan.expiryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cellContent, row) => {
                    return (
                        (row.batchInfo.expiryDate ? moment(row.batchInfo.expiryDate).format(`${DATE_FORMAT_CAP}`) : null)
                    );
                }
            },
            {
                dataField: 'cost',
                text: i18n.t('static.shipment.totalCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    var decimalFixedValue = cell;
                    decimalFixedValue += '';
                    var x = decimalFixedValue.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }
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
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
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
                    <CardBody className="pb-lg-3 pt-lg-0">
                        <div className="TableCust" >
                            <div ref={ref}>
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls edit">
                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={rangeValue}
                                                    lang={pickerLang}
                                                    key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
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
                                    </div>
                                </Col>
                            </div>
                        </div>
                        {this.state.outPutList.length > 0 && <span className='text-blackD' style={{ textAlign: 'left' }}><b>{i18n.t("static.expiryReport.batchInfoNote")}</b></span>}
                        <div className="consumptionDataEntryTable ProgramListSearchAlignment">
                            <div id="tableDiv" className={document.getElementById("versionId") != null && document.getElementById("versionId").value.includes('Local') ? "jexcelremoveReadonlybackground RowClickableExpiredInventory" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
                <Modal isOpen={this.state.expiredStockModal}
                    className={'modal-md modalWidthExpiredStock'}>
                    <ModalHeader toggle={() => this.toggleLarge('expiredStock')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.supplyPlan.batchLedger')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <>
                            <span className='text-blackD'> {this.state.ledgerForBatch.length > 0 ? i18n.t("static.inventory.batchNumber") + " : " + this.state.ledgerForBatch[0].batchNo : ""}
                                <br></br>
                                {i18n.t("static.batchLedger.note")}</span>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "100px" }} rowSpan="2" align="center">{i18n.t("static.common.month")}</th>
                                        <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.openingBalance")}</th>
                                        <th colSpan="3" align="center">{i18n.t("static.supplyPlan.userEnteredBatches")}</th>
                                        <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.autoAllocated") + " (+/-)"}</th>
                                        <th rowSpan="2" align="center">{i18n.t("static.report.closingbalance")}</th>
                                    </tr>
                                    <tr>
                                        <th align="center">{i18n.t("static.supplyPlan.consumption") + " (-)"}</th>
                                        <th align="center">{i18n.t("static.inventoryType.adjustment") + " (+/-)"}</th>
                                        <th align="center">{i18n.t("static.shipment.shipment") + " (+)"}</th>
                                    </tr>
                                </thead>
                                {this.state.ledgerForBatch.length > 0 && <tbody>
                                    {
                                        ((moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiryDate).format("YYYY-MM") == moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].transDate).format("YYYY-MM")) ? this.state.ledgerForBatch.slice(0, -1) : this.state.ledgerForBatch).map(item => (
                                            <tr>
                                                <td>{moment(item.transDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</td>
                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={document.getElementById("includePlanningShipments").value.toString() == 'true' ? item.openingBalance : item.openingBalanceWps} /></td>
                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.consumptionQty} /></td>
                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentQty} /></td>
                                                <td>{item.shipmentQty == 0 ? null : <NumberFormat displayType={'text'} thousandSeparator={true} value={document.getElementById("includePlanningShipments").value.toString() == 'true' ? item.shipmentQty : item.shipmentQtyWps} />}</td>
                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={document.getElementById("includePlanningShipments").value.toString() == 'true' ? (0 - Number(item.unallocatedQty)) : (0 - Number(item.unallocatedQtyWps))} /></td>
                                                {item.stockQty != null && Number(item.stockQty) > 0 ? <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={document.getElementById("includePlanningShipments").value.toString() == 'true' ? item.qty : item.qtyWps} /></b></td> : <td><NumberFormat displayType={'text'} thousandSeparator={true} value={document.getElementById("includePlanningShipments").value.toString() == 'true' ? item.qty : item.qtyWps} /></td>}
                                            </tr>
                                        ))
                                    }
                                </tbody>}
                                {this.state.ledgerForBatch.length > 0 && <tfoot>
                                    <tr>
                                        <td align="right" colSpan="6"><b>{i18n.t("static.supplyPlan.expiry")}</b></td>
                                        <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiredQty} /></b></td>
                                    </tr>
                                </tfoot>}
                            </Table>
                        </>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledExpiredStock()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}