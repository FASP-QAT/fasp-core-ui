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
import paginationFactory from 'react-bootstrap-table2-paginator'
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
import 'chartjs-plugin-annotation';
import TracerCategoryService from '../../api/TracerCategoryService';
import MultiSelect from 'react-multi-select-component';
// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../Widgets/Widget04'));
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
let dendoLabels = [{ label: "Today", pointStyle: "triangle" }]
const options = {
  title: {
    display: true,
    // text: i18n.t('static.dashboard.globalconsumption'),
    fontColor: 'black'
  },
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Consumption Qty ( Million )',
        fontColor: 'black'
      },
      stacked: true,
      ticks: {
        beginAtZero: true,
        fontColor: 'black'
      }
    }],
    xAxes: [{
      ticks: {
        fontColor: 'black',

      }
    }]
  },
  annotation: {
    annotations: [{
      type: 'triangle',
      //  mode: 'vertical',
      drawTime: 'beforeDatasetsDraw',
      scaleID: 'x-axis-0',
      value: 'Mar-2020',

      backgroundColor: 'rgba(0, 255, 0, 0.1)'
    }],

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



class StockStatusAccrossPlanningUnitGlobalView extends Component {
  constructor(props) {
    super(props);

    this.toggledata = this.toggledata.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem('lang'),
      countrys: [],
      countryValues: [],
      countryLabels: [],
      realmList: [],
      programs: [],
      planningUnits: [],
      message: '',
      data: [],
      tracerCategories: [],
      singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },



    };
  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  handleClickMonthBox2 = (e) => {
    this.refs.pickAMonth2.show()
  }
  handleAMonthChange2 = (value, text) => {
    //
    //
  }
  handleAMonthDissmis2 = (value) => {

    this.setState({ singleValue2: value }, () => {
      this.filterData();
    })

  }
  getRelamList = () => {
    AuthenticationService.setupAxiosInterceptors();
    RealmService.getRealmListAll()
      .then(response => {
        if (response.status == 200) {
          this.setState({
            realmList: response.data
          })
        } else {
          this.setState({
            message: response.data.messageCode
          })
        }
      }).catch(
        error => {
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response.status) {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: error.response.data.messageCode });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                console.log("Error code unkown");
                break;
            }
          }
        }
      );

  }

  roundN = num => {
    return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
  }
  round = num => {
    return parseFloat(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0)).toFixed(0);
  }

  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.month') + ' , ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.program.realm')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("realmId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    this.state.countryLabels.map(ele =>
      csvRow.push(i18n.t('static.dashboard.country') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
    csvRow.push((i18n.t('static.tracercategory.tracercategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("tracerCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push('')
    csvRow.push('')
    csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
    csvRow.push('')
    var re;

    var A = [[i18n.t('static.planningunit.planningunit'), i18n.t('static.program.programMaster'), i18n.t('static.supplyPlan.amc'), i18n.t('static.supplyPlan.endingBalance').replaceAll(',', '%20'), i18n.t('static.supplyPlan.monthsOfStock').replaceAll(',', '%20'), i18n.t('static.supplyPlan.minStock').replaceAll(',', '%20'), i18n.t('static.supplyPlan.maxStock').replaceAll(',', '%20')]]

    re = this.state.data

    for (var item = 0; item < re.length; item++) {
      re[item].programData.map(p =>
        A.push([[(getLabelText(re[item].planningUnit.label, this.state.lang).replaceAll(',', '%20')).replaceAll(' ', '%20'), (getLabelText(p.program.label, this.state.lang).replaceAll(',', '%20')).replaceAll(' ', '%20'), this.round(p.amc), this.round(p.finalClosingBalance), this.roundN(p.mos), p.minMos, p.maxMos]])
      )
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView') + ".csv"
    document.body.appendChild(a)
    a.click()
  }



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

  cellstyleWithData = (item) => {
    if (item.outputString == 'OUT') {
      return { backgroundColor: 'red' }
    } else if (item.outputString == 'excess') {
      return { backgroundColor: 'yellow' }
    } else if (item.outputString == 'low') {
      return { backgroundColor: '#f0910c' }
    } else {
      return { backgroundColor: '#00c596' }
    }
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

      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setPage(i)
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.realm') + ' : ' + document.getElementById("realmId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join(' , '), doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 8, 130, planningText)

          doc.text(i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, this.state.countryLabels.size > 10 ? 170 : 150, {
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

    doc.setFontSize(10);



    const headers = [[i18n.t('static.planningunit.planningunit'), i18n.t('static.program.programMaster'), i18n.t('static.supplyPlan.amc'), i18n.t('static.supplyPlan.endingBalance'), i18n.t('static.supplyPlan.monthsOfStock'), i18n.t('static.supplyPlan.minStock'), i18n.t('static.supplyPlan.maxStock')]]
    var data = [];
    this.state.data.map(elt => elt.programData.map(p => data.push([getLabelText(elt.planningUnit.label, this.state.lang), getLabelText(p.program.label, this.state.lang), this.formatter(this.round(p.amc)), this.formatter(this.round(p.finalClosingBalance)), this.formatter(this.roundN(p.mos)), p.minMos, p.maxMos])));
    var height = doc.internal.pageSize.height;
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: 180,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 80 },
      columnStyles: {
        0: { cellWidth: 181.89 },
        1: { cellWidth: 180 },
      }

    };


    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView') + ".pdf")
  }










  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      countryValues: countrysId.map(ele => ele),
      countryLabels: countrysId.map(ele => ele.label)
    }, () => {

      this.filterData()
    })
  }

  hideDiv() {
    setTimeout(function () {
      var theSelect = document.getElementById('planningUnitId').length;

      console.log("INHIDEDIV------------------------------------------------------", theSelect);

    }, 9000);

  }


  filterData = () => {
    let countrysId = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
    let tracercategory = document.getElementById('tracerCategoryId').value
    let realmId = document.getElementById('realmId').value
    let date = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month, 0)).startOf('month').format('YYYY-MM-DD')
    if (realmId > 0 && this.state.countryValues.length > 0 && tracercategory != 0) {
      var inputjson = {
        "realmCountryIds": countrysId,
        "tracerCategoryId": tracercategory,
        "realmId": realmId,
        "dt": date

      }
      AuthenticationService.setupAxiosInterceptors();
      ReportService.stockStatusAcrossProducts(inputjson)
        .then(response => {
          console.log('response', JSON.stringify(response.data));
          let planningUnits = [...new Set(response.data.map(ele => ele.planningUnit))]
          console.log('planningUnits', JSON.stringify(planningUnits));
          //let programs=[...new Set((response.data.map(ele=> ele.programData.program.code)).flat(1))]
          let programs = [...new Set((response.data.map(ele => ele.programData.map(ele1 => ele1.program.code))).flat(1))]
          console.log('programs', JSON.stringify(programs));
          // let data=programs.map(p=>{
          //   planningUnits.map(pu=>
          //     response.data.filter(c=> c.planningUnit.id=pu.planningUnit.id &&c.programData.program.id==p.id)).map(ele=>
          //       {
          //         if(ele.programData.mos>ele.programData.maxMos){
          //           return 'Excess'
          //         }else if(ele.programData.mos>0 && ele.programData.mos<ele.programData.minMos){
          //           return 'Low'
          //         }else if(ele.programData.minMos==0 && ele.programData.maxMos==0){
          //           return ''
          //         }else{
          //           return 'out'
          //         }
          //       })
          //      } )
          //console.log('data',data);
          this.setState({
            data: response.data, message: '',
            programs: programs,
            planningUnits: planningUnits
          })
        }).catch(
          error => {
            this.setState({
              data: []
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
    else if (realmId <= 0) {
      this.setState({ message: i18n.t('static.common.realmtext'), data: [] });

    } else if (this.state.countryValues.length == 0) {
      this.setState({ message: i18n.t('static.program.validcountrytext'), data: [] });

    } else {
      this.setState({ message: i18n.t('static.tracercategory.tracercategoryText'), data: [] });
    }


  }

  getCountrys = () => {
    AuthenticationService.setupAxiosInterceptors();
    let realmId = document.getElementById('realmId').value
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

  }

  getTracerCategoryList() {

    AuthenticationService.setupAxiosInterceptors();
    let realmId = document.getElementById('realmId').value
    TracerCategoryService.getTracerCategoryByRealmId(realmId).then(response => {

      if (response.status == 200) {
        this.setState({
          tracerCategories: response.data
        })
      }

    }).catch(error => {
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
    this.getRelamList();

  }

  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

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
    this.filterData();
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
    const { singleValue2 } = this.state
    const { countrys } = this.state;
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      return ({ label: getLabelText(item.country.label, this.state.lang), value: item.realmCountryId })
    }, this);
    const { tracerCategories } = this.state;
    const { realmList } = this.state;
    let realms = realmList.length > 0
      && realmList.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);

    return (
      <div className="animated fadeIn" >
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>

        <Card>
          <div className="Card-header-reporticon">
            {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.StockStatusAccrossPlanningUnitGlobalView')}</strong> */}
            {this.state.data.length > 0 && <div className="card-header-actions">
              <a className="card-header-action">
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />

              </a>
            </div>}
          </div>
          <CardBody className="pb-lg-2 pt-lg-0">
            <div ref={ref}>

              <Form >
                <Col md="12 pl-0">
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                      <div className="controls edit">
                        <Picker
                          ref="pickAMonth2"
                          years={{ min: { year: 2010, month: 1 }, max: { year: 2021, month: 12 } }}
                          value={singleValue2}
                          lang={pickerLang.months}
                          theme="dark"
                          onChange={this.handleAMonthChange2}
                          onDismiss={this.handleAMonthDissmis2}
                        >
                          <MonthBox value={this.makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                        </Picker>
                      </div>

                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            type="select" name="realmId" id="realmId"
                            onChange={(e) => { this.getCountrys(); this.getTracerCategoryList() }}
                          >
                            <option value="">{i18n.t('static.common.select')}</option>
                            {realms}
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls edit">
                        <MultiSelect

                          bsSize="sm"
                          name="countrysId"
                          id="countrysId"
                          value={this.state.countryValues}
                          onChange={(e) => { this.handleChange(e) }}
                          options={countryList && countryList.length > 0 ? countryList : []}
                        />
                        {!!this.props.error &&
                          this.props.touched && (
                            <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                          )}
                      </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="tracerCategoryId"
                            id="tracerCategoryId"
                            bsSize="sm"
                            onChange={this.filterData}
                          >
                            <option value="0">{i18n.t('static.common.select')}</option>
                            {tracerCategories.length > 0
                              && tracerCategories.map((item, i) => {
                                return (
                                  <option key={i} value={item.tracerCategoryId}>
                                    {getLabelText(item.label, this.state.lang)}
                                  </option>
                                )
                              }, this)}

                          </Input>
                        </InputGroup>
                      </div>
                    </FormGroup>
                  </div>
                </Col>
              </Form>
              <Col md="12 pl-0">
                <div className="globalviwe-scroll">
                  <div className="row">

                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="table-responsive ">

                        {this.state.data.length > 0 && <Table responsive className="table-striped  table-fixed  table-bordered text-center mt-2">


                          <thead>
                            <tr>
                              <th className="text-center" style={{ width: '27%' }}>{i18n.t('static.planningunit.planningunit')}</th>
                              {
                                this.state.programs.map(ele => { return (<th className="text-center" style={{ width: '27%' }}>{ele}</th>) })}
                            </tr>
                          </thead>

                          <tbody>
                            {
                              this.state.planningUnits.map(
                                ele => {
                                  return <tr><td>{getLabelText(ele.label, this.state.lang)}</td>{
                                    this.state.programs.map(ele1 => {
                                      return (this.state.data.filter(c => c.planningUnit.id == ele.id)).map(
                                        item => {
                                          return (item.programData.filter(c => c.program.code === ele1).length == 0 ? <td></td> : <td className="text-center" style={this.cellstyleWithData(item.programData.filter(c => c.program.code == ele1)[0])}>{this.roundN(item.programData.filter(c => c.program.code == ele1)[0].mos)}</td>)
                                        }

                                      )
                                    })
                                  }</tr>

                                }
                              )}


                          </tbody>
                        </Table>}

                      </div>


                    </div>
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

export default StockStatusAccrossPlanningUnitGlobalView;
