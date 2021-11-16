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
// import TracerCategoryService from '../../api/TracerCategoryService';
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
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
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

const legendcolor = [{ text: i18n.t('static.report.stockout'), color: "#BA0C2F", value: 0 },
{ text: i18n.t('static.report.lowstock'), color: "#f48521", value: 1 },
{ text: i18n.t('static.report.okaystock'), color: "#118b70", value: 2 },
{ text: i18n.t('static.report.overstock'), color: "#edb944", value: 3 },
{ text: i18n.t('static.supplyPlanFormula.na'), color: "#cfcdc9", value: 4 }
];

// const legendcolor = [{ text: i18n.t('static.report.overstock'), color: "#edb944", value: 3 },
// { text: i18n.t('static.report.stockout'), color: "#ed5626", value: 0 },
// { text: i18n.t('static.report.okaystock'), color: "#118b70", value: 2 },
// { text: i18n.t('static.report.lowstock'), color: "#f48521", value: 1 },];

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
    this.filterTracerCategory = this.filterTracerCategory.bind(this);
    this.filterProgram = this.filterProgram.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem('lang'),
      countrys: [],
      countryValues: [],
      countryLabels: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
      realmList: [],
      programValues: [],
      programLabels: [],
      programs: [],

      planningUnits: [],
      message: '',
      data: [],
      selData: [],
      tracerCategories: [],
      singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      loading: true,
      programLstFiltered: []



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
    // AuthenticationService.setupAxiosInterceptors();
    RealmService.getRealmListAll()
      .then(response => {
        if (response.status == 200) {
          this.setState({
            realmList: response.data, loading: false
          })
        } else {
          this.setState({
            message: response.data.messageCode, loading: false
          })
        }
      }).catch(
        error => {
          if (error.message === "Network Error") {
            this.setState({
              message: 'static.unkownError',
              loading: false
            });
          } else {
            switch (error.response ? error.response.status : "") {

              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`)
                break;
              case 403:
                this.props.history.push(`/accessDenied`)
                break;
              case 500:
              case 404:
              case 406:
                this.setState({
                  message: error.response.data.messageCode,
                  loading: false
                });
                break;
              case 412:
                this.setState({
                  message: error.response.data.messageCode,
                  loading: false
                });
                break;
              default:
                this.setState({
                  message: 'static.unkownError',
                  loading: false
                });
                break;
            }
          }
        }
      );
    // .catch(
    //   error => {
    //     if (error.message === "Network Error") {
    //       this.setState({ loading: false, message: error.message });
    //     } else {
    //       switch (error.response.status) {
    //         case 500:
    //         case 401:
    //         case 404:
    //         case 406:
    //         case 412:
    //           this.setState({ loading: false, message: error.response.data.messageCode });
    //           break;
    //         default:
    //           this.setState({ loading: false, message: 'static.unkownError' });
    //           console.log("Error code unkown");
    //           break;
    //       }
    //     }
    //   }
    // );

  }

  roundN = num => {
    return Number(Math.round(num * Math.pow(10, 1)) / Math.pow(10, 1)).toFixed(1);
  }
  round = num => {
    return Number(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0));
  }
  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }

  exportCSV() {

    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
    //csvRow.push('"'+(i18n.t('static.program.realm') + ' : ' + document.getElementById("realmId").selectedOptions[0].text).replaceAll(' ', '%20')+'"')
    csvRow.push('')
    this.state.countryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.programLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')

    this.state.tracerCategoryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory')).replaceAll(' ', '%20') + ' : ' + (ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('"' + ((i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))

    csvRow.push('')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    var re;

    var A = [this.addDoubleQuoteToRowContent([i18n.t('static.report.qatPID').replaceAll(' ', '%20'), i18n.t('static.planningunit.planningunit').replaceAll(' ', '%20'), i18n.t('static.program.programMaster').replaceAll(' ', '%20'), i18n.t('static.supplyPlan.amc').replaceAll(' ', '%20'), i18n.t('static.supplyPlan.endingBalance').replaceAll(' ', '%20'), i18n.t('static.supplyPlan.monthsOfStock').replaceAll(' ', '%20'), i18n.t('static.supplyPlan.minStock').replaceAll(' ', '%20'), i18n.t('static.supplyPlan.maxStock').replaceAll(' ', '%20')])]

    re = this.state.data

    for (var item = 0; item < re.length; item++) {
      re[item].programData.map(p =>
        A.push([this.addDoubleQuoteToRowContent([re[item].planningUnit.id, (getLabelText(re[item].planningUnit.label, this.state.lang).replaceAll(',', '%20')).replaceAll(' ', '%20'), (getLabelText(p.program.label, this.state.lang).replaceAll(',', '%20')).replaceAll(' ', '%20'), this.round(p.amc), this.round(p.finalClosingBalance), p.mos != null ? this.roundN(p.mos) : i18n.t("static.supplyPlanFormula.na"), p.minMos, p.maxMos])])
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
    console.log(item)
    if (item.mos != null && this.roundN(item.mos) == 0) {
      return { backgroundColor: legendcolor[0].color }
    } else if (this.roundN(item.mos) != 0 && this.roundN(item.mos) != null && this.roundN(item.mos) < item.minMos) {
      return { backgroundColor: legendcolor[1].color }
    } else if (this.roundN(item.mos) >= item.minMos && this.roundN(item.mos) <= item.maxMos) {
      return { backgroundColor: legendcolor[2].color }
    } else if (this.roundN(item.mos) > item.maxMos) {
      return { backgroundColor: legendcolor[3].color }
    } else if (item.mos == null) {
      return { backgroundColor: legendcolor[4].color }
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
        doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
          // doc.text(i18n.t('static.program.realm') + ' : ' + document.getElementById("realmId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
          //   align: 'left'
          // })
          doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })

          var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join(' , '), doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 8, 130, planningText)
          var len = 140 + (planningText.length * 10)
          planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 8, 150, planningText)
          var len = len + 10 + (planningText.length * 10)
          var planningText = doc.splitTextToSize((i18n.t('static.tracercategory.tracercategory') + ' : ' + this.state.tracerCategoryLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 8, len, planningText)

        }

      }
    }
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);

    doc.setFontSize(10);



    const headers = [[i18n.t('static.report.qatPID'), i18n.t('static.planningunit.planningunit'), i18n.t('static.program.programMaster'), i18n.t('static.supplyPlan.amc'), i18n.t('static.supplyPlan.endingBalance'), i18n.t('static.supplyPlan.monthsOfStock'), i18n.t('static.supplyPlan.minStock'), i18n.t('static.supplyPlan.maxStock')]]
    var data = [];
    this.state.data.map(elt => elt.programData.map(p => data.push([elt.planningUnit.id, getLabelText(elt.planningUnit.label, this.state.lang), getLabelText(p.program.label, this.state.lang), this.formatter(this.round(p.amc)), this.formatter(this.round(p.finalClosingBalance)), p.mos != null ? this.formatter(this.roundN(p.mos)) : i18n.t("static.supplyPlanFormula.na"), p.minMos, p.maxMos])));
    var height = doc.internal.pageSize.height;
    var startY = 150 + (this.state.countryValues.length * 2) + this.state.tracerCategoryLabels.length * 3
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: startY,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 67 },
      columnStyles: {
        1: { cellWidth: 181.89 },
        2: { cellWidth: 178 },
      }

    };


    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.report.stockStatusAccrossPlanningUnitGlobalView') + ".pdf")
  }





  handleTracerCategoryChange = (tracerCategoryIds) => {
    tracerCategoryIds = tracerCategoryIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      tracerCategoryValues: tracerCategoryIds.map(ele => ele),
      tracerCategoryLabels: tracerCategoryIds.map(ele => ele.label)
    }, () => {

      this.filterData()
    })
  }

  handleChangeProgram(programIds) {
    programIds = programIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      programValues: programIds.map(ele => ele),
      programLabels: programIds.map(ele => ele.label)
    }, () => {

      // this.filterData()
      this.filterTracerCategory(programIds);

    })

  }

  filterTracerCategory(programIds) {

    var programIdsValue = [];
    for (var i = 0; i < programIds.length; i++) {
      programIdsValue.push(programIds[i].value);
    }
    // console.log("programids=====>", programIdsValue);
    let realmId = AuthenticationService.getRealmId();//document.getElementById('realmId').value
    TracerCategoryService.getTracerCategoryByProgramIds(realmId, programIdsValue)
      .then(response => {
        console.log("tc respons==>", response.data);
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          tracerCategories: listArray
        }, () => {
          this.filterData()
        });
      }).catch(
        error => {
          this.setState({
            tracerCategories: []
          }, () => {
            this.filterData()
          });
          if (error.message === "Network Error") {
            this.setState({
              message: 'static.unkownError',
              loading: false
            });
          } else {
            switch (error.response ? error.response.status : "") {

              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`)
                break;
              case 403:
                this.props.history.push(`/accessDenied`)
                break;
              case 500:
              case 404:
              case 406:
                this.setState({
                  tracerCategories: [],
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                  loading: false
                }, () => {
                  this.filterData()
                });
                break;
              case 412:
                this.setState({
                  tracerCategories: [],
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                  loading: false
                }, () => {
                  this.filterData()
                });
                break;
              default:
                this.setState({
                  tracerCategories: [],
                  message: 'static.unkownError',
                  loading: false
                }, () => {
                  this.filterData()
                });
                break;
            }
          }
        }
      );
    if (programIdsValue.length == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), data: [], selData: [] });
    } else {
      this.setState({ message: '' });
    }
  }
  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      countryValues: countrysId.map(ele => ele),
      countryLabels: countrysId.map(ele => ele.label)
    }, () => {

      // this.filterData()
      this.filterProgram()
    })
  }


  filterProgram = () => {
    let countryIds = this.state.countryValues.map(ele => ele.value);
    let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());
    console.log('countryIds', countryIds, 'programs', this.state.programs)
    this.setState({
      programLstFiltered: [],
      programValues: [],
      programLabels: []
    }, () => {
      if (countryIds.length != 0) {
        let programLstFiltered = [];
        for (var i = 0; i < countryIds.length; i++) {
          programLstFiltered = [...programLstFiltered, ...this.state.programs.filter(c => c.realmCountry.realmCountryId == countryIds[i])]
        }

        console.log('programLstFiltered', programLstFiltered)
        if (programLstFiltered.length > 0) {

          programLstFiltered.sort((a, b) => {
            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
            return itemLabelA > itemLabelB ? 1 : -1;
          });

          this.setState({
            programLstFiltered: programLstFiltered
          }, () => {
            this.filterData()
          });
        } else {
          this.setState({
            programLstFiltered: []
          }, () => {
            this.filterData()
          });
        }
      } else {
        this.setState({
          programLstFiltered: []
        }, () => {
          this.filterData()
        });
      }

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
    let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());//document.getElementById('tracerCategoryId').value
    let realmId = AuthenticationService.getRealmId()
    let date = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month, 0)).startOf('month').format('YYYY-MM-DD')
    let useApprovedVersion = document.getElementById("includeApprovedVersions").value
    let programIds = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString());

    console.log(realmId)
    if (realmId > 0 && this.state.countryValues.length > 0 && this.state.tracerCategoryValues.length > 0 && this.state.programValues.length > 0) {
      this.setState({ loading: true })
      var inputjson = {
        "realmCountryIds": countrysId,
        "tracerCategoryIds": tracercategory,
        "programIds": programIds,
        "realmId": realmId,
        "dt": date, "useApprovedSupplyPlanOnly": useApprovedVersion

      }
      // AuthenticationService.setupAxiosInterceptors();
      ReportService.stockStatusAcrossProducts(inputjson)
        .then(response => {
          console.log('response', JSON.stringify(response.data));
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
            selData: response.data, message: '',
            loading: false
          }, () => {
            this.filterDataAsperstatus()

          })
        }).catch(
          error => {
            this.setState({
              selData: [], loading: false
            }, () => {
              this.filterDataAsperstatus()

            })
            if (error.message === "Network Error") {
              this.setState({
                message: 'static.unkownError',
                loading: false
              });
            } else {
              switch (error.response ? error.response.status : "") {

                case 401:
                  this.props.history.push(`/login/static.message.sessionExpired`)
                  break;
                case 403:
                  this.props.history.push(`/accessDenied`)
                  break;
                case 500:
                case 404:
                case 406:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                    loading: false
                  });
                  break;
                default:
                  this.setState({
                    message: 'static.unkownError',
                    loading: false
                  });
                  break;
              }
            }
          }
        );
      // .catch(
      //   error => {
      //     this.setState({
      //       data: [], loading: false
      //     })

      //     if (error.message === "Network Error") {
      //       this.setState({ message: error.message, loading: false });
      //     } else {
      //       switch (error.response ? error.response.status : "") {
      //         case 500:
      //         case 401:
      //         case 404:
      //         case 406:
      //         case 412:
      //           this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
      //           break;
      //         default:
      //           this.setState({ loading: false, message: 'static.unkownError' });
      //           break;
      //       }
      //     }
      //   }
      // );
    }
    else if (realmId <= 0) {
      this.setState({ message: i18n.t('static.common.realmtext'), data: [], selData: [] });

    } else if (this.state.countryValues.length == 0) {
      this.setState({ message: i18n.t('static.program.validcountrytext'), data: [], selData: [] });

    } else if (this.state.programValues.length == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), data: [], selData: [] });

    } else {
      this.setState({ message: i18n.t('static.tracercategory.tracercategoryText'), data: [], selData: [] });
    }


  }

  filterDataAsperstatus = () => {
    let stockStatusId = document.getElementById("stockStatusId").value;
    console.log(stockStatusId)
    var filteredData = []
    if (stockStatusId != -1) {

      this.state.selData.map(ele1 => {
        var filterProgramData = []
        ele1.programData.map(ele => {
          console.log(ele)
          var min = ele.minMos
          var max = ele.maxMos
          //  var reorderFrequency = ele.reorderFrequency
          if (stockStatusId == 0) {
            if ((ele.mos != null && this.roundN(ele.mos) == 0)) {
              console.log('in 0')
              filterProgramData.push(ele)
            }
          } else if (stockStatusId == 1) {
            if ((ele.mos != null && this.roundN(ele.mos) != 0 && this.roundN(ele.mos) < min)) {
              console.log('in 1')
              filterProgramData.push(ele)
            }
          } else if (stockStatusId == 3) {
            if (this.roundN(ele.mos) > max) {
              console.log('in 2')
              filterProgramData.push(ele)
            }
          } else if (stockStatusId == 2) {
            if (this.roundN(ele.mos) < max && this.roundN(ele.mos) > min) {
              console.log('in 3')
              filterProgramData.push(ele)
            }
          } else if (stockStatusId == 4) {
            if (ele.mos == null) {
              filterProgramData.push(ele)
            }
          }
        })
        if (filterProgramData.length > 0) {
          filteredData.push({
            planningUnit: ele1.planningUnit,
            programData: filterProgramData
          })
        }

      });
    } else {
      filteredData = this.state.selData
    }
    console.log(filteredData)
    let planningUnits = [...new Set(filteredData.map(ele => ele.planningUnit))]
    console.log('planningUnits', JSON.stringify(planningUnits));
    //let programs=[...new Set((response.data.map(ele=> ele.programData.program.code)).flat(1))]
    let programs = [...new Set((filteredData.map(ele => ele.programData.map(ele1 => ele1.program.code))).flat(1))]
    console.log('programs', JSON.stringify(programs));

    this.setState({
      data: filteredData,
      programLst: programs,
      planningUnits: planningUnits
    })

  }


  getCountrys = () => {
    // AuthenticationService.setupAxiosInterceptors();
    let realmId = AuthenticationService.getRealmId();//document.getElementById('realmId').value
    RealmCountryService.getRealmCountryForProgram(realmId)
      .then(response => {
        var listArray = response.data.map(ele => ele.realmCountry);
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          // countrys: response.data.map(ele => ele.realmCountry)
          countrys: listArray
        })
      }).catch(
        error => {
          this.setState({
            countrys: []
          })
          if (error.message === "Network Error") {
            this.setState({
              message: 'static.unkownError',
              loading: false
            });
          } else {
            switch (error.response ? error.response.status : "") {

              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`)
                break;
              case 403:
                this.props.history.push(`/accessDenied`)
                break;
              case 500:
              case 404:
              case 406:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                  loading: false
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                  loading: false
                });
                break;
              default:
                this.setState({
                  message: 'static.unkownError',
                  loading: false
                });
                break;
            }
          }
        }
      );
    // .catch(
    //   error => {
    //     this.setState({
    //       countrys: []
    //     })
    //     if (error.message === "Network Error") {
    //       this.setState({ message: error.message });
    //     } else {
    //       switch (error.response ? error.response.status : "") {
    //         case 500:
    //         case 401:
    //         case 404:
    //         case 406:
    //         case 412:
    //         default:
    //           this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
    //           break;
    //           this.setState({ message: 'static.unkownError' });
    //           break;
    //       }
    //     }
    //   }
    // );

  }

  getTracerCategoryList() {

    // AuthenticationService.setupAxiosInterceptors();
    let realmId = AuthenticationService.getRealmId()//document.getElementById('realmId').value
    TracerCategoryService.getTracerCategoryByRealmId(realmId).then(response => {

      if (response.status == 200) {
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          tracerCategories: listArray
        })
      }

    }).catch(
      error => {
        if (error.message === "Network Error") {
          this.setState({
            message: 'static.unkownError',
            loading: false
          });
        } else {
          switch (error.response ? error.response.status : "") {

            case 401:
              this.props.history.push(`/login/static.message.sessionExpired`)
              break;
            case 403:
              this.props.history.push(`/accessDenied`)
              break;
            case 500:
            case 404:
            case 406:
              this.setState({
                message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                loading: false
              });
              break;
            case 412:
              this.setState({
                message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                loading: false
              });
              break;
            default:
              this.setState({
                message: 'static.unkownError',
                loading: false
              });
              break;
          }
        }
      }
    );
    // .catch(error => {
    //   if (error.message === "Network Error") {
    //     this.setState({ message: error.message });
    //   } else {
    //     switch (error.response ? error.response.status : "") {
    //       case 500:
    //       case 401:
    //       case 404:
    //       case 406:
    //       case 412:
    //         this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
    //         break;
    //       default:
    //         this.setState({ message: 'static.unkownError' });
    //         break;
    //     }
    //   }
    // }
    // );

  }

  componentDidMount() {
    this.getPrograms()
    this.getCountrys();
    this.getTracerCategoryList();
    // AuthenticationService.setupAxiosInterceptors();
    //  this.getRelamList();

  }

  getPrograms = () => {

    ProgramService.getProgramList()
      .then(response => {
        console.log(JSON.stringify(response.data))
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          programs: listArray, loading: false
        })
      }).catch(
        error => {
          this.setState({
            programs: [], loading: false
          })
          if (error.message === "Network Error") {
            this.setState({
              message: 'static.unkownError',
              loading: false
            });
          } else {
            switch (error.response ? error.response.status : "") {

              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`)
                break;
              case 403:
                this.props.history.push(`/accessDenied`)
                break;
              case 500:
              case 404:
              case 406:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                  loading: false
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                  loading: false
                });
                break;
              default:
                this.setState({
                  message: 'static.unkownError',
                  loading: false
                });
                break;
            }
          }
        }
      );

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
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

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
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);
    const { tracerCategories } = this.state;
    // const { realmList } = this.state;
    // let realms = realmList.length > 0
    //   && realmList.map((item, i) => {
    //     return (
    //       <option key={i} value={item.realmId}>
    //         {getLabelText(item.label, this.state.lang)}
    //       </option>
    //     )
    //   }, this);

    const { programLstFiltered } = this.state;
    let programList = [];
    programList = programLstFiltered.length > 0
      && programLstFiltered.map((item, i) => {
        return (

          { label: getLabelText(item.label, this.state.lang), value: item.programId }

        )
      }, this);

    return (
      <div className="animated fadeIn" >
        <AuthenticationServiceComponent history={this.props.history} />
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
                <div className="pl-0">
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                      <div className="controls edit">
                        <Picker
                          ref="pickAMonth2"
                          years={{ min: this.state.minDate, max: this.state.maxDate }}
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
                    {/* <FormGroup className="col-md-3">
                      <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            type="select" name="realmId" id="realmId"
                            onChange={(e) => { this.getCountrys(); this.getTracerCategoryList(); this.filterData(); }}
                          >
                            <option value="0">{i18n.t('static.common.select')}</option>
                            {realms}
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup> */}
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
                          disabled={this.state.loading}
                        />
                        {!!this.props.error &&
                          this.props.touched && (
                            <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                          )}
                      </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                      <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>

                      <MultiSelect

                        bsSize="sm"
                        name="programIds"
                        id="programIds"
                        value={this.state.programValues}
                        onChange={(e) => { this.handleChangeProgram(e) }}
                        options={programList && programList.length > 0 ? programList : []}
                        disabled={this.state.loading}
                      />
                      {!!this.props.error &&
                        this.props.touched && (
                          <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                        )}

                    </FormGroup>


                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls">

                        <MultiSelect
                          name="tracerCategoryId"
                          id="tracerCategoryId"
                          bsSize="sm"
                          value={this.state.tracerCategoryValues}
                          onChange={(e) => { this.handleTracerCategoryChange(e) }}
                          disabled={this.state.loading}
                          options=
                          {tracerCategories.length > 0 ?
                            tracerCategories.map((item, i) => {
                              return ({ label: getLabelText(item.label, this.state.lang), value: item.tracerCategoryId })

                            }, this) : []} />

                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.includeapproved')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="includeApprovedVersions"
                            id="includeApprovedVersions"
                            bsSize="sm"
                            onChange={(e) => { this.filterData() }}
                          >
                            <option value="true">{i18n.t('static.program.yes')}</option>
                            <option value="false">{i18n.t('static.program.no')}</option>
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.withinstock')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="stockStatusId"
                            id="stockStatusId"
                            bsSize="sm"
                            onChange={(e) => { this.filterDataAsperstatus() }}
                          >

                            <option value="-1">{i18n.t('static.common.all')}</option>
                            {legendcolor.length > 0
                              && legendcolor.map((item, i) => {
                                return (
                                  <option key={i} value={item.value}>
                                    {item.text}
                                  </option>
                                )
                              }, this)
                            }
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                      <ul className="legendcommitversion list-group">
                        {
                          legendcolor.map(item1 => (
                            <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                          ))
                        }
                      </ul>
                    </FormGroup>
                  </div>
                </div>
              </Form>
              <Col md="12 pl-0">
                <div className="globalviwe-scroll">
                  <div className="row">

                  </div>
                  <div className="row" style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="col-md-12">
                      <div className="table-responsive ">

                        {this.state.data.length > 0 && <Table responsive className="table-striped  table-fixed  table-bordered text-center mt-2">


                          <thead>
                            <tr>
                              <th className="text-center" style={{ width: '27%' }}>{i18n.t('static.planningunit.planningunit')}</th>
                              {
                                this.state.programLst.map(ele => { return (<th className="text-center" style={{ width: ((100 - 27) / this.state.programLst.length) + '%' }}>{ele}</th>) })}
                            </tr>
                          </thead>

                          <tbody>
                            {
                              this.state.planningUnits.map(
                                ele => {
                                  return <tr><td>{getLabelText(ele.label, this.state.lang)}</td>{
                                    this.state.programLst.map(ele1 => {
                                      return (this.state.data.filter(c => c.planningUnit.id == ele.id)).map(
                                        item => {
                                          return (item.programData.filter(c => c.program.code === ele1).length == 0 ? <td></td> : <td className="text-center" style={this.cellstyleWithData(item.programData.filter(c => c.program.code == ele1)[0])}>{item.programData.filter(c => c.program.code == ele1)[0].mos != null ? this.roundN(item.programData.filter(c => c.program.code == ele1)[0].mos) : i18n.t("static.supplyPlanFormula.na")}</td>)
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
                  <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                      <div class="align-items-center">
                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                        <div class="spinner-border blue ml-4" role="status">

                        </div>
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
