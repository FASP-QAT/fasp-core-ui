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
import {
  Card,
  CardBody,
  Col,
  Form,
  FormGroup, Input, InputGroup,
  Label,
  Table
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, dateFormatterLanguage, filterOptions, formatter, makeText, roundN2 } from '../../CommonComponent/JavascriptCommonFunctions';
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
      isDarkMode:false,
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
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      loading: true,
      programLst: []
    };
    this.getCountrys = this.getCountrys.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeProgram = this.handleChangeProgram.bind(this)
    this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
    this.handleDisplayChange = this.handleDisplayChange.bind(this)
    this.filterProgram = this.filterProgram.bind(this)
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
    this.state.planningUnitValues.map(ele =>
      csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.label).toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('"' + ((i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    var re;
    var A = [addDoubleQuoteToRowContent([(i18n.t('static.dashboard.country')).replaceAll(' ', '%20'), (i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.consumption.consumptionqty') + ' ' + i18n.t('static.report.inmillions')).replaceAll(' ', '%20')])]
    re = this.state.consumptions
    for (var item = 0; item < re.length; item++) {
      A.push([addDoubleQuoteToRowContent([getLabelText(re[item].realmCountry.label), moment(re[item].consumptionDateString1).format(DATE_FORMAT_CAP_FOUR_DIGITS), re[item].planningUnitQty])])
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.globalconsumption') + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to) + ".csv"
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
        doc.text(i18n.t('static.dashboard.globalconsumption'), doc.internal.pageSize.width / 2, 60, {
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
    doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, y, {
      align: 'left'
    })
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
    const headers = [[i18n.t('static.dashboard.country'), i18n.t('static.report.month'), i18n.t('static.consumption.consumptionqty') + ' ' + i18n.t('static.report.inmillions')]]
    const data = this.state.consumptions.map(elt => [getLabelText(elt.realmCountry.label, this.state.lang), elt.consumptionDateString, formatter(elt.planningUnitQty,0)]);
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
    doc.save(i18n.t('static.dashboard.globalconsumption').concat('.pdf'));
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
        DropdownService.getProgramWithFilterForMultipleRealmCountryForDropdown(PROGRAM_TYPE_SUPPLY_PLAN, newCountryList)
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
      programLabels: programIds.map(ele => ele.label)
    }, () => {
      this.getPlanningUnit();
    })
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
    this.filterData(this.state.rangeValue)
  }
  /**
   * Filters data based on selected parameters and updates component state accordingly.
   */
  filterData(rangeValue) {
    setTimeout('', 10000);
    let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
    let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
    let programIds = this.state.programValues.length == this.state.programLst.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
    let viewById = document.getElementById("viewById").value;
    let realmId = AuthenticationService.getRealmId()
    let useApprovedVersion = document.getElementById("includeApprovedVersions").value
    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
    if (realmId > 0 && this.state.countryValues.length > 0 && this.state.planningUnitValues.length > 0 && this.state.programValues.length > 0) {
      this.setState({ loading: true })
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
      ReportService.getGlobalConsumptiondata(inputjson)
        .then(response => {
          let tempConsumptionData = response.data;
          var consumptions = [];
          for (var i = 0; i < tempConsumptionData.length; i++) {
            let countryConsumption = Object.values(tempConsumptionData[i].countryConsumption);
            for (var j = 0; j < countryConsumption.length; j++) {
              let json = {
                "realmCountry": countryConsumption[j].country,
                "consumptionDate": tempConsumptionData[i].transDate,
                "planningUnitQty": roundN2((countryConsumption[j].actualConsumption == 0 ? (countryConsumption[j].forecastedConsumption / 1000000) : (countryConsumption[j].actualConsumption / 1000000))),
                "consumptionDateString": moment(tempConsumptionData[i].transDate, 'YYYY-MM-dd').format('MMM YY'),
                "consumptionDateString1": moment(tempConsumptionData[i].transDate, 'yyyy-MM-dd')
              }
              consumptions.push(json);
            }
          }
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
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
  getPlanningUnit() {
    this.setState({ loading: true })
    let programValues = this.state.programValues.map(c => c.value);
    this.setState({
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: []
    }, () => {
      if (programValues.length > 0) {
        var programJson = {
          tracerCategoryIds: [],
          programIds: programValues
        }
        DropdownService.getProgramPlanningUnitDropdownList(programJson).then(response => {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            planningUnits: listArray, loading: false
          }, () => {
            this.filterData(this.state.rangeValue)
          })
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
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
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

    const { isDarkMode } = this.state;
// const colors = isDarkMode ? darkModeColors : lightModeColors;
const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
// const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

    const options = {
      title: {
        display: true,
        text: i18n.t('static.dashboard.globalconsumption'),
        fontColor:fontColor
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: i18n.t('static.report.consupmtionqty') + i18n.t('static.report.inmillions'),
            fontColor:fontColor
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
            fontColor:fontColor,
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
            fontColor:fontColor
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
          fontColor:fontColor
        }
      }
    }
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
          { label: item.code, value: item.id }
        )
      }, this);
    const { countrys } = this.state;
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);
    const backgroundColor = [
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
                    <FormGroup className="col-sm-3" id="hideDiv">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <MultiSelect
                          name="planningUnitId"
                          id="planningUnitId"
                          bsSize="sm"
                          value={this.state.planningUnitValues}
                          onChange={(e) => { this.handlePlanningUnitChange(e) }}
                          options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                          filterOptions={filterOptions}
                          disabled={this.state.loading}
                          overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                          selectSomeItems: i18n.t('static.common.select')}}
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
                        <div className="fixTableHead">
                          <Table className="table-striped  table-fixed table-bordered text-center">
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
                                      {formatter(this.state.consumptions[idx].planningUnitQty,0)}
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
