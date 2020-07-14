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
import {
    SECRET_KEY, DATE_FORMAT_CAP,
    MONTHS_IN_PAST_FOR_SUPPLY_PLAN,
    TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN,
    PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN, MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS, PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DEFAULT_MAX_MONTHS_OF_STOCK, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INVENTORY_DATA_SOURCE_TYPE, SHIPMENT_DATA_SOURCE_TYPE, QAT_DATA_SOURCE_ID, FIRST_DATA_ENTRY_DATE
} from '../../Constants.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService';
import ShipmentStatusService from '../../api/ShipmentStatusService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import FundingSourceService from '../../api/FundingSourceService';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
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
            // "procurementAgentId": document.getElementById("procurementAgentId").value,
            // "planningUnitId": document.getElementById("planningUnitId").value,
            // "fundingSourceId": document.getElementById("fundingSourceId").value,
            // "shipmentStatusId": document.getElementById("shipmentStatusId").value,
            // "startDate": this.state.rangeValue.from.year + '-' + ("00" + this.state.rangeValue.from.month).substr(-2) + '-01',
            // "stopDate": this.state.rangeValue.to.year + '-' + ("00" + this.state.rangeValue.to.month).substr(-2) + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
            // "reportbaseValue": document.getElementById("view").value,

        }

        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let myStartDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let myEndDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        // let planningUnitId = document.getElementById("planningUnitId").value;
        // let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        // let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        // let reportbaseValue = document.getElementById("view").value;

        if (programId > 0 && versionId != 0) {
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
                        var regionList = [];
                        for (var i = 0; i < programJson.regionList.length; i++) {
                            var regionJson = {
                                // name: // programJson.regionList[i].regionId,
                                name: getLabelText(programJson.regionList[i].label, this.state.lang),
                                id: programJson.regionList[i].regionId
                            }
                            regionList.push(regionJson);

                        }
                        var regionListFiltered = regionList;
                        //=============expired inventory code

                        // Calculations for exipred stock
                        var batchInfoForPlanningUnit = programJson.batchInfoList;
                        // .filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                        var myArray = batchInfoForPlanningUnit.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
                        for (var ma = 0; ma < myArray.length; ma++) {

                            //**** shipment
                            var shipmentList = programJson.shipmentList;
                            var shipmentBatchArray = [];
                            for (var ship = 0; ship < shipmentList.length; ship++) {
                                var batchInfoList = shipmentList[ship].batchInfoList;
                                for (var bi = 0; bi < batchInfoList.length; bi++) {
                                    shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                                }
                            }

                            var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == myArray[ma].batchNo)[0];
                            var totalStockForBatchNumber = stockForBatchNumber.qty;


                            //**** consumption
                            var consumptionList = programJson.consumptionList;
                            var consumptionBatchArray = [];

                            for (var con = 0; con < consumptionList.length; con++) {
                                var batchInfoList = consumptionList[con].batchInfoList;
                                for (var bi = 0; bi < batchInfoList.length; bi++) {
                                    consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                                }
                            }
                            var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                            if (consumptionForBatchNumber == undefined) {
                                consumptionForBatchNumber = [];
                            }
                            var consumptionQty = 0;
                            for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                                consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                            }

                            //**** inventory
                            var inventoryList = programJson.inventoryList;
                            var inventoryBatchArray = [];
                            for (var inv = 0; inv < inventoryList.length; inv++) {
                                var batchInfoList = inventoryList[inv].batchInfoList;
                                for (var bi = 0; bi < batchInfoList.length; bi++) {
                                    inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                                }
                            }
                            var inventoryForBatchNumber = [];
                            if (inventoryBatchArray.length > 0) {
                                inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                            }
                            if (inventoryForBatchNumber == undefined) {
                                inventoryForBatchNumber = [];
                            }
                            var adjustmentQty = 0;
                            for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                                adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                            }

                            //**  remaning batch quantity
                            var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                            myArray[ma].remainingQty = remainingBatchQty;
                        }
                        console.log("MyArray", myArray);

                        var consumptionList = (programJson.consumptionList).filter(c => c.active == true);
                        var inventoryList = (programJson.inventoryList).filter(c => c.active == true);
                        var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                        var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");

                        // var curDate = moment(this.state.monthsArray[TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN - 1].startDate).subtract(1, 'months').format("YYYY-MM-DD");
                        var curDate = '2021-07-01';

                        for (var i = 0; createdDate < curDate; i++) {

                            createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                            var consumptionQty = 0;
                            var unallocatedConsumptionQty = 0;
                            var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                            var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");

                            var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                            console.log("--------------------------------------------------------------");
                            console.log("Start date", startDate);


                            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].id);
                                for (var j = 0; j < c.length; j++) {
                                    var count = 0;
                                    for (var k = 0; k < c.length; k++) {
                                        if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                            count++;
                                        } else {

                                        }
                                    }
                                    if (count == 0) {

                                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                        var qty = 0;
                                        if (c[j].batchInfoList.length > 0) {
                                            for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                            }
                                        }
                                        var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                        // unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                                        unallocatedConsumptionQty = parseInt(remainingQty);

                                        var batchDetailsForParticularPeriodForPlanningUnit = batchDetailsForParticularPeriod.filter(p => p.planningUnitId == c[j].planningUnit.id);

                                        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriodForPlanningUnit.length > 0 && ua < batchDetailsForParticularPeriodForPlanningUnit.length; ua++) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty), "Batch no", batchDetailsForParticularPeriodForPlanningUnit[ua].batchNo);
                                            console.log("Unallocated consumption", unallocatedConsumptionQty);
                                            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriodForPlanningUnit[ua].batchNo);
                                            if (parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
                                                myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
                                                unallocatedConsumptionQty = 0
                                            } else {
                                                var rq = batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty;
                                                myArray[index].remainingQty = 0;
                                                unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                                            }
                                        }

                                    } else {
                                        if (c[j].actualFlag.toString() == 'true') {
                                            consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                            var qty = 0;
                                            if (c[j].batchInfoList.length > 0) {
                                                for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                    qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                }
                                            }
                                            var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                            // unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                                            unallocatedConsumptionQty = parseInt(remainingQty);

                                            var batchDetailsForParticularPeriodForPlanningUnit = batchDetailsForParticularPeriod.filter(p => p.planningUnitId == c[j].planningUnit.id);

                                            for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriodForPlanningUnit.length > 0 && ua < batchDetailsForParticularPeriodForPlanningUnit.length; ua++) {
                                                console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty), "Batch no", batchDetailsForParticularPeriodForPlanningUnit[ua].batchNo);
                                                console.log("Unallocated consumption", unallocatedConsumptionQty);
                                                var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriodForPlanningUnit[ua].batchNo);
                                                if (parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
                                                    myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
                                                    unallocatedConsumptionQty = 0
                                                } else {
                                                    var rq = batchDetailsForParticularPeriodForPlanningUnit[ua].remainingQty;
                                                    myArray[index].remainingQty = 0;
                                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                                                }
                                            }


                                        }
                                    }
                                }
                            }

                            var adjustmentQty = 0;
                            var unallocatedAdjustmentQty = 0;
                            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                                for (var j = 0; j < c.length; j++) {
                                    adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                    var qty1 = 0;
                                    if (c[j].batchInfoList.length > 0) {
                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                            qty1 += parseFloat(parseInt((c[j].batchInfoList)[a].adjustmentQty) * c[j].multiplier);
                                        }
                                    }
                                    var remainingQty = parseFloat((c[j].adjustmentQty * c[j].multiplier)) - parseFloat(qty1);
                                    unallocatedAdjustmentQty = parseFloat(remainingQty);

                                    var batchDetailsForParticularPeriodForPlanningUnit = batchDetailsForParticularPeriod.filter(p => p.planningUnitId == c[j].planningUnit.id);

                                    if (unallocatedAdjustmentQty < 0) {
                                        for (var ua = batchDetailsForParticularPeriodForPlanningUnit.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriodForPlanningUnit.length > 0 && ua != 0; ua--) {
                                            console.log("ua============>", ua)
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriodForPlanningUnit[ua - 1].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);

                                            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriodForPlanningUnit[ua - 1].batchNo);
                                            if (parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                                myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                                unallocatedAdjustmentQty = 0
                                            } else {
                                                var rq = batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty;
                                                myArray[index].remainingQty = 0;
                                                unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                            }
                                        }
                                    } else {
                                        if (batchDetailsForParticularPeriodForPlanningUnit.length > 0) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriodForPlanningUnit[0].remainingQty), "Batch no", batchDetailsForParticularPeriodForPlanningUnit[0].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                            batchDetailsForParticularPeriodForPlanningUnit[0].remainingQty = batchDetailsForParticularPeriodForPlanningUnit[0].remainingQty + unallocatedAdjustmentQty;
                                            unallocatedAdjustmentQty = 0;
                                        }
                                    }

                                }
                            }


                            var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                            for (var j = 0; j < c1.length; j++) {

                                adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));

                                var batchDetailsForParticularPeriodForPlanningUnit = batchDetailsForParticularPeriod.filter(p => p.planningUnitId == c1[j].planningUnit.id);

                                if (unallocatedAdjustmentQty < 0) {
                                    for (var ua = batchDetailsForParticularPeriodForPlanningUnit.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriodForPlanningUnit.length > 0 && ua != 0; ua--) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriodForPlanningUnit[ua - 1].batchNo);
                                        console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                        var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriodForPlanningUnit[ua - 1].batchNo);
                                        if (parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                            myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                            unallocatedAdjustmentQty = 0
                                        } else {
                                            var rq = batchDetailsForParticularPeriodForPlanningUnit[ua - 1].remainingQty;
                                            myArray[index].remainingQty = 0;
                                            unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                        }
                                    }
                                } else {
                                    if (batchDetailsForParticularPeriod.length > 0) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                        console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                        batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                        unallocatedAdjustmentQty = 0;
                                    }
                                }
                            }

                        }

                        var dateFilterMyArray = myArray.filter(c => c.expiryDate >= moment(myStartDate).format('YYYY-MM-DD') && c.expiryDate <= moment(myEndDate).format('YYYY-MM-DD') && c.remainingQty > 0);
                        console.log("My array after accounting all the calculations", dateFilterMyArray);
                        // var expiredStockArr = myArray;
                        // console.log(myEndDate+"======"+myStartDate);


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
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>Expired Inventory</strong> */}
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                {true && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />}
                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0">
                        {/* <div className="TableCust" > */}
                        {/* <div ref={ref}> */}
                        <Form >
                            <Col md="12 pl-0">
                                <div className="d-md-flex Selectdiv2">
                                    <FormGroup className="tab-ml-1">
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
                                    <FormGroup className="tab-ml-1">
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
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                        <div className="controls ">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="versionId"
                                                    id="versionId"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.fetchData(); }}
                                                >
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {versionList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </div>
                            </Col>
                        </Form>
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
                        {/* </div> */}
                        {/* </div> */}
                    </CardBody>
                </Card>
            </div>
        );
    }
}