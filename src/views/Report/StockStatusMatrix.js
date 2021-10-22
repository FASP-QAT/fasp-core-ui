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
import { SECRET_KEY, FIRST_DATA_ENTRY_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
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
import { DatePicker } from 'antd';
import 'antd/dist/antd.css';
import MultiSelect from "react-multi-select-component";
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import { isSiteOnline } from "../../CommonComponent/JavascriptCommonFunctions";
import TracerCategoryService from '../../api/TracerCategoryService';
const { RangePicker } = DatePicker;
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
const legendcolor = [{ text: i18n.t('static.report.stockout'), color: "#BA0C2F", value: 0 },
{ text: i18n.t('static.report.lowstock'), color: "#f48521", value: 1 },
{ text: i18n.t('static.report.okaystock'), color: "#118b70", value: 2 },
{ text: i18n.t('static.report.overstock'), color: "#edb944", value: 3 },
{ text: i18n.t('static.supplyPlanFormula.na'), color: "#cfcdc9", value: 4 }];
// const legendcolor = [{ text: i18n.t('static.report.overstock'), color: "#edb944", value: 3 },
// { text: i18n.t('static.report.stockout'), color: "#ed5626", value: 0 },
// { text: i18n.t('static.report.okaystock'), color: "#118b70", value: 2 },
// { text: i18n.t('static.report.lowstock'), color: "#f48521", value: 1 },];

const { ExportCSVButton } = CSVExport;
const entityname = i18n.t('static.dashboard.productCatalog');
export default class StockStatusMatrix extends React.Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      realms: [],
      productCategories: [],
      planningUnits: [],
      data: [],
      selData: [],
      programs: [],
      versions: [],
      includePlanningShipments: true,
      years: [],
      pulst: [],
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
      planningUnitList: [],
      message: '',
      planningUnitValues: [],
      planningUnitLabels: [],
      // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      startYear: new Date().getFullYear() - 1,
      endYear: new Date().getFullYear(),
      loading: true,
      programId: '',
      versionId: ''

    }
    this.filterData = this.filterData.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);

  }

  getTracerCategoryList() {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;

    this.setState({
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
    }, () => {
      if (programId > 0 && versionId != 0) {
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

              for (var i = 0; i < myResult.length; i++) {
                if (myResult[i].program.id == programId) {

                  proList.push(myResult[i].planningUnit)
                }
              }
              console.log('proList', proList)
              this.setState({ programPlanningUnitList: myResult })
              var planningunitTransaction1 = db1.transaction(['planningUnit'], 'readwrite');
              var planningunitOs1 = planningunitTransaction1.objectStore('planningUnit');
              var planningunitRequest1 = planningunitOs1.getAll();
              //  var pllist = []
              planningunitRequest1.onerror = function (event) {
                // Handle errors!
              };
              planningunitRequest1.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest1.result;
                var flList = []
                console.log(myResult)
                for (var i = 0; i < myResult.length; i++) {
                  for (var j = 0; j < proList.length; j++) {
                    if (myResult[i].planningUnitId == proList[j].id) {
                      console.log(myResult[i].planningUnitId, proList[j].id)

                      flList.push(myResult[i].forecastingUnit)
                      planningList.push(myResult[i])
                    }
                  }
                }
                console.log('flList', flList)

                var tcList = [];
                flList.filter(function (item) {
                  var i = tcList.findIndex(x => x.tracerCategoryId == item.tracerCategory.id);
                  if (i <= -1 && item.tracerCategory.id != 0) {
                    tcList.push({ tracerCategoryId: item.tracerCategory.id, label: item.tracerCategory.label });
                  }
                  return null;
                });

                console.log('tcList', tcList)
                var lang = this.state.lang;
                this.setState({
                  tracerCategories: tcList.sort(function (a, b) {
                    a = getLabelText(a.label, lang).toLowerCase();
                    b = getLabelText(b.label, lang).toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                  }),
                  planningUnitList: planningList
                }, () => {
                  this.filterData();
                })



              }.bind(this);

            }.bind(this);
          }.bind(this)


        }
        else {


          let realmId = AuthenticationService.getRealmId();
          TracerCategoryService.getTracerCategoryByProgramId(realmId, programId).then(response => {

            if (response.status == 200) {
              var listArray = response.data;
              listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
              });
              this.setState({
                tracerCategories: listArray,
              }, () => {
                this.filterData();
              })
            }

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
        }

      } else {
        // this.setState({
        //   message: i18n.t('static.common.selectProgram'),
        //   productCategories: [],
        //   tracerCategories: []
        // })
        this.filterData();
      }
    })
  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  show() {

  }
  handleRangeChange(value, text, listIndex) {
    //this.filterData();
  }
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.filterData();
    })

  }
  onYearChange = (value) => {
    this.setState({
      startYear: value[0].format('YYYY'),
      endYear: value[1].format('YYYY')
    }, () => {
      console.log(this.state.startYear, ' ', this.state.endYear)
      this.filterData()
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
    planningUnitIds = planningUnitIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele),
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
  filterDataAsperstatus = () => {
    let stockStatusId = document.getElementById("stockStatusId").value;
    console.log(stockStatusId)
    var filteredData = []
    if (stockStatusId != -1) {

      this.state.selData.map(ele => {
        console.log(ele)
        var min = ele.minMonthsOfStock
        var reorderFrequency = ele.reorderFrequency
        if (stockStatusId == 0) {
          if (((ele.jan != null && this.roundN(ele.jan) == 0) || (ele.feb != null && this.roundN(ele.feb) == 0) || (ele.mar != null && this.roundN(ele.mar) == 0) || (ele.apr != null && this.roundN(ele.apr) == 0) || (ele.may != null && this.roundN(ele.may) == 0) || (ele.jun != null && this.roundN(ele.jun) == 0) || (ele.jul != null && this.roundN(ele.jul) == 0) || (ele.aug != null && this.roundN(ele.aug) == 0) || (ele.sep != null && this.roundN(ele.sep) == 0) || (ele.oct != null && this.roundN(ele.oct) == 0) || (ele.nov != null && this.roundN(ele.nov) == 0) || (ele.dec != null && this.roundN(ele.dec) == 0))) {
            console.log('in 0')
            filteredData.push(ele)
          }
        } else if (stockStatusId == 1) {
          if (((ele.jan != null && this.roundN(ele.jan) != 0 && this.roundN(ele.jan) < min) || (ele.feb != null && this.roundN(ele.feb) != 0 && this.roundN(ele.feb) < min) || (ele.mar != null && this.roundN(ele.mar) != 0 && this.roundN(ele.mar) < min) || (ele.apr != null && this.roundN(ele.apr) != 0 && this.roundN(ele.apr) < min) || (ele.may != null && this.roundN(ele.may) != 0 && this.roundN(ele.may) < min) || (ele.jun != null && this.roundN(ele.jun) != 0 && this.roundN(ele.jun) < min) || (ele.jul != null && this.roundN(ele.jul) != 0 && this.roundN(ele.jul) < min) || (ele.aug != null && this.roundN(ele.aug) != 0 && this.roundN(ele.aug) < min) || (ele.sep != null && this.roundN(ele.sep) != 0 && this.roundN(ele.sep) < min) || (ele.oct != null && this.roundN(ele.oct) != 0 && this.roundN(ele.oct) < min) || (ele.nov != null && this.roundN(ele.nov) != 0 && this.roundN(ele.nov) < min) || (ele.dec != null && this.roundN(ele.dec) != 0 && this.roundN(ele.dec) < min))) {
            console.log('in 1')
            filteredData.push(ele)
          }
        } else if (stockStatusId == 3) {
          if ((this.roundN(ele.jan) > (min + reorderFrequency)) || (this.roundN(ele.feb) > (min + reorderFrequency)) || (this.roundN(ele.mar) > (min + reorderFrequency)) || (this.roundN(ele.apr) > (min + reorderFrequency)) || (this.roundN(ele.may) > (min + reorderFrequency)) || (this.roundN(ele.jun) > (min + reorderFrequency)) || (this.roundN(ele.jul) > (min + reorderFrequency)) || (this.roundN(ele.aug) > (min + reorderFrequency)) || (this.roundN(ele.sep) > (min + reorderFrequency)) || (this.roundN(ele.oct) > (min + reorderFrequency)) || (this.roundN(ele.nov) > (min + reorderFrequency)) || (this.roundN(ele.dec) > (min + reorderFrequency))) {
            console.log('in 2')
            filteredData.push(ele)
          }
        } else if (stockStatusId == 2) {
          if ((this.roundN(ele.jan) < (min + reorderFrequency) && this.roundN(ele.jan) > min) || (this.roundN(ele.feb) < (min + reorderFrequency) && this.roundN(ele.feb) > min) || (this.roundN(ele.mar) < (min + reorderFrequency) && this.roundN(ele.mar) > min) || (this.roundN(ele.apr) < (min + reorderFrequency) && this.roundN(ele.apr) > min) || (this.roundN(ele.may) < (min + reorderFrequency) && this.roundN(ele.may) > min) || (this.roundN(ele.jun) < (min + reorderFrequency) && this.roundN(ele.jun) > min) || (this.roundN(ele.jul) < (min + reorderFrequency) && this.roundN(ele.jul) > min) || (this.roundN(ele.aug) < (min + reorderFrequency) && this.roundN(ele.aug) > min) || (this.roundN(ele.sep) < (min + reorderFrequency) && this.roundN(ele.sep) > min) || (this.roundN(ele.oct) < (min + reorderFrequency) && this.roundN(ele.act) > min) || (this.roundN(ele.nov) < (min + reorderFrequency) && this.roundN(ele.nov) > min) || (this.roundN(ele.dec) < (min + reorderFrequency) && this.roundN(ele.dec) > min)) {
            console.log('in 3')
            filteredData.push(ele)
          }
        } else if (stockStatusId == 4) {
          if ((ele.jan == null || ele.feb == null || ele.mar == null || ele.apr == null || ele.may == null || ele.jun == null || ele.jul == null || ele.aug == null || ele.sep == null || ele.oct == null || ele.nov == null || ele.dec == null)) {
            filteredData.push(ele)
          }
        }
      });
    } else {
      filteredData = this.state.selData
    }
    console.log(filteredData)
    this.setState({
      data: filteredData
    })

  }
  filterData() {
    //console.log('In filter data---' + this.state.rangeValue.from.year)
    let startDate = this.state.startYear + '-01-01';
    let endDate = this.state.endYear + '-12-' + new Date(this.state.endYear, 12, 0).getDate();
    let programId = document.getElementById("programId").value;
    // let programId = this.state.programId;
    let planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString())//this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
    console.log("planningUnitIds------>", planningUnitIds);
    let versionId = document.getElementById("versionId").value;
    let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());//document.getElementById('tracerCategoryId').value
    // let versionId = this.state.versionId;
    let includePlannedShipments = document.getElementById("includePlanningShipments").value
    if (this.state.planningUnitValues.length > 0 && programId > 0 && versionId != 0 && this.state.tracerCategoryValues.length > 0) {
      // if (programId > 0 && versionId != 0 && this.state.tracerCategoryValues.length > 0) {

      if (versionId.includes('Local')) {
        this.setState({ loading: true })
        var data = [];
        var data1 = [];
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            loading: false
          })
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
          var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
          var planningunitRequest = planningUnitObjectStore.getAll();
          planningunitRequest.onerror = function (event) {
            // Handle errors!
            this.setState({
              loading: false
            })
          };
          var plunit = []
          planningunitRequest.onsuccess = function (e) {
            var myResult1 = [];
            myResult1 = e.target.result;
            console.log("RESP------>0", planningUnitIds)
            console.log("RESP------>1", myResult1)
            var plunit1 = []
            planningUnitIds.map(planningUnitId => {
              plunit = [...plunit, ...(myResult1.filter(c => c.planningUnitId == planningUnitId))]

            })
            console.log("RESP------>2", plunit)
          }.bind(this)
          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var version = (versionId.split('(')[0]).trim()
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`

          var programRequest = programTransaction.get(program);

          programRequest.onerror = function (event) {
            this.setState({
              loading: false
            })
          }.bind(this);
          programRequest.onsuccess = function (event) {
            // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            // var programJson = JSON.parse(programData);
            var planningUnitDataList=programRequest.result.programData.planningUnitDataList;
            planningUnitIds.map(planningUnitId => {
              var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
              var programJson = {}
              if (planningUnitDataIndex != -1) {
                  var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitId))[0];
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
              var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]

              for (var from = this.state.startYear, to = this.state.endYear; from <= to; from++) {
                var monthlydata = [];
                for (var month = 1; month <= 12; month++) {
                  var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                  var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                  console.log(dtstr, ' ', enddtStr)
                  var dt = dtstr
                  var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnitId && c.transDate == dt)
                  console.log(list)
                  if (list.length > 0) {
                    console.log(includePlannedShipments)
                    if (includePlannedShipments.toString() == "true") {
                      monthlydata.push(list[0].mos)
                    }
                    else {

                      monthlydata.push(list[0].mosWps)
                    }
                  } else {
                    monthlydata.push(null)
                  }

                }
                console.log(monthlydata)
                var json = {
                  tracerCategoryId: this.state.planningUnitList.filter(c => c.planningUnitId == planningUnitId)[0].forecastingUnit.tracerCategory.id,
                  planningUnit: pu.planningUnit,
                  unit: plunit.filter(c => c.planningUnitId == planningUnitId)[0].unit,
                  reorderFrequency: pu.reorderFrequencyInMonths,
                  year: from,
                  minMonthsOfStock: pu.minMonthsOfStock,
                  jan: monthlydata[0],
                  feb: monthlydata[1],
                  mar: monthlydata[2],
                  apr: monthlydata[3],
                  may: monthlydata[4],
                  jun: monthlydata[5],
                  jul: monthlydata[6],
                  aug: monthlydata[7],
                  sep: monthlydata[8],
                  oct: monthlydata[9],
                  nov: monthlydata[10],
                  dec: monthlydata[11],
                }
                data.push(json)

              }

            })
            console.log("RESP------>3", data);

            let tracerCategoryValues = this.state.tracerCategoryValues;
            console.log("RESP------>31", tracerCategoryValues);
            for (let i = 0; i < data.length; i++) {
              for (let j = 0; j < tracerCategoryValues.length; j++) {
                if (tracerCategoryValues[j].value == data[i].tracerCategoryId) {
                  data1.push(data[i]);
                }
              }
            }

            this.setState({
              selData: data1,
              message: '', loading: false
            }, () => {
              this.filterDataAsperstatus();
              console.log("RESP------>4", this.state.selData);
            })
          }.bind(this)


        }.bind(this)



















      } else {
        this.setState({ loading: true })

        var inputjson = {
          "programId": programId,
          "versionId": versionId,
          "startDate": startDate,
          "stopDate": endDate,
          "planningUnitIds": planningUnitIds,
          "includePlannedShipments": includePlannedShipments,
          "tracerCategoryIds": tracercategory
        }


        // AuthenticationService.setupAxiosInterceptors();
        ProductService.getStockStatusMatrixData(inputjson)
          .then(response => {
            console.log("data---", response.data)

            this.setState({
              selData: response.data,
              message: '', loading: false
            }, () => {
              this.filterDataAsperstatus()
            })


          }).catch(
            error => {
              this.setState({
                selData: [], data: [], loading: false
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
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
                      loading: false
                    });
                    break;
                  case 412:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
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
        //       data: [], loading: false
        //     })

        //     if (error.message === "Network Error") {
        //       this.setState({ message: error.message, loading: false });
        //     } else {
        //       switch (error.response ? error.response.status : "") {
        //         case 500:
        //         case 401:
        //         case 404:
        //         case 406:
        //         case 412:
        //           this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
        //           break;
        //         default:
        //           this.setState({ loading: false, message: 'static.unkownError' });
        //           break;
        //       }
        //     }
        //   }
        // );







      }
    } else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), selData: [], data: [], tracerCategories: [], tracerCategoryValues: [], tracerCategoryLabels: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [] });

    } else if (versionId == 0) {
      this.setState({ message: i18n.t('static.program.validversion'), selData: [], data: [], tracerCategories: [], tracerCategoryValues: [], tracerCategoryLabels: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [] });

    }
    else if (this.state.tracerCategoryValues.length == 0) {
      this.setState({ message: i18n.t('static.tracercategory.tracercategoryText'), selData: [], data: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [] });
    }
    else if (this.state.planningUnitValues.length == 0) {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), selData: [], data: [] });
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
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
            // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            // var programJson = JSON.parse(programData);
            let productCategories = [];
            var planningUnitDataList=programRequest.result.programData.planningUnitDataList;
            for(var pu=0;pu<planningUnitDataList.length;pu++){
              var planningUnitData = (planningUnitDataList)[pu];
                        var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var InventoryList = (programJson.inventoryList);
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
            }




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
        // AuthenticationService.setupAxiosInterceptors();
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
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
                      loading: false
                    });
                    break;
                  case 412:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
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
        //       productCategories: []
        //     })
        //     if (error.message === "Network Error") {
        //       this.setState({ message: error.message });
        //     } else {
        //       switch (error.response ? error.response.status : "") {
        //         case 500:
        //         case 401:
        //         case 404:
        //         case 406:
        //         case 412:
        //           this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
        //           break;
        //         default:
        //           this.setState({ message: 'static.unkownError' });
        //           break;
        //       }
        //     }
        //   }
        // );
      }


    }
    )
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
      this.setState({ loading: false })
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
            this.filterData();
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
              // this.getPlanningUnit();
              this.getTracerCategoryList();
            })
          } else {
            this.setState({
              versions: versionList,
              versionId: versionList[0].versionId
            }, () => {
              // this.getPlanningUnit();
              this.getTracerCategoryList();
            })
          }
        } else {
          this.setState({
            versions: versionList,
            versionId: versionList[0].versionId
          }, () => {
            // this.getPlanningUnit();
            this.getTracerCategoryList();
          })
        }


      }.bind(this);



    }.bind(this)


  }

  handleTracerCategoryChange = (tracerCategoryIds) => {
    tracerCategoryIds = tracerCategoryIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      tracerCategoryValues: tracerCategoryIds.map(ele => ele),
      tracerCategoryLabels: tracerCategoryIds.map(ele => ele.label)
    }, () => {
      this.getPlanningUnit();
      this.filterData();
    })
  }

  getPlanningUnit = () => {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());//document.getElementById('tracerCategoryId').value

    if (this.state.tracerCategoryValues.length > 0) {

      this.setState({
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: []
      }, () => {

        if (versionId == 0) {
          this.setState({ message: i18n.t('static.program.validversion'), selData: [], data: [] });
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
                let incrmental = 0;
                for (var i = 0; i < myResult.length; i++) {
                  if (myResult[i].program.id == programId && myResult[i].active == true) {

                    let tempTCId = this.state.planningUnitList.filter(c => c.planningUnitId == myResult[i].planningUnit.id)[0].forecastingUnit.tracerCategory.id;

                    let tempPUObj = myResult[i];
                    tempPUObj["tracerCategoryId"] = tempTCId;
                    // proList[i] = myResult[i];

                    proList[incrmental] = tempPUObj;
                    incrmental = incrmental + 1;
                    // console.log("Log-------->", tempTCId);
                  }
                }

                let tracerCategoryValues = this.state.tracerCategoryValues.map((item, i) => {
                  return ({ tracerCategoryId: item.value })
                }, this);


                // console.log("Log--------> ******** ", tracerCategoryValues);
                console.log("Log--------> ******** 00", proList);
                console.log("Log--------> ******** -00", proList.length);

                let data1 = [];
                for (let i = 0; i < proList.length; i++) {
                  for (let j = 0; j < tracerCategoryValues.length; j++) {
                    console.log("Log--------> ******** 11", proList[i]);
                    console.log("Log--------> ******** 22", i);
                    if (tracerCategoryValues[j].tracerCategoryId == proList[i].tracerCategoryId) {
                      data1.push(proList[i]);
                    }
                  }
                }


                var lang = this.state.lang;
                this.setState({
                  planningUnits: data1.sort(function (a, b) {
                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                  }),
                  planningUnitValues: data1.map((item, i) => {
                    return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

                  }, this),
                  planningUnitLabels: data1.map((item, i) => {
                    return (getLabelText(item.planningUnit.label, this.state.lang))
                  }, this),
                  message: ''
                }, () => {
                  this.filterData();
                })
              }.bind(this);
            }.bind(this)


          }
          else {
            // AuthenticationService.setupAxiosInterceptors();

            //let productCategoryId = document.getElementById("productCategoryId").value;
            ProgramService.getPlanningUnitByProgramTracerCategory(programId, tracercategory).then(response => {
              console.log('**' + JSON.stringify(response.data))
              var listArray = response.data;
              listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
              });
              this.setState({
                planningUnits: listArray,
                planningUnitValues: response.data.map((item, i) => {
                  return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

                }, this),
                planningUnitLabels: response.data.map((item, i) => {
                  return (getLabelText(item.planningUnit.label, this.state.lang))
                }, this),
                message: ''
              }, () => {
                this.filterData();
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
    } else {
      this.setState({ message: i18n.t('static.tracercategory.tracercategoryText'), selData: [], data: [] });
    }
  }

  componentDidMount() {
    this.getPrograms();

  }

  setProgramId(event) {
    this.setState({
      programId: event.target.value,
      versionId: ''
    }, () => {
      localStorage.setItem("sesVersionIdReport", '');
      this.filterVersion();
      this.filterData()
    })

  }

  setVersionId(event) {
    // this.setState({
    //   versionId: event.target.value
    // }, () => {
    //   if (this.state.selData.length != 0) {
    //     localStorage.setItem("sesVersionIdReport", this.state.versionId);
    //     this.filterData();
    //   } else {
    //     this.getPlanningUnit();
    //   }
    // })

    if (this.state.versionId != '' || this.state.versionId != undefined) {
      this.setState({
        versionId: event.target.value
      }, () => {
        localStorage.setItem("sesVersionIdReport", this.state.versionId);
        this.getTracerCategoryList();
        // this.filterData();
      })
    } else {
      this.setState({
        versionId: event.target.value
      }, () => {
        // this.getPlanningUnit();
        this.getTracerCategoryList();
      })
    }

  }

  formatter = value => {
    if (value != null) {
      var cell1 = this.roundN(value)
      cell1 += '';
      var x = cell1.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    } else {
      return ''
    }
  }
  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }
  exportCSV(columns) {

    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + (this.state.startYear + ' ~ ' + this.state.endYear)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    this.state.planningUnitLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.tracerCategoryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory')).replaceAll(' ', '%20') + ' : ' + (ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.dashboard.stockstatusmain') + ' : ' + document.getElementById("stockStatusId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')

    csvRow.push('')
    csvRow.push('')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    csvRow.push('')

    const headers = [];
    columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20').replaceAll('#', '%23')) });
    var A = [this.addDoubleQuoteToRowContent(headers)]
    var re = this.state.data
    this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.unit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.minMonthsOfStock, ele.reorderFrequency, ele.year, ele.jan != null ? isNaN(ele.jan) ? '' : this.roundN(ele.jan) : i18n.t("static.supplyPlanFormula.na"), ele.feb != null ? isNaN(ele.feb) ? '' : this.roundN(ele.feb) : i18n.t("static.supplyPlanFormula.na"), ele.mar != null ? isNaN(ele.mar) ? '' : this.roundN(ele.mar) : i18n.t("static.supplyPlanFormula.na"), ele.apr != null ? isNaN(ele.apr) ? '' : this.roundN(ele.apr) : i18n.t("static.supplyPlanFormula.na"), ele.may != null ? isNaN(ele.may) ? '' : this.roundN(ele.may) : i18n.t("static.supplyPlanFormula.na"), ele.jun != null ? isNaN(ele.jun) ? '' : this.roundN(ele.jun) : i18n.t("static.supplyPlanFormula.na"), ele.jul != null ? isNaN(ele.jul) ? '' : this.roundN(ele.jul) : i18n.t("static.supplyPlanFormula.na"), ele.aug != null ? isNaN(ele.aug) ? '' : this.roundN(ele.aug) : i18n.t("static.supplyPlanFormula.na"), ele.sep != null ? isNaN(ele.sep) ? '' : this.roundN(ele.sep) : i18n.t("static.supplyPlanFormula.na"), ele.oct != null ? isNaN(ele.oct) ? '' : this.roundN(ele.oct) : i18n.t("static.supplyPlanFormula.na"), ele.nov != null ? isNaN(ele.nov) ? '' : this.roundN(ele.nov) : i18n.t("static.supplyPlanFormula.na"), ele.dec != null ? isNaN(ele.dec) ? '' : this.roundN(ele.dec) : i18n.t("static.supplyPlanFormula.na")])));
    for (var i = 0; i < A.length; i++) {
      console.log(A[i])
      csvRow.push(A[i].join(","))

    }

    var csvString = csvRow.join("%0A")
    console.log('csvString' + csvString)
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.stockstatusmatrix') + "-" + this.state.startYear + '~' + this.state.endYear + ".csv"
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
        doc.text(i18n.t('static.dashboard.stockstatusmatrix'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(i18n.t('static.report.dateRange') + ' : ' + this.state.startYear + ' ~ ' + this.state.endYear, doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
          doc.text(i18n.t('static.dashboard.stockstatusmain') + ' : ' + document.getElementById("stockStatusId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
            align: 'left'
          })

          var planningText = doc.splitTextToSize((i18n.t('static.tracercategory.tracercategory') + ' : ' + this.state.tracerCategoryLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 8, 170, planningText)

          var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 8, 200, planningText)

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

    header = [[{ content: i18n.t('static.report.qatPID'), rowSpan: 2, styles: { halign: 'center' } }, { content: i18n.t('static.planningunit.planningunit'), rowSpan: 2, styles: { halign: 'center' } },
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
    let data;
    data = this.state.data.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label, this.state.lang), getLabelText(ele.unit.label, this.state.lang), ele.minMonthsOfStock, ele.reorderFrequency, ele.year, ele.jan != null ? isNaN(ele.jan) ? '' : this.formatter(ele.jan) : i18n.t("static.supplyPlanFormula.na"), ele.feb != null ? isNaN(ele.feb) ? '' : this.formatter(ele.feb) : i18n.t("static.supplyPlanFormula.na"), ele.mar != null ? isNaN(ele.mar) ? '' : this.formatter(ele.mar) : i18n.t("static.supplyPlanFormula.na"), ele.apr != null ? isNaN(ele.apr) ? '' : this.formatter(ele.apr) : i18n.t("static.supplyPlanFormula.na"), ele.may != null ? isNaN(ele.may) ? '' : this.formatter(ele.may) : i18n.t("static.supplyPlanFormula.na"), ele.jun != null ? isNaN(ele.jun) ? '' : this.formatter(ele.jun) : i18n.t("static.supplyPlanFormula.na"), ele.jul != null ? isNaN(ele.jul) ? '' : this.formatter(ele.jul) : i18n.t("static.supplyPlanFormula.na"), ele.aug != null ? isNaN(ele.aug) ? '' : this.formatter(ele.aug) : i18n.t("static.supplyPlanFormula.na"), ele.sep != null ? isNaN(ele.sep) ? '' : this.formatter(ele.sep) : i18n.t("static.supplyPlanFormula.na"), ele.oct != null ? isNaN(ele.oct) ? '' : this.formatter(ele.oct) : i18n.t("static.supplyPlanFormula.na"), ele.nov != null ? isNaN(ele.nov) ? '' : this.formatter(ele.nov) : i18n.t("static.supplyPlanFormula.na"), ele.dec != null ? isNaN(ele.dec) ? '' : this.formatter(ele.dec) : i18n.t("static.supplyPlanFormula.na")]);

    var startY = 230 + (this.state.planningUnitValues.length * 3)
    let content = {
      margin: { top: 80, bottom: 90 },
      startY: startY,
      head: header,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, cellWidth: 38, halign: 'center' },
      columnStyles: {
        1: { cellWidth: 99.89 },
        2: { cellWidth: 54 },
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

    if (num == null) {
      return ''
    } else {
      return parseFloat(Math.round(num * Math.pow(10, 1)) / Math.pow(10, 1)).toFixed(1);
    }
  }
  cellStyle = (min, reorderFrequency, value) => {
    console.log(value)
    if (value != null) {
      value = this.roundN(value)
      if (value == 0) {
        return { backgroundColor: legendcolor[0].color }
      } else if (min > value) {
        return { backgroundColor: legendcolor[1].color }
      } else if ((min + reorderFrequency) < value) {

        return { backgroundColor: legendcolor[3].color }
      } else {
        return { backgroundColor: legendcolor[2].color }

      }
    }
    else {
      return { backgroundColor: legendcolor[4].color }
    }
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
            {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
          </option>
        )
      }, this);

    const { tracerCategories } = this.state;

    let columns = [
      {
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
        style: { width: '350px' },
        formatter: this.formatLabel
      },

      {
        dataField: 'unit.label',
        text: i18n.t('static.dashboard.unit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'minMonthsOfStock',
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
        dataField: 'jan',
        text: i18n.t('static.month.jan'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'feb',
        text: i18n.t('static.month.feb'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'mar',
        text: i18n.t('static.month.mar'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'apr',
        text: i18n.t('static.month.apr'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'may',
        text: i18n.t('static.month.may'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'jun',
        text: i18n.t('static.month.jun'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'jul',
        text: i18n.t('static.month.jul'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'aug',
        text: i18n.t('static.month.aug'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'sep',
        text: i18n.t('static.month.sep'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'oct',
        text: i18n.t('static.month.oct'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'nov',
        text: i18n.t('static.month.nov'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'dec',
        text: i18n.t('static.month.dec'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }


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
        <AuthenticationServiceComponent history={this.props.history} />
        <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5 className="red">{i18n.t(this.state.message, { entityname })}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card>
          <div className="Card-header-reporticon pb-2">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleStockStatusMatrix() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
              </a>
              {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusmatrix')}</strong>{' '} */}
              {this.state.data.length > 0 && <div className="card-header-actions">
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
              </div>}
            </div>
          </div>
          <CardBody className="pb-md-3 pb-lg-2 pt-lg-0">
            <div className="pl-0">
              <div className="row">
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                  <div className="controls box">
                    <RangePicker
                      picker="year"
                      allowClear={false}
                      id="date" name="date"
                      //  style={{ width: '450px', marginLeft:'20px'}} 
                      onChange={this.onYearChange}
                      value={[moment(this.state.startYear.toString()), moment(this.state.endYear.toString())]} />

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
                        // onChange={(e) => { this.filterVersion(); this.filterData(e) }}
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
                  <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label>
                  <div className="controls ">
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
                  <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">

                    <MultiSelect
                      name="tracerCategoryId"
                      id="tracerCategoryId"
                      bsSize="sm"
                      value={this.state.tracerCategoryValues}
                      onChange={(e) => { this.handleTracerCategoryChange(e) }}
                      options=
                      {tracerCategories.length > 0 ?
                        tracerCategories.map((item, i) => {
                          return ({ label: getLabelText(item.label, this.state.lang), value: item.tracerCategoryId })

                        }, this) : []} />
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">

                    <MultiSelect
                      name="planningUnitId"
                      id="planningUnitId"
                      bsSize="md"
                      value={this.state.planningUnitValues}
                      onChange={(e) => { this.handlePlanningUnitChange(e) }}
                      options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                    />     </div></FormGroup>

                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="includePlanningShipments"
                        id="includePlanningShipments"
                        bsSize="sm"
                        onChange={(e) => { this.filterData() }}
                      >
                        <option value="true">{i18n.t('static.program.yes')}</option>
                        <option value="false">{i18n.t('static.program.no')}</option>
                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.report.withinstock')}</Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="stockStatusId"
                        id="stockStatusId"
                        bsSize="sm"
                        onChange={(e) => { this.filterDataAsperstatus() }}
                      >

                        <option value="-1">{i18n.t('static.common.all')}</option>
                        {legendcolor.length > 0
                          && legendcolor.map((item, i) => {
                            return (
                              <option key={i} value={item.value}>
                                {item.text}
                              </option>
                            )
                          }, this)
                        }
                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                  <ul className="legendcommitversion list-group">
                    {
                      legendcolor.map(item1 => (
                        <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                      ))
                    }
                  </ul>
                </FormGroup>
              </div>
            </div>
            <div class="TableCust" style={{ display: this.state.loading ? "none" : "block" }}>
              {this.state.data.length > 0 &&
                <Table striped bordered responsive="md" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th rowSpan="2" className="text-center" style={{ width: "20%" }}>{i18n.t('static.planningunit.planningunit')}</th>
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
                        <td className="text-center"> {getLabelText(ele.planningUnit.label, this.state.lang)}</td>
                        <td className="text-center"> {getLabelText(ele.unit.label, this.state.lang)}</td>
                        <td className="text-center">{ele.minMonthsOfStock}</td>
                        <td className="text-center">{ele.reorderFrequency}</td>
                        <td className="text-center">{ele.year}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.jan)}>{isNaN(ele.jan) ? '' : ele.jan != null ? this.formatter(ele.jan) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.feb)} > {isNaN(ele.feb) ? '' : ele.feb != null ? this.formatter(ele.feb) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.mar)} > {isNaN(ele.mar) ? '' : ele.mar != null ? this.formatter(ele.mar) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.apr)}> {isNaN(ele.apr) ? '' : ele.apr != null ? this.formatter(ele.apr) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.may)}> {isNaN(ele.may) ? '' : ele.may != null ? this.formatter(ele.may) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.jun)}> {isNaN(ele.jun) ? '' : ele.jun != null ? this.formatter(ele.jun) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.jul)}> {isNaN(ele.jul) ? '' : ele.jul != null ? this.formatter(ele.jul) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.aug)}> {isNaN(ele.aug) ? '' : ele.aug != null ? this.formatter(ele.aug) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.sep)}> {isNaN(ele.sep) ? '' : ele.sep != null ? this.formatter(ele.sep) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.oct)}> {isNaN(ele.oct) ? '' : ele.oct != null ? this.formatter(ele.oct) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.nov)}> {isNaN(ele.nov) ? '' : ele.nov != null ? this.formatter(ele.nov) : i18n.t("static.supplyPlanFormula.na")}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.reorderFrequency, ele.dec)}> {isNaN(ele.dec) ? '' : ele.dec != null ? this.formatter(ele.dec) : i18n.t("static.supplyPlanFormula.na")}</td></tr>)
                    })}

                  </tbody>
                </Table>
              }



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



      </div>)
  }
}
