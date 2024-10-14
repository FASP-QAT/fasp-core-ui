import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
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
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, dateFormatterLanguage, formatter, makeText, round } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
/**
 * Component for Consumption Report.
 */
class Consumption extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      sortType: 'asc',
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      programs: [],
      offlinePrograms: [],
      planningUnits: [],
      versions: [],
      consumptions: [],
      offlineConsumptionList: [],
      offlinePlanningUnitList: [],
      productCategories: [],
      offlineProductCategoryList: [],
      show: false,
      message: '',
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      loading: true,
      programId: '',
      versionId: '',
      planningUnitLabel: '',
      forecastUnitLabel: '',
      viewByIdState: 0
    };
    this.getPrograms = this.getPrograms.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.storeProduct = this.storeProduct.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
  }
  /**
   * Retrieves and stores product data based on the selected planning unit.
   */
  storeProduct() {
    let productId = document.getElementById("planningUnitId").value;
    if (productId != 0) {
      if (localStorage.getItem("sessionType") === 'Online') {
        RealmService.getRealmListAll()
          .then(response => {
            if (response.status == 200) {
              this.setState({
                realmId: response.data[0].realmId,
              })
              PlanningUnitService.getPlanningUnitById(productId).then(response => {
                this.setState({
                  multiplier: response.data.multiplier,
                  planningUnitLabel: document.getElementById("planningUnitId").selectedOptions[0].text,
                  forecastUnitLabel: getLabelText(response.data.forecastingUnit.label, this.state.lang)
                },
                  () => {
                    this.filterData()
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
            } else {
              this.setState({
                message: response.data.messageCode
              },
                () => {
                })
            }
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
      } else {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var planningunitTransaction = db1.transaction(['planningUnit'], 'readwrite');
          var planningunitOs = planningunitTransaction.objectStore('planningUnit');
          var planningunitRequest = planningunitOs.getAll();
          planningunitRequest.onerror = function (event) {
          };
          planningunitRequest.onsuccess = function (e) {
            var myResult = [];
            myResult = planningunitRequest.result;
            let productFilter = myResult.filter(c => (c.planningUnitId == productId));
            this.setState({
              multiplier: productFilter[0].multiplier,
              planningUnitLabel: document.getElementById("planningUnitId").selectedOptions[0].text,
              forecastUnitLabel: getLabelText(productFilter[0].forecastUnit.label, this.state.lang)
            },
              () => {
                this.filterData()
              })
          }.bind(this);
        }.bind(this)
      }
    }
  }
  /**
   * Toggles the value of the 'show' state variable.
   */
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (document.getElementById("planningUnitId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.display') + ' : ' + (document.getElementById("viewById").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('')
    var re;
    if (localStorage.getItem("sessionType") === 'Online') {
      re = this.state.consumptions
    } else {
      re = this.state.offlineConsumptionList
    }
    let head = [];
    let row1 = [];
    let row2 = [];
    if (localStorage.getItem("sessionType") === 'Online') {
      let consumptionArray = this.state.consumptions;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format(DATE_FORMAT_CAP_FOUR_DIGITS)).replaceAll(' ', '%20'));
        row1.push(consumptionArray[i].forecastedConsumption == null ? '' : consumptionArray[i].forecastedConsumption);
        row2.push(consumptionArray[i].actualConsumption == null ? '' : consumptionArray[i].actualConsumption);
      }
    } else {
      let consumptionArray = this.state.offlineConsumptionList;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push(((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format(DATE_FORMAT_CAP))).replaceAll(' ', '%20'));
        row1.push(consumptionArray[i].forecastedConsumption == null ? '' : consumptionArray[i].forecastedConsumption);
        row2.push(consumptionArray[i].actualConsumption == null ? '' : consumptionArray[i].actualConsumption);
      }
    }
    var A = [];
    A[0] = addDoubleQuoteToRowContent(head);
    A[1] = addDoubleQuoteToRowContent(row1);
    A[2] = addDoubleQuoteToRowContent(row2);
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.consumption_') + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to) + ".csv"
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
        doc.text(i18n.t('static.dashboard.consumption'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
          doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
            align: 'left'
          })
          doc.text(i18n.t('static.common.display') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
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
    var canvas = document.getElementById("cool-canvas");
    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var height = doc.internal.pageSize.height;
    doc.addImage(canvasImg, 'png', 50, 220, 750, 260, 'CANVAS');
    const headers = [[i18n.t('static.report.consumptionDate'),
    i18n.t('static.report.forecasted'),
    i18n.t('static.report.actual')]];
    const data = localStorage.getItem("sessionType") === 'Online' ? this.state.consumptions.map(elt => [moment(elt.transDate, 'yyyy-MM-dd').format('MMM YYYY'), formatter(elt.forecastedConsumption, 0), formatter(elt.actualConsumption, 0)]) : this.state.offlineConsumptionList.map(elt => [elt.transDate, formatter(elt.forecastedConsumption, 0), formatter(elt.actualConsumption, 0)]);
    let head = [];
    let head1 = [];
    let row1 = [];
    let row2 = [];
    let row3 = [];
    if (localStorage.getItem("sessionType") === 'Online') {
      let consumptionArray = this.state.consumptions;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format('MMM YYYY')));
        row1.push(formatter(consumptionArray[i].forecastedConsumption, 0));
        row2.push(formatter(consumptionArray[i].actualConsumption, 0));
      }
    } else {
      let consumptionArray = this.state.offlineConsumptionList;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format('MMM YYYY')));
        row1.push(formatter(consumptionArray[i].forecastedConsumption, 0));
        row2.push(formatter(consumptionArray[i].actualConsumption, 0));
      }
    }
    head1[0] = head;
    row3[0] = row1;
    row3[1] = row2;
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: height,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
    };
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.consumption').concat('.pdf'));
  }
  /**
   * Fetches and filters data based on selected program, version, planning unit, and date range.
   */
  filterData() {
    let programId = document.getElementById("programId").value;
    let viewById = document.getElementById("viewById").value;
    let versionId = document.getElementById("versionId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
    if (planningUnitId > 0 && programId > 0 && versionId != 0) {
      if (versionId.includes('Local')) {
        this.setState({ loading: true })
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            loading: false
          })
        }.bind(this);
        openRequest.onsuccess = function (e) {
          var version = (versionId.split('(')[0]).trim()
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`
          db1 = e.target.result;
          var programDataTransaction = db1.transaction(['programData'], 'readwrite');
          var programDataOs = programDataTransaction.objectStore('programData');
          var programRequest = programDataOs.get(program);
          programRequest.onerror = function (event) {
            this.setState({
              message: i18n.t('static.program.errortext'),
              loading: false
            })
          }.bind(this);
          programRequest.onsuccess = function (e) {
            var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
            var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
            var programJson = {}
            if (planningUnitDataIndex != -1) {
              var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitId))[0];
              var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
              var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
              programJson = JSON.parse(programData);
            } else {
              programJson = {
                consumptionList: [],
                inventoryList: [],
                shipmentList: [],
                batchInfoList: [],
                supplyPlan: []
              }
            }
            var offlineConsumptionList = (programJson.consumptionList);
            const activeFilter = offlineConsumptionList.filter(c => (c.active == true || c.active == "true"));
            const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
            const dateFilter = planningUnitFilter.filter(c => moment(c.consumptionDate).isBetween(startDate, endDate, null, '[)'))
            const flagTrue = dateFilter.filter(c => c.actualFlag == true);
            const flagFalse = dateFilter.filter(c => c.actualFlag == false);
            let resultTrue = Object.values(flagTrue.reduce((a, { consumptionId, consumptionDate, actualFlag, consumptionQty }) => {
              if (!a[consumptionDate])
                a[consumptionDate] = Object.assign({}, { consumptionId, consumptionDate, actualFlag, consumptionQty });
              else
                a[consumptionDate].consumptionQty += Number(consumptionQty);
              return a;
            }, {}));
            let resultFalse = Object.values(flagFalse.reduce((a, { consumptionId, consumptionDate, actualFlag, consumptionQty }) => {
              if (!a[consumptionDate])
                a[consumptionDate] = Object.assign({}, { consumptionId, consumptionDate, actualFlag, consumptionQty });
              else
                a[consumptionDate].consumptionQty += Number(consumptionQty);
              return a;
            }, {}));
            let result = resultTrue.concat(resultFalse);
            const sorted = result.sort((a, b) => {
              var dateA = new Date(a.consumptionDate).getTime();
              var dateB = new Date(b.consumptionDate).getTime();
              return dateA > dateB ? 1 : -1;
            });
            let dateArray = [...new Set(sorted.map(ele => (moment(ele.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'))))]
            let finalOfflineConsumption = [];
            for (var j = 0; j < dateArray.length; j++) {
              let objActual = sorted.filter(c => (moment(dateArray[j], 'MM-YYYY').isSame(moment(moment(c.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'), 'MM-YYYY'))) != 0 && c.actualFlag == true);
              let objForecast = sorted.filter(c => (moment(dateArray[j], 'MM-YYYY').isSame(moment(moment(c.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'), 'MM-YYYY'))) != 0 && c.actualFlag == false);
              let actualValue = 0;
              let forecastValue = 0;
              let transDate = '';
              if (objActual.length > 0) {
                actualValue = round(objActual[0].consumptionQty);
                transDate = objActual[0].consumptionDate;
              }
              if (objForecast.length > 0) {
                forecastValue = round(objForecast[0].consumptionQty);
                transDate = objForecast[0].consumptionDate;
              }
              if (viewById == 2) {
                let json = {
                  "transDate": transDate,
                  "actualConsumption": actualValue * this.state.multiplier,
                  "forecastedConsumption": forecastValue * this.state.multiplier
                }
                finalOfflineConsumption.push(json);
              } else {
                let json = {
                  "transDate": transDate,
                  "actualConsumption": round(actualValue),
                  "forecastedConsumption": round(forecastValue)
                }
                finalOfflineConsumption.push(json);
              }
            }
            this.setState({
              offlineConsumptionList: finalOfflineConsumption,
              consumptions: finalOfflineConsumption,
              message: '',
              loading: false,
              viewByIdState: viewById
            })
          }.bind(this)
        }.bind(this)
      } else {
        this.setState({
          message: '',
          loading: true
        })
        var inputjson = {
          startDate: startDate,
          stopDate: endDate,
          programId: programId,
          versionId: versionId,
          planningUnitId: planningUnitId,
          reportView: viewById
        }
        ProductService.getConsumptionData(inputjson)
          .then(response => {
            this.setState({
              consumptions: response.data,
              message: '',
              loading: false,
              viewByIdState: viewById
            },
              () => {
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
      }
    } else if (programId == -1) {
      this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [], offlineConsumptionList: [] });
    } else if (versionId == 0) {
      this.setState({ message: i18n.t('static.program.validversion'), consumptions: [], offlineConsumptionList: [] });
    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [], offlineConsumptionList: [], planningUnitLabel: '' });
    }
  }
  /**
   * Retrieves the list of programs.
   */
  getPrograms() {
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getSPProgramBasedOnRealmId(realmId)
        .then(response => {
          var proList = []
          for (var i = 0; i < response.data.length; i++) {
            var programJson = {
              programId: response.data[i].id,
              label: response.data[i].label,
              programCode: response.data[i].code
            }
            proList[i] = programJson
          }
          this.setState({
            programs: proList, loading: false
          }, () => { this.consolidatedProgramList() })
        }).catch(
          error => {
            this.setState({
              programs: [], loading: false
            }, () => { this.consolidatedProgramList() })
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
      this.consolidatedProgramList()
      this.setState({ loading: false })
    }
  }
  /**
   * Consolidates the list of programs obtained from Server and local programs.
   */
  consolidatedProgramList = () => {
    const { programs } = this.state
    var proList = programs;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var program = transaction.objectStore('programData');
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
            var f = 0
            for (var k = 0; k < this.state.programs.length; k++) {
              if (this.state.programs[k].programId == programData.programId) {
                f = 1;
              }
            }
            if (f == 0) {
              proList.push(programData)
            }
          }
        }
        if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = a.programCode.toLowerCase();
              b = b.programCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
            programId: localStorage.getItem("sesProgramIdReport")
          }, () => {
            this.filterVersion();
          })
        } else {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = a.programCode.toLowerCase();
              b = b.programCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
          })
        }
      }.bind(this);
    }.bind(this);
  }
  /**
   * Retrieves the list of planning units for a selected program and version.
   */
  getPlanningUnit() {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    this.setState({
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      offlinePlanningUnitList: []
    }, () => {
      if (versionId == 0) {
        this.setState({ message: i18n.t('static.program.validversion'), consumptions: [], offlineConsumptionList: [] });
      } else {
        localStorage.setItem("sesVersionIdReport", versionId);
        if (versionId.includes('Local')) {
          var db1;
          getDatabase();
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            planningunitRequest.onerror = function (event) {
            };
            planningunitRequest.onsuccess = function (e) {
              var myResult = [];
              myResult = planningunitRequest.result;
              var programId = (document.getElementById("programId").value).split("_")[0];
              var proList = []
              for (var i = 0; i < myResult.length; i++) {
                if (myResult[i].program.id == programId && myResult[i].active == true) {
                  proList[i] = myResult[i].planningUnit
                }
              }
              var lang = this.state.lang;
              this.setState({
                planningUnits: proList, message: '',
                offlinePlanningUnitList: proList.sort(function (a, b) {
                  a = getLabelText(a.label, lang).toLowerCase();
                  b = getLabelText(b.label, lang).toLowerCase();
                  return a < b ? -1 : a > b ? 1 : 0;
                }),
              }, () => {
                this.filterData();
              })
            }.bind(this);
          }.bind(this)
        }
        else {
          var programJson = {
            tracerCategoryIds: [],
            programIds: [programId]
          }
          DropdownService.getProgramPlanningUnitDropdownList(programJson).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              planningUnits: listArray, message: ''
            }, () => {
              this.filterData();
            })
          }).catch(
            error => {
              this.setState({
                planningUnits: [],
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
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                      loading: false
                    });
                    break;
                  case 412:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
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
      }
    });
  }
  /**
   * Filters versions based on the selected program ID and updates the state accordingly.
   * Sets the selected program ID in local storage.
   * Fetches version list for the selected program and updates the state with the fetched versions.
   * Handles error cases including network errors, session expiry, access denial, and other status codes.
   */
  filterVersion = () => {
    let programId = this.state.programId;
    if (programId != 0) {
      localStorage.setItem("sesProgramIdReport", programId);
      const program = this.state.programs.filter(c => c.programId == programId)
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === 'Online') {
          this.setState({
            versions: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
          }, () => {
            DropdownService.getVersionListForSPProgram(programId)
              .then(response => {
                this.setState({
                  versions: []
                }, () => {
                  this.setState({
                    versions: response.data
                  }, () => {
                    this.consolidatedVersionList(programId)
                  });
                });
              }).catch(
                error => {
                  this.setState({
                    programs: [], loading: false
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
          });
        } else {
          this.setState({
            versions: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
          }, () => { this.consolidatedVersionList(programId) })
        }
      } else {
        this.setState({
          versions: [],
          planningUnits: [],
          planningUnitValues: [],
          planningUnitLabels: []
        })
      }
    } else {
      this.setState({
        versions: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: []
      })
    }
  }
  /**
   * Retrieves data from IndexedDB and combines it with fetched versions to create a consolidated version list.
   * Filters out duplicate versions and reverses the list.
   * Sets the version list in the state and triggers fetching of planning units.
   * Handles cases where a version is selected from local storage or the default version is selected.
   * @param {number} programId - The ID of the selected program
   */
  consolidatedVersionList = (programId) => {
    const { versions } = this.state
    var verList = versions;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var program = transaction.objectStore('programData');
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId && myResult[i].programId == programId) {
            var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
            var programData = databytes.toString(CryptoJS.enc.Utf8)
            var version = JSON.parse(programData).currentVersion
            version.versionId = `${version.versionId} (Local)`
            verList.push(version)
          }
        }
        var versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        })
        versionList.reverse();
        if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
          let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
          if (versionVar != '' && versionVar != undefined) {
            this.setState({
              versions: versionList,
              versionId: localStorage.getItem("sesVersionIdReport")
            }, () => {
              this.getPlanningUnit();
              this.filterData()
            })
          } else {
            this.setState({
              versions: versionList,
              versionId: versionList[0].versionId
            }, () => {
              this.getPlanningUnit();
              this.filterData()
            })
          }
        } else {
          this.setState({
            versions: versionList,
            versionId: versionList[0].versionId
          }, () => {
            this.getPlanningUnit();
            this.filterData()
          })
        }
      }.bind(this);
    }.bind(this)
  }
  /**
   * Calls the get programs function on page load
   */
  componentDidMount() {
    this.getPrograms();
  }
  /**
   * Sets the selected program ID selected by the user.
   * @param {object} event - The event object containing information about the program selection.
   */
  setProgramId(event) {
    this.setState({
      programId: event.target.value,
      versionId: ''
    }, () => {
      localStorage.setItem("sesVersionIdReport", '');
      this.filterVersion();
    })
  }
  /**
   * Sets the version ID and updates the tracer category list.
   * @param {Object} event - The event object containing the version ID value.
   */
  setVersionId(event) {
    if (this.state.versionId != '' || this.state.versionId != undefined) {
      this.setState({
        versionId: event.target.value
      }, () => {
        localStorage.setItem("sesVersionIdReport", this.state.versionId);
        this.filterData();
      })
    } else {
      this.setState({
        versionId: event.target.value
      }, () => {
        this.getPlanningUnit();
      })
    }
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.filterData();
    })
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
   * Renders the Consumption report table.
   * @returns {JSX.Element} - Consumption report table.
   */
  render() {
    const { planningUnits } = this.state;
    const { offlinePlanningUnitList } = this.state;
    const { viewByIdState } = this.state;
    const { programs } = this.state;
    let programList = programs.length > 0
      && programs.map((item, i) => {
        return (
          <option key={i} value={item.programId}>
            {item.programCode}
          </option>
        )
      }, this);
    const { versions } = this.state;
    let versionList = versions.length > 0
      && versions.map((item, i) => {
        return (
          <option key={i} value={item.versionId}>
            {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
          </option>
        )
      }, this);
    const options = {
      title: {
        display: true,
        text: viewByIdState == 1 && this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? i18n.t('static.dashboard.consumption') + " - " + this.state.planningUnitLabel : (viewByIdState == 2 && this.state.forecastUnitLabel != "" && this.state.forecastUnitLabel != undefined && this.state.forecastUnitLabel != null ? i18n.t('static.dashboard.consumption') + " - " + this.state.forecastUnitLabel : i18n.t('static.dashboard.consumption')),
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: i18n.t('static.dashboard.consumption'),
            fontColor: 'black'
          },
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
            fontColor: 'black'
          }
        }]
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
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: "black"
        }
      }
    }
    let bar = "";
    if (localStorage.getItem("sessionType") === 'Online') {
      bar = {
        labels: this.state.consumptions.map((item, index) => (dateFormatterLanguage(moment(item.transDate, 'yyyy-MM-dd')))),
        datasets: [
          {
            type: "line",
            lineTension: 0,
            label: i18n.t('static.report.forecastConsumption'),
            backgroundColor: 'transparent',
            borderColor: '#000',
            borderDash: [10, 10],
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            showInLegend: true,
            pointStyle: 'line',
            pointBorderWidth: 5,
            yValueFormatString: "###,###,###,###",
            data: this.state.consumptions.map((item, index) => (item.forecastedConsumption))
          }, {
            label: i18n.t('static.report.actualConsumption'),
            backgroundColor: '#118b70',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            yValueFormatString: "###,###,###,###",
            data: this.state.consumptions.map((item, index) => (item.actualConsumption)),
          }
        ],
      }
    }
    if (!localStorage.getItem("sessionType") === 'Online') {
      bar = {
        labels: this.state.offlineConsumptionList.map((item, index) => (dateFormatterLanguage(moment(item.transDate, 'yyyy-MM-dd')))),
        datasets: [
          {
            type: "line",
            lineTension: 0,
            label: i18n.t('static.report.forecastConsumption'),
            backgroundColor: 'transparent',
            borderColor: '#000',
            borderDash: [10, 10],
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            showInLegend: true,
            pointStyle: 'line',
            pointBorderWidth: 5,
            yValueFormatString: "$#,##0",
            data: this.state.offlineConsumptionList.map((item, index) => (item.forecastedConsumption))
          }, {
            label: i18n.t('static.report.actualConsumption'),
            backgroundColor: '#118b70',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: this.state.offlineConsumptionList.map((item, index) => (item.actualConsumption)),
          }
        ],
      }
    }
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state
    const checkOnline = localStorage.getItem('sessionType');
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
          <div className="Card-header-reporticon pb-2">
            {checkOnline === 'Online' &&
              this.state.consumptions.length > 0 &&
              <div className="card-header-actions">
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
                </a>
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
              </div>
            }
            {checkOnline === 'Offline' &&
              this.state.offlineConsumptionList.length > 0 &&
              <div className="card-header-actions">
                <a className="card-header-action">
                  <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => {
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
                </a>
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
              </div>
            }
          </div>
          <CardBody className="pb-lg-2 pt-lg-0 ">
            <div className="TableCust" >
              <div ref={ref}>
                <Form >
                  <div className="pl-0">
                    <div className="row">
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
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
                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                        <div className="controls ">
                          <InputGroup>
                            <Input
                              type="select"
                              name="programId"
                              id="programId"
                              bsSize="sm"
                              onChange={(e) => { this.setProgramId(e); }}
                              value={this.state.programId}
                            >
                              <option value="-1">{i18n.t('static.common.select')}</option>
                              {programList}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.versionFinal*')}</Label>
                        <div className="controls">
                          <InputGroup>
                            <Input
                              type="select"
                              name="versionId"
                              id="versionId"
                              bsSize="sm"
                              onChange={(e) => { this.setVersionId(e); }}
                              value={this.state.versionId}
                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {versionList}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      {checkOnline === 'Online' &&
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                          <div className="controls">
                            <InputGroup>
                              <Input
                                type="select"
                                name="planningUnitId"
                                id="planningUnitId"
                                bsSize="sm"
                                onChange={this.filterData}
                                onChange={(e) => { this.storeProduct(e); }}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {planningUnits.length > 0
                                  && planningUnits.map((item, i) => {
                                    return (
                                      <option key={i} value={item.id}>
                                        {getLabelText(item.label, this.state.lang)}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup>
                          </div>
                        </FormGroup>
                      }
                      {checkOnline === 'Offline' &&
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="select"
                                name="planningUnitId"
                                id="planningUnitId"
                                bsSize="sm"
                                onChange={(e) => { this.storeProduct(e); }}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {offlinePlanningUnitList.length > 0
                                  && offlinePlanningUnitList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.id}>
                                        {getLabelText(item.label, this.state.lang)}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup>
                          </div>
                        </FormGroup>
                      }
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                        <div className="controls">
                          <InputGroup>
                            <Input
                              type="select"
                              name="viewById"
                              id="viewById"
                              bsSize="sm"
                              onChange={this.filterData}
                            >
                              <option value="1">{i18n.t('static.report.planningUnit')}</option>
                              <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                    </div>
                  </div>
                </Form>
                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                  <div className="row">
                    {checkOnline === 'Online' &&
                      this.state.consumptions.length > 0
                      &&
                      <div className="col-md-12 p-0">
                        <div className="col-md-12">
                          <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                            <Bar id="cool-canvas" data={bar} options={options} />
                            <div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                            {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                          </button>
                        </div>
                      </div>}
                    {checkOnline === 'Offline' &&
                      this.state.offlineConsumptionList.length > 0
                      &&
                      <div className="col-md-12 p-0">
                        <div className="col-md-12">
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
                    <div className="col-md-12 pl-0 pr-0">
                      {checkOnline === 'Online' && this.state.show && this.state.consumptions.length > 0 &&
                        <Table responsive className="table-striped table-bordered text-center mt-2" id="tab1">
                          <tbody>
                            <>
                              <tr style={{ fontWeight: 'bold' }}>
                                <th style={{ width: '140px' }}></th>
                                {
                                  this.state.consumptions.length > 0
                                  &&
                                  this.state.consumptions.map((item, idx) =>
                                    <td id="addr0" key={idx}>
                                      {moment(this.state.consumptions[idx].transDate, 'yyyy-MM-dd').format('MMM YY')}
                                    </td>
                                  )
                                }
                              </tr>
                              <tr>
                                <th style={{ width: '140px' }}>{i18n.t('static.report.forecasted')}</th>
                                {
                                  this.state.consumptions.length > 0
                                  &&
                                  this.state.consumptions.map((item, idx) =>
                                    <td id="addr0" key={idx} className="textcolor-purple">
                                      {formatter(this.state.consumptions[idx].forecastedConsumption, 0)}
                                    </td>
                                  )
                                }
                              </tr>
                              <tr>
                                <th style={{ width: '140px' }}>{i18n.t('static.report.actual')}</th>
                                {
                                  this.state.consumptions.length > 0
                                  &&
                                  this.state.consumptions.map((item, idx) =>
                                    <td id="addr0" key={idx}>
                                      {formatter(this.state.consumptions[idx].actualConsumption, 0)}
                                    </td>
                                  )
                                }
                              </tr>
                            </>
                          </tbody>
                        </Table>}
                      {checkOnline === 'Offline' && this.state.show && this.state.offlineConsumptionList.length > 0 &&
                        <Table responsive className="table-striped table-hover table-bordered text-center mt-2" id="tab1">
                          <tbody>
                            <>
                              <tr style={{ fontWeight: 'bold' }}>
                                <th style={{ width: '140px' }}></th>
                                {
                                  this.state.offlineConsumptionList.length > 0
                                  &&
                                  this.state.offlineConsumptionList.map((item, idx) =>
                                    <td id="addr0" key={idx}>
                                      {moment(this.state.offlineConsumptionList[idx].transDate, 'yyyy-MM-dd').format('MMM YY')}
                                    </td>
                                  )
                                }
                              </tr>
                              <tr >
                                <th style={{ width: '140px' }}>{i18n.t('static.report.forecasted')}</th>
                                {
                                  this.state.offlineConsumptionList.length > 0
                                  &&
                                  this.state.offlineConsumptionList.map((item, idx) =>
                                    <td id="addr0" key={idx} className="textcolor-purple">
                                      {formatter(this.state.offlineConsumptionList[idx].forecastedConsumption, 0)}
                                    </td>
                                  )
                                }
                              </tr>
                              <tr>
                                <th style={{ width: '140px' }}>{i18n.t('static.report.actual')}</th>
                                {
                                  this.state.offlineConsumptionList.length > 0
                                  &&
                                  this.state.offlineConsumptionList.map((item, idx) =>
                                    <td id="addr0" key={idx}>
                                      {formatter(this.state.offlineConsumptionList[idx].actualConsumption, 0)}
                                    </td>
                                  )
                                }
                              </tr>
                            </>
                          </tbody>
                        </Table>}
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
            </div>
          </CardBody>
        </Card>
      </div >
    );
  }
}
export default Consumption;