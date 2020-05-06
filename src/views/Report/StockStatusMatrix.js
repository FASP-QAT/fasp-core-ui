import React from "react";
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import i18n from '../../i18n'
import RealmService from '../../api/RealmService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ToolkitProvider, { Search,CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
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

const { ExportCSVButton } = CSVExport;
const entityname = i18n.t('static.dashboard.productCatalog');
export default class StockStatusMatrix extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            productCategories: [],
            planningUnits: [],
            data: [],
            programs: [],
            view:1,
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },


        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.getProductCategories=this.getProductCategories.bind(this)
        this.getPrograms = this.getPrograms.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    
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
     
    filterData() {
        let realmId = document.getElementById("realmId").value;
        let programId = document.getElementById("programId").value;
        let productCategoryId = document.getElementById("productCategoryId").value;
        let planningUnitId = document.getElementById("planningUnitId").value;
        let view = document.getElementById("view").value;
        AuthenticationService.setupAxiosInterceptors();
        ProductService.getStockStatusMatrixData(realmId, productCategoryId, planningUnitId,view, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month , 0).getDate())
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    data: response.data,
                    view:view
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
            this.filterData();

    }
    getPlanningUnit() {
        if (navigator.onLine) {
          console.log('changed')
          AuthenticationService.setupAxiosInterceptors();
          let programId = document.getElementById("programId").value;
          let productCategoryId = document.getElementById("productCategoryId").value;
          ProgramService.getProgramPlaningUnitListByProgramAndProductCategory(programId,productCategoryId).then(response => {
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
      


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {

                    this.setState({
                        realms: response.data
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

    }
    exportCSV(columns){

      var csvRow=[];
      const headers =[];
          columns.map( (item, idx) =>{ headers[idx]=item.text});
          
       
      var A=[headers]
      var re=this.state.data
     
      if(this.state.view==1){
        this.state.data.map(ele =>A.push([ele.PLANNING_UNIT_LABEL_EN.replaceAll(',',' '),ele.YEAR,ele.Jan,ele.Feb,ele.Mar,ele.Apr,ele.May,ele.Jun,ele.Jul,ele.Aug,ele.Sep,ele.Oct,ele.Nov
          ,ele.Dec] ));
      }else{
        this.state.data.map(ele =>A.push([ele.PLANNING_UNIT_LABEL_EN.replaceAll(',',' '),ele.YEAR,ele.Q1,ele.Q2,ele.Q3,ele.Q4] ));

      }
     /*for(var item=0;item<re.length;item++){
       A.push([re[item].consumption_date,re[item].forcast,re[item].Actual])
     } */
     for(var i=0;i<A.length;i++){
      csvRow.push(A[i].join(","))
    } 

    var csvString=csvRow.join("%0A")
    var a=document.createElement("a")
    a.href='data:attachment/csv,'+csvString
    a.target="_Blank"
    a.download="stockStatusmatrix"+this.state.rangeValue.from.year+this.state.rangeValue.from.month+"_to_"+this.state.rangeValue.to.year+this.state.rangeValue.to.month+".csv"
    document.body.appendChild(a)
    a.click()
    }
   
    exportPDF = (columns) => {
        const unit = "pt";
        const size = "A1"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
    
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);
    
        doc.setFontSize(15);
    
        const title = "Stock Status Matrix";
        const headers =[];
          columns.map( (item, idx) =>{ headers[idx]=item.text});
          const header=[headers];
         console.log(header);
        const data1 = this.state.data.map(ele =>[ele.PLANNING_UNIT_LABEL_EN,ele.YEAR,ele.Jan,ele.Feb,ele.Mar,ele.Apr,ele.May,ele.Jun,ele.Jul,ele.Aug,ele.Sep,ele.Oct,ele.Nov
            ,ele.Dec] );
            const data2 = this.state.data.map(ele =>[ele.PLANNING_UNIT_LABEL_EN,ele.YEAR,ele.Q1,ele.Q2,ele.Q3,ele.Q4] );
                 
         console.log(data1);
        let content = {
          startY: 50,
          head: header,
          body: this.state.view==1?data1:data2,
        };
    
        doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        doc.save("report.pdf")
      }
   

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

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
        let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (
          <option key={i} value={item.planningUnit.id}>
            {getLabelText(item.planningUnit.label, this.state.lang)}
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
            const pickerLang = {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
        let columns = [
            {
                dataField: 'PLANNING_UNIT_LABEL_EN',
                text: i18n.t('static.procurementUnit.planningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }, {
                dataField: 'YEAR',
                text: i18n.t('static.common.year'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
                 {
                    dataField: 'Jan',
                    text: i18n.t('static.common.jan'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Feb',
                    text: i18n.t('static.common.feb'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Mar',
                    text: i18n.t('static.common.mar'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Apr',
                    text: i18n.t('static.common.apr'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'May',
                    text: i18n.t('static.common.may'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Jun',
                    text: i18n.t('static.common.jun'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Jul',
                    text: i18n.t('static.common.jul'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Aug',
                    text: i18n.t('static.common.aug'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Sep',
                    text: i18n.t('static.common.sep'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Oct',
                    text: i18n.t('static.common.oct'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Nov',
                    text: i18n.t('static.common.nov'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Dec',
                    text: i18n.t('static.common.dec'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }

          
        ];
       
            let columns1 = [
                {
                    dataField: 'PLANNING_UNIT_LABEL_EN',
                    text: i18n.t('static.procurementUnit.planningUnit'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'YEAR',
                    text: i18n.t('static.common.year'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                },
                     {
                        dataField: 'Q1',
                        text: i18n.t('static.common.quarter1'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    }, {
                        dataField: 'Q2',
                        text: i18n.t('static.common.quarter2'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    }, {
                        dataField: 'Q3',
                        text: i18n.t('static.common.quarter3'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    }, {
                        dataField: 'Q4',
                        text: i18n.t('static.common.quarter4'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    } ] 
        
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
            
  <img style ={{height:'40px',width:'40px'}}src={csvicon} title="Export CSV" onClick={() => handleClick()} />
         

              </div>
            );
          };
          
        return (

            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusmatrix')}</strong>{' '}
                        <div className="card-header-actions">
                        <img style={{ height: '40px', width: '40px' }} src={pdfIcon} title="Export PDF"  onClick={() => this.exportPDF(this.state.view==1?columns:columns1)}/>
                        <img style={{ height: '40px', width: '40px' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(this.state.view==1?columns:columns1)} />                  
                        </div>
                    </CardHeader>
                    <CardBody className="pb-md-0">
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
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="view"
                                                id="view"
                                                bsSize="sm"
                                            >
                                                <option value="1">{i18n.t('static.common.monthly')}</option>
                                                <option value="2">{i18n.t('static.common.quarterly')}</option>
                                               
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
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {planningUnitList}
                                            </Input>
                                            <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        <ToolkitProvider
                            keyField="procurementUnitId"
                            data={this.state.data}
                            columns={this.state.view==1?columns:columns1}
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
                                             <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}

                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>

                    </CardBody>
                </Card>


            </div>)
    }
}