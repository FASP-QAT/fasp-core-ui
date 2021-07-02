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
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, polling } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import moment from 'moment';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import ReportService from '../../api/ReportService';
import { Online, Offline } from "react-detect-offline";
import FundingSourceService from '../../api/FundingSourceService';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

class FunderExport extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            fundingSources: [],
            programs: [],
            versions: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            data: [],
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() + 1 },
            loading: false
        }
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
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
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
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
            //             programs: []
            //         }, () => { this.consolidatedProgramList() })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError' });
            //                     break;
            //             }
            //         }
            //     }
            // );

        } else {
            console.log('offline')
            this.consolidatedProgramList()
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

                this.setState({
                    programs: proList
                })

            }.bind(this);

        }.bind(this);


    }

    getFundingSource = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        fundingSources: response.data
                    }, () => { this.consolidatedFundingSourceList() })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: []
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
            //             fundingSources: []
            //         }, () => { this.consolidatedFundingSourceList() })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError' });
            //                     break;
            //             }
            //         }
            //     }
            // );

        } else {
            console.log('offline')
            this.consolidatedFundingSourceList()
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

                this.setState({
                    fundingSources: proList
                })

            }.bind(this);

        }.bind(this);
    }


    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {

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
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })

            }.bind(this);



        }.bind(this)


    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: []
        }, () => {
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
                        this.setState({
                            planningUnits: proList, message: ''
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
        });

    }

    handlePlanningUnitChange = (planningUnitIds) => {
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
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

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + document.getElementById("fundingSourceId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version*') + '  :  ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });


        var A = [this.addDoubleQuoteToRowContent(headers)]
        // this.state.data.map(ele => A.push([(getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]));
        this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.fundingSource.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.planningUnit.id, (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.totalProductCost, ele.freightPer, ele.freightCost, ele.totalCost])));
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
        a.download = i18n.t('static.report.fundingSource') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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

            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.fundingSource'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.budget.fundingsource') + ' : ' + document.getElementById("fundingSourceId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })

                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 170, planningText)

                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 200, {
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



        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.data.map(ele => [getLabelText(ele.fundingSource.label, this.state.lang), ele.fundingSource.code, ele.planningUnit.id, getLabelText(ele.planningUnit.label, this.state.lang), ele.qty, ele.totalProductCost, ele.freightPer, ele.freightCost, ele.totalCost]);
        let content = {
            margin: { top: 40, bottom: 50 },
            startY: 220,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 80, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 100 },
                2: { cellWidth: 170 },
            }
        };

        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.fundingSource') + ".pdf")
    }



    fetchData = () => {
        console.log("-------------------IN FETCHDATA-----------------------------");
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let fundingSourceId = document.getElementById("fundingSourceId").value;
        let isPlannedShipmentId = document.getElementById("isPlannedShipmentId").value;

        let planningUnitIds = this.state.planningUnitValues;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

        if (programId > 0 && versionId != 0 && planningUnitIds.length > 0 && fundingSourceId > 0 && isPlannedShipmentId > 0) {
            if (versionId.includes('Local')) {
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext')
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
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);


                        var programTransaction = db1.transaction(['program'], 'readwrite');
                        var programOs = programTransaction.objectStore('program');
                        var program1Request = programOs.getAll();
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
                            if (isPlannedShipmentId == 1) {//yes
                                isPlannedShipment = activeFilter;
                            } else {//no
                                isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id != 1 || c.shipmentStatus.id != "1"));
                            }

                            const fundingSourceFilter = isPlannedShipment.filter(c => c.fundingSource.id == fundingSourceId);

                            const dateFilter = fundingSourceFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));

                            console.log("DB LIST---", dateFilter);
                            console.log("SELECTED LIST---", planningUnitIds);

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
                                let json = {
                                    "active": true,
                                    "shipmentId": planningUnitFilter[j].shipmentId,
                                    "fundingSource": planningUnitFilter[j].fundingSource,
                                    "planningUnit": planningUnitFilter[j].planningUnit,
                                    "qty": planningUnitFilter[j].shipmentQty,
                                    "productCost": planningUnitFilter[j].productCost,
                                    "freightPerc": parseFloat(freight),
                                    "freightCost": planningUnitFilter[j].freightCost,
                                    "totalCost": planningUnitFilter[j].productCost + planningUnitFilter[j].freightCost,
                                }
                                data.push(json);
                            }
                            console.log("end offline data----", data);
                            this.setState({
                                data: data
                                , message: ''
                            })
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({
                    message: ''
                })
                let includePlannedShipments = true;
                if (isPlannedShipmentId == 1) {
                    includePlannedShipments = true;
                } else {
                    includePlannedShipments = false;
                }
                var inputjson = {
                    fundingSourceId: fundingSourceId,
                    programId: programId,
                    versionId: versionId,
                    startDate: new moment(startDate),
                    stopDate: new moment(endDate),
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
                            this.consolidatedProgramList();
                            this.consolidatedFundingSourceList();
                        })
                    }).catch(
                        error => {
                            this.setState({
                                data: []
                            }, () => {
                                this.consolidatedProgramList();
                                this.consolidatedFundingSourceList();
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
                //             data: []
                //         }, () => {
                //             this.consolidatedProgramList();
                //             this.consolidatedFundingSourceList();
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
                //                     this.setState({ message: i18n.t(error.response.data.messageCode) });
                //                     break;
                //                 default:
                //                     this.setState({ message: 'static.unkownError' });
                //                     break;
                //             }
                //         }
                //     }
                // );


            }
        } else if (fundingSourceId == 0) {
            this.setState({ message: i18n.t('static.fundingSource.selectFundingSource'), data: [] });

        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.report.selectProgram'), data: [] });

        } else if (versionId == -1) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] });

        } else if (planningUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

        } else if (isPlannedShipmentId == 0) {
            this.setState({ message: i18n.t('static.report.isincludeplannedshipmentSelect'), data: [] });
        }
    }

    componentDidMount() {
        this.getFundingSource();
        this.getPrograms();

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    addCommas(cell, row) {
        // console.log("row---------->", row);
        // var currencyCode = row.currency.currencyCode;
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
        const checkOnline = localStorage.getItem('sessionType');
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { fundingSources } = this.state;

        const { programs } = this.state;

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {/* {item.versionId} */}
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


        const columns = [
            {
                dataField: 'fundingSource.label',
                text: i18n.t('static.budget.fundingsource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'fundingSource.code',
                text: i18n.t('static.fundingsource.fundingsourceCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
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
                text: i18n.t('static.planningunit.planningunit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'qty',
                text: i18n.t('static.report.qty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'productCost',
                text: i18n.t('static.report.productCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'freightPerc',
                text: i18n.t('static.report.freightPer'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return cell.toFixed(2);
                }
            },
            {
                dataField: 'freightCost',
                text: i18n.t('static.report.freightCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'totalCost',
                text: i18n.t('static.report.totalCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
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
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.fundingSource')}</strong> */}
                        {/* <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                        </div> */}
                        {checkOnline === 'Online' &&
                            this.state.data.length > 0 &&
                            <div className="card-header-actions">
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
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-2 mt-3">

                        <Col md="12 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="Region-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls SelectGo Regioncalender">
                                        <InputGroup>
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

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="fundingSourceId"
                                                id="fundingSourceId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {fundingSources.length > 0
                                                    && fundingSources.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.fundingSourceId}>
                                                                {getLabelText(item.label, this.state.lang)}
                                                            </option>
                                                        )
                                                    }, this)}

                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={this.filterVersion}
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

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="versionId"
                                                id="versionId"
                                                bsSize="sm"
                                                onChange={(e) => { this.getPlanningUnit(); }}
                                            >
                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                {versionList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls SelectGo">
                                        <InputGroup className="box">
                                            <ReactMultiSelectCheckboxes
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="md"
                                                onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                            />

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        <br /><br /><br /><br />
                        <Col md="12 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="isPlannedShipmentId"
                                                id="isPlannedShipmentId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                <option value="1">{i18n.t('static.program.yes')}</option>
                                                <option value="2">{i18n.t('static.program.no')}</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>




                        <ToolkitProvider
                            keyField="shipmentId"
                            data={this.state.data}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (

                                    <div className="TableCust">
                                        <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            /* rowEvents={{
                                                 onClick: (e, row, rowIndex) => {
                                                     this.editRegion(row);
                                                 }
                                             }}*/
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div className="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div className="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default FunderExport;


