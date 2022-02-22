
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
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js'
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
import TracerCategoryService from '../../api/TracerCategoryService';
import MultiSelect from "react-multi-select-component";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { contrast, isSiteOnline } from "../../CommonComponent/JavascriptCommonFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

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
      programs: [],
      countryValues: [],
      countryLabels: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      programValues: [],
      programLabels: [],
      message: '',
      singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      loading: true,
      programLst: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
      tracerCategories: [],


    };

    this.getCountrys = this.getCountrys.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.getProductCategories = this.getProductCategories.bind(this)
    this.getPrograms = this.getPrograms.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getRandomColor = this.getRandomColor.bind(this)
    this.handleChangeProgram = this.handleChangeProgram.bind(this)
    this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
    this.formatLabel = this.formatLabel.bind(this);
    this.formatValue = this.formatValue.bind(this)
    this.pickAMonth2 = React.createRef();
    this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.filterProgram = this.filterProgram.bind(this)
    this.filterTracerCategory = this.filterTracerCategory.bind(this);
  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  roundN = num => {
    return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
  }
  formatLabel(cell, row) {
    // console.log("celll----", cell);
    if (cell != null && cell != "") {
      return getLabelText(cell, this.state.lang);
    }
  }

  formatValue(cell, row) {
    console.log("cell----", cell);
    if (cell != null && cell != "") {
      return this.roundN(cell) + '%';
    } else if ((cell == "0" && row.months == 0)) {
      return "No data points containing both actual and forecast consumption ";
    } else if (cell == null) {
      return "No data points containing  actual consumption ";
    } else {
      return "0%"
    }
  }
  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }
  exportCSV() {

    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.timeWindow') + ' : ' + (document.getElementById("viewById").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')

    csvRow.push('')
    this.state.countryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.programLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.planningUnitLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
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

    var A = [this.addDoubleQuoteToRowContent([(i18n.t('static.program.program')).replaceAll(' ', '%20'), (i18n.t('static.report.qatPID')).replaceAll(' ', '%20'), (i18n.t('static.dashboard.planningunit')).replaceAll(' ', '%20'),
    //(i18n.t('static.report.historicalConsumptionDiff')).replaceAll(' ','%20'),(i18n.t('static.report.historicalConsumptionActual')).replaceAll(' ','%20'),
    (i18n.t('static.report.error')).replaceAll(' ', '%20'), (i18n.t('static.report.noofmonth')).replaceAll(' ', '%20')])]

    re = this.state.consumptions

    for (var item = 0; item < re.length; item++) {
      console.log(re[item].planningUnit)
      A.push([this.addDoubleQuoteToRowContent([(getLabelText(re[item].program.label).replaceAll(',', '%20')).replaceAll(' ', '%20'), re[item].planningUnit.id, re[item].planningUnit.id == 0 ? '' : (getLabelText(re[item].planningUnit.label)).replaceAll(' ', '%20'),
      // re[item].historicalConsumptionDiff,re[item].historicalConsumptionActual,
      re[item].message != null ? (i18n.t(re[item].message)).replaceAll(' ', '%20') : this.roundN(re[item].forecastError) + '%', re[item].monthCount])])
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.forecastmetrics') + ".csv"
    document.body.appendChild(a)
    a.click()
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
      doc.setFont('helvetica', 'bold')
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setPage(i)
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.dashboard.forecastmetrics'), doc.internal.pageSize.width / 2, 50, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.report.timeWindow') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
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


    var y = 130;
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


    let tracerCategoryText = doc.splitTextToSize((i18n.t('static.tracercategory.tracercategory') + ' : ' + this.state.tracerCategoryLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 9, this.state.programLabels.size > 5 ? 190 : 150, planningText)
    y = y + 10;
    for (var i = 0; i < tracerCategoryText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 8, y, tracerCategoryText[i]);
      y = y + 10;
      console.log(y)
    }


    doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, y, {
      align: 'left'
    })


    var height = doc.internal.pageSize.height;
    var h1 = 50;
    let startY = y + 20
    console.log('startY', startY)
    let pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
      doc.addPage()
    }
    let startYtable = startY - ((height - h1) * (pages - 1))
    const headers = [[i18n.t('static.program.program'), i18n.t('static.report.qatPID'), i18n.t('static.dashboard.planningunit'),
    //i18n.t('static.report.historicalConsumptionDiff'),i18n.t('static.report.historicalConsumptionActual'),
    i18n.t('static.report.error'), i18n.t('static.report.noofmonth')]]
    const data = this.state.consumptions.map(elt => [getLabelText(elt.program.label), elt.planningUnit.id, getLabelText(elt.planningUnit.label),
    //elt.historicalConsumptionDiff,elt.historicalConsumptionActual,
    elt.message != null ? i18n.t(elt.message) : this.roundN(elt.forecastError) + '%', elt.monthCount]);
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: startYtable,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 169.0 },
        1: { cellWidth: 141 },
        2: { cellWidth: 169.89 },
        3: { cellWidth: 141 },
        4: { cellWidth: 141 }

      }

    };


    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.forecastmetrics') + ".pdf")
    //creates PDF from img
    /*  var doc = new jsPDF('landscape');
      doc.setFontSize(20);
      doc.text(15, 15, "Cool Chart");
      doc.save('canvas.pdf');*/
  }



  rowClassNameFormat(row, rowIdx) {
    return (row.forecastError > 50) ? 'background-red' : '';
  }

  handleTracerCategoryChange = (tracerCategoryIds) => {
    tracerCategoryIds = tracerCategoryIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      tracerCategoryValues: tracerCategoryIds.map(ele => ele),
      tracerCategoryLabels: tracerCategoryIds.map(ele => ele.label)
    }, () => {

      // this.filterData()
      this.getPlanningUnit();
    })
  }

  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      countryValues: countrysId.map(ele => ele),
      countryLabels: countrysId.map(ele => ele.label),
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
    }, () => {
      this.filterProgram();
      // this.filterData()
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
            this.filterData()
          });
        } else {
          this.setState({
            programLst: []
          }, () => {
            this.filterData()
          });
        }
      } else {
        this.setState({
          programLst: []
        }, () => {
          this.filterData()
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
      programLabels: programIds.map(ele => ele.label),
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
    }, () => {
      this.filterTracerCategory(programIds);
      this.getPlanningUnit();
      this.filterData()
    })

  }

  filterTracerCategory(programIds) {

    this.setState({
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
    }, () => {
      if (programIds.length > 0) {
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
    })
  }

  handlePlanningUnitChange(planningUnitIds) {
    console.log(planningUnitIds)
    planningUnitIds = planningUnitIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele),
      planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {

      this.filterData()
    })
  }

  buildJExcel() {
    let consumptions = this.state.consumptions;
    // console.log("consumptions---->", consumptions);
    let consumptionArray = [];
    let count = 0;

    for (var j = 0; j < consumptions.length; j++) {
      data = [];
      data[0] = getLabelText(consumptions[j].program.label, this.state.lang)
      data[1] = getLabelText(consumptions[j].planningUnit.label, this.state.lang)
      data[2] = consumptions[j].message != null ? "" : this.roundN(consumptions[j].forecastError);
      data[3] = consumptions[j].monthCount;
      data[4] = this.roundN(consumptions[j].forecastError);

      consumptionArray[count] = data;
      count++;
    }
    // if (consumptions.length == 0) {
    //   data = [];
    //   consumptionArray[0] = data;
    // }
    // console.log("consumptionArray---->", consumptionArray);
    this.el = jexcel(document.getElementById("tableDiv"), '');
    this.el.destroy();
    var json = [];
    var data = consumptionArray;

    var options = {
      data: data,
      columnDrag: true,
      colWidths: [150, 150, 100],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: i18n.t('static.program.program'),
          type: 'text',
        },
        {
          title: i18n.t('static.dashboard.planningunit'),
          type: 'text',
        },
        {
          title: i18n.t('static.report.error'),
          type: 'numeric',
          mask: '#,##%',
        },
        {
          title: i18n.t('static.report.noofmonth'),
          type: 'numeric', mask: '#,##.00', decimal: '.',
        },
        {
          title: i18n.t('static.report.error'),
          type: 'hidden',
        },
      ],
      editable: false,
      text: {
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },

      // updateTable: function (el, cell, x, y, source, value, id) {
      //   if (y != null) {
      //     var elInstance = el.jexcel;
      //     var colArr = ['A', 'B', 'C', 'D', 'E']
      //     var rowData = elInstance.getRowData(y);

      //     var forecastError = rowData[4];

      //     if (forecastError > 50) {
      //       for (var i = 0; i < colArr.length; i++) {
      //         elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
      //         //  elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
      //         let textColor = 'red'//contrast('#f48282');
      //         elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'color', textColor);
      //       }
      //     } else {
      //       for (var i = 0; i < colArr.length; i++) {
      //         elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
      //       }
      //     }
      //   }
      // }.bind(this),
      onsearch: function (el) {
        el.jexcel.updateTable();
      },
      onfilter: function (el) {
        el.jexcel.updateTable();
      },
      onload: this.loaded,
      pagination: localStorage.getItem("sesRecordCount"),
      search: true,
      columnSorting: true,
      tableOverflow: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      onselection: this.selected,


      oneditionend: this.onedit,
      copyCompatibility: true,
      allowExport: false,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var languageEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = languageEl;
    this.setState({
      languageEl: languageEl, loading: false
    })
  }

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
    console.log("INSIDE UPDATE TABLE");

    var elInstance = instance.jexcel;
    var json = elInstance.getJson();

    var colArr = ['A', 'B', 'C', 'D', 'E']
    for (var j = 0; j < json.length; j++) {


      var rowData = elInstance.getRowData(j);
      // console.log("elInstance---->", elInstance);

      var forecastError = rowData[4];
      if (forecastError > 50) {
        for (var i = 0; i < colArr.length; i++) {
          elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
          //  elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
          let textColor = '#BA0C2F'//contrast('#f48282');
          elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', textColor);
        }
      } else {
        for (var i = 0; i < colArr.length; i++) {
          elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        }
      }
    }
  }



  filterData() {
    let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
    let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
    let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());//document.getElementById('tracerCategoryId').value
    let programIds = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
    let startDate = (this.state.singleValue2.year) + '-' + this.state.singleValue2.month + '-01';
    let monthInCalc = document.getElementById("viewById").value;
    let useApprovedVersion = document.getElementById("includeApprovedVersions").value
    if (this.state.countryValues.length > 0 && this.state.planningUnitValues.length > 0 && this.state.programValues.length > 0 && this.state.tracerCategoryValues.length > 0) {
      this.setState({ loading: true })
      var inputjson = {
        "realmCountryIds": CountryIds, "programIds": programIds, "planningUnitIds": planningUnitIds, "startDate": startDate, "previousMonths": monthInCalc, "useApprovedSupplyPlanOnly": useApprovedVersion, "tracerCategoryIds": tracercategory,

      }
      // AuthenticationService.setupAxiosInterceptors();
      console.log("report json---", inputjson);
      ReportService.getForecastError(inputjson)
        .then(response => {
          console.log(JSON.stringify(response.data));
          this.setState({
            consumptions: response.data,
            message: ''
          }, () => {
            this.buildJExcel();
          });
        }).catch(
          error => {
            this.setState({
              consumptions: [], loading: false
            }, () => {
              this.el = jexcel(document.getElementById("tableDiv"), '');
              this.el.destroy();
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
      //       consumptions: [], loading: false
      //     }, () => {
      //       this.el = jexcel(document.getElementById("tableDiv"), '');
      //       this.el.destroy();
      //     });

      //     if (error.message === "Network Error") {
      //       this.setState({ message: error.message, loading: false });
      //     } else {
      //       switch (error.response ? error.response.status : "") {
      //         case 500:
      //         case 401:
      //         case 404:
      //         case 406:
      //         case 412:
      //           this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }), loading: false });
      //           break;
      //         default:
      //           this.setState({ message: 'static.unkownError', loading: false });
      //           break;
      //       }
      //     }
      //   }
      // );
    } else if (this.state.countryValues.length == 0) {
      this.setState({
        message: i18n.t('static.program.validcountrytext'),
        consumptions: [],
        programValues: [],
        programLabels: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
        tracerCategories: [],
        tracerCategoryValues: [],
        tracerCategoryLabels: [],
      }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
      });

    } else if (this.state.programValues.length == 0) {
      this.setState({
        message: i18n.t('static.common.selectProgram'),
        consumptions: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
        tracerCategories: [],
        tracerCategoryValues: [],
        tracerCategoryLabels: [],

      }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
      });

    } else if (this.state.tracerCategoryValues.length == 0) {
      this.setState({
        message: i18n.t('static.tracercategory.tracercategoryText'),
        consumptions: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
      }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
      });

    } else if (this.state.planningUnitValues.length == 0) {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
      });

    }
  }

  getCountrys() {
    if (isSiteOnline()) {
      // AuthenticationService.setupAxiosInterceptors();
      let realmId = AuthenticationService.getRealmId();
      RealmCountryService.getRealmCountryForProgram(realmId)
        .then(response => {
          var listArray = response.data.map(ele => ele.realmCountry);
          listArray.sort((a, b) => {
            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            // countrys: response.data.map(ele => ele.realmCountry), loading: false
            countrys: listArray, loading: false
          })
        }).catch(
          error => {
            this.setState({
              countrys: [], loading: false
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
      //       countrys: [], loading: false
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
      //         default:
      //           this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }), loading: false });
      //           break;
      //           this.setState({ message: 'static.unkownError', loading: false });
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


  }
  getPlanningUnit() {

    if (this.state.tracerCategoryValues.length > 0) {

      let programValues = this.state.programValues;
      this.setState({
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: []
      }, () => {
        if (programValues.length > 0) {
          let inputjson = {
            tracerCategoryIds: this.state.tracerCategoryValues.map(ele => (ele.value).toString()),
            programIds: programValues.map(ele => (ele.value))
          }
          PlanningUnitService.getPlanningUnitByProgramIdsAndTracerCategorieIds(inputjson)
            .then(response => {
              var listArray = response.data;
              listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
              });
              console.log("resp---->", listArray);
              this.setState({
                planningUnits: listArray,
                planningUnitValues: listArray.map((item, i) => {
                  return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                }, this),
                planningUnitLabels: listArray.map((item, i) => {
                  return (getLabelText(item.label, this.state.lang))
                }, this),
                message: ''
              }, () => {
                this.filterData();
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
    } else {
      this.filterData();
    }
  }

  getPrograms() {
    // AuthenticationService.setupAxiosInterceptors();
    //let realmId = AuthenticationService.getRealmId();
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
    //           this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
    //           break;
    //         default:
    //           this.setState({ message: 'static.unkownError', loading: false });
    //           break;
    //       }
    //     }
    //   }
    // );
  }

  getProductCategories() {
    // AuthenticationService.setupAxiosInterceptors();
    let realmId = AuthenticationService.getRealmId();
    ProductService.getProductCategoryList(realmId)
      .then(response => {
        console.log(response.data)
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
          var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          productCategories: listArray
        })
      }).catch(
        error => {
          this.setState({
            productCategories: []
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
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
                  loading: false
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
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
    //       productCategories: []
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
    //           this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
    //           break;
    //         default:
    //           this.setState({ message: 'static.unkownError' });
    //           break;
    //       }
    //     }
    //   }
    // );


  }
  componentDidMount() {
    // AuthenticationService.setupAxiosInterceptors();
    this.getPrograms()
    this.getCountrys();

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
    this.setState({ rangeValue: value }, () => {
      this.filterData();
    })

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
    // console.log(JSON.stringify(countrys))
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      console.log(JSON.stringify(item))
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
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

    const { tracerCategories } = this.state;

    const columns = [
      {
        dataField: 'program.label',
        text: i18n.t('static.program.program'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        style: { align: 'center', width: '420px' },
        formatter: this.formatLabel
      }, {
        dataField: 'planningUnit.label',
        text: i18n.t('static.dashboard.planningunit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        style: { align: 'center', width: '420px' },
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
        style: { align: 'center', width: '250px' },
        formatter: this.formatValue

      }, {
        dataField: 'monthCount',
        text: i18n.t('static.report.noofmonth'),
        sort: true,
        align: 'center',
        style: { align: 'center', width: '250px' },
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
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card>
          <div className="Card-header-reporticon">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleForecastMatrix1() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>

              </a>
              {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.forecastmetrics')}</strong> */}
              {this.state.consumptions.length > 0 &&

                <a className="card-header-action">
                  <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                  <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />

                </a>
              }
            </div>
          </div>
          <CardBody className="pb-lg-5 pt-lg-0 ">

            <div ref={ref}>

              <Form >
                <div className="pl-0" >
                  <div className="row">

                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.selectMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
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
                          <MonthBox value={makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                        </Picker>
                      </div>

                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                      <div className="controls">
                        <InputGroup>
                          <Input
                            type="select"
                            name="viewById"
                            id="viewById"
                            bsSize="sm"
                            onChange={this.filterData}
                          >
                            <option value="5">6 {i18n.t('static.dashboard.months')}</option>
                            <option value="2">3 {i18n.t('static.dashboard.months')}</option>
                            <option value="8">9 {i18n.t('static.dashboard.months')}</option>
                            <option value="11">12 {i18n.t('static.dashboard.months')}</option>
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


                  </div>
                </div>
              </Form>
            </div>
            {/* <Col md="12 pl-0">

                <div className="row">
                  <div className="col-md-12"> */}
            {/* {this.state.consumptions.length > 0 &&
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
                            <div className="TableCust ">
                              <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left table-mt">
                                <SearchBar {...props.searchProps} />
                                <ClearSearchButton {...props.searchProps} /></div>
                              <BootstrapTable striped rowClasses={this.rowClassNameFormat} hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                pagination={paginationFactory(options)}

                                {...props.baseProps}
                              /></div>

                          )
                        }
                      </ToolkitProvider>
                    } */}

            {/* <CardBody className=" pt-md-0 pb-md-0 table-responsive"> */}
            {/* <div id="tableDiv" className="jexcelremoveReadonlybackground">
                      </div> */}
            {/* </CardBody> */}
            {/* </div>
                </div>
              </Col> */}

            <div className="ReportSearchMarginTop" style={{ display: this.state.loading ? "none" : "block" }}>
              <div id="tableDiv" className="jexcelremoveReadonlybackground">
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
          </CardBody>
        </Card>


      </div>
    );
  }
}

export default ForecastMetrics;

