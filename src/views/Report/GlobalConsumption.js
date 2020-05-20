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
import { LOGO }  from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
// const { getToggledOptions } = utils;
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
    text: i18n.t('static.dashboard.globalconsumption')
  },
  scales: {yAxes: [{
    scaleLabel: {
      display: true,
      labelString: i18n.t('static.dashboard.consumption')
    },
    stacked: true,
    ticks: {
      beginAtZero: true
    }
  }]},
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false
  ,
  legend:{
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




class Consumption extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang:localStorage.getItem('lang'),
     countrys: [],
      planningUnits: [],
      consumptions: {date :[],
      countryData:[]},
      productCategories: [],
      countryValues:[],
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



    };
    this.getCountrys = this.getCountrys.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.getProductCategories=this.getProductCategories.bind(this)
    //this.pickRange = React.createRef()
    this.handleChange=this.handleChange.bind(this)
    this.getRandomColor=this.getRandomColor.bind(this)
  }

  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange')+' : '+this.state.rangeValue.from.month+'/'+this.state.rangeValue.from.year+' to '+this.state.rangeValue.to.month+'/'+this.state.rangeValue.to.year).replaceAll(' ','%20'))
    csvRow.push(i18n.t('static.planningunit.planningunit')+' : '+ ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',','%20')).replaceAll(' ','%20'))
    csvRow.push('')
    csvRow.push('')
    var re;
    
    var A =[[i18n.t('static.dashboard.country')].concat(this.state.consumptions.date)]
    
      re = this.state.consumptions.countryData
    
    for (var item = 0; item < re.length; item++) {
      A.push([[re[item].label].concat(re[item].value)])
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
        doc.addImage(LOGO,'png',0,10, 180, 50,'FAST');
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
         
          doc.text(i18n.t('static.planningunit.planningunit')+' : '+ document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
        }
       
      }
    }
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size,true);

    doc.setFontSize(15);

    const title = "Consumption Report";
    var canvas = document.getElementById("cool-canvas");
    //creates image
    
    var canvasImg = canvas.toDataURL("image/png",1.0);
    var width = doc.internal.pageSize.width;    
    var height = doc.internal.pageSize.height;
    var h1=50;
    var aspectwidth1= (width-h1);

    doc.addImage(canvasImg, 'png', 50, 130,aspectwidth1, height*2/3 );
  /*  
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
    doc.autoTable(content);*/
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
  //  console.log(this.state.currentValues);

    var countryIdArray = [];
    for (var i = 0; i < countrysId.length; i++) {
      countryIdArray[i] = countrysId[i].value;
        
    }
    console.log(countryIdArray);
    this.setState({
      countryValues: countryIdArray
    })
  }
  filterData() {
    this.setState({
      consumptions: {date:["04-2019","05-2019","06-2019","07-2019"],countryData:[{label:"c1",value:[10,4,5,7]},
      {label:"c2",value:[13,2,8,7]},
      {label:"c3",value:[9,1,0,7]},
      {label:"c4",value:[5,4,3,7]}]}
    })
    /*
    let productCategoryId = document.getElementById("productCategoryId").value;
    let CountryId = document.getElementById("CountrysId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    console.log(CountryId)
    AuthenticationService.setupAxiosInterceptors();
    ProductService.getConsumptionData({CountryIds:this.state.countryValues,productCategoryId:productCategoryId,planningUnitId:planningUnitId,date: this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate()})
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
                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );
*/
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

  getProductCategories() {
    AuthenticationService.setupAxiosInterceptors();
    let realmId = AuthenticationService.getRealmId();
    ProductService.getProductCategoryList(realmId)
        .then(response => {
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
          this.getCountrys();
           this.getProductCategories()
 
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

   getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
        }
  render() {
    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (
          <option key={i} value={item.planningUnitId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    const { countrys } = this.state;
   // console.log(JSON.stringify(countrys))
   let countryList = countrys.length > 0 && countrys.map((item, i) => {
     console.log(JSON.stringify(item))
    return({ label: getLabelText(item.country.label, this.state.lang), value:item.country.countryId })
  }, this);
    console.log(JSON.stringify(countryList))
      const { productCategories } = this.state;
      let productCategoryList = productCategories.length > 0
          && productCategories.map((item, i) => {
              return (
                  <option key={i} value={item.payload.productCategoryId}>
                      {getLabelText(item.payload.label, this.state.lang)}
                  </option>
              )
          }, this);
         
const  backgroundColor= [
  '#4dbd74',
  '#c8ced3',
  '#000',
  '#ffc107',
  '#f86c6b',
]
    const bar = {

      labels: this.state.consumptions.date,
      datasets: this.state.consumptions.countryData.map((item, index) => ({stack:1,label:item.label,data:item.value,backgroundColor : backgroundColor[index]}))
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
       
            <Card>
              <CardHeader>
              <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.globalconsumption')}</strong>
                <div className="card-header-actions">
                  <a className="card-header-action">
                  <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title="Export PDF"  onClick={() => this.exportPDF()}/>
                  <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                      
                  </a>
                </div>
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
                                  <ReactMultiSelectCheckboxes
                                       
                                         bsSize="sm"
                                         name="countrysId"
                                        id="countrysId"
                                        onChange={(e) => { this.handleChange(e) }}
                                         options={countryList}
                                   />
                                         {!!this.props.error &&
                                             this.props.touched && (
                                         <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                            )}
                                                            </InputGroup>
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
                        this.state.consumptions.countryData.length > 0
                        &&
                    <div className="col-md-9">
                    <div className="chart-wrapper chart-graph">
                      <Bar  id="cool-canvas" data={bar} options={options} />
                    </div>
                    </div> }
                    
                    </div>
                    </Col>

                  </div>

              </CardBody>
            </Card>

      </div>
    );
  }
}

export default Consumption;
