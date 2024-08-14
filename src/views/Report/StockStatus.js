import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup, Input, InputGroup, Label,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Table
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import { addDoubleQuoteToRowContent, dateFormatter, dateFormatterCSV, makeText, roundAMC, roundN, formatter, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import RealmCountryService from '../../api/RealmCountryService.js';
export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
export const DEFAULT_MAX_MONTHS_OF_STOCK = 18
const entityname1 = i18n.t('static.dashboard.stockstatus')
const ref = React.createRef();
const pickerLang = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  from: 'From', to: 'To',
}
/**
 * Component for Stock Status Report.
 */
class StockStatus extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      PlanningUnitDataForExport: [],
      loading: true,
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      programs: [],
      planningUnits: [],
      planningUnitsMulti: [],
      stockStatusList: [],
      versions: [],
      show: false,
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      programId: [],
      planningUnitLabel: '',
      lang: localStorage.getItem('lang'),
      exportModal: false,
      planningUnitIdsExport: [],
      type: 0,
      viewById: 1,
      planningUnitId: [],
      realmCountryPlanningUnitId: [],
      planningUnitIds: [],
      forecastingUnitId: "",
      forecastingUnitIds: [],
      equivalencyUnitId: "",
      consumptionData: [],
      equivalencyUnitList: [],
      programEquivalencyUnitList: [],
      yaxisEquUnit: -1,
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      forecastingUnits: [],
      allForecastingUnits: [],
      forecastingUnitValues: [],
      forecastingUnitLabels: [],
      realmCountryPlanningUnits: [],
      realmCountryPlanningUnitValues: [],
      realmCountryPlanningUnitLabels: [],
      planningUnitList: [],
      realmCountryPlanningUnitList: [],


    };
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.programChange = this.programChange.bind(this);
    this.toggleExport = this.toggleExport.bind(this);
    this.yAxisChange = this.yAxisChange.bind(this);
    this.setViewById = this.setViewById.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }
  /**
   * Handles the change event for the program selection.
   * Resets relevant state variables and triggers filtering of versions.
   * @param {Event} event - The on change event object.
   */
  programChange(event) {
    this.setState({
      programId: event.map(ele => ele),
      // planningUnits: [],
      // planningUnitsMulti: [],
      // planningUnitLabel: "",
      // stockStatusList: [],
      // forecastingUnits: [],
      // allForecastingUnits: [],
      // forecastingUnitIds: [],
      // matricsList: [],
      // viewById: 1,
      // planningUnitId: "",
      // forecastingUnitId: "",
      // equivalencyUnitId: "",
      // dataList: [],
    }, () => {
      ReportService.getDropdownListByProgramIds(this.state.programId.map(ele => ele.value)).then(response => {
        this.setState({
          equivalencyUnitList: response.data.equivalencyUnitList,
          planningUnitList: response.data.planningUnitList,
          realmCountryPlanningUnitList: response.data.realmCountryPlanningUnitList
        })
      }).catch(
        error => {
          this.setState({
            stockStatusList: [], loading: false
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
    })
  }
  /**
   * Toggles the value of the 'show' state variable.
   */
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
  /**
   * Returns the CSS class name for formatting text color in a row.
   * @param {Object} row - The row object.
   * @returns {string} - The CSS class name for text color formatting.
   */
  rowtextFormatClassName = (row) => {
    return 'textcolor-purple';
  }
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    var A = ""
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var list = this.state.PlanningUnitDataForExport
    list.map(
      (item, index) => {
        csvRow.push("")
        if (index != 0) {
          csvRow.push("")
        }
        csvRow.push('"' + (i18n.t('static.planningunit.planningunit').replaceAll(' ', '%20') + ' : ' + getLabelText(item.planningUnit.label, this.state.lang)).replaceAll(' ', '%20') + '"')
        var ppu = this.state.planningUnits.filter(c => c.planningUnit.id == item.planningUnit.id)[0];
        csvRow.push('"' + (i18n.t('static.supplyPlan.amcPastOrFuture').replaceAll(' ', '%20') + ' : ' + (ppu.monthsInPastForAmc) + "/" + (ppu.monthsInFutureForAmc) + '"'))
        if (item.data.length > 0 && item.data[0].planBasedOn == 1) {
          csvRow.push('"' + (i18n.t('static.supplyPlan.minStockMos').replaceAll(' ', '%20') + ' : ' + item.data[0].minMos + '"'))
        } else {
          csvRow.push('"' + (i18n.t('static.product.minQuantity').replaceAll(' ', '%20') + ' : ' + item.data[0].minStock + '"'))
        }
        csvRow.push('"' + (i18n.t('static.report.shelfLife').replaceAll(' ', '%20') + ' : ' + ppu.shelfLife + '"'))
        if (item.data.length > 0 && item.data[0].planBasedOn == 1) {
          csvRow.push('"' + (i18n.t('static.supplyPlan.maxStockMos').replaceAll(' ', '%20') + ' : ' + item.data[0].maxMos + '"'))
        } else {
          csvRow.push('"' + (i18n.t('static.product.distributionLeadTime').replaceAll(' ', '%20') + ' : ' + item.data[0].distributionLeadTime + '"'))
        }
        csvRow.push('"' + (i18n.t('static.supplyPlan.reorderInterval').replaceAll(' ', '%20') + ' : ' + ppu.reorderFrequencyInMonths + '"'))
        csvRow.push("")
        const headers = [addDoubleQuoteToRowContent([i18n.t('static.common.month').replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20'),
        i18n.t('static.report.forecasted').replaceAll(' ', '%20'),
        i18n.t('static.report.actual').replaceAll(' ', '%20'),
        i18n.t('static.shipment.qty').replaceAll(' ', '%20'),
        (i18n.t('static.shipment.qty') + " | " + i18n.t('static.budget.fundingsource') + " | " + i18n.t('static.supplyPlan.shipmentStatus').replaceAll(' ', '%20') + " | " + i18n.t('static.report.procurementAgentName') + " | " + i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo')),
        i18n.t('static.report.adjustmentQty').replaceAll(' ', '%20'),
        i18n.t('static.supplyplan.exipredStock').replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.endingBalance').replaceAll(' ', '%20'),
        i18n.t('static.report.amc').replaceAll(' ', '%20'),
        item.data.length > 0 && item.data[0].planBasedOn == 1 ? i18n.t('static.report.mos').replaceAll(' ', '%20') : i18n.t('static.supplyPlan.maxQty').replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.unmetDemandStr').replaceAll(' ', '%20')
        ])];
        A = headers
        item.data.map(ele => A.push(addDoubleQuoteToRowContent([dateFormatterCSV(ele.dt).replaceAll(' ', '%20'), ele.openingBalance, ele.forecastedConsumptionQty == null ? '' : ele.forecastedConsumptionQty, ele.actualConsumptionQty == null ? '' : ele.actualConsumptionQty, ele.shipmentQty == null ? '' : ele.shipmentQty,
        (ele.shipmentInfo.map(item1 => {
          return (
            item1.shipmentQty + " | " + item1.fundingSource.code + " | " + getLabelText(item1.shipmentStatus.label, this.state.lang) + " | " + item1.procurementAgent.code +
            (item1.orderNo == null &&
              item1.primeLineNo == null &&
              item1.roNo == null &&
              item1.roPrimeLineNo == null
              ? " | N/A"
              : (item1.roNo == null && item1.roPrimeLineNo == null
                ? ""
                : " | " + item1.roNo + "-" + item1.roPrimeLineNo) +
              (item1.orderNo == null && item1.primeLineNo == null
                ? ""
                : item1.orderNo == null
                  ? ""
                  : " | " + item1.orderNo) +
              (item1.primeLineNo == null
                ? ""
                : "-" + item1.primeLineNo))
          )
        }).join(' \n')).replaceAll(' ', '%20')
          , (ele.adjustment == 0 ? ele.regionCountForStock > 0 ? ele.nationalAdjustment : "" : ele.regionCountForStock > 0 ? ele.nationalAdjustment : ele.adjustment != null ? ele.adjustment : ""), ele.expiredStock != 0 ? ele.expiredStock : '', ele.closingBalance, ele.amc != null ? roundAMC(ele.amc) : "", ele.planBasedOn == 1 ? roundN(ele.mos) : roundAMC(ele.maxStock), ele.unmetDemand != 0 ? ele.unmetDemand : ''])));
        for (var i = 0; i < A.length; i++) {
          csvRow.push(A[i].join(","))
        }
      })
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.stockstatus') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
    const addHeaders = (doc, pageArray) => {
      const pageCount = doc.internal.getNumberOfPages()
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setPage(i)
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.dashboard.stockstatus'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          var splittext = doc.splitTextToSize(i18n.t('static.common.runDate') + moment(new Date()).format(`${DATE_FORMAT_CAP}`) + ' ' + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width / 8);
          doc.text(doc.internal.pageSize.width * 3 / 4, 60, splittext)
          splittext = doc.splitTextToSize(i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width / 8);
          doc.text(doc.internal.pageSize.width / 8, 60, splittext)
          doc.text(i18n.t('static.program.program') + ' : ' + (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v")), doc.internal.pageSize.width / 10, 80, {
            align: 'left'
          })
        }
      }
    }
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(8);
    var pageArray = [];
    var list = this.state.PlanningUnitDataForExport
    var count = 0;
    list.map(
      (item, itemCount) => {
        if (itemCount != 0) {
          doc.addPage()
        }
        doc.setFontSize(8)
        doc.setTextColor("#002f6c");
        var ppu1 = this.state.planningUnits.filter(c => c.planningUnit.id == item.planningUnit.id)[0];
        doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + getLabelText(item.planningUnit.label, this.state.lang), doc.internal.pageSize.width / 10, 90, {
          align: 'left'
        })
        doc.text(i18n.t('static.supplyPlan.amcPastOrFuture') + ' : ' + (ppu1.monthsInPastForAmc) + "/" + (ppu1.monthsInFutureForAmc), doc.internal.pageSize.width / 10, 100, {
          align: 'left'
        })
        doc.text(i18n.t('static.report.shelfLife') + ' : ' + ppu1.shelfLife, doc.internal.pageSize.width / 10, 110, {
          align: 'left'
        })
        if (ppu1.planBasedOn == 1) {
          doc.text(i18n.t('static.supplyPlan.minStockMos') + ' : ' + item.data[0].minMos, doc.internal.pageSize.width / 10, 120, {
            align: 'left'
          })
        } else {
          doc.text(i18n.t('static.product.minQuantity') + ' : ' + formatter(ppu1.minQty, 0), doc.internal.pageSize.width / 10, 120, {
            align: 'left'
          })
        }
        doc.text(i18n.t('static.supplyPlan.reorderInterval') + ' : ' + ppu1.reorderFrequencyInMonths, doc.internal.pageSize.width / 10, 130, {
          align: 'left'
        })
        if (ppu1.planBasedOn == 1) {
          doc.text(i18n.t('static.supplyPlan.maxStockMos') + ' : ' + item.data[0].maxMos, doc.internal.pageSize.width / 10, 140, {
            align: 'left'
          })
        } else {
          doc.text(i18n.t('static.product.distributionLeadTime') + ' : ' + formatter(ppu1.distributionLeadTime, 0), doc.internal.pageSize.width / 10, 140, {
            align: 'left'
          })
        }
        var canv = document.getElementById("cool-canvas" + count)
        var canvasImg1 = canv.toDataURL("image/png", 1.0);
        doc.addImage(canvasImg1, 'png', 50, 150, 750, 300, "a" + count, 'CANVAS')
        count++
        var height = doc.internal.pageSize.height;
        let otherdata =
          item.data.map(ele => [dateFormatter(ele.dt), formatter(ele.openingBalance, 0), formatter(ele.forecastedConsumptionQty, 0), formatter(ele.actualConsumptionQty, 0), formatter(ele.shipmentQty, 0),
          ele.shipmentInfo.map(item1 => {
            return (
              item1.shipmentQty + " | " + item1.fundingSource.code + " | " + getLabelText(item1.shipmentStatus.label, this.state.lang) + " | " + item1.procurementAgent.code + (item1.orderNo == null &&
                item1.primeLineNo == null &&
                item1.roNo == null &&
                item1.roPrimeLineNo == null
                ? " | N/A"
                : (item1.roNo == null && item1.roPrimeLineNo == null
                  ? ""
                  : " | " + item1.roNo + "-" + item1.roPrimeLineNo) +
                (item1.orderNo == null && item1.primeLineNo == null
                  ? ""
                  : item1.orderNo == null
                    ? ""
                    : " | " + item1.orderNo) +
                (item1.primeLineNo == null ? "" : "-" + item1.primeLineNo)))
          }).join(' \n')
            , formatter(ele.adjustment == 0 ? ele.regionCountForStock > 0 ? ele.nationalAdjustment : "" : ele.regionCountForStock > 0 ? ele.nationalAdjustment : ele.adjustment, 0), ele.expiredStock != 0 ? formatter(ele.expiredStock, 0) : '', formatter(ele.closingBalance, 0), formatter(roundAMC(ele.amc, 0)), ele.planBasedOn == 1 ? formatter(roundN(ele.mos, 0)) : formatter(roundAMC(ele.maxStock, 0)), ele.unmetDemand != 0 ? formatter(ele.unmetDemand, 0) : '']);
        var header1 = [[{ content: i18n.t('static.common.month'), rowSpan: 2 },
        { content: i18n.t("static.report.stock"), colSpan: 1 },
        { content: i18n.t("static.supplyPlan.consumption"), colSpan: 2 },
        { content: i18n.t("static.shipment.shipment"), colSpan: 2 },
        { content: i18n.t("static.report.stock"), colSpan: 6 }
        ],
        [
          i18n.t('static.supplyPlan.openingBalance'),
          i18n.t('static.report.forecasted'),
          i18n.t('static.report.actual'),
          i18n.t('static.supplyPlan.qty'),
          (i18n.t('static.supplyPlan.qty') + " | " + i18n.t('static.supplyPlan.funding') + " | " + i18n.t('static.shipmentDataEntry.shipmentStatus') + " | " + (i18n.t('static.supplyPlan.procAgent')) + " | " + (i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo'))),
          i18n.t('static.supplyPlan.adj'),
          i18n.t('static.supplyplan.exipredStock'),
          i18n.t('static.supplyPlan.endingBalance'),
          i18n.t('static.report.amc'),
          item.data[0].planBasedOn == 1 ? i18n.t('static.report.mos') : i18n.t('static.supplyPlan.maxQty'),
          i18n.t('static.supplyPlan.unmetDemandStr'),
        ]];
        let content = {
          margin: { top: 80, bottom: 70 },
          startY: height,
          head: header1,
          body: otherdata,
          styles: { lineWidth: 1, fontSize: 8, cellWidth: 55, halign: 'center' },
          headStyles: { fillColor: "#e5edf5", textColor: "#000", fontStyle: "normal" },
          columnStyles: {
            5: { cellWidth: 156.89 },
          },
          didParseCell: function (data) {
            if (data.column.index === 8 && data.row.section != "head") {
              if (item.data[data.row.index].regionCount == item.data[data.row.index].regionCountForStock) {
                data.cell.styles.fontStyle = 'bold';
              }
            }
            if (data.column.index === 1 && data.row.section != "head") {
              if (data.row.index == 0) {
                if (item.firstMonthRegionCount == item.firstMonthRegionCountForStock) {
                  data.cell.styles.fontStyle = 'bold';
                }
              } else {
                if (item.data[data.row.index - 1].regionCount == item.data[data.row.index - 1].regionCountForStock) {
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            }
          }.bind(this)
        };
        doc.autoTable(content);
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        var y = doc.lastAutoTable.finalY + 20
        if (y + 100 > height) {
          doc.addPage();
          y = 80
        }
        doc.text(i18n.t('static.program.notes'), doc.internal.pageSize.width / 9, y, {
          align: 'left'
        })
        doc.setFont('helvetica', 'normal')
        var cnt = 0
        cnt = 0
        item.coList.map(ele => {
          if (ele.notes != null && ele.notes != '') {
            cnt = cnt + 1
            if (cnt == 1) {
              y = y + 10
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8)
              doc.text(i18n.t("static.supplyPlan.consumptionMsg"), doc.internal.pageSize.width / 9, y, {
                align: 'left'
              })
              y = y + 10
            } else {
              y = y + 5
            }
            doc.setFontSize(8)
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            }
            doc.text((ele.actualFlag.toString() == "true" ? moment(ele.consumptionDate).format('DD-MMM-YY') + "*" : moment(ele.consumptionDate).format('DD-MMM-YY') + ""), doc.internal.pageSize.width / 8, y, {
              align: 'left'
            })
            var splitTitle = doc.splitTextToSize("(" + getLabelText(ele.region.label, this.state.lang) + " | " + getLabelText(ele.dataSource.label, this.state.lang) + ") " + ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
            for (var i = 0; i < splitTitle.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 5
              }
            }
            if (splitTitle.length > 1) {
              y = y + (5 * (splitTitle.length - 1));
            }
          }
        })
        cnt = 0
        item.shList.map(ele => {
          if (ele.notes != null && ele.notes != '') {
            cnt = cnt + 1
            if (cnt == 1) {
              y = y + 10
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8)
              doc.text(i18n.t('static.shipment.shipment'), doc.internal.pageSize.width / 9, y, {
                align: 'left'
              })
              y = y + 10
            } else {
              y = y + 5
            }
            doc.setFontSize(8)
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            }
            doc.text(moment(ele.receivedDate == null || ele.receivedDate == '' ? ele.expectedDeliveryDate : ele.receivedDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 8, y, {
              align: 'left'
            })
            var splitTitle = doc.splitTextToSize("(" + getLabelText(ele.dataSource.label, this.state.lang) + ") " + ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
            for (var i = 0; i < splitTitle.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 5
              }
            }
            if (splitTitle.length > 1) {
              y = y + (5 * (splitTitle.length - 1));
            }
          }
        }
        )
        cnt = 0;
        item.inList.map(ele => {
          if (ele.notes != null && ele.notes != '') {
            cnt = cnt + 1
            if (cnt == 1) {
              y = y + 10
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8)
              doc.text(i18n.t("static.supplyPlan.inventoryMsg"), doc.internal.pageSize.width / 9, y, {
                align: 'left'
              })
              y = y + 10
            } else {
              y = y + 5
            }
            doc.setFontSize(8)
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            }
            doc.text((ele.actualQty !== "" && ele.actualQty != undefined && ele.actualQty != null ? moment(ele.inventoryDate).format('DD-MMM-YY') + "" : moment(ele.inventoryDate).format('DD-MMM-YY') + "*"), doc.internal.pageSize.width / 8, y, {
              align: 'left'
            })
            var splitTitle = doc.splitTextToSize("(" + getLabelText(ele.region.label, this.state.lang) + " | " + getLabelText(ele.dataSource.label, this.state.lang) + ") " + ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
            for (var i = 0; i < splitTitle.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 5
              }
            }
            if (splitTitle.length > 1) {
              y = y + (5 * (splitTitle.length - 1));
            }
          }
        })
        var ppu = this.state.planningUnits.filter(c => c.planningUnit.id == item.planningUnit.id)[0];
      }
    )
    addHeaders(doc, pageArray)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.stockstatus') + ".pdf")
  }
  /**
   * Fetches and filters data based on selected program, version, planning unit, and date range.
   */
  filterData() {
    let programId = document.getElementById("programId").value;
    let planningUnitIds = this.state.planningUnitIds.map(item => item.value.toString());
    let forecastingUnitIds = this.state.forecastingUnitIds.map(item => item.value.toString());
    let viewById = this.state.viewById;
    let equivalencyUnitId = document.getElementById("yaxisEquUnit").value;
    let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
    if (programId != 0 && ((planningUnitIds.length > 0 && viewById == 1) || (forecastingUnitIds.length > 0 && viewById == 2))) {

      this.setState({ loading: true })
      var inputjson = {
        "programId": programId,
        "startDate": startDate.startOf('month').subtract(1, 'months').format('YYYY-MM-DD'),
        "stopDate": this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
        "planningUnitIds": planningUnitIds,
        "allPlanningUnits": false
      }
      ReportService.getStockStatusData(inputjson)
        .then(response => {
          var inventoryList = [];
          var consumptionList = [];
          var shipmentList = [];
          var responseData = response.data[0];
          let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
          var filteredResponseData = (responseData).filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDate).format("YYYY-MM"));
          filteredResponseData.map(c => {
            c.inventoryInfo.map(i => inventoryList.push(i))
            c.consumptionInfo.map(ci => consumptionList.push(ci))
            c.shipmentInfo.map(si => shipmentList.push(si))
          }
          );
          this.setState({
            firstMonthRegionCount: responseData.length > 0 ? responseData[0].regionCount : 1,
            firstMonthRegionCountForStock: responseData.length > 0 ? responseData[0].regionCountForStock : 0,
            stockStatusList: filteredResponseData,
            message: '', loading: false,
            planningUnitLabel: document.getElementById("planningUnitId").selectedOptions[0].text,
            inList: inventoryList,
            coList: consumptionList,
            shList: shipmentList
          })
        }).catch(
          error => {
            this.setState({
              stockStatusList: [], loading: false
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

    } else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), stockStatusList: [] });
    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), stockStatusList: [], planningUnitLabel: '' });
    }
  }
  /**
   * Fetches the data for exporting it in CSV or PDF based on the planning units selected
   * @param {*} report This is the type of the export. 1 for PDF and 2 for CSV
   */
  exportData = (report) => {
    this.setState({
      exportModal: false
    })
    let programId = document.getElementById("programId").value;
    let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
    report == 1 ? document.getElementById("bars_div").style.display = 'block' : document.getElementById("bars_div").style.display = 'none';
    var PlanningUnitDataForExport = [];
    this.setState({ loading: true })
    var inputjson = {
      "programId": programId,
      "startDate": startDate.startOf('month').subtract(1, 'months').format('YYYY-MM-DD'),
      "stopDate": this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
      "planningUnitIds": [...new Set(this.state.planningUnitIdsExport.map(item => item.value))],
    }
    ReportService.getStockStatusData(inputjson)
      .then(response => {
        var sortedPlanningUnitData = this.state.planningUnitIdsExport.sort(function (a, b) {
          a = a.label.toLowerCase();
          b = b.label.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        sortedPlanningUnitData.map(plannningUnitItem => {
          var planningUnitItemFilter = response.data.filter(c => c[0].planningUnit.id == plannningUnitItem.value)[0];
          let startDateForFilter = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
          var filteredPlanningUnitData = planningUnitItemFilter.filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDateForFilter).format("YYYY-MM"));
          var bar = {
            labels: filteredPlanningUnitData.map((item, index) => (dateFormatter(item.dt))),
            datasets: [
              {
                label: i18n.t('static.supplyplan.exipredStock'),
                yAxisID: 'A',
                type: 'line',
                stack: 7,
                data: filteredPlanningUnitData.map((item, index) => (item.expiredStock > 0 ? item.expiredStock : null)),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                showLine: false,
                pointStyle: 'triangle',
                pointBackgroundColor: '#ED8944',
                pointBorderColor: '#212721',
                pointRadius: 10
              },
              {
                type: "line",
                yAxisID: 'A',
                label: i18n.t('static.supplyPlan.consumption'),
                backgroundColor: 'transparent',
                borderColor: '#ba0c2f',
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                showInLegend: true,
                pointStyle: 'line',
                pointRadius: 0,
                yValueFormatString: "$#,##0",
                data: filteredPlanningUnitData.map((item, index) => (item.finalConsumptionQty))
              },
              {
                label: i18n.t('static.report.actualConsumption'),
                yAxisID: 'A',
                type: 'line',
                stack: 7,
                data: filteredPlanningUnitData.map((item, index) => (item.actualConsumptionQty)),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                showLine: false,
                pointStyle: 'point',
                pointBackgroundColor: '#ba0c2f',
                pointBorderColor: '#ba0c2f',
                pointRadius: 3
              },
              {
                label: i18n.t('static.supplyPlan.delivered'),
                yAxisID: 'A',
                stack: 1,
                backgroundColor: '#002f6c',
                borderColor: '#002f6c',
                pointBackgroundColor: '#002f6c',
                pointBorderColor: '#002f6c',
                pointHoverBackgroundColor: '#002f6c',
                pointHoverBorderColor: '#002f6c',
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    ele.shipmentStatus.id == 7 ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              },
              {
                label: i18n.t('static.supplyPlan.shipped'),
                yAxisID: 'A',
                stack: 1,
                backgroundColor: '#49A4A1',
                borderColor: '#49A4A1',
                pointBackgroundColor: '#49A4A1',
                pointBorderColor: '#49A4A1',
                pointHoverBackgroundColor: '#49A4A1',
                pointHoverBorderColor: '#49A4A1',
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    (ele.shipmentStatus.id == 5 || ele.shipmentStatus.id == 6) ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              },
              {
                label: i18n.t('static.supplyPlan.approved'),
                yAxisID: 'A',
                stack: 1,
                backgroundColor: '#0067B9',
                borderColor: '#0067B9',
                pointBackgroundColor: '#0067B9',
                pointBorderColor: '#0067B9',
                pointHoverBackgroundColor: '#0067B9',
                pointHoverBorderColor: '#0067B9',
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    (ele.shipmentStatus.id == 3 || ele.shipmentStatus.id == 4) ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              },
              {
                label: i18n.t('static.supplyPlan.planned'),
                backgroundColor: '#A7C6ED',
                borderColor: '#A7C6ED',
                pointBackgroundColor: '#A7C6ED',
                pointBorderColor: '#A7C6ED',
                pointHoverBackgroundColor: '#A7C6ED',
                pointHoverBorderColor: '#A7C6ED',
                yAxisID: 'A',
                stack: 1,
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    (ele.shipmentStatus.id == 1 || ele.shipmentStatus.id == 2 || ele.shipmentStatus.id == 3 || ele.shipmentStatus.id == 9) ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              },
              {
                label: i18n.t('static.report.stock'),
                yAxisID: 'A',
                type: 'line',
                borderColor: '#cfcdc9',
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                pointStyle: 'circle',
                pointRadius: 0,
                showInLegend: true,
                data: filteredPlanningUnitData.map((item, index) => (item.closingBalance))
              },
              {
                type: "line",
                yAxisID: 'B',
                label: i18n.t('static.report.minmonth'),
                backgroundColor: 'rgba(255,193,8,0.2)',
                borderColor: '#59cacc',
                borderStyle: 'dotted',
                borderDash: [10, 10],
                fill: '+1',
                backgroundColor: 'transparent',
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointRadius: 0,
                yValueFormatString: "$#,##0",
                lineTension: 0,
                data: filteredPlanningUnitData.map((item, index) => (item.minMos))
              }
              , {
                type: "line",
                yAxisID: 'B',
                label: i18n.t('static.report.maxmonth'),
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: '#59cacc',
                borderStyle: 'dotted',
                backgroundColor: 'transparent',
                borderDash: [10, 10],
                fill: true,
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                pointStyle: 'line',
                pointRadius: 0,
                showInLegend: true,
                yValueFormatString: "$#,##0",
                data: filteredPlanningUnitData.map((item, index) => (item.maxMos))
              }
              , {
                type: "line",
                yAxisID: 'B',
                label: i18n.t('static.report.mos'),
                borderColor: '#118b70',
                backgroundColor: 'transparent',
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                showInLegend: true,
                pointStyle: 'line',
                pointRadius: 0,
                yValueFormatString: "$#,##0",
                data: filteredPlanningUnitData.map((item, index) => (roundN(item.mos)))
              }
            ],
          };
          var chartOptions = {
            title: {
              display: true,
              text: (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v")) + " - " + getLabelText(planningUnitItemFilter[0].planningUnit.label, this.state.lang)
            },
            scales: {
              yAxes: [{
                id: 'A',
                position: 'left',
                scaleLabel: {
                  labelString: i18n.t('static.shipment.qty'),
                  display: true,
                  fontSize: "12",
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
                }, gridLines: {
                  color: 'rgba(171,171,171,1)',
                  lineWidth: 0
                }
              }, {
                id: 'B',
                position: 'right',
                scaleLabel: {
                  labelString: i18n.t('static.supplyPlan.monthsOfStock'),
                  fontColor: 'black',
                  display: true,
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
                },
                gridLines: {
                  color: 'rgba(171,171,171,1)',
                  lineWidth: 0
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: i18n.t('static.common.month'),
                  fontColor: 'black',
                  fontStyle: "normal",
                  fontSize: "12"
                },
                ticks: {
                  fontColor: 'black',
                  fontStyle: "normal",
                  fontSize: "12"
                },
                gridLines: {
                  color: 'rgba(171,171,171,1)',
                  lineWidth: 0
                }
              }]
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
            maintainAspectRatio: false,
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                fontColor: 'black'
              }
            }
          }
          var data = planningUnitItemFilter;
          let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
          var filteredData = data.filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDate).format("YYYY-MM"));
          var planningUnit = planningUnitItemFilter[0].planningUnit
          var conList = [];
          var invList = [];
          var shipList = [];
          filteredData.map(c => c.consumptionInfo.map(ci => conList.push(ci)));
          filteredData.map(c => c.inventoryInfo.map(ii => invList.push(ii)));
          filteredData.map(c => c.shipmentInfo.map(si => shipList.push(si)));
          var planningUnitexport = {
            planningUnit: planningUnit,
            firstMonthRegionCount: data.length > 0 ? data[0].regionCount : 1,
            firstMonthRegionCountForStock: data.length > 0 ? data[0].regionCountForStock : 0,
            data: filteredData,
            bar: bar,
            chartOptions: chartOptions,
            inList: invList,
            coList: conList,
            shList: shipList,
          }
          PlanningUnitDataForExport.push(planningUnitexport)
        })
        this.setState({
          PlanningUnitDataForExport: PlanningUnitDataForExport,
          message: '', loading: false
        }, () => {
          setTimeout(() => {
            if (report == 1) {
              this.exportPDF()
              document.getElementById("bars_div").style.display = 'none';
            } else {
              this.exportCSV()
            }
          }, 2000)
        })
      }
      ).catch(
        error => {
          this.setState({
            stockStatusList: [], loading: false
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

  }
  /**
   * Retrieves the list of programs.
   */
  getPrograms = () => {
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
        .then(response => {
          var proList = [];
          for (var i = 0; i < response.data.length; i++) {
            var programJson = {
              programId: response.data[i].id,
              label: response.data[i].label,
              programCode: response.data[i].code,
            };
            proList[i] = programJson;
          }
          this.setState({
            programs: proList, message: '',
            loading: false
          })
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
      this.setState({ loading: false })
    }
  }
  /**
    * Sets the planning unit based on the provided event data.
    * @param {Object} e - Event data containing planning unit information.
    */
  setPlanningUnit(e) {
    if (this.state.yaxisEquUnit > 0) {
      var selectedText = e.map(item => item.label);
      var tempPUList = e.filter(puItem => !this.state.planningUnitId.map(ele => ele).includes(puItem));
      this.setState({
        planningUnitId: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempPUList,
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false
      }, () => {
        // document.getElementById("consumptionAdjusted").checked = false;
        this.fetchData();
      })
    } else {
      if (this.state.yaxisEquUnit == -1) {
        this.setState({
          planningUnitId: e.map(ele => ele),
          show: false,
          dataList: [],
          consumptionAdjForStockOutId: false,
          loading: false
        }, () => {
          // document.getElementById("consumptionAdjusted").checked = false;
          this.fetchData();
        })
      }
    }
  }
  setRealmCountryPlanningUnit(e) {
    if (this.state.yaxisEquUnit > 0) {
      var selectedText = e.map(item => item.label);
      var tempRCPUList = e.filter(rcpuItem => !this.state.planningUnitId.map(ele => ele).includes(rcpuItem));
      this.setState({
        realmCountryPlanningUnitId: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempRCPUList,
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false
      }, () => {
        // document.getElementById("consumptionAdjusted").checked = false;
        this.fetchData();
      })
    } else {
      if (this.state.yaxisEquUnit == -1) {
        this.setState({
          realmCountryPlanningUnitId: e.map(ele => ele),
          show: false,
          dataList: [],
          consumptionAdjForStockOutId: false,
          loading: false
        }, () => {
          // document.getElementById("consumptionAdjusted").checked = false;
          this.fetchData();
        })
      }
    }
  }
  /**
  * Sets the y-axis equivalent unit ID and triggers data fetching.
  * @param {Object} e - Event data containing the y-axis equivalent unit ID.
  */
  setYaxisEquUnitId(e) {
    var yaxisEquUnit = e.target.value;
    this.setState({
      yaxisEquUnit: yaxisEquUnit,
      loading: false
    }, () => {
      // this.fetchData();
    })
  }
  /**
   * Updates the selected view mode in the state and triggers actions to update the UI.
   * @param {Object} e - The event object containing the selected view mode value.
   */
  setViewById(e) {
    var viewById = e.target.value;
    this.setState({
      viewById: viewById,
      consumptionData: [],
      monthArrayList: [],
      errorValues: [],
      regionListFiltered: [],
      show: false,
      loading: false
    }, () => {
      if (viewById == 2) {
        document.getElementById("forecastingUnitDiv").style.display = "block";
        document.getElementById("planningUnitDiv").style.display = "none";
        // this.fetchData();
      } else {
        document.getElementById("planningUnitDiv").style.display = "block";
        document.getElementById("forecastingUnitDiv").style.display = "none";
        // this.fetchData();
      }
    })
  }
  /**
  * Handles the change event for the Y-axis equivalency unit.
  * @param {object} e - The event object
  */
  yAxisChange(e) {
    var yaxisEquUnit = e.target.value;
    this.setState({
      yaxisEquUnit: yaxisEquUnit,
      // planningUnits: [],
      // planningUnitIds: [],
      // planningUnitValues: [],
      // planningUnitLabels: [],
      // foreastingUnits: [],
      // forecastingUnitIds: [],
      // foreastingUnitValues: [],
      // foreastingUnitLabels: [],
      // planningUnitId: "",
      // forecastingUnitId: "",
      // dataList: [],
      // loading: false
    }, () => {
      if (yaxisEquUnit > 0) {//Yes
        // this.getPlanningUnitAndForcastingUnit();
      } else {//NO
        // this.getPlanningUnitAndForcastingUnit();
        // this.fetchData();
      }
    })
  }
  fetchData() {
    let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
    let inputjson = {
      "aggregate": this.state.programId.length == 1 ? false : true, // True if you want the results to be aggregated and False if you want Individual Supply Plans for the Multi-Select information
      "programIds": this.state.programId.map(ele => ele.value), // Will be used when singleProgram is false
      "programId": this.state.programId.map(ele => ele.value), // Will be used only if aggregate is false
      "startDate":  startDate.startOf('month').subtract(1, 'months').format('YYYY-MM-DD'),
      "stopDate": this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
      "viewBy": this.state.viewById, // 1 for PU, 2 for ARU
      "reportingUnitIds": this.state.viewById == 1 ? this.state.planningUnitId.map(ele => ele.value) : this.state.realmCountryPlanningUnitId.map(ele => ele.value),
      "reportingUnitId": this.state.viewById == 1 ? this.state.planningUnitId.map(ele => ele.value).toString() : this.state.realmCountryPlanningUnitId.map(ele => ele.value).toString(), // Will be used only if aggregate is false
      "equivalencyUnitId": this.state.yaxisEquUnit
    }
    ReportService.getStockStatusData(inputjson).then((response) => {
      console.log("Hello",response)
    }).catch(
      error => {
        this.setState({
          stockStatusList: [], loading: false
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
  }
  /**
   * Calls the get programs function on page load
   */
  componentDidMount() {
    this.getPrograms();
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => { this.filterData() })
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
   * Renders the Stock Status report table.
   * @returns {JSX.Element} - Stock Status report table.
   */
  render() {
    const { equivalencyUnitList } = this.state;
    let equivalencyUnitList1 = equivalencyUnitList.length > 0
      && equivalencyUnitList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.label.label_en}
          </option>
        )
      }, this);

    const { programs } = this.state;
    let programList = programs.length > 0
      && programs.map((item) => {
         return { value: item.programId, label: item.programCode }
      }, this);
    
    const { planningUnitList } = this.state;
    let puList = planningUnitList.length > 0 && planningUnitList.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang) + " | " + item.id, value: item.id })
    }, this);

    const { realmCountryPlanningUnitList } = this.state;
    let rcpuList = realmCountryPlanningUnitList.length > 0 && realmCountryPlanningUnitList.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang) + " | " + item.id, value: item.id })
    }, this);

    const options = {
      title: {
        display: true,
        text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v")) + " - " + this.state.planningUnitLabel : entityname1
      },
      scales: {
        yAxes: [{
          id: 'A',
          position: 'left',
          scaleLabel: {
            labelString: i18n.t('static.shipment.qty'),
            display: true,
            fontSize: "12",
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
          }, gridLines: {
            color: 'rgba(171,171,171,1)',
            lineWidth: 0
          }
        }, {
          id: 'B',
          position: 'right',
          scaleLabel: {
            labelString: i18n.t('static.supplyPlan.monthsOfStock'),
            fontColor: 'black',
            display: true,
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
          },
          gridLines: {
            color: 'rgba(171,171,171,1)',
            lineWidth: 0
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: i18n.t('static.common.month'),
            fontColor: 'black',
            fontStyle: "normal",
            fontSize: "12"
          },
          ticks: {
            fontColor: 'black',
            fontStyle: "normal",
            fontSize: "12"
          },
          gridLines: {
            color: 'rgba(171,171,171,1)',
            lineWidth: 0
          }
        }]
      },
      tooltips: {
        mode: 'nearest',
        callbacks: {
          label: function (tooltipItem, data) {
            if (tooltipItem.datasetIndex == 2) {
              return "";
            } else {
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
        }
        , intersect: false
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: 'black'
        }
      }
    }
    const options1 = {
      title: {
        display: true,
        text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v")) + " - " + this.state.planningUnitLabel : entityname1
      },
      scales: {
        yAxes: [{
          id: 'A',
          position: 'left',
          scaleLabel: {
            labelString: i18n.t('static.shipment.qty'),
            display: true,
            fontSize: "12",
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
          }, gridLines: {
            color: 'rgba(171,171,171,1)',
            lineWidth: 0
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: i18n.t('static.common.month'),
            fontColor: 'black',
            fontStyle: "normal",
            fontSize: "12"
          },
          ticks: {
            fontColor: 'black',
            fontStyle: "normal",
            fontSize: "12"
          },
          gridLines: {
            color: 'rgba(171,171,171,1)',
            lineWidth: 0
          }
        }]
      },
      tooltips: {
        mode: 'nearest',
        intersect: false,
        // enabled: false,
        // custom: CustomTooltips,
        callbacks: {
          label: function (tooltipItem, data) {
            if (tooltipItem.datasetIndex == 2) {
              return "";
            } else {
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
        }
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: 'black'
        }
      }
    }

    let datasets = [
      {
        label: i18n.t('static.supplyplan.exipredStock'),
        yAxisID: 'A',
        type: 'line',
        stack: 7,
        data: this.state.stockStatusList.map((item, index) => (item.expiredStock > 0 ? item.expiredStock : null)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        showLine: false,
        pointStyle: 'triangle',
        pointBackgroundColor: '#ED8944',
        pointBorderColor: '#212721',
        pointRadius: 10
      },
      {
        type: "line",
        yAxisID: 'A',
        label: i18n.t('static.supplyPlan.consumption'),
        backgroundColor: 'transparent',
        borderColor: '#ba0c2f',
        pointBackgroundColor: '#ba0c2f',
        pointBorderColor: '#ba0c2f',
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        showInLegend: true,
        pointStyle: 'line',
        pointRadius: 0,
        yValueFormatString: "$#,##0",
        data: this.state.stockStatusList.map((item, index) => (item.finalConsumptionQty))
      },
      {
        label: i18n.t('static.report.actualConsumption'),
        yAxisID: 'A',
        type: 'line',
        stack: 7,
        data: this.state.stockStatusList.map((item, index) => (item.actualConsumptionQty)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        showLine: false,
        pointStyle: 'point',
        pointBackgroundColor: '#ba0c2f',
        pointBorderColor: '#ba0c2f',
        pointRadius: 3
      },
      {
        label: i18n.t('static.supplyPlan.delivered'),
        yAxisID: 'A',
        stack: 1,
        backgroundColor: '#002f6c',
        borderColor: '#002f6c',
        pointBackgroundColor: '#002f6c',
        pointBorderColor: '#002f6c',
        pointHoverBackgroundColor: '#002f6c',
        pointHoverBorderColor: '#002f6c',
        data: this.state.stockStatusList.map((item, index) => {
          let count = 0;
          (item.shipmentInfo.map((ele, index) => {
            ele.shipmentStatus.id == 7 ? count = count + Number(ele.shipmentQty) : count = count
          }))
          return count
        })
      },
      {
        label: i18n.t('static.supplyPlan.shipped'),
        yAxisID: 'A',
        stack: 1,
        backgroundColor: '#49a4a1',
        borderColor: '#49a4a1',
        pointBackgroundColor: '#49a4a1',
        pointBorderColor: '#49a4a1',
        pointHoverBackgroundColor: '#49a4a1',
        pointHoverBorderColor: '#49a4a1',
        data: this.state.stockStatusList.map((item, index) => {
          let count = 0;
          (item.shipmentInfo.map((ele, index) => {
            (ele.shipmentStatus.id == 5 || ele.shipmentStatus.id == 6) ? count = count + Number(ele.shipmentQty) : count = count
          }))
          return count
        })
      },
      {
        label: i18n.t('static.supplyPlan.approved'),
        yAxisID: 'A',
        stack: 1,
        backgroundColor: '#0067B9',
        borderColor: '#0067B9',
        pointBackgroundColor: '#0067B9',
        pointBorderColor: '#0067B9',
        pointHoverBackgroundColor: '#0067B9',
        pointHoverBorderColor: '#0067B9',
        data: this.state.stockStatusList.map((item, index) => {
          let count = 0;
          (item.shipmentInfo.map((ele, index) => {
            (ele.shipmentStatus.id == 3 || ele.shipmentStatus.id == 4) ? count = count + Number(ele.shipmentQty) : count = count
          }))
          return count
        })
      },
      {
        label: i18n.t('static.supplyPlan.planned'),
        backgroundColor: '#A7C6ED',
        borderColor: '#A7C6ED',
        pointBackgroundColor: '#A7C6ED',
        pointBorderColor: '#A7C6ED',
        pointHoverBackgroundColor: '#A7C6ED',
        pointHoverBorderColor: '#A7C6ED',
        yAxisID: 'A',
        stack: 1,
        data: this.state.stockStatusList.map((item, index) => {
          let count = 0;
          (item.shipmentInfo.map((ele, index) => {
            (ele.shipmentStatus.id == 1 || ele.shipmentStatus.id == 2 || ele.shipmentStatus.id == 9) ? count = count + Number(ele.shipmentQty) : count = count
          }))
          return count
        })
      },
      {
        label: i18n.t('static.report.stock'),
        yAxisID: 'A',
        type: 'line',
        borderColor: '#cfcdc9',
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        pointStyle: 'circle',
        pointRadius: 0,
        showInLegend: true,
        data: this.state.stockStatusList.map((item, index) => (item.closingBalance))
      },
      {
        type: "line",
        yAxisID: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? 'B' : 'A',
        label: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? i18n.t('static.report.minmonth') : i18n.t('static.product.minQuantity'),
        backgroundColor: 'rgba(255,193,8,0.2)',
        borderColor: '#59cacc',
        pointBackgroundColor: '#59cacc',
        pointBorderColor: '#59cacc',
        borderStyle: 'dotted',
        borderDash: [10, 10],
        fill: '+1',
        backgroundColor: 'transparent',
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        showInLegend: true,
        pointStyle: 'line',
        pointRadius: 0,
        yValueFormatString: "$#,##0",
        lineTension: 0,
        data: this.state.stockStatusList.map((item, index) => (this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? item.minMos : item.minStock))
      }
      , {
        type: "line",
        yAxisID: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? 'B' : 'A',
        label: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? i18n.t('static.report.maxmonth') : i18n.t('static.supplyPlan.maxQty'),
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: '#59cacc',
        pointBackgroundColor: '#59cacc',
        pointBorderColor: '#59cacc',
        borderStyle: 'dotted',
        backgroundColor: 'transparent',
        borderDash: [10, 10],
        fill: true,
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        pointStyle: 'line',
        pointRadius: 0,
        showInLegend: true,
        yValueFormatString: "$#,##0",
        data: this.state.stockStatusList.map((item, index) => (this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? item.maxMos : item.maxStock))
      }
    ]
    if (this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1) {
      datasets.push({
        type: "line",
        yAxisID: 'B',
        label: i18n.t('static.report.mos'),
        borderColor: '#118b70',
        pointBackgroundColor: '#118b70',
        pointBorderColor: '#118b70',
        backgroundColor: 'transparent',
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        showInLegend: true,
        pointStyle: 'line',
        pointRadius: 0,
        yValueFormatString: "$#,##0",
        data: this.state.stockStatusList.map((item, index) => (item.mos != null ? roundN(item.mos) : item.mos))
      })
    }
    const bar = {
      labels: this.state.stockStatusList.map((item, index) => (dateFormatter(item.dt))),
      datasets: datasets,
    };
    const { rangeValue } = this.state
    var ppu = (this.state.planningUnits.filter(c => c.id == document.getElementById("planningUnitId").value)[0])
    return (
      <div className="animated fadeIn" >
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card>
          <div className="Card-header-reporticon pb-2">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
              </a>
              <a className="card-header-action">
                {this.state.stockStatusList.length > 0 && <div className="card-header-actions">
                  <img style={{ height: '25px', width: '25px', cursor: 'Pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.toggleExport(1)} />
                  <img style={{ height: '25px', width: '25px', cursor: 'Pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.toggleExport(2)} />
                </div>}
              </a>
            </div>
          </div>
          <CardBody className="pb-lg-2  CardBodyTop">
            <div>
              <div ref={ref}>
                <Form >
                  <div className=" pl-0">
                    <div className="row">
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}</Label>
                        <div className="controls  edit">
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
                          <div className="controls">
                            <MultiSelect
                              name="programId"
                              id="programId"
                              bsSize="sm"
                              options={programList.length > 0 ? programList : []}
                              value={this.state.programId}
                              onChange={(e) => { this.programChange(e); }}
                              labelledBy={i18n.t('static.common.select')}
                            />
                          </div>
                      </FormGroup>
                      <FormGroup className="col-md-3" id="equivelencyUnitDiv">
                        <Label htmlFor="appendedInputButton">Y-axis in equivalency unit</Label>
                        <div className="controls ">
                          <InputGroup>
                            <Input
                              type="select"
                              name="yaxisEquUnit"
                              id="yaxisEquUnit"
                              bsSize="sm"
                              value={this.state.yaxisEquUnit}
                              onChange={(e) => { this.yAxisChange(e); }}
                            // onChange={(e) => { this.setYaxisEquUnitId(e); }}
                            // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                            >
                              <option value="-1">{i18n.t('static.program.no')}</option>
                              {equivalencyUnitList1}
                            </Input>

                          </InputGroup>
                        </div>
                      </FormGroup>

                      <FormGroup className="col-md-3">
                        <FormGroup check inline>
                          <Input
                            type="radio"
                            id="viewById"
                            name="viewById"
                            value={"1"}
                            checked={this.state.viewById == 1}
                            title={i18n.t('static.report.planningUnit')}
                            onChange={this.setViewById}
                          />
                          <Label
                            className="form-check-label"
                            // check htmlFor="inline-radio1"
                            title={i18n.t('static.report.planningUnit')}>
                            {i18n.t('static.report.planningUnit')}
                          </Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Input
                            type="radio"
                            id="viewById"
                            name="viewById"
                            value={"2"}
                            checked={this.state.viewById == 2}
                            title={i18n.t('static.dashboard.forecastingunit')}
                            onChange={this.setViewById}
                          />
                          <Label
                            className="form-check-label"
                            // check htmlFor="inline-radio1"
                            title={i18n.t('static.dashboard.forecastingunit')}>
                            {i18n.t('static.dashboard.forecastingunit')}
                          </Label>
                        </FormGroup>
                        <FormGroup id="forecastingUnitDiv" style={{ display: "none" }}>
                          <div className="controls">
                            <MultiSelect
                              bsSize="sm"
                              name="realmCountryPlanningUnitId"
                              id="realmCountryPlanningUnitId"
                              value={this.state.realmCountryPlanningUnitId}
                              onChange={(e) => { this.setRealmCountryPlanningUnit(e); }}
                              options={rcpuList && rcpuList.length > 0 ? rcpuList : []}
                              hasSelectAll={this.state.yaxisEquUnit > 0 ? false : true}
                            />
                          </div>
                        </FormGroup>
                        <FormGroup id="planningUnitDiv">
                          <div className="controls">
                            <MultiSelect
                              bsSize="sm"
                              name="planningUnitId"
                              id="planningUnitId"
                              value={this.state.planningUnitId}
                              onChange={(e) => { this.setPlanningUnit(e); }}
                              options={puList && puList.length > 0 ? puList : []}
                              hasSelectAll={this.state.yaxisEquUnit > 0 ? false : true}
                            />
                          </div>
                        </FormGroup>
                      </FormGroup>
                    </div>
                  </div>
                </Form>
                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }} >
                  <div className="row">
                    {
                      this.state.stockStatusList.length > 0
                      &&
                      <div className="col-md-12 p-0">
                        <div className="col-md-12">
                          <div className="chart-wrapper chart-graph-report">
                            {this.state.stockStatusList[0].planBasedOn == 1 && <Bar id="cool-canvas" data={bar} options={options} />}
                            {this.state.stockStatusList[0].planBasedOn == 2 && <Bar id="cool-canvas" data={bar} options={options1} />}
                          </div>
                          <div id="bars_div" style={{ display: "none" }}>
                            {this.state.PlanningUnitDataForExport.map((ele, index) => {
                              return (<>{ele.data[0].planBasedOn == 1 && <div className="chart-wrapper chart-graph-report"><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}
                                {ele.data[0].planBasedOn == 2 && <div className="chart-wrapper chart-graph-report"><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}</>)
                            })}
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button className="mr-1 mt-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                            {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                          </button>
                        </div>
                      </div>}
                  </div>
                  {this.state.show && this.state.stockStatusList.length > 0 && ppu != undefined &&
                    <>
                      <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px', display: this.state.display }}>
                        <ul className="legendcommitversion list-group">
                          {this.state.stockStatusList[0].planBasedOn == 1 ? <>
                            <li><span className="redlegend "></span>
                              <span className="legendcommitversionText">
                                {i18n.t("static.supplyPlan.amcPastOrFuture")} : {ppu.monthsInPastForAmc}/{ppu.monthsInFutureForAmc}
                              </span>
                            </li>
                            <li><span className="redlegend "></span>
                              <span className="legendcommitversionText">
                                {i18n.t("static.report.shelfLife")} : {ppu.shelfLife}
                              </span>
                            </li>
                            <li><span className="redlegend "></span>
                              <span className="legendcommitversionText">
                                {i18n.t("static.supplyPlan.minStockMos")} : {formatter(this.state.stockStatusList[0].minMos, 0)}
                              </span>
                            </li>
                            <li><span className="redlegend "></span>
                              <span className="legendcommitversionText">
                                {i18n.t("static.supplyPlan.reorderInterval")} : {ppu.reorderFrequencyInMonths}
                              </span>
                            </li>
                            <li><span className="redlegend "></span>
                              <span className="legendcommitversionText">
                                {i18n.t("static.supplyPlan.maxStockMos")} : {this.state.stockStatusList[0].maxMos}
                              </span>
                            </li>
                          </> : <><li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.product.minQuantity")} : {formatter(this.state.stockStatusList[0].minStock, 0)}</span></li><li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.product.distributionLeadTime")} : {formatter(this.state.stockStatusList[0].distributionLeadTime, 0)}</span></li>
                          </>}
                        </ul>
                      </FormGroup>
                      <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                        <ul className="legendcommitversion list-group">
                          {
                            <><li><span className="legendcolor" style={{ backgroundColor: "#BA0C2F" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.stockout')}</span></li>
                              <li><span className="legendcolor" style={{ backgroundColor: "#f48521" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.lowstock')}</span></li>
                              <li><span className="legendcolor" style={{ backgroundColor: "#118b70" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.okaystock')}</span></li>
                              <li><span className="legendcolor" style={{ backgroundColor: "#edb944" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.overstock')}</span></li>
                              <li><span className="legendcolor" style={{ backgroundColor: "#cfcdc9" }}></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlanFormula.na')}</span></li></>
                          }
                        </ul>
                      </FormGroup>
                    </>
                  }
                  {this.state.show && this.state.stockStatusList.length > 0 && <Table responsive className="table-striped table-bordered text-center mt-2">
                    <thead>
                      <tr>
                        <th rowSpan="2" style={{ width: "200px" }}>{i18n.t('static.common.month')}</th>
                        <th className="text-center" colSpan="1"> {i18n.t('static.report.stock')} </th>
                        <th className="text-center" colSpan="2"> {i18n.t('static.supplyPlan.consumption')} </th>
                        <th className="text-center" colSpan="2"> {i18n.t('static.shipment.shipment')} </th>
                        <th className="text-center" colSpan="6"> {i18n.t('static.report.stock')} </th>
                      </tr>
                      <tr>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyPlan.openingBalance')}</th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.report.forecasted')}</th>
                        <th className="text-center" style={{ width: "200px" }}> {i18n.t('static.report.actual')} </th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.report.qty')}</th>
                        <th className="text-center" style={{ width: "600px" }}>{i18n.t('static.report.qty') + " | " + (i18n.t('static.budget.fundingsource') + " | " + i18n.t('static.supplyPlan.shipmentStatus') + " | " + (i18n.t('static.report.procurementAgentName')) + " | " + (i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo')))}</th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.report.adjustmentQty')}</th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyplan.exipredStock')}</th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyPlan.endingBalance')}</th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.report.amc')}</th>
                        <th className="text-center" style={{ width: "200px" }}>{this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? i18n.t('static.report.mos') : i18n.t('static.supplyPlan.maxQty')}</th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyPlan.unmetDemandStr')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        this.state.stockStatusList.length > 0
                        &&
                        this.state.stockStatusList.map((item, idx) =>
                          <tr id="addr0" key={idx} >
                            <td>
                              {dateFormatter(this.state.stockStatusList[idx].dt)}
                            </td>
                            {(idx == 0 ? this.state.firstMonthRegionCount : this.state.stockStatusList[idx - 1].regionCount) == (idx == 0 ? this.state.firstMonthRegionCountForStock : this.state.stockStatusList[idx - 1].regionCountForStock) ?
                              <td><b>{formatter(this.state.stockStatusList[idx].openingBalance, 0)}</b></td> : <td>{formatter(this.state.stockStatusList[idx].openingBalance, 0)}</td>}
                            <td className={this.rowtextFormatClassName(this.state.stockStatusList[idx])}>
                              {formatter(this.state.stockStatusList[idx].forecastedConsumptionQty, 0)}
                            </td> <td>
                              {formatter(this.state.stockStatusList[idx].actualConsumptionQty, 0)}
                            </td>
                            <td>
                              {formatter(this.state.stockStatusList[idx].shipmentQty, 0)}
                            </td>
                            <td align="center"><table >
                              {this.state.stockStatusList[idx].shipmentInfo.map((item, index) => {
                                return (<tr  ><td padding="0">{formatter(item.shipmentQty, 0) + `   |    ${item.fundingSource.code}    |    ${item.shipmentStatus.label.label_en}   |    ${item.procurementAgent.code} `} {item.orderNo == null &&
                                  item.primeLineNo == null &&
                                  item.roNo == null &&
                                  item.roPrimeLineNo == null
                                  ? " | N/A"
                                  : `${item.roNo == null &&
                                    item.roPrimeLineNo == null
                                    ? ""
                                    : " | " +
                                    item.roNo +
                                    "-" +
                                    item.roPrimeLineNo
                                  }   ${item.orderNo == null &&
                                    item.primeLineNo == null
                                    ? ""
                                    : item.orderNo == null
                                      ? ""
                                      : " | " + item.orderNo
                                  }   ${item.primeLineNo == null
                                    ? ""
                                    : "-" + item.primeLineNo
                                  }`}</td></tr>)
                              })}</table>
                            </td>
                            <td>
                              {formatter(this.state.stockStatusList[idx].adjustment == 0 ? this.state.stockStatusList[idx].regionCountForStock > 0 ? this.state.stockStatusList[idx].nationalAdjustment : "" : this.state.stockStatusList[idx].regionCountForStock > 0 ? this.state.stockStatusList[idx].nationalAdjustment : this.state.stockStatusList[idx].adjustment, 0)}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].expiredStock != 0 ? formatter(this.state.stockStatusList[idx].expiredStock, 0) : ''}
                            </td>
                            {this.state.stockStatusList[idx].regionCount == this.state.stockStatusList[idx].regionCountForStock ?
                              <td style={{ backgroundColor: this.state.stockStatusList[0].planBasedOn == 2 ? this.state.stockStatusList[idx].closingBalance == null ? "#cfcdc9" : this.state.stockStatusList[idx].closingBalance == 0 ? "#BA0C2F" : this.state.stockStatusList[idx].closingBalance < this.state.stockStatusList[idx].minStock ? "#f48521" : this.state.stockStatusList[idx].closingBalance > this.state.stockStatusList[idx].maxStock ? "#edb944" : "#118b70" : "" }}><b>{formatter(this.state.stockStatusList[idx].closingBalance, 0)}</b></td> : <td style={{ backgroundColor: this.state.stockStatusList[0].planBasedOn == 2 ? this.state.stockStatusList[idx].closingBalance == null ? "#cfcdc9" : this.state.stockStatusList[idx].closingBalance == 0 ? "#BA0C2F" : this.state.stockStatusList[idx].closingBalance < this.state.stockStatusList[idx].minStock ? "#f48521" : this.state.stockStatusList[idx].closingBalance > this.state.stockStatusList[idx].maxStock ? "#edb944" : "#118b70" : "" }}>{formatter(this.state.stockStatusList[idx].closingBalance, 0)}</td>}
                            <td>
                              {formatter(roundAMC(this.state.stockStatusList[idx].amc, 0))}
                            </td>
                            <td style={{ backgroundColor: this.state.stockStatusList[0].planBasedOn == 1 ? this.state.stockStatusList[idx].mos == null ? "#cfcdc9" : this.state.stockStatusList[idx].mos == 0 ? "#BA0C2F" : this.state.stockStatusList[idx].mos < this.state.stockStatusList[idx].minMos ? "#f48521" : this.state.stockStatusList[idx].mos > this.state.stockStatusList[idx].maxMos ? "#edb944" : "#118b70" : "" }}>
                              {this.state.stockStatusList[0].planBasedOn == 1 ? this.state.stockStatusList[idx].mos != null ? roundN(this.state.stockStatusList[idx].mos) : i18n.t("static.supplyPlanFormula.na") : formatter(roundAMC(this.state.stockStatusList[idx].maxStock, 0))}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].unmetDemand != 0 ? formatter(this.state.stockStatusList[idx].unmetDemand, 0) : ''}
                            </td>
                          </tr>)
                      }
                    </tbody>
                  </Table>}
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
              </div></div>
            <Modal isOpen={this.state.exportModal}
              className={'modal-md'}>
              <ModalHeader toggle={() => this.toggleExport(0)} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                <strong>{this.state.type == 1 ? i18n.t("static.supplyPlan.exportAsPDF") : i18n.t("static.supplyPlan.exportAsCsv")}</strong>
              </ModalHeader>
              <ModalBody>
                <>
                  <FormGroup className="col-md-12">
                    <Label htmlFor="appendedInputButton">{i18n.t('static.product.product')}
                      <span className="reportdown-box-icon  fa fa-sort-desc"></span>
                    </Label>
                    <div className="controls ">
                      <MultiSelect
                        name="planningUnitIdsExport"
                        id="planningUnitIdsExport"
                        options={this.state.planningUnitsMulti && this.state.planningUnitsMulti.length > 0 ? this.state.planningUnitsMulti : []}
                        value={this.state.planningUnitIdsExport}
                        onChange={(e) => { this.setPlanningUnitIdsExport(e) }}
                        labelledBy={i18n.t('static.common.select')}
                      />
                    </div>
                  </FormGroup>
                </>
              </ModalBody>
              <ModalFooter>
                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.exportData(this.state.type)} ><i className="fa fa-check"></i>{i18n.t("static.common.submit")}</Button>
              </ModalFooter>
            </Modal>
          </CardBody>
        </Card>
      </div>
    );
  }
  /**
   * Toggles the export modal and updates the state with the selected planning unit IDs for export.
   * @param {number} type - The type of export action. 1 for PDF export, 2 for CSV export.
   */
  toggleExport(type) {
    var list = this.state.planningUnitsMulti;
    this.setState({
      exportModal: !this.state.exportModal,
      planningUnitIdsExport: type != 0 ? list.filter(c => c.value == document.getElementById("planningUnitId").value) : [],
      type: type
    })
  }
  /**
   * Sets the planning unit IDs for export in the state.
   * @param {Array} e - An array containing the planning unit IDs to be exported.
   */
  setPlanningUnitIdsExport(e) {
    this.setState({
      planningUnitIdsExport: e,
    })
  }
}
export default StockStatus;