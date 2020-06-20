// my report 
import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  ButtonDropdown,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  // CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Widgets,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Progress,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  CardColumns,
  Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import Pdf from "react-to-pdf"
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import { Online, Offline } from "react-detect-offline";
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
//import fs from 'fs'
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const options = {
  title: {
    display: true,
    // text: i18n.t('static.dashboard.consumption'),
    fontColor: 'black'
  },

  scales: {

    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: i18n.t('static.dashboard.consumption'),
        fontColor: 'black'
      },
      ticks: {
        beginAtZero: true,
        fontColor: 'black'
      }
    }],
    xAxes: [{
      ticks: {
        fontColor: 'black'
      }
    }]
  },

  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: true,
    position: 'bottom',
    labels: {
      usePointStyle: true,
      fontColor: "black"
    }
  }
}




//Random Numbers
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
  data1.push(random(50, 200));
  data2.push(random(80, 100));
  data3.push(65);
}

const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}


class Consumption extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      sortType: 'asc',
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      programs: [],
      offlinePrograms: [],
      planningUnits: [],
      consumptions: [],
      offlineConsumptionList: [],
      offlinePlanningUnitList: [],
      productCategories: [],
      offlineProductCategoryList: [],
      show: false,
      message: '',
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



    };
    this.getPrograms = this.getPrograms.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.getProductCategories = this.getProductCategories.bind(this)
    //this.pickRange = React.createRef()

  }


  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }

  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
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

  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push('')
    csvRow.push('')
    var re;
    var A = [[(i18n.t('static.report.consumptionDate')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20')]]
    if (navigator.onLine) {
      re = this.state.consumptions
    } else {
      re = this.state.offlineConsumptionList
    }

    for (var item = 0; item < re.length; item++) {
      A.push([re[item].consumption_date, re[item].forcast, re[item].Actual])
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.consumption_') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
    document.body.appendChild(a)
    a.click()
  }


  exportPDF = () => {
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
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        /*doc.addImage(data, 10, 30, {
        align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.report.consumptionReport'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
          doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
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

    doc.setFontSize(8);

    // const title = "Consumption Report";
    var canvas = document.getElementById("cool-canvas");
    //creates image

    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 100;
    var aspectwidth1 = (width - h1);

    doc.addImage(canvasImg, 'png', 50, 220, 750, 260, 'CANVAS');

    const headers = [[i18n.t('static.report.consumptionDate'),
    i18n.t('static.report.forecastConsumption'),
    i18n.t('static.report.actualConsumption')]];
    const data = navigator.onLine ? this.state.consumptions.map(elt => [elt.consumption_date, this.formatter(elt.forcast), this.formatter(elt.Actual)]) : this.state.finalOfflineConsumption.map(elt => [elt.consumption_date, this.formatter(elt.forcast), this.formatter(elt.Actual)]);

    let content = {
      margin: { top: 80 },
      startY: height,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    };



    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save("Consumption.pdf")
    //creates PDF from img
    /* var doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.text(15, 15, "Cool Chart");
    doc.save('canvas.pdf');*/
  }



  filterData() {
    let programId = document.getElementById("programId").value;
    let productCategoryId = document.getElementById("productCategoryId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
    if (productCategoryId >= 0 && planningUnitId > 0 && programId > 0) {

      if (navigator.onLine) {
        let realmId = AuthenticationService.getRealmId();
        AuthenticationService.setupAxiosInterceptors();
        ProductService.getConsumptionData(realmId, programId, planningUnitId, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate())
          .then(response => {
            console.log(JSON.stringify(response.data));
            this.setState({
              consumptions: response.data,
              message: ''
            })
          }).catch(
            error => {
              this.setState({
                consumptions: []
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
      } else {
        // if (planningUnitId != "" && planningUnitId != 0 && productCategoryId != "" && productCategoryId != 0) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;

          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var programRequest = programTransaction.get(programId);

          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            var offlineConsumptionList = (programJson.consumptionList);

            const activeFilter = offlineConsumptionList.filter(c => (c.active == true || c.active == "true"));

            const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
            const productCategoryFilter = planningUnitFilter.filter(c => (c.planningUnit.forecastingUnit != null && c.planningUnit.forecastingUnit != "") && (c.planningUnit.forecastingUnit.productCategory.id == productCategoryId));

            // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
            const dateFilter = productCategoryFilter.filter(c => moment(c.consumptionDate).isBetween(startDate, endDate, null, '[)'))

            const sorted = dateFilter.sort((a, b) => {
              var dateA = new Date(a.consumptionDate).getTime();
              var dateB = new Date(b.consumptionDate).getTime();
              return dateA > dateB ? 1 : -1;
            });
            let previousDate = "";
            let finalOfflineConsumption = [];
            var json;

            for (let i = 0; i <= sorted.length; i++) {
              let forcast = 0;
              let actual = 0;
              if (sorted[i] != null && sorted[i] != "") {
                previousDate = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
                for (let j = 0; j <= sorted.length; j++) {
                  if (sorted[j] != null && sorted[j] != "") {
                    if (previousDate == moment(sorted[j].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY')) {
                      if (sorted[j].actualFlag == false || sorted[j].actualFlag == "false") {
                        forcast = forcast + parseFloat(sorted[j].consumptionQty);
                      }
                      if (sorted[j].actualFlag == true || sorted[j].actualFlag == "true") {
                        actual = actual + parseFloat(sorted[j].consumptionQty);
                      }
                    }
                  }
                }

                let date = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
                json = {
                  consumption_date: date,
                  Actual: actual,
                  forcast: forcast
                }

                if (!finalOfflineConsumption.some(f => f.consumption_date === date)) {
                  finalOfflineConsumption.push(json);
                }

                // console.log("finalOfflineConsumption---", finalOfflineConsumption);

              }
            }
            console.log("final consumption---", finalOfflineConsumption);
            this.setState({
              offlineConsumptionList: finalOfflineConsumption
            });

          }.bind(this)

        }.bind(this)
        // }
      }
    } else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

    } else if (productCategoryId == -1) {
      this.setState({ message: i18n.t('static.common.selectProductCategory'), consumptions: [] });

    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

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
          })
        }).catch(
          error => {
            this.setState({
              programs: []
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

    } else {
      const lan = 'en';
      var db1;
      getDatabase();
      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var program = transaction.objectStore('programData');
        var getRequest = program.getAll();
        var proList = []
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
              var programJson = {
                name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = programJson
            }
          }
          this.setState({
            programs: proList
          })

        }.bind(this);

      }

    }


  }
  getPlanningUnit() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      let programId = document.getElementById("programId").value;
      let productCategoryId = document.getElementById("productCategoryId").value;
      ProgramService.getProgramPlaningUnitListByProgramAndProductCategory(programId, productCategoryId).then(response => {
        console.log('**' + JSON.stringify(response.data))
        this.setState({
          planningUnits: response.data,
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
                  this.setState({ message: error.response.data.messageCode });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );
    } else {
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
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].program.id == programId) {
              var productJson = {
                name: getLabelText(myResult[i].planningUnit.label, lan),
                id: myResult[i].planningUnit.id
              }
              proList[i] = productJson
            }
          }
          this.setState({
            offlinePlanningUnitList: proList
          })
        }.bind(this);
      }.bind(this)

    }

  }
  getProductCategories() {
    let programId = document.getElementById("programId").value;
    let realmId = AuthenticationService.getRealmId();
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      ProductService.getProductCategoryListByProgram(realmId, programId)
        .then(response => {
          console.log(JSON.stringify(response.data))
          this.setState({
            productCategories: response.data
          }, () => {
            this.filterData();
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
    } else {
      var db1;
      getDatabase();
      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;

        var transaction = db1.transaction(['programData'], 'readwrite');
        var programTransaction = transaction.objectStore('programData');
        var programRequest = programTransaction.get(programId);

        programRequest.onsuccess = function (event) {
          var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
          var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
          var programJson = JSON.parse(programData);
          var offlineConsumptionList = (programJson.consumptionList);

          let offlineProductCategoryList = [];
          var json;

          for (let i = 0; i <= offlineConsumptionList.length; i++) {
            let count = 0;
            if (offlineConsumptionList[i] != null && offlineConsumptionList[i] != "" && offlineConsumptionList[i].planningUnit.forecastingUnit != null && offlineConsumptionList[i].planningUnit.forecastingUnit != "") {
              for (let j = 0; j <= offlineProductCategoryList.length; j++) {
                if (offlineProductCategoryList[j] != null && offlineProductCategoryList[j] != "" && (offlineProductCategoryList[j].id == offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.id)) {
                  count++;
                }
              }
              if (count == 0 || i == 0) {
                offlineProductCategoryList.push({
                  id: offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.id,
                  name: offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.label.label_en
                });
              }
            }
          }
          this.setState({
            offlineProductCategoryList
          });

        }.bind(this)

      }.bind(this)

    }
    this.getPlanningUnit();

  }
  componentDidMount() {
    if (navigator.onLine) {
      this.getPrograms();


    } else {
      const lan = 'en';
      var db1;
      getDatabase();

      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var program = transaction.objectStore('programData');
        var getRequest = program.getAll();
        var proList = []
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
              var programJson = {
                name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = programJson
            }
          }
          this.setState({
            offlinePrograms: proList
          })

        }.bind(this);
      }.bind(this);

    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
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
      this.filterData();
    })

  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

  render() {
    const { planningUnits } = this.state;
    const { offlinePlanningUnitList } = this.state;

    const { programs } = this.state;
    const { offlinePrograms } = this.state;

    const { productCategories } = this.state;
    const { offlineProductCategoryList } = this.state;

    let bar = "";
    if (navigator.onLine) {
      bar = {

        labels: this.state.consumptions.map((item, index) => (moment(item.consumption_date, 'MM-YYYY').format('MMM YYYY'))),
        datasets: [
          {
            type: "line",
            linetension: 0,
            label: i18n.t('static.report.forecastConsumption'),
            backgroundColor: 'transparent',
            borderColor: '#000',
            borderDash: [10, 10],
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            showInLegend: true,
            pointStyle: 'line',
            pointBorderWidth: 5,
            yValueFormatString: "$#,##0",
            data: this.state.consumptions.map((item, index) => (item.forcast))
          }, {
            label: i18n.t('static.report.actualConsumption'),
            backgroundColor: '#86CD99',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: this.state.consumptions.map((item, index) => (item.Actual)),
          }
        ],



      }
    }
    if (!navigator.onLine) {
      bar = {

        labels: this.state.offlineConsumptionList.map((item, index) => (moment(item.consumption_date, 'MM-YYYY').format('MMM YYYY'))),
        datasets: [
          {
            label: i18n.t('static.report.actualConsumption'),
            backgroundColor: '#86CD99',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: this.state.offlineConsumptionList.map((item, index) => (item.Actual)),
          }, {
            type: "line",
            linetension: 0,
            label: i18n.t('static.report.forecastConsumption'),
            backgroundColor: 'transparent',
            borderColor: 'rgba(179,181,158,1)',
            borderStyle: 'dotted',
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            showInLegend: true,
            yValueFormatString: "$#,##0",
            data: this.state.offlineConsumptionList.map((item, index) => (item.forcast))
          }
        ],

      }
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
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5>{i18n.t(this.state.message)}</h5>

        <Card>
          <CardHeader className="pb-1">
            <i className="icon-menu"></i><strong>{i18n.t('static.report.consumptionReport')}</strong>
            {/* <b className="count-text">{i18n.t('static.report.consumptionReport')}</b> */}
            <Online>
              {
                this.state.consumptions.length > 0 &&
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
            </Online>
            <Offline>
              {
                this.state.offlineConsumptionList.length > 0 &&
                <div className="card-header-actions">
                  <a className="card-header-action">

                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />

                    {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>

 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                  </a>
                  <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                </div>
              }
            </Offline>
          </CardHeader>
          <CardBody>
            <div className="TableCust" >
              <div ref={ref}>
                <Form >
                  <Col md="12 pl-0">
                    <div className="row">
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
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
                      <Online>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="select"
                                name="programId"
                                id="programId"
                                bsSize="sm"
                                onChange={this.getProductCategories}

                              >
                                <option value="-1">{i18n.t('static.common.select')}</option>
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
                      </Online>
                      <Offline>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                          <div className="controls">
                            <InputGroup>
                              <Input
                                type="select"
                                name="programId"
                                id="programId"
                                bsSize="sm"
                                onChange={this.getProductCategories}

                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {offlinePrograms.length > 0
                                  && offlinePrograms.map((item, i) => {
                                    return (
                                      <option key={i} value={item.id}>
                                        {item.name}
                                      </option>
                                    )
                                  }, this)}
                              </Input>

                            </InputGroup>
                          </div>
                        </FormGroup>
                      </Offline>
                      <Online>
                        <FormGroup className="col-md-3">
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
                                <option value="0">{i18n.t('static.common.all')}</option>
                                {productCategories.length > 0
                                  && productCategories.map((item, i) => {
                                    return (
                                      <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                        {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup></div>

                        </FormGroup>
                      </Online>
                      <Offline>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                          <div className="controls">
                            <InputGroup>
                              <Input
                                type="select"
                                name="productCategoryId"
                                id="productCategoryId"
                                bsSize="sm"
                                onChange={this.getPlanningUnit}
                              >
                                <option value="0">{i18n.t('static.common.all')}</option>
                                {offlineProductCategoryList.length > 0
                                  && offlineProductCategoryList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.id}>
                                        {item.name}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup></div>

                        </FormGroup>
                      </Offline>
                      <Online>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                          <div className="controls">
                            <InputGroup>
                              <Input
                                type="select"
                                name="planningUnitId"
                                id="planningUnitId"
                                bsSize="sm"
                                onChange={this.filterData}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {planningUnits.length > 0
                                  && planningUnits.map((item, i) => {
                                    return (
                                      <option key={i} value={item.planningUnit.id}>
                                        {getLabelText(item.planningUnit.label, this.state.lang)}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                              {/* <InputGroupAddon addonType="append">
 <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
 </InputGroupAddon> */}
                            </InputGroup>
                          </div>
                        </FormGroup>
                      </Online>
                      <Offline>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="select"
                                name="planningUnitId"
                                id="planningUnitId"
                                bsSize="sm"
                                onChange={this.filterData}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {offlinePlanningUnitList.length > 0
                                  && offlinePlanningUnitList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.id}>{item.name}</option>
                                    )
                                  }, this)}
                              </Input>
                              {/* <InputGroupAddon addonType="append">
 <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
 </InputGroupAddon> */}
                            </InputGroup>
                          </div>
                        </FormGroup>
                      </Offline>
                    </div>
                  </Col>
                </Form>

                <Col md="12 pl-0">
                  <div className="row">
                    <Online>
                      {
                        this.state.consumptions.length > 0
                        &&
                        <div className="col-md-12 p-0">
                          <div className="col-md-12">
                            <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                              <Bar id="cool-canvas" data={bar} options={options} />
                              <div>

                              </div>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                              {this.state.show ? 'Hide Data' : 'Show Data'}
                            </button>

                          </div>
                        </div>}



                    </Online>
                    <Offline>
                      {
                        this.state.offlineConsumptionList.length > 0
                        &&
                        <div className="col-md-12 p-0">
                          <div className="col-md-12">
                            <div className="chart-wrapper chart-graph-report">
                              <Bar id="cool-canvas" data={bar} options={options} />

                            </div>
                          </div>
                          <div className="col-md-12">
                            <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                              {this.state.show ? 'Hide Data' : 'Show Data'}
                            </button>
                          </div>
                        </div>}

                    </Offline>
                  </div>



                  <div className="row">
                    <div className="col-md-12 pl-0 pr-0">
                      {this.state.show &&
                        <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                          {/* <thead>
 <tr>
 <th style={{ width: '140px' }}></th>
 <td>Oct 2019</td>
 <td>Nov 2019</td>
 <td>Dec 2019</td>
 <td>Jan 2020</td>
 <td>Feb 2020</td>
 <td>Mar 2020</td>
 </tr>
 </thead>

 <tbody>
 <tr>
 <th>Forecasted</th>
 <td>71</td>
 <td>56</td>
 <td>70</td>
 <td>40</td>
 <td>70</td>
 <td>40</td>
 </tr>
 <tr>
 <th>Actual</th>
 <td>71</td>
 <td>56</td>
 <td>44</td>
 <td>40</td>
 <td>70</td>
 <td>40</td>
 </tr>
 </tbody> */}

                          {/* <style>{`
 tr {
 display: inline-flex;
 flex-direction: column;
 }
 `}</style> */}
                          {/* <style>{`
 tr { display: block; float: left; }
 th, td { display: block; }
 `}</style> */}


                          <thead>
                            <tr>
                              <th className="text-center"> {i18n.t('static.report.consumptionDate')} </th>
                              <th className="text-center"> {i18n.t('static.report.forecastConsumption')} </th>
                              <th className="text-center">{i18n.t('static.report.actualConsumption')}</th>
                            </tr>
                          </thead>

                          <tbody>
                            {
                              this.state.consumptions.length > 0
                              &&
                              this.state.consumptions.map((item, idx) =>

                                <tr id="addr0" key={idx} >
                                  {/* <td>
 {this.state.consumptions[idx].consumption_date}
 </td> */}
                                  <td>{moment(this.state.consumptions[idx].consumption_date, 'MM-YYYY').format('MMM YYYY')}</td>
                                  <td>

                                    {this.formatter(this.state.consumptions[idx].forcast)}
                                  </td>
                                  <td>
                                    {this.formatter(this.state.consumptions[idx].Actual)}
                                  </td></tr>)

                            }
                          </tbody>










                          {/* {
 this.state.consumptions.length > 0
 &&
 this.state.consumptions.map((item, idx) =>
 
 <tr id="addr0" key={idx} >
 <th style={{ width: '140px' }}></th>
 <td>{moment(this.state.consumptions[idx].consumption_date, 'MM-YYYY').format('MMM YYYY')}</td>
 </tr>

 <tr id="addr0" key={idx} >
 <th>Forecasted</th>
 <td>{this.formatter(this.state.consumptions[idx].forcast)}</td>
 </tr>

 <tr id="addr0" key={idx} >
 <th>Actual</th>
 <td> {this.formatter(this.state.consumptions[idx].Actual)}</td>
 </tr>
 
 )
 } */}






                        </Table>}
                    </div>
                  </div>

                </Col>
              </div>
            </div>
          </CardBody>
        </Card>
      </div >
    );
  }
}

export default Consumption;