import React, { Component, lazy ,useState} from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
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
                    fontColor: 'black'
                }
            }
        ], xAxes: [{
            ticks: {
                fontColor: 'black'
            }
        }]
    },
    tooltips: {
        mode: 'index',
        enabled: false,
        custom: CustomTooltips
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
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



        }


        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }
    formatAmc=value=>{
      return  Math.ceil(value)
    }
    dateFormatter=value=>{
        return moment(value).format('MMM YY')
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

    handlePlanningUnitChange = (event) => {
      console.log('***',event)
        var planningUnitIds=event
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

     unCheck=()=> {
        
       // document.querySelectorAll('.planningUnitId').forEach(e => {console.log('********',e)})
        /*var x = document.getElementById("planningUnitId");
        for(var i=0; i<=x.length; i++) {
           x[i].checked = false;
         }   */
      }
      unCheck1=(e)=> {
        console.log('uncheck',e)
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
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryrealmIdById(realmId)
            .then(response => {
                this.setState({
                    countries: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        countries: []
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
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getPrograms = () => {
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

    updateMonthsforAMCCalculations = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                this.setState({
                    monthsInPastForAmc: 0,
                    monthsInFutureForAmc: 0
                },()=>{this.fetchData()})

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
        let programId = document.getElementById("programId").value;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (navigator.onLine) {
                    this.setState({
                        versions: [],
                        planningUnits:[],
                        planningUnitValues: [],
                        planningUnitLabels: []
                    }, () => {this.unCheck();
                        this.setState({
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });


                } else {
                    this.setState({
                        versions: [],
                        planningUnits:[],
                        planningUnitValues: [],
                        planningUnitLabels: []
                       
                    }, () => { this.unCheck();
                        this.consolidatedVersionList(programId) })
                }
            } else {

                this.setState({
                    versions: [],planningUnits:[],
                    planningUnitValues: [],
                        planningUnitLabels: []
                   
                },()=>{this.unCheck();})

            }
        } else {
            this.setState({
                versions: [],planningUnits:[],
                planningUnitValues: [],
                        planningUnitLabels: []
            
            },()=>{this.unCheck();})
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
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
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

    componentDidMount() {

        this.getPrograms();


    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    fetchData() {
        let planningUnitIds = this.state.planningUnitValues.map(ele=>(ele.value).toString())
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
      
        let monthsInFutureForAmc = this.state.monthsInFutureForAmc
        let monthsInPastForAmc = this.state.monthsInPastForAmc
        console.log(monthsInFutureForAmc,monthsInPastForAmc)
        if (planningUnitIds.length > 0 && versionId != 0 && programId > 0 && monthsInFutureForAmc!=undefined && monthsInPastForAmc!=undefined &&monthsInFutureForAmc!=0 && monthsInPastForAmc!=0) {
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
                        console.log('in')
                        planningUnitIds.map(planningUnitId => {

                            var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
                            var myArray = batchInfoForPlanningUnit.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
                            for (var ma = 0; ma < myArray.length; ma++) {
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
                              var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                              myArray[ma].remainingQty = remainingBatchQty;
                            }
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                            var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]
                
                            var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                            var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                            var shipmentList = []
                            // if (document.getElementById("includePlanningShipments").selectedOptions[0].value.toString() == 'true') {
                            shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != 8 && c.accountFlag == true);
                            // } else {
                            //   shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != 8 && c.shipmentStatus.id != 1 && c.shipmentStatus.id != 2 && c.shipmentStatus.id != 9 && c.accountFlag == true);
                
                            // }
                            // calculate openingBalance
                
                            // let invmin=moment.min(inventoryList.map(d => moment(d.inventoryDate)))
                            // let shipmin = moment.min(shipmentList.map(d => moment(d.expectedDeliveryDate)))
                            // let conmin =  moment.min(consumptionList.map(d => moment(d.consumptionDate)))
                            // var minDate = invmin.isBefore(shipmin)&&invmin.isBefore(conmin)?invmin:shipmin.isBefore(invmin)&& shipmin.isBefore(conmin)?shipmin:conmin
                            var minDate = moment(FIRST_DATA_ENTRY_DATE);
                            var openingBalance = 0;
                            console.log('minDate', minDate, 'startDate', startDate)
                            if (minDate.isBefore(startDate.format('YYYY-MM-DD')) && !minDate.isSame(startDate.format('YYYY-MM-DD'))) {
                            
                              /*  var consumptionRemainingList = consumptionList.filter(c => moment(c.consumptionDate).isBefore(minDate));
                              console.log('consumptionRemainingList', consumptionRemainingList)
                              for (var j = 0; j < consumptionRemainingList.length; j++) {
                                var count = 0;
                                for (var k = 0; k < consumptionRemainingList.length; k++) {
                                  if (consumptionRemainingList[j].consumptionDate == consumptionRemainingList[k].consumptionDate && consumptionRemainingList[j].region.id == consumptionRemainingList[k].region.id && j != k) {
                                    count++;
                                  } else {
                
                                  }
                                }
                                if (count == 0) {
                                  totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                                } else {
                                  if (consumptionRemainingList[j].actualFlag.toString() == 'true') {
                                    totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                                  }
                                }
                              }
                
                              var adjustmentsRemainingList = inventoryList.filter(c => moment(c.inventoryDate).isBefore(minDate));
                              for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                                totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                              }
                
                              var shipmentsRemainingList = shipmentList.filter(c => moment(c.expectedDeliveryDate).isBefore(minDate) && c.accountFlag == true);
                              console.log('shipmentsRemainingList', shipmentsRemainingList)
                              for (var j = 0; j < shipmentsRemainingList.length; j++) {
                                totalShipments += parseInt((shipmentsRemainingList[j].shipmentQty));
                              }
                              openingBalance = totalAdjustments - totalConsumption + totalShipments;*/
                              for (i = 1; ; i++) {
                                var dtstr = minDate.startOf('month').format('YYYY-MM-DD')
                                var enddtStr = minDate.endOf('month').format('YYYY-MM-DD')
                                console.log(dtstr, ' ', enddtStr)
                                var dt = dtstr
                                var consumptionQty = 0;
                                var unallocatedConsumptionQty = 0;
                
                                var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                
                                var actualFlag = false
                                for (var i = 0; i < programJson.regionList.length; i++) {
                
                                  var list = conlist.filter(c => c.region.id == programJson.regionList[i].regionId)
                                  console.log(list)
                                  if (list.length > 1) {
                                    for (var l = 0; l < list.length; l++) {
                                      if (list[l].actualFlag.toString() == 'true') {
                                        actualFlag = true;
                                        consumptionQty = consumptionQty + list[l].consumptionQty
                                        var qty = 0;
                                        if (list[l].batchInfoList.length > 0) {
                                            for (var a = 0; a < list[l].batchInfoList.length; a++) {
                                                qty += parseInt((list[l].batchInfoList)[a].consumptionQty);
                                            }
                                        }
                                        var remainingQty = parseInt((list[l].consumptionQty)) - parseInt(qty);
                                        unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                                      }
                                    }
                                  } else {
                                    consumptionQty = list.length == 0 ? consumptionQty : consumptionQty = consumptionQty + parseInt(list[0].consumptionQty)
                                    unallocatedConsumptionQty =list.length == 0 ?  unallocatedConsumptionQty:unallocatedConsumptionQty=unallocatedConsumptionQty +  parseInt(list[0].consumptionQty);
                                  }
                                }
                                var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(dtstr).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(dtstr).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                console.log("--------------------------------------------------------------");
                                console.log("Start date", startDate);
                                for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                    console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                    console.log("Unallocated consumption", unallocatedConsumptionQty);
                                    var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
                                    if (parseInt(batchDetailsForParticularPeriod[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
                                        myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
                                        unallocatedConsumptionQty = 0
                                    } else {
                                        var rq = batchDetailsForParticularPeriod[ua].remainingQty;
                                        myArray[index].remainingQty = 0;
                                        unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                                    }
                                }
                
                
                                var adjustmentQty = 0;
                                var unallocatedAdjustmentQty = 0;
                               
                                var invlist = inventoryList.filter(c => c.inventoryDate === enddtStr)
                
                                for (var i = 0; i < programJson.regionList.length; i++) {
                
                                  var list = invlist.filter(c => c.region.id == programJson.regionList[i].regionId)
                                  
                                    for (var l = 0; l < list.length; l++) {
                                      
                                        adjustmentQty += parseFloat((list[l].adjustmentQty * list[l].multiplier));
                                        var qty1 = 0;
                                        if (list[l].batchInfoList.length > 0) {
                                            for (var a = 0; a < list[l].batchInfoList.length; a++) {
                                                qty1 += parseFloat(parseInt((list[l].batchInfoList)[a].adjustmentQty) * list[l].multiplier);
                                            }
                                        }
                                        var remainingQty = parseFloat((list[l].adjustmentQty * list[l].multiplier)) - parseFloat(qty1);
                                        unallocatedAdjustmentQty = parseFloat(remainingQty);
                                        if (unallocatedAdjustmentQty < 0) {
                                            for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                                console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                                    myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                                    unallocatedAdjustmentQty = 0
                                                } else {
                                                    var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
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
                              var list1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                              for (var j = 0; j < list1.length; j++) {
                                  adjustmentQty += parseFloat((list1[j].adjustmentQty * list1[j].multiplier));
                                  unallocatedAdjustmentQty = parseFloat((list1[j].adjustmentQty * list1[j].multiplier));
                                  if (unallocatedAdjustmentQty < 0) {
                                      for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                          console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                          console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                          var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                          if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                              myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                              unallocatedAdjustmentQty = 0
                                          } else {
                                              var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
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
                
                
                
                
                
                
                
                
                
                
                
                
                
                          var expiredStockArr = myArray;
                                console.log(openingBalance)
                                console.log(inventoryList)
                                var invlist = inventoryList.filter(c => c.inventoryDate === enddtStr)
                                var adjustment = 0;
                                invlist.map(ele => adjustment = adjustment + (ele.adjustmentQty * ele.multiplier));
                                
                
                
                
                
                
                                var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                                var consumption = 0;
                                
                                console.log(programJson.regionList)
                                var actualFlag = false
                                for (var i = 0; i < programJson.regionList.length; i++) {
                
                                  var list = conlist.filter(c => c.region.id == programJson.regionList[i].regionId)
                                  console.log(list)
                                  if (list.length > 1) {
                                    for (var l = 0; l < list.length; l++) {
                                      if (list[l].actualFlag.toString() == 'true') {
                                        actualFlag = true;
                                        consumption = consumption + list[l].consumptionQty
                                      }
                                    }
                                  } else {
                                    consumption = list.length == 0 ? consumption : consumption = consumption + parseInt(list[0].consumptionQty)
                                  }
                                }
                
                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                var shiplist = shipmentList.filter(c => c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr)
                                var shipment = 0;
                                shiplist.map(ele => shipment = shipment + ele.shipmentQty);
                
                
                
                
                
                                var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(dtstr).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(enddtStr).format("YYYY-MM-DD"))));
                                var expiredStockQty = 0;
                                for (var j = 0; j < expiredStock.length; j++) {
                                    expiredStockQty += parseInt((expiredStock[j].remainingQty));
                                }
                
                
                
                
                                console.log('openingBalance', openingBalance, 'adjustment', adjustment, ' shipment', shipment, ' consumption', consumption)
                                var endingBalance = openingBalance + adjustment + shipment - consumption-expiredStockQty
                                console.log('endingBalance', endingBalance)
                
                                endingBalance = endingBalance < 0 ? 0 : endingBalance
                                openingBalance = endingBalance
                                minDate = minDate.add(1, 'month')
                
                                if (minDate.startOf('month').isAfter(startDate)) {
                                  break;
                                }
                              }
                            }
                            var monthstartfrom = this.state.rangeValue.from.month
                            for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                              var monthlydata = [];
                              for (var month = monthstartfrom; month <= 12; month++) {
                                var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                                var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                                console.log(dtstr, ' ', enddtStr)
                                var dt = dtstr
                                console.log(openingBalance)
                                var consumptionQty = 0;
                                var unallocatedConsumptionQty = 0;
                
                                var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                
                                var actualFlag = false
                                for (var i = 0; i < programJson.regionList.length; i++) {
                
                                  var list = conlist.filter(c => c.region.id == programJson.regionList[i].regionId)
                                  console.log(list)
                                  if (list.length > 1) {
                                    for (var l = 0; l < list.length; l++) {
                                      if (list[l].actualFlag.toString() == 'true') {
                                        actualFlag = true;
                                        consumptionQty = consumptionQty + list[l].consumptionQty
                                        var qty = 0;
                                        if (list[l].batchInfoList.length > 0) {
                                            for (var a = 0; a < list[l].batchInfoList.length; a++) {
                                                qty += parseInt((list[l].batchInfoList)[a].consumptionQty);
                                            }
                                        }
                                        var remainingQty = parseInt((list[l].consumptionQty)) - parseInt(qty);
                                        unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                                      }
                                    }
                                  } else {
                                    consumptionQty = list.length == 0 ? consumptionQty : consumptionQty = consumptionQty + parseInt(list[0].consumptionQty)
                                    unallocatedConsumptionQty =list.length == 0 ?  unallocatedConsumptionQty:unallocatedConsumptionQty=unallocatedConsumptionQty +  parseInt(list[0].consumptionQty);
                                  }
                                }
                                var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(dtstr).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(dtstr).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                console.log("--------------------------------------------------------------");
                                console.log("Start date", startDate);
                                for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                    console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                    console.log("Unallocated consumption", unallocatedConsumptionQty);
                                    var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
                                    if (parseInt(batchDetailsForParticularPeriod[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
                                        myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
                                        unallocatedConsumptionQty = 0
                                    } else {
                                        var rq = batchDetailsForParticularPeriod[ua].remainingQty;
                                        myArray[index].remainingQty = 0;
                                        unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                                    }
                                }
                
                
                                var adjustmentQty = 0;
                                var unallocatedAdjustmentQty = 0;
                               
                                var invlist = inventoryList.filter(c => c.inventoryDate === enddtStr)
                
                                for (var i = 0; i < programJson.regionList.length; i++) {
                
                                  var list = invlist.filter(c => c.region.id == programJson.regionList[i].regionId)
                                  
                                    for (var l = 0; l < list.length; l++) {
                                      
                                        adjustmentQty += parseFloat((list[l].adjustmentQty * list[l].multiplier));
                                        var qty1 = 0;
                                        if (list[l].batchInfoList.length > 0) {
                                            for (var a = 0; a < list[l].batchInfoList.length; a++) {
                                                qty1 += parseFloat(parseInt((list[l].batchInfoList)[a].adjustmentQty) * list[l].multiplier);
                                            }
                                        }
                                        var remainingQty = parseFloat((list[l].adjustmentQty * list[l].multiplier)) - parseFloat(qty1);
                                        unallocatedAdjustmentQty = parseFloat(remainingQty);
                                        if (unallocatedAdjustmentQty < 0) {
                                            for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                                console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                                var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                                if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                                    myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                                    unallocatedAdjustmentQty = 0
                                                } else {
                                                    var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
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
                              var list1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                              for (var j = 0; j < list1.length; j++) {
                                  adjustmentQty += parseFloat((list1[j].adjustmentQty * list1[j].multiplier));
                                  unallocatedAdjustmentQty = parseFloat((list1[j].adjustmentQty * list1[j].multiplier));
                                  if (unallocatedAdjustmentQty < 0) {
                                      for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                          console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                          console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                          var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                          if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                              myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                              unallocatedAdjustmentQty = 0
                                          } else {
                                              var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
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
                
                
                
                
                
                
                
                
                
                
                
                
                          var expiredStockArr = myArray;
                
                                console.log(openingBalance)
                                console.log(inventoryList)
                                var invlist = inventoryList.filter(c => c.inventoryDate === enddtStr)
                                var adjustment = 0;
                                invlist.map(ele => adjustment = adjustment + (ele.adjustmentQty * ele.multiplier));
                                
                
                
                
                
                
                                var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                                var consumption = 0;
                                
                                console.log(programJson.regionList)
                                var actualFlag = false
                                for (var i = 0; i < programJson.regionList.length; i++) {
                
                                  var list = conlist.filter(c => c.region.id == programJson.regionList[i].regionId)
                                  console.log(list)
                                  if (list.length > 1) {
                                    for (var l = 0; l < list.length; l++) {
                                      if (list[l].actualFlag.toString() == 'true') {
                                        actualFlag = true;
                                        consumption = consumption + list[l].consumptionQty
                                      }
                                    }
                                  } else {
                                    consumption = list.length == 0 ? consumption : consumption = consumption + parseInt(list[0].consumptionQty)
                                  }
                                }
                
                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                var shiplist = shipmentList.filter(c => c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr)
                                var shipment = 0;
                                shiplist.map(ele => shipment = shipment + ele.shipmentQty);
                
                
                
                
                
                                var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(dtstr).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(enddtStr).format("YYYY-MM-DD"))));
                                var expiredStockQty = 0;
                                for (var j = 0; j < expiredStock.length; j++) {
                                    expiredStockQty += parseInt((expiredStock[j].remainingQty));
                                }
                 console.log('openingBalance', openingBalance, 'adjustment', adjustment, ' shipment', shipment, ' consumption', consumption)
                                var endingBalance = openingBalance + adjustment + shipment - consumption-expiredStockQty
                                console.log('endingBalance', endingBalance)
                
                                    endingBalance = endingBalance < 0 ? 0 : endingBalance
                                    openingBalance = endingBalance
                                    var amcBeforeArray = [];
                                    var amcAfterArray = [];


                                    for (var c = 0; c < monthsInPastForAmc; c++) {

                                        var month1MonthsBefore = moment(dt).subtract(c + 1, 'months').format("YYYY-MM-DD");
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
                                                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                                } else {
                                                    if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                        consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                                    }
                                                }
                                            }
                                            amcBeforeArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                            var amcArrayForMonth = amcBeforeArray.filter(c => c.month == dtstr);

                                        }
                                    }
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
                                                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                                } else {
                                                    if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                                        consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                                    }
                                                }
                                            }
                                            amcAfterArray.push({ consumptionQty: consumptionQty, month: dtstr });
                                            amcArrayForMonth = amcAfterArray.filter(c => c.month == dtstr);

                                        }

                                    }

                                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                                    var amcArrayFilteredForMonth = amcArray.filter(c => dtstr == c.month);
                                    var countAMC = amcArrayFilteredForMonth.length;
                                    var sumOfConsumptions = 0;
                                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                                    }


                                    var amcCalcualted =0
                                    var mos = 0
                                    if(countAMC>0 && sumOfConsumptions>0){
                                    amcCalcualted= (sumOfConsumptions) / countAMC;
                                    console.log('amcCalcualted', amcCalcualted,' endingBalance',endingBalance)
                                     mos = endingBalance < 0 ? 0 / amcCalcualted : endingBalance / amcCalcualted
                                    }
                                    console.log(pu)
                                    /*   var maxForMonths = 0;
                                       if (DEFAULT_MIN_MONTHS_OF_STOCK > pu.minMonthsOfStock) {
                                           maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                       } else {
                                           maxForMonths = pu.minMonthsOfStock
                                       }
                                       var minMOS = maxForMonths;
                                       var minForMonths = 0;
                                       if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + pu.reorderFrequencyInMonths)) {
                                           minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                       } else {
                                           minForMonths = (maxForMonths + pu.reorderFrequencyInMonths);
                                       }
                                       var maxMOS = minForMonths;*/
                                    var json = {
                                        "dt": new Date(from, month - 1),
                                        "program": pu.program,
                                        "planningUnit": pu.planningUnit,
                                        "stock": endingBalance,
                                        "consumptionQty": consumption,
                                        "amc": amcCalcualted,
                                        "amcMonthCount": countAMC,
                                        "mos": this.roundN(mos)
                                    }
                                    /* var json = {
                                         transDate: moment(new Date(from, month - 1)).format('MMM YY'),
                                         consumptionQty: consumption,
                                         actual: actualFlag,
                                         shipmentQty: shipment,
                                         shipmentList: shiplist,
                                         adjustmentQty: adjustment,
                                         closingBalance: endingBalance,
                                         mos: this.roundN(mos),
                                         minMonths: minMOS,
                                         maxMonths: maxMOS
                                     }*/
                                    data.push(json)
                                    console.log(data)



                                    if (month == this.state.rangeValue.to.month && from == to) {

                                        // var lineData = [];
                                        // var lineDates = [];
                                        // var planningUnitlines = [];
                                        // for (var i = 0; i < data.length; i++) {
                                        //     lineData[i] = data.map(ele => (ele.mos))
                                        // }
                                        // lineDates =[new Set(data.map(ele => (ele.dt)))]
                                        // planningUnitlines = data.map(ele1 => [...new Set(ele1.map(ele => (getLabelText(ele.program.label, this.state.lang) + '-' + getLabelText(ele.planningUnit.label, this.state.lang))))])

                                        this.setState({
                                            matricsList: data,
                                            message: '',
                                            // planningUnitlines: planningUnitlines
                                            // lineData: lineData,
                                            // lineDates: lineDates
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
                AuthenticationService.setupAxiosInterceptors();

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
                            message: '',
                            // planningUnitlines: planningUnitlines,
                            // lineData: lineData,
                            // lineDates: lineDates
                        })
                    }).catch(
                        error => {
                            this.setState({
                                matricsList: []
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
                                        this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
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
            this.setState({ message: i18n.t('static.common.selectProgram'), matricsList: [] });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });

        } else if (planningUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), matricsList: [] });

        } else if (monthsInPastForAmc == undefined) {
            this.setState({ message: i18n.t('static.realm.monthInPastForAmcText'), matricsList: [] });

        } else {
            this.setState({ message: i18n.t('static.realm.monthInFutureForAmcText'), matricsList: [] });

        }


    }


    exportCSV() {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
        csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push(i18n.t('static.report.version') + ' , ' + (document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        this.state.planningUnitValues.map(ele =>
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + (((ele.label).toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.report.mospast')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("monthsInPastForAmc").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.report.mosfuture')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("monthsInFutureForAmc").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        var re;

        var A = [[i18n.t('static.report.month'), i18n.t('static.program.program'),(( i18n.t('static.planningunit.planningunit')).replaceAll(',', '%20')).replaceAll(' ', '%20'), i18n.t('static.report.stock'), ((i18n.t('static.report.consupmtionqty')).replaceAll(',', '%20')).replaceAll(' ', '%20'), i18n.t('static.report.amc'), ((i18n.t('static.report.noofmonth')).replaceAll(',', '%20')).replaceAll(' ', '%20'), i18n.t('static.report.mos')]]


        this.state.matricsList.map(elt => A.push([this.dateFormatter(elt.dt).replaceAll(' ','%20'), ((getLabelText(elt.program.label, this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), ((getLabelText(elt.planningUnit.label, this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.stock, elt.consumptionQty, this.formatAmc(elt.amc), elt.amcMonthCount, this.roundN(elt.mos)]));


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
        let ypos=0
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
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnitValues.map(ele=>ele.label)).join('; ')), doc.internal.pageSize.width * 3 / 4);
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

        const title = "Consumption Report";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 130, aspectwidth1, height * 2 / 3);
        doc.addImage(canvasImg, 'png', 50, 190+(this.state.planningUnitValues.length*3) , 750, 230, 'CANVAS');

        const headers = [[i18n.t('static.report.month'), i18n.t('static.program.program'), i18n.t('static.planningunit.planningunit'), i18n.t('static.report.stock'), i18n.t('static.report.consupmtionqty'), i18n.t('static.report.amc'), i18n.t('static.report.noofmonth'), i18n.t('static.report.mos')]];

        const data = [];
        this.state.matricsList.map(elt => data.push([this.dateFormatter(elt.dt), getLabelText(elt.program.label, this.state.lang), getLabelText(elt.planningUnit.label, this.state.lang), elt.stock, elt.consumptionQty, this.formatter(this.formatAmc(elt.amc)), elt.amcMonthCount, this.roundN(elt.mos)]));

        let content = {
            margin: { top: 80 ,bottom:50},
            startY: height,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8 ,cellWidth: 75 },
            columnStyles: {
                1: { cellWidth: 151 },
                2: { cellWidth: 160.89 },
              }
        };


        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("StockStatusOverTime.pdf")
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
        var v = this.state.planningUnitValues.map(pu => this.state.matricsList.filter(c => c.planningUnit.id == pu.value).map(ele => (ele.mos)))
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
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.stockstatusovertimeReport')}</strong> */}
                        {
                            this.state.matricsList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />

                                    {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
 
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">

                        <div >
                            <Form >
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
                                                        onChange={(e) => { this.filterVersion(); this.updateMonthsforAMCCalculations() }}


                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {programList}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>

                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">Version</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionId"
                                                        id="versionId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.getPlanningUnit(); }}
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
                                </Col>
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
                                        {this.state.show ? 'Hide Data' : 'Show Data'}
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
                                                <th className="text-center" style={{ width: '10%' }}> {i18n.t('static.report.month')} </th>
                                                <th className="text-center" style={{ width: '20%' }}> {i18n.t('static.dashboard.program')} </th>
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
                                                            {getLabelText(item.program.label, this.state.lang)}
                                                        </td>
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
            </div>


        );

    }

}



export default StockStatusOverTime
