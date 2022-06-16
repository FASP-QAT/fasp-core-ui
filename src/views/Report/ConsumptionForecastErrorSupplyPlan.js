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
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP, TITLE_FONT } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
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
            consumptionData: [],
            equivalencyUnitList: [],
            programEquivalencyUnitList: [],
            dataList: [],
            consumptionAdjForStockOutId: 0,
            show: false,
            loading: true,
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
            show: false
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            this.filterVersion();
            this.filterRegion();
        })
    }

    componentDidMount() {
        this.getPrograms();
    }

    getPrograms = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    console.log(JSON.stringify(response.data))
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
                        this.filterVersion();
                        this.filterRegion();
                    })
                } else {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
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
                        versions: [],
                        planningUnits: [],
                        forecastingUnits: [],
                        show: false
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
                        show: false
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {
                this.setState({
                    versions: [],
                    planningUnits: [],
                    planningUnitValues: [],
                    show: false
                })
                this.fetchData();
            }
        } else {
            this.setState({
                versions: [],
                planningUnits: [],
                forecastingUnits: [],
                show: false
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
                            this.getPlanningUnitAndForcastingUnit();
                        })
                    } else {
                        this.setState({
                            versions: versionList,
                            versionId: versionList[0].versionId
                        }, () => {
                            this.getPlanningUnitAndForcastingUnit();
                        })
                    }
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: versionList[0].versionId
                    }, () => {
                        this.getPlanningUnitAndForcastingUnit();
                    })
                }
            }.bind(this);
        }.bind(this)
    }

    filterRegion = () => {
        let programId = this.state.programId;
        if (programId != 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        regions: [],
                        planningUnits: [],
                        forecastingUnits: [],
                        show: false
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
                        show: false
                    }, () => { this.consolidatedRegionList(programId) })
                }
            } else {
                this.setState({
                    regions: [],
                    planningUnits: [],
                    planningUnitValues: [],
                    show: false
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
                if (regionList.length == 0) {
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].userId == userId && myResult[i].programId == programId) {
                            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                            var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                            var programData = databytes.toString(CryptoJS.enc.Utf8)
                            var region = JSON.parse(programData).regionList
                            regionList.concat(region)
                        }
                    }
                }
                this.setState({
                    regions: regionList,
                }, () => {
                    this.getPlanningUnitAndForcastingUnit();
                })
            }.bind(this);
        }.bind(this)
    }

    setPlanningUnit(e) {
        var planningUnitId = document.getElementById("planningUnitId");
        var selectedText = planningUnitId.options[planningUnitId.selectedIndex].text;
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: selectedText,
            show: false
        }, () => {
            this.fetchData();
        })
    }

    setYaxisEquUnitId(e) {
        var equivalencyUnitId = document.getElementById("equivelencyUnitDiv");
        var selectedText = equivalencyUnitId.options[equivalencyUnitId.selectedIndex].text;
        this.setState({
            equivalencyUnitId: e.target.value,
            equivalencyUnitLabel: selectedText,
            show: false
        }, () => {
            this.fetchData();
        })
    }

    getPlanningUnitAndForcastingUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: [],
            forecastingUnits: [],
            show: false
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
                })
            } else {
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
                            console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    proList[i] = myResult[i]
                                }
                            }
                            var lang = this.state.lang;
                            var forcastingUnitList = proList.map(c => c.forecastingUnit);
                            const ids = forcastingUnitList.map(o => o.id);
                            const forecastingUnitList1 = forcastingUnitList.filter(({ id }, index) => !ids.includes(id, index + 1));
                            console.log("CheckPU------------------>2", forecastingUnitList1);
                            // var planningUnitList = proList.map(c => c.planningUnit);

                            this.setState({
                                planningUnits: proList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), message: '',

                                forecastingUnits: forecastingUnitList1.sort(function (a, b) {
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
                    // AuthenticationService.setupAxiosInterceptors();
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        console.log('**JSON.stringify(response.data)' + JSON.stringify(response.data))
                        var listArray = response.data;
                        var forcastingUnitList = listArray.map(c => c.forecastingUnit);
                        forcastingUnitList.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        console.log("CheckPU------------------>2", forcastingUnitList);
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray,
                            forecastingUnits: forcastingUnitList,
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
            show: false
        }, () => {
            // if (this.state.matricsList.length != 0) {
            localStorage.setItem("sesVersionIdReport", this.state.versionId);
            this.fetchData();
            // } else {
            // this.getPlanningUnit();
            // }
        })
    }

    setRegionVal(event) {
        console.log('***', event)
        var regionIds = event
        regionIds = regionIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        });

        this.setState({
            regionValues: regionIds.map(ele => ele),
            regionLabels: regionIds.map(ele => ele.label),
            regionListFiltered: event,
        }, () => {
            this.fetchData()
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
            forecastingUnitLabel: selectedText
        }, () => {
            // this.filterPlanningUnit()
            // if (this.state.viewById == 2 && forecastingUnitId) {
            //     this.showData();
            // }
            console.log("calling fetch")
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
        this.setState({ rangeValue: value }, () => {
            // this.fetchData();
        })
    }

    yaxisEquUnitCheckbox(event) {

        var falg = event.target.checked ? 1 : 0
        if (falg) {
            this.setState({
                // viewById : 3
            }, () => {
                document.getElementById("equivelencyUnitDiv").style.display = "block";
                this.getEquivalencyUnitData();
            })
        } else {
            document.getElementById("equivelencyUnitDiv").style.display = "none";
        }
    }

    consumptionStockOutCheckbox(event) {
        var falg = event.target.checked ? 1 : 0
        if (falg) {
            this.fetchData();
        }
    }

    getEquivalencyUnitData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let planningUnitId = -1;
        let forecastingUnitId = -1;
        planningUnitId = document.getElementById("planningUnitId").value;
        forecastingUnitId = document.getElementById("forecastingUnitId").value;
        this.setState({
        }, () => {
            // if (programId > 0 && versionId != 0) {
            if (versionId.includes('Local') || !isSiteOnline()) {
                // if (versionId.includes('Local')) {
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
                        console.log("Result-->", myResult);
                        console.log("forecastingUnitId-->", forecastingUnitId)
                        console.log("planningUnitId--->", planningUnitId);
                        var filteredEQUnit = [];
                        if (forecastingUnitId != -1) {
                            filteredEQUnit = myResult.filter(c => c.forecastingUnit.id == forecastingUnitId && c.active == true);
                            console.log("filteredEQUnit in forecastingUnitId ---Result-->", filteredEQUnit);
                        } else if (planningUnitId != -1) {
                            var planningList = this.state.planningUnits;
                            console.log("planningList---Result-->", planningList);
                            let filteredPlanningUnit = planningList.filter(c => c.planningUnit.id == planningUnitId && c.active == true)
                            console.log("filteredPlanningUnit---Result-->", filteredPlanningUnit[0]);
                            console.log("filteredPlanningUnit.forecastingUnit.id---Result-->", filteredPlanningUnit[0].forecastingUnit.id);
                            filteredEQUnit = myResult.filter(c => c.forecastingUnit.id == filteredPlanningUnit[0].forecastingUnit.id)
                            console.log("filteredEQUnit in Planning ---Result-->", filteredEQUnit);
                        }

                        var filteredEquList = [];
                        if (filteredEQUnit != '') {
                            for (var i = 0; i < filteredEQUnit.length; i++) {
                                if (filteredEQUnit[i].program != null) {
                                    if (filteredEQUnit[i].program.id == programId && filteredEQUnit[i].active == true) {
                                        filteredEquList.push(filteredEQUnit[i]);
                                    }
                                } else {
                                    filteredEquList.push(filteredEQUnit[i]);
                                }
                            }
                            if (filteredEquList.length == 0) {
                                document.getElementById("equivelencyUnitDiv").style.display = "none";
                                console.log("filteredEquList---Result-->", filteredEquList);
                                console.log("No EquivalencyUnitData")
                                this.setState({ message: "No EquivalencyUnitData Available", equivalencyUnitList: [] });
                            }
                        } else {

                            document.getElementById("equivelencyUnitDiv").style.display = "none";
                            this.setState({ message: "No EquivalencyUnitData Available for the selected forcecastingUnit ", equivalencyUnitList: [] });
                            console.log("No FU associated");
                        }
                        console.log("filteredEQUnit---Result-->", filteredEQUnit);
                        let EquiUnitList = [];
                        if (filteredEquList.length > 0) {
                            EquiUnitList = filteredEquList.map(c => c.equivalencyUnit);
                            console.log("EquiUnitList", EquiUnitList);
                        }

                        var lang = this.state.lang;
                        this.setState({
                            equivalencyUnitList: EquiUnitList.sort(function (a, b) {
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
            }
            else {//api call
                if (forecastingUnitId == -1 && planningUnitId != -1) {
                    var planningList = this.state.planningUnits;
                    let filteredPlanningUnit = planningList.filter(c => c.planningUnit.id == planningUnitId && c.active == true)
                    forecastingUnitId = filteredPlanningUnit[0].forecastingUnit.id;
                }

                EquivalancyUnitService.getEquivalencyUnitMappingForForecastingUnit(forecastingUnitId, programId).then(response => {
                    console.log("response.status == 200*******", response.status);
                    if (response.status == 200) {
                        console.log("EQ1------->", response.data);
                        var listArray = response.data;
                        if (listArray.length == 0) {
                            document.getElementById("equivelencyUnitDiv").style.display = "none";
                            this.setState({ message: 'No EquivalencyUnitData Available for the selected forcecastingUnit' });
                        } else {

                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                var itemLabelB = getLabelText(b.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });
                            var filteredEquList = []
                            // for (var i = 0; i < listArray.length; i++) {
                            //     if (listArray[i].program != null) {
                            //         if (listArray[i].program.id == programId && listArray[i].active == true) {
                            //             filteredEquList.push(listArray[i]);
                            //         }
                            //     } else {
                            //         filteredEquList.push(listArray[i]);
                            //     }
                            // }
                            console.log("EquivalencyUnitList---------->1", filteredEquList);
                            // var filteredEQUnit = [];
                            // if (forecastingUnitId != -1) {
                            //     filteredEQUnit = filteredEquList.filter(c => c.forecastingUnit.id == forecastingUnitId);
                            // } else if (planningUnitId != -1) {
                            //     var planningList = this.state.planningUnits;
                            //     console.log("planningList---Result-->", planningList);
                            //     let filteredPlanningUnit = planningList.filter(c => c.planningUnit.id == planningUnitId)
                            //     console.log("filteredPlanningUnit---Result-->", filteredPlanningUnit);
                            //     filteredEQUnit = filteredEquList.filter(c => c.forecastingUnit.id == filteredPlanningUnit.forecastingUnit.id);
                            //     console.log("filteredEQUnit---Result-->", filteredEQUnit);
                            // }

                            // let EquiUnitList = filteredEQUnit.map(c => c.equivalencyUnit);
                            // console.log("EquiUnitList", EquiUnitList);

                            var lang = this.state.lang;
                            this.setState({
                                // equivalencyUnitList: EquiUnitList.sort(function (a, b) {
                                //     a = getLabelText(a.label, lang).toLowerCase();
                                //     b = getLabelText(b.label, lang).toLowerCase();
                                //     return a < b ? -1 : a > b ? 1 : 0;
                                // }),
                                equivalencyUnitList: listArray,
                                // programEquivalencyUnitList: filteredEquList,
                            }, () => {
                                this.fetchData();
                            })
                        }
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
                                    message: 'static.unkownError',
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
            // }
        })
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    fetchData() {
        console.log("fetchData-------------");
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let viewById = this.state.viewById
        let consumptionAdjForStockOutId = document.getElementById("consumptionAdjusted").value;
        console.log("viewById----", viewById)
        let regionIds = this.state.regionValues.map(ele => (ele.value).toString())
        let regionList = this.state.regions;
        var dataList = [];
        let equivalencyUnitId = -1;
        let planningUnitId = -1;
        let forecastingUnitId = -1;
        equivalencyUnitId = document.getElementById("yaxisEquUnit").value;
        planningUnitId = document.getElementById("planningUnitId").value
        forecastingUnitId = document.getElementById("forecastingUnitId").value;
        var planningUnitIdList = [];
        console.log("planningUnitId----->", planningUnitId);
        console.log("forecastingUnitId----->", forecastingUnitId);

        if (programId > 0 && (planningUnitId > 0 || forecastingUnitId > 0) && versionId != 0) {
            console.log("Inside If")
            if (versionId.includes('Local')) {
                this.setState({ loading: true })
                var db1;
                getDatabase();
                console.log("Inside If IF", forecastingUnitId)
                if (forecastingUnitId > 0) {
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
                            console.log("Inside If IF $$$$$$$$$$ myResult", myResult)

                            // var programId = (document.getElementById("programId").value).split("_")[0];
                            var proList = []
                            console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    proList[i] = myResult[i]
                                }
                            }
                            var proListDataFilter = proList.filter(c => c.forecastingUnit.id == forecastingUnitId);
                            console.log("proListDataFilter", proListDataFilter);
                            planningUnitIdList = proListDataFilter.map(c => c.planningUnit.id)
                            console.log("planningUnitIdList", planningUnitIdList);

                            //****************************************************************************************************************** */
                            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                            openRequest.onerror = function (event) {
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
                                }.bind(this);
                                programRequest.onsuccess = function (event) {
                                    var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                                    var consumptionList = [];
                                    for (var con = 0; con < planningUnitIdList.length; con++) {
                                        var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitIdList[con]);
                                        var programJson = {};
                                        if (planningUnitDataFilter.length > 0) {
                                            var planningUnitData = planningUnitDataFilter[0]
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
                                        consumptionList = (programJson.consumptionList);
                                    }
                                    console.log("consumptionList---", consumptionList);
                                    var monthArray = [];
                                    var curDate = startDate;
                                    for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
                                        curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                                        var noOfDays = moment(curDate, "YYYY-MM").daysInMonth();
                                        monthArray.push({ date: curDate, noOfDays: noOfDays })
                                        // var totalConsumptionQtyOutOfStockData = "";
                                        var totalActualQty = "";
                                        var totalForecastQty = "";
                                        var errorPerc = "";
                                        var regionData = [];

                                        for (let k = 0; k < regionList.length; k++) {
                                            var consumptionactualQty = "";
                                            var consumptionforecastQty = "";
                                            var actualQty = "";
                                            var forecastQty = "";
                                            var daysOfStockOut = "";
                                            var consumptionQtyOutOfStockData = "";
                                            consumptionforecastQty = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag == false && c.active == true && c.region.id == regionList[k].regionId);
                                            if (consumptionforecastQty.length > 0) {
                                                for (var con = 0; con < consumptionforecastQty.length; con++) {
                                                    forecastQty += consumptionforecastQty[con].consumptionQty * consumptionforecastQty[con].multiplier;
                                                }
                                            } else {
                                                forecastQty = "";
                                            }
                                            consumptionactualQty = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag == true && c.active == true && c.region.id == regionList[k].regionId);
                                            if (consumptionactualQty.length > 0) {
                                                for (var con = 0; con < consumptionactualQty.length; con++) {
                                                    actualQty += consumptionactualQty[con].consumptionQty * consumptionactualQty[con].multiplier;
                                                    daysOfStockOut += consumptionactualQty[con].dayOfStockOut;
                                                    // consumptionQtyOutOfStockData += consumptionactualQty[con].consumptionQty / (noOfDays - consumptionactualQty[con].dayOfStockOut) * noOfDays;
                                                }
                                            } else {
                                                actualQty = "";
                                                daysOfStockOut = "";
                                                // consumptionQtyOutOfStockData = "";
                                            }
                                            totalActualQty += actualQty;
                                            totalForecastQty += forecastQty;
                                            // totalConsumptionQtyOutOfStockData += consumptionQtyOutOfStockData;
                                            var region = { id: regionList[k].regionId, lable: regionList[k].label };
                                            regionData.push({
                                                region: region,
                                                actualQty: actualQty,
                                                forecastQty: forecastQty,
                                                daysOfStockOut: daysOfStockOut
                                                // consumptionQtyOutOfStockData: consumptionQtyOutOfStockData
                                            });
                                        }
                                        var absEbar = (Math.abs(totalForecastQty - totalActualQty)) / totalActualQty;
                                        errorPerc = absEbar * 100;
                                        dataList.push({
                                            month: moment(curDate).format("YYYY-MM"),
                                            regionData: regionData,
                                            actualQty: totalActualQty,
                                            forecastQty: totalForecastQty,
                                            errorPerc: errorPerc,
                                            noOfDays: noOfDays
                                            // consumptionAdjForStockOutId: consumptionAdjForStockOutId,
                                            // consumptionQtyStockedOut: totalConsumptionQtyOutOfStockData
                                        });
                                    }
                                    console.log("Complete dataList----------------------", dataList);
                                    this.setState({
                                        monthArray: monthArray,
                                        dataList: dataList,
                                        consumptionAdjForStockOutId: consumptionAdjForStockOutId
                                    })
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                } else {
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
                            var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitId);
                            var programJson = {};
                            if (planningUnitDataFilter.length > 0) {
                                var planningUnitData = planningUnitDataFilter[0]
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
                            var consumptionList = (programJson.consumptionList);
                            var monthArray = [];
                            var curDate = startDate;
                            for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
                                curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                                var noOfDays = moment(curDate, "YYYY-MM").daysInMonth();
                                monthArray.push({ date: curDate, noOfDays: noOfDays })
                                // var totalConsumptionQtyOutOfStockData = "";
                                var totalActualQty = "";
                                var totalForecastQty = "";
                                var errorPerc = "";

                                var regionData = [];
                                for (let k = 0; k < regionList.length; k++) {
                                    var consumptionactualQty = "";
                                    var consumptionforecastQty = "";
                                    var actualQty = "";
                                    var forecastQty = "";
                                    var daysOfStockOut = "";
                                    var consumptionQtyOutOfStockData = "";
                                    consumptionforecastQty = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag == false && c.active == true && c.region.id == regionList[k].regionId);
                                    if (consumptionforecastQty.length > 0) {
                                        for (var con = 0; con < consumptionforecastQty.length; con++) {
                                            forecastQty += consumptionforecastQty[con].consumptionQty;
                                        }
                                    } else {
                                        forecastQty = "";
                                    }
                                    consumptionactualQty = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.actualFlag == true && c.active == true && c.region.id == regionList[k].regionId);
                                    if (consumptionactualQty.length > 0) {
                                        for (var con = 0; con < consumptionactualQty.length; con++) {
                                            actualQty += consumptionactualQty[con].consumptionQty;
                                            daysOfStockOut += consumptionactualQty[con].dayOfStockOut;
                                            // consumptionQtyOutOfStockData += consumptionactualQty[con].consumptionQty / (noOfDays - consumptionactualQty[con].dayOfStockOut) * noOfDays;
                                        }
                                    } else {
                                        actualQty = "";
                                        daysOfStockOut = "";
                                        // consumptionQtyOutOfStockData = "";
                                    }
                                    totalActualQty += actualQty;
                                    totalForecastQty += forecastQty;
                                    // totalConsumptionQtyOutOfStockData += consumptionQtyOutOfStockData;
                                    var region = { id: regionList[k].regionId, lable: regionList[k].label };
                                    regionData.push({
                                        region: region,
                                        actualQty: actualQty,
                                        forecastQty: forecastQty,
                                        daysOfStockOut: daysOfStockOut
                                        // consumptionQtyOutOfStockData: consumptionQtyOutOfStockData
                                    });
                                }
                                var absEbar = (Math.abs(totalForecastQty - totalActualQty)) / totalActualQty;
                                errorPerc = absEbar * 100;
                                dataList.push({
                                    month: moment(curDate).format("YYYY-MM"),
                                    regionData: regionData,
                                    actualQty: totalActualQty,
                                    forecastQty: totalForecastQty,
                                    errorPerc: errorPerc,
                                    noOfDays: noOfDays
                                    // consumptionAdjForStockOutId: consumptionAdjForStockOutId,
                                    // consumptionQtyStockedOut: totalConsumptionQtyOutOfStockData
                                });
                            }
                            console.log("Complete dataList----------------------", dataList);
                            this.setState({
                                monthArray: monthArray,
                                dataList: dataList,
                                consumptionAdjForStockOutId: consumptionAdjForStockOutId
                            })
                        }.bind(this);
                    }.bind(this);
                }
            } else {
                this.setState({
                    message: '',
                    loading: true
                })
                console.log("viewBy--->", viewById);
                console.log("equivalencyUnitId--->", equivalencyUnitId);

                var inputjson = {
                    programId: programId,
                    versionId: versionId,
                    viewBy: equivalencyUnitId != '' ? 3 : viewById,
                    unitId: equivalencyUnitId != '' ? equivalencyUnitId : viewById == 1 ? planningUnitId : forecastingUnitId,
                    startDate: startDate,
                    stopDate: stopDate,
                    equivalencyUnitId: equivalencyUnitId,
                    regionIds: regionIds
                }
                console.log("JSON INPUT---------->", inputjson);
                ReportService.forecastError(inputjson)
                    .then(response => {
                        console.log("RESP---------->", response.data);
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
                            loading: false
                        },
                            () => {

                            })
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

        } else if (programId == -1) {//validation message            
            this.setState({ message: i18n.t('static.common.selectProgram'), monthArrayList: [], datasetList: [], versions: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], programId: '', versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });

        } else if (versionId == -1) {
            this.setState({ message: i18n.t('static.program.validversion'), monthArrayList: [], datasetList: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });

        } else if (viewById == 1 && planningUnitId == -1) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), monthArrayList: [], datasetList: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });

        } else if (viewById == 2 && forecastingUnitId == -1) {
            this.setState({ message: i18n.t('static.planningunit.forcastingunittext'), monthArrayList: [], datasetList: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });
        }
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV() {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        // csvRow.push('"' + ('Report View' + ' : ' + document.getElementById("viewById").value == 1 ? 'PlanningUnit' : 'ForecastingUnit').replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        if (document.getElementById("viewById").value == 1) {
            csvRow.push('"' + ('Planning Unit' + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
        } else {
            csvRow.push('"' + ('Forecasting unit' + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
        }
        this.state.regions.map(ele =>
            csvRow.push('"' + ('Region' + ' : ' + getLabelText(ele.label, this.state.lang)).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + ('Show consumption adjusted for stock out' + ' : ' + document.getElementById("consumptionAdjusted")).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ' : ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('')
        csvRow.push('')

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
        datacsv.push([(('Error*').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalError += Number((data[0].errorPerc==null || data[0].errorPerc=='infinity')?'':parseFloat(data[0].errorPerc));
            countError += 1;
            datacsv.push(Number(data[0].errorPerc==null || data[0].errorPerc=='infinity')?'':parseFloat(data[0].errorPerc).toFixed(2))
        })
        datacsv.push(Number(totalError / countError).toFixed(2));
        // datacsv.push(this.state.showInPlanningUnit ? Math.round(totalPU) : Math.round(total));
        // datacsv.push("100 %");
        A.push(this.addDoubleQuoteToRowContent(datacsv))

        datacsv = [];
        datacsv.push([(('Forcaste').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            totalForcaste += Number(data[0].forecastQty);
            countForcaste += 1;
            datacsv.push(Number(data[0].forecastQty).toFixed(2))
        })
        datacsv.push(Number(totalForcaste / countForcaste).toFixed(2));
        A.push(this.addDoubleQuoteToRowContent(datacsv))

        this.state.regions.map(r => {
            var datacsv = [];
            var totalRegion = 0;
            var totalRegionCount = 0;
            datacsv.push((getLabelText(r.label, this.state.lang)).replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                    totalRegion += Number(data[0].forecastQty);
                    totalRegionCount += 1;
                    datacsv.push(Number(data[0].forecastQty).toFixed(2))
                })
            }
            datacsv.push(Number(totalRegion / totalRegionCount).toFixed(2));
            A.push(this.addDoubleQuoteToRowContent(datacsv))
        });

        datacsv = [];
        datacsv.push([(('Actual').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            var totalDaysOfStockOut = 0;
            this.state.regions.map(r => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                totalDaysOfStockOut += datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0;
            })
            // totalActual += Number(data[0].actualQty);
            // countActual += 1;
            // datacsv.push((data[0].actualQty))
            totalActual += Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : data[0].actualQty);
            countActual += 1;
            datacsv.push((Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : (data[0].actualQty)).toFixed(2)))
        })
        datacsv.push(Number(totalActual / countActual).toFixed(2));
        A.push(this.addDoubleQuoteToRowContent(datacsv))

        this.state.regions.map(r => {
            var datacsv = [];
            var totalRegion = 0;
            var totalRegionCount = 0;
            datacsv.push((getLabelText(r.label, this.state.lang)).replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                    // totalRegion += Number(data[0].actualQty);
                    // totalRegionCount += 1;
                    // datacsv.push(data[0].actualQty)
                    totalRegion += Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - (data[0].daysOfStockOut != undefined ? data[0].daysOfStockOut : 0)) * item1.noOfDays) : data[0].actualQty);
                    totalRegionCount += 1;
                    datacsv.push(Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - (data[0].daysOfStockOut != undefined ? data[0].daysOfStockOut : 0)) * item1.noOfDays) : data[0].actualQty).toFixed(2))
                })
            }
            datacsv.push(Number(totalRegion / totalRegionCount).toFixed(2));
            A.push(this.addDoubleQuoteToRowContent(datacsv))
        });
        datacsv = [];
        datacsv.push([(('Difference').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        this.state.monthArray.map((item1, count) => {
            var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
            var totalDaysOfStockOut = 0;
            this.state.regions.map(r => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                totalDaysOfStockOut += datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0;
            })
            totalDifference += Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : data[0].actualQty) - Number(data[0].forecastQty);
            countDifference += 1;
            datacsv.push((Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : data[0].actualQty) - Number(data[0].forecastQty)).toFixed(2))
        })
        datacsv.push(Number(totalDifference / countDifference).toFixed(2));
        A.push(this.addDoubleQuoteToRowContent(datacsv))

        this.state.regions.map(r => {
            var datacsv = [];
            var totalRegion = 0;
            var totalRegionCount = 0;
            datacsv.push((getLabelText(r.label, this.state.lang)).replaceAll(' ', '%20'))
            {
                this.state.monthArray.map((item1, count) => {
                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                    totalRegion += Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - (data[0].daysOfStockOut != undefined ? data[0].daysOfStockOut : 0)) * item1.noOfDays) : data[0].actualQty) - Number(data[0].forecastQty);
                    totalRegionCount += 1;
                    datacsv.push(Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - (data[0].daysOfStockOut != undefined ? data[0].daysOfStockOut : 0)) * item1.noOfDays) : data[0].actualQty) - Number(data[0].forecastQty))
                })
            }
            datacsv.push(Number(totalRegion / totalRegionCount).toFixed(2));
            A.push(this.addDoubleQuoteToRowContent(datacsv))
        });

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
                doc.text(document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.monthlyForecast'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    // doc.text(i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ' : ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text, doc.internal.pageSize.width / 8, 190, {
                    //     align: 'left'
                    // })
                    // doc.text('Reporting View' + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 210, {
                    //     align: 'left'
                    // })
                    if (document.getElementById("viewById").value == 1) {
                        doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 230, {
                            align: 'left'
                        })
                    }
                    else {
                        doc.text(i18n.t('static.forecastingunit.forecastingunit') + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 230, {
                            align: 'left'
                        })
                    }
                    // let startY1 = 0;

                    var regionText = doc.splitTextToSize(('Region' + ' : ' + this.state.regionLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 250, regionText)
                    doc.text('Show consumption adjusted for stock out' + ' : Yes', doc.internal.pageSize.width / 8, 270, {
                        align: 'left'
                    })
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

        doc.addImage(canvasImg, 'png', 50, 280, 750, 260, 'CANVAS');

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

        A.push('Error')
        {
            var totalError = 0;
            var countError = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalError += Number(datavalue[0].errorPerc);
                countError += 1;
                A.push(((datavalue[0].errorPerc==null || datavalue[0].errorPerc=='infinity')?'':Number(parseFloat(datavalue[0].errorPerc)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push((Number(totalError / countError).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
        }
        data.push(A);
        A = [];

        A.push('Forecast')
        {
            var totalForecast = 0;
            var countForecast = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                totalForecast += Number(datavalue[0].forecastQty);
                countForecast += 1;
                A.push((Number(datavalue[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push((Number(totalForecast / countForecast).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
        }
        data.push(A);
        A = [];
        {
            this.state.regions.map(r => {
                var totalRegion = 0;
                var totalRegionCount = 0;
                A.push(getLabelText(r.label, this.state.lang))
                {
                    this.state.monthArray.map((item1, count) => {
                        var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                        totalRegion += Number(datavalue[0].forecastQty);
                        totalRegionCount += 1;
                        A.push((Number(datavalue[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                    })
                }
                A.push((Number(totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
        }
        data.push(A);
        A = [];

        A.push('Actual')
        {
            var totalActal = 0;
            var countActal = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                var totalDaysOfStockOut = 0;
                this.state.regions.map(r => {
                    var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                    totalDaysOfStockOut += datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0;
                })
                totalActal += Number(this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : datavalue[0].actualQty);
                countActal += 1;
                A.push((Number(this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : datavalue[0].actualQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push((Number(totalActal / countActal).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
        }
        data.push(A);
        A = [];
        {
            this.state.regions.map(r => {
                var totalRegion = 0;
                var totalRegionCount = 0;
                A.push(getLabelText(r.label, this.state.lang))
                {
                    this.state.monthArray.map((item1, count) => {
                        var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                        totalRegion += Number(this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty / (item1.noOfDays - (datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0)) * item1.noOfDays) : datavalue[0].actualQty);;
                        totalRegionCount += 1;
                        A.push((Number(this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty /
                            (item1.noOfDays - (datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0))
                            * item1.noOfDays) : datavalue[0].actualQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));
                    })
                }
                A.push((Number(totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
        }
        data.push(A);
        A = [];

        A.push('Difference')
        {
            var totalDiff = 0;
            var countDiff = 0;
            this.state.monthArray.map((item1, count) => {
                var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                var totalDaysOfStockOut = 0;
                this.state.regions.map(r => {
                    var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                    totalDaysOfStockOut += datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0;
                })
                totalDiff += Number(this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : datavalue[0].actualQty) - Number(datavalue[0].forecastQty);
                countDiff += 1;
                A.push((Number(this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty /
                    (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : (datavalue[0].actualQty)
                - datavalue[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
            A.push((Number(totalDiff / countDiff).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
        }
        data.push(A);
        A = [];
        {
            this.state.regions.map(r => {
                var totalRegion = 0;
                var totalRegionCount = 0;
                A.push(getLabelText(r.label, this.state.lang))
                {
                    this.state.monthArray.map((item1, count) => {
                        var datavalue = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                        totalRegion += Number(this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty / (item1.noOfDays - (datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0)) * item1.noOfDays) : datavalue[0].actualQty) - Number(datavalue[0].forecastQty);
                        totalRegionCount += 1;
                        A.push((Number((this.state.consumptionAdjForStockOutId ? (datavalue[0].actualQty / (item1.noOfDays - (datavalue[0].daysOfStockOut != undefined ? datavalue[0].daysOfStockOut : 0)) * item1.noOfDays) : datavalue[0].actualQty) - Number(datavalue[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")))
                    })
                }
                A.push((Number(totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
            })
        }
        data.push(A);

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: height,
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
            ]

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
        let totalActal = 0;
        let totalForcaste = 0;
        let countError = 0;
        let countActal = 0;
        let countForcaste = 0;
        let totalDaysOfStockOut = 0;

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
        console.log("planningUnits--------------->", planningUnits)
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
                        {getLabelText(item.label, this.state.lang)}
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
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);

        const { regions } = this.state;
        let regionList = regions.length > 0
            && regions.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.regionId })

            }, this);



        var chartOptions = {
            title: {
                display: true,
                // text: (this.state.yaxisEquUnit > 0 ? this.state.equivalencyUnitLabel : 'Monthly Forecast ' + (this.state.viewById == 1 ? '(' + i18n.t('static.product.product') + ')' : '(' + i18n.t('static.forecastingunit.forecastingunit') + ')'))
                text: 'Monthly Forecast - ' + (this.state.programs.filter(c => c.programId == this.state.programId).length > 0 ? this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode : '') + ' - ' + (this.state.versions.filter(c => c.versionId == this.state.versionId).length > 0 ? this.state.versions.filter(c => c.versionId == this.state.versionId)[0].versionId : '')
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
                        stacked: true,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black'
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
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    }
                },
                // callbacks: {
                //     label: function (tooltipItems, data) {
                //         if (tooltipItems.datasetIndex == 0) {
                //             var details = this.state.expiredStockArr[tooltipItems.index].details;
                //             var infoToShow = [];
                //             details.map(c => {
                //                 infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                //             });
                //             return (infoToShow.join(' | '));
                //         } else {
                //             return (tooltipItems.yLabel.toLocaleString());
                //         }
                //     }.bind(this)
                // },
                enabled: false,
                intersect: false,
                custom: CustomTooltips
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
        if (elInstance != undefined) {
            var colourCount = 0;
            datasetListForGraph.push({
                label: 'Error',
                data: this.state.dataList.map(item => (item.errorPerc !== "" ? item.errorPerc : null)),
                type: 'line',
                stack: 3,
                yAxisID: 'A',
                backgroundColor: (this.state.yaxisEquUnit > 0 ? '#002F6C' : 'transparent'),
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

            var consumptionActualValue = [];
            var consumptionForecastValue = [];
            for (var i = 0; i < elInstance.length; i++) {
                var value = elInstance[i];
                if (value) {
                    consumptionActualValue.push(value.actualQty)
                    consumptionForecastValue.push(value.forecastQty)
                } else {
                    consumptionActualValue.push("");
                    consumptionForecastValue.push("");
                }
            }
            datasetListForGraph.push({
                label: "Forecast",
                data: consumptionForecastValue,
                stack: 2,
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
                stack: 1,
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
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon pb-2">
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
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setProgramId(e) }}
                                                            value={this.state.programId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programs.length > 0
                                                                && programs.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.programId}>
                                                                            {getLabelText(item.label, this.state.lang)}
                                                                        </option>
                                                                    )
                                                                }, this)}
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
                                                <Label className="P-absltRadio" htmlFor="appendedInputButton">Show in:</Label>
                                                <FormGroup check inline>
                                                    <Input
                                                        className="form-check-input"
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
                                                        className="form-check-input"
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
                                            </FormGroup>

                                            <FormGroup className="col-md-3" id="forecastingUnitDiv" style={{ display: "none" }}>
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.product.unit1')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="forecastingUnitId"
                                                            id="forecastingUnitId"
                                                            value={this.state.forecastingUnitId}
                                                            onChange={(e) => { this.setForecastingUnit(e); }}
                                                            bsSize="sm"
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


                                            <FormGroup className="col-md-3" id="planningUnitDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
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

                                            <FormGroup className="col-md-3">
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
                                                        Y-axis in equivelency unit?
                                                    </Label>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3" id="equivelencyUnitDiv" style={{ display: "none" }}>
                                                <Label htmlFor="appendedInputButton">Y-axis in equivelency unit</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="yaxisEquUnit"
                                                            id="yaxisEquUnit"
                                                            bsSize="sm"
                                                            value={this.state.yaxisEquUnit}
                                                            onChange={(e) => { this.setYaxisEquUnitId(e); }}
                                                        // onChange={(e) => { this.yAxisChange(e); }}
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            {equivalencyUnitList1}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
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
                                            <b>* The error calculations here are not real - would be WAPE calculation we've been using</b>
                                        </div>
                                    }
                                    <div className="col-md-12">
                                        {/* {this.state.showDetailTable && */}

                                        {/* } */}
                                        {this.state.show && this.state.dataList.length > 0 &&
                                            <div className="table-scroll">
                                                <div className="table-wrap DataEntryTable table-responsive">
                                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                                        <thead>
                                                            <tr>
                                                                <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                <th className="dataentryTdWidth sticky-col first-col clone"></th>
                                                                {this.state.monthArray.map((item, count) => {
                                                                    return (<th>{moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
                                                                })}
                                                                <th className="sticky-col first-col clone">Average</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="hoverTd">
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                <td className="sticky-col first-col clone hoverTd" align="left"><b>Error*</b></td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    totalError += Number(data[0].errorPerc);
                                                                    countError += 1;
                                                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(data[0].errorPerc==null || data[0].errorPerc=='infinity')?'':parseFloat(data[0].errorPerc).toFixed(2)}</td>)

                                                                })}
                                                                <td className="sticky-col first-col clone hoverTd" align="left">{(Number(totalError / countError).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                            </tr>
                                                            <tr className="hoverTd">
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(0)}>
                                                                    {this.state.consumptionUnitShowArr.includes(0) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                </td>
                                                                <td className="sticky-col first-col clone hoverTd" align="left"><b>Forecast</b></td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    totalForcaste += Number(data[0].forecastQty);
                                                                    countForcaste += 1;
                                                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} /> {(Number(data[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)

                                                                })}
                                                                <td className="sticky-col first-col clone hoverTd" align="left">{(Number(totalForcaste / countForcaste).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                            </tr>
                                                            {this.state.regions.map(r => {
                                                                var totalRegion = 0;
                                                                var totalRegionCount = 0;
                                                                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(0) ? "" : "none" }}>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                    <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   " + getLabelText(r.label, this.state.lang)}</td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                        var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                                                                        totalRegion += Number(data[0].forecastQty);
                                                                        totalRegionCount += 1;
                                                                        return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(Number(data[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                    })}
                                                                    <td className="sticky-col first-col clone text-left">{(Number(totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                </tr>)
                                                            })}
                                                            <tr className="hoverTd">
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(1)}>
                                                                    {this.state.consumptionUnitShowArr.includes(1) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                </td>
                                                                <td className="sticky-col first-col clone hoverTd" align="left"><b>Actual</b></td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    // actualQty/(noOfDays - dayOfStockOut) * noOfDays
                                                                    totalActal += Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : data[0].actualQty);
                                                                    countActal += 1;
                                                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - totalDaysOfStockOut) * item1.noOfDays) : (data[0].actualQty)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                })}
                                                                <td className="sticky-col first-col clone hoverTd" align="left">{(Number(totalActal / countActal).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                            </tr>
                                                            {this.state.regions.map(r => {
                                                                var totalRegion = 0;
                                                                var totalRegionCount = 0;
                                                                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(1) ? "" : "none" }}>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                    <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   " + getLabelText(r.label, this.state.lang)}</td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                        var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                                                                        totalRegion += Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - (data[0].daysOfStockOut != undefined ? data[0].daysOfStockOut : 0)) * item1.noOfDays) : data[0].actualQty);
                                                                        totalRegionCount += 1;
                                                                        totalDaysOfStockOut += data[0].daysOfStockOut;
                                                                        return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(Number(this.state.consumptionAdjForStockOutId ? (data[0].actualQty / (item1.noOfDays - (data[0].daysOfStockOut != undefined ? data[0].daysOfStockOut : 0)) * item1.noOfDays) : (data[0].actualQty)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                    })}
                                                                    <td className="sticky-col first-col clone text-left">{(Number(totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                </tr>)
                                                            })}
                                                            <tr className="hoverTd">
                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(2)}>
                                                                    {this.state.consumptionUnitShowArr.includes(2) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                </td>
                                                                <td className="sticky-col first-col clone hoverTd" align="left"><b>Difference</b></td>
                                                                {this.state.monthArray.map((item1, count) => {
                                                                    var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                                                    return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(Number(data[0].actualQty - data[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                })}
                                                                <td className="sticky-col first-col clone hoverTd" align="left">{(Number((totalActal / countActal) - (totalForcaste / countForcaste)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                            </tr>
                                                            {this.state.regions.map(r => {
                                                                var totalRegion = 0;
                                                                var totalRegionCount = 0;
                                                                return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(2) ? "" : "none" }}>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                    <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   " + getLabelText(r.label, this.state.lang)}</td>
                                                                    {this.state.monthArray.map((item1, count) => {
                                                                        var data = this.state.dataList.filter(c => moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.regionData[0].region.id == r.regionId)
                                                                        totalRegion += Number(data[0].actualQty - data[0].forecastQty);
                                                                        totalRegionCount += 1;
                                                                        return (<td><NumberFormat displayType={'text'} thousandSeparator={true} />{(Number(data[0].actualQty - data[0].forecastQty).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>)
                                                                    })}
                                                                    <td className="sticky-col first-col clone text-left">{(Number(totalRegion / totalRegionCount).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                </tr>)
                                                            })}
                                                            {/* </>)
                                                        } 
                                                        )} */}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    {/* </div> */}
                                </Col>
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