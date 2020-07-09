import React, { Component } from 'react';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import Picker from 'react-month-picker'
import i18n from '../../i18n'
import MonthBox from '../../CommonComponent/MonthBox.js'
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService';
import ShipmentStatusService from '../../api/ShipmentStatusService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import FundingSourceService from '../../api/FundingSourceService';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { SECRET_KEY,DATE_FORMAT_CAP } from '../../Constants.js';
import CryptoJS from 'crypto-js';
import csvicon from '../../assets/img/csv.png'
import {
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    Col,
    Row,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import ReportService from '../../api/ReportService';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';

const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
export default class ExpiredInventory extends Component {
    constructor(props) {
        super(props);
        this.getPrograms = this.getPrograms.bind(this);
        this.filterVersion = this.filterVersion.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.makeText = this.makeText.bind(this);
        this.state = {
            outPutList: [],
            programs: [],
            versions: [],
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
        }
    }

    componentDidMount() {
        this.getPrograms();
        this.state.outPutList = [
            {
                planningUnit: {
                    planningUnitId: 1,
                    label: {
                        label_en: 'Abacvare 20 mg / 50 tablets',
                        label_fr: '',
                        label_sp: '',
                        label_pr: '',
                    }
                },
                quantity: 10000,
                batchNo: 'BATCH1248',
                expDate: '2020-07-01'
            }
        ]
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData();
        })

    }
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    getPrograms() {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            ProgramService.getProgramByRealmId(realmId)
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
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
        var openRequest = indexedDB.open('fasp', 1);
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
    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {
            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (navigator.onLine) {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        // outPutList: []

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
        var openRequest = indexedDB.open('fasp', 1);
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

    fetchData() {

        let json = {
            "programId": document.getElementById("programId").value,
            "versionId": document.getElementById("versionId").value,
            "procurementAgentId": document.getElementById("procurementAgentId").value,
            "planningUnitId": document.getElementById("planningUnitId").value,
            "fundingSourceId": document.getElementById("fundingSourceId").value,
            "shipmentStatusId": document.getElementById("shipmentStatusId").value,
            "startDate": this.state.rangeValue.from.year + '-' + ("00" + this.state.rangeValue.from.month).substr(-2) + '-01',
            "stopDate": this.state.rangeValue.to.year + '-' + ("00" + this.state.rangeValue.to.month).substr(-2) + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
            "reportbaseValue": document.getElementById("view").value,

        }

        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let planningUnitId = document.getElementById("planningUnitId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        let reportbaseValue = document.getElementById("view").value;

        if (programId > 0 && versionId != 0 && planningUnitId != 0) {
            if (versionId.includes('Local')) {
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext')
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
                    console.log("1----", program)
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        console.log("2----", programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);

                        var programJson = JSON.parse(programData);
                        console.log("3----", programJson);

                        var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                        var papuOs = papuTransaction.objectStore('procurementAgent');
                        var papuRequest = papuOs.getAll();
                        papuRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                        }.bind(this);
                        papuRequest.onsuccess = function (event) {
                            var papuResult = [];
                            papuResult = papuRequest.result;

                            var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                            var fsOs = fsTransaction.objectStore('fundingSource');
                            var fsRequest = fsOs.getAll();

                            fsRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext')
                                })
                            }.bind(this);

                            fsRequest.onsuccess = function (event) {
                                var fsResult = [];
                                fsResult = fsRequest.result;

                                var shipmentList = [];
                                shipmentList = programJson.shipmentList;
                                console.log("4----", shipmentList);
                                // alert(planningUnitId); && (c.inventoryDate>=startDate&& c.inventoryDate<=endDate))
                                console.log("dates---", moment(startDate).format('YYYY-MM-DD'), "---->", moment(endDate).format('YYYY-MM-DD'));
                                // var list = shipmentList.filter(c => c.planningUnit.id == planningUnitId && (c.shippedDate >= '2018-07-01' && c.shippedDate <= '2020-07-31'));
                                console.log("5----", reportbaseValue);
                                var list = [];
                                if (reportbaseValue == 1) {
                                    list = shipmentList.filter(c => c.planningUnit.id == planningUnitId && (c.shippedDate >= moment(startDate).format('YYYY-MM-DD') && c.shippedDate <= moment(endDate).format('YYYY-MM-DD')));
                                } else {
                                    list = shipmentList.filter(c => c.planningUnit.id == planningUnitId && (c.deliveredDate >= moment(startDate).format('YYYY-MM-DD') && c.deliveredDate <= moment(endDate).format('YYYY-MM-DD')));
                                }
                                // var list = shipmentList.filter(c => c.planningUnit.id == planningUnitId && (c.shippedDate >=moment(startDate).format('YYYY-MM-DD') && c.shippedDate <= moment(endDate).format('YYYY-MM-DD')));
                                var procurementAgentId = document.getElementById("procurementAgentId").value;
                                var fundingSourceId = document.getElementById("fundingSourceId").value;
                                var shipmentStatusId = document.getElementById("shipmentStatusId").value;

                                if (procurementAgentId != -1) {
                                    list = list.filter(c => c.procurementAgent.id == procurementAgentId);
                                }
                                if (fundingSourceId != -1) {
                                    list = list.filter(c => c.fundingSource.id == fundingSourceId);
                                }
                                if (shipmentStatusId != -1) {
                                    list = list.filter(c => c.shipmentStatus.id == shipmentStatusId);
                                }
                                console.log("6----", list);

                                var outPutList = [];
                                var procurementAgentList = [];
                                list.map(item => {
                                    var procurementAgentId = item.procurementAgent.id;
                                    var index = procurementAgentList.findIndex(c => c == procurementAgentId);
                                    if (index == -1) {
                                        procurementAgentList.push(procurementAgentId);
                                    }
                                });
                                console.log("7----", procurementAgentList);

                                var fundingSourceList = [];
                                procurementAgentList.map(f => {
                                    var l = list.filter(c => c.procurementAgent.id == f);
                                    l.map(pa => {
                                        var fundingSourceId = pa.fundingSource.id;
                                        var index = fundingSourceList.findIndex(c => c.fundingSourceId == fundingSourceId && c.procurementAgentId == f);
                                        if (index == -1) {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == f)[0];
                                            var procurementAgentName = getLabelText(procurementAgent.label, this.state.lang);

                                            var fundingSource = fsResult.filter(c => c.fundingSourceId == fundingSourceId)[0];
                                            var fundingSourceName = getLabelText(fundingSource.label, this.state.lang);

                                            fundingSourceList.push({ procurementAgentName: procurementAgentName, fundingSourceName: fundingSourceName, fundingSourceId: fundingSourceId, procurementAgentId: f });
                                        }

                                    });
                                });
                                console.log("8----", fundingSourceList);

                                fundingSourceList.map(fs => {
                                    var myArray = [];
                                    for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                                        var l = list.filter(c => c.procurementAgent.id == fs.procurementAgentId && c.fundingSource.id == fs.fundingSourceId && moment(c.shippedDate).format("YYYY") == from);
                                        var cost = 0;
                                        for (var k = 0; k < l.length; k++) {
                                            cost += parseFloat(l[k].productCost) + parseFloat(l[k].freightCost);
                                        }
                                        // myArray.push({ [from]: cost });
                                        myArray.push({ 'from': from, 'cost': cost });

                                    }
                                    var skillsSelect = document.getElementById("planningUnitId");
                                    var planningUnitName = skillsSelect.options[skillsSelect.selectedIndex].text;

                                    var json = {
                                        'FUNDING_SOURCE_ID': fs.fundingSourceId,
                                        'PROCUREMENT_AGENT_ID': fs.procurementAgentId,
                                        'fundingsource': fs.fundingSourceName,
                                        'procurementAgent': fs.procurementAgentName,
                                        'PLANNING_UNIT_ID': document.getElementById('planningUnitId').value,
                                        'planningUnit': planningUnitName

                                    };

                                    for (var j = 0; j < myArray.length; j++) {
                                        json[myArray[j].from] = myArray[j].cost;
                                    }
                                    outPutList.push(json);
                                });
                                console.log("9----", outPutList);
                                this.setState({ outPutList: outPutList });
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                alert("in else online version");
                console.log("json---", json);
                AuthenticationService.setupAxiosInterceptors();
                ReportService.getAnnualShipmentCost(json)
                    .then(response => {
                        console.log("-----response", JSON.stringify(response.data));
                        var outPutList = [];
                        var responseData = response.data;
                        for (var i = 0; i < responseData.length; i++) {
                            var shipmentAmt = responseData[i].shipmentAmt;
                            var json = {
                                'FUNDING_SOURCE_ID': responseData[i].fundingSource.id,
                                'PROCUREMENT_AGENT_ID': responseData[i].procurementAgent.id,
                                'fundingsource': getLabelText(responseData[i].fundingSource.label, this.state.lang),
                                'procurementAgent': getLabelText(responseData[i].procurementAgent.label, this.state.lang),
                                'PLANNING_UNIT_ID': responseData[i].planningUnit.id,
                                'planningUnit': getLabelText(responseData[i].planningUnit.label, this.state.lang)
                            }
                            for (var key in shipmentAmt) {
                                var keyName = key.split("-")[1];
                                var keyValue = shipmentAmt[key];
                                console.log("keyName--", keyName);
                                console.log("keyValue--", keyValue);
                                json[keyName] = keyValue;
                            }
                            outPutList.push(json);
                        }
                        console.log("json final---", json);
                        this.setState({
                            outPutList: outPutList
                        })
                    }).catch(
                        error => {
                            this.setState({
                                outPutList: []
                            })
                            if (error.message === "Network Error") {
                                this.setState({ message: error.message });
                            } else {
                                switch (error.response ? error.response.status : "") {
                                    case 500:
                                    case 401:
                                    case 404:
                                    case 406:
                                    case 412:
                                        this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                        break;
                                    default:
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                }
                            }
                        }
                    );
            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [] });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

        }
    }

    render() {

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
                        {item.versionId}
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
            }, this)

        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const columns = [
            {
                dataField: 'planningUnit.label',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'quantity',
                text: 'Quantity',
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
                dataField: 'batchNo',
                text: 'Batch Number',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                // formatter: (cell, row) => {
                //     cell += '';
                //     var x = cell.split('.');
                //     var x1 = x[0];
                //     var x2 = x.length > 1 ? '.' + x[1] : '';
                //     var rgx = /(\d+)(\d{3})/;
                //     while (rgx.test(x1)) {
                //         x1 = x1.replace(rgx, '$1' + ',' + '$2');
                //     }
                //     return x1 + x2;
                // }

            },
            {
                dataField: 'expDate',
                text: 'Expiry Date',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cellContent, row) => {
                    return (
                        (row.expDate ? moment(row.expDate).format(`${DATE_FORMAT_CAP}`) : null)
                        // (row.lastLoginDate ? moment(row.lastLoginDate).format('DD-MMM-YY hh:mm A') : null)
                    );
                }
                // formatter: (cell, row) => {
                //     var decimalFixedValue = cell.toFixed(2);
                //     decimalFixedValue += '';
                //     var x = decimalFixedValue.split('.');
                //     var x1 = x[0];
                //     var x2 = x.length > 1 ? '.' + x[1] : '';
                //     var rgx = /(\d+)(\d{3})/;
                //     while (rgx.test(x1)) {
                //         x1 = x1.replace(rgx, '$1' + ',' + '$2');
                //     }
                //     return x1 + x2;
                // }

            },
            // formatter: (cell, row) => {
            //     return new moment(cell).format('MMM-DD-YYYY');
            // }

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
                {/* <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6> */}
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />*/}
                {/* <h5>{i18n.t(this.props.match.params.message)}</h5> */}
                <h5>{i18n.t(this.state.message)}</h5>
                <Card>
                    <CardHeader className="pb-1">
                        <i className="icon-menu"></i><strong>Expired Inventory</strong>
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                {true && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />}
                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                            </a>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="TableCust" >
                            <div ref={ref}>
                                {/* <Form > */}
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls edit">

                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: 2013 }}
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
                                                        // onChange={this.getProductCategories}
                                                        onChange={this.filterVersion}

                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {programList}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionId"
                                                        id="versionId"
                                                        bsSize="sm"
                                                    // onChange={(e) => { this.getPlanningUnit(); }}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.select')}</option>
                                                        {versionList}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Col>
                                {/* </Form> */}
                                <ToolkitProvider
                                    keyField="id"
                                    data={this.state.outPutList}
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
                                                    pagination={paginationFactory(tabelOptions)}
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
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}