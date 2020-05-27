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
import Select from 'react-select';
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
import RealmCountryService from '../../api/RealmCountryService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import ReportService from '../../api/ReportService';
import ProgramService from '../../api/ProgramService';
// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}

const options = {
  title: {
    display: true,
    text: i18n.t('static.dashboard.globalconsumption')
  },
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: i18n.t('static.dashboard.consumption')
      },
      stacked: true,
      ticks: {
        beginAtZero: true
      }
    }]
  },
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false
  ,
  legend: {
    display: true,
    position: 'bottom',
    labels: {
      usePointStyle: true,
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



class GlobalConsumption extends Component {
  constructor(props) {
    super(props);

    this.toggledata = this.toggledata.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem('lang'),
      countrys: [],
      planningUnits: [],
      consumptions: [],
      productCategories: [],
      countryValues: [],
      countryLabels: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      programValues: [],
      programLabels: [],
      programs:[],
      message:'',
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



    };
    this.getCountrys = this.getCountrys.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.getProductCategories = this.getProductCategories.bind(this)
    this.getPrograms=this.getPrograms.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getRandomColor = this.getRandomColor.bind(this)
    this.handleChangeProgram=this.handleChangeProgram.bind(this)
    this.handlePlanningUnitChange=this.handlePlanningUnitChange.bind(this)
  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
 
  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' , ' +this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ','%20'))
    this.state.programLabels.map(ele=>
      csvRow.push(i18n.t('static.dashboard.country') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
      this.state.programLabels.map(ele=>
      csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
      csvRow.push((i18n.t('static.dashboard.productcategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
      this.state.planningUnitLabels.map(ele=>
      csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
      csvRow.push('')
      csvRow.push('')
      csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
      csvRow.push('')
    var re;

    var A = [[(i18n.t('static.dashboard.country')).replaceAll(' ','%20'),(i18n.t('static.report.month')).replaceAll(' ','%20'),(i18n.t('static.consumption.consumptionqty')).replaceAll(' ','%20')]]

    re = this.state.consumptions

    for (var item = 0; item < re.length; item++) {
      A.push([[getLabelText(re[item].realmCountry.label),re[item].consumptionDateString,re[item].planningUnitQty]])
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
      doc.setFontSize(10)
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i)

        doc.setPage(i)
        doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
          align: 'center'
        })
        doc.text('Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.report.consumptionReport'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(12)
          doc.text(i18n.t('static.report.dateRange') + ' : ' +this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.toString(), doc.internal.pageSize.width / 8, 110, {
            align: 'left'
        })
          doc.text(i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString(), doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
          doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
            align: 'left'
          })
          doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.toString(), doc.internal.pageSize.width / 8, 170, {
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

    doc.setFontSize(15);

    const title = "Consumption Report";
    var canvas = document.getElementById("cool-canvas");
    //creates image

    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var aspectwidth1 = (width - h1);

    doc.addImage(canvasImg, 'png', 50, 200,750,290,'CANVAS');
      
      const headers =[[i18n.t('static.dashboard.country'),i18n.t('static.report.month'),i18n.t('static.consumption.consumptionqty')]]
      const data =   this.state.consumptions.map( elt =>[getLabelText(elt.realmCountry.label),elt.consumptionDateString,elt.planningUnitQty]);
      
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










 handleChange(countrysId) {

    this.setState({
      countryValues: countrysId.map(ele=>ele.value),
      countryLabels: countrysId.map(ele=>ele.label)},() => {
  
        this.filterData(this.state.rangeValue)})
  }
   handleChangeProgram(programIds) {

     this.setState({
      programValues: programIds.map(ele=>ele.value),
      programLabels: programIds.map(ele=>ele.label)},() => {
  
      this.filterData(this.state.rangeValue)})
    
  }

  handlePlanningUnitChange(planningUnitIds) {
   
    this.setState({
      planningUnitValues: planningUnitIds.map(ele=>ele.value),
      planningUnitLabels:planningUnitIds.map(ele=>ele.label)},() => {
  
        this.filterData(this.state.rangeValue)})
  }


  filterData(rangeValue) {
    /*this.setState({
      consumptions: {date:["04-2019","05-2019","06-2019","07-2019"],countryData:[{label:"c1",value:[10,4,5,7]},
      {label:"c2",value:[13,2,8,7]},
      {label:"c3",value:[9,1,0,7]},
      {label:"c4",value:[5,4,3,7]}]}
    })
    */
   setTimeout('', 10000);
    let productCategoryId = document.getElementById("productCategoryId").value;
    let CountryIds = this.state.countryValues;
    let planningUnitIds = this.state.planningUnitValues;
    let programIds = this.state.programValues
    let startDate=rangeValue.from.year + '-' + rangeValue.from.month + '-01';
    let stopDate=rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
    if(CountryIds.length>0 && planningUnitIds.length>0&&programIds.length>0){
    
    var inputjson={
    "realmCountryIds":CountryIds,"programIds":programIds,"planningUnitIds":planningUnitIds,"startDate": startDate,"stopDate":stopDate
   }
   console.log('***'+inputjson)
    AuthenticationService.setupAxiosInterceptors();
    
    ReportService.getGlobalConsumptiondata( inputjson )
      .then(response => {
        console.log(JSON.stringify(response.data));
        this.setState({
          consumptions: response.data,
          message:''
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
                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );
      } else if(CountryIds.length==0){
        this.setState({ message: i18n.t('static.program.validcountrytext'),consumptions:[] });
                
      }else if(programIds.length==0){
        this.setState({ message: i18n.t('static.common.selectProgram') ,consumptions:[]});
                
      }else if(productCategoryId==-1){
        this.setState({ message: i18n.t('static.common.selectProductCategory'),consumptions:[] });
    
      }else{
        this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'),consumptions:[] });
   
      }
  }

  getCountrys() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      let realmId = AuthenticationService.getRealmId();
      RealmCountryService.getRealmCountryrealmIdById(realmId)
        .then(response => {
          this.setState({
            countrys: response.data
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
                default:
                  this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                  break;
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
        var transaction = db1.transaction(['CountryData'], 'readwrite');
        var Country = transaction.objectStore('CountryData');
        var getRequest = Country.getAll();
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
              var bytes = CryptoJS.AES.decrypt(myResult[i].CountryName, SECRET_KEY);
              var CountryNameLabel = bytes.toString(CryptoJS.enc.Utf8);
              var CountryJson = {
                name: getLabelText(JSON.parse(CountryNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = CountryJson
            }
          }
          this.setState({
            countrys: proList
          })

        }.bind(this);

      }

    }


  }
  getPlanningUnit() {
    if (navigator.onLine) {
      console.log('changed')
      let productCategoryId = document.getElementById("productCategoryId").value;
      AuthenticationService.setupAxiosInterceptors();
if(productCategoryId!=-1){
      PlanningUnitService.getPlanningUnitByProductCategoryId(productCategoryId).then(response => {
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
                //  this.setState({ message: error.response.data.messageCode });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );}
    } else {
      const lan = 'en';
      var db1;
      var storeOS;
      getDatabase();
      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var planningunitTransaction = db1.transaction(['CountryPlanningUnit'], 'readwrite');
        var planningunitOs = planningunitTransaction.objectStore('CountryPlanningUnit');
        var planningunitRequest = planningunitOs.getAll();
        var planningList = []
        planningunitRequest.onerror = function (event) {
          // Handle errors!
        };
        planningunitRequest.onsuccess = function (e) {
          var myResult = [];
          myResult = planningunitRequest.result;
          var CountryId = (document.getElementById("CountryId").value).split("_")[0];
          var proList = []
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].Country.id == CountryId) {
              var productJson = {
                name: getLabelText(myResult[i].planningUnit.label, lan),
                id: myResult[i].planningUnit.id
              }
              proList[i] = productJson
            }
          }
          this.setState({
            planningUnitList: proList
          })
        }.bind(this);
      }.bind(this)

    }

  }

  getPrograms() {
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
      }

  getProductCategories() {
    AuthenticationService.setupAxiosInterceptors();
    let realmId = AuthenticationService.getRealmId();
    ProductService.getProductCategoryList(realmId)
      .then(response => {
        console.log(response.data)
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
    AuthenticationService.setupAxiosInterceptors();
    this.getPrograms()
    this.getCountrys();
    this.getProductCategories()

  }

  toggledata = () => this.setState((currentState) => ({show: !currentState.show}));

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
    this.filterData(value);
  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  render() {
    const { planningUnits } = this.state;
        let planningUnitList =[];
        planningUnitList=planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.planningUnitId }

                )
            }, this);
            const { programs } = this.state;
            let programList =[];
            programList=programs.length > 0
                && programs.map((item, i) => {
                    return (
    
                        { label: getLabelText(item.label, this.state.lang), value: item.programId }
    
                    )
                }, this);
    const { countrys } = this.state;
    // console.log(JSON.stringify(countrys))
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      console.log(JSON.stringify(item))
      return ({ label: getLabelText(item.country.label, this.state.lang), value: item.realmCountryId })
    }, this);
    const { productCategories } = this.state;
    let productCategoryList = productCategories.length > 0
      && productCategories.map((item, i) => {
        return (
          <option key={i} value={item.payload.productCategoryId}>
            {getLabelText(item.payload.label, this.state.lang)}
          </option>
        )
      }, this);

    const backgroundColor = [
      '#4dbd74',
      '#c8ced3',
      '#000',
      '#ffc107',
      '#f86c6b',
    ]
    let country=[...new Set(this.state.consumptions.map(ele=>(getLabelText(ele.realmCountry.label,this.state.lang))))]
    let consumptiondata=[];
    let data=[];
    for (var i = 0; i < country.length; i++) {
    data=this.state.consumptions.filter(c=> country[i].localeCompare(getLabelText(c.realmCountry.label,this.state.lang))==0).map(ele=>(ele.planningUnitQty))
    console.log(data)
    consumptiondata.push(data)}
   
    const bar = {

      labels: [...new Set(this.state.consumptions.map(ele=>(ele.consumptionDateString)))],
      datasets: consumptiondata.map((item, index) => ({ stack: 1, label: country[index], data: item, backgroundColor: backgroundColor[index] }))
      /* datasets: [
         {
           label: 'Actual Cconsumptionsonsuconsumptionsmption',
           backgroundColor: '#86CD99',
           borderColor: 'rgba(179,181,198,1)',
           pointBackgroundColor: 'rgba(179,181,198,1)',
           pointBorderColor: '#fff',
           pointHoverBackgroundColor: '#fff',
           pointHoverBorderColor: 'rgba(179,181,198,1)',
           data: this.state.consumptions.map((item, index) => (item.Actual)),
         }, {
           type: "line",
           label: "Forecast Consumption",
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
       ],*/

    };
    const pickerLang = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
        <h5>{i18n.t(this.state.message)}</h5>

        <Card>
          <CardHeader>
            <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.globalconsumption')}</strong>
           {this.state.consumptions.length > 0 && <div className="card-header-actions">
              <a className="card-header-action">
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />

              </a>
            </div>}
          </CardHeader>
          <CardBody>
            <div ref={ref}>

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
                      <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}<span className="red Reqasterisk">*</span></Label>
                      <InputGroup>
                      <div className="controls edit">
                        <ReactMultiSelectCheckboxes

                          bsSize="sm"
                          name="countrysId"
                          id="countrysId"
                          onChange={(e) => { this.handleChange(e) }}
                          options={countryList && countryList.length>0?countryList:[]}
                        />
                        {!!this.props.error &&
                          this.props.touched && (
                            <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                          )}
                          </div>
                      </InputGroup>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="programIds">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
                      <InputGroup>
                        <ReactMultiSelectCheckboxes

                          bsSize="sm"
                          name="programIds"
                          id="programIds"
                          onChange={(e) => { this.handleChangeProgram(e) }}
                          options={programList && programList.length>0?programList:[]}
                        />
                        {!!this.props.error &&
                          this.props.touched && (
                            <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                          )}
                      </InputGroup>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}<span className="red Reqasterisk">*</span></Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="productCategoryId"
                            id="productCategoryId"
                            bsSize="sm"
                            onChange={this.getPlanningUnit}
                          >
                            <option value="-1">{i18n.t('static.common.select')}</option>
                            {productCategories.length > 0
                              && productCategories.map((item, i) => {
                                return (
                                  <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                    {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                  </option>
                                )
                              }, this)}
                          </Input>
                        </InputGroup>
                      </div>

                    </FormGroup>
                    <FormGroup className="col-sm-3">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}<span className="red Reqasterisk">*</span></Label>
                                                                <div className="controls">
                                                                    <InputGroup>  
                                                                     <ReactMultiSelectCheckboxes
                                                                    
                                                                        name="planningUnitId"
                                                                        id="planningUnitId"
                                                                        bsSize="sm"
                                                                        onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                                        options={planningUnitList && planningUnitList.length>0?planningUnitList:[]}
                                                                    />
                                                                     </InputGroup>  
                                                                       </div>
                                                                       </FormGroup>
                                                           
                  </div>
                </Col>
              </Form>
              <Col md="12 pl-0">
                <div className="row">

                  {
                    this.state.consumptions.length > 0
                    &&
                    <div className="col-md-12 grapg-margin " >
                    <div className="col-md-12">
                      <div className="chart-wrapper chart-graph-report">
                        <Bar id="cool-canvas" data={bar} options={options} />
                      </div>
                    </div>   <div className="col-md-12">
                        <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                          {this.state.show ? 'Hide Data' : 'Show Data'}
                        </button>

                      </div> </div>}

                </div>
                <div className="row">
                    <div className="col-md-12">
                      {this.state.show && this.state.consumptions.length > 0 &&
                    
                       <Table responsive className="table-striped  table-hover table-bordered text-center mt-2">

                        <thead>
                          <tr>
                          <th className="text-center" style={{width:'34%'}}> {i18n.t('static.dashboard.country')} </th>
                            <th className="text-center " style={{width:'34%'}}> {i18n.t('static.report.month')} </th>
                            <th className="text-center" style={{width:'34%'}}>{i18n.t('static.consumption.consumptionqty')}</th>
                              </tr>
                        </thead>
                       
                          <tbody>
                            {
                              this.state.consumptions.length > 0
                              &&
                              this.state.consumptions.map((item, idx) =>

                                <tr id="addr0" key={idx} >
                                
                                  <td>{getLabelText(this.state.consumptions[idx].realmCountry.label,this.state.lang)}</td>
                                  <td>

                                    {this.state.consumptions[idx].consumptionDateString}
                                  </td>
                                  <td >
                                    {this.state.consumptions[idx].planningUnitQty}
                                  </td>
                                 </tr>)

                            }
                          </tbody>
                 </Table>
                 }

                   </div>
                   </div>
              </Col>

            </div>

          </CardBody>
        </Card>

      </div>
    );
  }
}

export default GlobalConsumption;
