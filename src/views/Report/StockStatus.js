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
import { addDoubleQuoteToRowContent, dateFormatter, dateFormatterCSV, makeText, roundAMC, roundN, formatter } from '../../CommonComponent/JavascriptCommonFunctions';
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
      programId: '',
      versionId: '',
      planningUnitLabel: '',
      lang: localStorage.getItem('lang'),
      exportModal: false,
      planningUnitIdsExport: [],
      type: 0,
      planningUnitNotes:""
    };
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.programChange = this.programChange.bind(this);
    this.versionChange = this.versionChange.bind(this);
    this.toggleExport = this.toggleExport.bind(this);
  }
  /**
   * Handles the change event for the program selection.
   * Resets relevant state variables and triggers filtering of versions.
   * @param {Event} event - The on change event object.
   */
  programChange(event) {
    this.setState({
      programId: event.target.value,
      versionId: '',
      planningUnits: [],
      planningUnitsMulti: [],
      planningUnitLabel: "",
      stockStatusList: []
    }, () => {
      localStorage.setItem("sesVersionIdReport", '');
      this.filterVersion();
    })
  }
  /**
   * Handles the change event for the version selection.
   * If a version is selected, updates the state with the new version ID and triggers data filtering.
   * If no version is selected, updates the state and triggers retrieval of planning units.
   * @param {Event} event - The event object.
   */
  versionChange(event) {
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
    csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
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
        if(ppu.notes!=null && ppu.notes!=undefined && ppu.notes.length>0){
          csvRow.push('"' + (i18n.t('static.report.planningUnitNotes').replaceAll(' ', '%20') + ' : ' + ppu.notes + '"'))
        }
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
          doc.text(i18n.t('static.program.program') + ' : ' + (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)), doc.internal.pageSize.width / 10, 80, {
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
        if(ppu1.notes!=null && ppu1.notes!=undefined && ppu1.notes.length>0){
          doc.text(i18n.t('static.report.planningUnitNotes') + ' : ' + ppu1.notes, doc.internal.pageSize.width / 10, 150, {
            align: 'left'
          })
        }
        var canv = document.getElementById("cool-canvas" + count)
        var canvasImg1 = canv.toDataURL("image/png", 1.0);
        doc.addImage(canvasImg1, 'png', 50, 160, 750, 300, "a" + count, 'CANVAS')
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
    let planningUnitId = document.getElementById("planningUnitId").value;
    console.log("Planning Unit Id Test@123",planningUnitId);
    if(planningUnitId!="" && planningUnitId!=0){
      console.log("this.state.planningUnits Test@123",this.state.planningUnits);
        this.setState({
          planningUnitNotes:this.state.planningUnits.filter(c=>c.planningUnit.id==planningUnitId)[0].notes
        })
    }
    let versionId = document.getElementById("versionId").value;
    let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
    if (programId != 0 && versionId != 0 && planningUnitId != 0) {
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
          db1 = e.target.result;
          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var version = (versionId.split('(')[0]).trim()
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`
          var data = [];
          var programRequest = programTransaction.get(program);
          programRequest.onerror = function (event) {
            this.setState({
              loading: false
            })
          }.bind(this);
          programRequest.onsuccess = function (event) {
            var programDataJson = programRequest.result.programData;
            var gprogramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
            var gprogramData = gprogramDataBytes.toString(CryptoJS.enc.Utf8);
            var gprogramJson = JSON.parse(gprogramData);
            var linkedShipmentsList = gprogramJson.shipmentLinkingList != null ? gprogramJson.shipmentLinkingList : []
            var planningUnitDataList = programDataJson.planningUnitDataList;
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
            var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
            var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
            var generalProgramJson = JSON.parse(generalProgramData);
            var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]
            var realmTransaction = db1.transaction(['realm'], 'readwrite');
            var realmOs = realmTransaction.objectStore('realm');
            var realmRequest = realmOs.get(generalProgramJson.realmCountry.realm.realmId);
            realmRequest.onerror = function (event) {
              this.setState({
                loading: false,
              })
              this.hideFirstComponent()
            }.bind(this);
            realmRequest.onsuccess = function (event) {
              var dsTransaction = db1.transaction(['dataSource'], 'readwrite');
              var dsOs = dsTransaction.objectStore('dataSource');
              var dsRequest = dsOs.getAll();
              dsRequest.onerror = function (event) {
                this.setState({
                  loading: false,
                })
                this.hideFirstComponent()
              }.bind(this);
              dsRequest.onsuccess = function (event) {
                var dsResult = dsRequest.result;
                var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                var fsOs = fsTransaction.objectStore('fundingSource');
                var fsRequest = fsOs.getAll();
                fsRequest.onerror = function (event) {
                  this.setState({
                    loading: false,
                  })
                  this.hideFirstComponent()
                }.bind(this);
                fsRequest.onsuccess = function (event) {
                  var fsResult = fsRequest.result;
                  var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                  var paOs = paTransaction.objectStore('procurementAgent');
                  var paRequest = paOs.getAll();
                  paRequest.onerror = function (event) {
                    this.setState({
                      loading: false,
                    })
                    this.hideFirstComponent()
                  }.bind(this);
                  paRequest.onsuccess = function (event) {
                    var paResult = paRequest.result;
                    var maxForMonths = 0;
                    var realm = realmRequest.result;
                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                    var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                    if (DEFAULT_MIN_MONTHS_OF_STOCK > pu.minMonthsOfStock) {
                      maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                    } else {
                      maxForMonths = pu.minMonthsOfStock
                    }
                    var minStockMoS = parseInt(maxForMonths);
                    var minForMonths = 0;
                    var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                    if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + pu.reorderFrequencyInMonths)) {
                      minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                    } else {
                      minForMonths = (maxForMonths + pu.reorderFrequencyInMonths);
                    }
                    var maxStockMoS = parseInt(minForMonths);
                    if (maxStockMoS < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                      maxStockMoS = DEFAULT_MIN_MAX_MONTHS_OF_STOCK;
                    }
                    var minForMonths = 0;
                    var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                    if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + pu.reorderFrequencyInMonths)) {
                      minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                    } else {
                      minForMonths = (maxForMonths + pu.reorderFrequencyInMonths);
                    }
                    var maxStockMoS = parseInt(minForMonths);
                    if (maxStockMoS < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                      maxStockMoS = DEFAULT_MIN_MAX_MONTHS_OF_STOCK;
                    }
                    let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
                    let endDate = moment(new Date(this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate()));
                    var shipmentList = (programJson.shipmentList).filter(c => (c.active == true || c.active == "true") && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != 8 && (c.accountFlag == true || c.accountFlag == "true"));
                    var consumptionList = (programJson.consumptionList).filter(c => (c.active == true || c.active == "true") && c.planningUnit.id == planningUnitId);
                    var inList = (programJson.inventoryList).filter(c => (c.active == true || c.active == "true") && c.planningUnit.id == pu.planningUnit.id && (moment(c.inventoryDate) >= startDate && moment(c.inventoryDate) <= endDate));
                    var coList = consumptionList.filter(c => (moment(c.consumptionDate) >= startDate && moment(c.consumptionDate) <= endDate));
                    var shList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (moment(c.receivedDate) >= startDate && moment(c.receivedDate) <= endDate) : (moment(c.expectedDeliveryDate) >= startDate && moment(c.expectedDeliveryDate) <= endDate)));
                    inList.map((c, idx) => {
                      var dataSource = dsResult.filter(d => d.dataSourceId == c.dataSource.id);
                      if (dataSource.length > 0) {
                        var simpleDsObject = {
                          id: dataSource[0].dataSourceId,
                          label: dataSource[0].label
                        }
                        inList[idx].dataSource = simpleDsObject;
                      }
                    })
                    coList.map((c, idx) => {
                      var dataSource = dsResult.filter(d => d.dataSourceId == c.dataSource.id);
                      if (dataSource.length > 0) {
                        var simpleDsObject = {
                          id: dataSource[0].dataSourceId,
                          label: dataSource[0].label
                        }
                        coList[idx].dataSource = simpleDsObject;
                      }
                    })
                    shList.map((c, idx) => {
                      var dataSource = dsResult.filter(d => d.dataSourceId == c.dataSource.id);
                      if (dataSource.length > 0) {
                        var simpleDsObject = {
                          id: dataSource[0].dataSourceId,
                          label: dataSource[0].label
                        }
                        shList[idx].dataSource = simpleDsObject;
                      }
                      for (var l = 0; l < linkedShipmentsList.length; l++) {
                        if (shList[idx].parentShipmentId == linkedShipmentsList[l].parentShipmentId) {
                          shList[idx].roNo = linkedShipmentsList[l].roNo
                          shList[idx].roPrimeLineNo = linkedShipmentsList[l].roPrimeLineNo
                        }
                      }
                    })
                    this.setState({
                      inList: inList,
                      coList: coList,
                      shList: shList
                    })
                    var prevMonthSupplyPlan = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnitId && c.transDate == moment(startDate).subtract(1, 'months').format("YYYY-MM-DD"));
                    if (prevMonthSupplyPlan.length > 0) {
                      this.setState({
                        firstMonthRegionCount: prevMonthSupplyPlan[0].regionCount,
                        firstMonthRegionCountForStock: prevMonthSupplyPlan[0].regionCountForStock,
                      })
                    } else {
                      this.setState({
                        firstMonthRegionCount: 1,
                        firstMonthRegionCountForStock: 0,
                      })
                    }
                    var monthstartfrom = this.state.rangeValue.from.month
                    for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                      for (var month = monthstartfrom; month <= 12; month++) {
                        var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                        var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                        var dt = dtstr
                        var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnitId && c.transDate == dt)
                        if (list.length > 0) {
                          var shiplist = shipmentList.filter(c => c.receivedDate == null || c.receivedDate == "" ? (c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr) : (c.receivedDate >= dt && c.receivedDate <= enddtStr))
                          var totalShipmentQty = 0;
                          shiplist.map((elt, idx) => {
                            totalShipmentQty = totalShipmentQty + Number(elt.shipmentQty)
                            var fundingSource = fsResult.filter(fs => fs.fundingSourceId == elt.fundingSource.id);
                            if (fundingSource.length > 0) {
                              var simpleFSObject = {
                                id: fundingSource[0].fundingSourceId,
                                label: fundingSource[0].label,
                                code: fundingSource[0].fundingSourceCode
                              }
                              shiplist[idx].fundingSource = simpleFSObject;
                            }
                            var procurementAgent = paResult.filter(pa => pa.procurementAgentId == elt.procurementAgent.id);
                            if (procurementAgent.length > 0) {
                              var simplePAObject = {
                                id: procurementAgent[0].procurementAgentId,
                                label: procurementAgent[0].label,
                                code: procurementAgent[0].procurementAgentCode
                              }
                              shiplist[idx].procurementAgent = simplePAObject;
                            }
                          })
                          var conList = consumptionList.filter(c => c.actualFlag == false && (c.consumptionDate >= dt && c.consumptionDate <= enddtStr))
                          var totalforecastConsumption = null;
                          conList.map(elt => {
                            totalforecastConsumption = (totalforecastConsumption == null) ? elt.consumptionQty : totalforecastConsumption + elt.consumptionQty
                          })
                          var conListAct = consumptionList.filter(c => c.actualFlag == true && (c.consumptionDate >= dt && c.consumptionDate <= enddtStr))
                          var totalActualConsumption = null;
                          conListAct.map(elt => {
                            totalActualConsumption = (totalActualConsumption == null) ? elt.consumptionQty : totalActualConsumption + elt.consumptionQty
                          })
                          var json = {
                            dt: new Date(from, month - 1),
                            forecastedConsumptionQty: Number(totalforecastConsumption),
                            actualConsumptionQty: list[0].actualFlag ? Number(totalActualConsumption) : null,
                            actualConsumption: list[0].actualFlag,
                            finalConsumptionQty: list[0].consumptionQty,
                            shipmentQty: totalShipmentQty,
                            shipmentInfo: shiplist,
                            adjustment: list[0].adjustmentQty,
                            closingBalance: list[0].closingBalance,
                            openingBalance: list[0].openingBalance,
                            mos: list[0].mos,
                            amc: list[0].amc,
                            minMos: minStockMoS,
                            maxMos: maxStockMoS,
                            expiredStock: list[0].expiredStock,
                            unmetDemand: list[0].unmetDemand,
                            regionCount: list[0].regionCount,
                            regionCountForStock: list[0].regionCountForStock,
                            nationalAdjustment: list[0].nationalAdjustment,
                            minStock: list[0].minStock,
                            distributionLeadTime: pu.distributionLeadTime,
                            maxStock: list[0].maxStock,
                            planBasedOn: pu.planBasedOn
                          }
                        } else {
                          var json = {
                            dt: new Date(from, month - 1),
                            consumptionQty: 0,
                            actualConsumption: false,
                            actualConsumptionQty: null,
                            shipmentQty: 0,
                            shipmentInfo: [],
                            adjustment: 0,
                            closingBalance: 0,
                            openingBalance: '',
                            mos: '',
                            amc: '',
                            minMos: minStockMoS,
                            maxMos: maxStockMoS,
                            expiredStock: 0,
                            unmetDemand: 0,
                            regionCount: 1,
                            regionCountForStock: 0,
                            nationalAdjustment: 0,
                            minStock: pu.minQty,
                            maxStock: 0,
                            planBasedOn: pu.planBasedOn,
                            distributionLeadTime: pu.distributionLeadTime
                          }
                        }
                        data.push(json)
                        if (month == this.state.rangeValue.to.month && from == to) {
                          this.setState({
                            stockStatusList: data,
                            message: '', loading: false
                          })
                          return;
                        }
                        this.setState({
                          loading: false,
                          planningUnitLabel: document.getElementById("planningUnitId").selectedOptions[0].text
                        })
                      }
                      monthstartfrom = 1
                    }
                  }.bind(this)
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }.bind(this)
        }.bind(this)
      } else {
        this.setState({ loading: true })
        var inputjson = {
          "programId": programId,
          "versionId": versionId,
          "startDate": startDate.startOf('month').subtract(1, 'months').format('YYYY-MM-DD'),
          "stopDate": this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
          "planningUnitIds": [planningUnitId],
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
      }
    } else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), stockStatusList: [] });
    } else if (versionId == 0) {
      this.setState({ message: i18n.t('static.program.validversion'), stockStatusList: [] });
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
    let versionId = document.getElementById("versionId").value;
    let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
    report == 1 ? document.getElementById("bars_div").style.display = 'block' : document.getElementById("bars_div").style.display = 'none';
    var PlanningUnitDataForExport = [];
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
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var programTransaction = transaction.objectStore('programData');
        var version = (versionId.split('(')[0]).trim()
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var program = `${programId}_v${version}_uId_${userId}`
        var programRequest = programTransaction.get(program);
        programRequest.onerror = function (event) {
          this.setState({
            loading: false
          })
        }.bind(this);
        programRequest.onsuccess = function (event) {
          var programDataJson = programRequest.result.programData;
          var planningUnitDataList = programDataJson.planningUnitDataList;
          var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
          var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
          var generalProgramJson = JSON.parse(generalProgramData);
          var realmTransaction = db1.transaction(['realm'], 'readwrite');
          var realmOs = realmTransaction.objectStore('realm');
          var realmRequest = realmOs.get(generalProgramJson.realmCountry.realm.realmId);
          realmRequest.onerror = function (event) {
            this.setState({
              loading: false,
            })
            this.hideFirstComponent()
          }.bind(this);
          realmRequest.onsuccess = function (event) {
            var dsTransaction = db1.transaction(['dataSource'], 'readwrite');
            var dsOs = dsTransaction.objectStore('dataSource');
            var dsRequest = dsOs.getAll();
            dsRequest.onerror = function (event) {
              this.setState({
                loading: false,
              })
              this.hideFirstComponent()
            }.bind(this);
            dsRequest.onsuccess = function (event) {
              var dsResult = dsRequest.result;
              var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
              var fsOs = fsTransaction.objectStore('fundingSource');
              var fsRequest = fsOs.getAll();
              fsRequest.onerror = function (event) {
                this.setState({
                  loading: false,
                })
                this.hideFirstComponent()
              }.bind(this);
              fsRequest.onsuccess = function (event) {
                var fsResult = fsRequest.result;
                var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var paOs = paTransaction.objectStore('procurementAgent');
                var paRequest = paOs.getAll();
                paRequest.onerror = function (event) {
                  this.setState({
                    loading: false,
                  })
                  this.hideFirstComponent()
                }.bind(this);
                paRequest.onsuccess = function (event) {
                  var paResult = paRequest.result;
                  var pcnt = 0
                  var sortedPlanningUnitData = this.state.planningUnitIdsExport.sort(function (a, b) {
                    a = a.label.toLowerCase();
                    b = b.label.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                  });
                  sortedPlanningUnitData.map(pu => {
                    var puFiltered = this.state.planningUnits.filter(c => c.planningUnit.id == pu.value)[0]
                    var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == pu.value);
                    var programJson = {}
                    if (planningUnitDataIndex != -1) {
                      var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == pu.value))[0];
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
                    var data = [];
                    var monthstartfrom = this.state.rangeValue.from.month
                    var maxForMonths = 0;
                    var realm = realmRequest.result;
                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                    var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                    if (DEFAULT_MIN_MONTHS_OF_STOCK > puFiltered.minMonthsOfStock) {
                      maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                    } else {
                      maxForMonths = puFiltered.minMonthsOfStock
                    }
                    var minStockMoS = parseInt(maxForMonths);
                    var minForMonths = 0;
                    var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                    if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + puFiltered.reorderFrequencyInMonths)) {
                      minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                    } else {
                      minForMonths = (maxForMonths + puFiltered.reorderFrequencyInMonths);
                    }
                    var maxStockMoS = parseInt(minForMonths);
                    if (maxStockMoS < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                      maxStockMoS = DEFAULT_MIN_MAX_MONTHS_OF_STOCK;
                    }
                    let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
                    let endDate = moment(new Date(this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate()));
                    var prevMonthSupplyPlan = programJson.supplyPlan.filter(c => c.planningUnitId == pu.value && c.transDate == moment(startDate).subtract(1, 'months').format("YYYY-MM-DD"));
                    var firstMonthRegionCount = 1;
                    var firstMonthRegionCountForStock = 0;
                    if (prevMonthSupplyPlan.length > 0) {
                      firstMonthRegionCount = prevMonthSupplyPlan[0].regionCount;
                      firstMonthRegionCountForStock = prevMonthSupplyPlan[0].regionCountForStock
                    }
                    var shipmentList = (programJson.shipmentList).filter(c => (c.active == true || c.active == "true") && c.planningUnit.id == pu.value && c.shipmentStatus.id != 8 && (c.accountFlag == true || c.accountFlag == "true"));
                    var consumptionList = (programJson.consumptionList).filter(c => (c.active == true || c.active == "true") && c.planningUnit.id == pu.value);
                    var inList = (programJson.inventoryList).filter(c => (c.active == true || c.active == "true") && c.planningUnit.id == pu.value && (moment(c.inventoryDate) >= startDate && moment(c.inventoryDate) <= endDate));
                    var coList = consumptionList.filter(c => (moment(c.consumptionDate) >= startDate && moment(c.consumptionDate) <= endDate));
                    var shList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (moment(c.receivedDate) >= startDate && moment(c.receivedDate) <= endDate) : (moment(c.expectedDeliveryDate) >= startDate && moment(c.expectedDeliveryDate) <= endDate)));
                    inList.map((c, idx) => {
                      var dataSource = dsResult.filter(d => d.dataSourceId == c.dataSource.id);
                      if (dataSource.length > 0) {
                        var simpleDsObject = {
                          id: dataSource[0].dataSourceId,
                          label: dataSource[0].label
                        }
                        inList[idx].dataSource = simpleDsObject;
                      }
                    })
                    coList.map((c, idx) => {
                      var dataSource = dsResult.filter(d => d.dataSourceId == c.dataSource.id);
                      if (dataSource.length > 0) {
                        var simpleDsObject = {
                          id: dataSource[0].dataSourceId,
                          label: dataSource[0].label
                        }
                        coList[idx].dataSource = simpleDsObject;
                      }
                    })
                    shList.map((c, idx) => {
                      var dataSource = dsResult.filter(d => d.dataSourceId == c.dataSource.id);
                      if (dataSource.length > 0) {
                        var simpleDsObject = {
                          id: dataSource[0].dataSourceId,
                          label: dataSource[0].label
                        }
                        shList[idx].dataSource = simpleDsObject;
                      }
                    })
                    for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                      for (var month = monthstartfrom; month <= 12; month++) {
                        var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                        var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                        var dt = dtstr
                        var list = programJson.supplyPlan.filter(c => c.planningUnitId == pu.value && c.transDate == dt)
                        if (list.length > 0) {
                          var shiplist = shipmentList.filter(c => c.receivedDate == null || c.receivedDate == "" ? (c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr) : (c.receivedDate >= dt && c.receivedDate <= enddtStr))
                          var totalShipmentQty = 0;
                          shiplist.map((elt, idx) => {
                            totalShipmentQty = totalShipmentQty + Number(elt.shipmentQty)
                            var fundingSource = fsResult.filter(fs => fs.fundingSourceId == elt.fundingSource.id);
                            if (fundingSource.length > 0) {
                              var simpleFSObject = {
                                id: fundingSource[0].fundingSourceId,
                                label: fundingSource[0].label,
                                code: fundingSource[0].fundingSourceCode
                              }
                              shiplist[idx].fundingSource = simpleFSObject;
                            }
                            var procurementAgent = paResult.filter(pa => pa.procurementAgentId == elt.procurementAgent.id);
                            if (procurementAgent.length > 0) {
                              var simplePAObject = {
                                id: procurementAgent[0].procurementAgentId,
                                label: procurementAgent[0].label,
                                code: procurementAgent[0].procurementAgentCode
                              }
                              shiplist[idx].procurementAgent = simplePAObject;
                            }
                          })
                          var conList = consumptionList.filter(c => c.actualFlag == false && (c.consumptionDate >= dt && c.consumptionDate <= enddtStr))
                          var totalforecastConsumption = null;
                          conList.map(elt => {
                            totalforecastConsumption = (totalforecastConsumption == null) ? elt.consumptionQty : totalforecastConsumption + elt.consumptionQty
                          })
                          var conListAct = consumptionList.filter(c => c.actualFlag == true && (c.consumptionDate >= dt && c.consumptionDate <= enddtStr))
                          var totalActualConsumption = null;
                          conListAct.map(elt => {
                            totalActualConsumption = (totalActualConsumption == null) ? elt.consumptionQty : totalActualConsumption + elt.consumptionQty
                          })
                          var json = {
                            dt: new Date(from, month - 1),
                            forecastedConsumptionQty: Number(totalforecastConsumption),
                            actualConsumptionQty: totalActualConsumption != null ? Number(totalActualConsumption) : null,
                            actualConsumption: list[0].actualFlag,
                            finalConsumptionQty: list[0].consumptionQty,
                            shipmentQty: totalShipmentQty,
                            shipmentInfo: shiplist,
                            adjustment: list[0].adjustmentQty,
                            closingBalance: list[0].closingBalance,
                            openingBalance: list[0].openingBalance,
                            mos: list[0].mos,
                            amc: list[0].amc,
                            minMos: minStockMoS,
                            maxMos: maxStockMoS,
                            expiredStock: list[0].expiredStock,
                            unmetDemand: list[0].unmetDemand,
                            regionCount: list[0].regionCount,
                            regionCountForStock: list[0].regionCountForStock,
                            nationalAdjustment: list[0].nationalAdjustment,
                            minStock: list[0].minStock,
                            maxStock: list[0].maxStock,
                            planBasedOn: puFiltered.planBasedOn,
                            distributionLeadTime: puFiltered.distributionLeadTime
                          }
                        } else {
                          var json = {
                            dt: new Date(from, month - 1),
                            consumptionQty: 0,
                            actualConsumption: false,
                            actualConsumptionQty: null,
                            shipmentQty: 0,
                            shipmentInfo: [],
                            adjustment: 0,
                            closingBalance: 0,
                            openingBalance: '',
                            mos: '',
                            amc: '',
                            minMos: minStockMoS,
                            maxMos: maxStockMoS,
                            expiredStock: 0,
                            unmetDemand: 0,
                            regionCount: 1,
                            regionCountForStock: 0,
                            nationalAdjustment: 0,
                            minStock: puFiltered.minQty,
                            distributionLeadTime: puFiltered.distributionLeadTime,
                            maxStock: 0,
                            planBasedOn: puFiltered.planBasedOn
                          }
                        }
                        data.push(json)
                        if (month == this.state.rangeValue.to.month && from == to) {
                          month = 12
                          let datasets = [
                            {
                              label: i18n.t('static.supplyplan.exipredStock'),
                              yAxisID: 'A',
                              type: 'line',
                              stack: 7,
                              data: data.map((item, index) => (item.expiredStock > 0 ? item.expiredStock : null)),
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
                              data: data.map((item, index) => (item.finalConsumptionQty))
                            },
                            {
                              label: i18n.t('static.report.actualConsumption'),
                              yAxisID: 'A',
                              type: 'line',
                              stack: 7,
                              data: data.map((item, index) => (item.actualConsumptionQty)),
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
                              borderColor: 'rgba(179,181,198,1)',
                              pointBackgroundColor: 'rgba(179,181,198,1)',
                              pointBorderColor: '#fff',
                              pointHoverBackgroundColor: '#fff',
                              pointHoverBorderColor: 'rgba(179,181,198,1)',
                              data: data.map((item, index) => {
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
                              backgroundColor: '#49A4A1',
                              borderColor: 'rgba(179,181,198,1)',
                              pointBackgroundColor: 'rgba(179,181,198,1)',
                              pointBorderColor: '#fff',
                              pointHoverBackgroundColor: '#fff',
                              pointHoverBorderColor: 'rgba(179,181,198,1)',
                              data: data.map((item, index) => {
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
                              borderColor: 'rgba(179,181,198,1)',
                              pointBackgroundColor: 'rgba(179,181,198,1)',
                              pointBorderColor: '#fff',
                              pointHoverBackgroundColor: '#fff',
                              pointHoverBorderColor: 'rgba(179,181,198,1)',
                              data: data.map((item, index) => {
                                let count = 0;
                                (item.shipmentInfo.map((ele, index) => {
                                  (ele.shipmentStatus.id == 4) ? count = count + Number(ele.shipmentQty) : count = count
                                }))
                                return count
                              })
                            },
                            {
                              label: i18n.t('static.supplyPlan.planned'),
                              backgroundColor: '#A7C6ED',
                              borderColor: 'rgba(179,181,198,1)',
                              pointBackgroundColor: 'rgba(179,181,198,1)',
                              pointBorderColor: '#fff',
                              pointHoverBackgroundColor: '#fff',
                              pointHoverBorderColor: 'rgba(179,181,198,1)',
                              yAxisID: 'A',
                              stack: 1,
                              data: data.map((item, index) => {
                                let count = 0;
                                (item.shipmentInfo.map((ele, index) => {
                                  (ele.shipmentStatus.id == 1 || ele.shipmentStatus.id == 2 || ele.shipmentStatus.id == 3 || ele.shipmentStatus.id == 9) ? count = count + Number(ele.shipmentQty) : count = count
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
                              pointStyle: 'line',
                              pointRadius: 0,
                              showInLegend: true,
                              data: data.map((item, index) => (Number(item.closingBalance)))
                            },
                            {
                              type: "line",
                              yAxisID: data[0].planBasedOn == 1 ? 'B' : 'A',
                              label: data[0].planBasedOn == 1 ? i18n.t('static.report.minmonth') : i18n.t('static.product.minQuantity'),
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
                              data: data.map((item, index) => (data[0].planBasedOn == 1 ? item.minMos : item.minStock))
                            }
                            , {
                              type: "line",
                              yAxisID: data[0].planBasedOn == 1 ? 'B' : 'A',
                              label: data[0].planBasedOn == 1 ? i18n.t('static.report.maxmonth') : i18n.t('static.supplyPlan.maxQty'),
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
                              data: data.map((item, index) => (data[0].planBasedOn == 1 ? item.maxMos : item.maxStock))
                            }
                          ];
                          if (data.length > 0 && data[0].planBasedOn == 1) {
                            datasets.push({
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
                              data: data.map((item, index) => {
                                if (item.mos != '') {
                                  return Number(Math.round(item.mos * Math.pow(10, 1)) / Math.pow(10, 1)).toFixed(1);
                                } else {
                                  return ''
                                }
                              })
                            })
                          }
                          var bar = {
                            labels: data.map((item, index) => (moment(item.dt).format('MMM YY'))),
                            datasets: datasets,
                          };
                          var chartOptions = {
                            title: {
                              display: true,
                              text: (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)) + " - " + getLabelText(puFiltered.planningUnit.label, this.state.lang)
                            },
                            scales: {
                              yAxes: data.length > 0 && data[0].planBasedOn == 1 ? [{
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
                              }] : [{
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
                          var planningUnitexport = {
                            planningUnit: puFiltered.planningUnit,
                            data: data,
                            bar: bar,
                            chartOptions: chartOptions,
                            inList: inList,
                            coList: coList,
                            shList: shList,
                            firstMonthRegionCount: firstMonthRegionCount,
                            firstMonthRegionCountForStock: firstMonthRegionCountForStock
                          }
                          PlanningUnitDataForExport.push(planningUnitexport)
                        }
                      }
                      monthstartfrom = 1
                    }
                    pcnt = pcnt + 1
                    if (pcnt == sortedPlanningUnitData.length) {
                      this.setState({
                        PlanningUnitDataForExport: PlanningUnitDataForExport,
                        loading: false
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
                  })
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }.bind(this)
        }.bind(this)
      }.bind(this)
    }
    else {
      this.setState({ loading: true })
      var inputjson = {
        "programId": programId,
        "versionId": versionId,
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
                  borderColor: 'rgba(179,181,198,1)',
                  pointBackgroundColor: 'rgba(179,181,198,1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(179,181,198,1)',
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
                  borderColor: 'rgba(179,181,198,1)',
                  pointBackgroundColor: 'rgba(179,181,198,1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(179,181,198,1)',
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
                  borderColor: 'rgba(179,181,198,1)',
                  pointBackgroundColor: 'rgba(179,181,198,1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(179,181,198,1)',
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
                  borderColor: 'rgba(179,181,198,1)',
                  pointBackgroundColor: 'rgba(179,181,198,1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(179,181,198,1)',
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
                  pointStyle: 'line',
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
                text: (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)) + " - " + getLabelText(planningUnitItemFilter[0].planningUnit.label, this.state.lang)
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
      this.consolidatedProgramList()
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
        if (proList.length == 1) {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = a.programCode.toLowerCase();
              b = b.programCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
            programId: proList[0].programId
          }, () => {
            this.filterVersion();
          })
        } else if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
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
            })
          })
        }
      }.bind(this);
    }.bind(this);
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
            versions: []
          }, () => {
            DropdownService.getVersionListForProgram(PROGRAM_TYPE_SUPPLY_PLAN, programId)
              .then(response => {
                this.setState({
                  versions: []
                }, () => {
                  this.setState({
                    versions: (response.data.filter(function (x, i, a) {
                      return a.indexOf(x) === i;
                    }))
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
            versions: []
          }, () => { this.consolidatedVersionList(programId) })
        }
      } else {
        this.setState({
          versions: []
        })
      }
    } else {
      this.setState({
        versions: []
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
        let versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        });
        versionList.reverse();
        if (verList.length == 1) {
          this.setState({
            versions: versionList,
            versionId: verList[0].versionId
          }, () => {
            this.getPlanningUnit();
          })
        } else if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
          let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
          if (versionVar.length != 0) {
            this.setState({
              versions: versionList,
              versionId: localStorage.getItem("sesVersionIdReport")
            }, () => {
              this.getPlanningUnit();
            })
          } else {
            this.setState({
              versions: versionList,
              versionId: versionList[0].versionId
            }, () => {
              this.getPlanningUnit();
            })
          }
        } else {
          this.setState({
            versions: versionList,
            versionId: versionList[0].versionId
          }, () => {
            this.getPlanningUnit();
          })
        }
      }.bind(this);
    }.bind(this)
  }
  /**
   * Retrieves the list of planning units for a selected program and version.
   */
  getPlanningUnit = () => {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    this.setState({
      planningUnits: [],
      planningUnitsMulti: [],
    }, () => {
      if (versionId == 0) {
        this.setState({ message: i18n.t('static.program.validversion'), stockStatusList: [] });
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
                  proList[i] = myResult[i]
                }
              }
              var planningUnitsMulti = [];
              proList.sort(function (a, b) {
                a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
              }).map(item => {
                planningUnitsMulti.push({ value: item.planningUnit.id, label: getLabelText(item.planningUnit.label, this.state.lang) })
              })
              var lang = this.state.lang;
              this.setState({
                planningUnits: proList.sort(function (a, b) {
                  a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                  b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                  return a < b ? -1 : a > b ? 1 : 0;
                }), planningUnitsMulti: planningUnitsMulti, message: ''
              }, () => {
                this.filterData();
              })
            }.bind(this);
          }.bind(this)
        }
        else {
          ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
            var listArray = response.data;
            var planningUnitsMulti = []
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); 
              var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); 
              return itemLabelA > itemLabelB ? 1 : -1;
            }).map(item => {
              planningUnitsMulti.push({ value: item.planningUnit.id, label: getLabelText(item.planningUnit.label, this.state.lang) })
            });
            this.setState({
              planningUnits: listArray,
              planningUnitsMulti: planningUnitsMulti,
              message: ''
            }, () => {
              this.filterData();
            })
          }).catch(
            error => {
              this.setState({
                planningUnits: [],
                planningUnitsMulti: []
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
        text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)) + " - " + this.state.planningUnitLabel : entityname1
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
        text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? (this.state.programs.filter(c => c.programId == document.getElementById("programId").value)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)) + " - " + this.state.planningUnitLabel : entityname1
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
        mode:'nearest',
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
        borderColor: 'rgba(179,181,198,1)',
        pointBackgroundColor: 'rgba(179,181,198,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179,181,198,1)',
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
        borderColor: 'rgba(179,181,198,1)',
        pointBackgroundColor: 'rgba(179,181,198,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179,181,198,1)',
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
        borderColor: 'rgba(179,181,198,1)',
        pointBackgroundColor: 'rgba(179,181,198,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179,181,198,1)',
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
        borderColor: 'rgba(179,181,198,1)',
        pointBackgroundColor: 'rgba(179,181,198,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179,181,198,1)',
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
        pointStyle: 'line',
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
    var ppu = (this.state.planningUnits.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0])
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
            <div className="TableCust" >
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
                        <div className="controls ">
                          <InputGroup>
                            <Input
                              type="select"
                              name="programId"
                              id="programId"
                              bsSize="sm"
                              onChange={(e) => { this.programChange(e); }}
                              value={this.state.programId}
                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
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
                              onChange={(e) => { this.versionChange(e); }}
                              value={this.state.versionId}
                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {versionList}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                        <div className="controls ">
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
                          </InputGroup>
                        </div>
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
                        {this.state.stockStatusList.length > 0 && ppu != undefined &&
                      <FormGroup className="col-md-12 pl-0" style={{ display: this.state.display }}>
                        <ul className="legendcommitversion list-group">
                        <li><span className="redlegend "></span>
                              <span className="legendcommitversionText">
                                <b>{i18n.t("static.supplyPlan.planningUnitSettings")}<i class="fa fa-info-circle icons pl-lg-2" id="Popover2" title={i18n.t("static.tooltip.planningUnitSettings")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> : </b>
                              </span>
                            </li>
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
                          </> : <><li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.product.minQuantity")}</b> : {formatter(this.state.stockStatusList[0].minStock, 0)}</span></li><li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.product.distributionLeadTime")} : {formatter(this.state.stockStatusList[0].distributionLeadTime, 0)}</span></li>
                          </>}
                        </ul>
                        {this.state.planningUnitNotes!=undefined && this.state.planningUnitNotes!=null && this.state.planningUnitNotes.length>0 && 
                            <span  className="legendcommitversionText"><b>{i18n.t("static.report.planningUnitNotes")}</b><i class="fa fa-info-circle icons pl-lg-2" id="Popover2" title={i18n.t("static.tooltip.planningUnitNotes")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> : {this.state.planningUnitNotes}</span>
                        }
                      </FormGroup>
                  }
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