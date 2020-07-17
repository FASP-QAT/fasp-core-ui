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

const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
class AnnualShipmentCost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            matricsList: [],
            dropdownOpen: false,
            radioSelected: 2,
            productCategories: [],
            planningUnits: [],
            categories: [],
            countries: [],
            procurementAgents: [],
            shipmentStatuses: [],
            fundingSources: [],
            show: false,
            programs: [],
            versions: [],
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            outPutList: [],
            message: '',
        };
        this.fetchData = this.fetchData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this)
        this.getPrograms = this.getPrograms.bind(this);
        this.getProcurementAgentList = this.getProcurementAgentList.bind(this);
        this.getFundingSourceList = this.getFundingSourceList.bind(this);
        this.getShipmentStatusList = this.getShipmentStatusList.bind(this);
        this.filterVersion = this.filterVersion.bind(this);
        //this.pickRange = React.createRef()

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
                                this.setState({ outPutList: outPutList,message:'' });
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                // alert("in else online version");
                console.log("json---", json);
                AuthenticationService.setupAxiosInterceptors();
                ReportService.getAnnualShipmentCost(json)
                    .then(response => {
                        console.log("-----response", JSON.stringify(response.data));
                        var outPutList=[];
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
                                var keyName=key.split("-")[1];
                                var keyValue=shipmentAmt[key];
                                console.log("keyName--",keyName);
                                console.log("keyValue--",keyValue);
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
    formatter = value => {

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
    show() {
        /* if (!this.state.showed) {
             setTimeout(() => {this.state.closeable = true}, 250)
             this.setState({ showed: true })
         }*/
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

    initalisedoc = () => {
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
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {
            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')

            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(18)
                doc.setPage(i)

                doc.addImage(LOGO, 'png', 0, 10, 180, 50, '', 'FAST');

                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.annualshipmentcost'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(7)
                    var splittext = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width / 8, 80, splittext)
                    splittext = doc.splitTextToSize('Run Date:' + moment(new Date()).format(`${DATE_FORMAT_CAP}`) + '\n Run Time:' + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width * 3 / 4, 80, splittext)
                    doc.setFontSize(8)
                    doc.text('Cost of product + Freight', doc.internal.pageSize.width / 2, 90, {
                        align: 'center'
                    })
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 2, 100, {
                        align: 'center'
                    })
                    // doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                    //     align: 'left'
                    // })
                    doc.text(i18n.t('static.procurementagent.procurementagent') + ' : ' + document.getElementById("procurementAgentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 120, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.dashboard.fundingsource') + ' : ' + document.getElementById("fundingSourceId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 140, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.common.status') + ' : ' + document.getElementById("shipmentStatusId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                }
            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(9);
        doc.setTextColor("#002f6c");
        doc.setFont('helvetica', 'bold')
        doc.text(i18n.t('static.procurementagent.procurementagent'), doc.internal.pageSize.width / 8, 180, {
            align: 'left'
        })
        doc.text(i18n.t(i18n.t('static.fundingsource.fundingsource')), doc.internal.pageSize.width / 8, 190, {
            align: 'left'
        })
        doc.text(i18n.t('static.planningunit.planningunit'), doc.internal.pageSize.width / 8, 200, {
            align: 'left'
        })
        doc.line(50, 210, doc.internal.pageSize.width - 50, 210);
        var year = [];
        for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
            year.push(from);
        }
        var year = ['2019', '2020']//[...new Set(this.state.matricsList.map(ele=>(ele.YEAR)))]//;
        //var data = this.state.outPutList;
        var data = [{ 2019: 17534, 2020: 0, PROCUREMENT_AGENT_ID: 1, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "USAID", procurementAgent: "PSM", planningUnit: "Ceftriaxone 1 gm Powder Vial, 50" },
        { 2019: 15234, 2020: 0, PROCUREMENT_AGENT_ID: 1, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "PEPFAR", procurementAgent: "PSM", planningUnit: "Ceftriaxone 1 gm Powder Vial, 50" },
        { 2019: 0, 2020: 17234, PROCUREMENT_AGENT_ID: 2, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "USAID", procurementAgent: "GF", planningUnit: "Ceftriaxone 1 gm Powder Vial, 50" }]
        //this.state.matricsList;//[['GHSC-PSM \n PEPFAR \nplanning unit 1', 200000, 300000], ['PPM \nGF \n planning unit 1', 15826, 2778993]]
        var index = doc.internal.pageSize.width / (year.length + 3);
        var initalvalue = index + 10
        for (var i = 0; i < year.length; i++) {
            initalvalue = initalvalue + index
            doc.text(year[i].toString(), initalvalue, 180, {
                align: 'left',
            })
        }
        initalvalue += index
        doc.text('Total', initalvalue, 180, {
            align: 'left'
        })
        initalvalue = 10
        var yindex = 250
        var totalAmount = []
        var GrandTotalAmount = []
        for (var j = 0; j < data.length; j++) {
            if (yindex > doc.internal.pageSize.height - 50) { doc.addPage(); yindex = 90 } else { yindex = yindex }
            var record = data[j]

            var keys = Object.entries(record).map(([key, value]) => (key)
            )

            var values = Object.entries(record).map(([key, value]) => (value)
            )
            var total = 0
            var splittext = doc.splitTextToSize(record.procurementAgent + '\n' + record.fundingsource + '\n' + record.planningUnit, index);

            doc.text(doc.internal.pageSize.width / 8, yindex, splittext)
            initalvalue = initalvalue + index
            for (var x = 0; x < year.length; x++) {
                for (var n = 0; n < keys.length; n++) {
                    if (year[x] == keys[n]) {
                        total = total + values[n]
                        initalvalue = initalvalue + index
                        totalAmount[x] = totalAmount[x] == null ? values[n] : totalAmount[x] + values[n]
                        GrandTotalAmount[x] = GrandTotalAmount[x] == null ? values[n] : GrandTotalAmount[x] + values[n]
                        doc.setFont('helvetica', 'normal')
                        doc.text(this.formatter(values[n]).toString(), initalvalue, yindex, {
                            align: 'left'
                        })
                    }
                }
            }
            doc.setFont('helvetica', 'bold')
            doc.text(this.formatter(total).toString(), initalvalue + index, yindex, {
                align: 'left'
            });
            totalAmount[year.length] = totalAmount[x] == null ? total : totalAmount[year.length] + total
            GrandTotalAmount[year.length] = GrandTotalAmount[year.length] == null ? total : GrandTotalAmount[year.length] + total
            if (j < data.length - 1) {
                if (data[j].PROCUREMENT_AGENT_ID != data[j + 1].PROCUREMENT_AGENT_ID || data[j].FUNDING_SOURCE_ID != data[j + 1].FUNDING_SOURCE_ID) {
                    yindex = yindex + 40
                    initalvalue = 10
                    doc.setLineDash([2, 2], 0);
                    doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
                    yindex += 20
                    initalvalue = initalvalue + index
                    doc.text("Total", doc.internal.pageSize.width / 8, yindex, {
                        align: 'left'
                    });
                    var Gtotal = 0
                    for (var l = 0; l < totalAmount.length; l++) {
                        initalvalue += index;
                        Gtotal = Gtotal + totalAmount[l]
                        doc.text(this.formatter(totalAmount[l]).toString(), initalvalue, yindex, {
                            align: 'left'
                        })
                        totalAmount[l] = 0;
                    }
                } else {

                }
            } if (j == data.length - 1) {
                yindex = yindex + 40
                initalvalue = 10
                doc.setLineDash([2, 2], 0);
                doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
                yindex += 20
                initalvalue = initalvalue + index
                doc.text("Total", doc.internal.pageSize.width / 8, yindex, {
                    align: 'left'
                });
                var Gtotal = 0
                for (var l = 0; l < totalAmount.length; l++) {
                    initalvalue += index;
                    Gtotal = Gtotal + totalAmount[l]
                    doc.text(this.formatter(totalAmount[l]).toString(), initalvalue, yindex, {
                        align: 'left'
                    })
                }
            }
            yindex = yindex + 40
            initalvalue = 10

        }
        initalvalue = 10
        initalvalue += index;
        doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
        yindex += 20
        doc.setFontSize(9);
        doc.text("Grand Total", doc.internal.pageSize.width / 8, yindex, {
            align: 'left'
        });
        var Gtotal = 0
        for (var l = 0; l < GrandTotalAmount.length; l++) {
            initalvalue += index;
            Gtotal = Gtotal + GrandTotalAmount[l]
            doc.text(this.formatter(GrandTotalAmount[l]).toString(), initalvalue, yindex, {
                align: 'left'
            })
        }
        doc.text(this.formatter(Gtotal).toString(), initalvalue + index, yindex, {
            align: 'left'
        });
        doc.setFontSize(8);


        /* var canvas = document.getElementById("cool-canvas");
         //creates image
         
         var canvasImg = canvas.toDataURL("image/png",1.0);
         var width = doc.internal.pageSize.width;    
         var height = doc.internal.pageSize.height;
         var h1=50;
         var aspectwidth1= (width-h1);*/

        // doc.addHTML(document.getElementById('div_id'), 10, 120);
        addHeaders(doc)
        addFooters(doc)
        doc.autoTable({ pagesplit: true })
        return doc;
    }
    exportPDF = () => {
        var doc = this.initalisedoc()
        doc.save("AnnualShipmentCost.pdf")

    }
    previewPDF = () => {
        var doc = this.initalisedoc()
        var string = doc.output('datauristring');
        var embed = "<embed width='100%' height='100%' src='" + string + "'/>"
        document.getElementById("pdf").innerHTML = embed
        /* var x = window.open();
         x.document.open();
         x.document.write(embed);
         x.document.close();*/
    }



    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
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
                        outPutList: []

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

    // getPlanningUnit() {

    //     AuthenticationService.setupAxiosInterceptors();
    //     let productCategoryId = document.getElementById("productCategoryId").value;
    //     PlanningUnitService.getPlanningUnitByProductCategoryId(productCategoryId).then(response => {
    //         console.log('**' + JSON.stringify(response.data))
    //         this.setState({
    //             planningUnits: response.data,
    //         })
    //     })
    //         .catch(
    //             error => {
    //                 this.setState({
    //                     planningUnits: [],
    //                 })
    //                 if (error.message === "Network Error") {
    //                     this.setState({ message: error.message });
    //                 } else {
    //                     switch (error.response ? error.response.status : "") {
    //                         case 500:
    //                         case 401:
    //                         case 404:
    //                         case 406:
    //                         case 412:
    //                             this.setState({ message: error.response.data.messageCode });
    //                             break;
    //                         default:
    //                             this.setState({ message: 'static.unkownError' });
    //                             break;
    //                     }
    //                 }
    //             }
    //         );
    //     this.fetchData();
    // }

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
                var openRequest = indexedDB.open('fasp', 1);
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
                            if (myResult[i].program.id == programId) {

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
                AuthenticationService.setupAxiosInterceptors();

                //let productCategoryId = document.getElementById("productCategoryId").value;
                ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
                    console.log('**' + JSON.stringify(response.data))
                    this.setState({
                        planningUnits: response.data, message: ''
                    }, () => {
                        this.fetchData();
                    })
                })
                    .catch(
                        error => {
                            this.setState({
                                planningUnits: [],
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
                                        this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                                        break;
                                    default:
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                }
                            }
                        }
                    );
            }
        });

    }

    getProductCategories() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    productCategories: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        productCategories: []
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
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getFundingSourceList() {
        const { fundingSources } = this.state
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    this.setState({
                        fundingSources: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            countrys: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.fundingsource.fundingsource') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db3;
            var fSourceResult = [];
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db3 = e.target.result;
                var fSourceTransaction = db3.transaction(['fundingSource'], 'readwrite');
                var fSourceOs = fSourceTransaction.objectStore('fundingSource');
                var fSourceRequest = fSourceOs.getAll();
                fSourceRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                fSourceRequest.onsuccess = function (event) {

                    fSourceResult = fSourceRequest.result;
                    console.log("funding source list offline--->", fSourceResult);
                    this.setState({ fundingSources: fSourceResult });

                }.bind(this)

            }.bind(this)


        }

    }
    getProcurementAgentList() {
        const { procurementAgents } = this.state
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();

            ProcurementAgentService.getProcurementAgentListAll()
                .then(response => {
                    this.setState({
                        procurementAgents: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            countrys: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.procurementagent.procurementagent') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db1;
            var papuResult = [];
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgent');
                var papuRequest = papuOs.getAll();
                papuRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                papuRequest.onsuccess = function (event) {

                    papuResult = papuRequest.result;
                    console.log("procurement agent list offline--->", papuResult);
                    this.setState({ procurementAgents: papuResult });
                }.bind(this)

            }.bind(this)

        }
    }
    getShipmentStatusList() {
        const { shipmentStatuses } = this.state
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            ShipmentStatusService.getShipmentStatusListActive()
                .then(response => {
                    this.setState({
                        shipmentStatuses: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            countrys: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.common.status') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db2;
            var sStatusResult = [];
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db2 = e.target.result;
                var sStatusTransaction = db2.transaction(['shipmentStatus'], 'readwrite');
                var sStatusOs = sStatusTransaction.objectStore('shipmentStatus');
                var sStatusRequest = sStatusOs.getAll();
                sStatusRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                sStatusRequest.onsuccess = function (event) {
                    sStatusResult = sStatusRequest.result;
                    console.log("shipment status list offline--->", sStatusResult);
                    this.setState({ shipmentStatuses: sStatusResult });
                }.bind(this)

            }.bind(this)


        }
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.getPrograms();
        this.getProcurementAgentList()
        this.getFundingSourceList()
        this.getShipmentStatusList()
        // this.getProductCategories()
    }

    render() {
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
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnit.id}>
                        {getLabelText(item.planningUnit.label, this.state.lang)}
                    </option>
                )
            }, this);

        // const { planningUnits } = this.state
        // let planningUnitList = planningUnits.length > 0
        //     && planningUnits.map((item, i) => {
        //         return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

        //     }, this);

        const { procurementAgents } = this.state;
        // console.log(JSON.stringify(countrys))
        let procurementAgentList = procurementAgents.length > 0 && procurementAgents.map((item, i) => {
            console.log(JSON.stringify(item))
            return (
                <option key={i} value={item.procurementAgentId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        const { fundingSources } = this.state;
        let fundingSourceList = fundingSources.length > 0 && fundingSources.map((item, i) => {
            console.log(JSON.stringify(item))
            return (
                <option key={i} value={item.fundingSourceId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        const { shipmentStatuses } = this.state;
        let shipmentStatusList = shipmentStatuses.length > 0 && shipmentStatuses.map((item, i) => {
            return (
                <option key={i} value={item.shipmentStatusId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        // const { productCategories } = this.state;
        // let productCategoryList = productCategories.length > 0
        //     && productCategories.map((item, i) => {
        //         return (
        //             <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
        //                 {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
        //             </option>
        //         )
        //     }, this);

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
                {/* <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6> */}
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />*/}
                {/* <h5>{i18n.t(this.props.match.params.message)}</h5> */}
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.annualshipmentcost')}</strong> */}
                        <div className="card-header-actions">

                            <a className="card-header-action">

                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0 CardBodyMargin">
                        <div className="TableCust" >
                            <div ref={ref}>
                                <Form >
                                    <Col md="12 pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.reportbase')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="view"
                                                            id="view"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="1">{i18n.t('static.common.shippingdate')}</option>
                                                            <option value="2">{i18n.t('static.common.receivedate')}</option>

                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
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
                                            {/* <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="productCategoryId"
                                                        id="productCategoryId"
                                                        bsSize="sm"
                                                        onChange={this.getPlanningUnit}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {productCategoryList}
                                                    </Input>

                                                </InputGroup>
                                            </div>

                                        </FormGroup> */}

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                                <div className="controls ">
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

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {planningUnitList}
                                                        </Input>
                                                        {/* <InputGroupAddon addonType="append">
                                    <Button color="secondary Gobtn btn-sm" onClick={this.fetchData}>{i18n.t('static.common.go')}</Button>
                                  </InputGroupAddon> */}
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="procurementAgentId"
                                                            id="procurementAgentId"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.all')}</option>
                                                            {procurementAgentList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.fundingsource.fundingsource')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="fundingSourceId"
                                                            id="fundingSourceId"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.all')}</option>
                                                            {fundingSourceList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="shipmentStatusId"
                                                            id="shipmentStatusId"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.all')}</option>
                                                            {shipmentStatusList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                        </div>
                                    </Col>
                                </Form>
                                <Col md="12 pl-0">

                                    <div className="row">
                                        <div className="col-md-12 p-0" id="div_id">
                                            {this.state.outPutList.length > 0 &&
                                                // {true &&
                                                <div className="col-md-12">

                                                    <button className="mr-1 float-right btn btn-info btn-md showdatabtn mt-1 mb-3" onClick={this.previewPDF}>Preview</button>

                                                    <p style={{ width: '100%', height: '700px', overflow: 'hidden' }} id='pdf'></p>   </div>}

                                        </div>
                                    </div>
                                </Col>



                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default AnnualShipmentCost;