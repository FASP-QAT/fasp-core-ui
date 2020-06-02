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
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';

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
const Widget04 = lazy(() => import('../Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();


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




class ForecastMetrics extends Component {
  constructor(props) {
    super(props);

   
    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem('lang'),
      countrys: [],
      planningUnits: [],
      consumptions: [],
      productCategories: [],
      programs:[],
      countryValues: [],
      countryLabels: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      programValues: [],
      programLabels: [],
      message:'',
      singleValue2: {year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
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
    this.formatLabel = this.formatLabel.bind(this);
    this.formatValue=this.formatValue.bind(this)
    this.pickAMonth2 = React.createRef();
    this.rowClassNameFormat = this.rowClassNameFormat.bind(this)
  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  roundN = num=>{
    return parseFloat(Math.round(num * Math.pow(10, 2)) /Math.pow(10,2)).toFixed(2);
  }
  formatLabel(cell, row) {
    // console.log("celll----", cell);
    if (cell != null && cell != "") {
      return getLabelText(cell, this.state.lang);
    }
  }

  formatValue(cell, row) {
    // console.log("celll----", cell);
    if (cell != null && cell != "") {
      return this.roundN(cell*100)+'%';
    }else if(cell=="0" && row.months==0){
      return "No data points containing both actual and forecast consumption ";
    }else{
      return "0%"
    }
  }
  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.selectMonth') + ' , ' +this.makeText(this.state.singleValue2)).replaceAll(' ','%20'))
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

    var A = [[(i18n.t('static.dashboard.country')).replaceAll(' ','%20'),(i18n.t('static.dashboard.program')).replaceAll(' ','%20'),(i18n.t('static.dashboard.planningunit')).replaceAll(' ','%20'),
    //(i18n.t('static.report.historicalConsumptionDiff')).replaceAll(' ','%20'),(i18n.t('static.report.historicalConsumptionActual')).replaceAll(' ','%20'),
    (i18n.t('static.report.error')).replaceAll(' ','%20'),(i18n.t('static.report.noofmonth')).replaceAll(' ','%20')]]

    re = this.state.consumptions

    for (var item = 0; item < re.length; item++) {
      A.push([[getLabelText(re[item].realmCountry.label),(getLabelText(re[item].program.label).replaceAll(',', '%20')).replaceAll(' ', '%20'),(getLabelText(re[item].planningUnit.label).replaceAll(',', '%20')).replaceAll(' ', '%20'),
     // re[item].historicalConsumptionDiff,re[item].historicalConsumptionActual,
      re[item].months==0?("No data points containing both actual and forecast consumption").replaceAll(' ', '%20'):this.roundN(re[item].forecastError*100)+'%',re[item].months]])
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.forecastmetrics') + this.makeText(this.state.singleValue2) + ".csv"
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
  for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(15)
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
          doc.setFontSize(8)
          doc.text(i18n.t('static.report.selectMonth') + ' : ' +this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.toString(), doc.internal.pageSize.width / 8, 110, {
            align: 'left'
        })
        var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString(), doc.internal.pageSize.width*3/4);

        doc.text( doc.internal.pageSize.width / 8, 130,planningText)
          doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8,this.state.programLabels.size>2? 170:150, {
            align: 'left'
          })
          planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' +this.state.planningUnitLabels.toString()), doc.internal.pageSize.width*3/4);

          doc.text( doc.internal.pageSize.width / 8,this.state.programLabels.size>2? 190:170,planningText)
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
    
    var height = doc.internal.pageSize.height;
     const headers =[[i18n.t('static.dashboard.country'),i18n.t('static.dashboard.program'),i18n.t('static.dashboard.planningunit'),
     //i18n.t('static.report.historicalConsumptionDiff'),i18n.t('static.report.historicalConsumptionActual'),
     i18n.t('static.report.error'),i18n.t('static.report.noofmonth')]]
      const data =   this.state.consumptions.map( elt =>[getLabelText(elt.realmCountry.label),getLabelText(elt.program.label),getLabelText(elt.planningUnit.label),
        //elt.historicalConsumptionDiff,elt.historicalConsumptionActual,
       elt.months==0?"No data points containing both actual and forecast consumption": this.roundN(elt.forecastError*100)+'%',elt.months]);
      let startY=this.state.planningUnitLabels.length>2? 350:200
      let content = {
      margin: {top: 80},
      startY: startY,
      head: headers,
      body: data,
      
    };
    
     
      //doc.text(title, marginLeft, 40);
      doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save("ForecastMatrics.pdf")
    //creates PDF from img
    /*  var doc = new jsPDF('landscape');
      doc.setFontSize(20);
      doc.text(15, 15, "Cool Chart");
      doc.save('canvas.pdf');*/
  }



  rowClassNameFormat(row, rowIdx) {
    return (row.forecastError*100)>50? 'background-red' : '';
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


  filterData() {
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
    let startDate=this.state.singleValue2.year + '-' + this.state.singleValue2.month + '-01';
    //let stopDate=this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
    if(CountryIds.length>0 && planningUnitIds.length>0&&programIds.length>0){
    
    var inputjson={
    "realmCountryIds":CountryIds,"programIds":programIds,"planningUnitIds":planningUnitIds,"startDate": startDate
   }
    AuthenticationService.setupAxiosInterceptors();
    
    ReportService.getForecastError( inputjson )
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

  }
  handleClickMonthBox2 = (e) => {
    this.refs.pickAMonth2.show()
}
  handleAMonthChange2 = (value, text) => {
    //
       //
      }
      handleAMonthDissmis2 = (value) => {
          this.setState( {singleValue2: value} , () => {
            this.filterData();
          })
          
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

      const columns = [
        {
            dataField: 'realmCountry.label',
            text: i18n.t('static.dashboard.country'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'program.label',
            text: i18n.t('static.dashboard.program'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'planningUnit.label',
            text: i18n.t('static.dashboard.planningunit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }/*, {
            dataField: 'historicalConsumptionDiff',
            text: i18n.t('static.report.historicalConsumptionDiff'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
         
        }, {
          dataField: 'historicalConsumptionActual',
          text: i18n.t('static.report.historicalConsumptionActual'),
          sort: true,
          align: 'center',
          headerAlign: 'center',
       
      }*/, {
        dataField: 'forecastError',
        text: i18n.t('static.report.error'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter:this.formatValue
     
    }, {
      dataField: 'months',
      text: i18n.t('static.report.noofmonth'),
      sort: true,
      align: 'center',
      headerAlign: 'center',
   
  }];
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
        text: 'All', value: this.state.consumptions.length
    }]
};
const { SearchBar, ClearSearchButton } = Search;
const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
    </span>
);
    const pickerLang = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state
    const { singleValue2 } = this.state

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
            <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.forecastmetrics')}</strong>
           {this.state.consumptions.length>0&& <div className="card-header-actions">
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
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.selectMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                      <div className="controls edit">
                      <Picker
                                ref="pickAMonth2"
                                years={{min: {year: 2010, month: 1}, max: {year: 2021, month: 12}}}
                                value={singleValue2}
                                lang={pickerLang.months}
                                theme="dark"
                                onChange={this.handleAMonthChange2}
                                onDismiss={this.handleAMonthDissmis2}
                            >
                                <MonthBox value={makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                            </Picker>
                      </div>

                    </FormGroup>
                   {/*} <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.selectMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
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

    </FormGroup>*/}

                    <FormGroup className="col-md-3">
                      <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}<span className="red Reqasterisk">*</span></Label>
                      <InputGroup>
                     
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
                                    {Array(item.level).fill('  ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                  </option>
                                )
                              }, this)}
                          </Input>
                        </InputGroup>
                    
                    </FormGroup>
                    <FormGroup className="col-md-3">
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
                    <div className="col-md-12">
                      {this.state.consumptions.length > 0 &&
                       <ToolkitProvider
                       keyField="procurementUnitId"
                       data={this.state.consumptions}
                       columns={columns}
                       exportCSV exportCSV
                       search={{ searchFormatted: true }}
                       hover
                       filter={filterFactory()}

                   >
                       {
                           props => (
                               <div className="TableCust">
                                   <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                       <SearchBar {...props.searchProps} />
                                       <ClearSearchButton {...props.searchProps} /></div>
                                   <BootstrapTable striped rowClasses={this.rowClassNameFormat} hover  noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                       pagination={paginationFactory(options)}

                                       {...props.baseProps}
                                   /></div>

                           )
                       }
                   </ToolkitProvider>

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

export default ForecastMetrics;
