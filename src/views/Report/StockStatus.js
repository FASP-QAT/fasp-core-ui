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
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
    };
    this.getPrograms = this.getPrograms.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.getProductCategories=this.getProductCategories.bind(this)
    //this.pickRange = React.createRef()

  }
  filterData() {
    let realmId = AuthenticationService.getRealmId();
    let programId = document.getElementById("programId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    AuthenticationService.setupAxiosInterceptors();
    ProductService.getStockStatusData(realmId, programId, planningUnitId, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate())
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
      );

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
    if (navigator.onLine) {
    AuthenticationService.setupAxiosInterceptors();
          this.getPrograms();

     }else{

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

      labels: this.state.stockStatusList.map((item, index) => (item.consumption_date)),
      datasets: [
        {
          label: 'Actual StockStatus',
          backgroundColor: '#86CD99',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: this.state.stockStatusList.map((item, index) => (item.Actual)),
        }, {
          type: "line",
          label: "Forecast StockStatus",
          backgroundColor: 'transparent',
          borderColor: 'rgba(179,181,158,1)',
          borderStyle: 'dotted',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          showInLegend: true,
          yValueFormatString: "$#,##0",
          data: this.state.stockStatusList.map((item, index) => (item.forcast))
        }
      ],

    };
    const { productCategories } = this.state;
    let productCategoryList = productCategories.length > 0
        && productCategories.map((item, i) => {
            return (
              <option key={i} value={item.payload.productCategoryId} disabled= {item.payload.active?"":"disabled"}>
              {Array(item.level).fill('_ _ ').join('')+(getLabelText(item.payload.label, this.state.lang))}
            </option>
            )
        }, this);
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
              <i className="icon-menu"></i><strong>StockStatus Report</strong>
                <div className="card-header-actions">
                  <a className="card-header-action">
                    <Pdf targetRef={ref} filename="StockStatus.pdf">
                      {({ toPdf }) =>
                        <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => toPdf()} />

                      }
                    </Pdf>
                  </a>
                </div>
              </CardHeader>
              <CardBody>
                <div className="TableCust" >
                  <div ref={ref}>
                
                    <Form >
                      <Col md="12 pl-0">
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
                                  {programList}
                                </Input>

                              </InputGroup>
                            </div>
                          </FormGroup>
                        
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
                                                {productCategoryList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                         
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

                 {/*}   <div className="chart-wrapper chart-graph">
                      <Bar data={bar} options={options} />
                    </div> <br /><br />
                  </div></div>

                    <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                      <thead>
                        <tr>
                          <th className="text-center"> StockStatus Date </th>
                          <th className="text-center"> Forecast </th>
                          <th className="text-center">Actual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          this.state.stockStatusList.length > 0
                          &&
                          this.state.stockStatusList.map((item, idx) =>

                            <tr id="addr0" key={idx} >
                              <td>
                                {this.state.stockStatusList[idx].consumption_date}
                              </td>
                              <td>

                                {this.state.stockStatusList[idx].forcast}
                              </td>
                              <td>
                                {this.state.stockStatusList[idx].Actual}
                              </td></tr>)

                        }
                      </tbody>

                      </Table>*/}
                     
                   
                      </div>
                     
                      </div>
              </CardBody>
            </Card>
         
      </div>
    );
  }
}

export default StockStatus;
