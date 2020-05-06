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
  exportCSV(){

    var csvRow=[];
    var A=[["Consumption Month","Forecast Consumption","Actual Consumption"]]
    var re=this.state.consumptions
   for(var item=0;item<re.length;item++){
     A.push([re[item].consumption_date,re[item].forcast,re[item].Actual])
   } 
   for(var i=0;i<A.length;i++){
    csvRow.push(A[i].join(","))
  } 
  var csvString=csvRow.join("%0A")
  var a=document.createElement("a")
  a.href='data:attachment/csv,'+csvString
  a.target="_Blank"
  a.download="consumption_"+this.state.rangeValue.from.year+this.state.rangeValue.from.month+"_to_"+this.state.rangeValue.to.year+this.state.rangeValue.to.month+".csv"
  document.body.appendChild(a)
  a.click()
  }
  filterData() {
    let programId = document.getElementById("programId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
    if (navigator.onLine) {
      let realmId = document.getElementById("realmId").value;
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
          console.log("offlineConsumptionList---", offlineConsumptionList);

          const planningUnitFilter = offlineConsumptionList.filter(c => c.planningUnit.id == planningUnitId);
          // console.log("planningUnitFilter---", planningUnitFilter);

          // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
          const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isBetween(startDate, endDate, null, '[)') && moment(c.stopDate).isBetween(startDate, endDate, null, '[)'))

          const sorted = dateFilter.sort((a, b) => {
            var dateA = new Date(a.startDate).getTime();
            var dateB = new Date(b.stopDate).getTime();
            return dateA > dateB ? 1 : -1;
          });
          let previousDate = "";
          let finalOfflineConsumption = [];
          var json;

          for (let i = 0; i <= sorted.length; i++) {
            let forcast = 0;
            let actual = 0;
            if (sorted[i] != null && sorted[i] != "") {
              previousDate = sorted[i].startDate;
              for (let j = 0; j <= sorted.length; j++) {
                if (sorted[j] != null && sorted[j] != "") {
                  if (previousDate == sorted[j].startDate) {
                    if (!sorted[j].actualFlag) {
                      forcast = forcast + sorted[j].consumptionQty;
                    }
                    if (sorted[j].actualFlag) {
                      actual = actual + sorted[j].consumptionQty;
                    }
                  }
                }
              }

              let date = moment(sorted[i].startDate, 'YYYY-MM-DD').format('MM-YYYY');
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

          this.setState({
            offlineConsumptionList: finalOfflineConsumption
          });

        }.bind(this)

      }.bind(this)
    }
  }

  getPrograms() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      let realmId = document.getElementById("realmId").value;
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
            offlinePlanningUnitList: proList
          })
        }.bind(this);
      }.bind(this)

    }

  }
  getProductCategories() {
    AuthenticationService.setupAxiosInterceptors();
    let programId = document.getElementById("programId").value;
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
    this.getPlanningUnit();

  }
  componentDidMount() {
    console.log("inside component did mount");
    if (navigator.onLine) {
      console.log("online report");
      AuthenticationService.setupAxiosInterceptors();
      RealmService.getRealmListAll()
        .then(response => {
          if (response.status == 200) {
            this.setState({
              realms: response.data,
              realmId: response.data[0].realmId
            })
            this.getPrograms();

          } else {
            this.setState({ message: response.data.messageCode })
          }
        }).catch(
          error => {
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
      console.log("offline report");
      const lan = 'en';
      console.log("---1---");
      var db1;
      console.log("---2---");
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
              console.log("programNameLabel---", programNameLabel);
              console.log("version---", myResult[i].version);
              var programJson = {
                name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = programJson
            }
          }
          console.log("programJson---", programJson);
          console.log("proList---", proList);
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
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    const { realms } = this.state;
    let realmList = realms.length > 0
      && realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    const { planningUnits } = this.state;
    const { offlinePlanningUnitList } = this.state;

    const { programs } = this.state;
    const { offlinePrograms } = this.state;

    const { productCategories } = this.state;
    let bar = "";
    if (navigator.onLine) {
      bar = {

        labels: this.state.consumptions.map((item, index) => (item.consumption_date)),
        datasets: [
          {
            label: 'Actual Consumption',
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
        ],



      }
    }
    if (!navigator.onLine) {
      bar = {

        labels: this.state.offlineConsumptionList.map((item, index) => (item.consumption_date)),
        datasets: [
          {
            label: 'Actual Consumption',
            backgroundColor: '#86CD99',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: this.state.offlineConsumptionList.map((item, index) => (item.Actual)),
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
            data: this.state.offlineConsumptionList.map((item, index) => (item.forcast))
          }
        ],

      }
    }
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
        <Row>
          <Col lg="12">
            <Card>
              <CardHeader className="text-center">
                <b className="count-text">Consumption Report</b>
                <div className="card-header-actions">
                  <a className="card-header-action">
                    <Pdf targetRef={ref} filename="consumption.pdf">
                      {({ toPdf }) =>
                        <img style={{ height: '40px', width: '40px' }} src={pdfIcon} title="Export PDF" onClick={() => toPdf()} />

                      }
                    </Pdf>
                  </a>
                  <img style={{ height: '40px', width: '40px' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV()} />
                </div>
              </CardHeader>
              <CardBody>
                <div className="TableCust" >
                  <div className="col-md-15 pr-0"> <div ref={ref}> <div className="col-md-15 pr-0" >
                    <Form >
                      <Col md="15 pl-0">
                        <div className="d-md-flex">
                          <FormGroup>
                            <Label htmlFor="appendedInputButton">Select Period</Label>
                            <div className="controls SelectGo edit">

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
                            <FormGroup>
                              <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                              <div className="controls SelectGo">
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="realmId"
                                    id="realmId"
                                    bsSize="sm"
                                    onChange={this.getPrograms}
                                  >
                                    {/* <option value="0">{i18n.t('static.common.all')}</option> */}

                                    {realmList}
                                  </Input>

                                </InputGroup>
                              </div>
                            </FormGroup>
                          </Online>
                          <Online>
                            <FormGroup className="tab-ml-1">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                              <div className="controls SelectGo">
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
                            <FormGroup className="tab-ml-1">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                              <div className="controls SelectGo">
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="programId"
                                    id="programId"
                                    bsSize="sm"
                                    onChange={this.getPlanningUnit}

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
                            <FormGroup className="tab-ml-1">
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
                                  <option value="0">{i18n.t('static.common.all')}</option>
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
</Online> <Online>
                            <FormGroup className="tab-ml-1">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                              <div className="controls SelectGo">
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
                            <FormGroup className="tab-ml-1">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                              <div className="controls SelectGo">
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

                    <div className="chart-wrapper chart-graph">
                      <Bar data={bar} options={options} />
                    </div> <br /><br />
                  </div></div>

                    <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                      <thead>
                        <tr>
                          <th className="text-center"> Consumption Date </th>
                          <th className="text-center"> Forecast </th>
                          <th className="text-center">Actual</th>
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
                                </td></tr>)

                          }
                        </tbody>
                      </Offline>
                    </Table>

                  </div></div>
              </CardBody>
            </Card>
          </Col>
        </Row>



      </div>
    );
  }
}

export default Consumption;
