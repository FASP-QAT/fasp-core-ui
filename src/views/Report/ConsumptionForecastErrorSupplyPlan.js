import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { MultiSelect } from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    CardFooter, Table, FormGroup, Input, InputGroup, Label, Form
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP, TITLE_FONT, API_URL } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { PercentageFormatter, addDoubleQuoteToRowContent, filterOptions, hideFirstComponent, hideSecondComponent, isSiteOnline, makeText, roundARU } from '../../CommonComponent/JavascriptCommonFunctions';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import NumberFormat from 'react-number-format';
import i18n from '../../i18n'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import moment from "moment";
import ReportService from '../../api/ReportService';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
/**
 * Component for Consumption Forecast Error Report.
 */
class ConsumptionForecastErrorSupplyPlan extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);

        this.state = {
            isDarkMode: false,
            lang: localStorage.getItem("lang"),
            consumptionUnitShowArr: [],
            programId: '',
            versionId: '',
            programs: [],
            versions: [],
            matricsList: [],
            regions: [],
            regionValues: [],
            regionLabels: [],
            viewById: 1,
            planningUnitId: "",
            planningUnitIds: [],
            forecastingUnitId: "",
            forecastingUnitIds: [],
            equivalencyUnitId: "",
            consumptionData: [],
            equivalencyUnitList: [],
            programEquivalencyUnitList: [],
            dataList: [],
            consumptionAdjForStockOutId: false,
            show: false,
            loading: true,
            defaultTimeWindow: true,
            yaxisEquUnit: -1,
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            forecastingUnits: [],
            allForecastingUnits: [],
            forecastingUnitValues: [],
            forecastingUnitLabels: [],
            // isEquUnitChecked:false,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            forecastErrorThreshold: 0,
            showForecastThresholdLegend: false
        };
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setRegionVal = this.setRegionVal.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setViewById = this.setViewById.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.getEquivalencyUnitData = this.getEquivalencyUnitData.bind(this);
        this.yAxisChange = this.yAxisChange.bind(this);
    }
    /**
     * Toggles the accordion to show or hide the consumption unit.
     * @param {string} consumptionUnitId - The ID of the consumption unit.
     */
    toggleAccordion(consumptionUnitId) {
        var consumptionUnitShowArr = this.state.consumptionUnitShowArr;

        if (consumptionUnitShowArr.includes(consumptionUnitId)) {
            consumptionUnitShowArr = consumptionUnitShowArr.filter(c => c != consumptionUnitId);
        } else {
            consumptionUnitShowArr.push(consumptionUnitId)
        }
        this.setState({
            consumptionUnitShowArr: consumptionUnitShowArr
        })
    }
    /**
     * Toggles the value of the 'show' state variable.
     */
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    /**
     * Sets the selected program ID selected by the user.
     * @param {object} event - The event object containing information about the program selection.
     */
    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: '',
            versions: [],
            planningUnits: [],
            planningUnitIds: [],
            forecastingUnits: [],
            allForecastingUnits: [],
            forecastingUnitIds: [],
            matricsList: [],
            regions: [],
            regionValues: [],
            regionLabels: [],
            viewById: 1,
            planningUnitId: "",
            forecastingUnitId: "",
            equivalencyUnitId: "",
            dataList: [],
            show: false,
            consumptionAdjForStockOutId: false
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            document.getElementById("consumptionAdjusted").checked = false;
            this.filterVersion();
            this.filterRegion();
        })
    }
    /**
     * Calls the get programs function on page load
     */
    componentDidMount() {
        // Detect initial theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        this.setState({ isDarkMode });

        // Listening for theme changes
        const observer = new MutationObserver(() => {
            const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            this.setState({ isDarkMode: updatedDarkMode });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        this.getPrograms();
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms = () => {
        this.setState({ loading: true })
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    this.setState({
                        programs: response.data, loading: false, show: false
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
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
        this.setState({ loading: true })
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
                var lang = this.state.lang;
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = a.programCode.toLowerCase();
                            b = b.programCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: localStorage.getItem("sesProgramIdReport"),
                        loading: false
                    }, () => {
                        this.filterVersion();
                        this.filterRegion();
                    })
                } else {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = a.programCode.toLowerCase();
                            b = b.programCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }), loading: false
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
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        this.setState({ loading: true })
        if (programId != 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        forecastingUnits: [],
                        allForecastingUnits: [],
                        show: false,
                        loading: false
                    }, () => {
                        this.setState({
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });
                } else {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        forecastingUnits: [],
                        allForecastingUnits: [],
                        show: false,
                        loading: false
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {
                this.setState({
                    versions: [],
                    planningUnits: [],
                    planningUnitValues: [],
                    show: false,
                    loading: false
                })
                this.fetchData();
            }
        } else {
            this.setState({
                versions: [],
                planningUnits: [],
                forecastingUnits: [],
                allForecastingUnits: [],
                show: false,
                loading: false
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
        const lan = 'en';
        const { versions } = this.state
        this.setState({ loading: true })
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
                            versionId: localStorage.getItem("sesVersionIdReport"),
                            loading: false
                        }, () => {
                            this.getPlanningUnitAndForcastingUnit();
                        })
                    } else {
                        this.setState({
                            versions: versionList,
                            versionId: versionList[0].versionId,
                            loading: false
                        }, () => {
                            this.getPlanningUnitAndForcastingUnit();
                        })
                    }
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: versionList[0].versionId,
                        loading: false
                    }, () => {
                        this.getPlanningUnitAndForcastingUnit();
                    })
                }
            }.bind(this);
        }.bind(this)
    }
    /**
     * Filters regions based on the selected program and sets the state accordingly.
     */
    filterRegion = () => {
        this.setState({ loading: true })
        let programId = this.state.programId;
        if (programId != 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        regions: [],
                        planningUnits: [],
                        forecastingUnits: [],
                        allForecastingUnits: [],
                        show: false,
                        loading: false
                    }, () => {
                        this.setState({
                            regions: program[0].regionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => {
                            this.consolidatedRegionList(programId)
                        });
                    });
                } else {
                    this.setState({
                        regions: [],
                        planningUnits: [],
                        forecastingUnits: [],
                        allForecastingUnits: [],
                        show: false,
                        loading: false
                    }, () => { this.consolidatedRegionList(programId) })
                }
            } else {
                this.setState({
                    regions: [],
                    planningUnits: [],
                    planningUnitValues: [],
                    show: false,
                    loading: false
                })
                this.fetchData();
            }
        } else {
            this.setState({
                regions: [],
                show: false
            })
        }

    }
    /**
     * Retrieves consolidated region list based on the provided programId.
        * Updates the state with the retrieved region data.
     */
    consolidatedRegionList = (programId) => {
        this.setState({ loading: true })
        const lan = 'en';
        const { regions } = this.state
        var regionList = regions;
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
                // if (regionList.length == 0) {
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId && myResult[i].version + " (Local)" == document.getElementById("versionId").value) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var region = JSON.parse(programData).regionList;
                        regionList = region
                    }
                }
                // }
                var regionIds = regionList.map((item, i) => {
                    return ({ label: getLabelText(item.label, this.state.lang), value: item.regionId })
                }, this)
                this.setState({
                    regions: regionList,
                    regionValues: regionIds.map(ele => ele),
                    regionLabels: regionIds.map(ele => ele.label),
                    loading: false,
                    consumptionUnitShowArr: regionIds.map(ele => ele.value)
                }, () => {
                    this.getEquivalencyUnitData();
                })
            }.bind(this);
        }.bind(this)
    }
    /**
     * Sets the planning unit based on the provided event data.
     * @param {Object} e - Event data containing planning unit information.
     */
    setPlanningUnit(e) {
        if (this.state.yaxisEquUnit > 0) {
            var forecastErrorThreshold = 0;
            var showForecastThresholdLegend = false;
            if (e.length == 1) {
                forecastErrorThreshold = this.state.planningUnits.filter(c => c.planningUnit.id == e[0].value)[0].forecastErrorThreshold;
                showForecastThresholdLegend = true;
            }
            var selectedText = e.map(item => item.label);
            this.setState({
                planningUnitIds: e,
                planningUnitLabels: selectedText,
                show: false,
                dataList: [],
                consumptionAdjForStockOutId: false,
                loading: false,
                forecastErrorThreshold: forecastErrorThreshold,
                showForecastThresholdLegend: showForecastThresholdLegend
            }, () => {
                document.getElementById("consumptionAdjusted").checked = false;
                this.fetchData();
            })
        } else {
            if (e.target.value != -1) {
                var forecastErrorThreshold = this.state.planningUnits.filter(c => c.planningUnit.id == e.target.value)[0].forecastErrorThreshold;
                this.setState({
                    planningUnitId: e.target.value,
                    planningUnitIds: [{ "label": document.getElementById("planningUnitId").selectedOptions[0].text, "value": e.target.value }],
                    planningUnitLabels: [document.getElementById("planningUnitId").selectedOptions[0].text],
                    show: false,
                    dataList: [],
                    consumptionAdjForStockOutId: false,
                    loading: false,
                    forecastErrorThreshold: forecastErrorThreshold,
                    showForecastThresholdLegend: true
                }, () => {
                    document.getElementById("consumptionAdjusted").checked = false;
                    this.fetchData();
                })
            } else {
                this.setState({
                    planningUnitId: e.target.value,
                    planningUnitIds: [],
                    planningUnitLabels: [],
                    show: false,
                    dataList: [],
                    consumptionAdjForStockOutId: false,
                    loading: false,
                    forecastErrorThreshold: 0,
                    showForecastThresholdLegend: false
                }, () => {
                    document.getElementById("consumptionAdjusted").checked = false;
                    this.fetchData();
                })
            }
        }
    }
    /**
     * Sets the y-axis equivalent unit ID and triggers data fetching.
     * @param {Object} e - Event data containing the y-axis equivalent unit ID.
     */
    setYaxisEquUnitId(e) {
        var yaxisEquUnit = e.target.value;
        this.setState({
            yaxisEquUnit: yaxisEquUnit,
            loading: false
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Retrieves planning units and forecasting units based on the selected program and version, and updates the state accordingly.
     */
    getPlanningUnitAndForcastingUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        var lang = this.state.lang;
        this.setState({
            planningUnits: [],
            forecastingUnits: [],
            allForecastingUnits: [],
            show: false,
            loading: true
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [], loading: false }, () => {
                    this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
                })
            } else {
                localStorage.setItem("sesVersionIdReport", versionId);
                var cutOffDateFromProgram = this.state.versions.filter(c => c.versionId == versionId)[0].cutOffDate;
                var cutOffDate = cutOffDateFromProgram != undefined && cutOffDateFromProgram != null && cutOffDateFromProgram != "" ? cutOffDateFromProgram : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
                var rangeValue = this.state.rangeValue;
                if (moment(this.state.rangeValue.from.year + "-" + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                    var cutOffEndDate = moment(cutOffDate).add(18, 'months').startOf('month').format("YYYY-MM-DD");
                    rangeValue = { from: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) }, to: { year: parseInt(moment(cutOffEndDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) } };
                    // localStorage.setItem("sesRangeValue", JSON.stringify(rangeValue));
                }
                this.setState({
                    minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
                    rangeValue: rangeValue,
                })
                var proList = [];
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
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    proList[i] = myResult[i]
                                }
                            }

                            var forcastingUnitList = proList.map(c => c.forecastingUnit);
                            const ids = forcastingUnitList.map(o => o.id);
                            const forecastingUnitList1 = forcastingUnitList.filter(({ id }, index) => !ids.includes(id, index + 1));
                            // var planningUnitList = proList.map(c => c.planningUnit);
                            let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;

                            if (yaxisEquUnitId != -1) {//Yes
                                let filteredProgramEQList = this.state.programEquivalencyUnitList.filter(c => c.equivalencyUnit.equivalencyUnitId == yaxisEquUnitId);
                                let newPlanningUnitList = [];
                                let newForecastingUnitList = [];
                                for (var i = 0; i < forecastingUnitList1.length; i++) {
                                    let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitList1[i].id);

                                    if (temp.length > 0) {
                                        newForecastingUnitList.push(forecastingUnitList1[i]);
                                    }
                                }
                                for (var i = 0; i < proList.length; i++) {
                                    if (proList[i]) {
                                        let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == proList[i].forecastingUnit.id);
                                        if (temp.length > 0) {
                                            newPlanningUnitList.push(proList[i]);
                                        }
                                    }
                                }

                                var yaxisEquUnitt = document.getElementById("yaxisEquUnit");
                                var selectedText = yaxisEquUnitt.options[yaxisEquUnitt.selectedIndex].text;

                                newPlanningUnitList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                });

                                newForecastingUnitList.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                })

                                this.setState({
                                    planningUnits: newPlanningUnitList,
                                    forecastingUnits: newForecastingUnitList,
                                    allForecastingUnits: forecastingUnitList1,
                                    planningUnitValues: newPlanningUnitList.map((item, i) => {
                                        return ({ label: getLabelText(item.planningUnit.label, lang), value: item.planningUnit.id })

                                    }, this),
                                    planningUnitLabels: newPlanningUnitList.map((item, i) => {
                                        return (getLabelText(item.planningUnit.label, lang))
                                    }, this),
                                    forecastingUnitValues: newForecastingUnitList.map((item, i) => {
                                        return ({ label: getLabelText(item.label, lang), value: item.id })

                                    }, this),
                                    forecastingUnitLabels: newForecastingUnitList.map((item, i) => {
                                        return (getLabelText(item.label, lang))
                                    }, this),
                                    equivalencyUnitLabel: selectedText,
                                    filteredProgramEQList: filteredProgramEQList,
                                    loading: false
                                }, () => {
                                    this.getEquivalencyUnitData();
                                    this.fetchData();
                                })

                            } else {//NO
                                proList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                });
                                forecastingUnitList1.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                })
                                this.setState({
                                    planningUnits: proList,
                                    forecastingUnits: forecastingUnitList1,
                                    allForecastingUnits: forecastingUnitList1,
                                    planningUnitValues: proList.map((item, i) => {
                                        return ({ label: getLabelText(item.planningUnit.label, lang), value: item.planningUnit.id })
                                    }, this),
                                    planningUnitLabels: proList.map((item, i) => {
                                        return (getLabelText(item.planningUnit.label, lang))
                                    }, this),
                                    forecastingUnitValues: forecastingUnitList1.map((item, i) => {
                                        return ({ label: getLabelText(item.label, lang), value: item.id })

                                    }, this),
                                    forecastingUnitLabels: forecastingUnitList1.map((item, i) => {
                                        return (getLabelText(item.label, lang))
                                    }, this),
                                    equivalencyUnitLabel: '',
                                    loading: false
                                    // planningUnits: filteredPU,
                                    // forecastingUnits: filtered
                                }, () => {
                                    this.getEquivalencyUnitData();
                                    this.fetchData();
                                })
                            }
                        }.bind(this);
                    }.bind(this);
                }
                else {
                    // AuthenticationService.setupAxiosInterceptors();
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        var listArray = response.data;
                        var forcastingUnitList = listArray.map(c => c.forecastingUnit);
                        const ids = forcastingUnitList.map(o => o.id);
                        const forecastingUnitList1 = forcastingUnitList.filter(({ id }, index) => !ids.includes(id, index + 1));
                        forecastingUnitList1.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });

                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        let forecastingUnitList = forecastingUnitList1;
                        let planningUnitList = listArray;

                        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;

                        if (yaxisEquUnitId != -1) {//Yes

                            let filteredProgramEQList = this.state.programEquivalencyUnitList.filter(c => c.equivalencyUnit.equivalencyUnitId == yaxisEquUnitId);

                            let newPlanningUnitList = [];
                            let newForecastingUnitList = [];
                            for (var i = 0; i < forecastingUnitList.length; i++) {
                                let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitList[i].id);
                                if (temp.length > 0) {
                                    newForecastingUnitList.push(forecastingUnitList[i]);
                                }
                            }

                            for (var i = 0; i < planningUnitList.length; i++) {
                                let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUnitList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newPlanningUnitList.push(planningUnitList[i]);
                                }
                            }

                            var yaxisEquUnitt = document.getElementById("yaxisEquUnit");
                            var selectedText = yaxisEquUnitt.options[yaxisEquUnitt.selectedIndex].text;

                            newPlanningUnitList.sort(function (a, b) {
                                a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            });

                            newForecastingUnitList.sort(function (a, b) {
                                a = getLabelText(a.label, lang).toLowerCase();
                                b = getLabelText(b.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })

                            this.setState({
                                planningUnits: newPlanningUnitList,
                                forecastingUnits: newForecastingUnitList,
                                allForecastingUnits: forecastingUnitList,
                                planningUnitValues: newPlanningUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.planningUnit.label, lang), value: item.planningUnit.id })

                                }, this),
                                planningUnitLabels: newPlanningUnitList.map((item, i) => {
                                    return (getLabelText(item.planningUnit.label, lang))
                                }, this),
                                forecastingUnitValues: newForecastingUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.label, lang), value: item.id })

                                }, this),
                                forecastingUnitLabels: newForecastingUnitList.map((item, i) => {
                                    return (getLabelText(item.label, lang))
                                }, this),
                                equivalencyUnitLabel: selectedText,
                                filteredProgramEQList: filteredProgramEQList,
                                loading: false
                            }, () => {
                                this.getEquivalencyUnitData();
                                this.fetchData();
                            })
                        } else {//NO

                            this.setState({
                                planningUnits: planningUnitList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                forecastingUnits: forecastingUnitList.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                allForecastingUnits: forecastingUnitList,
                                planningUnitValues: planningUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.planningUnit.label, lang), value: item.planningUnit.id })
                                }, this),
                                planningUnitLabels: planningUnitList.map((item, i) => {
                                    return (getLabelText(item.planningUnit.label, lang))
                                }, this),
                                forecastingUnitValues: forecastingUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.label, lang), value: item.id })
                                }, this),
                                forecastingUnitLabels: forecastingUnitList.map((item, i) => {
                                    return (getLabelText(item.label, lang))
                                }, this),
                                equivalencyUnitLabel: '',
                                loading: false
                            }, () => {
                                this.getEquivalencyUnitData();
                                this.fetchData();
                            })
                        }
                    }).catch(
                        error => {
                            this.setState({
                                planningUnits: [], loading: false
                            })
                            if (error.message === "Network Error") {
                                this.setState({
                                    // message: 'static.unkownError',
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
     * Updates the version ID in the state and triggers actions to update the UI based on the selected version.
     * @param {Object} event - The event object containing the updated version ID value.
     */
    setVersionId(event) {
        this.setState({
            versionId: event.target.value,
            show: false,
            dataList: [],
            planningUnits: [],
            forecastingUnits: [],
            allForecastingUnits: [],
            loading: false
        }, () => {
            localStorage.setItem("sesVersionIdReport", this.state.versionId);
            this.filterRegion();
            this.getPlanningUnitAndForcastingUnit();
        })
    }
    /**
     * Updates the selected region values in the state and triggers actions to update the UI.
     * @param {Array} event - The event object containing the updated region values.
     */
    setRegionVal(event) {
        var regionIds = event
        regionIds = regionIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        });

        this.setState({
            regionValues: regionIds.map(ele => ele),
            regionLabels: regionIds.map(ele => ele.label),
            consumptionUnitShowArr: regionIds.map(ele => ele.value),
            regionListFiltered: event,
            show: false,
            loading: false
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Updates the selected view mode in the state and triggers actions to update the UI.
     * @param {Object} e - The event object containing the selected view mode value.
     */
    setViewById(e) {
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
            consumptionData: [],
            monthArrayList: [],
            errorValues: [],
            regionListFiltered: [],
            show: false,
            loading: false
        }, () => {
            if (viewById == 2) {
                document.getElementById("forecastingUnitDiv").style.display = "block";
                document.getElementById("planningUnitDiv").style.display = "none";
                this.fetchData();
            } else {
                document.getElementById("planningUnitDiv").style.display = "block";
                document.getElementById("forecastingUnitDiv").style.display = "none";
                this.fetchData();
            }
        })
    }
    /**
     * Updates the selected forecasting unit in the state and triggers actions to update the UI.
     * @param {Object} e - The event object containing the selected forecasting unit value.
     */
    setForecastingUnit(e) {
        if (this.state.yaxisEquUnit > 0) {
            // var forecastingUnitId = e.target.value;
            var selectedText = e.map(item => item.label);
            var planningUnitList = [];
            e.map(item => {
                planningUnitList = planningUnitList.concat(this.state.planningUnits.filter(c => c.forecastingUnit.id == item.value))
            });
            var planningUnitSet = [...new Set(planningUnitList.map(ele => (ele.planningUnit.id)))]
            var forecastErrorThreshold = 0;
            var showForecastThresholdLegend = false;
            if (planningUnitSet.length == 1) {
                var listOfPus = this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitSet[0]);
                forecastErrorThreshold = listOfPus[0].forecastErrorThreshold;
                showForecastThresholdLegend = true
            }
            this.setState({
                forecastingUnitIds: e,
                forecastingUnitLabels: selectedText,
                dataList: [],
                consumptionAdjForStockOutId: false,
                forecastErrorThreshold: forecastErrorThreshold,
                showForecastThresholdLegend: showForecastThresholdLegend,
                loading: false
            }, () => {
                document.getElementById("consumptionAdjusted").checked = false;
                this.fetchData();
            })
        } else {
            if (e.target.value != -1) {
                var listOfPus = this.state.planningUnits.filter(c => c.forecastingUnit.id == e.target.value);
                var forecastErrorThreshold = 0;
                var showForecastThresholdLegend = false;
                if (listOfPus.length == 1) {
                    forecastErrorThreshold = listOfPus[0].forecastErrorThreshold;
                    showForecastThresholdLegend = true
                }
                this.setState({
                    forecastingUnitId: e.target.value,
                    forecastingUnitIds: [{ "label": document.getElementById("forecastingUnitId").selectedOptions[0].text, "value": e.target.value }],
                    forecastingUnitLabels: [document.getElementById("forecastingUnitId").selectedOptions[0].text],
                    dataList: [],
                    consumptionAdjForStockOutId: false,
                    loading: false,
                    forecastErrorThreshold: forecastErrorThreshold,
                    showForecastThresholdLegend: showForecastThresholdLegend
                }, () => {
                    document.getElementById("consumptionAdjusted").checked = false;
                    this.fetchData();
                })
            } else {
                this.setState({
                    forecastingUnitId: e.target.value,
                    forecastingUnitIds: [],
                    forecastingUnitLabels: [],
                    dataList: [],
                    consumptionAdjForStockOutId: false,
                    loading: false,
                    forecastErrorThreshold: 0,
                    showForecastThresholdLegend: false
                }, () => {
                    document.getElementById("consumptionAdjusted").checked = false;
                    this.fetchData();
                })
            }
        }
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value, dataList: [] }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the change event of the consumption stock out checkbox.
     * @param {Object} event - The event object containing the checkbox state.
     */
    consumptionStockOutCheckbox(event) {
        var falg = event.target.checked ? 1 : 0
        if (falg) {
            this.setState({
                consumptionAdjForStockOutId: true,
                loading: false
            }, () => {
                this.fetchData();
            })
        } else {
            this.setState({
                consumptionAdjForStockOutId: false,
                loading: false
            }, () => {
                this.fetchData();
            })
        }
    }
    /**
     * Fetches equivalency unit data based on the selected program and version.
     */
    getEquivalencyUnitData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            loading: true
        }, () => {
            if (programId > 0 && versionId != 0) {
                if (versionId.includes('Local')) {

                    const lan = 'en';
                    var db1;
                    var storeOS;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var planningunitTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('equivalencyUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        var planningList = []
                        planningunitRequest.onerror = function (event) {
                            // Handle errors!
                        };
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            // var programId = (document.getElementById("programId").value).split("_")[0];
                            var filteredEquList = []
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program != null) {
                                    if (myResult[i].program.id == programId && myResult[i].active == true) {
                                        filteredEquList.push(myResult[i]);
                                    }
                                } else {
                                    filteredEquList.push(myResult[i]);
                                }
                            }
                            let fuList = this.state.allForecastingUnits;


                            let newList = [];
                            for (var i = 0; i < filteredEquList.length; i++) {
                                let temp = fuList.filter(c => c.id == filteredEquList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newList.push(filteredEquList[i]);
                                }
                            }

                            filteredEquList = newList;

                            let duplicateEquiUnit = filteredEquList.map(c => c.equivalencyUnit);
                            const ids = duplicateEquiUnit.map(o => o.equivalencyUnitId)
                            const filteredEQUnit = duplicateEquiUnit.filter(({ equivalencyUnitId }, index) => !ids.includes(equivalencyUnitId, index + 1))


                            var lang = this.state.lang;
                            this.setState({
                                equivalencyUnitList: filteredEQUnit.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                programEquivalencyUnitList: filteredEquList,
                                loading: false
                            }, () => {
                                this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)

                } else {//api call

                    EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
                        if (response.status == 200) {
                            var listArray = response.data;

                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                var itemLabelB = getLabelText(b.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });

                            var filteredEquList = []
                            for (var i = 0; i < listArray.length; i++) {
                                if (listArray[i].program != null) {
                                    if (listArray[i].program.id == programId && listArray[i].active == true) {
                                        filteredEquList.push(listArray[i]);
                                    }
                                } else {
                                    filteredEquList.push(listArray[i]);
                                }
                            }

                            let fuList = this.state.allForecastingUnits;
                            let newList = [];
                            for (var i = 0; i < filteredEquList.length; i++) {
                                let temp = fuList.filter(c => c.id == filteredEquList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newList.push(filteredEquList[i]);
                                }
                            }

                            filteredEquList = newList;

                            let duplicateEquiUnit = filteredEquList.map(c => c.equivalencyUnit);
                            const ids = duplicateEquiUnit.map(o => o.equivalencyUnitId)
                            const filteredEQUnit = duplicateEquiUnit.filter(({ equivalencyUnitId }, index) => !ids.includes(equivalencyUnitId, index + 1))


                            var lang = this.state.lang;
                            this.setState({
                                equivalencyUnitList: filteredEQUnit.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                programEquivalencyUnitList: filteredEquList,
                            }, () => {
                                this.fetchData();
                            })
                        } else {
                            this.setState({
                                message: response.data.messageCode, loading: false
                            },
                                () => {
                                    hideSecondComponent();
                                })
                        }

                    })
                        .catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({
                                        // message: 'static.unkownError',
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                        loading: false,
                                        color: "#BA0C2F",
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
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
                                            break;
                                        default:
                                            this.setState({
                                                message: 'static.unkownError',
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
                                            break;
                                    }
                                }
                            }
                        );
                }
            }
            this.setState({
                loading: false
            })
        })
    }
    /**
     * Handles the change event for the Y-axis equivalency unit.
     * @param {object} e - The event object
     */
    yAxisChange(e) {
        var yaxisEquUnit = e.target.value;
        this.setState({
            yaxisEquUnit: yaxisEquUnit,
            planningUnits: [],
            planningUnitIds: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            foreastingUnits: [],
            forecastingUnitIds: [],
            foreastingUnitValues: [],
            foreastingUnitLabels: [],
            planningUnitId: "",
            forecastingUnitId: "",
            dataList: [],
            loading: false
        }, () => {
            if (yaxisEquUnit > 0) {//Yes
                this.getPlanningUnitAndForcastingUnit();
            } else {//NO
                this.getPlanningUnitAndForcastingUnit();
                this.fetchData();
            }
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
     * Fetches data based on selected filters.
     */
    fetchData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let planningUnitIds = this.state.planningUnitIds.map(item => item.value.toString());
        let forecastingUnitIds = this.state.forecastingUnitIds.map(item => item.value.toString());
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let viewById = this.state.viewById
        let consumptionAdjForStockOutId = this.state.consumptionAdjForStockOutId;
        let regionIds = this.state.regionValues.map(ele => (ele.value).toString());
        let regionList = this.state.regions;
        let monthInCalc = document.getElementById("timeWindow").value;
        let equivalencyUnitId = document.getElementById("yaxisEquUnit").value;
        if (programId > 0 && ((planningUnitIds.length > 0 && viewById == 1) || (forecastingUnitIds.length > 0 && viewById == 2)) && versionId != 0) {
            if (versionId.includes('Local')) {
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
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    planningunitRequest.onerror = function (event) {
                        // Handle errors!
                    }.bind(this);
                    planningunitRequest.onsuccess = function (e) {
                        var ppuList = [];
                        ppuList = planningunitRequest.result.filter(c => c.program.id == programId && c.active == true);
                        var convertedPlanningUnits = [];
                        if (viewById == 1) {
                            convertedPlanningUnits = planningUnitIds;
                        } else {
                            convertedPlanningUnits = [...new Set(ppuList.filter(c => forecastingUnitIds.includes(c.forecastingUnit.id.toString())).map(ele => (ele.planningUnit.id)))];
                        }
                        var consumptionList = [];
                        var transaction = db1.transaction(['programData'], 'readwrite');
                        var programTransaction = transaction.objectStore('programData');
                        var version = (versionId.split('(')[0]).trim()
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var program = `${programId}_v${version}_uId_${userId}`;
                        var programRequest = programTransaction.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (event) {
                            var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                            for (var cpu = 0; cpu < convertedPlanningUnits.length; cpu++) {
                                var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == convertedPlanningUnits[cpu]);
                                var programJson = {};
                                if (planningUnitDataFilter.length > 0) {
                                    var planningUnitData = planningUnitDataFilter[0]
                                    var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                    programJson = JSON.parse(programData);
                                } else {
                                    programJson = {
                                        consumptionList: []
                                    }
                                }
                                var consumptionListForPlanningUnit = (programJson.consumptionList).filter(c => c.planningUnit.id == convertedPlanningUnits[cpu] && c.active == true && moment(c.consumptionDate).format("YYYY-MM") >= moment(startDate).subtract(monthInCalc, 'months').format("YYYY-MM") && moment(c.consumptionDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"));
                                if (equivalencyUnitId > 0 || viewById == 2) {
                                    var ppuObject = ppuList.filter(c => c.planningUnit.id == convertedPlanningUnits[cpu]);
                                    var fuMultiplier = ppuObject[0].multiplier;
                                    for (var clpu = 0; clpu < consumptionListForPlanningUnit.length; clpu++) {
                                        if (equivalencyUnitId > 0) {
                                            var convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == ppuObject[0].forecastingUnit.id)[0].convertToEu;
                                            consumptionListForPlanningUnit[clpu].consumptionQty = Number(consumptionListForPlanningUnit[clpu].consumptionQty) * Number(fuMultiplier) / Number(convertToEu);
                                        } else if ((equivalencyUnitId == -1 || equivalencyUnitId == 0) && viewById == 2) {
                                            consumptionListForPlanningUnit[clpu].consumptionQty = Number(consumptionListForPlanningUnit[clpu].consumptionQty) * Number(fuMultiplier);
                                        }
                                    }
                                }
                                consumptionList = consumptionList.concat(consumptionListForPlanningUnit);
                            }

                            var monthArray = [];
                            var curDate = startDate;
                            var dataList = [];
                            for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
                                curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                                var noOfDays = moment(curDate, "YYYY-MM").daysInMonth();
                                monthArray.push({ date: curDate, noOfDays: noOfDays })
                                var regionData = [];
                                for (var rl = 0; rl < regionList.length; rl++) {
                                    var consumptionListFilteredForRegion = consumptionList.filter(c => c.region.id == regionList[rl].regionId);
                                    var actualConsumptionListForCurrentMonth = consumptionListFilteredForRegion.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "true");
                                    var forecastConsumptionListForCurrentMonth = consumptionListFilteredForRegion.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "false");
                                    var forecastConsumptionListForLastXMonths = consumptionListFilteredForRegion.filter(c => moment(c.consumptionDate).format("YYYY-MM") >= moment(curDate).subtract(monthInCalc, 'months').format("YYYY-MM") && moment(c.consumptionDate).format("YYYY-MM") <= moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "false");
                                    var actualConsumptionListForLastXMonths = consumptionListFilteredForRegion.filter(c => moment(c.consumptionDate).format("YYYY-MM") >= moment(curDate).subtract(monthInCalc, 'months').format("YYYY-MM") && moment(c.consumptionDate).format("YYYY-MM") <= moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "true");
                                    var actualQty = "";
                                    var daysOfStockOut = "";
                                    actualConsumptionListForCurrentMonth.map(item => {
                                        if (consumptionAdjForStockOutId) {
                                            if (noOfDays != item.dayOfStockOut) {
                                                actualQty = Number(actualQty) + (Number(Number(item.consumptionQty) / (Number(noOfDays) - Number(item.dayOfStockOut))) * Number(noOfDays))
                                            }
                                            daysOfStockOut = item.dayOfStockOut;
                                        } else {
                                            actualQty = Number(actualQty) + Number(item.consumptionQty)
                                        }
                                    })
                                    var forecastQty = "";
                                    forecastConsumptionListForCurrentMonth.map(item => {
                                        forecastQty = Number(forecastQty) + Number(item.consumptionQty)
                                    })
                                    var sumOfForecastQty = "";
                                    forecastConsumptionListForLastXMonths.map(item => {
                                        sumOfForecastQty = Number(sumOfForecastQty) + Number(item.consumptionQty)
                                    })
                                    var sumOfActualQty = "";
                                    actualConsumptionListForLastXMonths.map(item => {
                                        if (consumptionAdjForStockOutId) {
                                            if (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) != Number(item.dayOfStockOut)) {
                                                sumOfActualQty = Number(sumOfActualQty) + (Number(Number(item.consumptionQty) / (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) - Number(item.dayOfStockOut))) * Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()))
                                            }
                                        } else {
                                            sumOfActualQty = Number(sumOfActualQty) + Number(item.consumptionQty)
                                        }
                                    })
                                    var sumOfAbsDiff = "";
                                    if (sumOfActualQty !== "" && sumOfForecastQty !== "") {
                                        for (var mic = 0; mic <= monthInCalc; mic++) {
                                            var actualConsumptionListForMic = consumptionListFilteredForRegion.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).subtract(mic, 'months').format("YYYY-MM") && c.actualFlag.toString() == "true");
                                            var forecastConsumptionListForMic = consumptionListFilteredForRegion.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).subtract(mic, 'months').format("YYYY-MM") && c.actualFlag.toString() == "false");
                                            var actualQtyForMic = "";
                                            actualConsumptionListForMic.map(item => {
                                                if (consumptionAdjForStockOutId) {
                                                    if (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) != Number(item.dayOfStockOut)) {
                                                        actualQtyForMic = Number(actualQtyForMic) + (Number(Number(item.consumptionQty) / (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) - Number(item.dayOfStockOut))) * Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()))
                                                    }
                                                } else {
                                                    actualQtyForMic = Number(actualQtyForMic) + Number(item.consumptionQty)
                                                }
                                            })
                                            var forecastQtyForMic = "";
                                            forecastConsumptionListForMic.map(item => {
                                                forecastQtyForMic = Number(forecastQtyForMic) + Number(item.consumptionQty)
                                            })
                                            if (actualQtyForMic !== "" && forecastQtyForMic !== "") {
                                                sumOfAbsDiff = Number(sumOfAbsDiff) + Number(Math.abs(Number(forecastQtyForMic) - Number(actualQtyForMic)));
                                            }
                                        }
                                    }
                                    var errorPer = "";
                                    if (sumOfActualQty !== "" && sumOfActualQty !== 0 && sumOfAbsDiff !== "") {
                                        errorPer = Number(Number(sumOfAbsDiff) / Number(sumOfActualQty))
                                    }
                                    regionData.push({
                                        "region": {
                                            "id": regionList[rl].regionId,
                                            "label": regionList[rl].label
                                        },
                                        "actualQty": actualQty === "" ? null : actualQty,
                                        "forecastQty": forecastQty === "" ? null : forecastQty,
                                        "sumOfForecast": sumOfForecastQty === "" ? null : sumOfForecastQty,
                                        "sumOfActual": sumOfActualQty === "" ? null : sumOfActualQty,
                                        "errorPerc": errorPer === "" ? null : errorPer,
                                        "daysOfStockOut": viewById == 1 && planningUnitIds.length == 1 && daysOfStockOut !== "" ? daysOfStockOut : null
                                    })

                                }


                                var actualConsumptionListForCurrentMonthAllRegion = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "true");
                                var forecastConsumptionListForCurrentMonthAllRegion = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "false");
                                var forecastConsumptionListForLastXMonthsAllRegion = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") >= moment(curDate).subtract(monthInCalc, 'months').format("YYYY-MM") && moment(c.consumptionDate).format("YYYY-MM") <= moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "false");
                                var actualConsumptionListForLastXMonthsAllRegion = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") >= moment(curDate).subtract(monthInCalc, 'months').format("YYYY-MM") && moment(c.consumptionDate).format("YYYY-MM") <= moment(curDate).format("YYYY-MM") && c.actualFlag.toString() == "true");
                                var actualQtyAllRegion = "";
                                actualConsumptionListForCurrentMonthAllRegion.map(item => {
                                    if (consumptionAdjForStockOutId) {
                                        if (Number(noOfDays) != Number(item.dayOfStockOut)) {
                                            actualQtyAllRegion = Number(actualQtyAllRegion) + (Number(Number(item.consumptionQty) / (Number(noOfDays) - Number(item.dayOfStockOut))) * Number(noOfDays))
                                        }
                                    } else {
                                        actualQtyAllRegion = Number(actualQtyAllRegion) + Number(item.consumptionQty)
                                    }
                                })
                                var forecastQtyAllRegion = "";
                                forecastConsumptionListForCurrentMonthAllRegion.map(item => {
                                    forecastQtyAllRegion = Number(forecastQtyAllRegion) + Number(item.consumptionQty)
                                })
                                var sumOfForecastQtyAllRegion = "";
                                forecastConsumptionListForLastXMonthsAllRegion.map(item => {
                                    sumOfForecastQtyAllRegion = Number(sumOfForecastQtyAllRegion) + Number(item.consumptionQty)
                                })
                                var sumOfActualQtyAllRegion = "";
                                actualConsumptionListForLastXMonthsAllRegion.map(item => {
                                    if (consumptionAdjForStockOutId) {
                                        if (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) != Number(item.dayOfStockOut)) {
                                            sumOfActualQtyAllRegion = Number(sumOfActualQtyAllRegion) + (Number(Number(item.consumptionQty) / (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) - Number(item.dayOfStockOut))) * Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()))
                                        }
                                    } else {
                                        sumOfActualQtyAllRegion = Number(sumOfActualQtyAllRegion) + Number(item.consumptionQty)
                                    }
                                })
                                var sumOfAbsDiffAllRegion = "";
                                if (sumOfActualQtyAllRegion !== "" && sumOfForecastQtyAllRegion !== "") {
                                    for (var mic = 0; mic <= monthInCalc; mic++) {
                                        var actualConsumptionListForMicAllRegion = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).subtract(mic, 'months').format("YYYY-MM") && c.actualFlag.toString() == "true");
                                        var forecastConsumptionListForMicAllRegion = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).subtract(mic, 'months').format("YYYY-MM") && c.actualFlag.toString() == "false");
                                        var actualQtyForMicAllRegion = "";
                                        actualConsumptionListForMicAllRegion.map(item => {
                                            if (consumptionAdjForStockOutId) {
                                                if (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) != Number(item.dayOfStockOut)) {
                                                    actualQtyForMicAllRegion = Number(actualQtyForMicAllRegion) + (Number(Number(item.consumptionQty) / (Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()) - Number(item.dayOfStockOut))) * Number(moment(item.consumptionDate, "YYYY-MM").daysInMonth()))
                                                }
                                            } else {
                                                actualQtyForMicAllRegion = Number(actualQtyForMicAllRegion) + Number(item.consumptionQty)
                                            }
                                        })
                                        var forecastQtyForMicAllRegion = "";
                                        forecastConsumptionListForMicAllRegion.map(item => {
                                            forecastQtyForMicAllRegion = Number(forecastQtyForMicAllRegion) + Number(item.consumptionQty)
                                        })
                                        if (actualQtyForMicAllRegion !== "" && forecastQtyForMicAllRegion !== "") {
                                            sumOfAbsDiffAllRegion = Number(sumOfAbsDiffAllRegion) + Number(Math.abs(Number(forecastQtyForMicAllRegion) - Number(actualQtyForMicAllRegion)));
                                        }
                                    }
                                }
                                var errorPerAllRegion = "";
                                if (sumOfActualQtyAllRegion !== "" && sumOfActualQtyAllRegion !== 0 && sumOfAbsDiffAllRegion !== "") {
                                    errorPerAllRegion = Number(Number(sumOfAbsDiffAllRegion) / Number(sumOfActualQtyAllRegion))
                                }

                                dataList.push({
                                    "month": moment(curDate).format("YYYY-MM-DD"),
                                    "regionData": regionData,
                                    "actualQty": actualQtyAllRegion === "" ? null : actualQtyAllRegion,
                                    "forecastQty": forecastQtyAllRegion === "" ? null : forecastQtyAllRegion,
                                    "sumOfForecast": sumOfForecastQtyAllRegion === "" ? null : sumOfForecastQtyAllRegion,
                                    "sumOfActual": sumOfActualQtyAllRegion === "" ? null : sumOfActualQtyAllRegion,
                                    "errorPerc": errorPerAllRegion === "" ? null : errorPerAllRegion
                                })

                            }
                            this.setState({
                                dataList: dataList,
                                monthArray: monthArray,
                                consumptionAdjForStockOutId: consumptionAdjForStockOutId,
                                message: '',
                                loading: false,
                                yaxisEquUnit: equivalencyUnitId,
                                // equivalencyUnitLabel:equivalencyUnitLable
                            }, () => {
                                hideFirstComponent();
                            })

                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({
                    message: '',
                    loading: true
                })
                var inputjson = {
                    programId: programId,
                    versionId: versionId, // Can be -1 for the latest Program
                    unitIds: viewById == 1 ? planningUnitIds : forecastingUnitIds, // PU or FU based on viewBy
                    startDate: startDate,
                    stopDate: stopDate,
                    viewBy: viewById, // 1 for PU and 2 for FU
                    regionIds: regionIds, // empty if all Regions
                    equivalencyUnitId: equivalencyUnitId == -1 ? 0 : equivalencyUnitId, // If the output is to be in EquivalencyUnit then this is a non zero id
                    previousMonths: monthInCalc, // The number of months that we need to average the Consumption for WAPE. Does not include current month which is always included.
                    daysOfStockOut: consumptionAdjForStockOutId ? true : false // Boolean field that if true means we should consider the Days of Stock Out valued and adjust the consumption accordingly. Only adjusts for Actual Consumption.                            
                }
                ReportService.forecastErrorNew(inputjson)
                    .then(response => {
                        var monthArray = [];
                        var curDate = startDate;
                        for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
                            curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                            var noOfDays = moment(curDate, "YYYY-MM").daysInMonth();
                            monthArray.push({ date: curDate, noOfDays: noOfDays })
                        }
                        this.setState({
                            dataList: response.data,
                            monthArray: monthArray,
                            consumptionAdjForStockOutId: consumptionAdjForStockOutId,
                            message: '',
                            loading: false,
                            yaxisEquUnit: equivalencyUnitId,
                            // equivalencyUnitLabel:equivalencyUnitLable
                        }, () => {
                            hideFirstComponent();
                        })
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    // message: 'static.unkownError',
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
                        })
            }
        } else {
            this.setState({
                loading: false,
                dataList: [],
                show: false
            })
        }
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.programs.filter(c => c.programId == this.state.programId)[0].label.label_en).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ': ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        if (this.state.viewById == 1) {
            var PUList = this.state.planningUnitLabels.map(ele => ele)
            csvRow.push('"' + ('Planning Unit' + ': ' + (PUList)).replaceAll(' ', '%20') + '"')
        } else {
            var FUList = this.state.forecastingUnitLabels.map(ele => ele)
            csvRow.push('"' + ('Forecasting unit' + ': ' + (FUList)).replaceAll(' ', '%20') + '"')
        }
        var RegionList = this.state.regionLabels.map(ele => ele)
        csvRow.push('"' + ('Region' + ': ' + (RegionList)).replaceAll(' ', '%20') + '"')
        this.state.consumptionAdjForStockOutId ? csvRow.push('"' + ('Show consumption adjusted for stock out' + ': ' + "Yes").replaceAll(' ', '%20') + '"') :
            csvRow.push('"' + ('Show consumption adjusted for stock out' + ': ' + "No").replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.timeWindow') + ': ' + (document.getElementById("timeWindow").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        if (document.getElementById("yaxisEquUnit").value > 0) {
            csvRow.push('"' + (i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ': ' + (document.getElementById("yaxisEquUnit").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        }
        csvRow.push('');
        var columns = [];
        columns.push('');
        this.state.monthArray.map(item => (
            columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
        ))
        columns.push('Average'.replaceAll(' ', '%20'));
        let headers = [];
        columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
        var A = [addDoubleQuoteToRowContent(headers)];

        var totalError = 0;
        var countError = 0;
        var totalForcaste = 0;
        var countForcaste = 0;
        var totalActual = 0;
        var countActual = 0;
        var totalDifference = 0;
        var countDifference = 0;
        var datacsv = [];

        // Region Error        
        this.state.regionValues.map(r => {
            var datacsv = [];
            var totalErrorRegion = 0;
            var totalErrorRegionCount = 0;
            datacsv.push(((r.label) + " Error").replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                    let errorData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                    let errorDataRegionData = (errorData[0].regionData.filter(arr1 => arr1.region.id == r.value));
                    totalErrorRegion += (errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? 0 : (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? 0 : errorDataRegionData[0].errorPerc;
                    totalErrorRegionCount += (errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? 0 : (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? 0 : 1;
                    datacsv.push((errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? (errorDataRegionData[0].forecastQty === '' || errorDataRegionData[0].forecastQty == null) ? "No months in this period contain both forecast and actual consumption".replaceAll(' ', '%20') : "No Actual Data".replaceAll(' ', '%20') : errorDataRegionData[0].actualQty >= 0 ? ((isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? '' : PercentageFormatter(errorDataRegionData[0].errorPerc * 100)) : "No Actual Data".replaceAll(' ', '%20'))
                    // datacsv.push(errorDataRegionData[0].actualQty > 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc == null || errorDataRegionData[0].errorPerc === '') ? '' :  PercentageFormatter(errorDataRegionData[0].errorPerc*100):"No Actual data")
                })
            }
            datacsv.push(totalErrorRegionCount > 0 ? PercentageFormatter((totalErrorRegion / totalErrorRegionCount) * 100) : 0);
            A.push(addDoubleQuoteToRowContent(datacsv))
            // Region Actual        
            this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                var datacsv = [];
                var totalRegion = 0;
                var totalRegionCount = 0;
                this.state.consumptionAdjForStockOutId ? datacsv.push('>> Adjusted Actual '.replaceAll(' ', '%20')) : datacsv.push('>> Actual '.replaceAll(' ', '%20'));
                {
                    this.state.monthArray.map((item1, count) => {
                        let acData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let auDataRegionData = (acData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                        totalRegion += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty === '' || auDataRegionData[0].actualQty == null) ? 0 : Number(auDataRegionData[0].actualQty);
                        totalRegionCount += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty === '' || auDataRegionData[0].actualQty == null) ? 0 : 1;
                        datacsv.push((isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty == null || auDataRegionData[0].actualQty === '') ? '' : Number(roundARU(auDataRegionData[0].actualQty, 1)))
                    })
                }
                datacsv.push(totalRegionCount > 0 ? Number(totalRegion / totalRegionCount).toFixed(2) : 0);
                A.push(addDoubleQuoteToRowContent(datacsv))
            });

            // Region forecast     
            this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                var datacsv = [];
                var totalRegion = 0;
                var totalRegionCount = 0;
                datacsv.push('>> Forecast '.replaceAll(' ', '%20'))
                {
                    this.state.monthArray.map((item1, count) => {
                        let fuData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let fuDataRegionData = (fuData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                        totalRegion += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? 0 : Number(fuDataRegionData[0].forecastQty);
                        totalRegionCount += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? 0 : 1;
                        datacsv.push((isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty == null || fuDataRegionData[0].forecastQty === '') ? '' : Number(roundARU(fuDataRegionData[0].forecastQty, 1)))
                    })
                }
                datacsv.push(totalRegionCount > 0 ? Number(totalRegion / totalRegionCount).toFixed(2) : 0);
                A.push(addDoubleQuoteToRowContent(datacsv))
            });

            // Region daysOfStockOut     
            this.state.consumptionAdjForStockOutId && this.state.viewById == 1 && this.state.planningUnitIds.length == 1 &&
                this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                    var datacsv = [];
                    var totalRegion = 0;
                    var totalRegionCount = 0;
                    datacsv.push('>> Days Stocked Out '.replaceAll(' ', '%20'))
                    {
                        this.state.monthArray.map((item1, count) => {
                            let daysOfStockOutData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                            let daysOfStockOutDataRegionData = (daysOfStockOutData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                            totalRegion += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? 0 : Number(daysOfStockOutDataRegionData[0].daysOfStockOut);
                            totalRegionCount += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? 0 : 1;
                            datacsv.push((isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut == null || daysOfStockOutDataRegionData[0].daysOfStockOut === '') ? '' : Number(daysOfStockOutDataRegionData[0].daysOfStockOut).toFixed(2))
                        })
                    }
                    datacsv.push(totalRegionCount > 0 ? Number(totalRegion / totalRegionCount).toFixed(2) : 0);
                    A.push(addDoubleQuoteToRowContent(datacsv))
                });

            // Region Difference        
            this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                var datacsv = [];
                var totalRegion = 0;
                var totalRegionCount = 0;
                datacsv.push('>> Difference'.replaceAll(' ', '%20'))
                {
                    this.state.monthArray.map((item1, count) => {
                        let differenceData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let differenceRegionData = (differenceData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                        totalRegion += (differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? 0 : isNaN(Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty)) ? 0 : Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty);
                        totalRegionCount += (differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? 0 : 1;
                        datacsv.push((differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? '' : Number((differenceRegionData[0].actualQty) - ((isNaN(differenceRegionData[0].forecastQty) || differenceRegionData[0].forecastQty == null || differenceRegionData[0].forecastQty === '') ? 0 : differenceRegionData[0].forecastQty)).toFixed(2))
                    })
                }
                datacsv.push(totalRegionCount > 0 ? Number(roundARU((totalRegion / totalRegionCount), 1)) : 0);
                A.push(addDoubleQuoteToRowContent(datacsv))
            });
        });

        //Total Error
        datacsv = [];
        datacsv.push([(('Total Error').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalError += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : (isNaN(data[0].errorPerc) || data[0].errorPerc == null || data[0].errorPerc === '') ? 0 : parseFloat(data[0].errorPerc);
            countError += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : (isNaN(data[0].errorPerc) || data[0].errorPerc == null || data[0].errorPerc === '') ? 0 : 1;
            datacsv.push((data[0].actualQty === '' || data[0].actualQty == null) ? (data[0].forecastQty === '' || data[0].forecastQty == null) ? "No months in this period contain both forecast and actual consumption".replaceAll(' ', '%20') : "No Actual Data".replaceAll(' ', '%20') : data[0].actualQty >= 0 ? (isNaN(data[0].errorPerc) || data[0].errorPerc === '' || data[0].errorPerc == null) ? '' : PercentageFormatter((data[0].errorPerc) * 100) : "No Actual Data".replaceAll(' ', '%20'))
            // datacsv.push(data[0].actualQty > 0 ? (isNaN(data[0].errorPerc)|| data[0].errorPerc == null || data[0].errorPerc === '') ? '' : PercentageFormatter(data[0].errorPerc*100):"No Actual data")
        })
        datacsv.push(countError > 0 ? PercentageFormatter((totalError / countError) * 100) : 0);
        A.push(addDoubleQuoteToRowContent(datacsv))

        //Total Actual        
        datacsv = [];
        this.state.consumptionAdjForStockOutId ? datacsv.push('>> Adjusted Actual '.replaceAll(' ', '%20')) : datacsv.push('>> Actual '.replaceAll(' ', '%20'));
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalActual += (isNaN(data[0].actualQty) || data[0].actualQty == null || data[0].actualQty === '') ? 0 : data[0].actualQty;
            countActual += (isNaN(data[0].actualQty) || data[0].actualQty == null || data[0].actualQty === '') ? 0 : 1;
            datacsv.push((isNaN(data[0].actualQty) || data[0].actualQty == null || data[0].actualQty === '') ? '' : Number(roundARU(data[0].actualQty, 1)))
        })
        datacsv.push(countActual > 0 ? Number(totalActual / countActual).toFixed(2) : 0);
        A.push(addDoubleQuoteToRowContent(datacsv))

        //Total Forecast         
        datacsv = [];
        datacsv.push([(('>> Forecast').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalForcaste += (isNaN(data[0].forecastQty) || data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : data[0].forecastQty;
            countForcaste += (isNaN(data[0].forecastQty) || data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : 1;
            datacsv.push((isNaN(data[0].forecastQty) || data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : Number(roundARU(data[0].forecastQty, 1)))
        })
        datacsv.push(countForcaste > 0 ? Number(totalForcaste / countForcaste).toFixed(2) : 0);
        A.push(addDoubleQuoteToRowContent(datacsv))

        //Total Difference        
        datacsv = [];
        datacsv.push([(('>> Difference').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalDifference += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : ((isNaN(data[0].actualQty) || data[0].actualQty == null || data[0].actualQty === '' ? 0 : data[0].actualQty) - (isNaN(data[0].forecastQty) || data[0].forecastQty == null || data[0].forecastQty === '' ? 0 : data[0].forecastQty));
            countDifference += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : 1;
            datacsv.push((data[0].actualQty === '' || data[0].actualQty == null) ? '' : Number(roundARU((data[0].actualQty) - ((isNaN(data[0].forecastQty) || data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : data[0].forecastQty), 1)))
        })
        datacsv.push(countDifference > 0 ? Number(totalDifference / countDifference).toFixed(2) : 0);
        A.push(addDoubleQuoteToRowContent(datacsv))

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + 'Consumption Forecast Error' + ".csv"
        document.body.appendChild(a)
        a.click();

    }
    /**
     * Exports the data to a CSV file.
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
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
                    align: 'right'
                })
                doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
                    align: 'right'
                })
                doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
                    align: 'right'
                })
                doc.text(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text), doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                doc.text(this.state.programs.filter(c => c.programId == this.state.programId)[0].label.label_en, doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.forecasterrorovertime'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ': ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    var y = 110;
                    if (this.state.viewById == 1) {
                        var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        y = y + 10;
                        for (var i = 0; i < planningText.length; i++) {
                            if (y > doc.internal.pageSize.height - 100) {
                                doc.addPage();
                                y = 80;
                            }
                            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
                            y = y + 10;
                        }

                    } else {
                        var planningText = doc.splitTextToSize((i18n.t('static.planningunit.forecastingUnit') + ' : ' + this.state.forecastingUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        y = y + 10;
                        for (var i = 0; i < planningText.length; i++) {
                            if (y > doc.internal.pageSize.height - 100) {
                                doc.addPage();
                                y = 80;
                            }
                            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
                            y = y + 10;
                        }
                    }
                    var regionText = doc.splitTextToSize(('Region' + ': ' + this.state.regionLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    y = y;
                    for (var i = 0; i < regionText.length; i++) {
                        if (y > doc.internal.pageSize.height - 100) {
                            doc.addPage();
                            y = 80;
                        }
                        doc.text(doc.internal.pageSize.width / 8, y, regionText[i]);
                        y = y + 10;
                    }
                    doc.text('Show consumption adjusted for stock out' + ': ' + (this.state.consumptionAdjForStockOutId ? "Yes" : "No"), doc.internal.pageSize.width / 8, y, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.timeWindow') + ': ' + document.getElementById("timeWindow").selectedOptions[0].text, doc.internal.pageSize.width / 8, (y + 10), {
                        align: 'left'
                    })
                    if (document.getElementById("yaxisEquUnit").value > 0) {
                        doc.text(i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ': ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text, doc.internal.pageSize.width / 8, (y + 20), {
                            align: 'left'
                        })
                    }
                }
            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(8);
        var canvas = document.getElementById("cool-canvas");

        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 100;
        var aspectwidth1 = (width - h1);
        // doc.addImage(canvasImg, 'png', 50, 280, 750, 260, 'CANVAS');
        doc.addImage(canvasImg, 'png', 10, 280, 750, 290, 'CANVAS');
        doc.addPage();

        //table start
        const headers = [];

        headers.push('');
        this.state.monthArray.map(item => (
            headers.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
        ))
        headers.push('Average')

        var header = [headers]
        var A = [];
        let data = [];
        // let t1 = [];

        //Region Error
        {
            this.state.regionValues.map(r => {
                A = [];
                var totalRegion = 0;
                var totalRegionCount = 0;
                A.push("" + (r.label) + " Error")
                {
                    this.state.monthArray.map((item1, count) => {
                        let errorData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let errorDataRegionData = (errorData[0].regionData.filter(arr1 => arr1.region.id == r.value));
                        totalRegion += (errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? 0 : (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? 0 : errorDataRegionData[0].errorPerc;
                        totalRegionCount += (errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? 0 : (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? 0 : 1;
                        A.push((errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? (errorDataRegionData[0].forecastQty === '' || errorDataRegionData[0].forecastQty == null) ? "No Data" : "No Actual Data" : errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? "" : PercentageFormatter(errorDataRegionData[0].errorPerc * 100) : "No Actual Data")
                    })
                }
                A.push(totalRegionCount > 0 ? PercentageFormatter((totalRegion / totalRegionCount) * 100) : 0)
                data.push(A);
                // Region Actual
                A = [];
                {
                    this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                        var totalRegion = 0;
                        var totalRegionCount = 0;
                        (this.state.consumptionAdjForStockOutId) ? A.push(' Adjusted Actual') : A.push(' Actual')
                        {
                            this.state.monthArray.map((item1, count) => {
                                let acData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                let auDataRegionData = (acData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                totalRegion += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty === '' || auDataRegionData[0].actualQty == null) ? 0 : Number(auDataRegionData[0].actualQty);
                                totalRegionCount += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty === '' || auDataRegionData[0].actualQty == null) ? 0 : 1;
                                A.push((isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty == null || auDataRegionData[0].actualQty === '') ? '' : Number(roundARU(auDataRegionData[0].actualQty, 1)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
                            })
                        }
                        A.push(totalRegionCount > 0 ? ((totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0)
                    })
                    data.push(A);
                }

                // Region Forecast         
                A = [];
                {
                    {
                        this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                            var totalRegion = 0;
                            var totalRegionCount = 0;
                            A.push(' Forecast')
                            {
                                this.state.monthArray.map((item1, count) => {
                                    let fuData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                    let fuDataRegionData = (fuData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                    totalRegion += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? 0 : Number(fuDataRegionData[0].forecastQty);
                                    totalRegionCount += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? 0 : 1;
                                    A.push((isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? '' : Number(roundARU(fuDataRegionData[0].forecastQty, 1)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                                })
                            }
                            A.push(totalRegionCount > 0 ? ((totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0)
                        })
                    }
                    data.push(A);
                }

                // Region daysOfStockOut         
                if (this.state.consumptionAdjForStockOutId && this.state.viewById == 1 && this.state.planningUnitIds.length == 1) {
                    A = [];
                    {
                        this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                            var totalRegion = 0;
                            var totalRegionCount = 0;
                            A.push(' Days Stocked Out')
                            {
                                this.state.monthArray.map((item1, count) => {
                                    let daysOfStockOutData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                    let daysOfStockOutDataRegionData = (daysOfStockOutData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                    totalRegion += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? 0 : Number(daysOfStockOutDataRegionData[0].daysOfStockOut);
                                    totalRegionCount += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? 0 : 1;
                                    A.push((isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? '' : Number(daysOfStockOutDataRegionData[0].daysOfStockOut).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                                })
                            }
                            A.push(totalRegionCount > 0 ? ((totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0)
                        })
                    }
                    data.push(A);
                }

                // Region Difference        
                A = [];
                {
                    this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                        var totalRegion = 0;
                        var totalRegionCount = 0;
                        A.push(' Difference')
                        {
                            this.state.monthArray.map((item1, count) => {
                                let differenceData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                let differenceRegionData = (differenceData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                totalRegion += (differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? 0 : isNaN(Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty)) ? 0 : Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty);
                                totalRegionCount += (differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? 0 : 1;
                                A.push(differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null ? '' : Number((differenceRegionData[0].actualQty) - ((isNaN(differenceRegionData[0].forecastQty) || differenceRegionData[0].forecastQty == null || differenceRegionData[0].forecastQty === '') ? 0 : differenceRegionData[0].forecastQty)).toFixed(2))
                            })
                        }
                        A.push(totalRegionCount > 0 ? (Number(roundARU((totalRegion / totalRegionCount), 1))).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0)
                    })
                    data.push(A);
                }

            })
        }

        // Total Error        
        A = [];
        A.push('Total Error')
        {
            var totalError = 0;
            var countError = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalError += (datavalue[0].actualQty === '' || datavalue[0].actualQty == null) ? 0 : (isNaN(datavalue[0].errorPerc) || datavalue[0].errorPerc == null || datavalue[0].errorPerc === '') ? 0 : datavalue[0].errorPerc;
                countError += (datavalue[0].actualQty === '' || datavalue[0].actualQty == null) ? 0 : (isNaN(datavalue[0].errorPerc) || datavalue[0].errorPerc == null || datavalue[0].errorPerc === '') ? 0 : 1;
                A.push((datavalue[0].actualQty === '' || datavalue[0].actualQty == null) ? (datavalue[0].forecastQty === '' || datavalue[0].forecastQty == null) ? "No Data" : "No Actual Data" : datavalue[0].actualQty >= 0 ? (isNaN(datavalue[0].errorPerc) || datavalue[0].errorPerc == null || datavalue[0].errorPerc === '') ? '' : PercentageFormatter(datavalue[0].errorPerc * 100) : "No Actual Data")
            })
            A.push(countError > 0 ? PercentageFormatter((totalError / countError) * 100) : 0)
        }
        data.push(A);

        // Total Actual
        A = [];
        (this.state.consumptionAdjForStockOutId) ? A.push(' Adjusted Actual') : A.push(' Actual')
        {
            var totalActal = 0;
            var countActal = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalActal += (isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? 0 : datavalue[0].actualQty;
                countActal += (isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? 0 : 1;
                A.push((isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? '' : Number(roundARU(datavalue[0].actualQty, 1)).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push(countActal > 0 ? (totalActal / countActal).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0)
        }
        data.push(A);

        // Total Forecast    
        A = [];
        A.push(' Forecast')
        {
            var totalForecast = 0;
            var countForecast = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalForecast += (isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 : datavalue[0].forecastQty;
                countForecast += (isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 : 1;
                A.push((isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? '' : Number(roundARU(datavalue[0].forecastQty, 1)).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push(countForecast > 0 ? ((totalForecast / countForecast).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0)
        }
        data.push(A);

        // Total Difference
        A = [];
        A.push(' Difference')
        {
            var totalDiff = 0;
            var countDiff = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalDiff += (datavalue[0].actualQty === '' || datavalue[0].actualQty == null) ? 0 : ((isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? 0 : datavalue[0].actualQty) - ((isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 : datavalue[0].forecastQty);
                countDiff += (datavalue[0].actualQty === '' || datavalue[0].actualQty == null) ? 0 : 1;
                A.push((datavalue[0].actualQty === '' || datavalue[0].actualQty == null) ? '' : ((datavalue[0].actualQty) -
                    ((isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 : datavalue[0].forecastQty)).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push(countDiff > 0 ? (roundARU((totalDiff / countDiff), 1)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0)
        }
        data.push(A);
        let flag = false;
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 120,
            head: header,
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            // rowPageBreak: 'auto',
            // tableWidth: 'auto',
            horizontalPageBreak: true,
            horizontalPageBreakRepeat: 0,
            columnStyles: [
                { halign: "left" },
                { halign: "left" },
            ],
            didParseCell: function (data) {
                if (data.section == "body" && data.column.index == 0) {
                    if (data.cell.raw[0] != " ") {
                        data.cell.styles.fontStyle = 'bold';
                        flag = false;
                    } else {
                        flag = true;
                        data.cell.styles.fontStyle = 'normal';
                    }
                }
                else {
                    if (flag == true) {
                        data.cell.styles.fontStyle = 'normal';
                    } else {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
                if (data.cell.raw.toString().replaceAll(",", "") < 0) {
                    data.cell.styles.textColor = [255, 0, 0];
                }
            }.bind(this)
        };

        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + 'Consumption Forecast Error' + ".pdf")
    }
    /**
     * Renders the Consumption Forecast Error report table.
     * @returns {JSX.Element} - Consumption Forecast Error report table.
     */
    render() {

        const { rangeValue } = this.state
        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        let totalError = 0;
        let totalActual = 0;
        let totalForcaste = 0;
        let countError = 0;
        let countActual = 0;
        let countForcaste = 0;
        let totalDifference = 0;
        let totalDifferenceCount = 0;

        const { forecastingUnits } = this.state;
        let forcastingUnitList = forecastingUnits.length > 0
            && forecastingUnits.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.planningUnit.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {/* {getLabelText(item.label, this.state.lang)} */}
                        {item.programCode}
                    </option>
                )
            }, this);

        const { equivalencyUnitList } = this.state;
        let equivalencyUnitList1 = equivalencyUnitList.length > 0
            && equivalencyUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.equivalencyUnitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}  ({(moment(item.createdDate).format(`MMM DD YYYY`))}) {item.cutOffDate != undefined && item.cutOffDate != null && item.cutOffDate != '' ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(item.cutOffDate).format('MMM YYYY') + ")" : ""}
                    </option>
                )
            }, this);

        const { regions } = this.state;
        let regionList = regions.length > 0
            && regions.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.regionId })

            }, this);

        const darkModeColors = [
            '#d4bbff', // Color 1 
        ];

        const lightModeColors = [
            '#002F6C',  // Color 1
        ];


        const { isDarkMode } = this.state;
        const colors = isDarkMode ? darkModeColors : lightModeColors;
        const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
        const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

        var chartOptions = {
            title: {
                display: true,
                text: (this.state.viewById == 1 ?
                    this.state.planningUnits.filter(c => c.planningUnit.id == this.state.planningUnitId).length > 0 ?
                        this.state.planningUnits.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit.label.label_en : '' :
                    this.state.forecastingUnits.filter(c => c.id == this.state.forecastingUnitId).length > 0 ?
                        this.state.forecastingUnits.filter(c => c.id == this.state.forecastingUnitId)[0].label.label_en : ''),
                fontColor: fontColor
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: (this.state.yaxisEquUnit > 0 ? this.state.equivalencyUnitLabel : (this.state.viewById == 1 ? i18n.t('static.product.product') : i18n.t('static.forecastingunit.forecastingunit'))),
                            fontColor: fontColor
                        },
                        stacked: true,//stacked
                        ticks: {
                            beginAtZero: true,
                            fontColor: fontColor,
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
                        gridLines: {
                            drawBorder: true, lineWidth: 0,
                            color: gridLineColor,
                            zeroLineColor: gridLineColor
                        },
                        position: 'left',
                    },
                    {
                        id: 'B',
                        scaleLabel: {
                            display: true,
                            labelString: "Forecast Error",
                            fontColor: fontColor,
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: fontColor,
                            callback: function (value) {
                                var cell1 = value
                                cell1 += ' %';
                                return cell1;
                            },
                            // max: 100
                        },
                        gridLines: {
                            drawBorder: true, lineWidth: 0,
                            color: gridLineColor,
                            zeroLineColor: gridLineColor
                        },
                        position: 'right',

                    }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: fontColor
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    }
                }]
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {

                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        if (data.datasets[tooltipItem.datasetIndex].label == 'Error' || data.datasets[tooltipItem.datasetIndex].label == i18n.t('static.forecastErrorReport.forecastErrorThreshold')) {
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2 + '%';
                        }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    }
                }
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: fontColor
                }
            }
        }

        let bar = {}
        var datasetListForGraph = [];
        var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]

        var elInstance = this.state.dataList;
        if (elInstance != undefined) {
            var colourCount = 0;

            var consumptionActualValue = [];
            var consumptionForecastValue = [];
            for (var i = 0; i < elInstance.length; i++) {
                var value = elInstance[i];
                if (value) {
                    consumptionActualValue.push(Number(value.actualQty).toFixed(2))
                    consumptionForecastValue.push(Number(value.forecastQty).toFixed(2))
                } else {
                    consumptionActualValue.push("");
                    consumptionForecastValue.push("");
                }
            }
            datasetListForGraph.push({
                label: 'Error',
                data: this.state.dataList.map(item => (item.errorPerc !== "" && item.errorPerc != null ? (Number(item.errorPerc * 100).toFixed(2)) : null)),
                type: 'line',
                yAxisID: 'B',
                // backgroundColor: (this.state.yaxisEquUnit > 0 ? '#002F6C' : 'transparent'),
                backgroundColor: 'transparent',
                borderColor: '#118b70',
                borderStyle: 'dotted',
                borderWidth: 5,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                lineTension: 0,
                pointStyle: 'line',
                pointRadius: 0,
                showInLegend: true,
                pointRadius: 4,
            })
            if (this.state.showForecastThresholdLegend) {
                datasetListForGraph.push({
                    label: i18n.t('static.forecastErrorReport.forecastErrorThreshold'),
                    data: this.state.dataList.map(item => this.state.forecastErrorThreshold),
                    type: 'line',
                    yAxisID: 'B',
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: '#59cacc',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    fill: true,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: true,
                })
            }

            datasetListForGraph.push({
                label: "Forecast",
                data: consumptionForecastValue,
                stack: 3,
                yAxisID: 'A',
                backgroundColor: colors[0],
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
            })

            datasetListForGraph.push({
                label: "Actual",
                data: consumptionActualValue,
                stack: 2,
                yAxisID: 'A',
                backgroundColor: '#BA0C2F',
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
            })

        }

        if (this.state.dataList.length > 0) {
            bar = {
                labels: this.state.monthArray.map((item, index) => (moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))),
                datasets: datasetListForGraph
            };
        }

        let puList = planningUnits.length > 0 && planningUnits.map((item, i) => {
            return ({ label: getLabelText(item.planningUnit.label, this.state.lang) + " | " + item.planningUnit.id, value: item.planningUnit.id })
        }, this);

        let fuList = forecastingUnits.length > 0 && forecastingUnits.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang) + " | " + item.id, value: item.id })
        }, this);

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success" id="div2">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red" id="div1">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon pb-2">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleForecastMatrix() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                        </div>
                        {this.state.dataList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => {
                                        var curTheme = localStorage.getItem("theme");
                                        if (curTheme == "dark") {
                                            this.setState({
                                                isDarkMode: false
                                            }, () => {
                                                setTimeout(() => {
                                                    this.exportPDF();
                                                    if (curTheme == "dark") {
                                                        this.setState({
                                                            isDarkMode: true
                                                        })
                                                    }
                                                }, 0)
                                            })
                                        } else {
                                            this.exportPDF();
                                        }
                                    }}
                                    />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }  </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <div className="" >
                            <div ref={ref}>
                                <Form>
                                    <div className=" pl-0">
                                        <div className="row">

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            // onChange={(e) => { this.filterVersion(); this.updateMonthsforAMCCalculations() }}
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
                                                            // onChange={(e) => { this.getPlanningUnit(); }}
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="timeWindow"
                                                            id="timeWindow"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="2">3 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="5" selected={this.state.defaultTimeWindow} >6 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="8">9 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="11">12 {i18n.t('static.dashboard.months')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.region')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls ">
                                                    {/* <InputGroup className="box"> */}
                                                    <MultiSelect
                                                        name="regionId"
                                                        id="regionId"
                                                        options={regionList && regionList.length > 0 ? regionList : []}
                                                        value={this.state.regionValues}
                                                        onChange={(e) => { this.setRegionVal(e) }}
                                                        // onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
                                                        overrideStrings={{
                                                            allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                            selectSomeItems: i18n.t('static.common.select')
                                                        }}
                                                        filterOptions={filterOptions}
                                                    />
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.period.selectPeriod')}</Label>
                                                <div className="controls  edit">
                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={rangeValue}
                                                        lang={pickerLang}
                                                        //theme="light"
                                                        key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>
                                                </div>

                                            </FormGroup>
                                            <FormGroup className="col-md-3" id="equivelencyUnitDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.forecastReport.yAxisInEquivalencyUnit')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="yaxisEquUnit"
                                                            id="yaxisEquUnit"
                                                            bsSize="sm"
                                                            value={this.state.yaxisEquUnit}
                                                            onChange={(e) => { this.yAxisChange(e); }}
                                                        // onChange={(e) => { this.setYaxisEquUnitId(e); }}
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="-1">{i18n.t('static.program.no')}</option>
                                                            {equivalencyUnitList1}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <FormGroup check inline>
                                                    <Input
                                                        type="radio"
                                                        id="viewById"
                                                        name="viewById"
                                                        value={"1"}
                                                        checked={this.state.viewById == 1}
                                                        title={i18n.t('static.report.planningUnit')}
                                                        onChange={this.setViewById}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        // check htmlFor="inline-radio1"
                                                        title={i18n.t('static.report.planningUnit')}>
                                                        {i18n.t('static.report.planningUnit')}
                                                    </Label>
                                                </FormGroup>
                                                <FormGroup check inline>
                                                    <Input
                                                        type="radio"
                                                        id="viewById"
                                                        name="viewById"
                                                        value={"2"}
                                                        checked={this.state.viewById == 2}
                                                        title={i18n.t('static.dashboard.forecastingunit')}
                                                        onChange={this.setViewById}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        // check htmlFor="inline-radio1"
                                                        title={i18n.t('static.dashboard.forecastingunit')}>
                                                        {i18n.t('static.dashboard.forecastingunit')}
                                                    </Label>
                                                </FormGroup>
                                                <FormGroup id="forecastingUnitDiv" style={{ display: "none" }}>
                                                    <div className="controls">
                                                        {this.state.yaxisEquUnit == -1 && <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="forecastingUnitId"
                                                                id="forecastingUnitId"
                                                                value={this.state.forecastingUnitId}
                                                                onChange={(e) => { this.setForecastingUnit(e); }}
                                                                bsSize="sm"
                                                                className="selectWrapText"
                                                            >
                                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                                {forecastingUnits.length > 0
                                                                    && forecastingUnits.map((item, i) => {
                                                                        return (
                                                                            <option key={i} value={item.id}>
                                                                                {item.label.label_en + ' | ' + item.id}
                                                                            </option>
                                                                        )
                                                                    }, this)}
                                                            </Input>
                                                        </InputGroup>}
                                                        {this.state.yaxisEquUnit != -1 && <MultiSelect
                                                            bsSize="sm"
                                                            name="forecastingUnitId"
                                                            id="forecastingUnitId"
                                                            value={this.state.forecastingUnitIds}
                                                            onChange={(e) => { this.setForecastingUnit(e); }}
                                                            options={fuList && fuList.length > 0 ? fuList : []}
                                                            filterOptions={filterOptions}
                                                        />}
                                                    </div>
                                                </FormGroup>
                                                <FormGroup id="planningUnitDiv">
                                                    <div className="controls">
                                                        {this.state.yaxisEquUnit == -1 && <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="planningUnitId"
                                                                id="planningUnitId"
                                                                bsSize="sm"
                                                                //  onChange={this.fetchData}
                                                                value={this.state.planningUnitId}
                                                                onChange={(e) => { this.setPlanningUnit(e); }}
                                                                className="selectWrapText"
                                                            >
                                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                                {planningUnits.length > 0
                                                                    && planningUnits.map((item, i) => {
                                                                        return (
                                                                            <option key={i} value={item.planningUnit.id}>
                                                                                {item.planningUnit.label.label_en + ' | ' + item.planningUnit.id}
                                                                            </option>
                                                                        )
                                                                    }, this)}
                                                            </Input>
                                                        </InputGroup>}
                                                        {this.state.yaxisEquUnit != -1 && <MultiSelect
                                                            bsSize="sm"
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            value={this.state.planningUnitIds}
                                                            onChange={(e) => { this.setPlanningUnit(e); }}
                                                            options={puList && puList.length > 0 ? puList : []}
                                                            filterOptions={filterOptions}
                                                        />}
                                                    </div>
                                                </FormGroup>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <div className="tab-ml-1 ml-lg-3" style={{ marginTop: '30px' }}>
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="checkbox"
                                                        id="consumptionAdjusted"
                                                        name="consumptionAdjusted"
                                                        // checked={true}
                                                        // checked={this.state.yaxisEquUnit}
                                                        onClick={(e) => { this.consumptionStockOutCheckbox(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        {i18n.t('static.forecastMonthlyErrorReport.showConsumption')}
                                                    </Label>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                                {/* <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}> */}
                                <Col md="12 pl-0">
                                    {/* <div className="row" style={{ display: this.state.show ? "block" : "none" }}> */}
                                    {this.state.dataList.length > 0 &&
                                        <div className="col-md-12">
                                            <div className="chart-wrapper chart-graph-report">
                                                <Bar id="cool-canvas" data={bar} options={chartOptions} /> <div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="col-md-12">
                                        {this.state.show && this.state.dataList.length > 0 &&
                                            <div className="table-scroll">
                                                <ul className="legendcommitversion">
                                                    <li className='DarkThColr' style={{ marginLeft: '40px' }}><i class="fa fa-exclamation-triangle red"></i>{i18n.t('static.forecastErrorReport.missingDataNote')}</li>
                                                    {this.state.showForecastThresholdLegend && <li className='DarkThColr'><span className="redlegend legendcolor"></span> <span className="legendcommitversionText"><i>{i18n.t('static.forecastErrorReport.planningUnitAboveThreshold')}</i></span></li>}
                                                    {!this.state.showForecastThresholdLegend && <li className='DarkThColr'><span className="legendcolor"></span> <span className="legendcommitversionText"><i>{i18n.t('static.forecastErrorReport.planningUnitAboveThresholdNote')}</i></span></li>}
                                                </ul>
                                                <div className="table-wrap DataEntryTable table-responsive">
                                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                                        <thead>
                                                            <tr>
                                                                <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                <th className="forecastErrorFistColumnWidth sticky-col first-col clone"></th>
                                                                {this.state.monthArray.map((item, count) => {
                                                                    return (<th>{moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
                                                                })}
                                                                <th className="sticky-col first-col clone">Average</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {this.state.regionValues.map(r => {
                                                                {/* Error */ }
                                                                var regionErrorTotal = 0;
                                                                var regionErrorTotalCount = 0;
                                                                return (<><tr>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(r.value)}>
                                                                        {this.state.consumptionUnitShowArr.includes(r.value) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                    </td>
                                                                    <td className="sticky-col first-col clone" align="left"><b>{"   " + r.label + " Error"}</b></td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                        let errorData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                        let errorDataRegionData = (errorData[0].regionData.filter(arr1 => arr1.region.id == r.value));
                                                                        regionErrorTotal += (errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? 0 : (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? 0 : errorDataRegionData[0].errorPerc;
                                                                        regionErrorTotalCount += (errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? 0 : (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? 0 : 1;
                                                                        return (<td title={(errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? (errorDataRegionData[0].forecastQty === '' || errorDataRegionData[0].forecastQty == null) ? i18n.t("static.forecastErrorReport.noData") : i18n.t("static.forecastErrorReport.noActualData") : errorDataRegionData[0].actualQty >= 0 ? ((isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? '' : "") : i18n.t("static.forecastErrorReport.noActualData")}><b>{(errorDataRegionData[0].actualQty === '' || errorDataRegionData[0].actualQty == null) ? (errorDataRegionData[0].forecastQty === '' || errorDataRegionData[0].forecastQty == null) ? <i class="fa fa-exclamation-triangle red"></i> : <i class="fa fa-exclamation-triangle red"></i> : errorDataRegionData[0].actualQty >= 0 ? ((isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc === '' || errorDataRegionData[0].errorPerc == null) ? '' : <span className={this.state.showForecastThresholdLegend && (errorDataRegionData[0].errorPerc * 100) > this.state.forecastErrorThreshold ? 'red' : ""}>{PercentageFormatter(errorDataRegionData[0].errorPerc * 100)}</span>) : <i class="fa fa-exclamation-triangle red"></i>}</b></td>)
                                                                    })}
                                                                    <td className="sticky-col first-col clone" align="left"><b>{regionErrorTotalCount > 0 ? <span className={this.state.showForecastThresholdLegend && ((regionErrorTotal / regionErrorTotalCount) * 100) > this.state.forecastErrorThreshold ? 'red' : ""}>{PercentageFormatter((regionErrorTotal / regionErrorTotalCount) * 100)}</span> : 0}</b></td>
                                                                </tr>
                                                                    {/* actual */}
                                                                    {this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                                                                        var regionActualTotal = 0;
                                                                        var regionActualTotalCount = 0;
                                                                        return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{this.state.consumptionAdjForStockOutId ? "  Adjusted Actual" : "   Actual"}</td>
                                                                            {this.state.monthArray.map((item1, count) => {
                                                                                let acData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                                let auDataRegionData = (acData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                                                                regionActualTotal += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty === '' || auDataRegionData[0].actualQty == null) ? 0 : Number(auDataRegionData[0].actualQty);
                                                                                regionActualTotalCount += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty === '' || auDataRegionData[0].actualQty == null) ? 0 : 1;
                                                                                return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty === '' || auDataRegionData[0].actualQty == null) ? '' : (Number(roundARU(auDataRegionData[0].actualQty, 1))).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                            })}
                                                                            <td className="sticky-col first-col clone text-left">{regionActualTotalCount > 0 ? (Number(regionActualTotal / regionActualTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</td>
                                                                        </tr>)
                                                                    })}
                                                                    {/* Forecast */}
                                                                    {this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                                                                        var regionForecastTotal = 0;
                                                                        var regionForecastTotalCount = 0;
                                                                        return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   Forecast"}</td>
                                                                            {this.state.monthArray.map((item1, count) => {
                                                                                let fuData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                                let fuDataRegionData = (fuData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                                                                regionForecastTotal += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? 0 : Number(fuDataRegionData[0].forecastQty);
                                                                                regionForecastTotalCount += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? 0 : 1;
                                                                                return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty === '' || fuDataRegionData[0].forecastQty == null) ? '' : (Number(roundARU(fuDataRegionData[0].forecastQty, 1))).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                            })}
                                                                            <td className="sticky-col first-col clone text-left">{regionForecastTotalCount > 0 ? (Number(regionForecastTotal / regionForecastTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</td>
                                                                        </tr>
                                                                        )
                                                                    })}
                                                                    {/* DaysOfStockOut */}
                                                                    {this.state.consumptionAdjForStockOutId && this.state.viewById == 1 && this.state.planningUnitIds.length == 1 && this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                                                                        var regionDaysOfStockOutTotal = 0;
                                                                        var regionDaysOfStockOutTotalCount = 0;
                                                                        return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   Days Stocked Out"}</td>
                                                                            {this.state.monthArray.map((item1, count) => {
                                                                                let daysOfStockOutData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                                let daysOfStockOutDataRegionData = (daysOfStockOutData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                                                                regionDaysOfStockOutTotal += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? 0 : Number(daysOfStockOutDataRegionData[0].daysOfStockOut);
                                                                                regionDaysOfStockOutTotalCount += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? 0 : 1;
                                                                                return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut) || daysOfStockOutDataRegionData[0].daysOfStockOut === '' || daysOfStockOutDataRegionData[0].daysOfStockOut == null) ? '' : (Number(daysOfStockOutDataRegionData[0].daysOfStockOut)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                            })}

                                                                            <td className="sticky-col first-col clone text-left">{regionDaysOfStockOutTotalCount > 0 ? (Number(regionDaysOfStockOutTotal / regionDaysOfStockOutTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</td>
                                                                        </tr>)
                                                                    })}
                                                                    {/* Difference */}
                                                                    {this.state.regions.filter(arr => arr.regionId == r.value).map(r1 => {
                                                                        var regionDifferenceTotal = 0;
                                                                        var regionDifferenceTotalCount = 0;
                                                                        return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   Difference"}</td>
                                                                            {this.state.monthArray.map((item1, count) => {
                                                                                let differenceData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                                let differenceRegionData = (differenceData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                                                                regionDifferenceTotal += (differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? 0 : isNaN(Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty)) ? 0 : Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty);
                                                                                regionDifferenceTotalCount += (differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? 0 : 1;
                                                                                return (<td style={{ color: (differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? 'text-blackD' : (((differenceRegionData[0].actualQty) - (isNaN(differenceRegionData[0].forecastQty) ? 0 : differenceRegionData[0].forecastQty)) < 0 ? 'text-blackD' : 'text-blackD') }}>
                                                                                    <NumberFormat displayType={'text'} thousandSeparator={true} />{(differenceRegionData[0].actualQty === '' || differenceRegionData[0].actualQty == null) ? '' : (Number(roundARU((differenceRegionData[0].actualQty) - (isNaN(differenceRegionData[0].forecastQty) ? 0 : differenceRegionData[0].forecastQty)), 1)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                            })}
                                                                            <td className="sticky-col first-col clone text-left" style={{ color: (regionDifferenceTotal / regionDifferenceTotalCount) < 0 ? 'text-blackD' : 'text-blackD' }}>{regionDifferenceTotalCount > 0 ? (Number(regionDifferenceTotal / regionDifferenceTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</td>
                                                                        </tr>)
                                                                    })}
                                                                </>)
                                                            })}
                                                            {/* Error */}
                                                            <tr>
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                <td className="sticky-col first-col clone" align="left"><b>Total Error</b></td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    totalError += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : (isNaN(data[0].errorPerc) || data[0].errorPerc === '' || data[0].errorPerc == null) ? 0 : data[0].errorPerc;
                                                                    countError += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : (isNaN(data[0].errorPerc) || data[0].errorPerc === '' || data[0].errorPerc == null) ? 0 : 1;
                                                                    return (<td title={(data[0].actualQty === '' || data[0].actualQty == null) ? (data[0].forecastQty === '' || data[0].forecastQty == null) ? i18n.t("static.forecastErrorReport.noData") : i18n.t("static.forecastErrorReport.noActualData") : data[0].actualQty >= 0 ? (isNaN(data[0].errorPerc) || data[0].errorPerc === '' || data[0].errorPerc == null) ? '' : "" : i18n.t("static.forecastErrorReport.noActualData")}><b>{(data[0].actualQty === '' || data[0].actualQty == null) ? (data[0].forecastQty === '' || data[0].forecastQty == null) ? <i class="fa fa-exclamation-triangle red"></i> : <i class="fa fa-exclamation-triangle red"></i> : data[0].actualQty >= 0 ? (isNaN(data[0].errorPerc) || data[0].errorPerc === '' || data[0].errorPerc == null) ? '' : <span className={this.state.showForecastThresholdLegend && (data[0].errorPerc * 100) > this.state.forecastErrorThreshold ? 'red' : ""}>{PercentageFormatter(data[0].errorPerc * 100)}</span> : <i class="fa fa-exclamation-triangle red"></i>}</b></td>)
                                                                })}
                                                                <td className="sticky-col first-col clone" align="left"><b>{countError > 0 ? <span className={this.state.showForecastThresholdLegend && ((totalError / countError) * 100) > this.state.forecastErrorThreshold ? 'red' : ""}>{PercentageFormatter((totalError / countError) * 100)}</span> : 0}</b></td>
                                                            </tr>
                                                            {/* Actual */}
                                                            <tr>
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{this.state.consumptionAdjForStockOutId ? "Adjusted Actual" : "Actual"}</td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    totalActual += (isNaN(data[0].actualQty) || data[0].actualQty === '' || data[0].actualQty == null) ? 0 : Number(data[0].actualQty);
                                                                    countActual += (isNaN(data[0].actualQty) || data[0].actualQty === '' || data[0].actualQty == null) ? 0 : 1;
                                                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} /> {(isNaN(data[0].actualQty) || data[0].actualQty === '' || data[0].actualQty == null) ? '' : (Number(roundARU(data[0].actualQty, 1))).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                })}
                                                                <td className="sticky-col first-col clone" align="left">{countActual > 0 ? (Number(totalActual / countActual).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</td>
                                                            </tr>
                                                            {/* Forecast */}
                                                            <tr>
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>Forecast</td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    totalForcaste += (isNaN(data[0].forecastQty) || data[0].forecastQty === '' || data[0].forecastQty == null) ? 0 : Number(data[0].forecastQty);
                                                                    countForcaste += (isNaN(data[0].forecastQty) || data[0].forecastQty === '' || data[0].forecastQty == null) ? 0 : 1;
                                                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} /> {(isNaN(data[0].forecastQty) || data[0].forecastQty === '' || data[0].forecastQty == null) ? '' : (Number(roundARU(data[0].forecastQty, 1))).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                })}
                                                                <td className="sticky-col first-col clone" align="left">{countForcaste > 0 ? (Number(totalForcaste / countForcaste).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</td>
                                                            </tr>
                                                            {/* Difference */}
                                                            <tr>
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>Difference</td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    totalDifference += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : isNaN(Number(data[0].actualQty - data[0].forecastQty)) ? 0 : Number(data[0].actualQty - data[0].forecastQty);
                                                                    totalDifferenceCount += (data[0].actualQty === '' || data[0].actualQty == null) ? 0 : 1;
                                                                    return (<td style={{ color: (data[0].actualQty === '' || data[0].actualQty == null) ? 'text-blackD' : (((data[0].actualQty) - (isNaN(data[0].forecastQty) ? 0 : data[0].forecastQty)) < 0 ? 'text-blackD' : 'text-blackD') }}><NumberFormat displayType={'text'} thousandSeparator={true} />{(data[0].actualQty === '' || data[0].actualQty == null) ? '' : (Number((data[0].actualQty) - (isNaN(data[0].forecastQty) ? 0 : data[0].forecastQty)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                })}
                                                                <td className="sticky-col first-col clone text-left" style={{ color: (totalDifference / totalDifferenceCount) < 0 ? 'text-blackD' : 'text-blackD' }}>{totalDifferenceCount > 0 ? (Number(roundARU(totalDifference / totalDifferenceCount), 1)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </Col>
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
                        </div>
                    </CardBody>

                    <CardFooter>
                        <FormGroup>
                            {this.state.dataList != "" && <button className="mr-1 float-right btn btn-info btn-md" onClick={this.toggledata}>{this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}</button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
            </div >
        );
    }
}

export default ConsumptionForecastErrorSupplyPlan;