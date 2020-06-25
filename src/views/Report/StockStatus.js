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
import actualIcon from '../../assets/img/actual.png';
import csvicon from '../../assets/img/csv.png'
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import ReportService from '../../api/ReportService'
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const options = {
  scales: {

    yAxes: [{
      id: 'A',
      position: 'left',
      scaleLabel: {
        display: true,
        fontSize:"12"
      },
      ticks: {
        beginAtZero: true,
        fontColor: 'black'
      }
    }, {
      id: 'B',
      position: 'right',
      scaleLabel: {
        display: true,

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
      fontColor: 'black'
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
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  from: 'From', to: 'To',
}



class StockStatus extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      programs: [],
      productCategories: [],
      planningUnits: [],
      stockStatusList: [],
      show: false,
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
   makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }

  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.productcategory.productcategory').replaceAll(' ', '%20') + '  ,  ' + (document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push('')
    csvRow.push('')
    csvRow.push('')
    csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
    csvRow.push('')

    const headers = [[i18n.t('static.report.month').replaceAll(' ', '%20'),
    i18n.t('static.dashboard.consumption').replaceAll(' ', '%20'),
    i18n.t('static.consumption.actual').replaceAll(' ', '%20'),
    i18n.t('static.supplyPlan.shipmentQty').replaceAll(' ', '%20'),
    (i18n.t('static.budget.fundingsource')+"-"+i18n.t('static.supplyPlan.shipmentStatus')).replaceAll(' ', '%20'),
    i18n.t('static.report.adjustmentQty').replaceAll(' ', '%20'),
    i18n.t('static.report.closingbalance').replaceAll(' ', '%20'),
    i18n.t('static.report.mos').replaceAll(' ', '%20'),
    i18n.t('static.report.minmonth').replaceAll(' ', '%20'),
    i18n.t('static.report.maxmonth').replaceAll(' ', '%20')]];

    var A = headers
    var re;
      this.state.stockStatusList.map(ele => A.push([ele.transDate.replaceAll(' ', '%20'), ele.consumptionQty, ele.actual?'Yes':'', ele.shipmentQty,
      (( ele.shipmentList.map(item=>{return(
         " [ "+getLabelText(item.fundingSource.label,this.state.lang)+" : "+getLabelText(item.shipmentStatus.label,this.state.lang)+" ] "
       )}).toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')
       , ele.adjustmentQty, ele.closingBalance, ele.mos, ele.minMonths, ele.maxMonths]));
    
    /*for(var item=0;item<re.length;item++){
      A.push([re[item].consumption_date,re[item].forcast,re[item].Actual])
    } */
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
        doc.text(i18n.t('static.dashboard.stockstatus'), doc.internal.pageSize.width / 2, 60, {
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
          doc.text(i18n.t('static.productcategory.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
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
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(8);
    var canvas = document.getElementById("cool-canvas");
    //creates image

    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var aspectwidth1 = (width - h1);

    doc.addImage(canvasImg, 'png', 50, 220,750,260,'CANVAS');

    const header = [[i18n.t('static.report.month'),
    i18n.t('static.dashboard.consumption'),
    i18n.t('static.consumption.actual'),
    i18n.t('static.supplyPlan.shipmentQty'),
    (i18n.t('static.budget.fundingsource')+" : "+i18n.t('static.supplyPlan.shipmentStatus')),
    i18n.t('static.report.adjustmentQty'),
    i18n.t('static.report.closingbalance'),
    i18n.t('static.report.mos'),
    i18n.t('static.report.minmonth'),
    i18n.t('static.report.maxmonth')]];

  let data=
      this.state.stockStatusList.map(ele => [ele.transDate, this.formatter(ele.consumptionQty), ele.actual?'Yes':'', this.formatter(ele.shipmentQty),
       ele.shipmentList.map(item=>{return(
         " [ "+getLabelText(item.fundingSource.label,this.state.lang) +" : "+getLabelText(item.shipmentStatus.label,this.state.lang)+" ] "
       ) })
       , this.formatter(ele.adjustmentQty), this.formatter(ele.closingBalance), this.formatter(ele.mos), this.formatter(ele.minMonths), this.formatter(ele.maxMonths)]);
  
    let content = {
      margin: { top: 80 },
      startY: height,
      head: header,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, cellWidth: 67, halign: 'center' },
      columnStyles: {
        4: { cellWidth: 158.89 },
      }
    };
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.stockstatus') + ".pdf")
  }


  filterData() {
    let programId = document.getElementById("programId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    let versionId = this.getversion()
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

    if (programId != 0 && planningUnitId != 0) {
      var inputjson = {
        "programId": programId,
        "versionId": versionId,
        "startDate": startDate,
        "stopDate": endDate,
        "planningUnitId": planningUnitId,

      }
      this.setState({
        stockStatusList: [{
          transDate: 'Jan 20', consumptionQty: 17475, actual: true, shipmentQty: 0, shipmentList: [
          ], adjustmentQty: -10122, closingBalance: 27203, mos: 1.28, minMonths: 1.2, maxMonths: 2.5
        },
        {
          transDate: 'Feb 20', consumptionQty: 25135, actual: false, shipmentQty: 0, shipmentList: [], adjustmentQty: 3999
          , closingBalance: 6067, mos: 1.21, minMonths: 1.0, maxMonths: 1.5
        },
        {
          transDate: 'Mar 20', consumptionQty: 49880, actual: true, shipmentQty: 78900, shipmentList: [
            { shipmentQty: 78900, fundingSource: { id: 1, label: { label_en: 'PEPFAR' } }, shipmentStatus: { id: 1, label: { label_en: 'Delivered' } } }
          ], adjustmentQty: 105, closingBalance: 36137, mos: 1.34, minMonths: 1.0, maxMonths: 2.0
        }
          , { transDate: 'Apr 20', consumptionQty: 25177, actual: false, shipmentQty: 0, shipmentList: [], adjustmentQty: -135, closingBalance: 10960, mos: 0.54, minMonths: 0.5, maxMonths: 2.5 },
        { transDate: 'May 20', consumptionQty: 16750, actual: false, shipmentQty: 0, shipmentList: [], adjustmentQty: -579, closingBalance: 0, mos: 1.2, minMonths: 1.0, maxMonths: 1.5 },
        {
          transDate: 'Jun 20', consumptionQty: 14000, actual: false, shipmentQty: 40000, shipmentList: [
            { shipmentQty: 40000, fundingSource: { id: 1, label: { label_en: 'PEPFAR' } }, shipmentStatus: { id: 1, label: { label_en: 'Planned' } } }

          ], adjustmentQty: 0, closingBalance: 26000, mos: 2.1, minMonths: 2.0, maxMonths: 3.5
        }
       ]
      })
      /*  AuthenticationService.setupAxiosInterceptors();
        ReportService.getStockStatusData(inputjson)
          .then(response => {
            console.log(JSON.stringify(response.data));
            this.setState({
              stockStatusList: response.data
            })
          }).catch(
            error => {
              this.setState({
                stockStatusList: []
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
          );*/
    } else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), stockStatusList: [] });

    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), stockStatusList: [] });

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
      console.log('changed')
      AuthenticationService.setupAxiosInterceptors();
      let programId = document.getElementById("programId").value;
      ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
        console.log('**' + JSON.stringify(response.data))
        this.setState({
          planningUnits: response.data,
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
          console.log("myResult", myResult);
          var programId = (document.getElementById("programId").value).split("_")[0];
          console.log('programId----->>>', programId)
          console.log(myResult);
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
          console.log("proList---" + proList);
          this.setState({
            planningUnitList: proList
          })
        }.bind(this);
      }.bind(this)

    }

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
  getProductCategories() {
    let realmId = AuthenticationService.getRealmId();
    let programId = document.getElementById("programId").value;
    AuthenticationService.setupAxiosInterceptors();
    ProductService.getProductCategoryListByProgram(realmId, programId)
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
    this.getPlanningUnit();

  }

  componentDidMount() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      this.getPrograms();

    } else {

      console.log("In component did mount", new Date())
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
            programList: proList
          })

        }.bind(this);
      }

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
    this.setState({ rangeValue: value })

  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {

    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (
          <option key={i} value={item.planningUnit.id}>
            {getLabelText(item.planningUnit.label, this.state.lang)}
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
      }, this);
    const bar = {

      labels: this.state.stockStatusList.map((item, index) => (item.transDate)),
      datasets: [
        {
          type: "line",
          yAxisID: 'B',
          label: i18n.t('static.report.minmonth'),
          backgroundColor: 'rgba(255,193,8,0.2)',
          borderColor: '#f86c6b',
          borderStyle: 'dotted',
          borderDash: [10, 10],
          fill: '+1',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          showInLegend: true,
          pointStyle: 'line',
          yValueFormatString: "$#,##0",
          lineTension: 0,
          data: this.state.stockStatusList.map((item, index) => (item.minMonths))
        }
        , {
          type: "line",
          yAxisID: 'B',
          label: i18n.t('static.report.maxmonth'),
          backgroundColor: 'rgba(0,0,0,0)',
          borderColor: '#ffc107',
          borderStyle: 'dotted',
          borderDash: [10, 10],
          fill: true,
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          lineTension: 0,
          pointStyle: 'line',
          showInLegend: true,
          yValueFormatString: "$#,##0",
          data: this.state.stockStatusList.map((item, index) => (item.maxMonths))
        }
        , {
          type: "line",
          yAxisID: 'B',
          label: "MOS",
          borderColor: '#205493',
          backgroundColor: 'transparent',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          lineTension: 0,
          showInLegend: true,
          pointStyle: 'line',
          yValueFormatString: "$#,##0",
          data: this.state.stockStatusList.map((item, index) => (item.mos))
        }
        , {
          type: "line",
          yAxisID: 'A',
          label: "Consumption",
          backgroundColor: 'transparent',
          borderColor: '#388b70',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          lineTension: 0,
          showInLegend: true,
          pointStyle: 'line',
          yValueFormatString: "$#,##0",
          data: this.state.stockStatusList.map((item, index) => (item.consumptionQty))
        },
        {
          label: "Stock",
          yAxisID: 'A',
          type: 'line',
          borderColor: 'rgba(179,181,158,1)',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          lineTension: 0,
          pointStyle: 'line',
          showInLegend: true,
          data: this.state.stockStatusList.map((item, index) => (item.closingBalance))
        }, {
          label: 'Delivered',
          yAxisID: 'A',
          stack: 1,
          backgroundColor: '#042e6a',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: this.state.stockStatusList.map((item, index) => {let count=0;
            count=+(item.shipmentList.map((ele,index)=>{
             return(ele.shipmentStatus.label.label_en=="Delivered"? count=count+ele.shipmentQty:count)}))
          return count
        })},
        {
          label: 'Shipped',
          yAxisID: 'A',
          stack: 1,
          backgroundColor: '#6a82a8',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: this.state.stockStatusList.map((item, index) => {let count=0;
            count=+(item.shipmentList.map((ele,index)=>{
             return(ele.shipmentStatus.label.label_en=="Shipped"? count=count+ele.shipmentQty:count)}))
          return count
        }) },
       
        {
          label: 'Ordered',
          yAxisID: 'A',
          stack: 1,
          backgroundColor: '#8aa9e6',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: this.state.stockStatusList.map((item, index) => {let count=0;
            count=+(item.shipmentList.map((ele,index)=>{
             return(ele.shipmentStatus.label.label_en=="Ordered"? count=count+ele.shipmentQty:count)}))
          return count
        })},
        {
          label: 'Planned',
          backgroundColor: '#cfd5ea',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          yAxisID: 'A',
          stack: 1,
          data: this.state.stockStatusList.map((item, index) => {let count=0;
            count=+(item.shipmentList.map((ele,index)=>{
             return(ele.shipmentStatus.label.label_en=="Planned"? count=count+ele.shipmentQty:count)}))
          return count
        })  }
        
      ],

    };
    const { productCategories } = this.state;
    let productCategoryList = productCategories.length > 0
      && productCategories.map((item, i) => {
        return (
          <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
            {Array(item.level).fill('_ _ ').join('') + (getLabelText(item.payload.label, this.state.lang))}
          </option>
        )
      }, this);
    
    const { rangeValue } = this.state

   

    return (
      <div className="animated fadeIn" >
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>

        <Card>
          <CardHeader>
            <i className="icon-menu"></i><strong>Stock Status Report</strong>
            <div className="card-header-actions">
              <a className="card-header-action">
              {this.state.stockStatusList.length > 0 && <div className="card-header-actions">
                <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                <img style={{ height: '25px', width: '25px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV( )} />
              </div>}
              </a>
            </div>
          </CardHeader>
          <CardBody>
            <div className="TableCust" >
              <div ref={ref}>

                <Form >
                  <Col md="12 pl-0">
                    <div className="row">
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">Select Period</Label>
                        <div className="controls  edit">

                          <Picker
                            ref="pickRange"
                            years={{ min: 2013 }}
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
                              onChange={this.getProductCategories}

                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {programList}
                            </Input>

                          </InputGroup>
                        </div>
                      </FormGroup>

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
                              {productCategoryList}
                            </Input>

                          </InputGroup>
                        </div>
                      </FormGroup>

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
                              {planningUnitList}
                            </Input>
                            {/* <InputGroupAddon addonType="append">
                                  <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                </InputGroupAddon> */}
                          </InputGroup>
                        </div>
                      </FormGroup>
                    </div>
                  </Col>
                </Form>
                <Col md="12 pl-0">
                  <div className="row">
                    {
                      this.state.stockStatusList.length > 0
                      &&
                      <div className="col-md-12 p-0">
                        <div className="col-md-12">
                          <div className="chart-wrapper chart-graph-report">
                            <Bar id="cool-canvas" data={bar} options={options} />

                          </div>
                        </div>
                        <div className="col-md-12">
                          <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                            {this.state.show ? 'Hide Data' : 'Show Data'}
                          </button>

                        </div>
                      </div>}


                  </div>



                  {this.state.show && <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                    <thead>
                      <tr><th rowSpan="2" style ={{width:"200px"}}>{i18n.t('static.report.month')}</th> <th className="text-center" colSpan="2"> {i18n.t('static.dashboard.consumption')} </th> <th className="text-center" colSpan="2"> {i18n.t('static.shipment.shipment')} </th> <th className="text-center" colSpan="5"> {i18n.t('static.report.stock')} </th> </tr><tr>

                        <th className="text-center"style ={{width:"200px"}}> {i18n.t('static.dashboard.consumption')} </th>
                        <th className="text-center" style ={{width:"200px"}}>{i18n.t('static.consumption.actual')  }</th>
                        <th className="text-center"style ={{width:"200px"}}>{i18n.t('static.supplyPlan.shipmentQty')}</th>
                        <th className="text-center" style ={{width:"200px"}}>{ (i18n.t('static.budget.fundingsource')+" : "+i18n.t('static.supplyPlan.shipmentStatus'))}</th>
                        <th className="text-center" style ={{width:"200px"}}>{i18n.t('static.report.adjustmentQty')}</th>
                        <th className="text-center" style ={{width:"200px"}}>{i18n.t('static.report.closingbalance')}</th>
                        <th className="text-center" style ={{width:"200px"}}>{ i18n.t('static.report.mos')}</th>
                        <th className="text-center" style ={{width:"200px"}}>{i18n.t('static.report.minmonth')}</th>
                        <th className="text-center" style ={{width:"200px"}}>{i18n.t('static.report.maxmonth')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        this.state.stockStatusList.length > 0
                        &&
                        this.state.stockStatusList.map((item, idx) =>

                          <tr id="addr0" key={idx} >
                            <td>
                              {this.state.stockStatusList[idx].transDate}
                            </td>
                            <td>

                              {this.formatter(this.state.stockStatusList[idx].consumptionQty)}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].actual ? <img src={actualIcon} /> : ''}
                            </td>
                            <td>
                              {this.formatter(this.state.stockStatusList[idx].shipmentQty)}
                            </td>
                            <td align="center">
                              {this.state.stockStatusList[idx].shipmentList.map((item, index) => {
                                return (`[ ${item.fundingSource.label.label_en} : ${item.shipmentStatus.label.label_en} ]  `)
                                //return (<tr><td>{item.shipmentQty}</td><td>{item.fundingSource.label.label_en}</td><td>{item.shipmentStatus.label.label_en}</td></tr>)
                              })}
                            </td>
                            <td>
                              {this.formatter(this.state.stockStatusList[idx].adjustmentQty)}
                            </td>
                            <td>
                              {this.formatter(this.state.stockStatusList[idx].closingBalance)}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].mos}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].minMonths}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].maxMonths}
                            </td>
                          </tr>)

                      }
                    </tbody>

                  </Table>}
                </Col></div></div>



          </CardBody>
        </Card>

      </div>
    );
  }
}

export default StockStatus;
