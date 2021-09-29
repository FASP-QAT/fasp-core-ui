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
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, polling, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import moment from 'moment';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import ReportService from '../../api/ReportService';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import { Online, Offline } from "react-detect-offline";
import FundingSourceService from '../../api/FundingSourceService';
import MultiSelect from 'react-multi-select-component';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

class ProcurementAgentExport extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            procurementAgents: [],
            fundingSources: [],
            viewby: '',
            programs: [],
            versions: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            procurementAgentValues: [],
            procurementAgentLabels: [],
            fundingSourceValues: [],
            fundingSourceLabels: [],
            data: [],
            lang: localStorage.getItem('lang'),
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: ''
        }
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    getPrograms = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
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
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
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

    getProcurementAgent = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProcurementAgentService.getProcurementAgentListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.procurementAgentCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.procurementAgentCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        procurementAgents: listArray, loading: false
                    }, () => { this.consolidatedProcurementAgentList() })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: [], loading: false
                        }, () => { this.consolidatedProcurementAgentList() })
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
            //             procurementAgents: [], loading: false
            //         }, () => { this.consolidatedProcurementAgentList() })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
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
            this.consolidatedProcurementAgentList()
            this.setState({ loading: false })
        }

    }

    consolidatedProcurementAgentList = () => {
        const lan = 'en';
        const { procurementAgents } = this.state
        var proList = procurementAgents;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procuremntAgent = transaction.objectStore('procurementAgent');
            var getRequest = procuremntAgent.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                // console.log("ProcurementAgentMyResult------>>>>", myResult);
                for (var i = 0; i < myResult.length; i++) {

                    // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                    // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    // console.log(programNameLabel);

                    // var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))


                    var f = 0
                    for (var k = 0; k < this.state.procurementAgents.length; k++) {
                        if (this.state.procurementAgents[k].procurementAgentId == myResult[i].procurementAgentId) {
                            f = 1;
                            console.log('already exist')
                        }
                    }
                    var programData = myResult[i];
                    if (f == 0) {
                        proList.push(programData)
                    }

                }
                var lang = this.state.lang;
                this.setState({
                    procurementAgents: proList.sort(function (a, b) {
                        a = a.procurementAgentCode.toLowerCase();
                        b = b.procurementAgentCode.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                })

            }.bind(this);

        }.bind(this);
    }


    filterVersion = () => {
        // document.getElementById("planningUnitId").checked = false;
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
        this.fetchData();
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

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: [],
            planningUnitLabels: [],
            planningUnitValues: []
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
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
                            // console.log(myResult)
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

                    //let productCategoryId = document.getElementById("productCategoryId").value;
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        // console.log('**' + JSON.stringify(response.data))
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray, message: ''
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

    handlePlanningUnitChange = (planningUnitIds) => {
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
    handleProcurementAgentChange = (procurementAgentIds) => {
        procurementAgentIds = procurementAgentIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgentValues: procurementAgentIds.map(ele => ele),
            procurementAgentLabels: procurementAgentIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }

    handleFundingSourceChange = (fundingSourceIds) => {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }


    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData()
        })
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    formatter = (value) => {

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
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV(columns) {

        let viewby = document.getElementById("viewById").value;

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        if (viewby == 1) {
            csvRow.push('')
            this.state.procurementAgentLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.procurementagent.procurementagent') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        } else if (viewby == 2) {
            csvRow.push('')
            this.state.fundingSourceLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        }
        csvRow.push('')

        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version*') + '  :  ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.planningUnitValues.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.label).toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        const headers = [];
        if (viewby == 3) {
            columns.splice(0, 2);
            columns.map((item, idx) => { headers[idx] = ((item.text)) });
        } else {
            columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        }




        var A = [this.addDoubleQuoteToRowContent(headers)]
        // this.state.data.map(ele => A.push([(getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]));
        if (viewby == 1) {
            this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.procurementAgent.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.procurementAgent.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.planningUnit.id, (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, (Number(ele.productCost).toFixed(2)), ele.freightPerc, ele.freightCost, (Number(ele.totalCost).toFixed(2))])));
        } else if (viewby == 2) {
            this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.fundingSource.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.planningUnit.id, (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, (Number(ele.productCost).toFixed(2)), ele.freightPerc, ele.freightCost, (Number(ele.totalCost).toFixed(2))])));
        } else {
            this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, (Number(ele.productCost).toFixed(2)), ele.freightPerc, ele.freightCost, (Number(ele.totalCost).toFixed(2))])));
        }

        // this.state.data.map(ele => [(ele.procurementAgent).replaceAll(',', ' ').replaceAll(' ', '%20'), (ele.planningUnit).replaceAll(',', ' ').replaceAll(' ', '%20'), ele.qty, ele.totalProductCost, ele.freightPer,ele.freightCost, ele.totalCost]);
        for (var i = 0; i < A.length; i++) {
            console.log(A[i])
            csvRow.push(A[i].join(","))

        }

        var csvString = csvRow.join("%0A")
        console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.shipmentCostReport') + ' ' + i18n.t('static.program.savedBy') + document.getElementById("viewById").selectedOptions[0].text + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
            var viewby = document.getElementById("viewById").value;

            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.shipmentCostReport') + ' ' + i18n.t('static.program.savedBy') + ' ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    let poslen = 0
                    if (viewby == 1) {
                        var procurementAgentText = doc.splitTextToSize((i18n.t('static.procurementagent.procurementagent') + ' : ' + this.state.procurementAgentLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, 110, procurementAgentText)
                        poslen = 110 + procurementAgentText.length * 10
                    } else if (viewby == 2) {
                        var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, 110, fundingSourceText)
                        poslen = 110 + fundingSourceText.length * 10

                    } else {
                        poslen = 90
                    }
                    console.log(poslen)
                    poslen = poslen + 20
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, poslen, {
                        align: 'left'
                    })
                    poslen = poslen + 20
                    doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, poslen, {
                        align: 'left'
                    })
                    poslen = poslen + 20
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, poslen, {
                        align: 'left'
                    })
                    poslen = poslen + 20
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, poslen, planningText)


                }

            }
        }

        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(8);

        var viewby = document.getElementById("viewById").value;


        const headers = [];

        let data = [];
        if (viewby == 1) {
            columns.map((item, idx) => { headers[idx] = (item.text) });
            data = this.state.data.map(ele => [getLabelText(ele.procurementAgent.label, this.state.lang), ele.procurementAgent.code, ele.planningUnit.id, getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.productCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.totalCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
        } else if (viewby == 2) {
            columns.map((item, idx) => { headers[idx] = (item.text) });
            data = this.state.data.map(ele => [getLabelText(ele.fundingSource.label, this.state.lang), ele.fundingSource.code, ele.planningUnit.id, getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.productCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.totalCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
        } else {
            columns.splice(0, 2);
            columns.map((item, idx) => { headers[idx] = (item.text) });
            data = this.state.data.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.productCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (Number(ele.totalCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
        }
        let startY = 220 + (this.state.planningUnitValues.length * 3)
        let content = {
            margin: { top: 80, bottom: 70 },
            startY: startY,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 65, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 149 },
                3: { cellWidth: 157.89 },
            }
        };
        if (viewby != 2 && viewby != 1) {
            content = {
                margin: { top: 80, bottom: 70 },
                startY: startY,
                head: [headers],
                body: data,
                styles: { lineWidth: 1, fontSize: 8, cellWidth: 90, halign: 'center' },
                columnStyles: {
                    1: { cellWidth: 221.89 },
                }
            };
        }

        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.shipmentCostReport') + ' ' + i18n.t('static.program.savedBy') + document.getElementById("viewById").selectedOptions[0].text + ".pdf")
    }

    buildJExcel() {
        let shipmentCosttList = this.state.data;
        console.log("shipmentCosttList @@@---->", shipmentCosttList);
        let shipmentCostArray = [];
        let count = 0;

        let viewby = this.state.viewby;

        for (var j = 0; j < shipmentCosttList.length; j++) {
            data = [];
            data[0] = (viewby == 1) ? (getLabelText(shipmentCosttList[j].procurementAgent.label, this.state.lang)) : ((viewby == 2) ? (getLabelText(shipmentCosttList[j].fundingSource.label, this.state.lang)) : ({}))
            data[1] = (viewby == 1) ? shipmentCosttList[j].procurementAgent.code : ((viewby == 2) ? shipmentCosttList[j].fundingSource.code : {})
            data[2] = getLabelText(shipmentCosttList[j].planningUnit.label, this.state.lang)
            data[3] = (shipmentCosttList[j].qty)
            data[4] = shipmentCosttList[j].productCost.toFixed(2)
            data[5] = shipmentCosttList[j].freightPerc.toFixed(2)
            data[6] = (shipmentCosttList[j].freightCost)
            data[7] = shipmentCosttList[j].totalCost.toFixed(2)

            shipmentCostArray[count] = data;
            count++;
        }
        // if (shipmentCosttList.length == 0) {
        //     data = [];
        //     shipmentCostArray[0] = data;
        // }
        // console.log("shipmentCostArray---->", shipmentCostArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = shipmentCostArray;



        // console.log("RENDER VIEWBY-------", viewby);
        let obj1 = {}
        let obj2 = {}
        if (viewby == 1) {
            obj1 = {
                // dataField: 'procurementAgent.label',
                // text: 'Procurement Agent',
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // formatter: (cell, row) => {
                //     return getLabelText(cell, this.state.lang);
                // },
                // style: { width: '70px' },

                title: i18n.t('static.procurementagent.procurementagent'),
                type: 'text',
                readOnly: true
            }

            obj2 = {
                // dataField: 'procurementAgent.code',
                // text: 'Procurement Agent Code',
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // style: { width: '70px' },

                title: i18n.t('static.report.procurementagentcode'),
                type: 'text',
                readOnly: true
            }

        } else if (viewby == 2) {
            obj1 = {
                // dataField: 'fundingSource.label',
                // text: i18n.t('static.budget.fundingsource'),
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // formatter: (cell, row) => {
                //     return getLabelText(cell, this.state.lang);
                // },
                // style: { width: '100px' },

                title: i18n.t('static.budget.fundingsource'),
                type: 'text',
                readOnly: true
            }

            obj2 = {
                // dataField: 'fundingSource.code',
                // text: i18n.t('static.fundingsource.fundingsourceCode'),
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // style: { width: '100px' },

                title: i18n.t('static.fundingsource.fundingsourceCode'),
                type: 'text',
                readOnly: true
            }
        } else {
            obj1 = {
                // hidden: true,
                type: 'hidden',
            }

            obj2 = {
                // hidden: true
                type: 'hidden',

            }
        }

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 80, 150, 80, 80, 80, 80, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                obj1,
                obj2,
                {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.qty'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.productCost'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.freightPer'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.freightCost'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.totalCost'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
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
                return [];
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
    }


    fetchData = () => {
        console.log("-------------------IN FETCHDATA-----------------------------");
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let viewby = document.getElementById("viewById").value;
        let procurementAgentIds = this.state.procurementAgentValues.length == this.state.procurementAgents.length ? [] : this.state.procurementAgentValues.map(ele => (ele.value).toString());
        let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
        let isPlannedShipmentId = document.getElementById("isPlannedShipmentId").value;

        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        if (viewby == 1) {
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && this.state.procurementAgentValues.length > 0) {
                if (versionId.includes('Local')) {
                    planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value))
                    var db1;
                    var storeOS;
                    getDatabase();
                    this.setState({ loading: true })
                    var regionList = [];
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        var version = (versionId.split('(')[0]).trim()

                        //for user id
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);

                        //for program id
                        var program = `${programId}_v${version}_uId_${userId}`

                        db1 = e.target.result;
                        var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                        var programDataOs = programDataTransaction.objectStore('programData');
                        // console.log(program)
                        var programRequest = programDataOs.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (e) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);


                            var programTransaction = db1.transaction(['program'], 'readwrite');
                            var programOs = programTransaction.objectStore('program');
                            var program1Request = programOs.getAll();

                            program1Request.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            program1Request.onsuccess = function (event) {

                                var programResult = [];
                                programResult = program1Request.result;
                                let airFreight = 0;
                                let seaFreight = 0;
                                for (var k = 0; k < programResult.length; k++) {
                                    if (programId == programResult[k].programId) {
                                        airFreight = programResult[k].airFreightPerc;
                                        seaFreight = programResult[k].seaFreightPerc;
                                    }
                                }

                                var shipmentList = (programJson.shipmentList);
                                console.log("shipmentList----*********----", shipmentList);

                                const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true"));
                                // const activeFilter = shipmentList;
                                let isPlannedShipment = [];
                                if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
                                    isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
                                } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
                                    isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 3 || c.shipmentStatus.id == 4 || c.shipmentStatus.id == 5 || c.shipmentStatus.id == 6 || c.shipmentStatus.id == 7));
                                }
                                let data = [];
                                this.state.procurementAgentValues.map(p => {
                                    var procurementAgentId = p.value
                                    const procurementAgentFilter = isPlannedShipment.filter(c => c.procurementAgent.id == procurementAgentId);
                                    // const dateFilter = procurementAgentFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));
                                    // EXPECTED_DELIVERY_DATE
                                    // console.log("startDate===>", startDate);
                                    // console.log("stopDate===>", endDate);
                                    const dateFilter = procurementAgentFilter.filter(c => moment((c.receivedDate == null || c.receivedDate == "") ? c.expectedDeliveryDate : c.receivedDate).isBetween(startDate, endDate, null, '[)'));
                                    console.log("dateFilter====>", dateFilter);

                                    let planningUnitFilter = [];
                                    for (let i = 0; i < planningUnitIds.length; i++) {
                                        for (let j = 0; j < dateFilter.length; j++) {
                                            if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                                planningUnitFilter.push(dateFilter[j]);
                                            }
                                        }
                                    }
                                    // console.log("offline data----", planningUnitFilter);
                                    for (let j = 0; j < planningUnitFilter.length; j++) {
                                        // console.log("hi===>", parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)));
                                        let freight = 0;
                                        if (planningUnitFilter[j].shipmentMode === "Air") {
                                            freight = airFreight;
                                        } else {
                                            freight = seaFreight;
                                        }
                                        var planningUnit = this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitFilter[j].planningUnit.id);
                                        var procurementAgent = this.state.procurementAgents.filter(c => c.procurementAgentId == planningUnitFilter[j].procurementAgent.id);
                                        if (procurementAgent.length > 0) {
                                            var simplePAObject = {
                                                id: procurementAgent[0].procurementAgentId,
                                                label: procurementAgent[0].label,
                                                code: procurementAgent[0].procurementAgentCode
                                            }
                                        }
                                        var fundingSource = this.state.fundingSources.filter(c => c.fundingSourceId == planningUnitFilter[j].fundingSource.id);
                                        if (fundingSource.length > 0) {
                                            var simpleFSObject = {
                                                id: fundingSource[0].fundingSourceId,
                                                label: fundingSource[0].label,
                                                code: fundingSource[0].fundingSourceCode
                                            }
                                        }
                                        let json = {
                                            "active": true,
                                            "shipmentId": planningUnitFilter[j].shipmentId,
                                            "procurementAgent": procurementAgent.length > 0 ? simplePAObject : planningUnitFilter[j].procurementAgent,
                                            "fundingSource": fundingSource.length > 0 ? simpleFSObject : planningUnitFilter[j].fundingSource,
                                            "planningUnit": planningUnit.length > 0 ? planningUnit[0].planningUnit : planningUnitFilter[j].planningUnit,
                                            "qty": planningUnitFilter[j].shipmentQty,
                                            "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                            "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                            "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
                                            "currency": planningUnitFilter[j].currency
                                        }
                                        data.push(json);
                                    }
                                })
                                console.log("data----->", data);
                                var planningUnitsinData = data.map(q => parseInt(q.planningUnit.id));
                                var useFilter = planningUnitsinData.filter((q, idx) => planningUnitsinData.indexOf(q) === idx);
                                // console.log("userFilter===>###", useFilter);
                                var filteredData = [];
                                var myJson = [];
                                for (var uf = 0; uf < useFilter.length; uf++) {
                                    // for (var p = 0; p < data.length; p++) {
                                    var planningUnitFilterdata = data.filter(c => c.planningUnit.id == useFilter[uf]);
                                    var procurementAgentIds = planningUnitFilterdata.map(q => parseInt(q.procurementAgent.id));
                                    var uniqueProcurementAgentIds = procurementAgentIds.filter((q, idx) => procurementAgentIds.indexOf(q) === idx);
                                    // console.log("planningUnitFilterdata===>", planningUnitFilterdata[0]);
                                    for (var u = 0; u < uniqueProcurementAgentIds.length; u++) {
                                        var pupaFilterdata = planningUnitFilterdata.filter(c => c.procurementAgent.id == uniqueProcurementAgentIds[u]);
                                        var qty = 0;
                                        var productCost = 0;
                                        var freightPerc = 0;
                                        var freightCost = 0;
                                        var totalCost = 0;
                                        for (var pf = 0; pf < pupaFilterdata.length; pf++) {
                                            qty = Number(qty) + Number(pupaFilterdata[pf].qty);
                                            productCost = Number(productCost) + Number(pupaFilterdata[pf].productCost);
                                            freightCost = Number(freightCost) + Number(pupaFilterdata[pf].freightCost) * Number(pupaFilterdata[pf].currency.conversionRateToUsd);
                                            totalCost = Number(totalCost) + (Number(pupaFilterdata[pf].productCost) * Number(pupaFilterdata[pf].currency.conversionRateToUsd)) + (Number(pupaFilterdata[pf].freightCost) * Number(pupaFilterdata[pf].currency.conversionRateToUsd));
                                        }
                                        myJson = {
                                            "active": true,
                                            "shipmentId": pupaFilterdata[0].shipmentId,
                                            "procurementAgent": pupaFilterdata[0].procurementAgent,
                                            "fundingSource": pupaFilterdata[0].fundingSource,
                                            "planningUnit": pupaFilterdata[0].planningUnit,
                                            "qty": qty,
                                            "productCost": productCost,
                                            "freightPerc": Number((Number(freightCost) / Number(productCost)) * 100),
                                            "freightCost": freightCost,
                                            "totalCost": totalCost,
                                        }


                                        // }
                                        filteredData.push(myJson);
                                    }
                                }
                                this.setState({
                                    data: filteredData
                                    , message: ''
                                }, () => {
                                    this.buildJExcel();
                                })
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                } else {
                    this.setState({
                        message: '',
                        loading: true
                    })
                    let includePlannedShipments = true;
                    if (isPlannedShipmentId == 1) {
                        includePlannedShipments = true;
                    } else {
                        includePlannedShipments = false;
                    }
                    var inputjson = {
                        procurementAgentIds: procurementAgentIds,
                        programId: programId,
                        versionId: versionId,
                        startDate: startDate,
                        stopDate: endDate,
                        planningUnitIds: planningUnitIds,
                        includePlannedShipments: includePlannedShipments,
                    }
                    console.log("inputjson-------", inputjson);
                    // AuthenticationService.setupAxiosInterceptors();
                    ReportService.procurementAgentExporttList(inputjson)
                        .then(response => {
                            console.log("Online Data------", response.data);
                            this.setState({
                                data: response.data
                            }, () => {
                                // this.consolidatedProgramList();
                                // this.consolidatedProcurementAgentList();
                                this.buildJExcel();
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    data: [], loading: false
                                }, () => {
                                    // this.consolidatedProgramList();
                                    this.consolidatedProcurementAgentList();
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    this.el.destroy();
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
                                                message: i18n.t(error.response.data.messageCode),
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: i18n.t(error.response.data.messageCode),
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
                    //             this.consolidatedProgramList();
                    //             this.consolidatedProcurementAgentList();
                    //             this.el = jexcel(document.getElementById("tableDiv"), '');
                    //             this.el.destroy();
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
                    //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
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
                this.setState({ message: i18n.t('static.report.selectProgram'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.procurementAgentValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementAgent.selectProcurementAgent'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })
            }
        } else if (viewby == 2) {
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && this.state.fundingSourceValues.length > 0) {
                if (versionId.includes('Local')) {
                    planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value))
                    var db1;
                    var storeOS;
                    getDatabase();
                    var regionList = [];
                    this.setState({ loading: true })
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        var version = (versionId.split('(')[0]).trim()

                        //for user id
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);

                        //for program id
                        var program = `${programId}_v${version}_uId_${userId}`

                        db1 = e.target.result;
                        var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                        var programDataOs = programDataTransaction.objectStore('programData');
                        // console.log(program)
                        var programRequest = programDataOs.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (e) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);


                            var programTransaction = db1.transaction(['program'], 'readwrite');
                            var programOs = programTransaction.objectStore('program');
                            var program1Request = programOs.getAll();

                            program1Request.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            program1Request.onsuccess = function (event) {

                                var programResult = [];
                                programResult = program1Request.result;
                                let airFreight = 0;
                                let seaFreight = 0;
                                for (var k = 0; k < programResult.length; k++) {
                                    if (programId == programResult[k].programId) {
                                        airFreight = programResult[k].airFreightPerc;
                                        seaFreight = programResult[k].seaFreightPerc;
                                    }
                                }

                                var shipmentList = (programJson.shipmentList);

                                const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true"));
                                // const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);

                                let isPlannedShipment = [];
                                if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
                                    isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
                                } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
                                    isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 3 || c.shipmentStatus.id == 4 || c.shipmentStatus.id == 5 || c.shipmentStatus.id == 6 || c.shipmentStatus.id == 7));
                                }
                                let data = [];
                                this.state.fundingSourceValues.map(f => {
                                    var fundingSourceId = f.value
                                    const fundingSourceFilter = isPlannedShipment.filter(c => c.fundingSource.id == fundingSourceId);

                                    // const dateFilter = fundingSourceFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));

                                    const dateFilter = fundingSourceFilter.filter(c => moment((c.receivedDate == null || c.receivedDate == "") ? c.expectedDeliveryDate : c.receivedDate).isBetween(startDate, endDate, null, '[)'));
                                    console.log("DB LIST---", dateFilter);
                                    console.log("SELECTED LIST---", planningUnitIds);


                                    let planningUnitFilter = [];
                                    for (let i = 0; i < planningUnitIds.length; i++) {
                                        for (let j = 0; j < dateFilter.length; j++) {
                                            if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                                planningUnitFilter.push(dateFilter[j]);
                                            }
                                        }
                                    }

                                    console.log("offline data----", planningUnitFilter);
                                    for (let j = 0; j < planningUnitFilter.length; j++) {
                                        let freight = 0;
                                        if (planningUnitFilter[j].shipmentMode === "Air") {
                                            freight = airFreight;
                                        } else {
                                            freight = seaFreight;
                                        }
                                        var planningUnit = this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitFilter[j].planningUnit.id);
                                        var fundingSource = this.state.fundingSources.filter(c => c.fundingSourceId == planningUnitFilter[j].fundingSource.id);
                                        if (fundingSource.length > 0) {
                                            var simpleFSObject = {
                                                id: fundingSource[0].fundingSourceId,
                                                label: fundingSource[0].label,
                                                code: fundingSource[0].fundingSourceCode
                                            }
                                        }
                                        let json = {
                                            "active": true,
                                            "shipmentId": planningUnitFilter[j].shipmentId,
                                            "fundingSource": fundingSource.length > 0 ? simpleFSObject : planningUnitFilter[j].fundingSource,
                                            "planningUnit": planningUnit.length > 0 ? planningUnit[0].planningUnit : planningUnitFilter[j].planningUnit,
                                            "qty": planningUnitFilter[j].shipmentQty,
                                            "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                            "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                            "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
                                            "currency": planningUnitFilter[j].currency
                                        }
                                        data.push(json);
                                    }
                                })
                                var planningUnitsinData = data.map(q => parseInt(q.planningUnit.id));
                                var useFilter = planningUnitsinData.filter((q, idx) => planningUnitsinData.indexOf(q) === idx);
                                // console.log("userFilter===>", useFilter);
                                var filteredData = [];
                                var myJson = [];
                                for (var uf = 0; uf < useFilter.length; uf++) {
                                    // for (var p = 0; p < data.length; p++) {
                                    var planningUnitFilterdata = data.filter(c => c.planningUnit.id == useFilter[uf]);
                                    var fundingSourceIds = planningUnitFilterdata.map(q => parseInt(q.fundingSource.id));
                                    var uniqueFundingSourceIds = fundingSourceIds.filter((q, idx) => fundingSourceIds.indexOf(q) === idx);
                                    for (var u = 0; u < uniqueFundingSourceIds.length; u++) {
                                        var pupaFilterdata = planningUnitFilterdata.filter(c => c.fundingSource.id == uniqueFundingSourceIds[u]);
                                        var qty = 0;
                                        var productCost = 0;
                                        var freightPerc = 0;
                                        var freightCost = 0;
                                        var totalCost = 0;
                                        for (var pf = 0; pf < pupaFilterdata.length; pf++) {
                                            qty = Number(qty) + Number(pupaFilterdata[pf].qty);
                                            productCost = Number(productCost) + Number(pupaFilterdata[pf].productCost);
                                            freightCost = Number(freightCost) + Number(pupaFilterdata[pf].freightCost) * Number(pupaFilterdata[pf].currency.conversionRateToUsd);
                                            totalCost = Number(totalCost) + (Number(pupaFilterdata[pf].productCost) * Number(pupaFilterdata[pf].currency.conversionRateToUsd)) + (Number(pupaFilterdata[pf].freightCost) * Number(pupaFilterdata[pf].currency.conversionRateToUsd));
                                        }
                                        myJson = {
                                            "active": true,
                                            "shipmentId": pupaFilterdata[0].shipmentId,
                                            "procurementAgent": pupaFilterdata[0].procurementAgent,
                                            "fundingSource": pupaFilterdata[0].fundingSource,
                                            "planningUnit": pupaFilterdata[0].planningUnit,
                                            "qty": qty,
                                            "productCost": productCost,
                                            "freightPerc": Number((Number(freightCost) / Number(productCost)) * 100),
                                            "freightCost": freightCost,
                                            "totalCost": totalCost,
                                        }


                                        // }
                                        filteredData.push(myJson);
                                    }
                                }
                                console.log("end offline data----", filteredData);
                                this.setState({
                                    data: filteredData
                                    , message: ''
                                }, () => {
                                    this.buildJExcel();
                                })
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                } else {
                    this.setState({
                        message: '',
                        loading: true
                    })
                    let includePlannedShipments = true;
                    if (isPlannedShipmentId == 1) {
                        includePlannedShipments = true;
                    } else {
                        includePlannedShipments = false;
                    }
                    var inputjson = {
                        fundingSourceIds: fundingSourceIds,
                        programId: programId,
                        versionId: versionId,
                        startDate: startDate,
                        stopDate: endDate,
                        planningUnitIds: planningUnitIds,
                        includePlannedShipments: includePlannedShipments,
                    }
                    // AuthenticationService.setupAxiosInterceptors();
                    ReportService.fundingSourceExportList(inputjson)
                        .then(response => {
                            // console.log(JSON.stringify(response.data))
                            this.setState({
                                data: response.data
                            }, () => {
                                // this.consolidatedProgramList();
                                this.consolidatedFundingSourceList();
                                this.buildJExcel();
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    data: [], loading: false
                                }, () => {
                                    // this.consolidatedProgramList();
                                    this.consolidatedFundingSourceList();
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    this.el.destroy();

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
                                                message: i18n.t(error.response.data.messageCode),
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: i18n.t(error.response.data.messageCode),
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
                    //             this.consolidatedProgramList();
                    //             this.consolidatedFundingSourceList();
                    //             this.el = jexcel(document.getElementById("tableDiv"), '');
                    //             this.el.destroy();

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
                    //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
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
                this.setState({ message: i18n.t('static.report.selectProgram'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.fundingSourceValues.length == 0) {
                this.setState({ message: i18n.t('static.fundingSource.selectFundingSource'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })
            }
        } else {
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0) {
                if (versionId.includes('Local')) {
                    planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value))

                    var db1;
                    var storeOS;
                    getDatabase();
                    var regionList = [];
                    this.setState({ loading: true })
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        var version = (versionId.split('(')[0]).trim()

                        //for user id
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);

                        //for program id
                        var program = `${programId}_v${version}_uId_${userId}`

                        db1 = e.target.result;
                        var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                        var programDataOs = programDataTransaction.objectStore('programData');
                        // console.log(program)
                        var programRequest = programDataOs.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (e) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);


                            var programTransaction = db1.transaction(['program'], 'readwrite');
                            var programOs = programTransaction.objectStore('program');
                            var program1Request = programOs.getAll();

                            program1Request.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            program1Request.onsuccess = function (event) {

                                var programResult = [];
                                programResult = program1Request.result;
                                let airFreight = 0;
                                let seaFreight = 0;
                                for (var k = 0; k < programResult.length; k++) {
                                    if (programId == programResult[k].programId) {
                                        airFreight = programResult[k].airFreightPerc;
                                        seaFreight = programResult[k].seaFreightPerc;
                                    }
                                }

                                var shipmentList = (programJson.shipmentList);

                                const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true"));

                                let isPlannedShipment = [];
                                if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
                                    isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
                                } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
                                    isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 3 || c.shipmentStatus.id == 4 || c.shipmentStatus.id == 5 || c.shipmentStatus.id == 6 || c.shipmentStatus.id == 7));
                                }

                                // const dateFilter = isPlannedShipment.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));
                                const dateFilter = isPlannedShipment.filter(c => moment((c.receivedDate == null || c.receivedDate == "") ? c.expectedDeliveryDate : c.receivedDate).isBetween(startDate, endDate, null, '[)'));
                                let data = [];
                                let planningUnitFilter = [];
                                for (let i = 0; i < planningUnitIds.length; i++) {
                                    for (let j = 0; j < dateFilter.length; j++) {
                                        if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                            planningUnitFilter.push(dateFilter[j]);
                                        }
                                    }
                                }

                                console.log("offline data----", planningUnitFilter);
                                for (let j = 0; j < planningUnitFilter.length; j++) {
                                    let freight = 0;
                                    if (planningUnitFilter[j].shipmentMode === "Air") {
                                        freight = airFreight;
                                    } else {
                                        freight = seaFreight;
                                    }
                                    var planningUnit = this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitFilter[j].planningUnit.id);
                                    let json = {
                                        "active": true,
                                        "shipmentId": planningUnitFilter[j].shipmentId,
                                        "planningUnit": planningUnit.length > 0 ? planningUnit[0].planningUnit : planningUnitFilter[j].planningUnit,
                                        "qty": planningUnitFilter[j].shipmentQty,
                                        "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
                                        "currency": planningUnitFilter[j].currency
                                    }
                                    data.push(json);
                                }

                                var planningUnitsinData = data.map(q => parseInt(q.planningUnit.id));
                                var useFilter = planningUnitsinData.filter((q, idx) => planningUnitsinData.indexOf(q) === idx);
                                // console.log("userFilter===>", useFilter);
                                var filteredData = [];
                                var myJson = [];
                                console.log("User Filter@@@", useFilter);
                                for (var uf = 0; uf < useFilter.length; uf++) {
                                    // for (var p = 0; p < data.length; p++) {
                                    var planningUnitFilterdata = data.filter(c => c.planningUnit.id == useFilter[uf]);
                                    // console.log("planningUnitFilterdata===>", planningUnitFilterdata[0]);
                                    var qty = 0;
                                    var productCost = 0;
                                    var freightPerc = 0;
                                    var freightCost = 0;
                                    var totalCost = 0;
                                    console.log("@@@PlanningUnitFiltered data", planningUnitFilterdata);
                                    for (var pf = 0; pf < planningUnitFilterdata.length; pf++) {
                                        qty = Number(qty) + Number(planningUnitFilterdata[pf].qty);
                                        productCost = Number(productCost) + Number(planningUnitFilterdata[pf].productCost);
                                        freightCost = Number(freightCost) + Number(planningUnitFilterdata[pf].freightCost) * Number(planningUnitFilterdata[pf].currency.conversionRateToUsd);
                                        totalCost = Number(totalCost) + (Number(planningUnitFilterdata[pf].productCost) * Number(planningUnitFilterdata[pf].currency.conversionRateToUsd)) + (Number(planningUnitFilterdata[pf].freightCost) * Number(planningUnitFilterdata[pf].currency.conversionRateToUsd));
                                    }
                                    myJson = {
                                        "active": true,
                                        "shipmentId": planningUnitFilterdata[0].shipmentId,
                                        "procurementAgent": planningUnitFilterdata[0].procurementAgent,
                                        "fundingSource": planningUnitFilterdata[0].fundingSource,
                                        "planningUnit": planningUnitFilterdata[0].planningUnit,
                                        "qty": qty,
                                        "productCost": productCost,
                                        "freightPerc": Number((Number(freightCost) / Number(productCost)) * 100),
                                        "freightCost": freightCost,
                                        "totalCost": totalCost,
                                    }


                                    // }
                                    filteredData.push(myJson);
                                }

                                this.setState({
                                    data: filteredData
                                    , message: ''
                                }, () => {
                                    this.buildJExcel();
                                })
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                } else {
                    this.setState({
                        message: '',
                        loading: true
                    })
                    let includePlannedShipments = true;
                    if (isPlannedShipmentId == 1) {
                        includePlannedShipments = true;
                    } else {
                        includePlannedShipments = false;
                    }
                    var inputjson = {
                        programId: programId,
                        versionId: versionId,
                        startDate: startDate,
                        stopDate: endDate,
                        planningUnitIds: planningUnitIds,
                        includePlannedShipments: includePlannedShipments,
                    }
                    // AuthenticationService.setupAxiosInterceptors();
                    ReportService.AggregateShipmentByProduct(inputjson)
                        .then(response => {
                            console.log("Online Data------", response.data);
                            this.setState({
                                data: response.data
                            }, () => {
                                // this.consolidatedProgramList();
                                this.buildJExcel();
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    data: [], loading: false
                                }, () => {
                                    // this.consolidatedProgramList();
                                    this.consolidatedProcurementAgentList();
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    this.el.destroy();
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
                                                message: i18n.t(error.response.data.messageCode),
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: i18n.t(error.response.data.messageCode),
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
                    //             this.consolidatedProgramList();
                    //             this.consolidatedProcurementAgentList();
                    //             this.el = jexcel(document.getElementById("tableDiv"), '');
                    //             this.el.destroy();
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
                    //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
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
                this.setState({ message: i18n.t('static.report.selectProgram'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            }
        }

    }

    toggleView = () => {
        let viewby = document.getElementById("viewById").value;
        this.setState({
            viewby: viewby
        });
        if (viewby == 1) {
            document.getElementById("fundingSourceDiv").style.display = "none";
            document.getElementById("procurementAgentDiv").style.display = "block";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.consolidatedProgramList();
                // this.consolidatedProcurementAgentList();
            })


        } else if (viewby == 2) {
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "block";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.consolidatedProgramList();
                // this.consolidatedProcurementAgentList();
            })


        } else {
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                // this.consolidatedProgramList();
                // this.consolidatedProcurementAgentList();
                this.fetchData();
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            })



        }
    }

    componentDidMount() {
        this.getProcurementAgent();
        this.getFundingSource();
        this.getPrograms();
        document.getElementById("fundingSourceDiv").style.display = "none";
        let viewby = document.getElementById("viewById").value;
        this.setState({
            viewby: viewby
        });

    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            this.filterVersion();
        })

    }

    setVersionId(event) {
        // this.setState({
        //     versionId: event.target.value
        // }, () => {
        //     if (this.state.data.length != 0) {
        //         localStorage.setItem("sesVersionIdReport", this.state.versionId);
        //         this.fetchData();
        //     } else {
        //         this.getPlanningUnit();
        //     }
        // })

        if (this.state.versionId != '' || this.state.versionId != undefined) {
            this.setState({
                versionId: event.target.value
            }, () => {
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

    getFundingSource = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        fundingSources: response.data, loading: false
                    }, () => { this.consolidatedFundingSourceList() })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: [], loading: false
                        }, () => { this.consolidatedFundingSourceList() })
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
            //             fundingSources: [], loading: false
            //         }, () => { this.consolidatedFundingSourceList() })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
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
            this.consolidatedFundingSourceList()
            this.setState({ loading: false })
        }

    }

    consolidatedFundingSourceList = () => {
        const lan = 'en';
        const { fundingSources } = this.state
        var proList = fundingSources;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['fundingSource'], 'readwrite');
            var fundingSource = transaction.objectStore('fundingSource');
            var getRequest = fundingSource.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {

                    var f = 0
                    for (var k = 0; k < this.state.fundingSources.length; k++) {
                        if (this.state.fundingSources[k].fundingSourceId == myResult[i].fundingSourceId) {
                            f = 1;
                            console.log('already exist')
                        }
                    }
                    var programData = myResult[i];
                    if (f == 0) {
                        proList.push(programData)
                    }

                }
                var lang = this.state.lang;
                this.setState({
                    fundingSources: proList.sort(function (a, b) {
                        a = a.fundingSourceCode.toLowerCase();
                        b = b.fundingSourceCode.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                })

            }.bind(this);

        }.bind(this);
    }


    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    addCommas(cell, row) {
        // console.log("row---------->", row);

        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        // return "(" + currencyCode + ")" + "  " + x1 + x2;
        return x1 + x2;
    }

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { procurementAgents } = this.state;

        const { fundingSources } = this.state;

        const { programs } = this.state;

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);

        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        const { rangeValue } = this.state


        let viewby = this.state.viewby;
        // console.log("RENDER VIEWBY-------", viewby);
        let obj1 = {}
        let obj2 = {}
        if (viewby == 1) {
            obj1 = {
                dataField: 'procurementAgent.label',
                text: 'Procurement Agent',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                },
                style: { width: '70px' },
            }

            obj2 = {
                dataField: 'procurementAgent.code',
                text: 'Procurement Agent Code',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '70px' },
            }

        } else if (viewby == 2) {
            obj1 = {
                dataField: 'fundingSource.label',
                text: i18n.t('static.budget.fundingsource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                },
                style: { width: '100px' },
            }

            obj2 = {
                dataField: 'fundingSource.code',
                text: i18n.t('static.fundingsource.fundingsourceCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
            }
        } else {
            obj1 = {
                hidden: true
            }

            obj2 = {
                hidden: true

            }
        }


        const columns = [
            obj1,
            obj2, {
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
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                },
                style: { width: '400px' },
            },
            {
                dataField: 'qty',
                text: i18n.t('static.report.qty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },
            {
                dataField: 'productCost',
                text: i18n.t('static.report.productCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },
            {
                dataField: 'freightPerc',
                text: i18n.t('static.report.freightPer'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return cell.toFixed(2);
                },
                style: { width: '100px' },
            },
            {
                dataField: 'freightCost',
                text: i18n.t('static.report.freightCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },
            {
                dataField: 'totalCost',
                text: i18n.t('static.report.totalCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },

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
                text: 'All', value: this.state.selRegion.length
            }]
        }
        const checkOnline = localStorage.getItem('sessionType');
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon">

                        {/* <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                        </div> */}
                        {checkOnline === 'Online' &&
                            this.state.data.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleShippmentCost() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                                </a>
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                            </div>
                        }
                        {checkOnline === 'Offline' &&
                            this.state.data.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleShippmentCost() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                                </a>
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                            </div>
                        }
                    </div>
                    <CardBody className="pt-lg-2 pb-lg-5">

                        <div className="pl-0">
                            <div className="row ">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls  Regioncalender">

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
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                // onChange={this.filterVersion}
                                                onChange={(e) => { this.setProgramId(e); }}
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
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label>
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
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls">
                                        <MultiSelect
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="md"
                                            value={this.state.planningUnitValues}
                                            onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                            options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                        />

                                    </div>
                                </FormGroup>

                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="isPlannedShipmentId"
                                                id="isPlannedShipmentId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="1">{i18n.t('static.program.yes')}</option>
                                                <option value="2">{i18n.t('static.program.no')}</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="viewById"
                                                id="viewById"
                                                bsSize="sm"
                                                onChange={this.toggleView}
                                            >
                                                {/* <option value="-1">{i18n.t('static.common.select')}</option> */}
                                                <option value="1">{i18n.t('static.procurementagent.procurementagent')}</option>
                                                <option value="2">{i18n.t('static.dashboard.fundingsource')}</option>
                                                <option value="3">{i18n.t('static.planningunit.planningunit')}</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="col-md-3" id="procurementAgentDiv">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls">
                                        <MultiSelect
                                            name="procurementAgentId"
                                            id="planningUnitId"
                                            bsSize="procurementAgentId"
                                            value={this.state.procurementAgentValues}
                                            onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                            options={procurementAgents.length > 0
                                                && procurementAgents.map((item, i) => {
                                                    return ({ label: item.procurementAgentCode, value: item.procurementAgentId })
                                                }, this)}
                                        />

                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3" id="fundingSourceDiv">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls">
                                        <MultiSelect
                                            name="fundingSourceId"
                                            id="fundingSourceId"
                                            bsSize="md"
                                            value={this.state.fundingSourceValues}
                                            onChange={(e) => { this.handleFundingSourceChange(e) }}
                                            options={fundingSources.length > 0
                                                && fundingSources.map((item, i) => {
                                                    return (
                                                        { label: item.fundingSourceCode, value: item.fundingSourceId }
                                                    )
                                                }, this)}
                                        />

                                    </div>
                                </FormGroup>




                            </div>
                        </div>
                        <div className="ReportSearchMarginTop" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground">
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
export default ProcurementAgentExport;



