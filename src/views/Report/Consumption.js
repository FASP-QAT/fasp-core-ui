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
import logoicon from '../../assets/img/logo.svg'
import jsPDF from "jspdf";
import "jspdf-autotable";
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
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false
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

  toggledata = () => this.setState((currentState) => ({show: !currentState.show}));

  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange')+' : '+this.state.rangeValue.from.month+'/'+this.state.rangeValue.from.year+' to '+this.state.rangeValue.to.month+'/'+this.state.rangeValue.to.year).replaceAll(' ','%20'))
    csvRow.push(i18n.t('static.program.program')+' : '+ (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ','%20'))
    csvRow.push(i18n.t('static.planningunit.planningunit')+' : '+ ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',','%20')).replaceAll(' ','%20'))
    csvRow.push('')
    csvRow.push('')
    var re;
    var A = [[(i18n.t('static.report.consumptionDate')).replaceAll(' ','%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ','%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ','%20')]]
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
    a.download = i18n.t('static.report.consumption_') + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
    document.body.appendChild(a)
    a.click()
  }
  

  exportPDF = () => {
    const addFooters = doc => {
       
      const pageCount = doc.internal.getNumberOfPages()
    
      doc.setFont('helvetica', 'bold')
       doc.setFontSize(10)
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i)
      
        doc.setPage(i)
        doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height-30, {
        align: 'center'
        })
        doc.text('Quantification Analytics Tool', doc.internal.pageSize.width *6/ 7, doc.internal.pageSize.height-30, {
        align: 'center'
        })
      
        
      }
    }
    const addHeaders = doc => {
      
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFont('helvetica', 'bold')
     
    //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
      // var reader = new FileReader();
     
  //var data='';
// Use fs.readFile() method to read the file 
//fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
//}); 
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(18)
        doc.setPage(i)
        var imagedata='data:image/png;base64,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'
        doc.addImage(imagedata,'png',0,10, 200, 50,'FAST');
        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.report.consumptionReport'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if(i==1){
          doc.setFontSize(12)
          doc.text(i18n.t('static.report.dateRange')+' : '+this.state.rangeValue.from.month+'/'+this.state.rangeValue.from.year+' to '+this.state.rangeValue.to.month+'/'+this.state.rangeValue.to.year, doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program')+' : '+ document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.planningunit.planningunit')+' : '+ document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
        }
       
      }
    }
    const unit = "pt";
    const size = "A1"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = "Consumption Report";
    var canvas = document.getElementById("cool-canvas");
    //creates image
    
    var canvasImg = canvas.toDataURL("image/png");
    var width = doc.internal.pageSize.width;    
    var height = doc.internal.pageSize.height;
    var h1=50;
    var aspectwidth1= (width-h1);

    doc.addImage(canvasImg, 'png', 50, 130,aspectwidth1, height*2/3 );
    
    const headers =[ [   i18n.t('static.report.consumptionDate'),
    i18n.t('static.report.forecastConsumption'),
    i18n.t('static.report.actualConsumption')]];
    const data =  navigator.onLine? this.state.consumptions.map( elt =>[ elt.consumption_date,elt.forcast,elt.Actual]):this.state.finalOfflineConsumption.map( elt =>[ elt.consumption_date,elt.forcast,elt.Actual]);
    
    let content = {
    margin: {top: 80},
    startY:  height,
    head: headers,
    body: data,
    
  };
  
   
   
    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save("report.pdf")
    //creates PDF from img
  /*  var doc = new jsPDF('landscape');
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
    if (navigator.onLine) {
      let realmId = AuthenticationService.getRealmId();
      AuthenticationService.setupAxiosInterceptors();
      ProductService.getConsumptionData(realmId, programId, planningUnitId, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate())
        .then(response => {
          console.log(JSON.stringify(response.data));
          this.setState({
            consumptions: response.data
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
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      ProductService.getProductCategoryListByProgram(programId)
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
    this.setState({ rangeValue: value })

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

        labels: this.state.consumptions.map((item, index) => (item.consumption_date)),
        datasets: [
          {
            label: i18n.t('static.report.actualConsumption'),
            backgroundColor: '#86CD99',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: this.state.consumptions.map((item, index) => (item.Actual)),
          }, {
            type: "line",
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
            data: this.state.consumptions.map((item, index) => (item.forcast))
          }
        ],



      }
    }
    if (!navigator.onLine) {
      bar = {

        labels: this.state.offlineConsumptionList.map((item, index) => (item.consumption_date)),
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
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <Row>
          <Col md="12">
            <Card>
              <CardHeader className="pb-1">
                <i className="icon-menu"></i><strong>{i18n.t('static.report.consumptionReport')}</strong>
                {/* <b className="count-text">{i18n.t('static.report.consumptionReport')}</b> */}
                <Online>
                  {
                    this.state.consumptions.length > 0 &&
                    <div className="card-header-actions">
                      <a className="card-header-action">
                      <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title="Export PDF"  onClick={() => this.exportPDF()}/>
                       
                       {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
                       
                          {({ toPdf }) =>
                            <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

                          }
                        </Pdf>*/}
                      </a>
                      <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                    </div>
                  }
                </Online>
                <Offline>
                  {
                    this.state.offlineConsumptionList.length > 0 &&
                    <div className="card-header-actions">
                      <a className="card-header-action">
                      <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title="Export PDF"  onClick={() => this.exportPDF()}/>
                     
                     {/*   <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
                          {({ toPdf }) =>
                            <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

                          }
                        </Pdf>*/}
                      </a>
                      <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                    </div>
                  }
                </Offline>
              </CardHeader>
              <CardBody>
                <div className="TableCust" >
                  <div className="container"> 
                  <div ref={ref}> 
                  <div className="col-md-12" >
                    <Form >
                      <Col>
                        <div className="row">
                          <FormGroup className="col-sm-3">
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
                      <Online>
                            <FormGroup className="col-sm-3">
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
                            <FormGroup className="col-sm-3">
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
                            <FormGroup className="col-sm-3">
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
                                    {productCategories.length > 0
                                      && productCategories.map((item, i) => {
                                        return (
                                          <option key={i} value={item.payload.productCategoryId}>
                                            {getLabelText(item.payload.label, this.state.lang)}
                                          </option>
                                        )
                                      }, this)}
                                  </Input>
                                </InputGroup></div>

                            </FormGroup>
                          </Online>
                          <Offline>
                            <FormGroup className="col-sm-3">
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
                                    <option value="0">{i18n.t('static.common.select')}</option>
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
                            <FormGroup className="col-sm-3">
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
                                  <InputGroupAddon addonType="append">
                                    <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                  </InputGroupAddon>
                                </InputGroup>
                              </div>
                            </FormGroup>
                          </Online>
                          <Offline>
                            <FormGroup className="col-sm-3">
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
                                  <InputGroupAddon addonType="append">
                                    <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                  </InputGroupAddon>
                                </InputGroup>
                              </div>
                            </FormGroup>
                          </Offline>
                        </div>
                      </Col>
                    </Form>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                    <Online>
                      {
                        this.state.consumptions.length > 0
                        &&
                        <div className="col-md-12">
                        <div className="col-md-9">
                        <div   className="chart-wrapper chart-graph">
                          <Bar id="cool-canvas" data={bar} options={options} />
                     
                        </div>
                        </div>
                        <div className="col-md-12">
                            <button className="mr-1 float-right btn btn-info btn-md showdatabtn"  onClick={this.toggledata}>
                            {this.state.show ? 'Hide Data' : 'Show Data'}
                         </button>    
        
                       </div>
                       </div>}
                        <br></br>
                    </Online>
                    <Offline>
                      {
                        this.state.offlineConsumptionList.length > 0
                        &&
                        <div className="col-md-12">
                        <div className="col-md-9">
                        <div className="chart-wrapper chart-graph">
                          <Bar id="cool-canvas" data={bar} options={options} />
                        
                        </div>
                        </div>
                        <div className="col-md-12">
                             <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                             {this.state.show ? 'Hide Data' : 'Show Data'}
                             </button>    
                        </div>
                        </div>}
                        <br></br>
                    </Offline>
                  </div>
                </div>
              </div>
                <div className="row">
                  <div className="col-md-12">
                  {this.state.show &&  <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                      <thead>
                        <tr>
                          <th className="text-center"> {i18n.t('static.report.consumptionDate')} </th>
                          <th className="text-center"> {i18n.t('static.report.forecastConsumption')} </th>
                          <th className="text-center">{i18n.t('static.report.actualConsumption')}</th>
                        </tr>
                      </thead>
                      <Online>
                        <tbody>
                          {
                            this.state.consumptions.length > 0
                            &&
                            this.state.consumptions.map((item, idx) =>

                              <tr id="addr0" key={idx} >
                                <td>
                                  {this.state.consumptions[idx].consumption_date}
                                </td>
                                <td>

                                  {this.state.consumptions[idx].forcast}
                                </td>
                                <td>
                                  {this.state.consumptions[idx].Actual}
                                </td></tr>)

                                 }
                         </tbody>
                      </Online>
                      <Offline>
                          <tbody>
                                {
                          this.state.offlineConsumptionList.length > 0
                            &&
                            this.state.offlineConsumptionList.map((item, idx) =>

                         <tr id="addr0" key={idx} >
                            <td>
                               {this.state.offlineConsumptionList[idx].consumption_date}
                             </td>
                            <td>

                              {this.state.offlineConsumptionList[idx].forcast}
                             </td>
                            <td>
                               {this.state.offlineConsumptionList[idx].Actual}
                             </td>
                          </tr>)

                          }
                        </tbody>
                      </Offline>
                    </Table>}
                    </div>
                    </div>

                  </div>
                  </div>
              </CardBody>
            </Card>
          </Col>
        </Row>



      </div>
    );
  }
}

export default Consumption;
