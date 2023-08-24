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
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP, TITLE_FONT, API_URL } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
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
import { index } from 'mathjs';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

class ConsumptionForecastErrorSupplyPlan extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);

        this.state = {
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
            forecastingUnitId: "",
            equivalencyUnitId: "",
            consumptionData: [],
            equivalencyUnitList: [],
            programEquivalencyUnitList: [],
            dataList: [],
            consumptionAdjForStockOutId: false,
            show: false,
            loading: true,
            defaultTimeWindow: true,
            yaxisEquUnit:0,
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            forecastingUnits: [],
            forecastingUnitValues: [],
            forecastingUnitLabels: [],
            // isEquUnitChecked:false,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 }
        };
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setRegionVal = this.setRegionVal.bind(this);
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setViewById = this.setViewById.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.getEquivalencyUnitData = this.getEquivalencyUnitData.bind(this);
        this.yAxisChange = this.yAxisChange.bind(this);
    }

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
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));


    setProgramId(event) {

        this.setState({
            programId: event.target.value,
            versionId: '',
            versions: [],
            planningUnits: [],
            forecastingUnits: [],
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
            consumptionAdjForStockOutId:false
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            document.getElementById("consumptionAdjusted").checked=false;
            this.filterVersion();
            this.filterRegion();
        })
    }

    componentDidMount() {
        this.getPrograms();
        // this.hideSecondComponent();

    }

    getPrograms = () => {
        this.setState({ loading: true })
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    console.log("ProgramList", JSON.stringify(response.data))
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
            console.log('offline')
            this.consolidatedProgramList()
            this.setState({ loading: false })
        }

    }

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

    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        this.setState({ loading: true })
        if (programId != 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        forecastingUnits: [],
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
                show: false,
                loading: false
            })
        }
    }

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
                        verList.push(version)
                    }
                }
                console.log(verList);
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

    filterRegion = () => {
        this.setState({ loading: true })
        let programId = this.state.programId;
        if (programId != 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            console.log("program[0].regionList----",program[0].regionList)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        regions: [],
                        planningUnits: [],
                        forecastingUnits: [],
                        show: false,
                        loading: false
                    }, () => {
                        this.setState({
                            regions: program[0].regionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedRegionList(programId) });
                    });
                } else {
                    this.setState({
                        regions: [],
                        planningUnits: [],
                        forecastingUnits: [],
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

    consolidatedRegionList = (programId) => {
        console.log("consolidatedRegionList")
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
                        if (myResult[i].userId == userId && myResult[i].programId == programId) {
                            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                            var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                            var programData = databytes.toString(CryptoJS.enc.Utf8)
                            var region = JSON.parse(programData).regionList;
                            regionList=region
                            console.log("regionList region--->",region)
                            console.log("regionList regionList.concat(region)--->",regionList.concat(region))
                            
                        }
                    }
                // }
                console.log("regionList--->",regionList)
                var regionIds = regionList.map((item, i) => {
                    return ({ label: getLabelText(item.label, this.state.lang), value: item.regionId })
                }, this)
           this.setState({
                    regions: regionList,
                    regionValues: regionIds.map(ele => ele),
                    regionLabels: regionIds.map(ele => ele.label),
                    loading: false
                }, () => {
                    this.getEquivalencyUnitData();
                })
            }.bind(this);
        }.bind(this)
    }

    setPlanningUnit(e) {
        console.log("In setPlanningUnit")
        var planningUnitId = document.getElementById("planningUnitId");
        var selectedText = planningUnitId.options[planningUnitId.selectedIndex].text;
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: selectedText,
            show: false,
            dataList: [],
            consumptionAdjForStockOutId:false
        }, () => {
            document.getElementById("consumptionAdjusted").checked=false;
            this.fetchData();
        })
    }

    setYaxisEquUnitId(e) {
        var yaxisEquUnit = e.target.value;
        console.log("e.target.value+++", e.target.value)
        this.setState({
            yaxisEquUnit: yaxisEquUnit
        }, () => {
                this.fetchData();
          })
    }

    getPlanningUnitAndForcastingUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        var lang = this.state.lang;
        this.setState({
            planningUnits: [],
            forecastingUnits: [],
            show: false,
            loading: true
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [], loading: false }, () => {
                    this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
                })
            } else {
                localStorage.setItem("sesVersionIdReport", versionId);
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
                            console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    proList[i] = myResult[i]
                                }
                            }

                            var forcastingUnitList = proList.map(c => c.forecastingUnit);
                            console.log("Seema proList in local---",proList)
                            console.log("Seema forcastingUnitList in local---",forcastingUnitList)
                            const ids = forcastingUnitList.map(o => o.id);
                            const forecastingUnitList1 = forcastingUnitList.filter(({ id }, index) => !ids.includes(id, index + 1));
                            // var planningUnitList = proList.map(c => c.planningUnit);
                            console.log("Seema forecastingUnitList1 in local---",forecastingUnitList1)
                            let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;
                            console.log("Seema yaxisEquUnitId in local---",yaxisEquUnitId)
        
                            if (yaxisEquUnitId != -1) {//Yes
                                console.log("Seema proList in local in IF",this.state.programEquivalencyUnitList)
                                let filteredProgramEQList = this.state.programEquivalencyUnitList.filter(c => c.equivalencyUnit.equivalencyUnitId == yaxisEquUnitId);
                                let newPlanningUnitList = [];
                                let newForecastingUnitList = [];
                                for (var i = 0; i < forecastingUnitList1.length; i++) {
                                    let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitList1[i].id);
                                    console.log("Seema proList in local in IF temp",temp)
                               
                                    if (temp.length > 0) {
                                        newForecastingUnitList.push(forecastingUnitList1[i]);
                                    }
                                }
                                console.log("Seema proList in local in IF newForecastingUnitList",newForecastingUnitList)
                                for (var i = 0; i < proList.length; i++) {
                                    if(proList[i]){
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
                                    filteredProgramEQList: filteredProgramEQList
                                }, () => {
                                    this.getEquivalencyUnitData();
                                    this.fetchData();
                                })
    
                            } else {//NO
                                console.log("Seema proList in local in ELSE")
                                console.log("Seema proList in local in ELSE",proList)
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
                               console.log("proList&&",proList)
                                this.setState({
                                    planningUnits: proList,
                                    forecastingUnits: forecastingUnitList1,
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
                                    equivalencyUnitLabel: ''
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
                        console.log('Aug 15 **JSON.stringify(response.data)' + JSON.stringify(response.data))
                        var listArray = response.data;
                        var forcastingUnitList = listArray.map(c => c.forecastingUnit);
                        const ids = forcastingUnitList.map(o => o.id);
                        const forecastingUnitList1 = forcastingUnitList.filter(({ id }, index) => !ids.includes(id, index + 1));
                        forecastingUnitList1.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        console.log("Aug 15 CheckPU------------------>2", forcastingUnitList);
                        console.log("Aug 15 listArray------------------>2", listArray);

                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        let forecastingUnitList = forecastingUnitList1;
                        let planningUnitList = listArray;
                        console.log("Aug 15 forecastingUnitList------------------>2", forecastingUnitList);
                        console.log("Aug 15 planningUnitList------------------>2", planningUnitList);

                        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;
                        console.log("Aug 15 yaxisEquUnitId------------------>2", yaxisEquUnitId);

                        if (yaxisEquUnitId != -1) {//Yes
                            console.log("Aug 15 INSIDE IF ------------------>2", this.state.programEquivalencyUnitList);

                            let filteredProgramEQList = this.state.programEquivalencyUnitList.filter(c => c.equivalencyUnit.equivalencyUnitId == yaxisEquUnitId);
                            console.log("Aug 15 INSIDE IF filteredProgramEQList------------------>2", filteredProgramEQList);

                            let newPlanningUnitList = [];
                            let newForecastingUnitList = [];
                            for (var i = 0; i < forecastingUnitList.length; i++) {
                                let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitList[i].id);
                                if (temp.length > 0) {
                                    newForecastingUnitList.push(forecastingUnitList[i]);
                                }
                            }
                            console.log("Aug 15 INSIDE IF newForecastingUnitList------------------>2", newForecastingUnitList);

                            for (var i = 0; i < planningUnitList.length; i++) {
                                let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUnitList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newPlanningUnitList.push(planningUnitList[i]);
                                }
                            }

                            console.log("Aug 15 INSIDE IF newPlanningUnitList------------------>2", newPlanningUnitList);
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
                                filteredProgramEQList: filteredProgramEQList
                            }, () => {
                                this.getEquivalencyUnitData();
                                this.fetchData();
                            })
                        } else {//NO
                            console.log("IN ESLE");
    
                            this.setState({
                                planningUnits:planningUnitList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                forecastingUnits: forecastingUnitList.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
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
                                equivalencyUnitLabel: ''
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

    setVersionId(event) {
        this.setState({
            versionId: event.target.value,
            show: false,
            dataList: [],
            planningUnits: [],
            forecastingUnits: [],
        }, () => {
            localStorage.setItem("sesVersionIdReport", this.state.versionId);
            this.getPlanningUnitAndForcastingUnit();
          })
    }

    setRegionVal(event) {
        console.log('***', event)
        var regionIds = event
        regionIds = regionIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        });
        console.log('***regionIds.map(ele => ele)', regionIds.map(ele => ele))
        
        this.setState({
            regionValues: regionIds.map(ele => ele),
            regionLabels: regionIds.map(ele => ele.label),
            regionListFiltered: event,
            show: false
        }, () => {
            this.fetchData();
        })
    }

    setViewById(e) {
        console.log("e.targetvakue+++", e.target.value)
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
            planningUnitId: "",
            forecastingUnitId: '',
            consumptionData: [],
            monthArrayList: [],
            errorValues: [],
            regionListFiltered: [],
            show: false
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

    setForecastingUnit(e) {
        // var forecastingUnitId = e.target.value;
        var forecastingUnitId = document.getElementById("forecastingUnitId");
        var selectedText = forecastingUnitId.options[forecastingUnitId.selectedIndex].text;
        this.setState({
            forecastingUnitId: e.target.value,
            forecastingUnitLabel: selectedText,
            dataList: [],
            consumptionAdjForStockOutId:false
        }, () => {
            document.getElementById("consumptionAdjusted").checked=false;
            this.fetchData();
        })
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleRangeChange(value, text, listIndex) {
        //this.fetchData();
    }

    handleRangeDissmis(value) {
        this.setState({ rangeValue: value, dataList: [] }, () => {
            this.fetchData();
        })
    }

    consumptionStockOutCheckbox(event) {
        var falg = event.target.checked ? 1 : 0
        console.log("consumptionStockOutCheckbox--",falg)
       if (falg) {
        this.setState({
            consumptionAdjForStockOutId:true
        }, () => {
            this.fetchData();
        })
       }else{
        this.setState({
            consumptionAdjForStockOutId:false
        }, () => {
            this.fetchData();
        })
       }
    }


    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    getEquivalencyUnitData() {
        console.log("Aug 15 Seema Inside getEquivalencyUnitData")
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            // planningUnits: [],
            // planningUnitValues: [],
            // planningUnitLabels: [],

            // forecastingUnits: [],
            // forecastingUnitValues: [],
            // forecastingUnitLabels: [],
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
                            console.log("EquivalencyUnitList---------->", myResult);
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program != null) {
                                    if (myResult[i].program.id == programId && myResult[i].active == true) {
                                        filteredEquList.push(myResult[i]);
                                    }
                                } else {
                                    filteredEquList.push(myResult[i]);
                                }
                            }
                            console.log("EquivalencyUnitList---------->1", filteredEquList);
                            let fuList = this.state.forecastingUnits;

                            console.log("EquivalencyUnitList---------->1 this.state.forecastingUnits", this.state.forecastingUnits);
                            console.log("EquivalencyUnitList---------->1 fuList", fuList);
                            
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

                            console.log("EquivalencyUnitList---------->2", filteredEQUnit);

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
                        }.bind(this);
                    }.bind(this)

                } else {//api call

                    EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
                        if (response.status == 200) {
                            console.log("EQ1------->", response.data);
                            var listArray = response.data;
                            console.log("Aug 15 listArray------->", listArray);
                            
                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                var itemLabelB = getLabelText(b.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });

                            console.log("Aug 15 listArray AFTER------->", listArray);
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
                            console.log("Aug 15 EquivalencyUnitList---------->1", filteredEquList);

                            let fuList = this.state.forecastingUnits;
                            let newList = [];
                            for (var i = 0; i < filteredEquList.length; i++) {
                                let temp = fuList.filter(c => c.id == filteredEquList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newList.push(filteredEquList[i]);
                                }
                            }

                            filteredEquList = newList;
                            console.log("Aug 15 filteredEquList---------->2", filteredEquList);

                            let duplicateEquiUnit = filteredEquList.map(c => c.equivalencyUnit);
                            const ids = duplicateEquiUnit.map(o => o.equivalencyUnitId)
                            const filteredEQUnit = duplicateEquiUnit.filter(({ equivalencyUnitId }, index) => !ids.includes(equivalencyUnitId, index + 1))

                            console.log("Aug 15 EquivalencyUnitList---------->2", filteredEQUnit);

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
                                    this.hideSecondComponent();
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
        })
    }

    yAxisChange(e) {
        var yaxisEquUnit = e.target.value;
        // console.log("e.target.value+++", e.target.value)
        this.setState({
            yaxisEquUnit: yaxisEquUnit,
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            foreastingUnits: [],
            foreastingUnitValues: [],
            foreastingUnitLabels: [],
            dataList: [],
           }, () => {
            if (yaxisEquUnit > 0) {//Yes
                console.log("Aug 15 INSIDE IF yAxisChange--",yaxisEquUnit)
                this.getPlanningUnitAndForcastingUnit();
            } else {//NO
                this.getPlanningUnitAndForcastingUnit();
                this.fetchData();
            }
        })
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

fetchData(){
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
    let viewById = this.state.viewById
    let consumptionAdjForStockOutId = this.state.consumptionAdjForStockOutId;
    let regionIds = this.state.regionValues.map(ele => (ele.value).toString())
    let regionList = this.state.regions;
    let monthInCalc = document.getElementById("timeWindow").value; 
    var dataList = [];
    let equivalencyUnitId = -1;
    let planningUnitId = -1;
    let forecastingUnitId = -1;
    var FilterEquivalencyUnit="";
    equivalencyUnitId = document.getElementById("yaxisEquUnit").value;
    if(equivalencyUnitId>0){
        FilterEquivalencyUnit = this.state.equivalencyUnitList.filter(c => c.equivalencyUnitId == equivalencyUnitId);
    }
    planningUnitId = document.getElementById("planningUnitId").value
    forecastingUnitId = document.getElementById("forecastingUnitId").value;
    if (programId > 0 && (planningUnitId > 0 || forecastingUnitId > 0) && versionId != 0) {
        if (versionId.includes('Local')) {
            this.setState({ loading: true })
            var db1;
            getDatabase();
            // View by planningUnit
            if (planningUnitId > 0){
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
                    var program = `${programId}_v${version}_uId_${userId}`;
                    var programRequest = programTransaction.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (event) {
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                        var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitId);
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
                        var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                        var monthstartfrom = this.state.rangeValue.from.month
                        var monthArray = [];
                        var monthstartfrom = this.state.rangeValue.from.month;
                        var curDate = startDate;
                        for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
                            curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                            var noOfDays = moment(curDate, "YYYY-MM").daysInMonth();
                            monthArray.push({ date: curDate, noOfDays: noOfDays })
                        }
                        var isStartYear = 0;
                        for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                            if (isStartYear == 0) {
                                isStartYear = -1
                            } else {
                                isStartYear = 2
                            }
                            monthstartfrom = (isStartYear == -1 ? monthstartfrom : 1);
                            for (var month = monthstartfrom; month <= 12; month++) {
                                var curDate;
                                var year = from;
                                curDate = year + "-" + String(month).padStart(2, '0') + "-01";
                                var regionData = [];
                                var regionTotalForecastQty = '';
                                var regionTotalActualQty = '';
                                var regionTotalAdjustedActualQty = '';
                                var totalDiffForLast6months='';
                                var totalOfActualForLast6months = '';
                                for (let k = 0; k < regionList.length; k++) {    
                                    year = from;
                                    var currentForecastQty = '';
                                    var currentActualQty = '';
                                    var currentAdjustedActualConsumption = '';
                                    var currentDayOfStockOut = '';    
                                    var consumptionForecastQty = '';
                                    var consumptionActualQty = '';    
                                    var errorPerc=0;
                                    var totalOfActualForRegionOfLastMonths = '';
                                    var totalDiffForRegionOfLastmonths = '';
                                    for (var i = month, j = 0; j <= monthInCalc; i--, j++) {
                                        var forecastQty = '';
                                        var actualQty = '';
                                        var adjustedActualConsumption= '';
                                        var daysOfStockOut='';
                                        if (i == 0) {
                                            i = 12;
                                            year = year - 1
                                        }
                                        var dt = year + "-" + String(i).padStart(2, '0') + "-01";
                                        var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                                        console.log("fetchData conlist",conlist)
                                        if (equivalencyUnitId != -1) {
                                            for (var cl = 0; cl < conlist.length; cl++) {
                                                let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == conlist[cl].planningUnit.forecastingUnit.id)[0].convertToEu;
                                                var selectPlanningObj =  this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId);
                                                conlist[cl].consumptionQty = (Number(conlist[cl].consumptionQty) * Number(selectPlanningObj[0].multiplier)) * Number(convertToEu);
                                            }
                                        }
                                        var noOfDays = moment(dt, "YYYY-MM").daysInMonth();
                                        // For TIME WINDOW
                                        consumptionForecastQty = conlist.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(dt).format("YYYY-MM") && c.actualFlag == false && c.active == true && c.region.id == regionList[k].regionId);
                                        consumptionActualQty = conlist.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(dt).format("YYYY-MM") && c.actualFlag == true && c.active == true && c.region.id == regionList[k].regionId);
                                        if(j==0){
                                            if (consumptionForecastQty.length >= 0) {
                                                for (var con = 0; con < consumptionForecastQty.length; con++) {
                                                    currentForecastQty = Number(currentForecastQty) + Number(consumptionForecastQty[con].consumptionQty);
                                                }
                                            }
                                            if (consumptionActualQty.length >= 0) {
                                                for (var con = 0; con < consumptionActualQty.length; con++) {
                                                    currentActualQty = Number(currentActualQty) + Number(consumptionActualQty[con].consumptionQty);
                                                    currentAdjustedActualConsumption = Number(currentAdjustedActualConsumption) + consumptionAdjForStockOutId ? Number(consumptionActualQty[con].consumptionQty) / (noOfDays - Number(consumptionActualQty[con].dayOfStockOut)) * noOfDays:null;
                                                    currentDayOfStockOut = Number(currentDayOfStockOut) + Number(consumptionActualQty[con].dayOfStockOut);
                                                }
                                            }
                                        }
                                        if (consumptionForecastQty.length >= 0) {
                                            for (var con = 0; con < consumptionForecastQty.length; con++) {
                                                forecastQty = (forecastQty==='' && consumptionForecastQty[con].consumptionQty ==='')?'': Number(forecastQty) + Number(consumptionForecastQty[con].consumptionQty);
                                            }
                                        }
                                        if (consumptionActualQty.length >= 0) {
                                            for (var con = 0; con < consumptionActualQty.length; con++) {
                                                actualQty = (actualQty==='' && consumptionActualQty[con].consumptionQty==='')?'': (Number(actualQty) + Number(consumptionActualQty[con].consumptionQty));
                                                adjustedActualConsumption = (adjustedActualConsumption==='' && consumptionActualQty[con].consumptionQty==='') ?'': (Number(adjustedActualConsumption) + (consumptionAdjForStockOutId ? Number(consumptionActualQty[con].consumptionQty) / (noOfDays - Number(consumptionActualQty[con].dayOfStockOut)) * noOfDays:null));
                                                daysOfStockOut = (daysOfStockOut===''&&consumptionActualQty[con].dayOfStockOut==='')?'': (Number(daysOfStockOut) + Number(consumptionActualQty[con].dayOfStockOut));
                                            }
                                        }
                                        totalOfActualForRegionOfLastMonths = (totalOfActualForRegionOfLastMonths===''?'':Number(totalOfActualForRegionOfLastMonths)) + (actualQty===''?'':(consumptionAdjForStockOutId ? Number(adjustedActualConsumption) :Number(actualQty)));
                                        totalDiffForRegionOfLastmonths = (totalDiffForRegionOfLastmonths===''?'':Number(totalDiffForRegionOfLastmonths)) + (actualQty===''?'':(consumptionAdjForStockOutId ? Math.abs(Number(adjustedActualConsumption) - Number(forecastQty)):Math.abs(Number(actualQty) - Number(forecastQty))));
                                        console.log("*** totalOfActualForRegionOfLastMonths",totalOfActualForRegionOfLastMonths);
                                        console.log("*** totalDiffForRegionOfLastmonths", totalDiffForRegionOfLastmonths);
                                    }
                                    console.log("*** totalOfActualForRegionOfLastMonths Total",totalOfActualForRegionOfLastMonths);
                                    console.log("*** totalDiffForRegionOfLastmonths Total", totalDiffForRegionOfLastmonths);                                                                   
                                    var errorPerc = totalOfActualForRegionOfLastMonths===''?null:(totalOfActualForRegionOfLastMonths > 0 ? (totalDiffForRegionOfLastmonths/ totalOfActualForRegionOfLastMonths):0);
                                    regionTotalForecastQty =(regionTotalForecastQty==='' && currentForecastQty==='')?'': (Number(regionTotalForecastQty) + Number(currentForecastQty));
                                    regionTotalActualQty =(regionTotalActualQty==='' && currentActualQty==='')?'': (Number(regionTotalActualQty) + Number(currentActualQty));
                                    regionTotalAdjustedActualQty =(regionTotalAdjustedActualQty==='' && currentAdjustedActualConsumption==='')?'': (Number(regionTotalAdjustedActualQty) + Number(currentAdjustedActualConsumption));
                                    totalOfActualForLast6months=(totalOfActualForLast6months==='' && totalOfActualForRegionOfLastMonths==='')?'': (Number(totalOfActualForLast6months) + Number(totalOfActualForRegionOfLastMonths));
                                    totalDiffForLast6months=(totalDiffForLast6months==='' && totalDiffForRegionOfLastmonths==='')?'':(Number(totalDiffForLast6months) + Number(totalDiffForRegionOfLastmonths));
                                   
                                    var region = { id: regionList[k].regionId, lable: regionList[k].label };
                                    regionData.push({
                                        region: region,
                                        actualQty: consumptionAdjForStockOutId ? currentAdjustedActualConsumption:currentActualQty,
                                        forecastQty: currentForecastQty,
                                        daysOfStockOut: currentDayOfStockOut,
                                        errorPerc:errorPerc
                                    });
                                    console.log("*** regionData---->",regionData)
                                }
                                var totalErrorPerc = totalOfActualForLast6months===''?null:totalOfActualForLast6months > 0 ? (totalDiffForLast6months/ totalOfActualForLast6months):0;
                                dataList.push({
                                month: moment(curDate).format("YYYY-MM-DD"),
                                regionData: regionData,
                                actualQty: consumptionAdjForStockOutId ? regionTotalAdjustedActualQty:regionTotalActualQty,
                                forecastQty:regionTotalForecastQty,
                                errorPerc: totalErrorPerc
                            });
                            }
                        }
                        console.log("*** dataList-->",dataList)
                        this.setState({
                            monthArray: monthArray,
                            dataList: dataList,
                            consumptionAdjForStockOutId: consumptionAdjForStockOutId,
                            yaxisEquUnit:equivalencyUnitId,
                            loading: false
                        })
                    }.bind(this);   
                }.bind(this);                                         
            } // View by forecastingUnit
            else if(forecastingUnitId > 0){
                let planningUnitIdList;
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
                        var myResult = [];
                        myResult = planningunitRequest.result;
                        var proList = []
                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId && myResult[i].active == true) {
                                proList[i] = myResult[i];
                            }
                        }
                        console.log("proList---",proList);    
                        var proListDataFilter = proList.filter(c => c.forecastingUnit.id == forecastingUnitId);
                        planningUnitIdList = proListDataFilter.map(c => c.planningUnit.id);
                        console.log("planningUnitIdList---",planningUnitIdList)
                        var openRequest1 = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest1.onerror = function (event) {
                            this.setState({
                                loading: false
                            })
                        }.bind(this);
                        openRequest1.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['programData'], 'readwrite');
                            var programTransaction = transaction.objectStore('programData');
                            var version = (versionId.split('(')[0]).trim()
                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                            var program = `${programId}_v${version}_uId_${userId}`;
                            var programRequest = programTransaction.get(program);
                            programRequest.onerror = function (event) {
                            }.bind(this);
                            programRequest.onsuccess = function (event) {
                                var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                                var consumptionList = [];
                                for (var p = 0; p < planningUnitIdList.length; p++) {
                                var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitIdList[p]);
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
                                consumptionList = consumptionList.concat(programJson.consumptionList);
                            }
                            var mergedConsumptionList =[];
                            consumptionList.map(item=>{
                                    mergedConsumptionList.push(item)
                                });
                            console.log("consumptionList---",consumptionList.filter(c => c.planningUnit.id == planningUnitIdList[0] && c.consumptionDate== '2022-10-01'));
                            var monthArray = [];
                            var curDate = startDate;
                            var monthstartfrom = this.state.rangeValue.from.month
                            for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
                                curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                                var noOfDays = moment(curDate, "YYYY-MM").daysInMonth();
                                monthArray.push({ date: curDate, noOfDays: noOfDays })
                            }
                            var isStartYear = 0;
                                for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                                    if (isStartYear == 0) {
                                        isStartYear = -1
                                    } else {
                                        isStartYear = 2
                                    }
                                    monthstartfrom = (isStartYear == -1 ? monthstartfrom : 1);
                                    for (var month = monthstartfrom; month <= 12; month++) {
                                        var curDate;
                                        var year = from;
                                        curDate = year + "-" + String(month).padStart(2, '0') + "-01";
                                            var regionData = [];
                                            var regionTotalForecastQty ='';
                                            var regionTotalActualQty ='';
                                            var regionTotalAdjustedActualQty ='';
                                            var totalDiffForLast6months='';
                                            var totalOfActualForLast6months ='';
                                            for (let k = 0; k < regionList.length; k++) {    
                                                var currentForecastQty = '';
                                                var currentActualQty = '';
                                                var currentAdjustedActualConsumption = '';
                                                var currentDayOfStockOut = '';    
                                                var consumptionForecastQty = '';
                                                var consumptionActualQty = '';    
                                                var errorPerc=0;
                                                var totalOfActualForRegionOfLastMonths = '';
                                                var totalDiffForRegionOfLastmonths = '';
                            
                                                for (var i = month, j = 0; j <= monthInCalc; i--, j++){ 
                                                    var forecastQty = ''; 
                                                    var actualQty = ''; 
                                                    var adjustedActualConsumption= ''; 
                                                    var daysOfStockOut=''; 
                                                    if (i == 0) { 
                                                        i = 12; year = year - 1 
                                                    } 
                                                    var dt = year + "-" + String(i).padStart(2, '0') + "-01"; 
                                                    console.log("Date dt",dt)
                                                   
                                                    var conlist=[]; 
                                                    console.log("Date conlist.lenght",conlist.length)
                                                   var tempConsmptionList = [];
                                                   mergedConsumptionList.filter(c => c.consumptionDate === dt).map(item=>{
                                                    tempConsmptionList.push(item);
                                                   })
                                                    // const consumptionListFilter=tempConsmptionList;
                                                    // console.log("Date consumptionListFilter",consumptionListFilter)
                                                   
                                                    tempConsmptionList.map(item=>{
                                                    console.log("item---",item)
                                                        conlist.push(item);
                                                    })
                                                        // Conversion in EU 
                                                         for (let cl1 = 0; cl1 < conlist.length; cl1++) { 
                                                            console.log("Date conlist[cl]",conlist[cl1])
                                                            var selectPlanningObj = proListDataFilter.filter(c => c.planningUnit.id == conlist[cl1].planningUnit.id); 
                                                            console.log("$$ selectPlanningObj[0].multiplier---",selectPlanningObj); 
                                                            console.log("$$ conlist1[cl].consumptionQty---Before",conlist[cl1].consumptionQty); 
                                                            if (equivalencyUnitId != -1) { 
                                                                let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitId)[0].convertToEu; 
                                                                conlist[cl1].consumptionQty = (Number(conlist[cl1].consumptionQty) * Number(selectPlanningObj[0].multiplier)) * Number(convertToEu); 
                                                            }else{
                                                                console.log("$$ conlist1[cl].consumptionQty---InElse",conlist[cl1].consumptionQty,"selectPlanningObj[0].multiplier---",Number(selectPlanningObj[0].multiplier),"RESULT",(Number(conlist[cl1].consumptionQty) * Number(selectPlanningObj[0].multiplier)));
                                                                conlist[cl1].consumptionQty = Number(conlist[cl1].consumptionQty) * Number(selectPlanningObj[0].multiplier); 
                                                                // console.log("Hello",cl1,p1,month,conlist1[cl1].consumptionQty)
                                                            }
                                                            console.log("$$ conlist1[cl].consumptionQty---After",conlist[cl1].consumptionQty); 
                                                        }
                                                    var noOfDays = moment(dt, "YYYY-MM").daysInMonth(); 
                                                    // For TIME WINDOW 
                                                    consumptionForecastQty = conlist.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(dt).format("YYYY-MM") && c.actualFlag == false && c.active == true && c.region.id == regionList[k].regionId); 
                                                    consumptionActualQty = conlist.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(dt).format("YYYY-MM") && c.actualFlag == true && c.active == true && c.region.id == regionList[k].regionId); 
                                                    console.log("$$ consumptionForecastQty",consumptionForecastQty); 
                                                    console.log("$$ consumptionActualQty",consumptionActualQty);    
                                                    if(j==0){ 
                                                        if (consumptionForecastQty.length >= 0) { 
                                                            for (var con = 0; con < consumptionForecastQty.length; con++) { 
                                                                currentForecastQty =Number(currentForecastQty)+ Number(consumptionForecastQty[con].consumptionQty); 
                                                            } 
                                                        } 
                                                        if (consumptionActualQty.length >= 0) {
                                                             for (var con = 0; con < consumptionActualQty.length; con++) {
                                                                 currentActualQty = Number(currentActualQty) + Number(consumptionActualQty[con].consumptionQty); 
                                                                 currentAdjustedActualConsumption = Number(currentAdjustedActualConsumption) + consumptionAdjForStockOutId ? Number(consumptionActualQty[con].consumptionQty / (noOfDays - consumptionActualQty[con].dayOfStockOut) * noOfDays):null; 
                                                                 currentDayOfStockOut =Number(currentDayOfStockOut) + Number(consumptionActualQty[con].dayOfStockOut); 
                                                            } 
                                                        } 
                                                    }
                                                    console.log("$$ consumptionActualQty currentActualQty",currentActualQty); 
                                                    if (consumptionForecastQty.length >= 0) { 
                                                        for (var con = 0; con < consumptionForecastQty.length; con++) { 
                                                            forecastQty = (forecastQty==='' && consumptionForecastQty[con].consumptionQty ==='')?'': Number(forecastQty) + Number(consumptionForecastQty[con].consumptionQty); 
                                                        } 
                                                    } 
                                                    if (consumptionActualQty.length >= 0) { 
                                                        for (var con = 0; con < consumptionActualQty.length; con++) {
                                                            actualQty = (actualQty==='' && consumptionActualQty[con].consumptionQty==='')?'': (Number(actualQty) + Number(consumptionActualQty[con].consumptionQty)); 
                                                            adjustedActualConsumption = (adjustedActualConsumption==='' && consumptionActualQty[con].consumptionQty==='') ?'': (Number(adjustedActualConsumption) + (consumptionAdjForStockOutId ? Number(consumptionActualQty[con].consumptionQty) / (noOfDays - Number(consumptionActualQty[con].dayOfStockOut)) * noOfDays:null)); 
                                                            daysOfStockOut = (daysOfStockOut===''&&consumptionActualQty[con].dayOfStockOut==='')?'': (Number(daysOfStockOut) + Number(consumptionActualQty[con].dayOfStockOut)); 
                                                            console.log("*** consumptionActualQty[con].consumptionQty",consumptionActualQty[con].consumptionQty); 
                                                        } 
                                                    } 
                                                    console.log("*** actualQty",actualQty); 
                                                    console.log("*** totalOfActualForRegionOfLastMonths",totalOfActualForRegionOfLastMonths); 
                                                    totalOfActualForRegionOfLastMonths = (totalOfActualForRegionOfLastMonths===''?'':Number(totalOfActualForRegionOfLastMonths)) + (actualQty===''?'':(consumptionAdjForStockOutId ? Number(adjustedActualConsumption) :Number(actualQty)));
                                                    totalDiffForRegionOfLastmonths = (totalDiffForRegionOfLastmonths===''?'':Number(totalDiffForRegionOfLastmonths)) + (actualQty===''?'':(consumptionAdjForStockOutId ? Math.abs(Number(adjustedActualConsumption) - Number(forecastQty)):Math.abs(Number(actualQty) - Number(forecastQty))));
                                                    console.log("*** totalOfActualForRegionOfLastMonths",totalOfActualForRegionOfLastMonths);
                                                    console.log("*** totalDiffForRegionOfLastmonths", totalDiffForRegionOfLastmonths);
                                                }
                                                console.log("*** totalOfActualForRegionOfLastMonths Total",totalOfActualForRegionOfLastMonths);
                                                console.log("*** totalDiffForRegionOfLastmonths Total", totalDiffForRegionOfLastmonths);                                                                   
                                                var errorPerc = totalOfActualForRegionOfLastMonths===''?null:(totalOfActualForRegionOfLastMonths > 0 ? (totalDiffForRegionOfLastmonths/ totalOfActualForRegionOfLastMonths):0);
                                                console.log("*** errorPerc Total", errorPerc);          
                                                regionTotalForecastQty =(regionTotalForecastQty==='' && currentForecastQty==='')?'': (Number(regionTotalForecastQty) + Number(currentForecastQty));
                                                regionTotalActualQty =(regionTotalActualQty==='' && currentActualQty==='')?'': (Number(regionTotalActualQty) + Number(currentActualQty));
                                                regionTotalAdjustedActualQty =(regionTotalAdjustedActualQty==='' && currentAdjustedActualConsumption==='')?'': (Number(regionTotalAdjustedActualQty) + Number(currentAdjustedActualConsumption)); totalOfActualForLast6months=(totalOfActualForLast6months==='' && totalOfActualForRegionOfLastMonths==='')?'': (Number(totalOfActualForLast6months) + Number(totalOfActualForRegionOfLastMonths)); totalDiffForLast6months=(totalDiffForLast6months==='' && totalDiffForRegionOfLastmonths==='')?'':(Number(totalDiffForLast6months) + Number(totalDiffForRegionOfLastmonths));
                                                var region = { id: regionList[k].regionId, lable: regionList[k].label };
                                                regionData.push({
                                                    region: region,
                                                    actualQty: consumptionAdjForStockOutId ? currentAdjustedActualConsumption:currentActualQty,
                                                    forecastQty: currentForecastQty,
                                                    daysOfStockOut: currentDayOfStockOut,
                                                    errorPerc:errorPerc
                                                });
                                                console.log("*** regionData", regionData);                                                                    
                                            }
                                            var totalErrorPerc = totalOfActualForLast6months===''?null:totalOfActualForLast6months > 0 ? (totalDiffForLast6months/ totalOfActualForLast6months):0; 
                                            dataList.push({ 
                                                month: moment(curDate).format("YYYY-MM-DD"), 
                                                regionData: regionData, 
                                                actualQty: consumptionAdjForStockOutId ?regionTotalAdjustedActualQty :regionTotalActualQty, 
                                                forecastQty: regionTotalForecastQty, 
                                                errorPerc: totalErrorPerc 
                                            }) 
                                            console.log("*** dataList", dataList); 
                                        } 
                                    } 
                            this.setState({
                                monthArray: monthArray, 
                                dataList: dataList, 
                                consumptionAdjForStockOutId: consumptionAdjForStockOutId, 
                                yaxisEquUnit:equivalencyUnitId ,
                                loading:false
                            })                                                                                       
                        }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this);
            }
        }else{
            this.setState({
                message: '',
                loading: true
            })
            var inputjson = {
                programId: programId,
                versionId: versionId, // Can be -1 for the latest Program
                unitId: viewById == 1 ? planningUnitId : forecastingUnitId, // PU or FU based on viewBy
                startDate: startDate,
                stopDate: stopDate,
                viewBy:  viewById, // 1 for PU and 2 for FU
                regionIds: regionIds, // empty if all Regions
                equivalencyUnitId: equivalencyUnitId == -1 ? 0 : equivalencyUnitId, // If the output is to be in EquivalencyUnit then this is a non zero id
                previousMonths: monthInCalc, // The number of months that we need to average the Consumption for WAPE. Does not include current month which is always included.
                daysOfStockOut: consumptionAdjForStockOutId?true:false // Boolean field that if true means we should consider the Days of Stock Out valued and adjust the consumption accordingly. Only adjusts for Actual Consumption.                            
            }
            console.log("fetchData JSON INPUT---------->", inputjson);
            ReportService.forecastError(inputjson)
                .then(response => {
                    console.log("fetchData dataList--->", response.data);
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
                        yaxisEquUnit:equivalencyUnitId,
                        // equivalencyUnitLabel:equivalencyUnitLable
                    },() => {
                        this.hideFirstComponent();
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
    }
    // else if (programId == -1) {//validation message            
    //     this.setState({ message: i18n.t('static.common.selectProgram'), monthArrayList: [], datasetList: [], versions: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], programId: '', versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });

    // } else if (versionId == -1) {
    //     this.setState({ message: i18n.t('static.program.validversion'), monthArrayList: [], datasetList: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });

    // } else if (planningUnitId == -1  && viewById == 1) {
    //     this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), monthArrayList: [], datasetList: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });

    // } else if (forecastingUnitId == -1  && viewById == 2) {
    //     this.setState({ message: i18n.t('static.planningunit.forcastingunittext'), monthArrayList: [], datasetList: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });
    // }
}

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV() {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.programs.filter(c => c.programId == this.state.programId)[0].label.label_en).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ': ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        if (this.state.viewById == 1) {
            csvRow.push('"' + ('Planning Unit' + ': ' + document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        } else {
            csvRow.push('"' + ('Forecasting unit' + ': ' + document.getElementById("forecastingUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        }
        this.state.regions.map(ele =>
            csvRow.push('"' + ('Region' + ': ' + getLabelText(ele.label, this.state.lang)).replaceAll(' ', '%20') + '"'))
        this.state.consumptionAdjForStockOutId ? csvRow.push('"' + ('Show consumption adjusted for stock out' + ': ' + "Yes").replaceAll(' ', '%20') + '"'):
        csvRow.push('"' + ('Show consumption adjusted for stock out' + ': ' + "No").replaceAll(' ', '%20') + '"')
        csvRow.push('"'+(i18n.t('static.report.timeWindow')+': ' + (document.getElementById("timeWindow").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        if(document.getElementById("yaxisEquUnit").value>0){
            csvRow.push('"'+("Y-axis in equivalency unit"+': ' + (document.getElementById("yaxisEquUnit").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
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
        var A = [this.addDoubleQuoteToRowContent(headers)];

        var totalError = 0;
        var countError = 0;
        var totalForcaste = 0;
        var countForcaste = 0;
        var totalActual = 0;
        var countActual = 0;
        var totalDifference = 0;
        var countDifference = 0;
        var datacsv = [];
        console.log("this.state.dataList===========>",this.state.dataList)

// Region Error        
        this.state.regionValues.map(r => {
            var datacsv = [];
            var totalErrorRegion = 0;
            var totalErrorRegionCount = 0;
            datacsv.push(((r.label)).replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                    let errorData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                    let errorDataRegionData=(errorData[0].regionData.filter(arr1 => arr1.region.id == r.value));  
                    totalErrorRegion += errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? 0 : errorDataRegionData[0].errorPerc:0;
                    totalErrorRegionCount += errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? 0 : 1:0;
                    datacsv.push((errorDataRegionData[0].actualQty==='' || errorDataRegionData[0].actualQty==null)? (errorDataRegionData[0].forecastQty==='' || errorDataRegionData[0].forecastQty==null) ?"No months in this period contain both forecast and actual consumption".replaceAll(' ', '%20'):"No Actual Data".replaceAll(' ', '%20'): errorDataRegionData[0].actualQty >= 0 ?((isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? '': this.PercentageFormatter(errorDataRegionData[0].errorPerc*100)):"No Actual Data".replaceAll(' ', '%20'))
                    // datacsv.push(errorDataRegionData[0].actualQty > 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc == null || errorDataRegionData[0].errorPerc === '') ? '' :  this.PercentageFormatter(errorDataRegionData[0].errorPerc*100):"No Actual data")
                })
            }
            datacsv.push(totalErrorRegionCount>0?this.PercentageFormatter((totalErrorRegion / totalErrorRegionCount)*100):0);
            A.push(this.addDoubleQuoteToRowContent(datacsv))
// Region Actual        
            this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{ 
            var datacsv = [];
            var totalRegion = 0;
            var totalRegionCount = 0;
            this.state.consumptionAdjForStockOutId ?datacsv.push('>> Adjusted Actual '.replaceAll(' ', '%20')):datacsv.push('>> Actual '.replaceAll(' ', '%20'));
            {
                this.state.monthArray.map((item1, count) => {
                    let acData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                    let auDataRegionData=(acData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                    totalRegion += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty==='' || auDataRegionData[0].actualQty==null) ? 0 : Number(auDataRegionData[0].actualQty);
                    totalRegionCount += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty==='' || auDataRegionData[0].actualQty==null) ? 0 : 1;                
                    datacsv.push((isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty == null || auDataRegionData[0].actualQty === '') ? '' : Number(auDataRegionData[0].actualQty).toFixed(2))
                })
            }
            datacsv.push(totalRegionCount>0?Number(totalRegion / totalRegionCount).toFixed(2):0);
            A.push(this.addDoubleQuoteToRowContent(datacsv))
        });        

// Region forecast     
        this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{ 
            var datacsv = [];
            var totalRegion = 0;
            var totalRegionCount = 0;
            datacsv.push('>> Forecast '.replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                    let fuData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                    let fuDataRegionData=(fuData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                    totalRegion += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? 0 : Number(fuDataRegionData[0].forecastQty);
                    totalRegionCount += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? 0 : 1;        
                    datacsv.push((isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty == null || fuDataRegionData[0].forecastQty === '') ? '' : Number(fuDataRegionData[0].forecastQty).toFixed(2))
                })
            }
            datacsv.push(totalRegionCount>0?Number(totalRegion / totalRegionCount).toFixed(2):0);
            A.push(this.addDoubleQuoteToRowContent(datacsv))
        }); 

// Region daysOfStockOut     
        this.state.consumptionAdjForStockOutId && 
        this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{ 
            var datacsv = [];
            var totalRegion = 0;
            var totalRegionCount = 0;
            datacsv.push('>> Days Stocked Out '.replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                let daysOfStockOutData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                let daysOfStockOutDataRegionData=(daysOfStockOutData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                totalRegion += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? 0 : Number(daysOfStockOutDataRegionData[0].daysOfStockOut);
                totalRegionCount += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? 0 : 1;
                datacsv.push((isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)|| daysOfStockOutDataRegionData[0].daysOfStockOut == null || daysOfStockOutDataRegionData[0].daysOfStockOut === '') ? '' : Number(daysOfStockOutDataRegionData[0].daysOfStockOut).toFixed(2))
                })
            }
            datacsv.push(totalRegionCount>0?Number(totalRegion / totalRegionCount).toFixed(2):0);
            A.push(this.addDoubleQuoteToRowContent(datacsv))
        }); 
        
// Region Difference        
        this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{ 
            var datacsv = [];
            var totalRegion = 0;
            var totalRegionCount = 0;
            datacsv.push('>> Difference'.replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                    let differenceData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                    let differenceRegionData=(differenceData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                    totalRegion += isNaN(Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty)) ? 0 : Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty);
                    totalRegionCount += 1;
                    datacsv.push(Number(((isNaN(differenceRegionData[0].actualQty)|| differenceRegionData[0].actualQty == null || differenceRegionData[0].actualQty === '') ? 0 :differenceRegionData[0].actualQty)-((isNaN(differenceRegionData[0].forecastQty) || differenceRegionData[0].forecastQty == null || differenceRegionData[0].forecastQty === '') ? 0 :differenceRegionData[0].forecastQty)).toFixed(2))
                })
            }
            datacsv.push(totalRegionCount>0?Number(totalRegion / totalRegionCount).toFixed(2):0);
            A.push(this.addDoubleQuoteToRowContent(datacsv))
        });
        });

//Total Error
        datacsv = [];
        datacsv.push([(('Error').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalError += data[0].actualQty >= 0 ? (isNaN(data[0].errorPerc)|| data[0].errorPerc == null || data[0].errorPerc === '') ? 0 : parseFloat(data[0].errorPerc):0;
            countError += data[0].actualQty >= 0 ? (isNaN(data[0].errorPerc)|| data[0].errorPerc == null || data[0].errorPerc === '') ? 0 : 1:0;
            datacsv.push((data[0].actualQty==='' ||data[0].actualQty==null) ? (data[0].forecastQty==='' || data[0].forecastQty==null)?"No months in this period contain both forecast and actual consumption".replaceAll(' ', '%20'):"No Actual Data".replaceAll(' ', '%20'): data[0].actualQty>= 0? (isNaN(data[0].errorPerc) || data[0].errorPerc===''||data[0].errorPerc==null) ? '' : this.PercentageFormatter((data[0].errorPerc)*100):"No Actual Data".replaceAll(' ', '%20'))
            // datacsv.push(data[0].actualQty > 0 ? (isNaN(data[0].errorPerc)|| data[0].errorPerc == null || data[0].errorPerc === '') ? '' : this.PercentageFormatter(data[0].errorPerc*100):"No Actual data")
        })
        datacsv.push(countError>0?this.PercentageFormatter((totalError / countError)*100):0);
        A.push(this.addDoubleQuoteToRowContent(datacsv))

//Total Actual        
        datacsv = [];
        this.state.consumptionAdjForStockOutId ?datacsv.push('Adjusted Actual '.replaceAll(' ', '%20')):datacsv.push('Actual '.replaceAll(' ', '%20'));
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalActual += (isNaN(data[0].actualQty)||data[0].actualQty == null || data[0].actualQty === '') ? 0 :  data[0].actualQty;
            countActual += (isNaN(data[0].actualQty)||data[0].actualQty == null || data[0].actualQty === '') ? 0 :  1;
            datacsv.push((isNaN(data[0].actualQty)|| data[0].actualQty == null || data[0].actualQty === '') ? '' : Number(data[0].actualQty).toFixed(2))
        })
        datacsv.push(countActual>0?Number(totalActual / countActual).toFixed(2):0);
        A.push(this.addDoubleQuoteToRowContent(datacsv))

