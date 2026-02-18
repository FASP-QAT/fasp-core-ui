import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import 'chartjs-plugin-annotation';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import {
  Card,
  CardBody,
  Col,
  Form,
  FormGroup, Input, InputGroup,
  Label,
  Table,
  Popover,
  PopoverBody
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables, jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT_WITHOUT_DATE_CAMELCASE, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY, JEXCEL_PRO_KEY, JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, dateFormatterLanguage, filterOptions, formatter, makeText, roundARU, roundN2 } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
// const options = {
//   title: {
//     display: true,
//     text: i18n.t('static.dashboard.globalconsumption'),
//   },
//   scales: {
//     yAxes: [{
//       scaleLabel: {
//         display: true,
//         labelString: i18n.t('static.report.consupmtionqty') + i18n.t('static.report.inmillions'),
//         fontColor: 'black'
//       },
//       stacked: true,
//       ticks: {
//         beginAtZero: true,
//         fontColor: 'black',
//         callback: function (value) {
//           var cell1 = value
//           cell1 += '';
//           var x = cell1.split('.');
//           var x1 = x[0];
//           var x2 = x.length > 1 ? '.' + x[1] : '';
//           var rgx = /(\d+)(\d{3})/;
//           while (rgx.test(x1)) {
//             x1 = x1.replace(rgx, '$1' + ',' + '$2');
//           }
//           return x1 + x2;
//         }
//       }
//     }],
//     xAxes: [{
//       ticks: {
//         fontColor: 'black',
//       }
//     }]
//   },
//   annotation: {
//     annotations: [{
//       type: 'triangle',
//       drawTime: 'beforeDatasetsDraw',
//       scaleID: 'x-axis-0',
//       value: 'Mar-2020',
//       backgroundColor: 'rgba(0, 255, 0, 0.1)'
//     }],
//   },
//   tooltips: {
//     enabled: false,
//     custom: CustomTooltips,
//     callbacks: {
//       label: function (tooltipItem, data) {
//         let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
//         var cell1 = value
//         cell1 += '';
//         var x = cell1.split('.');
//         var x1 = x[0];
//         var x2 = x.length > 1 ? '.' + x[1] : '';
//         var rgx = /(\d+)(\d{3})/;
//         while (rgx.test(x1)) {
//           x1 = x1.replace(rgx, '$1' + ',' + '$2');
//         }
//         return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
//       }
//     }
//   },
//   maintainAspectRatio: false
//   ,
//   legend: {
//     display: true,
//     position: 'bottom',
//     labels: {
//       usePointStyle: true,
//       fontColor: 'black'
//     }
//   }
// }
/**
 * Component for Global Consumption Report.
 */
