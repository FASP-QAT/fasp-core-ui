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
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
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
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import MultiSelect from "react-multi-select-component";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
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
let dendoLabels = [{ label: "Today", pointStyle: "triangle" }]
const options = {
  title: {
    display: true,
    text: i18n.t('static.dashboard.globalconsumption'),
    // fontColor: 'black'
  },
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: i18n.t('static.report.consupmtionqty') + i18n.t('static.report.inmillions'),
        fontColor: 'black'
      },
      stacked: true,
      ticks: {
        beginAtZero: true,
        fontColor: 'black',
        callback: function (value) {
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
    custom: CustomTooltips,
    callbacks: {
      label: function (tooltipItem, data) {

        let label = data.labels[tooltipItem.index];
        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

        var cell1 = value
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
      }
    }
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



class GlobalConsumption extends Component {
  constructor(props) {
    super(props);

    this.toggledata = this.toggledata.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
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
      programs: [],
      realmList: [],
      message: '',
      // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      loading: true,
      programLst: []


    };
    this.getCountrys = this.getCountrys.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    // this.getProductCategories = this.getProductCategories.bind(this)
    this.getPrograms = this.getPrograms.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getRandomColor = this.getRandomColor.bind(this)
    this.handleChangeProgram = this.handleChangeProgram.bind(this)
    this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
    this.hideDiv = this.hideDiv.bind(this)
    this.handleDisplayChange = this.handleDisplayChange.bind(this)
    this.filterProgram = this.filterProgram.bind(this)

  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }

  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }

  exportCSV() {

    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    this.state.countryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.programLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
    // csvRow.push((i18n.t('static.dashboard.productcategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    console.log(this.state.planningUnitValues)
    csvRow.push('')
    this.state.planningUnitValues.map(ele =>
      csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.label).toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('"' + ((i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))

    csvRow.push('')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    var re;

    var A = [this.addDoubleQuoteToRowContent([(i18n.t('static.dashboard.country')).replaceAll(' ', '%20'), (i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.consumption.consumptionqty') + ' ' + i18n.t('static.report.inmillions')).replaceAll(' ', '%20')])]

    re = this.state.consumptions

    for (var item = 0; item < re.length; item++) {
      A.push([this.addDoubleQuoteToRowContent([getLabelText(re[item].realmCountry.label), re[item].consumptionDateString, re[item].planningUnitQty])])
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.globalconsumption') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
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

  roundN = num => {
    return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
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


      //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
      // var reader = new FileReader();

      //var data='';
      // Use fs.readFile() method to read the file 
      //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
      //}); 
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setPage(i)
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.dashboard.globalconsumption'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
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

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal')
    doc.setTextColor("#002f6c");


    var y = 110;
    var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
      console.log(y)
    }
    planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
    //  doc.text(doc.internal.pageSize.width / 8, 130, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
      console.log(y)
    }

    planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 9, this.state.programLabels.size > 5 ? 190 : 150, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
      console.log(y)
    }

    doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, y, {
      align: 'left'
    })






    const title = i18n.t('static.dashboard.globalconsumption');
    var canvas = document.getElementById("cool-canvas");
    //creates image

    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var aspectwidth1 = (width - h1);
    let startY = y + 10
    console.log('startY', startY)
    let pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
      doc.addPage()
    }
    let startYtable = startY - ((height - h1) * (pages - 1))
    doc.setTextColor("#fff");
    if (startYtable > (height - 400)) {
      doc.addPage()
      startYtable = 80
    }
    doc.addImage(canvasImg, 'png', 50, startYtable, 750, 260, 'CANVAS');

    const headers = [[i18n.t('static.dashboard.country'), i18n.t('static.report.month'), i18n.t('static.consumption.consumptionqty') + ' ' + i18n.t('static.report.inmillions')]]
    const data = this.state.consumptions.map(elt => [getLabelText(elt.realmCountry.label, this.state.lang), elt.consumptionDateString, this.formatter(elt.planningUnitQty)]);
    doc.addPage()
    startYtable = 80
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: startYtable,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    };


    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.globalconsumption').concat('.pdf'));
    //creates PDF from img
    /*  var doc = new jsPDF('landscape');
      doc.setFontSize(20);
      doc.text(15, 15, "Cool Chart");
      doc.save('canvas.pdf');*/
  }

  handleChange(countrysId) {

    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      countryValues: countrysId.map(ele => ele),
      countryLabels: countrysId.map(ele => ele.label)
    }, () => {
      this.filterProgram();
      // this.filterData(this.state.rangeValue)
    })
  }
  filterProgram = () => {
    let countryIds = this.state.countryValues.map(ele => ele.value);
    console.log('countryIds', countryIds, 'programs', this.state.programs)
    this.setState({
      programLst: [],
      programValues: [],
      programLabels: []
    }, () => {
      if (countryIds.length != 0) {
        let programLst = [];
        for (var i = 0; i < countryIds.length; i++) {
          programLst = [...programLst, ...this.state.programs.filter(c => c.realmCountry.realmCountryId == countryIds[i])]
        }

        console.log('programLst', programLst)
        if (programLst.length > 0) {

          this.setState({
            programLst: programLst
          }, () => {
            this.filterData(this.state.rangeValue)
          });
        } else {
          this.setState({
            programLst: []
          }, () => {
            this.filterData(this.state.rangeValue)
          });
        }
      } else {
        this.setState({
          programLst: []
        }, () => {
          this.filterData(this.state.rangeValue)
        });
      }

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

      this.filterData(this.state.rangeValue)
      this.getPlanningUnit();
    })

  }

  handlePlanningUnitChange(planningUnitIds) {
    planningUnitIds = planningUnitIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele),
      planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {

      this.filterData(this.state.rangeValue)
    })
  }

  handleDisplayChange() {
    this.filterData(this.state.rangeValue)
  }

  hideDiv() {
    setTimeout(function () {
      var theSelect = document.getElementById('planningUnitId').length;

      // console.log("INHIDEDIV------------------------------------------------------", theSelect);

    }, 9000);

  }


  filterData(rangeValue) {

    setTimeout('', 10000);
    // let productCategoryId = document.getElementById("productCategoryId").value;
    let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
    let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
    let programIds = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
    let viewById = document.getElementById("viewById").value;
    let realmId = AuthenticationService.getRealmId()
    let useApprovedVersion = document.getElementById("includeApprovedVersions").value

    console.log("realmId--------->", realmId);
    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
    if (realmId > 0 && this.state.countryValues.length > 0 && this.state.planningUnitValues.length > 0 && this.state.programValues.length > 0) {
      this.setState({ loading: true })
      // let realmId = AuthenticationService.getRealmId();
      var inputjson = {
        "realmId": realmId,
        "realmCountryIds": CountryIds,
        "programIds": programIds,
        "planningUnitIds": planningUnitIds,
        "startDate": startDate,
        "stopDate": stopDate,
        "reportView": viewById,
        "useApprovedSupplyPlanOnly": useApprovedVersion
      }
      console.log('inputJSON***' + inputjson)

      ReportService.getGlobalConsumptiondata(inputjson)
        .then(response => {
          console.log("RESP--->", response.data);
          let tempConsumptionData = response.data;
          var consumptions = [];

          for (var i = 0; i < tempConsumptionData.length; i++) {
            let countryConsumption = Object.values(tempConsumptionData[i].countryConsumption);
            for (var j = 0; j < countryConsumption.length; j++) {
              let json = {
                "realmCountry": countryConsumption[j].country,
                "consumptionDate": tempConsumptionData[i].transDate,
                "planningUnitQty": this.roundN((countryConsumption[j].actualConsumption == 0 ? (countryConsumption[j].forecastedConsumption / 1000000) : (countryConsumption[j].actualConsumption / 1000000))),
                "consumptionDateString": moment(tempConsumptionData[i].transDate, 'YYYY-MM-dd').format('MMM YY'),
                "consumptionDateString1": moment(tempConsumptionData[i].transDate, 'yyyy-MM-dd')
              }
              console.log("json--->", json);
              consumptions.push(json);
            }

          }

          console.log("consumptions--->", consumptions);

          this.setState({
            consumptions: consumptions,
            message: '',
            loading: false
          }, () => {

          });
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
    } else if (realmId <= 0) {
      this.setState({ message: i18n.t('static.common.realmtext'), consumptions: [] });

    } else if (this.state.countryValues.length == 0) {
      this.setState({ message: i18n.t('static.program.validcountrytext'), consumptions: [] });

    } else if (this.state.programValues.length == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

    }
  }

  getCountrys() {
    if (isSiteOnline()) {

      let realmId = AuthenticationService.getRealmId();
      // let realmId = document.getElementById('realmId').value
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

    } else {
      const lan = 'en';
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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

          proList.sort((a, b) => {
            var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
            var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase                   
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            countrys: proList
          })

        }.bind(this);

      }

    }
    this.filterData(this.state.rangeValue);
  }

  getPlanningUnit() {
    let programValues = this.state.programValues;
    // console.log("programValues----->", programValues);
    this.setState({
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: []
    }, () => {
      if (programValues.length > 0) {
        PlanningUnitService.getPlanningUnitByProgramIds(programValues.map(ele => (ele.value)))
          .then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              planningUnits: listArray,
            })
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
      }
    })

  }

  getPrograms() {

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
    // .catch(
    //   error => {
    //     this.setState({
    //       programs: [], loading: false
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
    //           this.setState({ message: 'static.unkownError', loading: false });
    //           break;
    //       }
    //     }
    //   }
    // );
  }


  componentDidMount() {

    this.getPrograms()
    this.getCountrys();
    this.getRelamList();
    // this.getProductCategories()
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
    //       this.setState({ message: error.message, loading: false });
    //     } else {
    //       switch (error.response.status) {
    //         case 500:
    //         case 401:
    //         case 404:
    //         case 406:
    //         case 412:
    //           this.setState({ message: error.response.data.messageCode, loading: false });
    //           break;
    //         default:
    //           this.setState({ message: 'static.unkownError', loading: false });
    //           console.log("Error code unkown");
    //           break;
    //       }
    //     }
    //   }
    // );
  }

  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
  }

  show() {
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
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

  getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  dateFormatterLanguage = value => {
    if (moment(value).format('MM') === '01') {
      return (i18n.t('static.month.jan') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '02') {
      return (i18n.t('static.month.feb') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '03') {
      return (i18n.t('static.month.mar') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '04') {
      return (i18n.t('static.month.apr') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '05') {
      return (i18n.t('static.month.may') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '06') {
      return (i18n.t('static.month.jun') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '07') {
      return (i18n.t('static.month.jul') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '08') {
      return (i18n.t('static.month.aug') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '09') {
      return (i18n.t('static.month.sep') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '10') {
      return (i18n.t('static.month.oct') + ' ' + moment(value).format('YY'))
    } else if (moment(value).format('MM') === '11') {
      return (i18n.t('static.month.nov') + ' ' + moment(value).format('YY'))
    } else {
      return (i18n.t('static.month.dec') + ' ' + moment(value).format('YY'))
    }
  }

  render() {
    const { planningUnits } = this.state;
    let planningUnitList = [];
    planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (

          { label: getLabelText(item.label, this.state.lang), value: item.id }

        )
      }, this);
    const { programLst } = this.state;
    let programList = [];
    programList = programLst.length > 0
      && programLst.map((item, i) => {
        return (

          { label: getLabelText(item.label, this.state.lang), value: item.programId }

        )
      }, this);

    const { countrys } = this.state;
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);

    const { realmList } = this.state;
    let realms = realmList.length > 0
      && realmList.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);



    const backgroundColor = [
      // '#002f6c',
      // '#118b70',
      // '#EDB944',
      // '#20a8d8',
      // '#d1e3f5',
      // '#212721',
      // '#4dbd74',
      // '#f86c6b',
      // '#F48521',
      // '#ED5626',
      // '#cfcdc9',
      // '#004876', '#0063a0', '#007ecc', '#0093ee', '#82caf8', '#c8e6f4'

      '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
      '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
      '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
      '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
      '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
      '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
      '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
    ]

    let localCountryList = [...new Set(this.state.consumptions.map(ele => (getLabelText(ele.realmCountry.label, this.state.lang))))];

    let consumptionSummerydata = [];
    let data = [];
    var mainData = this.state.consumptions;
    mainData = mainData.sort(function (a, b) {
      return new Date(a.consumptionDate) - new Date(b.consumptionDate);
    });
    let dateArray = [...new Set(mainData.map(ele => (moment(ele.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'))))]

    for (var i = 0; i < localCountryList.length; i++) {//country
      let tempdata = [];
      for (var j = 0; j < dateArray.length; j++) {//date

        let result1 = mainData.filter(c => (localCountryList[i].localeCompare(getLabelText(c.realmCountry.label, this.state.lang))) == 0).map(ele => ele);

        let result = result1.filter(c => (moment(dateArray[j], 'MM-YYYY').isSame(moment(moment(c.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'), 'MM-YYYY'))) != 0).map(ele => ele);

        let hold = 0
        for (var k = 0; k < result.length; k++) {
          hold = result[k].planningUnitQty;
        }

        tempdata.push(hold);

      }

      consumptionSummerydata.push(tempdata);

    }
    console.log("consumptionSummerydata---", consumptionSummerydata);

    const bar = {
      // labels: [...new Set(this.state.consumptions.map(ele => (ele.consumptionDateString)))],
      labels: [...new Set(this.state.consumptions.map(ele => (this.dateFormatterLanguage(ele.consumptionDateString1))))],
      datasets: consumptionSummerydata.map((item, index) => ({ stack: 1, label: localCountryList[index], data: item, backgroundColor: backgroundColor[index] })),
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
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>

        <Card>
          <div className="Card-header-reporticon">
            {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.globalconsumption')}</strong> */}
            {this.state.consumptions.length > 0 && <div className="card-header-actions">
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
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                      <div className="controls edit">

                        <Picker
                          ref="pickRange"
                          years={{ min: this.state.minDate, max: this.state.maxDate }}
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

                    {/* <FormGroup className="col-md-3">
                      <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            bsSize="sm"
                            // onChange={(e) => { this.dataChange(e) }}
                            type="select" name="realmId" id="realmId"
                            onChange={(e) => { this.getCountrys(); }}
                          >
                            <option value="">{i18n.t('static.common.select')}</option>
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
                            <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
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
                          <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                        )}

                    </FormGroup>


                    <FormGroup className="col-sm-3" id="hideDiv">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls">

                        <MultiSelect
                          // isLoading={true}
                          name="planningUnitId"
                          id="planningUnitId"
                          bsSize="sm"
                          value={this.state.planningUnitValues}
                          onChange={(e) => { this.handlePlanningUnitChange(e) }}
                          options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                          disabled={this.state.loading}
                        />

                      </div>
                    </FormGroup>

                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                      <div className="controls">
                        <InputGroup>
                          <Input
                            type="select"
                            name="viewById"
                            id="viewById"
                            bsSize="sm"
                            onChange={this.handleDisplayChange}
                          >
                            <option value="1">{i18n.t('static.report.planningUnit')}</option>
                            <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                          </Input>
                        </InputGroup>
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
                            onChange={(e) => { this.filterData(this.state.rangeValue) }}
                          >
                            <option value="true">{i18n.t('static.program.yes')}</option>
                            <option value="false">{i18n.t('static.program.no')}</option>
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup>



                  </div>
                </div>
              </Form>
              <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                <div className="globalviwe-scroll">
                  <div className="row">

                    {
                      this.state.consumptions.length > 0
                      &&
                      <div className="col-md-12 p-0 grapg-margin " >
                        <div className="offset-md-1 col-md-11">
                          <div className="chart-wrapper chart-graph-report">
                            <Bar id="cool-canvas" data={bar} options={options} />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                            {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                          </button>

                        </div>
                      </div>}

                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      {this.state.show && this.state.consumptions.length > 0 &&
                        <div className="table-responsive ">

                          <Table responsive className="table-striped  table-fixed table-bordered text-center mt-2">

                            <thead>
                              <tr>
                                <th className="text-center" style={{ width: '34%' }}> {i18n.t('static.dashboard.country')} </th>
                                <th className="text-center " style={{ width: '34%' }}> {i18n.t('static.report.month')} </th>
                                <th className="text-center" style={{ width: '34%' }}>{i18n.t('static.report.consupmtionqty')} {i18n.t('static.report.inmillions')} </th>
                              </tr>
                            </thead>

                            <tbody>
                              {
                                this.state.consumptions.length > 0
                                &&
                                this.state.consumptions.map((item, idx) =>

                                  <tr id="addr0" key={idx} >

                                    <td>{getLabelText(this.state.consumptions[idx].realmCountry.label, this.state.lang)}</td>
                                    <td>

                                      {this.state.consumptions[idx].consumptionDateString}
                                    </td>
                                    <td >
                                      {this.formatter(this.state.consumptions[idx].planningUnitQty)}
                                    </td>
                                  </tr>)

                              }
                            </tbody>
                          </Table>

                        </div>
                      }

                    </div>
                  </div>
                </div>
              </Col>
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

          </CardBody>
        </Card>

      </div>
    );
  }
}

export default GlobalConsumption;
