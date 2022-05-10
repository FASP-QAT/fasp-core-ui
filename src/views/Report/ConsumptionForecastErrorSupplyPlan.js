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
            consumptionData: [],
            equivalencyUnitList: [],
            programEquivalencyUnitList: [],
            reportConsumptionList: [],
            show: false,
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
            versionId: ''
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
            //   error => {
            //     this.setState({
            //       programs: [], loading: false
            //     }, () => { this.consolidatedProgramList() })
            //     if (error.message === "Network Error") {
            //       this.setState({ loading: false, message: error.message });
            //     } else {
            //       switch (error.response ? error.response.status : "") {
            //         case 500:
            //         case 401:
            //         case 404:
            //         case 406:
            //         case 412:
            //           this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
            //           break;
            //         default:
            //           this.setState({ loading: false, message: 'static.unkownError' });
            //           break;
            //       }
            //     }
            //   }
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
                        forecastingUnits: []
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
                        forecastingUnits: []
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {
                this.setState({
                    versions: [],
                    planningUnits: [],
                    planningUnitValues: []
                })
                // this.fetchData();
            }
        } else {
            this.setState({
                versions: [],
                planningUnits: [],
                forecastingUnits: []
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
                        forecastingUnits: []
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
                        forecastingUnits: []
                    }, () => { this.consolidatedRegionList(programId) })
                }
            } else {
                this.setState({
                    regions: [],
                    planningUnits: [],
                    planningUnitValues: []
                })
                // this.fetchData();
            }
        } else {
            this.setState({
                regions: []
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
                    // this.getPlanningUnitAndForcastingUnit();
                })
            }.bind(this);
        }.bind(this)
    }

    setPlanningUnit(e) {
        var planningUnitId = document.getElementById("planningUnitId");
        var selectedText = planningUnitId.options[planningUnitId.selectedIndex].text;
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: selectedText
        }, () => {
            this.fetchData();
        })
    }

    getPlanningUnitAndForcastingUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: []
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
                                // this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)
                }
                else {
                    // AuthenticationService.setupAxiosInterceptors();

                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        console.log('**' + JSON.stringify(response.data))
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray,
                            message: ''
                        }, () => {
                            // this.fetchData();
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
            versionId: event.target.value
        }, () => {
            if (this.state.matricsList.length != 0) {
                localStorage.setItem("sesVersionIdReport", this.state.versionId);
                // this.fetchData();
            } else {
                // this.getPlanningUnit();
            }
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
            //  this.fetchData()
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
        }, () => {
            if (viewById == 2) {
                document.getElementById("forecastingUnitDiv").style.display = "block";
                document.getElementById("planningUnitDiv").style.display = "none";
                //  this.fetchData();
            } else {
                document.getElementById("planningUnitDiv").style.display = "block";
                document.getElementById("forecastingUnitDiv").style.display = "none";
                //this.fetchData();
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
            // this.fetchData();
        })
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleRangeChange(value, text, listIndex) {
        //
    }

    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            // this.fetchData();
        })
    }

    yaxisEquUnitCheckbox(event) {

        var falg = event.target.checked ? 1 : 0
        if (falg) {
            document.getElementById("equivelencyUnitDiv").style.display = "block";
            this.getEquivalencyUnitData();
        } else {
            document.getElementById("equivelencyUnitDiv").style.display = "none";
        }
    }

    getEquivalencyUnitData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
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
                                if (myResult[i].program == null) {
                                    // if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    filteredEquList.push(myResult[i]);
                                    // }
                                }
                                //  else {
                                //     filteredEquList.push(myResult[i]);
                                // }
                            }
                            console.log("EquivalencyUnitList---------->1", filteredEquList);
                            let fuList = this.state.forecastingUnits;
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
                                // this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)
                } else {//api call
                    EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
                        if (response.status == 200) {
                            console.log("EQ1------->", response.data);
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
                            console.log("EquivalencyUnitList---------->1", filteredEquList);
                            let fuList = this.state.forecastingUnits;
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
                                // this.fetchData();
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
            }
        })
    }

    fetchData() {
        console.log("fetchData-------------");
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        // let planningUnitId = document.getElementById("planningUnitId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let viewById = document.getElementById("viewById").value;
        let yaxisEquUnit = document.getElementById("yaxisEquUnit").value;
        let consumptionAdjForStockOutId = document.getElementById("consumptionAdjusted").value;
        let regionIds = this.state.regionValues.map(ele => (ele.value).toString())
        console.log("regionIds-------------", regionIds);


        let planningUnitId = -1;
        let forecastingUnitId = -1;
        (viewById == 1 ? planningUnitId = document.getElementById("planningUnitId").value : forecastingUnitId = document.getElementById("forecastingUnitId").value);
        if (programId > 0 && planningUnitId > 0 && versionId != 0) {
            console.log("Inside If")
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
                        var consumptionListUnFiltered = (programJson.consumptionList);
                        console.log("consumptionListUnFiltered-------------", consumptionListUnFiltered)
                        console.log("regionIds-------------", regionIds)
                        var consumptionList;
                        if (regionIds != "") {
                            console.log("regionIds !=-------------", regionIds)
                            for (let k = 0; k < regionIds.length; k++) {
                                console.log("Inside if-------------", regionIds[k])
                                consumptionList = consumptionListUnFiltered.filter(c => c.region.id == regionIds[k]);
                            }
                        }
                        console.log("consumptionList-------------", consumptionList)
                        // var dayOfStockOut = consumptionList.dayOfStockOut;
                        var monthArray = [];
                        var curDate = startDate;
                        var reportConsumptionList = [];
                        for (var m = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); m++) {
                            curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                            var noOfDays = moment(curDate, "YYYY-MM").daysInMonth();
                            monthArray.push({ date: curDate, noOfDays: noOfDays })
                            for (var r = 0; r < regionIds.length; r++) {
                                var consumptionDataForMonth = consumptionList.filter(c => c.region.id == regionIds[r].regionId && moment(c.consumptionDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM"))
                                reportConsumptionList.push({
                                    // region:
                                    // month:
                                    // value:
                                    // daysOfStockOut:
                                    // noOfDays:
                                    // consumptionQty:
                                    monthArray: monthArray,
                                    consumptionDataForMonth: consumptionDataForMonth,
                                    dayOfStockOut: consumptionDataForMonth.dayOfStockOut,
                                    noOfDays: noOfDays,
                                    region: regionIds
                                });
                            }
                        }
                        console.log("reportConsumptionListregion-------------", reportConsumptionList.region)

                        console.log("reportConsumptionList.monthArray-------------", reportConsumptionList.consumptionDataForMonth)

                        console.log("monthArray-------------", monthArray)
                        this.setState({
                            monthArray: monthArray,
                            // loading: false,
                            reportConsumptionList: reportConsumptionList,

                        })
                        console.log("this.state.monthArray-------------", this.state.monthArray)

                    }.bind(this);
                }.bind(this);
            } else { }

        }
    }

    render() {
        const { rangeValue } = this.state
        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }

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

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon pb-2">
                        <div className="card-header-actions">
                        </div>
                    </div>
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
                                                            name="foreccastingUnitId"
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
                                                            onChange={(e) => { this.yAxisChange(e); }}
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
                                                    // onClick={(e) => { this.yaxisEquUnitCheckbox(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        Show consumption adjusted for stock out?
                                                    </Label>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="timeWindowId"
                                                            id="timeWindowId"
                                                            bsSize="sm"
                                                        // onChange={this.fetchData}
                                                        >
                                                            <option value="6">6 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="3">3 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="9">9 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="12">12 {i18n.t('static.dashboard.months')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                                {/* <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}> */}
                                <Col md="12 pl-0">
                                    <div className="row" style={{ display: this.state.show ? "block" : "none" }}>
                                        <div className="col-md-12">
                                            {this.state.show && this.state.reportConsumptionList.length > 0 &&
                                                <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                            <th className="dataentryTdWidth sticky-col first-col clone">Average</th>
                                                            {this.state.monthArray.map((item, count) => {
                                                                return (<th>{moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
                                                            })}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.reportConsumptionList.map(item => {
                                                            return <>
                                                                <tr className="hoverTd">
                                                                    {/* <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(0)}>
                                                                        {this.state.consumptionUnitShowArr.includes(0) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                    </td> */}
                                                                    <td className="sticky-col first-col clone hoverTd" align="left"></td>
                                                                </tr>
                                                            </>
                                                        }
                                                        )}
                                                    </tbody>
                                                </Table>
                                            }
                                        </div>
                                    </div>
                                </Col>
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter>
                        <FormGroup>
                            {this.state.reportConsumptionList != "" && <button className="mr-1 float-right btn btn-info btn-md" onClick={this.toggledata}>{this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}</button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
            </div >
        );
    }
}

export default ConsumptionForecastErrorSupplyPlan;