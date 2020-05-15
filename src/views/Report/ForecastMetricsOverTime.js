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
import RealmCountryService from '../../api/RealmCountryService';
//import fs from 'fs'
const Widget04 = lazy(() => import('../Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const options = {
  scales: {
    yAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: i18n.t('static.report.errorperc')
        },
        ticks: { yValueFormatString: "$#####%",
        beginAtZero:true,
        Max:900,
          callback: function (value) {
            return value+"%";
        }}
      }
    ]
  },
  tooltips: { mode: 'index',
    callbacks: {
      label: function (tooltipItems, data) {
      
          return tooltipItems.yLabel + "%";
       }
    },
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
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




class ForcastMatrixOverTime extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      matricsList: [],
      dropdownOpen: false,
      radioSelected: 2,
      productCategories: [],
      planningUnits: [],
      categories: [],
      countries:[],
      show: false,
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



    };
    this.getCountrylist = this.getCountrylist.bind(this);
    this.fetchData = this.fetchData.bind(this);
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
    csvRow.push(i18n.t('static.dashboard.country')+' : '+ (document.getElementById("countryId").selectedOptions[0].text).replaceAll(' ','%20'))
    csvRow.push(i18n.t('static.planningunit.planningunit')+' : '+ ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',','%20')).replaceAll(' ','%20'))
    csvRow.push('')
    csvRow.push('')
    var re;
    var A = [[(i18n.t('static.report.month')).replaceAll(' ','%20'), (i18n.t('static.report.errorperc')).replaceAll(' ','%20')]]
   
      re = this.state.matricsList
   

    for (var item = 0; item < re.length; item++) {
      A.push([re[item].consupmtion_date, re[item].errorperc])
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.forecasterrorovertime') + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
    document.body.appendChild(a)
    a.click()
  }
  

  exportPDF = () => {
    const addFooters = doc => {
      const pageCount = doc.internal.getNumberOfPages()
    
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width *3/ 4, doc.internal.pageSize.height-50, {
          align: 'center'
        })
        doc.text('Quantification Anatics Tool', doc.internal.pageSize.width / 4, doc.internal.pageSize.height-50, {
          align: 'center'
        })
      }
    }
    const addHeaders = doc => {
      const pageCount = doc.internal.getNumberOfPages()
    
      doc.setFont('helvetica', 'bold')
     
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(18)
        doc.setPage(i)
        

        var imagedata='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK0AAADICAYAAACalmGqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzgxQzhEOEQ2OTAzMTFFQTgxQzE4MkY5NTNENEM0NUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NzgxQzhEOEU2OTAzMTFFQTgxQzE4MkY5NTNENEM0NUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3ODFDOEQ4QjY5MDMxMUVBODFDMTgyRjk1M0Q0QzQ1QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3ODFDOEQ4QzY5MDMxMUVBODFDMTgyRjk1M0Q0QzQ1QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmmUtSYAAFAtSURBVHja7L0HlBzH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'
        doc.addImage(imagedata,'png', 10, 30,50,50,'','FAST');

        doc.text(i18n.t('static.report.forecasterrorovertime'), doc.internal.pageSize.width / 2, 20, {
          align: 'center'
        })
        if(i==1){
          doc.setFontSize(12)
          doc.text(i18n.t('static.report.dateRange')+' : '+this.state.rangeValue.from.month+'/'+this.state.rangeValue.from.year+' to '+this.state.rangeValue.to.month+'/'+this.state.rangeValue.to.year, doc.internal.pageSize.width / 8, 50, {
            align: 'left'
          })
          doc.text(i18n.t('static.dashboard.country')+' : '+ document.getElementById("countryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 70, {
            align: 'left'
          })
          doc.text(i18n.t('static.planningunit.planningunit')+' : '+ document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
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

    var canvas = document.getElementById("cool-canvas");
    //creates image
    
    var canvasImg = canvas.toDataURL("image/png",1.0);
    var width = doc.internal.pageSize.width;    
    var height = doc.internal.pageSize.height;
    var h1=50;
    var aspectwidth1= (width-h1);

    doc.addImage(canvasImg, 'png', 50, 90,aspectwidth1, height*3/4,'','FAST' );
    const headers =[ [   i18n.t('static.report.month'),
    i18n.t('static.report.errorperc')]];
    const data =   this.state.matricsList.map( elt =>[ elt.consupmtion_date,elt.errorperc]);
    
    let content = {
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



  fetchData() {
   /* let countryId = document.getElementById("countryId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
      AuthenticationService.setupAxiosInterceptors();
      ProductService.getForecastOverTimeData(countryId,planningUnitId, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate())
        .then(response => {
          console.log(JSON.stringify(response.data));
          this.setState({
            matricsList : response.data
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
                  this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );*/
        this.setState({
          matricsList: [{consupmtion_date:"2019-04",errorperc:30},{consupmtion_date:"2019-05",errorperc:50},{consupmtion_date:"2019-06",errorperc:40},]
        })
        console.log('matrix list updated'+this.state.matricsList )
     }

 
  getPlanningUnit() {
   
      AuthenticationService.setupAxiosInterceptors();
      let productCategoryId = document.getElementById("productCategoryId").value;
      PlanningUnitService.getPlanningUnitByProductCategoryId(productCategoryId).then(response => {
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
  
  }
  getProductCategories() {
    AuthenticationService.setupAxiosInterceptors();
    let realmId =AuthenticationService.getRealmId();
    ProductService.getProductCategoryList(realmId)
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
  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    this.getCountrylist();
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
this.fetchData();
  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

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
    const { countries } = this.state;
   // console.log(JSON.stringify(countrys))
   let countryList = countries.length > 0 && countries.map((item, i) => {
     console.log(JSON.stringify(item))
    return(
      <option key={i} value={item.country.countryId}>
      {getLabelText(item.country.label, this.state.lang)}
  </option>
    
    )
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
         

    
    const  bar = {
    
        labels: this.state.matricsList.map((item, index) => (item.consupmtion_date)),
        datasets: [
           {
            type: "line",
            label: i18n.t('static.report.forecasterrorovertime'),
            backgroundColor: 'transparent',
            borderColor: 'rgba(179,181,158,1)',
            lineTension:0,
            showActualPercentages: true,
            showInLegend: true,
            pointStyle: 'line',
            yValueFormatString: "$#####%",
            
            data: this.state.matricsList.map((item, index) => (item.errorperc))
          }
        ],



      
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
          <Col lg="12">
            <Card>
              <CardHeader>
                <i className="icon-menu"></i><strong>{i18n.t('static.report.forecasterrorovertime')}</strong>
                
                  {
                    this.state.matricsList.length > 0 &&
                    <div className="card-header-actions">
                      <a className="card-header-action">
                      <img style={{ height: '40px', width: '40px' }} src={pdfIcon} title="Export PDF"  onClick={() => this.exportPDF()}/>
                      <img style={{ height: '40px', width: '40px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                      </a> </div>
                  }
              
                </CardHeader>
              <CardBody>
                <div className="TableCust" >
                  <div className=""> <div ref={ref}> <div className="" >
                    <Form >
                      <Col>
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
                              <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.country')}</Label>
                              <div className="controls ">
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="countryId"
                                    id="countryId"
                                    bsSize="sm"
                                    onChange={this.fetchData}

                                  >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    {countryList}
                                  </Input>

                                </InputGroup>
                              </div>
                            </FormGroup>
                            <FormGroup className="col-md-3">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    onChange={this.getPlanningUnit}
                                                >
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {productCategoryList}
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
                                    onChange={this.fetchData}
                                  >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    {planningUnitList}
                                  </Input>
                                  <InputGroupAddon addonType="append">
                                    <Button color="secondary Gobtn btn-sm" onClick={this.fetchData}>{i18n.t('static.common.go')}</Button>
                                  </InputGroupAddon>
                                </InputGroup>
                              </div>
                            </FormGroup>
                           </div>
                      </Col>
                    </Form>
                    {
                        this.state.matricsList.length > 0
                        &&
                        <div   className="chart-wrapper chart-graph">
                          <Bar id="cool-canvas" data={bar} options={options} />
                         </div>}
                   </div></div>

                 
                  </div></div>
              </CardBody>
            </Card>
          </Col>
        </Row>



      </div>
    );
  }
}

export default ForcastMatrixOverTime;
