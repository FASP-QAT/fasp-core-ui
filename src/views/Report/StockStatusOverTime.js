import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import {
    Card, CardBody,
    Form,
    FormGroup, Input, InputGroup,
    Label,
    Table
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import RealmCountryService from '../../api/RealmCountryService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import { addDoubleQuoteToRowContent, dateFormatter, dateFormatterLanguage, filterOptions, formatter, makeText, roundAMC, roundARU, roundN } from '../../CommonComponent/JavascriptCommonFunctions';
const options = {
    title: {
        display: true,
        text: i18n.t('static.dashboard.stockstatusovertime')
    },
    scales: {
        yAxes: [
            {
                scaleLabel: {
                    display: true,
                    labelString: i18n.t('static.report.mos'),
                    fontColor: 'black'
                },
                ticks: {
                    beginAtZero: true,
                    fontColor: 'black',
                    callback: function (value) {
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
                }
            }
        ], xAxes: [{
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.common.month'),
                fontColor: 'black',
                fontStyle: "normal",
                fontSize: "12"
            },
            ticks: {
                fontColor: 'black'
            }
        }]
    },
    tooltips: {
        mode: 'index',
        enabled: false,
        custom: CustomTooltips,
        callback: function (value) {
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
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black',
            fontSize: 12,
            boxWidth: 9,
            boxHeight: 2
        }
    }
}
/**
 * Component for Stock Status Overtime Report.
 */
class StockStatusOverTime extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            matricsList: [],
            dropdownOpen: false,
            radioSelected: 2,
            productCategories: [],
            planningUnits: [],
            countries: [],
            programs: [],
            versions: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            countryValues: [],
            countryLabels: [],
            programValues: [],
            programLabels: [],
            planningUnitlines: [],
            lineData: [],
            lineDates: [],
            monthsInPastForAmc: "",
            monthsInFutureForAmc: 0,
            planningUnitMatrix: {
                date: []
            },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: ''
        }
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
    }
    /**
     * Handles the change event for planning units.
     * @param {Array} event - An array containing the selected planning unit IDs.
     */
    handlePlanningUnitChange = (event) => {
        var planningUnitIds = event
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
    unCheck = () => {
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => { this.fetchData(); })
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
                        // this.updateMonthsforAMCCalculations()
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
     * Updates the months for AMC calculations based on the selected program.
     * Resets the months in the past for AMC and sets the months in the future for AMC to 0.
     * Fetches data after updating the state.
     */
    updateMonthsforAMCCalculations = () => {
        let programId = this.state.programId;
        if (programId != 0) {
            const program = this.state.programs.filter(c => c.programId == programId)
            if (program.length == 1) {
                this.setState({
                    monthsInPastForAmc: "",
                    monthsInFutureForAmc: 0
                }, () => { this.fetchData() })
            }
        }
    }
    /**
     * Updates the months for AMC calculations based on the user input.
     * If the event target name is "monthsInPastForAmc", updates the months in the past for AMC and fetches data.
     * If the event target name is "monthsInFutureForAmc", updates the months in the future for AMC and fetches data.
     * @param {Event} event - The event object containing information about the changed input field.
     */
    changeMonthsForamc = (event) => {
        if (event.target.name === "monthsInPastForAmc") {
            this.setState({ monthsInPastForAmc: event.target.value }, () => { this.fetchData() })
        }
        if (event.target.name === "monthsInFutureForAmc") {
            this.setState({
                monthsInFutureForAmc: event.target.value
            }, () => { this.fetchData() })
        }
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
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        planningUnitValues: [],
                        planningUnitLabels: []
                    }, () => {
                        DropdownService.getVersionListForProgram(PROGRAM_TYPE_SUPPLY_PLAN, programId)
                            .then(response => {
                                this.setState({
                                    versions: []
                                }, () => {
                                    this.setState({
                                        versions: response.data
                                    }, () => {
                                        this.unCheck();
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
                    });
                } else {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        planningUnitValues: [],
                        planningUnitLabels: []
                    }, () => {
                        this.unCheck();
                        this.consolidatedVersionList(programId)
                    })
                }
            } else {
                this.setState({
                    versions: [], planningUnits: [],
                    planningUnitValues: [],
                    planningUnitLabels: []
                }, () => { this.unCheck(); })
            }
        } else {
            this.setState({
                versions: [], planningUnits: [],
                planningUnitValues: [],
                planningUnitLabels: []
            }, () => { this.unCheck(); })
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
                        version.cutOffDate = JSON.parse(programData).cutOffDate!=undefined && JSON.parse(programData).cutOffDate!=null && JSON.parse(programData).cutOffDate!=""?JSON.parse(programData).cutOffDate:""
                        verList.push(version)
                    }
                }
                let versionList = verList.filter(function (x, i, a) {
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
     * Retrieves the list of planning units for a selected program.
     */
    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
            } else {
                localStorage.setItem("sesVersionIdReport", versionId);
                var cutOffDateFromProgram=this.state.versions.filter(c=>c.versionId==versionId)[0].cutOffDate;
                var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
                var rangeValue = this.state.rangeValue;
                if (moment(this.state.rangeValue.from.year + "-" + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                    var cutOffEndDate=moment(cutOffDate).add(18,'months').startOf('month').format("YYYY-MM-DD");
                    rangeValue= { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: {year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M"))}};
                    // localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
                }
                this.setState({
                    minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
                    rangeValue: rangeValue,
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
                                    proList[i] = myResult[i].planningUnit
                                }
                            }
                            var lang = this.state.lang;
                            this.setState({
                                planningUnits: proList.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), message: '',
                            }, () => {
                                this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)
                }
                else {
                    var json = {
                        tracerCategoryIds: [],
                        programIds: [programId]
                    }
                    DropdownService.getProgramPlanningUnitDropdownList(json).then(response => {
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
            }
        });
    }
    /**
     * Sets the program ID and resets the version ID.
     * @param {Object} event - The event object containing the program ID value.
     */
    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            this.filterVersion();
            // this.updateMonthsforAMCCalculations()
        })
    }
    /**
     * Sets the selected version ID in the component state and updates local storage.
     * If the version ID is not empty or undefined, it triggers data fetching.
     * If the version ID is empty or undefined, it triggers fetching of planning units.
     * @param {Object} event - The event object representing the version selection
     */
    setVersionId(event) {
        if (this.state.versionId != '' || this.state.versionId != undefined) {
            this.setState({
                versionId: event.target.value
            }, () => {
                // if (this.state.versionId.includes("Local")) {
                    var cutOffDateFromProgram=this.state.versions.filter(c=>c.versionId==this.state.versionId)[0].cutOffDate;
                    var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
                    var rangeValue = this.state.rangeValue;
                    if (moment(this.state.rangeValue.from.year + "-" + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                        var cutOffEndDate=moment(cutOffDate).add(18,'months').startOf('month').format("YYYY-MM-DD");
                        rangeValue= { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: {year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M"))}};
                        // localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
                    }
                    this.setState({
                      minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
                      rangeValue: rangeValue
                    })
                //   }
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
    /**
     * Calls the get programs function on page load
     */
    componentDidMount() {
        this.getPrograms();
    }
    /**
     * Toggles the value of the 'show' state variable.
     */
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    /**
     * Fetches data based on the provided parameters.
     * Retrieves data either from a local database (IndexedDB) or a remote server.
     */
    fetchData() {
        let planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString())
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        // let monthsInFutureForAmc = this.state.monthsInFutureForAmc
        // let monthsInPastForAmc = this.state.monthsInPastForAmc
        let monthsInFutureForAmc = 0;
        let monthsInPastForAmc = 0;
        if (planningUnitIds.length > 0 && versionId != 0 && programId > 0) {
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
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;

                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        planningunitRequest.onerror = function (event) {
                            alert('error');
                        }.bind(this);

                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            
                            planningUnitIds.map(planningUnitId => {
                                var ppu = myResult.filter(c => c.program.id == programId && c.planningUnit.id == planningUnitId)[0];
                                monthsInPastForAmc = ppu.monthsInPastForAmc;
                                monthsInFutureForAmc = ppu.monthsInFutureForAmc;

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
                                var pu = (this.state.planningUnits.filter(c => c.id == planningUnitId))[0]
                                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                                var monthstartfrom = this.state.rangeValue.from.month
                                for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                                    for (var month = monthstartfrom; month <= 12; month++) {
                                        var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                                        var dt = dtstr
                                        var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnitId && c.transDate == dt)
                                        if (list.length > 0) {
                                            var endingBalance = list[0].closingBalance
                                            var amcBeforeArray = [];
                                            var amcAfterArray = [];
                                            for (var c = 0; c < monthsInPastForAmc; c++) {
                                                var month1MonthsBefore = moment(dt).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                                var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate == month1MonthsBefore);
                                                if (consumptionListForAMC.length > 0) {
                                                    var consumptionQty = 0;
                                                    for (var j = 0; j < consumptionListForAMC.length; j++) {
                                                        var count = 0;
                                                        for (var k = 0; k < consumptionListForAMC.length; k++) {
                                                            if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                                                count++;
                                                            } else {
                                                            }
                                                        }
                                                        if (count == 0) {
                                                            consumptionQty += (Number((consumptionListForAMC[j].consumptionQty)));
                                                        } else {
                                                            if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                                consumptionQty += (Number((consumptionListForAMC[j].consumptionQty)));
                                                            }
                                                        }
                                                    }
                                                    amcBeforeArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                                    var amcArrayForMonth = amcBeforeArray.filter(c => c.month == dtstr);
                                                }
                                            }
    
                                            for (var c = 0; c < monthsInFutureForAmc; c++) {
                                                var month1MonthsAfter = moment(dt).add(c, 'months').format("YYYY-MM-DD");
                                                var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate == month1MonthsAfter);
                                                if (consumptionListForAMC.length > 0) {
                                                    var consumptionQty = 0;
                                                    for (var j = 0; j < consumptionListForAMC.length; j++) {
                                                        var count = 0;
                                                        for (var k = 0; k < consumptionListForAMC.length; k++) {
                                                            if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                                                count++;
                                                            } else {
                                                            }
                                                        }
                                                        if (count == 0) {
                                                            consumptionQty += (Number((consumptionListForAMC[j].consumptionQty)));
                                                        } else {
                                                            if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                                consumptionQty += (Number((consumptionListForAMC[j].consumptionQty)));
                                                            }
                                                        }
                                                    }
                                                    amcAfterArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                                    amcArrayForMonth = amcAfterArray.filter(c => c.month == dtstr);
                                                }
                                            }
                                            var amcArray = amcBeforeArray.concat(amcAfterArray);
                                            var amcArrayFilteredForMonth = amcArray.filter(c => dtstr == c.month);
                                            var countAMC = amcArrayFilteredForMonth.length;
                                            var sumOfConsumptions = 0;
                                            for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                                sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                            }
                                            var amcCalcualted = 0
                                            var mos = null
                                            if (countAMC > 0 && sumOfConsumptions > 0) {
                                                amcCalcualted = (sumOfConsumptions) / countAMC;
                                                mos = endingBalance < 0 ? 0 / amcCalcualted : endingBalance / amcCalcualted
                                            } else if (countAMC == 0) {
                                                amcCalcualted = null;
                                            }
                                            var json = {
                                                "dt": new Date(from, month - 1),
                                                "program": this.state.programs,
                                                "planningUnit": pu,
                                                "stock": list[0].closingBalance,
                                                "consumptionQty": list[0].consumptionQty,
                                                "mosPast": monthsInPastForAmc,
                                                "mosFuture": monthsInFutureForAmc,
                                                "amc": amcCalcualted,
                                                // "amcMonthCount": countAMC,
                                                "mos": mos != null ? roundN(mos) : null
                                            }
                                            data.push(json)
                                        } else {
                                            var json = {
                                                "dt": new Date(from, month - 1),
                                                "program": this.state.programs,
                                                "planningUnit": pu,
                                                "stock": 0,
                                                "consumptionQty": '',
                                                "mosPast": monthsInPastForAmc,
                                                "mosFuture": monthsInFutureForAmc,
                                                "amc": null,
                                                // "amcMonthCount": 0,
                                                "mos": null
                                            }
                                            data.push(json)
                                        }
                                        if (month == this.state.rangeValue.to.month && from == to) {
                                            this.setState({
                                                matricsList: data,
                                                message: '',
                                                loading: false
                                            })
                                            return;
                                        }
                                    }
                                    monthstartfrom = 1
                                }
                                this.setState({ loading: false })
                            })
                        }.bind(this);

                        
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({ loading: true })
                var input = {
                    "programId": programId,
                    "versionId": versionId,
                    "planningUnitIds": planningUnitIds,
                    // "mosPast": document.getElementById("monthsInPastForAmc").selectedOptions[0].value == "" ? null : document.getElementById("monthsInPastForAmc").selectedOptions[0].value,
                    // "mosFuture": document.getElementById("monthsInFutureForAmc").selectedOptions[0].value == 0 ? null : document.getElementById("monthsInFutureForAmc").selectedOptions[0].value,
                    "startDate": startDate,
                    "stopDate": stopDate
                }
                ReportService.getStockOverTime(input)
                    .then(response => {
                        this.setState({
                            matricsList: response.data,
                            message: '', loading: false
                        })
                    }).catch(
                        error => {
                            this.setState({
                                matricsList: [], loading: false
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
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), matricsList: [] });
        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
        } else if (planningUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), matricsList: [] });
        } else if (monthsInPastForAmc == undefined || monthsInPastForAmc == "") {
            this.setState({ message: i18n.t('static.realm.monthInPastForAmcText'), matricsList: [] });
        } else {
            this.setState({ message: i18n.t('static.realm.monthInFutureForAmcText'), matricsList: [] });
        }
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.planningUnitValues.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.label).toString()).replaceAll(' ', '%20') + '"'))
        // csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.report.mospast') + ' : ' + document.getElementById("monthsInPastForAmc").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.report.mosfuture') + ' : ' + document.getElementById("monthsInFutureForAmc").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        var re;
        var A = [addDoubleQuoteToRowContent([i18n.t('static.common.month'), ((i18n.t('static.report.qatPID')).replaceAll(',', '%20')).replaceAll(' ', '%20'), ((i18n.t('static.planningunit.planningunit')).replaceAll(',', '%20')).replaceAll(' ', '%20'), i18n.t('static.report.stock'), ((i18n.t('static.report.consupmtionqty')).replaceAll(',', '%20')).replaceAll(' ', '%20'), (i18n.t('static.report.mospast')).replaceAll(' ', '%20'), (i18n.t('static.report.mosfuture')).replaceAll(' ', '%20'), i18n.t('static.report.amc'), i18n.t('static.report.mos')])]
        this.state.matricsList.map(elt => A.push(addDoubleQuoteToRowContent([moment(elt.dt).format(DATE_FORMAT_CAP_FOUR_DIGITS).replaceAll(' ', '%20'), elt.planningUnit.id, ((getLabelText(elt.planningUnit.label, this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.stock == null ? '' : roundARU(elt.stock,1), elt.consumptionQty == null ? '' : roundARU(elt.consumptionQty,1), elt.mosPast == null ? '' : elt.mosPast, elt.mosFuture == null ? '' : elt.mosFuture, elt.amc != null ? roundAMC(elt.amc) : "", elt.mos != null ? roundN(elt.mos) : i18n.t("static.supplyPlanFormula.na")])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.stockstatusovertime') + '_' + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Exports the data to a PDF file.
     */
    exportPDF = () => {
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
                doc.addImage(LOGO, 'png', 0, 10, 200, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.stockstatusovertimeReport'), doc.internal.pageSize.width / 2, 60, {
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
                    // doc.text(i18n.t('static.report.mospast') + ' : ' + document.getElementById("monthsInPastForAmc").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                    //     align: 'left'
                    // })
                    // doc.text(i18n.t('static.report.mosfuture') + ' : ' + document.getElementById("monthsInFutureForAmc").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
                    //     align: 'left'
                    // })
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnitValues.map(ele => ele.label)).join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 150, planningText)
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const title = i18n.t('static.report.stockstatusovertimeReport');
        var canvas = document.getElementById("cool-canvas");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var startY = 170 + doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnitValues.map(ele => ele.label)).join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10;
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        doc.setTextColor("#fff");
        if (startYtable > (height - 400)) {
            doc.addPage()
            startYtable = 80
        }
        doc.addImage(canvasImg, 'png', 50, startYtable, 750, 230, 'CANVAS');
        const headers = [[i18n.t('static.common.month'), i18n.t('static.report.qatPID'), i18n.t('static.planningunit.planningunit'), i18n.t('static.report.stock'), i18n.t('static.report.consupmtionqty'), i18n.t('static.report.mospast'), i18n.t('static.report.mosfuture'), i18n.t('static.report.amc'), i18n.t('static.report.mos')]];
        const data = [];
        // this.state.matricsList.map(elt => data.push([dateFormatter(elt.dt), elt.planningUnit.id, getLabelText(elt.planningUnit.label, this.state.lang), formatter(elt.stock,0), formatter(elt.consumptionQty,0), formatter(roundAMC(elt.amc),0), elt.amcMonthCount, elt.mos != null ? roundN(elt.mos) : i18n.t("static.supplyPlanFormula.na")]));
        this.state.matricsList.map(elt => data.push([dateFormatter(elt.dt), elt.planningUnit.id, getLabelText(elt.planningUnit.label, this.state.lang), formatter(roundARU(elt.stock,1),0), formatter(roundARU(elt.consumptionQty,1),0), elt.mosPast, elt.mosFuture, formatter(roundAMC(elt.amc),0), elt.mos != null ? roundN(elt.mos) : i18n.t("static.supplyPlanFormula.na")]));
        doc.addPage()
        startYtable = 80
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: startYtable,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 85 },
            columnStyles: {
                2: { cellWidth: 166.89 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.stockstatusovertimeReport').concat('.pdf'));
    }
    /**
     * Renders the Stock Status Overtime report table.
     * @returns {JSX.Element} - Stock Status Overtime report table.
     */
    render() {
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
            }, this);
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode}
                    </option>
                )
            }, this);
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))}) {item.cutOffDate!=undefined && item.cutOffDate!=null && item.cutOffDate!=''?" ("+i18n.t("static.supplyPlan.start")+" "+moment(item.cutOffDate).format('MMM YYYY')+")":""}
                    </option>
                )
            }, this);
        const backgroundColor = [
            '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
            '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
            '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
        ]
        var v = this.state.planningUnitValues.map(pu => this.state.matricsList.filter(c => c.planningUnit.id == pu.value).map(ele => (roundN(ele.mos) > 48 ? 48 : ele.mos != null ? roundN(ele.mos) : i18n.t("static.supplyPlanFormula.na"))))
        var dts = Array.from(new Set(this.state.matricsList.map(ele => (dateFormatterLanguage(ele.dt)))))
        const bar = {
            labels: dts,
            datasets: this.state.planningUnitValues.map((ele, index) => ({ type: "line", pointStyle: 'line', lineTension: 0, backgroundColor: 'transparent', label: ele.label, data: v[index], borderColor: backgroundColor[index] }))
        }
        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
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
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleStockStatusOverTime() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                            {
                                this.state.matricsList.length > 0 &&
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                </a>
                            }
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <div >
                            <Form >
                                <div className="pl-0">
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
                                            <div className="controls">
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
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    filterOptions={filterOptions}
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                    value={this.state.planningUnitValues}
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    labelledBy={i18n.t('static.common.select')}
                                                    disabled={this.state.loading}
                                                />
                                            </div>
                                        </FormGroup>
                                        {/* <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.mospast')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="monthsInPastForAmc"
                                                        id="monthsInPastForAmc"
                                                        bsSize="sm"
                                                        value={this.state.monthsInPastForAmc}
                                                        onChange={(e) => { this.changeMonthsForamc(e) }}
                                                    >
                                                        <option value="">-</option>
                                                        <option value="0">{0}</option>
                                                        <option value="1">{1}</option>
                                                        <option value="2">{2}</option>
                                                        <option value="3">{3}</option>
                                                        <option value="4">{4}</option>
                                                        <option value="5">{5}</option>
                                                        <option value="6">{6}</option>
                                                        <option value="7">{7}</option>
                                                        <option value="8">{8}</option>
                                                        <option value="9">{9}</option>
                                                        <option value="10">{10}</option>
                                                        <option value="11">{11}</option>
                                                        <option value="12">{12}</option>
                                                    </Input></InputGroup></div>
                                        </FormGroup> */}
                                        {/* <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.mosfuture')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="monthsInFutureForAmc"
                                                        id="monthsInFutureForAmc"
                                                        bsSize="sm"
                                                        value={this.state.monthsInFutureForAmc}
                                                        onChange={(e) => { this.changeMonthsForamc(e) }}
                                                    >
                                                        <option value="0">-</option>
                                                        <option value="1">{1}</option>
                                                        <option value="2">{2}</option>
                                                        <option value="3">{3}</option>
                                                        <option value="4">{4}</option>
                                                        <option value="5">{5}</option>
                                                        <option value="6">{6}</option>
                                                        <option value="7">{7}</option>
                                                        <option value="8">{8}</option>
                                                        <option value="9">{9}</option>
                                                        <option value="10">{10}</option>
                                                        <option value="11">{11}</option>
                                                        <option value="12">{12}</option>
                                                    </Input></InputGroup></div>
                                        </FormGroup> */}
                                    </div>
                                </div>
                            </Form>
                        </div>
                        <div className="row">
                            {(this.state.matricsList.length > 0) && <div className="col-md-12">
                                <div className="col-md-12">
                                    <div className="chart-wrapper chart-graph-report">
                                        <Line id="cool-canvas" data={bar} options={options} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                        {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                    </button>
                                </div>
                                <br></br>
                            </div>}</div>
                        <div className="row mt-4" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div className="col-md-12">
                                {this.state.show && this.state.matricsList.length > 0 &&
                                    <div className='table-responsive fixTableHead'>
                                        <Table className="table-striped table-bordered text-center">
                                            <thead>
                                                <tr>
                                                    <th className="text-center" style={{ width: '10%' }}> {i18n.t('static.common.month')} </th>
                                                    <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.planningunit.planningunit')}</th>
                                                    <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.stock')}</th>
                                                    <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.consupmtionqty')}</th>
                                                    <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.mospast')}</th>
                                                    <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.mosfuture')}</th>
                                                    <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.amc')}</th>
                                                    {/* <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.noofmonth')}</th> */}
                                                    <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.mos')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.matricsList.length > 0
                                                    &&
                                                    this.state.matricsList.map(item =>
                                                        <tr id="addr0" >
                                                            <td>{dateFormatter(item.dt)}</td>
                                                            <td>
                                                                {getLabelText(item.planningUnit.label, this.state.lang)}
                                                            </td>
                                                            <td>
                                                                {formatter(roundARU(item.stock,1),0)}
                                                            </td>
                                                            <td>
                                                                {formatter(roundARU(item.consumptionQty,1),0)}
                                                            </td>
                                                            <td>
                                                                {formatter(item.mosPast,0)}
                                                            </td>
                                                            <td>
                                                                {formatter(item.mosFuture,0)}
                                                            </td>
                                                            <td>
                                                                {formatter(roundAMC(item.amc,0))}
                                                            </td>
                                                            {/* <td>
                                                                {formatter(item.amcMonthCount,0)}
                                                            </td> */}
                                                            <td>
                                                                {item.mos != null ? roundN(item.mos) : i18n.t("static.supplyPlanFormula.na")}
                                                            </td>
                                                        </tr>)}
                                            </tbody>
                                        </Table>
                                    </div>}
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
                    </CardBody></Card>
            </div>
        );
    }
}
export default StockStatusOverTime
