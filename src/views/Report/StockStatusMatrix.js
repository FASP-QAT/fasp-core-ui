import React from "react";
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Table } from 'reactstrap';
import i18n from '../../i18n'
import RealmService from '../../api/RealmService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService';
import csvicon from '../../assets/img/csv.png'
import pdfIcon from '../../assets/img/pdf.png';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import Pdf from "react-to-pdf"
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Online, Offline } from "react-detect-offline";
import { LOGO } from '../../CommonComponent/Logo.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
const { ExportCSVButton } = CSVExport;
const entityname = i18n.t('static.dashboard.productCatalog');
export default class StockStatusMatrix extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      productCategories: [],
      planningUnits: [],
      data: [],
      programs: [],
      versions: [],
      view: 1,
      includePlanningShipments: true,
      years: [],
      pulst: [],
      message: '',
      planningUnitValues: [],
      planningUnitLabels: [],
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },


    }
    this.filterData = this.filterData.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
    // this.getProductCategories = this.getProductCategories.bind(this)
    //this.getPrograms = this.getPrograms.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    //this.getPlanningUnit = this.getPlanningUnit.bind(this);

  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  show() {
    /* if (!this.state.showed) {
         setTimeout(() => {this.state.closeable = true}, 250)
         this.setState({ showed: true })
     }*/
  }
  handleRangeChange(value, text, listIndex) {
    //this.filterData();
  }
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.filterData();
    })

  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  getversion = () => {
    let programId = document.getElementById("programId").value;
    if (programId != 0) {
      const program = this.state.programs.filter(c => c.programId == programId)
      if (program.length == 1) {
        return program[0].currentVersion.versionId

      } else {
        return -1
      }
    }

  }

  handlePlanningUnitChange = (planningUnitIds) => {
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele.value),
      planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {

      this.filterData()
    })
  }

  handleProductCategoryChange = (planningUnitIds) => {
    console.log('###########################')
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele.value),
      planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {

      this.filterData()
    })
  }
  viewChange = (event) => {
    this.setState({
      view: event.target.value,
      data: [],
      planningUnitIds: []
    })
    if (event.target.value == 1) {
      this.getPlanningUnit();
    } else {
      this.getProductCategories()
    }
  }

  filterData() {
    console.log('In filter data---' + this.state.rangeValue.from.year)
    let startDate = this.state.rangeValue.from.year + '-' + String(this.state.rangeValue.from.month).padStart(2, '0') + '-01';
    let endDate = this.state.rangeValue.to.year + '-' + +String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
    let programId = document.getElementById("programId").value;
    let planningUnitIds = this.state.planningUnitValues;
    let view = document.getElementById("view").value;
    let versionId = document.getElementById("versionId").value;
    let includePlannedShipments = document.getElementById("includePlanningShipments").value
    if (planningUnitIds.length > 0 && programId > 0) {

      if (versionId.includes('Local')) {
        var data = [];
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;

          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var version = (versionId.split('(')[0]).trim()
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`

          var programRequest = programTransaction.get(program);

          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            if (this.state.view == 1) {
              planningUnitIds.map(planningUnitId => {
                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != 8 && c.accountFlag == true);

                // calculate openingBalance

                var openingBalance = 0;
                var totalConsumption = 0;
                var totalAdjustments = 0;
                var totalShipments = 0;
                console.log('startDate', startDate)
                console.log('programJson', programJson)
                var consumptionRemainingList = consumptionList.filter(c => c.consumptionDate < startDate);
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

                var adjustmentsRemainingList = inventoryList.filter(c => c.inventoryDate < startDate);
                for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                  totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                }

                var shipmentsRemainingList = shipmentList.filter(c => c.expectedDeliveryDate < startDate && c.accountFlag == true);
                for (var j = 0; j < shipmentsRemainingList.length; j++) {
                  totalShipments += parseInt((shipmentsRemainingList[j].shipmentQty));
                }
                openingBalance = totalAdjustments - totalConsumption + totalShipments;

                for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                  var monthlydata = [];
                  for (var month = 1; month <= 12; month++) {
                    var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                    console.log(dtstr)
                    var dt = dtstr
                    console.log(openingBalance)
                    var invlist = inventoryList.filter(c => c.inventoryDate === dt)
                    var adjustment = 0;
                    invlist.map(ele => adjustment = adjustment + (ele.adjustmentQty * ele.multiplier));
                    var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                    var consumption = 0;
                    conlist.map(ele => ele.actualFlag.toString() == 'true' ? consumption = consumption + ele.consumptionQty : consumption);
                    var shiplist = shipmentList.filter(c => c.expectedDeliveryDate === dt)
                    var shipment = 0;
                    shiplist.map(ele => shipment = shipment + ele.shipmentQty);


                    var endingBalance = openingBalance + adjustment + shipment - consumption
                    console.log('endingBalance', endingBalance)
                    openingBalance = endingBalance
                    var amcBeforeArray = [];
                    var amcAfterArray = [];


                    for (var c = 0; c < 12; c++) {

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
                        if (amcArrayForMonth.length == programJson.monthsInPastForAmc) {
                          c = 12;
                        }
                      }
                    }
                    for (var c = 0; c < 12; c++) {
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
                        if (amcArrayForMonth.length == programJson.monthsInFutureForAmc) {
                          c = 12;
                        }
                      }

                    }

                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                    var amcArrayFilteredForMonth = amcArray.filter(c => dtstr == c.month);
                    var countAMC = amcArrayFilteredForMonth.length;
                    var sumOfConsumptions = 0;
                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                      sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                    }


                    var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);
                    console.log('amcCalcualted', amcCalcualted)
                    var mos = endingBalance < 0 ? 0 / amcCalcualted : endingBalance / amcCalcualted

                    monthlydata.push(this.roundN(mos))

                  }
                  var minmonthofstock = Math.min.apply(Math, monthlydata.map(a => a));
                  var min = 3
                  var json = {
                    name: inventoryList[0].planningUnit,
                    units: inventoryList[0].unit,
                    reorderFrequency: 0,
                    year: from,
                    min: min,
                    Jan: monthlydata[0],
                    Feb: monthlydata[1],
                    Mar: monthlydata[2],
                    Apr: monthlydata[3],
                    May: monthlydata[4],
                    Jun: monthlydata[5],
                    Jul: monthlydata[6],
                    Aug: monthlydata[7],
                    Sep: monthlydata[8],
                    Oct: monthlydata[9],
                    Nov: monthlydata[10],
                    Dec: monthlydata[11],
                  }
                  data.push(json)
                }
                this.setState({
                  data
                })
              })
            } else {
              planningUnitIds.map(productCategoryId => {
                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.forecastingUnit.productCategory.id == productCategoryId && c.active == true);
                var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.forecastingUnit.productCategory.id == productCategoryId);
                var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.forecastingUnit.productCategory.id == productCategoryId && c.shipmentStatus.id != 8 && c.accountFlag == true);

                // calculate openingBalance

                var openingBalance = 0;
                var totalConsumption = 0;
                var totalAdjustments = 0;
                var totalShipments = 0;
                console.log('startDate', startDate)
                console.log('programJson', programJson)
                var consumptionRemainingList = consumptionList.filter(c => c.consumptionDate < startDate);
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

                var adjustmentsRemainingList = inventoryList.filter(c => c.inventoryDate < startDate);
                for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                  totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                }

                var shipmentsRemainingList = shipmentList.filter(c => c.expectedDeliveryDate < startDate && c.accountFlag == true);
                for (var j = 0; j < shipmentsRemainingList.length; j++) {
                  totalShipments += parseInt((shipmentsRemainingList[j].shipmentQty));
                }
                openingBalance = totalAdjustments - totalConsumption + totalShipments;

                for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                  var monthlydata = [];
                  for (var month = 1; month <= 12; month++) {
                    var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                    console.log(dtstr)
                    var dt = dtstr
                    console.log(openingBalance)
                    var invlist = inventoryList.filter(c => c.inventoryDate === dt)
                    var adjustment = 0;
                    invlist.map(ele => adjustment = adjustment + (ele.adjustmentQty * ele.multiplier));
                    var conlist = consumptionList.filter(c => c.consumptionDate === dt)
                    var consumption = 0;
                    conlist.map(ele => ele.actualFlag.toString() == 'true' ? consumption = consumption + ele.consumptionQty : consumption);
                    var shiplist = shipmentList.filter(c => c.expectedDeliveryDate === dt)
                    var shipment = 0;
                    shiplist.map(ele => shipment = shipment + ele.shipmentQty);


                    var endingBalance = openingBalance + adjustment + shipment - consumption
                    console.log('endingBalance', endingBalance)
                    openingBalance = endingBalance
                    var amcBeforeArray = [];
                    var amcAfterArray = [];


                    for (var c = 0; c < programJson.monthsInPastForAmc; c++) {

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
                        if (amcArrayForMonth.length == programJson.monthsInPastForAmc) {
                          c = 12;
                        }
                      }
                    }
                    for (var c = 0; c < programJson.monthsInFutureForAmc; c++) {
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
                        if (amcArrayForMonth.length == programJson.monthsInFutureForAmc) {
                          c = 12;
                        }
                      }

                    }

                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                    var amcArrayFilteredForMonth = amcArray.filter(c => dtstr == c.month);
                    var countAMC = amcArrayFilteredForMonth.length;
                    var sumOfConsumptions = 0;
                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                      sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                    }


                    var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);
                    console.log('amcCalcualted', amcCalcualted)
                    var mos = endingBalance < 0 ? 0 / amcCalcualted : endingBalance / amcCalcualted

                    monthlydata.push(this.roundN(mos))

                  }
                var minmonthofstock = Math.min.apply(Math, monthlydata.map(a => a));
                  var min = 3
                  var json = {
                    name: inventoryList[0].planningUnit.forecastingUnit.productCategory,
                    units: inventoryList[0].unit,
                    reorderFrequency: 0,
                    year: from,
                    min: min,
                    Jan: monthlydata[0],
                    Feb: monthlydata[1],
                    Mar: monthlydata[2],
                    Apr: monthlydata[3],
                    May: monthlydata[4],
                    Jun: monthlydata[5],
                    Jul: monthlydata[6],
                    Aug: monthlydata[7],
                    Sep: monthlydata[8],
                    Oct: monthlydata[9],
                    Nov: monthlydata[10],
                    Dec: monthlydata[11],
                  }
                  data.push(json)
                }
                this.setState({
                  data
                })
              })
            }
          }.bind(this)


        }.bind(this)



















      } else {

        var inputjson = {
          "programId": programId,
          "versionId": versionId,
          "startDate": startDate,
          "stopDate": endDate,
          "ids": planningUnitIds,
          "includePlannedShipments": includePlannedShipments,
          "view": view
        }

        if (navigator.onLine) {
          let realmId = AuthenticationService.getRealmId();
          AuthenticationService.setupAxiosInterceptors();
          ProductService.getStockStatusMatrixData(inputjson)
            .then(response => {
              console.log("data---", response.data)
              if (view == 2) {
                this.setState({
                  data: [{
                    name: { id: 1, label: { label_en: "HIV/AIDS Pharmaceuticals" } }, unit: { id: 1, label: { label_en: "abacavir 20 mg/ml solution 240" } }, min: 1.0, year: 2019, reorderFrequency: 3,
                    units: { id: 1, label: { label_en: "" } }, Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 1.78
                  },
                  {
                    name: { id: 1, label: { label_en: "HIV/AIDS Pharmaceuticals" } }, unit: { id: 1, label: { label_en: "abacavir 20 mg/ml solution 240" } }, min: 5.0, year: 2020, reorderFrequency: 3,
                    units: { id: 1, label: { label_en: "" } }, Jan: 0.88, Feb: 0.21, Mar: 1.34, Apr: 0.44, May: 0, Jun: 4.11, Jul: 4.46, Aug: 6.81, Sep: 8.27, Oct: 7.06, Nov: 9.11, Dec: 8.27
                  }],
                  view: view, message: ''
                })
              } else {

                this.setState({
                  data: [{
                    name: { id: 1, label: { label_en: "abacavir 20 mg/ml solution 240" } }, min: 1.0, year: 2019, reorderFrequency: 3,
                    units: { id: 1, label: { label_en: "240" } }, Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 1.78
                  },
                  {
                    name: { id: 1, label: { label_en: "abacavir 20 mg/ml solution 240" } }, min: 5.0, year: 2020, reorderFrequency: 3,
                    units: { id: 1, label: { label_en: "240" } }, Jan: 0.88, Feb: 0.21, Mar: 1.34, Apr: 0.44, May: 0, Jun: 4.11, Jul: 4.46, Aug: 6.81, Sep: 8.27, Oct: 7.06, Nov: 9.11, Dec: 8.27
                  }],
                  view: view, message: ''
                })
              }

            }).catch(
              error => {
                this.setState({
                  data: []
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






      }
    } else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), data: [] });

    } else if (view == 2 && planningUnitIds.length == 0) {
      this.setState({ message: i18n.t('static.common.selectProductCategory'), data: [] });

    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

    }
  }

  getProductCategories() {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;

    this.setState({
      planningUnits: [],
      productCategories: []
    }, () => {
      if (versionId.includes('Local')) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;

          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var version = (versionId.split('(')[0]).trim()
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`

          var programRequest = programTransaction.get(program);

          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            var InventoryList = (programJson.inventoryList);
            let productCategories = [];
            var json;

            InventoryList.map(ele => (
              productCategories.push({
                payload: {
                  productCategoryId: ele.planningUnit.forecastingUnit.productCategory.id,
                  label: ele.planningUnit.forecastingUnit.productCategory.label,
                  active: true
                }
              })

            ))



            console.log(productCategories)
            this.setState({
              productCategories: productCategories.reduce(
                (accumulator, current) => accumulator.some(x => x.productCategoryId === current.productCategoryId) ? accumulator : [...accumulator, current], []
              )
            }, () => { console.log(this.state.productCategories) });


          }.bind(this)

        }.bind(this)
      } else {
        let realmId = AuthenticationService.getRealmId();
        AuthenticationService.setupAxiosInterceptors();
        let programId = document.getElementById("programId").value;
        ProductService.getProductCategoryListByProgram(realmId, programId)
          .then(response => {
            console.log('***' + JSON.stringify(response.data))
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


    }
    )
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

  getPlanningUnitOrProductCategory = () => {
    if (this.state.view == 1) {
      this.getPlanningUnit()
    } else {
      this.getProductCategories()
    }
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
              this.filterData();
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
            this.filterData();
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

  exportCSV(columns) {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
    if (this.state.view == 1) {
      this.state.planningUnitLabels.map(ele =>
        csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
    } else {
      this.state.planningUnitLabels.map(ele =>
        csvRow.push((i18n.t('static.productcategory.productcategory')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))

    }
    csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))

    csvRow.push('')
    csvRow.push('')
    csvRow.push('')
    csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
    csvRow.push('')

    const headers = [];
    columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
    var A = [headers]
    var re = this.state.data
    this.state.data.map(ele => A.push([(getLabelText(ele.name.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.units.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.min, ele.reorderFrequency, ele.year, ele.Jan, ele.Feb, ele.Mar, ele.Apr, ele.May, ele.Jun, ele.Jul, ele.Aug, ele.Sep, ele.Oct, ele.Nov
      , ele.Dec]));
    for (var i = 0; i < A.length; i++) {
      console.log(A[i])
      csvRow.push(A[i].join(","))

    }

    var csvString = csvRow.join("%0A")
    console.log('csvString' + csvString)
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.stockstatusmatrix') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
        doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.dashboard.stockstatusmatrix'), doc.internal.pageSize.width / 2, 60, {
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
          if (this.state.view == 1) {
            doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
              align: 'left'
            })

            var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 8, 150, planningText)
          } else {
            doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
              align: 'left'
            })
            var planningText = doc.splitTextToSize((i18n.t('static.productcategory.productcategory') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 8, 150, planningText)
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


    // const title = i18n.t('static.dashboard.stockstatusmatrix');
    let header = []


    let header1 = [[{ content: (this.state.view == 1 ? i18n.t('static.planningunit.planningunit') : i18n.t('static.productcategory.productcategory')), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.dashboard.unit'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.common.min'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.program.reorderFrequencyInMonths'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.common.year'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.report.monthsOfStock'), colSpan: 12, styles: { halign: 'center' } }]
      , [
      { content: i18n.t('static.month.jan'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.feb'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.mar'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.apr'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.may'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.jun'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.jul'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.aug'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.sep'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.oct'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.nov'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.dec'), styles: { halign: 'center' } },]
    ]

    header = header1;
    let data;

    data = this.state.data.map(ele => [getLabelText(ele.name.label, this.state.lang), getLabelText(ele.units.label, this.state.lang), ele.min, ele.reorderFrequency, ele.year, ele.Jan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Feb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Mar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Apr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.May.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Jun.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Jul.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Aug.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Sep.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Oct.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Nov
      .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Dec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")]);
    let content = {
      margin: { top: 40 },
      startY: 200,
      head: header,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, cellWidth: 38, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 153.89 },
      }
    };

    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.stockstatusmatrix') + ".pdf")
  }


  formatLabel(cell, row) {
    return getLabelText(cell, this.state.lang);
  }
  roundN = num => {
    return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
  }

  render() {


    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

      }, this);
    const { productCategories } = this.state;
    let productCategoryList = productCategories.length > 0
      && productCategories.map((item, i) => {
        return (
          <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
            {Array(item.level).fill('   ').join('') + (getLabelText(item.payload.label, this.state.lang))}
          </option>
        )
      }, this);
    let productCategoryListcheck = productCategories.length > 0
      && productCategories.filter(c => c.payload.active == true).map((item, i) => {
        console.log(item)

        return ({ label: getLabelText(item.payload.label, this.state.lang), value: item.payload.productCategoryId })

      }, this);
    console.log(productCategoryListcheck)
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state

    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    const formatter = value => {

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

    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );

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


    let columns = [
      {
        dataField: 'name.label',
        text: this.state.view == 1 ? i18n.t('static.planningunit.planningunit') : i18n.t('static.productcategory.productcategory'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        style: { width: '350px' },
        formatter: this.formatLabel
      },

      {
        dataField: 'units.label',
        text: i18n.t('static.dashboard.unit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'min',
        text: i18n.t('static.common.min'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      }, {
        dataField: 'reorderFrequency',
        text: i18n.t('static.program.reorderFrequencyInMonths'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      }, {
        dataField: 'year',
        text: i18n.t('static.common.year'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      },
      {
        dataField: 'Jan',
        text: i18n.t('static.month.jan'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Feb',
        text: i18n.t('static.month.feb'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Mar',
        text: i18n.t('static.month.mar'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Apr',
        text: i18n.t('static.month.apr'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'May',
        text: i18n.t('static.month.may'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Jun',
        text: i18n.t('static.month.jun'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Jul',
        text: i18n.t('static.month.jul'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Aug',
        text: i18n.t('static.month.aug'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Sep',
        text: i18n.t('static.month.sep'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Oct',
        text: i18n.t('static.month.oct'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Nov',
        text: i18n.t('static.month.nov'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }, {
        dataField: 'Dec',
        text: i18n.t('static.month.dec'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: formatter
      }


    ];

    let columns1 = [
      {
        dataField: 'PLANNING_UNIT_LABEL_EN',
        text: i18n.t('static.procurementUnit.planningUnit'),
        sort: true,
        align: 'left',
        headerAlign: 'left',
        width: '180'
      }, {
        dataField: 'YEAR',
        text: i18n.t('static.common.year'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      },
      {
        dataField: 'Q1',
        text: i18n.t('static.common.quarter1'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }, {
        dataField: 'Q2',
        text: i18n.t('static.common.quarter2'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }, {
        dataField: 'Q3',
        text: i18n.t('static.common.quarter3'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }, {
        dataField: 'Q4',
        text: i18n.t('static.common.quarter4'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }]

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
        text: 'All', value: this.state.data.length
      }]
    }
    const MyExportCSV = (props) => {
      const handleClick = () => {
        props.onExport();
      };
      return (
        <div>

          <img style={{ height: '40px', width: '40px' }} src={csvicon} title="Export CSV" onClick={() => handleClick()} />


        </div>
      );
    };

    return (

      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5>{i18n.t(this.state.message, { entityname })}</h5>
        <Card>
          <CardHeader className="pb-1">
            <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusmatrix')}</strong>{' '}
            {this.state.data.length > 0 && <div className="card-header-actions">
              <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
              <img style={{ height: '25px', width: '25px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
            </div>}
          </CardHeader>
          <CardBody className="pb-md-3">
            <Col md="12 pl-0">
              <div className="row">
                <FormGroup className="col-md-3" title="click here to select period">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                  <div className="controls">

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
                        onChange={(e) => { this.filterVersion(); this.filterData(e) }}


                      >
                        <option value="0">{i18n.t('static.common.select')}</option>
                        {programList}
                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">Version</Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="versionId"
                        id="versionId"
                        bsSize="sm"
                        onChange={(e) => { this.getPlanningUnitOrProductCategory(); }}
                      >
                        <option value="-1">{i18n.t('static.common.select')}</option>
                        {versionList}
                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                  <div className="controls">
                    <InputGroup>
                      <Input
                        type="select"
                        name="view"
                        id="view"
                        bsSize="sm"
                        onChange={(e) => { this.viewChange(e); }}
                      >
                        <option value="1">{i18n.t('static.common.product')}</option>
                        <option value="2">{i18n.t('static.productcategory.productcategory')}</option>

                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>

                {this.state.view == 2 && <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <InputGroup className="box">
                    <ReactMultiSelectCheckboxes
                      name="productCategoryId"
                      id="productCategoryId"
                      bsSize="md"
                      onChange={(e) => { this.handleProductCategoryChange(e) }}
                      options={productCategoryListcheck && productCategoryListcheck.length > 0 ? productCategoryListcheck : []}
                    /> </InputGroup>


                </FormGroup>}
                {this.state.view == 1 && <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">
                    <InputGroup className="box">
                      <ReactMultiSelectCheckboxes
                        name="planningUnitId"
                        id="planningUnitId"
                        bsSize="md"
                        onChange={(e) => { this.handlePlanningUnitChange(e) }}
                        options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                      /> </InputGroup>    </div></FormGroup>}
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="includePlanningShipments"
                        id="includePlanningShipments"
                        bsSize="sm"
                        onChange={(e) => { this.viewChange(); this.formSubmit() }}
                      >
                        <option value="true">{i18n.t('static.program.yes')}</option>
                        <option value="false">{i18n.t('static.program.no')}</option>
                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>
              </div>
            </Col>
            {this.state.view == 0 && this.state.data.length > 0 &&
              <Table striped bordered hover responsive="md">
                <thead>
                  <tr>
                    <th rowSpan="2" style={{ "width": "20%", "text-align": "center" }}> {i18n.t('static.planningunit.planningunit')}</th>
                    {this.state.years.map((item, i) => {
                      return (
                        <th colSpan="4" style={{ "text-align": "center" }}>{item}</th>
                      )
                    })}
                  </tr>
                  <tr>
                    {this.state.years.map(ele => { return (<><th style={{ "width": "3%", "text-align": "center" }} >Q1</th><th align="center" style={{ "width": "3%", "text-align": "center" }}>Q2</th ><th style={{ "width": "3%", "text-align": "center" }}>Q3</th><th style={{ "width": "3%", "text-align": "center" }}>Q4</th></>) })}

                  </tr>
                </thead>
                <tbody>

                  {this.state.data.map(ele => {
                    return (<tr> {ele.map((item, index) => { return (index == 0 ? <td style={{ "text-align": "left" }}>{item}</td> : <td style={{ "text-align": "right" }}>{formatter(item)}</td>) }
                    )}</tr>)
                  })}

                </tbody>
              </Table>
            }
            <div class="TableCust">
              {this.state.data.length > 0 &&
                <Table striped bordered hover responsive="md" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th rowSpan="2" className="text-center" style={{ width: "20%" }}>{this.state.view == 1 ? i18n.t('static.planningunit.planningunit') : i18n.t('static.productcategory.productcategory')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }}>{i18n.t('static.dashboard.unit')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }}>{i18n.t('static.common.min')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }}>{i18n.t('static.program.reorderFrequencyInMonths')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }} >{i18n.t('static.common.year')}</th>
                      <th colSpan="12" className="text-center">{i18n.t('static.report.monthsOfStock')}</th>

                    </tr>
                    <tr> <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.jan')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.feb')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.mar')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.apr')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.may')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.jun')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.jul')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.aug')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.sep')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.oct')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.nov')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.dec')}</th></tr>
                  </thead>
                  <tbody>

                    {this.state.data.map(ele => {
                      return (<tr>
                        <td className="text-center"> {getLabelText(ele.name.label, this.state.lang)}</td>
                        <td className="text-center"> {getLabelText(ele.units.label, this.state.lang)}</td>
                        <td className="text-center">{ele.min}</td>
                        <td className="text-center">{ele.reorderFrequency}</td>
                        <td className="text-center">{ele.year}</td>
                        <td className="text-center">{ele.Jan}</td>
                        <td className="text-center">{ele.Feb}</td>
                        <td className="text-center">{ele.Mar}</td>
                        <td className="text-center">{ele.Apr}</td>
                        <td className="text-center">{ele.May}</td>
                        <td className="text-center">{ele.Jun}</td>
                        <td className="text-center">{ele.Jul}</td>
                        <td className="text-center">{ele.Aug}</td>
                        <td className="text-center">{ele.Sep}</td>
                        <td className="text-center">{ele.Oct}</td>
                        <td className="text-center">{ele.Nov}</td>
                        <td className="text-center">{ele.Dec}</td></tr>)
                    })}

                  </tbody>
                </Table>
              }
            </div>
          </CardBody>
        </Card>


      </div>)
  }
}