class GlobalConsumption extends Component {
  constructor(props) {
    super(props);
    this.toggledata = this.toggledata.bind(this);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      isDarkMode: false,
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
      yaxisEquUnitLabel: [i18n.t('static.program.no')],
      viewByLabel: [i18n.t('static.report.country')],
      versionLabel: [],
      programValues: [],
      programLabels: [],
      programs: [],
      realmList: [],
      message: '',
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      loading: true,
      programLst: [],
      versions: [],
      versionId: [],
      equivalencyUnitList: [],
      programEquivalencyUnitList: [],
      yaxisEquUnit: -1,
      forecastingUnits: [],
      allForecastingUnits: [],
      forecastingUnitValues: [],
      forecastingUnitLabels: [],
      planningUnitList: [],
      planningUnitListAll: [],
      planningUnitId: [],
      consumptionJexcel: '',
      aggregateData: false,
      aggregatedConsumptions: []
    };
    this.getCountrys = this.getCountrys.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeProgram = this.handleChangeProgram.bind(this)
    this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
    this.handleDisplayChange = this.handleDisplayChange.bind(this)
    this.filterProgram = this.filterProgram.bind(this)
    this.setVersionId = this.setVersionId.bind(this)
    this.yAxisChange = this.yAxisChange.bind(this)
    this.buildConsumptionJexcel = this.buildConsumptionJexcel.bind(this);
    this.toggleEu = this.toggleEu.bind(this);
  }

  loaded = function (instance, cell) {
    jExcelLoadedFunction(instance);
  }

  buildConsumptionJexcel() {
    if(this.state.show && this.state.consumptions.length > 0){
    var consumptionList = this.state.aggregateData ? this.state.aggregatedConsumptions : this.state.consumptions;
    var dataArray = [];
    let count = 0;
    if (consumptionList.length > 0) {
      for (var j = 0; j < consumptionList.length; j++) {
        data = [];
        data[0] = getLabelText(consumptionList[j].realmCountry.label, this.state.lang);
        data[1] = consumptionList[j].consumptionDate;
        data[2] = formatter(roundARU(consumptionList[j].planningUnitQty,1), 0);
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("consumptionJexcel"), '');
    jexcel.destroy(document.getElementById("consumptionJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [50, 50, 50],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: this.state.viewByLabel,
          type: this.state.aggregateData ? 'hidden' : 'text',
          editable: false,
          readOnly: true,
        },
        {
          title: i18n.t('static.common.month'),
          type: 'calendar',
          options: {
              format: JEXCEL_DATE_FORMAT_WITHOUT_DATE_CAMELCASE,
              type: 'year-month-picker'
          },
          editable: false,
          readOnly: true,
        },
        {
          title: i18n.t('static.report.consupmtionqty'),
          type: 'number',
          editable: false,
          readOnly: true,
          mask: "#,##",
        }
      ],
      onload: this.loaded,
      editable: false,
      onselection: this.selected,
      pagination: localStorage.getItem("sesRecordCount"),
      search: true,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: true,
      oneditionend: this.onedit,
      copyCompatibility: true,
      allowExport: false,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      filters: true,
      parseFormulas: true,
      license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var consumptionJexcel = jexcel(document.getElementById("consumptionJexcel"), options);
    this.el = consumptionJexcel;
    this.setState({
        consumptionJexcel: consumptionJexcel,
    })
    }
  }
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    this.state.countryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.programLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    if(this.state.programValues.length == 1) {
      csvRow.push('"' + (i18n.t('static.report.version') + ' : ' + this.state.versionLabel + '"'))
      csvRow.push('')
    }
    this.state.yaxisEquUnitLabel.map(ele =>
      csvRow.push('"' + (i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + (ele).toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.planningUnitLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele).toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.display') + ' : ' + this.state.viewByLabel + '"'))
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.showAggregatedQuantities') + ' : ' + (this.state.aggregateData ? i18n.t("static.program.yes") : i18n.t("static.program.no")) + '"'))
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    var re;
    var A = this.state.aggregateData ? [addDoubleQuoteToRowContent([(i18n.t('static.report.month')).replaceAll(' ', '%20'), i18n.t('static.consumption.consumptionqty').replaceAll(' ', '%20')])] : [addDoubleQuoteToRowContent([(i18n.t('static.dashboard.country')).replaceAll(' ', '%20'), (i18n.t('static.report.month')).replaceAll(' ', '%20'), i18n.t('static.consumption.consumptionqty').replaceAll(' ', '%20')])]
    if(this.state.aggregateData) {
      re = this.state.aggregatedConsumptions
      for (var item = 0; item < re.length; item++) {
        A.push([addDoubleQuoteToRowContent([moment(re[item].consumptionDateString1).format(DATE_FORMAT_CAP_FOUR_DIGITS), roundARU(re[item].planningUnitQty,1)])])
      }
    } else {
      re = this.state.consumptions
      for (var item = 0; item < re.length; item++) {
        A.push([addDoubleQuoteToRowContent([getLabelText(re[item].realmCountry.label), moment(re[item].consumptionDateString1).format(DATE_FORMAT_CAP_FOUR_DIGITS), roundARU(re[item].planningUnitQty,1)])])
      }
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.consumption_') + " (" + (this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] ) + ")" + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to) + ".csv"
    document.body.appendChild(a)
    a.click()
  }
  /**
   * Exports the data to a PDF file.
   */
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
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.report.consumption_') + " (" + (this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] ) + ")", doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
        }
      }
    }
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal')
    doc.setTextColor("#002f6c");
    var y = 110;
    var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    if(this.state.programValues.length == 1) {
      planningText = doc.splitTextToSize(i18n.t('static.report.version') + ' : ' + this.state.versionLabel.join('; '), doc.internal.pageSize.width * 3 / 4);
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;
        }
        doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
        y = y + 10;
      }
    }
    planningText = doc.splitTextToSize(i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + this.state.yaxisEquUnitLabel.join('; '), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    planningText = doc.splitTextToSize(i18n.t('static.common.display') + ' : ' + this.state.viewByLabel.join('; '), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    planningText = doc.splitTextToSize(i18n.t('static.report.showAggregatedQuantities') + ' : ' + (this.state.aggregateData ? i18n.t("static.program.yes") : i18n.t("static.program.no")), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    const title = i18n.t('static.dashboard.globalconsumption');
    var canvas = document.getElementById("cool-canvas");
    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    let startY = y + 10
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
    const headers = this.state.aggregateData ? [[i18n.t('static.report.month'), i18n.t('static.consumption.consumptionqty')]] : [[i18n.t('static.dashboard.country'), i18n.t('static.report.month'), i18n.t('static.consumption.consumptionqty')]]
    const data = this.state.aggregateData ? this.state.aggregatedConsumptions.map(elt => [elt.consumptionDateString, formatter(roundARU(elt.planningUnitQty,1), 0)]) : this.state.consumptions.map(elt => [getLabelText(elt.realmCountry.label, this.state.lang), elt.consumptionDateString, formatter(roundARU(elt.planningUnitQty,1), 0)]);
    doc.addPage()
    startYtable = 80
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: startYtable,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
    };
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.report.consumption_') + " (" + (this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] ) + ")".concat('.pdf'));
  }
  /**
   * Handles the change event for countries.
   * @param {Array} countrysId - An array containing the selected country IDs.
   */
  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      countryValues: countrysId.map(ele => ele),
      countryLabels: countrysId.map(ele => ele.label)
    }, () => {
      this.filterProgram();
    })
  }
  /**
   * Filters programs based on selected countries.
   */
  filterProgram = () => {
    let countryIds = this.state.countryValues.map(ele => ele.value);
    this.setState({
      programLst: [],
      programValues: [],
      programLabels: []
    }, () => {
      if (countryIds.length != 0) {
        let newCountryList = [... new Set(countryIds)];
        DropdownService.getSPProgramWithFilterForMultipleRealmCountryForDropdown(newCountryList)
          .then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = a.code.toUpperCase();
              var itemLabelB = b.code.toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            if (listArray.length > 0) {
              this.setState({
                programLst: listArray
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
          }).catch(
            error => {
              this.setState({
                programLst: [], loading: false
              })
              if (error.message === "Network Error") {
                this.setState({
                  message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                  loading: false
                });
              } else {
                switch (error.response ? error.response.status : "") {
                  case 401:
                    this.props.history.push(`/login/static.message.sessionExpired`)
                    break;
                  case 409:
                    this.setState({
                      message: i18n.t('static.common.accessDenied'),
                      loading: false,
                      color: "#BA0C2F",
                    });
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
      } else {
        this.setState({
          programLst: []
        }, () => {
          this.filterData(this.state.rangeValue)
        });
      }
    })
  }
  /**
   * Handles the change event for program selection.
   * @param {array} programIds - The array of selected program IDs.
   */
  handleChangeProgram(programIds) {
    programIds = programIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      programValues: programIds.map(ele => ele),
      programLabels: programIds.map(ele => ele.label),
      yaxisEquUnit: -1,
      yaxisEquUnitLabel: [i18n.t('static.program.no')],
    }, () => {
      this.filterVersion();
    })
  }
  consolidatedVersionList = (programId) => {
    const { versions } = this.state;
    var verList = versions;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["programData"], "readwrite");
      var program = transaction.objectStore("programData");
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (
            myResult[i].programId == programId
          ) {
            var databytes = CryptoJS.AES.decrypt(
              myResult[i].programData.generalData,
              SECRET_KEY
            );
            var programData = databytes.toString(CryptoJS.enc.Utf8);
            var version = JSON.parse(programData).currentVersion;
            version.versionId = `${version.versionId} (Local)`;
            version.cutOffDate = JSON.parse(programData).cutOffDate != undefined && JSON.parse(programData).cutOffDate != null && JSON.parse(programData).cutOffDate != "" ? JSON.parse(programData).cutOffDate : ""
            // verList.push(version);
          }
        }
        let versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        });
        versionList.reverse();
        this.setState(
          {
            versions: versionList,
            versionId: versionList[0].versionId,
            versionLabel: [versionList[0].versionStatus.id == 2 && versionList[0].versionType.id == 2
              ? versionList[0].versionId + "*"
              : versionList[0].versionId + " " + "("+
            (moment(versionList[0].createdDate).format(`MMM DD YYYY`)) + ")"]
          },
          () => {
            this.filterData(this.state.rangeValue);
            this.getDropdownLists();
          }
        );
      }.bind(this);
    }.bind(this);
  };
  filterVersion = () => {
    let programId = this.state.programValues;
    if (programId.length == 1) {
      programId = programId[0].value
      const program = this.state.programLst.filter(
        (c) => c.id == programId
      );
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === 'Online') {
          this.setState(
            {
              versions: [],
            },
            () => {
              DropdownService.getVersionListForSPProgram(
                programId
              )
                .then((response) => {
                  this.setState(
                    {
                      versions: [],
                    },
                    () => {
                      this.setState(
                        {
                          versions: response.data,
                        },
                        () => {
                          this.consolidatedVersionList(programId);
                        }
                      );
                    }
                  );
                })
                .catch((error) => {
                  this.setState({
                    programs: [],
                    loading: false,
                  });
                  if (error.message === "Network Error") {
                    this.setState({
                      message: API_URL.includes("uat")
                        ? i18n.t("static.common.uatNetworkErrorMessage")
                        : API_URL.includes("demo")
                          ? i18n.t("static.common.demoNetworkErrorMessage")
                          : i18n.t("static.common.prodNetworkErrorMessage"),
                      loading: false,
                    });
                  } else {
                    switch (error.response ? error.response.status : "") {
                      case 401:
                        this.props.history.push(
                          `/login/static.message.sessionExpired`
                        );
                        break;
                      case 409:
                        this.setState({
                          message: i18n.t('static.common.accessDenied'),
                          loading: false,
                          color: "#BA0C2F",
                        });
                        break;
                      case 403:
                        this.props.history.push(`/accessDenied`);
                        break;
                      case 500:
                      case 404:
                      case 406:
                        this.setState({
                          message: i18n.t(error.response.data.messageCode, {
                            entityname: i18n.t("static.dashboard.program"),
                          }),
                          loading: false,
                        });
                        break;
                      case 412:
                        this.setState({
                          message: i18n.t(error.response.data.messageCode, {
                            entityname: i18n.t("static.dashboard.program"),
                          }),
                          loading: false,
                        });
                        break;
                      default:
                        this.setState({
                          message: "static.unkownError",
                          loading: false,
                        });
                        break;
                    }
                  }
                });
            }
          );
        } else {
          this.setState(
            {
              versions: [],
            },
            () => {
              this.consolidatedVersionList(programId);
            }
          );
        }
      } else {
        this.setState({
          versions: [],
        });
      }
    } else {
      this.setState({
        versions: [],
      }, () => {
        this.getDropdownLists();
      });
    }
  };
  setVersionId(event) {
    var versionLabel = document.getElementById("versionId").selectedOptions[0].text.toString()
    this.setState(
      {
        versionLabel: versionLabel,
        versionId: event.target.value,
      },
      () => {
        if (this.state.versionId != "")
          this.getDropdownLists();
      }
    );
  }
  /**
   * Handles the change event for planning units.
   * @param {Array} planningUnitIds - An array containing the selected planning unit IDs.
   */
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
  /**
   * Handles the change event for display options.
   */
  handleDisplayChange() {
    var viewByLabel = document.getElementById("viewById").selectedOptions[0].text.toString()
    this.setState({
      viewByLabel: [viewByLabel]
    }, () => {
      this.filterData(this.state.rangeValue)
    })
  }
  toggleEu() {
    this.setState({
        popoverOpen: !this.state.popoverOpen,
    });
  }
  /**
   * Filters data based on selected parameters and updates component state accordingly.
   */
  filterData(rangeValue) {
    setTimeout('', 10000);
    let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
    let planningUnitIds = this.state.planningUnitId.length == this.state.planningUnits.length ? [] : this.state.planningUnitId.map(ele => (ele.value).toString());
    let programIds = this.state.programValues.length == this.state.programLst.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
    let viewById = document.getElementById("viewById").value;
    let realmId = AuthenticationService.getRealmId()
    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
    let versionId = this.state.programValues.length == 1 ? this.state.versionId : 0;
    if (realmId > 0 && this.state.countryValues.length > 0 && planningUnitIds.length > 0 && this.state.programValues.length > 0) {
      this.setState({ loading: true })
      var inputjson = {
        "realmId": realmId,
        "realmCountryIds": CountryIds,
        "programIds": programIds,
        "equivalencyUnitId": this.state.yaxisEquUnit == -1 ? 0 : this.state.yaxisEquUnit,
        "planningUnitIds": planningUnitIds,
        "startDate": startDate,
        "stopDate": stopDate,
        "viewBy": viewById,
        "versionId": versionId
      }
      ReportService.getGlobalConsumptiondata(inputjson)
        .then(response => {
          let tempConsumptionData = response.data.dataList;
          var consumptions = [];
          const aggregatedConsumptions = [];
          const aggregationMap = {};
          for (var i = 0; i < tempConsumptionData.length; i++) {
            let countryConsumption = Object.values(tempConsumptionData[i].consumption);
            for (var j = 0; j < countryConsumption.length; j++) {
              let planningUnitQty =
                countryConsumption[j].actualConsumption == 0
                  ? countryConsumption[j].forecastedConsumption
                  : countryConsumption[j].actualConsumption;

              let consumptionDateString = moment(
                tempConsumptionData[i].transDate,
                'YYYY-MM-dd'
              ).format('MMM YY');
              
              let json = {
                "realmCountry": countryConsumption[j].label,
                "consumptionDate": tempConsumptionData[i].transDate,
                "planningUnitQty": ((countryConsumption[j].actualConsumption == 0 ? (countryConsumption[j].forecastedConsumption) : (countryConsumption[j].actualConsumption))),
                "consumptionDateString": moment(tempConsumptionData[i].transDate, 'YYYY-MM-dd').format('MMM YY'),
                "consumptionDateString1": moment(tempConsumptionData[i].transDate, 'yyyy-MM-dd')
              }
              consumptions.push(json);

              if (!aggregationMap[consumptionDateString]) {
                aggregationMap[consumptionDateString] = {
                  "realmCountry": countryConsumption[j].label,
                  "consumptionDate": tempConsumptionData[i].transDate,
                  "planningUnitQty": 0,
                  "consumptionDateString": moment(tempConsumptionData[i].transDate, 'YYYY-MM-dd').format('MMM YY'),
                  "consumptionDateString1": moment(tempConsumptionData[i].transDate, 'yyyy-MM-dd')
                };
                aggregatedConsumptions.push(aggregationMap[consumptionDateString]);
              }
              aggregationMap[consumptionDateString].planningUnitQty += planningUnitQty;
            }
          }
          this.setState({
            consumptions: consumptions,
            aggregatedConsumptions: aggregatedConsumptions,
            message: '',
            loading: false
          }, () => {
            this.buildConsumptionJexcel();
          });
        }).catch(
          error => {
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                loading: false
              });
            } else {
              switch (error.response ? error.response.status : "") {
                case 401:
                  this.props.history.push(`/login/static.message.sessionExpired`)
                  break;
                case 409:
                  this.setState({
                    message: i18n.t('static.common.accessDenied'),
                    loading: false,
                    color: "#BA0C2F",
                  });
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
      this.setState({ message: i18n.t('static.common.realmtext'), consumptions: [] }, () => { this.buildConsumptionJexcel() });
    } else if (this.state.countryValues.length == 0) {
      this.setState({ message: i18n.t('static.program.validcountrytext'), consumptions: [] }, () => { this.buildConsumptionJexcel() });
    } else if (this.state.programValues.length == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] }, () => { this.buildConsumptionJexcel() });
    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] }, () => { this.buildConsumptionJexcel() });
    }
  }
  /**
   * Retrieves the list of countries based on the realm ID and updates the state with the list.
   */
  getCountrys() {
    this.setState({ loading: true })
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getRealmCountryDropdownList(realmId)
        .then(response => {
          if (response.status == 200) {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              countrys: listArray,
              loading: false
            }, () => { })
          } else {
            this.setState({ message: response.data.messageCode, loading: false },
              () => { this.hideSecondComponent(); })
          }
        })
        .catch(
          error => {
            this.setState({
              countrys: []
            })
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                loading: false
              });
            } else {
              switch (error.response ? error.response.status : "") {
                case 401:
                  this.props.history.push(`/login/static.message.sessionExpired`)
                  break;
                case 409:
                  this.setState({
                    message: i18n.t('static.common.accessDenied'),
                    loading: false,
                    color: "#BA0C2F",
                  });
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
            var itemLabelA = a.name.toUpperCase();
            var itemLabelB = b.name.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            countrys: proList,
            loading: false
          })
        }.bind(this);
      }
    }
    this.filterData(this.state.rangeValue);
  }
  /**
   * Retrieves the list of planning units for a selected programs.
   */
  getDropdownLists() {
    var json = {
      programIds: this.state.programValues.map(ele => ele.value),
      onlyAllowPuPresentAcrossAllPrograms: this.state.onlyShowAllPUs
    }
    ReportService.getDropdownListByProgramIds(json).then(response => {
      this.setState({
        equivalencyUnitList: response.data.equivalencyUnitList,
        planningUnitListAll: response.data.planningUnitList,
        planningUnitList: response.data.planningUnitList,
        planningUnitId: [],
        consumptions: []
      }, () => {
        this.buildConsumptionJexcel();
        if (this.state.yaxisEquUnit != -1 && this.state.programValues.length > 0) {
          var validFu = this.state.equivalencyUnitList.filter(x => x.id == this.state.yaxisEquUnit)[0].forecastingUnitIds;
          var planningUnitList = this.state.planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
          this.setState({
            planningUnitList: planningUnitList
          })
        }
      })
    }).catch(
      error => {
        this.setState({
          consumptions: [], loading: false
        }, () => { this.buildConsumptionJexcel() })
        if (error.message === "Network Error") {
          this.setState({
            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
            loading: false
          });
        } else {
          switch (error.response ? error.response.status : "") {
            case 401:
              this.props.history.push(`/login/static.message.sessionExpired`)
              break;
            case 409:
              this.setState({
                message: i18n.t('static.common.accessDenied'),
                loading: false,
                color: "#BA0C2F",
              });
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
  yAxisChange(e) {
    var yaxisEquUnit = e.target.value;
    var planningUnitList = this.state.planningUnitListAll;
    var yaxisEquUnitLabel = document.getElementById("yaxisEquUnit").selectedOptions[0].text.toString()
    if (yaxisEquUnit != -1) {
      var validFu = this.state.equivalencyUnitList.filter(x => x.id == e.target.value)[0].forecastingUnitIds;
      planningUnitList = planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
    }
    this.setState({
      yaxisEquUnit: yaxisEquUnit,
      planningUnitList: planningUnitList,
      yaxisEquUnitLabel: [yaxisEquUnitLabel],
      planningUnitId: [],
      consumptions: [],
      onlyShowAllPUs: false
    }, () => {
      this.buildConsumptionJexcel();
    })
  }
  setOnlyShowAllPUs(e) {
    var checked = e.target.checked;
    this.setState({
      onlyShowAllPUs: checked,
    }, () => {
      this.getDropdownLists();
    })
  }
  setAggregateData(e) {
    var checked = e.target.checked;
    this.setState({
      aggregateData: checked
    }, () => {
      this.buildConsumptionJexcel();
    })
  }
  handleBlur = (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    this.filterData(this.state.rangeValue);
  }
};
  setPlanningUnit(e) {
    if (this.state.yaxisEquUnit == -1) {
      var selectedText = e.map(item => item.label);
      var tempPUList = e.filter(puItem => !this.state.planningUnitId.map(ele => ele).includes(puItem));
      var planningUnitIds = e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempPUList; 
      this.setState({
        planningUnitId: planningUnitIds,
        planningUnitLabels: planningUnitIds.map(ele => ele.label),
        planningUnitIdExport: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempPUList,
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false,
        planningUnitDetails: "",
        planningUnitDetailsExport: ""
      }, () => {
        // document.getElementById("consumptionAdjusted").checked = false;
        this.filterData(this.state.rangeValue);
      })
    } else {
      if (this.state.yaxisEquUnit > 0) {
        var planningUnitIds = e.map(ele => ele)
        this.setState({
          planningUnitId: planningUnitIds,
          planningUnitLabels: planningUnitIds.map(ele => ele.label),
          planningUnitIdExport: e.map(ele => ele),
          show: false,
          dataList: [],
          consumptionAdjForStockOutId: false,
          loading: false
        }, () => {
          if (this.state.planningUnitId.length > 0) {
            // this.filterData(this.state.rangeValue);
          } else {
            this.setState({
              consumptions: [],
            }, () => { this.buildConsumptionJexcel() })
          }
        })
      }
    }
  }
  /**
    * Sets the planning unit based on the provided event data.
    * @param {Object} e - Event data containing planning unit information.
    */
  setPlanningUnitSingle(e) {
    var planningUnitId = e.target.value;
    if (planningUnitId != "") {
      var planningUnitLabel = document.getElementById("planningUnitId").selectedOptions[0].text.toString()
      var planningUnit = [{
        value: Number(planningUnitId),
        label: planningUnitLabel
      }]
      this.setState({
        planningUnitId: planningUnit,
        planningUnitLabels: [planningUnitLabel],
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false
      }, () => {
        if (this.state.programValues.length == 1) {
          // this.getPlanningUnitByProgramIdAndPlanningUnitId(this.state.programValues[0].value, planningUnitId, false);
        }
        // document.getElementById("consumptionAdjusted").checked = false;
        this.filterData(this.state.rangeValue);
      })
    } else {
      this.setState({
        planningUnitId: [],
        consumptions: []
      }, () => { this.buildConsumptionJexcel() })
    }
  }
  /**
   * Calls the get countrys function on page load
   */
  componentDidMount() {
    // Detect initial theme
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    this.setState({ isDarkMode });

    // Listening for theme changes
    const observer = new MutationObserver(() => {
      const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      this.setState({ isDarkMode: updatedDarkMode });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });


    this.getCountrys();
  }
  /**
   * Toggles the value of the 'show' state variable.
   */
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }), () => { this.buildConsumptionJexcel() });
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value })
    this.filterData(value);
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
  /**
   * Renders the Global Consumption report table.
   * @returns {JSX.Element} - Global Consumption report table.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { isDarkMode } = this.state;
    const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
    const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
    const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

    const options = {
      title: {
        display: true,
        text: i18n.t('static.report.consumption_') + " (" + (this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] ) + ")",
        fontColor: fontColor
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: i18n.t('static.report.consupmtionqty'),
            fontColor: fontColor
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
            fontColor: fontColor,
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
          },
          gridLines: {
            color: gridLineColor,
            drawBorder: true,
            lineWidth: 0,
            zeroLineColor: gridLineColor
          }
        }],
        xAxes: [{
          ticks: {
            fontColor: fontColor
          },
          gridLines: {
            color: gridLineColor,
            drawBorder: true,
            lineWidth: 0,
            zeroLineColor: gridLineColor
          }
        }]
      },
      annotation: {
        annotations: [{
          type: 'triangle',
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
          fontColor: fontColor
        }
      }
    }
    const { programLst } = this.state;
    let programList = [];
    programList = programLst.length > 0
      && programLst.map((item, i) => {
        return (
          { label: item.code, value: item.id }
        )
      }, this);
    const { countrys } = this.state;
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);
    const { versions } = this.state;
    let versionList =
      versions.length > 0 &&
      versions.map((item, i) => {
        return (
          <option key={i} value={item.versionId}>
            {item.versionStatus.id == 2 && item.versionType.id == 2
              ? item.versionId + "*"
              : item.versionId}{" "}
            ({moment(item.createdDate).format(`MMM DD YYYY`)}) {item.cutOffDate != undefined && item.cutOffDate != null && item.cutOffDate != '' ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(item.cutOffDate).format('MMM YYYY') + ")" : ""}
          </option>
        );
      }, this);
    const { equivalencyUnitList } = this.state;
    let equivalencyUnitList1 = equivalencyUnitList.length > 0
      && equivalencyUnitList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.label.label_en}
          </option>
        )
      }, this);
    const { planningUnitList, lang } = this.state;
    let puList = planningUnitList.length > 0 && planningUnitList.sort(function (a, b) {
      a = getLabelText(a.label, lang).toLowerCase();
      b = getLabelText(b.label, lang).toLowerCase();
      return a < b ? -1 : a > b ? 1 : 0;
    }).map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang) + " | " + item.id, value: item.id })
    }, this);

    const lightModeColors = [
      '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
      '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
      '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
      '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
      '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
      '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
      '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
      '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
      '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
      '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
    ]
    const darkModeColors = [
      '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
      '#EEE4B1', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9',
      '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
      '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
      '#EEE4B1', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9',
      '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
      '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
    ]
    const backgroundColor1 = isDarkMode ? darkModeColors : lightModeColors;
    let localCountryList = [...new Set(this.state.consumptions.map(ele => (getLabelText(ele.realmCountry.label, this.state.lang))))];
    let consumptionSummerydata = [];
    var mainData = this.state.consumptions;
    mainData = mainData.sort(function (a, b) {
      return new Date(a.consumptionDate) - new Date(b.consumptionDate);
    });
    let dateArray = [...new Set(mainData.map(ele => (moment(ele.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'))))]
    for (var i = 0; i < localCountryList.length; i++) {
      let tempdata = [];
      for (var j = 0; j < dateArray.length; j++) {
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
    const bar = {
      labels: [...new Set(this.state.consumptions.map(ele => (dateFormatterLanguage(ele.consumptionDateString1))))],
      datasets: consumptionSummerydata.map((item, index) => ({ stack: 1, label: localCountryList[index], data: item, backgroundColor: backgroundColor1[index] })),
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
            {this.state.consumptions.length > 0 && <div className="card-header-actions">
              <a className="card-header-action">
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => {
                  var curTheme = localStorage.getItem("theme");
                  if (curTheme == "dark") {
                    this.setState({
                      isDarkMode: false
                    }, () => {
                      setTimeout(() => {
                        this.exportPDF();
                        if (curTheme == "dark") {
                          this.setState({
                            isDarkMode: true
                          })
                        }
                      }, 0)
                    })
                  } else {
                    this.exportPDF();
                  }
                }}

                />
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
                          onDismiss={this.handleRangeDissmis}
                        >
                          <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                        </Picker>
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
                          filterOptions={filterOptions}
                          disabled={this.state.loading}
                          overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                          selectSomeItems: i18n.t('static.common.select')}}
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
                        filterOptions={filterOptions}
                        disabled={this.state.loading}
                        overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                        selectSomeItems: i18n.t('static.common.select')}}
                      />
                      {!!this.props.error &&
                        this.props.touched && (
                          <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                        )}
                    </FormGroup>
                    {this.state.programValues.length == 1 && <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                      <div className="controls">
                        <InputGroup>
                          <Input
                            type="select"
                            name="versionId"
                            id="versionId"
                            bsSize="sm"
                            onChange={(e) => {
                              this.setVersionId(e);
                            }}
                            value={this.state.versionId}
                          >
                            <option value="0">
                              {i18n.t("static.common.select")}
                            </option>
                            {versionList}
                          </Input>
                        </InputGroup>
                      </div>
                    </FormGroup>}
                    <FormGroup className="col-md-2" id="equivelencyUnitDiv">
                      <Label htmlFor="appendedInputButton">{i18n.t("static.forecastReport.yAxisInEquivalencyUnit")}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="yaxisEquUnit"
                            id="yaxisEquUnit"
                            bsSize="sm"
                            value={this.state.yaxisEquUnit}
                            onChange={(e) => { this.yAxisChange(e); }}
                          >
                            <option value="-1">{i18n.t('static.program.no')}</option>
                            {equivalencyUnitList1}
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup>

                    <FormGroup className="col-md-4" >
                      <Label
                        className="form-check-label"
                        // check htmlFor="inline-radio1"
                        title={i18n.t('static.report.planningUnit')}>
                        {i18n.t('static.report.planningUnit')}
                      </Label>
                      <FormGroup id="planningUnitDiv" style={{ "marginTop": "8px" }}>
                        <div className="controls">
                          {this.state.yaxisEquUnit != -1 && <div onBlur={this.handleBlur}><MultiSelect
                            bsSize="sm"
                            name="planningUnitId"
                            id="planningUnitId"
                            filterOptions={filterOptions}
                            value={this.state.planningUnitId}
                            onChange={(e) => { this.setPlanningUnit(e); }}
                            options={puList && puList.length > 0 ? puList : []}
                            hasSelectAll={this.state.yaxisEquUnit == -1 ? false : true}
                            showCheckboxes={this.state.yaxisEquUnit == -1 ? false : true}
                          /></div>}
                          {this.state.yaxisEquUnit == -1 && <InputGroup>
                            <Input
                              type="select"
                              name="planningUnitId"
                              id="planningUnitId"
                              value={this.state.planningUnitId.length > 0 ? this.state.planningUnitId[0].value : ""}
                              onChange={(e) => { this.setPlanningUnitSingle(e); }}
                              bsSize="sm"
                            >
                              <option value="">{i18n.t('static.common.select')}</option>
                              {puList.length > 0
                                && puList.map((item, i) => {
                                  return (
                                    <option key={i} value={item.value}>
                                      {item.label}
                                    </option>
                                  )
                                }, this)}
                            </Input>
                          </InputGroup>}
                        </div>
                      </FormGroup>
                      {this.state.programValues.length > 1 && <FormGroup style={{ "marginTop": "-10px" }}>
                        <div className={this.state.yaxisEquUnit != 1 ? "col-md-12" : "col-md-12"} style={{ "padding-left": "23px", "marginTop": "-25px !important" }}>
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            id="onlyShowAllPUs"
                            name="onlyShowAllPUs"
                            checked={this.state.onlyShowAllPUs}
                            onClick={(e) => { this.setOnlyShowAllPUs(e); }}
                            style={{ marginTop: '2px' }}
                          />
                          <Label
                            className="form-check-label"
                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                            {i18n.t('static.consumptionGlobal.onlyShowPUsThatArePartOfAllPrograms')}
                          </Label>
                        </div>
                      </FormGroup>}
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label className="form-check-label">{i18n.t('static.common.display')}</Label>
                      <FormGroup id="planningUnitDiv" style={{ "marginTop": "8px" }}>
                        <div className="controls">
                          <InputGroup>
                            <Input
                              type="select"
                              name="viewById"
                              id="viewById"
                              bsSize="sm"
                              onChange={this.handleDisplayChange}
                            >
                              <option value="1">{i18n.t('static.report.country')}</option>
                              <option value="2">{i18n.t('static.consumption.program')}</option>
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <div>
                          <Popover placement="top" isOpen={this.state.popoverOpen} target="Popover1" trigger="hover" toggle={this.toggleEu}>
                              <PopoverBody>{i18n.t('static.tooltip.showAggregatedQuantities')}</PopoverBody>
                          </Popover>
                      </div>
                      <FormGroup style={{ "marginTop": "-10px" }}>
                        <div className={"col-md-12"} style={{ "padding-left": "23px", "marginTop": "-25px !important" }}>
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            id="aggregateData"
                            name="aggregateData"
                            checked={this.state.aggregateData}
                            onClick={(e) => { this.setAggregateData(e); }}
                            style={{ marginTop: '2px' }}
                          />
                          <Label
                            className="form-check-label"
                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                            {i18n.t('static.report.showAggregatedQuantities')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={this.toggleEu} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                          </Label>
                        </div>
                      </FormGroup>
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
                      <div className="col-md-12 p-0" >
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
                    <div className="col-md-12 mt-lg-2">
                      {this.state.show && this.state.consumptions.length > 0 &&
                       <div className='consumptionDataEntryTable'>
                        <div id="consumptionJexcel" className='jexcelremoveReadonlybackground' style={{ padding: '2px 8px' }}></div>
                      </div>}
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