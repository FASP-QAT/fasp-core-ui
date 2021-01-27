import React, { Component, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import RealmCountryService from '../../api/RealmCountryService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import MultiSelect from "react-multi-select-component";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js'
import { SECRET_KEY, FIRST_DATA_ENTRY_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js'
import ReportService from '../../api/ReportService';
import moment from "moment";
import {
    Button, Card, CardBody, CardHeader, Col, Row, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form, Table
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';

const options = {
    title: {
        display: true,
        fontColor: 'black',
        fontStyle: "normal",
        fontSize: "12"
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

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
class StockStatusOverTime extends Component {

    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
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
            monthsInPastForAmc: 0,
            monthsInFutureForAmc: 0,
            planningUnitMatrix: {
                date: []
            },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth() + 2 },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() },
            loading: true,
            programId: '',
            versionId: ''


        }


        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    roundN = num => {
        return Number(Math.round(num * Math.pow(10, 1)) / Math.pow(10, 1)).toFixed(1);
    }
    formatAmc = value => {
        return Number(Math.round(value * Math.pow(10, 0)) / Math.pow(10, 0));
    }
    dateFormatter = value => {
        return moment(value).format('MMM YY')
    }
    formatter = value => {
        if (value != null) {
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
        else {
            return ''
        }
    }

    handlePlanningUnitChange = (event) => {
        console.log('***', event)
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
    handleChangeProgram(programIds) {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })

    }

    unCheck = () => {

        // document.querySelectorAll('.planningUnitId').forEach(e => {console.log('********',e)})
        /*var x = document.getElementById("planningUnitId");
        for(var i=0; i<=x.length; i++) {
           x[i].checked = false;
         }   */
    }
    unCheck1 = (e) => {
        console.log('uncheck', e)
        // document.querySelectorAll('.planningUnitId').forEach(e => {console.log('********',e)})
        /*var x = document.getElementById("planningUnitId");
        for(var i=0; i<=x.length; i++) {
           x[i].checked = false;
         }   */
    }

    show() {
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => { this.fetchData(); })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    getCountrylist() {
        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryForProgram(realmId)
            .then(response => {
                this.setState({
                    countries: response.data.map(ele => ele.realmCountry)
                })
            }).catch(
                error => {
                    this.setState({
                        countries: []
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
        // .catch(
        //     error => {
        //         this.setState({
        //             countries: []
        //         })
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message });
        //         } else {
        //             switch (error.response ? error.response.status : "") {
        //                 case 500:
        //                 case 401:
        //                 case 404:
        //                 case 406:
        //                 case 412:
        //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
        //                     break;
        //                 default:
        //                     this.setState({ message: 'static.unkownError' });
        //                     break;
        //             }
        //         }
        //     }
        // );

    }

    getPrograms = () => {
        if (localStorage.getItem("sesType") == "true") {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
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
            //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
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
                        this.updateMonthsforAMCCalculations()
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

    updateMonthsforAMCCalculations = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                this.setState({
                    monthsInPastForAmc: 0,
                    monthsInFutureForAmc: 0
                }, () => { this.fetchData() })

            }
        }
    }
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


    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        if (programId != 0) {

            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (localStorage.getItem("sesType") == "true") {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        planningUnitValues: [],
                        planningUnitLabels: []
                    }, () => {
                        this.unCheck();
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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)

                    }


                }

                console.log(verList)
                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
                    this.setState({
                        versions: verList.filter(function (x, i, a) {
                            return a.indexOf(x) === i;
                        }),
                        versionId: localStorage.getItem("sesVersionIdReport")
                    }, () => {
                        this.getPlanningUnit();
                    })
                } else {
                    this.setState({
                        versions: verList.filter(function (x, i, a) {
                            return a.indexOf(x) === i;
                        })
                    })
                }


            }.bind(this);



        }.bind(this)


    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;

        // let programId = this.state.programId;
        // let versionId = this.state.versionId;

        this.setState({
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
        }, () => {

            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
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
                            this.setState({
                                planningUnits: proList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
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
                        console.log('**' + JSON.stringify(response.data))
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
                    // .catch(
                    //     error => {
                    //         this.setState({
                    //             planningUnits: [],
                    //         })
                    //         if (error.message === "Network Error") {
                    //             this.setState({ message: error.message });
                    //         } else {
                    //             switch (error.response ? error.response.status : "") {
                    //                 case 500:
                    //                 case 401:
                    //                 case 404:
                    //                 case 406:
                    //                 case 412:
                    //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                    //                     break;
                    //                 default:
                    //                     this.setState({ message: 'static.unkownError' });
                    //                     break;
                    //             }
                    //         }
                    //     }
                    // );
                }
            }
        });

    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value
        }, () => {
            this.filterVersion();
            this.updateMonthsforAMCCalculations()
        })

    }

    setVersionId(event) {
        this.setState({
            versionId: event.target.value
        }, () => {
            this.getPlanningUnit();
        })

    }

    componentDidMount() {
        console.log("D----------------->Calculated", (4896 + 20000000000000000000 + 5152 + 5246 + 0) / 9);
        this.getPrograms();


    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    fetchData() {
        let planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString())
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        let monthsInFutureForAmc = this.state.monthsInFutureForAmc
        let monthsInPastForAmc = this.state.monthsInPastForAmc
        console.log(monthsInFutureForAmc, monthsInPastForAmc)
        if (planningUnitIds.length > 0 && versionId != 0 && programId > 0 && monthsInFutureForAmc != undefined && monthsInPastForAmc != undefined && monthsInFutureForAmc != 0 && monthsInPastForAmc != 0) {
            if (versionId.includes('Local')) {

                let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
                let endDate = moment(new Date(this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate()));


                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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

                    programRequest.onsuccess = function (event) {
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        console.log(programJson)
                        planningUnitIds.map(planningUnitId => {
                            var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]
                            var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                            var monthstartfrom = this.state.rangeValue.from.month
                            for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                                var monthlydata = [];
                                for (var month = monthstartfrom; month <= 12; month++) {
                                    var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                                    var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                                    console.log(dtstr, ' ', enddtStr)
                                    var dt = dtstr
                                    var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnitId && c.transDate == dt)
                                    console.log(list)
                                    if (list.length > 0) {

                                        var endingBalance = list[0].closingBalance

                                        var amcBeforeArray = [];
                                        var amcAfterArray = [];

                                        for (var c = 0; c < monthsInPastForAmc; c++) {

                                            var month1MonthsBefore = moment(dt).subtract(c + 1, 'months').format("YYYY-MM-DD");
                                            console.log("D------------------>For Dt", dt);
                                            console.log("D------------------>Months1MONTHSBefore", month1MonthsBefore);
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
                                                        consumptionQty += Math.round(Number((consumptionListForAMC[j].consumptionQty)));
                                                    } else {
                                                        if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                            consumptionQty += Math.round(Number((consumptionListForAMC[j].consumptionQty)));
                                                        }
                                                    }
                                                }
                                                amcBeforeArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                                var amcArrayForMonth = amcBeforeArray.filter(c => c.month == dtstr);

                                            }
                                        }
                                        console.log("D------------------>CalculatedamcBeforeArray", amcBeforeArray);
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
                                                        consumptionQty += Math.round(Number((consumptionListForAMC[j].consumptionQty)));
                                                    } else {
                                                        if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                            consumptionQty += Math.round(Number((consumptionListForAMC[j].consumptionQty)));
                                                        }
                                                    }
                                                }
                                                amcAfterArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                                amcArrayForMonth = amcAfterArray.filter(c => c.month == dtstr);

                                            }

                                        }
                                        console.log("D------------------>AMCAFTERARRAY", amcAfterArray);
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
                                            console.log('amcCalcualted', amcCalcualted, ' endingBalance', endingBalance)
                                            mos = endingBalance < 0 ? 0 / amcCalcualted : endingBalance / amcCalcualted
                                        }










                                        var json = {
                                            "dt": new Date(from, month - 1),
                                            "program": pu.program,
                                            "planningUnit": pu.planningUnit,
                                            "stock": list[0].closingBalance,
                                            "consumptionQty": list[0].consumptionQty,
                                            "amc": amcCalcualted,
                                            "amcMonthCount": countAMC,
                                            "mos": this.roundN(mos)
                                        }
                                        data.push(json)
                                        console.log(data)
                                    } else {
                                        var json = {
                                            "dt": new Date(from, month - 1),
                                            "program": pu.program,
                                            "planningUnit": pu.planningUnit,
                                            "stock": 0,
                                            "consumptionQty": 0,
                                            "amc": 0,
                                            "amcMonthCount": 0,
                                            "mos": null
                                        }
                                        data.push(json)

                                    }



                                    if (month == this.state.rangeValue.to.month && from == to) {
                                        this.setState({
                                            matricsList: data,
                                            message: ''
                                        })

                                        return;
                                    }

                                }
                                monthstartfrom = 1

                            }




                        })
                    }.bind(this)

                }.bind(this)



            } else {
                this.setState({ loading: true })
                var input = {
                    "programId": programId,
                    "versionId": versionId,
                    "planningUnitIds": planningUnitIds,
                    "mosPast": document.getElementById("monthsInPastForAmc").selectedOptions[0].value == 0 ? null : document.getElementById("monthsInPastForAmc").selectedOptions[0].value,
                    "mosFuture": document.getElementById("monthsInFutureForAmc").selectedOptions[0].value == 0 ? null : document.getElementById("monthsInFutureForAmc").selectedOptions[0].value,
                    "startDate": startDate,
                    "stopDate": stopDate
                }

                /*var inputjson={
                "realmCountryIds":CountryIds,"programIds":programIds,"planningUnitIds":planningUnitIds,"startDate": startDate
               }*/
                // AuthenticationService.setupAxiosInterceptors();

                ReportService.getStockOverTime(input)
                    .then(response => {
                        /*    response.data = [[{ "dt": "Dec 19", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 54800, "consumptionQty": 0, "amc": 23122, "amcMonthCount": 4, "mos": 2.37 },
                            { "dt": "Jan 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 27203, "consumptionQty": 17475, "amc": 23533, "amcMonthCount": 5, "mos": 1.1559 },
                            { "dt": "Feb 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 6067, "consumptionQty": 25135, "amc": 22402, "amcMonthCount": 6, "mos": 0.2708 },
                            { "dt": "Mar 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 36137, "consumptionQty": 49880, "amc": 21202, "amcMonthCount": 7, "mos": 1.7044 },
                            { "dt": "Apr 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 10960, "consumptionQty": 25177, "amc": 23631, "amcMonthCount": 7, "mos": 0.4638 },
                            { "dt": "May 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 0, "consumptionQty": 16750, "amc": 23706, "amcMonthCount": 7, "mos": 0.0 },
                            { "dt": "Jun 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 26000, "consumptionQty": 14000, "amc": 22401, "amcMonthCount": 7, "mos": 1.1607 }],
                            [{ "dt": "Dec 19", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 28648, "consumptionQty": 0, "amc": 8604, "amcMonthCount": 4, "mos": 3.3293 },
                            { "dt": "Jan 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 17103, "consumptionQty": 11522, "amc": 9351, "amcMonthCount": 5, "mos": 1.829 },
                            { "dt": "Feb 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 20500, "consumptionQty": 11513, "amc": 9709, "amcMonthCount": 6, "mos": 2.1114 },
                            { "dt": "Mar 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 9116, "consumptionQty": 11384, "amc": 9965, "amcMonthCount": 7, "mos": 0.9148 },
                            { "dt": "Apr 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 31757, "consumptionQty": 12336, "amc": 11607, "amcMonthCount": 7, "mos": 2.7358 },
                            { "dt": "May 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 20257, "consumptionQty": 11500, "amc": 11604, "amcMonthCount": 7, "mos": 1.7456 },
                            { "dt": "Jun 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 28757, "consumptionQty": 11500, "amc": 11602, "amcMonthCount": 7, "mos": 2.4784 }],
                            [{ "dt": "Dec 19", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 15865, "consumptionQty": 0, "amc": 4608, "amcMonthCount": 4, "mos": 3.4427 },
                            { "dt": "Jan 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 9789, "consumptionQty": 6053, "amc": 4854, "amcMonthCount": 5, "mos": 2.0166 },
                            { "dt": "Feb 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 23393, "consumptionQty": 6398, "amc": 5070, "amcMonthCount": 6, "mos": 4.6139 },
                            { "dt": "Mar 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 15903, "consumptionQty": 5982, "amc": 5224, "amcMonthCount": 7, "mos": 3.044 },
                            { "dt": "Apr 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 10063, "consumptionQty": 5838, "amc": 6103, "amcMonthCount": 7, "mos": 1.6489 },
                            { "dt": "May 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 3913, "consumptionQty": 6150, "amc": 6116, "amcMonthCount": 7, "mos": 0.6397 },
                            { "dt": "Jun 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 17763, "consumptionQty": 6150, "amc": 6081, "amcMonthCount": 7, "mos": 2.9209 }]];
                            console.log(JSON.stringify(response.data))*/
                        // var lineData = [];
                        // var lineDates = [];
                        // var planningUnitlines = [];
                        // for (var i = 0; i < response.data.length; i++) {
                        //     lineData[i] = response.data[i].map(ele => (ele.mos))
                        // }
                        // lineDates = response.data[0].map(ele => (ele.dt))
                        // planningUnitlines = response.data.map(ele1 => [...new Set(ele1.map(ele => (getLabelText(ele.program.label, this.state.lang) + '-' + getLabelText(ele.planningUnit.label, this.state.lang))))])

                        this.setState({
                            matricsList: response.data,
                            message: '', loading: false
                            // planningUnitlines: planningUnitlines,
                            // lineData: lineData,
                            // lineDates: lineDates
                        })
                    }).catch(
                        error => {
                            this.setState({
                                matricsList: [], loading: false
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
                // .catch(
                //     error => {
                //         this.setState({
                //             matricsList: [], loading: false
                //         })

                //         if (error.message === "Network Error") {
                //             this.setState({ message: error.message, loading: false });
                //         } else {
                //             switch (error.response ? error.response.status : "") {
                //                 case 500:
                //                 case 401:
                //                 case 404:
                //                 case 406:
                //                 case 412:
                //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }), loading: false });
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
            this.setState({ message: i18n.t('static.common.selectProgram'), matricsList: [] });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });

        } else if (planningUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), matricsList: [] });

        } else if (monthsInPastForAmc == undefined || monthsInPastForAmc == 0) {
            this.setState({ message: i18n.t('static.realm.monthInPastForAmcText'), matricsList: [] });

        } else {
            this.setState({ message: i18n.t('static.realm.monthInFutureForAmcText'), matricsList: [] });

        }


    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV() {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.planningUnitValues.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.label).toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.mospast') + ' : ' + document.getElementById("monthsInPastForAmc").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.mosfuture') + ' : ' + document.getElementById("monthsInFutureForAmc").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        var re;

        var A = [this.addDoubleQuoteToRowContent([i18n.t('static.common.month'), ((i18n.t('static.report.qatPID')).replaceAll(',', '%20')).replaceAll(' ', '%20'), ((i18n.t('static.planningunit.planningunit')).replaceAll(',', '%20')).replaceAll(' ', '%20'), i18n.t('static.report.stock'), ((i18n.t('static.report.consupmtionqty')).replaceAll(',', '%20')).replaceAll(' ', '%20'), i18n.t('static.report.amc'), ((i18n.t('static.report.noofmonth')).replaceAll(',', '%20')).replaceAll(' ', '%20'), i18n.t('static.report.mos')])]


        this.state.matricsList.map(elt => A.push(this.addDoubleQuoteToRowContent([this.dateFormatter(elt.dt).replaceAll(' ', '%20'), elt.planningUnit.id, ((getLabelText(elt.planningUnit.label, this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.stock == null ? '' : elt.stock, elt.consumptionQty == null ? '' : elt.consumptionQty, this.formatAmc(elt.amc), elt.amcMonthCount, this.roundN(elt.mos)])));


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






    exportPDF = () => {
        let ypos = 0
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

            // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')

                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 200, 50, 'FAST');
                /*doc.addImage(data, 10, 30, {
                align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.stockstatusovertimeReport'), doc.internal.pageSize.width / 2, 60, {
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
                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.mospast') + ' : ' + document.getElementById("monthsInPastForAmc").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.mosfuture') + ' : ' + document.getElementById("monthsInFutureForAmc").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
                        align: 'left'
                    })
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnitValues.map(ele => ele.label)).join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 190, planningText)



                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        const title = i18n.t('static.report.stockstatusovertimeReport');
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);
        var startY = 190 + doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnitValues.map(ele => ele.label)).join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10;

        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        doc.setTextColor("#fff");
        console.log(startYtable, (height - 500))
        if (startYtable > (height - 400)) {
            doc.addPage()
            startYtable = 80
        }
        // doc.addImage(canvasImg, 'png', 50, 130, aspectwidth1, height * 2 / 3);
        doc.addImage(canvasImg, 'png', 50, startYtable, 750, 230, 'CANVAS');

        const headers = [[i18n.t('static.common.month'), i18n.t('static.report.qatPID'), i18n.t('static.planningunit.planningunit'), i18n.t('static.report.stock'), i18n.t('static.report.consupmtionqty'), i18n.t('static.report.amc'), i18n.t('static.report.noofmonth'), i18n.t('static.report.mos')]];

        const data = [];
        this.state.matricsList.map(elt => data.push([this.dateFormatter(elt.dt), elt.planningUnit.id, getLabelText(elt.planningUnit.label, this.state.lang), this.formatter(elt.stock), this.formatter(elt.consumptionQty), this.formatter(this.formatAmc(elt.amc)), elt.amcMonthCount, this.roundN(elt.mos)]));
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


        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.stockstatusovertimeReport').concat('.pdf'));
        //creates PDF from img
        /* var doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text(15, 15, "Cool Chart");
        doc.save('canvas.pdf');*/
    }



    render() {
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

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
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);


        const getRandomColor = () => {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        console.log(this.state.matricsList)
        const backgroundColor = [
            '#4dbd74',
            '#c8ced3',
            '#000',
            '#ffc107',
            '#f86c6b',
            '#205493',
            '#20a8d8',
            '#a6c4ec',
            '#ca3828',
            '#388b70',
            '#f4862a',
            '#ed5626',
            '#4dbd74',
            '#ffc107',
            '#f86c6b'
        ]
        console.log(this.state.matricsList)
        var v = this.state.planningUnitValues.map(pu => this.state.matricsList.filter(c => c.planningUnit.id == pu.value).map(ele => (this.roundN(ele.mos) > 48 ? 48 : this.roundN(ele.mos))))
        var dts = Array.from(new Set(this.state.matricsList.map(ele => (this.dateFormatter(ele.dt)))))
        console.log(dts)
        const bar = {
            labels: dts,
            datasets: this.state.planningUnitValues.map((ele, index) => ({ type: "line", pointStyle: 'line', lineTension: 0, backgroundColor: 'transparent', label: ele.label, data: v[index], borderColor: backgroundColor[index] }))
            /*  [
             {
                   type: "line",
                   label: "MOS past 3",
                   backgroundColor: 'transparent',
                   borderColor: '#ffc107',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_pass3))
               },
               {
                   type: "line",
                   label: "MOS P+F",
                   backgroundColor: 'transparent',
                   borderColor: '#4dbd74',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_PF))
               },
               {
                   type: "line",
                   label: "MOS Future 3",
                   backgroundColor: 'transparent',
                   borderColor: '#ed5626',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_Feature3))
               }
           ]*/
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
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleStockStatusOverTime() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                            {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.stockstatusovertimeReport')}</strong> */}
                            {
                                this.state.matricsList.length > 0 &&

                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />

                                    {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
 
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}

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
                                                    //theme="light"
                                                    onChange={this.handleRangeChange}
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
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionId"
                                                        id="versionId"
                                                        bsSize="sm"
                                                        // onChange={(e) => { this.getPlanningUnit(); }}
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
                                                {/* <InputGroup className="box"> */}
                                                <MultiSelect
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                    value={this.state.planningUnitValues}
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    labelledBy={i18n.t('static.common.select')}
                                                />
                                                {/* </InputGroup> */}
                                                {/* <ReactMultiSelectCheckboxes
                                                    className="planningUnitId"
                                                        name="planningUnitId"
                                                        id="planningUnitId"
                                                        bsSize="md"
                                                        onInputChange={(e) => { this.unCheck1(e) }}
                                                        onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                    /> */}
                                                {/* <InputGroupAddon addonType="append">
                                  <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                </InputGroupAddon> */}

                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-sm-3">
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

                                        </FormGroup>
                                        <FormGroup className="col-sm-3">
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

                                        </FormGroup>

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

                        <div className="row">
                            <div className="col-md-12">
                                {this.state.show && this.state.matricsList.length > 0 &&
                                    <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                                        <thead>
                                            <tr>
                                                <th className="text-center" style={{ width: '10%' }}> {i18n.t('static.common.month')} </th>
                                                <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.planningunit.planningunit')}</th>
                                                <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.stock')}</th>
                                                <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.consupmtionqty')}</th>
                                                <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.amc')}</th>
                                                <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.noofmonth')}</th>
                                                <th className="text-center" style={{ width: '10%' }}>{i18n.t('static.report.mos')}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {this.state.matricsList.length > 0
                                                &&
                                                this.state.matricsList.map(item =>

                                                    <tr id="addr0" >

                                                        <td>{this.dateFormatter(item.dt)}</td>
                                                        <td>
                                                            {getLabelText(item.planningUnit.label, this.state.lang)}
                                                        </td>
                                                        <td>
                                                            {this.formatter(item.stock)}
                                                        </td>
                                                        <td>
                                                            {this.formatter(item.consumptionQty)}
                                                        </td>
                                                        <td>
                                                            {this.formatter(this.formatAmc(item.amc))}
                                                        </td>
                                                        <td>
                                                            {this.formatter(item.amcMonthCount)}
                                                        </td>
                                                        <td>
                                                            {this.roundN(item.mos)}
                                                        </td>

                                                    </tr>)}


                                        </tbody>
                                    </Table>}

                            </div>
                        </div>
                    </CardBody></Card>
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



export default StockStatusOverTime