//Total Forecast         
        datacsv = [];
        datacsv.push([(('Forecast').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalForcaste += (isNaN(data[0].forecastQty)|| data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : data[0].forecastQty;
            countForcaste += (isNaN(data[0].forecastQty)|| data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : 1;
            datacsv.push((isNaN(data[0].forecastQty)|| data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : Number(data[0].forecastQty).toFixed(2))
        })
        datacsv.push(countForcaste>0?Number(totalForcaste / countForcaste).toFixed(2):0);
        A.push(this.addDoubleQuoteToRowContent(datacsv))

//Total Difference        
        datacsv = [];
        datacsv.push([(('Difference').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalDifference += ((isNaN(data[0].actualQty)|| data[0].actualQty == null || data[0].actualQty === '' ? 0 : data[0].actualQty) - (isNaN(data[0].forecastQty)||data[0].forecastQty == null || data[0].forecastQty === '' ? 0 :data[0].forecastQty));
            countDifference += 1;
            datacsv.push(Number(((isNaN(data[0].actualQty)|| data[0].actualQty == null || data[0].actualQty === '') ? 0 :  data[0].actualQty) -((isNaN(data[0].forecastQty)||data[0].forecastQty == null || data[0].forecastQty === '') ? 0 : data[0].forecastQty)).toFixed(2))
        })
        datacsv.push(countDifference>0?Number(totalDifference / countDifference).toFixed(2):0);
        A.push(this.addDoubleQuoteToRowContent(datacsv))

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        // console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + 'Consumption Forecast Error' + ".csv"
        document.body.appendChild(a)
        a.click();

    }
    PercentageFormatter = num => {
        if (num !== '' && num != null) {
            return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2) + '%';
        } else {
            return ''
        }
    }
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
                    doc.text(i18n.t('static.report.dateRange') + ': ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    var regionText = doc.splitTextToSize(('Region' + ': ' + this.state.regionLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 120, regionText)
                    doc.text('Show consumption adjusted for stock out' + ': '+(this.state.consumptionAdjForStockOutId ? "Yes" : "No"), doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.timeWindow') + ': '+document.getElementById("timeWindow").selectedOptions[0].text, doc.internal.pageSize.width / 8, 140, {
                        align: 'left'
                    })
                    if(document.getElementById("yaxisEquUnit").value>0){
                    doc.text("Y-axis in equivalency unit" + ': '+document.getElementById("yaxisEquUnit").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
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
        doc.addImage(canvasImg, 'png', 10, 280, 825, 220, 'CANVAS');
        doc.addPage();
        doc.text("! = No months in this period contain both forecast and actual consumption", doc.internal.pageSize.width / 8 , 100,{
            align: 'left',
            })
    
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
                A.push(""+(r.label))
                {
                    this.state.monthArray.map((item1, count) => {
                        let errorData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let errorDataRegionData=(errorData[0].regionData.filter(arr1 => arr1.region.id == r.value));  
                        totalRegion += errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? 0 : errorDataRegionData[0].errorPerc:0;
                        totalRegionCount += errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? 0 : 1:0;
                        A.push((errorDataRegionData[0].actualQty==='' || errorDataRegionData[0].actualQty==null) ? (errorDataRegionData[0].forecastQty==='' || errorDataRegionData[0].forecastQty==null) ?"!":"No Actual Data": errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null)? "" :this.PercentageFormatter(errorDataRegionData[0].errorPerc*100):"No Actual Data")
                    })
                }
                console.log("totalRegion----",totalRegion)
                console.log("totalRegionCount----",totalRegionCount)
                A.push(totalRegionCount>0 ? this.PercentageFormatter((totalRegion / totalRegionCount)*100):0)
        data.push(A);
// Region Actual
        A = [];
        {
            this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{ 
                var totalRegion = 0;
                var totalRegionCount = 0;
                (this.state.consumptionAdjForStockOutId)? A.push(' Adjusted Actual') : A.push(' Actual')
                {
                    this.state.monthArray.map((item1, count) => {
                        let acData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let auDataRegionData=(acData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                        totalRegion += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty==='' || auDataRegionData[0].actualQty==null) ? 0 : Number(auDataRegionData[0].actualQty);
                        totalRegionCount += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty==='' || auDataRegionData[0].actualQty==null) ? 0 : 1;
                        A.push((isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty == null || auDataRegionData[0].actualQty === '') ? '' : Number(auDataRegionData[0].actualQty).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
                        })
                }
                A.push(totalRegionCount>0?((totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0)
            })
        data.push(A);
        }
        
// Region Forecast         
        A = [];
        {
           {this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{
                var totalRegion = 0;
                var totalRegionCount = 0;
                A.push(' Forecast')
                {
                    this.state.monthArray.map((item1, count) => {
                        let fuData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let fuDataRegionData=(fuData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                        totalRegion += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? 0 : Number(fuDataRegionData[0].forecastQty);
                        totalRegionCount += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? 0 : 1;        
                        A.push((isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? '' : Number(fuDataRegionData[0].forecastQty).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                    })
                }
                A.push(totalRegionCount>0?((totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0)
            })
        }
        data.push(A);
        }

// Region daysOfStockOut         
        if(this.state.consumptionAdjForStockOutId){
                A = [];
                {
                    this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{
                        var totalRegion = 0;
                        var totalRegionCount = 0;
                        A.push(' Days Stocked Out')
                        {
                            this.state.monthArray.map((item1, count) => {
                            let daysOfStockOutData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                            let daysOfStockOutDataRegionData=(daysOfStockOutData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                            totalRegion += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? 0 : Number(daysOfStockOutDataRegionData[0].daysOfStockOut);
                            totalRegionCount += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? 0 : 1;
                            A.push((isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? '' : Number(daysOfStockOutDataRegionData[0].daysOfStockOut).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                            })
                        }
                        A.push(totalRegionCount>0?((totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0)
                    })
                }
                data.push(A);
        }

        // Region Difference        
        A = [];
        {
            this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{
                var totalRegion = 0;
                var totalRegionCount = 0;
                A.push(' Difference')
                {
                    this.state.monthArray.map((item1, count) => {
                        let differenceData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                        let differenceRegionData=(differenceData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                        totalRegion += isNaN(Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty)) ? 0 : Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty);
                        totalRegionCount += 1;
                        A.push(Number(((isNaN(differenceRegionData[0].actualQty)|| differenceRegionData[0].actualQty == null || differenceRegionData[0].actualQty === '') ? 0 :differenceRegionData[0].actualQty)-((isNaN(differenceRegionData[0].forecastQty) || differenceRegionData[0].forecastQty == null || differenceRegionData[0].forecastQty === '') ? 0 :differenceRegionData[0].forecastQty)).toFixed(2))
                    })
                }
                A.push(totalRegionCount>0?(Number(totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0)
            })
            data.push(A);
        }
        
    })  
}
   
// Total Error        
        A = [];        
        A.push('Error')
        {
            var totalError = 0;
            var countError = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalError += datavalue[0].actualQty >= 0 ? (isNaN(datavalue[0].errorPerc) || datavalue[0].errorPerc == null || datavalue[0].errorPerc === '') ? 0 : datavalue[0].errorPerc : 0;
                countError += datavalue[0].actualQty >= 0 ? (isNaN(datavalue[0].errorPerc) || datavalue[0].errorPerc == null || datavalue[0].errorPerc === '') ? 0 : 1 : 0
                A.push((datavalue[0].actualQty==='' || datavalue[0].actualQty==null) ? (datavalue[0].forecastQty==='' || datavalue[0].forecastQty==null)?"!":"No Actual Data":datavalue[0].actualQty>=0 ? (isNaN(datavalue[0].errorPerc) || datavalue[0].errorPerc == null || datavalue[0].errorPerc === '') ? '' : this.PercentageFormatter(datavalue[0].errorPerc*100):"No Actual Data")    
            })
            A.push(countError>0?this.PercentageFormatter((totalError / countError)*100):0)
        }
        data.push(A);

// Total Actual
        A = [];
        (this.state.consumptionAdjForStockOutId)? A.push('Adjusted Actual') : A.push('Actual')
        {
            var totalActal = 0;
            var countActal = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalActal += (isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? 0 : datavalue[0].actualQty;
                countActal += (isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? 0 : 1;
                A.push((isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? '' : Number(datavalue[0].actualQty).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push(countActal>0?(totalActal / countActal).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0)
        }
        data.push(A);

// Total Forecast    
        A = [];    
        A.push('Forecast')
        {
            var totalForecast = 0;
            var countForecast = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalForecast += (isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 : datavalue[0].forecastQty;
                countForecast += (isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 : 1;
                A.push((isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? '' : Number(datavalue[0].forecastQty).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push(countForecast>0?((totalForecast / countForecast).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0)
        }
        data.push(A);

// Total Difference
        A = [];
        A.push('Difference')
        {
            var totalDiff = 0;
            var countDiff = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalDiff += ((isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? 0 : datavalue[0].actualQty) - ((isNaN(datavalue[0].forecastQty)|| datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 :datavalue[0].forecastQty);
                countDiff += 1;
                A.push((((isNaN(datavalue[0].actualQty) || datavalue[0].actualQty == null || datavalue[0].actualQty === '') ? 0 : datavalue[0].actualQty) - 
                       ((isNaN(datavalue[0].forecastQty) || datavalue[0].forecastQty == null || datavalue[0].forecastQty === '') ? 0 : datavalue[0].forecastQty)).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push(countDiff>0?((totalDiff / countDiff).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0)
        }
        data.push(A);
        let flag =false;
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
                  if(data.section=="body" && data.column.index == 0){
                    if(data.cell.raw[0]!=" "){
                        data.cell.styles.fontStyle = 'bold';    
                        flag=false;
                    }else{
                    flag=true;
                    data.cell.styles.fontStyle = 'normal';
                    }
                }
                // else{
                //     if(flag==true){
                //     data.cell.styles.fontStyle = 'normal';
                //     }else{
                //         data.cell.styles.fontStyle = 'bold';    
                //     }
                // }   
              if(data.cell.raw.toString().replaceAll(",","")<0){
                data.cell.styles.textColor = [255,0,0];    
              }    
              }.bind(this)
        };

        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + 'Consumption Forecast Error' + ".pdf")
    }


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
        let totalDaysOfStockOut = 0;
        let countDaysOfStockOut = 0;

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
        console.log("Seema planningUnits--------------->", planningUnits)
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
        console.log("seema equivalencyUnitList-->",equivalencyUnitList.length > 0)
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
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}  ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                    </option>
                )
            }, this);

        const { regions } = this.state;
        let regionList = regions.length > 0
            && regions.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.regionId })

            }, this);


        console.log("PlanningUnit", this.state.planningUnits.filter(c => c.planningUnit.id == this.state.planningUnitId)[0])

        var chartOptions = {
            title: {
                display: true,
                text: (this.state.viewById == 1 ?
                    this.state.planningUnits.filter(c => c.planningUnit.id == this.state.planningUnitId).length > 0 ?
                        this.state.planningUnits.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit.label.label_en : '' :
                    this.state.forecastingUnits.filter(c => c.id == this.state.forecastingUnitId).length > 0 ?
                        this.state.forecastingUnits.filter(c => c.id == this.state.forecastingUnitId)[0].label.label_en : '')
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: (this.state.yaxisEquUnit > 0 ? this.state.equivalencyUnitLabel : (this.state.viewById == 1 ? i18n.t('static.product.product') : i18n.t('static.forecastingunit.forecastingunit'))),
                            fontColor: 'black'
                        },
                        stacked: true,//stacked
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
                        },
                        gridLines: {
                            drawBorder: true, lineWidth: 0
                        },
                        position: 'left',
                    },
                    {
                        id: 'B',
                        scaleLabel: {
                            display: true,
                            labelString: "Forecast Error",
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
                            callback: function (value) {
                                var cell1 = value
                                cell1 += ' %';
                                return cell1;
                            },
                            // max: 100
                        },
                        gridLines: {
                            drawBorder: true, lineWidth: 0
                        },
                        position: 'right',

                    }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
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
                        if(data.datasets[tooltipItem.datasetIndex].label=='Error'){
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2+'%';    
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
                    fontColor: 'black'
                }
            }
        }

        let bar = {}
        var datasetListForGraph = [];
        var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]

        var elInstance = this.state.dataList;
        console.log("In graph----->",elInstance)
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
                data: this.state.dataList.map(item => (item.errorPerc !== "" ? (Number(item.errorPerc*100).toFixed(2)): null)),
                type: 'line',
                yAxisID: 'B',
                // backgroundColor: (this.state.yaxisEquUnit > 0 ? '#002F6C' : 'transparent'),
                backgroundColor: 'transparent',
                borderColor: '#EDB944',
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

            datasetListForGraph.push({
                label: "Forecast",
                data: consumptionForecastValue,
                stack: 3,
                yAxisID: 'A',
                backgroundColor: '#002F6C',
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
        console.log("datasetListForGraph--", datasetListForGraph)

        if (this.state.dataList.length > 0) {
            bar = {
                labels: this.state.monthArray.map((item, index) => (moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))),
                datasets: datasetListForGraph
            };
        }

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
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
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
                                                        key={JSON.stringify(rangeValue)}
                                                        onChange={this.handleRangeChange}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>
                                                </div>

                                            </FormGroup>
                                            <FormGroup className="col-md-3" id="equivelencyUnitDiv">
                                                <Label htmlFor="appendedInputButton">Y-axis in equivalency unit</Label>
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
                                                    <InputGroup>
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
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup id="planningUnitDiv">
                                                <div className="controls">
                                                    <InputGroup>
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
                                                    </InputGroup>
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
                                                        Show consumption adjusted for stock out?
                                                    </Label>
                                                </div>
                                            </FormGroup>

                                            {/* <FormGroup className="col-md-3">
                                                <div className="tab-ml-1" style={{ marginTop: '30px' }}>
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="checkbox"
                                                        id="yaxisEquUnitCb"
                                                        name="yaxisEquUnitCb"
                                                        // checked={true}
                                                        // checked={this.state.yaxisEquUnit}
                                                        onClick={(e) => { this.yaxisEquUnitCheckbox(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        Y-axis in equivalency unit?
                                                    </Label>
                                                </div>
                                            </FormGroup> */}
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
                                                <div className="table-wrap DataEntryTable table-responsive">
                                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                                        <thead>
                                                            <tr>
                                                                <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                <th className="sticky-col first-col clone"></th>
                                                                {this.state.monthArray.map((item, count) => {
                                                                    return (<th>{moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
                                                                })}
                                                                <th className="sticky-col first-col clone">Average</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                        {this.state.regionValues.map(r => {
                                                        {/* Error */}
                                                                var regionErrorTotal = 0;
                                                                var regionErrorTotalCount = 0;
                                                                return (<><tr className="hoverTd">
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(r.value)}>
                                                                    {this.state.consumptionUnitShowArr.includes(r.value) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                    </td>
                                                                    <td className="sticky-col first-col clone hoverTd" align="left"><b>{"   " + r.label}</b></td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                    let errorData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                    let errorDataRegionData=(errorData[0].regionData.filter(arr1 => arr1.region.id == r.value));  
                                                                        regionErrorTotal += errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? 0 : errorDataRegionData[0].errorPerc:0;
                                                                        regionErrorTotalCount += errorDataRegionData[0].actualQty >= 0 ? (isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? 0 : 1:0;               
                                                                        return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(errorDataRegionData[0].actualQty==='' || errorDataRegionData[0].actualQty==null)? (errorDataRegionData[0].forecastQty==='' || errorDataRegionData[0].forecastQty==null)?"No months in this period contain both forecast and actual consumption":"No Actual Data": errorDataRegionData[0].actualQty >= 0 ?((isNaN(errorDataRegionData[0].errorPerc) || errorDataRegionData[0].errorPerc===''||errorDataRegionData[0].errorPerc==null) ? '': this.PercentageFormatter(errorDataRegionData[0].errorPerc*100)):"No Actual Data"}</td>)})}
                                                                    <td className="sticky-col first-col clone hoverTd" align="left">{regionErrorTotalCount>0 ? this.PercentageFormatter((regionErrorTotal / regionErrorTotalCount)*100):0}</td>
                                                                    </tr>
                                                                 {/* actual */}
                                                               {this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{ 
                                                                 var regionActualTotal = 0;
                                                                 var regionActualTotalCount = 0;             
                                                                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{this.state.consumptionAdjForStockOutId?"  Adjusted Actual":"   Actual"}</td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    let acData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                    let auDataRegionData=(acData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                                                                    regionActualTotal += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty==='' || auDataRegionData[0].actualQty==null) ? 0 : Number(auDataRegionData[0].actualQty);
                                                                    regionActualTotalCount += (isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty==='' || auDataRegionData[0].actualQty==null) ? 0 : 1;
                                                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(isNaN(auDataRegionData[0].actualQty) || auDataRegionData[0].actualQty==='' || auDataRegionData[0].actualQty==null) ?'': (Number(auDataRegionData[0].actualQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)    
                                                                    })}          
                                                                <td className="sticky-col first-col clone text-left">{regionActualTotalCount>0?(Number(regionActualTotal / regionActualTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0}</td>
                                                            </tr>)})}
                                                            {/* Forecast */}    
                                                            {this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{
                                                                var regionForecastTotal = 0;
                                                                var regionForecastTotalCount = 0;
                                                                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                    <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   Forecast"}</td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                        let fuData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                        let fuDataRegionData=(fuData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));
                                                                        regionForecastTotal += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? 0 : Number(fuDataRegionData[0].forecastQty);
                                                                        regionForecastTotalCount += (isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? 0 : 1;
                                                                        console.log("fetchData fuDataRegionData[0].forecastQty ",fuDataRegionData[0].forecastQty)
                                                                        return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(isNaN(fuDataRegionData[0].forecastQty) || fuDataRegionData[0].forecastQty===''|| fuDataRegionData[0].forecastQty==null) ? '' : (Number(fuDataRegionData[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)    
                                                                    })}
                                                                    <td className="sticky-col first-col clone text-left">{regionForecastTotalCount>0?(Number(regionForecastTotal / regionForecastTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0}</td>
                                                                </tr>
                                                                )
                                                            })}
                                                        {/* DaysOfStockOut */}    
                                                        {this.state.consumptionAdjForStockOutId && this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{
                                                                var regionDaysOfStockOutTotal = 0;
                                                                var regionDaysOfStockOutTotalCount = 0;
                                                                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                    <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   Days Stocked Out"}</td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                        let daysOfStockOutData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                        let daysOfStockOutDataRegionData=(daysOfStockOutData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                                                                        regionDaysOfStockOutTotal += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? 0 : Number(daysOfStockOutDataRegionData[0].daysOfStockOut);
                                                                        regionDaysOfStockOutTotalCount += (isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? 0 : 1;
                                                                        return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(isNaN(daysOfStockOutDataRegionData[0].daysOfStockOut)||daysOfStockOutDataRegionData[0].daysOfStockOut===''||daysOfStockOutDataRegionData[0].daysOfStockOut==null) ? '' : (Number(daysOfStockOutDataRegionData[0].daysOfStockOut).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                    })}
                                                                    
                                                                    <td className="sticky-col first-col clone text-left">{regionDaysOfStockOutTotalCount>0?(Number(regionDaysOfStockOutTotal / regionDaysOfStockOutTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0}</td>
                                                                </tr>)
                                                            })}
                                                        {/* Difference */}        
                                                        {this.state.regions.filter(arr => arr.regionId == r.value).map(r1=>{
                                                                var regionDifferenceTotal = 0;
                                                                var regionDifferenceTotalCount = 0;
                                                                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(r.value) ? "" : "none" }}>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                    <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   Difference"}</td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                        let differenceData = this.state.dataList.filter(c => (moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM")));
                                                                        let differenceRegionData=(differenceData[0].regionData.filter(arr1 => arr1.region.id == r1.regionId));  
                                                                        regionDifferenceTotal += isNaN(Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty)) ? 0 : Number(differenceRegionData[0].actualQty - differenceRegionData[0].forecastQty);
                                                                        regionDifferenceTotalCount += 1;
                                                                        return (<td style={{ color: ((isNaN(differenceRegionData[0].actualQty) ? 0 : differenceRegionData[0].actualQty) - (isNaN(differenceRegionData[0].forecastQty) ? 0 : differenceRegionData[0].forecastQty)) < 0 ? 'red' : 'black' }}><NumberFormat displayType={'text'} thousandSeparator={true} />{(Number((isNaN(differenceRegionData[0].actualQty) ? 0 : differenceRegionData[0].actualQty) - (isNaN(differenceRegionData[0].forecastQty) ? 0 : differenceRegionData[0].forecastQty)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)                                                     
                                                                    })}
                                                                    <td className="sticky-col first-col clone text-left" style={{ color: (regionDifferenceTotal / regionDifferenceTotalCount) < 0 ? 'red' : 'black' }}>{regionDifferenceTotalCount>0?(Number(regionDifferenceTotal / regionDifferenceTotalCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0}</td>
                                                                </tr>)
                                                            })}
                                                    </>)
                                                })}
                                                {/* Error */}
                                                <tr className="hoverTd">
                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                        <td className="sticky-col first-col clone hoverTd" align="left"><b>Error</b></td>
                                                        {this.state.monthArray.map((item1, count) => {
                                                            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                            totalError += data[0].actualQty >= 0 ? (isNaN(data[0].errorPerc) || data[0].errorPerc===''||data[0].errorPerc==null) ? 0 : data[0].errorPerc:0;
                                                            countError += data[0].actualQty >= 0 ? (isNaN(data[0].errorPerc) || data[0].errorPerc===''||data[0].errorPerc==null) ? 0 : 1:0;                                         
                                                            return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(data[0].actualQty==='' || data[0].actualQty==null) ? (data[0].forecastQty==='' || data[0].forecastQty==null) ?"No months in this period contain both forecast and actual consumption":"No Actual Data": data[0].actualQty>= 0? (isNaN(data[0].errorPerc) || data[0].errorPerc===''||data[0].errorPerc==null) ? '' : this.PercentageFormatter(data[0].errorPerc*100):"No Actual Data"}</td>)
                                                        })}
                                                        <td className="sticky-col first-col clone hoverTd" align="left">{countError>0?this.PercentageFormatter((totalError / countError)*100):0}</td>
                                                </tr>
                                                {/* Actual */}
                                                <tr className="hoverTd">
                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                        <td className="sticky-col first-col clone hoverTd" align="left"><b>{this.state.consumptionAdjForStockOutId?"  Adjusted Actual":"   Actual"}</b></td>
                                                        {this.state.monthArray.map((item1, count) => {
                                                            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                            totalActual += (isNaN(data[0].actualQty) || data[0].actualQty==='' || data[0].actualQty==null) ? 0 : Number(data[0].actualQty);
                                                            countActual += (isNaN(data[0].actualQty) || data[0].actualQty==='' || data[0].actualQty==null) ? 0 : 1;
                                                            return (<td><NumberFormat displayType={'text'} thousandSeparator={true} /> {(isNaN(data[0].actualQty) || data[0].actualQty==='' || data[0].actualQty==null) ? '' :(Number(data[0].actualQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                        })}
                                                        <td className="sticky-col first-col clone hoverTd" align="left">{countActual>0?(Number(totalActual / countActual).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0}</td>
                                                </tr>
                                                {/* Forecast */}    
                                                <tr className="hoverTd">
                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                        <td className="sticky-col first-col clone hoverTd" align="left"><b>Forecast</b></td>
                                                        {this.state.monthArray.map((item1, count) => {
                                                            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                            totalForcaste += (isNaN(data[0].forecastQty) || data[0].forecastQty===''|| data[0].forecastQty==null) ? 0 : Number(data[0].forecastQty);
                                                            countForcaste += (isNaN(data[0].forecastQty) || data[0].forecastQty===''|| data[0].forecastQty==null) ? 0 : 1;
                                                            return (<td><NumberFormat displayType={'text'} thousandSeparator={true} /> {(isNaN(data[0].forecastQty) || data[0].forecastQty===''|| data[0].forecastQty==null) ? '' : (Number(data[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                        })}
                                                        <td className="sticky-col first-col clone hoverTd" align="left">{countForcaste>0?(Number(totalForcaste / countForcaste).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):0}</td>
                                                </tr>     
                                                {/* Difference */}        
                                                <tr className="hoverTd">
                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                        <td className="sticky-col first-col clone hoverTd" align="left"><b>Difference</b></td>
                                                        {this.state.monthArray.map((item1, count) => {
                                                            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                            return (<td style={{ color: ((isNaN(data[0].actualQty) ? 0 : data[0].actualQty) - (isNaN(data[0].forecastQty) ? 0 : data[0].forecastQty)) < 0 ? 'red' : 'black' }}><NumberFormat displayType={'text'} thousandSeparator={true} />{(Number((isNaN(data[0].actualQty) ? 0 : data[0].actualQty) - (isNaN(data[0].forecastQty) ? 0 : data[0].forecastQty)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                        })}
                                                        <td className="sticky-col first-col clone hoverTd" align="left" style={{ color: ((totalActual / countActual) - (totalForcaste / countForcaste)) < 0 ? 'red' : 'black' }} >{(Number((totalActual / countActual) - (totalForcaste / countForcaste)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
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